<template>
  <div class="gm-attach-root" @paste="handlePaste" tabindex="-1">
    <!-- Paste Toast -->
    <transition name="gm-toast">
      <div class="gm-attach-toast" v-if="toastMsg">
        <i class="fas" :class="toastIcon" style="padding:0!important;"></i> {{ toastMsg }}
      </div>
    </transition>

    <!-- Attach File Button + Paste Hint -->
    <div class="gm-attach-header" v-if="canUpload">
      <button class="gm-attach-btn" @click="addFile">
        <i class="fas fa-plus"></i> Attach File
      </button>
      <span class="gm-attach-paste-hint">
        <i class="fas fa-paste"></i> Ctrl + V to paste file
      </span>
    </div>

    <!-- Empty State -->
    <div class="gm-attach-empty" v-if="attachFileTab().length === 0">
      <i class="fas fa-cloud-upload-alt"></i>
      <p>No files attached yet</p>
    </div>

    <!-- File Cards Grid -->
    <div class="gm-attach-grid">
      <div class="gm-attach-card" v-for="(x, idx) in attachFileTab()" :key="idx">
        <!-- Card Header: index + round + delete -->
        <div class="gm-attach-card-head">
          <span class="gm-attach-card-no">{{ idx + 1 }}</span>
          <span class="sb-round-badge" v-if="x.sort_order">{{ui.erp_revise}}: {{ x.sort_order }}</span>
          <a href="#" class="gm-attach-card-del" @click.prevent="delFile(x.itemno, x.item_type)" v-if="x.add_user === auth.userid || isAdmin">
            <i class="fas fa-times"></i>
          </a>
        </div>

        <!-- Preview Area -->
        <div class="gm-attach-preview">
          <template v-if="['png','jpeg','jpg'].includes(getFileExt(x.filename))">
            <img :src="createFilePath(x.filepath)" class="gm-attach-img" />
          </template>
          <template v-else-if="['mp4'].includes(getFileExt(x.filename))">
            <div class="gm-attach-icon gm-attach-icon--video">
              <i class="fas fa-file-video"></i>
            </div>
          </template>
          <template v-else-if="['pdf'].includes(getFileExt(x.filename))">
            <div class="gm-attach-icon gm-attach-icon--pdf">
              <i class="fas fa-file-pdf"></i>
            </div>
          </template>
          <template v-else-if="['doc','docx','xls','xlsx','ppt','pptx'].includes(getFileExt(x.filename))">
            <div class="gm-attach-icon" :class="{
              'gm-attach-icon--word': ['doc','docx'].includes(getFileExt(x.filename)),
              'gm-attach-icon--excel': ['xls','xlsx'].includes(getFileExt(x.filename)),
              'gm-attach-icon--ppt': ['ppt','pptx'].includes(getFileExt(x.filename)),
            }">
              <i class="fas fa-file-word" v-if="['doc','docx'].includes(getFileExt(x.filename))"></i>
              <i class="fas fa-file-excel" v-else-if="['xls','xlsx'].includes(getFileExt(x.filename))"></i>
              <i class="fas fa-file-powerpoint" v-else></i>
            </div>
          </template>
          <template v-else>
            <div class="gm-attach-icon gm-attach-icon--default">
              <i class="fas fa-file"></i>
            </div>
          </template>
        </div>

        <!-- File Name + Download -->
        <div class="gm-attach-filename">
          <a :href="downLoadFile(x)" class="gm-attach-dl">
            <i class="fas fa-download"></i> {{ x.filename }}
          </a>
        </div>

        <!-- Description -->
        <div class="gm-attach-desc">
          <textarea class="form-control input-sm gm-attach-textarea" rows="3" v-model.trim="x.description" v-bind:readonly="(x.add_user != auth.userid || isView) && !isAdmin" placeholder="Add description..."></textarea>
        </div>

        <!-- Footer: Date -->
        <div class="gm-attach-card-foot">
          <i class="fas fa-clock"></i> {{ $date(x.add_dt, 'DD/MM/YYYY HH:mm') }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    is_mango: Function,
    attachFileTab: Function,
    createFilePath: Function,
    delFile: Function,
    getFileExt: Function,
    downLoadFile: Function,
    isView: Boolean,
    isAdmin: Boolean,
    formData: Object,
    editDetailData: Object,
    addFile: Function,
    fileUpload: Function,
  },
  data() {
    return {
      auth,
      baseUrl,
      ui: window.ui,
      xt: $xt,
      toastMsg: '',
      toastIcon: 'fa-check-circle',
      toastTimer: null,
    }
  },
  computed: {
    isMango() {
      return this.is_mango()
    },
    canUpload() {
      return this.isMango && this.editDetailData.tester_empno == this.auth.empno && this.editDetailData.tester_test_status == 'B';
    },
  },
  methods: {
    showToast(msg, icon, duration) {
      this.toastMsg = msg;
      this.toastIcon = icon || 'fa-check-circle';
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.toastMsg = ''; }, duration || 2500);
    },
    handlePaste(e) {
      if (!this.canUpload) return;
      var items = (e.clipboardData || e.originalEvent.clipboardData || {}).items;
      if (!items) return;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.kind === 'file') {
          e.preventDefault();
          var file = item.getAsFile();
          if (file) {
            this.showToast('Uploading pasted file: ' + file.name, 'fa-cloud-upload-alt', 3000);
            this.fileUpload(file);
          }
          return;
        }
      }
    },
  },
}
</script>
<style scoped>
  .sb-round-badge {
    margin-left: 6px;
    padding: 1px 7px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    background: #eef1f5;
    color: #46586c;
    border: 1px solid #dbe3ef;
  }
</style>
