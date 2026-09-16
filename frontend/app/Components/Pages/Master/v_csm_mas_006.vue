<template>
  <div>
    <re-page ref="page">
      <template #body>
        <app-form-2 ref="appForm"
                    exportName=""
                    exportSelect="B"
                    exportUrl="csm/master/CustomerServiceExport">
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
                        <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click.prevent="doSearch()"><i class="fas fa-search"></i></button></span>
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
                      :page_name="'v_csm_mas_006'"
                    ></ag-table>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12">
                    <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page)" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </app-form-2>
      </template>
    </re-page>
    <modal-2 ref="modal">
      <template #header>
        <div class="d-flex align-items-center" style="gap:10px;">
          <i class="fa fa-cogs" style="font-size:18px;"></i>
          <span style="font-size:16px;font-weight:600;">{{ editMode ? "EDIT SERVICE TYPE" : "ADD SERVICE TYPE" }}</span>
        </div>
      </template>
      <template #body>

        <!-- Section 1: ข้อมูลหลัก -->
        <div class="modal-section">
          <div class="modal-section-header">
            <i class="fa fa-info-circle"></i> ข้อมูล Service
            <span class="pull-right">
              <span class="modal-badge" :class="form.active === 'Y' ? 'badge-active' : 'badge-inactive'">
                {{ form.active === 'Y' ? 'Active' : 'Inactive' }}
              </span>
            </span>
          </div>
          <div class="modal-section-body">
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label class="field-label required">Service Code</label>
                  <span class="pull-right text-muted" style="font-size:11px;">{{xt.textLength(form.serv_code, 20)}}</span>
                  <input type="text" class="form-control input-sm" v-model.trim="form.serv_code"
                         :readonly="editMode" :disabled="editMode" maxlength="20" />
                </div>
              </div>
              <div class="col-md-5">
                <div class="form-group">
                  <label class="field-label required">Service Name</label>
                  <span class="pull-right text-muted" style="font-size:11px;">{{xt.textLength(form.serv_name, 200)}}</span>
                  <input type="text" class="form-control input-sm" v-model.trim="form.serv_name" maxlength="200" />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group"></br>
                  <label class="field-label">Service Group</label>
                  <select class="form-control input-sm" v-model.trim="form.serv_group_code">
                    <option value="">-- Select --</option>
                    <option v-for="x, idx in serv_group" :value="x.serv_code">{{ x.serv_name }}</option>
                  </select>
                </div>
              </div>
              <div class="col-md-1 d-flex align-items-end" style="padding-bottom:8px;">
                <div class="toggle-wrap"></br>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="form['active']" true-value="Y" false-value="N" />
                    <span class="toggle-slider"></span>
                  </label>
                  <span class="toggle-label">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: การแจ้งเตือน -->
        <div class="modal-section">
          <div class="modal-section-header">
            <i class="fa fa-bell"></i> การแจ้งเตือน (Notification)
          </div>
          <div class="modal-section-body">
            <div class="row align-items-center">
              <div class="col-md-2">
                <div class="form-group">
                  <label class="field-label">Alert Days</label>
                  <number class="form-control input-sm" v-model="form.noti_date"></number>
                </div>
              </div>
              <div class="col-md-10">
                <div class="toggle-group">
                  <div class="toggle-item">
                    <label class="toggle-switch">
                      <input type="checkbox" true-value="Y" false-value="N" v-model="form['noti_active']" />
                      <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">Alert Active</span>
                  </div>
                  <div class="toggle-item" v-if="form.noti_active === 'Y'">
                    <div class="form-group mb-0">
                      <label class="field-label" style="font-size:11px;">Alert Timing</label>
                      <select class="form-control input-sm" v-model="form['alert_type']" style="width:100px;">
                        <option value="B">Before</option>
                        <option value="A">After</option>
                      </select>
                    </div>
                  </div>
                  <div class="toggle-item">
                    <label class="toggle-switch">
                      <input type="checkbox" true-value="Y" false-value="N" v-model="form['noti_line']" />
                      <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">Line</span>
                  </div>
                  <div class="toggle-item">
                    <label class="toggle-switch">
                      <input type="checkbox" true-value="Y" false-value="N" v-model="form['noti_email']" />
                      <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">Email</span>
                  </div>
                  <div class="toggle-item" v-if="is_mango()">
                    <div class="form-group mb-0">
                      <label class="field-label" style="font-size:11px;">Addspec Request</label>
                      <select class="form-control input-sm" v-model="form['addspec_request']" style="width:110px;">
                        <option value="N">None</option>
                        <option value="R">Requestor</option>
                        <option value="W">Worker</option>
                      </select>
                    </div>
                  </div>
                  <div class="toggle-item" v-if="is_mango()">
                    <button type="button"
                            @click="OpenaddSA()"
                            :class="['btn', 'btn-sm', addEmpCount > 0 ? 'btn-success' : 'btn-primary']"
                            style="margin-top:18px;">
                      <i class="fa fa-users"></i>
                      System Analyst {{ addEmpCount > 0 ? '(' + addEmpCount + ')' : '' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Config Service -->
        <div class="modal-section">
          <div class="modal-section-header">
            <i class="fa fa-sliders"></i> Setup Config Service
          </div>
          <div class="modal-section-body">
            <div class="toggle-group flex-wrap">
              <div class="toggle-card">
                <label class="toggle-switch">
                  <input type="checkbox" true-value="Y" false-value="N" v-model="form['approve_st']" @change="setServiceType('Approve')" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">Approve</span>
              </div>
              <div class="toggle-card">
                <label class="toggle-switch">
                  <input type="checkbox" true-value="Y" false-value="N" v-model="form['ma_st']" @change="setServiceType()" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">Maintenance</span>
              </div>
              <div class="toggle-card">
                <label class="toggle-switch">
                  <input type="checkbox" true-value="Y" false-value="N" v-model="form['qc_st']" @change="setServiceType()" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">Quality Control</span>
              </div>
              <div class="toggle-card">
                <label class="toggle-switch">
                  <input type="checkbox" true-value="Y" false-value="N" v-model="form['claim_st']" @change="setServiceType()" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">ค่าใช้จ่ายเพิ่มเติม</span>
              </div>
              <div class="toggle-card">
                <label class="toggle-switch">
                  <input type="checkbox" true-value="Y" false-value="N" v-model="form['auto_task']" @change="setServiceType('Auto')" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">ถาม-ตอบ</span>
              </div>
              <div class="toggle-card" v-if="config.CSM_COMPLETE_AUTO == 'Y'">
                <label class="toggle-switch">
                  <input type="checkbox" true-value="Y" false-value="N" v-model="form['auto_complete']" @change="setServiceType()" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">Auto Complete</span>
              </div>
              <div class="toggle-card" v-if="is_mango()">
                <label class="toggle-switch">
                  <input type="checkbox" true-value="Y" false-value="N" v-model="form['add_file_worker']" @change="setServiceType()" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">เพิ่มไฟล์ Worker</span>
              </div>
                 <div class="toggle-card" v-if="is_mango()">
                <label class="toggle-switch">
                  <input type="checkbox" true-value="Y" false-value="N" v-model="form['send_test_bug']" @change="setServiceType()" :disabled="form['approve_st'] == 'Y'" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">ทดสอบบัค</span>
              </div>
              <div class="toggle-card align-items-center" v-if="config.CSM_COMPLETE_AUTO == 'Y' && form.auto_complete === 'Y'">
                <span class="toggle-label me-2">Duration:</span>
                <vue-select-2 :options="alertDuration()"
                              :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                              v-model="form['complete_days']"
                              style="height:28px; width:80px;">
                </vue-select-2>
              </div>
            </div>
          </div>
        </div>

      </template>
      <template #footer>
        <button class="btn btn-sm btn-success" @click.prevent="saveData()">
          <i class="fa fa-save"></i> บันทึกข้อมูล
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
          <div class="col-md-3">
            <div class="form-group">
              <label>Service Code</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['serv_code']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Service Name</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['serv_name']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Active</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['active']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Approve</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['approve_st']" maxlength="2" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>Maintenance</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['ma_st']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Quality Control</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['qc_st']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Claim</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['claim_st']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Auto Task</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['auto_task']" maxlength="2" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label>Alert Active</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['noti_active']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Line</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['noti_line']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Email</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['noti_email']" maxlength="2" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Alert Day</label>
              <input type="text" class="form-control input-sm text-center text-uppercase" v-model="importForm['noti_date']" maxlength="2" />
            </div>
          </div>
        </div>
      </template>
    </import-data>

    <!-- Modal :Add SA -->
    <modal-2 ref="openAdd_SA" :hideFooter="true">
      <template #header>
        <div class="d-flex align-items-center" style="gap:10px;">
          <div class="sa-header-icon">
            <i class="fas fa-user-tie"></i>
          </div>
          <div>
            <div style="font-size:15px;font-weight:700;color:#1e2a3a;">System Analyst</div>
            <div style="font-size:11px;color:#7e8299;margin-top:1px;">จัดการรายชื่อ System Analyst สำหรับ Service นี้</div>
          </div>
        </div>
      </template>
      <template #body>

        <!-- Summary bar -->
        <div class="sa-summary-bar">
          <span class="sa-count-badge">
            <i class="fas fa-users"></i>
            {{ modalWorkers.length }} คน
          </span>
          <button class="btn btn-sm sa-add-btn" @click="addWorkerLine">
            <i class="fa fa-plus"></i> เพิ่มรายชื่อ
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="modalWorkers.length === 0" class="sa-empty">
          <i class="fas fa-user-plus sa-empty-icon"></i>
          <p>ยังไม่มีรายชื่อ System Analyst</p>
          <p style="font-size:12px;color:#a1a5b7;">กดปุ่ม "เพิ่มรายชื่อ" เพื่อเริ่มต้น</p>
        </div>

        <!-- Person cards -->
        <div class="sa-list">
          <div class="sa-card" v-for="(w, index) in modalWorkers" :key="w.itemno">
            <div class="sa-card-no">{{ w.itemno }}</div>
            <div class="sa-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="sa-card-info">
              <div class="sa-card-name" v-if="w.empfullname">{{ w.empfullname }}</div>
              <div class="sa-card-name sa-placeholder" v-else>— ยังไม่ได้เลือก —</div>
              <div class="sa-card-code" v-if="w.empno">
                <i class="fas fa-id-badge"></i> {{ w.empno }}
              </div>
            </div>
            <div class="sa-card-actions">
              <button class="btn sa-btn-search" @click="empModalSelectedWorker(w.itemno)" title="เลือกพนักงาน">
                <i class="fas fa-search"></i>
              </button>
              <button class="btn sa-btn-remove" @click="removeWorkerLine(w.itemno)" title="ลบ">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="sa-footer" v-if="modalWorkers.length > 0">
          <button type="button" class="btn btn-sm sa-confirm-btn" @click.prevent="confirmEmpSA_list()">
            <i class="fas fa-check-circle"></i> ยืนยันรายชื่อ
          </button>
        </div>

      </template>
    </modal-2>
    <!-- Close Modal :Add SA -->
    <vue-employee-list ref="ct_emp_ref" @send-data="sendComponent1($event)"></vue-employee-list>
  </div>
</template>
<script>
  import XLSX from 'xlsx'
  import { mapState, mapGetters } from '~/stores/helpers'

  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first

  let page = { loadingBox: { show() {}, hide() {} } }
  let paging = {}
  let appForm = {}
  let process = false
  let cpn = {
    data() {
      return {
        ui: window.ui,
        xt: $xt,
        auth,
        pageNumber: 1,
        editMode: false,
        search: {
          field: "serv_code",
          text: "",
          active: "Y"
        },
        form: {},
        total_datalist: 0,
        datalist: [],
        serv_group: [],
        displayData: [],
        isShowTab2: false,
        msg: '',
        importForm: {
          serv_code: 'A',
          serv_name: 'B',
          active: 'C',
          approve_st: 'D',
          ma_st: 'E',
          qc_st: 'F',
          claim_st: 'G',
          auto_task: 'H',
          noti_active: 'I',
          noti_line: 'J',
          noti_email: 'K',
          noti_date: 'L'
        },
        modalWorkers: [],
        rowWorker: '',
      }
    },

    methods: {
      resetData() {
        this.editMode = false
        this.form = {}
        this.form.priority_status = "1"
        this.form.active = "Y"


      },
      newitem() {

        // if (this.serv_group.length > 0) {
        //   this.form.serv_group_code = this.serv_group[0].serv_code
        // }
        this.resetData()
        this.form.noti_date = 0
        this.form.addspec_request = "N"
        this.$refs.modal.openModal()
        this.$refs.modal.setSize("modal-lg-2")

        if (!this.form.alert_type) {
          this.form.alert_type = 'B'
        }
      },
      setImport() {
        this.$refs.importData.openImport();
      },
      doSearch() {
        paging.setCurrentPage(1)
        this.loadData()
      },
      editServiceOpen() {
        this.$refs.modal.openModal()
        this.editMode = true
        this.msg = 'แก้ไขรายการ'
        this.$refs.modal.openModal()
        this.$refs.moadl.setSize("modal-xl-2")
      },
      async pageChange(pn) {
        pn = pn || 1
        this.pageNumber = pn
        paging.setCurrentPage(pn)
        await this.loadData()
      },
      reset() {
        (async () => {
          this.editMode = false
          this.form = {
            serv_code: "",
            serv_name: "",
            approve_st: "N",
            ma_st: "N",
            qc_st: "N",
            claim_st: "N",
            alert_count: 0,
            alert_active: "N",
            // preventive_st: "N",
            addspec_request: "N"
          }
        })()
      },
      async setEdit(x) {
        await this.readData(x.serv_code)
        this.editMode = true
        this.msg = 'แก้ไขรายการ'
        this.$refs.modal.openModal()
        this.$refs.modal.setSize("modal-lg-2")
      },
      initTable() {
        let agr = this.$refs.agr;
        const yesNo = (val) => val === 'Y'
          ? `<span style="color:#00c116;font-weight:600;">YES</span>`
          : `<span style="color:#ff0000;">NO</span>`;
        let fields = [
          ["item", "No.", "number", { width: 100, align: "center", pinned: "left" }],
        ];
        if (this.permission()) {
          fields.push(
   ['_action', 'Action', 'text', { width: 160, child:
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
    }], );
        }
        fields = fields.concat([
          ["serv_code", "Service Code", "text", { width: 130,align: "center", sortable: true, pinned: "left" }],
          ["serv_name", "Service Name", "text", { width: 250, sortable: true }],
          ["active", "Active", "text", { width: 90, align: "center",
            cellRenderer: (params) => params.value === 'Y'
              ? `<span style="color:#00c116;">Yes</span>`
              : `<span style="color:#ff0000;">No</span>`
          }],
          ["approve_st", "Approve", "text", { width: 100, align: "center", cellRenderer: (p) => yesNo(p.value) }],
          ["ma_st", "Maintenance", "text", { width: 120, align: "center", cellRenderer: (p) => yesNo(p.value) }],
          ["qc_st", "Quality Control", "text", { width: 130, align: "center", cellRenderer: (p) => yesNo(p.value) }],
          ["claim_st", "ค่าใช้จ่ายเพิ่มเติม", "text", { width: 150, align: "center", cellRenderer: (p) => yesNo(p.value) }],
          ["auto_task", "ถาม-ตอบ", "text", { width: 100, align: "center", cellRenderer: (p) => yesNo(p.value) }],
          ["noti_active", "แจ้งเตือน", "text", { width: 100, align: "center", cellRenderer: (p) => yesNo(p.value) }],
          ["noti_line", "Line", "text", { width: 80, align: "center", cellRenderer: (p) => yesNo(p.value) }],
          ["noti_email", "Email", "text", { width: 80, align: "center", cellRenderer: (p) => yesNo(p.value) }],
          ["noti_date", "Alert Day", "number", { width: 100, align: "center" }],
          ["adduser", "Add User", "text", { width: 120 }],
          ["add_dt", "Add Date", "text", { width: 120, align: "center",
            cellRenderer: (params) => params.value ? moment(params.value).format('DD/MM/YYYY') : ''
          }],
          ["edituser", "Edit User", "text", { width: 120 }],
          ["edit_dt", "Edit Date", "text", { width: 120, align: "center",
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
          this.setEdit(this.datalist[idx]);
        }
        if (deleteBtn) {
          e.preventDefault();
          let idx = parseInt(deleteBtn.getAttribute('data-idx'));
          this.deleteData(this.datalist[idx]);
        }
      },
      async loadData() {
        let act = `csm/master/CustomerServiceType_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`
        for (var key in this.search) {
          act += `&${key}=${encodeURIComponent(this.search[key])}`
        }
        let rsp = await $xt.getServer(act)

        this.datalist = rsp.data.data_rows
        this.total_datalist = rsp.data.total

        let i = paging.skipItems() == 0 ? 0 : paging.skipItems();
        $linq(this.datalist).foreach(x => {
          x.item = ++i
        })


        paging.setTotalItems(rsp.data.total)
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1)
        }
        paging.createPagesArray()
        this.initTable()
      },
      async readData(serv_code) {
        let act = `csm/master/CustomerServiceType_Read?serv_code=${encodeURIComponent(serv_code || '')}`
        let rsp = await $xt.getServer(act)
        this.form = rsp.data

        if (!this.form.alert_type) {
          this.form.alert_type = 'B'
        }
      },
      async loadDataGroup() {
        let act = `csm/master/GroupCode_ReadList?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}&search_text=${encodeURIComponent(this.search.text || '')}`;
        let rsp = await $xt.getServer(act);

        this.serv_group = $linq(rsp.data.data_rows.data).where(c => c.active == 'Y').toArray();

      },
      setSave() {
        this.save()
      },
      async onImport(e) {
        page.loadingBox.show();
        try {
          let f = {
            data: this.arrImport(e)
          };
          let act = `CSM/Master/CustomerServiceImportData`;
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
            serv_name: x[this.importForm.serv_name],
            active: x[this.importForm.active],
            approve_st: x[this.importForm.approve_st],
            ma_st: x[this.importForm.ma_st],
            qc_st: x[this.importForm.qc_st],
            claim_st: x[this.importForm.claim_st],
            auto_task: x[this.importForm.auto_task],
            noti_active: x[this.importForm.noti_active],
            noti_line: x[this.importForm.noti_line],
            noti_email: x[this.importForm.noti_email],
            noti_date: x[this.importForm.noti_date]
          })
        })
        return arr
      },
      defaultImport() {
        this.importForm = {
          serv_code: 'A',
          serv_name: 'B',
          active: 'C',
          approve_st: 'D',
          ma_st: 'E',
          qc_st: 'F',
          claim_st: 'G',
          auto_task: 'H',
          noti_active: 'I',
          noti_line: 'J',
          noti_email: 'K',
          noti_date: 'L'
        }
      },
      async onTemplateExcel() {
        let act = `csm/master/TemplateExcelService`
        let rsp = await $xt.getServer(act)
        window.open(window.dataServer + `API/File/DownLoad?download=true&id=${rsp.data}`)
      },
      async saveData() {
        if (process) return
        try {
          let formData = JSON.parse(JSON.stringify(this.form));
          let f = {
            header: formData
          }
          console.log('dssdsds', formData)
          // return;
          let act = `csm/master/CustomerServiceType_Create`
          if (this.editMode) {
            act = `csm/master/CustomerServiceType_Update`
          }

          page.loadingBox.show()
          let rsp = await $xt.postServerJson(act, f)
          if (!rsp.success) {
            throw rsp.error
          }

          await this.loadData()

          $msg.alert(`Success`, `Your information has been saved successfully.`, `success`)

          this.resetData()
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          process = false
          page.loadingBox.hide()
        }
        this.$refs.modal.closeModal()
      },
      async deleteData(x) {
        if (!await $msg.confirm(`คุณต้องการลบข้อมูล Service Type : ${x.serv_name} นี้ ใช่หรือไม่`)) {
          return
        }
        try {
          let f = {
            header: x
          }
          let act = `csm/master/CustomerServiceType_Delete`
          page.loadingBox.show()
          let rsp = await $xt.postServerJson(act, f)
          if (!rsp.success) {
            throw rsp.error
          }

          await this.resetData()
          await this.loadData()

          $msg.alert(`ทำการลบข้อมมูลเสร็จสิ้น`, `ทำการลบข้อมมูล : ${x.serv_name} เรียบร้อยแล้ว`, `success`)
        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          // process = false
          page.loadingBox.hide()
        }
      },
      setServiceType(type) {
        switch (type) {
          case "Approve":
            if (this.form.approve_st == "Y") {
              this.form.send_test_bug = "N"
            }
            break
          case "Auto":
            if (this.form.auto_task == "Y") {
              this.form.approve_st = "N"
              this.form.ma_st = "N"
              this.form.qc_st = "N"
              this.form.claim_st = "N"
            }
            else {
              this.form.approve_st = this.form.approve_st_tmp
              this.form.ma_st = this.form.ma_st_tmp
              this.form.qc_st = this.form.qc_st_tmp
              this.form.claim_st = this.form.claim_st_tmp
              // this.form.preventive_st = this.form.preventive_st_tmp
              this.form.addspec_request = this.form.addspec_request
              this.form.auto_task = "N"
            }
            break
          default:
            this.form.complete_days = 1
            this.form.auto_task = "N"
            break
        }
      },
      onExport() {
        let arr = []
        if (this.datalist.length > 0) {
          $linq(this.datalist).foreach(x => {
            arr.push({
              'serv_code': x.serv_code,
              'serv_name': x.serv_name,
              'approve_st': x.approve_st,
              'ma_st': x.ma_st,
              'qc_st': x.qc_st,
              'claim_st': x.claim_st,
              'auto_task': x.auto_task,
              // 'preventive_st': x.preventive_st,
              'addspec_request': x.addspec_request,
            })
          })
        }
        else {
          arr.push({
            'serv_code': "",
            'serv_name': "",
            'approve_st': "",
            'ma_st': "",
            'qc_st': "",
            'claim_st': "",
            'auto_task': "",
            // 'preventive_st': "",
            'addspec_request': "",
          })
        }
        var dataWS = XLSX.utils.json_to_sheet(arr)
        var wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, dataWS)
        XLSX.writeFile(wb, 'Service_Type.xlsx')
      },
     is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault() || "N"
        return isMango == "Y"
      },
      permission() {
        let data = (!this.is_mango() || auth.is_admin)
        return data
      },
      alertDuration() {
        return Array.from({ length: 14 }, (_, i) => ({
          id: i + 1,
          text: (i + 1).toString()
        }))
      },
      OpenaddSA() {
        if (!this.form.add_emp_sa_mg) {
          this.modalWorkers = [];
        } else {
          let empList = [];
          try {
            empList = JSON.parse(this.form.add_emp_sa_mg);
          } catch (err) {
            console.error("JSON parse error for add_emp_sa_mg", err);
            empList = [];
          }
          // map ให้ modalWorkers มี itemno และ field ครบ
          this.modalWorkers = empList.map((w, index) => ({
            itemno: index + 1,
            empno: w.empno,
            empfullname: w.empfullname,
            serType: w.serType
          }));
        }
        this.$refs.openAdd_SA.openModal();
      },
      empModalSelectedWorker(index) {
        this.rowWorker = index;
        this.$refs.ct_emp_ref.openModal();
      },
      removeWorkerLine(rowNo) {
        this.modalWorkers = this.modalWorkers.filter(w => w.itemno !== rowNo);
        this.modalWorkers.forEach((w, i) => {
          w.itemno = i + 1;
        });
      },
      sendComponent1(e) {
        let gf = this.modalWorkers.find(x => x.itemno === this.rowWorker && x.serType === this.form.serv_code);
        gf.empno = e.empno;
        gf.empfullname = e.empfullname;
        console.log('this.modalWorkers', gf)
        console.log('teeeee', e)
      },
      addWorkerLine() {
        let newNo = this.modalWorkers.length + 1;
        this.modalWorkers.push({ itemno: newNo, empno: '', empfullname: '', serType: this.form.serv_code });
      },
      confirmEmpSA_list2() {
        // รายการ worker ที่เลือกใน modal (ผลลัพธ์สุดท้าย)
        let updatedList = this.modalWorkers
          .filter(w => w.serType === this.form.serv_code && w.empno)
          .map(w => ({
            itemno: w.itemno,
            empno: w.empno,
            empfullname: w.empfullname,
            serType: w.serType
          }));

        // -------- เช็คเฉพาะ updatedList ว่าซ้ำไหม ----------

        let empnos = updatedList.map(x => x.empno);

        // หา empno ที่ซ้ำใน modal เดียวกัน (เช็คซ้ำตัวเอง)
        let duplicates = empnos.filter((id, idx) => empnos.indexOf(id) !== idx);

        if (duplicates.length > 0) {
          $msg.alert(
            "พบพนักงานซ้ำ",
            `รหัสพนักงานซ้ำในรายการ: ${duplicates.join(", ")}`,
            "warning"
          );
          return;
        }
        // ไม่มีข้อมูลซ้ำ → บันทึก
        this.form.add_emp_sa_mg = JSON.stringify(updatedList);
        this.$refs.openAdd_SA.closeModal();

        console.log("SA list JSON:", this.form.add_emp_sa_mg);
      },
      confirmEmpSA_list() {
        // รายการ worker ที่เลือกใน modal
        let updatedList = this.modalWorkers
          .filter(w => w.serType === this.form.serv_code && w.empno)
          .map(w => ({
            itemno: w.itemno,
            empno: w.empno,
            empfullname: w.empfullname,
            serType: w.serType
          }));

        // -------- เช็คข้อมูลซ้ำภายใน updatedList ----------
        let seen = {};
        let duplicateNames = [];

        updatedList.forEach(w => {
          if (seen[w.empno]) {

            // แบบ ชื่อ (empno)
            duplicateNames.push(`${w.empfullname} (${w.empno})`);

          } else {
            seen[w.empno] = true;
          }
        });

        if (duplicateNames.length > 0) {
          $msg.alert(
            "พบพนักงานซ้ำ",
            `พนักงานต่อไปนี้ซ้ำในรายการ:\n\n
            • ${duplicateNames.join("\n• ")}`,
            "warning"
          );
          return;
        }

        // ไม่มีข้อมูลซ้ำ → เซฟได้
        this.form.add_emp_sa_mg = JSON.stringify(updatedList);
        this.$refs.openAdd_SA.closeModal();

        console.log("SA list JSON:", this.form.add_emp_sa_mg);
      }

    },
    computed: {
      configData() { return store.state.configData },
      ...mapState(['config']),
      addEmpCount() {
        if (!this.form.add_emp_sa_mg) return 0;
        try {
          return JSON.parse(this.form.add_emp_sa_mg).length;
        } catch {
          return 0;
        }
      },

    },
    async mounted() {
      page = this.$refs.page
      page.pageTitle = ' Setup : Service Type'
      document.title = page.pageTitle

      paging = this.$refs.paging
      paging.setCurrentPage(1)
      paging.setItemsPerPage(500)

      appForm = this.$refs.appForm
      appForm.btnDelete.show = false
      appForm.btnSave.show = false
      console.log('this.permission()',this.permission())
      if (await this.permission()) {
        appForm.btnNew.click = this.newitem
        appForm.btnImport.click = this.setImport
      } else {
        appForm.btnNew.show = false
        appForm.btnImport.show = false
      }


      this.resetData()
      this.loadData()
      this.loadDataGroup()
    }
  }

  export default cpn
</script>
<style scoped>
  .text-success {
    color: #00c116 !important;
  }

  .text-danger {
    color: #ff0000 !important;
  }

  .red {
    color: #f1416c !important;
  }

  /* Modal Sections */
  .modal-section {
    border: 1px solid #e4e6ef;
    border-radius: 8px;
    margin-bottom: 14px;
    overflow: hidden;
  }

  .modal-section-header {
    background: #0e3467;
    color: #fff;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .modal-section-header i {
    font-size: 13px;
    opacity: 0.85;
  }

  .modal-section-body {
    padding: 14px 16px 8px;
    background: #fff;
  }

  /* Field Labels */
  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: #3f4254;
    margin-bottom: 4px;
    display: block;
  }

  .field-label.required::after {
    content: ' *';
    color: #f1416c;
  }

  /* Badge */
  .modal-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }

  .badge-active {
    background: #e8fff3;
    color: #50cd89;
    border: 1px solid #50cd89;
  }

  .badge-inactive {
    background: #fff5f8;
    color: #f1416c;
    border: 1px solid #f1416c;
  }

  /* Toggle Switch */
  .toggle-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
    margin: 0;
    cursor: pointer;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    inset: 0;
    background-color: #ccc;
    border-radius: 20px;
    transition: 0.3s;
  }

  .toggle-slider::before {
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

  .toggle-switch input:checked + .toggle-slider {
    background-color: #50cd89;
  }

  .toggle-switch input:checked + .toggle-slider::before {
    transform: translateX(16px);
  }

  .toggle-label {
    font-size: 11px;
    font-weight: 600;
    color: #5e6278;
    white-space: nowrap;
  }

  /* Toggle Group (horizontal row) */
  .toggle-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .toggle-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  /* Toggle Cards (for config section) */
  .toggle-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    background: #f9f9f9;
    border: 1px solid #e4e6ef;
    border-radius: 8px;
    padding: 10px 14px;
    min-width: 90px;
    transition: border-color 0.2s;
  }

  .toggle-card:hover {
    border-color: #009ef7;
  }

  /* ===== Modal Add SA ===== */
  .sa-header-icon {
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

  .sa-summary-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f9f9f9;
    border: 1px solid #e4e6ef;
    border-radius: 8px;
    padding: 8px 14px;
    margin-bottom: 14px;
  }

  .sa-count-badge {
    font-size: 13px;
    font-weight: 600;
    color: #3f4254;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sa-count-badge i { color: #009ef7; }

  .sa-add-btn {
    background: #009ef7;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 14px;
    transition: background 0.2s;
  }

  .sa-add-btn:hover { background: #0086d4; color: #fff; }

  .sa-empty {
    text-align: center;
    padding: 30px 20px;
    color: #a1a5b7;
  }

  .sa-empty-icon {
    font-size: 40px;
    color: #d0d3e0;
    margin-bottom: 10px;
    display: block;
  }

  .sa-empty p { margin: 4px 0; font-size: 13px; }

  .sa-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 340px;
    overflow-y: auto;
    padding-right: 2px;
  }

  .sa-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fff;
    border: 1px solid #e4e6ef;
    border-radius: 10px;
    padding: 10px 14px;
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .sa-card:hover {
    border-color: #009ef7;
    box-shadow: 0 2px 8px rgba(0, 158, 247, 0.12);
  }

  .sa-card-no {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #f1f3f8;
    color: #7e8299;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sa-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e8f4fd, #c8e6f9);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #009ef7;
    font-size: 16px;
    flex-shrink: 0;
  }

  .sa-card-info { flex: 1; min-width: 0; }

  .sa-card-name {
    font-size: 13px;
    font-weight: 600;
    color: #1e2a3a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sa-placeholder {
    color: #a1a5b7 !important;
    font-weight: 400 !important;
    font-style: italic;
  }

  .sa-card-code {
    font-size: 11px;
    color: #7e8299;
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .sa-card-actions { display: flex; gap: 6px; flex-shrink: 0; }

  .sa-btn-search {
    width: 30px;
    height: 30px;
    border-radius: 6px;
    background: #e8f4fd;
    color: #009ef7;
    border: 1px solid #c8e6f9;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: background 0.2s;
  }

  .sa-btn-search:hover { background: #009ef7; color: #fff; border-color: #009ef7; }

  .sa-btn-remove {
    width: 30px;
    height: 30px;
    border-radius: 6px;
    background: #fff5f8;
    color: #f1416c;
    border: 1px solid #fcd4df;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: background 0.2s;
  }

  .sa-btn-remove:hover { background: #f1416c; color: #fff; border-color: #f1416c; }

  .sa-footer {
    margin-top: 14px;
    display: flex;
    justify-content: flex-end;
  }

  .sa-confirm-btn {
    background: #50cd89;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    padding: 7px 20px;
    transition: background 0.2s;
  }

  .sa-confirm-btn:hover {
    background: #3db876;
    color: #fff;
  }
</style>


