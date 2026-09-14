<template>
  <div>
    <div class="row">
      <div class="col-md-6">
        <template v-if="showUploadFile">
          <!-- Dropzone File -->
          <div class="row">
            <div class="col-md-12">
              <vue-dropzone ref="vueDropzone" id="dropzone" :options="dropzoneOptions" :useCustomSlot="true" @vdropzone-file-added="uploadFiletoTemp">
                <div class="dropzone-custom-content">
                  <h3 class="dropzone-custom-title text-dark font-extra">Drop files here or click to upload.</h3>
                  <div class="text-gray font-extra">Upload up to 10 files</div>
                </div>
              </vue-dropzone>
            </div>
          </div>
          <h5 class="text-navy" v-show="loading"><i class="fas fa-spin fa-spinner"></i> ระบบกำลังทำการ Upload File ของท่านอยู่ กรุณารอสักครู่</h5>
        </template>
        <!-- Attach File Table -->
        <div class="row margin-t-10">
          <div class="col-md-12">
            <div class="table-responsive">
              <table class="table table-bordered table-striped table-hover">
                <thead>
                  <tr>
                    <th class="tf-2"></th>
                    <th class="tf-2">No.</th>
                    <th class="tf-2-5">Action</th>
                    <th class="tf-3-5">Document No.</th>
                    <th class="tf-3-5">Group Doc.</th>
                    <th class="tf-5">Description</th>
                    <th class="tf-3">CC Mail</th>
                    <th class="tf-4-5">File Name</th>
                    <th class="tf-3">Add By</th>
                    <th class="tf-3">Add Date</th>
                  </tr>
                </thead>
                <draggable v-model="attachFile" handle=".handle_attach" tag="tbody" @change="moveSortItemno()">
                  <tr v-for="(x,idx) in attachFile"
                      :key="x.itemno"
                      v-bind:class="{'table-selected':x.checked}"
                      @click="holdRow(attachFile, idx)">

                    <td align="center">
                      <i class="fa fa-align-justify pointer handle_attach"></i>
                    </td>
                    <td align="center">{{x.itemno}}.</td>
                    <td align="center" class="td-action">
                      <a class="text-aqua" href="#" @click.prevent="downloadFile(x)" download><v-icon name="download" class="v-icon-width"></v-icon></a>
                      <a class="text-danger" v-show="showUploadFile" href="#" @click.prevent="delFile(x)"><v-icon name="x" class="v-icon-width"></v-icon></a>
                    </td>
                    <td>{{x.pre_event}}</td>
                    <td><input type="text" class="form-control table" v-model="x.group_doc" @change="$emit('uploaded', attachFile)" v-bind:readonly="!showUploadFile" /></td>
                    <td><input type="text" class="form-control table" v-model="x.docdesc" @change="$emit('uploaded', attachFile)" v-bind:readonly="!showUploadFile" /></td>
                    <td align="center">
                      <div class="form-check form-check-custom form-check-solid form-switch form-switch-sm form-swtich-center">
                        <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="x.cc_mail" v-bind:class="{'disabled-click': !showUploadFile}" />
                      </div>
                    </td>
                    <td class="tf-4-5 nowrap-text"><a href="#" class="text-underline-hover text-primary" @click.prevent="sendShowFile(x)">{{x.docfilename}}</a></td>
                    <td align="center">{{x.adduser}}</td>
                    <td align="center">{{$date(x.add_dt)}}</td>

                  </tr>
                </draggable>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="box box-solid">
          <div class="box-body">
            <!-- Preview File -->
            <h4 class="text-center padding-t-10" style="margin-top: 2px; margin-bottom: 2px">Preview File (ตัวอย่างไฟล์)</h4>
            <hr />
            <!-- Panel Show File -->
            <div class="row">
              <div class="col-md-12">
                <div class="text-center padding-10">
                  <!-- Preview : Image -->
                  <template v-if="['png','jpeg','jpg'].includes(getFileExt(showFileName)) && showFile">
                    <img :src="createFilePath(showFilePath)" class="img-responsive" />
                  </template>
                  <!-- Preview : Office (Word, Excel, PPT) -->
                  <template v-if="['doc','docx','xls','xlsx','ppt','pptx'].includes(getFileExt(showFileName)) && showFile">
                    <VueDocPreview :url="createFilePath(showFilePath)" type="office"></VueDocPreview>
                  </template>
                  <!-- Preview : PDF -->
                  <template v-if="['pdf'].includes(getFileExt(showFileName)) && showFile">
                    <vue-pdf-app class="pdf-size" :pdf="createFilePath(showFilePath)" :config="config" theme="dark"></vue-pdf-app>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type='text/javascript'>
  import vue2Dropzone from 'vue2-dropzone'
  import 'vue2-dropzone/dist/vue2Dropzone.min.css'

  import VueDocPreview from 'vue-doc-preview'

  import draggable from 'vuedraggable'

  const getToolbarViewerRight = () => ({
    presentationMode: true,
    openFile: false,
    print: false,
    download: false,
    viewBookmark: false
  })

  const getToolbar = () => ({
    toolbarViewerRight: getToolbarViewerRight()
  })

  export default {
    props: {
      documentType: {
        type: String
      },
      showUploadFile: {
        type: Boolean,
        default: true
      },
      lineNo: {
        type: Number
      },
    },
    components: {
      vueDropzone: vue2Dropzone,
      VueDocPreview,
      draggable
    },
    data() {
      return {
        auth: window.auth,
        ui: window.ui,
        queryString,
        attachFile: [],
        listDocument: [],
        showFilePath: '',
        showFileName: '',
        showFilePath2: '',
        showFile: false,
        loading: false,
        dropzoneOptions: {
          url: `https://httpbin.org/post`,
          thumbnailWidth: 120,
          thumbnailHeight: 120,
          maxFilesize: 256,
          previewsContainer: false,
          addRemoveLinks: false
        },
        config: {
          toolbar: getToolbar()
        }
      }
    },
    methods: {
      async loadAttach(docno, list_docno = [], data = []) {
        if (data.length == 0)
        {
          let f = {
            list_docno: list_docno
          }
          let act = `Anywhere/Center/AttachFile?docno=${docno || ''}&doctype=${this.documentType || ''}&lineno=${this.lineNo || 0}`
          let resp = await $xt.postServerJson(act, f)

          $linq(resp.data).foreach(x => { x.checked = false })
          this.attachFile = resp.data || []
          this.showFileName = ''
          this.listDocument = list_docno || []
        }
        else
        {
          this.attachFile = data || []
        }

        this.$emit('uploaded', this.attachFile || [])
      },
      holdRow(arr, index) {
        $xt.isSeleted(arr, index)
      },
      async uploadFiletoTemp(f) {
        this.loading = true
        try {
          let form = new FormData()
          form.append('file', f)
          form.append('type', 'p')

          let act = `Anywhere/Center/FileUploadToTemp`
          let rsp = await $xt.postServerForm(act, form)
          if (!rsp.success) {
            throw rsp.error
          }

          let max = this.attachFile.length == 0 ? 1 : ($linq(this.attachFile).max(x => x.itemno) || 0) + 1
          this.attachFile.push({
            itemno: max,
            pathto: rsp.id,
            group_doc: this.documentType || null,
            docdesc: rsp.filename,
            docfilename: rsp.filename,
            cc_mail: 'N',
            adduser: this.auth.userid,
            add_dt: new Date
          })

          this.$refs.vueDropzone.removeAllFiles()
          this.$emit('uploaded', this.attachFile)
        }
        catch (ex) {
          $msg.alert(`เกิดข้อผิดพลาด`, ex.toString(), `danger`)
        }
        finally {
          this.loading = false
        }
      },
      getFileExt(f) {
        return f.split('.').pop().toLowerCase()
      },
      createFilePath(x) {
        return window.dataServer + 'Api/File/DownLoad?id=' + x
      },
      downloadFile(x) {
        let pathto = $xt.isEmpty(x.pathto) ? x.path_cloud : x.pathto
        if (this.queryString.mobile == 'Y') {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 'filename': x.docfilename, 'filepath': pathto, 'extension': x.extension }))
        }
        else {
          window.open(window.dataServer + `Api/File/DownLoad?id=${pathto}&download=true&filename=${x?.docfilename}&isAnywhere=true`, '_blank')
        }
      },
      delFile(x) {
        this.attachFile = $linq(this.attachFile).where(w => !(w.itemno == x.itemno)).toArray()
        this.$emit('uploaded', this.attachFile)
        this.showFile = false
      },
      async sendShowFile(x) {
        let pathto = $xt.isEmpty(x.pathto) ? x.path_cloud : x.pathto
        if (this.queryString.mobile == 'Y') {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 'filename': x.docfilename, 'filepath': pathto, 'extension': x.extension }))
        }
        else {
          this.showFile = false
          await $xt.sleep(200)
          this.showFilePath = pathto
          this.showFileName = x.docfilename
          this.showFile = true
        }
      },
      clearFile() {
        this.showFilePath = ''
        this.showFileName = ''
        this.attachFile = []
        this.$emit('uploaded', [])

        /* Remove All File (Show Upload Only) by KitaponJit. */
        if (this.showUploadFile) {
          this.$refs.vueDropzone.removeAllFiles()
        }
      },
      setDocumentDefault(detail) {
        let list_arr = []
        if (detail.length > 0) {
          let itemno = 1
          for (const item of detail) {
            list_arr.push({
              itemno: itemno++,
              pathto: item.pathto_hex,
              group_doc: item.group_doc,
              docdesc: item.docdesc,
              docfilename: item.docfilename,
              cc_mail: 'N',
              adduser: item.adduser || this.auth.userid,
              add_dt: item.add_dt || new Date
            })
          }
        }
        this.attachFile = list_arr
        this.$emit('uploaded', this.attachFile)
      },
      async moveSortItemno() {
        let i = 1
        this.attachFile.forEach(x => {
          x.itemno = i++
        })
        this.$emit('uploaded', this.attachFile)
      },
    }
  }
</script>

<style scoped>

  .background-file {
    background: #FFFFFF 0% 0% no-repeat padding-box;
    box-shadow: 0px 3px 6px #00000029;
    border-radius: 10px;
    opacity: 1;
  }

  .dropzone {
    padding: 1.5rem 1.75rem;
    text-align: center;
    cursor: pointer;
    border: 1px dashed #009ef7;
    background-color: #ecf8ff;
    border-radius: .475rem !important;
  }

  .dropzone-custom-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .dropzone-custom-title {
    margin-top: 0;
  }

  .pdf-size {
    width: 100%;
    height: 580px;
  }
</style>

<style>
  #pdfFileInput {
    display: none !important
  }
</style>
