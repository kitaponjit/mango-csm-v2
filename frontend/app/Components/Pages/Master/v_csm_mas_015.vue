<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <app-form-2 ref="appForm"
          exportName="Descrioption_export"
          exportSelect="B"
          exportUrl="anywhere/master/Description_Export"
        >
          <template slot="form-detail">
            <div class="box box-widget">
              <div class="box-body">
                <div class="row d-flex">
                  <div class="col-md-2">
                    <div class="form-group">
                      <label v-text="ui.search_by || 'Search By'"></label>
                      <select class="form-control input-sm" v-model="searchData.field" @change="doSearch()">
                        <option value="descode">Code</option>
                        <option value="desname">Description</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-group">
                      <label v-text="ui.search || 'Search'"></label>
                      <div class="input-group">
                        <input type="text" class="form-control input-sm" v-model="searchData.text"  @keyup.enter="doSearch()" />
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
                    <span class="pull-right">(จำนวนข้อมูลทั้งหมด {{ descriptionTotal || 0 }} รายการ)</span>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-12">
                    <ag-table ref="agr"
                      :footer="false"
                      @ready="initTable()"
                      :saveColumns="'Y'"
                      :doctype="'VIEW'"
                      :page_name="'v_csm_mas_015'"
                    ></ag-table>
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
        <h4><i class="fa fa-edit">  {{ !isEdit ? 'Add Description' : 'Edit Description' }} </i></h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group" >
              <label>Description Code</label>
              <input type="text" class="form-control" v-model="form.descode" :readonly="isEdit"/>
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Group</label>
              <input type="text" class="form-control" v-model="form.desgroup" readonly />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <label for="name">Description Name</label>
              <textarea class="form-control input-sm" rows="3" v-model.trim="form.desname" maxlength="500"></textarea>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <label>Remark</label>
              <textarea class="form-control input-sm" rows="3" v-model.trim="form.desname2" maxlength="200"></textarea>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <label>Reference</label>
              <input type="text" class="form-control " v-model.trim="form.refcode" maxlength="20" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-2 col-md-2">
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
              <label>Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['descode']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Description Name</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['desname']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Reference</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['refcode']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Remark</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['desname2']" maxlength="2" />
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
  let page = {};
  let paging = {};
  let appForm = {};
  let cpn = {
    data() {
      return {
        auth,
        xt : $xt,
        ui : window.ui,
        page_number: 1,
        search: {
        },
        searchData : {
          field : "descode",
          text : "",
          active : "Y",
          type : "CSM"
        },
        descriptionData: [],
        descriptionTotal : 0,
        isEdit: false,
        form: {
          desgroup: "CSM"
        },
        importForm: {
          descode: 'A',
          desname: 'B',
          refcode: 'C',
          desname2: 'D',
          active: 'F'
        }
      };
    },
    methods: {
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
          ["descode", "Code", "text", { width: 160, align: "center" , pinned: "left", sortable: true,
            cellRenderer: (params) => params.value ? `<b>${params.value}</b>` : ''
          }],
          ["desname", "Description Name", "text", { width: 300, sortable: true }],
          ["desgroup", "Group", "text", { width: 140, align: "center", sortable: true }],
          ["refcode", "Reference", "text", { width: 160 }],
          ["desname2", "Remark", "text", { width: 240 }],
          ["active", "Active", "text", { width: 90, align: "center",
            cellRenderer: (params) => params.value === 'Y'
              ? `<span style="color:#00c116;">Yes</span>`
              : `<span style="color:#ff0000;">No</span>`
          }],
          ["adduser", "Add By", "text", { width: 140 }],
          ["add_dt", "Add Date", "text", { width: 160, align: "center",
            cellRenderer: (params) => params.value ? moment(params.value).format('DD/MM/YYYY') : ''
          }],
          ["edituser", "Edit By", "text", { width: 140 }],
          ["edit_dt", "Edit Date", "text", { width: 160, align: "center",
            cellRenderer: (params) => params.value ? moment(params.value).format('DD/MM/YYYY') : ''
          }],
        ]);
        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
        agr.setDisplay(this.descriptionData);
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
          this.setEdit(this.descriptionData[idx]);
        }
        if (deleteBtn) {
          e.preventDefault();
          let idx = parseInt(deleteBtn.getAttribute('data-idx'));
          this.onDeleteData(this.descriptionData[idx]);
        }
      },
      setNew() {
        this.form = {
          desgroup: "CSM",
          active:"Y"
        };
        this.isEdit = false;
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
          let act = `anywhere/master/Description_ImportData_CSM`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            //throw new Error(rsp.error);
            $msg.alert(`Warning`, rsp.error.toString(), `warning`);
          }
          else {
            $notify.success(this.ui.alert_save_success)
            this.$refs.importData.closeImport()
            await this.loadDisplay();
          }
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
            descode: x[this.importForm.descode],
            desname: x[this.importForm.desname],
            refcode: x[this.importForm.refcode],
            desname2: x[this.importForm.desname2],
            active: x[this.importForm.active]
          })
        })
        return arr
      },
      defaultImport() {
        this.importForm = {
          descode: 'A',
          desname: 'B',
          refcode: 'C',
          desname2: 'D',
          active: 'F'
        }
      },
      async onTemplateExcel(){
        let act = `anywhere/master/TemplateExcelDescription`
        let rsp = await $xt.getServer(act)
        window.open(window.dataServer + `API/File/DownLoad?download=true&id=${rsp.data}`)

      },
      async setEdit(x) {
        this.isEdit = true;
        await this.readData(x.req_code);
        this.$refs.formModal.openModal();
      },
      async pageChange(pn) {
        this.page_number = pn
        paging.setCurrentPage(pn)
        await this.loadDisplay()
      },
      doSearch() {
        this.page_number = 1;
        this.loadDisplay();
      },
      async loadDisplay() {
        try {
          page.loadingBox.show();

          let act = `anywhere/master/Description_ReadList?type=CSM&skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
          for (var key in this.searchData) {
            act += `&${key}=${encodeURIComponent(this.searchData[key])}`
          }
          let rsp = await $xt.getServer(act);
          this.descriptionData = rsp.data
          this.descriptionTotal = rsp.total
          paging.setTotalItems(rsp.total);
          if (!paging.getItemsPerPage()) {
            paging.setCurrentPage(1);
          }
          paging.createPagesArray();
          this.initTable();
          
        } catch (err) {
          $msg.alert(``, err.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async onReadData(x) {
        try {
          page.loadingBox.show();
          let act = `anywhere/master/Description_Read?type=CSM&descode=${encodeURIComponent(x.descode || '')}`;
          let rsp = await $xt.getServer(act);
          this.form = rsp
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
            data: this.form
          };
          let act = `anywhere/master/Description_Create?type=CSM&`;
          if (this.isEdit) {
            act = `anywhere/master/Description_Update?type=CSM&`;
          }
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
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
        if (!await $msg.confirm(`Do you want to delete this description code : ${x.descode} ?`)) {
          return;
        }
        try {
          page.loadingBox.show();
          let act = `Anywhere/master/Description_Delete?type=CSM&descode=${x.descode || ''}`;
          let rsp = await $xt.getServer(act);
          if (!rsp.success) {
            throw rsp.error;
          }
          await this.loadDisplay();
          $notify.success(this.ui.alert_save_success)
        } catch (err) {
          $msg.alert(``, rsp.error, `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async setEdit(x) {
      this.isEdit = true
      await this.onReadData(x)
      this.$refs.formModal.openModal()
      },
    async  is_mango() {
        let isMango =await $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
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
    async mounted() {
        page = this.$refs.page;
        page.pageTitle = `Setup : คำที่ใช้บ่อย`;
        document.title = page.pageTitle;

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(500);
        this.$refs.formModal.setSize("modal-sm");

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

        await this.loadDisplay();
    }
  };

  export default cpn;
</script>
