<template>
  <div>
    <re-page ref="page">
      <template #body>
        <app-form-2 ref="appForm"
        exportSelect="B"
        exportUrl="csm/master/PriorityExport"
        >
          <template #form-detail>
            <div class="box box-widget">
              <div class="box-body">
                <div class="row d-flex">
                  <div class="col-md-2">
                    <div class="form-group">
                      <label v-text="ui.search_by || 'Search By'"></label>
                      <select class="form-control input-sm" v-model="searchData.search_field">
                        <option value="prioity_code">Priority Code</option>
                        <option value="prioity_des">Priority Description</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-3">
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
                    <span class="pull-right">(จำนวนข้อมูลทั้งหมด {{ priorityTotal || 0 }} รายการ)</span>
                  </div>
                </div>
                <div class="row">
                  <div class="col-sm-12 col-md-12 col-lg-12">
                    <ag-table ref="agr"
                      :footer="false"
                      @ready="initTable()"
                      :saveColumns="'Y'"
                      :doctype="'VIEW'"
                      :page_name="'v_csm_mas_009'"
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
    <!-- <div class="col-lg-6 col-md-12">
                    <span class="pull-right">
                      <button class="btn btn-sm btn-default" @click="onExport"><i class="fas fa-file-export"></i> Export Excel</button>
                      <button class="btn btn-sm btn-tumblr" @click="addFile"><i class="fas fa-file-import"></i> Import Excel</button>
                      <button class="btn btn-sm btn-primary" v-on:click="checkNewItems()"><i class="fa fa-plus"></i> ทำรายการใหม่</button>
                    </span>
                  </div> -->
    <modal-2 ref="formModal">
      <template #header>
        <div class="d-flex align-items-center" style="gap:10px;">
          <div class="prio-header-icon">
            <i class="fas fa-flag"></i>
          </div>
          <div>
            <div style="font-size:15px;font-weight:700;color:#1e2a3a;">{{ !isEdit ? 'Add Priority' : 'Edit Priority' }}</div>
            <div style="font-size:11px;color:#7e8299;margin-top:1px;">กำหนดระดับความสำคัญและสีสำหรับ Priority</div>
          </div>
        </div>
      </template>
      <template #body>

        <!-- Section 1: ข้อมูลหลัก -->
        <div class="prio-section">
          <div class="prio-section-header">
            <i class="fa fa-info-circle"></i> ข้อมูล Priority
          </div>
          <div class="prio-section-body">
            <div class="row">
              <div class="col-md-3">
                <div class="form-group" :class="{'has-error': xt.isEmpty(form.prioity_code)}">
                  <label class="prio-label required">Priority Code</label>
                  <span class="pull-right prio-counter">{{xt.textLength(form.prioity_code, 10)}}</span>
                  <input type="text" class="form-control input-sm" v-model="form['prioity_code']"
                         maxlength="10" :disabled="isEdit" @input="filterInput($event)" />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group" :class="{'has-error': xt.isEmpty(form.prioity_des)}">
                  <label class="prio-label">Priority Description</label>
                  <span class="pull-right prio-counter">{{xt.textLength(form.prioity_des, 200)}}</span>
                  <input type="text" class="form-control input-sm" v-model="form['prioity_des']" maxlength="200" />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label class="prio-label">Priority Status</label></br>
                  <select class="form-control input-sm" v-model="form['priority_status']">
                    <option value="1">ปกติ</option>
                    <option value="2">สำคัญ</option>
                    <option value="3">สำคัญมาก</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label class="prio-label">Overdue (Days)</label>
                  <number :decimals="0" class="form-control input-sm" v-model.number="form['to_date']" @keypress="onlyNumberInput"></number>
                </div>
              </div></br>
              <div class="col-md-9 d-flex align-items-end" style="padding-bottom:10px;gap:24px;">
                <div class="prio-toggle-item">
                  <label class="prio-toggle-switch">
                    <input type="checkbox" v-model="form['active']" true-value="Y" false-value="N" />
                    <span class="prio-toggle-slider"></span>
                  </label>
                  <span class="prio-toggle-label">Active</span>
                </div>
                <div class="prio-toggle-item">
                  <label class="prio-toggle-switch">
                    <input type="checkbox" v-model="form['default_']" true-value="Y" false-value="N" />
                    <span class="prio-toggle-slider"></span>
                  </label>
                  <span class="prio-toggle-label">Default</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: สีและตัวอย่าง -->
        <div class="prio-section">
          <div class="prio-section-header">
            <i class="fas fa-palette"></i> สีและตัวอย่างการแสดงผล
          </div>
          <div class="prio-section-body">
            <div class="row">
              <div class="col-md-4">
                <label class="prio-label" style="margin-bottom:8px;">เลือกสี</label>
                <color-panel v-model="form['priority_color']"></color-panel>
              </div>
              <div class="col-md-8">
                <label class="prio-label" style="margin-bottom:8px;">ตัวอย่างการแสดงผล</label>
                <div class="prio-preview-box">
                  <div class="prio-preview-badge" :style="{ backgroundColor: (form['priority_color'] || '#000000') + '18', borderLeft: '4px solid ' + (form['priority_color'] || '#000000') }">
                    <span class="prio-preview-dot" :style="{ backgroundColor: form['priority_color'] || '#000000' }"></span>
                    <span :style="{ color: form['priority_color'] || '#000000', fontWeight: '700', fontSize: '13px' }">
                      {{ form.prioity_des || 'Priority Description' }}
                    </span>
                  </div>
                  <div class="prio-preview-text" :style="{ color: form['priority_color'] || '#000000' }">
                    ทดสอบสีข้อความเพื่อดูว่าข้อความนี้จะเป็นอย่างไรเมื่อเปลี่ยนสีต่างๆ
                  </div>
                  <div class="prio-preview-text" :style="{ color: form['priority_color'] || '#000000' }">
                    Testing text color to see how this message will appear when different colors are applied.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </template>
      <template #footer>
        <button class="btn btn-sm btn-success" @click.prevent="onSave()">
          <i class="fas fa-save"></i> บันทึกข้อมูล
        </button>
      </template>
    </modal-2>
    <!-- Modal : Template Import Data -->
    <import-data ref="importData" @send-import="onImport($event)" :clear-input="()=> importForm = {}" :default-input="defaultImport" :color-columns="colorColumns" :editable-columns="editableColumns">
      <template #body-import>
        <div class="row">
          <div class="col-md-12 margin-b-10">
            <button class="btn btn-sm btn-success" @click.prevent="onTemplateExcel"><i class="fas fa-download"></i> ดาวน์โหลดเทมเพลต</button>
          </div>
        </div>
        <div class="row">
          <div class="col-md-2">
            <div class="form-group">
              <label>Priority Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['prioity_code']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Priority Description</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['prioity_des']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Overdue (Days)</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['to_date']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Color</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['priority_color']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Priority Status</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['priority_status']" maxlength="2" />
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
  import { mapState, mapGetters } from '~/stores/helpers'
  
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
        pageNumber: 1,
        isEdit: false,
        searchData : {
          search_field : "prioity_code",
          search_text : "",
          search_active:"Y"
        },
        priorityData : [],
        priorityTotal : [],
        form: {
          priority_status : "1",
          to_date : 0,
          active: "N",
          default_ : "N"
        },
        formtype: "",
        prio: [],
        displayData: [],
        isShowTab2: false,
        msg: '',
        importForm: {
          prioity_code: 'A',
          prioity_des: 'B',
          to_date: 'C',
          priority_status: 'D',
          active: 'E'
        }
      };
    },
    methods: {
      initTable() {
        let agr = this.$refs.agr;
        let fields = [
          ["rowno", "No.", "number", { width: 80, align: "center", pinned: "left" }],
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
      }],
        );
        }
        fields = fields.concat([
          ["prioity_code", "Priority Code", "text" , { width: 160, sortable: true , pinned: "left",align: "center" }],
          ["prioity_des", "Priority Description", "text", { width: 260, sortable: true }],
          ["priority_color", "Color", "text", { width: 120, align: "center",
            cellRenderer: (params) => {
              const color = params.value || '#000000';
              return `<span style="display:inline-block;width:20px;height:20px;border-radius:50%;background-color:${color};vertical-align:middle;"></span>`;
            }
          }],
          ["to_date", "Overdue (Days)", "number", { width: 160, align: "center",
            cellRenderer: (params) => params.value != null ? `${params.value} วัน` : ''
          }],
          ["priority_status", "Priority Status", "text", { width: 140, align: "center",
            cellRenderer: (params) => {
              const v = params.value;
              return v === '1' ? 'ปกติ' : v === '2' ? 'สำคัญ' : 'สำคัญมาก';
            }
          }],
          ["active", "Active", "text", { width: 90, align: "center",
            cellRenderer: (params) => params.value === 'Y'
              ? `<span style="color:#00c116;">Yes</span>`
              : `<span style="color:#ff0000;">No</span>`
          }],
          ["default_", "Default", "text", { width: 90, align: "center",
            cellRenderer: (params) => {
              const checked = params.value === 'Y' ? 'checked' : '';
              const disabled = (params.data && params.data.active === 'N') || (this.config && this.config.PROJECT_PRIORITY === 'Y') ? 'disabled' : '';
              return `<input type="checkbox" ${checked} ${disabled} class="ag-default-checkbox" data-idx="${params.rowIndex}" />`;
            }
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
        agr.setDisplay(this.priorityData);
        this.$nextTick(() => {
          agr.$el.removeEventListener('click', this.onTableClick);
          agr.$el.addEventListener('click', this.onTableClick);
        });
      },
      onTableClick(e) {
        let editBtn = e.target.closest('.ag-action-edit');
        let deleteBtn = e.target.closest('.ag-action-delete');
        let chk = e.target.closest('.ag-default-checkbox');
        if (editBtn) {
          e.preventDefault();
          let idx = parseInt(editBtn.getAttribute('data-idx'));
          this.setEdit(this.priorityData[idx]);
        }
        if (deleteBtn) {
          e.preventDefault();
          let idx = parseInt(deleteBtn.getAttribute('data-idx'));
          this.onDeleteData(this.priorityData[idx]);
        }
        if (chk) {
          let idx = parseInt(chk.getAttribute('data-idx'));
          let row = this.priorityData[idx];
          row.default_ = chk.checked ? 'Y' : 'N';
          this.UpdateDefault(row);
        }
      },
      async onImport(e) {
        page.loadingBox.show();
        try {
          let f = {
            data: this.arrImport(e)
          };
          let act = `CSM/Master/PriorityImportData`;
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
            prioity_code: x[this.importForm.prioity_code],
            prioity_des: x[this.importForm.prioity_des],
            to_date: x[this.importForm.to_date],
            priority_status: x[this.importForm.priority_status],
            active: x[this.importForm.active],
            priority_color: x[this.importForm.priority_color]
          })
        })
        return arr
      },
      defaultImport() {
        this.importForm = {
          prioity_code: 'A',
          prioity_des: 'B',
          to_date: 'C',
         priority_color:'D',
          priority_status: 'E',
          active: 'F',

        }
      },
      setNew() {
        this.resetData()
        this.form.active = "Y"
        this.msg = 'ทำรายการใหม่';
        this.$refs.formModal.openModal();
      },
      setImport() {
        this.$refs.importData.openImport();
      },
      async onTemplateExcel(){
        let act = `csm/master/TemplateExcelPriority`
        let rsp = await $xt.getServer(act)
        window.open(window.dataServer + `API/File/DownLoad?download=true&id=${rsp.data}`)

      },

      async pageChange(pn) {
        this.page_number = pn
        paging.setCurrentPage(pn)
        await this.loadDisplay()
      },
      doSearch() {
        paging.setCurrentPage(1);
        this.loadDisplay();
      },
      resetData() {
        this.isEdit = false;
        this.form = {
          priority_status : "1",
            to_date : 1,
            active: "N",
            default_ : "N",
            priority_color: "#000000"
        };
      },
      async loadDisplay() {
        try {
          page.loadingBox.show();
          let act = `csm/master/Priority_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
          for (var key in this.searchData) {
            act += `&${key}=${encodeURIComponent(this.searchData[key])}`
          }
          let rsp = await $xt.getServer(act);
          this.priorityData = rsp.data;
          this.priorityTotal = rsp.total;

          paging.setTotalItems(rsp.total);
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
      async onReadData(prioity_code) {
        try {
          page.loadingBox.show();
          let act = `csm/master/Priority_Read?prioity_code=${encodeURIComponent(prioity_code || '')}`;
          let rsp = await $xt.getServer(act);
          this.form = rsp.data;

          if ($xt.isEmpty(this.form.priority_color)) {
            this.form.priority_color = "#000000";
          }

        } catch(ex){
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      beforeonSave() {
        if($xt.isEmpty(this.form.prioity_code)) {
          $msg.alert(`Warning`, `Code is not null`, `Warning`);
          return
        } else if($xt.isEmpty(this.form.prioity_des)) {
          $msg.alert(`Warning`, `Code is not null`, `Warning`);
          return
        }
      },
      async onSave() {
        try {
          page.loadingBox.show();

          let f = {
            header: this.form
          };
          let act = `CSM/MASTER/Priority_Create`;
          if (this.isEdit) {
            act = `CSM/MASTER/Priority_Update`;
          }
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          $msg.alert(`Success`, `Your information has been saved successfully.` , `success`)
          this.resetData();
          await this.loadDisplay();
          this.$refs.formModal.closeModal();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      async setEdit(x) {
        await this.onReadData(x.prioity_code);
        this.isEdit = true;
        this.msg = 'แก้ไขรายการ';
        this.$refs.formModal.openModal();
      },
      async onDeleteData(x) {
        if (!await $msg.confirm(`Do you want to delete this priority description : ${x.prioity_des} ?`)) {
          return;
        }
        try {
          page.loadingBox.show();
          let f = {
            header: x
          };
          let act = `CSM/Master/Priority_Delete`;
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }
          this.resetData();
          await this.loadDisplay();
          $notify.success(ui.alert_save_success)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
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
      async UpdateDefault(x) {
        try {
          let f = {
            header : x
          };
          let act = `CSM/MASTER/Priority_Update`;
          page.loadingBox.show();
          let rsp = await $xt.postServerJson(act, f);
          if (!rsp.success) {
            throw rsp.error;
          }

          await this.loadDisplay();
          $notify.success(this.ui.alert_save_success)
          this.resetData();
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          page.loadingBox.hide();
        }
      },
      filterInput(event) {
        this.form.prioity_code = event.target.value.replace(/[^a-z0-9]/gi, '')
      },
      onlyNumberInput(event) {
        // Allow only digits (0-9)
        const charCode = event.charCode ? event.charCode : event.keyCode;
        if (charCode < 48 || charCode > 57) {
          event.preventDefault(); // Prevent non-numeric input
        }
      },
    },
    computed: {
      configData() { return store.state.configData },
      ...mapState(['config']),
      colorColumns() {
        return [this.importForm.priority_color]
      },
      editableColumns() {
        return [this.importForm.priority_color]
      },
    },
    watch: {
      'form.to_date'(newValue) {
        let onlyNumb = parseInt(String(newValue).replace(/-/g, ""))
        this.form.to_date = onlyNumb

        if (onlyNumb < 1 || $xt.isEmpty(onlyNumb) ) {
          this.form.to_date = 1
        }
      }
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = `Setup : Priority`;
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
      this.loadDisplay();
    }
  };

  export default cpn;
</script>
<style scoped>
  .dot {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    display: inline-block;
  }

  /* Header icon */
  .prio-header-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, #1e2a3a, #3a5068);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    flex-shrink: 0;
  }

  /* Sections */
  .prio-section {
    border: 1px solid #e4e6ef;
    border-radius: 8px;
    margin-bottom: 14px;
    overflow: hidden;
  }

  .prio-section-header {
    background: #1e2a3a;
    color: #fff;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .prio-section-body {
    padding: 14px 16px 6px;
    background: #fff;
  }

  /* Labels */
  .prio-label {
    font-size: 12px;
    font-weight: 600;
    color: #3f4254;
    margin-bottom: 4px;
    display: block;
  }

  .prio-label.required::after {
    content: ' *';
    color: #f1416c;
  }
  .modal-body{
    overflow-y: hidden !important;
  }

  .prio-counter {
    font-size: 11px;
    color: #a1a5b7;
  }

  /* Toggle switch */
  .prio-toggle-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .prio-toggle-switch {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
    margin: 0;
    cursor: pointer;
  }

  .prio-toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .prio-toggle-slider {
    position: absolute;
    inset: 0;
    background-color: #ccc;
    border-radius: 20px;
    transition: 0.3s;
  }

  .prio-toggle-slider::before {
    content: '';
    position: absolute;
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: 0.3s;
  }

  .prio-toggle-switch input:checked + .prio-toggle-slider {
    background-color: #50cd89;
  }

  .prio-toggle-switch input:checked + .prio-toggle-slider::before {
    transform: translateX(16px);
  }

  .prio-toggle-label {
    font-size: 11px;
    font-weight: 600;
    color: #5e6278;
  }

  /* Preview box */
  .prio-preview-box {
    background: #f9f9f9;
    border: 1px solid #e4e6ef;
    border-radius: 8px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .prio-preview-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 6px;
    width: fit-content;
  }

  .prio-preview-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .prio-preview-text {
    font-size: 13px;
    line-height: 1.5;
  }
</style>
