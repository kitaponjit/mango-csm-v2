<template>
  <div class="mla-page">
    <re-page ref="page">
      <template slot="body">
        <div class="mla-head">
          <div class="mla-head__title">
            <i class="fas fa-clipboard-check"></i>
            <div>
              <b>Check Update List</b>
              <small>ตรวจสอบและยืนยันรายการที่จะนำไปออก Update List</small>
            </div>
          </div>
          <div class="mla-head__right">
            <span class="mla-chip"><i class="fas fa-layer-group"></i> {{ $num(total, 0) }} รายการ</span>
            <span class="mla-chip mla-chip--on" v-if="selectedCount"><i class="fas fa-check-circle"></i> เลือกแล้ว {{ selectedCount }}</span>
          </div>
        </div>

        <div class="box box-solid">
          <div class="box-body">
            <div class="mla-filter">
              <div class="mla-field">
                <label>Module</label>
                <select class="form-control input-sm" v-model.trim="retrieveSearch['module']" @change="retrieveSetPage(1)">
                  <option value="">-- Please Select --</option>
                  <option v-for="x in module" v-bind:value="x">{{ x }}</option>
                </select>
              </div>
              <div class="mla-field">
                <label>Approve Status</label>
                <select class="form-control input-sm" v-model.trim="retrieveSearch['approve_status']" @change="retrieveSetPage(1)">
                  <option value="">-- Please Select --</option>
                  <option v-for="x in approveStatus" v-bind:value="x.value">{{ x.name }}</option>
                </select>
              </div>
              <div class="mla-field">
                <label>Search by</label>
                <select class="form-control input-sm" v-model.trim="retrieveSearch['field']">
                  <option value="">-- Please Select --</option>
                  <option v-for="x in fields" v-bind:value="x.key">{{ x.name }}</option>
                </select>
              </div>
              <div class="mla-field mla-field--grow">
                <label>Search Keyword</label>
                <div class="mla-search">
                  <i class="fas fa-search mla-search__lead"></i>
                  <input type="text" class="form-control input-sm" placeholder="พิมพ์คำค้นหา แล้วกด Enter" v-model.trim="retrieveSearch['search']" @keyup.enter="retrieveSearchClick()" ref="searchBox" />
                  <button class="mla-search__btn" @click="retrieveSearchClick()"><i class="fa fa-search"></i></button>
                </div>
              </div>
              <div class="mla-field mla-field--act">
                <label>&nbsp;</label>
                <button class="mla-btn mla-btn--main" @click="toUpdateList()">
                  <i class="fas fa-list"></i>
                  <span>ยืนยันการนำข้อมูลไปออก Update List</span>
                  <span class="mla-btn__n" v-if="selectedCount">{{ selectedCount }}</span>
                </button>
              </div>
            </div>

            <div class="mla-grid">
              <ag-table ref="agr"
                        :scale="350"
                        :footer="false"
                        @ready="initTable()"
                        :saveColumns="'Y'"
                        :doctype="'MANUALLISTADMIN'"
                        :page_name="'v_csm_manual_list_admin'"></ag-table>
            </div>

            <div class="mla-foot">
              <span class="mla-foot__hint"><i class="fas fa-hand-pointer"></i> ติ๊กเลือกรายการในคอลัมน์ "เลือก" แล้วกดปุ่มยืนยันด้านบน</span>
              <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
            </div>
          </div>
        </div>
      </template>
    </re-page>
  </div>
</template>

<script type="text/javascript">
  let page = {}
  let paging = {}
  export default {
    data() {
      return {
        auth,
        ui: window.ui,
        xt: $xt,
        baseUrl,
        fields: [
          { key: 'job_no', name: 'CSM No.', type: 's', search: true, sort: true, sort_default: true, width: 200 },
        ],
        approveStatus: [
          { name: 'ALL', value: 'ALL' },
          { name: 'Approve', value: 'Y' },
          { name: 'None', value: 'N' },
        ],
        module: moduleCodeData,
        retrieveSearch: {},
        data: [],
        total: 0,
        pageNumber: 1,
      };
    },
    methods: {
      async loadRetrieve() {
        let module = this.retrieveSearch['module'] == undefined ? "All Module" : this.retrieveSearch['module'];
        let approve_status = this.retrieveSearch['approve_status'] == undefined ? "N" : this.retrieveSearch['approve_status'];
        let act = `CSM/Manual/CheckUpdateList?module=${module}&approve_status=${approve_status}&skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
        for (var key in this.retrieveSearch) {
          act += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`;
        }

        let rsp = await $xt.getServer(act);
        this.data = rsp.data;
        this.total = rsp.total;

        paging.setTotalItems(rsp.total);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();

        await this.$nextTick();
        await this.initTable();
      },
      retrieveSearchClick() {
        this.pageChange(1);
      },
      retrieveSetPage(x) {
        paging.setCurrentPage(x);
        this.loadRetrieve();
      },
      pageChange(x) {
        paging.setCurrentPage(x);
        this.loadRetrieve();
      },
      itemTypeName(code) {
        return $linq(this.serviceCodeData).where(x => x.serv_code == code).select(x => x.serv_name).firstOrDefault() || '';
      },
      async toUpdateList() {
        try {
          let count = $linq(this.data).where(x => x.isCheckData).count();
          if (count < 1) {
            $msg.alert(`คำเตือน`, "กรุณาเลือกอย่างน้อย 1 รายการ", `warning`);
            return
          }

          let arr = $linq(this.data).where(x => x.isCheckData).toArray();
          let obj = $linq(arr).where(x => x.attach_files == 0 && x.item_type != "11").firstOrDefault();
          if (obj != null && obj.attach_files == 0) {
            $msg.alert(`คำเตือน`, `${obj.job_no} : รายการที่เลือกยังไม่ได้แนบรูปที่แท็บ Attach Files (Updates List)`, `warning`);
            return;
          }

          arr.forEach((x, idx) => {
            x.revision_is_import_by_admin = x.revision_is_import_by_admin == "N" ? "Y" : "N";
          });

          page.loadingBox.show();
          let act = `CSM/Manual/UpdateCheckUpdateList`;
          let rsp = await $xt.postServerJson(act, { detail: arr });
          if (!rsp.success) {
            throw rsp.error;
          }
          this.loadRetrieve();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }

      },
      queryString(x) {
        window.open(this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${x.job_no}&ref_itemno=${x.itemno}`, "_blank");
      },
      async initTable() {
        let agr = this.$refs.agr;
        if (!agr) return;

        let self = this;

        let fields = [
          ["isCheckData", "เลือก", "text", {
            width: 100,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
              let x = params.data;
              let checked = x.isCheckData ? 'checked' : '';
              return `<input type="checkbox" class="chk-select-row" data-jobno="${x.job_no}" data-itemno="${x.itemno}" ${checked} style="cursor:pointer;" />`;
            },
          }],
          ["job_no", "Document No.", "text", {
            width: 200,
            align: "center",
            sortable: true,
            pinned: 'left',
            cellStyle: { "font-weight": "bold" },
            cellRenderer: (params) => {
              let x = params.data;
              return `<a href="#" class="btn-open-doc" data-jobno="${x.job_no}" data-itemno="${x.itemno}" style="color: #3c8dbc;">${x.job_no || ''}</a>`;
            }
          }],
          ["itemno", "Item No.", "text", { width: 120, align: "center", sortable: true }],
          ["module", "Module", "text", { width: 140, align: "center", sortable: true }],
          ["revision", "Revision No.", "text", { width: 160, align: "center", sortable: true }],
          ["subject", "Subject", "text", { width: 420, align: "left", sortable: true }],
          ["item_type", "Type", "text", {
            width: 200,
            align: "left",
            sortable: true,
            cellRenderer: (params) => {
              return self.itemTypeName(params.value) || '';
            }
          }],
          ["complete_date", "Complete Date", "date", { width: 180, align: "center", sortable: true }, { useCellRenderer: true }],
          ["revision_is_import_by_admin", "Status", "text", {
            width: 140,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              let value = params.value;
              let cls = value == 'Y' ? 'label label-success' : 'label label-danger';
              let text = value == 'Y' ? 'Approve' : 'None';
              return `<span class="${cls}">${text}</span>`;
            }
          }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
        agr.setDisplay(this.data);

        // Add click events using event delegation
        this.$nextTick(() => {
          $(document).off('click', '.btn-open-doc');
          $(document).off('change', '.chk-select-row');

          $(document).on('click', '.btn-open-doc', function(e) {
            e.preventDefault();
            let jobno = $(this).data('jobno');
            let itemno = $(this).data('itemno');
            let rowData = $linq(self.data).where(x => x.job_no == jobno && x.itemno == itemno).firstOrDefault();
            if (rowData) {
              self.queryString(rowData);
            }
          });

          $(document).on('change', '.chk-select-row', function(e) {
            let jobno = $(this).data('jobno');
            let itemno = $(this).data('itemno');
            let rowData = $linq(self.data).where(x => x.job_no == jobno && x.itemno == itemno).firstOrDefault();
            if (rowData) {
              self.rowData.isCheckData = $(this).is(':checked');
            }
          });
        });
      },
    },
    computed: {
      selectedCount() { return (this.data || []).filter(x => x.isCheckData).length },
      connectionCodeData() { return store.state.connectionCodeData },
      requestCodeData() { return store.state.requestCodeData },
      priorityCodeData() { return store.state.priorityCodeData },
      serviceCodeData() { return store.state.serviceCodeData },
      configData() { return store.state.configData },
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = `Check Update List`;
      document.title = page.pageTitle;

      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(15);

      let field_init = $linq(this.fields).where(x => x.search).firstOrDefault() || {};
      this.retrieveSearch.field = field_init.key || '';
      this.retrieveSearch.field_type = field_init.type || 's';

      let sort_init = $linq(this.module).where(x => x == 'All Module').firstOrDefault() || {};
      this.retrieveSearch.module = sort_init || '';

      this.retrieveSearch.approve_status = this.approveStatus[2].value || '';
      
      this.loadRetrieve();

    },
    beforeUnmount() {
      // Clean up event listeners
      $(document).off('click', '.btn-open-doc');
      $(document).off('change', '.chk-select-row');
    }
  };
</script>

<style scoped>
  .mla-page {
    --mla-ink: #101A2B;
    --mla-ink-2: #35435C;
    --mla-muted: #7A879B;
    --mla-line: #E6EAF2;
    --mla-line-2: #D6DEEB;
    --mla-field: #F7F9FC;
    --mla-navy: #02234E;
    --mla-navy-2: #0A3D7A;
    --mla-blue: #1A73E8;
    --mla-blue-soft: #E8F0FE;
    --mla-green: #17864A;
    --mla-green-soft: #E7F5EC;
    --mla-font: 'Manrope', 'Sarabun', sans-serif;
  }

  /* ── Page head ── */
  .mla-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px 14px;
    padding: 11px 16px;
    margin-bottom: 12px;
    border: 1px solid var(--mla-line);
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(16, 26, 43, .05), 0 10px 26px -16px rgba(16, 26, 43, .2);
  }
  .mla-head__title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--mla-font);
  }
  .mla-head__title > i {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-size: 16px;
    color: #fff;
    background: linear-gradient(135deg, var(--mla-navy-2), var(--mla-navy));
    box-shadow: 0 8px 16px -10px rgba(2, 35, 78, .9);
  }
  .mla-head__title b {
    display: block;
    font-size: 15.5px;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: var(--mla-ink);
  }
  .mla-head__title small {
    display: block;
    margin-top: 1px;
    font-size: 11.5px;
    font-weight: 500;
    color: var(--mla-muted);
  }
  .mla-head__right {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .mla-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--mla-line);
    background: var(--mla-field);
    font-family: var(--mla-font);
    font-size: 12px;
    font-weight: 700;
    color: var(--mla-ink-2);
    font-variant-numeric: tabular-nums;
  }
  .mla-chip > i { font-size: 10px; color: var(--mla-muted); }
  .mla-chip--on {
    border-color: #BFE3CD;
    background: var(--mla-green-soft);
    color: var(--mla-green);
  }
  .mla-chip--on > i { color: var(--mla-green); }

  /* ── Filter bar ── */
  .mla-filter {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 10px 12px;
    padding-bottom: 14px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--mla-line);
  }
  .mla-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }
  .mla-field--grow { flex: 1 1 260px; }
  .mla-field--act { margin-left: auto; }
  .mla-field > label {
    margin: 0;
    font-family: var(--mla-font);
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--mla-muted);
  }
  .mla-field select.form-control,
  .mla-field input.form-control {
    height: 36px;
    min-width: 150px;
    padding: 0 11px;
    border: 1px solid var(--mla-line-2);
    border-radius: 10px;
    background-color: var(--mla-field);
    font-family: var(--mla-font);
    font-size: 12.5px;
    font-weight: 600;
    color: var(--mla-ink);
    box-shadow: none;
    transition: border-color .16s ease, background .16s ease, box-shadow .16s ease;
  }
  .mla-field select.form-control { padding-right: 28px; }
  .mla-field select.form-control:focus,
  .mla-field input.form-control:focus {
    border-color: var(--mla-blue);
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, .13);
  }

  .mla-search { position: relative; display: flex; align-items: center; }
  .mla-search__lead {
    position: absolute;
    left: 12px;
    font-size: 11px;
    color: #A2AEC1;
    pointer-events: none;
  }
  .mla-search input.form-control {
    width: 100%;
    padding-left: 31px;
    padding-right: 46px;
  }
  .mla-search__btn {
    position: absolute;
    right: 4px;
    width: 30px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 8px;
    background: var(--mla-navy);
    color: #fff;
    font-size: 11px;
    cursor: pointer;
    transition: background .16s ease;
  }
  .mla-search__btn:hover { background: var(--mla-navy-2); }

  .mla-btn {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    height: 36px;
    padding: 0 16px;
    border: 1px solid transparent;
    border-radius: 10px;
    font-family: var(--mla-font);
    font-size: 12.5px;
    font-weight: 800;
    white-space: nowrap;
    cursor: pointer;
    transition: background .16s ease, box-shadow .2s ease, transform .12s ease;
  }
  .mla-btn > i { font-size: 12px; }
  .mla-btn--main {
    background: linear-gradient(135deg, #17A45C, #0F7A43);
    color: #fff;
    box-shadow: 0 8px 18px -10px rgba(15, 122, 67, .95);
  }
  .mla-btn--main:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px -10px rgba(15, 122, 67, 1);
  }
  .mla-btn--main:active { transform: translateY(0); }
  .mla-btn__n {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba(255, 255, 255, .26);
    font-size: 11px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  /* ── Grid + footer ── */
  .mla-grid {
    border: 1px solid var(--mla-line);
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
  }
  .mla-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 12px;
  }
  .mla-foot__hint {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: var(--mla-font);
    font-size: 11.5px;
    font-weight: 600;
    color: var(--mla-muted);
  }
  .mla-foot__hint > i { font-size: 10px; color: var(--mla-blue); }

  @media (max-width: 991px) {
    .mla-field { flex: 1 1 100%; }
    .mla-field select.form-control,
    .mla-field input.form-control { min-width: 0; }
    .mla-field--act { margin-left: 0; }
    .mla-btn--main { width: 100%; justify-content: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .mla-btn, .mla-field select.form-control, .mla-field input.form-control, .mla-search__btn { transition: none; }
  }

  table {
    border-collapse: unset !important;
  }
</style>
