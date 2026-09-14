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
            raw-name="v_csm_rpt_contract_pmbm"
            :pdfLabel="grid_header">

      <template #extra-cond>
        <div class="row">
          <div class="col-md-2">
            <div class="d-flex margin-t-25">
              <div class="form-check form-switch form-check-custom form-check-solid me-5">
                <input class="form-check-input h-20px w-30px" type="checkbox" true-value="Y" false-value="N" v-model="extraCond.dateas.value" />
                <label class="form-check-label">  As of Date</label>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Year</label>
              <input type="text" class="form-control input-sm text-center" v-model.number="extraCond.year.value" maxlength="4" @input="validateYear" v-bind:disabled="extraCond.dateas.value === 'N'" />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group">
              <label>Period</label>
              <input type="text" class="form-control input-sm text-center" v-model.number="extraCond.period.value" maxlength="2" @input="validatePeriod" min="1" max="12" v-bind:disabled="extraCond.dateas.value === 'N'" />
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
    <vue-project2-list ref="ct_project2" @send-data="ct_projectSelect($event)" :chk_code="chk_code"></vue-project2-list>
    <vue-ar-customer-list ref="customer" @send-data="customerSelect($event)"></vue-ar-customer-list>
    <job-detail ref="jobDetail" @send-data="JobSelect($event)" checkRight="999"></job-detail>
    <vue-project-list ref="projectPredes" @send-data="projectSelectPredes($event)"></vue-project-list>
  </div>
</template>
<script>
  import report from '../../../Center/report-condition.vue'
  import jobDetail from '../../Transaction/v_csm_trn_001_components/document-details/assignment/components_poch/v_jobcode_poch.vue'




  let rpt = {};
  let condTemplate = [];

  condTemplate.push({
    field_name: 'c.refcode',
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
    // field_name: 'a.pre_event2',
    field_name: 'c.pre_event',
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
    field_name: ' c.pre_des',
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
    field_name: 'a.jobcode',
    display_name: 'Job',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'or', //and or,
    func_name: 'openJobModal',
  });

  condTemplate.push({
    field_name: 'a.job_start',
    display_name: 'Job Start',
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
    field_name: 'a.job_end',
    display_name: 'Job End',
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
        extraCond: {
          period: {
            type: 'string',
            value: new Date().getMonth() + 1, // เดือนเริ่มจาก 0
          },
          dateas: {
            type: 'string',
            value: 'N'
          },
          year: {
            type: 'string',
            value: new Date().getFullYear()
          },
       
        },
      }
    },
    components: {
      report,
      jobDetail: jobDetail
    },
    methods: {
      async setRptData(d, cond) {
        let agr = this.$refs.agr;

        // this.display = d.groupedData;

        let detail = d.q || [];
        let grand = d.grand_total

        this.rawData = d.raw_data;
        this.raw_filename = d.raw_filename;

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
        this.$refs.ct_project2.openModal();
      },
      openProjectModal2() {
        this.$refs.project.openModal();
      },
      openAreaCodeModal() {
        this.$refs.area_code.openModal();
      },
      openProjectModalpredes() {
        this.$refs.projectPredes.openModal();
      },
      openJobModal() {
        this.$refs.jobDetail.openModal();
      },
      projectSelect2(e) {

        rpt.setRowData(e.pre_event, e.pre_event)
      },
      ct_projectSelect(e) {

        rpt.setRowData(e.pre_event, e.pre_event)
      },
      projectSelectPredes(e) {
        rpt.setRowData(e.pre_des, e.pre_des)
      },
      openCustomerModal() {
        this.$refs.customer.openModal();
      },
      employeeSelect(e) {
        rpt.setRowData(e.empno, e.empfullname_t)
      },
      projectSelect(e) {
        rpt.setRowData(e.refcode, e.refcode)
      },
      customerSelect(e) {
        rpt.setRowData(e.customer_code, e.customer_name)
      },
      JobSelect(e) {
        rpt.setRowData(e.jobcode, e.jobcode)
      }, 
      clearPreEvent() {
        this.preEvent = ""
      },
      async initTable() {
        let agr = this.$refs.agr;

        let bold_underline = { "font-weight": "bold" };
        let bold_style = (p) => (p?.data?.bold ? bold_underline : {});

        let fields = [
          ["refcode", "Ref. Code", "text", { width: 180, align: "center", cellStyle: bold_style }],
          ["pre_des", "Project Name", "text", { width: 320, align: "left", cellStyle: bold_style }],
          ["pre_thi", "Customer Name", "text", { width: 250, align: "left", cellStyle: bold_style }],
          ["jobname_s", "Job", "text", { width: 150, align: "center", cellStyle: bold_style }],
          ["job_start", "Job Start", "date", { width: 180, align: "center", cellStyle: bold_style }, { useCellRenderer: true }],
          ["job_end", "Job End", "date", { width: 180, align: "center", cellStyle: bold_style }, { useCellRenderer: true }],
          ["period_qty", "Period Total", "text", { width: 150, align: "right", cellStyle: bold_style }, { useCellRenderer: true }],
          ["period_use", "Period Use", "text", { width: 150, align: "right", cellStyle: bold_style }, { useCellRenderer: true }],
          ["period_bal", "Period Balance", "text", { width: 150, align: "right", cellStyle: bold_style }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        this.grid_header = header;
      },
      createPdfData() {
        return this.$refs.agr.createPdfData();
      },
      validateYear() {
        if (isNaN(this.extraCond.year.value)) {
          let now = new Date();
          this.extraCond.year.value = now.getFullYear();
        }
      },
      validatePeriod() {
        let p = parseInt(this.extraCond.period.value);
        if (isNaN(p) || p < 1) p = 1;
        if (p > 12) p = 12;
        this.extraCond.period.value = p;
      },

    },
    mounted() {
      rpt = this.$refs.rpt
        rpt.setTitle('รายงานสัญญาคงเหลือตามระบบงาน')
      rpt.setTemplate(this.condTemplate)

      let defaultCond = [
        { field_name: 'c.refcode', operatorx: '=', value: '', display_value: '' },
      ];
      rpt.setDefaultCond(defaultCond);

      rpt.dataUrl = `CSM/Report/v_csm_rpt_contract_pmbm`;
    }
  }
  export default vue
</script>
