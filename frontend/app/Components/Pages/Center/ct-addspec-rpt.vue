<template>
  <div>
    <modal ref="centerModal" sheet-class="ct-sheet">
      <template #header>
        <h4><i class="fa fa-puzzle-piece"></i> Addspec</h4>
      </template>
      <template #body>
        <div class="modal-search-bar">
          <div class="row">
            <div class="col-lg-2 col-md-4">
              <div class="form-group">
                <label>{{ ui.erp_module || 'Module' }}</label>
                <select class="form-control input-sm" v-model.trim="retrieveSearch['module']" @change="loadData()">
                  <option value="">{{ ui.erp_all || 'ALL' }}</option>
                        <option v-for="x in module" :key="x.module_code" :value="x.module_code">{{ x.module_name }}</option>
                </select>
              </div>
            </div>
            <div class="col-lg-2 col-md-3">
              <div class="form-group">
                <label>{{ ui.search_by || 'Search By' }}</label>
                <select class="form-control input-sm" v-model="retrieveSearch['field']" @change="loadData()">
                  <option value="object_name">{{ ui.erp_name || 'Name' }}</option>
                  <option value="t_object_name">{{ ui.erp_type || 'Type' }}</option>
                  <option value="remark">{{ ui.csm_v2_description || 'Description' }}</option>
                </select>
              </div>
            </div>
            <div class="col-lg-4 col-md-3">
              <div class="form-group">
                <label><i class="fa fa-search" style="margin-right:4px;"></i>{{ ui.search || 'Search' }}</label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model.trim="retrieveSearch['text']" @keyup.enter="onSearch" />
                  <span class="input-group-btn"><a class="btn btn-sm btn-default" @click="onSearch"><i class="fa fa-search"></i></a></span>
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
          <div class="col-md-12">
            <ag-table ref="agr"
                      :footer="false"
                      @ready="initTable()"
                      @cell-clicked="sendData($event.data)"></ag-table>
          </div>
        </div>
        <div class="card-grid" v-show="viewMode === 'card'">
          <div class="item-card" v-for="x in displayData" :key="x.itemno" @click="sendData(x)">
            <div class="item-card-body">
              <div class="item-card-top">
                <span class="item-card-title">{{x.object_name}}</span>
                <span class="item-card-badge">{{objectType(x.object_type)}}</span>
              </div>
              <div class="item-card-sub">
                <span class="item-card-code">{{x.module}}</span>
              </div>
              <div class="item-card-meta" v-if="x.remark">
                <span :title="x.remark">{{x.remark}}</span>
              </div>
            </div>
          </div>
          <div v-if="!displayData || displayData.length === 0" class="card-empty">
            <i class="fas fa-inbox"></i>
            <span>{{ ui.erp_data_not_found || 'ไม่พบข้อมูล' }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="pull-left">
          <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
        </div>
        <button type="button" class="btn btn-sm modal-close-btn" @click="closeModal()">
          <i class="fa fa-times"></i> {{ ui.csm_v2_close_window || 'ปิดหน้าต่าง' }}
        </button>
      </template>
    </modal>
  </div>
</template>

<script type="text/javascript">
  let paging = {}
  export default {
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui,
        retrieveSearch: {
          text: '',
          module: '',
          field: 'object_name'
        },
        displayData: [],
        module: [],
        pageNumber: 1,
        displayData2: [],
        viewMode: 'table',
      };
    },
    methods: {
      async openModal() {
        this.retrieveSearch.module = ''
        this.retrieveSearch.text = ''
        this.retrieveSearch.field = 'object_name'

        this.$refs.centerModal.openModal();
        this.retrieveSearch.text = "";
        await this.loadData();
      },
      closeModal() {
        this.$refs.centerModal.closeModal();
      },
      onSearch() {
        // เมื่อค้นหาใหม่ ให้กลับไปหน้า 1 เสมอ
        paging.setCurrentPage(1);
        this.loadData();
      },
      pageChange(pn) {
        pn = pn || 1
        this.pageNumber = pn
        paging.setCurrentPage(pn)
        this.displayData = $linq(this.displayData2).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray()
        paging.createPagesArray()
        this.refreshGrid()
      },
      async loadData() {
        try {
          let modulex = this.retrieveSearch['module'];
          let text = this.retrieveSearch['text'];
          let field = this.retrieveSearch['field'];
          let url = `AnywhereAPI/Master/Addspec_Object_ReadList?module=${modulex}&field=${field}&text=${text}`;

          let resp = await $xt.getServer(url);
          this.displayData2 = resp.data || [];

          this.displayData2.forEach((x, idx) => {
            x.itemno = idx + 1;
          });

          paging.setTotalItems(resp.total);
          this.pageChange(this.pageNumber)
          if (!paging.getItemsPerPage()) {
            paging.setCurrentPage(1);
          }
          paging.createPagesArray();

          await this.$nextTick();
          await this.initTable();

        } catch (error) {
          console.error("Load Data Error: ", error);
          this.displayData2 = [];
        }
      },
      sendData(x) {
        this.$emit("send-data", x);
        this.closeModal();
      },
      objectType(type) {
        let d = ""
        switch (type) {
          case "T": d = "Transaction"
            break
          case "M": d = "Master"
            break
          case "F": d = "Form"
            break
          case "R": d = "Report"
            break
          case "F2": d = "Function"
            break
          case "P": d = "Popup"
            break
          case "O": d = "Other"
            break
        }
        return d
      },
      refreshGrid() {
        this.$nextTick(() => {
          let agr = this.$refs.agr
          if (agr) agr.setDisplay(this.displayData)
        })
      },
      initTable() {
        let agr = this.$refs.agr
        if (!agr) return
        let self = this

        let fields = [
          ['itemno', this.ui.erp_no || 'No.', 'text', { width: 70, align: 'center', pinned: 'left' }],
          ['module', this.ui.erp_module || 'Module', 'text', { width: 160 }],
          ['object_name', this.ui.erp_name || 'Name', 'text', { width: 280 }],
          ['object_type', this.ui.erp_type || 'Type', 'text', { width: 160, cellRenderer: (params) => self.objectType(params.value) }],
          ['remark', this.ui.csm_v2_description || 'Description', 'text', { width: 340 }],
        ]

        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)
      },
      async LoadModale(){
        let rsp = await $xt.getServer('CSM/Center/ModuleData')
        this.module = rsp.data || []
      },
    },
    mounted() {
      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(100);

      this.LoadModale();
      this.$refs.centerModal.setSize('modal-md');
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
    font-size: 11px;
    color: #3c8dbc;
    font-weight: 600;
  }

  .item-card-meta {
    font-size: 10.5px;
    color: #8b95a5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 2px;
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
