<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="ic-page">
          <header class="ic-masthead">
            <div class="ic-masthead-main">
              <span class="ic-eyebrow">CSM &middot; CASE ARCHIVE</span>
              <h2 class="ic-title">งานที่เสร็จสมบูรณ์</h2>
              <p class="ic-subtitle">จัดการเอกสารที่เสร็จสมบูรณ์</p>
            </div>
            <div class="ic-masthead-meta">
              <span class="ic-meta-label">แสดงอยู่</span>
              <span class="ic-meta-value">{{ data_complete.length }} รายการ</span>
            </div>
          </header>

          <div class="ic-filters">
            <div class="ic-filter-row">
              <div class="ic-input-icon-wrap">
                <i class="fa fa-filter ic-input-icon"></i>
                <select class="ic-input ic-select ic-input-with-icon" v-model="searchList.search_field" @change="searchData()">
                  <option value="docno">Doc No.</option>
                  <option value="job_no">CSM No.</option>
                  <option value="adduser_name">ผู้แจ้ง</option>
                  <option value="accept_user_name">ผู้รับทราบ</option>
                  <option value="close_user_name">ผู้ปิด case</option>
                </select>
              </div>

              <div class="ic-input-icon-wrap">
                <i class="fa fa-search ic-input-icon"></i>
                <input type="text"
                       class="ic-input ic-input-with-icon"
                       placeholder="ค้นหาด้วย Doc No. หรือชื่อ..."
                       v-model="searchList.search_text"
                       @keyup.enter="searchData()" />
              </div>

              <div class="ic-input-icon-wrap">
                <i class="fa fa-calendar ic-input-icon"></i>
                <input type="number"
                       class="ic-input ic-input-with-icon"
                       placeholder="ปี"
                       v-model="Year_period"
                       @input="limitYearLength"
                       @keyup.enter="searchData()"
                       maxlength="4" />
              </div>

              <div class="ic-input-icon-wrap">
                <i class="fa fa-calendar ic-input-icon"></i>
                <input type="number"
                       class="ic-input ic-input-with-icon"
                       placeholder="เดือน"
                       v-model="month_period"
                       @input="validateMonth"
                       maxlength="2"
                       @keyup.enter="searchData()" />
              </div>

              <button type="button" class="ic-btn-search" @click="searchData()">
                <i class="fa fa-search"></i> ค้นหา
              </button>
            </div>
            <p v-if="messageText()" class="ic-filter-note">{{ messageText() }}</p>
          </div>

          <div class="ic-body">
            <div class="ic-card-grid">
              <article v-for="(item, index) in data_complete" :key="item.id"
                       class="ic-card"
                       @click="openCaseModal(index, item)">
                <div class="ic-card-top">
                  <span class="ic-card-docno">{{ item.docno }}</span>
                  <span class="ic-card-status">COMPLETE</span>
                </div>

                <div class="ic-card-thumb">
                  <img v-if="isImageFile(item.ext_first) && item.file_first"
                       :src="showPictures(item.file_first)"
                       class="ic-card-thumb-img" />
                  <i v-else class="fa fa-3x" :class="[getFileIcon(item.ext_first), getIconColorClass(item.ext_first)]"></i>
                </div>

                <h5 class="ic-card-title clamp-2">{{ item.subject }}</h5>
                <p class="ic-card-desc clamp-3">{{ item.desc_remark || '-' }}</p>

                <dl class="ic-meta">
                  <div class="ic-meta-row">
                    <dt>CSM No.</dt>
                    <dd>
                      <a v-if="!xt.isEmpty(item.job_no)" :href="openReq(item)" target="_blank" class="ic-meta-link" @click.stop>{{ item.job_no }}</a>
                      <span v-else>-</span>
                    </dd>
                  </div>
                  <div class="ic-meta-row">
                    <dt>ผู้แจ้ง</dt>
                    <dd>{{ item.adduser_name }}</dd>
                  </div>
                  <div class="ic-meta-row">
                    <dt>ผู้รับผิดชอบ</dt>
                    <dd>{{ item.accept_user_name || '-' }}</dd>
                  </div>
                  <div class="ic-meta-row">
                    <dt>ผู้ปิด case</dt>
                    <dd>{{ item.close_user_name || '-' }}</dd>
                  </div>
                </dl>

                <div class="ic-card-foot">
                  <span>ดูรายละเอียด</span>
                  <i class="fa fa-arrow-right"></i>
                </div>
              </article>
            </div>
          </div>

          <footer class="ic-action-bar">
            <pagination ref="paging" @page-change="pageChange($event.page)" />
          </footer>
        </div>
      </template>
    </re-page>

    <modal-2 ref="modalcase" size="xl" class="csm-complete-modal" :no-scroll="true">
      <template #header>
        <div class="md-header">
          <div class="md-header-left">
            <div class="md-header-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div>
              <div class="md-header-title">{{ selectedCase && selectedCase.subject }}</div>
              <div class="md-header-meta">
                <span class="md-header-docno">{{ selectedCase && selectedCase.docno }}</span>
                <span class="md-header-sep">·</span>
                <span>Case Complete</span>
                <template v-if="title_m">
                  <span class="md-header-sep">·</span>
                  <span>{{ title_m }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #body v-if="selectedCase">
        <div class="md-body">
          <!-- LEFT PANEL -->
          <div class="md-left">
            <div class="md-left-scroll custom-scrollbar">

              <!-- Description -->
              <div class="md-section">
                <div class="md-section-label"><i class="fas fa-align-left"></i> รายละเอียด</div>
                <div class="md-desc custom-scrollbar">{{ selectedCase.desc_remark }}</div>
              </div>

              <!-- URL -->
              <div class="md-section" v-if="selectedCase.website_url && selectedCase.website_url !== '-'">
                <div class="md-section-label"><i class="fas fa-link"></i> Website URL</div>
                <a :href="selectedCase.website_url" target="_blank" class="md-url">
                  <i class="fas fa-external-link-alt"></i> {{ selectedCase.website_url }}
                </a>
              </div>

              <!-- Customer Data -->
              <div class="md-section" v-if="selectedCase.customer_code && selectedCase.pre_event">
                <div class="md-customer-row">
                  <span class="md-customer-label">Customer</span>
                  <span class="md-customer-name">{{ selectedCase.cus_name || '-' }}</span>
                  <a :href="openDetail(selectedCase)" target="_blank" class="md-customer-link" title="ดูข้อมูลลูกค้า">
                    <i class="fas fa-eye"></i>
                  </a>
                </div>
              </div>

              <!-- Attachments (Collapsible) -->
              <div class="md-section" v-if="(parseIfString(selectedCase.files_path2 || selectedCase.files_path)).length > 0">
                <div class="box box-solid collapsed-box md-box" id="AttachBox">
                  <div class="box-header with-border">
                    <h3 class="box-title">
                      <i class="fas fa-paperclip"></i> ไฟล์แนบ
                      <span class="md-box-count">({{ parseIfString(selectedCase.files_path2 || selectedCase.files_path).length }} ไฟล์)</span>
                    </h3>
                    <div class="box-tools pull-right">
                      <button type="button" class="btn btn-box-tool" data-widget="collapse">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="box-body md-box-body custom-scrollbar">
                    <div class="md-attachments-grid">
                      <div v-for="(f, idx) in parseIfString(selectedCase.files_path2 || selectedCase.files_path)" :key="idx"
                           class="md-attach-card"
                           @click="openFile(f)">
                        <div class="md-attach-preview">
                          <img v-if="isImageFile(f.ext_file)"
                               :src="showPictures(f.filepath)"
                               class="md-attach-img"
                               @error="handleImageError" />
                          <div v-else class="md-attach-icon-wrapper">
                            <i :class="getFileIcon(f.ext_file)" :style="{ color: getFileColor(f.ext_file) }"></i>
                          </div>
                        </div>
                        <div class="md-attach-footer">
                          <div class="md-attach-filename" :title="f.filename || `ไฟล์ ${idx + 1}`">
                            {{ f.filename || `ไฟล์ ${idx + 1}.${f.ext_file || 'file'}` }}
                          </div>
                          <div class="md-attach-meta">
                            <span class="md-attach-type">{{ (f.ext_file || '').toUpperCase() }}</span>
                            <i class="fas fa-download"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Chat history (Collapsible) -->
              <div class="md-section" v-if="comment_precase && comment_precase.length > 0">
                <div class="box box-solid collapsed-box md-box" id="ChatBox">
                  <div class="box-header with-border">
                    <h3 class="box-title">
                      <i class="fas fa-comments"></i> การตอบกลับ
                      <span class="md-box-count">({{ comment_precase.length }})</span>
                    </h3>
                    <div class="box-tools pull-right">
                      <button type="button" class="btn btn-box-tool" data-widget="collapse">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="box-body md-box-body md-box-body-tall custom-scrollbar">
                    <div class="md-chat-history">
                      <div v-for="(comment, index) in comment_precase" :key="index" class="md-chat-row">
                        <div class="md-chat-flex" :class="comment.add_user == auth.userid ? 'md-chat-me' : 'md-chat-other'">
                          <div v-if="comment.add_user != auth.userid" class="md-avatar">
                            <img v-if="comment.imgPath || comment.img" :src="showPictures(comment.imgPath || comment.img)" @error="$event.target.style.display='none'" />
                            <span v-else>{{ (comment.add_user || '-').charAt(0).toUpperCase() }}</span>
                          </div>
                          <div class="md-bubble" :class="comment.add_user == auth.userid ? 'md-bubble-me' : 'md-bubble-other'">
                            <div class="md-bubble-meta">
                              <strong>{{ comment.add_user }}</strong>
                              <small>{{ $date(comment.add_dt, 'DD/MM/YYYY HH:mm') }}</small>
                            </div>
                            <div class="md-bubble-text">{{ comment.description.text || comment.description }}</div>
                            <div v-if="comment.description.files && comment.description.files.length" class="md-bubble-files">
                              <a v-for="(f, fIdx) in comment.description.files" :key="fIdx"
                                 :href="['mp4','pdf','jpg','png'].includes(getFileExt(f.filename)) ? showPictures(f.filepath) : downLoadFileX(f)"
                                 target="_blank" class="md-file-chip">
                                <img v-if="['png','jpeg','jpg'].includes(getFileExt(f.filename))" :src="showPictures(f.filepath)" class="md-file-chip-img" />
                                <i v-else-if="['xls','xlsx'].includes(getFileExt(f.filename))" class="fas fa-file-excel text-success"></i>
                                <i v-else-if="['pdf'].includes(getFileExt(f.filename))" class="fas fa-file-pdf text-danger"></i>
                                <i v-else-if="['doc','docx'].includes(getFileExt(f.filename))" class="fas fa-file-word text-primary"></i>
                                <i v-else class="fas fa-file text-secondary"></i>
                                <span>{{ f.filename }}</span>
                              </a>
                            </div>
                          </div>
                          <div v-if="comment.add_user == auth.userid" class="md-avatar md-avatar-me">
                            <img v-if="comment.imgPath || comment.img" :src="showPictures(comment.imgPath || comment.img)" @error="$event.target.style.display='none'" />
                            <span v-else>{{ (comment.add_user || '-').charAt(0).toUpperCase() }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div><!-- end md-left-scroll -->
          </div><!-- end md-left -->

          <!-- RIGHT PANEL -->
          <div class="md-right custom-scrollbar">
            <!-- Reporter -->
            <div class="md-info-card">
              <div class="md-reporter">
                <div class="md-reporter-avatar">
                  <img v-if="selectedCase.img" :src="showPictures(selectedCase.img)" alt="avatar" @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'" />
                  <i class="fas fa-user"></i>
                </div>
                <div>
                  <div class="md-reporter-name">{{ selectedCase.adduser }}</div>
                  <div class="md-reporter-role">ผู้แจ้งปัญหา</div>
                </div>
              </div>
            </div>
            <!-- Timeline -->
            <div class="md-info-card">
              <div class="md-info-card-title">สถานะดำเนินการ</div>
              <div class="md-timeline">
                <div class="md-tl-item md-tl-done">
                  <div class="md-tl-dot md-tl-dot-done"></div>
                  <div class="md-tl-line"></div>
                  <div class="md-tl-content">
                    <span class="md-tl-label md-tl-label-done">แจ้งเรื่องเข้ามา</span>
                    <span class="md-tl-time">{{ formatDateTime(selectedCase.adddate) }}</span>
                  </div>
                </div>
                <div class="md-tl-item" :class="selectedCase.accept_case === 'Y' ? 'md-tl-done' : ''">
                  <div class="md-tl-dot" :class="selectedCase.accept_case === 'Y' ? 'md-tl-dot-done' : 'md-tl-dot-pending'"></div>
                  <div class="md-tl-line"></div>
                  <div class="md-tl-content">
                    <span class="md-tl-label" :class="selectedCase.accept_case === 'Y' ? 'md-tl-label-done' : ''">รับทราบงาน</span>
                    <span v-if="selectedCase.accept_case === 'Y'" class="md-tl-time">{{ selectedCase.accept_user }} · {{ formatDateTime(selectedCase.accept_date) }}</span>
                    <span v-else class="md-tl-time md-tl-pending">รอเจ้าหน้าที่รับเรื่อง</span>
                  </div>
                </div>
                <div class="md-tl-item" :class="selectedCase.check_case === 'Y' ? 'md-tl-done' : ''">
                  <div class="md-tl-dot" :class="selectedCase.check_case === 'Y' ? 'md-tl-dot-done' : 'md-tl-dot-pending'"></div>
                  <div class="md-tl-line"></div>
                  <div class="md-tl-content">
                    <span class="md-tl-label" :class="selectedCase.check_case === 'Y' ? 'md-tl-label-done' : ''">ผู้ตรวจสอบ</span>
                    <span v-if="selectedCase.check_case === 'Y'" class="md-tl-time">{{ selectedCase.check_user || '-' }}<span v-if="selectedCase.check_date"> · {{ formatDateTime(selectedCase.check_date) }}</span></span>
                    <span v-else class="md-tl-time md-tl-pending">ยังไม่ได้ตรวจสอบ</span>
                  </div>
                </div>
                <div class="md-tl-item" :class="selectedCase.close_case === 'Y' ? 'md-tl-done' : ''">
                  <div class="md-tl-dot" :class="selectedCase.close_case === 'Y' ? 'md-tl-dot-done' : 'md-tl-dot-pending'"></div>
                  <div class="md-tl-line"></div>
                  <div class="md-tl-content">
                    <span class="md-tl-label" :class="selectedCase.close_case === 'Y' ? 'md-tl-label-done' : ''">ปิดงาน (Close Case)</span>
                    <span v-if="selectedCase.close_case === 'Y'" class="md-tl-time">{{ selectedCase.close_user }} · {{ formatDateTime(selectedCase.close_date) }}</span>
                  </div>
                </div>
                <div class="md-tl-item" :class="!xt.isEmpty(selectedCase.job_no) ? 'md-tl-done' : ''">
                  <div class="md-tl-dot" :class="!xt.isEmpty(selectedCase.job_no) ? 'md-tl-dot-done' : 'md-tl-dot-pending'"></div>
                  <div class="md-tl-content">
                    <span class="md-tl-label" :class="!xt.isEmpty(selectedCase.job_no) ? 'md-tl-label-done' : ''">
                      เปิดใบแจ้งงาน (CSM)
                      <a v-if="!xt.isEmpty(selectedCase.job_no)" :href="openReq(selectedCase)" target="_blank" class="md-tl-link"> {{ selectedCase.job_no }}</a>
                    </span>
                    <span v-if="!xt.isEmpty(selectedCase.job_no)" class="md-tl-time">{{ selectedCase.name_quest_u || '-' }}<span v-if="selectedCase.job_date"> · {{ formatDateTime(selectedCase.job_date) }}</span></span>
                    <span v-else class="md-tl-time md-tl-pending">ยังไม่ได้เปิดใบแจ้งงาน</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Actions -->
            <div class="md-actions" v-if="selectedCase && xt.isEmpty(selectedCase.job_no)">
              <button class="md-btn md-btn-csm" @click.prevent="sendToCSM()">
                <i class="fas fa-paper-plane"></i> Send to CSM
              </button>
            </div>
            <div class="md-actions" v-if="selectedCase && !xt.isEmpty(selectedCase.job_no)">
              <button class="md-btn md-btn-done" disabled>
                <i class="fas fa-check-circle"></i> Completed
              </button>
            </div>
          </div><!-- end md-right -->
        </div><!-- end md-body -->
      </template>
    </modal-2>

    <loading-box ref="myLB"></loading-box>
  </div>
</template>

<script type="text/javascript">
  import loadingBox from "../../Center/loading-box.vue"

  let page = {};
  let loading = {};
  let paging = {};

  export default {
    components: {
      loadingBox
    },
    data() {
      return {
        auth,
        ui: window.ui,
        baseUrl,
        xt: $xt,
        data_complete: [],
        selectedCase: null,
        queryString,
        comment_precase: [],
        pageNumber: 1,
        isLoading: false,
        searchList: {
          search_field: 'docno',
          search_text: '',
        },
        refreshInterval: null,
        lastCheckedCompleted: null,
        storageCheckInterval: null,
        Year_period: new Date().getFullYear(),
        month_period: new Date().getMonth() + 1,
        cardColors: [
          '#E3EBFD', '#E0C7EE', '#F8D5F8', '#D0F4DE', '#FCF6BD',
          '#FFBBDA', '#8BD2EC', '#F5E8F7', '#F898A4', '#FCEE9E', '#FBCCC2'
        ],
        modalHeaderColor: '#007bff',
        title_m: '',
        // Collapsible sections state
        expandedSections: {
          description: true,
          url: true,
          attachments: false,  // เริ่มต้นหุบไว้
          comments: false      // เริ่มต้นหุบไว้
        }
      };
    },
    methods: {
      getIconColorClass(extension) {
        if (!extension) return 'text-secondary';
        const ext = extension.toLowerCase();

        if (['xls', 'xlsx', 'csv'].includes(ext)) return 'text-success'; // สีเขียว
        if (['doc', 'docx'].includes(ext)) return 'text-primary'; // สีฟ้า
        if (['pdf'].includes(ext)) return 'text-danger';  // สีแดง
        if (['ppt', 'pptx'].includes(ext)) return 'text-warning'; // สีส้ม
        if (['txt', 'log'].includes(ext)) return 'text'; // สีเทา

        return 'text-secondary';
      },
      async load_data() {
        if (this.isLoading) return;
        this.isLoading = true;
        loading.show();

        try {
          let action = `CSM/Data/CSM_PreCase_Read_Complete?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}&Year_period=${this.Year_period}&month_period=${this.month_period}`;
          for (var key in this.searchList) {
            action += `&${key}=${encodeURIComponent(this.searchList[key])}`
          }
          let rsps = await $xt.getServer(action);
          this.$set(this, 'data_complete', rsps.data.data_complete || []);

          this.data_complete.forEach(item => {
            item.files_path = item.files_path2 || item.files_path;
          });

          paging.setTotalItems(rsps.data.total)
          if (!paging.getItemsPerPage()) {
            paging.setCurrentPage(1)
          }
          paging.createPagesArray()
        } catch (error) {
          console.error('Load data error:', error);
          $msg.alert('Error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.toString(), 'danger');
        } finally {
          this.isLoading = false;
          loading.hide();
        }
      },
      formatDateTime(date) {
        return moment(date, ['DD/MM/YYYY HH:mm:ss', moment.ISO_8601]).format('DD/MM/YYYY, HH:mm:ss');
      },
      openCaseModal(index, item) {
        this.selectedCase = item;
        this.comment_precase = [];
        this.title_m = item.accept_position == 'D' ? '(Software Developer)' : item.accept_position == 'I' ? '(IT Operation)' : '';
        this.$refs.modalcase.setSize("modal-xl");
        this.read_comment_precase(item);
        this.scrollToBottom();
        this.modalHeaderColor = this.getHeaderColor(index);
        this.$refs.modalcase.openModal();
        // Initialize boxWidget for collapsible sections inside modal
        this.$nextTick(() => {
          $('#AttachBox').boxWidget();
          $('#ChatBox').boxWidget();
        });
      },
      parseIfString(data) {
        if (!data) return [];

        try {
          // ถ้าเป็น string ให้ parse
          if (typeof data === 'string') {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
          }

          // ถ้าเป็น array อยู่แล้ว
          if (Array.isArray(data)) {
            return data;
          }

          // ถ้าเป็น object ให้แปลงเป็น array
          if (typeof data === 'object') {
            return [data];
          }

          return [];
        } catch (e) {
          console.error('parseIfString error:', e, 'data:', data);
          return [];
        }
      },
      showPictures(x) {
        return window.dataServer + "Api/File/DownLoad?id=" + x
      },
      getFileExt(f) {
        // ถ้ามี filename ให้ใช้ filename
        if (f && f.filename) {
          return f.filename.split('.').pop().toLowerCase();
        }
        // ถ้าไม่มี filename ให้ return ค่าเริ่มต้น
        return '';
      },
      isImageFile(ext) {
        if (!ext) return false;
        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'];
        return imageExtensions.includes(ext.toLowerCase());
      },
      getFileColor(ext) {
        if (!ext) return '#6b7280';
        const e = ext.toLowerCase();
        if (['pdf'].includes(e)) return '#ef4444';
        if (['mp4', 'avi', 'mov'].includes(e)) return '#8b5cf6';
        if (['doc', 'docx'].includes(e)) return '#2563eb';
        if (['xls', 'xlsx', 'csv'].includes(e)) return '#16a34a';
        if (['zip', 'rar', '7z'].includes(e)) return '#f59e0b';
        return '#6b7280';
      },
      openFile(file) {
        const ext = file.ext_file?.toLowerCase() || '';
        const url = ['mp4', 'pdf', 'jpg', 'png', 'jpeg', 'gif'].includes(ext)
          ? this.showPictures(file.filepath)
          : this.downLoadFileX(file);
        window.open(url, '_blank');
      },
      handleImageError(event) {
        event.target.style.display = 'none';
        const parent = event.target.parentElement;
        if (parent) {
          parent.innerHTML = '<i class="fas fa-image" style="font-size: 48px; color: #cbd5e1;"></i>';
        }
      },
      toggleSection(section) {
        this.$set(this.expandedSections, section, !this.expandedSections[section]);
      },
      downLoadFileX(x) {
        return window.dataServer + `API/File/DownLoad?id=${x.filepath}&download=true&filename=${x.filename || ''}`
      },
      getFileIcon(extension) {
        if (!extension) return 'fa-file-o';

        let ext = extension.toLowerCase();

        // กลุ่มไฟล์รูปภาพ
        let imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'];
        if (imageExtensions.includes(ext)) return 'fa-image';

        // กลุ่ม Excel
        let excelExtensions = ['xls', 'xlsx', 'csv'];
        if (excelExtensions.includes(ext)) return 'fa-file-excel-o';

        // กลุ่ม Word
        let wordExtensions = ['doc', 'docx'];
        if (wordExtensions.includes(ext)) return 'fa-file-word-o';

        // กลุ่ม PDF
        let pdfExtensions = ['pdf'];
        if (pdfExtensions.includes(ext)) return 'fa-file-pdf-o';

        // กลุ่ม Text (แก้ไขตรงนี้)
        let textExtensions = ['txt', 'log', 'xml', 'json'];
        if (textExtensions.includes(ext)) {
          return 'fa-file-text'; // ลองเปลี่ยนเป็น fa-file-text หรือ fa-file-alt
        }

        // กลุ่ม PowerPoint
        let pptExtensions = ['ppt', 'pptx'];
        if (pptExtensions.includes(ext)) return 'fa-file-powerpoint-o';

        // กลุ่ม Zip/Archive
        let zipExtensions = ['zip', 'rar', '7z'];
        if (zipExtensions.includes(ext)) return 'fa-file-archive-o';

        return 'fa-file-o';
      },
      isImageFile(extension) {
        if (!extension) return false;
        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'];
        return imageExtensions.includes(extension.toLowerCase());
      },
      async read_comment_precase(x) {
        try {
          if (!x || !x.docno) {
            this.comment_precase = [];
            return;
          }
          let docno = x.docno;
          let action = `CSM/Data/CSM_ReadComment_PreCase?docno=${docno}`;
          let response = await $xt.getServer(action);
          if (response.success) {
            this.comment_precase = response.data.commentData || [];
          } else {
            this.comment_precase = [];
          }
          // Initialize ChatBox boxWidget after comments are loaded and DOM updated
          this.$nextTick(() => {
            $('#ChatBox').boxWidget();
          });
        } catch (error) {
          this.comment_precase = [];
        }
      },
      startRefreshTimer() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(async () => {
          try { await this.load_data(); } catch (error) { }
        }, 300000);
      },
      async searchData() {
        if (this.isLoading) return;
        try {
          paging.setCurrentPage(1)
          await this.load_data()
        } catch (error) { }
      },
      async pageChange(pn) {
        if (this.isLoading) return;
        pn = pn || 1
        this.pageNumber = pn
        try {
          paging.setCurrentPage(pn)
          await this.load_data()
        } catch (error) { }
      },
      handleStorageChange(event) {
        if (event.key === 'CSM_CASE_COMPLETED') {
          this.load_data();
          localStorage.removeItem('CSM_CASE_COMPLETED');
        }
      },
      async sendToCSM() {
        let f = this.selectedCase
        let formData = {
          subject: f.subject,
          request_empno: auth.empno,
          request_empno_name: auth.empname,
          job_date: new Date(),
          customer_code: f.customer_code,
          customer_name: f.cus_name
        }
        let detailData = []
        let itemno = 1
        let attachmentData = []
        let x = this.selectedCase
        detailData.push({
          add_dt: new Date(),
          subject: x.subject,
          detail: x.desc_remark,
          itemno: itemno,
          is_db: false,
          status_tmp: "W",
          ref_docno: x.docno,
          ref_docdate: x.adddate,
          status: "W",
        })
        let filesData = this.parseIfString(x.files_path) || []
        var picNo = 1
        filesData.forEach(p => {
          attachmentData.push({
            description: p.description || 'รูปภาพ/ไฟล์ ประกอบที่ ' + picNo++,
            filename: p.filename,
            filepath: p.filepath,
            item_type: "B",
            itemno: p.itemno || itemno,
            ref_itemno: itemno,
            add_dt: new Date(),
            ref_doc_pre: x.docno
          })
        })
        localStorage.setItem('X-CSM-PreCase-Data', JSON.stringify({
          formData, detailData, attachmentData
        }))
        window.open(baseUrl + `page/transaction/v_csm_trn_001/`)
        this.$refs.modalcase.closeModal();
      },
      validateMonth() {
        if (this.month_period === '' || this.month_period === null) return
        let value = Number(this.month_period)
        if (isNaN(value) || value < 1 || value > 12) {
          this.month_period = ''
        } else {
          this.month_period = Math.floor(value)
        }
      },
      limitYearLength() {
        if (this.Year_period && this.Year_period.toString().length > 4) {
          this.Year_period = this.Year_period.toString().slice(0, 4)
        }
      },
      messageText() {
        if (!this.month_period && this.Year_period) return `แสดงข้อมูลทั้งหมดในปี ${this.Year_period}`
        if (!this.month_period && !this.Year_period) return 'แสดงข้อมูลทั้งหมด'
        if (this.month_period && !this.Year_period) return `แสดงข้อมูลเดือน ${this.month_period} และ Default ปีเป็นปีปัจจุบัน`
        return ''
      },
      getHeaderColor(index) {
        return this.cardColors[index % this.cardColors.length];
      },
      getBorderColor(index) {
        let offsetIndex = index + 2;
        return this.cardColors[offsetIndex % this.cardColors.length];
      },
      openReq(x) {
        x = x || ''
        if ($xt.isEmpty(x)) {
          return this.baseUrl + `page/Transaction/v_csm_trn_001/`
        }
        else {
          return this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${x.job_no}`
        }
      },
      openDetail(x) {
        return this.baseUrl + `page/CustomerDataView?customer_code=${x.customer_code}&pre_event=${x.pre_event}`
      },
      scrollToBottom() {
        // 1. รอ Vue วาด DOM รอบแรก
        this.$nextTick(() => {
          let container = this.$el.querySelector('.comment-chat');
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        });

        // 2. [เพิ่ม] รอให้ Modal Animation เสร็จ หรือรูปภาพเริ่มมา (หน่วงเวลา 300ms)
        setTimeout(() => {
          const container = this.$el.querySelector('.comment-chat');
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        }, 300); // 300ms คือเวลามาตรฐานของ Bootstrap Modal fade
      },
    },
    async mounted() {
      page = this.$refs.page
      page.pageTitle = 'Case Complete'
      document.title = page.pageTitle
      loading = this.$refs.myLB
      paging = this.$refs.paging
      paging.setCurrentPage(1)
      paging.setItemsPerPage(50)
      await this.load_data();
      window.addEventListener('storage', this.handleStorageChange);
      this.storageCheckInterval = setInterval(() => {
        const lastCompleted = localStorage.getItem('CSM_CASE_COMPLETED');
        if (lastCompleted && (!this.lastCheckedCompleted || lastCompleted !== this.lastCheckedCompleted)) {
          this.lastCheckedCompleted = lastCompleted;
          this.load_data();
          localStorage.removeItem('CSM_CASE_COMPLETED');
        }
      }, 1000);
      this.startRefreshTimer();
    },
    beforeDestroy() {
      if (this.refreshInterval) clearInterval(this.refreshInterval);
      if (this.storageCheckInterval) clearInterval(this.storageCheckInterval);
      window.removeEventListener('storage', this.handleStorageChange);
    },
  };
</script>

<style scoped>
  /* ═══════════════════════════════════════
     Tokens — navy / white
  ═══════════════════════════════════════ */
  .ic-page,
  .md-header,
  .md-body {
    --ic-ground: #e9eef5;
    --ic-surface: #ffffff;
    --ic-ink: #0c2340;
    --ic-ink-soft: #5a6d87;
    --ic-ink-faint: #94a3b8;
    --ic-rule: #c9d5e4;
    --ic-rule-soft: #e1e8f1;
    --ic-accent: #1d5faa;
    --ic-accent-bright: #7fb2e8;
    --ic-accent-wash: rgba(29, 95, 170, 0.07);
    --ic-on-ink: #f5f9ff;
    --ic-done: #14804a;
    --ic-pending: #b45309;
    --ic-grid: rgba(37, 99, 235, 0.06);
    --r-xs: 4px;
    --r-sm: 7px;
    --r-md: 10px;
    --r-lg: 14px;
    --ic-font-display: 'Prompt', 'Sarabun', sans-serif;
    --ic-font-body: 'Sarabun', sans-serif;
    --ic-font-mono: Consolas, 'Courier New', monospace;
  }

  /* ═══════════════════════════════════════
     Page shell — header / body / footer
  ═══════════════════════════════════════ */
  .ic-page {
    height: calc(100vh - 120px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 18px 22px;
    gap: 12px;
    background-color: var(--ic-ground);
    background-image:
      linear-gradient(var(--ic-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--ic-grid) 1px, transparent 1px);
    background-size: 26px 26px;
    font-family: var(--ic-font-body);
    color: var(--ic-ink);
  }

  /* Masthead */
  .ic-masthead {
    flex: 0 0 auto;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    padding: 16px 24px;
    background: var(--ic-ink);
    border-left: 4px solid var(--ic-accent-bright);
    animation: ic-rise 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) both;
  }

  .ic-masthead::after {
    content: '';
    position: absolute;
    top: -60%;
    right: -80px;
    width: 320px;
    height: 220%;
    background: radial-gradient(closest-side, rgba(127, 178, 232, 0.2), transparent);
    pointer-events: none;
  }

  .ic-masthead-main { position: relative; z-index: 1; }

  .ic-eyebrow {
    display: block;
    font-family: var(--ic-font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.22em;
    color: var(--ic-accent-bright);
    margin-bottom: 5px;
  }

  .ic-title {
    font-family: var(--ic-font-display);
    font-size: 23px;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.01em;
    color: var(--ic-on-ink);
    margin: 0;
  }

  .ic-subtitle {
    font-size: 13px;
    line-height: 1.5;
    color: rgba(245, 249, 255, 0.58);
    margin: 4px 0 0;
  }

  .ic-masthead-meta {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    text-align: right;
    padding-left: 20px;
    border-left: 1px solid rgba(245, 249, 255, 0.16);
  }

  .ic-meta-label {
    display: block;
    font-family: var(--ic-font-mono);
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(245, 249, 255, 0.45);
  }

  .ic-meta-value {
    display: block;
    font-family: var(--ic-font-display);
    font-size: 14px;
    font-weight: 500;
    color: var(--ic-accent-bright);
    margin-top: 3px;
  }

  /* Filter bar */
  .ic-filters {
    flex: 0 0 auto;
    padding: 12px 16px;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-lg);
    animation: ic-rise 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) 0.06s both;
  }

  .ic-filter-row {
    display: grid;
    grid-template-columns: 175px minmax(0, 1fr) 110px 100px auto;
    gap: 8px;
    align-items: center;
  }

  .ic-filter-note {
    margin: 8px 0 0;
    font-family: var(--ic-font-mono);
    font-size: 11px;
    letter-spacing: 0.03em;
    color: var(--ic-pending);
  }

  /* ═══════════════════════════════════════
     Inputs
  ═══════════════════════════════════════ */
  .ic-input {
    width: 100%;
    height: 38px;
    padding: 0 12px;
    font-family: var(--ic-font-body);
    font-size: 13px;
    color: var(--ic-ink);
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule);
    border-bottom-width: 2px;
    border-radius: var(--r-sm);
    outline: none;
    transition: border-color 0.18s ease, background 0.18s ease;
  }

  .ic-input:focus {
    border-color: var(--ic-rule);
    border-bottom-color: var(--ic-accent);
    background: var(--ic-accent-wash);
  }

  .ic-input::placeholder { color: var(--ic-ink-faint); }

  .ic-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%235a6d87' d='M5 7 0 0h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 30px;
    cursor: pointer;
  }

  .ic-input-icon-wrap { position: relative; }

  .ic-input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: var(--ic-ink-faint);
    pointer-events: none;
    z-index: 1;
  }

  .ic-input-with-icon { padding-left: 32px; }

  .ic-btn-search {
    height: 38px;
    padding: 0 22px;
    white-space: nowrap;
    font-family: var(--ic-font-display);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--ic-on-ink);
    background: var(--ic-ink);
    border: none;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: background 0.18s ease;
  }

  .ic-btn-search:hover { background: var(--ic-accent); }

  /* ═══════════════════════════════════════
     Body — the only scroll region
  ═══════════════════════════════════════ */
  .ic-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 8px;
  }

  .ic-body::-webkit-scrollbar { width: 7px; }
  .ic-body::-webkit-scrollbar-track { background: transparent; }
  .ic-body::-webkit-scrollbar-thumb { background: var(--ic-rule); }
  .ic-body::-webkit-scrollbar-thumb:hover { background: var(--ic-ink-faint); }

  .ic-card-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
    align-items: start;
  }

  /* ═══════════════════════════════════════
     Record card
  ═══════════════════════════════════════ */
  .ic-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0 16px 14px;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-top: 3px solid var(--cc);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
    animation: ic-rise 0.4s cubic-bezier(0.2, 0.7, 0.3, 1) both;
  }

  /* สีประจำการ์ด วนตามลำดับ 8 สี ให้แต่ละใบแยกจากกันด้วยสายตา */
  .ic-card:nth-child(8n + 1) { --cc: #2563eb; --cc-wash: rgba(37, 99, 235, 0.11); }
  .ic-card:nth-child(8n + 2) { --cc: #0891b2; --cc-wash: rgba(8, 145, 178, 0.11); }
  .ic-card:nth-child(8n + 3) { --cc: #7c3aed; --cc-wash: rgba(124, 58, 237, 0.11); }
  .ic-card:nth-child(8n + 4) { --cc: #059669; --cc-wash: rgba(5, 150, 105, 0.11); }
  .ic-card:nth-child(8n + 5) { --cc: #db2777; --cc-wash: rgba(219, 39, 119, 0.11); }
  .ic-card:nth-child(8n + 6) { --cc: #ea580c; --cc-wash: rgba(234, 88, 12, 0.11); }
  .ic-card:nth-child(8n + 7) { --cc: #4f46e5; --cc-wash: rgba(79, 70, 229, 0.11); }
  .ic-card:nth-child(8n + 8) { --cc: #0d9488; --cc-wash: rgba(13, 148, 136, 0.11); }

  .ic-card:hover {
    border-color: var(--cc);
    border-top-color: var(--cc);
    box-shadow: 0 6px 18px var(--cc-wash);
    transform: translateY(-2px);
  }

  .ic-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 0 -16px 12px;
    padding: 8px 16px;
    background: var(--cc-wash);
    border-bottom: 1px solid var(--ic-rule-soft);
  }

  .ic-card-docno {
    font-family: var(--ic-font-mono);
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--cc);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ic-card-status {
    flex-shrink: 0;
    padding: 2px 7px;
    font-family: var(--ic-font-mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--ic-done);
    background: rgba(20, 128, 74, 0.09);
  }

  .ic-card-thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 66px;
    margin-bottom: 12px;
  }

  .ic-card-thumb-img {
    max-height: 66px;
    max-width: 100%;
    object-fit: contain;
  }

  .ic-card-title {
    font-family: var(--ic-font-display);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--ic-ink);
    margin: 0 0 6px;
    min-height: 39px;
  }

  .ic-card-desc {
    font-size: 12.5px;
    line-height: 1.55;
    color: var(--ic-ink-soft);
    margin: 0 0 12px;
    min-height: 58px;
  }

  .ic-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding-top: 12px;
    border-top: 1px solid var(--ic-rule-soft);
  }

  .ic-meta-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 12px;
  }

  .ic-meta-row dt {
    flex: 0 0 82px;
    font-family: var(--ic-font-display);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ic-ink-faint);
  }

  .ic-meta-row dd {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-weight: 500;
    color: var(--ic-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ic-meta-link {
    font-family: var(--ic-font-mono);
    font-size: 11.5px;
    color: var(--ic-accent);
    text-decoration: none;
    border-bottom: 1px solid currentColor;
  }

  .ic-card-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 14px;
    padding-top: 11px;
    border-top: 1px solid var(--ic-rule-soft);
    font-family: var(--ic-font-display);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ic-ink-faint);
    transition: color 0.18s ease;
  }

  .ic-card-foot i { transition: transform 0.2s ease; }

  .ic-card:hover .ic-card-foot { color: var(--cc); }
  .ic-card:hover .ic-card-foot i { transform: translateX(4px); }

  /* Footer / pagination */
  .ic-action-bar {
    flex: 0 0 auto;
    padding: 8px 16px;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-top: 2px solid var(--ic-ink);
    border-radius: var(--r-lg);
    animation: ic-rise 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) 0.12s both;
  }

  @keyframes ic-rise {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: none; }
  }

  .clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
  }

  .clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
  }

  /* ═══════════════════════════════════════
     Modal chrome
  ═══════════════════════════════════════ */
  ::v-deep .modal-content {
    border-radius: 14px !important;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(12, 35, 64, 0.35);
  }

  ::v-deep .modal-header {
    height: 62px;
    padding: 12px 20px;
    border-bottom: none !important;
    background: #0c2340 !important;
    color: #f5f9ff;
    font-weight: 600 !important;
  }

  ::v-deep .modal-header * { color: #f5f9ff !important; }

  ::v-deep .modal-body {
    overflow-y: hidden !important;
    overflow-x: hidden !important;
    padding: 0 !important;
    height: 82vh !important;
    max-height: 82vh !important;
  }

  ::v-deep .modal-dialog .modal-content .modal-body {
    overflow-y: hidden !important;
    overflow-x: hidden !important;
    max-height: none !important;
  }

  ::v-deep .modal.fade .modal-dialog { top: -40px !important; }
  ::v-deep .modal-open .modal { overflow-x: hidden !important; overflow-y: hidden !important; }

  ::v-deep .close {
    color: #f5f9ff !important;
    opacity: 0.85;
    font-size: 26px;
    font-weight: 300;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  ::v-deep .close:hover { opacity: 1; transform: rotate(90deg); }
  ::v-deep .modal-backdrop.in { display: none !important; }

  /* Scrollbar inside modal */
  .custom-scrollbar::-webkit-scrollbar { width: 7px; height: 7px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--ic-rule); }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--ic-ink-faint); }

  /* ═══════════════════════════════════════
     Modal header slot
  ═══════════════════════════════════════ */
  .md-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 12px;
    font-family: var(--ic-font-body);
  }

  .md-header-left { display: flex; align-items: center; gap: 14px; min-width: 0; }

  .md-header-icon {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    border-radius: var(--r-sm);
    background: rgba(245, 249, 255, 0.1);
    border: 1px solid rgba(245, 249, 255, 0.18);
  }

  .md-header-title {
    font-family: var(--ic-font-display);
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60vw;
  }

  .md-header-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 3px;
    font-size: 11.5px;
  }

  .md-header-meta > span:not(.md-header-docno) { color: rgba(245, 249, 255, 0.6) !important; }

  .md-header-docno {
    font-family: var(--ic-font-mono);
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #7fb2e8 !important;
    background: rgba(127, 178, 232, 0.14);
    padding: 2px 8px;
    border-radius: var(--r-sm);
  }

  .md-header-sep { opacity: 0.4; }

  /* ═══════════════════════════════════════
     Modal body layout
  ═══════════════════════════════════════ */
  .md-body {
    display: flex;
    height: 82vh;
    font-family: var(--ic-font-body);
    color: var(--ic-ink);
    background: var(--ic-ground);
  }

  .md-left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: var(--ic-surface);
    border-right: 1px solid var(--ic-rule-soft);
  }

  .md-left-scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .md-section { display: flex; flex-direction: column; gap: 10px; }

  .md-section-label {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-bottom: 7px;
    border-bottom: 1px solid var(--ic-rule-soft);
    font-family: var(--ic-font-display);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--ic-ink);
  }

  .md-section-label i { font-size: 11px; color: var(--ic-accent); }

  .md-desc {
    max-height: 160px;
    overflow-y: auto;
    padding: 12px 14px;
    font-size: 13.5px;
    line-height: 1.7;
    color: var(--ic-ink-soft);
    white-space: pre-wrap;
    background: var(--ic-ground);
    border: 1px solid var(--ic-rule-soft);
    border-left: 2px solid var(--ic-accent);
    border-radius: var(--r-md);
  }

  .md-url {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 13px;
    font-size: 13px;
    font-weight: 500;
    color: var(--ic-accent);
    text-decoration: none;
    background: var(--ic-accent-wash);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-sm);
    word-break: break-all;
    transition: border-color 0.18s ease, background 0.18s ease;
  }

  .md-url:hover {
    color: var(--ic-accent);
    border-color: var(--ic-accent);
  }

  .md-customer-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--ic-ground);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-md);
  }

  .md-customer-label {
    flex-shrink: 0;
    font-family: var(--ic-font-display);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ic-ink-faint);
  }

  .md-customer-name {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--ic-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .md-customer-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    color: var(--ic-accent);
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule);
    border-radius: var(--r-sm);
    text-decoration: none;
    transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease;
  }

  .md-customer-link:hover {
    color: var(--ic-on-ink);
    background: var(--ic-accent);
    border-color: var(--ic-accent);
  }

  /* ═══════════════════════════════════════
     Collapsible box (AdminLTE boxWidget)
  ═══════════════════════════════════════ */
  .md-box.box-solid {
    margin-bottom: 0;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-top: 2px solid var(--ic-ink);
    border-radius: var(--r-md);
    box-shadow: none;
  }

  .md-box .box-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    cursor: pointer;
    border-bottom: 1px solid var(--ic-rule-soft);
  }

  .md-box .box-title {
    margin: 0;
    font-family: var(--ic-font-display);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--ic-ink);
  }

  .md-box .box-title i { margin-right: 4px; color: var(--ic-accent); }

  .md-box-count {
    font-family: var(--ic-font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0;
    color: var(--ic-accent);
  }

  .md-box .btn-box-tool {
    padding: 0;
    color: var(--ic-ink-faint);
    background: transparent;
    border: none;
  }

  .md-box .btn-box-tool:hover { color: var(--ic-accent); }

  .md-box .md-box-body {
    max-height: 300px;
    overflow-y: auto;
    padding: 12px;
  }

  .md-box .md-box-body-tall { max-height: 38vh; }

  /* Attachments */
  .md-attachments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
    gap: 10px;
  }

  .md-attach-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    cursor: pointer;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-md);
    transition: border-color 0.18s ease, transform 0.18s ease;
  }

  .md-attach-card:hover {
    border-color: var(--ic-accent);
    transform: translateY(-2px);
  }

  .md-attach-preview {
    position: relative;
    width: 100%;
    height: 112px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--ic-ground);
  }

  .md-attach-img { width: 100%; height: 100%; object-fit: cover; }

  .md-attach-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .md-attach-icon-wrapper i { font-size: 42px; }

  .md-attach-footer {
    padding: 9px 10px;
    background: var(--ic-surface);
    border-top: 1px solid var(--ic-rule-soft);
  }

  .md-attach-filename {
    margin-bottom: 5px;
    font-size: 11.5px;
    font-weight: 600;
    color: var(--ic-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .md-attach-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: var(--ic-ink-faint);
  }

  .md-attach-type {
    padding: 2px 6px;
    font-family: var(--ic-font-mono);
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--ic-accent);
    background: var(--ic-accent-wash);
  }

  /* ═══════════════════════════════════════
     Chat
  ═══════════════════════════════════════ */
  .md-chat-history {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .md-chat-row { display: block; }
  .md-chat-flex { display: flex; align-items: flex-end; gap: 9px; }
  .md-chat-other { justify-content: flex-start; }
  .md-chat-me { justify-content: flex-end; }

  .md-avatar {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-family: var(--ic-font-mono);
    font-size: 13px;
    font-weight: 700;
    color: var(--ic-on-ink);
    background: var(--ic-ink-soft);
    border-radius: var(--r-sm);
  }

  .md-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .md-avatar-me { background: var(--ic-accent); }

  .md-bubble {
    position: relative;
    max-width: 75%;
    min-width: 180px;
    padding: 10px 14px;
    border-radius: var(--r-md);
  }

  .md-bubble-other {
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-left: 2px solid var(--ic-ink-faint);
  }

  .md-bubble-me {
    background: var(--ic-accent-wash);
    border: 1px solid var(--ic-rule-soft);
    border-right: 2px solid var(--ic-accent);
  }

  .md-bubble-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 6px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--ic-rule-soft);
  }

  .md-bubble-meta strong {
    font-size: 12px;
    font-weight: 700;
    color: var(--ic-ink);
  }

  .md-bubble-meta small {
    font-family: var(--ic-font-mono);
    font-size: 10px;
    color: var(--ic-ink-faint);
  }

  .md-bubble-text {
    font-size: 13px;
    line-height: 1.6;
    color: var(--ic-ink-soft);
    word-wrap: break-word;
  }

  .md-bubble-files {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--ic-rule-soft);
  }

  .md-file-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 9px;
    font-size: 11px;
    font-weight: 500;
    color: var(--ic-ink-soft);
    text-decoration: none;
    background: var(--ic-ground);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-sm);
    transition: border-color 0.18s ease, color 0.18s ease;
  }

  .md-file-chip:hover {
    color: var(--ic-accent);
    border-color: var(--ic-accent);
  }

  .md-file-chip-img {
    width: 16px;
    height: 16px;
    object-fit: cover;
    border-radius: var(--r-xs);
  }

  /* ═══════════════════════════════════════
     Right panel
  ═══════════════════════════════════════ */
  .md-right {
    width: 320px;
    flex-shrink: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: var(--ic-ground);
  }

  .md-info-card {
    padding: 16px;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-md);
  }

  .md-info-card-title {
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--ic-rule-soft);
    font-family: var(--ic-font-display);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--ic-ink);
  }

  .md-reporter { display: flex; align-items: center; gap: 13px; }

  .md-reporter-avatar {
    width: 46px;
    height: 46px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-size: 19px;
    color: var(--ic-on-ink);
    background: var(--ic-ink);
    border-radius: var(--r-sm);
  }

  .md-reporter-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .md-reporter-name {
    margin-bottom: 2px;
    font-family: var(--ic-font-display);
    font-size: 14px;
    font-weight: 600;
    color: var(--ic-ink);
  }

  .md-reporter-role {
    font-family: var(--ic-font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ic-ink-faint);
  }

  /* Timeline */
  .md-timeline { display: flex; flex-direction: column; }
  .md-tl-item { display: flex; gap: 13px; position: relative; }

  .md-tl-dot {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
    margin-top: 4px;
    background: var(--ic-surface);
    border: 2px solid var(--ic-rule);
    border-radius: 50%;
  }

  .md-tl-dot-done {
    background: var(--ic-done);
    border-color: var(--ic-done);
    box-shadow: 0 0 0 3px rgba(20, 128, 74, 0.14);
  }

  .md-tl-dot-pending {
    background: var(--ic-surface);
    border-color: var(--ic-rule);
  }

  .md-tl-line {
    position: absolute;
    left: 5px;
    top: 17px;
    bottom: -6px;
    width: 1px;
    background: repeating-linear-gradient(
      to bottom,
      var(--ic-rule) 0 4px,
      transparent 4px 8px
    );
  }

  .md-tl-item:last-child .md-tl-line { display: none; }

  .md-tl-content { flex: 1; min-width: 0; padding-bottom: 18px; }

  .md-tl-label {
    display: block;
    margin-bottom: 3px;
    font-family: var(--ic-font-display);
    font-size: 12.5px;
    font-weight: 500;
    color: var(--ic-ink-soft);
  }

  .md-tl-label-done { font-weight: 600; color: var(--ic-ink); }

  .md-tl-time {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    color: var(--ic-ink-faint);
    word-break: break-word;
  }

  .md-tl-pending {
    color: var(--ic-pending) !important;
    font-weight: 600;
  }

  .md-tl-link {
    padding: 1px 6px;
    font-family: var(--ic-font-mono);
    font-size: 11.5px;
    font-weight: 700;
    color: var(--ic-accent);
    background: var(--ic-accent-wash);
    text-decoration: none;
  }

  .md-tl-link:hover { color: var(--ic-accent); text-decoration: underline; }

  /* Actions */
  .md-actions { display: flex; flex-direction: column; gap: 10px; }

  .md-btn {
    position: relative;
    overflow: hidden;
    width: 100%;
    padding: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: var(--ic-font-display);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: none;
    border-radius: var(--r-md);
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .md-btn-csm {
    color: var(--ic-on-ink);
    background: var(--ic-ink);
  }

  .md-btn-csm:hover { background: var(--ic-accent); }

  .md-btn-done {
    color: var(--ic-ink-faint);
    background: var(--ic-ground);
    border: 1px solid var(--ic-rule-soft);
    cursor: not-allowed;
  }

  /* ═══════════════════════════════════════
     Responsive
  ═══════════════════════════════════════ */
  @media (max-width: 1080px) {
    .ic-card-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  @media (max-width: 880px) {
    .ic-card-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  @media (max-width: 680px) {
    .ic-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 520px) {
    .ic-card-grid { grid-template-columns: minmax(0, 1fr); }
  }

  @media (max-width: 1200px) {
    .ic-filter-row {
      grid-template-columns: 175px minmax(0, 1fr) 100px 90px auto;
    }
  }

  @media (max-width: 768px) {
    .ic-page { padding: 12px; gap: 10px; }

    .ic-masthead {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 18px;
    }

    .ic-masthead-meta {
      padding-left: 0;
      border-left: none;
      text-align: left;
    }

    .ic-title { font-size: 20px; }

    .ic-filter-row { grid-template-columns: 1fr 1fr; }

    .md-body { flex-direction: column; height: auto; }
    .md-right { width: 100%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ic-masthead,
    .ic-filters,
    .ic-card,
    .ic-action-bar {
      animation: none;
    }
  }

  /* ═══════════════════════════════════════
     Dark Mode
  ═══════════════════════════════════════ */
  body.dark-mode .ic-page,
  body.dark-mode .md-header,
  body.dark-mode .md-body {
    --ic-ground: #071120;
    --ic-surface: #0f1e33;
    --ic-ink: #e3ecf7;
    --ic-ink-soft: #8b9db5;
    --ic-ink-faint: #5c6f89;
    --ic-rule: #294057;
    --ic-rule-soft: #1e3049;
    --ic-accent: #5b9bd5;
    --ic-accent-bright: #7fb2e8;
    --ic-accent-wash: rgba(91, 155, 213, 0.1);
    --ic-on-ink: #f5f9ff;
    --ic-done: #34d399;
    --ic-pending: #fbbf24;
    --ic-grid: rgba(227, 236, 247, 0.035);
  }

  body.dark-mode .ic-masthead { background: #050d18; }

  body.dark-mode .ic-input { background: #0b1727; }

  body.dark-mode .ic-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%238b9db5' d='M5 7 0 0h10z'/%3E%3C/svg%3E");
  }

  body.dark-mode .ic-btn-search,
  body.dark-mode .md-btn-csm {
    color: var(--ic-ground);
    background: var(--ic-accent);
  }

  body.dark-mode .ic-btn-search:hover,
  body.dark-mode .md-btn-csm:hover { background: var(--ic-ink); }

  body.dark-mode .md-box {
    border-top-color: var(--ic-accent);
  }

  /* โหมดมืดใช้เฉดสว่างกว่า ไม่งั้นสีเข้มจะจมไปกับพื้น */
  body.dark-mode .ic-card:nth-child(8n + 1) { --cc: #60a5fa; --cc-wash: rgba(96, 165, 250, 0.14); }
  body.dark-mode .ic-card:nth-child(8n + 2) { --cc: #22d3ee; --cc-wash: rgba(34, 211, 238, 0.14); }
  body.dark-mode .ic-card:nth-child(8n + 3) { --cc: #a78bfa; --cc-wash: rgba(167, 139, 250, 0.14); }
  body.dark-mode .ic-card:nth-child(8n + 4) { --cc: #34d399; --cc-wash: rgba(52, 211, 153, 0.14); }
  body.dark-mode .ic-card:nth-child(8n + 5) { --cc: #f472b6; --cc-wash: rgba(244, 114, 182, 0.14); }
  body.dark-mode .ic-card:nth-child(8n + 6) { --cc: #fb923c; --cc-wash: rgba(251, 146, 60, 0.14); }
  body.dark-mode .ic-card:nth-child(8n + 7) { --cc: #818cf8; --cc-wash: rgba(129, 140, 248, 0.14); }
  body.dark-mode .ic-card:nth-child(8n + 8) { --cc: #2dd4bf; --cc-wash: rgba(45, 212, 191, 0.14); }

  body.dark-mode .ic-card-status {
    background: rgba(52, 211, 153, 0.12);
  }

  body.dark-mode .md-reporter-avatar,
  body.dark-mode .md-avatar {
    color: var(--ic-ground);
    background: var(--ic-accent);
  }

  body.dark-mode .md-customer-link:hover {
    color: var(--ic-ground);
  }

  body.dark-mode ::v-deep .modal-header {
    background: #050d18 !important;
    border-bottom: 1px solid #1e3049 !important;
  }

  body.dark-mode ::v-deep .modal-content {
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  }
</style>


<style>
/* Global override for this specific modal - highest specificity */
body .csm-complete-modal.modal .modal-dialog .modal-content .modal-body {
  overflow-y: hidden !important;
  overflow-x: hidden !important;
  max-height: none !important;
}

body .modal.csm-complete-modal .modal-body {
  overflow-y: hidden !important;
  overflow-x: hidden !important;
}
</style>
