<template>
  <div>
    <modal ref="centerModal" sheet-class="ct-sheet">
      <template #header>
        <h4><i class="fa fa-cubes"></i> ข้อมูลรายการสินค้าหรือวัสดุอุปกรณ์</h4>
      </template>
      <template #body>
        <div class="modal-search-bar">
          <div class="row">
            <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
              <div class="form-group">
                <label><i class="fa fa-search" style="margin-right:4px;"></i>{{ ui.search || 'ค้นหา' }}</label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model.trim="retrieveSearch['search_text']" @keyup.enter="pageChange(1)" />
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
          <div class="item-card" v-for="x in respData" :key="x.type_code" @click="sendData(x)">
            <div class="item-card-avatar"><i class="fas fa-cube"></i></div>
            <div class="item-card-body">
              <div class="item-card-top">
                <span class="item-card-code">{{x.type_code}}</span>
                <span class="item-card-badge" v-if="x.unitname">{{x.unitname}}</span>
              </div>
              <div class="item-card-sub" :title="x.c_des1">{{x.c_des1}}</div>
              <div class="item-card-meta">
                <span v-if="x.c_des"><i class="fas fa-layer-group"></i>{{x.c_des}}</span>
                <span v-if="x.c_des2"><i class="fas fa-ruler-combined"></i>{{x.c_des2}}</span>
                <span v-if="x.c_des3"><i class="fas fa-tag"></i>{{x.c_des3}}</span>
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
        <div class="pull-left">
          <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
        </div>
        <button type="button" class="btn btn-sm modal-close-btn" @click="closeModal()">
          <i class="fa fa-times"></i> {{ui.close}}
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
          search_text: "",
        },
        respData: [],
        viewMode: 'table',
      };
    },
    methods: {
      openModal() {
        this.$refs.centerModal.openModal();
        this.retrieveSearch.search_text = "";
        this.loadData();
      },
      closeModal() {
        this.$refs.centerModal.closeModal();
      },
      pageChange(pn) {
        (async () => {
          paging.setCurrentPage(pn);
          await this.loadData();
        })();
      },
      loadData() {
        (async () => {
          let url = `CSM/Center/Material_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;

          for (var key in this.retrieveSearch) {
            url += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`;
          }

          let resp = await $xt.getServer(url);
          this.respData = resp.data.data_rows;

          paging.setTotalItems(resp.data.total);
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
          ['type_code', this.ui.erp_mat_code || 'Material Code', 'text', { width: 200, sortable: true, pinned: 'left', cellStyle: { 'font-weight': 'bold' } }],
          ['c_des', this.ui.erp_material_group || 'Material Group', 'text', { width: 200, sortable: true }],
          ['c_des1', this.ui.erp_mat_name || 'Material Name', 'text', { width: 320, sortable: true }],
          ['c_des2', this.ui.erp_mas_product_spec_size || 'Spec/Size', 'text', { width: 220, sortable: true }],
          ['c_des3', this.ui.erp_brand || 'Brand', 'text', { width: 220, sortable: true }],
          ['unitname', this.ui.erp_unit || 'Unit', 'text', { width: 140, align: 'center', sortable: true }],
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
    justify-content: space-between;
    gap: 6px;
  }

  .item-card-code {
    font-size: 12.5px;
    font-weight: 700;
    color: #1f2937;
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
