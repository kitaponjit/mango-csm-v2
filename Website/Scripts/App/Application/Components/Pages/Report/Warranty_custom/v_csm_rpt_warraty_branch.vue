<template>
  <div>
    <report ref="rpt"
            @clearPreEvent="clearPreEvent"
            :grid-header="grid_header"
            :use-print-template="true"
            :printPDF="true"
            :raw-data="rawData"
            :raw-file-cache="raw_filename"
            raw-name="v_csm_rpt_warraty_branch"
            :pdfLabel="grid_header">

      <template #extra-cond>
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

  </div>
</template>
<script>
  import report from '../../../center/report-condition.vue'

  let rpt = {};
  let condTemplate = [];

  condTemplate.push({
    field_name: 'b.refcode',
    display_name: 'Ref. Code',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'or', //and or,
    func_name: 'openProjectModal2',
  });

  condTemplate.push({
    field_name: 'a.pre_event2',
    display_name: 'Project Contract No.',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: 0,
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: 'openProjectModalP',
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
    field_name: ' b.pre_des',
    display_name: 'Project Name',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<=', 'like'],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: 0,
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: 'openProjectModalpredes',
  });

  condTemplate.push({
    field_name: 'b.j_start',
    display_name: 'Open Date',
    field_type: 'date', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: moment().format('DD/MM/YYYY'),
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: '',
  });

  condTemplate.push({
    field_name: 'a.war_code',
    display_name: 'Warranty Code',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<=','like'],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: '',
  });

  condTemplate.push({
    field_name: 'a.startdate',
    display_name: 'Start Date',
    field_type: 'date', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: null, //empty or null for textbox
    value_default: moment().format('DD/MM/YYYY'),
    multiple: true, //true,
    multiple_type: 'and',
    func_name: ''
  });

  condTemplate.push({
    field_name: 'a.enddate',
    display_name: 'End Date',
    field_type: 'date', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: null, //empty or null for textbox
    value_default: moment().format('DD/MM/YYYY'),
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: '',
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
      }
    },
    components: {
      report
    },
    methods: {
      async setRptData(d, cond) {
        let agr = this.$refs.agr;

        // this.$set(this, "display", d.groupedData);

        let detail = d.q || [];
        let grand = d.grand_total

        this.$set(this, "rawData", d.raw_data);
        this.$set(this, "raw_filename", d.raw_filename);

        // this.$refs.rpt.condText = d?.extra_cond

        /* Display : Reformat Header */
        this.initTable();

        /* Display : Header */
        agr.setDisplay(detail);
      },
      action1() {
        rpt.setRowData(value, displayValue)
      },
      openProjectModal() {
        this.$set(this,"chk_code", "N");
        this.$refs.ct_project2.openModal();
      },
      openProjectModalpredes() {
        this.$refs.projectPredes.openModal();
      },
      openProjectModal2() {
        this.$refs.project2.openModal();
      },
      openProjectModalP() {
        this.$refs.project.openModal();
      },
      openCustomerModal() {
        this.$refs.customer.openModal();
      },
      employeeSelect(e) {
        rpt.setRowData(e.empno, e.empfullname_t)
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
          ["cc_no", "No.", "text", { width: 100, align: "center", cellStyle: bold_style }],
          ["refcode", "Ref. Code", "text", { width: 180, align: "left", cellStyle: bold_style }],
          ["pre_des", "Project Name", "text", { width: 250, cellStyle: bold_style }],
          ["customer_name", "Customer Name", "text", { width: 250, align: "left", cellStyle: bold_style }],
          ["j_start", "Open Date", "date", { width: 180, align: "center", cellStyle: bold_style }, { useCellRenderer: true }],
          ["war_code", "Warranty Code", "text", { width: 180,cellStyle: bold_style }],
          ["remark", "Remark", "text", { width: 250,  cellStyle: bold_style }],
          ["startdate", "Start Date", "date", { width: 180, align: "center", cellStyle: bold_style }, { useCellRenderer: true }],
          ["enddate", "End Date", "date", { width: 180, align: "center", cellStyle: bold_style }, { useCellRenderer: true }],
          ["warranty_text", "Warranty Balance(Days)", "text", { width: 250, cellStyle: bold_style }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        this.grid_header = header;
      },
      createPdfData() {
        return this.$refs.agr.createPdfData();
      },
    },
    mounted() {
      rpt = this.$refs.rpt
      rpt.setTitle('รายงานรายการประกันแต่ละสาขา')
      rpt.setTemplate(this.condTemplate)

      let defaultCond = [
        { field_name: 'b.refcode', operatorx: '=', value: '', display_value: '' },
      ];
      rpt.setDefaultCond(defaultCond);

      rpt.dataUrl = `CSM/Report/v_csm_rpt_warraty_branch`;
    }
  }
  export default vue
</script>
