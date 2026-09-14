<template>
  <div>
    <report ref="rpt"
            :extra-cond2="extraCond"
            :use-print-template="false"
            :grid-header="grid_header"
            :printPDF="false"
            :raw-data="rawData"
            :raw-file-cache="raw_filename"
            :only-raw-data="true"
            raw-name="v_ts_csm_rpt_001">
      <template #extra-cond>
      </template>

      <template #display>
        <template v-for="(i, idx) in display0">
          <div class="row" data-toggle="collapse" :href="`#collapse${idx}`" @click="toggleCollapse(idx)" style="cursor: pointer;">
            <div class="col-md-12">
              <h5>
                <i :class="['fas', collapseState[idx] ? 'fa-chevron-up' : 'fa-chevron-down', ]"></i>
                {{ i.form_n }}
              </h5>
            </div>
          </div>
          <div class="row collapse" :id="`collapse${idx}`">
            <div class="col-md-12">
              <ag-table :ref="'agr' + idx" scale="500" :key="'agr' + idx" :footer="false" @ready="initTable(idx)"></ag-table>
            </div>
          </div>
          <hr style="margin-top: 5px;" />
        </template>
      </template>

      <template #export>
      </template>
    </report>
    <vue-project-list ref="project" @send-data="selectInfoComponent($event,'pre_event2')"></vue-project-list>

    <vue-project2-list ref="ct_project2" @send-data="selectInfoComponent($event, 'pre_event')" :chk_code="chk_code"></vue-project2-list>
  </div>
</template>

<script type="text/javascript">
  import report from '../../Center/report-condition.vue'

let rpt = {};

let condTemplate = [];

condTemplate.push({
  field_name: "job_date_search",
  display_name: "วันที่เอกสาร",
  field_type: "date",
  field_group: "search",
  operatorx_arr: ["=", ">=", "<="],
  operatorx_default: ">=",
  value_arr: null,
  value_default: moment().format("DD/MM/YYYY"),
  multiple: true,
  multiple_type: "and",
  func_name: "",
});

condTemplate.push({
  field_name: "pre_event",
  display_name: "โครงการ",
  field_type: "string",
  field_group: "search",
  operatorx_arr: ["=", ">=", "<="],
  operatorx_default: "=",
  value_arr: [],
  value_default: 0,
  multiple: true,
  multiple_type: "or",
  func_name: "openProjectModal2",
});

condTemplate.push({
  field_name: "qaform",
  display_name: "ชุดคำถาม",
  field_type: "string",
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: [],
  value_default: "",
  multiple: true,
  multiple_type: "and",
  func_name: null,
});

condTemplate.push({
  field_name: "job_no",
  display_name: "เลขที่เอกสาร",
  field_type: "string",
  field_group: "search",
  operatorx_arr: ["="],
  operatorx_default: "=",
  value_arr: null,
  value_default: "",
  multiple: false,
  multiple_type: "",
  func_name: null,
});

  condTemplate.push({
    field_name: "pre_event2",
    display_name: "Project contract No.",
    field_type: "string",
    field_group: "search",
    operatorx_arr: ["=", ">=", "<="],
    operatorx_default: "=",
    value_arr: [],
    value_default: 0,
    multiple: true,
    multiple_type: "or",
    func_name: "openProjectModal",
  });

export default {
  data() {
    return {
      auth: window.auth,
      xt: $xt,
      baseUrl,
      condTemplate,
      raw_filename: "",
      rawData: [],
      extraCond: {},
      display0: [],
      grid_header: [],
      collapseState: {},
      chk_code: "N",
    };
  },
  components: {
    report,
  },
  methods: {
    toggleCollapse(idx) {
      this.collapseState[idx] = !this.collapseState[idx]; // toggle สถานะ
    },
    async setRptData(d, cond) {
      this.display0 = d.data_form;
      this.rawData = d.data_form;
      this.raw_filename = d.filename;
      this.$nextTick(() => {
        d.data_form.forEach((_, idx) => {
          this.initTable(idx);
        });
      });
    },
    async setCondForm() {
      let rep = await $xt.getServer(`CSM/Master/QC_ReadList`);
      $linq(this.condTemplate)
        .where((x) => x.field_name == "qaform")
        .foreach((x) => {
          x.value_arr = $linq(rep).select((x) => {
            return {
              value: x.code,
              name: x.description,
            };
          }).toArray();
        });
    },
    openProjectModal() {
      this.$refs.project.openModal();
    },
    openProjectModal2() {
      this.$refs.ct_project2.openModal();
    },
    selectInfoComponent(e, keyword) {
      switch (keyword) {
        case "pre_event":
          rpt.setRowData(e.pre_event, e.pre_event);
          break;
        case "pre_event2":
          rpt.setRowData(e.pre_event2, e.pre_event2);
          break;
      }
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
    async initTable(idx) {
      let agr = this.$refs["agr" + idx];

      if (Array.isArray(agr)) {
        agr = agr[0];
      }

      let bold_underline = { "font-weight": "bold" };
      let bold_style = (p) => (p?.data?.bold ? bold_underline : {});

      let fields = [
        ["job_no", "CSM No.", "text", { width: 180, align: "center", cellStyle: bold_style, cellRenderer: (params) => { if (params.value) { const url = this.openReq({ job_no: params.value });  return `<a href="${url}" style="text-decoration: none; color: blue;" target="_blank">${params.value}</a>`;} return ""; }, }],
        ["job_date", "Doc. Date", "datetime", { width: 180, align: "center", cellStyle: bold_style }, { useCellRenderer: true }],
        ["customer_name", "Customer", "text", { width: 180, align: "left", cellStyle: bold_style }],
        ["phone", "Tel.", "text", { width: 150, align: "center", cellStyle: bold_style }],
        ["contract_user", "Contact By", "text", { width: 180, align: "left", cellStyle: bold_style }],
        ["subject", "Subject", "text", { width: 200, align: "left", cellStyle: bold_style }],
        ["job_status", "Status", "text", { width: 180, align: "center", cellStyle: bold_style }],
        ["refcode", "Refcode", "text", { width: 180, align: "left", cellStyle: bold_style }],
      ];

      let p = this.display0[idx];

      if (Array.isArray(p.topic)) {
        p.topic.forEach((topic, index) => {
          fields.push([topic, topic, "text", { width: 150, align: "left", cellStyle: bold_style }]);
        });
      }

      fields.push(["result", "ผลการประเมิน", "n2", { width: 150, align: "center", cellStyle: bold_style }]);
      fields.push(
        ["remark", "Remark", "text", { width: 150, align: "left", cellStyle: bold_style }],
        ["qa_remark", "ข้อเสนอแนะ", "text", { width: 150, align: "left", cellStyle: bold_style }]
      );

      p.job_ans.forEach((answer) => {
        let score_percentage = (answer.max_score ?? 0) == 0 ? 0 : ((answer.get_score / answer.max_score) * 100).toFixed(2);
        answer["result"] = score_percentage + "%";

        if (Array.isArray(p.topic) && p.topic.length > 0) {
          p.topic.forEach((topic, index) => {
            answer[topic] = answer.score[index] || 0;
          });
        }
      });

      agr.setDisplay(p.job_ans);

      let header = agr.createHeaderFromArray(fields);
      agr.setHeader(header);
      this.grid_header = header;
    },
    createPdfData() {
      return this.$refs.agr.createPdfData();
    },
    async loadCenter() {
      await store.dispatch("findDataType");
    },
  },
  computed: {
    datatype() {
      return store.state.datatype;
    },
  },
  beforeMount() {
    this.loadCenter();
  },
  async mounted() {
    this.setCondForm();
    rpt = this.$refs.rpt;
    rpt.setTitle("รายงานการประเมินความพึงพอใจของลูกค้า");
    rpt.setTemplate(this.condTemplate);
    let defaultCond = [
      { field_name: 'pre_event', operatorx: '=', value: '', display_value: '' }
    ];
    rpt.setDefaultCond(defaultCond);
    rpt.dataUrl = `CSM/Report/v_csm_rpt_001`;
  },
};
</script>
