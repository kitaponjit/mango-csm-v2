<template>
  <div class="import-data">
    <modal ref="importModal" id="importModal">

      <template #header>
        <div class="import-data__modal-header">
          <div class="import-data__modal-icon">
            <i class="fas fa-cloud-upload-alt"></i>
          </div>
          <h4 class="import-data__modal-title">Import Excel</h4>
        </div>
      </template>

      <template #body>
        <section class="import-data__hero">
          <div class="import-data__hero-copy">
            <span class="import-data__eyebrow">Excel Workflow</span>
            <h3 class="import-data__hero-title">Prepare your data in two quick steps</h3>
            <p class="import-data__hero-text">Match columns first, then validate rows in the preview grid before sending the import.</p>
          </div>
          <div class="import-data__hero-meta">
            <div class="import-data__meta-item">
              <span class="import-data__meta-label">Step 1</span>
              <strong class="import-data__meta-value">Mapping</strong>
            </div>
            <div class="import-data__meta-item">
              <span class="import-data__meta-label">Step 2</span>
              <strong class="import-data__meta-value">Review</strong>
            </div>
          </div>
        </section>

        <div class="box box-solid import-data__box" ref="boxInput">
          <div class="box-header with-border">
            <div class="import-data__section-heading">
              <span class="import-data__section-index">01</span>
              <div>
                <h4 class="box-title import-data__section-title">Step 1 : Map columns</h4>
                <p class="import-data__section-text">Configure how Excel columns match each field before importing the data.</p>
              </div>
            </div>
            <div class="box-tools pull-right">
              <button type="button" class="btn btn-box-tool import-data__collapse-btn" data-widget="collapse" aria-label="Toggle section">
                <i class="fa fa-chevron-down"></i>
              </button>
            </div>
          </div>
          <div class="box-body import-data__box-body">
            <div class="content-body import-data__mapping-body" ref="content">
              <slot name="body-import"></slot>
            </div>
          </div>
        </div>

        <div class="box box-solid import-data__box" ref="boxData">
          <div class="box-header with-border">
            <div class="import-data__section-heading">
              <span class="import-data__section-index">02</span>
              <div>
                <h4 class="box-title import-data__section-title">Step 2 : Review imported rows</h4>
                <p class="import-data__section-text">Reset defaults if needed, then inspect the preview table before confirming the import.</p>
              </div>
            </div>
            <div class="box-tools pull-right">
              <button type="button" class="btn btn-box-tool import-data__collapse-btn" data-widget="collapse" aria-label="Toggle section">
                <i class="fa fa-chevron-down"></i>
              </button>
            </div>
          </div>
          <div class="box-body import-data__box-body">
            <div class="row import-data__toolbar-row">
              <div class="col-md-6 margin-b-5 import-data__toolbar">
                <button class="btn btn-sm btn-tumblr" @click.prevent="defaultForm()"><i class="fas fa-undo"></i> Default Input</button>
                <button class="btn btn-sm btn-warning" @click.prevent="clearForm()"><i class="fas fa-times"></i> Clear Input</button>
              </div>
            </div>
            <div class="import-data__grid-shell">
              <ag-grid-vue class="ag-theme-alpine import-data__grid" :columnDefs="columnDefs" :rowData="dataDefault" :gridOptions="gridOptions" style="height: 500px"></ag-grid-vue>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="import-data__footer">
          <button class="btn btn-sm btn-success pull-left" @click.prevent="downloadTemplate" v-if="fileTemplate"><i class="fas fa-download"></i> Download Template (Excel)</button>
          <div class="import-data__footer-actions">
            <button class="btn btn-sm btn-tumblr" @click.prevent="$refs.File.click()"><i class="fas fa-cloud-upload-alt"></i> Upload Excel</button>
            <button class="btn btn-sm bg-olive" @click.prevent="sendImport" v-bind:disabled="dataDefault.length == 0"><i class="fas fa-file-import"></i> Import Excel</button>
          </div>
        </div>
      </template>

    </modal>

    <loading-box ref="myLB"></loading-box>
    <input type="file" ref="File" accept=".xls, .xlsx" style="display:none" />

  </div>
</template>

<script type="text/javascript">
  "use strict"
  import "ag-grid-community/styles/ag-grid.css"
  import "ag-grid-community/styles/ag-theme-alpine.css"
  import { AgGridVue } from 'ag-grid-vue3'

  import loadingBox from './loading-box.vue'

  let process = false

  class ColorCellEditor {
    init(params) {
      this.eInput = document.createElement('input')
      this.eInput.type = 'color'
      this.eInput.value = /^#[0-9a-fA-F]{6}$/.test(params.value) ? params.value : '#000000'
      this.eInput.style.width = '100%'
      this.eInput.style.height = '100%'
      this.eInput.style.border = 'none'
      this.eInput.style.padding = '0'
      this.eInput.style.cursor = 'pointer'
    }
    getGui() { return this.eInput }
    afterGuiAttached() { this.eInput.focus() }
    getValue() { return this.eInput.value }
    isPopup() { return false }
    destroy() { }
  }

  class DateCellEditor {
    init(params) {
      this.eInput = document.createElement('input')
      this.eInput.type = 'date'
      this.eInput.style.width = '100%'
      this.eInput.style.height = '100%'
      this.eInput.style.border = 'none'
      this.eInput.style.padding = '0 4px'

      // ค่าที่แสดงในตาราง (มาจาก Excel) เป็นรูปแบบ dd/MM/yyyy -> แปลงเป็น yyyy-MM-dd ให้ input[type=date] อ่านได้
      let val = params.value || ''
      let m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(val.trim())
      this.eInput.value = m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : ''
    }
    getGui() { return this.eInput }
    afterGuiAttached() { this.eInput.focus() }
    getValue() {
      // แปลงกลับจาก yyyy-MM-dd เป็น dd/MM/yyyy ให้ตรงกับรูปแบบเดิมในตาราง/ที่ backend รองรับ
      if (!this.eInput.value) return ''
      let [y, mo, d] = this.eInput.value.split('-')
      return `${d}/${mo}/${y}`
    }
    isPopup() { return false }
    destroy() { }
  }

  class NumberCellEditor {
    init(params) {
      this.eInput = document.createElement('input')
      this.eInput.type = 'text'
      this.eInput.inputMode = 'decimal'
      this.eInput.value = params.value != null ? params.value : ''
      this.eInput.style.width = '100%'
      this.eInput.style.height = '100%'
      this.eInput.style.border = 'none'
      this.eInput.style.padding = '0 4px'
      this.eInput.style.textAlign = 'right'
      this.eInput.addEventListener('keypress', (e) => {
        let charCode = e.which ? e.which : e.keyCode
        if (charCode !== 46 && (charCode < 48 || charCode > 57)) {
          e.preventDefault()
        }
      })
    }
    getGui() { return this.eInput }
    afterGuiAttached() { this.eInput.focus(); this.eInput.select() }
    getValue() { return this.eInput.value }
    isPopup() { return false }
    destroy() { }
  }

  export default {
    props: {
      fileTemplate: {
        type: String
      },
      clearInput: {
        type: Function,
        default: () => { }
      },
      defaultInput: {
        type: Function,
        default: () => { }
      },
      componentKey: {
        type: Number
      },
      editableColumns: {
        type: Array,
        default: () => []
      },
      colorColumns: {
        type: Array,
        default: () => []
      },
      dateColumns: {
        type: Array,
        default: () => []
      },
      numberColumns: {
        type: Array,
        default: () => []
      }
    },
    components: {
      loadingBox,
      AgGridVue
    },
    data() {
      return {
        ui: window.ui,
        dataDefault: [],
        columnDefs: [],
        rowData: [],
        gridOptions: {},
        renderKey: 0,
        file: {
          pathto: '',
          filename: ''
        }
      }
    },
    watch: {
      colorColumns() {
        this.initTable()
        if (this.gridOptions.api) this.refreshGridData()
      },
      editableColumns() {
        this.initTable()
        if (this.gridOptions.api) this.refreshGridData()
      },
      dateColumns() {
        this.initTable()
        if (this.gridOptions.api) this.refreshGridData()
      },
      numberColumns() {
        this.initTable()
        if (this.gridOptions.api) this.refreshGridData()
      }
    },
    methods: {

      openImport() {
        this.dataDefault = []
        this.$refs.importModal.openModal()

        if (this.defaultInput()) {
          this.defaultInput()
        }

        this.initTable()
        this.refreshGridData()

        $(this.$refs.boxInput).boxWidget()
        $(this.$refs.boxData).boxWidget()
      },
      closeImport() {
        this.$refs.importModal.closeModal()
      },
      async uploadTemplate(f) {
        this.dataDefault = []
        process = true
        try {
          this.loadingBox.show()
          let act = `Anywhere/Import/ImportExcel`
          let fd = new FormData()
          fd.append('file', f)
          let rsp = await $xt.postServerForm(act, fd)
          if (!rsp.success) throw rsp.error

          let itemno = 1
          rsp.data.data.forEach(f => { f.itemno = itemno++ })
          this.dataDefault = rsp.data.data
          this.file.pathto = rsp.data.filepath
          this.file.filename = rsp.data.filename

        }
        catch (ex) {
          $msg.alert("เกิดข้อผิดพลาด", `Import Excel : <span class='text-danger'>${ex}</span>`, "danger")
        }
        finally {
          process = false
          this.loadingBox.hide()
        }
      },
      async downloadTemplate() {
        let act = `Anywhere/Import/DownloadTemplateExcel?filename=${this.fileTemplate || ''}`
        let resp = await $xt.getServer(act)
        if (!resp.success) {
          $msg.alert("เกิดข้อผิดพลาด", resp.error, "danger")
          return
        }
        window.open(window.hostServer + `API/File/DownLoad?download=true&id=${resp.path}`)
      },
      async splice() {
        /* AG Grid : Remove Rows Data */
        await $xt.sleep(100)
        const selectedRows = this.gridOptions.api.getSelectedRows()
        this.gridOptions.api.applyTransaction({ remove: selectedRows })
        return
      },
      sendImport() {
        /* AG Grid : Get Rows Data */
        let rowData = []
        this.gridOptions.api.forEachNode((node) => {
          rowData.push(node.data)
        })

        if (rowData.length == 0) {
          $msg.alert('คำเตือน', 'ไม่พบรายการที่ต้องการ Import ข้อมูล กรุณาตรวจสอบข้อมูล', 'warning')
          return
        }

        this.$emit('send-import', rowData)
        this.$emit('send-import-file', this.file)
      },
      range(n) {
        var ordA = 'A'.charCodeAt(0)
        var ordZ = 'Z'.charCodeAt(0)
        var len = ordZ - ordA + 1

        var s = ''
        while (n >= 0) {
          s = String.fromCharCode(n % len + ordA) + s
          n = Math.floor(n / len) - 1
        }
        return s
      },
      excelColumn(n) {
        var result = []
        for (var i = 0; i <= n; i++) {
          result.push(this.range(i))
        }
        return result
      },
      clearForm() {
        if (this.clearInput()) {
          this.clearInput()
        }
      },
      defaultForm() {
        if (this.defaultInput()) {
          this.defaultInput()
        }
      },
      /* Methods : AG Grid */
      initTable() {
        let excel = this.excelColumn(120)
        let columnDefs = [
          {
            field: 'action', headerName: 'Action', width: 120, cellClass: 'text-center', pinned: 'left', lockPosition: false,
            cellRenderer: (params) => {
              return `<svg id="remove${params.data.itemno}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="v-icon-width icon icon-trash-2 text-danger pointer" style="margin-top: 7px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>`
            },
          },
          {
            headerName: 'No.', width: 80, cellClass: 'text-center', pinned: 'left', lockPosition: false,
            cellRenderer: (params) => {
              return `${params.node.rowIndex + 1}.`
            },
          },
        ]

        for (var i = 0; i < excel.length; i++) {
          let id = this.range(i)
          let colDef = {
            field: id,
            headerName: id,
            width: 200,
            lockPosition: false,
            editable: this.editableColumns.includes(id)
          }

          if (this.colorColumns.includes(id)) {
            colDef.cellRenderer = (params) => {
              let val = params.value || '#000000'
              let isColor = /^#[0-9a-fA-F]{6}$/.test(val)
              let swatch = isColor ? `<span style="display:inline-block;width:14px;height:14px;border-radius:3px;border:1px solid #ccc;vertical-align:middle;margin-right:6px;background-color:${val};"></span>` : ''
              return `${swatch}${val}`
            }
            if (colDef.editable) {
              colDef.cellEditor = ColorCellEditor
            }
          }

          if (this.dateColumns.includes(id) && colDef.editable) {
            colDef.cellEditor = DateCellEditor
          }

          if (this.numberColumns.includes(id)) {
            colDef.cellStyle = { textAlign: 'right' }
            if (colDef.editable) {
              colDef.cellEditor = NumberCellEditor
            }
          }

          columnDefs.push(colDef)
        }

        this.columnDefs = columnDefs
      },
      refreshGridData() {
        this.gridOptions.api.setRowData(this.dataDefault)
      },
      initCellClick(params) {
        let ref = this
        let field = params.colDef.field
        switch (field) {
          case 'action':
            var deleteBtn = document.getElementById(`remove${params.data.itemno}`)
            deleteBtn.onclick = (event) => {
              event.preventDefault()
              ref.splice()
            }
            break
        }
      }
    },
    beforeMount() {
      this.gridOptions = {
        defaultColDef: {
          minWidth: 100,
          filter: false,
          resizable: true,
          floatingFilter: false
        },
        headerHeight: 35,
        rowHeight: 35,
        onCellMouseOver: this.initCellClick,
        rowSelection: 'single',
      }
    },
    mounted() {
      this.loadingBox = this.$refs.myLB

      this.$refs.importModal.setSize('modal-xl')

      this.$nextTick(() => {
        $(this.$refs.File).on('click', (e) => {
          e.target.value = null
        })

        $(this.$refs.File).on('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            this.uploadTemplate(e.target.files[0])
          }
        })

        $(window).resize(() => {
          let windowHeight = $(window).height()
          $(this.$refs.content).css({ "max-height": parseInt(windowHeight - 520) + "px" })
        })
        $(window).trigger('resize')
      })
    }
  }
</script>

<style scoped>
  .import-data {
    color: #1f2937;
  }

  .import-data__modal-header {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 45px;
  }

  .import-data__modal-icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #3c8dbc, #2d6f97);
    color: #fff;
    box-shadow: 0 8px 18px rgba(60, 141, 188, 0.2);
    font-size: 16px;
    flex-shrink: 0;
  }

  .import-data__modal-title {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 0.01em;
    line-height: 1;
    color: #ffffff;
  }

  .import-data__hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
    margin-bottom: 12px;
    border-radius: 12px;
    background:
      linear-gradient(135deg, rgba(60, 141, 188, 0.09), rgba(255, 255, 255, 0.97)),
      linear-gradient(90deg, #f7fafc, #eef5fb);
    border: 1px solid rgba(60, 141, 188, 0.12);
  }

  .import-data__eyebrow {
    display: inline-block;
    margin-bottom: 5px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #3c8dbc;
  }

  .import-data__hero-title {
    margin: 0;
    font-size: 16px;
    line-height: 1.3;
    font-weight: 600;
    color: #163247;
  }

  .import-data__hero-text {
    max-width: 560px;
    margin: 4px 0 0;
    color: #4b5563;
    font-size: 12px;
    line-height: 1.55;
  }

  .import-data__hero-meta {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .import-data__meta-item {
    min-width: 90px;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid rgba(60, 141, 188, 0.12);
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.05);
  }

  .import-data__meta-label {
    display: block;
    margin-bottom: 3px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
  }

  .import-data__meta-value {
    font-size: 13px;
    font-weight: 600;
    color: #163247;
  }

  .import-data__box {
    margin-bottom: 14px;
    border: 1px solid #e6edf3;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  }

  .import-data__box :deep(.box-header) {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 14px 16px 12px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), #f8fbfd);
    border-bottom: 1px solid #e9f0f6;
  }

  .import-data__box-body {
    padding: 14px 16px 16px;
    background: #fcfdff;
  }

  .import-data__section-heading {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding-right: 10px;
  }

  .import-data__section-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: #3c8dbc;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 8px 18px rgba(60, 141, 188, 0.2);
  }

  .import-data__section-title {
    margin: 0;
    color: #163247;
    font-size: 15px;
    font-weight: 600;
  }

  .import-data__section-text {
    margin: 4px 0 0;
    font-size: 11.5px;
    line-height: 1.55;
    color: #6b7280;
  }

  .import-data__mapping-body {
    padding: 2px 6px 0 2px;
  }

  .import-data__mapping-body :deep(.row) {
    margin-bottom: 10px;
  }

  .import-data__mapping-body :deep(.row:last-child) {
    margin-bottom: 0;
  }

  .import-data__mapping-body :deep([class*="col-"]) {
    margin-bottom: 8px;
  }

  .import-data__mapping-body :deep(label) {
    display: inline-block;
    margin-bottom: 6px;
    color: #4b5563 !important;
    font-size: 12.5px;
    font-weight: 500;
  }

  .import-data__mapping-body :deep(.form-control),
  .import-data__mapping-body :deep(.select2-container--bootstrap .select2-selection),
  .import-data__mapping-body :deep(.select2-selection--single),
  .import-data__mapping-body :deep(input[type="text"]),
  .import-data__mapping-body :deep(select) {
    border-radius: 8px !important;
    border-color: #d7e2ec !important;
    box-shadow: none !important;
    min-height: 32px;
  }

  .import-data__mapping-body :deep(.form-control:focus),
  .import-data__mapping-body :deep(input[type="text"]:focus),
  .import-data__mapping-body :deep(select:focus) {
    border-color: #7fb5d6 !important;
    box-shadow: 0 0 0 3px rgba(60, 141, 188, 0.12) !important;
  }

  .import-data__collapse-btn {
    width: 30px;
    height: 30px;
    padding: 0 !important;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    border-radius: 9px !important;
    background: #ffffff !important;
    border: 1px solid #dbe5ee !important;
    color: #425466 !important;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06) !important;
  }

  .import-data__collapse-btn i {
    font-size: 13px;
    transition: transform 0.16s ease, color 0.16s ease;
  }

  .import-data__box.collapsed-box .import-data__collapse-btn i {
    transform: rotate(-180deg);
  }

  .import-data__collapse-btn:hover,
  .import-data__collapse-btn:focus {
    background: #f6fbff !important;
    border-color: #b9d3e5 !important;
    color: #3c8dbc !important;
  }

  .import-data__collapse-btn:hover i,
  .import-data__collapse-btn:focus i {
    transform: translateY(1px);
  }

  .import-data__toolbar-row {
    margin-bottom: 12px;
  }

  .import-data__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .import-data__grid-shell {
    padding: 8px;
    border-radius: 12px;
    background: linear-gradient(180deg, #f7fafc, #eef4f8);
    border: 1px solid #e3ebf3;
  }

  .import-data__grid {
    border-radius: 10px;
    overflow: hidden;
    box-shadow: inset 0 0 0 1px rgba(60, 141, 188, 0.08);
  }

  .import-data__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
  }

  .import-data__footer-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  .import-data :deep(.modal-header),
  .import-data :deep(.modal-title) {
    color: #ffffff !important;
  }

  .import-data :deep(.modal-header .close) {
    color: rgba(255, 255, 255, 0.85) !important;
  }

  @media (max-width: 991px) {
    .import-data__hero {
      flex-direction: column;
      align-items: stretch;
    }

    .import-data__hero-meta {
      width: 100%;
    }

    .import-data__meta-item {
      flex: 1 1 0;
    }

    .import-data__footer {
      flex-direction: column;
      align-items: stretch;
    }

    .import-data__footer-actions {
      justify-content: flex-start;
    }
  }

  @media (max-width: 767px) {
    .import-data__hero {
      padding: 12px 14px;
    }

    .import-data__hero-title {
      font-size: 15px;
    }

    .import-data__box :deep(.box-header),
    .import-data__box-body {
      padding-left: 14px;
      padding-right: 14px;
    }

    .import-data__hero-meta {
      flex-direction: column;
    }
  }
</style>
