<template>
  <div class="file-manager-wrapper">
    <div class="file-manager-grid">
      <!-- Left Section -->
      <div class="left-section">
        <!-- Upload Area -->
        <template v-if="showUploadFile">
          <vue-dropzone ref="vueDropzone" id="dropzone" :options="dropzoneOptions" :useCustomSlot="true" @vdropzone-file-added="uploadFiletoTemp" class="upload-dropzone">
            <div class="dropzone-inner">
              <div class="upload-icon-container">
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <h3 class="upload-title">วางไฟล์ที่นี่ หรือคลิกเพื่ออัพโหลด</h3>
              <p class="upload-subtitle">รองรับไฟล์สูงสุด 10 ไฟล์</p>
            </div>
          </vue-dropzone>
          
          <transition name="fade">
            <div v-show="loading" class="upload-progress">
              <div class="progress-spinner"></div>
              <span>กำลังอัพโหลดไฟล์ของคุณ...</span>
            </div>
          </transition>
        </template>

        <!-- File List Table -->
        <div class="table-card">
          <div class="table-header">
            <h3 class="table-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
              แนบไฟล์ / ไฟล์วิดีโอ
            </h3>
          </div>
          
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th width="40"></th>
                  <th width="60">No.</th>
                  <th width="90">Action</th>
                  <th width="130">Document No.</th>
                  <th width="130">Group Doc.</th>
                  <th>Description</th>
                  <th width="80">CC Mail</th>
                  <th width="200">File Name</th>
                  <th width="100">Add By</th>
                  <th width="120">Add Date</th>
                </tr>
              </thead>
              <draggable v-model="attachFile" handle=".drag-handle" tag="tbody" @change="moveSortItemno()">
                <tr v-for="(x,idx) in attachFile" :key="x.itemno" :class="{'row-selected':x.checked}" @click="holdRow(attachFile, idx)">
                  <td class="drag-cell">
                    <div class="drag-handle">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                      </svg>
                    </div>
                  </td>
                  <td class="text-center">
                    <span class="row-number">{{x.itemno}}</span>
                  </td>
                  <td class="action-cell">
                    <button class="btn-action btn-download" @click.stop="downloadFile(x)" title="ดาวน์โหลด">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                    <button v-show="showUploadFile" class="btn-action btn-delete" @click.stop="delFile(x)" title="ลบ">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                  <td>
                    <span class="doc-badge">{{x.pre_event}}</span>
                  </td>
                  <td>
                    <input type="text" class="input-field" v-model="x.group_doc" @change="$emit('uploaded', attachFile)" :readonly="!showUploadFile" placeholder="กลุ่มเอกสาร" />
                  </td>
                  <td>
                    <input type="text" class="input-field" v-model="x.docdesc" @change="$emit('uploaded', attachFile)" :readonly="!showUploadFile" placeholder="รายละเอียด" />
                  </td>
                  <td class="text-center">
                    <label class="switch">
                      <input type="checkbox" true-value="Y" false-value="N" v-model="x.cc_mail" :disabled="!showUploadFile" />
                      <span class="slider"></span>
                    </label>
                  </td>
                  <td>
                    <button class="file-link-btn" @click.prevent="sendShowFile(x)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                      </svg>
                      <span class="filename-text">{{x.docfilename}}</span>
                    </button>
                  </td>
                  <td class="text-center">
                    <span class="user-tag">{{x.adduser}}</span>
                  </td>
                  <td class="text-center">
                    <span class="date-text">{{$date(x.add_dt)}}</span>
                  </td>
                </tr>
              </draggable>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Section - Preview -->
      <div class="right-section">
        <div class="preview-card">
          <div class="preview-header">
            <h3 class="preview-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Preview File (ตัวอย่างไฟล์)
            </h3>
          </div>

          <div class="preview-body">
            <template v-if="showFile">
              <!-- Image -->
              <template v-if="['png','jpeg','jpg'].includes(getFileExt(showFileName))">
                <div class="image-container">
                  <img :src="createFilePath(showFilePath)" alt="Preview" />
                </div>
              </template>
              
              <!-- Office Docs -->
              <template v-if="['doc','docx','xls','xlsx','ppt','pptx'].includes(getFileExt(showFileName))">
                <VueDocPreview :url="createFilePath(showFilePath)" type="office" class="office-preview"></VueDocPreview>
              </template>
              
              <!-- PDF -->
              <template v-if="['pdf'].includes(getFileExt(showFileName))">
                <vue-pdf-app class="pdf-viewer" :pdf="createFilePath(showFilePath)" :config="config" theme="dark"></vue-pdf-app>
              </template>
            </template>
            
            <!-- Empty State -->
            <div v-else class="empty-preview">
              <div class="empty-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
              </div>
              <p class="empty-text">เลือกไฟล์เพื่อดูตัวอย่าง</p>
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
        let isReactNativeDown = window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function';
        if (isReactNativeDown) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 'filename': x.docfilename, 'filepath': pathto, 'extension': x.extension }))
        }
        else {
          window.open(window.dataServer + `Api/File/DownLoad?id=${pathto}&download=true&filename=${x?.docfilename}&isAnywhere=true`, '_blank')
        }
      },
      delFile(x) {
        this.attachFile = $linq(this.attachFile).where(w => !(w.itemno == x.itemno)).toArray()
        this.$emit('uploaded', this.attachFile)
        this.moveSortItemno()
        this.showFile = false
      },
      async sendShowFile(x) {
        let pathto = $xt.isEmpty(x.pathto) ? x.path_cloud : x.pathto
        let isReactNative = window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function';
        if (isReactNative) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 'filename': x.docfilename, 'filepath': pathto, 'extension': x.extension }))
        }
        else {
          this.showFile = false
          await $xt.sleep(200)
          this.$set(this, 'showFilePath', pathto)
          this.$set(this, 'showFileName', x.docfilename)
          this.showFile = true
        }
      },
      clearFile() {
        this.$set(this, 'showFilePath', '')
        this.$set(this, 'showFileName', '')
        this.$set(this, 'attachFile', [])
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
              path_cloud: item.path_cloud,
              group_doc: item.group_doc,
              docdesc: item.docdesc,
              docfilename: item.docfilename,
              cc_mail: 'N',
              adduser: item.adduser || this.auth.userid,
              add_dt: item.add_dt || new Date,
              extension: item.extension
            })
          }
        }
        this.$set(this, 'attachFile', list_arr)
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
* {
  box-sizing: border-box;
}

.file-manager-wrapper {
  /* padding: 24px; */
  /* background: #f5f7fa; */
  /* min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; */
}

.file-manager-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  gap: 24px;
  align-items: start;
}

@media (max-width: 1400px) {
  .file-manager-grid {
    grid-template-columns: 1fr;
  }
}

/* Left Section */
.left-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Upload Dropzone */
.upload-dropzone {
  background: white;
  border: 2px dashed #3b82f6;
  border-radius: 12px;
  /* padding: 48px 32px; */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.upload-dropzone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-dropzone:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
}

.upload-dropzone:hover::before {
  opacity: 1;
}

.upload-dropzone >>> .dz-message {
  margin: 1em 0;
}

.dropzone-inner {
  position: relative;
  z-index: 1;
  text-align: center;
}

.upload-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 16px;
  margin-bottom: 12px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.upload-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.upload-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.upload-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* Upload Progress */
.upload-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
}

.progress-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-header {
  padding: 20px 24px;
  background: linear-gradient(to right, #f8fafc, #ffffff);
  border-bottom: 1px solid #e2e8f0;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}

.table-title svg {
  color: #3b82f6;
}

/* Data Table */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 14px 12px;
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.data-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.data-table tbody tr.row-selected {
  background: #dbeafe;
}

.data-table tbody td {
  padding: 12px;
  vertical-align: middle;
}

.text-center {
  text-align: center;
}

/* Drag Handle */
.drag-cell {
  cursor: move;
}

.drag-handle {
  display: inline-flex;
  color: #cbd5e1;
  transition: color 0.2s ease;
}

.drag-handle:hover {
  color: #3b82f6;
}

/* Row Number */
.row-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
}

/* Action Buttons */
.action-cell {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.btn-download {
  color: #3b82f6;
}

.btn-download:hover {
  background: #dbeafe;
}

.btn-delete {
  color: #ef4444;
}

.btn-delete:hover {
  background: #fee2e2;
}

/* Doc Badge */
.doc-badge {
  display: inline-block;
  padding: 5px 12px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

/* Input Field */
.input-field {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 7px 12px;
  font-size: 13px;
  transition: all 0.2s ease;
  background: white;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field:read-only {
  background: #f8fafc;
  border-color: #e2e8f0;
  cursor: not-allowed;
  color: #64748b;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  background: #cbd5e1;
  border-radius: 24px;
  transition: all 0.3s ease;
}

.slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider {
  background: #3b82f6;
}

.switch input:checked + .slider::before {
  transform: translateX(20px);
}

.switch input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* File Link Button */
.file-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  max-width: 100%;
  text-align: left;
}

.file-link-btn:hover {
  background: #dbeafe;
}

.filename-text {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* User Tag */
.user-tag {
  display: inline-block;
  padding: 5px 12px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

/* Date Text */
.date-text {
  color: #000000;
  font-size: 13px;
}

/* Right Section - Preview */
.right-section {
  position: sticky;
  top: 24px;
}

.preview-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.preview-header {
  padding: 20px 24px;
  background: linear-gradient(to right, #f8fafc, #ffffff);
  border-bottom: 1px solid #e2e8f0;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}

.preview-title svg {
  color: #3b82f6;
}

.preview-body {
  padding: 24px;
  background: #f8fafc;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Image Preview */
.image-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container img {
  max-width: 100%;
  max-height: 650px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Office & PDF Preview */
.office-preview,
.pdf-viewer {
  width: 100%;
  height: 650px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.doc-badge {
  display: inline-block;
  padding: 5px 12px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

/* Input Field */
.input-field {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 7px 12px;
  font-size: 13px;
  transition: all 0.2s ease;
  background: white;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field:read-only {
  background: #f8fafc;
  border-color: #e2e8f0;
  cursor: not-allowed;
  color: #64748b;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  background: #cbd5e1;
  border-radius: 24px;
  transition: all 0.3s ease;
}

.slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider {
  background: #3b82f6;
}

.switch input:checked + .slider::before {
  transform: translateX(20px);
}

.switch input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* File Link Button */
.file-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  max-width: 100%;
  text-align: left;
}

.file-link-btn:hover {
  background: #dbeafe;
}

.filename-text {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* User Tag */
.user-tag {
  display: inline-block;
  padding: 5px 12px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

/* Date Text */
.date-text {
  color: #000000;
  font-size: 13px;
}

/* Right Section - Preview */
.right-section {
  position: sticky;
  top: 24px;
}

.preview-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.preview-header {
  padding: 20px 24px;
  background: linear-gradient(to right, #f8fafc, #ffffff);
  border-bottom: 1px solid #e2e8f0;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}

.preview-title svg {
  color: #3b82f6;
}

.preview-body {
  padding: 24px;
  background: #f8fafc;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Image Preview */
.image-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container img {
  max-width: 100%;
  max-height: 650px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Office & PDF Preview */
.office-preview,
.pdf-viewer {
  width: 100%;
  height: 650px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Empty State */
.empty-preview {
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
}

/* Input Field */
.input-field {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 7px 12px;
  font-size: 13px;
  transition: all 0.2s ease;
  background: white;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field:read-only {
  background: #f8fafc;
  border-color: #e2e8f0;
  cursor: not-allowed;
  color: #64748b;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  background: #cbd5e1;
  border-radius: 24px;
  transition: all 0.3s ease;
}

.slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider {
  background: #3b82f6;
}

.switch input:checked + .slider::before {
  transform: translateX(20px);
}

.switch input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* File Link Button */
.file-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  max-width: 100%;
  text-align: left;
}

.file-link-btn:hover {
  background: #dbeafe;
}

.filename-text {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* User Tag */
.user-tag {
  display: inline-block;
  padding: 5px 12px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

/* Date Text */
.date-text {
  color: #000000;
  font-size: 13px;
}

/* Right Section - Preview */
.right-section {
  position: sticky;
  top: 24px;
}

.preview-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.preview-header {
  padding: 20px 24px;
  background: linear-gradient(to right, #f8fafc, #ffffff);
  border-bottom: 1px solid #e2e8f0;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}

.preview-title svg {
  color: #3b82f6;
}

.preview-body {
  padding: 24px;
  background: #f8fafc;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Image Preview */
.image-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container img {
  max-width: 100%;
  max-height: 650px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Office & PDF Preview */
.office-preview,
.pdf-viewer {
  width: 100%;
  height: 650px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Empty State */
.empty-preview {
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-icon svg {
  color: #cbd5e1;
}

.empty-text {
  margin: 0;
  font-size: 15px;
  color: #94a3b8;
}

/* ── Dark Mode ── */
body.dark-mode .upload-dropzone {
  background: #1e2a3a;
  border-color: #2d4057;
}
body.dark-mode .upload-dropzone:hover {
  border-color: #38bdf8;
  background: #152030;
}
body.dark-mode .upload-title {
  color: #c9d1d9;
}
body.dark-mode .upload-subtitle {
  color: #8b949e;
}
body.dark-mode .upload-progress {
  background: #1e2a3a;
  color: #38bdf8;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

body.dark-mode .table-card,
body.dark-mode .preview-card {
  background: #1e2a3a;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
body.dark-mode .table-header,
body.dark-mode .preview-header {
  background: #152030;
  border-bottom-color: #2d4057;
}
body.dark-mode .table-title,
body.dark-mode .preview-title {
  color: #e0e6ed;
}

body.dark-mode .data-table thead th {
  background: #111d2b;
  color: #8b949e;
  border-bottom-color: #2d4057;
}
body.dark-mode .data-table tbody tr {
  border-bottom-color: #2d4057;
}
body.dark-mode .data-table tbody tr:hover {
  background: #152030;
}
body.dark-mode .data-table tbody tr.row-selected {
  background: rgba(56, 189, 248, 0.15);
}

body.dark-mode .row-number {
  background: #111d2b;
  color: #c9d1d9;
}
body.dark-mode .input-field {
  background: #0d1821;
  border-color: #1e2d40;
  color: #ffffff;
}
body.dark-mode .input-field:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
}
body.dark-mode .input-field:read-only {
  background: #0d1821;
  border-color: #1e2d40;
  color: #8b949e;
}

body.dark-mode .slider {
  background: #2d4057;
}
body.dark-mode .switch input:checked + .slider {
  background: #38bdf8;
}

body.dark-mode .doc-badge {
  background: #3d2e00;
  color: #fbbf24;
}
body.dark-mode .user-tag {
  background: #0d1f3c;
  color: #60a5fa;
}
body.dark-mode .date-text {
  color: #c9d1d9;
}
body.dark-mode .file-link-btn {
  color: #60a5fa;
}
body.dark-mode .file-link-btn:hover {
  background: #0d1f3c;
}
body.dark-mode .btn-download {
  color: #60a5fa;
}
body.dark-mode .btn-download:hover {
  background: #0d1f3c;
}
body.dark-mode .btn-delete {
  color: #ef4444;
}
body.dark-mode .btn-delete:hover {
  background: rgba(239, 68, 68, 0.15);
}

body.dark-mode .preview-body {
  background: #0d1821;
}
body.dark-mode .empty-text {
  color: #8b949e;
}
body.dark-mode .empty-icon svg {
  color: #4d6680;
}
</style>
