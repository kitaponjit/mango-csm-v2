<template>
  <div>
    <slot name="form-read"></slot>
    <slot name="form-field"></slot>
    <div class="row" v-if="allBtnShow">
      <div class="col-md-12">
        <div class="pull-right">
          <div class="form-group">
            <slot name="extraBtn"></slot>
            <button class="btn btn-sm btn-instagram" v-bind:disabled="btnExport.disabled" v-if="btnExport.show && ((menuRights || {}).isreadonly || 0) == 0" v-on:click="btnExportClick">
                <i class="fas fa-cloud-download-alt"></i> <span v-text="ui.export_excel || 'Export Document (Excel)'"></span>
              </button>
            <button class="btn btn-sm bg-olive" v-bind:disabled="btnImport.disabled" v-if="btnImport.show" v-on:click="btnImportClick">
              <i class="fas fa-cloud-upload-alt"></i> <span v-text="ui.import_excel || 'Import (Excel)'"></span>
            </button>
            <button class="btn btn-sm bg-olive" v-bind:disabled="btnImport_center.disabled" v-if="btnImport_center.show" v-on:click="btnImportClick_Center">
              <i class="fas fa-cloud-upload-alt"></i> <span v-text="ui.import_excel || 'Import (Excel)'"></span>
            </button>
            <button class="btn btn-sm btn-facebook" v-bind:disabled="btnRetrieve.disabled" v-if="btnRetrieve.show" v-on:click="btnRetrieveClick">
              <i class="fas fa-list"></i> <span v-text="ui.retrieve || 'Retrieve'"></span>
            </button>
            <button class="btn btn-sm btn-linkedin" v-bind:disabled="btnNew.disabled" v-if="btnNew.show && ((menuRights || {}).isreadonly || 0) == 0" v-on:click="btnNewClick">
              <i class="fas fa-plus"></i> <span v-text="ui.new || 'New'"></span>
            </button>
            <button class="btn btn-sm btn-success" v-bind:disabled="btnSave.disabled" v-if="btnSave.show && ((menuRights || {}).isreadonly || 0) == 0" v-on:click="btnSaveClick">
              <i class="fas fa-save"></i> <span v-text="ui.save || 'Save'"></span>
            </button>
            <button class="btn btn-sm btn-danger" v-bind:disabled="btnDelete.disabled" v-if="btnDelete.show && ((menuRights || {}).isreadonly || 0) == 0" v-on:click="btnDeleteClick">
              <i class="fas fa-trash"></i> <span v-text="ui.delete || 'Delete'"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <input type="file" ref="File" accept=".xls, .xlsx" v-show="false" />
    <slot name="form-detail"></slot>
    <loading-box ref="myLB"></loading-box>

  </div>
</template>

<script type="text/javascript">
import ExcelJS from 'exceljs'
import loadingBox from '../Center/loading-box.vue'
import { saveAs } from 'file-saver'

  export default {
    props : {
      exportSelect : {
        type: [String, "B"],
        required: false
      },
      exportUrl : {
        type : [String, ""],
      },
      exportSearch : {
        type : [Object, {}]
      },
      exportData_header : {
        type : [Array, []]
      },
      exportData : {
        type : [Array, []]
      },
      exportName : {
        type : [String, "Default_Template"],
      },
      exportFontHeader_Default : {
        type : [Object, {
          size : 16,
          bold : true
        }]
      },
      exportFill_default : {
        type : [Object, { 
          type: 'pattern', 
          pattern: 'none', 
          fgColor: { 
            argb: 'ffffffff' }, 
          bgColor: {
            argb:'00000000'
          } 
        }]
      }
    },
    components: {
      loadingBox,
    },
    data() {
      return {
        btnRetrieve: {
          show: false,
          disabled: false,
          click() { }
        },
        btnNew: {
          show: true,
          disabled: false,
          click() { }
        },
        btnSave: {
          show: false,
          disabled: false,
          click() { }
        },
        btnSaveAs: {
          show: false,
          disabled: false,
          click() { }
        },
        btnDelete: {
          show: false,
          disabled: false,
          click() { }
        },
        btnPrint: {
          show: false,
          disabled: false,
          click() { }
        },
        btnImport: {
          show: true,
          disabled: false,
          click() { }
        },
        btnImport_center: {
          show: false,
          disabled: false,
          click() { },
          url : ""
        },
        btnExport : {
          show : true,
          disabled : false
        },
        ui: window.ui,
        allBtnShow: true,
        footer_show: false,
        panel_func: false,
        menuRights: window.menuRight
      };
    },
    methods: {
      btnRetrieveClick() {
        this.btnRetrieve.click()
      },
      btnNewClick() {
        this.btnNew.click()
      },
      btnSaveClick() {
        this.btnSave.click()
      },
      btnSaveAsClick() {
        this.btnSaveAs.click()
      },
      btnDeleteClick() {
        this.btnDelete.click()
      },
      btnPrintClick() {
        this.btnPrint.click()
      },
      btnImportClick() {
        this.btnImport.click()
      },
      async btnImportClick_Center(){ 
        $(this.$refs.File).click();
      },
      async btnExportClick() {
        if (!await $msg.confirm(`Exporting data may take a long time if there is a large amount of data. Please confirm to proceed with the operation.`)) {
          return
        }
        this.$refs.myLB.show()
        let act = ""
        let rsp = []
        if(this.exportSelect == "B") {
          if($xt.isEmpty(this.exportUrl)) {
            $msg.alert('Warning', `URL not found. Please specify the destination URL.`, 'warning')
            return
          }
          act = this.exportUrl
          for (var key in this.exportSearch) {
            act += `&${key}=${encodeURIComponent(this.exportSearch[key])}`
          }
          rsp = await $xt.getServer(act)
          window.open(window.dataServer + `API/File/DownLoad?download=true&id=${rsp.data}`)
          
        } else {
          this.excelDefault_Exportjs()
        }
        this.$refs.myLB.hide()
      },
      async excelDefault_Exportjs(){
        const wb = new ExcelJS.Workbook()
        const ws = wb.addWorksheet()
        
        this.exportData_header.forEach( (x, idx) => {
          x.fill = x.fill ?? {} 
          x.alignment = x.alignment ?? {} 
          x.font = x.font ?? {} 
          ws.getRow(1).fill = !$xt.isObjectEmpty(x.fill) ? x.fill : this.exportFill_default
          ws.getRow(1).alignment = !$xt.isObjectEmpty(x.alignment) ? x.alignment : { vertical: 'middle', horizontal: 'center' }
          ws.getRow(1).font = !$xt.isObjectEmpty(x.font) ? x.font : { vertical: 'middle', horizontal: 'center' }
          ws.getRow(1).height = x.height ?? 30
          ws.getRow(1).width = x.width ?? 30

        })
        ws.columns = this.exportData_header
        ws.getRow(1).font = this.exportFontHeader_Default

        ws.columns.forEach((column) => {
          let maxLength = 0;

          if (column.header && column.header.length > maxLength) {
            maxLength = column.header.length;
          }

          column.eachCell({ includeEmpty: true }, (cell) => {
            if (cell.value && cell.value.toString().length > maxLength) {
              maxLength = cell.value.toString().length;
            }
          });

          column.width = maxLength + 2;
        });
        
        const rows = this.exportData
        ws.addRows(rows)
     

        const buf = await wb.xlsx.writeBuffer()
        saveAs(new Blob([buf]), `${this.exportName}.xlsx`)
      },
      addFile() {
        $(this.$refs.File).click();
      },
      async doUpload(f) {
        if($xt.isEmpty(this.btnImport_center.url)) {
          $msg.alert('Warning', `URL not found. Please specify the destination URL.`, 'warning')
          return
        }
        try {
          this.$refs.myLB.show()
          let act = this.btnImport_center.url
          let fd = new FormData();
          fd.append('file', f);
          let rsp = await $xt.postServerForm(act, fd);
          if (!rsp.success) {
            throw rsp.error
          }
          $notify.success(this.ui.alert_save_success)
          this.btnImport_center.click()
        } catch (ex) {
          $msg.alert("", ex.toString(), "danger");
        }
        finally {
          this.$refs.myLB.hide()
        }
      },
    },
    mounted(){
      this.$nextTick(() => {
        $(this.$refs.File).on('click', (e) => {
          e.target.value = null;
        });
        $(this.$refs.File).on('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            this.doUpload(e.target.files[0]);
          }
        });
      })
    }
  }

</script>
