<template>
  <div class="">
    <table-stick-2>
      <table class="table table-hover table-bordered">
        <thead>
          <tr>
            <th class="tf-2">No.</th>
            <th class="tf-4">Project No.</th>
            <th class="tf-4">Ref. Code</th>
            <th class="tf-5">Project Name</th>
            <th class="tf-4">Project Manager</th>
            <th class="tf-3">Receive Date</th>
            <th class="tf-3">Start Date</th>
            <th class="tf-3">End Date</th>
            <th class="tf-4">Edit Status Date</th>
            <th class="tf-5">Remark Construction Status</th>
            <th class="tf-5">Remark Project</th>
            <th class="tf-3">Group</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(x,idx) in projectData">
            <td align="center">{{ x.item || idx+1 }}</td>
            <td>{{x.pre_event}}</td>
            <td>{{x.refcode}}</td>
            <td>{{x.project_name}}</td>
            <td>{{x.pm_name}}</td>
            <td align="center">{{$date(x.rcptdate, 'DD/MM/YYYY')}}</td>
            <td align="center">{{$date(x.start_date, 'DD/MM/YYYY')}}</td>
            <td align="center">{{$date(x.edit_date, 'DD/MM/YYYY')}}</td>
            <td align="center">{{$date(x.edit_status_date, 'DD/MM/YYYY')}}</td>
            <td>{{x.remark_status}}</td>
            <td>{{x.remark_project}}</td>
            <td>{{x.projgroup}}</td>
          </tr>
        </tbody>
      </table>
    </table-stick-2>
    <div class="row">
      <div class="col-lg-12 col-md-12">
        <pagination class="pull-left" ref="project_paging" @page-change="pageChange($event.page,'project')"></pagination>
      </div>
    </div>
  </div>
</template>
<script>
let project_paging = {};
export default {
  props : {
    customer_code : {
      type : String,
      default : ""
    },
    search : {
      type : String,
      default : ""
    }
  },
  data() {
    return {
      ui: window.ui,
      xt: $xt,
      projectData: [],
    }
  },
  methods: {
    pageChange(pn , keyword){
      switch (keyword) {
        case 'project':
          pn = pn || 1;
          project_paging.setCurrentPage(pn);
          this.loadProjectData();
        break;
      }
    },
    async loadProjectData() {
      let act = `csm/data/CustProjectData_Read?skip=${project_paging.skipItems()}&take=${project_paging.getItemsPerPage()}&customer_code=${this.customer_code}&text=${this.search || ''}`;
      let rsp = await $xt.getServer(act);
      this.projectData = rsp.data.data;
      
      let i = project_paging.skipItems() == 0 ? 0 : project_paging.skipItems()
        this.projectData.forEach((x) => {
          this.$set(x , 'item', ++i)
        })

      project_paging.setTotalItems(rsp.data.total || 1);
      if (!project_paging.getItemsPerPage()) {
        project_paging.setCurrentPage(1);
      }
      project_paging.createPagesArray();
    },
  },
  mounted() {
    project_paging = this.$refs.project_paging;
    project_paging.setCurrentPage(1);
    project_paging.setItemsPerPage(100);
    this.loadProjectData();
  },
}
</script>
