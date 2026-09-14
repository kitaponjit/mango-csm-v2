<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-widget">
          <div class="box-body">
                  <div class="row">
                    <div class="col-lg-6 col-md-12">
                      <div class="form-group">
                        <div class="input-group">
                          <input type="text" class="form-control input-sm" placeholder="Search" v-model.trim="search.text"
                            @keypress.enter="doSearch" />
                          <span class="input-group-btn">
                            <button class="btn btn-default" @click="doSearch"><i class="fa fa-search"></i></button>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="col-lg-6 col-md-12">
                      <span class="pull-right">
                        <button class="btn btn-sm btn-primary" v-on:click="newitem()"><i class="fa fa-plus"></i> ทำรายการใหม่</button>
                      </span>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-12">
                        <!--<table-stick width="100%" height="450px">-->
                        <table class="table table-hover table-bordered">
                          <thead>
                            <tr>
                              <!--<th></th>-->
                              <th class="tf-1 text-center">#</th>
                              <th class="tf-2 text-center" v-if="permission()">Edit/Delete</th>
                              <th class="tf-3 text-center">Code</th>
                              <th class="tf-5">Name</th>
                              <th class="tf-3 text-center">Add User</th>
                              <th class="tf-3 text-center">Add Date</th>
                              <th class="tf-3 text-center">Edit User</th>
                              <th class="tf-3 text-center">Edit Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="x, idx in datalist">
                              <td align="center">{{ x.item }}.</td>
                              <td align="center" v-if="permission()">
                                <a href="#" @click.prevent="setEdit(x)"><i class="fa fa-edit"></i></a>
                                <a class="text-danger m-5" href="#" @click.prevent="deleteData(x)"><i class="fa fa-trash"></i></a>
                              </td>
                              <td align="center">{{ x.flow_code }}</td>
                              <td>{{ x.flow_name }}</td>
                              <td align="center">{{ x.adduser }}</td>
                              <td align="center">{{ $date(x.add_dt, 'DD/MM/YYYY HH:mm') }}</td>
                              <td align="center">{{ x.edituser }}</td>
                              <td align="center">{{ $date(x.edit_dt, 'DD/MM/YYYY HH:mm') }}</td>
                            </tr>
                          </tbody>
                        </table>
                        <!--</table-stick>-->
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
    <modal ref="modal">
      <template slot="header">
        <h4><i class="fa fa-edit"> {{ msg }}</i> </h4>
      </template>
      <template slot="body">
        <div class="row">
          <div class="col-lg-3 col-md-6">
            <div class="form-group">
              <label v-bind:class="{ 'text-danger': !editMode }">Code</label>
              <input type="text" class="form-control" v-model.trim="form.flow_code" :readonly="editMode"
                :disabled="editMode" maxlength="20" />
            </div>
          </div>
          <div class="col-lg-6 col-md-6">
            <div class="form-group">
              <label class="text-danger">Name</label>
              <input type="text" class="form-control" v-model.trim="form.flow_name" maxlength="200" />
            </div>
          </div>
        </div>
      </template>
      <template slot="footer">
        <div>
          <button class="btn btn-sm bg-olive" @click.prevent="save()"><i class="fa fa-save"></i> บันทึกข้อมูล</button>
          <button class="btn btn-sm bg-danger" @click="$refs.modal.closeModal()"><i class="fas fa-times"></i> ปิด</button>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
let page = {};
let paging = {};
let process = false;
let cpn = {
  data() {
    return {
      ui: window.ui,
      auth,
      pageNumber: 1,
      search: { },
      datalist: [],
      displayData: [],
      editMode: false,
      total_datalist: 0,
      form: {},
      dataAdmin: {},
      msg: '',
    };
  },
  methods: {
    pageChange(pn) {
      pn = pn || 1;
      this.pageNumber = pn;
      paging.setCurrentPage(pn);
      this.$set(this, "displayData", $linq(this.datalist).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray());
      paging.createPagesArray();
    },
    doSearch() {
      paging.setCurrentPage(1);
      this.loadData();
    },
    reset() {
      this.form = {
        flow_code: "",
        flow_name: ""
      };
      this.editMode = false;
    },
    newitem() {
      this.$refs.modal.openModal();
      this.reset();
      this.msg = 'ทำรายการใหม่';
    },
    
    async loadData() {
      let act = `csm/master/Flow_ReadList?search_text=${encodeURIComponent(this.search.text || '')}`;
      let rsp = await $xt.getServer(act);
      this.datalist = rsp.data.data_rows;
      this.total_datalist = rsp.data.total;
      let i = 0;
      $linq(this.datalist).foreach(x => {
        this.$set(x, "item", ++i);
      });
      this.pageChange(this.pageNumber);
      paging.setTotalItems(rsp.data.total);
      if (!paging.getItemsPerPage()) {
        paging.setCurrentPage(1);
      }
      paging.createPagesArray();
    },
    async readData(flow_code) {
      let act = `csm/master/Flow_Read?code=${encodeURIComponent(flow_code|| '')}`;
      let rsp = await $xt.getServer(act);
      this.form = rsp.data;
      this.setEdit();
    },
    async save() {
      if (process) return;
      try {
        let f = {
          data: this.form
        };
        let act = `csm/master/Flow_Create`;
        if (this.editMode) {
          act = `csm/master/Flow_Update`;
        }
        page.loadingBox.show();
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw rsp.error;
        }
        await this.readData(rsp.data);
        await this.loadData();
        $notify.success(`ทำรายการเสร็จสิ้น`);
        this.reset();
        this.$refs.modal.closeModal();
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        // process = false;
        page.loadingBox.hide();
      }
    },
    async deleteData(x) {
      if (!await $msg.confirm(`คุณต้องการลบ ${x.flow_name} ใช่หรือไม่`)) {
        return;
      }
      try {
        let f = {
          code: x.flow_code
        };
        let act = `csm/master/Flow_Delete`;
        page.loadingBox.show();
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw rsp.error;
        }
        await this.reset();
        await this.loadData();
        $notify.success(`ทำรายการเสร็จสิ้น`);
        this.reset();
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
        console.log('this.form', this.form);
        console.log('idx', idx);
      } finally {
        // process = false;
        page.loadingBox.hide();
      }
    },
    async setEdit(x) {
      this.readData(x.flow_code);
      this.editMode = true;
      this.msg = 'แก้ไขรายการ';
      this.$refs.modal.openModal();
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
      page.pageTitle = `Setup : Workflow`;
      this.$refs.modal.setSize("modal-xl-2");
      document.title = page.pageTitle;
      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(10);

      this.reset();
      this.loadData();
    })();
  }
};

export default cpn;
</script>
