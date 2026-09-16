<template>
  <div>
    <re-page ref="page">
      <template #body> 
        <app-form-2 ref="appForm"
          exportName=""
          exportSelect="B"
          exportUrl="csm/master/GroupCode_Export"
        >
          <template #form-detail>
            <div class="box box-widget">
              <div class="box-body">
                <div class="row d-flex">
                  <div class="col-md-2">
                    <div class="form-group">
                      <label v-text="ui.search_by || 'Search By'"></label>
                      <select class="form-control input-sm" v-model="search.field">
                        <option value="serv_code">Service Code</option>
                        <option value="serv_name">Service Name</option>
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
                      :page_name="'v_csm_mas_019'"
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
    <!-- Modal : Template Import Data -->
    <import-data ref="importData" @send-import="onImport($event)" :clear-input="()=> importForm = {}" :default-input="defaultImport">
      <template #body-import>
        <div class="row">
          <div class="col-md-4">
            <div class="form-group">
              <label>Service Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['serv_code']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <label>Service Name</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['serv_name']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <label>Active</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['active']" maxlength="2" />
            </div>
          </div>
        </div>
      </template>
    </import-data>
    <modal ref="setup_connection">
      <template #header>
        <h4>{{ headerNameModal }}</h4>
      </template>
      <template #body>
        <div class="row">
          <div class="col-lg-3 col-md-6">
            <div class="form-group" :class="{'has-error': !form.serv_code }">
              <label>Service Code</label><span class="pull-right">{{ xt.textLength(form.serv_code, 20)}}</span>
              <input type="text" class="form-control" v-model.trim="form.serv_code" :readonly="editMode" :disabled="editMode" maxlength="20" />
            </div>
          </div>
          <div class="col-lg-6 col-md-6"><span class="pull-right">{{ xt.textLength(form.serv_name, 100)}}</span>
            <div class="form-group" :class="{'has-error': !form.serv_name }">
              <label>Service Name</label>
              <input type="text" class="form-control" v-model.trim="form.serv_name" maxlength="100" />
            </div>
          </div>
          <div class="col-lg-1 col-md-1 col-md-1">
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
        <button class="btn btn-sm btn-success me-1" @click="save"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
        <!-- <button class="btn btn-sm btn-danger" @click="$refs.setup_connection.closeModal()"><i class="fas fa-times"></i> ปิด</button> -->
      </template>
    </modal>
  </div>
</template>
<script>
  import XLSX from 'xlsx';
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let paging = {};
  let appForm = {};
  let process = false;
  let cpn = {
    data() {
      return {
        xt: $xt,
        headerNameModal: "",
        auth,
        tab1Active: 0,
        pageNumber: 1,
        search: {
          field : "serv_code",
          text : "",
          active : "Y"
        },
        datalist: [],
        datalist_export: [],
        editMode :false ,
        displayData: [],
        total_datalist: 0,
        form: {
          serv_code: "",
          serv_name: ""
        },
        ui: window.ui,
        importForm: {
          serv_code: 'A',
          serv_name: 'B',
          active: 'C'
        }
      };
    },
    methods: {
      initTable() {
        let agr = this.$refs.agr;
        let fields = [
          ["item", "No.", "number", { width: 100, align: "center", pinned: "left" }],
        ];
        if (this.permission()) {
          fields.push(   ['', 'Action', 'text', { width: 160, child:
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
    }],);
        }
        fields = fields.concat([
          ["serv_code", "Service Code", "text", { width: 160, align: "center" , pinned: "left" , sortable: true }],
          ["serv_name", "Service Name", "text", { width: 400, sortable: true }],
          ["active", "Active", "text", { width: 100, align: "center",
            cellRenderer: (params) => params.value === 'Y'
              ? `<span style="color:#00c116;">Yes</span>`
              : `<span style="color:#ff0000;">No</span>`
          }],
          ["add_by", "Add User", "text", { width: 140, align: "center" }],
          ["add_dt", "Add Date", "text", { width: 180, align: "center",
            cellRenderer: (params) => params.value ? moment(params.value).format('DD/MM/YYYY HH:mm') : ''
          }],
          ["edit_by", "Edit User", "text", { width: 140, align: "center" }],
          ["edit_dt", "Edit Date", "text", { width: 180, align: "center",
            cellRenderer: (params) => params.value ? moment(params.value).format('DD/MM/YYYY HH:mm') : ''
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
          this.editData(this.datalist[idx]);
        }
        if (deleteBtn) {
          e.preventDefault();
          let idx = parseInt(deleteBtn.getAttribute('data-idx'));
          this.deleteData(this.datalist[idx]);
        }
      },
      setNew() {
        this.reset();
        this.editMode = false
        this.form.active = "Y"
        this.$refs.setup_connection.openModal();
      },
      pageChange(pn) {
        paging.setCurrentPage(pn);
        this.loadData();
      },
      doSearch() {
        paging.setCurrentPage(1);
        this.loadData();
      },
      reset() {
        this.headerNameModal = "เพิ่มรายการข้อมูล";
        this.form = {
          serv_code: "",
          serv_name: ""
        };
      },
      async loadData() {
        let act = `csm/master/GroupCode_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}&search_text=${encodeURIComponent(this.search.text || '')}`;
        for (var key in this.search) {
            act += `&${key}=${encodeURIComponent(this.search[key])}`
        }
        let rsp = await $xt.getServer(act);
        
        this.datalist = rsp.data.data_rows.data;
        this.datalist_export = rsp.data.data_rows.data_list;
        this.total_datalist = rsp.data.data_rows.total

        let i = paging.skipItems() == 0 ? 0 : paging.skipItems()
        this.datalist.forEach((f, idx) => {
          f.item = ++i
        });
        paging.setTotalItems(rsp.data.data_rows.total);

        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }

        paging.createPagesArray();
        this.initTable();
      },
      async readData(x) {
        let act = `csm/master/GroupCode_Read?serv_code=${encodeURIComponent(x || '')}`;
        let rsp = await $xt.getServer(act);
        this.form = rsp.data;
      },
      async save() {
        if (process) return;
        try {
          let f = {
            header: this.form
          };
          let act = `CSM/Master/GroupCode_Create?serv_code=${this.form.serv_code}&serv_name=${this.form.serv_name}`;
          if (this.editMode) {
            act = `csm/master/GroupCode_Update?serv_code=${this.form.serv_code}&serv_name=${this.form.serv_name}`;
          }
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          
          await this.loadData();
          $msg.alert(``, `Success`, `success`);
          this.$refs.setup_connection.closeModal();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
      },
      async deleteData(x) {
        if (!await $msg.confirm(`ต้องการลบข้อมูลใช่หรือไม่`)) {
          return;
        }
        try {
          let f = {
            header: x
          };
          let act = `csm/master/GroupCode_Delete?serv_code=${x.serv_code}`;
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
      async editData(x) {
        this.editMode = true;       
        this.headerNameModal = "แก้ไขรายการ";
        await this.readData(x.serv_code);
        this.$refs.setup_connection.openModal();

      },
      setImport() {
        this.$refs.importData.openImport();
      },
      onExport() {
        let arr = [];
        if (this.datalist_export.length > 0) {
          $linq(this.datalist_export).foreach(x => {
            arr.push({
              'Serv_code': x.serv_code,
              'Serv_name': x.serv_name,
              'Add_by' : x.add_by,
              'Add_dt' : moment(x.add_dt).format('YYYY-MM-DD HH:mm:ss'),
              'Edit_by': x.edit_by,
              'Edit_dt': moment(x.edit_dt).format('YYYY-MM-DD HH:mm:ss'),
            })
          });
        }
        else {
          arr.push({
              'Serv_code': " ",
              'Serv_name': " ",
              'Add_by' : " ",
              'Add_dt' : " ",
              'Edit_by': " ",
              'Edit_dt': " ",
            })
        }
        var dataWS = XLSX.utils.json_to_sheet(arr);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, dataWS);
        XLSX.writeFile(wb, 'Serv_group.xlsx');
      },
      async onImport(e) {
        page.loadingBox.show();
        try {
          let f = {
            data: this.arrImport(e)
          };
          let act = `CSM/Master/GroupCode_ImportData`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw new Error(rsp.error);
          }
          else {
            $notify.success('นำเข้าข้อมูลเสร็จสิ้น');
            this.$refs.importData.closeImport();
            await this.loadData();
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
            serv_code: x[this.importForm.serv_code],
            serv_name: x[this.importForm.serv_name],
            active: x[this.importForm.active]
          })
        })
        return arr
      },
      defaultImport() {
        this.importForm = {
          serv_code: 'A',
          serv_name: 'B',
          active: 'C'
        }
      },
     async is_mango() {
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
      (async () => {
        page = this.$refs.page;
        page.pageTitle = `Setup : Service Group`;
        document.title = page.pageTitle;

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(10);

        appForm = this.$refs.appForm
        appForm.btnDelete.show = false
        appForm.btnSave.show = false
       if (this.permission()) {
        appForm.btnNew.click = this.setNew
        appForm.btnImport.show = true
        appForm.btnImport.click = this.setImport
      } else {
        appForm.btnNew.show = false
        appForm.btnImport.show = false
      }

        this.loadData();
      })();
    }
  };
  export default cpn;
</script>
