<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="hc-layout">

          <!-- ── Sidebar ── -->
          <div class="hc-sidebar">
            <div class="hc-sidebar__head">
              <div class="hc-sidebar__head-icon">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <div>
                <div class="hc-sidebar__title">กำหนดวันหยุด</div>
                <div class="hc-sidebar__year">ปี {{ reactiveCurrentYear }}</div>
              </div>
            </div>

            <div class="hc-sidebar__body">
              <p class="hc-label">สัญลักษณ์สีในปฏิทิน</p>
              <div class="hc-legend">
                <div class="hc-legend__item">
                  <span class="hc-legend__dot" style="background:#fa161a;"></span>
                  <span>วันหยุดปกติ</span>
                </div>
                <div class="hc-legend__item">
                  <span class="hc-legend__dot" style="background:#ff861c;"></span>
                  <span>วันหยุดพิเศษ</span>
                </div>
              </div>

              <div class="hc-sep"></div>

              <p class="hc-label">วันหยุดประจำสัปดาห์</p>
              <div class="hc-days">
                <button
                  v-for="(day, index) in currentDayButtons"
                  :key="index"
                  class="hc-day-btn"
                  :class="day.active ? 'hc-day-btn--on' : 'hc-day-btn--off'"
                  @click="toggleDay(day)">
                  <span class="hc-day-btn__check">
                    <i class="fas" :class="day.active ? 'fa-check' : ''"></i>
                  </span>
                  {{ day.day }}
                </button>
              </div>

              <div class="hc-sep"></div>

              <div class="hc-tip">
                <i class="fas fa-hand-pointer hc-tip__icon"></i>
                <span>ดับเบิลคลิกที่วันในปฏิทินเพื่อเพิ่มหรือแก้ไขวันหยุดพิเศษ</span>
              </div>
            </div>
          </div>

          <!-- ── Calendar ── -->
          <div class="hc-main">
            <div class="hc-card">
              <div class="hc-card__toolbar">
                <app-form-2 ref="appForm">
                  <template #extraBtn>
                    <button class="btn btn-sm hc-btn-import" @click="openImportModal()">
                      <i class="fas fa-cloud-download-alt margin-r-5"></i>นำเข้าข้อมูล วันหยุด
                    </button>
                  </template>
                </app-form-2>
              </div>
              <div class="hc-card__body">
                <fullCalendar
                  ref="fullCalendar"
                  :options="calendarOptions"
                  :key="calendarKey"
                />
              </div>
            </div>
          </div>

        </div>

        <!-- ── Import Modal ── -->
        <modal-2 ref="importModal">
          <template #header>
            <h4><i class="fas fa-file-download margin-r-15"></i>นำเข้าข้อมูลวันหยุด</h4>
          </template>
          <template #body>
            <div class="row">
              <div class="col-lg-12 col-md-12 padding-0">
                <div class="box box-widget mb-0">
                  <div class="box-body padding-l-30 padding-t-20 padding-r-30 padding-b-20" style="box-shadow: rgba(33, 35, 38, 0.1) 0px 10px 10px -10px;">
                    <div class="pull-right">
                      <button class="btn btn-sm margin-r-5" style="background-color: #f0f0f0; color: #9a9a9a;" @click="xt.downloadTemplateExcel('Template_Holiday')">
                        <i class="glyphicon glyphicon-download-alt margin-r-5"></i><span v-text="'ดาวน์โหลดแทมเพลต'"></span>
                      </button>
                      <button class="btn btn-sm text-white" style="background-color: #24a8ef;" @click="btnExportClick()">
                        <i class="fas fa-file-upload margin-r-5"></i><span v-text="'นำออกข้อมูล'"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-12 col-md-12 padding-0">
                <div class="d-flex justify-content-center align-items-center" style="padding: 50px; min-height: 40vh; flex-direction: column;">
                  <button class="btn btn-sm text-white" style="background-color: #24a8ef;" @click="$refs.File.click()">
                    <i class="fas fa-file-download margin-r-5"></i><span v-text="'นำเข้าข้อมูล วันหยุด'"></span>
                  </button>
                  <span class="text-center margin-t-10">
                    <input type="file" ref="File" @change="getFileName($event)" accept=".xls, .xlsx" v-show="false"/>
                    <p>{{ fileName ? fileName : "กรุณากดเลือกไฟล์" }}</p>
                  </span>
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="box box-widget mb-0">
              <div class="box-body padding-l-30 padding-t-20 padding-r-30 padding-b-20" style="box-shadow: rgba(33, 35, 38, 0.1) 0px -10px 10px -10px;">
                <div class="pull-right">
                  <button class="btn btn-sm btn-success text-white" @click="importExcel()">
                    <i class="fas fa-save margin-r-5"></i><span v-text="ui.save || 'Save'"></span>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </modal-2>

        <!-- ── Add/Edit Holiday Modal ── -->
        <modal-2 ref="addHoliday">
          <template #header>
            <h4><i class="fas fa-calendar-plus margin-r-10"></i>จัดการวันหยุด</h4>
          </template>
          <template #body>
            <div class="hm-body">
              <div class="hm-field">
                <label class="hm-label"><i class="fas fa-tag margin-r-5"></i>ชื่อวันหยุด</label>
                <input type="text" class="form-control input-sm" v-model="eventform.title" placeholder="กรุณาระบุชื่อวันหยุด"/>
              </div>
              <div class="hm-row">
                <div class="hm-field">
                  <label class="hm-label"><i class="fas fa-calendar margin-r-5"></i>วันที่เริ่มต้น</label>
                  <datepicker input-class="form-control input-sm" v-model="eventform.startdate"></datepicker>
                </div>
                <div class="hm-field">
                  <label class="hm-label"><i class="fas fa-calendar-check margin-r-5"></i>วันที่สิ้นสุด</label>
                  <datepicker input-class="form-control input-sm" v-model="eventform.enddate"></datepicker>
                </div>
              </div>
              <div class="hm-field">
                <label class="hm-label"><i class="fas fa-list-ul margin-r-5"></i>ประเภทวันหยุด</label>
                <div class="hm-type-group">
                  <label class="hm-type-opt" :class="eventform.type == '1' ? 'hm-type-opt--red' : ''">
                    <input type="radio" v-model="eventform.type" value="1" style="display:none"/>
                    <span class="hm-type-dot" style="background:#fa161a;"></span>วันหยุดปกติ
                  </label>
                  <label class="hm-type-opt" :class="eventform.type == '2' ? 'hm-type-opt--orange' : ''">
                    <input type="radio" v-model="eventform.type" value="2" style="display:none"/>
                    <span class="hm-type-dot" style="background:#ff861c;"></span>วันหยุดพิเศษ
                  </label>
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="hm-footer">
              <div class="hm-footer__right">
                <button class="hm-btn hm-btn--danger" @click="deleteHoliday()">
                  <i class="fas fa-trash-alt"></i><span v-text="ui.delete || 'ลบ'"></span>
                </button>
                <button class="hm-btn hm-btn--ghost" @click="$refs.addHoliday.closeModal()">
                  <i class="fas fa-times"></i><span v-text="ui.cancel || 'ยกเลิก'"></span>
                </button>
                <button class="hm-btn hm-btn--primary" @click="saveHoliday()">
                  <i class="fas fa-check"></i><span>ยืนยัน</span>
                </button>
              </div>
            </div>
          </template>
        </modal-2>

      </template>
    </re-page>
    <loading-box ref="myLB"></loading-box>
  </div>
</template>

<script>
import fullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import loadingBox from '../../../Components/Center/loading-box.vue';

// no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
let page = { loadingBox: { show() {}, hide() {} } };
let appForm = {};

const DAY_NAMES = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];

let cpn = {
  data() {
    return {
      auth,
      ui: window.ui,
      xt: $xt,
      holidayList: [],
      selectedDatesThisYear: [],
      selectedDatesByYear: {},
      dayButtonsByYear: {},
      specialHolidaysByYear: {},
      eventform: {
        title: '',
        startdate: '',
        enddate: '',
        type: '1',
      },
      fileName: '',
      infoFile: null,
      calendarKey: 0,
      reactiveCurrentYear: new Date().getFullYear(),
      yearInToggle: new Set(),
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, multiMonthPlugin],
        initialView: 'multiMonthYear',
        multiMonthMaxColumns: window.innerWidth < 1645 ? 3 : 4,
        multiMonthMinWidth: 180,
        showNonCurrentDates: true,
        height: 'auto',
        headerToolbar: {
          left: '',
          center: 'prev title next',
          right: '',
        },
        dayCellClassNames: (args) => {
          const dateStr = moment(args.date).format('YYYY-MM-DD');
          const holiday = this.holidayMap.get(dateStr);
          if (holiday) {
            if (holiday.type === '1') return ['fc-holiday'];
            if (holiday.type === '2') return ['fc-special-holiday'];
          }
          if (this.selectedDatesSet.has(dateStr)) return ['fc-holiday'];
          return [];
        },
        datesSet: () => {
          const calendarApi = this.$refs.fullCalendar.getApi();
          const year = calendarApi.getDate().getFullYear();
          this.reactiveCurrentYear = year;
          if (!this.dayButtonsByYear[year]) {
            const normalHolidays = this.holidayList
              .filter(h => h.type === '1' && moment(h.date).year() === year)
              .map(h => h.date);
            this.dayButtonsByYear[year] = this.buildDayButtons(year, normalHolidays);
          }
        },
        dayCellDidMount: (args) => {
          const dateStr = moment(args.date).format('YYYY-MM-DD');
          const holiday = this.holidayMap.get(dateStr);
          let tooltipText = '';
          if (holiday) {
            tooltipText = holiday.tooltip || holiday.title || (holiday.type === '1' ? 'วันหยุดปกติ' : 'วันหยุดพิเศษ');
          } else if (this.selectedDatesSet.has(dateStr)) {
            tooltipText = 'วันหยุดที่คุณเลือกเอง';
          }
          if (tooltipText) args.el.setAttribute('title', tooltipText);
        },
        dateClick: this.handleDateClick,
      },
    };
  },

  components: {
    fullCalendar,
    loadingBox,
  },

  computed: {
    holidayMap() {
      const map = new Map();
      for (const h of this.holidayList) map.set(h.date, h);
      return map;
    },
    selectedDatesSet() {
      return new Set(this.selectedDatesThisYear);
    },
    currentDayButtons() {
      return this.dayButtonsByYear[this.reactiveCurrentYear] || this.defaultDayButtons();
    },
  },

  methods: {
    getDatesForDayInYear(dayIndex, year) {
      const dates = [];
      let d = new Date(year, 0, 1);
      while (d.getFullYear() === year) {
        if (d.getDay() === dayIndex) dates.push(moment(d).format('YYYY-MM-DD'));
        d.setDate(d.getDate() + 1);
      }
      return dates;
    },

    defaultDayButtons() {
      return DAY_NAMES.map((day, index) => ({ day, index, active: false }));
    },

    buildDayButtons(year, normalHolidays) {
      const normalSet = new Set(normalHolidays);
      return DAY_NAMES.map((day, index) => ({
        day,
        index,
        active: this.getDatesForDayInYear(index, year).every(d => normalSet.has(d)),
      }));
    },

    recalcButtonsForYear(year) {
      if (!this.dayButtonsByYear[year]) return;
      const normalSet = new Set(
        this.holidayList
          .filter(h => h.type === '1' && moment(h.date).year() === year)
          .map(h => h.date)
      );
      const updated = this.dayButtonsByYear[year].map(btn => ({
        ...btn,
        active: this.getDatesForDayInYear(btn.index, year).every(d => normalSet.has(d)),
      }));
      this.dayButtonsByYear[year] = updated;
    },

    updateYearState(year) {
      const normalHolidays = this.holidayList
        .filter(h => h.type === '1' && moment(h.date).year() === year)
        .map(h => h.date);
      const specialHolidays = this.holidayList
        .filter(h => h.type === '2' && moment(h.date).year() === year)
        .map(h => h.date);
      this.selectedDatesByYear[year] = normalHolidays;
      this.specialHolidaysByYear[year] = specialHolidays;
      this.selectedDatesThisYear = [...new Set([...normalHolidays, ...specialHolidays])];
    },

    async loadData() {
      try {
        let rsp = await $xt.getServer('CSM/Config/Holiday_ReadList');
        const normalHolidays = rsp.data
          .filter(x => x.holiday_type === 1)
          .map(x => moment(x.holiday_date).format('YYYY-MM-DD'));
        const specialHolidays = rsp.data
          .filter(x => x.holiday_type === 2)
          .map(x => moment(x.holiday_date).format('YYYY-MM-DD'));

        this.holidayList = rsp.data.map(x => ({
          date: moment(x.holiday_date).format('YYYY-MM-DD'),
          type: x.holiday_type.toString(),
          title: x.holiday_event || '',
        }));

        const currentYear = new Date().getFullYear();
        this.dayButtonsByYear[currentYear] = this.buildDayButtons(currentYear, normalHolidays);
        this.selectedDatesByYear[currentYear] = normalHolidays;
        this.specialHolidaysByYear[currentYear] = specialHolidays;
        this.selectedDatesThisYear = [...normalHolidays, ...specialHolidays];

        this.calendarKey++;
      } catch (ex) {
        $msg.alert('', ex.toString(), 'danger');
      }
    },

    setData() {
      const arr = [];
      for (const year of this.yearInToggle) {
        const yearInt = parseInt(year);
        const holidays = this.holidayList.filter(h => moment(h.date).year() === yearInt);
        if (holidays.length === 0) {
          arr.push({ holiday_year: year, type: 'delete' });
        } else {
          holidays.forEach(h => {
            const [y, m] = h.date.split('-');
            arr.push({
              maincode: this.auth.maincode,
              holiday_year: y,
              holiday_month: m,
              holiday_date: h.date,
              holiday_event: h.title || '',
              holiday_type: parseInt(h.type),
              remark: '',
              dpt_code: this.auth.dpt_code || '',
              pre_event: '',
              adduser: this.auth.userid || '',
              add_dt: new Date().toISOString(),
              edituser: '',
              edit_dt: new Date().toISOString(),
              type: 'create',
            });
          });
        }
      }
      return arr;
    },

    async saveData() {
      try {
        let f = { holiday: this.setData() };
        let act = 'CSM/Config/Create_Holiday';
        page.loadingBox.show();
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) throw rsp.error;
        $notify.success(this.ui.alert_save_success);
      } catch (ex) {
        $msg.alert('', ex.toString(), 'danger');
      } finally {
        page.loadingBox.hide();
        this.yearInToggle.clear();
      }
    },

    toggleDay(day) {
      const calendarApi = this.$refs.fullCalendar.getApi();
      const currentYear = calendarApi.getDate().getFullYear();
      this.yearInToggle.add(currentYear);

      if (!this.dayButtonsByYear[currentYear]) {
        this.dayButtonsByYear[currentYear] = this.defaultDayButtons();
      }

      const currentButtons = this.dayButtonsByYear[currentYear];
      const thisDay = currentButtons.find(d => d.index === day.index);
      if (!thisDay) return;

      thisDay.active = !thisDay.active;
      this.dayButtonsByYear[currentYear] = [...currentButtons];

      const affectedDates = this.getDatesForDayInYear(thisDay.index, currentYear);

      if (thisDay.active) {
        affectedDates.forEach(date => {
          if (!this.holidayList.find(h => h.date === date)) {
            this.holidayList.push({ date, title: 'วันหยุดปกติ', type: '1' });
          }
        });
      } else {
        this.holidayList = this.holidayList.filter(h =>
          !(moment(h.date).year() === currentYear && h.type === '1' && affectedDates.includes(h.date))
        );
      }

      this.updateYearState(currentYear);
      this.$nextTick(() => calendarApi.render());
    },

    async btnExportClick() {
      try {
        if (!await $msg.confirm('Exporting data may take a long time if there is a large amount of data. Please confirm to proceed with the operation.')) return;
        this.$refs.myLB.show();
        let rsp = await $xt.getServer(`CSM/Config/Holiday_Export?years=${this.reactiveCurrentYear}`);
        window.open(window.dataServer + rsp.data);
      } catch (ex) {
        $msg.alert('', ex.toString(), 'danger');
      } finally {
        this.$refs.myLB.hide();
      }
    },

    async importExcel() {
      this.$refs.myLB.show();
      try {
        let fd = new FormData();
        fd.append('file', this.infoFile);
        let rsp = await $xt.postServerForm('CSM/Config/Holiday_Import', fd);
        if (!rsp.success) throw new Error(rsp.error);
        $notify.success(this.ui.alert_save_success);
      } catch (ex) {
        $msg.alert('Error', ex.toString(), 'danger');
      } finally {
        this.loadData();
        this.$refs.myLB.hide();
        this.$refs.importModal.closeModal();
      }
    },

    openImportModal() {
      this.infoFile = null;
      this.fileName = null;
      this.$refs.File.value = null;
      this.$refs.importModal.openModal();
    },

    getFileName(event) {
      const file = event.target.files[0];
      if (file) {
        this.fileName = file.name;
        this.infoFile = file;
      }
    },

    handleDateClick(info) {
      if (info.jsEvent.detail !== 2) return;
      const clickedDate = moment(info.date).format('YYYY-MM-DD');
      const holiday = this.holidayList.find(h => h.date === clickedDate);
      this.eventform.startdate = clickedDate;
      this.eventform.enddate = clickedDate;
      this.eventform.type = holiday ? holiday.type : '1';
      this.eventform.title = holiday
        ? holiday.title || (holiday.type === '1' ? 'วันหยุดปกติ' : 'New Event')
        : 'New Event';
      this.$refs.addHoliday.openModal();
    },

    saveHoliday() {
      const start = moment(this.eventform.startdate);
      const end = moment(this.eventform.enddate);
      const calendarApi = this.$refs.fullCalendar.getApi();
      const currentYear = calendarApi.getDate().getFullYear();
      const type = this.eventform.type;
      const title = this.eventform.title;

      let current = start.clone();
      while (current.isSameOrBefore(end, 'day')) {
        const dateStr = current.format('YYYY-MM-DD');
        const year = parseInt(current.format('YYYY'));
        this.yearInToggle.add(year);

        const index = this.holidayList.findIndex(h => h.date === dateStr);
        const newHoliday = { date: dateStr, title, type };
        if (index >= 0) {
          this.holidayList.splice(index, 1, newHoliday);
        } else {
          this.holidayList.push(newHoliday);
        }

        this.updateYearState(year);
        this.recalcButtonsForYear(year);
        current.add(1, 'day');
      }

      this.$refs.addHoliday.closeModal();
      calendarApi.gotoDate(new Date(currentYear, 0, 1));
      this.$nextTick(() => calendarApi.render());
    },

    deleteHoliday() {
      const dateStr = moment(this.eventform.startdate).format('YYYY-MM-DD');
      const calendarApi = this.$refs.fullCalendar.getApi();
      const currentYear = moment(dateStr).year();

      this.yearInToggle.add(currentYear);

      const index = this.holidayList.findIndex(h => h.date === dateStr);
      if (index >= 0) this.holidayList.splice(index, 1);

      this.updateYearState(currentYear);
      this.recalcButtonsForYear(currentYear);

      this.$refs.addHoliday.closeModal();
      calendarApi.gotoDate(new Date(currentYear, 0, 1));
      this.$nextTick(() => calendarApi.render());
    },
  },

  async mounted() {
    page = this.$refs.page;
    page.pageTitle = 'Program Config : Settings';
    document.title = page.pageTitle;

    appForm = this.$refs.appForm;
    appForm.btnSave.click = this.saveData;
    appForm.btnSave.show = true;
    appForm.btnNew.show = false;
    appForm.btnImport.show = false;
    appForm.btnImport_center.show = false;
    appForm.btnExport.show = false;

    await this.loadData();

    this._resizeHandler = () => {
      this.calendarOptions.multiMonthMaxColumns = window.innerWidth < 1645 ? 3 : 4;
    };
    window.addEventListener('resize', this._resizeHandler);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this._resizeHandler);
  },
};

export default cpn;
</script>
<style scoped>
/* ══════════════════════════════════════
   LAYOUT
══════════════════════════════════════ */
.hc-layout {
  display: flex;
  gap: 16px;
  align-items: stretch;
  height: calc(100vh - 130px);
  background: #edf1f7;
  padding: 16px;
  border-radius: 10px;
  margin: -8px;
}

.hc-sidebar {
  flex: 0 0 240px;
  background: #fff;
  border-radius: 10px;
  border: 1.5px solid #dde3ee;
  box-shadow: 0 2px 16px rgba(60, 90, 140, 0.08);
  overflow-y: auto;
  overflow-x: hidden;
  align-self: flex-start;
  max-height: 100%;
}

.hc-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ══════════════════════════════════════
   SIDEBAR
══════════════════════════════════════ */
.hc-sidebar__head {
  background: linear-gradient(145deg, #1e2e52 0%, #3d5a80 100%);
  padding: 18px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.hc-sidebar__head-icon {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  flex-shrink: 0;
}

.hc-sidebar__title {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}

.hc-sidebar__year {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 2px;
}

.hc-sidebar__body {
  padding: 16px;
}

.hc-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #b0b0b0;
  margin: 0 0 10px 0;
}

.hc-sep {
  height: 1px;
  background: #f0f0f0;
  margin: 14px 0;
}

.hc-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hc-legend__item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #444;
  font-weight: 500;
}

.hc-legend__dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.hc-days {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.hc-day-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 7px;
  border: 1.5px solid #ebebeb;
  background: #fafafa;
  color: #555;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  outline: none;
}

.hc-day-btn__check {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid #ddd;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 10px;
  color: transparent;
  transition: all 0.15s;
}

.hc-day-btn--off:hover {
  background: #f3f3f3;
  border-color: #ddd;
}

.hc-day-btn--on {
  background: #fff5f5 !important;
  border-color: #fa161a !important;
  color: #b80008 !important;
}

.hc-day-btn--on .hc-day-btn__check {
  background: #fa161a;
  border-color: #fa161a;
  color: #fff;
}

.hc-tip {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: #f4f8fc;
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 11.5px;
  color: #777;
  line-height: 1.6;
}

.hc-tip__icon {
  color: #24a8ef;
  margin-top: 1px;
  flex-shrink: 0;
}

/* ══════════════════════════════════════
   CALENDAR CARD
══════════════════════════════════════ */
.hc-card {
  background: #fff;
  border-radius: 10px;
  border: 1.5px solid #dde3ee;
  box-shadow: 0 2px 16px rgba(60, 90, 140, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.hc-card__toolbar {
  flex-shrink: 0;
  padding: 4px 14px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.hc-card__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 14px;
}

.hc-btn-import {
  background: #f5f5f5 !important;
  color: #555 !important;
  border: 1px solid #ddd !important;
}

.hc-btn-import:hover {
  background: #ebebeb !important;
}

/* ══════════════════════════════════════
   FULLCALENDAR OVERRIDES
══════════════════════════════════════ */
::v-deep .fc-toolbar-chunk {
  display: flex;
  justify-content: center;
  align-items: center;
}

::v-deep .fc-toolbar-title {
  font-size: 26px !important;
  font-weight: 800;
  color: #1e2e52;
  margin: 0 20px;
  letter-spacing: 1px;
}

::v-deep .fc-next-button.fc-button,
::v-deep .fc-prev-button.fc-button {
  background: transparent;
  color: #3d5a80;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  font-size: 16px;
  transition: background 0.15s;
}

::v-deep .fc-next-button.fc-button:hover,
::v-deep .fc-prev-button.fc-button:hover {
  background: #eef2f8;
}

::v-deep .fc {
  border: none;
}

::v-deep .fc-multimonth {
  border: none !important;
}

::v-deep .fc-theme-standard th,
::v-deep .fc-theme-standard td {
  border: 1px solid #f0f0f0;
}

::v-deep .fc-scrollgrid.fc-scrollgrid-liquid {
  border: none;
}

::v-deep .fc-multimonth-month .fc-scrollgrid {
  border: none !important;
}

::v-deep .fc-multimonth-title {
  font-size: 11px !important;
  font-weight: 700;
  color: #2c3e6b;
  padding: 6px 0 4px;
  text-align: center;
}

::v-deep .fc-col-header-cell.fc-day {
  background-color: #3d5a80 !important;
  padding: 8px 0;
}

::v-deep .fc-col-header-cell.fc-day-sun {
  background-color: #2c3e6b !important;
  border-radius: 8px 0 0 0;
}

::v-deep .fc-col-header-cell.fc-day-sat {
  background-color: #2c3e6b !important;
  border-radius: 0 8px 0 0;
}

::v-deep .fc-col-header-cell-cushion {
  color: #fff !important;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: default;
}

::v-deep .fc-multimonth-header-table {
  border-left: none;
  border-right: none;
}

::v-deep .fc-multimonth-daygrid-table {
  border-left: none;
  border-right: none;
}

::v-deep .fc-multimonth-daygrid {
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

::v-deep .fc-scroller::-webkit-scrollbar {
  display: none;
}

::v-deep .fc-scroller {
  scrollbar-width: none;
}

::v-deep .fc-day-today {
  background: transparent !important;
}

::v-deep .fc-day-today .fc-daygrid-day-number {
  background: #24a8ef;
  color: #fff !important;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

::v-deep .fc-daygrid-day {
  position: relative;
}

::v-deep .fc-daygrid-day::before {
  content: '';
  display: block;
  padding-top: 9%;
}

::v-deep .fc-daygrid-day-frame {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 42px !important;
}

::v-deep .fc-multimonth-month {
  padding-bottom: 2px;
  min-height: 150px;
}

::v-deep .fc-daygrid-body table tbody tr {
  height: 42px !important;
}

::v-deep .fc-holiday {
  background-color: #f87375 !important;
}

::v-deep .fc-special-holiday {
  background-color: #ffab5e !important;
}

::v-deep .fc-day-other.fc-holiday {
  background-color: rgba(248, 115, 117, 0.25) !important;
}

::v-deep .fc-day-other.fc-special-holiday {
  background-color: rgba(255, 171, 94, 0.25) !important;
}

::v-deep .fc-daygrid-day-number {
  color: #444 !important;
  cursor: default;
  font-size: 10px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

::v-deep .fc-day-other .fc-daygrid-day-number {
  color: #bbb !important;
}

::v-deep .fc-holiday .fc-daygrid-day-number {
  background: transparent;
  color: #fff !important;
  font-weight: 700;
}

::v-deep .fc-special-holiday .fc-daygrid-day-number {
  background: transparent;
  color: #fff !important;
  font-weight: 700;
}

::v-deep .fc-day-other.fc-holiday .fc-daygrid-day-number,
::v-deep .fc-day-other.fc-special-holiday .fc-daygrid-day-number {
  color: rgba(255, 255, 255, 0.6) !important;
  font-weight: 400;
}

::v-deep .modal-body,
::v-deep .modal-footer {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

::v-deep .modal-footer {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* ══════════════════════════════════════
   HOLIDAY MODAL
══════════════════════════════════════ */
.hm-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 4px 8px;
}

.hm-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hm-label {
  font-size: 12px;
  font-weight: 600;
  color: #3d5a80;
  margin: 0;
}

.hm-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.hm-type-group {
  display: flex;
  gap: 10px;
}

.hm-type-opt {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 7px;
  border: 1.5px solid #ebebeb;
  background: #fafafa;
  font-size: 12.5px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
  margin: 0;
}

.hm-type-opt--red {
  background: #fff5f5;
  border-color: #fa161a;
  color: #b80008;
}

.hm-type-opt--orange {
  background: #fff8f0;
  border-color: #ff861c;
  color: #c45e00;
}

.hm-type-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.hm-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  width: 100%;
}

.hm-footer__right {
  display: flex;
  gap: 10px;
}

.hm-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 18px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 500;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  outline: none;
}

.hm-btn--danger {
  background: #fff5f5;
  border-color: #fa161a;
  color: #b80008;
}

.hm-btn--danger:hover {
  background: #fa161a;
  color: #fff;
}

.hm-btn--ghost {
  background: #f0f0f0;
  border-color: #ddd;
  color: #555;
}

.hm-btn--ghost:hover {
  background: #e0e0e0;
}

.hm-btn--primary {
  background: #3d5a80;
  border-color: #3d5a80;
  color: #fff;
}

.hm-btn--primary:hover {
  background: #2c4a6e;
  border-color: #2c4a6e;
}
</style>
