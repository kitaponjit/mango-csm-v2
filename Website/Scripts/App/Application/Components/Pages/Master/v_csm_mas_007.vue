<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-widget">
          <div class="box-body">
            <!-- Data List -->
            <div class="row">
              <div class="col-lg-12 col-md-12">
                <div class="nav-tabs-custom">
                  <ul class="nav nav-tabs">
                    <li :class="{active:tabActive===0}"><a href="#" @click.prevent="changeTab(0)">Data List ({{datalist.length || 0}})</a></li>
                    <li :class="{active:tabActive===1}">
                      <a href="#" @click.prevent="changeTab(1)"
                         v-if="permission()">Create / Edit</a>
                    </li>
                  </ul>
                  <div class="tab-content">
                    <div class="tab-pane" :class="{active:tabActive===0}">
                      <div class="row">
                        <div class="col-lg-2 col-md-6">
                          <div class="form-group">
                            <select class="form-control input-sm" v-model="search.field" @change="loadData">
                              <option value="">All Responsible</option>
                              <option value="W">Worker</option>
                              <option value="C">Checker</option>
                            </select>
                          </div>
                        </div>
                        <div class="col-lg-6 col-md-6">
                          <div class="form-group">
                            <div class="input-group">
                              <input type="text" class="form-control inptu-sm" v-model.trim="search.text" @keyup.enter="loadData" placeholder="Keyword : ค้นหาจาก Employee No หรือ Name หรือ Project Contract" />
                              <span class="input-group-btn">
                                <button class="btn btn-sm btn-default" @click="loadData"><i class="fa fa-search"></i></button>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-lg-12 col-md-12">
                          <div class="table-responsive">
                            <table class="table table-bordered table-hover">
                              <thead>
                                <tr>
                                  <th style="width:1px;">#</th>
                                  <th style="width:1px;" v-if="permission()">Edit</th>
                                  <th style="width:150px;">Employee No.</th>
                                  <th>Employee Name</th>
                                  <th style="width:300px;">Project Contract</th>
                                  <th style="width:150px;">Responsible</th>
                                  <th>Add User</th>
                                  <th class="text-center">Add Date</th>
                                  <th>Edit User</th>
                                  <th class="text-center">Edit Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(x,idx) in datalist">
                                  <td align="center">{{idx+1}}.</td>
                                  <td align="center" v-if="permission()"><a href="#" @click.prevent="editData(x)"><i class="fa fa-edit"></i></a> </td>
                                  <td>{{x.empno}}</td>
                                  <td>{{x.empfullname}}</td>
                                  <td>{{x.pre_des}}</td>
                                  <td>{{x.respon_type == 'W' ? 'Worker' : 'Checker'}}</td>
                                  <td class="text-nowrap nowrap" nowrap>{{x.adduser}}</td>
                                  <td class="text-nowrap nowrap" nowrap align="center">{{x.add_dt|date('DD/MM/YYYY HH:mm')}}</td>
                                  <td class="text-nowrap nowrap" nowrap>{{x.edituser}}</td>
                                  <td class="text-nowrap nowrap" nowrap align="center">{{x.edit_dt|date('DD/MM/YYYY HH:mm')}}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-lg-12 col-md-12">
                          <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page, 'datalist')"></pagination>
                        </div>
                      </div>
                    </div>
                    <div class="tab-pane" :class="{active:tabActive===1}">
                      <app-form ref="appForm">
                        <template slot="form-field">
                          <div class="row">
                            <div class="col-lg-2 col-md-4">
                              <div class="form-group">
                                <label class="text-danger">Project Contract</label>
                                <span class="input-group">
                                  <input type="text" class="form-control input-sm" v-model="form.pre_event" readonly />
                                  <span class="input-group-btn">
                                    <button class="btn btn-sm btn-default" @click="$refs.ct_project.openModal()"><i class="fa fa-search"></i></button>
                                    <button class="btn btn-sm btn-danger" @click="clearData(form, ['pre_event', 'pre_des'])"><i class="fa fa-close"></i></button>
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div class="col-lg-4 col-md-6">
                              <div class="form-group">
                                <label class="pull-right">&nbsp;</label>
                                <input type="text" class="form-control input-sm" v-model="form.pre_des" readonly />
                              </div>
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-lg-2 col-md-4">
                              <div class="form-group">
                                <label class="text-danger">Employee</label>
                                <span class="input-group">
                                  <input type="text" class="form-control input-sm" v-model="form.empno" readonly />
                                  <span class="input-group-btn">
                                    <button class="btn btn-sm btn-default" @click="$refs.ct_emp.openModal()"><i class="fa fa-search"></i></button>
                                    <button class="btn btn-sm btn-danger" @click="clearData(form, ['empno', 'empfullname'])"><i class="fa fa-close"></i></button>
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div class="col-lg-4 col-md-6">
                              <div class="form-group">
                                <label class="pull-right">&nbsp;</label>
                                <input type="text" class="form-control input-sm" v-model="form.empfullname" readonly />
                              </div>
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-lg-2 col-md-4">
                              <div class="form-group">
                                <label>Responsible</label>
                                <select class="form-control input-sm" v-model="form.respon_type" v-bind:disabled="!form.pre_event">
                                  <option value="">-- Please Select --</option>
                                  <option value="W">Worker</option>
                                  <option value="C">Checker</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </template>
                      </app-form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>
    <!-- Center Modal -->
    <vue-project-list ref="ct_project" @send-data="sendComponent($event, 'project')"></vue-project-list>
    <vue-employee-list ref="ct_emp" @send-data="sendComponent($event, 'emp')"></vue-employee-list>
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
        ui: window.ui,
        tabActive: 0,
        search: {
          field: ""
        },
        form: {},
        datalist: [],
        editMode: false
      };
    },
    methods: {
      changeTab(t) {
        this.tabActive = t;
      },
      pageChange(pn, type) {
        switch (type) {
          case "datalist":
            paging.setCurrentPage(pn);
            this.loadData();
            break;
        }
      },
      setEdit() {
        this.editMode = true;
        appForm.btnDelete.disabled = false;
      },
      resetData() {
        this.editMode = false;
        this.form = {};
        appForm.btnDelete.disabled = true;
      },
      async loadData() {
        let act = `CSM/MASTER/ProjectWorker_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}&search_text=${encodeURIComponent(this.search.text || '')}&field=${encodeURIComponent(this.search.field || '')}`;
        let rsp = await $xt.getServer(act);
        this.datalist = rsp.data.data_rows;

        paging.setTotalItems(rsp.data.total);
        console.log(rsp.data.total);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
      },
      async readData(x) {
        let act = `CSM/MASTER/ProjectWorker_Read?empno=${encodeURIComponent(x.empno || '')}&pre_event=${encodeURIComponent(x.pre_event || '')}&itemno=${encodeURIComponent(x.itemno || '')}`;
        let rsp = await $xt.getServer(act);
        this.form = rsp.data;
      },
      async saveData() {
        if (process) return;
        try {
          let f = {
            header: this.form
          };
          let act = `CSM/MASTER/ProjectWorker_Create`;
          if (this.editMode) {
            act = `CSM/MASTER/ProjectWorker_Update`;
          }
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          await this.loadData();
          $msg.alert(``, `Success`, `success`);
          this.changeTab(0);
          this.resetData();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
      },
      async editData(x) {
        this.setEdit();
        await this.readData(x);
        this.changeTab(1);
        $('html,body').scrollTop(0);
      },
      async deleteData() {
        if (!this.editMode) return;
        if (!await $msg.confirm(`คุณต้องการลบ ${this.form.empfullname} ในตำแหน่ง ${this.form.respon_type == "W" ? "Worker" : "Checker"} ใช่หรือไม่`)) {
          return;
        }
        try {
          let f = {
            header: this.form
          };
          let act = `CSM/Master/ProjectWorker_Delete`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          await this.loadData();
          $msg.alert(``, `Success`, `success`);
          this.changeTab(0);
          this.resetData();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
      },
      sendComponent(e, type) {
        switch (type) {
          case "project":
            this.$set(this.form, "pre_event", e.pre_event);
            this.$set(this.form, "pre_event2", e.pre_event2);
            this.$set(this.form, "pre_des", e.pre_des);
            break;
          case "emp":
            this.$set(this.form, "empno", e.empno);
            this.$set(this.form, "empfullname", e.empfullname);
            break;
        }
      },
      clearData(data, field) {
        $linq(field).foreach(x => this.$set(data, x, null));
      },
      is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
        return isMango == "Y" ? true : false;
      },
      permission() {
        let data = (!this.is_mango() || auth.is_admin);
        return data;
      },
    },
    computed: {
      configData() { return store.state.configData },
    },
    mounted() {
      (async () => {
        page = this.$refs.page;
        page.pageTitle = 'Master : ผู้ปฏิบัติงานตามโครงการ';
        document.title = page.pageTitle;

        appForm = this.$refs.appForm;
        appForm.btnRetrieve.show = false;
        appForm.btnPrint.show = false;
        appForm.btnBack.show = false;
        appForm.btnNew.click = this.resetData;
        appForm.btnSave.click = this.saveData;
        appForm.btnDelete.click = this.deleteData;

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(10);

        this.resetData();
        this.loadData();
      })();
    }
  };

  export default cpn;
</script>
