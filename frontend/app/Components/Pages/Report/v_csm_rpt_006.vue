<template>
  <div>
    <report ref="rpt" :extra-cond2="extraCond" :use-print-template="true" :grid-header="grid_header" :printPDF="true"
      :raw-data="rawData" :raw-file-cache="raw_filename" raw-name="v_csm_rpt_006">
      <template #extra-cond>
      </template>

      <template #display>
        <div class="row">
          <div class="col-md-12">
            <ag-table ref="agr":footer="false" @ready="initTable()"></ag-table>
          </div>
        </div>
      </template>

      <template #export>
      </template>
    </report>

    <!-- Modal : Center -->
    <vue-project-list ref="project" @send-data="selectInfoComponent($event, 'project')"></vue-project-list>
    <vue-employee-list ref="employee" @send-data="selectInfoComponent($event, 'employee')"></vue-employee-list>
    <vue-ar-customer-list ref="customer" @send-data="selectInfoComponent($event, 'customer')"></vue-ar-customer-list>
  </div>
</template>

<script type="text/javascript">
import report from "../../Center/report-condition.vue";

let rpt = {};

let condTemplate = [];
let item_type = [];

condTemplate.push({
  field_name: "module",
  display_name: "Module",
  field_type: "string", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: module, //empty or null for textbox
  value_default: "",
  multiple: true, //true,
  multiple_type: "and",
  func_name: null,
});

condTemplate.push({
  field_name: "req_type",
  display_name: "Req. Type",
  field_type: "string", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: null, //empty or null for textbox
  value_default: "",
  multiple: false, //true,
  multiple_type: "and",
  func_name: null,
});

condTemplate.push({
  field_name: "status",
  display_name: "Job Status",
  field_type: "string", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: null, //empty or null for textbox
  value_default: "",
  multiple: true, //true,
  multiple_type: "or",
  func_name: null,
});

condTemplate.push({
  field_name: "platform",
  display_name: "Platform",
  field_type: "string", //int, decimal, booleano
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: [], //empty or null for textbox
  value_default: "WIN",
  multiple: true, //true,
  multiple_type: "and", //and or,
  func_name: "",
});

condTemplate.push({
  field_name: "revision_",
  display_name: "เลขที่ Revision",
  field_type: "string", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["=", ">=", "<="],
  operatorx_default: ">=",
  value_arr: null, //empty or null for textbox
  value_default: "0",
  multiple: true, //true,
  multiple_type: "and",
  func_name: null,
});

condTemplate.push({
  field_name: "revision_bug_",
  display_name: "Revision ที่พบปัญหา",
  field_type: "string", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["=", ">=", "<="],
  operatorx_default: ">=",
  value_arr: null, //empty or null for textbox
  value_default: "0",
  multiple: true, //true,
  multiple_type: "and",
  func_name: null,
});

condTemplate.push({
  field_name: "pre_event",
  display_name: "Project",
  field_type: "string", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: [], //empty or null for textbox
  value_default: "",
  multiple: true, //true,
  multiple_type: "and", //and or,
  func_name: "openProjectModal",
});

condTemplate.push({
  field_name: "customer_code",
  display_name: "Customer",
  field_type: "string", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: [], //empty or null for textbox
  value_default: "",
  multiple: true, //true,
  multiple_type: "or", //and or,
  func_name: "openCustomerModal",
});

condTemplate.push({
  field_name: "job_date_search",
  display_name: "Req. Date",
  field_type: "date", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["=", ">=", "<="],
  operatorx_default: ">=",
  value_arr: null, //empty or null for textbox
  value_default: moment().format("DD/MM/YYYY"),
  multiple: true, //true,
  multiple_type: "and", //and or,
  func_name: "",
});

condTemplate.push({
  field_name: "due_date",
  display_name: "Due Date",
  field_type: "date", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["=", ">=", "<="],
  operatorx_default: ">=",
  value_arr: null, //empty or null for textbox
  value_default: moment().format("DD/MM/YYYY"),
  multiple: true, //true,
  multiple_type: "and", //and or,
  func_name: "",
});

condTemplate.push({
  field_name: "item_type",
  display_name: "Service Type",
  field_type: "string", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["=", "!="],
  operatorx_default: "=",
  value_arr: item_type, //empty or null for textbox
  value_default: "",
  multiple: true, //true,
  multiple_type: "and",
  func_name: null,
});

condTemplate.push({
  field_name: "subject",
  display_name: "Subject",
  field_type: "string", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["=", "Like"],
  operatorx_default: "=",
  value_arr: null, //empty or null for textbox
  value_default: "",
  multiple: true, //true,
  multiple_type: "and",
  func_name: null,
});

condTemplate.push({
  field_name: "request_empno",
  display_name: "Req.By",
  field_type: "int", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: [], //empty or null for textbox
  value_default: "",
  multiple: true, //true,
  multiple_type: "or", //and or,
  func_name: "openEmployeeModal",
});

condTemplate.push({
  field_name: "assign_empno",
  display_name: "Assignment",
  field_type: "int", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: [], //empty or null for textbox
  value_default: "",
  multiple: true, //true,
  multiple_type: "or", //and or,
  func_name: "openEmployeeModal",
});

condTemplate.push({
  field_name: "contract_user",
  display_name: "Contact User",
  field_type: "string", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: null, //empty or null for textbox
  value_default: "",
  multiple: false, //true,
  multiple_type: "and",
  func_name: null,
});

condTemplate.push({
  field_name: "connection_type",
  display_name: "Connection",
  field_type: "string", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: null, //empty or null for textbox
  value_default: "",
  multiple: false, //true,
  multiple_type: "and",
  func_name: null,
});

condTemplate.push({
  field_name: "send_pretest_dt",
  display_name: "Send Pretest Date",
  field_type: "date", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["=", ">=", "<="],
  operatorx_default: ">=",
  value_arr: null, //empty or null for textbox
  value_default: moment().format("DD/MM/YYYY"),
  multiple: true, //true,
  multiple_type: "and", //and or,
  func_name: "",
});

condTemplate.push({
  field_name: "send_pretest_to_tester_dt",
  display_name: "Send To QC Date",
  field_type: "date", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["=", ">=", "<="],
  operatorx_default: ">=",
  value_arr: null, //empty or null for textbox
  value_default: moment().format("DD/MM/YYYY"),
  multiple: true, //true,
  multiple_type: "and", //and or,
  func_name: "",
});

condTemplate.push({
  field_name: "object_type",
  display_name: "Job Type",
  field_type: "string", //int, decimal, boolean
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: [], //empty or null for textbox
  value_default: "",
  multiple: true, //true,
  multiple_type: "and", //and or,
  func_name: "",
});

export default {
  data() {
    return {
      xt: $xt,
      baseUrl,
      condTemplate,
      raw_filename: "",
      rawData: [],
      grid_header: [],
      display: [],
      extraCond: {
        ts_start: {
          type: "date",
          value: new Date(),
          format: "YYYY-MM-DD",
        },
        ts_end: {
          type: "date",
          value: new Date(),
          format: "YYYY-MM-DD",
        },
        skip: {
          type: "int",
          value: 0,
          useDefault: true,
          default: 0,
        },
        take: {
          type: "int",
          value: 250,
          useDefault: true,
          default: 250,
        },
      },
      job_type: [
        { id: "T", name: "Transaction" },
        { id: "M", name: "Master" },
        { id: "R", name: "Report" },
        { id: "F", name: "Form" },
        { id: "O", name: "Other" },
      ],
      moduleCodeData: "",
      moduleForMango: moduleCodeData,
      platformCodeData,
      statusCodeData,
      sort_date: false,
    };
  },
  components: {
    report,
  },
  methods: {
    async setRptData(d, cond) {
      let agr = this.$refs.agr;

      this.display = d.result;

      let detail = d.result || [];

      let o = 1;
      $linq(detail).foreach((x) => {
        let overdue = this.diffDaysHours(
          moment(x.complete_date, "Y/M/D hh:mm:ss"),
          moment(x.job_date, "Y/M/D hh:mm:ss"), 
          ["months", "days", "hours"]
        );

        x.no = o++;
        x.due_date = this.$date(x.due_date, "DD/MM/YYYY HH:mm");
        x.complete_date = this.$date(x.complete_date, "DD/MM/YYYY HH:mm");
        x.send_pretest_dt = this.$date(x.send_pretest_dt, "DD/MM/YYYY HH:mm");
        x.send_pretest_to_tester_dt = this.$date(x.send_pretest_to_tester_dt, "DD/MM/YYYY HH:mm");
        
        x.overdueM = overdue.months <= 0 || $xt.isEmpty(overdue.months) || isNaN(overdue.months) ? "" : overdue.months + " เดือน ";
        x.overdueD = overdue.days <= 0 || $xt.isEmpty(overdue.days) || isNaN(overdue.days) ? "" : overdue.days + " วัน ";
        x.overdueH = overdue.hours <= 0 || $xt.isEmpty(overdue.hours) || isNaN(overdue.hours) ? "" : overdue.hours + " ชั่วโมง ";

        x.overdue = x.overdueM + x.overdueD + x.overdueH;
        x.module = this.isMango() ? x.module : this.areaName(x.module);
        x.status = this.statusName(x.status);
        x.item_type = this.itemTypeName(x.item_type);
        x.job_priority = this.jobName(x.job_priority);
        x.req_type = this.reqTypeName(x.req_type);
        x.object_type = this.JobTypeName(x.object_type);
        x.reject_remark = this.is_reject() ? "" : x.reject_remark;
        x.revision_bug = this.is_revision_bug() ? "" : x.revision_bug;
      });

      this.rawData = d.raw_data;
      this.raw_filename = d.raw_filename;

      /* Display : Reformat Header */
      this.initTable();

      /* Display : Header */
      agr.setDisplay(detail);
    },
    openProjectModal() {
      this.$refs.project.openModal();
    },
    openEmployeeModal() {
      this.$refs.employee.openModal();
    },
    openCustomerModal() {
      this.$refs.customer.openModal();
    },
    itemTypeName(code) {
      return ($linq(this.serviceCodeData).where((x) => x.serv_code == code).select((x) => x.serv_name).firstOrDefault() || "");
    },
    jobName(code) {
      return ($linq(this.priorityCodeData).where((x) => x.prioity_code == code).select((x) => x.prioity_des).firstOrDefault() || "");
    },
    reqTypeName(code) {
      return ($linq(this.requestCodeData).where((x) => x.req_code == code).select((x) => x.req_des).firstOrDefault() || "");
    },
    JobTypeName(code) {
      return ($linq(this.job_type).where((x) => x.id == code).select((x) => x.name).firstOrDefault() || "");
    },
    statusName(code) {
      return ($linq(this.statusCodeData).where((x) => x.id == code).select((x) => x.name).firstOrDefault() || "");
    },
    areaName(code) {
      return ($linq(this.moduleCodeData).where((x) => x.loccode == code).select((x) => x.locname).firstOrDefault() || "");
    },
    statusClass(prefix, status) {
      return status == "Y" ? prefix + "success" : status == "I" ? prefix + "info" : status == "N" ? prefix + "danger" : status == "H" ? prefix + "warning" : "";
    },
    isMango() {
      let isMango = $linq(this.configData).where((x) => x.config_id == "TRN0001").select((x) => x.config_value).firstOrDefault();
      return isMango == "Y" ? true : false;
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
          rpt.setRowData(e.pre_event, e.pre_des);
          break;
        case "employee":
          rpt.setRowData(e.empno, e.empfullname_t);
          break;
        case "customer":
          rpt.setRowData(e.customer_code, e.customer_name);
          break;
      }
    },
    async initTable() {
      let agr = this.$refs.agr;

      let bold_underline = { "font-weight": "bold" };
      let bold_style = (p) => (p?.data?.bold ? bold_underline : {});
      let textmodule = this.isMango() ? "Module" : "Area";
      
      let fields = [
        ["no", "No.", "text", { width: 80, align: "center" }],
        ["job_no", "CSM No.", "text", { width: 150, align: "left", cellRenderer: (params) => { if (params.value) { return `<a href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${params.value}" style="cursor: pointer; text-decoration: none; color: blue;" target="_blank">${params.value}</a>`; } return ""; }, },],
        ["revision_", "Revision", "text", { width: 150, align: "left", cellStyle: bold_style }],
        ["revision_bug", "Revision Bug No.", "text", { width: 150, align: "left", cellStyle: bold_style, hide: this.is_revision_bug() }],
        ["itemno", "Item No.", "text", { width: 100, align: "center", cellStyle: bold_style }],
        ["job_date", " Req. Date", "datetime", { width: 180, align: "center", sortable: true}, { useCellRenderer: true }],
        ["due_date", "Due Date", "text", { width: 180, align: "center" }],
        ["customer_name", "Company", "text", { width: 220, align: "left" }],
        ["module", textmodule, "text", { width: 180, align: "center" }],
        ["subject", "Subject", "text", { width: 500, align: "left" }],
        ["item_type", "Type", "text", { width: 150, align: "left" }],
        ["job_priority", "Priority", "text", { width: 150, align: "left" }],
        ["req_type", "Req. Type", "text", { width: 150, align: "left" }],
        ["object_type", "Job Type", "text", { width: 150, align: "left" }],
        ["tester_name", "Tester", "text", { width: 200, align: "left" }],
        ["assign_name", "Assign. By", "text", { width: 200, align: "center", cellStyle: bold_style },],
        ["request_name", "Req. By", "text", { width: 200, align: "center" }],
        ["status", "Status", "text", { width: 200, align: "center" }],
        ["reject_remark", "Reject Remark", "text", { width: 200, align: "center", hide: this.is_reject() }],
        ["send_pretest_dt", "Send Pretest Date", 'text', { width: 200, align: "center" },],
        ["send_pretest_to_tester_dt", "Send To QC Date", 'text', { width: 200, align: "center" }],
        ["complete_date", "Complete Date", "text", { width: 200, align: "center" }],
        ["overdue", "Work Duration", "text", { width: 280, align: "left" }],
        ["contract_user", "Contact User", "text", { width: 280, align: "left" }],
      ];

      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);

      this.grid_header = header;
    },
    is_reject() {
      return $linq(this.display).any((x) => $xt.isEmpty(x.reject_remark));
    },
    is_revision_bug() {
      return $linq(this.display).any((x) => $xt.isEmpty(x.revision_bug));
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
    rpt = this.$refs.rpt;
    rpt.setTitle("รายงานการติดตามสถานะงาน");
    rpt.setTemplate(this.condTemplate);

    await $xt.sleep(500);
    $linq(this.condTemplate).where((x) => x.field_name == "module").foreach((x) => {x.value_arr = $linq(this.moduleForMango).select((x) => { return { value: x, name: x, }; }).toArray();});

    $linq(this.condTemplate).where((x) => x.field_name == "req_type").foreach((x) => {x.value_arr = $linq(this.requestCodeData).select((x) => { return { value: x.req_code, name: x.req_des } }).toArray()});

    $linq(this.condTemplate).where((x) => x.field_name == "item_type").foreach((x) => {x.value_arr = $linq(this.serviceCodeData).select((x) => { return { value: x.serv_code, name: x.serv_name } }).toArray()});

    $linq(this.condTemplate).where((x) => x.field_name == "connection_type").foreach((x) => {x.value_arr = $linq(this.connectionCodeData).select((x) => { return { value: x.contact_code, name: x.contact_name,}}).toArray()});

    $linq(this.condTemplate).where((x) => x.field_name == "status").foreach((x) => {x.value_arr = $linq(this.statusCodeData).select((x) => {return { value: x.id, name: x.name}}).toArray()});

    $linq(this.condTemplate).where((x) => x.field_name == "platform").foreach((x) => {x.value_arr = $linq(this.platformCodeData).where((x) => x.id != "111").select((x) => {return {value: x.id, name: x.name}}).toArray()});

    $linq(this.condTemplate).where((x) => x.field_name == "object_type").foreach((x) => {x.value_arr = $linq(this.job_type).select((x) => {return {value: x.id,name: x.name}}).toArray()});

    let defaultCond = [
      { field_name: "item_type", operatorx: "=", value: "", not_remove: false },
      { field_name: "revision_bug_", operatorx: "=", value: "", not_remove: false },
    ];
    rpt.setDefaultCond(defaultCond);

    //this.initTable()
    rpt.dataUrl = `CSM/Report/v_csm_rpt_006`;
  },
};
</script>
