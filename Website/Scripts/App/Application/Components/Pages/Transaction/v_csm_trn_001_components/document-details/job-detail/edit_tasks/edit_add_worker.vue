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
        <!-- Card Header: index + delete -->
        <div class="gm-attach-card-head">
          <span class="gm-attach-card-no">{{ idx + 1 }}</span>
          <a href="#" class="gm-attach-card-del" @click.prevent="delFile(x.itemno, x.item_type)" v-if="x.add_user === auth.userid || isAdmin">
            <i class="fas fa-times"></i>
          </a>
        </div>

        <!-- Preview Area -->
        <div class="gm-attach-preview">
          <!-- Image -->
          <template v-if="['png','jpeg','jpg'].includes(getFileExt(x.filename))">
            <a href="#" class="gm-attach-img-link" @click.prevent="openLightbox('image', createFilePath(x.filepath), x.filename)">
              <img :src="createFilePath(x.filepath)" class="gm-attach-img" />
              <div class="gm-attach-zoom-hint"><i class="fas fa-search-plus"></i></div>
            </a>
          </template>
          <!-- Video -->
          <template v-else-if="['mp4'].includes(getFileExt(x.filename))">
            <a href="#" class="gm-attach-icon-link" @click.prevent="openLightbox('video', createFilePath(x.filepath), x.filename)">
              <div class="gm-attach-icon gm-attach-icon--video">
                <i class="fas fa-file-video"></i>
              </div>
            </a>
          </template>
          <!-- PDF -->
          <template v-else-if="['pdf'].includes(getFileExt(x.filename))">
            <a href="#" class="gm-attach-icon-link" @click.prevent="openLightbox('pdf', createFilePath(x.filepath), x.filename)">
              <div class="gm-attach-icon gm-attach-icon--pdf">
                <i class="fas fa-file-pdf"></i>
              </div>
              <div class="gm-attach-preview-label">Click to preview</div>
            </a>
          </template>
          <!-- Office Documents -->
          <template v-else-if="['doc','docx','xls','xlsx','ppt','pptx'].includes(getFileExt(x.filename))">
            <a href="#" class="gm-attach-icon-link" @click.prevent="openLightbox('office', createFilePath(x.filepath), x.filename)">
              <div class="gm-attach-icon" v-bind:class="{
                'gm-attach-icon--word': ['doc','docx'].includes(getFileExt(x.filename)),
                'gm-attach-icon--excel': ['xls','xlsx'].includes(getFileExt(x.filename)),
                'gm-attach-icon--ppt': ['ppt','pptx'].includes(getFileExt(x.filename)),
              }">
                <i class="fas fa-file-word" v-if="['doc','docx'].includes(getFileExt(x.filename))"></i>
                <i class="fas fa-file-excel" v-else-if="['xls','xlsx'].includes(getFileExt(x.filename))"></i>
                <i class="fas fa-file-powerpoint" v-else></i>
              </div>
              <div class="gm-attach-preview-label">Click to preview</div>
            </a>
          </template>
          <!-- Other files -->
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
          <textarea class="form-control input-sm gm-attach-textarea" rows="3" v-model.trim="x.description" v-bind:readonly="((x.add_user != auth.userid || isView) && !isAdmin && !isUserInWorkers(auth.empno))&&!canSAApprove()" placeholder="Remark (1)"></textarea>
        </div>

        <!-- Description2 -->
        <div class="gm-attach-desc">
          <textarea class="form-control input-sm gm-attach-textarea" rows="3" v-model.trim="x.description2" v-bind:readonly="((x.add_user != auth.userid || isView) && !isAdmin && !isUserInWorkers(auth.empno))&&!canSAApprove()" placeholder="Remark (2)"></textarea>
        </div>

        <!-- Footer: Date -->
        <div class="gm-attach-card-foot">
          <i class="fas fa-clock"></i> {{ x.add_dt | date('DD/MM/YYYY HH:mm') }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
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
      attachmentData: Array,
      isUserInWorkers: Function,
      is_mango: Function,
      list_emp_sa_mg: String,
      fileUpload: Function,
    },
    data() {
      return {
        auth,
        baseUrl,
        ui: window.ui,
        xt: $xt,
        lightbox: {
          show: false,
          type: '',
          src: '',
          filename: '',
        },
        lbEl: null,
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
        return (this.isAdmin || (this.editDetailData.assign_empno == this.auth.empno && (this.formData.job_status != 'Y' || this.editDetailData.status != 'Y') && !this.isView) || (this.isUserInWorkers(this.auth.empno) && this.formData.job_no && this.editDetailData.is_db && this.formData.job_status != 'W')) || this.canSAApprove();
      },
    },
    methods: {
      canSAApprove() {
        if (!this.list_emp_sa_mg) return false;
        let empList = this.list_emp_sa_mg.split(',').map(Number);
        return empList.includes(this.auth.empno) && !['Y', 'N'].includes(this.formData.job_status) && !$xt.isEmpty(this.formData.job_no) && (this.editDetailData.tester_approve === 'Y' && this.editDetailData.approve_status === 'Y') && this.isMango;
      },
      showToast(msg, icon, duration) {
        this.toastMsg = msg;
        this.toastIcon = icon || 'fa-check-circle';
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => { this.toastMsg = ''; }, duration || 2500);
      },
      copyFileToClipboard(src, filename, type, btnEl) {
        var self = this;
        if (type === 'image') {
          fetch(src)
            .then(function (r) { return r.blob(); })
            .then(function (blob) {
              var canvas = document.createElement('canvas');
              var imgEl = new Image();
              imgEl.crossOrigin = 'anonymous';
              imgEl.onload = function () {
                canvas.width = imgEl.naturalWidth;
                canvas.height = imgEl.naturalHeight;
                canvas.getContext('2d').drawImage(imgEl, 0, 0);
                canvas.toBlob(function (pngBlob) {
                  navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': pngBlob })
                  ]).then(function () {
                    self.showToast('Copied image to clipboard', 'fa-check-circle');
                    if (btnEl) { btnEl.classList.add('gm-lb-toolbar-btn--copied'); setTimeout(function () { btnEl.classList.remove('gm-lb-toolbar-btn--copied'); }, 1500); }
                  }).catch(function () {
                    self.showToast('Failed to copy', 'fa-exclamation-circle');
                  });
                }, 'image/png');
              };
              imgEl.src = URL.createObjectURL(blob);
            })
            .catch(function () {
              self.showToast('Failed to copy', 'fa-exclamation-circle');
            });
        } else {
          var fullUrl = new URL(src, window.location.origin).href;
          navigator.clipboard.writeText(fullUrl).then(function () {
            self.showToast('Copied file link to clipboard', 'fa-check-circle');
            if (btnEl) { btnEl.classList.add('gm-lb-toolbar-btn--copied'); setTimeout(function () { btnEl.classList.remove('gm-lb-toolbar-btn--copied'); }, 1500); }
          }).catch(function () {
            self.showToast('Failed to copy', 'fa-exclamation-circle');
          });
        }
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
      openLightbox(type, src, filename) {
        this.lightbox = { show: true, type, src, filename };
        this.renderLightbox();
        document.body.style.overflow = 'hidden';
      },
      closeLightbox() {
        this.lightbox.show = false;
        if (this.lbEl) {
          this.lbEl.classList.remove('gm-lb--visible');
          if (this._lbWheel) {
            this.lbEl.removeEventListener('wheel', this._lbWheel);
            this._lbWheel = null;
          }
          setTimeout(() => {
            if (this.lbEl && this.lbEl.parentNode) {
              this.lbEl.parentNode.removeChild(this.lbEl);
            }
            this.lbEl = null;
          }, 250);
        }
        if (this._lbMouseMove) {
          document.removeEventListener('mousemove', this._lbMouseMove);
          this._lbMouseMove = null;
        }
        if (this._lbMouseUp) {
          document.removeEventListener('mouseup', this._lbMouseUp);
          this._lbMouseUp = null;
        }
        document.body.style.overflow = '';
      },
      renderLightbox() {
        if (this.lbEl) {
          this.lbEl.parentNode.removeChild(this.lbEl);
        }
        var el = document.createElement('div');
        el.className = 'gm-lb';
        this.lbEl = el;
        var lb = this.lightbox;
        var self = this;
        el.addEventListener('click', function (e) {
          if (e.target === el) self.closeLightbox();
        });
        var inner = document.createElement('div');
        inner.className = 'gm-lb-inner';
        var toolbar = document.createElement('div');
        toolbar.className = 'gm-lb-toolbar';
        var dlBtn = document.createElement('a');
        dlBtn.className = 'gm-lb-toolbar-btn';
        dlBtn.href = lb.src;
        dlBtn.target = '_blank';
        dlBtn.title = 'Open in new tab';
        dlBtn.innerHTML = '<i class="fas fa-external-link-alt" style="padding:0!important;"></i>';
        var copyBtn = document.createElement('button');
        copyBtn.className = 'gm-lb-toolbar-btn';
        copyBtn.title = 'Copy to Clipboard';
        copyBtn.innerHTML = '<i class="fas fa-copy" style="padding:0!important;"></i>';
        copyBtn.addEventListener('click', function () {
          self.copyFileToClipboard(lb.src, lb.filename, lb.type, copyBtn);
        });
        var closeBtn = document.createElement('button');
        closeBtn.className = 'gm-lb-toolbar-btn gm-lb-toolbar-btn--close';
        closeBtn.title = 'Close';
        closeBtn.innerHTML = '<i class="fas fa-times" style="padding:0!important;"></i>';
        closeBtn.addEventListener('click', function () { self.closeLightbox(); });
        toolbar.appendChild(copyBtn);
        toolbar.appendChild(dlBtn);
        toolbar.appendChild(closeBtn);
        var nameEl = document.createElement('div');
        nameEl.className = 'gm-lb-filename';
        nameEl.textContent = lb.filename || '';
        var content = document.createElement('div');
        content.className = 'gm-lb-content';
        if (lb.type === 'image') {
          content.classList.add('gm-lb-content--zoomable');
          var imgWrap = document.createElement('div');
          imgWrap.className = 'gm-lb-zoom-wrap';
          var img = document.createElement('img');
          img.className = 'gm-lb-img';
          img.src = lb.src;
          img.alt = lb.filename;
          img.draggable = false;
          imgWrap.appendChild(img);
          content.appendChild(imgWrap);
          var zoomBadge = document.createElement('div');
          zoomBadge.className = 'gm-lb-zoom-badge';
          zoomBadge.textContent = '100%';
          inner.appendChild(zoomBadge);
          var zoomHintEl = document.createElement('div');
          zoomHintEl.className = 'gm-lb-zoom-tip';
          zoomHintEl.innerHTML = '<i class="fas fa-search-plus" style="padding:0!important;"></i> Ctrl + Scroll to zoom';
          inner.appendChild(zoomHintEl);
          setTimeout(function () { zoomHintEl.classList.add('gm-lb-zoom-tip--hide'); }, 2500);
          var zoom = 1;
          var panX = 0, panY = 0;
          var isPanning = false, startX = 0, startY = 0, startPanX = 0, startPanY = 0;
          var minZoom = 0.25, maxZoom = 8;
          var badgeTimer = null;
          function applyTransform() {
            imgWrap.style.transform = 'scale(' + zoom + ') translate(' + panX + 'px, ' + panY + 'px)';
          }
          function showBadge() {
            zoomBadge.textContent = Math.round(zoom * 100) + '%';
            zoomBadge.classList.add('gm-lb-zoom-badge--show');
            clearTimeout(badgeTimer);
            badgeTimer = setTimeout(function () {
              zoomBadge.classList.remove('gm-lb-zoom-badge--show');
            }, 1200);
          }
          self._lbWheel = function (e) {
            if (!e.ctrlKey) return;
            e.preventDefault();
            var delta = e.deltaY > 0 ? -0.15 : 0.15;
            var newZoom = Math.min(maxZoom, Math.max(minZoom, zoom + delta * zoom));
            if (newZoom <= 1) { panX = 0; panY = 0; }
            zoom = newZoom;
            applyTransform();
            showBadge();
            imgWrap.style.cursor = zoom > 1 ? 'grab' : 'default';
          };
          el.addEventListener('wheel', self._lbWheel, { passive: false });
          imgWrap.addEventListener('mousedown', function (e) {
            if (zoom <= 1) return;
            isPanning = true;
            startX = e.clientX; startY = e.clientY;
            startPanX = panX; startPanY = panY;
            imgWrap.style.cursor = 'grabbing';
            e.preventDefault();
          });
          document.addEventListener('mousemove', self._lbMouseMove = function (e) {
            if (!isPanning) return;
            panX = startPanX + (e.clientX - startX) / zoom;
            panY = startPanY + (e.clientY - startY) / zoom;
            applyTransform();
          });
          document.addEventListener('mouseup', self._lbMouseUp = function () {
            if (!isPanning) return;
            isPanning = false;
            imgWrap.style.cursor = zoom > 1 ? 'grab' : 'default';
          });
          imgWrap.addEventListener('dblclick', function () {
            zoom = 1; panX = 0; panY = 0;
            applyTransform();
            showBadge();
            imgWrap.style.cursor = 'default';
          });
        } else if (lb.type === 'video') {
          var video = document.createElement('video');
          video.className = 'gm-lb-video';
          video.src = lb.src;
          video.controls = true;
          video.autoplay = true;
          content.appendChild(video);
        } else if (lb.type === 'pdf') {
          content.classList.add('gm-lb-content--doc');
          var iframe = document.createElement('iframe');
          iframe.className = 'gm-lb-iframe';
          iframe.src = lb.src;
          iframe.setAttribute('allowfullscreen', 'true');
          content.appendChild(iframe);
        } else if (lb.type === 'office') {
          content.classList.add('gm-lb-content--doc');
          var fileUrl = new URL(lb.src, window.location.origin).href;
          var iframe = document.createElement('iframe');
          iframe.className = 'gm-lb-iframe';
          iframe.src = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(fileUrl);
          iframe.setAttribute('allowfullscreen', 'true');
          content.appendChild(iframe);
        }
        inner.appendChild(toolbar);
        inner.appendChild(content);
        inner.appendChild(nameEl);
        el.appendChild(inner);
        document.body.appendChild(el);
        this._lbEsc = function (e) {
          if (e.key === 'Escape') self.closeLightbox();
        };
        document.addEventListener('keydown', this._lbEsc);
        requestAnimationFrame(function () {
          el.classList.add('gm-lb--visible');
        });
      },
    },
    beforeDestroy() {
      this.closeLightbox();
      if (this._lbEsc) {
        document.removeEventListener('keydown', this._lbEsc);
      }
    },
  }
</script>
