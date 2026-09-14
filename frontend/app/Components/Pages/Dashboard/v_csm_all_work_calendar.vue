<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="csm-cal-page">

          <div class="cal-toolbar">
            <div class="cal-search-group">
              <span class="cal-search-label">Worker</span>
              <div class="cal-select-wrap">
                <vue-select-2
                  :options="employeeOptions"
                  :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                  v-model="checkEmpno"
                />
              </div>
              <button class="cal-btn cal-btn-search" @click="loadCheckDateWorker()">
                <i class="fa fa-search"></i>
              </button>
              <button class="cal-btn cal-btn-clear" @click="clearSearch()">
                <i class="fa fa-times"></i>
              </button>
            </div>
          </div>

          <div class="cal-main">
            <div class="cal-left">
              <fullCalendar ref="calendar" class="cal-fc" :options="calendarOptions" />
            </div>

            <div class="cal-right">
              <div class="docs-header">
                <i class="fas fa-layer-group docs-header-icon"></i>
                <span>CSM Documents</span>
                <span class="docs-count" v-if="eventEmployee.length">{{ eventEmployee.length }}</span>
              </div>
              <div class="docs-body">
                <div v-if="eventEmployee.length === 0" class="docs-empty">
                  <i class="fas fa-inbox"></i>
                  <p>ไม่พบข้อมูล</p>
                </div>
                <div class="doc-item"
                     :class="{ 'doc-item--overdue': item.overdate > 0 }"
                     :style="{ borderLeftColor: item.priority_color || '#3b82f6' }"
                     v-for="(item, index) in eventEmployee" :key="index">
                  <div class="doc-item-head">
                    <span class="doc-item-no" @click="eventSelected(item.title)">{{ item.title }}</span>
                    <span class="doc-item-status">{{ item.job_status }}</span>
                  </div>
                  <div class="doc-item-subject">{{ item.desc }}</div>
                  <div class="doc-item-rows">
                    <div class="doc-item-row">
                      <span class="doc-key">Request</span>
                      <span class="doc-val">{{ item.request_name }}</span>
                    </div>
                    <div class="doc-item-row">
                      <span class="doc-key">Assign</span>
                      <span class="doc-val">{{ item.assign_name }}</span>
                    </div>
                    <div class="doc-item-row">
                      <span class="doc-key">Due</span>
                      <span class="doc-val doc-due">{{ item.date }}</span>
                    </div>
                  </div>
                  <div class="doc-item-foot">
                    <span class="doc-priority" :style="{ color: item.priority_color || '#94a3b8' }">
                      &#9679; {{ item.prioity_des }}
                    </span>
                    <span v-if="item.overdate > 0" class="doc-overdue">
                      เกินกำหนด {{ item.overdate }} วัน
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </template>
    </re-page>
  </div>
</template>

<script>
import fullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
  let page = {};
  let cpn = {
    data() {
      return {
        baseUrl,
        eventEmployee: [],
        employeeData: [],
        markedDates: [],
        checkEmpno: 0,
        calendarOptions: {
          plugins: [dayGridPlugin, interactionPlugin],
          selectable: true,
          unselectAuto: false,
          initialView: 'dayGridMonth',
          headerToolbar: {
            left: '',
            center: 'prev title next',
            right: ''
          },
          height: '100%',
          expandRows: true,
          dateClick: this.handleDateClick,
          datesSet: this.markRedUnderlineDates,
        }
      };
    },
    components: {
      fullCalendar,
    },
    computed: {
      employeeOptions() {
        return [
          { id: 'All', text: 'All' },
          ...$linq(this.employeeData).select(s => ({ id: s.empno, text: s.empfullname_t })).toArray()
        ]
      }
    },
    methods: {
      async dateClicked(date) {
        let act = this.checkEmpno === 'All'
          ? `csm/data/ViewDateWorker?todate=${date}`
          : `csm/data/ViewDateWorker?empno=${encodeURIComponent(this.checkEmpno)}&todate=${date}`
        page.loadingBox.show()
        let rsp = await $xt.getServer(act)
        page.loadingBox.hide()
        this.eventEmployee = $linq(rsp).select(x => {
          let docdate = x.due_date == null ? x.response_date : x.due_date
          return {
            date: moment(docdate).format('DD/MM/YYYY'),
            title: x.job_no,
            desc: x.subject,
            request_name: x.request_name,
            assign_name: x.assign_name,
            overdate: x.overdate,
            prioity_des: x.prioity_des,
            priority_status: x.priority_status,
            priority_color: x.priority_color,
            job_status: x.job_status,
          }
        }).toArray()
      },
      async handleDateClick(info) {
        let date = moment(info.date).format('YYYY/MM/DD')
        await this.dateClicked(date)
      },
      eventSelected(event) {
        window.open(this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${event}`, '_blank')
      },
      async loadEmployee() {
        let rsp = await $xt.getServer(`csm/center/Employee_ReadList`)
        this.employeeData = rsp.data.data_rows
        this.checkEmpno = 'All'
      },
      async loadCheckDateWorker(Type) {
        let emp = Type === 'All' ? 'x' : this.checkEmpno
        page.loadingBox.show()
        let rsp = await $xt.getServer(`csm/data/CSM_CheckWorker?empno=${encodeURIComponent(emp)}`)
        page.loadingBox.hide()

        this.markedDates = $linq(rsp).select(x => moment(x.due_date).format('YYYY-MM-DD')).toArray()

        if (Type !== 'All') {
          this.eventEmployee = $linq(rsp).select(x => ({
            date: moment(x.due_date).format('DD/MM/YYYY'),
            title: x.job_no,
            desc: x.subject,
            request_name: x.request_name,
            assign_name: x.assign_name,
            overdate: x.overdate,
            prioity_des: x.prioity_des,
            priority_status: x.priority_status,
            priority_color: x.priority_color,
            job_status: x.job_status,
          })).toArray()
        } else {
          this.eventEmployee = []
        }

        this.$nextTick(() => this.markRedUnderlineDates())
      },
      markRedUnderlineDates() {
        document.querySelectorAll('.fc-daygrid-day-number.fc-red-underline').forEach(el => {
          el.classList.remove('fc-red-underline')
        })
        this.markedDates.forEach(dateStr => {
          const dateEl = document.querySelector(`.fc-daygrid-day[data-date="${dateStr}"] .fc-daygrid-day-number`)
          if (dateEl) {
            dateEl.classList.add('fc-red-underline')
          }
        })
      },
      clearSearch() {
        this.checkEmpno = 'All'
        this.loadCheckDateWorker('All')
      }
    },
    mounted() {
      (async () => {
        page = this.$refs.page;
        page.pageTitle = `All Worker Calendar`;
        document.title = page.pageTitle;
        page.loadingBox.show();
        await this.loadEmployee()
        await this.loadCheckDateWorker('All')
        await this.handleDateClick({ date: new Date() })
        page.loadingBox.hide();
      })();
    },
  };
  export default cpn;
</script>

<style scoped>
/* ─── Page shell ─────────────────────────────────────────── */
.csm-cal-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 130px);
  gap: 14px;
}

/* ─── Toolbar ────────────────────────────────────────────── */
.cal-toolbar {
  flex-shrink: 0;
}

.cal-search-group {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #c8d6e8;
  border-left: 3px solid #02244f;
  border-radius: 12px;
  padding: 8px 14px;
  box-shadow: 0 1px 6px rgba(2, 36, 79, .08);
}

.cal-search-label {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: #02244f;
  white-space: nowrap;
}

.cal-select-wrap {
  min-width: 230px;
}

/* select2 มาพร้อม input-sm (30px) ไม่เท่าปุ่ม 34px ในแถวเดียวกัน */
::v-deep .cal-select-wrap .select2-selection {
  height: 34px !important;
  display: flex !important;
  align-items: center;
  border-radius: 9px !important;
  border-color: #c8d6e8 !important;
  box-shadow: none !important;
  transition: border-color .12s, box-shadow .12s;
}

::v-deep .cal-select-wrap .select2-container--open .select2-selection,
::v-deep .cal-select-wrap .select2-selection:hover {
  border-color: #0a3d7a !important;
  box-shadow: 0 0 0 3px rgba(10, 61, 122, .12) !important;
}

::v-deep .cal-select-wrap .select2-selection__rendered {
  padding-left: 11px !important;
  padding-right: 26px !important;
  font-size: 12.5px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4 !important;
}

::v-deep .cal-select-wrap .select2-selection__arrow {
  height: 32px !important;
}

.cal-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: background .12s, transform .1s;
  flex-shrink: 0;
}

.cal-btn-search { background: linear-gradient(135deg, #02244f 0%, #0a3d7a 100%); color: #fff; box-shadow: 0 2px 6px rgba(2, 36, 79, .25); }
.cal-btn-search:hover { background: linear-gradient(135deg, #0a3d7a 0%, #1155a8 100%); transform: scale(1.06); box-shadow: 0 3px 10px rgba(2, 36, 79, .35); }

.cal-btn-clear { background: #eef2f7; color: #02244f; border: 1px solid #c8d6e8; }
.cal-btn-clear:hover { background: #dde6f0; transform: scale(1.06); }

/* ─── Main grid ──────────────────────────────────────────── */
.cal-main {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 16px;
}

/* ─── Calendar panel ─────────────────────────────────────── */
.cal-left {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, .05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cal-fc {
  flex: 1;
  min-height: 0;
}

/* ─── Documents panel ────────────────────────────────────── */
.cal-right {
  width: 340px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, .05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.docs-header {
  flex-shrink: 0;
  background: linear-gradient(135deg, #02244f 0%, #0a3d7a 100%);
  color: #fff;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .03em;
}

.docs-header-icon {
  font-size: 14px;
  opacity: .7;
}

.docs-count {
  margin-left: auto;
  min-width: 26px;
  padding: 2px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .18);
  border: 1px solid rgba(255, 255, 255, .22);
  font-size: 11.5px;
  font-weight: 800;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.docs-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.docs-body::-webkit-scrollbar { width: 6px; }
.docs-body::-webkit-scrollbar-track { background: transparent; }
.docs-body::-webkit-scrollbar-thumb { background: #d3dceb; border-radius: 8px; }
.docs-body::-webkit-scrollbar-thumb:hover { background: #b6c4da; }

/* ─── Empty state ────────────────────────────────────────── */
.docs-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 0;
}

.docs-empty i {
  font-size: 34px;
  color: #e2e8f0;
}

.docs-empty p {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

/* ─── Document card ──────────────────────────────────────── */
/* แถบซ้าย = สี priority จากข้อมูล (:style) / พื้นแดงจาง = เกินกำหนด
   สองสัญญาณแยกกัน อ่านความเร่งด่วนได้โดยไม่ต้องอ่านตัวหนังสือ */
.doc-item {
  background: #f8fafc;
  border: 1px solid #e9eef5;
  border-left: 3px solid #3b82f6;
  border-radius: 10px;
  padding: 12px 14px;
  transition: box-shadow .15s, transform .15s, background .15s;
}

.doc-item:hover {
  background: #fff;
  box-shadow: 0 4px 14px rgba(2, 36, 79, .10);
  transform: translateY(-1px);
}

.doc-item--overdue {
  background: #fffafa;
  border-color: #f7d4d4;
}

.doc-item--overdue:hover {
  background: #fff;
  box-shadow: 0 4px 14px rgba(220, 38, 38, .14);
}

.doc-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.doc-item-no {
  font-size: 12.5px;
  font-weight: 800;
  color: #2563eb;
  cursor: pointer;
  border-bottom: 1px dashed rgba(37, 99, 235, .4);
  transition: color .1s, border-color .1s;
  font-variant-numeric: tabular-nums;
}

.doc-item-no:hover {
  color: #1d4ed8;
  border-bottom-color: #1d4ed8;
}

.doc-item-status {
  font-size: 10px;
  font-weight: 700;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 9px;
  border-radius: 20px;
  letter-spacing: .02em;
  white-space: nowrap;
}

.doc-item-subject {
  font-size: 12px;
  font-weight: 500;
  color: #334155;
  line-height: 1.45;
  margin-bottom: 9px;
}

.doc-item-rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.doc-item-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 11.5px;
  color: #475569;
}

.doc-key {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: #64748b;
  min-width: 46px;
  flex-shrink: 0;
}

.doc-val {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-due {
  font-weight: 700;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}

.doc-item-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.doc-priority {
  font-size: 11px;
  font-weight: 600;
}

.doc-overdue {
  font-size: 10px;
  font-weight: 700;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 2px 9px;
  border-radius: 20px;
  white-space: nowrap;
}

/* ─── FullCalendar overrides ─────────────────────────────── */
/* ใช้ฟอนต์ชุดเดียวกับทั้งแอป — Segoe UI เดิมไม่มีตัวไทย ต้อง fallback */
::v-deep .fc {
  font-family: 'Manrope', 'Sarabun', system-ui, -apple-system, sans-serif;
  height: 100%;
}

::v-deep .fc-toolbar.fc-header-toolbar {
  padding: 16px 20px 10px;
  margin-bottom: 0;
}

::v-deep .fc-toolbar-chunk {
  display: flex;
  align-items: center;
  justify-content: center;
}

::v-deep .fc-toolbar-title {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -.02em;
  margin: 0 14px;
}

::v-deep .fc-prev-button.fc-button,
::v-deep .fc-next-button.fc-button {
  background: #f1f5f9;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 30px;
  height: 30px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  transition: background .12s, color .12s, border-color .12s;
}

::v-deep .fc-prev-button.fc-button:hover,
::v-deep .fc-next-button.fc-button:hover {
  background: #0f172a;
  color: #fff;
  border-color: #0f172a;
}

::v-deep .fc-prev-button.fc-button:focus,
::v-deep .fc-next-button.fc-button:focus,
::v-deep .fc-prev-button.fc-button:active,
::v-deep .fc-next-button.fc-button:active {
  box-shadow: none;
  outline: none;
}

::v-deep .fc-scrollgrid-section-header > td,
::v-deep .fc-scrollgrid-section-header .fc-scroller,
::v-deep .fc-col-header-cell {
  background: linear-gradient(135deg, #02244f 0%, #0a3d7a 100%);
}

::v-deep .fc-col-header-cell {
  padding: 10px 0;
}

/* ชื่อวันอยู่บนพื้น navy — สีเทาสเลตเดิม (#64748b) ได้ contrast แค่ 2.25:1 อ่านไม่ออก */
::v-deep .fc-col-header-cell-cushion {
  color: #dbe6f5;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
}

::v-deep .fc-col-header-cell.fc-day-sat .fc-col-header-cell-cushion,
::v-deep .fc-col-header-cell.fc-day-sun .fc-col-header-cell-cushion {
  color: #ffc9c9;
}

::v-deep .fc-daygrid-day-number {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  padding: 7px 10px;
  position: relative;
}

::v-deep .fc-day-other .fc-daygrid-day-number {
  color: #d1d5db;
}

::v-deep .fc-day-today {
  background: transparent !important;
}

::v-deep .fc-day-today .fc-daygrid-day-number {
  background: #2563eb;
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 6px 8px;
  font-weight: 800;
  box-shadow: 0 3px 8px -2px rgba(37, 99, 235, .55);
}

::v-deep .fc-daygrid-day-frame {
  height: 100%;
}

::v-deep .fc-daygrid-day-bg,
::v-deep .fc-daygrid-bg-harness {
  height: 100%;
}

/* วันที่กำลังเลือก — เดิมใช้สีเทาเริ่มต้นของ FullCalendar ทำให้ไม่รู้ว่า
   เอกสารในแผงขวาเป็นของวันไหน */
::v-deep .fc-highlight {
  height: 100% !important;
  min-height: 100% !important;
  background: rgba(37, 99, 235, .09);
  box-shadow: inset 0 0 0 2px #2563eb;
  border-radius: 8px;
}

::v-deep .fc-theme-standard td,
::v-deep .fc-theme-standard th {
  border-color: #f1f5f9;
}

::v-deep .fc-scrollgrid {
  border: none !important;
}

::v-deep .fc-scrollgrid-section > td {
  border: none !important;
}

/* เสาร์-อาทิตย์ให้พื้นต่างเล็กน้อย ช่วยกวาดตาหาสัปดาห์ (เฉพาะช่องวัน ไม่ใช่หัวตาราง) */
::v-deep .fc-daygrid-day.fc-day-sat,
::v-deep .fc-daygrid-day.fc-day-sun {
  background: #fafbfe;
}

::v-deep .fc-daygrid-day:hover {
  background: #eef4fb;
  cursor: pointer;
}

/* ตัวบอกว่าวันนั้นมีงานครบกำหนด — จุดกลม มีวงขาวรอบให้เห็นทั้งบนพื้นขาวและวงกลมวันนี้ */
::v-deep .fc-daygrid-day-number.fc-red-underline::after {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #fff;
  display: block;
}

::v-deep .fc-day-today .fc-daygrid-day-number.fc-red-underline::after {
  bottom: 2px;
  box-shadow: 0 0 0 2px #2563eb;
}

::v-deep .fc-scroller {
  overflow: hidden !important;
}

::v-deep .fc-scrollgrid-section-header .fc-scroller-harness {
  background: linear-gradient(135deg, #02244f 0%, #0a3d7a 100%);
  border-bottom: none !important;
}

::v-deep thead > tr > th {
  background: linear-gradient(135deg, #02244f 0%, #0a3d7a 100%);
}
</style>
