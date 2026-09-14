<template>
  <div class="cx-page">
    <customer-page ref="page">
      <template slot="body">
        <!-- KPI -->
        <div class="cx-kpi-row">
          <div class="cx-kpi cx-kpi--ok" @click.prevent="onItem('Y')" style="cursor:pointer;">
            <span class="info-box-icon"><i class="fas fa-check-double"></i></span>
            <div class="info-box-content">
              <span class="info-box-text">รายการที่อยู่ในสถานะ Complete</span>
              <span class="info-box-number">
                <span class="cx-kpi-big">{{displayTotal.total_complete}}</span>
                <span class="cx-kpi-sub">/ {{displayTotal.total_all_items}} รายการ</span>
              </span>
              <div class="cx-kpi-bar">
                <span :style="{ width: (displayTotal.total_all_items > 0 ? (displayTotal.total_complete / displayTotal.total_all_items * 100) : 0) + '%' }"></span>
              </div>
            </div>
          </div>
          <div class="cx-kpi cx-kpi--pending" @click.prevent="onItem('W')" style="cursor:pointer;">
            <span class="info-box-icon"><i class="fas fa-hourglass-half"></i></span>
            <div class="info-box-content">
              <span class="info-box-text">รายการที่อยู่ในสถานะ Pending</span>
              <span class="info-box-number">
                <span class="cx-kpi-big">{{displayTotal.total_queue}}</span>
                <span class="cx-kpi-sub">/ {{displayTotal.total_all_items}} รายการ</span>
              </span>
              <div class="cx-kpi-bar">
                <span :style="{ width: (displayTotal.total_all_items > 0 ? (displayTotal.total_queue / displayTotal.total_all_items * 100) : 0) + '%' }"></span>
              </div>
            </div>
          </div>
          <div class="cx-kpi cx-kpi--all" @click.prevent="onItem()" style="cursor:pointer;">
            <span class="info-box-icon"><i class="fas fa-folder-open"></i></span>
            <div class="info-box-content">
              <span class="info-box-text">รายการ CSM ทั้งหมด</span>
              <span class="info-box-number">
                <span class="cx-kpi-big">{{displayTotal.total_all_items}}</span>
                <span class="cx-kpi-sub">รายการ</span>
              </span>
              <div class="cx-kpi-bar">
                <span style="width:100%"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-12 col-sm-12 col-xs-12">
            <div class="box box-solid">
              <div class="box-body">
                <div class="cx-head">
                  <div class="cx-head__title">
                    <i class="fas fa-tasks"></i>
                    <span>ใบงานของคุณ</span>
                  </div>
                  <span class="cx-chip"><i class="fas fa-hand-pointer"></i> คลิกที่แถวเพื่อดูรายละเอียด</span>
                </div>

                <!-- Filter -->
                <div class="cx-filter">
                  <div class="cx-field">
                    <label>Sort by</label>
                    <select class="form-control" v-model="retrieveSearch.sort" @change="onSearch()">
                      <option v-for="x in sort" :value="x.value">{{x.name}}</option>
                    </select>
                  </div>
                  <div class="cx-field">
                    <label>Module</label>
                    <select class="form-control" v-model="retrieveSearch.module" @change="onSearch()">
                      <option v-for="x in module" :value="x">{{x}}</option>
                    </select>
                  </div>
                  <div class="cx-field">
                    <label>Search by</label>
                    <select class="form-control" v-model="retrieveSearch.field">
                      <option v-for="x in fields" :value="x.key">{{x.name}}</option>
                    </select>
                  </div>
                  <div class="cx-field cx-field--grow">
                    <label>Search</label>
                    <div class="input-group">
                      <input type="text" class="form-control" placeholder="พิมพ์คำค้นหา แล้วกด Enter" v-model="retrieveSearch.text" @keyup.enter="onSearch()" />
                      <span class="input-group-btn"><button class="btn" @click.prevent="onSearch()"><i class="fas fa-search"></i></button></span>
                    </div>
                  </div>
                </div>

                <!-- Table -->
                <div class="cx-table-wrap">
                  <div class="table-responsive">
                    <table class="table cx-table cx-table--click">
                      <thead>
                        <tr>
                          <th class="tf-3-5 text-center">Document No.</th>
                          <th class="tf-3 text-center">Date</th>
                          <th class="tf-2-5 text-center">No.</th>
                          <th class="tf-3 text-center">Module</th>
                          <th>Subject</th>
                          <th class="tf-2-5 text-center">Status</th>
                          <th class="tf-3-5 text-center">Response Date</th>
                          <th class="tf-3 text-center">Due Date</th>
                          <th class="tf-3-5 text-center">Complete Date</th>
                          <th class="tf-2-5 text-center">Overdue</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="x,idx in displayData" @click.prevent="openDetail(x)">
                          <td align="center"><span class="cx-docno" :class="statusClass('text-',x.status)">{{x.d_job_no}}</span></td>
                          <td align="center">{{$date(x.job_date)}}</td>
                          <td class="cx-num" align="center">{{x.itemno}}.</td>
                          <td align="center">{{x.module}}</td>
                          <td class="cx-subject">{{x.subject}}</td>
                          <td align="center"><span class="label" :class="statusLabelClass('label-', x.status)">{{statusName(x.status)}}</span></td>
                          <td class="text-bold text-orange" align="center">{{$date(x.response_date)}}</td>
                          <td class="text-bold text-danger" align="center">{{$date(x.due_date)}}</td>
                          <td align="center">{{$date(x.complete_date)}}</td>
                          <td align="center">
                            <span class="cx-overdue" v-if="x.d_overdue > 0">{{x.d_overdue}}</span>
                            <span class="text-muted" v-else>{{x.d_overdue}}</span>
                          </td>
                        </tr>
                        <tr v-if="!displayData.length">
                          <td colspan="10" class="cx-empty"><i class="fas fa-inbox"></i> ไม่พบรายการใบงาน</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <br />
                <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
              </div>
            </div>
          </div>
        </div>
      </template>
    </customer-page>
  </div>
</template>
<script type="text/javascript">
  let page = {};
  let paging = {};
  let cpn = {
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        auth: window.customer_auth,
        fields: [
          { key: 'job_no', name: 'CSM No.', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'subject', name: 'Subject', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'contract_user', name: 'Contact By', type: 's', search: true, sort: true, sort_default: true, width: 200 },
        ],
        sort: [
          { key: 'status', name: 'All Item', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: '' },
          { key: 'status', name: 'Pending', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'W' },
          { key: 'status', name: 'Complete', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'Y' },
        ],
        statusCode: [
          { id: 'H', name: 'Hold' },
          { id: 'W', name: 'Queue' },
          { id: 'I', name: 'In Progress' },
          { id: 'X', name: 'In Progress' },
          { id: 'U', name: 'In Progress' },
          { id: 'N', name: 'Cancel' },
          { id: 'Y', name: 'Complete' },
        ],
        statusColors: [
          { id: 'H', name: 'll' },
          { id: 'W', name: 'll' },
          { id: 'I', name: 'll' },
          { id: 'X', name: 'll' },
          { id: 'N', name: 'll' },
          { id: 'Y', name: 'll' },
        ],
        retrieveSearch: {},
        displayData: [],
        displayTotal: {},

        status: {},
        module: moduleCodeData
      };
    },
    methods: {
      onSearch() {
        paging.setCurrentPage(1);
        this.loadData();
      },
      openDetail(x) {
        window.open(this.baseUrl + `page/external/v_csm_external_detail/?job_no=${x.job_no}&itemno=${x.itemno}`, "_blank");
      },
      onItem(k) {
        let field_init = $linq(this.fields).where(x => x.search).firstOrDefault() || {};
        let module_init = $linq(this.module).where(x => x == "All Module").firstOrDefault() || {};

        this.$set(this.retrieveSearch, 'field', field_init.key || '');
        this.$set(this.retrieveSearch, 'sort', k || '');
        this.$set(this.retrieveSearch, 'module', module_init || '');
        paging.setCurrentPage(1);
        this.loadData();

      },
      async loadTotal() {
        let act = `CSM/CustomerData/ExternalTotal`;
        let resp = await $xt.getCustomerServer(act);
        this.displayTotal = resp;
      },
      async loadData() {
        let act = `CSM/CustomerData/ExternalReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
        for (var key in this.retrieveSearch) {
          act += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`;
        }
        let resp = await $xt.getCustomerServer(act);
        let temp = "";
        $linq(resp.data).foreach(x => {
          let b = false;
          b = x.job_no == temp;
          x.d_job_no = !b ? x.job_no : "";
          temp = x.job_no;
          x.d_overdue = x.overdue >= 0 || $xt.isEmpty(x.overdue) ? x.overdue : 0;
        });

        this.displayData = resp.data;

        paging.setTotalItems(resp.total);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
      },
      async pageChange(pn) {
        paging.setCurrentPage(pn);
        await this.loadData();
      },
      statusClass(prefix, status) {
        return status == 'Y' ? prefix + 'success' : status == 'I' ? prefix + 'info' : status == 'X' ? prefix + 'info' : status == 'N' ? prefix + 'danger' : status == 'H' ? prefix + 'warning' : '';
      },
      statusLabelClass(prefix, status) {
        return status == 'Y' ? prefix + 'success' : status == 'I' ? prefix + 'info' : status == 'X' ? prefix + 'info' : status == 'N' ? prefix + 'danger' : status == 'H' ? prefix + 'warning' : prefix + 'default';
      },
      statusName(code) {
        return $linq(this.statusCode).where(x => x.id == code).select(x => x.name).firstOrDefault() || '';
      },
      statusColor(code) {
        return $linq(this.statusColors).where(x => x.id == code).select(x => x.name).firstOrDefault() || '';
      },
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = 'ติดตามสถานะหรือความคืบหน้าของใบงาน';
      document.title = page.pageTitle;

      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(10);

      let field_init = $linq(this.fields).where(x => x.search).firstOrDefault() || {};
      let module_init = $linq(this.module).where(x => x == "All Module").firstOrDefault() || {};
      this.$set(this.retrieveSearch, 'field', field_init.key || '');
      this.$set(this.retrieveSearch, 'sort', this.sort[2].value || '');
      this.$set(this.retrieveSearch, 'module', module_init || '');

      this.loadTotal();
      this.loadData();
    }
  };
  export default cpn;
</script>
