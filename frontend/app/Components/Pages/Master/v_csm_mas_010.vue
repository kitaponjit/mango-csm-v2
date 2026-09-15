<template>
  <div>
    <re-page ref="page">
      <template #body>
        <app-form-2 ref="appForm"
        exportSelect="B"
        exportUrl="csm/master/Request_Export"
        >
          <template #form-detail>
            <div class="box box-widget">
              <div class="box-body">
                <div class="row d-flex">
                  <div class="col-md-3">
                    <div class="form-group">
                      <label v-text="ui.search_by || 'Search By'"></label>
                      <select class="form-control input-sm" v-model="searchData.search_field">
                        <option value="req_code">Request Code</option>
                        <option value="req_des">Request Description</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label v-text="ui.search || 'Search'"></label>
                      <div class="input-group">
                        <input type="text" class="form-control input-sm" v-model="searchData.search_text" @keyup.enter="doSearch()" />
                        <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click.prevent="doSearch()"><i class="fas fa-search"></i></button></span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="form-group">
                      <label>&nbsp;</label>
                      <div class="form-check form-switch form-check-custom form-check-solid form-check-sm me-5">
                        <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="searchData.search_active" @change="doSearch()" />
                        <label class="form-check-label">Active</label>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 col-md-offset-4 align-content-end margin-b-8">
                    <span class="pull-right">(จำนวนข้อมูลทั้งหมด {{ requestCodeTotal || 0 }} รายการ)</span>
                  </div>
                </div>
                <div class="row">
                  <div class="col-sm-12 col-md-12 col-lg-12">
                    <ag-table ref="agr"
                      :footer="false"
                      @ready="initTable()"
                      :saveColumns="'Y'"
                      :doctype="'VIEW'"
                      :page_name="'v_csm_mas_010'"
                    ></ag-table>
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
        </app-form-2>
      </template>
    </re-page>
    <modal-2 ref="formModal">
      <template #header>
        <h4><i class="fa fa-edit">  {{ !isEdit ? 'Add Request Code' : 'Edit Request Code' }} </i></h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-4">
            <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(form.req_code)}">
              <label class="text-danger">Request Code</label><span class="pull-right">{{xt.textLength(form.req_code, 20)}}</span>
              <input type="text" class="form-control input-sm" v-model.trim="form.req_code" :readonly="isEdit" maxlength="20" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="d-flex margin-t-25">
              <div class="form-check form-check-custom form-check-solid form-check-sm">
                <input class="form-check-input" type="checkbox" v-model="form['active']" true-value="Y" false-value="N"/>
                <label class="form-check-label"><span>Active</span></label>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <label>Request Description</label><span class="pull-right">{{xt.textLength(form.req_des, 200)}}</span>
              <input type="text" class="form-control input-sm" v-model.trim="form.req_des" maxlength="200" />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
          <button class="btn btn-sm btn-success" @click.prevent="onSave()">
            <i class="fas fa-save"></i><span v-text="ui.save || 'Save Document'"></span>
          </button>
      </template>
    </modal-2>
    <!-- Modal : Template Import Data -->
    <import-data ref="importData" @send-import="onImport($event)" :clear-input="()=> importForm = {}" :default-input="defaultImport">
      <template #body-import>
        <div class="row">
          <div class="col-md-12 margin-b-10">
            <button class="btn btn-sm btn-success" @click.prevent="onTemplateExcel"><i class="fas fa-download"></i> ดาวน์โหลดเทมเพลต</button>
          </div>
        </div>
        <div class="row">
          <div class="col-md-2">
            <div class="form-group">
              <label>Request Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['req_code']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Request Description</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['req_des']" maxlength="2" />
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
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let paging = {};
  let appForm = {};
  let cpn = {
    data() {
      return {
        auth,
        pageNumber: 1,
        form: {},
        ui: window.ui,
        xt : $xt,
        isEdit: false,
        requestCodeData : [],
        requestCodeTotal : [],
        searchData : {
          search_field : "req_code",
          search_text : "",
          search_active: "Y"
        },
        importForm: {
          req_code: 'A',
          req_des: 'B',
          active: 'C'
        }
      };
    },
    methods: {
      async pageChange(pn) {
        this.page_number = pn
        paging.setCurrentPage(pn)
        await this.loadData()
      },
      doSearch() {
        paging.setCurrentPage(1);
        this.loadData();
      },
      resetData() {
        this.isEdit = false;
        this.form = {
          req_code: "",
          req_des: "",
          active: "N"
        };
      },
      setNew() {
      this.resetData();
      this.form.active = "Y"
      this.$refs.formModal.openModal();
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
          let act = `CSM/Master/RequestTypeImportData`;
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
            req_code: x[this.importForm.req_code],
            req_des: x[this.importForm.req_des],
            active: x[this.importForm.active]
          })
        })
        return arr
      },
      defaultImport() {
        this.importForm = {
          req_code: 'A',
          req_des: 'B',
          active: 'C'
        }
      },
      async onTemplateExcel(){
        let act = `csm/master/TemplateExcelRequest`
        let rsp = await $xt.getServer(act)
        window.open(window.dataServer + `API/File/DownLoad?download=true&id=${rsp.data}`)

      },
      async setEdit(x) {
        this.isEdit = true;
        await this.readData(x.req_code);
        this.$refs.formModal.openModal();
      },
      initTable() {
        let agr = this.$refs.agr;
        let fields = [
          ["rowno", "No.", "number", { width: 100, align: "center", pinned: "left" }],
        ];
        if (this.permission()) {
          fields.push(   ['', 'Action', 'text', { width: 160, child:
      [
             ["", "Edit", "text", {
            width: 120,
            align: "center",
            pinned: 'left',
            cellRenderer: (params) => {
        console.log('params.rowIndex',params.rowIndex)
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
    }],);
        }
        fields = fields.concat([
          ["req_code", "Request Code", "text", { width: 180, sortable: true, align: "center" }],
          ["req_des", "Request Description", "text", { width:500, sortable: true }],
          ["active", "Active", "text", { width: 120, align: "center", sortable: true,
            cellRenderer: (params) => params.value === 'Y'
              ? `<span style="color:#00c116;">Yes</span>`
              : `<span style="color:#ff0000;">No</span>`
          }],
          ["adduser", "Add User", "text", { width: 120 }],
          ["add_dt", "Add Date", "text", { width: 150, align: "center",
            cellRenderer: (params) => params.value ? moment(params.value).format('DD/MM/YYYY HH:mm') : ''
          }],
          ["edituser", "Edit User", "text", { width: 120 }],
          ["edit_dt", "Edit Date", "text", { width: 150, align: "center",
            cellRenderer: (params) => params.value ? moment(params.value).format('DD/MM/YYYY HH:mm') : ''
          }],
        ]);
        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
        agr.setDisplay(this.requestCodeData);
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
          this.setEdit(this.requestCodeData[idx]);
        }
        if (deleteBtn) {
          e.preventDefault();
          let idx = parseInt(deleteBtn.getAttribute('data-idx'));
          this.onDeleteData(this.requestCodeData[idx]);
        }
      },
      async loadData() {
        try {
          page.loadingBox.show();
          let act = `csm/master/Request_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
          for (var key in this.searchData) {
            act += `&${key}=${encodeURIComponent(this.searchData[key])}`
          }
          let rsp = await $xt.getServer(act);
          this.requestCodeTotal = rsp.data.total;
          this.requestCodeData = rsp.data.data;

          paging.setTotalItems(rsp.data.total);
          if (!paging.getItemsPerPage()) {
            paging.setCurrentPage(1);
          }
          paging.createPagesArray();
          this.initTable();

        } catch (error) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async readData(req_code) {
        try {
          page.loadingBox.show();
        let act = `csm/master/Request_Read?req_code=${encodeURIComponent(req_code || '')}`;
          let rsp = await $xt.getServer(act);
          this.form = rsp.data;
        } catch(ex){
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async onSave() {
        try {
          page.loadingBox.show();

          let f = {
            header: this.form
          };
          let act = `csm/master/Request_Create`;
          if (this.isEdit) {
            act = `csm/master/Request_Update`;
          }
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          this.resetData();
          await this.loadData();
          $msg.alert(`Success`, `Your information has been saved successfully.` , `success`)
          this.$refs.formModal.closeModal();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async onDeleteData(x) {
        if (!await $msg.confirm(`Do you want to delete this request description : ${x.req_des} ?`)) {
          return;
        }
        try {
          page.loadingBox.show();
          let f = {
            header: x
          };
          
          let act = `csm/master/Request_Delete`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.resetData();
          await this.loadData();
          $notify.success(ui.alert_save_success)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      // async doUpload(f) {
      //   page.loadingBox.show();
      //   try {
      //     let act = `CSM/Master/RequestTypeImport`;
      //     let fd = new FormData();
      //     fd.append('file', f);

      //     let rsp = await $xt.postServerForm(act, fd);
      //     if (!rsp.success) {
      //       throw new Error(rsp.error);
      //     }
      //     else {
      //       $notify.success(ui.alert_save_success);
      //       await this.loadData();
      //     }
      //   } catch (ex) {
      //     $msg.alert("Error", ex.toString(), "danger");
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
    },
    mounted() {
        page = this.$refs.page;
        page.pageTitle = 'Setup : Department ';
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



        this.resetData();
        this.loadData();
    }
  };

  export default cpn;
</script>
