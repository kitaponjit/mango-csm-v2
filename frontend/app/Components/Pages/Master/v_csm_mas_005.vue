<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <app-form-2 ref="appForm"
          exportName=""
          exportSelect="B"
          exportUrl="csm/master/CustomerContactType_Export"
        >
          <template slot="form-detail">
            <div class="box box-widget">
              <div class="box-body">
                <div class="row d-flex">
                  <div class="col-md-2">
                    <div class="form-group">
                      <label v-text="ui.search_by || 'Search By'"></label>
                      <select class="form-control input-sm" v-model="search.field">
                        <option value="contact_code">Contact Code</option>
                        <option value="contact_name">Contact Name</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-group">
                      <label v-text="ui.search || 'Search'"></label>
                      <div class="input-group">
                        <input type="text" class="form-control input-sm" v-model="search.text" @keyup.enter="doSearch()" />
                        <span class="input-group-btn"><button class="btn btn-sm bg-navy"@click.prevent="doSearch()"><i class="fas fa-search"></i></button></span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="form-group">
                      <label>&nbsp;</label>
                      <div class="form-check form-switch form-check-custom form-check-solid form-check-sm me-5">
                        <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="search.active" @change="doSearch()" />
                        <label class="form-check-label">Active</label>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 col-md-offset-4 align-content-end margin-b-8">
                    <span class="pull-right">(จำนวนข้อมูลทั้งหมด {{ total_datalist || 0 }} รายการ)</span>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-12">
                    <ag-table ref="agr"
                      :footer="false"
                      @ready="initTable()"
                      :saveColumns="'Y'"
                      :doctype="'VIEW'"
                      :page_name="'v_csm_mas_005'"
                    ></ag-table>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12">
                    <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"/>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </app-form-2>
      </template>
    </re-page>
    <modal-2 ref="setup_connection">
      <template #header>
        <h4><i class="fa fa-edit"/>{{ editMode ? "Edit Contact Code" : "Add Contact Code" }}</h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-lg-3 col-md-6">
            <div class="form-group" :class="{'has-error': !form.contact_code }">
              <label >Contact Code</label><span class="pull-right">{{ xt.textLength(form.contact_code, 20)}}</span>
              <input type="text" class="form-control" v-model.trim="form.contact_code" :readonly="editMode" :disabled="editMode" maxlength="20" />
            </div>
          </div>
          <div class="col-lg-6 col-md-6"><span class="pull-right">{{ xt.textLength(form.contact_name, 200)}}</span>
            <div class="form-group" :class="{'has-error': !form.contact_name }">
              <label>Contact Name</label>
              <input type="text" class="form-control" v-model.trim="form.contact_name" maxlength="200" />
            </div>
          </div>
          <div class="col-lg-1 col-md-1">
            <div class="d-flex margin-t-25">
              <div class="form-check form-check-custom form-check-solid form-check-sm">
                <input class="form-check-input" type="checkbox" v-model="form['active']" true-value="Y" false-value="N"/>
                <label class="form-check-label"><span>Active</span></label>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm btn-success me-1" @click="save"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
      </template>
    </modal-2>
    <!-- Modal : Template Import Data -->
    <import-data ref="importData" @send-import="onImport($event)" :clear-input="()=> importForm = {}" :default-input="defaultImport" :editable-columns="editableColumns">
      <template #body-import>
        <div class="row">
          <div class="col-md-12 margin-b-10">
            <button class="btn btn-sm btn-success" @click.prevent="onTemplateExcel"><i class="fas fa-download"></i> ดาวน์โหลดเทมเพลต</button>
          </div>
        </div>
        <div class="row">
          <div class="col-md-2">
            <div class="form-group">
              <label>Contact Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['contact_code']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Contact Name</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['contact_name']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Active</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['active']" maxlength="2" />
            </div>
          </div>
        </div>
      </template>
    </import-data>
  </div>
</template>
<script>
  import XLSX from 'xlsx';
  let page = {};
  let paging = {};
  let appForm = {};
  let process = false;
  let cpn = {
    data() {
      return {
        ui: window.ui,
        xt: $xt,
        headerNameModal: "",
        auth,
        tab1Active: 0,
        pageNumber: 1,
        search: {
          field : "contact_code",
          text : "",
          active : "Y"
        },
        datalist: [],
        displayData: [],
        editMode: false,
        total_datalist: 0,
        form: {},
        importForm: {
          contact_code: 'A',
          contact_name: 'B',
          active: 'C'
        }
      };
    },
    methods: {
      setNew() {
        this.reset();
        this.form.active = "Y"
        this.$refs.setup_connection.openModal();
      },
      setImport() {
        this.$refs.importData.openImport();
      },
      async onImport(e) {
        page.loadingBox.show();
        try {
          let f = {
            data: this.arrImport(e)
          };
          let act = `CSM/Master/CustomerContactType_ImportData`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw new Error(rsp.error);
          }
          $notify.success(this.ui.alert_save_success)
          this.$refs.importData.closeImport()
          await this.loadData();
        } catch (ex) {
          $msg.alert("", ex.toString(), "danger");
        }
        finally {
          page.loadingBox.hide();
        }
      },
      arrImport(e) {
        let arr = []
        e.forEach((x) => {
          arr.push({
            contact_code: x[this.importForm.contact_code],
            contact_name: x[this.importForm.contact_name],
            active: x[this.importForm.active]
          })
        })
        return arr
      },
      defaultImport() {
        this.importForm = {
          contact_code: 'A',
          contact_name: 'B',
          active: 'C'
        }
      },
      async onTemplateExcel(){
        let act = `csm/master/TemplateExcelContact`
        let rsp = await $xt.getServer(act)
        window.open(window.dataServer + `API/File/DownLoad?download=true&id=${rsp.data}`)

      },
      async pageChange(pn) {
        pn = pn || 1;
        this.pageNumber = pn;
        paging.setCurrentPage(pn);
        await this.loadData();
      },
      doSearch() {
        paging.setCurrentPage(1);
        this.loadData();
      },
      reset() {
        this.form = {
          contact_code: "",
          contact_name: ""
        };
        this.editMode = false;
        // appForm.btnDelete.disabled = true;
        this.loadData();
      },
      initTable() {
        let agr = this.$refs.agr;
        let fields = [
          ["item", "No.", "number", { width: 70, align: "center", pinned: "left" }],
        ];
        if (this.permission()) {
          fields.push(

   ['', 'Action', 'text', { width: 160, child:
      [
             ["", "Edit", "text", {
            width: 120,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
             return`<a href="#" class="text-black ag-action-edit" data-idx="${params.rowIndex}"><i class="fas fa-edit"></i></a>`;

            },
          }],
           ["", "Delelt", "text", {
            width: 120,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
              return ` <a href="#" class="text-danger m-5 ag-action-delete" data-idx="${params.rowIndex}"><i class="fas fa-trash-alt"></i></a>`;
            
            },
          }]
      ] 
    }], );
        }
        fields = fields.concat([
          ["contact_code", "Contact Code", "text", { width: 150, sortable: true }],
          ["contact_name", "Contact Name", "text", { width: 350, sortable: true }],
          ["active", "Active", "text", { width: 120, align: "center", sortable: true,
            cellRenderer: (params) => params.value === 'Y'
              ? `<span style="color:#00c116;">Yes</span>`
              : `<span style="color:#ff0000;">No</span>`
          }],
          ["add_user", "Add User", "text", { width: 140 }],
          ["add_dt", "Add Date", "text", { width: 180, align: "center",
            cellRenderer: (params) => params.value ? moment(params.value).format('DD/MM/YYYY') : ''
          }],
          ["edit_user", "Edit User", "text", { width: 140 }],
          ["edit_dt", "Edit Date", "text", { width: 180, align: "center",
            cellRenderer: (params) => params.value ? moment(params.value).format('DD/MM/YYYY') : ''
          }],
        ]);
        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
        agr.setDisplay(this.datalist);
        this.$nextTick(() => {
          agr.$el.removeEventListener('click', this.onTableClick);
          agr.$el.addEventListener('click', this.onTableClick);
        });
      },
      onTableClick(e) {
        let editBtn = e.target.closest('.ag-action-edit');
        let deleteBtn = e.target.closest('.ag-action-delete');
        if (editBtn) {
          e.preventDefault();
          let idx = parseInt(editBtn.getAttribute('data-idx'));
          this.edit(this.datalist[idx]);
        }
        if (deleteBtn) {
          e.preventDefault();
          let idx = parseInt(deleteBtn.getAttribute('data-idx'));
          this.deleteData(this.datalist[idx]);
        }
      },
      async loadData() {
        let act = `csm/master/CustomerContactType_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
        for (var key in this.search) {
          act += `&${key}=${encodeURIComponent(this.search[key])}`;
        }
        let rsp = await $xt.getServer(act);
        this.datalist = rsp.data.data_rows;
        this.total_datalist = rsp.data.total;

        let i = paging.skipItems() == 0 ? 0 : paging.skipItems();
        $linq(this.datalist).foreach(x => {
          x.item = ++i;
        });
        paging.setTotalItems(rsp.data.total);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
        this.initTable();
      },
      async readData(x) {
        let act = `csm/master/CustomerContactType_Read?contact_code=${encodeURIComponent(x || '')}`;
        let rsp = await $xt.getServer(act);
        this.form = rsp.data;
        this.setEdit();
      },
      async save() {
        if (process) return;
        try {
          let f = {
            header: this.form
          };
          let act = `csm/master/CustomerContactType_Create`;
          if (this.editMode) {
            act = `csm/master/CustomerContactType_Update`;
          }
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          await this.readData(rsp.data);
          await this.loadData();
          $msg.alert(`Success`, `Your information has been saved successfully.` , `success`)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
        this.$refs.setup_connection.closeModal();
      },
      async deleteData(x) {
        if (!await $msg.confirm(`ต้องการลบข้อมูลใช่หรือไม่`)) {
          return;
        }
        try {
          let f = {
            header: x
          };
          let act = `csm/master/CustomerContactType_Delete`;
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
        this.$refs.setup_connection.closeModal();
      },
      setEdit() {
        this.editMode = true; 
        if (this.editMode) {
        }
      },
      async edit(x) {
        this.editMode = true;       
        this.$refs.setup_connection.openModal();
        await this.readData(x.contact_code);
        $('html,body').scrollTop(0); 
      },
      onExport() {
        let arr = [];
        if (this.datalist.length > 0) {
          $linq(this.datalist).foreach(x => {
            arr.push({
              'contact_code': x.contact_code,
              'contact_name': x.contact_name,
            })
          });
        }
        else {
          arr.push({
              'contact_code': "",
              'contact_name': "",
            })
        }
        var dataWS = XLSX.utils.json_to_sheet(arr);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, dataWS);
        XLSX.writeFile(wb, 'Connection.xlsx');
      },
      // async doUpload(f) {
      //   page.loadingBox.show();
      //   try {
      //     let act = `CSM/Master/ConnectionImport`;
      //     let fd = new FormData();
      //     fd.append('file', f);
      //     let rsp = await $xt.postServerForm(act, fd);
      //     if (!rsp.success) {
      //       throw new Error(rsp.error);
      //     }
      //     else {
      //       $notify.success('นำเข้าข้อมูลเสร็จสิ้น');
      //       await this.loadData();
      //     }
      //   } catch (ex) {
      //     $msg.alert("", ex.toString(), "danger");
      //   }
      //   finally {
      //     page.loadingBox.hide();
      //   }
      // },
    async  is_mango() {
        let isMango = await $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
        return isMango == "Y" ? true : false;
      },
      permission() {
        let data = (!this.is_mango() || auth.is_admin);
        return data;
      },
    },
    computed: {
      configData() { return store.state.configData },
      editableColumns() {
        return [this.importForm.contact_name, this.importForm.active]
      },
    },
    mounted() {
      (async () => {
        page = this.$refs.page;
        page.pageTitle = `Setup : Connection`;
        document.title = page.pageTitle;

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(500);

        appForm = this.$refs.appForm
        appForm.btnDelete.show = false
        appForm.btnSave.show = false
      if (this.permission()) {
        appForm.btnNew.click = this.setNew
        appForm.btnImport.click = this.setImport
      } else {
        appForm.btnNew.show = false
        appForm.btnImport.show = false
      }
        this.reset();
      })();
    }
  };
  export default cpn;
</script>
