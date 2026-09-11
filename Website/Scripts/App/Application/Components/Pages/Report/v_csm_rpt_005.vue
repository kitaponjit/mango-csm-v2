<template>
  <div>
    <report
      ref="rpt"
      :extra-cond2="extraCond"
      :use-print-template="true"
      :grid-header="grid_header"
      :printPDF="true"
      :raw-data="rawData"
      :raw-file-cache="raw_filename"
      raw-name="v_ts_csm_rpt_005"
    >
      <template #extra-cond> </template>

      <template #display>
        <template v-for="(i, idx) in display0" >
          <div class="row" data-toggle="collapse" :href="`#collapse${idx}`"  @click="toggleCollapse(idx)" style="cursor: pointer;">
            <div class="col-md-12"><h5>
              <i :class="['fas', collapseState[idx] ? 'fa-chevron-up' : 'fa-chevron-down', ]"></i>
              {{xt.isEmpty(i.customer_name) ? 'สำนักงานใหญ่' : i.customer_name}}
            </h5>
            </div>
          </div>
          <div class="row collapse" :id="`collapse${idx}`">
            <div class="col-md-12">
              <ag-table :ref="'agr' + idx" scale="500" :key="'agr' + idx" :footer="false" @ready="initTable(idx)"  @cell-clicked="cellClicked($event)"></ag-table>
            </div>
          </div>
          <hr style="margin-top: 5px;"/>
        </template>
      </template>

      <template #export> </template>
    </report>

    <!-- Modal Custom -->
     <modal ref="approveLoop">
       <template slot="header">
         <h4>ข้อมูลผู้อนุมัติ</h4>
       </template>
       <template slot="body">
        <div class="col-md-12">
          <ag-table ref="agr_detail" :footer="false" @ready="initTableDetail()"></ag-table>
        </div>
       </template>
     </modal>

    <!-- Modal : Center -->
    <vue-project2-list ref="project" @send-data="selectInfoComponent($event, 'project')"></vue-project2-list>
    <vue-ar-customer-list ref="customer" @send-data="selectInfoComponent($event, 'customer')"></vue-ar-customer-list>
  </div>
</template>

<script type="text/javascript">
  import report from '../../center/report-condition.vue'

let rpt = {};

let condTemplate = [];

condTemplate.push({
    field_name: 'pre_event',
    display_name: 'Project',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: 'openProjectModal',
  });

  condTemplate.push({
    field_name: 'job_date',
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

export default {
  data() {
    return {
      auth: window.auth,
      xt: $xt,
      baseUrl,
      condTemplate,
      raw_data: [],
      raw_filename: "",
      rawData: [],
      extraCond: {},
      display0: [],
      grid_header: [],
      collapseState: {},
      approve: [],
      statusCodeData,
    };
  },
  components: {
    report,
  },
  methods: {
    toggleCollapse(idx) {
      this.$set(this.collapseState, idx, !this.collapseState[idx]); // toggle สถานะ
    },
    async setRptData(d, cond) {
      this.$set(this, "display0", d.group);
      let detail = d.group || [];
      this.$set(this, 'rawData', d.raw_data);
      this.$set(this, 'raw_filename', d.raw_filename);
      /* Display : Reformat Header */
      this.$nextTick(() => {
        detail.forEach((_, idx) => {
          this.initTable(idx);
        });
      });
    },
    async setCondForm() {
      let rep = await $xt.getServer(`CSM/Master/QC_ReadList`);
      $linq(this.condTemplate)
        .where((x) => x.field_name == "qaform")
        .foreach((x) => {
          this.$set(x, "value_arr", $linq(rep).select((x) => {
            return {
              value: x.code,
              name: x.description,
            };
          }).toArray());
        });
    },
    openProjectModal() {
      this.$refs.project.openModal();
    },
    openCustomerModal() {
      this.$refs.customer.openModal();
    },
    selectInfoComponent(e, keyword) {
      switch (keyword) {
        case "project":
          rpt.setRowData(e.pre_event, e.pre_event);
          break;
        case "customer":
          rpt.setRowData(e.customer_code, e.customer_name);
          break;
      }
    },
    itemTypeName(code) {
      return ($linq(this.serviceCodeData).where((x) => x.serv_code == code).select((x) => x.serv_name).firstOrDefault() || "");
    },
    statusClass(prefix, status) {
      return status == 'Cancel' ? prefix + 'danger' : ['Complete', 'Send Pretest'].includes(status) ? prefix + 'success' : ['Reject', 'Hold'].includes(status) ? prefix + 'warning' : prefix + 'info';
    },
    approveClass(prefix, status) {
      return status == 'Approved' ? prefix + 'success' : prefix + 'danger';
    },
    renderStatusLabel(status) {
      const labelClass = status === "Approve" ? "label label-success" : status === "Reject"  ? "label label-danger" : status === "Inprogress" ? "label label-primary" : "";
      const labelText = status === "Approve" ? "Approve" : status === "Reject" ? "Reject" : status === "Inprogress" ? "Inprogress" : "";
      return `<label class="${labelClass}" style="font-size:12px">${labelText}</label>`;
    },
    cellClicked(e) {
      let params = e.params;
      let data = params?.data;
      let fields = params?.colDef?.field;
      if (fields === "approve_status") {
        const jobNo = data.job_no;
        const itemNo = data.itemno;
        this.showApproveLoop({ job_no: jobNo, itemno: itemNo });
      }
    },
    async showApproveLoop(i) {
      let act = `CSM/Report/ApproveLoopx?job_no=${i.job_no || ''}&itemno=${i.itemno || ''}`;
      let rsp = await $xt.getServer(act);
      this.approve = rsp;
      let agr = this.$refs.agr_detail;
      this.$set(this, 'approve', this.approve);
      let data = this.approve || [];
      agr.setDisplay(data);
      this.initTableDetail();
      this.$refs.approveLoop.openModal();
    },    
    async initTable(idx) {
      let agr = this.$refs["agr" + idx];
      if (Array.isArray(agr)) {
        agr = agr[0];
      }
      let bold_underline = { "font-weight": "bold" };
      let bold_style = (p) => (p?.data?.bold ? bold_underline : {});
      let p = this.display0[idx];
      let o = 1;
      $linq(p.detail).foreach((x) => {
        x.no = o++;
      });
      let fields = [
        ["no", "No.", "text", { width: 80, align: "center", cellStyle: bold_style }],
        ["job_no", "Document No.", "text", { width: 180, align: "center", cellStyle: bold_style, cellRenderer: (params) => { if (params.value) { return `<a href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${params.value}" style="cursor: pointer; text-decoration: none; color: blue;" target="_blank">${params.value}</a>`; } return ""; }  }],
        ["job_date", "Job Date", "date", { width: 180, align: "center", cellStyle: bold_style }, { useCellRenderer: true }],
        ["due_date", "Due Date", "date", { width: 180, align: "center", cellStyle: bold_style }, { useCellRenderer: true }],
        ["item_type", "Type", "text", { width: 180, align: "center", ellStyle: bold_style }],
        ["subject", "Subject", "text", { width: 180, align: "left", cellStyle: bold_style }],
        ["request_name", "Request by", "text", { width: 250, align: "center", cellStyle: bold_style }],
        ["response_date", "Req. Date", "date", { width: 180, align: "center", cellStyle: bold_style }, { useCellRenderer: true }],
        ["assign_name", "Assign by", "text", { width: 250, align: "left", cellStyle: bold_style }],
        ["send_pretest_dt", "Send QC Date", "date", { width: 150, align: "center", cellStyle: bold_style }, { useCellRenderer: true }],
        ["tester_name", "Tester by", "text", { width: 180, align: "center", cellStyle: bold_style }],
        ["tester_test_dt", "Tester Date", "date", { width: 180, align: "center", cellStyle: bold_style }, { useCellRenderer: true }],
        ["status", "Status", "text", { width: 150, align: "center", cellStyle: bold_style, cellStyle: bold_style, cellRenderer: (param) => { const statusClass = this.statusClass("text-", param.value); return `<span class="${statusClass}">${param.value}</span>`; }}],
        ["approve_status", "Approve", "text", { width: 100, align: "center", cellStyle: bold_style, cellRenderer: (param) => { const approveClass = this.approveClass("text-", param.value); return `<span class="${approveClass}" style="cursor: pointer;">${param.value}</span>`;} }],
      ];
      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);
      this.grid_header = header;
      agr.setDisplay(p.detail);
    },
    async initTableDetail() {
      let agr = this.$refs.agr_detail;

      let bold_underline = { "font-weight": "bold" };
      let bold_style = (p) => (p?.data?.bold ? bold_underline : {});
      
      let fields = [
        ["no_", "No.", "text", { width: 80, align: "center" }],
        ["empno", "Emp No.", "text", { width: 150, align: "center" },],
        ["empname", "Emp Name", "text", { width: 200, align: "left"}],
        ["fr_proj_type", "Position", "text", { width: 100, align: "center" }],
        ["levelapp", "Level App", "text", { width: 200, align: "center" }],
        ["status", " Approve Status", "text", { width: 180, align: "center", cellRenderer: (param) => { return this.renderStatusLabel(param.value) } }],
        ["remark_cancel", "Remark", "text", { width: 180, align: "left" }],
      ];

      let header = agr.createHeaderFromArray(fields)
      agr.setHeader(header)
    },
    async loadCenter() {
      await store.dispatch("findDataType");
    },
  },
  beforeMount() {
    this.loadCenter();
  },
  async mounted() {
    this.setCondForm();
    rpt = this.$refs.rpt;
    rpt.setTitle("รายงานติดตามสถานะงานตามโครงการ");
    rpt.setTemplate(this.condTemplate);
    this.$refs.approveLoop.setSize("modal-lg");
    let defaultCond = [
      { field_name: 'pre_event', operatorx: '=', value: '', display_value: '' },
    ];
    rpt.setDefaultCond(defaultCond);
    rpt.dataUrl = `CSM/Report/v_csm_rpt_005`;
  },
};
</script>