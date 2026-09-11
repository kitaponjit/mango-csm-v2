<template>
  <div>
    <report ref="rpt" :extra-cond2="extraCond" :use-print-template="true" :grid-header="grid_header" :printPDF="true"
     :raw-file-cache="raw_filename" :raw-data="rawData" raw-name="v_csm_rpt_003">
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

    <!-- Modal : Center -->
    <vue-project-list ref="project" @send-data="projectSelect($event)"></vue-project-list>
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
    func_name: null
  });

export default {
  data() {
    return {
      xt: $xt,
      baseUrl,
      condTemplate,
      extraCond: {},
      display: [],
      rawData: [],
      grid_header: [],
      raw_filename: "",
      moduleCodeData: "",
      moduleForMango: moduleCodeData,
    };
  },
  components: {
    report,
  },
  methods: {
    async setRptData(d, cond) {
      let agr = this.$refs.agr;

      this.$set(this, "display", d.d_list	|| []);

      let detail = d.d_list || [];

      this.$set(this, "rawData", d.raw_data);
      this.$set(this, "raw_filename", d.raw_filename);

      /* Display : Reformat Header */
      this.initTable();

      /* Display : Header */
      agr.setDisplay(detail);
    },
    openProjectModal() {
      this.$refs.project.openModal();
    },
    projectSelect(e) {
      rpt.setRowData(e.pre_event, e.pre_des)
    },
    async initTable() {
      let agr = this.$refs.agr;

      let bold_underline = { "font-weight": "bold" };
      let bold_style = (p) => (p?.data?.bold ? bold_underline : {});
      
      let fields = [
        ["job_no", "เลขที่เอกสาร", "text", { width: 150, align: "center" }],
        ["itemno", "ลำดับ", "text", { width: 80, align: "center", cellStyle: bold_style }],
        ["job_date", "วันที่", "date", { width: 180, align: "center" }, { useCellRenderer: true }],
        ["job_date", "เวลา (น.)", "time", { width: 180, align: "center"}, { useCellRenderer: true }],
        ["contract_user", "ชื่อผู้ติดต่อ", "text", { width: 180, align: "center" }, { useCellRenderer: true }],
        ["module", "โมดูล", "text", { width: 180, align: "center" }, { useCellRenderer: true }],
        ["detail", "หัวข้อ", "text", { width: 180, align: "center" }],
        ["subject", "รายละเอียด", "text", { width: 300, align: "left" }],
        ["description", "ผลลัพธ์ที่ต้องการ", "text", { width: 300, align: "left" }],
      ];

      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);

      this.grid_header = header;
    },
  },
  async mounted() {
      rpt = this.$refs.rpt;
      rpt.setTitle('Requirement Check List');
      rpt.setTemplate(this.condTemplate);

      let defaultCond = [
        { field_name: 'job_date', operatorx: '>=', value: new Date(new Date().getFullYear(), new Date().getMonth(), 1), not_remove: false },
        { field_name: 'job_date', operatorx: '<=', value: new Date(), not_remove: false },
      ];
      rpt.setDefaultCond(defaultCond);

      $linq(this.condTemplate).where(x => x.field_name == 'module').foreach(x => {
        this.$set(x, 'value_arr', $linq(this.moduleForMango).select(x => {
          return {
            value: x,
            name: x
          }
        }).toArray())
      });
  
      //this.initTable()
      rpt.dataUrl = `CSM/Report/v_csm_rpt_002`;
  },
};
</script>