<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="row">
          <div class="col-md-12">
            <div class="rpt-actions">
              <button type="button" class="rpt-act rpt-act--cond" @click="$refs.conditionModal.openModal()">
                <i class="fas fa-sliders-h"></i><span>{{ ui.erp_condition_report }}</span>
              </button>
              <!--<button class="btn btn-sm btn-dropbox" @click="print" v-bind:disabled="notPrint" v-if="((menuRights || {}).isprint || 0) == 0"><i class="fas fa-print"></i> Print Report</button>-->
              <button type="button" class="rpt-act rpt-act--excel" v-bind:disabled="notExport" @click="excel()" v-if="((menuRights || {}).issaveas || 0) == 0">
                <i class="fas fa-file-excel"></i><span>{{ ui.erp_save_to_excel }}</span>
              </button>
            </div>
          </div>
        </div>
        <div class="content-report" ref="report_content">
          <div class="box box-widget">
            <div class="box-body">
              <div class="section-to-print" ref="datatable">
                <h4 class="text-center font-extra" v-if="showTitle">{{title}}</h4>
                <template v-if="showCond">
                  <p class="rpt-extra-cond" v-if="extraCondText">{{extraCondText}}</p>
                  <div class="rpt-meta-bar">
                    <div class="rpt-meta-left">
                      <span class="rpt-chip">
                        <i class="far fa-calendar-alt"></i>
                        <em class="rpt-chip__k">{{gf_.Reported_Date||'Reported Date'}}</em>
                        <b class="rpt-chip__v">{{$date(reportedDate, 'DD/MM/YYYY')}}</b>
                      </span>
                      <span class="rpt-chip">
                        <i class="far fa-clock"></i>
                        <em class="rpt-chip__k">{{ ui.erp_time }}</em>
                        <b class="rpt-chip__v">{{$date(reportedDate, 'HH:mm:ss')}}</b>
                      </span>
                    </div>
                    <div class="rpt-meta-center" v-if="condText">
                      <span class="rpt-chip rpt-chip--filter">
                        <i class="fas fa-filter"></i>
                        <em class="rpt-chip__k">{{ui.erp_condition||'Condition'}}</em>
                        <b class="rpt-chip__v">{{condText}}</b>
                      </span>
                    </div>
                    <div class="rpt-meta-right"></div>
                  </div>
                </template>
                <slot name="display"></slot>
              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>

    <!-- Modal : Criteria -->
    <modal ref="conditionModal">
      <template #header>
        <div class="modal-header-icon">
          <i class="fas fa-filter"></i>
        </div>
        <h4 class="modal-title">{{ ui.erp_condition_report }} <span class="cond-title-badge" v-if="condData.length">{{ condData.length }}</span></h4>
      </template>
      <template #body>
        <div class="cond-modal-body">
          <!-- Extra Condition Slot -->
          <div class="cond-extra-section" v-if="$slots['extra-cond']">
            <slot name="extra-cond"></slot>
          </div>

          <!-- Info Banner -->
          <div class="cond-info-banner">
            <i class="fas fa-info-circle cond-info-ico"></i>
            <span>{{gf_.head1}}<strong>{{gf_.head2}}</strong>{{gf_.head3}}</span>
          </div>

          <!-- Condition Cards -->
          <div class="cond-list">
            <!-- Empty State -->
            <div v-if="condData.length == 0" class="cond-empty-state">
              <div class="cond-empty-visual">
                <i class="fas fa-filter"></i>
              </div>
              <p class="cond-empty-title">{{ ui.erp_no_condition_click_to_add }}</p>
              <p class="cond-empty-desc"><strong>+ {{ ui.re_add_condition }}</strong></p>
            </div>

            <!-- Condition Row Cards -->
            <div v-for="(x, idx) in condData" :key="x.itemno" class="cond-card">
              <div class="cond-card-number">{{ idx + 1 }}</div>
              <div class="cond-card-fields">
                <div class="cond-field cond-field-name">
                  <label class="cond-field-label">{{ ui.csm_remain_conditions }}</label>
                  <select class="form-control input-sm" v-model.trim="x['field_name']" v-on:change="addOption(x)" v-bind:disabled="x.not_remove || false">
                    <option value="" v-text="ui.re_pls_select || '- เลือกข้อมูล -'"></option>
                    <option v-for="z in condTemplate" v-bind:value="z.field_name" v-text="z.display_name"></option>
                  </select>
                </div>
                <div class="cond-field cond-field-op">
                  <label class="cond-field-label">{{gf_.Operation||'Operation'}}</label>
                  <select class="form-control input-sm" v-model.trim="x['operatorx']" v-bind:disabled="!x['field_name'] || x.option.operatorx_arr.length<2">
                    <option v-for="z in x.option.operatorx_arr || []" v-bind:value="z" v-text="z"></option>
                  </select>
                </div>
                <div class="cond-field cond-field-val">
                  <label class="cond-field-label">{{gf_.Value||'Value'}}</label>
                  <!-- Data Type : Array Select -->
                  <template v-if="(x.option.value_arr || []).length>0">
                    <select class="form-control input-sm" v-model.trim="x['value']" v-bind:disabled="!x['field_name']">
                      <option v-for="z in x.option.value_arr || []"
                              v-bind:value="z.value !== undefined ? z.value : z"
                              v-text="z.value !== undefined ? z.name : z">
                      </option>
                    </select>
                  </template>
                  <!-- Data Type : Text Search -->
                  <template v-else-if="x.option.func_name">
                    <div class="input-group input-group-sm">
                      <input type="text"
                             v-model.trim="x.display_value"
                             class="form-control input-sm"
                             v-bind:disabled="(x.operatorx == 'is null' || x.operatorx == 'is not null')"
                             @input="doKeyup(x)" />
                      <span class="input-group-btn">
                        <button class="btn btn-sm bg-navy" v-bind:disabled="(x.operatorx == 'is null' || x.operatorx == 'is not null')" v-on:click="doAction(x)"><i class="fa fa-search"></i></button>
                        <button class="btn btn-sm btn-danger" v-on:click="x.value = '';x.display_value = '';"><i class="fa fa-times"></i></button>
                      </span>
                    </div>
                  </template>
                  <!-- Data Type : Int -->
                  <template v-else-if="x.option.field_type==='int' || x.option.field_type==='decimal'">
                    <number v-model.number="x['value']" v-bind:decimals="x.option.field_type==='int'?'0':'4'" class="form-control input-sm" :disabled="(x.operatorx == 'is null' || x.operatorx == 'is not null')" v-bind:readonly="!x['field_name']"></number>
                  </template>
                  <!-- Data Type : Number -->
                  <template v-else-if="x.option.field_type === 'number'">
                    <i-input input-class="form-control input-sm" v-model.number="x['value']" :number-only="true" :disabled="(x.operatorx == 'is null' || x.operatorx == 'is not null')" v-bind:readonly="!x['field_name']" @keyup="x.display_value = x['value']"></i-input>
                  </template>
                  <!-- Data Type : Date -->
                  <template v-else-if="x.option.field_type==='date'">
                    <datepicker input-class="form-control input-sm" v-model="x.value" :disabled="(x.operatorx == 'is null' || x.operatorx == 'is not null')" v-bind:readonly="!x['field_name']"></datepicker>
                  </template>
                  <!-- Data Type : Text -->
                  <template v-else>
                    <input type="text" v-model="x['value']" class="form-control input-sm" v-bind:readonly="!x['field_name']" />
                  </template>
                </div>
                <div class="cond-field cond-field-multi" :class="{ 'is-off': idx >= condData.length - 1 }">
                  <label class="cond-field-label">{{gf_.Link_||'Link'}}</label>
                  <select class="form-control input-sm"
                          v-model="x.multiple_type"
                          :disabled="idx >= condData.length - 1"
                          :title="idx >= condData.length - 1 ? 'แถวสุดท้ายไม่ต้องเชื่อมเงื่อนไข' : ''">
                    <option value="and" v-text="ui.re_and || 'AND'"></option>
                    <option value="or" v-text="ui.re_or || 'OR'"></option>
                  </select>
                </div>
              </div>
              <div class="cond-card-action">
                <button class="btn-cond-delete" v-on:click="delCond(x)" v-bind:disabled="x.not_remove || false" :title="ui.erp_delete">
                  <i class="fa fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-sm btn-cond-add" v-on:click="addCond()"><i class="fas fa-plus"></i> <span v-text="ui.re_add_condition || 'เพิ่มเงื่อนไข'"></span></button>
        <button class="btn btn-sm btn-cond-submit" v-on:click="callData()"><i class="fas fa-database"></i> <span v-text="ui.re_retri_dataa || 'เรียกข้อมูล'"></span></button>
      </template>
    </modal>

  </div>
</template>

<script>
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } }
  let vue = {
    props: {
      extraCond: {
        type: Object
      },
      extraCond2: {
        type: Object
      },
      showTitle: {
        type: Boolean,
        default: true
      },
      showCond: {
        type: Boolean,
        default: true
      },
      rawData: {
        type: Array,
        default: () => []
      },
      rawName: {
        type: String,
        default: null
      },
      rawFileCache: {
        type: String,
        default: null
      },
      exportCenter: {
        type: Boolean,
        default: true
      },
      usePrintTemplate: {
        type: Boolean,
        default: false
      },
      notExport: {
        type: Boolean,
        default: false
      },
      printPDF: {
        type: Boolean,
        default: false
      },
      pdfLabel: {
        type: Array,
        default: () => []
      },
      pdfData: {
        type: Array,
        default:() => []
      },
      pdfFileName: {
        type: String,
        default: null
      },
      notPrint: {
        type: Boolean,
        default: false
      },
      onlyRawData: {
        type: Boolean,
        default: false
      },
    },
    data() {
      return {
        baseUrl,
        ui: window.ui,
        auth: window.auth,
        condData: [],
        dataUrl: '',
        selectedRow: {},
        title: '',
        reportedDate: new Date(),
        condTemplate: [],
        showPrint: true,
        state: {},
        condText: '',
        xt: $xt,
        menuRights: window.menuRight,
        renderExport: false,
        extraCondText: null,
        gf_: { Operation: '', Value: '', Link_: '', Reported_Date: '', head1: '', head2: '', head3: '' },
      }
    },
    methods: {
      setTitle(title) {
        this.title = title
        document.title = title
        page.pageTitle = title
      },
      setTemplate(tmp) {
        for (var x of tmp) {
          x.not_input = x?.not_input || false
        }
        this.condTemplate = tmp
      },
      setDefaultCond(cond) {
        let max = this.condData.length === 0 ? 0 : $linq(this.condData).max(x => x.itemno)
        $linq(cond).foreach(x => {
          let option = $linq(this.condTemplate).where(z => z.field_name === x.field_name).firstOrDefault() || {}
          x.itemno = ++max
          x.option = option
          x.operatorx = x.operatorx || option.operatorx_default
          x.value = $xt.isEmpty(x.value) ? option.value_default : x.value
          x.multiple_type = x.multiple_type || option.multiple_type || 'and'
          x.not_remove = x.not_remove
          x.not_input = x.not_input || false
        })
        this.condData = cond
      },
      async callData(change_page = false) {
        // if ($linq(this.condData).any(x => $xt.isEmpty(x.value))) {
          if ($linq(this.condData).any(x => $xt.isEmpty(x.value) && !(x.operatorx == 'is null' || x.operatorx == 'is not null'))) {
          $msg.alert(this.ui.csm_v2_warning, 'หากเลือกเงื่อนไขแล้วไม่สามารถใส่ค่าว่างได้', 'warning')
          return
        }
        //แจ้งเตือนเมื่อเลือก Area ก่อนเลือก Project
        let areacode = $linq(this.condData).where(x => x.option.display_name === 'Area Code').firstOrDefault()
        let areaname = $linq(this.condData).where(x => x.option.display_name === 'Area Name').firstOrDefault()
        let project = $linq(this.condData).where(x => x.option.display_name === 'Project').firstOrDefault()

        if ((areacode || areaname) && !project) {
          $msg.alert(this.ui.csm_v2_warning, 'กรุณาเลือก Project ก่อนระบุ Area', 'warning')
          return
        }
        
        $linq(this.condData).foreach(x => {
          x.field_type = x.option.field_type
          x.field_group = x.option.field_group
          x.multiple_type = x.multiple_type || x.option.multiple_type || 'and'
          x.display_value = ((x.option.value_arr || []).length > 0) ? ($linq(x.option.value_arr).where(z => z.value === x.value).select(z => z.name).firstOrDefault() || '') : (x.value || x.display_value)
          x.table_name = x.option.table_name
        })
        let reorder = $linq(this.condData).groupBy(x => x.field_name).select(x => x.values).toArray()
        let reorder_data = []
        $linq(reorder).foreach(x => {
          reorder_data = $linq(reorder_data).union(x).toArray()
        })
        this.condData = reorder_data

        let serialize = ''
        /* Extra Condition (Not Check Type) */
        if (Object.keys(this.extraCond || {}).length > 0) {
          let param = $linq(Object.keys(this.extraCond || {})).select(x => {
            return `${x}=${$xt.isEmpty(this.extraCond[x]) ? '' : this.extraCond[x]}`
          }).toArray()
          serialize = param.join('&')
        }

        /* Extra Condition (Check Type) */
        if (Object.keys(this.extraCond2 || {}).length > 0) {
          let param = $linq(Object.keys(this.extraCond2 || {})).select(x => {
            let type = this.extraCond2[x].type
            let value = type === 'date' ? moment(this.extraCond2[x].value).format(this.extraCond2[x].format || 'DD/MM/YYYY') : this.extraCond2[x].value

            if (change_page && (this.extraCond2[x].useDefault || false)) {
              return `${x}=${this.extraCond2[x].default}`
            }
            else {
              return `${x}=${$xt.isEmpty(value) ? '' : value}`
            }
          }).toArray()
          serialize = param.join('&')
        }

        /* Set Text Condition */
        let cond_text = ''
        this.condData.forEach((x, idx) => {
          cond_text += `${x.option.display_name} ${x.operatorx} ${this.displayCondValue(x)} `
          if (!$xt.isEmpty(this.condData[idx + 1])) {
            cond_text += `${x.option.multiple_type} `
          }
        })
        this.condText = cond_text

        page.loadingBox.show()
        try {
          let r1 = await $xt.postServerJson(this.dataUrl + '?' + serialize, this.condData)
          if (!r1.success) {
            throw r1.error
          }
          await this.$parent.setRptData(r1.data, JSON.parse(JSON.stringify(this.condData)))
          this.$refs.conditionModal.closeModal()
        } catch (ex) {
          $msg.alert(this.ui.erp_error, ex.toString(), 'danger')
        }
        page.loadingBox.hide()
      },
      addCond() {
        let max = this.condData.length === 0 ? 0 : $linq(this.condData).max(x => x.itemno)
        max++
        this.condData.push({ itemno: max, field_name: '', table_name: '', multiple_type: 'and', option: {} })
      },
      delCond(item) {
        this.condData = $linq(this.condData).where(x => !(x.itemno === item.itemno)).toArray()
        this.$emit('clearPreEvent')
      },
      addOption(x) {
        let option = $linq(this.condTemplate).where(z => z.field_name === x.field_name).firstOrDefault() || {}
        if (!option.multiple) {
          if (x.field_name && $linq(this.condData).where(z => z.field_name === x.field_name).count() > 1) {
            $alert('', `ไม่สามารถเลือก <b>${option.display_name}</b> มากกว่าหนึ่งครั้งได้`, 'danger')
            x.field_name = ''
            x.operatorx = ''
            x.value = ''
            x.display_value = ''
            x.option = {}
            return
          }
        }
        x.operatorx = option.operatorx_default
        x.value = option.value_default
        x.display_value = ''
        x.multiple_type = option.multiple_type || 'and'
        x.option = option
      },
      doAction(x) {
        this.selectedRow = x
        this.$parent[x.option.func_name]()
        // this.setCondText()
      },
      doKeyup(x) {
        // this.condData[0].value = x.display_value
        //map condData แต่ละฟิลด์ ให้เป็นค่าที่แสดงใน display_value
        this.condData = this.condData.map((item) => {
          if (item.field_name === x.field_name) {
            return { ...item, value: x.display_value }
          }
          return item
        })
      },
      setRowData(value, displayValue) {
        this.selectedRow.value = value
        this.selectedRow.display_value = displayValue
      },
      displayCondValue(x) {
        return x.option.field_type === 'date' ? this.$date(x.value, 'DD/MM/YYYY') : (x.display_value || x.value)
      },
      async excel() {
        /* Excel : Use Export Center */
        if (this.exportCenter) {
          if (!this.dataUrl && !this.usePrintTemplate) {
            this.$emit('export_excel', {})
            return
          }

          let format_excel = true
          
          if (this.rawData.length > 0 || !$xt.isEmpty(this.rawFileCache)) {
            if (this.onlyRawData === false) {
              // โหมดปกติ
              format_excel = await $msg.confirm('Yes : Save to Excel (Format Report) or No : Other (Raw Data)')
            } else {
              // โหมด onlyRawData
              const confirm = await $msg.confirm('Yes : Save to Excel (Raw Data) or No : Cancel')
              if (!confirm) return
              format_excel = false
            }
          }


          page.loadingBox.show()
          //  page.loadingBox.setText('ระบบกำลังจัดทำไฟล์เอกสาร Excel กรุณารอสักครู่..')
          $notify.success('ระบบกำลังจัดทำไฟล์เอกสาร Excel กรุณารอสักครู่..')
          try {
            if (format_excel) {
              if (this.printPDF) {
                await $xt.sleep(100)

                let col_width = $linq(this.pdfLabel[0]).select(s => s.width).toArray()

                let form = {
                  title: this.title,
                  routename: window.routeName,
                  menu_id: window.menuID,
                  menu_name: window.menuName,
                  cond_text: [],
                  header: this.pdfLabel,
                  col_width: col_width,
                  data: this.pdfData || []
                }
              

                if (this.$parent.createPdfData) {
                  form = this.$parent.createPdfData()
                  form.title = this.title
                  form.menu_id = window.menuID
                  form.menu_name = window.menuName
                  form.routename = window.routeName
                  form.cond_text = [window.auth?.mainname, this.extraCondText, this.condText]
                }

                let resp = await $xt.postServerJson('api/public/CreateExcel/', form, true)
                window.open(window.hostServer + resp.data)
              }
              else {
                /* Excel : Export Keep HTML */
                this.renderExport = true
                await $xt.sleep(500)
                let refs_html = this.usePrintTemplate ? this.$refs.datatable2 : this.$refs.datatable
                let ls_html = $(refs_html).html()
                await $xt.sleep(500)
                this.renderExport = false

                let f = {
                  html: ls_html
                }
                let r = await $xt.postServerJson('api/file/HtmlToXls/', f, true)
                window.open(window.hostServer + 'api/file/download?download=true&id=' + r)
              }
            }
            else {
              await $xt.export_rawdata_excel(this.rawData, this.rawName, (this.rawFileCache || ''))
            }
          }
          catch (ex) {
            $msg.alert(this.ui.erp_error, ex, 'danger')
          }
          finally {
            page.loadingBox.hide()
          }
        }
        /* Excel : Export in Page */
        else {
          this.$emit('export-methods', {})
        }
      },
        ch_lang() {
          switch (localStorage.getItem('user_lang') || 'TH') {
            case 'EN_MASTER':
              this.gf_.Operation = 'Operation';
              this.gf_.Value = 'Value';
              this.gf_.Link_ = 'Link';
              this.gf_.Reported_Date = 'Reported Date';
              this.gf_.head1 = "To get all the data, you don't need to add any condition";
              this.gf_.head2 = " just click Retrieve ";
              this.gf_.head3 = "right away.";
              break;

            case 'TH':
              this.gf_.Operation = 'ตัวดำเนินการ';
              this.gf_.Value = 'ค่า';
              this.gf_.Link_ = 'ตัวเชื่อม';
              this.gf_.Reported_Date = 'วันที่รายงาน';
              this.gf_.head1 = "หากต้องการข้อมูลทั้งหมด ไม่ต้องเพิ่มเงื่อนไข";
              this.gf_.head2 = " สามารถกด เรียกข้อมูล ";
              this.gf_.head3 = "ได้ทันที";
              break;

            case 'CN':
              this.gf_.Operation = '运算符';
              this.gf_.Value = '值';
              this.gf_.Link_ = '连接词';
              this.gf_.Reported_Date = '报表日期';
              this.gf_.head1 = "若需全部数据，无需添加条件，";
              this.gf_.head2 = "直接点击获取";
              this.gf_.head3 = "即可。";
              break;

            default:
              this.gf_.Operation = 'Operation';
              this.gf_.Value = 'Value';
              this.gf_.Link_ = 'Link';
              this.gf_.Reported_Date = 'Reported Date';
              this.gf_.head1 = "To get all the data, you don't need to add any condition";
              this.gf_.head2 = " just click Retrieve ";
              this.gf_.head3 = "right away.";
              break;
          }
        },
        // ลบลูกน้ำ (,) ด้านหลังออก ถ้าไม่ใช่ function ภายใน Object
      //async print() {
      //  if (!this.dataUrl && !this.usePrintTemplate) {
      //    this.$emit('export_html', {})
      //    return
      //  }
      //  if (this.usePrintWord) {
      //    this.$emit('print_word', {})
      //    return
      //  }
      //  try {
      //    if (this.printPDF) {
      //      await $xt.sleep(100)

      //      let table_border = false
      //      if (await $msg.confirm('คุณต้องการพิมพ์เอกสารแบบมีเส้นตารางหรือไม่ ( Yes : มีเส้นตาราง , No : ไม่มีเส้นตาราง )')) {
      //        table_border = true
      //      }
      //      else {
      //        table_border = false
      //      }

      //      let col_width = $linq(this.pdfLabel[0]).select(s => s.width).toArray()

      //      let form = {
      //        title: this.title,
      //        routename: window.routeName,
      //        menu_id: window.menuID,
      //        menu_name: window.menuName,
      //        cond_text: [],
      //        header: this.pdfLabel,
      //        col_width: col_width,
      //        data: this.pdfData || []
      //      }

      //      if (this.$parent.createPdfData) {
      //        form = this.$parent.createPdfData()
      //        form.title = window.auth?.mainname
      //        form.menu_id = window.menuID
      //        form.menu_name = window.menuName
      //        form.routename = window.routeName
      //        form.cond_text = [this.title, this.extraCondText, this.condText]
      //        form.table_border = table_border
      //        form.print_setup = this.printSetup
      //      }

      //      page.loadingBox.show()
      //      page.loadingBox.setText('ระบบกำลังประมวลผลสำหรับพิมพ์เอกสาร กรุณารอสักครู่..')

      //      let resp = await $xt.postServerJson('api/public/CreatePrintPdf/', form, true)
      //      window.open(window.hostServer + resp.data)
      //    }
      //    else {
      //      page.loadingBox.show()
      //      page.loadingBox.setText('ระบบกำลังประมวลผลสำหรับพิมพ์เอกสาร กรุณารอสักครู่..')

      //      /* Print : Preview Keep HTML */
      //      this.renderExport = true
      //      await $xt.sleep(500)
      //      let refs_html = this.usePrintTemplate ? this.$refs.datatable2 : this.$refs.datatable
      //      let ls_html = $(refs_html).html()
      //      await $xt.sleep(500)
      //      this.renderExport = false

      //      let stringHTML = ls_html
      //      let compress = LZString.compress(stringHTML)
      //      localStorage.setItem('html', compress)

      //      if (!$xt.isEmpty(this.pageLayout)) {
      //        this.printSetup.page_layout = this.pageLayout
      //      }

      //      let openUrl = ''
      //      if (this.printLandscape || this.printSetup.page_layout == '1') openUrl = 'page/report/v_rpt_print_landscape/'
      //      else openUrl = 'page/report/v_rpt_print/'

      //      window.open(baseUrl + openUrl, '_blank')
      //    }
      //  }
      //  catch (ex) {
      //    $msg.alert(this.ui.erp_error, ex, 'danger')
      //  }
      //  finally {
      //    this.renderExport = false
      //    page.loadingBox.hide()
      //  }
      //},
    },
    created() {
      this.ch_lang()
    },
    mounted() {

   
      page = this.$refs.page
      window.page = page

      window.addEventListener('message', e => {
        //printWindow.postMessage($(this.$refs.datatable).html(), "*")
        console.log("print request")
      }, false)


      $("#ReportBox").boxWidget()

      this.$refs.conditionModal.setSize("modal-xl")

      this.$refs.conditionModal.openModal()

      this.$nextTick(() => {
        $(window).resize(() => {
          let windowHeight = $(window).height()
          $(this.$refs.report_content).css({ "height": (windowHeight - 175) + "px" })
        })
        $(window).trigger('resize')
      })
    }
  }

  export default vue
</script>

<style scoped>

  .white-backgroud {
    background: #FFFFFF 0% 0% no-repeat padding-box;
    -webkit-box-shadow: 0px 5px 5px 0px rgba(227,218,227,1);
    -moz-box-shadow: 0px 5px 5px 0px rgba(227,218,227,1);
    box-shadow: 0px 5px 5px 0px rgba(227,218,227,1);
    opacity: 1;
  }

  .margin-btn-header {
    margin-bottom: 5px;
  }

  .rpt-extra-cond {
    text-align: center;
    font-weight: 700;
    font-size: 14px;
    color: #334155;
    margin: 2px 0 10px;
  }

  .rpt-meta-bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 8px 20px;
    padding: 10px 4px;
    margin-bottom: 14px;
  }

  .rpt-meta-left {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #475569;
  }

  .rpt-meta-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
    white-space: nowrap;
  }

  .rpt-meta-value {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 2px 8px;
    font-weight: 600;
    color: #0f172a;
  }

  .rpt-meta-sep {
    color: #cbd5e1;
  }

  .rpt-meta-center {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    white-space: nowrap;
    text-align: center;
  }

  .rpt-meta-right {
    min-width: 0;
  }

  .rpt-meta-ico {
    color: #64748b;
    font-size: 12px;
  }

  .content-report {
    overflow-x: hidden;
    overflow-y: auto;
  }

  /* ============================================================
   * CONDITION MODAL — Card-Based Modern UI
   * ============================================================ */

  .cond-modal-body {
    padding: 0;
  }

  /* Extra Condition Section (slot) */
  .cond-extra-section {
    padding: 0 0 12px 0;
    margin-bottom: 12px;
    border-bottom: 1px dashed #e2e8f0;
  }

  /* Info Banner — minimal inline style */
  .cond-info-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    font-size: 12.5px;
    color: #0c4a6e;
    line-height: 1.5;
  }

  .cond-info-ico {
    color: #0284c7;
    font-size: 14px;
    flex-shrink: 0;
  }

  /* Condition List Container */
  .cond-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 45vh;
    overflow-y: auto;
    padding-right: 4px;
  }

  /* ── Empty State ── */
  .cond-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 20px;
    text-align: center;
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    background: #fafbfc;
  }

  .cond-empty-visual {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    margin-bottom: 14px;
    font-size: 22px;
    color: #3b82f6;
  }

  .cond-empty-title {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin: 0 0 4px 0;
  }

  .cond-empty-desc {
    font-size: 12.5px;
    color: #94a3b8;
    margin: 0;
    line-height: 1.5;
  }

  /* ── Condition Card (each row) ── */
  .cond-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    background: #ffffff;
    border: 1px solid #e8ecf1;
    border-radius: 10px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .cond-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  /* Row Number Badge */
  .cond-card-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    min-width: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #02234e 0%, #0a3d7a 100%);
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    margin-top: 22px;
  }

  /* Fields Grid */
  .cond-card-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .cond-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .cond-field-name {
    flex: 2;
    min-width: 160px;
  }

  .cond-field-op {
    flex: 1.2;
    min-width: 120px;
  }

  .cond-field-val {
    flex: 2.5;
    min-width: 180px;
  }

  .cond-field-multi {
    flex: 0.8;
    min-width: 80px;
  }

  .cond-field-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin: 0;
    padding: 0;
  }

  /* Action (Delete) */
  .cond-card-action {
    display: flex;
    align-items: center;
    margin-top: 22px;
  }

  .btn-cond-delete {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 8px;
    background: #fff5f5;
    border: 1px solid #fed7d7;
    color: #e53e3e;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-cond-delete:hover {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #dc2626;
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.12);
    transform: scale(1.05);
  }

  .btn-cond-delete:disabled {
    background: #f9fafb;
    border-color: #e5e7eb;
    color: #d1d5db;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* ── Footer Buttons ── */
  .btn-cond-add {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 8px;
    background: #ffffff;
    border: 1.5px dashed #94a3b8;
    color: #475569;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .btn-cond-add:hover {
    background: #f8fafc;
    border-color: #3b82f6;
    color: #1e40af;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
  }

  .btn-cond-submit {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 24px;
    border-radius: 8px;
    background: linear-gradient(135deg, #02234e 0%, #0a3d7a 100%);
    border: none;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.2px;
    transition: all 0.2s ease;
    box-shadow: 0 3px 10px rgba(2, 35, 78, 0.25);
  }

  .btn-cond-submit:hover {
    background: linear-gradient(135deg, #0a3d7a 0%, #1e5bb5 100%);
    color: #ffffff;
    box-shadow: 0 5px 16px rgba(2, 35, 78, 0.35);
    transform: translateY(-1px);
  }

  .btn-cond-submit:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(2, 35, 78, 0.2);
  }
  /* ── Condition row : chain + states ── */
  .cond-card {
    position: relative;
    animation: condIn .32s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes condIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; }
  }
  .cond-card:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 28px;
    top: 100%;
    width: 2px;
    height: 10px;
    background: repeating-linear-gradient(180deg, #cbd5e1 0 3px, rgba(0, 0, 0, 0) 3px 6px);
  }
  .cond-card:focus-within {
    border-color: #9dbdf2;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, .10), 0 6px 16px -10px rgba(2, 35, 78, .55);
  }
  .cond-card-number {
    transition: background .18s ease, transform .18s ease, box-shadow .18s ease;
  }
  .cond-card:hover .cond-card-number,
  .cond-card:focus-within .cond-card-number {
    background: linear-gradient(135deg, #1a73e8 0%, #0a3d7a 100%);
    transform: scale(1.08);
    box-shadow: 0 6px 14px -8px rgba(26, 115, 232, .95);
  }
  .cond-card .form-control {
    transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
  }
  .cond-card .form-control:focus {
    border-color: #1a73e8 !important;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, .13) !important;
  }

  /* ── Link column : disabled on the last row ── */
  .cond-field-multi select[disabled] {
    background-color: #f3f6fa !important;
    border-style: dashed !important;
    border-color: #d8e0ea !important;
    color: #a3aebd !important;
    cursor: not-allowed;
    opacity: 1;
  }
  .cond-field-multi.is-off .cond-field-label { color: #aab4c3; }

  /* ── Title badge ── */
  .cond-title-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    margin-left: 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, .2);
    border: 1px solid rgba(255, 255, 255, .28);
    font-size: 11.5px;
    font-weight: 800;
    line-height: 1;
    vertical-align: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .cond-card { animation: none; }
    .cond-card-number, .cond-card .form-control { transition: none; }
  }

  /* ── Field controls : unified modern inputs ── */
  .cond-card .form-control {
    height: 38px;
    padding: 0 12px;
    border: 1.5px solid #DFE5EF;
    border-radius: 10px;
    background-color: #F8FAFD;
    font-family: 'Manrope', 'Sarabun', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #101A2B;
    box-shadow: none;
    transition: border-color .16s ease, background-color .16s ease, box-shadow .16s ease;
  }
  .cond-card .form-control::placeholder {
    font-weight: 500;
    color: #A9B4C4;
  }
  .cond-card .form-control:hover:not([disabled]):not([readonly]) {
    border-color: #C7D2E2;
    background-color: #FFFFFF;
  }
  .cond-card .form-control:focus {
    border-color: #1A73E8 !important;
    background-color: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, .14) !important;
  }
  .cond-card .form-control[disabled],
  .cond-card .form-control[readonly] {
    background-color: #F1F4F9 !important;
    border-color: #E1E7F0 !important;
    color: #9AA6B7 !important;
    cursor: not-allowed;
  }

  /* Select : custom chevron */
  .cond-card select.form-control {
    line-height: normal;
    padding-right: 34px;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 12px center !important;
    background-size: 11px !important;
    text-overflow: ellipsis;
  }
  .cond-card select.form-control[disabled] {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23b6c0cf' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") !important;
    cursor: not-allowed;
  }

  /* Number / i-input : keep digits right aligned but readable */
  .cond-card ::v-deep input.text-right,
  .cond-card input.text-right {
    text-align: right;
    letter-spacing: .02em;
    font-variant-numeric: tabular-nums;
  }

  /* Datepicker : see the dedicated block below */

  /* Search field group (lookup) */
  .cond-card .input-group { display: flex; width: 100%; }
  .cond-card .input-group > .form-control {
    flex: 1;
    min-width: 0;
    border-radius: 10px 0 0 10px !important;
  }
  .cond-card .input-group-btn {
    display: flex;
    width: auto;
    font-size: 0;
  }
  .cond-card .input-group-btn > .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    padding: 0 !important;
    border: 1.5px solid #DFE5EF !important;
    border-left: 0 !important;
    border-radius: 0 !important;
    font-size: 12px;
    transition: background-color .16s ease, color .16s ease;
  }
  .cond-card .input-group-btn > .btn:last-child { border-radius: 0 10px 10px 0 !important; }
  .cond-card .input-group-btn > .btn.bg-navy {
    background-color: #EAF1FC !important;
    color: #1558B8 !important;
  }
  .cond-card .input-group-btn > .btn.bg-navy:hover:not([disabled]) {
    background-color: #1A73E8 !important;
    color: #fff !important;
  }
  .cond-card .input-group-btn > .btn.btn-danger {
    background-color: #FDF0EE !important;
    color: #C0392B !important;
  }
  .cond-card .input-group-btn > .btn.btn-danger:hover:not([disabled]) {
    background-color: #E2574C !important;
    color: #fff !important;
  }
  .cond-card .input-group-btn > .btn[disabled] {
    background-color: #F1F4F9 !important;
    color: #A9B4C4 !important;
    cursor: not-allowed;
  }

  /* Field label */
  .cond-card .cond-field-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: 'Manrope', 'Sarabun', sans-serif;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: .07em;
    color: #7A879B;
  }
  .cond-card:focus-within .cond-field-label { color: #5B6B84; }

  /* ── Lookup buttons : force alignment over global .btn overrides ── */
  .cond-card .input-group,
  .cond-card .input-group-btn { align-items: stretch; }
  .cond-card .input-group-btn > .btn,
  .cond-card .input-group-sm > .input-group-btn > .btn {
    width: 38px !important;
    height: 38px !important;
    min-height: 38px !important;
    padding: 0 !important;
    margin: 0 !important;
    border: 1.5px solid #DFE5EF !important;
    border-left: 0 !important;
    border-radius: 0 !important;
    background-image: none !important;
    box-shadow: none !important;
    transform: none !important;
    font-size: 12px !important;
    line-height: 1 !important;
    flex: 0 0 38px;
  }
  .cond-card .input-group-btn > .btn + .btn {
    border-left: 1.5px solid #E9EEF6 !important;
  }
  .cond-card .input-group-btn > .btn:last-child {
    border-radius: 0 10px 10px 0 !important;
  }
  .cond-card .input-group-btn > .btn.bg-navy {
    background-color: #EAF1FC !important;
    color: #1558B8 !important;
  }
  .cond-card .input-group-btn > .btn.bg-navy:hover:not([disabled]),
  .cond-card .input-group-btn > .btn.bg-navy:focus:not([disabled]) {
    background-color: #1A73E8 !important;
    color: #FFFFFF !important;
  }
  .cond-card .input-group-btn > .btn.btn-danger {
    background-color: #FDF0EE !important;
    color: #C0392B !important;
  }
  .cond-card .input-group-btn > .btn.btn-danger:hover:not([disabled]),
  .cond-card .input-group-btn > .btn.btn-danger:focus:not([disabled]) {
    background-color: #E2574C !important;
    color: #FFFFFF !important;
  }
  .cond-card .input-group-btn > .btn[disabled] {
    background-color: #F1F4F9 !important;
    color: #AAB4C4 !important;
    cursor: not-allowed;
  }

  /* ── Datepicker : the vendor input-class prop REPLACES .mx-input, so target the element ── */
  .cond-card ::v-deep .mx-datepicker {
    display: block;
    width: 100% !important;
  }
  .cond-card ::v-deep .mx-input-wrapper {
    display: block;
    width: 100%;
    line-height: 0;
  }
  .cond-card ::v-deep .mx-datepicker input {
    width: 100%;
    height: 38px !important;
    line-height: normal !important;
    padding: 0 42px 0 12px !important;
    border: 1.5px solid #DFE5EF !important;
    border-radius: 10px !important;
    background-color: #F8FAFD !important;
    background-image: none !important;
    font-family: 'Manrope', 'Sarabun', sans-serif;
    font-size: 13px !important;
    font-weight: 600;
    color: #101A2B;
    letter-spacing: .03em;
    font-variant-numeric: tabular-nums;
    box-shadow: none !important;
    transition: border-color .16s ease, background-color .16s ease, box-shadow .16s ease;
  }
  .cond-card ::v-deep .mx-datepicker input::placeholder {
    color: #B7C1D0;
    letter-spacing: .12em;
    font-weight: 500;
  }
  .cond-card ::v-deep .mx-datepicker input:hover:not([disabled]) {
    border-color: #C7D2E2 !important;
    background-color: #FFFFFF !important;
  }
  .cond-card ::v-deep .mx-datepicker input:focus {
    border-color: #1A73E8 !important;
    background-color: #FFFFFF !important;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, .14) !important;
  }
  .cond-card ::v-deep .mx-datepicker input[disabled] {
    background-color: #F1F4F9 !important;
    border-color: #E1E7F0 !important;
    color: #9AA6B7 !important;
    cursor: not-allowed;
  }
  .cond-card ::v-deep .mx-icon-calendar,
  .cond-card ::v-deep .mx-icon-clear {
    top: 50% !important;
    right: 4px !important;
    transform: translateY(-50%) !important;
    width: 30px;
    height: 30px;
    display: flex !important;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #EAF1FC;
    color: #1558B8 !important;
    font-size: 13px !important;
    transition: background-color .16s ease, color .16s ease;
  }
  .cond-card ::v-deep .mx-input-wrapper:hover .mx-icon-calendar,
  .cond-card ::v-deep .mx-input-wrapper:hover .mx-icon-clear {
    background: #1A73E8;
    color: #FFFFFF !important;
  }
  .cond-card ::v-deep .mx-datepicker input[disabled] ~ .mx-icon-calendar,
  .cond-card ::v-deep .mx-datepicker input[disabled] ~ .mx-icon-clear {
    background: #EDF1F7;
    color: #A9B4C4 !important;
  }

  /* ── Header actions ── */
  .rpt-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
  }
  .rpt-act {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 16px;
    border: 1.5px solid transparent;
    border-radius: 10px;
    font-family: 'Manrope', 'Sarabun', sans-serif;
    font-size: 12.5px;
    font-weight: 800;
    letter-spacing: .01em;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color .16s ease, border-color .16s ease, color .16s ease, box-shadow .2s ease, transform .12s ease;
  }
  .rpt-act > i { font-size: 12px; }
  .rpt-act--cond {
    background: linear-gradient(135deg, #1A73E8 0%, #0A3D7A 100%);
    color: #fff;
    box-shadow: 0 8px 18px -10px rgba(10, 61, 122, .9);
  }
  .rpt-act--cond:hover:not([disabled]) {
    transform: translateY(-1px);
    box-shadow: 0 13px 24px -10px rgba(10, 61, 122, 1);
    color: #fff;
  }
  .rpt-act--excel {
    background-color: #EAF7EE;
    border-color: #BFE3CD;
    color: #0F7A43;
  }
  .rpt-act--excel:hover:not([disabled]) {
    background-color: #17A45C;
    border-color: transparent;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 12px 22px -10px rgba(15, 122, 67, .95);
  }
  .rpt-act:active:not([disabled]) { transform: translateY(0); }
  .rpt-act[disabled] {
    opacity: .45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* ── Report title ── */
  .section-to-print > h4.text-center {
    font-family: 'Manrope', 'Sarabun', sans-serif;
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -0.015em;
    color: #0E1B2E;
    margin: 6px 0 14px;
  }

  /* ── Meta chips ── */
  .rpt-meta-bar {
    padding: 0 2px 12px;
    margin-bottom: 14px;
    border-bottom: 1px solid #E7EBF2;
  }
  .rpt-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    max-width: 100%;
    padding: 5px 13px 5px 11px;
    border: 1px solid #E3E9F2;
    border-radius: 999px;
    background: linear-gradient(180deg, #FFFFFF, #F7F9FC);
    box-shadow: 0 1px 2px rgba(16, 26, 43, .04);
    font-family: 'Manrope', 'Sarabun', sans-serif;
    line-height: 1.5;
  }
  .rpt-chip > i {
    font-size: 11px;
    color: #94A3B8;
  }
  .rpt-chip__k {
    font-style: normal;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: #8A97AB;
  }
  .rpt-chip__v {
    font-size: 12.5px;
    font-weight: 800;
    color: #101A2B;
    font-variant-numeric: tabular-nums;
    white-space: normal;
    word-break: break-word;
  }
  .rpt-chip--filter {
    border-color: #C9DEFB;
    background: linear-gradient(180deg, #F4F9FF, #E9F1FE);
  }
  .rpt-chip--filter > i { color: #1A73E8; }
  .rpt-chip--filter .rpt-chip__k { color: #4A7BC0; }
  .rpt-chip--filter .rpt-chip__v { color: #123E7A; }
  .rpt-meta-center { white-space: normal; }

  @media (max-width: 991px) {
    .rpt-meta-bar {
      grid-template-columns: 1fr;
      justify-items: start;
    }
    .rpt-meta-center { justify-content: flex-start; }
    .rpt-actions .rpt-act { flex: 1 1 auto; justify-content: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .rpt-act { transition: none; }
  }

</style>
