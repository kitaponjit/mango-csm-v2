<template>
  <div>
    <report ref="rpt" :extra-cond2="extraCond" :use-print-template="true" :grid-header="grid_header" :printPDF="true"
     :raw-file-cache="raw_filename" :raw-data="rawData" raw-name="v_csm_rpt_003">
      <template #extra-cond>
      </template>

      <template #display>
        <div class="row">
          <div class="col-md-12">
            <ag-table ref="agr" :footer="false" @ready="initTable()" @cell-clicked="cellClicked($event)"></ag-table>
          </div>
        </div>
      </template>

      <template #export>
      </template>
    </report>

    <!-- Modal Custom -->
    <modal ref="listModal">
       <template #header>
         <h4>รายการเอกสารคงค้างทั้งหมด</h4>
       </template>
       <template #body>
        <div class="col-md-12">
          <ag-table ref="agr_detail" :footer="false" @ready="initTableDetail()"></ag-table>
        </div>
      </template>
    </modal>

    <!-- Modal : Center -->
    <vue-project2-list ref="project" @send-data="projectSelect($event)"></vue-project2-list>
  </div>
</template>

<script type="text/javascript">
  import report from '../../Center/report-condition.vue'

  let rpt = {};

  let condTemplate = [];

  condTemplate.push({
    field_name: 'pre_event',
    display_name: 'โครงการ',
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
      typeSelect: "",
      statusCodeData,
      filterReport: [],
    };
  },
  components: {
    report,
  },
  methods: {
    async setRptData(d, cond) {
      let agr = this.$refs.agr;
      this.display = d.group || [];
      let detail = d.group || [];

      $linq(detail).foreach((x) => {
        x.bug_total = (x.bug_total || 0) + " รายการ";
        x.request_total = (x.request_total || 0) + " รายการ";
        x.contract_total = (x.contract_total || 0) + " รายการ";
        x.other_total = (x.other_total || 0) + " รายการ";
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
    async cellClicked(e) {
      let params = e.params;
      let data = params?.data;
      let fields = params?.colDef?.field;
      console.log(fields,'fff', data);
      let type = "";
      if (["bug_total", "request_total", "contract_total", "other_total"].includes(fields)) {
        switch (fields) {
          case "bug_total":
            type = "bug";
            break;
          case "request_total":
            type = "request";
            break;
          case "contract_total":
            type = "contract";
            break;
          case "other_total":
            type = "other";
            break;
        };
      };
      this.openList(data, type);
    },
    projectSelect(e) {
      rpt.setRowData(e.pre_event, e.pre_des)
    },
    async openList(x, type) {
      this.filterReport = [];
      this.typeSelect = type;
      await this.loadList(x);
      this.$refs.listModal.openModal();
    },
    async loadList(x) {
      console.log(x, 'x');
      let joinStatus =x
      let field_name = this.condTemplate[0].field_name;
      let act = `CSM/Report/ReportByType004?customer_code=${x.pre_event || ''}&item_type=${field_name||'pre_event'}`;
      let rsp = await $xt.getServer(act);
      this.filterReport = rsp.data;
      this.initTableDetail();
    },
    filterType() {
      return $linq(this.filterReport).where(x => this.typeSelect == 'bug' ? ['03'].includes(x.item_type) : this.typeSelect == 'request' ? ["01", "02", "04", "05", "06", "07"].includes(x.item_type) : this.typeSelect == 'contract' ? (x.contract_type || "N") == "Y" : this.typeSelect == 'other' ? ["08", "09", "10", "11"].includes(x.item_type) : true).toArray();
    },
    openReq(x) {
      x = x || "";
      if ($xt.isEmpty(x)) {
        return this.baseUrl + `page/Transaction/v_csm_trn_001/`;
      }
      else {
        return this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${x.job_no}`
      }
    },
    itemTypeName(code) {
      return $linq(this.serviceCodeData).where(x => x.serv_code == code).select(x => x.serv_name).firstOrDefault() || '';
    },
    statusName(code) {
      return $linq(this.statusCodeData).where(x => x.id == code).select(x => x.name).firstOrDefault() || '';
    },
    async initTable() {
      let agr = this.$refs.agr;

      let bold_underline = { "font-weight": "bold" };
      let bold_style = (p) => (p?.data?.bold ? bold_underline : {});
      
      let fields = [
        ["customer_code", "Code", "text", { width: 180, align: "center", cellStyle: bold_style }],
        ["customer_name", "Customer", "text", { width: 450, align: "left"}],
        ["bug_total", "Bug Software", "text", { width: 180, align: "center", cellRenderer: (param) => {  return `<a style="color: blue; cursor: pointer;">${param.value}</a>`;} }],
        ["request_total", "Request", "text", { width: 180, align: "center", cellRenderer: (param) => {  return `<a style="color: blue; cursor: pointer;">${param.value}</a>`;} }],
        ["contract_total", "Contract", "text", { width: 180, align: "center", cellRenderer: (param) => {  return `<a style="color: blue; cursor: pointer;">${param.value}</a>`;} }],
        ["other_total", "Other", "text", { width: 180, align: "center", cellRenderer: (param) => {  return `<a style="color: blue; cursor: pointer;">${param.value}</a>`;} }],
    //    ["pre_event", "โครงการ", "text", { width: 100, align: "center",}],
      ];

      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);

      this.grid_header = header;
    },
    initTableDetail(){
      let bold_underline = { "font-weight": "bold" };
      let bold_style = (p) => (p?.data?.bold ? bold_underline : {});
      let agr = this.$refs.agr_detail;
      let filteredData = this.filterType();
      $linq(filteredData).foreach((x) => {
        x.status = this.statusName(x.status);
        x.item_type = this.itemTypeName(x.item_type);
      });
      let fields = [
        ["refcode", "Ref. Code", "text", { width: 180, align: "center", cellStyle: bold_style }],
        ["pre_des", "Project", "text", { width: 180, align: "left"}],
        ["job_no", "Document No.", "text", { width: 180, align: "center", cellRenderer: (params) => { if (params.value) { const url = this.openReq({ job_no: params.value });  return `<a href="${url}" style="text-decoration: none; color: blue;" target="_blank">${params.value}</a>`;} return ""; }, }],
        ["itemno", "No.", "text", { width: 80, align: "center"}],
        ["detail", "Description", "text", { width: 300, align: "left" },],
        ["item_type", "Type", "text", { width: 180, align: "center" }],
        ["status", "Status", "text", { width: 180, align: "center" }],
      ];
      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);
      agr.setDisplay(filteredData);
    }
  },
  computed: {
    serviceCodeData() { return store.state.serviceCodeData },
  },
  async mounted() {
      rpt = this.$refs.rpt;
      rpt.setTitle('รายงานสรุปใบงาน CSM คงค้าง');
      rpt.setTemplate(this.condTemplate);
      await $xt.sleep(500);
      this.$refs.listModal.setSize('modal-xl');
      let defaultCond = [
        { field_name: 'pre_event', operatorx: '=', value: '', display_value: '' }
      ];
      rpt.setDefaultCond(defaultCond);
      //this.initTable()
      rpt.dataUrl = `CSM/Report/v_csm_rpt_004`;
  },
};
</script>