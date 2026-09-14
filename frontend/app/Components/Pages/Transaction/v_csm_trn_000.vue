<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-solid rev-box">

          <!-- Toolbar -->
          <div class="rev-toolbar">
            <div class="rev-toolbar__title">
              <i class="fas fa-code-branch"></i>
              <div>
                <b>Revision No. (PROD)</b>
                <small>ระบุเลข Revision ที่ขึ้น PROD แล้วกด Update PROD เพื่อบันทึก</small>
              </div>
            </div>

            <div class="rev-toolbar__search">
              <i class="fa fa-search"></i>
              <input type="text"
                     v-model="seach1"
                     @input="searchData()"
                     @keyup.enter="searchData()"
                     placeholder="ค้นหา CSM No. / Subject / Project / Customer / Req By" />
              <button v-if="seach1" class="rev-search-clear" @click.prevent="clearSearch()">
                <i class="fa fa-times"></i>
              </button>
            </div>

            <div class="rev-toolbar__stats">
              <span class="rev-chip">
                <i class="fas fa-list-ul"></i> ทั้งหมด <b>{{ filteredList.length }}</b>
              </span>
              <span class="rev-chip rev-chip--ok">
                <i class="fas fa-check-circle"></i> พร้อมอัปเดต <b>{{ filledCount }}</b>
              </span>
            </div>

            <div class="rev-toolbar__actions">
              <button class="rev-btn rev-btn--ghost"
                      @click="clearRevision()"
                      v-bind:disabled="filledCount === 0">
                <i class="far fa-trash-alt"></i> ล้างค่า
              </button>
              <div class="rev-period">
                <i class="far fa-calendar-alt"></i>
                <select class="rev-period__select" v-model="rev_year">
                  <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
                </select>
                <select class="rev-period__select" v-model="rev_month">
                  <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.text }}</option>
                </select>
              </div>
              <button class="rev-btn rev-btn--default"
                      @click="setDefaultRevision()"
                      v-bind:disabled="filteredList.length === 0">
                <i class="fas fa-calendar-day"></i> Default Revision No.
                <span class="rev-btn__hint">{{ defaultRevision }}</span>
              </button>
              <button class="rev-btn rev-btn--save"
                      @click="UpdateProd()"
                      v-bind:disabled="!hasUpdateP">
                <i class="fas fa-cloud-upload-alt"></i> Update PROD
                <span class="rev-btn__count" v-if="filledCount > 0">{{ filledCount }}</span>
              </button>
            </div>
          </div>

          <div class="box-body">

            <!-- AG Table -->
            <div class="row">
              <div class="col-sm-12">
                <div class="rev-table ag-grid-bordered">
                  <ag-table ref="agr"
                    :footer="false"
                    @ready="initTable()"
                    :saveColumns="'Y'"
                    :doctype="'VIEW'"
                    :scale="290"
                    :page_name="'v_csm_trn_000'">
                  </ag-table>
                  <div class="rev-table-empty" v-if="!isLoading && filteredList.length === 0">
                    <i class="fas fa-inbox"></i>
                    <span>{{ seach1 ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีข้อมูล' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="row">
              <div class="col-md-12" style="margin-top:10px;">
                <pagination class="pull-left" ref="paging"
                  @page-change="pageChange($event.page)">
                </pagination>
              </div>
            </div>

          </div>
        </div>
      </template>
    </re-page>
  </div>
</template>

<script>
  let page = {};
  let paging = {};
  let month_th = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  let cpn = {
    data() {
      let now = new Date();
      return {
        baseUrl,
        auth: window.auth,
        xt: $xt,
        ui: window.ui,
        show_panel: 0,
        isLoading: true,
        datalist: [],
        seach1: '',
        rev_year: now.getFullYear(),
        rev_month: $xt.formatDate(now, 'MM'),
        filteredList: [],
        displayData: [],   // หน้าปัจจุบันที่แสดงใน ag-table
      };
    },
    methods: {
      /* ─── AG Table ──────────────────────────────────────── */
      initTable() {
        let agr = this.$refs.agr;
        if (!agr) return;

        let self = this;

        let fields = [
          ["year_group", "", "text", { rowGroup: true }],
          ["job_no", "CSM No.", "text", {
            width: 160,
            align: "center",
            pinned: "left",
            sortable: true,
            cellRenderer: (params) => {
              if (!params.value) return '';
              let url = self.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${params.value}`;
              return `<a class="rev-job-link" href="${url}" target="_blank">${params.value}</a>`;
            }
          }],
          ["subject", "Subject", "text", {
            width: 400,
            sortable: true,
            tooltipField: "subject",
          }],
          ["project", "Project", "text", {
            width: 260,
            sortable: true,
            tooltipField: "project",
          }],
          ["customer_name", "Customer", "text", {
            width: 260,
            sortable: true,
            tooltipField: "customer_name",
          }],
          ["empname_t", "Req By", "text", {
            width: 200,
            sortable: true,
          }],
          ["revision", "Revision No. (UAT)", "text", {
            width: 220,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              if ($xt.isEmpty(params.value)) return `<span class="rev-uat-empty">-</span>`;
              return `<span class="ag-table-badge ag-table-badge--info">${params.value}</span>`;
            }
          }],
          ["revision_prod", "Revision No. (PROD)", "text", {
            width: 240,
            align: "center",
             pinned: "right",
            cellRenderer: (params) => {
              let val = (params.value == null ? '' : params.value).toString().replace(/"/g, '&quot;');
              let job = params.data.job_no || '';
              return `<div class="rev-cell">
                        <input type="text"
                          class="rev-input${val ? ' is-filled' : ''}"
                          data-job="${job}"
                          value="${val}"
                          maxlength="8"
                          inputmode="numeric"
                          placeholder="YYYYMMDD" />
                        <button type="button" class="rev-today" data-job="${job}"
                          title="ใช้ค่า Default Revision (${self.defaultRevision})">
                          <i class="fas fa-calendar-day"></i>
                        </button>
                      </div>`;
            }
          }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        // Event delegation สำหรับ revision_prod input
        this.$nextTick(() => {
          agr.$el.addEventListener('input', (e) => {
            let inp = e.target.closest('.rev-input');
            if (inp) {
              let digit = inp.value.replace(/\D/g, '').substring(0, 8);
              if (inp.value !== digit) inp.value = digit;
              inp.classList.toggle('is-filled', !$xt.isEmpty(inp.value));

              // filteredList / displayData ถือ reference เดียวกับ datalist
              let job_no = inp.getAttribute('data-job');
              let row = this.datalist.find(d => d.job_no === job_no);
              if (row) row.revision_prod = digit;
            }
          });

          agr.$el.addEventListener('click', (e) => {
            let btn = e.target.closest('.rev-today');
            if (!btn) return;

            let job_no = btn.getAttribute('data-job');
            let row = this.datalist.find(d => d.job_no === job_no);
            if (row) row.revision_prod = this.defaultRevision;

            let inp = btn.parentElement.querySelector('.rev-input');
            if (inp) {
              inp.value = this.defaultRevision;
              inp.classList.add('is-filled');
            }
          });
        });
      },

      refreshTable() {
        let agr = this.$refs.agr;
        if (agr) agr.setDisplay(this.displayData);
      },

      /* ─── Pagination (client-side) ──────────────────────── */
      pageChange(pn) {
        pn = pn || 1;
        paging.setCurrentPage(pn);

        this.displayData = $linq(this.filteredList)
          .skip(paging.skipItems())
          .take(paging.getItemsPerPage())
          .toArray();

        paging.createPagesArray();

        this.$nextTick(() => {
          this.refreshTable();
        });
      },

      /* ─── Search ─────────────────────────────────────────── */
      searchData() {
        if (!this.seach1) {
          this.filteredList = [...this.datalist];
        } else {
          const term = this.seach1.toLowerCase();
          this.filteredList = this.datalist.filter(item =>
            (item.job_no        && item.job_no.toLowerCase().includes(term)) ||
            (item.subject       && item.subject.toLowerCase().includes(term)) ||
            (item.project       && item.project.toLowerCase().includes(term)) ||
            (item.customer_name && item.customer_name.toLowerCase().includes(term)) ||
            (item.empname_t     && item.empname_t.toLowerCase().includes(term))
          );
        }
        paging.setTotalItems(this.filteredList.length);
        this.pageChange(1);
      },

      clearSearch() {
        this.seach1 = '';
        this.searchData();
      },

      /* ─── Revision No. (PROD) ───────────────────────────── */
      setDefaultRevision() {
        let period = `${this.rev_year}${this.rev_month}`;
        let q = this.filteredList.filter(x => x && $xt.isEmpty(x.revision_prod)
          && $xt.formatDate(x.job_date, 'YYYYMM') === period);
        if (q.length === 0) {
          $notify.info(`ไม่มีรายการของเดือนที่เลือกที่รอกรอก Revision No. (PROD)`);
          return;
        }

        q.forEach(x => x.revision_prod = this.defaultRevision);
        this.refreshTable();
        $notify.success(`กำหนด Revision No. ${this.defaultRevision} ให้ ${q.length} รายการ`);
      },

      clearRevision() {
        this.filteredList.forEach(x => x.revision_prod = '');
        this.refreshTable();
      },

      /* ─── Load data ─────────────────────────────────────── */
      async loadData() {
        this.isLoading = true;
        page.loadingBox.show();
        let act = `csm/master/Readlist_v_csm_trn_000?search=${this.seach1 || ''}`;
        let rsp = await $xt.getServer(act);
        page.loadingBox.hide();

        this.datalist = (rsp.data.data || []).map(x => {
          x.year_group = $xt.isEmpty(x.job_date) ? 'ไม่ระบุปี' : `ปีเอกสาร ${$xt.formatDate(x.job_date, 'YYYY')}`;
          return x;
        });
        this.isLoading = false;
        this.searchData();
      },

      reset() {
        this.seach1 = '';
        this.datalist = [];
        this.filteredList = [];
        this.displayData = [];
      },

      /* ─── Update PROD ────────────────────────────────────── */
      async UpdateProd() {
        try {
          let q = $linq(this.filteredList)
            .where(x => x && !$xt.isEmpty(x.revision_prod))
            .toArray();
          if (q.length === 0) throw new Error('No valid data to update');

          let f = { data: q };
          let url = `csm/master/UpdateRevisionProd`;
          let rsp = await $xt.postServerJson(url, f);
          if (!rsp.success) throw rsp.error;

          $notify.success(this.ui.alert_save_success || 'บันทึกสำเร็จ');
          this.reset();
          await this.loadData();
        } catch (ex) {
          $msg.alert('Danger', ex.toString(), 'danger');
        }
      },
    },
    computed: {
      connectionCodeData() { return store.state.connectionCodeData; },
      defaultRevision() {
        let day = Math.min($xt.int($xt.formatDate(new Date(), 'DD')), this.daysInMonth);
        return `${this.rev_year}${this.rev_month}${('0' + day).slice(-2)}`;
      },
      yearOptions() {
        let y = new Date().getFullYear();
        let arr = [];
        for (let i = y + 1; i >= y - 5; i--) arr.push(i);
        return arr;
      },
      monthOptions() {
        return month_th.map((t, i) => ({ value: ('0' + (i + 1)).slice(-2), text: t }));
      },
      daysInMonth() {
        return new Date(this.rev_year, $xt.int(this.rev_month), 0).getDate();
      },
      filledCount() {
        return this.filteredList.filter(row => !$xt.isEmpty(row.revision_prod)).length;
      },
      hasUpdateP() {
        return this.filledCount > 0;
      },
    },
    watch: {
      defaultRevision() {
        this.refreshTable();
      },
    },
    mounted() {
      (async () => {
        page = this.$refs.page;
        page.pageTitle = `CSM : Revision No. (PROD)`;
        document.title = page.pageTitle;

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(500);

        await this.loadData();
      })();
    },
  };
  export default cpn;
</script>

<style>
  .rev-box {
    overflow: hidden;
  }

  /* ─── Toolbar ──────────────────────────────────────── */
  .rev-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 12px 15px;
    background: linear-gradient(90deg, #02234e 0%, #0b3468 100%);
    border-bottom: 3px solid #1a6fa8;
  }

  .rev-toolbar__title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: auto;
    color: #fff;
  }

  .rev-toolbar__title > i {
    font-size: 20px;
    opacity: .8;
  }

  .rev-toolbar__title b {
    display: block;
    font-size: 15px;
    letter-spacing: .2px;
  }

  .rev-toolbar__title small {
    display: block;
    color: rgba(255, 255, 255, .65);
    font-size: 11.5px;
  }

  .rev-toolbar__search {
    position: relative;
    flex: 0 0 320px;
    max-width: 100%;
  }

  .rev-toolbar__search > i {
    position: absolute;
    top: 50%;
    left: 11px;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, .5);
    font-size: 12px;
  }

  .rev-toolbar__search input {
    width: 100%;
    height: 32px;
    padding: 0 28px 0 28px;
    border: 1px solid rgba(255, 255, 255, .18);
    border-radius: 16px;
    background: rgba(255, 255, 255, .1);
    color: #fff;
    font-size: 12.5px;
    transition: background-color .15s ease, border-color .15s ease;
  }

  .rev-toolbar__search input::placeholder {
    color: rgba(255, 255, 255, .45);
  }

  .rev-toolbar__search input:focus {
    outline: none;
    background: #fff;
    border-color: #fff;
    color: #2b3a4a;
  }

  .rev-search-clear {
    position: absolute;
    top: 50%;
    right: 6px;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: #9aa7b4;
    font-size: 11px;
    line-height: 1;
  }

  .rev-search-clear:hover {
    background: rgba(0, 0, 0, .08);
    color: #d9534f;
  }

  .rev-toolbar__stats {
    display: flex;
    gap: 6px;
  }

  .rev-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 14px;
    background: rgba(255, 255, 255, .12);
    color: rgba(255, 255, 255, .8);
    font-size: 11.5px;
    white-space: nowrap;
  }

  .rev-chip b {
    color: #fff;
    font-size: 12.5px;
  }

  .rev-chip--ok {
    background: rgba(46, 139, 87, .3);
    color: #cdf0dc;
  }

  .rev-chip--ok b {
    color: #a8e9c6;
  }

  .rev-toolbar__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rev-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid transparent;
    border-radius: 16px;
    font-size: 12.5px;
    font-weight: 600;
    white-space: nowrap;
    transition: background-color .15s ease, box-shadow .15s ease, opacity .15s ease;
  }

  .rev-btn:disabled {
    opacity: .4;
    cursor: not-allowed;
  }

  .rev-btn--ghost {
    background: transparent;
    border-color: rgba(255, 255, 255, .25);
    color: rgba(255, 255, 255, .8);
  }

  .rev-btn--ghost:hover:enabled {
    background: rgba(255, 255, 255, .12);
    color: #fff;
  }

  .rev-btn--default {
    background: #fff;
    color: #0b3468;
  }

  .rev-btn--default:hover:enabled {
    box-shadow: 0 0 0 3px rgba(255, 255, 255, .22);
  }

  .rev-btn__hint {
    padding: 1px 6px;
    border-radius: 9px;
    background: #eaf1f9;
    color: #1a6fa8;
    font-size: 11px;
    font-weight: 700;
  }

  .rev-btn--save {
    background: #2e8b57;
    color: #fff;
  }

  .rev-btn--save:hover:enabled {
    background: #339d61;
    box-shadow: 0 0 0 3px rgba(46, 139, 87, .3);
  }

  .rev-btn__count {
    min-width: 18px;
    padding: 1px 6px;
    border-radius: 9px;
    background: rgba(255, 255, 255, .22);
    font-size: 11px;
    text-align: center;
  }

  .rev-period {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 10px;
    border: 1px solid rgba(255, 255, 255, .25);
    border-radius: 16px;
    color: rgba(255, 255, 255, .6);
  }

  .rev-period > i {
    font-size: 12px;
  }

  .rev-period__select {
    height: 24px;
    max-width: 110px;
    padding: 0 4px;
    border: none;
    border-radius: 12px;
    background: rgba(255, 255, 255, .12);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
  }

  .rev-period__select:focus {
    outline: none;
    background: #fff;
    color: #2b3a4a;
  }

  .rev-period__select option {
    color: #2b3a4a;
  }

  @media (max-width: 991px) {
    .rev-toolbar__title {
      width: 100%;
    }

    .rev-toolbar__search {
      flex: 1 1 220px;
    }

    .rev-toolbar__actions {
      flex: 1 1 100%;
      justify-content: flex-end;
    }
  }

  /* ─── Table ────────────────────────────────────────── */
  .rev-table {
    position: relative;
  }

  .rev-table .ag-theme-alpine .ag-root-wrapper {
    border-radius: 8px;
  }

  .rev-table .ag-theme-alpine .ag-header-cell-text {
    letter-spacing: .2px;
  }

  .rev-table .ag-theme-alpine .ag-pinned-left-cols-container {
    box-shadow: 6px 0 8px -6px rgba(2, 35, 78, .18);
  }

  .rev-table .ag-theme-alpine .ag-row-hover {
    background-color: #f2f7fc;
  }

  .rev-table .ag-overlay-no-rows-wrapper {
    display: none;
  }

  .rev-table .rev-job-link {
    color: #1a6fa8;
    font-weight: 700;
    text-decoration: none;
    border-bottom: 1px dashed rgba(26, 111, 168, .45);
  }

  .rev-table .rev-job-link:hover {
    color: #02234e;
    border-bottom-color: #02234e;
  }

  .rev-table .rev-uat-empty {
    color: #b6bfc9;
  }

  /* กลุ่มปีเอกสาร */
  .rev-table .ag-theme-alpine .ag-row-group {
    background: linear-gradient(90deg, #eef4fb 0%, #f7fafd 60%, #fff 100%);
    border-top: 1px solid #dbe6f2;
    border-bottom: 1px solid #dbe6f2;
    font-weight: 700;
  }

  .rev-table .ag-theme-alpine .ag-row-group .ag-group-value {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 14px;
    border-radius: 999px;
    background: #02234e;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .3px;
    line-height: 1.4;
    white-space: nowrap;
    box-shadow: 0 2px 6px rgba(2, 35, 78, .22);
  }

  .rev-table .ag-theme-alpine .ag-row-group .ag-group-value::before {
    content: "\f073";
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
    font-size: 11px;
    opacity: .75;
  }

  .rev-table .ag-theme-alpine .ag-row-group .ag-group-child-count {
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
    padding: 2px 10px;
    border-radius: 999px;
    background: #e8f0fe;
    color: #315fbd;
    font-size: 11px;
    font-weight: 700;
  }

  .rev-table .ag-theme-alpine .ag-row-group .ag-group-expanded,
  .rev-table .ag-theme-alpine .ag-row-group .ag-group-contracted {
    color: #1a6fa8;
  }

  /* คอลัมน์ PROD — โซนที่แก้ไขได้ */
  .rev-table .ag-theme-alpine .ag-header-cell[col-id="revision_prod"] {
    background-color: #0b3468;
  }

  .rev-table .ag-theme-alpine .ag-cell[col-id="revision_prod"] {
    background-color: #f6faff;
    border-left: 1px solid #d7e3f1;
  }

  .rev-table .rev-cell {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 100%;
  }

  .rev-table .rev-input {
    flex: 1;
    min-width: 0;
    height: 30px;
    padding: 0 8px;
    border: 1px solid #cfdae7;
    border-radius: 6px;
    background: #fff;
    color: #2b3a4a;
    font-size: 12px;
    text-align: center;
    transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
  }

  .rev-table .rev-input::placeholder {
    color: #aab7c4;
  }

  .rev-table .rev-input:hover {
    border-color: #9fb8d1;
  }

  .rev-table .rev-input:focus {
    outline: none;
    border-color: #1a6fa8;
    box-shadow: 0 0 0 3px rgba(26, 111, 168, .15);
  }

  .rev-table .rev-input.is-filled {
    border-color: #2e8b57;
    background: #f4fbf6;
    font-weight: 600;
  }

  .rev-table .rev-today {
    flex: 0 0 30px;
    height: 30px;
    padding: 0;
    border: 1px solid #cfdae7;
    border-radius: 6px;
    background: #fff;
    color: #1a6fa8;
    font-size: 12px;
    line-height: 1;
    transition: background-color .15s ease, border-color .15s ease, color .15s ease;
  }

  .rev-table .rev-today:hover {
    background: #1a6fa8;
    border-color: #1a6fa8;
    color: #fff;
  }

  .rev-table-empty {
    position: absolute;
    top: 35px;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #93a1b0;
    font-size: 13px;
    pointer-events: none;
  }

  .rev-table-empty i {
    font-size: 30px;
    opacity: .45;
  }

  /* ─── Dark mode ────────────────────────────────────── */
  body.dark-mode .rev-toolbar {
    background: linear-gradient(90deg, #16212e 0%, #24384f 100%);
    border-bottom-color: #3c8dbc;
  }

  body.dark-mode .rev-btn--default {
    background: #3c8dbc;
    color: #fff;
  }

  body.dark-mode .rev-btn__hint {
    background: rgba(255, 255, 255, .2);
    color: #fff;
  }

  body.dark-mode .rev-period {
    border-color: #2d4057;
  }

  body.dark-mode .rev-period__select {
    background: #1a2a3a;
    color: #c9d1d9;
  }

  body.dark-mode .rev-table .ag-theme-alpine .ag-header-cell[col-id="revision_prod"] {
    background-color: #24384f;
  }

  body.dark-mode .rev-table .ag-theme-alpine .ag-cell[col-id="revision_prod"] {
    background-color: rgba(60, 141, 188, .07);
    border-left-color: #2d4057;
  }

  body.dark-mode .rev-table .rev-input {
    background: #1a2a3a;
    border-color: #2d4057;
    color: #c9d1d9;
  }

  body.dark-mode .rev-table .rev-input.is-filled {
    background: rgba(46, 139, 87, .16);
    border-color: #3f9d6a;
    color: #d8f0e2;
  }

  body.dark-mode .rev-table .rev-today {
    background: #1a2a3a;
    border-color: #2d4057;
    color: #6fb6e8;
  }

  body.dark-mode .rev-table .rev-today:hover {
    background: #3c8dbc;
    border-color: #3c8dbc;
    color: #fff;
  }

  body.dark-mode .rev-table .rev-job-link {
    color: #6fb6e8;
    border-bottom-color: rgba(111, 182, 232, .45);
  }

  body.dark-mode .rev-table .rev-job-link:hover {
    color: #a9d6f5;
    border-bottom-color: #a9d6f5;
  }
</style>
