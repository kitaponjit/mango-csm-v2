<template>
  <div>
    <report ref="rpt" :extra-cond2="extraCond">
      <template #display>
        <div class="mv2">
          <!-- Toolbar -->
          <div class="mv2-bar">
            <div class="mv2-tabs">
              <a href="#" class="mv2-tab"
                 v-for="x in tabModuleData"
                 :class="{ 'is-on': x.id===tabModuleSelected }"
                 v-show="x.show"
                 @click.prevent="changeModule(x)">
                <span class="mv2-tab__t" v-text="x.text"></span>
                <span class="mv2-tab__n" v-if="x.total > 0">{{x.total}}</span>
              </a>
            </div>
            <div class="mv2-bar__act">
              <span class="mv2-chip"><i class="fas fa-layer-group"></i> {{ filterData.length }} รายการ</span>
              <button class="mv2-btn mv2-btn--excel" @click="onExport"><i class="fas fa-file-export"></i> ดาวน์โหลดข้อมูลเป็น Excel</button>
            </div>
          </div>

          <!-- Table -->
          <div class="mv2-card" v-show="filterData.length > 0">
            <table-stick-2 ref="table_stick" :scale="450">
              <table class="table table-bordered table-hover mv2-table">
                <thead>
                  <tr>
                    <th class="tf-2 text-center">No.</th>
                    <th class="tf-2-5 text-center">
                      Date
                      <a href="#" class="mv2-sort" @click.prevent="getSort('Date')"><i class="fas fa-arrow-up" v-show="sort_date"></i><i class="fas fa-arrow-down" v-show="!sort_date"></i></a>
                    </th>
                    <th class="tf-2-5 text-center">Platform</th>
                    <th class="tf-2-5 text-center">Module</th>
                    <th class="tf-3-5 text-center">CSM No.</th>
                    <th class="tf-3-5 text-center">Type</th>
                    <th class="tf-3-5 text-center">
                      Revision No.
                      <a href="#" class="mv2-sort" @click.prevent="getSort('Revision')"><i class="fas fa-arrow-up" v-show="sort_rev"></i><i class="fas fa-arrow-down" v-show="!sort_rev"></i></a>
                    </th>
                    <th>Subject</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(x,idx) in filterData">
                    <td align="center" class="mv2-idx">{{idx+1}}.</td>
                    <td align="center" class="mv2-num">{{$date(x.add_dt)}}</td>
                    <td align="center"><span class="mv2-pill" v-if="x.platform">{{x.platform}}</span></td>
                    <td align="center"><span class="mv2-mod" v-if="x.module">{{x.module}}</span></td>
                    <td align="center"><a class="mv2-doc" v-bind:href="openReq(x)" target="_blank">{{x.job_no}}</a></td>
                    <td class="mv2-type">{{x.item_name}}</td>
                    <td align="center" class="mv2-rev">{{x.revision}}</td>
                    <td><a class="mv2-subj" href="#" @click.prevent="showAttachment(x)"><i class="far fa-images"></i><span>{{x.subject}}</span></a></td>
                  </tr>
                </tbody>
              </table>
            </table-stick-2>
          </div>

          <div class="mv2-empty" v-show="filterData.length < 1">
            <i class="fas fa-inbox"></i>
            <span>ไม่พบรายการอัพเดทซอฟต์แวร์</span>
          </div>

          <div class="mv2-foot">
            <span class="mv2-foot__hint"><i class="far fa-images"></i> คลิกที่ Subject เพื่อดูรูปประกอบของรายการนั้น</span>
            <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
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
          <table-stick-2 ref="attach_stick" :scale="310">
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
            <div class="cx-empty" v-else><i class="far fa-image"></i> ไม่มีรูปประกอบ</div>
          </table-stick-2>
        </div>
      </template>
    </modal>

  </div>
</template>

<script>
  import report from '../../Center/report-condition.vue'
  import XLSX from 'xlsx'

  let rpt = {}
  let paging = {}

  let condTemplate = []

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
  })

  condTemplate.push({
    field_name: 'add_dt',
    display_name: 'Date',
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
    field_name: 'revision',
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
        tabModuleData: [],
        tabModuleSelected: "",
        moduleCodeData: [
          'ALL',
          'AP',
          'AR',
          'BD',
          'CSM',
          'EVAL',
          'FA',
          'FN',
          'GL',
          'HR',
          'IC',
          'MAIL',
          'MA',
          'MRP',
          'OF',
          'PM',
          'PO',
          'PPN',
          'QCM',
          'RE',
          'RT',
          'SE',
          'TOKBUD',
        ],
        updateList: [],
        filterData: [],
        filterData2: [],
        dataAttachment: [],
        total: 0,
        total: 0,
        subject: "",
        isLoading: false,
        platformCodeData,
        sort_rev: false,
        sort_date: false,
        extraCond: {
          module: {
            type: 'string',
            value: '',
          },
          skip: {
            type: 'int',
            value: 0,
            useDefault: true,
            default: 0
          },
          take: {
            type: 'int',
            value: 500,
            useDefault: true,
            default: 500
          },
        },
        status: {
          changeModule: "Y"
        }
      }
    },
    components: {
      report
    },
    methods: {
      async setRptData(d, cond) {
        this.filterData = d.data
        this.total = d.total

        if (this.status.changeModule == "Y") {
          this.tabModuleData.forEach((x, idx) => {
            x.total = 0
          })

          this.tabModuleData.forEach((x, idx) => {
            if (x.id == 'ALL') {
              x.total = $linq(this.total).select(x2 => x2.total).sum()
            } else {
              $linq(this.total).where(x2 => x2.module == x.id).foreach(x2 => {
                x.total = x2.total
              })
            }
          })

          this.mainTabModuleSelected({ id: 'ALL', name: 'ALL' })
        }

        let tot = d.total_q || 0

        paging.setTotalItems(tot)
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1)
        }
        paging.createPagesArray()
      },
      async changeModule(x) {
        this.status.changeModule = "N"
        this.mainTabModuleSelected(x)
        this.extraCond.module.value = x.id
        await this.$refs.rpt.callData()
        this.status.changeModule = "Y"
      },
      mainTabModuleSelected(x) {
        this.tabModuleSelected = x.id
      },
      async showAttachment(x) {
        this.$refs.showFileModal.openModal()
        this.subject = x.subject

        let rsp = await $xt.getServer(`CSM/Manual/ReadPicture?job_no=${x.job_no}&module=${x.module}&revision=${x.revision}`)
        this.dataAttachment = rsp.data
      },
      pageChange(pn) {
        paging.setCurrentPage(pn)
        this.extraCond.skip.value = paging.skipItems()
        this.extraCond.take.value = paging.getItemsPerPage()
        this.$refs.rpt.callData()
      },
      filePath(x) {
        return dataServer + "Api/File/DownLoad?id=" + x
      },
      onExport() {
        let arr = []
        $linq(this.filterData).foreach(x => {
          arr.push({
            'Revision': x.revision_,
            'Module': x.module,
            'Document': x.job_no,
            'Itemno': x.itemno,
            'Subject': x.subject,
            'Detail': x.detail
          })
        })
        var dataWS = XLSX.utils.json_to_sheet(arr)
        var wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, dataWS)
        XLSX.writeFile(wb, 'export.xlsx')
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
      getSort(sort) {
        this.tabModuleSelected = this.tabModuleSelected
        switch (sort) {
          case "Revision":
            if (!this.sort_rev) {
              this.filterData = $linq(this.filterData).orderByDescending(x => x.revision).toArray()
              this.sort_rev = true
            }
            else {
              this.filterData = $linq(this.filterData).orderBy(x => x.revision).toArray()
              this.sort_rev = false
            }
            break
          case "Date":
            if (!this.sort_date) {
              this.filterData = $linq(this.filterData).orderByDescending(x => x.add_dt).toArray()
              this.sort_date = true
            }
            else {
              this.filterData = $linq(this.filterData).orderBy(x => x.add_dt).toArray()
              this.sort_date = false
            }
            break
          default:
            this.filterData = $linq(this.filterData).orderByDescending(x => x.add_dt).toArray()
            break
        }
      },
    },
    beforeMount() {
      this.moduleCodeData.forEach((x, idx) => {
        this.tabModuleData.push({
          id: x, icon: '', text: x, show: true, total: 0
        })
      })
    },
    mounted() {
      rpt = this.$refs.rpt
      rpt.setTitle('CSM : รายงานข้อมูลการอัพเดทโปรแกรมทั้งหมด')
      rpt.setTemplate(this.condTemplate)
      rpt.showPrint = false

      paging = this.$refs.paging
      paging.setCurrentPage(1)
      paging.setItemsPerPage(500)

      this.extraCond.skip.value = paging.skipItems()
      this.extraCond.take.value = paging.getItemsPerPage()

      this.$refs.showFileModal.setSize("modal-lg")

      $linq(this.condTemplate).where(x => x.field_name == 'platform').foreach(x => {
        x.value_arr = $linq(this.platformCodeData).where(x => x.id != '111').select(x => {
          return {
            value: x.id,
            name: x.name
          }
        }).toArray()
      })

      let defaultCond = [
        { field_name: 'revision', operatorx: '>=', value: '0', not_remove: false },
        { field_name: 'platform', operatorx: '=', value: 'WIN', not_remove: false },
      ]
      rpt.setDefaultCond(defaultCond)

      rpt.dataUrl = `CSM/Report/ManualReadListReport`
      rpt.callData()
      this.mainTabModuleSelected({ id: "ALL" })
    }
  }
  export default vue
</script>
<style scoped>
  .mv2 {
    --mv-ink: #101A2B;
    --mv-ink-2: #35435C;
    --mv-muted: #7A879B;
    --mv-line: #E6EAF2;
    --mv-line-2: #D6DEEB;
    --mv-field: #F7F9FC;
    --mv-navy: #02234E;
    --mv-navy-2: #0A3D7A;
    --mv-blue: #1A73E8;
    --mv-blue-soft: #E8F0FE;
    --mv-green: #17864A;
    --mv-green-soft: #E7F5EC;
    --mv-amber: #B45309;
    --mv-amber-soft: #FFF5E3;
    --mv-font: 'Manrope', 'Sarabun', sans-serif;
    font-family: var(--mv-font);
  }

  /* ── Toolbar : module chips + actions ── */
  .mv2-bar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px 14px;
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--mv-line);
  }
  .mv2-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex: 1 1 auto;
    min-width: 0;
  }
  .mv2-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 11px;
    border: 1px solid var(--mv-line);
    border-radius: 999px;
    background: #fff;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: .02em;
    color: var(--mv-ink-2);
    text-decoration: none;
    transition: background .14s ease, border-color .14s ease, color .14s ease, transform .12s ease, box-shadow .18s ease;
  }
  .mv2-tab:hover {
    border-color: #A9C6F5;
    background: var(--mv-blue-soft);
    color: #1558B8;
    transform: translateY(-1px);
    text-decoration: none;
  }
  .mv2-tab.is-on {
    border-color: transparent;
    background: linear-gradient(135deg, var(--mv-navy-2), var(--mv-navy));
    color: #fff;
    box-shadow: 0 8px 16px -10px rgba(2, 35, 78, .95);
  }
  .mv2-tab__n {
    min-width: 19px;
    height: 19px;
    padding: 0 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: var(--mv-green-soft);
    color: var(--mv-green);
    font-size: 10.5px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .mv2-tab.is-on .mv2-tab__n { background: rgba(255, 255, 255, .22); color: #fff; }

  .mv2-bar__act {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .mv2-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--mv-line);
    background: var(--mv-field);
    font-size: 11.5px;
    font-weight: 700;
    color: var(--mv-ink-2);
    font-variant-numeric: tabular-nums;
  }
  .mv2-chip > i { font-size: 10px; color: var(--mv-muted); }
  .mv2-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 15px;
    border: 1px solid transparent;
    border-radius: 9px;
    font-family: var(--mv-font);
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
    cursor: pointer;
    transition: background .16s ease, box-shadow .2s ease, transform .12s ease;
  }
  .mv2-btn > i { font-size: 11px; }
  .mv2-btn--excel {
    background: linear-gradient(135deg, #17A45C, #0F7A43);
    color: #fff;
    box-shadow: 0 8px 16px -10px rgba(15, 122, 67, .95);
  }
  .mv2-btn--excel:hover { transform: translateY(-1px); box-shadow: 0 12px 22px -10px rgba(15, 122, 67, 1); }
  .mv2-btn--excel:active { transform: translateY(0); }

  /* ── Table ── */
  .mv2-card {
    border: 1px solid var(--mv-line);
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
  }
  .mv2-table { margin-bottom: 0 !important; }
  .mv2-table > thead > tr > th {
    background: #F4F7FC !important;
    color: var(--mv-ink-2) !important;
    border-color: var(--mv-line) !important;
    border-bottom: 2px solid var(--mv-line-2) !important;
    font-family: var(--mv-font);
    font-size: 11px !important;
    font-weight: 800 !important;
    letter-spacing: .05em;
    text-transform: uppercase;
    padding: 10px 9px !important;
    white-space: nowrap;
  }
  .mv2-table > tbody > tr > td {
    font-family: var(--mv-font);
    font-size: 12.5px;
    color: var(--mv-ink-2);
    border-color: #F0F3F8 !important;
    vertical-align: middle !important;
    padding: 8px 9px !important;
  }
  .mv2-table > tbody > tr:nth-child(even) > td { background: #FBFCFE; }
  .mv2-table > tbody > tr:hover > td { background: #F3F8FF !important; }
  .mv2-idx { color: var(--mv-muted); font-size: 11.5px; }
  .mv2-num { font-variant-numeric: tabular-nums; }
  .mv2-type { color: var(--mv-muted); }
  .mv2-rev {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    color: var(--mv-ink);
  }
  .mv2-pill {
    display: inline-block;
    padding: 2px 9px;
    border-radius: 999px;
    background: var(--mv-field);
    border: 1px solid var(--mv-line);
    font-size: 11px;
    font-weight: 700;
    color: var(--mv-ink-2);
  }
  .mv2-mod {
    display: inline-block;
    min-width: 42px;
    padding: 2px 9px;
    border-radius: 7px;
    background: var(--mv-blue-soft);
    color: #1558B8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .03em;
  }
  .mv2-doc {
    font-weight: 800;
    color: var(--mv-navy-2);
    letter-spacing: .01em;
    text-decoration: none;
  }
  .mv2-doc:hover { color: var(--mv-blue); text-decoration: underline; }
  .mv2-subj {
    display: inline-flex;
    align-items: flex-start;
    gap: 7px;
    color: var(--mv-ink);
    font-weight: 600;
    text-decoration: none;
    transition: color .14s ease;
  }
  .mv2-subj > i {
    margin-top: 2px;
    font-size: 12px;
    color: #A9B6CA;
    transition: color .14s ease, transform .16s ease;
  }
  .mv2-subj:hover { color: var(--mv-blue); text-decoration: none; }
  .mv2-subj:hover > i { color: var(--mv-blue); transform: scale(1.12); }
  .mv2-sort {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 19px;
    height: 19px;
    margin-left: 4px;
    border-radius: 6px;
    background: #E7EDF7;
    color: var(--mv-ink-2);
    font-size: 9px;
    vertical-align: middle;
    text-decoration: none;
    transition: background .14s ease, color .14s ease;
  }
  .mv2-sort:hover { background: var(--mv-blue); color: #fff; }

  /* ── Empty + footer ── */
  .mv2-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;
    padding: 46px 16px;
    border: 1px dashed var(--mv-line-2);
    border-radius: 12px;
    background: var(--mv-field);
    color: var(--mv-muted);
    font-size: 13px;
    font-weight: 600;
  }
  .mv2-empty > i { font-size: 28px; opacity: .45; }
  .mv2-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 12px;
  }
  .mv2-foot__hint {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 11.5px;
    font-weight: 600;
    color: var(--mv-muted);
  }
  .mv2-foot__hint > i { font-size: 11px; color: var(--mv-blue); }

  @media (max-width: 767px) {
    .mv2-bar__act { width: 100%; }
    .mv2-btn--excel { flex: 1; justify-content: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .mv2-tab, .mv2-btn, .mv2-sort, .mv2-subj, .mv2-subj > i { transition: none; }
  }
</style>
