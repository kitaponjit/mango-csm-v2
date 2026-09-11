<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-solid">
          <div class="box-body">
            <div class="row">
              <div class="col-md-3 col-sm-6 col-xs-6">
                <div class="form-group">
                  <label>{{ui.re_search || 'ค้นหา'}}</label>
                  <div class="input-group">
                    <input type="text" class="form-control" v-model="retrieveSearch['search']" @keyup.enter="retrieveSearchClick()" ref="searchBox" />
                    <span class="input-group-btn">
                      <button class="btn bg-navy" @click="retrieveSearchClick()"><i class="fa fa-search"></i></button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-12">
                <div class="table-responsive">
                  <table class="table table-bordered table-hover">
                    <thead>
                      <tr style="background-color:#4caf50; color:cornsilk">
                        <th style="width:150px;">Add Revision No.</th>
                        <th style="width:150px;">CRM No.</th>
                        <th style="width:100px;">Item No.</th>
                        <th style="width:250px;">Subject</th>
                        <th style="width:250px;">Description</th>
                        <th style="width:150px;">Module</th>
                        <th style="width:150px;">Type</th>
                        <th style="width:150px;">Req. Type</th>
                        <th style="width:150px;">Complete Date</th>
                        <th style="width:200px;">Add User</th>
                      </tr>
                    </thead>
                    <tbody v-for="(x, index) in RevisionData">
                      <tr>
                        <td align="center">
                          <a style="cursor:pointer;" v-on:click="openModalRevision(x)" v-show="x.itemno == 1"><i class="fa fa-plus"></i></a>
                        </td>
                        <td align="center"><a v-bind:href="queryString(x)" target="_blank">{{x.itemno > 1 ? '' : x.job_no}}</a></td>
                        <td align="center">{{x.itemno}}</td>
                        <td>{{x.subject}}</td>
                        <td>{{x.detail}}</td>
                        <td align="center">{{x.module}}</td>
                        <td>{{itemTypeName(x.item_type)}}</td>
                        <td>{{reqTypeName(x.req_type)}}</td>
                        <td align="center">{{x.complete_date | date()}}</td>
                        <td>{{x.add_user}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div>
              <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
            </div>

            <div class="modal" id="myModalRevision">
              <div class="modal-dialog">
                <div class="modal-content">

                  <!-- Modal Header -->
                  <div class="modal-header">
                    <h4 class="modal-title">Enter Revision No. Here:</h4>
                  </div>

                  <!-- Modal body -->
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-sm-12">
                        <div class="form-group">
                          <label for="">Revision No. :</label>
                          <input type="checkbox" v-model="detailData['revision_is_import']" true-value="Y" false-value="N" />
                          <label class="text-danger">(หากติ๊กเลือก จะนำไปทำ Manual List ให้ลูกค้าเห็น)</label>
                          <input type="text" class="form-control" v-model.trim="detailData['revision']" ref="revision" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Modal footer -->
                  <div class="modal-footer">
                    <button type="button" class="btn btn-success" v-on:click="save()">Save</button>
                    <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </template>
    </re-page>
  </div>
</template>
<script>
  let page = {};
  let appForm = {};
  let paging = {};
  let process = false;
  let cpn = {
    data() {
      return {
        auth,
        baseUrl,
        tab1Active: 0,
        search: {},
        ui: window.ui,
        isEdit: false,
        userid: auth.userid,
        retrieveSearch: {},
        fields: [
          { key: 'job_no', name: 'CRM No.', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'pre_des', name: 'Project', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'dpt_no_name', name: 'Department', type: 's', search: true, sort: true, sort_default: true, width: 200 },
        ],
        sort_key: '',
        sort_type: 'desc',
        platformCodeData: platformCodeData,
        detailData: {},
        RevisionData: [],
        dataModal: {},
      };
    },
    methods: {
      async onTabChange(t) {
        this.tabActive = t;
      },
      queryString(x) {
        return this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${x.job_no}`
      },
      async loadRetrieve() {
        let url = `CSM/Tools/CSMRevisionReadList?sort=${this.sort_key}&sort_type=${this.sort_type}&skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
        for (var key in this.retrieveSearch) {
          url += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`;
        }
        let rsp = await $xt.getServer(url);
        this.RevisionData = rsp.data;

        paging.setTotalItems(rsp.total);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
      },
      async pageChange(pn) {
        paging.setCurrentPage(pn);
        await this.loadRetrieve();
      },
      callData() {
        this.loadRetrieve();
      },
      retrieveSearchClick() {
        this.sort_key = this.retrieveSearch.field;
        this.retrieveSetPage(1);
        this.callData();
      },
      retrieveSort() {
        this.callData();
      },
      retrieveSetPage(x) {
        this.page.setCurrentPage(x);
        this.callData();
      },
      itemTypeName(code) {
        return $linq(this.serviceCodeData).where(x => x.serv_code == code).select(x => x.serv_name).firstOrDefault() || '';
      },
      reqTypeName(code) {
        return $linq(this.requestCodeData).where(x => x.id == code).select(x => x.name).firstOrDefault() || '';
      },
      async openModalRevision(x) {
        $('#myModalRevision').modal('show');
        this.dataModal = x;

        let ac = `CSM/Tools/CSMRevisionRead?job_no=${x.job_no}&itemno=${x.itemno}`;
        let rsp = await $xt.getServer(ac);
        this.detailData = rsp.data;
      },
      async save() {
        try {
          let f = {
            form: {
              job_no: this.dataModal.job_no,
              revision: this.detailData.revision,
              revision_is_import: this.detailData.revision_is_import,
            }
          };
          let at = `CSM/Tools/CSMRevisionCreate`;
          page.loadingBox.show();
          let rs = await $xt.postServerJson(at, f);
          if (!rs.success) {
            throw rs.error;
          }
          $msg.alert(``, `Success`, `success`);
          this.loadRetrieve();
          this.detailData = {};
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
      }
    },
    computed: {
      requestCodeData() { return store.state.requestCodeData },
      serviceCodeData() { return store.state.serviceCodeData },
    },
    mounted() {
      (async () => {

        page = this.$refs.page;
        page.pageTitle = `Revision`;
        document.title = page.pageTitle;

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(10);

        this.loadRetrieve();
        let field_init = $linq(this.fields).where(x => x.search).firstOrDefault() || {};
        this.$set(this.retrieveSearch, 'field', field_init.key || '');
        this.$set(this.retrieveSearch, 'field_type', field_init.type || 's');

      })()
    }
  };

  export default cpn;
</script>
