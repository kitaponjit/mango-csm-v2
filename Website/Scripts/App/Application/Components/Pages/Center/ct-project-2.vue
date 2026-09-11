<template>
  <div>
    <loading-box ref="myLB"></loading-box>
    <modal ref="centerModal" sheet-class="ct-sheet">
      <template #header>
        <h4><i class="fa fa-search"></i> {{ ui.erp_project_info || 'ข้อมูลโครงการ' }}</h4>
      </template>
      <template #body>
        <div class="modal-search-bar">
          <div class="row">
            <div class="col-md-2">
              <div class="form-group">
                <label><i class="fa fa-folder-open" style="margin-right:4px;"></i>{{ ui.erp_project_type || 'Project Type' }}</label>
                <select class="form-control input-sm" v-model.trim="retrieveSearch['proj_type']" @change="loadData()">
                  <option value="">{{ ui.csm_trn_select_placeholder || '-- Please Select --' }}</option>
                  <option v-for="x in proj_type" :key="x.value" :value="x.value">{{x.name}}</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group">
                <label><i class="fa fa-filter" style="margin-right:4px;"></i>{{ ui.search_by || 'Search By' }}</label>
                <select class="form-control input-sm" v-model.trim="retrieveSearch['search_proj']" @change="loadData()">
                  <option value="">{{ ui.csm_trn_select_placeholder || '-- Please Select --' }}</option>
                  <option value="pre_event">{{ ui.erp_project_no || 'Project No.' }}</option>
                  <option value="refcode">Ref Code</option>
                  <option value="pre_des">{{ ui.erp_project_name || 'Project Name' }}</option>
                  <option value="customer_name">{{ ui.erp_cust_name || 'Customer Name' }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label><i class="fa fa-search" style="margin-right:4px;"></i>{{ ui.search || 'Search' }}</label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model.trim="retrieveSearch['search_text']" @keyup.enter="pageChange(1)" />
                  <span class="input-group-btn"><a class="btn btn-sm bg-navy" @click="loadData()"><i class="fa fa-search"></i></a></span>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-2 col-sm-2">
              <div class="d-flex margin-t-25">
                <div class="form-check form-switch form-check-custom form-check-solid me-5">
                  <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="retrieveSearch['projrunno']" @change="loadData()" />
                  <label class="form-check-label">Project Contract Only</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="pj-toolbar">
          <div class="pj-view-toggle">
            <button type="button" class="pj-view-btn" :class="{'pj-view-btn--active': viewMode === 'table'}" @click="viewMode = 'table'" title="Table View">
              <i class="fas fa-th-list"></i> <span>{{ ui.erp_table || 'Table' }}</span>
            </button>
            <button type="button" class="pj-view-btn" :class="{'pj-view-btn--active': viewMode === 'card'}" @click="viewMode = 'card'" title="Card View">
              <i class="fas fa-th-large"></i> <span>Card</span>
            </button>
          </div>
        </div>
        <div class="row" v-show="viewMode === 'table'">
          <div class="col-md-12">
            <ag-table ref="agr"
                      :footer="false"
                      @ready="initTable()"
                      @cell-clicked="sendData($event.data)"
                      @on-sort-changed="onGridSortChanged($event)"></ag-table>
          </div>
        </div>
        <div class="pj-project-card-grid" v-show="viewMode === 'card'">
          <div class="pj-project-card"
               v-for="x in respData"
               :key="x.pre_event"
               :class="{'pj-project-card--bold': x.bold}"
               @click="sendData(x)">
            <div class="pj-project-card-avatar"><i class="fas fa-project-diagram"></i></div>
            <div class="pj-project-card-body">
              <div class="pj-project-card-top">
                <span class="pj-project-card-no">{{x.pre_event}}</span>
                <span v-if="x.clo == 'Y'" class="pj-project-card-badge pj-badge-closed">Closed</span>
              </div>
              <div class="pj-project-card-sub" :title="x.pre_des">{{x.pre_des}}</div>
              <div class="pj-project-card-meta">
                <span v-if="x.refcode"><i class="fas fa-hashtag"></i>{{x.refcode}}</span>
                <span v-if="x.customer_name"><i class="fas fa-building"></i>{{x.customer_name}}</span>
                <span v-if="is_mango() && x.warranty == 'Y'" class="pj-meta-success"><i class="fas fa-shield-alt"></i>{{ ui.erp_warranty || 'Warranty' }}</span>
                <span v-if="is_mango() && x.ma == 'Y'" class="pj-meta-success"><i class="fas fa-file-contract"></i>{{ ui.erp_ma || 'MA' }}</span>
              </div>
            </div>
          </div>
          <div v-if="!respData || respData.length === 0" class="pj-project-card-empty">
            <i class="fas fa-folder-open"></i>
            <span>{{ ui.erp_data_not_found || 'ไม่พบข้อมูล' }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="pull-left" style="display:flex; align-items:center; gap:10px;">
          <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
          <span class="result-count-badge"><i class="fa fa-list-ul"></i> พบ <b>{{totalCount}}</b> {{ ui.csm_remain_unit_item || 'รายการ' }}</span>
        </div>
        <button type="button" class="btn btn-sm modal-close-btn" @click="closeModal()">
          <i class="fa fa-times"></i> {{ ui.csm_v2_close_window || 'ปิดหน้าต่าง' }}
        </button>
      </template>
    </modal>
  </div>
</template>

<script type="text/javascript">
  import loadingBox from "../../Center/loading-box.vue"
  
  let paging = {}
  export default {
    components: {
      loadingBox
    },
    props: {
      chk_code: {
        type: String,
        default: "N"
      },
      is_mango: {
        type: Function,
        default: () => true
      }
    },
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui,
        retrieveSearch: {},
        proj_type: [
          { value: "1", name: window.ui.erp_trading || "Trading" },
          { value: "2", name: window.ui.erp_construction || "Construction" },
          { value: "3", name: window.ui.erp_real_estate || "Real Estate" },
        ],
        respData: [],
        search_proj: [
          { value: "1", name: window.ui.erp_project_no || "Project No." },
          { value: "2", name: "Ref Code" },
          { value: "3", name: window.ui.erp_project_name || "Project Name" },
          { value: "4", name: window.ui.erp_customer || "Customer" },
        ],
        sort_key: '',
        sort_type: 'asc',
        totalCount: 0,
        viewMode: 'table',
      }
    },
    methods: {
      openModal() {
        this.$refs.centerModal.openModal();
        this.loadData();
      },
      closeModal() {
        this.respData = [];
        this.retrieveSearch = {}
        this.$refs.centerModal.closeModal();
      },
      pageChange(pn) {
        paging.setCurrentPage(pn);
        this.loadData();
      },
      loadData() {
        (async () => {
          if (this.$refs.myLB) this.$refs.myLB.show()
          try {
            let url = `CSM/Center/Project_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}&chk_code=${this.chk_code}`

            for (var key in this.retrieveSearch) {
              url += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`
            }

            if (this.sort_key) {
              url += `&sort_key=${encodeURIComponent(this.sort_key)}&sort_type=${encodeURIComponent(this.sort_type)}`;
            }

            let resp = await $xt.getServer(url)
            this.respData = resp.data.data_rows
            this.respData.forEach(x => { x.bold = x.projrunno == 0 })
            this.totalCount = resp.data.total

            paging.setTotalItems(resp.data.total)
            if (!paging.getItemsPerPage()) {
              paging.setCurrentPage(1)
            }
            paging.createPagesArray()

            await this.$nextTick()
            await this.initTable()
            this.$refs.agr.setDisplay(this.respData)
          } finally {
            if (this.$refs.myLB) this.$refs.myLB.hide()
          }
        })()
      },
      sendData(x) {
        this.$emit("send-data", x)
        this.closeModal()
      },
      statusName(value) {
        return value == 'Y' ? (this.ui.erp_yes || "Yes") : (this.ui.erp_no_label || "No")
      },
      statusClass(status) {
        return status == 'Y' ? 'text-success' : 'text-danger'
      },
      onGridSortChanged(e) {
        let model = (e.model || [])[0]
        this.sort_key = model ? model.colId : ''
        this.sort_type = model ? model.sort : 'asc'
        this.pageChange(1)
      },
      initTable() {
        let agr = this.$refs.agr
        if (!agr) return

        let bold_style = (p) => ({ 'font-weight': p?.data?.projrunno == 0 ? 'bold' : 'normal' })

        let fields = [
          ['pre_event', 'Project No', 'text', { width: 200, sortable: true, pinned: 'left', cellStyle: bold_style }],
          ['refcode', 'Ref.Code', 'text', { width: 200, sortable: true, cellStyle: bold_style }],
          ['pre_des', this.ui.erp_project_name || 'Project Name', 'text', {
            width: 420, sortable: true,
            cellStyle: bold_style,
            cellRenderer: (params) => {
              let x = params.data || {}
              let wrapper = document.createElement('div')
              wrapper.style.cssText = 'display:flex; justify-content:space-between; align-items:center; width:100%;'

              let name = document.createElement('span')
              name.textContent = x.pre_des || ''
              wrapper.appendChild(name)

              if (x.clo == 'Y') {
                let closed = document.createElement('span')
                closed.className = 'text-danger'
                closed.style.fontWeight = 'bold'
                closed.textContent = '(Closed)'
                wrapper.appendChild(closed)
              }

              return wrapper
            }
          }],
          ['customer_name', this.ui.erp_customer || 'Customer', 'text', { width: 300, sortable: true, cellStyle: bold_style }],
        ]

        if (this.is_mango()) {
          fields.push(
            ['warranty', this.ui.erp_warranty || 'Warranty', 'text', {
              width: 130, align: 'center',
              cellStyle: bold_style,
              cellRenderer: (params) => params.value == 'Y' ? '<i class="fa fa-check text-success"></i>' : ''
            }],
            ['ma', this.ui.erp_ma || 'MA', 'text', {
              width: 130, align: 'center',
              cellStyle: bold_style,
              cellRenderer: (params) => params.value == 'Y' ? '<i class="fa fa-check text-success"></i>' : ''
            }]
          )
        }

        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)
      },
    },
    mounted() {
      paging = this.$refs.paging
      paging.setCurrentPage(1)
      paging.setItemsPerPage(500)

      this.$set(this.retrieveSearch, "proj_type", "")
      this.$set(this.retrieveSearch, "search_proj", "")

      this.$refs.centerModal.setSize('modal-xl')
    }
  }
</script>

<style scoped>
  .pj-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }

  .pj-view-toggle {
    display: flex;
    align-items: center;
    background: #e8ecf2;
    border-radius: 8px;
    padding: 3px;
    gap: 2px;
  }

  .pj-view-btn {
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

  .pj-view-btn i {
    font-size: 12px;
  }

  .pj-view-btn:hover {
    color: #3d4a5c;
    background: rgba(255,255,255,.5);
  }

  .pj-view-btn--active {
    color: #1e3a5f;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,.08);
    font-weight: 600;
  }

  .pj-view-btn--active:hover {
    background: #fff;
    color: #1e3a5f;
  }

  .pj-project-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 8px;
    padding: 2px 0;
    max-height: 480px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #d0d5dd transparent;
  }

  .pj-project-card-grid::-webkit-scrollbar {
    width: 5px;
  }

  .pj-project-card-grid::-webkit-scrollbar-thumb {
    background: #d0d5dd;
    border-radius: 3px;
  }

  .pj-project-card-grid::-webkit-scrollbar-track {
    background: transparent;
  }

  .pj-project-card {
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

  .pj-project-card:hover {
    border-color: #b8d4f0;
    background: #f6faff;
    box-shadow: 0 2px 12px rgba(60,141,188,.1);
    transform: translateY(-1px);
  }

  .pj-project-card--bold .pj-project-card-no {
    font-weight: 800;
  }

  .pj-project-card-avatar {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #1e3a5f 0%, #02234e 100%);
    color: #fff;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pj-project-card-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pj-project-card-top {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .pj-project-card-no {
    font-size: 12.5px;
    font-weight: 600;
    color: #1f2937;
  }

  .pj-project-card-badge {
    flex-shrink: 0;
    font-size: 9.5px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 6px;
    letter-spacing: 0.02em;
  }

  .pj-badge-closed {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  .pj-project-card-sub {
    font-size: 12px;
    color: #3d4a5c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pj-project-card-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 10px;
    font-size: 10.5px;
    color: #8b95a5;
    line-height: 1.2;
    margin-top: 1px;
  }

  .pj-project-card-meta i {
    font-size: 9px;
    margin-right: 3px;
    opacity: 0.6;
  }

  .pj-meta-success {
    color: #00a65a;
  }

  .pj-project-card-empty {
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

  .pj-project-card-empty i {
    font-size: 28px;
    opacity: 0.35;
  }
</style>
