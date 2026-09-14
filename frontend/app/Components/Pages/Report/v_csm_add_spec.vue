<template>
  <div>
    <report ref="rpt"
            :extra-cond2="extraCond"
            @clearPreEvent="clearPreEvent"
            :grid-header="grid_header"
            :use-print-template="true"
            :printPDF="true"
            :raw-data="rawData"
            :raw-file-cache="raw_filename"
            raw-name="v_csm_add_spec"
            :pdfLabel="grid_header">

      <template #extra-cond>
        <div class="row">
          <div class="col-md-2 col-sm-4 col-xs-6">
            <div class="form-group">
              <label class="text-danger">Module</label>
              <select class="form-control input-sm" v-model="extraCond.module_.value">
                <option v-for="x in m_" :value="x.module_c" v-text="x.module_c"></option>
              </select>
            </div>
          </div>
          <div class="col-md-2 col-sm-4 col-xs-6">
            <div class="form-group">
              <label class="text-danger">View Type</label>
              <select class="form-control input-sm"
                      v-model="extraCond.Type.value"
                      @change="onTypeChange">
                <option value="A">ALL</option>
                <option value="T">Transaction</option>
                <option value="R">Report</option>
                <option value="F">Form</option>
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
    <vue-project-list ref="project" @send-data="projectSelect($event)"></vue-project-list>
    <vue-project-list ref="project2" @send-data="projectSelect2($event)"></vue-project-list>
    <vue-project-list ref="projectPredes" @send-data="projectSelectPredes($event)"></vue-project-list>
    <vue-project2-list ref="ct_project2" @send-data="ct_projectSelect($event)" :chk_code="chk_code"></vue-project2-list>
    <vue-employee-list ref="ct_emp" @send-data="employeeSelect($event)"></vue-employee-list>
    <vue-cm-customer-list ref="ct_cm_customer" @send-data="CustSelect($event)"></vue-cm-customer-list>
    <vue-department-list ref="ct_department" @send-data="DPTSelect($event)"></vue-department-list>
    <vue-addspec-rpt ref="ct_addspec" @send-data="addSelect($event)"></vue-addspec-rpt>

  </div>
</template>
<script>
  import report from '../../Center/report-condition.vue'

  let rpt = {};
  let condTemplate = [];

  condTemplate.push({
    field_name: 'b.description',
    display_name: 'View Code',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'or', //and or,
    func_name: 'openViewModal',
  });

  condTemplate.push({
    field_name: 'a.customer_code',
    display_name: 'Customer Code',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: 0,
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: 'openCustomerModal',
  });
  condTemplate.push({
    field_name: 'a.request_empno',
    display_name: 'Employee No.',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: 0,
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: 'openEmpModal',
  });

  condTemplate.push({
    field_name: 'a.pre_event',
    display_name: 'Project No.',
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
    field_name: 'a.dpt_no',
    display_name: 'Department Code',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: 0,
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: 'openDPTModal',
  });

  let vue = {
    data() {
      return {
        baseUrl,
        xt: $xt,
        condTemplate,
        display: [],
        height: 0,
        chk_code: "N",
        preEvent: "",
        rawData: [],
        raw_filename: '',
        grid_header: [],
        m_: [],
        extraCond: {
          module_: {
            type: 'string',
            value: 'ALL'
          },
          Type: {
            type: 'string',
            value: 'A',
            name:''
          },
        }
      }
    },
    components: {
      report
    },
    methods: {
      async setRptData(d, cond) {
        let agr = this.$refs.agr;

        // this.display = d.groupedData;

        let detail = d.result || [];
     //   let grand = d.grand_total

        this.rawData = d.raw_data;
        this.raw_filename = d.raw_filename;

        // this.$refs.rpt.condText = d?.extra_cond

        /* Display : Reformat Header */
        this.initTable();

        /* Display : Header */
        agr.setDisplay(detail);
        let text = `Module : ${this.extraCond.module_.value} , View Type : ${this.extraCond.Type.name}`
        this.$refs.rpt.extraCondText = text;
      },
      action1() {
        rpt.setRowData(value, displayValue)
      },
      openProjectModal() {
        this.chk_code = "N";
        this.$refs.ct_project2.openModal();
      },
      openCustomerModal() {
        this.$refs.ct_cm_customer.openModal();
      },
      openEmpModal() {
        this.$refs.ct_emp.openModal();
      },
      openDPTModal() {
        this.$refs.ct_department.openModal();
      },
      openViewModal() {
        this.$refs.ct_addspec.openModal();
      },
      employeeSelect(e) {
        rpt.setRowData(e.empno, e.empfullname_t)
      },
      DPTSelect(e) {
        rpt.setRowData(e.dpt_code, e.dpt_name)
      },
      CustSelect(e) {
        rpt.setRowData(e.customer_code, e.name_th)
      },
      addSelect(e) {
        rpt.setRowData(e.object_name, e.object_name)
      },
      projectSelect(e) {
        rpt.setRowData(e.pre_event2, e.pre_event2)
      },
      ct_projectSelect(e) {
        rpt.setRowData(e.pre_event, e.pre_event)
      },
      projectSelect2(e) {
        rpt.setRowData(e.refcode, e.refcode)
      },
      projectSelectPredes(e) {
        rpt.setRowData(e.pre_des, e.pre_des)
      },
      clearPreEvent() {
        this.preEvent = ""
      },
      async initTable() {
        let agr = this.$refs.agr;

        let bold_underline = { "font-weight": "bold" };
        let bold_style = (p) => (p?.data?.bold ? bold_underline : {});

        let fields = [
          ["no_", "No.", "text", { width: 100, align: "center", cellStyle: bold_style }],
          ["job_no", "CSM No.", "text", {
            width: 150,
            align: "left",
            sortable: true,
            cellRenderer: (params) => {
              if (params.value) {
                const jobNo = params.value;
                const isWaiting = params.data.job_code === 'W';
                const displayValue = isWaiting ? `<b>${jobNo}</b>` : jobNo;
                return `<a href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${jobNo}"
                style="cursor: pointer; text-decoration: none; color: #3c8dbc;"
                target="_blank">${displayValue}</a>`;
              }
              return "";
            },
          }],
          ["job_date", "CSM Date", "datetime", { width: 250, cellStyle: bold_style }, { useCellRenderer: true }],

          ["subject", "Subject", "text", { width: 400, cellStyle: bold_style }],
          ["customer_name", "Customer Name", "text", { width: 280, align: "left", cellStyle: bold_style }],

          ["projdptname", "Project/Department", "text", { width: 280, cellStyle: bold_style }],
          ["request_name", "Request Name", "text", { width: 250, cellStyle: bold_style }],

          ["module", "Module", "text", { width: 120, cellStyle: bold_style, align: "center" }],
          ["object_code", "View Code", "text", { width: 180, cellStyle: bold_style }],
          ["object_name", "View Name", "text", { width: 250, cellStyle: bold_style }],
        ];


        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        this.grid_header = header;
      },
      createPdfData() {
        return this.$refs.agr.createPdfData();
      },
      async Moduke_center() {
        let act = `CSM/Center/Moduke_center`
        let resp = await $xt.getServer(act)
        this.m_ = resp.data

      },
      onTypeChange(e) {
        this.extraCond.Type.name =
          e.target.options[e.target.selectedIndex].text
      }
    },
    mounted() {
      rpt = this.$refs.rpt
      rpt.setTitle('รายงาน Add Spec')
      rpt.setTemplate(this.condTemplate)
      this.Moduke_center();

      let defaultCond = [
        { field_name: 'a.pre_event', operatorx: '=', value: '', display_value: '' },
      ];
      rpt.setDefaultCond(defaultCond);

      rpt.dataUrl = `CSM/Report/v_csm_add_spec`;
    }
  }
  export default vue
</script>
