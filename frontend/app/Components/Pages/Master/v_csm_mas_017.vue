<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="box box-widget">
          <div class="box-body">
            <div class="nav-tabs-custom">
              <ul class="nav nav-tabs">
                <li :class="{active:tabActive===0}"><a href="#" @click.prevent="onChangeTab(0)">Data List ({{lengthX || 0}})</a></li>
                <li :class="{active:tabActive===1}"><a href="#" @click.prevent="onChangeTab(1)" v-if="permission()">Create / Edit</a></li>
              </ul>

              <div class="tab-content">
                <div class="tab-pane" :class="{active:tabActive===0}">
                  <div class="row">
                    <div class="col-lg-4 col-md-12">
                      <div class="form-group">
                        <label>Search</label>
                        <div class="input-group">
                          <input type="text" class="form-control input-sm" v-model.trim="search.text" @keypress.enter="doSearch" />
                          <span class="input-group-btn">
                            <button class="btn btn-sm bg-navy" @click="doSearch"><i class="fas fa-search"></i></button>
                          </span>
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
                    <div class="col-md-6">
                      <label>&nbsp;</label>
                      <div class="form-group">
                        <div class="pull-right">
                          <app-form-2 ref="appForm2" exportName="" exportSelect="B" exportUrl="CSM/Master/CSM_SubServiceExport"/>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-12 align-content-end margin-b-8">
                      <span class="pull-right">(จำนวนข้อมูลทั้งหมด {{ lengthX || 0 }} รายการ)</span>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm-12 col-md-12 col-lg-12">
                      <ag-table ref="agr"
                        :footer="false"
                        @ready="initTable()"
                        :saveColumns="'Y'"
                        :doctype="'VIEW'"
                        :page_name="'v_csm_mas_017'"
                      ></ag-table>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-12 col-md-12">
                      <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)"></pagination>
                    </div>
                  </div>
                </div>
                <div class="tab-pane" :class="{active:tabActive===1}">
                  <app-form ref="appForm">
                    <template #form-field>
                      <div class="row">
                        <div class="col-lg-3 col-md-3 col-sm-3">
                          <div class="form-group" :class="{'has-error': xt.isEmpty(form.serv_code)}">
                            <label class="text-danger">รหัส</label><span class="pull-right">{{xt.textLength(form.serv_code, 10)}}</span>
                            <input type="text" class="form-control input-sm" v-model="form['serv_code']" maxlength="10" :disabled="editMode" />
                          </div>
                        </div>
                        <div class="col-lg-5 col-md-5 col-sm-5">
                          <div class="form-group" :class="{'has-error': xt.isEmpty(form.remark)}">
                            <label class="text-danger">หมวดงาน</label><span class="pull-right">{{xt.textLength(form.remark, 200)}}</span>
                            <input type="text" class="form-control input-sm" v-model="form['remark']" maxlength="200" />
                          </div>
                        </div>
                        <div class="col-md-2">
                          <div class="d-flex margin-t-25">
                            <div class="form-check form-check-custom form-check-solid form-check-sm">
                              <input class="form-check-input" type="checkbox" v-model="form['active']" true-value="Y" false-value="N" />
                              <label class="form-check-label"><span>Active</span></label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </app-form>
                  <div class="row">
                    <div class="col-sm-12 col-md-12 col-lg-12">
                      <ag-table ref="agrDetail"
                        :footer="false"
                        @ready="initDetailTable()"
                        :doctype="'EDIT'"
                        :page_name="'v_csm_mas_017_detail'"
                      ></ag-table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <modal-2 ref="addDetail">
          <template #header>
            <h4><i class="fas fa-plus-circle margin-r-10"></i>{{editSub ? 'แก้ไข' : 'เพิ่ม'}}ประเภทงาน</h4>
          </template>
          <template #body>
            <div class="row">
              <div class="col-md-4">
                <div class="form-group" :class="{'has-error': xt.isEmpty(subForm.serv_code_d)}">
                  <label class="text-danger">รหัส</label><span class="pull-right">{{xt.textLength(subForm.serv_code_d, 20)}}</span>
                  <input type="text" class="form-control input-sm" v-model.trim="subForm.serv_code_d" :readonly="editSub" :disabled="editSub" maxlength="20" />
                </div>
              </div>
              <div class="col-lg-8 col-md-8">
                <div class="form-group" :class="{'has-error': xt.isEmpty(subForm.remark)}">
                  <label class="text-danger">ประเภทงาน</label><span class="pull-right">{{xt.textLength(subForm.remark, 200)}}</span>
                  <input type="text" class="form-control input-sm" v-model.trim="subForm.remark" maxlength="200" />
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <button class="btn btn-sm btn-success" @click="addNew()">
              <i class="fas fa-check margin-r-5"></i><span>{{editSub ? 'แก้ไข' : 'เพิ่ม'}}</span>
            </button>
          </template>
        </modal-2>
      </template>
    </re-page>
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
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['serv_code']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Sub Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['serv_code_d']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Name</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['remark']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Type</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['hdtype']" maxlength="2" />
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

  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let appForm = {};
  let appForm2 ={};
  let paging = {};
  let process = false;
  let cpn = {
    data() {
      return {
        ui: window.ui,
        xt: $xt,
        auth,
        tabActive: 0,
        pageNumber: 1,
        editMode: false,
        editSub: false,
        search: {
          text: "",
          active: "Y"
        },
        form: {
          active: "N"
        },
        subForm: {},
        datalist: [],
        displayData: [],
        detailData: [],
        isShowTab2: false,
        lengthX:0,
        importForm: {
          serv_code: 'A',
          serv_code_d: 'B',
          remark: 'C',
          hdtype: 'D',
          active: 'E'
        }
      };
    },
    methods: {
      setImport() {
        this.$refs.importData.openImport();
      },
      async onImport(e) {
        page.loadingBox.show();
        try {
          let f = {
            data: this.arrImport(e)
          };
          let act = `CSM/Master/CSM_SubServiceImportData`;
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
            serv_code: x[this.importForm.serv_code],
            serv_code_d: x[this.importForm.serv_code_d],
            remark: x[this.importForm.remark],
            hdtype: x[this.importForm.hdtype],
            active: x[this.importForm.active]
          })
        })
        return arr
      },
      defaultImport() {
        this.importForm = {
          serv_code: 'A',
          serv_code_d: 'B',
          remark: 'C',
          hdtype: 'D',
          active: 'E'
        }
      },
      async onTemplateExcel(){
        let act = `csm/master/TemplateExcelSubService`
        let rsp = await $xt.getServer(act)
        window.open(window.dataServer + `API/File/DownLoad?download=true&id=${rsp.data}`)

      },
      onChangeTab(t) {
        this.tabActive = t;
        if (t == 0) {
          this.resetData()
        }

        if(this.form.active){
          this.form.active = this.form.active
        }else{
          this.form.active = "Y"
        }
      },
      async pageChange(pn) {
        pn = pn || 1;
        this.pageNumber = pn;
        paging.setCurrentPage(pn);
        this.displayData = $linq(this.datalist).where(x => x.hdtype == "H").skip(paging.skipItems()).take(paging.getItemsPerPage()).toArray();
        paging.createPagesArray();
        if (this.$refs.agr) {
          this.$refs.agr.setDisplay(this.displayData);
        }
      },
      doSearch() {
        paging.setCurrentPage(1);
        this.loadData();
      },
      initTable() {
        let agr = this.$refs.agr;
        let fields = [
          ["item", "No.", "number", { width: 100, align: "center", pinned: "left" }],
        ];
        if (this.permission()) {
          fields.push(['', 'Action', 'text', { width: 160, child:
            [
              ["", "Edit", "text", {
                width: 90,
                align: "center",
                pinned: 'left',
                cellRenderer: (params) => {
                  return `<a href="#" class="text-black ag-action-edit" data-idx="${params.rowIndex}"><i class="fas fa-edit"></i></a>`;
                },
              }],
              ["", "Delete", "text", {
                width: 90,
                align: "center",
                pinned: 'left',
                cellRenderer: (params) => {
                  return `<a href="#" class="text-danger m-5 ag-action-delete" data-idx="${params.rowIndex}"><i class="fas fa-trash-alt"></i></a>`;
                },
              }]
            ]
          }]);
        }
        fields = fields.concat([
          ["serv_code", "รหัส", "text", { width: 160, sortable: true, align: "center" }],
          ["remark", "หมวดงาน", "text", { width: 400, sortable: true }],
          ["active", "Active", "text", { width: 140, align: "center", sortable: true,
            cellRenderer: (params) => params.value === 'Y'
              ? `<span style="color:#00c116;">Yes</span>`
              : `<span style="color:#ff0000;">No</span>`
          }],
          ["adduser", "Add User", "text", { width: 140, align: "center" }],
          ["add_dt", "Add Date", "text", { width: 160, align: "center",
            cellRenderer: (params) => params.value ? moment(params.value).format('DD/MM/YYYY HH:mm') : ''
          }],
          ["edituser", "Edit User", "text", { width: 140, align: "center" }],
          ["edit_dt", "Edit Date", "text", { width: 160, align: "center",
            cellRenderer: (params) => params.value ? moment(params.value).format('DD/MM/YYYY HH:mm') : ''
          }],
        ]);
        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
        agr.setDisplay(this.displayData);
        this.$nextTick(() => {
          agr.$el.addEventListener('click', (e) => {
            let editBtn = e.target.closest('.ag-action-edit');
            let deleteBtn = e.target.closest('.ag-action-delete');
            if (editBtn) {
              e.preventDefault();
              let idx = parseInt(editBtn.getAttribute('data-idx'));
              this.setEdit(this.displayData[idx]);
            }
            if (deleteBtn) {
              e.preventDefault();
              let idx = parseInt(deleteBtn.getAttribute('data-idx'));
              this.deleteData(this.displayData[idx].serv_code);
            }
          });
        });
      },
      initDetailTable() {
        let agr = this.$refs.agrDetail;
        if (!agr) return;

        let fields = [
          ["item", "No.", "number", { width:100, align: "center" }],
          ["", "Delete", "text", {
            width: 100,
            align: "center",
            cellRenderer: (params) => {
              return `<a href="#" class="text-danger ag-detail-delete" data-idx="${params.rowIndex}"><i class="fas fa-trash-alt"></i></a>`;
            },
          }],
          ["serv_code_d", "รหัส", "text", {
            width: 300,
            align: "center",
            cellRenderer: (params) => {
              let val = params.value || '';
              return `<input type="text" class="ag-detail-input-code" data-idx="${params.rowIndex}" value="${val}" maxlength="20" style="width:300px;border:1px solid #dce4ec;border-radius:4px;padding:2px 6px;font-size:12px;" />`;
            }
          }],
          ["remark", "ประเภทงาน", "text", {
            width: 600,
            cellRenderer: (params) => {
              let val = params.value || '';
              return `<input type="text" class="ag-detail-input-remark" data-idx="${params.rowIndex}" value="${val}" maxlength="200" style="width:570px;border:1px solid #dce4ec;border-radius:4px;padding:2px 6px;font-size:12px;" />`;
            }
          }],
        ];
        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);
        agr.setDisplay(this.detailData);

        this.$nextTick(() => {
          agr.$el.addEventListener('click', (e) => {
            let deleteBtn = e.target.closest('.ag-detail-delete');
            if (deleteBtn) {
              e.preventDefault();
              let idx = parseInt(deleteBtn.getAttribute('data-idx'));
              this.delDetail(this.detailData[idx]);
            }
          });

          agr.$el.addEventListener('input', (e) => {
            let codeInput = e.target.closest('.ag-detail-input-code');
            let remarkInput = e.target.closest('.ag-detail-input-remark');
            if (codeInput) {
              let idx = parseInt(codeInput.getAttribute('data-idx'));
              if (this.detailData[idx]) {
                this.detailData[idx].serv_code_d = codeInput.value;
              }
            }
            if (remarkInput) {
              let idx = parseInt(remarkInput.getAttribute('data-idx'));
              if (this.detailData[idx]) {
                this.detailData[idx].remark = remarkInput.value;
              }
            }
          });
        });
      },
      refreshDetailTable() {
        if (this.$refs.agrDetail) {
          this.$refs.agrDetail.setDisplay(this.detailData);
        }
      },
      resetData() {
        this.editMode = false;
        this.form = {
          active : "Y"
        }
        this.detailData = [];
        appForm.btnDelete.disabled = true;
        this.refreshDetailTable();
      },
      reSetData2() {
        this.editMode = false;
        this.form = {
          active: "Y"
        };
        this.detailData = [];
        appForm.btnDelete.disabled = true;
        this.refreshDetailTable();
      },
      async loadData() {
        let act = `csm/master/CSM_SubService_ReadList?skip=0&take=9999`;
        for (var key in this.search) {
          act += `&${key}=${encodeURIComponent(this.search[key])}`
        }
        let rsp = await $xt.getServer(act);

        this.datalist = rsp.data.data;
        this.total_datalist = rsp.data.total;

        let i = 0;
        let data = $linq(rsp.data.data).where(x => x.hdtype == "H").toArray()
        $linq(data).foreach(x => {
          x.item = ++i;
        })
        let tot = data.length
        this.lengthX = data.length

        paging.setTotalItems(tot);
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1);
        }
        paging.createPagesArray();
        this.pageChange(this.pageNumber);
      },
      async readData(serv_code) {
        page.loadingBox.show();
        let act = `csm/master/CSM_SubService_Read?serv_code=${serv_code || ''}&text=&type=D`;
        let rsp = await $xt.getServer(act);
        this.form = rsp.data.header;
        this.detailData = rsp.data.detail;

        let i = 0;
        $linq(rsp.data.detail).foreach(x => {
          x.item = ++i;
        })
        this.refreshDetailTable();
        page.loadingBox.hide();
      },
      async saveData() {
        if (process) return;
        try {
          let f = {
            header: this.form,
            detail: this.detailData
          };
          let act = `CSM/MASTER/CSM_SubService_CreateAndUpdate`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          await this.loadData();
          await this.readData(rsp.data);
          this.onChangeTab(0);

          $msg.alert(`Success`, `Your information has been saved successfully.`, `success`)
          this.resetData();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          process = false;
          page.loadingBox.hide();
        }
      },
      async setEdit(x) {
        await this.readData(x.serv_code);
        this.editMode = true;
        this.onChangeTab(1);
        appForm.btnDelete.disabled = false;
        this.form.type = 'Edit';
        this.detailData.forEach(item => {
        if (item.serv_code === x.serv_code) {
          item.type = 'Edit';
        }
      });
      },
      async delDetail(x) {
        if (!await $msg.confirm(`คุณต้องการลบข้อมูล : ${x.serv_code_d} นี้ใช่หรือไม่`)) {
          return;
        }
        this.detailData = $linq(this.detailData).where(y => y.serv_code_d != x.serv_code_d).toArray();
        this.refreshDetailTable();
      },
      async deleteData(code) {
        if (process) return;
        if (!this.editMode) return;
        code = code || this.form.serv_code

        if (!await $msg.confirm(`คุณต้องการลบข้อมูล Code : ${code} นี้ใช่หรือไม่`)) {
          return;
        }

        try {
          let f = { code: code };
          let act = `CSM/Master/CSM_SubService_Delete?code=${code}`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          await this.resetData();
          await this.loadData();

          $msg.alert(``, `Success`, `success`);
          this.onChangeTab(0);
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {

          process = false;
          page.loadingBox.hide();
        }
      },
      openModal() {
        if (this.form.serv_code == null) {
          $msg.alert("", "กรุณากรอก Subject Code", "danger");
          return
        }
        if (this.form.remark == null) {
          $msg.alert("", "กรุณากรอก Subject Code", "danger");
          return
        }
        this.editSub = false;
        this.$refs.addDetail.openModal();

        let i = $linq(this.detailData).select(x => x.item).lastOrDefault() || 0;
        i++
        this.subForm = {
          serv_code: this.form.serv_code,
          serv_code_d: this.form.serv_code + $xt.replaceZeroStart(i, 3),
          remark: "",
          itemno: i
        };
      },
      async addNew() {
        this.detailData.push(this.subForm)
        this.subForm = {}
        this.$refs.addDetail.closeModal();
        this.refreshDetailTable();
      },
      onExport() {
        let arr = [];
        if (this.datalist.length > 0) {
          $linq(this.datalist).foreach(x => {
            arr.push({
              'Group Code': x.serv_code,
              'Sub Code': x.serv_code_d,
              'Name': x.remark,
              'Type': x.hdtype,
              'Active': x.active,
            })
          });
        }
        else {
          arr.push({
            'Group Code': x.serv_code,
            'Sub Code': x.serv_code_d,
            'Name': x.remark,
            'Type': x.hdtype,
            'Active': x.active,
          })
        }
        var dataWS = XLSX.utils.json_to_sheet(arr);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, dataWS);
        XLSX.writeFile(wb, 'Service_Type.xlsx');
      },

      is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
        return isMango == "Y" ? true : false;
      },
      permission() {
        let data = (!this.is_mango() || auth.is_admin);
        return data;
      },
      addRow() {
        if (this.form.serv_code == null || this.form.remark == null) {
          $msg.alert("", "กรุณากรอก Subject Code", "danger");
          return
        }
        let max = this.detailData.length == 0 ? 0 : $linq(this.detailData).max(x => x.item)
        let detail_k = $linq(this.detailData).lastOrDefault() || {}
        this.detailData.push({
          item: max + 1,
          serv_code: this.form.serv_code,
          serv_code_d: '',
          remark: '',
          type: 'Create'
        })
        this.refreshDetailTable();
      },
    },
    computed: {
      configData() { return store.state.configData },
    },
    mounted() {
      (async () => {
        page = this.$refs.page;
        page.pageTitle = ' Setup : Service Type';
        document.title = page.pageTitle;

        appForm = this.$refs.appForm;
        appForm2 = this.$refs.appForm2;
        appForm.btnRetrieve.show = false;
        appForm.btnPrint.show = false;
        appForm.btnBack.show = false;
        
        appForm.btnNew.click = this.reSetData2;
        appForm.btnSave.click = this.saveData;
        appForm.btnDelete.click = this.deleteData;
        appForm.btnAddRow.click = this.addRow;

        appForm2.btnNew.show = false;
        appForm2.btnImport.click = this.setImport
        appForm2.btnExport.click = this.onExport

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(500);

        this.resetData();
        this.loadData();

      })();
    }
  };

  export default cpn;
</script>
