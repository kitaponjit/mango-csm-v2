<template>
  <div>
    <modal ref="centerModal" sheet-class="ct-sheet">
      <template #header>
        <h4><i class="fa fa-list-alt"></i> {{ ui.erp_work_type || 'Work Type' }}</h4>
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
        <div class="row">
          <div class="col-lg-12 col-md-12 col-sm-12">
            <ag-table ref="agr"
                      :footer="false"
                      @ready="initTable()"
                      @cell-clicked="sendData($event.data)"></ag-table>
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
        retrieveSearch: {},
        respData: [],
      };
    },
    methods: {
      openModal() {
        this.$refs.centerModal.openModal();
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
          let url = `CSM/Center/Worktype_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;

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
          ['itemno', '#', 'text', { width: 70, align: 'center', pinned: 'left' }],
          ['type_code', this.ui.erp_c_code0 || 'Group Code', 'text', { width: 150, sortable: true, pinned: 'left' }],
          ['type_name', this.ui.erp_group_name || 'Group Name', 'text', { width: 300, sortable: true }],
          ['add_user', this.ui.erp_add_user || 'Add User', 'text', { width: 150, align: 'center', sortable: true }],
          ['add_dt', this.ui.erp_add_date || 'Add Date', 'text', {
            width: 170, align: 'center', sortable: true,
            cellRenderer: (params) => params.value ? $xt.formatDate(params.value, 'DD/MM/YYYY HH:mm') : ''
          }],
          ['edit_user', this.ui.erp_edit_user || 'Edit User', 'text', { width: 150, align: 'center', sortable: true }],
          ['edit_dt', this.ui.erp_edit_date || 'Edit Date', 'text', {
            width: 170, align: 'center', sortable: true,
            cellRenderer: (params) => params.value ? $xt.formatDate(params.value, 'DD/MM/YYYY HH:mm') : ''
          }],
        ];

        this.respData.forEach((x, idx) => {
          x.itemno = (idx + 1) + '.';
        });

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
