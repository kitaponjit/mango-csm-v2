<template>
  <div>
    <re-page ref="page">
      <template #body>
        <app-form-2 ref="appForm"
          :exportData_header="onSetup_beforeExport('header')"
          :exportData="onSetup_beforeExport('detail')"
          exportName=""
          exportSelect="B"
          exportUrl="csm/master/WarrantyGroup_ExportExcel"
        >
          <template #form-detail>
            <div class="box box-widget">
              <div class="box-body">
                <div class="row d-flex">
                  <div class="col-md-2">
                    <div class="form-group">
                      <label v-text="ui.search_by || 'Search By'"></label>
                      <select class="form-control input-sm" v-model="searchData.field">
                        <option value="type_code">Group Code</option>
                        <option value="type_name">Group Name</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-group">
                      <label v-text="ui.search || 'Search'"></label>
                      <div class="input-group">
                        <input type="text" class="form-control input-sm" v-model="searchData.text" @keyup.enter="doSearch()" />
                        <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click.prevent="doSearch()"><i class="fas fa-search"></i></button></span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="form-group">
                      <label>&nbsp;</label>
                      <div class="form-check form-switch form-check-custom form-check-solid form-check-sm me-5">
                        <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="searchData.active" @change="doSearch()" />
                        <label class="form-check-label">Active</label>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 col-md-offset-4 align-content-end margin-b-8">
                    <span class="pull-right">(จำนวนข้อมูลทั้งหมด {{ GroupcodeTotal || 0 }} รายการ)</span>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-12">
                    <ag-table ref="agr"
                              :footer="false"
                              :sorting="true"
                              @cell-clicked="onCellClicked"
                              @ready="initTable()">
                    </ag-table>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-3">
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
        <h4><i class="fa fa-edit">  {{ !isEdit ? 'Add Group Code' : 'Edit Group Code' }} </i></h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(form.type_code)}">
              <label class="text-danger">Group Code</label><span class="pull-right">{{xt.textLength(form.type_code, 20)}}</span>
              <input type="text" class="form-control input-sm" v-model.trim="form.type_code" :readonly="isEdit" maxlength="20" />
            </div>
          </div>
          <div class="col-md-7">
            <div class="form-group">
              <label>Group Name</label><span class="pull-right">{{xt.textLength(form.type_name, 200)}}</span>
              <input type="text" class="form-control input-sm" v-model.trim="form.type_name" maxlength="200" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="d-flex margin-t-25">
              <div class="form-check form-check-custom form-check-solid form-check-sm">
                <input class="form-check-input" type="checkbox" v-model="form.active" true-value="Y" false-value="N"/>
                <label class="form-check-label"><span>Active</span></label>
              </div>
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
              <label>Group Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['type_code']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Group Name</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['type_name']" maxlength="2" />
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
      ui: window.ui,
      auth,
      xt : $xt,
      searchData: {
        field : "type_code",
        text : "",
        active : "Y"
      },
      GroupcodeData: [],
      GroupcodeTotal : 0,
      isEdit: false,
      form: {},
      dataAdmin: {},
      page_number : 1,
      importForm: {
        type_code: 'A',
        type_name: 'B',
        active: 'C'
      }
    };
  },
  methods: {
    initTable() {
      let agr = this.$refs.agr;
      let fields = [
        ["rowno", "No.", "text", { width: 100, align: "center" }],
      ];
      
      if (this.permission()) {
        fields.push(["action_edit", "Edit", "text", { width: 120, align: "center", cellRenderer: () => `<a class="text-black"><i class="fa fa-edit"></i></a>` }]);
        fields.push(["action_del", "Delete", "text", { width: 120, align: "center", cellRenderer: () => `<a class="text-danger"><i class="far fa-trash-alt"></i></a>` }]);
      }
      
      fields.push(
        ["type_code", "Group Code", "text", { width: 180 }],
        ["type_name", "Group Name", "text", { flex: 1 }],
        ["default_", "Default", "text", { width: 120, align: "center", cellRenderer: (p) => p.data.default_ === 'Y' ? `<i class="fas fa-check-circle" style="color:#2563eb"></i>` : `<i class="far fa-circle" style="color:#cbd5e1"></i>` }],
        ["active", "Active", "text", { width: 120, align: "center", cellRenderer: (p) => p.data.active === 'Y' ? `<span style="color:#00c116;font-weight:600">Yes</span>` : `<span style="color:#ff0000;font-weight:600">No</span>` }],
        ["add_user", "Add By", "text", { width: 120 }],
        ["add_dt", "Add Date", "datetime", { width: 160, align: "center" }, { useCellRenderer: true }],
        ["edit_user", "Edit By", "text", { width: 120 }],
        ["edit_dt", "Edit Date", "datetime", { width: 160, align: "center" }, { useCellRenderer: true }]
      );
      
      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);
      agr.setDisplay(this.GroupcodeData);
    },
    onCellClicked(event) {
      if (event.col === 'action_edit') {
        this.setEdit(event.data);
      } else if (event.col === 'action_del') {
        this.onDeleteData(event.data);
      } else if (event.col === 'default_') {
        if (event.data.active !== 'N') {
          event.data.default_ = event.data.default_ === 'Y' ? 'N' : 'Y';
          this.UpdateDefault(event.data);
        }
      }
    },
    reset() {
      this.isEdit = false
      this.form = {
        type_code : "",
        type_name : ""
      }
    },
    setNew() {
      this.reset();
      this.form.active = "Y"
      this.$refs.formModal.setSize("modal-md");
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
        let act = `CSM/Master/WarrantyGroup_ImportData`;
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw new Error(rsp.error);
        }
        $notify.success(this.ui.alert_save_success)
        this.$refs.importData.closeImport()
        await this.loadDisplay();
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
          type_code: x[this.importForm.type_code],
          type_name: x[this.importForm.type_name],
          active: x[this.importForm.active]
        })
      })
      return arr
    },
    defaultImport() {
      this.importForm = {
        type_code: 'A',
        type_name: 'B',
        active: 'C'
      }
    },
    async onTemplateExcel(){
        let act = `csm/master/TemplateExcelWarrantyGroup`
        let rsp = await $xt.getServer(act)
        window.open(window.dataServer + `API/File/DownLoad?download=true&id=${rsp.data}`)

      },
    doSearch() {
      this.loadDisplay();
      paging.setCurrentPage(1);
    },
    async loadDisplay() {
      try {
        page.loadingBox.show();
        let act = `csm/master/WarrantyGroup_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
        for (var key in this.searchData) {
          act += `&${key}=${encodeURIComponent(this.searchData[key])}`
        }
        let rsp = await $xt.getServer(act);
        this.GroupcodeData = rsp.data.data
        this.GroupcodeTotal = rsp.data.total
  
        let rowno = paging.skipItems() == 0 ? 0 : paging.skipItems()
        this.GroupcodeData.forEach( x => {
          x.rowno = ++rowno
        });
        paging.setTotalItems(rsp.data.total)
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1)
        }
        paging.createPagesArray()
        
        if (this.$refs.agr) {
          this.$refs.agr.setDisplay(this.GroupcodeData);
        }
        
      } catch (error) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        page.loadingBox.hide();
      }

    },
    async onSearch() {
      this.pageChange(1)
    },
    async pageChange(pn) {
      this.page_number = pn
      paging.setCurrentPage(pn)
      await this.loadDisplay()
    },
    async setEdit(x) {
      this.isEdit = true
      await this.onReadData(x.type_code)
      this.$refs.formModal.openModal()
    },
    async onReadData(type_code) {
      try {
        page.loadingBox.show();
        let act = `csm/master/WarrantyGroup_Read?type_code=${encodeURIComponent(type_code || '')}`;
        let rsp = await $xt.getServer(act);
        this.form = rsp.data

      } catch (error) {
        $msg.alert(``, error.toString(), `danger`);
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
        let act = `csm/master/WarrantyGroup_Create`;
        if (this.isEdit) {
          act = `csm/master/WarrantyGroup_Update`;
        }
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw rsp.error;
        }
        
        this.reset();
        await this.loadDisplay();
        $msg.alert(`Success`, `Your information has been saved successfully.` , `success`)
        this.$refs.formModal.closeModal();
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        page.loadingBox.hide();
      }
    },
    async onDeleteData(x) {

      if (!await $msg.confirm(`Do you want to delete this group code : ${x.type_name} ?`)) {
        return;
      }
      try {
        page.loadingBox.show();
        let f = {
          header: x
        };
        let act = `csm/master/WarrantyGroup_Delete`;
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw rsp.error;
        }
        this.reset();
        await this.loadDisplay();
        $notify.success(this.ui.alert_save_success)
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
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
    onSetup_beforeExport(keyword){
      switch(keyword) {
        case "header" :
          let header = [
              {
                header : 'Type Code', key : 'type_code', fill : { type: 'pattern', pattern: 'none', fgColor: { argb: 'ffffffff' }, bgColor: {argb:'00000000'} }
              },
              {
                header : 'Type Name', key : 'type_name', fill : { type: 'pattern', pattern: 'none', fgColor: { argb: 'ffffffff' }, bgColor: {argb:'00000000'} }
              }
            ];
          return header
        case "detail" :
          let detail = []
          this.GroupcodeData.forEach(x => {
            detail.push({
              'type_code' : x.type_code,
              'type_name' : x.type_name
            })
          })
        return detail
      }
    },
    async UpdateDefault(x)
    {
      try {
        let f = {
          header: x
        };
        let act = `CSM/MASTER/WarrantyGroup_UpdateD`;
        page.loadingBox.show();
        let rsp = await $xt.postServerJson(act, f);
        if (!rsp.success) {
          throw rsp.error;
        }

        await this.loadDisplay();
        $notify.success(this.ui.alert_save_success)
      //  this.resetData();
      } catch (ex) {
        $msg.alert(``, ex.toString(), `danger`);
      } finally {
        page.loadingBox.hide();
      }

    },
    // async doUpload(f) {
    //     page.loadingBox.show();
    //     try {
    //       let act = `CSM/Master/ConnectionImport`;
    //       let fd = new FormData();
    //       fd.append('file', f);
    //       let rsp = await $xt.postServerForm(act, fd);
    //       if (!rsp.success) {
    //         throw rsp.error
    //       }
          
    //       $notify.success(this.ui.alert_save_success)
    //       await this.loadDisplay();
    //     } catch (ex) {
    //       $msg.alert("", ex.toString(), "danger");
    //     }
    //     finally {
    //       page.loadingBox.hide();
    //     }
    //   },
  },
  computed: {
    configData() { return store.state.configData },
  },
  mounted() {
      
    page = this.$refs.page;
    page.pageTitle = `Master : กลุ่มงานประกัน`;
    document.title = page.pageTitle;
    this.$refs.formModal.setSize("modal-sm");

    paging = this.$refs.paging;
    paging.setCurrentPage(1);
    paging.setItemsPerPage(500);
    
    appForm = this.$refs.appForm
    appForm.btnDelete.show = false
    appForm.btnSave.show = false
    appForm.btnNew.click = this.setNew
    appForm.btnImport.click = this.setImport

    this.reset();
    this.loadDisplay();

  }
};
export default cpn;
</script>
