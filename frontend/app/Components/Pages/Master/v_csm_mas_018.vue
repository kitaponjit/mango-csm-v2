<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="box box-widget">
          <div class="box-body">
            <div class="row">
              <div class="col-lg-3">
                <div class="form-group"> 
                  <label>Search</label>
                  <div class="input-group">
                    <input type="text" class="form-control input-sm"  placeholder="Search" v-model.trim="search.text" @keypress.enter="doSearch()" />
                    <span class="input-group-btn">
                      <button class="btn btn-sm bg-navy" @click="doSearch()"><i class="fa fa-search"></i></button>
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-lg-9 col-sm-6 col-xs-6 margin-t-25">
                <span class="pull-right">
                  <button class="btn btn-sm btn-facebook" @click="onExport()"><i class="fas fa-cloud-upload-alt"></i> นำข้อมูลออกเป็น Excel</button>
                  <button class="btn btn-sm btn-facebook" @click="addFile()"><i class="fas fa-cloud-download-alt"></i> นำเข้าข้อมูลจาก Excel</button>
                  <button class="btn btn-sm btn-tumblr" @click="addNew()"><i class="fa fa-plus"></i> สร้างเอกสารใหม่</button>
                </span>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-12 col-md-12 col-sm-12">
                <div class="table-responsive">
                  <table class="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th class="tf-1">No.</th>
                        <th class="tf-2 text-center" v-if="permission()">Action</th>
                        <th class="tf-3 text-center">Code</th>
                        <th class="tf-5">Description</th>
                        <th class="tf-3 text-center">Add User</th>
                        <th class="tf-3 text-center">Add Date</th>
                        <th class="tf-3 text-center">Edit User</th>
                        <th class="tf-3 text-center">Edit Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(x,idx) in displayData">
                        <td align="center">{{idx+1}}.</td>
                        <td align="center" v-if="permission()">
                          <a class="text-black" href="#" @click.prevent="deleteData(x.package_code)"><i class="far fa-trash-alt text-danger"></i></a>
                          <a class="text-black" href="#" @click.prevent="setEdit(x)"><i class="fa fa-pencil-square-o"></i></a>
                        </td>
                        <td align="center" class="text-bold">{{x.package_code}}</td>
                        <td>{{x.package_name}}</td>
                        <td align="center">{{x.adduser}}</td>
                        <td align="center">{{$date(x.add_dt, 'DD/MM/YYYY HH:mm')}}</td>
                        <td align="center">{{x.edituser}}</td>
                        <td align="center">{{$date(x.edit_dt, 'DD/MM/YYYY HH:mm')}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-12 col-md-12">
                <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
                <b class="pull-right margin-t-10">(จำนวนข้อมูลทั้งหมด {{datalist.length || 0}} รายการ)</b>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal Create / Edit -->
        <modal ref="addModal">
          <template slot="header">
            <h4>{{editMode ? 'Edit' : 'Create'}}</h4>
          </template>
          <template slot="body">
            <div class="row">
              <div class="col-lg-2 col-md-2 col-sm-2">
                <div class="form-group">
                  <label class="text-danger">Package Code</label>
                  <input type="text" class="form-control input-sm" v-model="form['package_code']" maxlength="10" :disabled="editMode" />
                </div>
              </div>
              <div class="col-lg-4 col-md-2 col-sm-2">
                <div class="form-group">
                  <label>Package Description</label>
                  <input type="text" class="form-control input-sm" v-model="form['package_name']" maxlength="200" />
                </div>
              </div>
              <div class="col-lg-6 margin-t-25 ">
                <button type="button" class="btn btn-sm  btn-info pull-right " @click="FormModal()"><i class="fa fa-plus"></i>&nbsp;&nbsp;{{ui.new == null ? "New" : ui.new }}</button>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-12 col-md-12 col-sm-12">
                <div class="table-responsive">
                  <table class="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th class="tf-1">No.</th>
                        <th class="tf-2 text-center" v-if="permission()">Delete</th>
                        <th class="tf-3 text-center">Form Code</th>
                        <th class="tf-5">Form Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(x,idx) in detailData">
                        <td align="center">{{idx+1}}.</td>
                        <td align="center" v-if="permission()">
                          <a href="#" @click.prevent="delDetail(x)"><i class="fa fa-trash text-danger"></i></a> 
                        </td>
                        <td>{{x.formcode}}</td>
                        <td>{{x.formname}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </template>
          <template slot="footer">
            <!-- <button type="button" class="btn btn-sm  btn-info pull-left" @click="FormModal()"><i class="fa fa-plus"></i>&nbsp;&nbsp;{{ui.new == null ? "New" : ui.new }}</button> -->
            <!-- <button type="button" class="btn btn-sm  btn-danger pull-left"  @click="deleteData()"><i class="fa fa-trash"></i>&nbsp;&nbsp;{{ui.delete == null ? "Delete" : ui.delete}}</button> -->
            <button type="button" class="btn btn-sm btn-success" @click="saveData()"><i class="fa fa-save"></i>&nbsp;&nbsp;{{ui.save == null ? "Save" : ui.save}}</button>
          </template>
        </modal>

        <input type="file" ref="File" accept=".xls, .xlsx" v-show="false" />
      </template>
    </re-page>

    <!--Center Modal-->
    <vue-form-list ref="form_modal" id="form_modal" @send-data="sendComponent($event, 'form')" :filter_code="filter_code()" ></vue-form-list>
  </div>
</template>
<script>
  import XLSX from 'xlsx';

  let page = {};
  let paging = {};
  let process = false;
  let cpn = {
    data() {
      return {
        ui: window.ui,
        auth,
        pageNumber: 1,
        editMode: false,
        search: {},
        form: {},
        datalist: [], 
        displayData: [],
        detailData: [], 
      };
    },
    methods: {
      async pageChange(pn) {
        pn = pn || 1;
        this.pageNumber = pn;
        paging.setCurrentPage(pn);
        this.displayData = $linq(this.datalist).skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray();
        paging.createPagesArray();
      }, 
      doSearch() {
        paging.setCurrentPage(1);
        this.loadData();
      },
      resetData() {
        this.editMode = false;
        this.form = {};
        this.detailData = [];
      },
      async loadData() {
        let act = `csm/master/FormPackage_ReadList?search_text=${encodeURIComponent(this.search.text || '')}`;
        let rsp = await $xt.getServer(act);
        this.datalist = rsp.data.data_rows;
        this.total_datalist = rsp.data.total;
         
        let i = 0;
        $linq(this.datalist).foreach(x => {
          x.item = ++i;
        });
        this.pageChange(this.pageNumber);
        paging.setTotalItems(rsp.data.total);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
      },
      async readData(code) {
        page.loadingBox.show();
        let act = `csm/master/FormPackage_Read?code=${encodeURIComponent(code || '')}`;
        let rsp = await $xt.getServer(act);
        this.form = rsp.data.header;
        this.detailData = rsp.data.detail;
        page.loadingBox.hide();
      },
      async saveData() {
        if (process) return;
        try {
          let f = {
            header: this.form,
            detail: this.detailData
          };
          let act = `CSM/MASTER/FormPackage_CreateAndUpdate`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          await this.loadData();
          // await this.readData(rsp.data);

          this.$refs.addModal.closeModal()
          $msg.alert(``, `Success`, `success`);
          // this.resetData();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
      },
      async setEdit(x) {
        this.$refs.addModal.openModal()
        this.editMode = true;
        this.readData(x.package_code);
      },
      async delDetail(x) {
        if (!await $msg.confirm(`คุณต้องการลบข้อมูล : ${x.formcode} นี้ใช่หรือไม่`)) {
          return;
        }
        this.detailData = $linq(this.detailData).where(y => y.formcode != x.formcode).toArray();
      },
      async deleteData(code) {
        if (process) return;
        if (!await $msg.confirm(`คุณต้องการลบข้อมูล Package Code : ${code || this.form.package_code} นี้ใช่หรือไม่`)) {
          return;
        }
        try {
          let f = {
            code: code || this.form.package_code
          };
          let act = `CSM/Master/FormPackage_Delete`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          await this.resetData();
          await this.loadData();

          $msg.alert(``, `Success`, `success`);
          // this.onChangeTab(0);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {

          process = false;
          page.loadingBox.hide();
        }
      },
      onRefresh(){
        this.form = {};
        this.detailData = [];
        this.editMode = false;
      },
      addNew() {
        this.editMode = false;
        this.detailData = [];
        this.form = {};
        this.$refs.addModal.openModal()

      },
      FormModal() {
        this.$refs.form_modal.openModal();
      },
      async sendComponent(e, type) {
        let f = {
          formcode: e.formcode,
          formname: e.formname
        };

        this.detailData.push(f);
      },
      addFile() {
        $(this.$refs.File).click();
      },
      onExport() {
        let arr = [];

        if (this.datalist.length > 0) {
          $linq(this.datalist).foreach(x => {
            arr.push({
              'package_code': x.package_code,
              'package_name': x.package_name,
              'adduser': x.adduser,
              'add_dt': moment(x.add_dt).format('YYYY-MM-DD HH:mm:ss'),
              'edituser': x.edituser,
              'edit_dt': moment(x.edit_dt).format('YYYY-MM-DD HH:mm:ss'),
              // 'active': x.active,
              // 'priority_status': x.priority_status,
            })
          });
        }
        else {
          arr.push({
            'package_code': "",
            'package_name': "",
            'adduser': "",
            'add_dt': "",
            'edituser': "",
            'edit_dt': "",
            // 'active': "",
            // 'priority_status': "",
          })
        }
        var dataWS = XLSX.utils.json_to_sheet(arr);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, dataWS);
        XLSX.writeFile(wb, 'Priority.xlsx');
      },
      async doUpload(f) {
        page.loadingBox.show();
        try {
          let act = `CSM/Master/PriorityImport`;
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
      filter_code(){
        return $linq(this.detailData).select(x => x.formcode).toArray()
      }
    },
    computed: {
      configData() { return store.state.configData },
    },
    mounted() {
      (async () => {
        page = this.$refs.page;
        page.pageTitle = `Setup : Form Sets`;
        document.title = page.pageTitle;

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(10);
        
        this.$refs.addModal.setSize('modal-lg')
        
        this.resetData();
        this.loadData();

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
