<template>
  <div>
    <modal ref="centerModal" sheet-class="ct-sheet">
      <template #header>
        <h4><i class="fa fa-user-o"></i> Employeeddddasa</h4>
      </template>
      <template #body>
        <div class="modal-search-bar">
          <div class="row">
            <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
              <div class="form-group">
                <label><i class="fa fa-search" style="margin-right:4px;"></i>{{ ui.search || 'Search' }}</label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model.trim="retrieveSearch['search_text']" @keyup.enter="loadData" />
                  <span class="input-group-btn"><a class="btn btn-sm btn-default" @click="loadData"><i class="fa fa-search"></i></a></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="view-toolbar">
          <div class="view-toggle">
            <button type="button" class="view-btn" :class="{'view-btn--active': viewMode === 'table'}" @click="viewMode = 'table'" title="Table View">
              <i class="fas fa-th-list"></i> <span>{{ ui.erp_table || 'Table' }}</span>
            </button>
            <button type="button" class="view-btn" :class="{'view-btn--active': viewMode === 'card'}" @click="viewMode = 'card'" title="Card View">
              <i class="fas fa-th-large"></i> <span>Card</span>
            </button>
          </div>
        </div>
        <div class="row" v-show="viewMode === 'table'">
          <div class="col-lg-12 col-md-12 col-sm-12">
            <ag-table ref="agr"
                      :footer="false"
                      @ready="initTable()"
                      @cell-clicked="sendData($event.data)"></ag-table>
          </div>
        </div>
        <div class="card-grid" v-show="viewMode === 'card'">
          <div class="item-card" v-for="x in respData" :key="x.empcode" @click="sendData(x)">
            <div class="item-card-avatar"><i class="fas fa-user"></i></div>
            <div class="item-card-body">
              <div class="item-card-top">
                <span class="item-card-title">{{x.empfullname}}</span>
                <span class="item-card-badge">{{ x.respon_type == 'W' ? (ui.csm_trn_worker || 'Worker') : (ui.csm_trn_checker || 'Checker') }}</span>
              </div>
              <div class="item-card-sub">
                <span class="item-card-code">{{x.empcode}}</span>
                <span v-if="x.pre_des" class="item-card-pos">{{x.pre_des}}</span>
              </div>
            </div>
          </div>
          <div v-if="!respData || respData.length === 0" class="card-empty">
            <i class="fas fa-inbox"></i>
            <span>{{ ui.erp_data_not_found || 'ไม่พบข้อมูล' }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div style="display:flex; align-items:center; justify-content:flex-end; gap:10px; width:100%;">
          <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
          <button type="button" class="btn btn-sm modal-close-btn" @click="closeModal()">
            <i class="fa fa-times"></i> {{ui.close}}
          </button>
        </div>
      </template>
    </modal>
  </div>
</template>

<script type="text/javascript">
  let paging = {}
  export default {
    props: [
      'pre_event'
    ],
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui,
        retrieveSearch: {
          search_text: "",
        },
        respData: [],
        respon_type: "",
        viewMode: 'table',
      };
    },
    methods: {
      openModal(respon_type) {
        this.respon_type = respon_type;
        this.$refs.centerModal.openModal();
        this.loadData();
      },
      closeModal() {
        this.$refs.centerModal.closeModal();
      },
      pageChange(pn) {
        paging.setCurrentPage(pn);
        this.loadData();
      },
      loadData() {
        (async () => {
          let url = `CSM/MASTER/ProjectWorker_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;

          for (var key in this.retrieveSearch) {
            url += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`;
          }

          let resp = await $xt.getServer(url);
          this.respData = $linq(resp.data.data_rows).where(w => w.respon_type == this.respon_type && w.pre_event == this.pre_event).toArray();
          console.log(' this.respData ', this.respData.length)
          paging.setTotalItems(this.respData.length)
          if (!paging.getItemsPerPage()) {
            paging.setCurrentPage(1);
          }
          paging.createPagesArray();

          await this.$nextTick();
          await this.initTable();
          this.$refs.agr.setDisplay(this.respData);
        })();
      },
      sendData(x) {
        this.$emit("send-data", x);
        this.closeModal();
      },
      initTable() {
        let agr = this.$refs.agr;
        if (!agr) return;

        let fields = [
          ['empcode', this.ui.erp_employee_code || 'Employee Code', 'text', { width: 220, sortable: true, align: 'center', pinned: 'left' }],
          ['empfullname', this.ui.erp_employee_name || 'Employee Name', 'text', { width: 300, sortable: true }],
          ['pre_des', 'Project Contact', 'text', { width: 300, sortable: true }],
          ['respon_type', this.ui.erp_position || 'Position', 'text', {
            width: 200, align: 'center', sortable: true,
            cellRenderer: (params) => params.value == 'W' ? (this.ui.csm_trn_worker || 'Worker') : (this.ui.csm_trn_checker || 'Checker')
          }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
      },
    },
    mounted() {
      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(10);

      this.$refs.centerModal.setSize('modal-lg-2');
    }
  };
</script>

<style scoped>
  .view-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }

  .view-toggle {
    display: flex;
    align-items: center;
    background: #e8ecf2;
    border-radius: 8px;
    padding: 3px;
    gap: 2px;
  }

  .view-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    font-size: 11.5px;
    font-weight: 500;
    color: #6b7a90;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(.4,0,.2,1);
    outline: none;
    white-space: nowrap;
  }

  .view-btn i {
    font-size: 12px;
  }

  .view-btn:hover {
    color: #3d4a5c;
    background: rgba(255,255,255,.5);
  }

  .view-btn--active {
    color: #1e3a5f;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,.08);
    font-weight: 600;
  }

  .view-btn--active:hover {
    background: #fff;
    color: #1e3a5f;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 8px;
    padding: 2px 0;
    max-height: 420px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #d0d5dd transparent;
  }

  .card-grid::-webkit-scrollbar {
    width: 5px;
  }

  .card-grid::-webkit-scrollbar-thumb {
    background: #d0d5dd;
    border-radius: 3px;
  }

  .card-grid::-webkit-scrollbar-track {
    background: transparent;
  }

  .item-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid #edf0f5;
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
  }

  .item-card:hover {
    border-color: #b8d4f0;
    background: #f6faff;
    box-shadow: 0 2px 12px rgba(60,141,188,.1);
    transform: translateY(-1px);
  }

  .item-card-avatar {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    color: #1976d2;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item-card-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .item-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }

  .item-card-title {
    font-size: 12.5px;
    font-weight: 600;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-card-badge {
    flex-shrink: 0;
    font-size: 9.5px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 6px;
    background: #f0f4fa;
    color: #4a6180;
    border: 1px solid #e2e9f2;
    white-space: nowrap;
  }

  .item-card-sub {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #6b7a90;
  }

  .item-card-code {
    font-weight: 600;
    color: #3c8dbc;
  }

  .item-card-pos {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-card-pos::before {
    content: '·';
    margin-right: 6px;
    color: #d0d5dd;
  }

  .card-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 20px;
    color: #b0bcc8;
    font-size: 13px;
    grid-column: 1 / -1;
  }

  .card-empty i {
    font-size: 28px;
    opacity: 0.35;
  }
</style>
