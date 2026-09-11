<template>
  <div>
    <report ref="rpt" @clearPreEvent="clearPreEvent" :grid-header="grid_header" :use-print-template="true" :printPDF="true"
    :raw-data="rawData" :raw-file-cache="raw_filename" raw-name="v_csm_war_rpt01" :pdfLabel="grid_header">
      
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
    <vue-project2-list ref="ct_project2" @send-data="projectSelect($event)" :chk_code="chk_code"></vue-project2-list>
    <vue-ar-customer-list ref="customer" @send-data="customerSelect($event)"></vue-ar-customer-list>
    <vue-area-list ref="area_code" @send-data="areaCodeSelect($event)" :preEvent="preEvent" :isMango="false"></vue-area-list>
    <vue-area-list ref="area_name" @send-data="areaNameSelect($event)" :preEvent="preEvent" :isMango="false"></vue-area-list>
  </div>
</template>
<script>
  import report from '../../center/report-condition.vue'

  let rpt = {};
  let condTemplate = [];

  condTemplate.push({
    field_name: 'e.customer_code',
    display_name: 'Customer',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: 'openCustomerModal',
  });

  condTemplate.push({
    // field_name: 'a.pre_event2',
    field_name: 'a.pre_event',
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
    field_name: 'c.war_des',
    display_name: 'รายการประกัน',
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

  condTemplate.push({
    field_name: 'a.serial_number',
    display_name: 'Serial No.',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '>=',
    value_arr: null, //empty or null for textbox
    value_default: 0,
    multiple: true, //true,
    multiple_type: 'and',
    func_name: ''
  });

  condTemplate.push({
    field_name: 'a.startdate',
    display_name: 'Start Date',
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
    field_name: 'a.enddate',
    display_name: 'End Date',
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
    field_name: 'b.loccode',
    display_name: 'Area Code',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: null, //empty or null for textbox
    value_default: 0,
    multiple: true, //true,
    multiple_type: 'and',
    func_name: 'openAreaCodeModal'
  });
  condTemplate.push({
    field_name: 'b.locname',
    display_name: 'Area Name',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: 0,
    multiple: true, //true,
    multiple_type: 'and',
    func_name: 'openAreaNameModal'
  });

  let vue = {
    data() {
      return {
        baseUrl,
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

        let detail = d.data || [];
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
      openAreaCodeModal() {
        this.$refs.area_code.openModal();
      },      
      openAreaNameModal() {
        this.$refs.area_name.openModal();
      },
      openCustomerModal() {
        this.$refs.customer.openModal();
      },
      employeeSelect(e) {
        rpt.setRowData(e.empno, e.empfullname_t)
      },
      projectSelect(e) {
        rpt.setRowData(e.pre_event, e.pre_event)
        this.preEvent = e.pre_event
        
      },
      customerSelect(e) {
        rpt.setRowData(e.customer_code, e.customer_name)
      },
      areaCodeSelect(e) {
        rpt.setRowData(e.loccode, e.loccode)
      },
      areaNameSelect(e) {
        rpt.setRowData(e.locname, e.locname)
      },
      clearPreEvent() {
        this.preEvent = ""
      },
      async initTable() {
        let agr = this.$refs.agr;

        let bold_underline = { "font-weight": "bold" };
        let bold_style = (p) => (p?.data?.bold ? bold_underline : {});

        let fields = [
          ['pre_des', '', 'text', { rowGroup: true }],
          ["cust_item", "Item No.", "text", { width: 100, align: "left", cellStyle: bold_style }],
          ["cos_name", "Customer", "text", { width: 180, align: "left", cellStyle: bold_style }],
          // ["pre_des", "Project", "text", { width: 180, align: "left", cellStyle: bold_style, hide: true }], 
          ["loccode", "Area Code", "text", { width: 180, align: "left", cellStyle: bold_style }],
          ["locname", "Area Name", "text", { width: 180, align: "left", cellStyle: bold_style }],
          ["war_des", "รายการประกัน", "text", { width: 500, align: "left", cellStyle: bold_style }],
          ["serial_number", "Serial No.", "text", { width: 200, align: "left", cellStyle: bold_style }],
          ["remark", "Remark", "text", { width: 200, align: "left", cellStyle: bold_style }],
          ["startdate", "Start Date", "date", { width: 180, align: "left", cellStyle: bold_style }, { useCellRenderer: true }],
          ["enddate", "End Date", "date", { width: 180, align: "left", cellStyle: bold_style }, { useCellRenderer: true }],
          ["balday_war", "Warranty Balance", "text", { width: 200, align: "rigth", cellStyle: bold_style }],
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
      rpt.setTitle('Warranty')
      rpt.setTemplate(this.condTemplate)

      let defaultCond = [
        { field_name: 'e.customer_code', operatorx: '=', value: '', display_value: '' },
      ];
      rpt.setDefaultCond(defaultCond);

      rpt.dataUrl = `CSM/Report/v_csm_war_rpt01`;
    }
  }
  export default vue
</script>
