<template>
  <div class="modal fade"  ref="descriptionModal">
    <div :class=" resize ? 'modal-dialog modal-lg' : 'modal-dialog'">
      <div class="modal-content">
        <div class="modal-header">
          <h4><i class="fas fa-box-open"></i>Description</h4>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-lg-4 col-md-12 col-sm-12">
              <div class="form-group">
                <label>Search</label>
                <div class="input-group">
                  <input type="text" class="form-control input-sm" v-model.trim="desc_text" @keyup.enter="doSearch" />
                  <span class="input-group-btn"><a class="btn btn-sm bg-navy" @click="doSearch"><i class="fa fa-search"></i></a></span>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <div class="table-responsive">
                <table class="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th class="tf-3">Code</th>
                      <th>Description</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="pointer"
                        v-for="(x,idx) in descriptionData_sh"
                        @click="sendData(x)">
                      <td class="text-center no-wrap text-nowrap" nowrap>{{x.descode}}</td>
                      <td>{{x.desname}}</td>
                      <td>{{x.desname2}}</td>
                    </tr>
                    <tr>
                      <td class="text-center" v-if="descriptionData.length == 0" colspan="2">{{ ui.csm_v2_no_items }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <pagination class="pull-left" ref="descPaging" @page-change="onPageChange($event.page)"></pagination>
          <button type="button" class="btn btn-sm btn-danger" data-dismiss="modal"><i class="fa fa-remove"></i> {{ ui.csm_v2_close_window }}</button>
        </div>
      </div>
    </div>
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
      descriptionData_sh: [],
      isSmallScreen: true,
      resize: false 
    }
  },
  methods:{
    onPageChange(pn) {
      (async () => {
        pn = pn || 1
        descPaging.setCurrentPage(pn);
        this.descriptionData_sh = $linq(this.descriptionData).skip(descPaging.skipItems()).take(descPaging.getItemsPerPage()).toArray()
        descPaging.createPagesArray()
       })();
      },
    async loadDescriptionData() {
        let act = `CSM/CustomerData/Description_ReadV2?text=${this.desc_text}`
        let resp = await $xt.getCustomerServer(act)
        this.descriptionData = resp.data;

      descPaging.setTotalItems(resp.total?? 1)
      this.onPageChange(1)
      },
       sendData(x) {
        this.$emit("send-data", x);
        this.closeModal();
      },
      openModal() {
        (async () => {
          $(this.$refs.descriptionModal).modal('show');
          await this.loadDescriptionData();
        })();
      },
      closeModal() {
        $(this.$refs.descriptionModal).modal('hide');
      },
      doSearch(){
      //  descPaging.setCurrentPage(1);
        this.loadDescriptionData()
      },
      checkScreenSize() {
        this.isSmallScreen = window.innerWidth < 1024
        this.resize = window.innerWidth >= 1024
      },
  },
  mounted () {
      descPaging = this.$refs.descPaging
      descPaging.setCurrentPage(1);
      descPaging.setItemsPerPage(10);
      //descPaging.setTotalItems(0);
      this.checkScreenSize()
      window.addEventListener("resize", this.checkScreenSize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkScreenSize);
  },
}

</script>
