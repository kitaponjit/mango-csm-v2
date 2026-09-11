<template>
  <div>
    <modal ref="centerModal" sheet-class="ct-sheet">
      <template #header>
        <h4><i class="fas fa-box-open"></i> {{ ui.csm_v2_description || 'Description' }}</h4>
      </template>
      <template #body>
        <div class="modal-search-bar">
          <div class="row">
            <div class="col-lg-4 col-md-6 col-sm-12 col-xs-12">
              <div class="form-group">
                <label><i class="fa fa-search" style="margin-right:4px;"></i>{{ ui.search || 'Search' }}</label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model.trim="desc_text" @keyup.enter="doSearch" />
                  <span class="input-group-btn"><a class="btn btn-sm bg-navy" @click="doSearch"><i class="fa fa-search"></i></a></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <ag-table ref="agr"
                      :footer="false"
                      @ready="initTable()"
                      @cell-clicked="sendData($event.data)"></ag-table>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="pull-left">
          <pagination ref="descPaging" @page-change="onPageChange($event.page)"></pagination>
        </div>
        <button type="button" class="btn btn-sm modal-close-btn" @click="closeModal()">
          <i class="fa fa-times"></i> {{ ui.csm_v2_close_window || 'ปิดหน้าต่าง' }}
        </button>
      </template>
    </modal>
  </div>
</template>

<script type="text/javascript">

let descPaging = {}
export default {
  data(){
    return{
      baseUrl,
      baseRoute,
      queryString,
      ui,
      desc_text:'',
      descriptionData: [],
      descriptionData_sh: []
    }
  },
  methods:{
    onPageChange(pn) {
      pn = pn || 1
      descPaging.setCurrentPage(pn);
      this.descriptionData_sh = $linq(this.descriptionData).skip(descPaging.skipItems()).take(descPaging.getItemsPerPage()).toArray()
      descPaging.createPagesArray()

      this.$nextTick(() => {
        let agr = this.$refs.agr
        if (agr) agr.setDisplay(this.descriptionData_sh)
      })
    },
    async loadDescriptionData() {
      let act = `Anywhere/Master/Description_Readcsm?text=${this.desc_text}`
      let resp = await $xt.getServer(act)
      this.descriptionData = resp.data;

      descPaging.setTotalItems(resp.total ?? 1)

      await this.$nextTick()
      await this.initTable()
      this.onPageChange(1)
    },
    sendData(x) {
      this.$emit("send-data", x);
      this.closeModal();
    },
    openModal() {
      this.$refs.centerModal.openModal();
      this.loadDescriptionData();
    },
    closeModal() {
      this.$refs.centerModal.closeModal();
    },
    doSearch(){
      this.loadDescriptionData()
    },
    initTable() {
      let agr = this.$refs.agr
      if (!agr) return

      let fields = [
        ['descode', this.ui.erp_code || 'Code', 'text', { width: 180, sortable: true, align: 'center', pinned: 'left' }],
        ['desname', this.ui.csm_v2_description || 'Description', 'text', { width: 360, sortable: true }],
        ['desname2', this.ui.erp_remark || 'Remark', 'text', { width: 500, sortable: true }],
      ]

      let header = agr.createHeaderFromArray(fields)
      agr.setHeader(header)
    },
  },
  mounted() {
    descPaging = this.$refs.descPaging
    descPaging.setCurrentPage(1);
    descPaging.setItemsPerPage(15);

    this.$refs.centerModal.setSize('modal-lg');
  }
}

</script>
