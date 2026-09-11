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
                  <!--<a href="#" @click.prevent="changeTab1(1)">Create / Edit</a>-->
                  <a href="#" @click.prevent="changeTab1(1)">Create / Edit</a>
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
                        <table class="table table-hover table-bordered">
                          <thead>
                            <tr>
                              <th class="tf-1 text-center">#</th>
                              <th class="tf-2-5" v-if="permission()">Manage</th>
                              <th class="tf-2-5">Code</th>
                              <th class="tf-5-5">Subject</th>
                              <th class="tf-3">Active</th>
                              <th class="tf-3">Add By</th>
                              <th class="tf-3">Add Date</th>
                              <th class="tf-3">Edit By</th>
                              <th class="tf-3">Edit Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="x,idx in displayData">
                              <td align="center">{{x.item}}.</td>
                              <td align="center" v-if="permission()"><a href="#" @click.prevent="edit(x)"><i class="fa fa-edit"></i></a> </td>
                              <td align="center"><b>{{x.subject_code}}</b></td>
                              <td align="center">{{x.subject}}</td>
                              <td align="center" :class="statusClass(x.active)">{{statusName(x.active)}}</td>
                              <td align="center">{{x.adduser}}</td>
                              <td align="center">{{x.add_dt|date}}</td>
                              <td align="center">{{x.edituser}}</td>
                              <td align="center">{{x.edit_dt|date}}</td>
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

                <div class="tab-pane" :class="{active:tab1Active===1}">
                  <app-form ref="appForm">
                    <template slot="form-field">
                      <div class="row">
                        <div class="col-md-2">
                          <div class="form-group">
                            <label v-bind:class="{'text-danger': !editMode}">Code</label>
                            <input type="text" class="form-control" v-model="form.subject_code" v-bind:disabled="editMode" />
                          </div>
                        </div>
                        <div class="col-md-2">
                          <div class="form-group">
                            <label>&nbsp;</label>
                            <div>
                              <input type='checkbox' class='ios8-switch' id='checkbox-1' v-model="form.active" true-value="Y" false-value="N">
                              <label for='checkbox-1'>Active</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12">
                          <div class="form-group">
                            <label>Subject</label>
                            <input type="text" class="form-control" v-model="form.subject" />
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
          desgroup: "CSM",
        };
        this.editMode = false;
        appForm.btnDelete.disabled = true;
        this.loadData();
      },
      async loadData() {
        let act = `CSM/master/CSMSubject_ReadList?search_text=${encodeURIComponent(this.search.text || '')}`;
        let rsp = await $xt.getServer(act);
        this.datalist = rsp.data.data;
        this.total_datalist = rsp.data.total ?? 1;

        let i = 0;
        $linq(this.datalist).foreach(x => {
          this.$set(x, "item", ++i);
        });
        this.pageChange(this.pageNumber);
        paging.setTotalItems(rsp.data.total ?? 1);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
      },
      async save() {
        if (process) return;

        try {
          let f = {
            data: this.form
          };

          let act = `CSM/master/CSMSubject_Create`;
          if (this.editMode) {
            act = `CSM/master/CSMSubject_Update`;
          }

          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

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

        page.loadingBox.show();
        let act = `CSM/master/CSMSubject_Delete?code=${this.form.subject_code || ''}`;
        let rsp = await $xt.getServer(act);
        if (!rsp.success) {
          $msg.alert(``, rsp.error, `danger`);
          return;
        }

        await this.reset();
        page.loadingBox.hide();
        this.changeTab1(0);
      },
      setEdit() {
        this.editMode = true;
        appForm.btnDelete.disabled = false;
      },
      async edit(x) {
        this.setEdit();
        this.changeTab1(1);
        this.form = x;

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
              'Code': x.subject_code,
              'Subject': x.subject,
              'Active': x.active,
            })
          });
        }
        else {
          arr.push({
            'Code': "",
            'Subject': "",
            'Active': "",
          })
        }
        var dataWS = XLSX.utils.json_to_sheet(arr);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, dataWS);
        XLSX.writeFile(wb, 'Description.xlsx');
      },
      async doUpload(f) {
        page.loadingBox.show();
        try {
          let act = `CSM/Master/CSMSubjectImport`;
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
      is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
        return isMango == "Y" ? true : false;
      },
      permission() {
        let data = (!this.is_mango() || auth.is_admin);
        return data;
      },
      statusName(value) {
        return value == 'Y' ? "Yes" : "No";
      },
      statusClass(status) {
        return status == 'Y' ? 'text-success' : 'text-danger';
      },
    },
    computed: {
      configData() { return store.state.configData },
    },
    mounted() {
      (async () => {
        page = this.$refs.page;
        page.pageTitle = `Setup : Subject`;
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
      })();
    }
  };

  export default cpn;
</script>
