<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="ic-page">
          <header class="ic-masthead">
            <div class="ic-masthead-main">
              <span class="ic-eyebrow">CSM &middot; {{ ui.csm_case_board }}</span>
            </div>
            <div class="ic-masthead-meta">
              <span class="ic-meta-label">{{ ui.csm_case_outstanding }}</span>
              <span class="ic-meta-value">{{ totalOpen }} {{ui.bk_menu||'รายการ'}}</span>
            </div>
          </header>

          <div class="ic-board">
            <!-- Column 1: Pending (Software Developer) -->
            <section class="ic-col ic-col--dev">
              <div class="ic-col-head">
                <div class="ic-col-head-left">
                  <span class="ic-col-icon"><i class="fas fa-code"></i></span>
                  <span class="ic-col-text">
                    <span class="ic-col-title">{{ui.csm_v2_status_pending}}</span>
                    <span class="ic-col-sub">{{ ui.csm_case_software_developer }}</span>
                  </span>
                </div>
                <span class="ic-col-count">{{ data_wait.length }}</span>
              </div>
              <div class="ic-col-body">
                <div v-if="data_wait.length === 0" class="ic-empty">
                  <i class="fas fa-check-circle"></i>
                  <p>{{ ui.csm_case_no_pending }}</p>
                </div>
                <article v-for="item in data_wait" :key="item.id" class="kcard" @click="openCaseModal(item)"
                         draggable="true" @dragstart="onDragStart($event, item, 'wait')">
                  <span class="kcard-accent"></span>
                  <div class="kcard-body">
                    <div class="kcard-top">
                      <div class="kcard-thumb">
                        <template v-if="isImageFile(item.ext_first) && item.file_first">
                          <img :src="showPictures(item.file_first)" alt="thumb" />
                        </template>
                        <template v-else>
                          <i class="fa" :class="getFileIcon(item.ext_first)"></i>
                          <span v-if="item.ext_first" class="kcard-ext">{{ item.ext_first.toUpperCase() }}</span>
                        </template>
                      </div>
                      <div class="kcard-title-wrap">
                        <h4 class="kcard-subject">{{ item.subject }}</h4>
                        <div class="kcard-meta-row">
                          <span class="kcard-docno">{{ item.docno }}</span>
                          <span class="kcard-timer" :class="getTimeBadgeClass(getTimeRemaining(item.adddate), 'wait')">
                            <i class="fas fa-clock"></i> {{ formatCountdown(getTimeRemaining(item.adddate)) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p class="kcard-desc">{{ item.desc_remark }}</p>
                    <div class="kcard-footer">
                      <div class="kcard-people">
                        <span class="kcard-person"><i class="fas fa-user"></i> {{ item.adduser_name }}</span>
                      </div>
                      <span v-if="item.comment_desc" class="kcard-comment-chip" :class="{ 'kcard-comment-unread': checkUnreadComment(item) }">
                        <i class="fas fa-comment"></i>
                        <span class="kcard-comment-text">{{ item.comment_desc.text || item.comment_desc || '' }}</span>
                        <span v-if="checkUnreadComment(item)" class="kcard-unread-badge">
                          <span class="kcard-unread-ping"></span>
                          <span class="kcard-unread-core"></span>
                        </span>
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <!-- Column 1.1: Pending (IT Operation) -->
            <section class="ic-col ic-col--it">
              <div class="ic-col-head">
                <div class="ic-col-head-left">
                  <span class="ic-col-icon"><i class="fas fa-server"></i></span>
                  <span class="ic-col-text">
                    <span class="ic-col-title">{{ui.csm_v2_status_pending}}</span>
                    <span class="ic-col-sub">{{ ui.csm_case_it_operation }}</span>
                  </span>
                </div>
                <span class="ic-col-count">{{ data_waitIt.length }}</span>
              </div>
              <div class="ic-col-body">
                <div v-if="data_waitIt.length === 0" class="ic-empty">
                  <i class="fas fa-check-circle"></i>
                  <p>{{ ui.csm_case_no_pending }}</p>
                </div>
                <article v-for="item in data_waitIt" :key="item.id" class="kcard" @click="openCaseModal(item)"
                         draggable="true" @dragstart="onDragStart($event, item, 'waitIt')">
                  <span class="kcard-accent"></span>
                  <div class="kcard-body">
                    <div class="kcard-top">
                      <div class="kcard-thumb">
                        <template v-if="isImageFile(item.ext_first) && item.file_first">
                          <img :src="showPictures(item.file_first)" alt="thumb" />
                        </template>
                        <template v-else>
                          <i class="fa" :class="getFileIcon(item.ext_first)"></i>
                          <span v-if="item.ext_first" class="kcard-ext">{{ item.ext_first.toUpperCase() }}</span>
                        </template>
                      </div>
                      <div class="kcard-title-wrap">
                        <h4 class="kcard-subject">{{ item.subject }}</h4>
                        <div class="kcard-meta-row">
                          <span class="kcard-docno">{{ item.docno }}</span>
                          <span class="kcard-timer" :class="getTimeBadgeClass(getTimeRemaining(item.adddate), 'wait')">
                            <i class="fas fa-clock"></i> {{ formatCountdown(getTimeRemaining(item.adddate)) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p class="kcard-desc">{{ item.desc_remark }}</p>
                    <div class="kcard-footer">
                      <div class="kcard-people">
                        <span class="kcard-person"><i class="fas fa-user"></i> {{ item.adduser_name }}</span>
                      </div>
                      <span v-if="item.comment_desc" class="kcard-comment-chip" :class="{ 'kcard-comment-unread': checkUnreadComment(item) }">
                        <i class="fas fa-comment"></i>
                        <span class="kcard-comment-text">{{ item.comment_desc.text || item.comment_desc || '' }}</span>
                        <span v-if="checkUnreadComment(item)" class="kcard-unread-badge">
                          <span class="kcard-unread-ping"></span>
                          <span class="kcard-unread-core"></span>
                        </span>
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <!-- Column 2: In-Progress -->
            <section class="ic-col ic-col--progress">
              <div class="ic-col-head">
                <div class="ic-col-head-left">
                  <span class="ic-col-icon"><i class="fas fa-spinner ic-spin"></i></span>
                  <span class="ic-col-text">
                    <span class="ic-col-title">{{ ui.csm_v2_status_in_progress }}</span>
                  </span>
                </div>
                <div class="ic-col-head-right">
                  <span class="ic-col-count">{{ filteredInprogress.length }}</span>
                  <label class="ic-toggle">
                    <input type="checkbox" true-value="Y" false-value="N" v-model="searchData['all']" @change="load_data()" />
                    <span class="ic-toggle-track"><span class="ic-toggle-thumb"></span></span>
                    <span class="ic-toggle-text">{{ searchData['all'] === 'Y' ? (ui.erp_all||'All') : ui.csm_case_only_mine }}</span>
                  </label>
                </div>
              </div>
              <div class="ic-col-search" v-if="isDeveloper()">
                <i class="fas fa-search ic-col-search-icon"></i>
                <input type="text"
                       class="ic-col-search-input"
                       :placeholder="ui.csm_case_search_placeholder"
                       v-model="search_inprogress">
              </div>
              <div class="ic-col-body" @dragover.prevent="onDragOver($event, 'doing')" @dragleave="onDragLeave($event, 'doing')" @drop="onDrop($event, 'doing')">
                <div v-if="filteredInprogress.length === 0" class="ic-empty">
                  <i class="fas fa-tasks"></i>
                  <p>{{ ui.csm_case_no_inprogress }}</p>
                </div>
                <article v-for="item in filteredInprogress" :key="item.id" class="kcard" @click="openCaseModal(item)"
                         draggable="true" @dragstart="onDragStart($event, item, 'doing')">
                  <span class="kcard-accent"></span>
                  <div class="kcard-body">
                    <div class="kcard-top">
                      <div class="kcard-thumb">
                        <template v-if="isImageFile(item.ext_first) && item.file_first">
                          <img :src="showPictures(item.file_first)" alt="thumb" />
                        </template>
                        <template v-else>
                          <i class="fa" :class="getFileIcon(item.ext_first)"></i>
                          <span v-if="item.ext_first" class="kcard-ext">{{ item.ext_first.toUpperCase() }}</span>
                        </template>
                      </div>
                      <div class="kcard-title-wrap">
                        <h4 class="kcard-subject">{{ item.subject }}</h4>
                        <div class="kcard-meta-row">
                          <span class="kcard-docno">{{ item.docno }}</span>
                          <span class="kcard-timer">
                            <i class="fas fa-stopwatch"></i> {{ formatCountdown(getWorkingTime(item.accept_date)) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p class="kcard-desc">{{ item.desc_remark }}</p>
                    <div class="kcard-footer">
                      <div class="kcard-people">
                        <span class="kcard-person"><i class="fas fa-user"></i> {{ item.adduser_name || item.add_user }}</span>
                        <span v-if="item.accept_user" class="kcard-person kcard-assignee">
                          <i class="fas fa-user-edit"></i> {{ item.accept_user_name || item.accept_user }}
                        </span>
                      </div>
                      <span v-if="item.comment_desc" class="kcard-comment-chip" :class="{ 'kcard-comment-unread': checkUnreadComment(item) }">
                        <i class="fas fa-comment"></i>
                        <span class="kcard-comment-text">{{ item.comment_desc.text || item.comment_desc || '' }}</span>
                        <span v-if="checkUnreadComment(item)" class="kcard-unread-badge">
                          <span class="kcard-unread-ping"></span>
                          <span class="kcard-unread-core"></span>
                        </span>
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <!-- Column 3: Pending Review (แก้ไขแล้วรอตรวจสอบ) -->
            <section class="ic-col ic-col--review">
              <div class="ic-col-head">
                <div class="ic-col-head-left">
                  <span class="ic-col-icon"><i class="fas fa-search"></i></span>
                  <span class="ic-col-text">
                    <span class="ic-col-title">{{ ui.csm_case_fixed_pending_review }}</span>
                    <span class="ic-col-sub">{{ ui.csm_case_pending_review }}</span>
                  </span>
                </div>
                <div class="ic-col-head-right">
                  <span class="ic-col-count">{{ data_review.length }}</span>
                  <label class="ic-toggle">
                    <input type="checkbox" true-value="Y" false-value="N" v-model="searchData['all2']" @change="load_data()" />
                    <span class="ic-toggle-track"><span class="ic-toggle-thumb"></span></span>
                    <span class="ic-toggle-text">{{ searchData['all2'] === 'Y' ? (ui.erp_all||'All')  : ui.csm_case_only_mine }}</span>
                  </label>
                </div>
              </div>
              <div class="ic-col-body" @dragover.prevent="onDragOver($event, 'review')" @dragleave="onDragLeave($event, 'review')" @drop="onDrop($event, 'review')">
                <div v-if="data_review.length === 0" class="ic-empty">
                  <i class="fas fa-clipboard-check"></i>
                  <p>{{ ui.csm_case_no_review }}</p>
                </div>
                <article v-for="item in data_review" :key="item.id" class="kcard" @click="openCaseModal(item)">
                  <span class="kcard-accent"></span>
                  <div class="kcard-body">
                    <div class="kcard-top">
                      <div class="kcard-thumb">
                        <template v-if="isImageFile(item.ext_first) && item.file_first">
                          <img :src="showPictures(item.file_first)" alt="thumb" />
                        </template>
                        <template v-else>
                          <i class="fa" :class="getFileIcon(item.ext_first)"></i>
                          <span v-if="item.ext_first" class="kcard-ext">{{ item.ext_first.toUpperCase() }}</span>
                        </template>
                      </div>
                      <div class="kcard-title-wrap">
                        <h4 class="kcard-subject">{{ item.subject }}</h4>
                        <div class="kcard-meta-row">
                          <span class="kcard-docno">{{ item.docno }}</span>
                          <span class="kcard-timer">
                            <i class="fas fa-hourglass-half"></i> {{ formatCountdown(getWorkingTime(item.check_date  || item.accept_date)) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p class="kcard-desc">{{ item.desc_remark }}</p>
                    <div class="kcard-footer">
                      <div class="kcard-people">
                        <span class="kcard-person"><i class="fas fa-user"></i> {{ item.adduser_name || item.add_user }}</span>
                        <span v-if="item.accept_user" class="kcard-person kcard-assignee">
                          <i class="fas fa-user-edit"></i> {{ item.accept_user_name || item.accept_user }}
                        </span>
                        <span v-if="item.accept_user" class="kcard-person kcard-assignee">
                          <i class="fas fa-user-check"></i> {{ item.adduser_name }}
                        </span>
                      </div>
                      <span v-if="item.comment_desc" class="kcard-comment-chip" :class="{ 'kcard-comment-unread': checkUnreadComment(item) }">
                        <i class="fas fa-comment"></i>
                        <span class="kcard-comment-text">{{ item.comment_desc.text || item.comment_desc || '' }}</span>
                        <span v-if="checkUnreadComment(item)" class="kcard-unread-badge">
                          <span class="kcard-unread-ping"></span>
                          <span class="kcard-unread-core"></span>
                        </span>
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <!-- Column 4: Overdue -->
            <section class="ic-col ic-col--overdue">
              <div class="ic-col-head">
                <div class="ic-col-head-left">
                  <span class="ic-col-icon"><i class="fas fa-exclamation-triangle"></i></span>
                  <span class="ic-col-text">
                    <span class="ic-col-title">{{ ui.csm_case_overdue }}</span>
                  </span>
                </div>
                <div class="ic-col-head-right">
                  <span class="ic-col-count">{{ data_reject.length }}</span>
                  <label v-if="isDeveloper()" class="ic-toggle">
                    <input type="checkbox" true-value="Y" false-value="N" v-model="searchData['it']" @change="load_data()" />
                    <span class="ic-toggle-track"><span class="ic-toggle-thumb"></span></span>
                    <span class="ic-toggle-text">{{ ui.csm_case_for_it }}</span>
                  </label>
                </div>
              </div>
              <div class="ic-col-body">
                <div v-if="data_reject.length === 0" class="ic-empty">
                  <i class="fas fa-smile"></i>
                  <p>{{ ui.csm_case_no_overdue }}</p>
                </div>
                <article v-for="item in data_reject" :key="item.id" class="kcard" @click="openCaseModal(item)"
                         draggable="true" @dragstart="onDragStart($event, item, 'rej')">
                  <span class="kcard-accent"></span>
                  <div class="kcard-body">
                    <div class="kcard-top">
                      <div class="kcard-thumb">
                        <template v-if="isImageFile(item.ext_first) && item.file_first">
                          <img :src="showPictures(item.file_first)" alt="thumb" />
                        </template>
                        <template v-else>
                          <i class="fa" :class="getFileIcon(item.ext_first)"></i>
                          <span v-if="item.ext_first" class="kcard-ext">{{ item.ext_first.toUpperCase() }}</span>
                        </template>
                      </div>
                      <div class="kcard-title-wrap">
                        <h4 class="kcard-subject">{{ item.subject }}</h4>
                        <div class="kcard-meta-row">
                          <span class="kcard-docno">{{ item.docno }}</span>
                          <span class="kcard-timer time-critical">
                            <i class="fas fa-exclamation-circle"></i> {{ formatCountdown(getOverdueTime(item.adddate)) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p class="kcard-desc">{{ item.desc_remark }}</p>
                    <div class="kcard-footer">
                      <div class="kcard-people">
                        <span class="kcard-person"><i class="fas fa-user"></i> {{ item.adduser_name }}</span>
                      </div>
                      <span v-if="item.comment_desc" class="kcard-comment-chip" :class="{ 'kcard-comment-unread': checkUnreadComment(item) }">
                        <i class="fas fa-comment"></i>
                        <span class="kcard-comment-text">{{ item.comment_desc.text || item.comment_desc || '' }}</span>
                        <span v-if="checkUnreadComment(item)" class="kcard-unread-badge">
                          <span class="kcard-unread-ping"></span>
                          <span class="kcard-unread-core"></span>
                        </span>
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </div>
      </template>
    </re-page>

    <modal-2 ref="modalcase" size="xl" class="csm-complete-modal" :no-scroll="true" :hideFooter="true">
      <template #header>
        <div class="md-header" :class="modalTone">
          <div class="md-header-left">
            <div class="md-header-icon">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <div>
              <div class="md-header-title">{{ selectedCase && selectedCase.subject }}</div>
              <div class="md-header-meta">
                <span class="md-header-docno">{{ selectedCase && selectedCase.docno }}</span>
                <span class="md-header-sep">·</span>
                <span>{{ title_m }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #body v-if="selectedCase">
        <div class="md-body" :class="modalTone">
          <!-- LEFT PANEL -->
          <div class="md-left">
            <div class="md-left-scroll custom-scrollbar">

              <!-- Description -->
              <div class="md-section md-section--desc">
                <div class="md-section-label"><i class="fas fa-align-left"></i>{{ui.csm_v2_description||'รายละเอียด'}}  ( {{ selectedCase.docno}} )</div>
                <textarea class="md-desc custom-scrollbar" readonly :value="selectedCase.desc_remark"></textarea>
              </div>

              <!-- URL -->
              <div class="md-section md-section--url">
                <div class="md-section-label"><i class="fas fa-link"></i> {{ ui.csm_case_website_url }}</div>
                <div class="md-section-scroll custom-scrollbar">
                  <a v-if="selectedCase.website_url && selectedCase.website_url !== '-'"
                     :href="selectedCase.website_url" target="_blank" class="md-url">
                    <i class="fas fa-external-link-alt"></i> {{ selectedCase.website_url }}
                  </a>
                  <div v-else class="md-url md-url--empty">
                    <i class="fas fa-info-circle"></i> {{ ui.csm_case_no_url }}
                  </div>
                </div>
              </div>

              <!-- Customer -->
              <div class="md-section md-section--customer">
                <div class="md-section-label"><i class="fas fa-building"></i> {{ui.csm_v2_customer||'Customer'}}</div>
                <div class="md-section-scroll custom-scrollbar">
                  <div v-if="selectedCase.customer_code &&  selectedCase.pre_event" class="md-customer-row">
                    <span class="md-customer-name">{{ selectedCase.cus_name || '-' }}</span>
                    <a :href="openDetail(selectedCase)" target="_blank" class="md-customer-link" :title="ui.csm_case_view_customer">
                      <i class="fas fa-eye"></i>
                    </a>
                  </div>
                  <div v-else class="md-customer-row md-customer-row--empty">
                    <i class="fas fa-info-circle"></i> {{ui.erp_null||'ไม่มีข้อมูลลูกค้า'}}
                  </div>
                </div>
              </div>

              <!-- Attachments -->
              <div class="md-section md-section--files" v-if="parseIfString(selectedCase.files_path) && parseIfString(selectedCase.files_path).length > 0">
                <div class="md-section-label"><i class="fas fa-paperclip"></i> {{ui.erp_attach_file}}</div>
                <div class="md-attachments custom-scrollbar">
                  <a v-for="(f, idx) in parseIfString(selectedCase.files_path)" :key="idx"
                     :href="['mp4','pdf','jpg','png','jpeg'].includes(getFileExt(f.filename)) ? showPictures(f.filepath) : downLoadFileX(f)"
                     target="_blank" class="md-attach-item"
                     :title="f.filename + ' · ' + formatDateTime(f.adddate || f.add_dt)">
                    <div class="md-attach-icon">
                      <img v-if="['png','jpeg','jpg'].includes(getFileExt(f.filename))" :src="showPictures(f.filepath)" />
                      <i v-else-if="['pdf'].includes(getFileExt(f.filename))" class="fas fa-file-pdf" style="color:#ef4444;"></i>
                      <i v-else-if="['mp4'].includes(getFileExt(f.filename))" class="fas fa-file-video" style="color:#8b5cf6;"></i>
                      <i v-else-if="['doc','docx'].includes(getFileExt(f.filename))" class="fas fa-file-word" style="color:#2563eb;"></i>
                      <i v-else-if="['xls','xlsx'].includes(getFileExt(f.filename))" class="fas fa-file-excel" style="color:#16a34a;"></i>
                      <i v-else class="fas fa-file" style="color:#6b7280;"></i>
                    </div>
                    <div class="md-attach-info">
                      <span class="md-attach-name">{{ f.filename }}</span>
                      <span class="md-attach-date">{{ formatDateTime(f.adddate || f.add_dt) }}</span>
                    </div>
                    <i class="fas fa-download md-attach-dl"></i>
                  </a>
                </div>
              </div>
              <div class="md-section md-section--files" v-else>
                <div class="md-section-label"><i class="fas fa-paperclip"></i> {{ui.erp_attach_file}}</div>
                <div class="md-attachments custom-scrollbar">
                  <div class="md-attach-item md-attach-item--empty">
                    <span class="md-attach-name"><i class="fas fa-info-circle"></i> {{ ui.csm_case_no_attachment }}</span>
                  </div>
                </div>
              </div>

              <!-- Chat history -->
              <div class="md-section md-section--chat" v-if="comment_precase && comment_precase.length > 0">
                <div class="md-section-label"><i class="fas fa-comments"></i> {{ ui.csm_case_replies }}</div>
                <div class="md-chat-history custom-scrollbar" ref="chatHistory">
                  <div v-for="(comment, index) in comment_precase" :key="index" class="md-chat-row">
                    <div class="md-chat-flex" :class="comment.add_user == auth.userid ? 'md-chat-me' : 'md-chat-other'">
                      <div v-if="comment.add_user != auth.userid" class="md-avatar">
                        <img v-if="comment.imgPath || comment.img" :src="showPictures(comment.imgPath || comment.img)" @error="$event.target.style.display='none'" />
                        <span v-else>{{ (comment.add_user || '-').charAt(0).toUpperCase() }}</span>
                      </div>
                      <div class="md-bubble" :class="comment.add_user == auth.userid ? 'md-bubble-me' : 'md-bubble-other'">
                        <button v-if="comment.add_user == auth.userid" class="md-delete-btn" @click="delete_comment_precase(comment)">
                          <i class="fas fa-trash"></i>
                        </button>
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
                        <span v-else>{{ (comment.add_user || '-').charAt(0).toUpperCase() }} </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="md-section md-section--chat" v-else>
                <div class="md-section-label"><i class="fas fa-comments"></i> {{ ui.csm_case_replies }}</div>
                <div class="md-chat-empty">
                  <i class="fas fa-comment-dots"></i>
                  <span>{{ ui.csm_case_no_replies }}</span>
                </div>
              </div>

            </div><!-- end md-left-scroll -->

            <!-- Chat input (sticky bottom) -->
            <div class="md-chat-input-wrap">
              <div class="md-chat-box">
                <div v-if="selectedFiles.length > 0" class="md-file-previews">
                  <div v-for="(file, index) in selectedFiles" :key="index" class="md-file-preview-item">
                    <div v-if="['png','jpeg','jpg','gif'].includes(getFileExt(file.filename))" class="md-preview-img-wrap">
                      <img :src="showPictures(file.filepath)" :alt="file.filename" />
                      <button @click="removeFile(index)" class="md-remove-btn"><i class="fas fa-times"></i></button>
                    </div>
                    <div v-else class="md-preview-file-wrap">
                      <i v-if="['pdf'].includes(getFileExt(file.filename))" class="fas fa-file-pdf"></i>
                      <i v-else-if="['doc','docx'].includes(getFileExt(file.filename))" class="fas fa-file-word"></i>
                      <i v-else-if="['xls','xlsx'].includes(getFileExt(file.filename))" class="fas fa-file-excel"></i>
                      <i v-else class="fas fa-file"></i>
                      <button @click="removeFile(index)" class="md-remove-btn"><i class="fas fa-times"></i></button>
                    </div>
                    <span class="md-preview-name">{{ file.filename }}</span>
                  </div>
                </div>
                <div class="md-input-row">
                  <button @click="openFileUpload" class="md-attach-btn" type="button"><i class="fas fa-paperclip"></i></button>
                  <div class="md-textarea-wrap">
                    <textarea v-model="commentText"
                              @keydown.enter.exact.prevent="createComment"
                              @paste="handlePaste"
                              :placeholder="ui.csm_case_comment_placeholder"
                              class="md-textarea" rows="4" ref="commentTextarea"></textarea>
                  </div>
                  <button @click="createComment"
                          :disabled="!commentText || commentText.trim() === ''"
                          :class="['md-send-btn', { 'md-send-active': commentText && commentText.trim() !== '' }]"
                          type="button">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
              <input type="file" ref="fileInput" multiple style="display:none;" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" @change="handleFileSelect">
            </div>

          </div><!-- end md-left -->

          <!-- RIGHT PANEL -->
          <div class="md-right custom-scrollbar">
            <!-- Reporter -->
            <div class="md-info-card">
              <div class="md-reporter">
                <div class="md-reporter-avatar">
                  <img v-if="selectedCase.img" :src="showPictures(selectedCase.img)" alt="avatar" @error="$event.target.style.display='none'" />
                  <span v-else>{{ (selectedCase.adduser || '-').charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <div class="md-reporter-name">{{ selectedCase.adduser }}</div>
                  <div class="md-reporter-role">{{ui.erp_informer||'ผู้แจ้งปัญหา'}}</div>
                </div>
              </div>
            </div>
            <!-- Timeline -->
            <div class="md-info-card md-info-card--timeline">
              <div class="md-info-card-title">{{ui.csm_v2_status_in_progress||'สถานะดำเนินการ'}}</div>
              <div class="md-timeline">
                <div class="md-tl-item md-tl-done">
                  <div class="md-tl-dot md-tl-dot-done"></div>
                  <div class="md-tl-line"></div>
                  <div class="md-tl-content">
                    <span class="md-tl-label md-tl-label-done">{{ ui.csm_case_tl_submitted }}</span>
                    <span class="md-tl-time">{{selectedCase.adduser }} · {{ formatDateTime(selectedCase.adddate) }}</span>
                  </div>
                </div>
                <div class="md-tl-item" :class="selectedCase.accept_case === 'Y' ? 'md-tl-done' : ''">
                  <div class="md-tl-dot" :class="selectedCase.accept_case === 'Y' ? 'md-tl-dot-done' : 'md-tl-dot-pending'"></div>
                  <div class="md-tl-line"></div>
                  <div class="md-tl-content">
                    <span class="md-tl-label" :class="selectedCase.accept_case === 'Y' ? 'md-tl-label-done' : ''">{{ ui.csm_case_tl_acknowledged }}</span>
                    <span v-if="selectedCase.accept_case === 'Y'" class="md-tl-time">{{ selectedCase.accept_user }} · {{ formatDateTime(selectedCase.accept_date || new Date()) }}</span>
                    <span v-else class="md-tl-time md-tl-pending">{{ ui.csm_case_tl_wait_accept }}</span>
                  </div>
                </div>
                <div class="md-tl-item" :class="selectedCase.check_case === 'Y' ? 'md-tl-done' : ''">
                  <div class="md-tl-dot" :class="selectedCase.check_case === 'Y' ? 'md-tl-dot-done' : 'md-tl-dot-pending'"></div>
                  <div class="md-tl-line"></div>
                  <div class="md-tl-content">
                    <span class="md-tl-label" :class="selectedCase.check_case === 'Y' ? 'md-tl-label-done' : ''">{{ ui.csm_case_pending_review }}</span>
                    <span v-if="selectedCase.check_case === 'Y'" class="md-tl-time">{{ selectedCase.check_user || '-' }}<span v-if="selectedCase.check_date"> · {{ formatDateTime(selectedCase.check_date) }}</span></span>
                    <span v-else class="md-tl-time md-tl-pending">{{ ui.csm_case_tl_not_sent_review }}</span>
                  </div>
                </div>
                <div class="md-tl-item" :class="selectedCase.close_case === 'Y' ? 'md-tl-done' : ''">
                  <div class="md-tl-dot" :class="selectedCase.close_case === 'Y' ? 'md-tl-dot-done' : 'md-tl-dot-pending'"></div>
                  <div class="md-tl-line"></div>
                  <div class="md-tl-content">
                    <span class="md-tl-label" :class="selectedCase.close_case === 'Y' ? 'md-tl-label-done' : ''">{{ui.erp_close||'ปิดงาน'}}</span>
                    <span v-if="selectedCase.close_case === 'Y'" class="md-tl-time">{{ selectedCase.close_user }} · {{ formatDateTime(selectedCase.close_date || new Date()) }}</span>
                  </div>
                </div>
                <div class="md-tl-item" :class="!xt.isEmpty(selectedCase.job_no) ? 'md-tl-done' : ''">
                  <div class="md-tl-dot" :class="!xt.isEmpty(selectedCase.job_no) ? 'md-tl-dot-done' : 'md-tl-dot-pending'"></div>
                  <div class="md-tl-content">
                    <span class="md-tl-label" :class="!xt.isEmpty(selectedCase.job_no) ? 'md-tl-label-done' : ''">
                      {{ ui.csm_case_tl_open_ticket }}
                      <a v-if="!xt.isEmpty(selectedCase.job_no)" :href="openReq(selectedCase)" target="_blank" class="md-tl-link"> {{ selectedCase.job_no }}</a>
                    </span>
                    <span v-if="!xt.isEmpty(selectedCase.job_no)" class="md-tl-time">{{ selectedCase.name_ass_u || '-' }}<span v-if="selectedCase.job_date"> · {{ formatDateTime(selectedCase.job_date) }}</span></span>
                    <span v-else class="md-tl-time md-tl-pending">{{ ui.csm_case_tl_no_ticket }}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Assignee -->
            <div class="md-info-card" v-if="selectedCase.accept_user">
              <div class="md-kv" v-if="selectedCase.ck_modal === 'doing' && selectedCase.accept_date && selectedCase.accept_case === 'Y'">
                <span class="md-kv-label">{{ ui.csm_case_assignee }}</span>
                <span class="md-kv-value">{{ selectedCase.accept_user }}</span>
              </div>
              <div class="md-kv" v-if="selectedCase.ck_modal === 'doing' && selectedCase.accept_date && selectedCase.accept_case === 'Y'">
                <span class="md-kv-label">{{ ui.csm_case_accepted_at }}</span>
                <span class="md-kv-value">{{ formatDateTime(selectedCase.accept_date) }}</span>
              </div>
              <div class="md-kv" v-if="selectedCase.ck_modal === 'review' && selectedCase.check_date && selectedCase.check_case === 'Y'">
                <span class="md-kv-label">{{ui.erp_bd_headed_by||'ผู้ตรวจสอบ'}}</span>
                <span class="md-kv-value">{{ selectedCase.check_user }}</span>
              </div>
              <div class="md-kv" v-if="selectedCase.ck_modal === 'review' && selectedCase.check_date && selectedCase.check_case === 'Y'">
                <span class="md-kv-label">{{ ui.csm_case_sent_review_at }}</span>
                <span class="md-kv-value">{{ formatDateTime(selectedCase.check_date) }}</span>
              </div>
            </div>

            <!-- Checkboxes -->
            <div class="md-info-card md-checks">
              <label class="md-check-label" :class="{ 'md-check-active': selectedCase.accept_case === 'Y' }">
                <input type="checkbox" v-model="selectedCase.accept_case" true-value="Y" false-value="N" :disabled="selectedCase.accept_case === 'Y' && selectedCase.accept_date != null" />
                <span class="md-check-box"><i class="fas fa-check"></i></span>
                <span>รับทราบ</span>
              </label>
              <label class="md-check-label" :class="{ 'md-check-active': selectedCase.check_case === 'Y' }" v-if="selectedCase.ck_modal === 'doing' || selectedCase.ck_modal === 'review'">
                <input type="checkbox" v-model="selectedCase.check_case" true-value="Y" false-value="N" :disabled="selectedCase.accept_case !== 'Y' || selectedCase.accept_user !== auth.userid" />
                <span class="md-check-box"><i class="fas fa-search"></i></span>
                <span>{{ ui.csm_case_send_review }}</span>
              </label>
              <label class="md-check-label" :class="{ 'md-check-active': selectedCase.close_case === 'Y' }">
                <input type="checkbox" v-model="selectedCase.close_case" true-value="Y" false-value="N" :disabled="selectedCase.accept_case !== 'Y' || selectedCase.check_case !== 'Y' || !canCloseOrSendCSM(selectedCase)" />
                <span class="md-check-box"><i class="fas fa-times-circle"></i></span>
                <span>{{ui.erp_close||'ปิดงาน Case'}} </span>
              </label>
            </div>

            <!-- Actions -->
            <div class="md-actions" v-if="selectedCase && xt.isEmpty(selectedCase.job_no)">
              <button class="md-btn md-btn-save" @click.prevent="saveCase(selectedCase)">
                <i class="fas fa-save"></i> {{ui.csm_v2_save||'บันทึก'}}
              </button>
              <button class="md-btn md-btn-csm" @click.prevent="sendToCSM()" :disabled="!canCloseOrSendCSM(selectedCase)">
                <i class="fas fa-paper-plane"></i> {{ ui.csm_case_send_to_csm }}
              </button>
            </div>
            <div class="md-actions" v-if="selectedCase && !xt.isEmpty(selectedCase.job_no)">
              <button class="md-btn md-btn-done" disabled>
                <i class="fas fa-check-circle"></i> {{ui.bk_complete||'Completed'}}
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
  // import { db, auth } from '../../../csm_firebase.js';
  // import { db, auth } from './firebase'

  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } };
  let loading = {};

  export default {
    components: {
      loadingBox
    },
    data() {
      return {
        ui: window.ui,
        xt: $xt,
        auth,
        queryString,
        allData: [],
        data_wait: [],
        data_waitIt: [],
        overduePending: [],
        data_inprogress: [],
        data_review: [],
        data_reject: [],
        selectedCase: {},
        baseUrl,
        timecountdown: 0,
        timerInterval: null,
        files_path: [],
        currentTime: new Date(),
        commentText: '',
        comment_precase: [],
        searchData: {
          all: 'Y',
          all2: 'Y',
          it: 'N'
        },
        refreshInterval: null,
        lastCheckedCreated: null,
        lastCheckedClosed: null,
        storageCheckInterval: null,
        selectedFiles: [],
        uploadedFiles: [],
        loading: false,
        search_inprogress: '',
        title_m: '',
        draggedItem: null,
        dragFromColumn: ''
      };
    },
    methods: {
      openCaseModal(item) {
        // --- ส่วนที่เพิ่ม: บันทึกว่าอ่าน Comment ล่าสุดแล้ว ---
        if (item.comment_desc) {
          let key = 'CSM_READ_' + item.docno;
          let currentComment = typeof item.comment_desc === 'object' ? JSON.stringify(item.comment_desc) : item.comment_desc;
          localStorage.setItem(key, currentComment);
          this.$forceUpdate();
        }
        // ปรับส่วนนี้ให้รองรับทั้ง data_wait และ data_waitIt
        if (this.data_wait.some(c => c.docno === item.docno) || this.data_waitIt.some(c => c.docno === item.docno)) {
          item.ck_modal = 'wait';

        }
        else if (this.data_inprogress.some(c => c.docno === item.docno)) {
          item.ck_modal = 'doing';

        }
        else if (this.data_review.some(c => c.docno === item.docno)) {
          item.ck_modal = 'review';

        }
        else if (this.data_reject.some(c => c.docno === item.docno)) {
          item.ck_modal = 'rej';

        }
        this.title_m = item.accept_position == 'D' ? '(' + this.ui.csm_case_software_developer + ')' : item.accept_position == 'I' ? '(' + this.ui.csm_case_it_operation + ')' : '';
        this.selectedCase = item;
        this.selectedCase.close_case = 'N'
        this.commentText = '';
        this.comment_precase = [];
        this.selectedFiles = [];
        this.$refs.modalcase.setSize("modal-xl");
        this.read_comment_precase(item);
        this.scrollToBottom();
        this.applyModalTone();
        this.$refs.modalcase.openModal();
        // console.log('Selected Case:', this.selectedCase);

      },
      formatDateTime(date) {
        return moment(date, ['DD/MM/YYYY HH:mm:ss', moment.ISO_8601]).format('DD/MM/YYYY, HH:mm:ss');
      },
      formatCountdown(seconds) {
        if (seconds <= 0) return "00:00:00";

        const days = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (days > 0) {
          return `${days} วัน ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      },
      parseDate(dateString) {
        if (!dateString) return null;
        try {
          if (dateString instanceof Date) return dateString;
          if (dateString.includes('/') && dateString.includes(' ')) {
            const [datePart, timePart] = dateString.split(' ');
            const [day, month, year] = datePart.split('/');
            const timeParts = timePart.split(':');
            const hour = timeParts[0];
            const minute = timeParts[1];
            const second = timeParts[2] || '0'; // Default to 0 if seconds not provided
            return new Date(year, month - 1, day, hour, minute, second);
          }
          return new Date(dateString);
        } catch (e) {
          console.error('Error parsing date:', dateString, e);
          return null;
        }
      },
      getTimeRemaining(adddate) {
        if (!adddate) return 0;

        const now = this.currentTime;
        const createdTime = this.parseDate(adddate);
        if (!createdTime) return 0;

        // เปลี่ยนกลับเป็น 1 ชั่วโมง (60 นาที)
        const deadlineTime = new Date(createdTime.getTime() + (60 * 60 * 1000));
        // const deadlineTime = new Date(createdTime.getTime() + (3 * 60 * 1000));

        const remainingMs = deadlineTime.getTime() - now.getTime();
        const remainingSeconds = Math.floor(remainingMs / 1000);

        return remainingSeconds > 0 ? remainingSeconds : 0;
      },
      async moveToOverdue(items) {
        let list = (Array.isArray(items) ? items : [items])
          .filter(i => i && i.docno && this.overduePending.indexOf(i.docno) === -1);

        if (!list.length) return;

        // กันยิงซ้ำระหว่างที่ request เดิมยังไม่กลับ
        list.forEach(i => this.overduePending.push(i.docno));

        try {
          for (const item of list) {
            await this.updateOverTime(item);
          }
          await this.load_data();
        } catch (error) {
          console.error('Error moving case to overdue:', error);
        } finally {
          list.forEach(i => {
            let idx = this.overduePending.indexOf(i.docno);
            if (idx !== -1) this.overduePending.splice(idx, 1);
          });
        }
      },
      getWorkingTime(acceptDate) {
        if (!acceptDate) return 0;

        const now = this.currentTime;
        const acceptedTime = this.parseDate(acceptDate);

        if (!acceptedTime) return 0;

        const workingMs = now.getTime() - acceptedTime.getTime();
        const workingSeconds = Math.floor(workingMs / 1000);

        // Always return 0 or positive, never negative
        return workingSeconds >= 0 ? workingSeconds : 0;
      },
      getOverdueTime(adddate) {
        if (!adddate) return 0;

        const now = this.currentTime;
        const createdTime = this.parseDate(adddate);
        if (!createdTime) return 0;

        // เปลี่ยนกลับเป็น 1 ชั่วโมง (60 นาที) เหมือนกับ getTimeRemaining
        const deadlineTime = new Date(createdTime.getTime() + (60 * 60 * 1000));
        // const deadlineTime = new Date(createdTime.getTime() + (3 * 60 * 1000));

        const overdueMs = now.getTime() - deadlineTime.getTime();
        const overdueSeconds = Math.floor(overdueMs / 1000);

        return overdueSeconds > 0 ? overdueSeconds : 0;
      },
      startRefreshTimer() {
        // Clear existing refresh interval if any
        if (this.refreshInterval) {
          clearInterval(this.refreshInterval);
        }

        // Set up refresh every 2 minutes (120000 ms)
        this.refreshInterval = setInterval(async () => {
          try {
            await this.load_data();
          } catch (error) {
            console.error('Auto refresh error:', error);
          }
        }, 120000); // 2 minutes
      },
      startCaseTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
          this.currentTime = new Date();

          // รวมเคสที่หมดเวลาของทั้ง Software Developer และ IT Operation
          // แล้วส่งไปย้ายทีเดียว เพื่อให้ reload แค่รอบเดียว
          let expired = [];
          [this.data_wait, this.data_waitIt].forEach(list => {
            list.forEach(item => {
              if (item.accept_case !== "N" || item.close_case !== "N") return;
              if (this.overduePending.indexOf(item.docno) !== -1) return;
              if (this.getTimeRemaining(item.adddate) > 0) return;
              expired.push(item);
            });
          });

          if (expired.length) this.moveToOverdue(expired);
        }, 1000);
      },
      getFileIcon(extension) {
        if (!extension) return 'fa-file';

        const ext = extension.toLowerCase();
        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'];
        const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
        const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
        const spreadsheetExtensions = ['xls', 'xlsx', 'csv'];
        const presentationExtensions = ['ppt', 'pptx'];
        const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];

        if (imageExtensions.includes(ext)) return 'fa-image';
        if (videoExtensions.includes(ext)) return 'fa-video';
        if (documentExtensions.includes(ext)) return 'fa-file-text';
        if (spreadsheetExtensions.includes(ext)) return 'fa-file-excel';
        if (presentationExtensions.includes(ext)) return 'fa-file-powerpoint';
        if (archiveExtensions.includes(ext)) return 'fa-file-archive';

        return 'fa-file';
      },
      isImageFile(extension) {
        if (!extension) return false;
        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'];
        return imageExtensions.includes(extension.toLowerCase());
      },
      applyModalTone() {
        // modal-2 ย้าย .modal ไปแปะที่ body ตอน mount คลาสจาก template จึงส่งไปไม่ถึง
        // ต้องติดคลาสที่ element จริงเอง เพื่อให้แถบ header รับสีตามสถานะได้
        let el = this.$refs.modalcase && this.$refs.modalcase.$refs.myModal;
        if (!el) return;

        ['dev', 'it', 'progress', 'review', 'overdue'].forEach(t => el.classList.remove('csm-tone--' + t));
        el.classList.add('csm-' + this.modalTone);
      },
      parseIfString(data) {
        try {
          return typeof data === 'string' ? JSON.parse(data) : data;
        } catch (e) {
          console.error('Failed to parse files_path JSON', e);
          return [];
        }
      },
      showPictures(x) {
        return window.dataServer + "Api/File/DownLoad?id=" + x
      },
      getFileExt(f) {
        return f?.split('.').pop().toLowerCase()
      },
      downLoadFileX(x) {
        return window.dataServer + `API/File/DownLoad?id=${x.filepath}&download=true&filename=${x.filename || ''}`
      },
      downloadFile(x) {
        let filepath = $xt.isEmpty(x.filepath) ? x.filepath_cloud : x.filepath
        if (this.queryString.mobile == 'Y') {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 'filename': x.docfilename, 'filepath': filepath, 'extension': x.ext_file }))
        }
        else {
          window.open(window.dataServer + `Api/File/DownLoad?id=${filepath}&download=true&filename=${x?.filename}&isAnywhere=true`, '_blank')
        }
      },
      async load_data() {
        try {
          let action = `CSM/Data/CSM_PreCase_Readlist?all=${this.searchData.all}&all2=${this.searchData.all2}&it=${this.searchData.it}`;
       
          let rsps = await $xt.getServer(action);
            let pendingList = $linq(rsps.data.pendingReview).orderByDescending(x => x.check_date).toArray();

          this.allData = rsps.data || [];
          this.data_wait = rsps.data.waitingDev || [];
          this.data_waitIt = rsps.data.waitingIt || [];
          this.data_inprogress = rsps.data.inProgress || [];
          this.data_review = pendingList;
          this.data_reject = rsps.data.reject || [];

          this.startCaseTimer();
          this.startRefreshTimer();
        } catch (error) {
          $msg.alert('Error', error.toString(), 'danger');
        }
      },
      async updateOverTime(x) {
        try {
          let form = { form: x };
          let action = `CSM/Data/CSM_PreCase_Update_OverTime`;
          let rsps = await $xt.postServerJson(action, form);

          let newCaseData = rsps.data || x;

       
        } catch (error) {
          console.error('Error updating overdue case:', error);
          $msg.alert('Error', error.toString(), 'danger');
        }
      },
      async saveCase(x) {
        if (!this.selectedCase) {
          $msg.alert('Error', this.ui.csm_case_alert_select_case, 'warning');
          return;
        }

        if (!$xt.isEmpty(this.commentText) && this.commentText.trim() !== '') {
          this.createComment();
        }

        let f = {
          form: x,
          ck_modal: x.ck_modal
        };

        // console.log('f', f);

        // return

        try {
          let action = `CSM/Data/CSM_PreCase_Update`;
          const response = await $xt.postServerJson(action, f);

          let newCaseData = response.data.header || [];

          // ถ้าปิด case ให้แจ้งหน้า case complete ด้วย
          if (x.close_case === "Y") {
            localStorage.setItem('CSM_CASE_COMPLETED', Date.now().toString());
          }

          // Determine the correct SignalR message based on case status changes
          // if (x.close_case === "Y") {
          //     // Case is being closed - send to complete
          //   this.signalR.reHub.server.sendNewCaseComplete(newCaseData);
          // } else if (x.accept_case === "Y") {
          //     // Case is being accepted
          //     if (x.ck_modal === 'wait') {
          //         // From waiting to processing
          //         this.signalR.reHub.server.sendCasePendingToProcessing(newCaseData);
          //     } else if (x.ck_modal === 'rej') {
          //         // From overdue to processing
          //         this.signalR.reHub.server.sendCaseOverTimeToProcessing(newCaseData);
          //     }
          // }

          $notify.success(this.ui.alert_save_success);
          this.$refs.modalcase.closeModal();
          this.load_data();

        } catch (error) {
          $msg.alert('Error', error.toString(), 'danger');
        }
      },
      async createComment() {
        try {
          if ($xt.isEmpty(this.commentText)) {
            $msg.alert('คำเตือน', this.ui.csm_v2_alert_input_comment, 'warning');
            return;
          }

          if (!this.selectedCase || !this.selectedCase.docno) {
            $msg.alert('Error', this.ui.csm_case_alert_case_not_found, 'danger');
            return;
          }


          let comment = {
            job_no: this.selectedCase.docno,
            // description: this.commentText,
            description: JSON.stringify({
              text: this.commentText,
              files: this.selectedFiles || []
            }),
            ref_itemno: this.selectedCase.itemno || 0,
            add_user: this.auth.userid,
            add_dt: new Date(),
          };

          let form = {
            comment: comment,
          };

         // console.log('Creating comment with form:', form);


          // return

          loading.show();
          let action = 'CSM/Data/CSM_CreateComment_PreCase';
          let response = await $xt.postServerJson(action, form);
          this.selectedFiles = []; // Clear selected files after sending comment
          $(this.$refs.fileInput).val('')
          if (!response.success) {
            throw response.error;
          }

          if (response.success) {
            this.commentText = '';
            await this.read_comment_precase(this.selectedCase);
            this.scrollToBottom();
            $notify.success(this.ui.csm_case_comment_sent);
          }
        } catch (error) {
          console.error('Error creating comment:', error);
          $msg.alert('Error', error.toString(), 'danger');
        } finally {
          loading.hide();
        }
      },
      async read_comment_precase(x) {
        try {
          if (!x || !x.docno) {
            console.warn('No case or docno provided for reading comments');
            this.comment_precase = [];
            return;
          }

          let docno = x.docno;
          let action = `CSM/Data/CSM_ReadComment_PreCase?docno=${docno}`;
          let response = await $xt.getServer(action);

          if (response.success) {
            this.comment_precase = response.data.commentData || [];
            this.scrollToBottom();
          } else {
            this.comment_precase = [];
          }

        } catch (error) {
          this.comment_precase = [];
          $msg.alert('Error', this.ui.csm_case_alert_load_comment_error + ': ' + error.toString(), 'danger');
        }
      },
      async delete_comment_precase(x) {
        if (!await $msg.confirm(this.ui.csm_v2_confirm_delete_comment)) {
          return;
        }
        try {
          let comment = {
            job_no: x.job_no,
            itemno: x.itemno,
          }

          let f = {
            comment: comment
          };

          loading.show();
          let act = `CSM/Data/CSM_DeleteComment_PreCase`;
          let rsp = await $xt.postServerJson(act, f);

          if (!rsp.success) {
            throw rsp.error;
          }

          $notify.success(this.ui.alert_delete_success);

          // Reload comments for the current case
          await this.read_comment_precase(this.selectedCase);

        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        } finally {
          loading.hide();
        }
      },
      async sendToCSM() {
        this.selectedCase.accept_case = 'Y';
        // this.selectedCase.close_case = 'Y';
        let f = this.selectedCase
        // console.log('f', sb2);
        // this.saveCase(f)
        // return
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

        // แก้ไข: ใช้ files_path แทน picture และตรวจสอบว่ามีข้อมูลหรือไม่
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
          formData,
          detailData,
          attachmentData
        }))
        window.open(baseUrl + `page/transaction/v_csm_trn_001/`)
        this.saveCase(f)
      },
      handleStorageChange(event) {
        if (event.key === 'CSM_CASE_CREATED' || event.key === 'CSM_CASE_CLOSED') {
          this.load_data();
          localStorage.removeItem(event.key);
        }
      },
      openFileUpload() {
        this.$refs.fileInput.click();
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

          let max = this.selectedFiles.length == 0 ? 1 : ($linq(this.selectedFiles).max(x => x.itemno) || 0) + 1
          this.selectedFiles.push({
            itemno: max,
            filename: rsp.filename,
            filepath: rsp.id
            // adduser: this.auth.userid,
            // add_dt: new Date
          })
        }
        catch (ex) {
          $msg.alert(`${this.ui.erp_error}`, ex.toString(), `danger`)
        }
        finally {
          this.loading = false
        }
      },
      removeFile(index) {
        this.selectedFiles.splice(index, 1);
      },
      isDeveloper() {
        let department = auth.empcode.substring(0, 2);
        return department == 'IT';
      },
      canCloseOrSendCSM(item) {
        if (!item) return false;
        let currentUser = this.auth.userid;
        // เฉพาะ adduser (ผู้แจ้ง) หรือ check_user (ผู้ตรวจสอบ) เท่านั้นที่สามารถปิด Case หรือ Send to CSM ได้
        return (item.adduser === currentUser || item.add_user === currentUser || item.check_user === currentUser);
      },
      // ═══ Drag & Drop ═══
      onDragStart(event, item, fromColumn) {
        event.dataTransfer.setData('text/plain', JSON.stringify({ docno: item.docno, fromColumn }));
        event.dataTransfer.effectAllowed = 'move';
        this.draggedItem = item;
        this.dragFromColumn = fromColumn;
        event.target.classList.add('kcard-dragging');
        // ลบ class เมื่อ drag จบ
        event.target.addEventListener('dragend', () => {
          event.target.classList.remove('kcard-dragging');
        }, { once: true });
      },
      onDragOver(event, targetColumn) {
        // อนุญาตให้ drop เฉพาะกรณีที่ถูกต้อง
        let from = this.dragFromColumn;
        let allowed = false;

        if (targetColumn === 'doing' && ['wait', 'waitIt', 'rej'].includes(from)) {
          allowed = true;
        } else if (targetColumn === 'review' && from === 'doing') {
          // เฉพาะ accept_user ของ case นั้นเท่านั้นที่ลากไป review ได้
          if (this.draggedItem && this.draggedItem.accept_user === this.auth.userid) {
            allowed = true;
          }
        }

        if (allowed) {
          event.dataTransfer.dropEffect = 'move';
          event.currentTarget.classList.add('column-drop-active');
        } else {
          event.dataTransfer.dropEffect = 'none';
        }
      },
      onDragLeave(event, targetColumn) {
        event.currentTarget.classList.remove('column-drop-active');
      },
      async onDrop(event, targetColumn) {
        event.currentTarget.classList.remove('column-drop-active');

        let item = this.draggedItem;
        let from = this.dragFromColumn;
        if (!item) return;

        let allowed = false;
        if (targetColumn === 'doing' && ['wait', 'waitIt', 'rej'].includes(from)) {
          allowed = true;
        } else if (targetColumn === 'review' && from === 'doing') {
          // เฉพาะ accept_user ของ case นั้นเท่านั้นที่ลากไป review ได้
          if (item.accept_user === this.auth.userid) {
            allowed = true;
          }
        }

        if (!allowed) {
          if (targetColumn === 'review' && from === 'doing' && item.accept_user !== this.auth.userid) {
            $msg.alert(this.ui.csm_case_alert_cannot_proceed, this.ui.csm_case_alert_only_assignee, 'warning');
          }
          this.draggedItem = null;
          this.dragFromColumn = '';
          return;
        }

        // ตั้งค่าสถานะตาม target
        if (targetColumn === 'doing') {
          item.accept_case = 'Y';
          item.check_case = 'N';
          item.close_case = 'N';
          item.ck_modal = from === 'rej' ? 'rej' : 'wait';
        } else if (targetColumn === 'review') {
          item.accept_case = 'Y';
          item.check_case = 'Y';
          item.close_case = 'N';
          item.ck_modal = 'doing';
        }

        // เรียก API update
        try {
          let f = {
            form: item,
            ck_modal: item.ck_modal
          };
          let action = `CSM/Data/CSM_PreCase_Update`;
          await $xt.postServerJson(action, f);
          $notify.success(this.ui.csm_case_move_success);
          await this.load_data();
        } catch (error) {
          $msg.alert('Error', error.toString(), 'danger');
        }

        this.draggedItem = null;
        this.dragFromColumn = '';
      },
      getTimeBadgeClass(seconds, type) {
        if (type !== 'wait') return 'time-wait';
        if (seconds <= 0) return 'time-wait time-critical';
        if (seconds <= 600) return 'time-wait time-urgent';   // <= 10 min
        if (seconds <= 1800) return 'time-wait time-warning'; // <= 30 min
        return 'time-wait';
      },
      async handleFileSelect(event) {
        const files = Array.from(event.target.files);
        for (let i = 0; i < files.length; i++) {
          await this.uploadFiletoTemp(files[i]);
        }
        // Reset input
        event.target.value = '';
      },
      checkUnreadComment(item) {
        if (!item.comment_desc) return false;
        let myUser = this.auth.userid;

        let isRelated = (item.add_user == myUser) || (item.accept_user == myUser);
        if (!isRelated) return false;
        // ------------------------------------

        let currentComment = typeof item.comment_desc === 'object' ? JSON.stringify(item.comment_desc) : item.comment_desc;
        if (currentComment === '' || currentComment === '{}' || currentComment === 'null') return false;

        let key = 'CSM_READ_' + item.docno;
        let lastRead = localStorage.getItem(key);

        return lastRead !== currentComment;
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
      scrollToBottom() {
        this.$nextTick(() => {
          const el = this.$refs.chatHistory;
          if (el) el.scrollTop = el.scrollHeight;
        });
        setTimeout(() => {
          const el = this.$refs.chatHistory;
          if (el) el.scrollTop = el.scrollHeight;
        }, 150);
      },
      // เพิ่มต่อจาก handleFileSelect หรือ methods อื่นๆ
      async handlePaste(event) {
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;

        for (let index in items) {
          const item = items[index];

          // ตรวจสอบว่าเป็นไฟล์ (และเป็นประเภท image)
          if (item.kind === 'file' && item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();

            // แปลง Blob เป็น File Object เพื่อให้เข้ากับ Method uploadFiletoTemp เดิมของคุณ
            const file = new File([blob], `pasted_image_${Date.now()}.png`, { type: blob.type });

            // เรียกใช้ Method uploadFiletoTemp ที่คุณเขียนไว้แล้ว
            await this.uploadFiletoTemp(file);

            // ป้องกันไม่ให้มันวาง Text ที่อาจติดมา (ถ้าต้องการ)
            // event.preventDefault();
          }
        }
      },
      openDetail(x) {
        return this.baseUrl + `page/CustomerDataView?customer_code=${x.customer_code}&pre_event=${x.pre_event}`
      },
      updatePageTitle() {
        if (!page) return;
        let title = this.ui.csm_case_page_title;
        if (this.totalPending > 0) title += ` (${this.totalPending})`;
        page.pageTitle = title;
        document.title = title;
      },
    },
    computed: {
      totalOpen() {
        return this.data_wait.length + this.data_waitIt.length
          + this.filteredInprogress.length + this.data_review.length + this.data_reject.length;
      },
      totalPending() {
        return this.data_wait.length + this.data_waitIt.length;
      },
      modalTone() {
        let c = this.selectedCase;
        if (!c) return 'tone--dev';
        if (c.ck_modal === 'doing') return 'tone--progress';
        if (c.ck_modal === 'review') return 'tone--review';
        if (c.ck_modal === 'rej') return 'tone--overdue';
        return c.accept_position === 'I' ? 'tone--it' : 'tone--dev';
      },

      isChatSpaceLimited() {
        // 1. เช็คว่ารายละเอียด (Description) ยาวไหม? (เช่น ยาวเกิน 100 ตัวอักษร)
        let desc = this.selectedCase.desc_remark || '';
        let isDescLong = desc.length > 200;

        // 2. เช็คว่ามีการเลือกไฟล์ค้างไว้ไหม? (จากข้อก่อนหน้า)
        let hasFiles = this.selectedFiles && this.selectedFiles.length > 0;

        // ถ้าเข้าเงื่อนไขใดเงื่อนไขหนึ่ง ให้ถือว่าพื้นที่จำกัด
        return isDescLong || hasFiles;
      },
      filteredInprogress() {
        if (!this.search_inprogress) {
          return this.data_inprogress;
        }

        let lowerSearch = this.search_inprogress.toLowerCase();

        return this.data_inprogress.filter(item => {
          return (item.subject && item.subject.toLowerCase().includes(lowerSearch)) ||
            (item.desc_remark && item.desc_remark.toLowerCase().includes(lowerSearch)) ||
            (item.docno && item.docno.toLowerCase().includes(lowerSearch)) ||
            (item.adduser_name && item.adduser_name.toLowerCase().includes(lowerSearch));
        });
      },
    },
    watch: {
      totalPending() {
        this.updatePageTitle();
      },
    },
    async mounted() {
      page = this.$refs.page
      this.updatePageTitle()
      loading = this.$refs.myLB

      loading.show();

      $xt.sleep(3000);
      await this.load_data()

      // ฟัง localStorage changes เพื่อรีเฟรชข้อมูลเมื่อมีการสร้าง Case ใหม่
      window.addEventListener('storage', this.handleStorageChange);

      // เช็ค localStorage เป็นระยะเพื่อรองรับการเปลี่ยนแปลงในหน้าเดียวกัน
      this.storageCheckInterval = setInterval(() => {
        const lastCreated = localStorage.getItem('CSM_CASE_CREATED');
        const lastClosed = localStorage.getItem('CSM_CASE_CLOSED');

        if (lastCreated && (!this.lastCheckedCreated || lastCreated !== this.lastCheckedCreated)) {
          this.lastCheckedCreated = lastCreated;
          this.load_data();
          // ลบ flag หลังจากใช้งานแล้ว
          localStorage.removeItem('CSM_CASE_CREATED');
        }

        if (lastClosed && (!this.lastCheckedClosed || lastClosed !== this.lastCheckedClosed)) {
          this.lastCheckedClosed = lastClosed;
          this.load_data();
          // ลบ flag หลังจากใช้งานแล้ว
          localStorage.removeItem('CSM_CASE_CLOSED');
        }
      }, 1000);

      loading.hide();
    },
    beforeUnmount() {
      // Clean up timer when component is destroyed
      // if (this.timerInterval) {
      //     clearInterval(this.timerInterval);
      // }
      // Clean up refresh timer when component is destroyed
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
      // Clean up storage check interval
      if (this.storageCheckInterval) {
        clearInterval(this.storageCheckInterval);
      }
      // Remove event listener
      window.removeEventListener('storage', this.handleStorageChange);
    },


  };

</script>

<style scoped>
  /* ═══════════════════════════════════════
     Tokens — navy / white + status accents
  ═══════════════════════════════════════ */
  .ic-page,
  .md-header,
  .md-body {
    --ic-ground: #e9f0fb;
    --ic-surface: #ffffff;
    --ic-ink: #0f2242;
    --ic-ink-soft: #5b6f8c;
    --ic-ink-faint: #94a3b8;
    --ic-rule: #cbd8e8;
    --ic-rule-soft: #e2ebf8;
    --ic-accent: #2563eb;
    --ic-accent-bright: #93c5fd;
    --ic-accent-wash: rgba(37, 99, 235, 0.11);
    --ic-on-ink: #f5f9ff;
    --ic-on-accent: #ffffff;
    --st-on: #ffffff;
    --ic-done: #059669;
    --ic-pending: #d97706;
    --ic-danger: #dc2626;
    --ic-grid: rgba(37, 99, 235, 0.07);
    --r-xs: 4px;
    --r-sm: 7px;
    --r-md: 10px;
    --r-lg: 14px;
    --ic-font-display: 'Prompt', 'Sarabun', sans-serif;
    --ic-font-body: 'Sarabun', sans-serif;
    --ic-font-meta: 'Manrope', 'Prompt', sans-serif;
  }

  /* ตัวเลข/ป้ายภาษาอังกฤษใช้ Manrope และบังคับความกว้างตัวเลขให้เท่ากัน */
  .ic-page [class*="docno"],
  .ic-page [class*="count"],
  .ic-page [class*="timer"],
  .md-body [class*="docno"],
  .md-header [class*="docno"] {
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1;
  }

  /* ═══════════════════════════════════════
     Page shell
  ═══════════════════════════════════════ */
  .ic-page {
    height: calc(100vh - 120px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 14px 18px;
    gap: 12px;
    background-color: var(--ic-ground);
    background-image:
      linear-gradient(var(--ic-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--ic-grid) 1px, transparent 1px);
    background-size: 26px 26px;
    font-family: var(--ic-font-body);
    color: var(--ic-ink);
  }

  .ic-masthead {
    flex: 0 0 auto;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 10px 20px;
    background: linear-gradient(105deg, #0f2242 0%, #16325c 55%, #1d4ed8 160%);
    border-radius: var(--r-lg);
    animation: ic-rise 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) both;
  }

  /* แถบสีล่างสุด = legend ของทั้ง 5 คอลัมน์ */
  .ic-masthead::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: linear-gradient(
      to right,
      #2563eb 0 20%,
      #0891b2 20% 40%,
      #eab308 40% 60%,
      #7c3aed 60% 80%,
      #dc2626 80% 100%
    );
  }

  .ic-masthead::after {
    content: '';
    position: absolute;
    top: -60%;
    right: -80px;
    width: 320px;
    height: 220%;
    background: radial-gradient(closest-side, rgba(147, 197, 253, 0.28), transparent);
    pointer-events: none;
  }

  .ic-masthead-main {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: baseline;
    gap: 14px;
  }

  .ic-eyebrow {
    font-family: var(--ic-font-meta);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.22em;
    color: var(--ic-accent-bright);
  }

  .ic-title {
    font-family: var(--ic-font-display);
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--ic-on-ink);
    margin: 0;
  }

  .ic-masthead-meta {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .ic-meta-label {
    font-family: var(--ic-font-meta);
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(245, 249, 255, 0.45);
  }

  .ic-meta-value {
    font-family: var(--ic-font-display);
    font-size: 14px;
    font-weight: 500;
    color: var(--ic-accent-bright);
  }

  /* ═══════════════════════════════════════
     Board
  ═══════════════════════════════════════ */
  .ic-board {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    gap: 10px;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
  }

  .ic-board::-webkit-scrollbar { height: 7px; }
  .ic-board::-webkit-scrollbar-track { background: transparent; }
  .ic-board::-webkit-scrollbar-thumb { background: var(--ic-rule); }

  .ic-col {
    flex: 1 1 0;
    min-width: 252px;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-top: 3px solid var(--st);
    border-radius: var(--r-lg);
    animation: ic-rise 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) both;
  }

  /* --st = สีเต็มสำหรับพื้น/ขอบ, --st-ink = เฉดเข้มกว่าไว้ใช้กับตัวหนังสือเล็ก */
  .ic-col--dev {
    --st: #2563eb; --st-ink: #1d4ed8;
    --st-wash: rgba(37, 99, 235, 0.13); --st-glow: rgba(37, 99, 235, 0.22);
    animation-delay: 0.04s;
  }

  .ic-col--it {
    --st: #0891b2; --st-ink: #0e7490;
    --st-wash: rgba(8, 145, 178, 0.13); --st-glow: rgba(8, 145, 178, 0.22);
    animation-delay: 0.09s;
  }

  .ic-col--progress {
    --st: #eab308; --st-ink: #a16207; --st-on: #3d2c00;
    --st-wash: rgba(234, 179, 8, 0.16); --st-glow: rgba(234, 179, 8, 0.30);
    animation-delay: 0.14s;
  }

  .ic-col--review {
    --st: #7c3aed; --st-ink: #6d28d9;
    --st-wash: rgba(124, 58, 237, 0.13); --st-glow: rgba(124, 58, 237, 0.22);
    animation-delay: 0.19s;
  }

  .ic-col--overdue {
    --st: #dc2626; --st-ink: #b91c1c;
    --st-wash: rgba(220, 38, 38, 0.13); --st-glow: rgba(220, 38, 38, 0.22);
    animation-delay: 0.24s;
  }

  .ic-col-head {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    background: var(--st-wash);
    border-bottom: 1px solid var(--ic-rule-soft);
  }

  .ic-col-head-left {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }

  .ic-col-icon {
    width: 27px;
    height: 27px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--st-on);
    background: var(--st);
    border-radius: var(--r-sm);
    box-shadow: 0 2px 6px var(--st-glow);
  }

  .ic-col-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .ic-col-title {
    font-family: var(--ic-font-display);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: var(--ic-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ic-col-sub {
    font-family: var(--ic-font-meta);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--st-ink);
    opacity: 0.75;
  }

  .ic-col-head-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .ic-col-count {
    min-width: 26px;
    padding: 3px 7px;
    text-align: center;
    font-family: var(--ic-font-meta);
    font-size: 11.5px;
    font-weight: 800;
    line-height: 1.15;
    color: var(--st-on);
    background: var(--st);
    border-radius: 999px;
    box-shadow: 0 2px 6px var(--st-glow);
  }

  .ic-spin { animation: ic-spin 2s linear infinite; }

  /* Toggle */
  .ic-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    cursor: pointer;
    user-select: none;
  }

  .ic-toggle input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .ic-toggle-track {
    position: relative;
    width: 28px;
    height: 15px;
    flex-shrink: 0;
    background: var(--ic-rule);
    border-radius: 8px;
    transition: background 0.2s ease;
  }

  .ic-toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 11px;
    height: 11px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s ease;
  }

  .ic-toggle input:checked + .ic-toggle-track { background: var(--st); }
  .ic-toggle input:checked + .ic-toggle-track .ic-toggle-thumb { transform: translateX(13px); }
  .ic-toggle input:focus-visible + .ic-toggle-track { box-shadow: 0 0 0 2px var(--ic-accent-wash); }

  .ic-toggle-text {
    font-family: var(--ic-font-meta);
    font-size: 10px;
    letter-spacing: 0.06em;
    color: var(--ic-ink-soft);
  }

  /* Column search */
  .ic-col-search {
    position: relative;
    flex: 0 0 auto;
    padding: 8px 12px;
    border-bottom: 1px solid var(--ic-rule-soft);
  }

  .ic-col-search-icon {
    position: absolute;
    left: 22px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    color: var(--ic-ink-faint);
    pointer-events: none;
  }

  .ic-col-search-input {
    width: 100%;
    height: 30px;
    padding: 0 10px 0 28px;
    font-family: var(--ic-font-body);
    font-size: 12px;
    color: var(--ic-ink);
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule);
    border-bottom-width: 2px;
    border-radius: var(--r-sm);
    outline: none;
    transition: border-color 0.18s ease, background 0.18s ease;
  }

  .ic-col-search-input:focus {
    border-bottom-color: var(--st);
    background: var(--ic-accent-wash);
  }

  .ic-col-search-input::placeholder { color: var(--ic-ink-faint); }

  /* Column body */
  .ic-col-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: background 0.18s ease, box-shadow 0.18s ease;
  }

  .ic-col-body::-webkit-scrollbar { width: 6px; }
  .ic-col-body::-webkit-scrollbar-track { background: transparent; }
  .ic-col-body::-webkit-scrollbar-thumb { background: var(--ic-rule); }
  .ic-col-body::-webkit-scrollbar-thumb:hover { background: var(--ic-ink-faint); }

  .column-drop-active {
    background: var(--st-wash);
    box-shadow: inset 0 0 0 2px var(--st);
  }

  .ic-empty {
    margin: auto;
    padding: 26px 12px;
    text-align: center;
    color: var(--ic-ink-faint);
  }

  .ic-empty i {
    display: block;
    margin-bottom: 8px;
    font-size: 26px;
    color: var(--st);
    opacity: 0.7;
  }

  .ic-empty p {
    margin: 0;
    font-size: 12px;
  }

  /* ═══════════════════════════════════════
     Kanban card
  ═══════════════════════════════════════ */
  .kcard {
    position: relative;
    display: flex;
    flex-shrink: 0;
    overflow: hidden;
    cursor: pointer;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-md);
    transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  }

  .kcard:hover {
    border-color: var(--st);
    transform: translateY(-2px);
    box-shadow: 0 6px 18px var(--st-glow);
  }

  .kcard-accent {
    flex: 0 0 3px;
    background: var(--st);
  }

  .kcard-dragging {
    opacity: 0.45;
    transform: rotate(-1.5deg);
  }

  .kcard-body {
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
  }

  .kcard-top {
    display: flex;
    gap: 10px;
    margin-bottom: 8px;
  }

  .kcard-thumb {
    position: relative;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    overflow: hidden;
    font-size: 15px;
    color: var(--st-ink);
    background: var(--st-wash);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-sm);
  }

  .kcard-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .kcard-ext {
    font-family: var(--ic-font-meta);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--ic-ink-faint);
  }

  .kcard-title-wrap {
    flex: 1;
    min-width: 0;
  }

  .kcard-subject {
    margin: 0 0 5px;
    font-family: var(--ic-font-display);
    font-size: 12.5px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--ic-ink);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  .kcard-meta-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
  }

  .kcard-docno {
    padding: 1px 6px;
    font-family: var(--ic-font-meta);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.03em;
    color: var(--st-ink);
    background: var(--st-wash);
    border-radius: var(--r-xs);
  }

  .kcard-timer {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 1px 6px;
    font-family: var(--ic-font-meta);
    font-size: 10px;
    font-weight: 700;
    color: var(--ic-ink-soft);
    background: var(--ic-ground);
    border-radius: var(--r-xs);
  }

  .kcard-timer i { font-size: 9px; }

  .time-warning {
    color: var(--ic-pending);
    background: rgba(180, 83, 9, 0.1);
  }

  .time-urgent {
    color: var(--ic-danger);
    background: rgba(185, 28, 28, 0.1);
  }

  .time-critical {
    color: #fff;
    background: var(--ic-danger);
  }

  .kcard-desc {
    margin: 0 0 9px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--ic-ink-soft);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  .kcard-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--ic-rule-soft);
  }

  .kcard-people {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    min-width: 0;
  }

  .kcard-person {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10.5px;
    color: var(--ic-ink-faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 118px;
  }

  .kcard-person i { font-size: 9px; }

  .kcard-assignee { color: var(--st-ink); font-weight: 600; }

  .kcard-comment-chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    max-width: 92px;
    padding: 2px 7px;
    font-size: 10px;
    color: var(--ic-ink-soft);
    background: var(--ic-ground);
    border-radius: var(--r-sm);
  }

  .kcard-comment-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .kcard-comment-unread {
    color: var(--ic-accent);
    background: var(--ic-accent-wash);
  }

  .kcard-unread-badge {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 8px;
    height: 8px;
  }

  .kcard-unread-ping,
  .kcard-unread-core {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--ic-danger);
  }

  .kcard-unread-ping {
    animation: ic-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
    opacity: 0.65;
  }

  @keyframes ic-rise {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: none; }
  }

  @keyframes ic-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes ic-ping {
    75%, 100% { transform: scale(2.4); opacity: 0; }
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
    background: linear-gradient(105deg, var(--hd-from, #0f2242) 0%, var(--hd-to, #1d4ed8) 130%) !important;
    color: var(--hd-on, #f5f9ff);
    font-weight: 600 !important;
  }

  ::v-deep .modal-header * { color: var(--hd-on, #f5f9ff) !important; }

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
    color: var(--hd-on, #f5f9ff) !important;
    opacity: 0.85;
    font-size: 26px;
    font-weight: 300;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  ::v-deep .close:hover { opacity: 1; transform: rotate(90deg); }
  ::v-deep .modal-backdrop.in { display: none !important; }

  .custom-scrollbar::-webkit-scrollbar { width: 7px; height: 7px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--ic-rule); }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--ic-ink-faint); }

  /* แถบหัว modal — ประกาศบน root ของ modal-2 เพื่อให้ .modal-header (แม่ของ .md-header) รับค่าได้
     --hd-on ต้องเป็นสีเข้มสำหรับโทนสว่างอย่างเหลือง ไม่งั้นตัวหนังสือหาย */
  .tone--dev {
    --hd-from: #1e40af; --hd-to: #3b82f6;
    --hd-on: #ffffff; --hd-on-soft: rgba(255, 255, 255, 0.74); --hd-chip: rgba(255, 255, 255, 0.20);
  }

  .tone--it {
    --hd-from: #0e7490; --hd-to: #06b6d4;
    --hd-on: #ffffff; --hd-on-soft: rgba(255, 255, 255, 0.74); --hd-chip: rgba(255, 255, 255, 0.20);
  }

  .tone--progress {
    --hd-from: #f6cd3be6; --hd-to: #facc15;
    --hd-on: #2b1f00; --hd-on-soft: rgba(43, 31, 0, 0.68); --hd-chip: rgba(43, 31, 0, 0.14);
  }

  .tone--review {
    --hd-from: #5b21b6; --hd-to: #8b5cf6;
    --hd-on: #ffffff; --hd-on-soft: rgba(255, 255, 255, 0.74); --hd-chip: rgba(255, 255, 255, 0.20);
  }

  .tone--overdue {
    --hd-from: #991b1b; --hd-to: #ef4444;
    --hd-on: #ffffff; --hd-on-soft: rgba(255, 255, 255, 0.74); --hd-chip: rgba(255, 255, 255, 0.20);
  }

  /* Tone — modal inherits the colour of the column it was opened from */
  .md-header.tone--dev, .md-body.tone--dev {
    --ic-accent: #1d5faa;
    --ic-accent-wash: rgba(29, 95, 170, 0.09);
    --ic-accent-bright: #7fb2e8;
    --ic-bright-wash: rgba(127, 178, 232, 0.16);
  }

  .md-header.tone--it, .md-body.tone--it {
    --ic-accent: #0e7490;
    --ic-accent-wash: rgba(14, 116, 144, 0.09);
    --ic-accent-bright: #67e8f9;
    --ic-bright-wash: rgba(103, 232, 249, 0.16);
  }

  .md-header.tone--progress, .md-body.tone--progress {
    --ic-accent: #eab308;
    --ic-on-accent: #3d2c00;
    --ic-accent-wash: rgba(234, 179, 8, 0.13);
    --ic-accent-bright: #fde047;
    --ic-bright-wash: rgba(253, 224, 71, 0.18);
  }

  .md-header.tone--review, .md-body.tone--review {
    --ic-accent: #6d28d9;
    --ic-accent-wash: rgba(109, 40, 217, 0.09);
    --ic-accent-bright: #c4b5fd;
    --ic-bright-wash: rgba(196, 181, 253, 0.16);
  }

  .md-header.tone--overdue, .md-body.tone--overdue {
    --ic-accent: #b91c1c;
    --ic-accent-wash: rgba(185, 28, 28, 0.09);
    --ic-accent-bright: #fca5a5;
    --ic-bright-wash: rgba(252, 165, 165, 0.16);
  }

  /* Modal header slot */
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
    color: var(--hd-on, #f5f9ff) !important;
    background: var(--hd-chip, rgba(245, 249, 255, 0.16));
    border: 1px solid var(--hd-chip, rgba(245, 249, 255, 0.28));
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

  .md-header-meta > span:not(.md-header-docno) { color: var(--hd-on-soft, rgba(245, 249, 255, 0.6)) !important; }

  .md-header-docno {
    font-family: var(--ic-font-meta);
    font-weight: 800;
    letter-spacing: 0.05em;
    color: var(--hd-on, #f5f9ff) !important;
    background: var(--hd-chip, rgba(245, 249, 255, 0.16));
    padding: 2px 8px;
    border-radius: var(--r-sm);
  }

  .md-header-sep { opacity: 0.4; }

  /* ═══════════════════════════════════════
     Modal body
  ═══════════════════════════════════════ */
  .md-body {
    display: flex;
    box-sizing: border-box;
    height: 82vh;
    border-top: 3px solid var(--ic-accent);
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
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .md-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
  }

  .md-section--desc,
  .md-section--url,
  .md-section--customer,
  .md-section--files { flex: 0 0 auto; }

  .md-section--chat {
    flex: 1 1 auto;
    min-height: 110px;
  }

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

  .md-section-label i {
    width: 19px;
    height: 19px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9.5px;
    color: var(--ic-on-accent);
    background: var(--ic-accent);
    border-radius: 4px;
  }

  .md-section-scroll {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 44px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .md-desc {
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 124px;
    min-height: 124px;
    overflow-y: auto;
    padding: 12px 14px;
    resize: vertical;
    font-family: var(--ic-font-body);
    font-size: 13.5px;
    line-height: 1.7;
    color: var(--ic-ink-soft);
    white-space: pre-wrap;
    background: var(--ic-ground);
    border: 1px solid var(--ic-rule-soft);
    border-left: 2px solid var(--ic-accent);
    border-radius: var(--r-md);
    outline: none;
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
    transition: border-color 0.18s ease;
  }

  .md-url:hover { color: var(--ic-accent); border-color: var(--ic-accent); }

  .md-url--empty {
    justify-content: center;
    width: 100%;
    color: var(--ic-ink-faint);
    background: transparent;
    border-style: dashed;
    border-color: var(--ic-rule);
    cursor: default;
  }

  .md-url--empty:hover { color: var(--ic-ink-faint); border-color: var(--ic-rule); }

  .md-customer-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--ic-ground);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-md);
  }

  .md-customer-row--empty {
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    color: var(--ic-ink-faint);
    background: transparent;
    border-style: dashed;
    border-color: var(--ic-rule);
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
    color: var(--ic-on-accent);
    background: var(--ic-accent);
    border-color: var(--ic-accent);
  }

  /* Attachments */
  .md-attachments {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 7px;
    height: 62px;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
  }

  .md-attach-item {
    flex: 0 0 auto;
    width: 172px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 7px 9px;
    color: inherit;
    text-decoration: none;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-md);
    transition: border-color 0.18s ease, background 0.18s ease;
  }

  .md-attach-item:hover {
    background: var(--ic-accent-wash);
    border-color: var(--ic-accent);
  }

  .md-attach-item--empty {
    flex: 1 1 auto;
    width: auto;
    justify-content: center;
    border-style: dashed;
    border-color: var(--ic-rule);
    cursor: default;
  }

  .md-attach-item--empty:hover {
    background: var(--ic-surface);
    border-color: var(--ic-rule);
  }

  .md-attach-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-size: 16px;
    background: var(--ic-ground);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-sm);
  }

  .md-attach-icon img { width: 100%; height: 100%; object-fit: cover; }

  .md-attach-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .md-attach-name {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--ic-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .md-attach-item--empty .md-attach-name {
    font-weight: 500;
    color: var(--ic-ink-faint);
  }

  .md-attach-date {
    font-family: var(--ic-font-meta);
    font-size: 9px;
    color: var(--ic-ink-faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .md-attach-dl {
    flex-shrink: 0;
    font-size: 10px;
    color: var(--ic-ink-faint);
  }

  .md-attach-item:hover .md-attach-dl { color: var(--ic-accent); }

  /* Chat */
  .md-chat-history {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .md-chat-empty {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 24px;
    font-size: 12px;
    color: var(--ic-ink-faint);
    background: var(--ic-ground);
    border: 1px dashed var(--ic-rule);
    border-radius: var(--r-md);
  }

  .md-chat-empty i { font-size: 20px; opacity: 0.6; }

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
    font-family: var(--ic-font-meta);
    font-size: 13px;
    font-weight: 700;
    color: var(--ic-on-ink);
    background: var(--ic-ink-soft);
    border-radius: var(--r-sm);
  }

  .md-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .md-avatar-me { color: var(--ic-on-accent); background: var(--ic-accent); }

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

  .md-delete-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    color: var(--ic-ink-faint);
    background: transparent;
    border: none;
    border-radius: var(--r-sm);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.18s ease, color 0.18s ease, background 0.18s ease;
  }

  .md-bubble:hover .md-delete-btn { opacity: 1; }

  .md-delete-btn:hover {
    color: #fff;
    background: var(--ic-danger);
  }

  .md-bubble-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 6px;
    padding-bottom: 6px;
    padding-right: 18px;
    border-bottom: 1px solid var(--ic-rule-soft);
  }

  .md-bubble-meta strong {
    font-size: 12px;
    font-weight: 700;
    color: var(--ic-ink);
  }

  .md-bubble-meta small {
    font-family: var(--ic-font-meta);
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

  .md-file-chip:hover { color: var(--ic-accent); border-color: var(--ic-accent); }

  .md-file-chip-img {
    width: 16px;
    height: 16px;
    object-fit: cover;
    border-radius: var(--r-xs);
  }

  /* Chat input */
  .md-chat-input-wrap {
    flex: 0 0 auto;
    padding: 12px 20px 14px;
    background: var(--ic-surface);
    border-top: 2px solid var(--ic-ink);
  }

  .md-chat-box {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .md-file-previews {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .md-file-preview-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    width: 62px;
  }

  .md-preview-img-wrap,
  .md-preview-file-wrap {
    position: relative;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-size: 20px;
    color: var(--ic-ink-soft);
    background: var(--ic-ground);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-md);
  }

  .md-preview-img-wrap img { width: 100%; height: 100%; object-fit: cover; }

  .md-remove-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    color: #fff;
    background: var(--ic-danger);
    border: none;
    border-radius: var(--r-sm);
    cursor: pointer;
  }

  .md-preview-name {
    width: 100%;
    font-size: 9px;
    text-align: center;
    color: var(--ic-ink-faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .md-input-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
  }

  .md-attach-btn,
  .md-send-btn {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease;
  }

  .md-attach-btn {
    color: var(--ic-ink-soft);
    background: transparent;
    border: 1px solid var(--ic-rule);
  }

  .md-attach-btn:hover {
    color: var(--ic-on-ink);
    background: var(--ic-ink);
    border-color: var(--ic-ink);
  }

  .md-textarea-wrap { flex: 1; min-width: 0; }

  .md-textarea {
    width: 100%;
    height: 36px;
    min-height: 36px;
    max-height: 120px;
    padding: 8px 12px;
    resize: vertical;
    font-family: var(--ic-font-body);
    font-size: 13px;
    line-height: 1.4;
    color: var(--ic-ink);
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule);
    border-bottom-width: 2px;
    border-radius: var(--r-md);
    outline: none;
    transition: border-color 0.18s ease, background 0.18s ease;
  }

  .md-textarea:focus {
    border-bottom-color: var(--ic-accent);
    background: var(--ic-accent-wash);
  }

  .md-textarea::placeholder { color: var(--ic-ink-faint); }

  .md-send-btn {
    color: var(--ic-ink-faint);
    background: var(--ic-ground);
    border: 1px solid var(--ic-rule-soft);
    cursor: not-allowed;
  }

  .md-send-active {
    color: var(--ic-on-ink);
    background: var(--ic-ink);
    border-color: var(--ic-ink);
    cursor: pointer;
  }

  .md-send-active:hover { background: var(--ic-accent); border-color: var(--ic-accent); }

  /* ═══════════════════════════════════════
     Right panel
  ═══════════════════════════════════════ */
  .md-right {
    width: 320px;
    flex-shrink: 0;
    overflow: hidden;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--ic-ground);
  }

  .md-info-card {
    flex: 0 0 auto;
    padding: 13px;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule-soft);
    border-radius: var(--r-md);
  }

  /* only block allowed to give up room on short viewports */
  .md-info-card--timeline {
    flex: 0 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .md-info-card--timeline .md-timeline {
    min-height: 0;
    overflow-y: auto;
  }

  .md-info-card-title {
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--ic-rule-soft);
    font-family: var(--ic-font-display);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--ic-ink);
  }

  .md-info-card-title::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 11px;
    margin-right: 7px;
    vertical-align: -1px;
    background: var(--ic-accent);
    border-radius: 2px;
  }

  .md-reporter { display: flex; align-items: center; gap: 11px; }

  .md-reporter-avatar {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-family: var(--ic-font-meta);
    font-size: 16px;
    font-weight: 700;
    color: var(--ic-on-ink);
    background: var(--ic-ink);
    border-radius: var(--r-sm);
  }

  .md-reporter-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .md-reporter-name {
    margin-bottom: 1px;
    font-family: var(--ic-font-display);
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ic-ink);
  }

  .md-reporter-role {
    font-family: var(--ic-font-meta);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ic-ink-faint);
  }

  /* Timeline */
  .md-timeline { display: flex; flex-direction: column; }
  .md-tl-item { display: flex; gap: 11px; position: relative; }

  .md-tl-dot {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    margin-top: 3px;
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
    left: 4px;
    top: 15px;
    bottom: -4px;
    width: 1px;
    background: repeating-linear-gradient(
      to bottom,
      var(--ic-rule) 0 4px,
      transparent 4px 8px
    );
  }

  .md-tl-item:last-child .md-tl-line { display: none; }

  .md-tl-content { flex: 1; min-width: 0; padding-bottom: 9px; }
  .md-tl-item:last-child .md-tl-content { padding-bottom: 0; }

  .md-tl-label {
    display: block;
    margin-bottom: 1px;
    font-family: var(--ic-font-display);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.35;
    color: var(--ic-ink-soft);
  }

  .md-tl-label-done { font-weight: 600; color: var(--ic-ink); }

  .md-tl-time {
    display: block;
    font-size: 10.5px;
    line-height: 1.35;
    color: var(--ic-ink-faint);
    word-break: break-word;
  }

  .md-tl-pending {
    color: var(--ic-pending) !important;
    font-weight: 600;
  }

  .md-tl-link {
    padding: 1px 6px;
    font-family: var(--ic-font-meta);
    font-size: 11.5px;
    font-weight: 700;
    color: var(--ic-accent);
    background: var(--ic-accent-wash);
    text-decoration: none;
  }

  .md-tl-link:hover { color: var(--ic-accent); text-decoration: underline; }

  /* Key/value */
  .md-kv {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    padding: 4px 0;
    border-bottom: 1px solid var(--ic-rule-soft);
  }

  .md-kv:first-child { padding-top: 0; }

  .md-kv:last-child { border-bottom: none; padding-bottom: 0; }

  .md-kv-label {
    flex-shrink: 0;
    font-family: var(--ic-font-display);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--ic-ink-faint);
  }

  .md-kv-value {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--ic-ink);
    text-align: right;
    word-break: break-word;
  }

  /* Checkboxes */
  .md-checks {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .md-check-label {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 0;
    padding: 5px 7px;
    font-family: var(--ic-font-display);
    font-size: 12px;
    font-weight: 500;
    color: var(--ic-ink-soft);
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: color 0.18s ease, background 0.18s ease;
  }

  .md-check-label:hover { background: var(--ic-ground); }

  .md-check-label input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .md-check-box {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    color: transparent;
    background: var(--ic-surface);
    border: 1px solid var(--ic-rule);
    border-radius: var(--r-sm);
    transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease;
  }

  .md-check-active { color: var(--ic-ink); font-weight: 600; }

  .md-check-active .md-check-box {
    color: var(--ic-on-ink);
    background: var(--ic-done);
    border-color: var(--ic-done);
  }

  .md-check-label input:disabled ~ .md-check-box { opacity: 0.45; }

  /* Actions */
  .md-actions { flex: 0 0 auto; display: flex; flex-direction: column; gap: 7px; }

  .md-btn {
    width: 100%;
    padding: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: var(--ic-font-display);
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: none;
    border-radius: var(--r-md);
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .md-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .md-btn-save {
    color: var(--ic-on-accent);
    background: var(--ic-accent);
    box-shadow: 0 3px 10px var(--ic-accent-wash);
  }

  .md-btn-save:hover:not(:disabled) { background: var(--ic-ink); }

  .md-btn-csm {
    color: var(--ic-accent);
    background: transparent;
    border: 1px solid var(--ic-accent);
  }

  .md-btn-csm:hover:not(:disabled) {
    color: var(--ic-on-accent);
    background: var(--ic-accent);
  }

  .md-btn-done {
    color: var(--ic-ink-faint);
    background: var(--ic-ground);
    border: 1px solid var(--ic-rule-soft);
    cursor: not-allowed;
  }

  /* ═══════════════════════════════════════
     Responsive
  ═══════════════════════════════════════ */
  @media (max-width: 1200px) {
    .ic-col { min-width: 240px; flex: 0 0 240px; }
  }

  @media (max-width: 768px) {
    .ic-page { padding: 10px; gap: 8px; }

    .ic-masthead {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      padding: 12px 16px;
    }

    .ic-masthead-main { flex-direction: column; align-items: flex-start; gap: 2px; }

    .md-body { flex-direction: column; height: auto; }
    .md-right { width: 100%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ic-masthead,
    .ic-col { animation: none; }

    .ic-spin,
    .kcard-unread-ping { animation: none; }
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
    --ic-danger: #f87171;
    --ic-grid: rgba(227, 236, 247, 0.035);
  }

  body.dark-mode .ic-col--dev {
    --st: #60a5fa; --st-ink: #93c5fd;
    --st-wash: rgba(96, 165, 250, 0.14); --st-glow: rgba(96, 165, 250, 0.26);
  }

  body.dark-mode .ic-col--it {
    --st: #22d3ee; --st-ink: #67e8f9;
    --st-wash: rgba(34, 211, 238, 0.14); --st-glow: rgba(34, 211, 238, 0.26);
  }

  body.dark-mode .ic-col--progress {
    --st: #facc15; --st-ink: #fde047;
    --st-wash: rgba(250, 204, 21, 0.16); --st-glow: rgba(250, 204, 21, 0.28);
  }

  body.dark-mode .ic-col--review {
    --st: #a78bfa; --st-ink: #c4b5fd;
    --st-wash: rgba(167, 139, 250, 0.14); --st-glow: rgba(167, 139, 250, 0.26);
  }

  body.dark-mode .ic-col--overdue {
    --st: #f87171; --st-ink: #fca5a5;
    --st-wash: rgba(248, 113, 113, 0.14); --st-glow: rgba(248, 113, 113, 0.26);
  }

  body.dark-mode .md-header.tone--dev, body.dark-mode .md-body.tone--dev {
    --ic-accent: #5b9bd5;
    --ic-accent-wash: rgba(91, 155, 213, 0.12);
  }

  body.dark-mode .md-header.tone--it, body.dark-mode .md-body.tone--it {
    --ic-accent: #22d3ee;
    --ic-accent-wash: rgba(34, 211, 238, 0.12);
  }

  body.dark-mode .md-header.tone--progress, body.dark-mode .md-body.tone--progress {
    --ic-accent: #facc15;
    --ic-accent-wash: rgba(250, 204, 21, 0.14);
  }

  body.dark-mode .md-header.tone--review, body.dark-mode .md-body.tone--review {
    --ic-accent: #a78bfa;
    --ic-accent-wash: rgba(167, 139, 250, 0.12);
  }

  body.dark-mode .md-header.tone--overdue, body.dark-mode .md-body.tone--overdue {
    --ic-accent: #f87171;
    --ic-accent-wash: rgba(248, 113, 113, 0.12);
  }

  body.dark-mode .ic-masthead {
    background: linear-gradient(105deg, #050d18 0%, #0b1c33 60%, #1e3a8a 175%);
  }

  /* ตัวหนังสือบนพื้นสีสดในโหมดมืดต้องเป็นสีเข้ม */
  body.dark-mode .ic-col-count,
  body.dark-mode .ic-col-icon,
  body.dark-mode .md-section-label i,
  body.dark-mode .time-critical,
  body.dark-mode .md-remove-btn { color: #071120; }

  body.dark-mode .kcard-docno { color: var(--st-ink); }

  body.dark-mode .kcard-unread-ping,
  body.dark-mode .kcard-unread-core { background: var(--ic-danger); }

  body.dark-mode .md-delete-btn:hover { color: #071120; }

  body.dark-mode .ic-col-search-input,
  body.dark-mode .md-textarea { background: #0b1727; }

  body.dark-mode .ic-toggle-thumb { background: #e3ecf7; }

  body.dark-mode .md-avatar,
  body.dark-mode .md-reporter-avatar { color: #071120; background: var(--ic-accent); }

  body.dark-mode .md-attach-btn:hover,
  body.dark-mode .md-send-active,
  body.dark-mode .md-btn-save { color: #071120; background: var(--ic-accent); border-color: var(--ic-accent); }

  body.dark-mode .md-attach-btn:hover,
  body.dark-mode .md-send-active:hover,
  body.dark-mode .md-btn-save:hover:not(:disabled) { background: var(--ic-ink); border-color: var(--ic-ink); }

  body.dark-mode .md-btn-csm:hover:not(:disabled) { color: #071120; }

  body.dark-mode .md-check-active .md-check-box { color: #071120; }

  body.dark-mode .md-customer-link:hover { color: #071120; }

  /* โหมดมืดคงสีตามสถานะไว้ แค่หรี่ความสว่างลงเล็กน้อย */
  body.dark-mode ::v-deep .modal-header {
    filter: saturate(0.92) brightness(0.88);
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

/* ── สีแถบหัว modal ตามสถานะที่กดเข้ามา ──
   ต้องอยู่ใน global block เพราะ modal-2 ย้าย .modal ไปไว้ที่ body
   ทำให้ element นี้ไม่มี scope attribute ของหน้านี้ติดไปด้วย
   ตัวแปรที่ประกาศตรงนี้จะไหลลงไปให้ .md-header-icon / .md-header-docno ที่อ่าน var(--hd-*) อยู่แล้ว */
.modal.csm-tone--dev {
  --hd-from: #1e40af; --hd-to: #3b82f6;
  --hd-on: #ffffff; --hd-on-soft: rgba(255, 255, 255, 0.74); --hd-chip: rgba(255, 255, 255, 0.20);
}

.modal.csm-tone--it {
  --hd-from: #0e7490; --hd-to: #06b6d4;
  --hd-on: #ffffff; --hd-on-soft: rgba(255, 255, 255, 0.74); --hd-chip: rgba(255, 255, 255, 0.20);
}

.modal.csm-tone--progress {
  --hd-from: #f6cd3be6; --hd-to: #facc15;
  --hd-on: #2b1f00; --hd-on-soft: rgba(43, 31, 0, 0.68); --hd-chip: rgba(43, 31, 0, 0.14);
}

.modal.csm-tone--review {
  --hd-from: #5b21b6; --hd-to: #8b5cf6;
  --hd-on: #ffffff; --hd-on-soft: rgba(255, 255, 255, 0.74); --hd-chip: rgba(255, 255, 255, 0.20);
}

.modal.csm-tone--overdue {
  --hd-from: #991b1b; --hd-to: #ef4444;
  --hd-on: #ffffff; --hd-on-soft: rgba(255, 255, 255, 0.74); --hd-chip: rgba(255, 255, 255, 0.20);
}

.modal[class*="csm-tone--"] .modal-header {
  background: linear-gradient(105deg, var(--hd-from) 0%, var(--hd-to) 130%) !important;
  border-bottom: none !important;
}

.modal[class*="csm-tone--"] .modal-header,
.modal[class*="csm-tone--"] .modal-header *,
.modal[class*="csm-tone--"] .modal-header .close {
  color: var(--hd-on) !important;
}

.modal[class*="csm-tone--"] .modal-header .md-header-meta > span:not(.md-header-docno) {
  color: var(--hd-on-soft) !important;
}

body.dark-mode .modal[class*="csm-tone--"] .modal-header {
  filter: saturate(0.92) brightness(0.88);
}
</style>
