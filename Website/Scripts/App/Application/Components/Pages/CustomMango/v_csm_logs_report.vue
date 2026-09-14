<template>
  <div>
    <report ref="rpt" :extra-cond2="extraCond":grid-header="grid_header" :only-raw-data="true"
     :raw-file-cache="raw_filename" :raw-data="rawData" raw-name="v_csm_logs_report" :pdfLabel="grid_header"
     >
     <template #extra-cond>
        <div class="row">
          <!-- Year -->
          <div class="col-md-1 mb-3">
            <div class="search-field">
              <label class="field-label">Year</label>
              <input type="text" class="field-input-small" v-model="extraCond.year.value" maxlength="4"/>
            </div>
          </div>

          <!-- Month -->
          <div class="col-md-1 mb-3">
            <div class="search-field">
              <label class="field-label">Month</label>
              <input type="text" class="field-input-small" v-model="extraCond.month.value" maxlength="2"/>
            </div>
          </div>
        </div>
      </template>
      <template #display>
        <div class="row">
          <div class="col-md-12">
            <ag-table ref="agr" :footer="false" @ready="initTable()" @cell-clicked="onCellClicked"></ag-table>
          </div>
        </div>
      </template>
    </report>

    <!-- Modal : Attachment -->
    <modal-2 ref="showFileModal">
      <template slot="header">
        <h4>คู่มือย่อ {{subject}}</h4>
      </template>
      <template slot="body">
        <div class="row">
          <div class="col-lg-12 col-md-12 col-sm-12">
            <table class="table table-hover">
              <thead>
                <tr>
                <th style="width:1px;">No.</th>
                <th style="width:300px;">File</th>
                <th>Description</th>
                <!-- <th>Add Date</th> -->
                </tr>
              </thead>
              <tbody>
                <tr v-for="x,idx in dataAttachment">
                <td align="center">{{idx+1}}.</td>
                <td align="center">
                  <p v-if="['png','jpeg','jpg'].includes(getFileExt(x.filename))">
                  <a :href="createFilePath(x.path_hex)" target="_blank"><img :src="createFilePath(x.path_hex)" class="img-responsive" /></a>
                  </p>
                  <p v-if="['mp4'].includes(getFileExt(x.filename))">
                  <a :href="createFilePath(x.path_hex)" target="_blank"><i class="fas fa-file-video fa-5x"></i></a>
                  <br />
                  <a :href="downLoadFile(x)" style="margin-top:10px;"><i class="fas fa-download"></i> {{x.filename}}</a>
                  </p>
                  <p v-if="!['jpg','jpeg','png', 'mp4'].includes(getFileExt(x.filename))">
                  <i class="fas fa-file-word fa-5x" v-if="['doc','docx'].includes(getFileExt(x.filename))"></i>
                  <i class="fas fa-file-excel fa-5x" v-else-if="['xls','xlsx'].includes(getFileExt(x.filename))"></i>
                  <i class="fas fa-file-powerpoint fa-5x" v-else-if="['ppt','pptx'].includes(getFileExt(x.filename))"></i>
                  <i class="fas fa-file-pdf fa-5x" v-else-if="['pdf'].includes(getFileExt(x.filename))"></i>
                  <i class="fas fa-file fa-5x" v-else=""></i>
                  <br />
                  <a :href="downLoadFile(x)" style="margin-top:10px;"><i class="fas fa-download"></i> {{x.filename}}</a>
                  </p>
                </td>
                <td><textarea class="form-control input-sm" rows="5" v-model.trim="x.description" readonly></textarea></td>
                <!-- <td>{{$date(x.add_dt, 'DD/MM/YYYY HH:mm')}}</td> -->
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </modal-2>
  </div>
  
</template>

<script>
  import report from '../../center/report-condition.vue'

  let rpt = {}

  let condTemplate = []

  condTemplate.push({
    field_name: 'b.job_no',
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

  condTemplate.push({
    field_name: 'platform',
    display_name: 'Platform',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: 0,
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: '',
  })

  condTemplate.push({
    field_name: 'module',
    display_name: 'Module',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: '',
  })

  condTemplate.push({
    field_name: 'b.prod_date',
    display_name: 'Prod. Date',
    field_type: 'date', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '>=',
    value_arr: null, //empty or null for textbox
    value_default: moment().format('DD/MM/YYYY'),
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: '',
  })

  condTemplate.push({
    field_name: 'b.revision_prod',
    display_name: 'Revision No.',
    field_type: 'number', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: null, //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'and',
    func_name: null
  })

  let vue = {
    data() {
      return {
        baseUrl,
        condTemplate,
        display: [],
        dataAttachment: [],
        rawData: [],
        grid_header: [],
        subject: '',
        raw_filename: "",
        isLoading: false,
        platformCodeData,
        moduleCodeData,
        extraCond: {
          year: {
            type: "int",
            value: new Date().getFullYear(),
            useDefault: true,
            default: new Date().getFullYear(),
          },
          month: {
            type: "int",
            value: new Date().getMonth() + 1,
            useDefault: true,
            default: new Date().getMonth() + 1,
          },
        },
      }
    },
    components: {
      report
    },
    methods: {
      async setRptData(d, cond) {
        let agr = this.$refs.agr;

        this.$set(this, "display", d.data);

        let detail = d.data || [];

        console.log('D', d);

        this.$set(this, "rawData", d.raw_data);
        this.$set(this, "raw_filename", d.raw_filename);

        /* Display : Reformat Header */
        this.initTable();

        /* Display : Header */
        agr.setDisplay(detail);
      },
      async initTable() {
        let agr = this.$refs.agr;

        let bold_underline = { "font-weight": "bold" };
        let bold_style = (p) => (p?.data?.bold ? bold_underline : {});
        
        let fields = [
          ["prod_date", "Prod. Date.", "date", { width: 150, align: "center", sortable: true }, { useCellRenderer: true }],
          ["job_no", "CSM No.", "text", { width: 150, align: "left", sortable: true , cellRenderer: (params) => { if (params.value) { return `<a href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${params.value}" style="text-decoration: none; cursor: pointer; color: blue;" target="_blank">${params.value}</a>`; } return ""; }, },],
          // ["ref_task", "Task", "text", { width: 150, align: "center" }],
          ["module", "Module", "text", { width: 100, align: "center", cellStyle: bold_style }],
          ["prog_name", "Program", "text", { width: 320, align: "center" }, { useCellRenderer: true }],
          // ["platform", "Platform", "text", { width: 200, align: "right", cellStyle: bold_style }],
          ["serv_name", "Type", "text", { width: 200, align: "center"}, { useCellRenderer: true }],
          ["revision_prod", "Revision No.", "text", { width: 200, align: "left" }, { useCellRenderer: true }],
          ["subject", "Description", "text", { width: 220, align: "left" }, { useCellRenderer: true }],
          ["link_test", "Link Test", "text", { width: 220, align: "left", cellRenderer: (params) => { if (params.value) { return `<a href="${params.value}" style="text-decoration: none; cursor: pointer; color: blue;" target="_blank">${params.value}</a>`; } return ""; }, },],
          ["view_file", "Attach File", "text", {
            width: 150, align: "center", cellRenderer: (params) => {if (params.data.pics && params.data.pics.length > 0) {{ return `<a class="text-primary"> <i class="fa fa-picture-o"></i> </a>`; }} return `<a class="text-black"> <i class="fa fa-picture-o"></i> </a>`}
          }],
        ];

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        this.grid_header = header;
      },
      openReq(x) {
        x = x || ""
        if ($xt.isEmpty(x)) {
          return this.baseUrl + `page/Transaction/v_csm_trn_001/`
        }
        else {
          return this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${x.job_no}`
        }
      },
      onCellClicked(event) {
        console.log('click here:', event)
        switch (event.col) {
          case 'view_file':
            this.subject = event.data.job_no || ''
            this.dataAttachment = event.data.pics || []
            this.$refs.showFileModal.openModal()
            // if (event.data.files_path) {
            //   this.viewImage(event.data.files_path);
            // } else {
            //   $msg.alert('Info', 'ไม่พบข้อมูลรูปภาพ', 'info');
            // }
            break;
        }
      },
      createFilePath(x) {
        return window.dataServer + 'Api/File/DownLoad?id=' + x
      },
      getFileExt(f) {
        return f?.split('.').pop().toLowerCase()
      },
      downLoadFile(x) {
        const filepath = x.path_hex; // ไม่ต้อง encode ถ้าเป็น ID
        // เอาเฉพาะตัวอักษร safe
        // let filename = (x.filename || 'file').replace(/[%&?#]/g, '_');
        // filename = encodeURIComponent(filename);
        return `${window.dataServer}API/File/DownLoad?id=${filepath}&download=true&filename=${x.filename}`;
      },
      // downLoadFile(pathto) {
      //   return window.dataServer + "/Api/File/DownLoad?id=" + pathto
      // },
    },
    beforeMount() {
    },
    mounted() {
      rpt = this.$refs.rpt
      rpt.setTitle('CSM Logs Report')
      rpt.setTemplate(this.condTemplate)
      rpt.showPrint = false

      this.$refs.showFileModal.setSize("modal-lg")

      $linq(this.condTemplate).where(x => x.field_name == 'platform').foreach(x => {
        this.$set(x, 'value_arr', $linq(this.platformCodeData).where(x => x.id != '111').select(x => {
          return {
            value: x.id,
            name: x.name
          }
        }).toArray())
      })

      // $linq(this.condTemplate).where(x => x.field_name == 'module').foreach(x => {
      //     this.$set(x, 'value_arr', $linq(moduleCodeData).select(x => {
      //       return {
      //         value: x,
      //         name: x
      //       }
      //     }).toArray())
      //   });

        $linq(this.condTemplate).where(x => x.field_name == 'module').foreach(x => {
          this.$set(x, 'value_arr',
            $linq([
              { value: 'All', name: 'ALL' }, 
              ...$linq(moduleCodeData).select(m => ({
                value: m,
                name: m
              })).toArray()
            ]).toArray()
          )
        })


      let defaultCond = [
        { field_name: 'module', operatorx: '=', value: 'All', not_remove: false },
      ]
      
      rpt.setDefaultCond(defaultCond)

      // rpt.dataUrl = `CSM/Report/ManualReadListReport`
      rpt.dataUrl = `CSM/Report/CSM_Logs_Report`
      rpt.callData()
    }
  }
  export default vue
</script>
<style scoped>

  /* thead > tr > th {
    background-color: #eeeeee;
    color: black;
    font-weight: 400 !important;
    vertical-align: middle !important;
  } */

.field-input-small {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;
}

.field-input-small:hover {
  border-color: #cbd5e1;
}

.field-input-small:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}
</style>
