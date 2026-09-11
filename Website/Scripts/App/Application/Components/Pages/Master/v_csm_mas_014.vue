<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-widget">
          <div class="box-body">
            <div class="nav-tabs-custom">
              <ul class="nav nav-tabs">
                <li :class="{active:tab1Active===0}"><a href="#" @click.prevent="changeTab1(0)">Data List ({{total_datalist || 0}})</a></li>
                <li :class="{active:tab1Active===1}">
                  <a href="#" @click.prevent="changeTab1(1)"
                     v-if="auth.is_admin">Create / Edit</a>
                </li>
              </ul>
              <div class="tab-content">
                <div class="tab-pane" :class="{active:tab1Active===0}">
                  <div class="row">
                    <div class="col-lg-6 col-md-12">
                      <div class="form-group">
                        <div class="input-group">
                          <input type="text" class="form-control" placeholder="Search" v-model.trim="search.text" @keypress.enter="doSearch" />
                          <span class="input-group-btn">
                            <button class="btn btn-default" @click="doSearch"><i class="fa fa-search"></i></button>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="col-lg-6 col-md-12" v-show="false">
                      <span class="pull-right">
                        <button class="btn btn-sm btn-default" @click="onExport"><i class="fas fa-file-export"></i> Export Excel</button>
                        <button class="btn btn-sm btn-tumblr" @click="addFile"><i class="fas fa-file-import"></i> Import Excel</button>
                      </span>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-12">
                      <div class="table-responsive">
                        <!--<table-stick width="100%" height="450px">-->
                        <table class="table table-hover table-bordered">
                          <thead>
                            <tr>
                              <!--<th></th>-->
                              <th class="tf-1 text-center">#</th>
                              <th class="tf-2 text-center" v-if="auth.is_admin">Edit</th>
                              <th class="tf-2-5 text-center">Module</th>
                              <th class="tf-3 text-center">Type</th>
                              <th class="tf-5">Name</th>
                              <th class="tf-3 text-center">Add User</th>
                              <th class="tf-3 text-center">Add Date</th>
                              <th class="tf-3 text-center">Edit User</th>
                              <th class="tf-3 text-center">Edit Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="x,idx in displayData">
                              <td align="center">{{x.item}}.</td>
                              <td align="center" v-if="auth.is_admin"><a href="#" @click.prevent="edit(x)"><i class="fa fa-edit"></i></a> </td>
                              <td>{{x.module_code}}</td>
                              <td>
                                {{x.module_type == "S" ? 'Standard Module' : x.module_type == "O" ? 'Optional Module' : ''}}
                              </td>
                              <td>{{x.module_name}}</td>
                              <td align="center">{{x.adduser}}</td>
                              <td align="center">{{x.add_dt|date('DD/MM/YYYY HH:mm')}}</td>
                              <td align="center">{{x.edituser}}</td>
                              <td align="center">{{x.edit_dt|date('DD/MM/YYYY HH:mm')}}</td>
                            </tr>
                          </tbody>
                        </table>
                        <!--</table-stick>-->
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-12 col-md-12">
                      <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
                    </div>
                  </div>
                </div>

                <div class="tab-pane" :class="{active:tab1Active===1}">
                  <app-form ref="appForm">
                    <template slot="form-field">
                      <div class="row">
                        <div class="col-lg-3 col-md-6">
                          <div class="form-group">
                            <label v-bind:class="{'text-danger': !editMode}">Code</label>
                            <input type="text" class="form-control" v-model.trim="form.module_code" :readonly="editMode" :disabled="editMode" maxlength="20" />
                          </div>
                        </div>
                        <div class="col-lg-6 col-md-6">
                          <div class="form-group">
                            <label class="text-danger">Name</label>
                            <input type="text" class="form-control" v-model.trim="form.module_name" maxlength="200" />
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-lg-3 col-md-6">
                          <div class="form-group">
                            <label class="text-danger" v-text="ui.module_type || 'Module Type'"></label>
                            <select class="form-control input-sm" v-model.trim="form.module_type">
                              <option value="S">Standard Module</option>
                              <option value="O">Optional Module</option>
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
        <input type="file" ref="File" accept=".xls, .xlsx" v-show="false" />
      </template>
    </re-page>

  </div>
</template>
<script>
  import XLSX from 'xlsx';

  let page = {};
  let appForm = {};
  let paging = {};
  let process = false;
  let cpn = {
    data() {
      return {
        auth,
        tab1Active: 0,
        pageNumber: 1,
        search: {
        },
        datalist: [],
        displayData: [],
        editMode: false,
        total_datalist: 0,
        form: {},
        ui: window.ui
      };
    },
    methods: {
      changeTab1(t) {
        this.tab1Active = t;
      },
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
          module_code: "",
          module_name: "",
          module_type: "O",
        };
        this.editMode = false;
        appForm.btnDelete.disabled = true;
        this.loadData();
      },
      async loadData() {
        let act = `csm/master/Module_ReadList?search_text=${encodeURIComponent(this.search.text || '')}`;
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
      async readData(x) {
        let act = `csm/master/Module_Read?code=${encodeURIComponent(x || '')}`;
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

          let act = `csm/master/Module_Create`;
          if (this.editMode) {
            act = `csm/master/Module_Update`;
          }

          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          await this.readData(rsp.data);
          await this.loadData();

          $msg.alert(``, `Success`, `success`);
          this.changeTab1(0);
          this.reset();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
      },
      async deleteData() {
        if (process) return;
        if (!this.editMode) return;

        if (!await $msg.confirm(`ต้องการลบข้อมูลใช่หรือไม่`)) {
          return;
        }

        try {
          let f = {
            code: this.form.module_code
          };
          let act = `csm/master/Module_Delete`;

          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          await this.reset();
          await this.loadData();
          $msg.alert(``, `Success`, `success`);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
        this.changeTab1(0);
      },
      setEdit() {
        this.editMode = true;
        appForm.btnDelete.disabled = false;
      },
      async edit(x) {
        this.changeTab1(1);
        this.readData(x.module_code);

        appForm.btnDelete.disabled = false;
        $('html,body').scrollTop(0);
      },
      addFile() {
        $(this.$refs.File).click();
      },
      onExport() {
        let arr = [];

        if (this.datalist.length > 0) {
          $linq(this.datalist).foreach(x => {
            arr.push({
              'Code': x.module_code,
              'Name': x.module_name,
              'Type': x.module_type,
            })
          });
        }
        else {
          arr.push({
            'Code': "",
            'Name': "",
            'Type': "",
          })
        }
        var dataWS = XLSX.utils.json_to_sheet(arr);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, dataWS);
        XLSX.writeFile(wb, 'Module.xlsx');
      },
      async doUpload(f) {
        page.loadingBox.show();
        try {
          let act = `CSM/Master/ModuleImport`;
          let fd = new FormData();
          fd.append('file', f);

          let rsp = await $xt.postServerForm(act, fd);
          if (!rsp.success) {
            throw new Error(rsp.error);
          }
          else {
            $notify.success('นำเข้าข้อมูลเสร็จสิ้น');
            await this.loadData();
          }
        } catch (ex) {
          $msg.alert("", ex.toString(), "danger");
        }
        finally {
          page.loadingBox.hide();
        }
      },
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = `Setup : Module`;
      document.title = page.pageTitle;

      appForm = this.$refs.appForm;
      appForm.btnRetrieve.show = false;
      appForm.btnPrint.show = false;
      appForm.btnBack.show = false;
      appForm.btnNew.click = this.reset;
      appForm.btnSave.click = this.save;
      appForm.btnDelete.click = this.deleteData;

      paging = this.$refs.paging;
      paging.setCurrentPage(1);
      paging.setItemsPerPage(10);

      this.reset();
      this.$nextTick(() => {
        $(this.$refs.File).on('click', (e) => {
          e.target.value = null;
        });
        $(this.$refs.File).on('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            this.doUpload(e.target.files[0]);
          }
        });
      });
    }
  };

  export default cpn;
</script>
