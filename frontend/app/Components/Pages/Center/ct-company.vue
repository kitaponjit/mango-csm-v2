<template>
  <div>
    <modal ref="centerModal" sheet-class="ct-sheet">
      <template #header>
        <h4><i class="fas fa-folder-open"></i> {{ state.ui.erp_select_company || 'Select Company' }}</h4>
      </template>
      <template #body>
        <!-- Company : Search -->
        <div class="modal-search-bar">
          <div class="row">
            <div class="col-md-2">
              <div class="form-group">
                <label v-text="state.ui.search_by || 'Search By'"></label>
                <select class="form-control input-sm" v-model.trim="state.retrieveSearch.field">
                  <option value="maincode">{{ state.ui.erp_code || 'Code' }}</option>
                  <option value="mainname">Company Name (TH)</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label><i class="fa fa-search" style="margin-right:4px;"></i><span v-text="state.ui.search || 'ค้นหา'"></span></label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model.trim="state.retrieveSearch.text" @keyup.enter="loadData()" />
                  <span class="input-group-btn"><a class="btn btn-sm bg-navy" @click="loadData()"><i class="fa fa-search"></i></a></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="view-toolbar">
          <div class="view-toggle">
            <button type="button" class="view-btn" :class="{'view-btn--active': state.viewMode === 'table'}" @click="state.viewMode = 'table'" title="Table View">
              <i class="fas fa-th-list"></i> <span>{{ state.ui.erp_table || 'Table' }}</span>
            </button>
            <button type="button" class="view-btn" :class="{'view-btn--active': state.viewMode === 'card'}" @click="state.viewMode = 'card'" title="Card View">
              <i class="fas fa-th-large"></i> <span>Card</span>
            </button>
          </div>
        </div>
        <!-- Company : List -->
        <div class="row" v-show="state.viewMode === 'table'">
          <div class="col-md-12">
            <ag-table ref="agr"
                      :footer="false"
                      :sorting="true"
                      @ready="initTable()"
                      @cell-clicked="holdData($event.data, 0)"
                      @double-cell-clicked="sendData($event.data)">
            </ag-table>
          </div>
        </div>
        <div class="card-grid" v-show="state.viewMode === 'card'">
          <div class="item-card"
               v-for="x in state.respData"
               :key="x.maincode"
               :class="{'item-card--selected': state.selectedData && state.selectedData.maincode === x.maincode}"
               @click="holdData(x, 0)"
               @dblclick="sendData(x)">
            <div class="item-card-avatar"><i class="fas fa-building"></i></div>
            <div class="item-card-body">
              <div class="item-card-top">
                <span class="item-card-code">{{x.maincode}}</span>
              </div>
              <div class="item-card-sub" :title="x.mainname">{{x.mainname}}</div>
              <div class="item-card-meta">
                <span v-if="x.maintel"><i class="fas fa-phone"></i>{{x.maintel}}</span>
                <span v-if="x.mainadr1"><i class="fas fa-map-marker-alt"></i>{{x.mainadr1}}</span>
              </div>
            </div>
          </div>
          <div v-if="!state.respData || state.respData.length === 0" class="card-empty">
            <i class="fas fa-inbox"></i>
            <span>{{ state.ui.erp_no_data || 'No data' }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="pull-left">
          <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
          <button class="btn btn-sm bg-olive" @click="$refs.agr.exportExcel()"><i class="fas fa-cloud-download-alt"></i> {{ state.ui.erp_export_excel || 'Export Excel' }}</button>
          <button class="btn btn-sm btn-facebook" @click="$refs.agr.printPDF()"><i class="fas fa-print"></i> {{ state.ui.erp_print_pdf || 'Print PDF' }}</button>
        </div>
        <button type="button" class="btn btn-sm bg-olive" @click="sendData()"><i class="fas fa-check-circle"></i> <span v-text="state.ui.select || 'Select'"></span></button>
      </template>
    </modal>
  </div>
</template>

<script type="text/javascript">
  import { ref, reactive, computed, onMounted } from 'vue'
  let paging = {}
  export default {
    setup(props, { emit }) {
      // Vue 3's setup context has no `refs` (Vue 2's composition-api plugin had
      // one), so every `refs.x` below threw "Cannot read properties of undefined".
      // The template refs are declared here and returned under their template
      // names; `refs` reads them, so the code below is unchanged.
      const centerModal = ref(null)
      const agr = ref(null)
      const pagingRef = ref(null)
      const refs = {
        get centerModal() { return centerModal.value },
        get agr() { return agr.value },
        get paging() { return pagingRef.value }
      }

      /* Setup : State */
      var state = reactive({
        baseUrl,
        baseRoute,
        queryString,
        ui,
        retrieveSearch: {},
        respData: [],
        displayData: [],
        selectedData: {},
        pageNumber: 1,
        servicePath: null,
        viewMode: 'table',
      })

      /* Setup : Methods */
      let openModal = async (ctx) => {
        refs.centerModal.openModal()

        state.servicePath = ctx?.servicePath || null
        state.retrieveSearch = { text: '' }
        state.retrieveSearch = { field: 'maincode' }

        state.selectedData = {}

        initTable()

        await loadData()
      }

      let closeModal = () => {
        refs.centerModal.closeModal()
      }

      let loadData = async () => {
        console.log(state.servicePath,"state.servicePath");

        try {
          const formData = {
            form:
            {
                ServicePath: state.servicePath ?? "",
                ServiceEvent: "GetCompanies",
                ServiceName: "LoginCompanies",
            },
          };

          let url = "CSM/Gateway/Dispath";
          let resp = await $xt.postServerJson(url, formData);

          let response = resp?.data || {};

          let agr = refs.agr
          let detail = response?.data;

          state.respData = detail || []

          /* Display : Reformat Grid */
          initTable()

          /* Display : Header */
          agr.setDisplay(detail)
        }
        catch (e){
          console.log(e,"e");

        }
      }

      let pageChange = (pn) => {
        pn = pn || 1
        state.pageNumber = pn
        paging.setCurrentPage(pn)
        state.displayData = $linq(state.respData).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray()
        paging.createPagesArray()
      }

      let holdData = (x, idx) => {
        state.selectedData = x
      }

      let sendData = () => {
        emit('send-data', state.selectedData)
        closeModal()
      }

      let initTable = () => {
        let agr = refs.agr

        let fields = [
          ['maincode', ui.erp_code || 'Code', 'text', { width: 120, pinned: 'left' }],
          ['mainname', 'Company Name (TH)', 'text', { width: 400 }],
          ['engname', 'Company Name (EN)', 'text', { width: 400 }],
          ['mainadr1', ui.erp_address1 || 'Address (1)', 'text', { width: 400 }],
          ['mainadr2', ui.erp_address2 || 'Address (2)', 'text', { width: 400 }],
          ['mainpost', ui.erp_post_code || 'Post Code', 'text', { width: 150 }],
          ['maintel', ui.erp_tel || 'Tel.', 'text', { width: 150 }],
          ['mainfax', ui.erp_fax || 'Fax', 'text', { width: 150 }],
          ['maintaxid', 'Tax ID.', 'text', { width: 150 }],
        ]

        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)
      }

      /* Setup : Document Ready */
      onMounted(() => {
        paging = refs.paging
        paging.setCurrentPage(1)
        paging.setItemsPerPage(10)

        refs.centerModal.setSize('modal-lg-2')
      })

      return {
        centerModal,
        agr,
        paging: pagingRef,
        /* Return : State */
        state,
        /* Return : Methods */
        openModal,
        closeModal,
        loadData,
        pageChange,
        holdData,
        sendData,
        initTable
      }
    }
  }
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

  .item-card--selected {
    border-color: #3c8dbc;
    background: #f0f7fd;
    box-shadow: inset 0 0 0 1px #3c8dbc;
  }

  .item-card-avatar {
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
    gap: 6px;
  }

  .item-card-code {
    font-size: 12.5px;
    font-weight: 700;
    color: #1f2937;
  }

  .item-card-sub {
    font-size: 12px;
    color: #3d4a5c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-card-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 10px;
    font-size: 10.5px;
    color: #8b95a5;
    line-height: 1.2;
    margin-top: 2px;
  }

  .item-card-meta i {
    font-size: 9px;
    margin-right: 3px;
    opacity: 0.6;
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
