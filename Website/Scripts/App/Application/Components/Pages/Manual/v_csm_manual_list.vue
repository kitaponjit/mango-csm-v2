<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-solid">
          <div class="box-body">
            <div class="row">
              <div class="col-md-4 col-sm-4 col-xs-4">
                <h4>ค้นหารายการอัพเดทโปรแกรมจากวันที่</h4>
                <div class="row">
                  <div class="col-md-6 col-sm-12 col-xs-12">
                    <div class="form-group">
                      <label>วันที่เริ่มต้น</label>
                      <datepicker input-class="form-control" v-model="formData.start_date"></datepicker>
                    </div>
                  </div>
                  <div class="col-md-6 col-sm-12 col-xs-12">
                    <div class="form-group">
                      <label>วันที่สิ้นสุด</label>
                      <datepicker input-class="form-control" v-model="formData.end_date"></datepicker>
                    </div>
                  </div>
                  <div class="col-md-12 col-sm-12 col-xs-12">
                    <button class="btn btn-block btn-default" @click="loadManual()"><i class="fas fa-search"></i> ค้นหาข้อมูล</button>
                  </div>
                </div>
                <hr />
                <h4>ค้นหารายการอัพเดทโปรแกรมจาก Revision</h4>
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Revision (เริ่มต้น)</label>
                      <input type="text" class="form-control" v-model="formData.start_revision" maxlength="20" />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Revision (สิ้นสุด)</label>
                      <input type="text" class="form-control" v-model="formData.end_revision" :disabled="formData.condition != 'between'" maxlength="20" />
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="text-danger">เงื่อนไขการค้นหา</label>
                      <select class="form-control" v-model="formData.condition">
                        <option v-for="x,idx in condition" :value="x.key" v-text="x.text"></option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div style="margin-top:23px">
                      <button class="btn btn-block btn-default" @click="loadManualV2()"><i class="fas fa-search"></i> ค้นหาข้อมูล</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-8 col-sm-8 col-xs-8">
                <div class="nav-tabs-custom">
                  <ul class="nav nav-tabs">
                    <li v-for="x in tabModuleData" :class="{active:x.id===tabModuleSelected}" v-show="x.show">
                      <a href="#" @click.prevent="mainTabModuleSelected(x)">
                        <label class="label label-success" v-if="x.total > 0">{{x.total}}</label> <span v-text="x.text"></span>
                      </a>
                    </li>
                  </ul>
                  <div class="tab-content">
                    <div class="tab-pane active">
                      <div class="table-responsive">
                        <table class="table table-striped table-hover" v-show="filterData.length > 0">
                          <thead>
                            <tr>
                              <th style="width:50px" class="text-center">#</th>
                              <th style="width:200px">Revision No.</th>
                              <th>Subject</th>
                              <th style="width:100px">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(x,idx) in filterData">
                              <td class="text-center">{{idx+1}}.</td>
                              <td>{{x.revision}}</td>
                              <td><a href="#" @click.prevent="showAttachment(x)">{{x.subject}}</a></td>
                              <td>{{x.add_dt | date()}}</td>
                            </tr>
                          </tbody>
                        </table>
                        <div class="col-md-12" v-show="filterData.length < 1">
                          <h5>ไม่พบรายการอัพเดทซอฟต์แวร์</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <!-- Loading (remove the following to stop the loading)-->
          <div class="overlay" v-if="isLoading">
            <i class="fa fa-refresh fa-spin"></i>
          </div>
          <!-- end loading -->
        </div>
      </template>
    </re-page>
    <!-- Modal : Attachment -->
    <modal ref="showFileModal">
      <template slot="header">
        <h4 class="modal-title">{{subject}}</h4>
      </template>
      <template slot="body">
        <div class="row">
          <div class="col-md-12">
            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style="width:50px">#</th>
                    <th style="width:300px">File</th>
                    <th style="width:500px">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(y, idx) in dataAttachment">
                    <td>{{(idx+1)|number(0)}}</td>
                    <td>
                      <p><a :href="filePath(y.filepath)" target="_blank"><img :src="filePath(y.filepath)" class="img-responsive" /></a></p>
                    </td>
                    <td>{{y.description}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
  let page = {};
  let cpn = {
    data() {
      return {
        auth,
        ui: window.ui,
        xt: $xt,
        tabModuleData: [],
        tabModuleSelected: "",
        moduleCodeData: [
          'ALL',
          'BD',
          'OF',
          'PO',
          'IC',
          'AP',
          'AR',
          'FA',
          'GL',
          'PM',
          'SE',
          'RT',
          'MA',
          'MRP',
          'EVAL',
          'RE',
        ],
        condition: [
          { key: 'between', text: 'ระหว่าง' },
          { key: 'more_than', text: 'มากกว่า' },
          { key: 'less_than', text: 'น้อยกว่า' },
          { key: 'equal', text: 'เท่ากับ' },
        ],
        formData: {},
        updateList: [],
        filterData: [],
        dataAttachment: [],
        total: 0,
        subject: "",
        isLoading: false,
      };
    },
    methods: {
      mainTabModuleSelected(x) {
        this.tabModuleSelected = x.id;
        this.$set(this, 'filterData', x.id == 'ALL' ? this.updateList : $linq(this.updateList).where(w => w.module == x.id).toArray());
      },
      async loadManual() {
        let start_date = moment(this.formData.start_date).format("DD/MM/YYYY");
        let end_date = moment(this.formData.end_date).format("DD/MM/YYYY");
        this.isLoading = true;
        let act = `CSM/Manual/ManualReadList?start_date=${start_date}&end_date=${end_date}`;
        let rsp = await $xt.getServer(act);
        this.isLoading = false;
        this.$set(this, "updateList", rsp.data);
        this.$set(this, 'total', rsp.total);

        this.tabModuleData.forEach((x, idx) => {
          this.$set(x, 'total', 0);
        });

        this.tabModuleData.forEach((x, idx) => {
          if (x.id == 'ALL') {
            this.$set(x, 'total', $linq(this.total).select(x2 => x2.total).sum());
          } else {
            $linq(this.total).where(x2 => x2.module == x.id).foreach(x2 => {
              this.$set(x, 'total', x2.total);
            });
          }
        });

        this.mainTabModuleSelected({ id: 'ALL', name: 'ALL' });
      },
      async loadManualV2() {
        let x = this.formData;
        this.isLoading = true;
        let act = `CSM/Manual/ManualReadListV2?start_revision=${x.start_revision || ''}&end_revision=${x.end_revision || ''}&condition=${x.condition || ''}`;
        let rsp = await $xt.getServer(act);
        this.isLoading = false;
        this.$set(this, "updateList", rsp.data);
        this.$set(this, 'total', rsp.total);

        this.tabModuleData.forEach((x, idx) => {
          this.$set(x, 'total', 0);
        });

        this.tabModuleData.forEach((x, idx) => {
          if (x.id == 'ALL') {
            this.$set(x, 'total', $linq(this.total).select(x2 => x2.total).sum());
          } else {
            $linq(this.total).where(x2 => x2.module == x.id).foreach(x2 => {
              this.$set(x, 'total', x2.total);
            });
          }
        });

        this.mainTabModuleSelected({ id: 'ALL', name: 'ALL' });
      },
      async showAttachment(x) {
        this.$refs.showFileModal.openModal();
        this.subject = x.subject;

        let rsp = await $xt.getServer(`CSM/Manual/ReadPicture?job_no=${x.job_no}&module=${x.module}&revision=${x.revision}`);
        this.$set(this, 'dataAttachment', rsp.data);
      },
      filePath(x) {
        return dataServer + "Api/File/DownLoad?id=" + x
      },
    },
    beforeMount() {
      this.moduleCodeData.forEach((x, idx) => {
        this.tabModuleData.push({
          id: x, icon: '', text: x, show: true, total: 0
        });
      });
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = `รายการอัพเดทโปรแกรม`;
      document.title = page.pageTitle;

      this.$refs.showFileModal.setSize("modal-lg");

      this.$set(this.formData, "start_date", moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
      this.$set(this.formData, "end_date", new Date());
      this.$set(this.formData, "condition", $linq(this.condition).select(x => x.key).firstOrDefault());

      this.loadManual();
      this.mainTabModuleSelected({ id: "ALL" });
    }
  };

  export default cpn;
</script>
