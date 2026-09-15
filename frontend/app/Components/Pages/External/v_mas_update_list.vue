<template>
  <div class="cx-page">
    <report ref="rpt">
      <template #display>
        <div class="nav-tabs-custom cx-modtabs">
          <ul class="nav nav-tabs">
            <li v-for="x in tabModuleData" :class="{active:x.id===tabModuleSelected}" v-show="x.show">
              <a href="#" @click.prevent="mainTabModuleSelected(x)">
                <label class="label label-success" v-if="x.total > 0">{{x.total}}</label> <span v-text="x.text"></span>
              </a>
            </li>
            <li class="pull-right cx-modtabs__act">
              <button class="cx-btn cx-btn--ghost" @click="onExport"><i class="fas fa-file-export"></i> ดาวน์โหลดข้อมูลเป็น Excel</button>
            </li>
          </ul>
          <div class="tab-content">
            <div class="tab-pane active">
              <div class="cx-table-wrap" v-show="filterData.length > 0">
                <div class="cx-rptscroll">
                  <table class="table cx-table cx-table--sticky">
                    <thead>
                      <tr>
                        <th class="tf-2 text-center">No.</th>
                        <th class="tf-3-5 text-center">
                          Revision No.
                          <a href="#" class="cx-sortbtn" @click.prevent="getSort('Revision')"><i class="fas fa-arrow-up" v-show="sort_rev"></i><i class="fas fa-arrow-down" v-show="!sort_rev"></i></a>
                        </th>
                        <th>Subject</th>
                        <th class="tf-2-5 text-center">Module</th>
                        <th class="tf-2-5 text-center">
                          Date
                          <a href="#" class="cx-sortbtn" @click.prevent="getSort('Date')"><i class="fas fa-arrow-up" v-show="sort_date"></i><i class="fas fa-arrow-down" v-show="!sort_date"></i></a>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(x,idx) in filterData">
                        <td align="center" class="cx-num">{{idx+1}}.</td>
                        <td align="center"><span class="label label-info">{{x.revision}}</span></td>
                        <td class="cx-subject"><a href="#" @click.prevent="showAttachment(x)"><i class="far fa-images"></i> {{x.subject}}</a></td>
                        <td align="center"><span class="cx-docno">{{x.module}}</span></td>
                        <td align="center">{{$date(x.add_dt)}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="cx-empty" v-show="filterData.length < 1"><i class="fas fa-inbox"></i> ไม่พบรายการอัพเดทซอฟต์แวร์</div>
            </div>
          </div>
        </div>
      </template>
    </report>
    <!-- Modal : Attachment -->
    <modal ref="showFileModal">
      <template #header>
        <h4 class="modal-title"><i class="far fa-images"></i> {{subject}}</h4>
      </template>
      <template #body>
        <div class="cx-modal">
        <div class="cx-shots" v-if="dataAttachment.length">
          <div class="cx-shot" v-for="(y, idx) in dataAttachment">
            <a class="cx-shot__media" :href="filePath(y.filepath)" target="_blank">
              <i class="far fa-image"></i>
              <span class="cx-shot__img" :style="{ backgroundImage: 'url(' + filePath(y.filepath) + ')' }"></span>
              <span class="cx-shot__zoom"><i class="fas fa-search-plus"></i></span>
            </a>
            <div class="cx-shot__body">
              <span class="cx-shot__no">{{$num((idx+1), 0)}}</span>
              <span class="cx-shot__desc">{{y.description}}</span>
            </div>
          </div>
        </div>
        <div class="cx-empty" v-else><i class="far fa-image"></i> ไม่มีไฟล์ประกอบ</div>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
  import report from '../../Center/report-customer.vue';
  import XLSX from 'xlsx';

  let rpt = {};

  let condTemplate = [];

  condTemplate.push({
    field_name: 'platform',
    display_name: 'Platform',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: '',
  });

  condTemplate.push({
    field_name: 'add_dt',
    display_name: 'วันที่',
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
    field_name: 'revision',
    display_name: 'เลขที่ Revision',
    field_type: 'decimal', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '=',
    value_arr: null, //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'and',
    func_name: null
  });

  let vue = {
    data() {
      return {
        baseUrl,
        condTemplate,
        tabModuleData: [],
        tabModuleSelected: "",
        moduleCodeData: [
          'ALL',
          'BD',
          'OF',
          'PO',
          'IC',
          'AP',
          'AR',
          'FA',
          'GL',
          'PM',
          'SE',
          'RT',
          'MA',
          'MRP',
          'EVAL',
          'RE',
        ],
        updateList: [],
        filterData: [],
        dataAttachment: [],
        total: 0,
        subject: "",
        isLoading: false,
        platformCodeData,
        sort_rev: false,
        sort_date: false,
      }
    },
    components: {
      report
    },
    methods: {
      async setRptData(d, cond) {
        this.updateList = d.data;
        this.total = d.total;

        this.tabModuleData.forEach((x, idx) => {
          x.total = 0;
        });

        this.tabModuleData.forEach((x, idx) => {
          if (x.id == 'ALL') {
            x.total = $linq(this.total).select(x2 => x2.total).sum();
          } else {
            $linq(this.total).where(x2 => x2.module == x.id).foreach(x2 => {
              x.total = x2.total;
            });
          }
        });

        this.mainTabModuleSelected({ id: 'ALL', name: 'ALL' });
      },
      mainTabModuleSelected(x) {
        this.tabModuleSelected = x.id;
        this.filterData = x.id == 'ALL' ? this.updateList : $linq(this.updateList).where(w => w.module == x.id).toArray();
      },
      async showAttachment(x) {
        this.$refs.showFileModal.openModal();
        this.subject = x.subject;

        let rsp = await $xt.getCustomerServer(`CSM/CustomerData/ReadPicture?job_no=${x.job_no}&module=${x.module}&revision=${x.revision}`);
        this.dataAttachment = rsp.data;
      },
      filePath(x) {
        return dataServer + "Api/File/DownLoad?id=" + x
      },
      onExport() {
        let arr = [];
        $linq(this.filterData).foreach(x => {
          arr.push({
            'Revision': x.revision,
            'Module': x.module,
            'Document': x.job_no,
            'Itemno': x.itemno,
            'Subject': x.subject,
            'Detail': x.detail
          })
        });
        var dataWS = XLSX.utils.json_to_sheet(arr);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, dataWS);
        XLSX.writeFile(wb, 'export.xlsx');
      },
      getSort(sort) {
        this.tabModuleSelected = this.tabModuleSelected;

        switch (sort) {
          case "Revision":
            if (!this.sort_rev) {
              this.filterData = $linq(this.filterData).orderByDescending(x => x.revision).toArray();
              this.sort_rev = true;
            }
            else
            {
              this.filterData = $linq(this.filterData).orderBy(x => x.revision).toArray();
              this.sort_rev = false;
            }
            break;
          case "Date":
            if (!this.sort_date) {
              this.filterData = $linq(this.filterData).orderByDescending(x => x.add_dt).toArray();
              this.sort_date = true;
            }
            else
            {
              this.filterData = $linq(this.filterData).orderBy(x => x.add_dt).toArray();
              this.sort_date = false;
            }
            break;
          default:
            this.filterData = $linq(this.filterData).orderByDescending(x => x.add_dt).toArray();
            break;
        }
      },
    },
    beforeMount() {
      this.moduleCodeData.forEach((x, idx) => {
        this.tabModuleData.push({
          id: x, icon: '', text: x, show: true, total: 0
        });
      });
    },
    mounted() {
      rpt = this.$refs.rpt;
      rpt.setTitle('รายการอัพเดทโปรแกรมทั้งหมด');
      rpt.setTemplate(this.condTemplate);
      rpt.showPrint = false;

      this.$refs.showFileModal.setSize("modal-lg");

      $linq(this.condTemplate).where(x => x.field_name == 'platform').foreach(x => {
        x.value_arr = $linq(this.platformCodeData).where(x => x.id != '111').select(x => {
          return {
            value: x.id,
            name: x.name
          }
        }).toArray()
      });

      let defaultCond = [
        { field_name: 'platform', operatorx: '=', value: 'WIN', not_remove: true },
        { field_name: 'revision', operatorx: '>=', value: '0', not_remove: true },
      ];
      rpt.setDefaultCond(defaultCond);

      rpt.dataUrl = `CSM/CustomerData/InvokeReport?rpt_name=ManualReadListReport`;
      rpt.callData();
      this.mainTabModuleSelected({ id: "ALL" });
    }
  }
  export default vue
</script>
