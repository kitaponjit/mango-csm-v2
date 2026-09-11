<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-widget">
          <div class="box-body">
            <div class="nav-tabs-custom">
              <ul class="nav nav-tabs">
                <li :class="{active:tabActive===0}"><a href="#" @click.prevent="onTabChange(0)">ข้อมูลทั้งหมด ({{extensionData.length | 0}})</a></li>
                <li :class="{active:tabActive===1}"><a href="#" @click.prevent="onTabChange(1)">เพิ่ม / แก้ไข</a></li>
              </ul>
              <div class="tab-content">
                <div class="tab-pane" :class="{active:tabActive===0}">
                  <div class="row">
                    <div class="col-md-12 col-sm-12 col-xs-12">
                      <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                          <thead>
                            <tr>
                              <th class="tf-2-5 text-center">Manage</th>
                              <th class="tf-2 text-center">No.</th>
                              <th class="tf-2-5 text-center">Extension</th>
                              <th>Agent Name</th>
                              <th class="tf-3-5 text-center">Add User</th>
                              <th class="tf-3-5 text-center">Add Date</th>
                              <th class="tf-3-5 text-center">Edit User</th>
                              <th class="tf-3-5 text-center">Edit Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="x,idx in extensionData">
                              <td align="center">
                                <a href="#" @click.prevent="onRead(x)"><v-icon name="edit" style="width:20px"></v-icon></a>
                                <a href="#" @click.prevent="onDel(x)"><v-icon name="trash-2" style="width:20px"></v-icon></a>
                              </td>
                              <td align="center" class="text-bold">{{idx+1}}.</td>
                              <td align="center" class="text-bold">{{x.extension}}</td>
                              <td>{{x.agent_name}}</td>
                              <td align="center">{{x.adduser}}</td>
                              <td align="center">{{x.adddate | date('DD/MM/YYYY HH:mm')}}</td>
                              <td align="center">{{x.edituser}}</td>
                              <td align="center">{{x.editdate | date('DD/MM/YYYY HH:mm')}}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="tab-pane" :class="{active:tabActive===1}">
                  <app-form ref="appForm">
                    <template slot="form-field">
                      <div class="row">
                        <div class="col-md-2 col-sm-2 col-xs-2">
                          <div class="form-group">
                            <label class="text-danger">Extension</label>
                            <input type="text" class="form-control" v-model="formData.extension" :readonly="isEdit" />
                          </div>
                        </div>
                        <div class="col-md-4 col-sm-4 col-xs-4">
                          <div class="form-group">
                            <label>Agent Name</label>
                            <input type="text" class="form-control" v-model="formData.agent_name" />
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
      </template>
    </re-page>
  </div>
</template>
<script>
  let page = {};
  let appForm = {};
  let cpn = {
    data() {
      return {
        auth,
        ui: window.ui,
        tabActive: 0,
        extensionData: [],
        formData: {},
        isEdit: false,
      };
    },
    methods: {
      onTabChange(t) {
        this.tabActive = t;
        if (t == 0) this.isEdit = false;
      },
      setNewTab() {
        this.formData = {};
        this.isEdit = false;
      },
      setEditTab() {
        this.onTabChange(1);
        this.isEdit = true;
      },
      async loadData() {
        let act = `CSM/Config/Extension_ReadList`;
        let rsp = await $xt.getServer(act);
        this.extensionData = rsp.data.data_rows;
      },
      async onRead(x) {
        let act = `CSM/Config/Extension_Read?extension=${x.extension}`;
        let rsp = await $xt.getServer(act);
        this.formData = rsp.data.data_rows;
        this.setEditTab();
      },
      async onSave() {
        try {
          let f = {
            data: this.formData
          };
          let act = `csm/config/Extension_Create`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          $notify.success(this.ui.alert_save_success);
          await this.loadData();
          this.onTabChange(0);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async onDel(x) {
        try {
          let f = {
            extension: x
          };
          let act = `CSM/Config/Extension_Delete`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          $notify.success(this.ui.alert_save_success);
          await this.loadData();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      }
    },
    computed: {

    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = 'Program Config : ตั้งค่า Extension';
      document.title = page.pageTitle;

      appForm = this.$refs.appForm;
      appForm.btnRetrieve.show = false;
      appForm.btnPrint.show = false;
      appForm.btnBack.show = false;
      appForm.btnSave.click = this.onSave;
      appForm.btnNew.click = this.setNewTab;

      this.loadData();
    }
  };
  export default cpn;
</script>
