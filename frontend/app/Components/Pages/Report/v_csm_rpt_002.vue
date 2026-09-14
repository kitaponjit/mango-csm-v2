<template>
  <div>
    <report ref="rpt" :extra-cond2="extraCond" @clearPreEvent="clearPreEvent" :use-print-template="true" :grid-header="grid_header" :printPDF="true"
     :raw-file-cache="raw_filename" :raw-data="rawData" raw-name="v_csm_rpt_002" :pdfLabel="grid_header">
      <template #extra-cond>
          <div class="row">
              <div class="col-md-2">
                  <div class="form-group">
                  <label>รูปแบบการแสดงข้อมูล</label>
                  <select class="form-control input-sm" v-model="extraCond.all">
                      <option value="A">รายงานปกติ</option>
                      <option value="Y">แสดงทั้งโครงการ(ต้องเลือกโครงการ)</option>
                      <option value="P">แสดงเฉพาะโครงการ</option>
                      <option value="D">แสดงเฉพาะแผนก</option>
                      <option value="N" v-if="!isMango()">ข้อมูลที่ไม่มีโครงการ</option>
                  </select>
                  </div>
              </div>
          </div>
      </template>

      <template #display>
        <div class="row">
          <div class="col-md-12">
            <ag-table ref="agr" :footer="false" @ready="initTable()"></ag-table>
          </div>
        </div>
      </template>

      <template #export>
      </template>
    </report>

    <!-- Modal : Center -->
    <vue-project-list ref="project" @send-data="selectInfoComponent($event, 'project')"></vue-project-list>
    <vue-project2-list ref="ct_project2" @send-data="selectInfoComponent($event, 'ct_project2')" :chk_code="chk_code"></vue-project2-list>
    <vue-employee-list ref="employee" @send-data="selectInfoComponent($event, 'employee')"></vue-employee-list>
    <vue-ar-customer-list ref="customer" @send-data="selectInfoComponent($event, 'customer')"></vue-ar-customer-list>
    <vue-area-list ref="area_name" @send-data="selectInfoComponent($event, 'area_name')" :preEvent="preEvent" :isMango="false"></vue-area-list>
    <vue-area-list ref="area_code" @send-data="selectInfoComponent($event, 'area_code')" :preEvent="preEvent" :isMango="false"></vue-area-list>
  <vue-job  ref="jobs" type='H' @send-data="selectInfoComponent($event, 'job_H')"></vue-job>
    <vue-job  ref="jobs_d"  type='D'  @send-data="selectInfoComponent($event, 'job_D')"></vue-job>
  </div>
</template>

<script type="text/javascript">
import report from '../../Center/report-condition.vue'


let rpt = {};

let condTemplate = [];
let item_type = [];

condTemplate.push({
  field_name: 'pre_event',
  display_name: 'Project',
  field_type: 'string', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['=', '>=', '<='],
  operatorx_default: '=',
  value_arr: [], //empty or null for textbox
  value_default: 0,
  multiple: true, //true,
  multiple_type: 'and', //and or,
  func_name: 'openProjectModal',
});

condTemplate.push({
  field_name: 'customer_code',
  display_name: 'Customer',
  field_type: 'string', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['='],
  operatorx_default: '=',
  value_arr: [], //empty or null for textbox
  value_default: '',
  multiple: true, //true,
  multiple_type: 'or', //and or,
  func_name: 'openCustomerModal',
});

condTemplate.push({
  field_name: 'job_date_search',
  display_name: 'Req. Date',
  field_type: 'date', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['=', '>=', '<='],
  operatorx_default: '>=',
  value_arr: null, //empty or null for textbox
  value_default: moment().format('DD/MM/YYYY'),
  multiple: true, //true,
  multiple_type: 'and', //and or,
  func_name: '',
});

condTemplate.push({
  field_name: 'due_date',
  display_name: 'Due Date',
  field_type: 'date', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['=', '>=', '<='],
  operatorx_default: '>=',
  value_arr: null, //empty or null for textbox
  value_default: moment().format('DD/MM/YYYY'),
  multiple: true, //true,
  multiple_type: 'and', //and or,
  func_name: '',
});

condTemplate.push({
  field_name: 'item_type',
  display_name: 'Service Type',
  field_type: 'string', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['=', '!='],
  operatorx_default: '=',
  value_arr: item_type, //empty or null for textbox
  value_default: '',
  multiple: true, //true,
  multiple_type: 'and',
  func_name: null
});

condTemplate.push({
  field_name: 'status',
  display_name: 'Job Status',
  field_type: 'string', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['='],
  operatorx_default: '=',
  value_arr: null, //empty or null for textbox
  value_default: '',
  multiple: true, //true,
  multiple_type: 'or',
  func_name: null
});

condTemplate.push({
  field_name: 'subject',
  display_name: 'Subject',
  field_type: 'string', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['=', 'Like'],
  operatorx_default: '=',
  value_arr: null, //empty or null for textbox
  value_default: '',
  multiple: true, //true,
  multiple_type: 'and',
  func_name: null
});

condTemplate.push({
  field_name: 'request_empno',
  display_name: 'Req.By',
  field_type: 'int', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['='],
  operatorx_default: '=',
  value_arr: [], //empty or null for textbox
  value_default: '',
  multiple: true, //true,
  multiple_type: 'or', //and or,
  func_name: 'openEmployeeModal'
});

condTemplate.push({
  field_name: 'assign_empno',
  display_name: 'Assignment',
  field_type: 'int', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['='],
  operatorx_default: '=',
  value_arr: [], //empty or null for textbox
  value_default: '',
  multiple: true, //true,
  multiple_type: 'or', //and or,
  func_name: 'openEmployeeModal'
});

condTemplate.push({
  field_name: 'contract_user',
  display_name: 'Contact User',
  field_type: 'string', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['='],
  operatorx_default: '=',
  value_arr: null, //empty or null for textbox
  value_default: '',
  multiple: false, //true,
  multiple_type: 'and',
  func_name: null
});

condTemplate.push({
  field_name: 'req_type',
  display_name: 'Req. Type',
  field_type: 'string', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['='],
  operatorx_default: '=',
  value_arr: null, //empty or null for textbox
  value_default: '',
  multiple: false, //true,
  multiple_type: 'and',
  func_name: null
});

condTemplate.push({
  field_name: 'connection_type',
  display_name: 'Connection',
  field_type: 'string', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['='],
  operatorx_default: '=',
  value_arr: null, //empty or null for textbox
  value_default: '',
  multiple: false, //true,
  multiple_type: 'and',
  func_name: null
});

condTemplate.push({
  field_name: 'send_pretest_dt',
  display_name: 'Send Requester Date',
  field_type: 'date', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['=', '>=', '<='],
  operatorx_default: '>=',
  value_arr: null, //empty or null for textbox
  value_default: moment().format('DD/MM/YYYY'),
  multiple: true, //true,
  multiple_type: 'and', //and or,
  func_name: '',
});

condTemplate.push({
  field_name: 'send_pretest_to_tester_dt',
  display_name: 'Send To Tester Date',
  field_type: 'date', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['=', '>=', '<='],
  operatorx_default: '>=',
  value_arr: null, //empty or null for textbox
  value_default: moment().format('DD/MM/YYYY'),
  multiple: true, //true,
  multiple_type: 'and', //and or,
  func_name: '',
});

condTemplate.push({
  field_name: 'job_no',
  display_name: 'CSM No.',
  field_type: 'string', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['=', '>=', '<='],
  operatorx_default: '=',
  value_arr: [], //empty or null for textbox
  value_default: '',
  multiple: true, //true,
  multiple_type: 'and', //and or,
  func_name: '',
});

// เพิ่ม

condTemplate.push({
  field_name: 'serv_code',
  display_name: 'หมวดงาน',
  field_type: 'string', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['=', '>=', '<='],
  operatorx_default: '=',
  value_arr: [], //empty or null for textbox
  value_default: '',
  multiple: true, //true,
  multiple_type: 'and', //and or,
  func_name: 'openJobsModal',
});
condTemplate.push({
  field_name: 'serv_code_d',
  display_name: 'ประเภทงาน',
  field_type: 'string', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['=', '>=', '<='],
  operatorx_default: '=',
  value_arr: [], //empty or null for textbox
  value_default: '',
  multiple: true, //true,
  multiple_type: 'and', //and or,
  func_name: 'openJobsDetailModal',
});

condTemplate.push({
  field_name: 'overdue',
  display_name: 'Overdue',
  field_type: 'int', //int, decimal, boolean
  field_group: 'search',
  operatorx_arr: ['=', '>=', '<='],
  operatorx_default: '>=',
  value_arr: [], //empty or null for textbox
  value_default: 0,
  multiple: true, //true,
  multiple_type: 'and', //and or,
  func_name: ''
});

export default {
  data() {
    return {
      xt: $xt,
      baseUrl,
      condTemplate,
      extraCond: {
        all: 'A',
      },
      display: [],
      rawData: [],
      grid_header: [],
      raw_filename: "",
      moduleCodeData: "",
      moduleForMango: moduleCodeData,
      platformCodeData,
      statusCodeData,
      chk_code: "N",
      preEvent: ""
    };
  },
  components: {
    report,
  },
  methods: {
    async setRptData(d, cond) {
      let agr = this.$refs.agr;
      this.display = d.d_list || [];
      let detail = d.d_list || [];
      let o = 1;
      $linq(detail).foreach((x) => {
        let overdue = this.diffDaysHours(
          moment(x.complete_date, "Y/M/D hh:mm:ss"),
          moment(x.job_date, "Y/M/D hh:mm:ss"), 
          ["months", "days", "hours"]
        );
        x.no = o++;
        x.overdue = Math.abs(x.overdue) || "";
        x.overdueM = overdue.months <= 0 || $xt.isEmpty(overdue.months) || isNaN(overdue.months) ? "" : overdue.months + " เดือน ";
        x.overdueD = overdue.days <= 0 || $xt.isEmpty(overdue.days) || isNaN(overdue.days) ? "" : overdue.days + " วัน ";
        x.overdueH = overdue.hours <= 0 || $xt.isEmpty(overdue.hours) || isNaN(overdue.hours) ? "" : overdue.hours + " ชั่วโมง ";
        x.overdues = x.overdueM + x.overdueD + x.overdueH;
      //   x.module = this.isMango() ? x.module : this.areaName(x.module);
        x.module = this.isMango() ? x.module : x.locname;
        x.status = this.statusName(x.job_status, x.status);
        x.item_type = this.itemTypeName(x.item_type);
        x.job_priority = this.jobName(x.job_priority);
        x.req_type = this.reqTypeName(x.req_type);
        x.platform = this.ConvertPlatform(x.platform);
        x.approve_status == 'Y' ? 'Approved' : x.approve_status == 'C' ? 'Rejected' : x.approve_status  == 'Y' && x.tester_approve == 'Y' ? 'Waiting' : ''
      });

      this.rawData = d.raw_data;
      this.raw_filename = d.raw_filename;

      /* Display : Reformat Header */
      this.initTable();

      /* Display : Header */
      agr.setDisplay(detail);
    },
    openProjectModal() {
      //this.$refs.project.openModal();
      this.chk_code = "N";
      this.$refs.ct_project2.openModal();
    },
    openEmployeeModal() {
      this.$refs.employee.openModal();
    },
    openCustomerModal() {
      this.$refs.customer.openModal();
    },
    openAreaCodeModal() {
      this.$refs.area_code.openModal();
    },
    openJobsModal() {
      this.$refs.jobs.openModal(); 
    },
     openJobsDetailModal() {
      this.$refs.jobs_d.openModal(); 
    },
    openAreaNameModal() {
      this.$refs.area_name.openModal();
    },
    itemTypeName(code) {
      return $linq(this.serviceCodeData).where(x => x.serv_code == code).select(x => x.serv_name).firstOrDefault() || '';
    },
    jobName(code) {
      return $linq(this.priorityCodeData).where(x => x.prioity_code == code).select(x => x.prioity_des).firstOrDefault() || '';
    },
    reqTypeName(code) {
      return $linq(this.requestCodeData).where(x => x.req_code == code).select(x => x.req_des).firstOrDefault() || '';
    },
    statusName(job_status, code) {
      return job_status == 'I' && code == 'W' ? 'Queued' : job_status == 'H' ? 'Draft' : $linq(this.statusCodeData).where(x => x.id == code).select(x => x.name).firstOrDefault() || '';
    },
    areaName(code) {
      return ($linq(this.moduleCodeData).where((x) => x.loccode == code).select((x) => x.locname).firstOrDefault() || "");
    },
    statusClass(prefix, status) {
      return status == 'Y' ? prefix + 'success' : status == 'I' ? prefix + 'info' : status == 'N' ? prefix + 'danger' : status == 'H' ? prefix + 'warning' : '';
    },
    isMango() {
      let isMango = $linq(this.configData).where(x => x.config_id == "TRN0001").select(x => x.config_value).firstOrDefault();
      return isMango == "Y" ? true : false;
    },
    ConvertPlatform(text) {
      let txt = ""
      text == "WIN" ? txt = "Window" : text == "WEB" ? txt = "Web" : text == "MOB" ? txt = "Mobile" : text == "1111" ? txt = "All" : ""
      return txt
    },
    clearPreEvent() {
      this.preEvent = ""
    },
    diffDaysHours(mm_object1, mm_object2, periods) {
      let less,
        more,
        diff,
        obj = {};
      if (mm_object1.isSameOrBefore(mm_object2)) {
        less = mm_object2;
        more = mm_object2;
      } else {
        less = mm_object2;
        more = mm_object1;
      }
      $linq(periods).foreach((x) => {
        diff = Math.abs(less.diff(more, x));
        less = moment(less).add(diff, x);
        obj[x] = diff;
      });
      return obj;
    },
    selectInfoComponent(e, keyword) {
      switch (keyword) {
        case "project":
          rpt.setRowData(e.pre_event, e.pre_event)
          this.preEvent = e.pre_event
          break;
        case "employee":
          rpt.setRowData(e.empno, e.empfullname_t);
          break;
        case "customer":
          rpt.setRowData(e.customer_code, e.customer_name);
          break;
        case "area_name":
          rpt.setRowData(e.locname, e.locname);
          break;
        case "area_code":
          rpt.setRowData(e.loccode, e.loccode);
          break;
        case "ct_project2":
          rpt.setRowData(e.pre_event, e.pre_event)
          this.preEvent = e.pre_event
          break;
           case "job_H":
          rpt.setRowData(e.serv_code, e.serv_code);
          break;
           case "job_D":
          rpt.setRowData(e.serv_code_d, e.serv_code_d);
          break;
      }
    },
    async initTable() {
      let agr = this.$refs.agr;

      let bold_underline = { "font-weight": "bold" };
      let bold_style = (p) => (p?.data?.bold ? bold_underline : {});
      let priority_style = (p) => ({"color": `${p?.data?.priority_color}`});
      let textmodule = this.isMango() ? "Module" : "Area";
      const isModule = this.isMango();
      let fields = [];
 
      if (this.isMango())
      {
        fields = [
          ["proj", "", "text", { rowGroup: true }],
          ["no", "No.", "text", { width: 80, align: "center" }],
          ["job_no", "CSM No.", "text", { width: 150, align: "center", cellRenderer: (params) => { if (params.value) { return `<a href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${params.value}" style="text-decoration: none; cursor: pointer; color: blue;" target="_blank">${params.value}</a>`; } return ""; }, },],
          ["revision_", "Revision", "text", { width: 150, align: "center" }],
          ["itemno", "Item No.", "text", { width: 100, align: "center", cellStyle: bold_style }],
          ["t_manhour", "Total Man-Hour (MM)", "n0", { width: 200, align: "right", cellStyle: bold_style }],
          ["job_date", "Req. Date", "datetime", { width: 200, align: "center", sortable: true }, { useCellRenderer: true }],
          ["esp_date", " Expected Date", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
          ["worker_start_date", "Work Date", "datetime", { width: 180, align: "center" }, { useCellRenderer: true }],
          ["due_date", "Due Date", "date", { width: 220, align: "center" }, { useCellRenderer: true }],
          ["customer_name", "Customer", "text", { width: 180, align: "center" }],
          ["module", isModule ? "Module" : "Area", "text", {
            width: isModule ? 150 : 250,
            align: isModule ? "center" : "left"
          }],
          ["subject", "Subject", "text", { width: 300, align: "left" }],
          ["platform", "Platform", "text", { width: 150, align: "center", }],
          ["item_type", "Type", "text", { width: 150, align: "left" }],
          ["detail", "Description", "text", { width: 500, align: "left" }],
          ["job_category", "หมวดงาน", "text", { width: 150, align: "left", }],
          ["job_type", "ประเภทงาน", "text", { width: 200, align: "left",  }],
          ["job_priority", "Priority", "text", { width: 200, align: "center", cellStyle: priority_style },],
          ["req_type", "Source", "text", { width: 180, align: "center" }],
          ["assign_empno_name", "Responsible", "text", { width: 200, align: "center" }],
          ["full_worker", "Worker", "text", { width: 200, align: "center" }],
          ["request_name", "Req. By", "text", { width: 200, align: "center", }],
          ["war_code", "Warranty Code", 'text', { width: 200, align: "center" },],
          ["item_name", "Warranty Name", 'text', { width: 200, align: "center" }],
          ["serial_number", "Serial No.", "text", { width: 200, align: "center" }],
          ["status", "Status", "text", {
            width: 180, align: "center",
            cellRenderer: (params) => {
              let status = params.value === "Complete" ? "Y" : params.value === "In Progress" ? "I" : params.value;
              let statusClass = this.statusClass("text-", status);
              return `<span class="${statusClass}">${params.value}</span>`;
            }
          }],
          ["remark_rej", "Remark Status(Reject/Hold)", "text", { width: 280, align: "left" }],
          ["send_pretest_dt", "Send to Requester Date", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
          ["send_pretest_to_tester_dt", "Send To Tester Date", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
          ["customer_sign", "Customer Sign", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
          ["complete_date", "Complete Date", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
          ["overdue", "Over Due", "text", { width: 180, align: "center" }],
          ["overdues", "Work Duration", "text", {
            width: 180, align: "center", cellRenderer: (params) => {
              return `<span class="text-danger">${params.value}</span>`;
            }
          }],
          ["contract_user", "Contact User", "text", { width: 180, align: "left" }],
          ["approve_status_name", "Approve Status", "text", { width: 180, align: "center" }],
          ["approve_date", "Approve Date", "datetime", { width: 180, align: "center" }, { useCellRenderer: true }],
          ["remark", "Remark", "text", { width: 180, align: "left" }],
        ];
      }
      else {
        fields=[
          ["proj", "", "text", { rowGroup: true }],
          ["no", "No.", "text", { width: 80, align: "center" }],
          ["job_no", "CSM No.", "text", { width: 150, align: "center", cellRenderer: (params) => { if (params.value) { return `<a href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${params.value}" style="text-decoration: none; cursor: pointer; color: blue;" target="_blank">${params.value}</a>`; } return ""; }, },],
          ["itemno", "Item No.", "text", { width: 100, align: "center", cellStyle: bold_style }],
          ["job_date", "Req. Date", "datetime", { width: 200, align: "center", sortable: true }, { useCellRenderer: true }],
          ["esp_date", " Expected Date", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
          ["worker_start_date", "Work Date", "datetime", { width: 180, align: "center" }, { useCellRenderer: true }],
          ["due_date", "Due Date", "date", { width: 220, align: "center" }, { useCellRenderer: true }],
          ["customer_name", "Customer", "text", { width: 180, align: "center" }],
          ["module", isModule ? "Module" : "Area", "text", {
            width: isModule ? 150 : 250,
            align: isModule ? "center" : "left"
          }],
          ["subject", "Subject", "text", { width: 200, align: "left" }],
        
          ["item_type", "Type", "text", { width: 150, align: "left" }],
          ["detail", "Description", "text", { width: 500, align: "left" }],
          ["job_category", "หมวดงาน", "text", { width: 150, align: "left",  }],
          ["job_type", "ประเภทงาน", "text", { width: 200, align: "left",  }],

          ["job_priority", "Priority", "text", { width: 200, align: "center", cellStyle: priority_style },],
          ["req_type", "Source", "text", { width: 180, align: "center" }],
          ["assign_empno_name", "Responsible", "text", { width: 200, align: "center" }],
          ["full_worker", "Worker", "text", { width: 200, align: "center" }],
          ["request_name", "Req. By", "text", { width: 200, align: "center", }],
          ["war_code", "Warranty Code", 'text', { width: 200, align: "center" },],
          ["item_name", "Warranty Name", 'text', { width: 200, align: "center" }],
          ["serial_number", "Serial No.", "text", { width: 200, align: "center" }],
          ["status", "Status", "text", {
            width: 180, align: "center",
            cellRenderer: (params) => {
              let status = params.value === "Complete" ? "Y" : params.value === "In Progress" ? "I" : params.value;
              let statusClass = this.statusClass("text-", status);
              return `<span class="${statusClass}">${params.value}</span>`;
            }
          }],
          ["remark_rej", "Remark Status(Reject/Hold)", "text", { width: 280, align: "left" }],
          ["send_pretest_dt", "Send to Requester Date", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
          ["send_pretest_to_tester_dt", "Send To Tester Date", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
          ["customer_sign", "Customer Sign", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
          ["complete_date", "Complete Date", "datetime", { width: 200, align: "center" }, { useCellRenderer: true }],
          ["overdue", "Over Due", "text", { width: 180, align: "center" }],
          ["overdues", "Work Duration", "text", {
            width: 180, align: "center", cellRenderer: (params) => {
              return `<span class="text-danger">${params.value}</span>`;
            }
          }],
          ["contract_user", "Contact User", "text", { width: 180, align: "left" }],
          ["approve_status_name", "Approve Status", "text", { width: 180, align: "center" }],
          ["approve_date", "Approve Date", "datetime", { width: 180, align: "center" }, { useCellRenderer: true }],
          ["remark", "Remark", "text", { width: 180, align: "left" }],
        ]
      }
     

      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);

      this.grid_header = header;
    },
    createPdfData() {
        return this.$refs.agr.createPdfData();
      },
  },
  computed: {
    connectionCodeData() { return store.state.connectionCodeData },
    requestCodeData() { return store.state.requestCodeData },
    priorityCodeData() { return store.state.priorityCodeData },
    serviceCodeData() { return store.state.serviceCodeData },
    configData() { return store.state.configData },
  },
  async mounted() {
      rpt = this.$refs.rpt
      rpt.setTitle('รายงานการติดตามสถานะงาน')
      rpt.setTemplate(this.condTemplate)

      await $xt.sleep(1000)
      do {
      //  console.log("LoadMore");
        await $xt.sleep(500)
      } while (this.serviceCodeData.length == 0);
    //  console.log('fff', this.isMango())

      if (this.isMango()) { 
        condTemplate.push({
          field_name: 'module',
          display_name: 'Module',
          field_type: 'string', //int, decimal, boolean
          field_group: 'search',
          operatorx_arr: ['='],
          operatorx_default: '=',
          value_arr: module, //empty or null for textbox
          value_default: '',
          multiple: true, //true,
          multiple_type: 'and',
          func_name: 'openAreaModal'
        });

        condTemplate.push({
          field_name: 'platform',
          display_name: 'Platform',
          field_type: 'string', //int, decimal, boolean
          field_group: 'search',
          operatorx_arr: ['='],
          operatorx_default: '=',
          value_arr: [], //empty or null for textbox
          value_default: 'WIN',
          multiple: true, //true,
          multiple_type: 'and', //and or,
          func_name: '',
        });

        condTemplate.push({
          field_name: 'revision_',
          display_name: 'เลขที่ Revision',
          field_type: 'string', //int, decimal, boolean
          field_group: 'search',
          operatorx_arr: ['=', '>=', '<='],
          operatorx_default: '>=',
          value_arr: null, //empty or null for textbox
          value_default: '0',
          multiple: true, //true,
          multiple_type: 'and',
          func_name: null
        });


        $linq(this.condTemplate).where(x => x.field_name == 'platform').foreach(x => {
          x.value_arr = $linq(this.platformCodeData).where(x => x.id != '111').select(x => {
            return {
              value: x.id,
              name: x.name
            }
          }).toArray()
        });
        $linq(this.condTemplate).where(x => x.field_name == 'module').foreach(x => {
          x.value_arr = $linq(moduleCodeData).select(x => {
            return {
              value: x,
              name: x
            }
          }).toArray()
        });
      }
      else {
        condTemplate.push({
          field_name: 'module',
          display_name: 'Area Code',
          field_type: 'string', //int, decimal, boolean
          field_group: 'search',
          operatorx_arr: ['=', '>=', '<='],
          operatorx_default: '=',
          value_arr: null, //empty or null for textbox
          value_default: 0,
          multiple: true, //true,
          multiple_type: 'and',
          func_name: `openAreaCodeModal`,
        });

        condTemplate.push({
          field_name: 'locname',
          display_name: 'Area Name',
          field_type: 'string', //int, decimal, boolean
          field_group: 'search',
          operatorx_arr: ['=', '>=', '<='],
          operatorx_default: '=',
          value_arr: [], //empty or null for textbox
          value_default: 0,
          multiple: true, //true,
          multiple_type: 'and', //and or,
          func_name: 'openAreaNameModal',
        });
      }

      condTemplate.push({
          field_name: 'approve_status',
          display_name: 'Approve Status',
          field_type: 'string', //int, decimal, boolean
          field_group: 'search',
          operatorx_arr: ['='],
          operatorx_default: '=',
          value_arr: null, //empty or null for textbox
          value_default: '0',
          multiple: true, //true,
          multiple_type: 'and',
          func_name: null
        });
        $linq(this.condTemplate).where(x => x.field_name == 'approve_status').foreach(x => {
          x.value_arr = [
              {
                value: 'N',
                name: 'Wait'
              },
              {
                value: 'Y',
                name: 'Approved'
              },
              {
                value: 'C',
                name: 'Rejected'
              }
            ];
        });

      $linq(this.condTemplate).where(x => x.field_name == 'item_type').foreach(x => {
        x.value_arr = $linq(this.serviceCodeData).select(x => {
          return {
            value: x.serv_code,
            name: x.serv_name
          }
        }).toArray()
      });

      $linq(this.condTemplate).where(x => x.field_name == 'connection_type').foreach(x => {
        x.value_arr = $linq(this.connectionCodeData).select(x => {
          return {
            value: x.contact_code,
            name: x.contact_name
          }
        }).toArray()
      });

      $linq(this.condTemplate).where(x => x.field_name == 'req_type').foreach(x => {
        x.value_arr = $linq(this.requestCodeData).select(x => {
          return {
            value: x.req_code,
            name: x.req_des
          }
        }).toArray()
      });

      $linq(this.condTemplate).where(x => x.field_name == 'status').foreach(x => {
        x.value_arr = $linq(this.statusCodeData).select(x => {
          return {
            value: x.id,
            name: x.name
          }
        }).toArray()
      });

      let defaultCond = [
        { field_name: 'job_date_search', operatorx: '>=', value: new Date(new Date().getFullYear(), new Date().getMonth(), 1), not_remove: false },
        { field_name: 'job_date_search', operatorx: '<=', value: new Date(), not_remove: false },
      ];
      
      rpt.setDefaultCond(defaultCond);
  
      //this.initTable()
      rpt.dataUrl = `CSM/Report/v_csm_rpt_002`;
  },
};
</script>
