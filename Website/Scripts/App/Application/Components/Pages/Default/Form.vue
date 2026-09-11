<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-solid">
          <div class="box-body">
            <div class="row">
              <div class="col-md-2 col-sm-6 col-xs-6">
                <div class="form-group">
                  <label>{{ui.re_search_by || 'ค้นหาโดย'}}</label>
                  <select class="form-control" v-model="retrieveSearch['field']">
                    <option value="">-- Please Select --</option>
                    <option v-for="x in fields" :value="x.key">{{ x.name }}</option>
                  </select>
                </div>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-6">
                <div class="form-group">
                  <label>{{ui.re_seacrh || 'ค้นหา'}}</label>
                  <div class="input-group">
                    <input type="text" class="form-control" v-model="retrieveSearch['search']" @keyup.enter="retrieveSearchClick()" ref="searchBox" />
                    <span class="input-group-btn">
                      <button class="btn bg-navy" @click.prevent="retrieveSearchClick()"><i class="fa fa-search"></i></button>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12 col-sm-12 col-xs-12">
                <div class="table-responsive">
                  <table class="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th class="text-center">Code</th>
                        <th>Description</th>
                        <th class="text-center">QTY</th>
                        <th class="text-center">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="x,idx in data">
                        <td align="center"><a href="#" class="disabled" @click.prevent="" v-text="x.formcode"></a></td>
                        <td v-text="x.formname"></td>
                        <td align="center">{{x.qty > 0 ? x.qty : ''}}</td>
                        <td align="center"><a :href="queryString(x)" target="_blank" v-show="x.qty > 0"><i class="fas fa-edit"></i></a></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-lg-12 col-md-12">
                <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
              </div>
            </div>

          </div>
        </div>
      </template>
    </re-page>
  </div>
</template>
<script type="text/javascript">
  let page = {};
  let paging = {};
  let cpn = {
    data() {
      return {
        auth,
        ui: window.ui,
        baseUrl,
        data: [],
        retrieveSearch: {},
        fields: [
          { key: 'formname', name: 'Form Name', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'formcode', name: 'Form Code', type: 's', search: true, sort: true, sort_default: true, width: 200 },
        ],
        sort_key: '',
        sort_type: 'asc',
        customer_name: '',
        qString: queryString,
      }
    },
    methods: {
      async retrieveSearchClick() {
        this.sort_key = this.retrieveSearch.field;
        this.pageChange(1);
        await this.loadRetrieve();
      },
      async loadRetrieve() {
        let field_type = $linq(this.fields).where(x => x.key == this.retrieveSearch.field).select(x => x.type).firstOrDefault() || 's';
        this.$set(this.retrieveSearch, 'field_type', field_type);

        let url = `CSM/Data/FormReadList?sort=${this.sort_key}&sort_type=${this.sort_type}&customer_code=${this.qString.customer_code}&skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;

        for (var key in this.retrieveSearch) {
          url += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`;
        }

        let rsp = await $xt.getServer(url);
        this.data = rsp.data;
        this.total = rsp.total;
        this.customer_name = rsp.customer_name;
        page.pageTitle = this.customer_name;
        document.title = page.pageTitle;

        paging.setTotalItems(rsp.total);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
      },
      queryString(x) {
        return baseUrl + `page/FormDetail?customer_code=${this.qString.customer_code}&formcode=${x.formcode}`
      },
      async pageChange(pn) {
        paging.setCurrentPage(pn);
        await this.loadRetrieve();
      },
    },
    mounted() {
      page = this.$refs.page;
      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(10);

      this.loadRetrieve();

      //  Search Field
      let field_init = $linq(this.fields).where(x => x.search).firstOrDefault() || {};
      this.$set(this.retrieveSearch, 'field', field_init.key || '');
      this.$set(this.retrieveSearch, 'field_type', field_init.type || 's');
    },
  };
  export default cpn;
</script>
