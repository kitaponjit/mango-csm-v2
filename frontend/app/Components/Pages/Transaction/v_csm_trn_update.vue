<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="upd-shell">

          <div class="upd-progress" :class="{ 'is-active': isLoading }"><span></span></div>

          <!-- Toolbar : tabs + search -->
          <div class="upd-bar">
            <div class="upd-segment">
              <span class="upd-segment-thumb"
                    :style="{ width: 'calc((100% - 8px) / ' + tabs.length + ')', transform: 'translateX(' + (tabActive * 100) + '%)' }"></span>
              <button type="button" v-for="(t, i) in tabs" :key="t.key"
                      class="upd-segment-btn"
                      :class="{ active: tabActive === i }"
                      @click="onTabChange(i)">
                <i :class="t.icon"></i>
                <span>{{ t.name }}</span>
                <b v-if="tabActive === i">{{ datalist.length }}</b>
              </button>
            </div>

            <div class="upd-tools">
              <div class="upd-search" :class="{ 'is-filled': !!search.text }">
                <i class="fa fa-search"></i>
                <input type="text"
                       :placeholder="'ค้นหา CSM No. / Subject / ผู้ปฏิบัติงาน ...'"
                       v-model="search.text"
                       @keyup.enter="searchData()"
                       @input="searchData()" />
                <button v-if="search.text" class="upd-search-clear" @click.prevent="clearSearch()">
                  <i class="fa fa-times"></i>
                </button>
              </div>
              <button class="upd-refresh" :class="{ 'is-busy': isLoading }" @click.prevent="loadData()" title="โหลดข้อมูลใหม่">
                <i class="fa fa-sync-alt"></i>
              </button>
            </div>
          </div>

          <!-- AG Table -->
          <div class="upd-table ag-grid-bordered">
            <vue-element-loading :active="isLoading" spinner="spinner" color="#02234e"
                                 text="กำลังโหลดข้อมูล กรุณารอสักครู่..." />
            <ag-table ref="agr"
              :footer="false"
              :scale="250"
              @ready="initTable()"
              :saveColumns="'Y'"
              :doctype="'VIEW'"
              :page_name="'v_csm_trn_update'">
            </ag-table>
            <div class="upd-empty" v-if="!isLoading && filteredList.length === 0">
              <span class="upd-empty-ic"><i class="fas" :class="search.text ? 'fa-search-minus' : 'fa-inbox'"></i></span>
              <b>{{ search.text ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีรายการในแท็บนี้' }}</b>
              <span class="upd-empty-hint">
                {{ search.text ? 'ลองปรับคำค้นให้สั้นลง หรือล้างคำค้นเพื่อดูทั้งหมด' : 'รายการจะแสดงที่นี่เมื่อมีงานอัปเดตโปรแกรมที่ได้รับมอบหมาย' }}
              </span>
            </div>
          </div>

          <!-- Footer : pagination + count -->
          <div class="upd-foot">
            <span class="upd-count">
              แสดง <b>{{ filteredList.length }}</b> รายการ
              <em v-if="search.text && datalist.length !== filteredList.length">จากทั้งหมด {{ datalist.length }}</em>
            </span>
            <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
          </div>

        </div>
      </template>
    </re-page>

    <trn-update-modal ref="updModal" @saved="loadData()"></trn-update-modal>
  </div>
</template>

<script>
  import trn_update_modal from './components/vs_csm_trn_updatemodal.vue'

  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let paging = {};
  let cpn = {
    components: {
      'trn-update-modal': trn_update_modal,
    },
    data() {
      return {
        baseUrl,
        auth: window.auth,
        ui: window.ui,
        show_panel: 0,
        isLoading: true,
        datalist: [],
        filteredList: [],
        displayData: [],
        search: {
          text: '',
        },
        tabActive: 0,
        tabs: [
          { key: 'update', name: 'Update Program', icon: 'fas fa-wrench' },
          { key: 'complete', name: 'Update Program Complate', icon: 'fas fa-check-circle' },
        ],
      };
    },
    methods: {
      async onTabChange(t) {
        if (this.tabActive === t) return;
        this.tabActive = t;
        await this.loadData();
      },

      /* ─── AG Table ──────────────────────────────────────── */
      initTable() {
        let agr = this.$refs.agr;
        if (!agr) return;

        let self = this;
        let bold_underline = { "font-weight": "bold" };
        let bold_style = (p) => (p?.data?.job_code == 'W' ? bold_underline : p?.data?.task_queued_count > 0 && this.is_mango() ? { "color": "#fd7e14" } : {});

        let fields = [
          ["", "Action", "text", {
            width: 90,
            align: "center",
            pinned: "left",
            sortable: false,
            cellRenderer: (params) => {
              if (!params.data || !params.data.job_no) return '';
              return `<a href="#" class="upd-act-edit" data-job="${params.data.job_no}" title="เปิดเช็คลิสต์อัปเดตโปรแกรม"><i class="fas fa-edit"></i></a>`;
            }
          }],
          ["job_no", "CSM No.", "text", {
            width: 150,
            align: "left",
            pinned: 'left',
            sortable: true,
            cellRenderer: (params) => {
              if (params.value) {
                const jobNo = params.value;
                const isWaiting = params.data.job_code === 'W';
                const displayValue = isWaiting ? `<b>${jobNo}</b>` : jobNo;
                return `<a class="home-cell-link" href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${jobNo}"
                target="_blank">${displayValue}</a>`;
              }
              return "";
            },
          }],
          ["project", "Project", "text", {
            width: 180, align: "left", sortable: true, cellStyle: bold_style,
            cellClass: params => $xt.isEmpty(params.data.project) ? "text-warning" : "",
            cellRenderer: params => {
              let x = params.data
              if (this.is_mango() && !this.isDeveloper()) {
                return $xt.isEmpty(x.project) && !$xt.isEmpty(x.customer_code)
                  ? 'By Customer'
                  : x.project
              }

              if (this.is_mango() && this.isDeveloper() && !$xt.isEmpty(x.project)) {
                return `<a href="${this.baseUrl}page/CustomerDataView?customer_code=${x.customer_code}&pre_event=${x.pre_event}&tabSelected=tab1" class="home-cell-link" target="_blank" >${x.project}</a>`
              }
              return ''
            }
          }],
          ["serv_name", "Service", "text", {
            width: 200,
            sortable: true,
            tooltipField: "serv_name",
          }],
          ["subject", "Subject", "text", {
            width: 360,
            sortable: true,
            tooltipField: "subject",
          }],
          ["detail", "Detail", "text", {
            width: 420,
            sortable: true,
            tooltipField: "detail",
          }],
          ["assign_name", "Assign", "text", {
            width: 200,
            sortable: true,
          }],
          ["request_name", "Req By", "text", {
            width: 200,
            sortable: true,
          }],
          ["status_description", "Status", "text", {
            width: 170,
            align: "center",
            pinned: "right",
            sortable: true,
            cellRenderer: (params) => {
              if ($xt.isEmpty(params.value)) return '';
              return `<span class="ag-table-badge ${self.statusBadgeClass(params.value)}">${params.value}</span>`;
            }
          }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
        agr.setDisplay(this.displayData);

        this.$nextTick(() => {
          agr.$el.addEventListener('click', (e) => {
            let link = e.target.closest('.upd-act-edit');
            if (!link) return;
            e.preventDefault();
            this.openUpdateModal(link.getAttribute('data-job'));
          });
        });
      },

      async openUpdateModal(job_no) {
        try {
          page.loadingBox.show();
          let act = `CSM/Data/ReadTrnUpdate?job_no=${encodeURIComponent(job_no)}`;
          let rsp = await $xt.getServer(act);
          if (!rsp.success) throw rsp.error;

          let row = (rsp.data.data || [])[0];
          if (!row) throw 'ไม่พบข้อมูลของเอกสารนี้';

          this.$refs.updModal.open(row, this.tabs[this.tabActive].key === 'complete' ? 'view' : 'edit');
        } catch (ex) {
          $msg.alert('Warning', ex.toString(), 'warning');
        } finally {
          page.loadingBox.hide();
        }
      },

      is_mango() {
        return $linq(this.$store.state.configData)
          .where(x => x.config_id == 'TRN0001')
          .select(x => x.config_value)
          .firstOrDefault() == 'Y'
      },

      isDeveloper() {
        let department = (this.auth.empcode || '').substring(0, 2)
        return department == 'IT'
      },

      statusBadgeClass(status_description) {
        switch (status_description) {
          case 'Wait': return 'ag-table-badge--warning';
          case 'In Progress': return 'ag-table-badge--info';
          case 'Test': return 'ag-table-badge--info';
          case 'Send Back': return 'ag-table-badge--danger';
          case 'Send Pretest': return 'ag-table-badge--info';
          case 'Complete': return 'ag-table-badge--success';
          default: return '';
        }
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
          let agr = this.$refs.agr;
          if (agr) agr.setDisplay(this.displayData);
        });
      },

      clearSearch() {
        this.search.text = '';
        this.searchData();
      },

      /* ─── Search (client-side) ──────────────────────────── */
      searchData() {
        if (!this.search.text) {
          this.filteredList = [...this.datalist];
        } else {
          const term = this.search.text.toLowerCase();
          const match = (v) => v && v.toString().toLowerCase().includes(term);
          this.filteredList = this.datalist.filter(item =>
            match(item.job_no) ||
            match(item.serv_name) ||
            match(item.subject) ||
            match(item.detail) ||
            match(item.assign_name) ||
            match(item.request_name) ||
            match(item.status_description)
          );
        }
        paging.setTotalItems(this.filteredList.length);
        this.pageChange(1);
      },

      /* ─── Load data ─────────────────────────────────────── */
      async loadData() {
        try {
          this.isLoading = true;
          let act = `CSM/Data/CSM_ReadListTrnUpdate?tab=${this.tabs[this.tabActive].key}`;
          let rsp = await $xt.getServer(act);
          if (!rsp.success) throw rsp.error;

          this.datalist = rsp.data.data || [];
          this.searchData();
        } catch (ex) {
          $msg.alert('Warning', ex.toString(), 'warning');
        } finally {
          this.isLoading = false;
        }
      },
    },
    mounted() {
      (async () => {
        page = this.$refs.page;
        page.pageTitle = `Check-List Update Program (IT)`;
        document.title = page.pageTitle;

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(20);

        await this.loadData();
      })();
    },
  };
  export default cpn;
</script>

<style>
  /* ===== Shell ===== */
  .upd-shell {
    --upd-navy: #02234e;
    --upd-blue: #1a6fa8;
    --upd-teal: #12b886;

    --upd-surface: #ffffff;
    --upd-surface-2: #fbfcfe;
    --upd-sunken: #f1f5fa;
    --upd-line: #e4e9f1;
    --upd-line-soft: #eef2f7;
    --upd-field: #ffffff;
    --upd-field-line: #dfe6ef;

    --upd-text: #22364f;
    --upd-muted: #8a97a8;
    --upd-faint: #a3b0c0;
    --upd-accent: #1a6fa8;
    --upd-accent-weak: rgba(26, 111, 168, .10);
    --upd-accent-ring: rgba(26, 111, 168, .14);
    --upd-thumb: linear-gradient(180deg, #1a6fa8 0%, #02234e 100%);
    --upd-row-hover: #f2f8ff;

    --upd-ease: cubic-bezier(.22, .85, .3, 1);
    --upd-spring: cubic-bezier(.5, 1.35, .4, 1);

    position: relative;
    border: 1px solid var(--upd-line);
    border-radius: 14px;
    background: var(--upd-surface);
    box-shadow: 0 1px 1px rgba(2, 35, 78, .03),
                0 3px 8px -4px rgba(2, 35, 78, .12),
                0 30px 54px -36px rgba(2, 35, 78, .55);
    overflow: hidden;
    animation: upd-rise .45s var(--upd-ease) both;
  }

  /* ===== Progress ribbon ===== */
  .upd-progress {
    position: relative;
    height: 3px;
    background: linear-gradient(90deg, var(--upd-navy) 0%, var(--upd-blue) 55%, var(--upd-teal) 100%);
    overflow: hidden;
  }

  .upd-progress > span {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, .9) 50%, rgba(255, 255, 255, 0) 100%);
    transform: translateX(-100%);
    opacity: 0;
  }

  .upd-progress.is-active > span {
    opacity: 1;
    animation: upd-sweep 1.15s linear infinite;
  }

  @keyframes upd-sweep {
    from { transform: translateX(-100%); }
    to { transform: translateX(100%); }
  }

  /* ===== Toolbar ===== */
  .upd-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    padding: 14px 16px;
    border-bottom: 1px solid var(--upd-line-soft);
    background: radial-gradient(120% 220% at 0% 0%, var(--upd-accent-weak) 0%, rgba(26, 111, 168, 0) 58%),
                linear-gradient(180deg, var(--upd-surface-2) 0%, var(--upd-surface) 100%);
    animation: upd-rise .5s .05s var(--upd-ease) both;
  }

  /* ===== Segmented tabs ===== */
  .upd-segment {
    position: relative;
    display: flex;
    align-items: stretch;
    min-width: 320px;
    padding: 4px;
    border: 1px solid var(--upd-line);
    border-radius: 12px;
    background: var(--upd-sunken);
    box-shadow: inset 0 1px 2px rgba(2, 35, 78, .05);
  }

  .upd-segment-thumb {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 4px;
    border-radius: 9px;
    background: var(--upd-thumb);
    box-shadow: 0 3px 8px -3px rgba(2, 35, 78, .55),
                inset 0 1px 0 rgba(255, 255, 255, .18);
    transition: transform .36s var(--upd-spring);
    pointer-events: none;
  }

  .upd-segment-btn {
    position: relative;
    z-index: 1;
    flex: 1 1 0%;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 16px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: .01em;
    color: var(--upd-muted);
    white-space: nowrap;
    cursor: pointer;
    outline: none;
    transition: color .2s ease;
  }

  .upd-segment-btn > span {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .upd-segment-btn > i {
    font-size: 12px;
    opacity: .7;
    transition: opacity .2s ease, transform .36s var(--upd-spring);
  }

  .upd-segment-btn:hover {
    color: var(--upd-accent);
  }

  .upd-segment-btn.active {
    color: #fff;
  }

  .upd-segment-btn.active > i {
    opacity: 1;
    transform: translateY(-1px);
  }

  .upd-segment-btn:focus-visible {
    box-shadow: 0 0 0 2px var(--upd-accent-ring);
  }

  .upd-segment-btn > b {
    min-width: 22px;
    padding: 2px 7px;
    border-radius: 999px;
    background: rgba(255, 255, 255, .16);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .22);
    color: #fff;
    font-size: 10.5px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    text-align: center;
    animation: upd-pop .32s var(--upd-spring) both;
  }

  @keyframes upd-pop {
    from { opacity: 0; transform: scale(.6); }
    to { opacity: 1; transform: none; }
  }

  .upd-tools {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ===== Search ===== */
  .upd-search {
    position: relative;
    display: flex;
    align-items: center;
  }

  .upd-search > i {
    position: absolute;
    left: 12px;
    font-size: 11.5px;
    color: var(--upd-faint);
    pointer-events: none;
    transition: color .18s ease;
  }

  .upd-search input {
    width: 320px;
    height: 36px;
    padding: 0 32px;
    border: 1px solid var(--upd-field-line);
    border-radius: 10px;
    background: var(--upd-field);
    font-size: 12.5px;
    color: var(--upd-text);
    outline: none;
    transition: border-color .18s ease, box-shadow .18s ease, background-color .18s ease;
  }

  .upd-search input::placeholder {
    color: var(--upd-faint);
  }

  .upd-search input:hover {
    border-color: #c3cede;
  }

  .upd-search input:focus {
    border-color: var(--upd-accent);
    box-shadow: 0 0 0 3px var(--upd-accent-ring);
  }

  .upd-search.is-filled > i,
  .upd-search:focus-within > i {
    color: var(--upd-accent);
  }

  .upd-search-clear {
    position: absolute;
    right: 7px;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: var(--upd-sunken);
    color: var(--upd-muted);
    font-size: 10px;
    line-height: 1;
    cursor: pointer;
    transition: background-color .16s ease, color .16s ease, transform .22s var(--upd-spring);
  }

  .upd-search-clear:hover {
    background: #dfe6f0;
    color: var(--upd-text);
    transform: rotate(90deg);
  }

  .upd-refresh {
    width: 36px;
    height: 36px;
    padding: 0;
    border: 1px solid var(--upd-field-line);
    border-radius: 10px;
    background: var(--upd-field);
    color: var(--upd-muted);
    font-size: 12.5px;
    cursor: pointer;
    transition: border-color .16s ease, color .16s ease, background-color .16s ease, box-shadow .16s ease;
  }

  .upd-refresh:hover {
    border-color: var(--upd-accent);
    background: #f4f9ff;
    color: var(--upd-accent);
    box-shadow: 0 4px 10px -6px rgba(2, 35, 78, .5);
  }

  .upd-refresh.is-busy {
    border-color: var(--upd-accent);
    color: var(--upd-accent);
  }

  .upd-refresh.is-busy i {
    animation: upd-spin .9s linear infinite;
  }

  @keyframes upd-spin {
    to { transform: rotate(360deg); }
  }

  /* ===== Table ===== */
  .upd-table {
    position: relative;
    padding: 14px 14px 2px;
    animation: upd-rise .55s .1s var(--upd-ease) both;
  }

  .upd-table .ag-theme-alpine .ag-root-wrapper {
    border: 1px solid var(--upd-line);
    border-radius: 12px;
  }

  .upd-table .ag-theme-alpine .ag-header {
    background-image: linear-gradient(180deg, rgba(255, 255, 255, .09) 0%, rgba(255, 255, 255, 0) 62%);
  }

  .upd-table .ag-theme-alpine .ag-header-cell-text {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .07em;
    text-transform: uppercase;
  }

  .upd-table .ag-theme-alpine .ag-pinned-left-cols-container,
  .upd-table .ag-theme-alpine .ag-pinned-left-header {
    box-shadow: 7px 0 10px -8px rgba(2, 35, 78, .3);
  }

  .upd-table .ag-theme-alpine .ag-pinned-right-cols-container,
  .upd-table .ag-theme-alpine .ag-pinned-right-header {
    box-shadow: -7px 0 10px -8px rgba(2, 35, 78, .3);
  }

  .upd-table .ag-theme-alpine .ag-row {
    border-bottom-color: var(--upd-line-soft);
    transition: background-color .14s ease;
  }

  .upd-table .ag-theme-alpine .ag-row-hover {
    background-color: var(--upd-row-hover);
  }

  .upd-table .ag-overlay-no-rows-wrapper {
    display: none;
  }

  .upd-table .home-cell-link {
    color: var(--upd-accent);
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px dashed var(--upd-accent-ring);
    transition: color .14s ease, border-color .14s ease;
  }

  .upd-table .home-cell-link:hover {
    color: var(--upd-navy);
    border-bottom-color: var(--upd-navy);
    border-bottom-style: solid;
  }

  .upd-table .upd-act-edit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 29px;
    height: 29px;
    border: 1px solid var(--upd-field-line);
    border-radius: 9px;
    background: var(--upd-field);
    color: var(--upd-muted);
    font-size: 12px;
    text-decoration: none;
    transition: border-color .14s ease, background-color .14s ease, color .14s ease, transform .18s var(--upd-spring), box-shadow .18s ease;
  }

  .upd-table .upd-act-edit:hover {
    border-color: var(--upd-accent);
    background: #eff7ff;
    color: var(--upd-accent);
    transform: translateY(-1px);
    box-shadow: 0 5px 12px -6px rgba(2, 35, 78, .6);
  }

  .upd-table .upd-act-edit:active {
    transform: translateY(0);
    box-shadow: none;
  }

  /* ===== Empty state ===== */
  .upd-empty {
    position: absolute;
    top: 62px;
    left: 15px;
    right: 15px;
    bottom: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-align: center;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(2, 35, 78, .05) 1px, transparent 1px);
    background-size: 18px 18px;
    border-radius: 0 0 11px 11px;
    animation: upd-fade .45s var(--upd-ease) both;
  }

  .upd-empty-ic {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 66px;
    height: 66px;
    margin-bottom: 12px;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 34%, var(--upd-surface) 0%, #f2f6fc 100%);
    color: #b6c4d6;
    font-size: 23px;
    box-shadow: 0 10px 22px -14px rgba(2, 35, 78, .8);
  }

  .upd-empty-ic::after {
    content: '';
    position: absolute;
    top: -9px;
    left: -9px;
    right: -9px;
    bottom: -9px;
    border: 1px dashed var(--upd-accent-ring);
    border-radius: 50%;
  }

  .upd-empty b {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: .01em;
    color: var(--upd-muted);
  }

  .upd-empty-hint {
    max-width: 340px;
    font-size: 12px;
    color: var(--upd-faint);
    line-height: 1.7;
  }

  /* ===== Footer ===== */
  .upd-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 11px 16px;
    border-top: 1px solid var(--upd-line-soft);
    background: var(--upd-surface-2);
    animation: upd-rise .6s .15s var(--upd-ease) both;
  }

  .upd-count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border: 1px solid var(--upd-line-soft);
    border-radius: 999px;
    background: var(--upd-surface);
    font-size: 12px;
    color: var(--upd-muted);
    font-variant-numeric: tabular-nums;
  }

  .upd-count::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--upd-teal);
    box-shadow: 0 0 0 3px rgba(18, 184, 134, .16);
  }

  .upd-count b {
    color: var(--upd-text);
    font-weight: 700;
  }

  .upd-count em {
    font-style: normal;
    color: var(--upd-faint);
  }

  .upd-foot .pagination {
    display: inline-flex;
    gap: 4px;
    margin: 0;
  }

  .upd-foot .pagination > li {
    display: inline-flex;
  }

  .upd-foot .pagination > li > a {
    float: none;
    margin: 0;
    min-width: 32px;
    padding: 5px 10px;
    border: 1px solid var(--upd-line);
    border-radius: 9px;
    background: var(--upd-surface);
    color: var(--upd-muted);
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    font-variant-numeric: tabular-nums;
    transition: border-color .14s ease, background-color .14s ease, color .14s ease, box-shadow .14s ease;
  }

  .upd-foot .pagination > li > a:hover,
  .upd-foot .pagination > li > a:focus {
    border-color: var(--upd-accent);
    background: #f4f9ff;
    color: var(--upd-accent);
  }

  .upd-foot .pagination > li.active > a,
  .upd-foot .pagination > li.active > a:hover,
  .upd-foot .pagination > li.active > a:focus {
    border-color: var(--upd-navy);
    background: var(--upd-thumb);
    color: #fff;
    box-shadow: 0 4px 10px -5px rgba(2, 35, 78, .8);
  }

  .upd-foot .pagination > li > a.disabled-menu {
    opacity: .4;
    pointer-events: none;
  }

  /* ===== Motion ===== */
  @keyframes upd-rise {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: none; }
  }

  @keyframes upd-fade {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: none; }
  }

  /* ===== Responsive ===== */
  @media (max-width: 900px) {
    .upd-bar {
      padding: 12px;
    }

    .upd-segment {
      flex: 1 1 100%;
      min-width: 0;
    }

    .upd-tools {
      flex: 1 1 100%;
    }

    .upd-search {
      flex: 1 1 auto;
    }

    .upd-search input {
      width: 100%;
    }
  }

  @media (max-width: 560px) {
    .upd-segment-btn {
      gap: 6px;
      padding: 9px 8px;
      font-size: 11.5px;
    }

    .upd-foot {
      justify-content: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .upd-shell,
    .upd-bar,
    .upd-table,
    .upd-foot,
    .upd-empty,
    .upd-segment-btn > b {
      animation: none;
    }

    .upd-segment-thumb {
      transition: none;
    }
  }

  /* ===== Dark mode ===== */
  body.dark-mode .upd-shell {
    --upd-surface: #1a2a3a;
    --upd-surface-2: #16242f;
    --upd-sunken: #16242f;
    --upd-line: #2d4057;
    --upd-line-soft: #2d4057;
    --upd-field: #16242f;
    --upd-field-line: #2d4057;

    --upd-text: #d7e3f1;
    --upd-muted: #9fb3c8;
    --upd-faint: #6f8399;
    --upd-accent: #6fb6e8;
    --upd-accent-weak: rgba(60, 141, 188, .14);
    --upd-accent-ring: rgba(60, 141, 188, .32);
    --upd-thumb: linear-gradient(180deg, #3c6d99 0%, #1e3a56 100%);
    --upd-row-hover: rgba(60, 141, 188, .07);

    box-shadow: none;
  }

  body.dark-mode .upd-segment {
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, .3);
  }

  body.dark-mode .upd-segment-thumb {
    box-shadow: 0 3px 8px -3px rgba(0, 0, 0, .7),
                inset 0 1px 0 rgba(255, 255, 255, .1);
  }

  body.dark-mode .upd-search input:hover {
    border-color: #3c6d99;
  }

  body.dark-mode .upd-search-clear:hover {
    background: #23374b;
    color: #d7e3f1;
  }

  body.dark-mode .upd-refresh:hover {
    background: rgba(60, 141, 188, .12);
    border-color: #3c6d99;
    color: var(--upd-accent);
  }

  body.dark-mode .upd-table .upd-act-edit:hover,
  body.dark-mode .upd-foot .pagination > li > a:hover,
  body.dark-mode .upd-foot .pagination > li > a:focus {
    background: rgba(60, 141, 188, .14);
    border-color: #3c6d99;
    color: var(--upd-accent);
  }

  body.dark-mode .upd-table .home-cell-link:hover {
    color: #a9d6f5;
    border-bottom-color: #a9d6f5;
  }

  body.dark-mode .upd-empty {
    background-image: radial-gradient(circle, rgba(159, 208, 245, .06) 1px, transparent 1px);
  }

  body.dark-mode .upd-empty-ic {
    background: radial-gradient(circle at 50% 34%, #22364a 0%, #16242f 100%);
    color: #4f6b88;
    box-shadow: 0 10px 22px -14px rgba(0, 0, 0, .9);
  }

  body.dark-mode .upd-foot .pagination > li.active > a,
  body.dark-mode .upd-foot .pagination > li.active > a:hover,
  body.dark-mode .upd-foot .pagination > li.active > a:focus {
    border-color: #3c6d99;
    color: #fff;
  }
</style>
