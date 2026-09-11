<template>
  <div>
    <div class="row">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="table-responsive task-table-wrapper">
          <table class="table table-task">
            <thead>
              <tr>
                <th class="th-check" v-if="changeMultiWorker() && isMango"></th>
                <th class="th-no">{{ ui.erp_no }}</th>
                <th class="th-action text-center">{{ ui.erp_action }}</th>
                <th class="th-link text-center">#</th>
                <th class="th-module">{{ isMango ? 'Module' : 'Area' }}</th>
                <th class="th-subject">{{ ui.csm_v2_subject }}</th>
                <th class="th-type">{{ ui.erp_type }}</th>
                <th class="th-reqtype">{{ ui.csm_trn_field_req_type }}</th>
                <th class="th-status text-center">{{ ui.csm_v2_status }}</th>
                <th class="th-worker">
                  <span>{{ ui.csm_trn_worker }}</span>
                  <button class="btn btn-copy-worker"
                          v-if="(is_wait(formData.job_status_tmp) || formData.job_status_tmp=='H') && formData['request_empno'] == auth.empno"
                          @click="copyWorker()"
                          title="Copy worker to all tasks">
                    <v-icon name="copy" class="v-icon-width"></v-icon>
                  </button>
                </th>
                <th class="th-checker">{{ ui.csm_trn_checker }}</th>
                <th class="th-date">{{ ui.csm_trn_field_response_date }}</th>
                <th class="th-date">{{ ui.erp_due_date }} <small class="text-muted">({{ ui.csm_trn_requester_short }})</small></th>
                <th class="th-date-sm">{{ ui.erp_due_date }} <small class="text-muted">({{ ui.csm_trn_worker }})</small></th>
                <th class="th-date-sm">{{ ui.csm_trn_send_pretest }}</th>
                <th class="th-overdue text-center">{{ ui.csm_case_overdue }}</th>
                <th class="th-date-sm">{{ ui.erp_complete_date }}</th>
                <th class="th-approve">{{ ui.erp_approve_status }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(x, idx) in detailData"
                  :key="x.itemno"
                  class="task-row"
                  :class="[statusClass('row-status-', x.status_tmp), { 'row-overdue': x.overdue > 0 }]">

                <!-- Checkbox -->
                <td class="td-check" v-if="changeMultiWorker() && isMango">
                  <input class="form-check-input" type="checkbox" v-model="x.isCheckData" />
                </td>

                <!-- No. -->
                <td class="td-no text-center">
                  <span class="badge-no">{{x.itemno}}</span>
                </td>

                <!-- Action buttons -->
                <td class="td-action text-center">
                  <div class="action-btn-group">
                    <button class="btn btn-icon btn-icon-blue"
                            title="Insert row above"
                            v-bind:disabled="(x.isViewOnly && !x.showEditOnly && !x.isTesterOnly)||(x.isTesterOnly && !x.showEditOnly && isMango)|| (['Y', 'C', 'N'].includes(x.approve_status) && !xt.isEmpty(x.tester_approve))"
                            @click.prevent="insertRow(x, idx)">
                      <v-icon name="arrow-up-circle" class="v-icon-width"></v-icon>
                    </button>
                    <button class="btn btn-icon btn-icon-teal"
                            title="Copy row"
                            v-bind:disabled="(x.isViewOnly && !x.showEditOnly && !x.isTesterOnly)||(x.isTesterOnly && !x.showEditOnly && isMango)|| (['Y', 'C', 'N'].includes(x.approve_status) && !xt.isEmpty(x.tester_approve))"
                            @click.prevent="copyRow(x)">
                      <v-icon name="copy" class="v-icon-width"></v-icon>
                    </button>
                    <button class="btn btn-icon btn-icon-gray"
                            title="Print"
                            v-bind:disabled="xt.isEmpty(x.approve_status)"
                            @click.prevent="printTaskCsm(x, idx)">
                      <v-icon name="printer" class="v-icon-width"></v-icon>
                    </button>
                  </div>
                </td>

                <!-- Edit / View / Review link -->
                <td class="td-link text-center">
                  <a v-show="x.showEditOnly || formData.request_empno == auth.empno"
                     @click.prevent="handleEditTask(x.itemno,'edit')"
                     class="link-badge link-edit pointer">
                    <i class="fas fa-edit"></i> {{ ui.erp_edit }}
                  </a>
                  <a v-show="x.isViewOnly && !x.showEditOnly && !x.isTesterOnly"
                     href="#"
                     @click.prevent="handleEditTask(x.itemno,'view')"
                     class="link-badge link-view">
                    <i class="fas fa-eye"></i> {{ ui.erp_view }}
                  </a>
                  <a v-show="x.isTesterOnly && !x.showEditOnly && isMango"
                     href="#"
                     @click.prevent="handleEditTask(x.itemno,'review')"
                     class="link-badge link-review">
                    <i class="fas fa-search"></i> {{ ui.csm_trn_review }}
                  </a>
                </td>

                <!-- Module / Area -->
                <td class="td-module">
                  <span class="module-tag">{{x.module}}</span>
                </td>

                <!-- Subject -->
                <td class="td-subject">
                  <div class="subject-wrapper">
                    <span class="subject-text">{{x.subject}}</span>
                    <div class="subject-tooltip">{{x.subject}}</div>
                  </div>
                </td>

                <!-- Type -->
                <td class="td-type">
                  <span class="type-badge">{{itemTypeName(x.item_type)}}</span>
                </td>

                <!-- Req. Type -->
                <td class="td-reqtype">{{reqTypeName(x.req_type)}}</td>

                <!-- Status -->
                <td class="td-status text-center">
                  <span class="status-pill" :class="statusClass('pill-', x.status_tmp)">
             {{statusName(x.status_tmp)}}
                  </span>
                </td>

                <!-- Worker -->
                <td :data-label="ui.csm_trn_worker" class="td-worker">
                  <span class="person-name">{{x.assign_empno_name}}</span>
                  <a href="#" class="btn-search-worker" @click.prevent="empModalSelected('change_worker')" v-if="isMango && x.isCheckData" title="Change worker">
                    <i class="fas fa-user-edit"></i>
                  </a>
                </td>

                <!-- Checker -->
                <td :data-label="ui.csm_trn_checker" class="td-checker">
                  <span class="person-name">{{x.tester_empno_name}}</span>
                </td>

                <!-- Response Date -->
                <td :data-label="ui.csm_trn_field_response_date" class="td-date">
                  <datepicker input-class="form-control input-sm datepicker-compact"
                              style="width: 116px !important;"
                              v-model="x.response_date"
                              overdate=""
                              @change="date_ch(x)"
                              :disabled="(x.isViewOnly && !x.showEditOnly && !x.isTesterOnly)||(x.isTesterOnly && !x.showEditOnly && isMango)||  (['Y', 'C', 'N'].includes(x.approve_status) && !xt.isEmpty(x.tester_approve))">
                  </datepicker>
                </td>

                <!-- Due Date (Requestor) -->
                <td :data-label="ui.erp_due_date + ' (' + ui.csm_trn_requester_short + ')'" class="td-date" v-if="isMango">
                  <datepicker input-class="form-control input-sm datepicker-compact text-danger"
                               style="width: 116px !important;"
                              v-model="x.due_date"
                              overdate=""
                              :disabled="(x.isViewOnly && !x.showEditOnly && !x.isTesterOnly)||(x.isTesterOnly && !x.showEditOnly && isMango)|| ((formData.request_empno !== auth.empno) && ['Y', 'C', 'N'].includes(x.approve_status) && !xt.isEmpty(x.tester_approve))">
                  </datepicker>
                </td>
                <td :data-label="ui.erp_due_date + ' (' + ui.csm_trn_requester_short + ')'" class="td-date" v-if="!isMango">
                  <datepicker input-class="form-control input-sm datepicker-compact text-danger"
                               style="width: 116px !important;"
                              v-model="x.due_date"
                              overdate=""
                              :disabled="(x.isViewOnly && !x.showEditOnly && !x.isTesterOnly)||(x.isTesterOnly && !x.showEditOnly && isMango)||  (['Y', 'C', 'N'].includes(x.approve_status) && !xt.isEmpty(x.tester_approve))">
                  </datepicker>
                </td>

                <!-- Due Date (Worker) -->
                <td :data-label="ui.erp_due_date + ' (' + ui.csm_trn_worker + ')'" class="td-date-sm">
                  <span class="date-text">{{x.worker_end_date | date}}</span>
                </td>

                <!-- Send Pretest Date -->
                <td :data-label="ui.csm_trn_send_pretest" class="td-date-sm">
                  <span class="date-text">{{x.send_pretest_dt | date}}</span>
                </td>

                <!-- Over Due -->
                <td :data-label="ui.csm_case_overdue" class="td-overdue text-center">
                  <span v-if="x.overdue > 0" class="overdue-badge">
                    <i class="fas fa-exclamation-circle"></i> {{x.overdue}}
                  </span>
                </td>

                <!-- Complete Date -->
                <td :data-label="ui.erp_complete_date" class="td-date-sm">
                  <span class="date-text text-success">{{x.complete_date | date}}</span>
                </td>

                <!-- Approve Status -->
                <td :data-label="ui.erp_approve_status" class="td-approve">
                  <span class="approve-badge"
                        :class="{
                          'approve-success':  x.approve_status == 'Y' && x.tester_approve == 'Y',
                          'approve-danger':   x.approve_status == 'C' && x.tester_approve == 'Y',
                          'approve-primary':  x.approve_status == 'N' && x.tester_approve == 'Y',
                          'approve-purple':   x.approve_status == 'Y' && x.tester_approve == 'N',
                          'approve-warning':  x.approve_status == 'Y' && x.tester_approve == 'R'
                        }"
                        @click="openApprove(x)">
                    <template v-if="x.approve_status == 'Y' && x.tester_approve == 'Y'">
                      <i class="fas fa-check-circle"></i> {{ ui.csm_trn_approved }}
                    </template>
                    <template v-else-if="x.approve_status == 'C' && x.tester_approve == 'Y'">
                      <i class="fas fa-times-circle"></i> {{ ui.csm_trn_not_approved }}
                    </template>
                    <template v-else-if="x.approve_status == 'N' && x.tester_approve == 'Y'">
                      <i class="fas fa-clock"></i> {{ ui.csm_home_waiting_approve }}
                    </template>
                    <template v-else-if="x.approve_status == 'Y' && x.tester_approve == 'N'">
                      <i class="fas fa-search"></i> {{ ui.csm_trn_wait_check }}
                    </template>
                    <template v-else-if="x.approve_status == 'Y' && x.tester_approve == 'R'">
                      <i class="fas fa-ban"></i> {{ ui.csm_trn_not_passed_check }}
                    </template>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <template v-if="isMango">
    </br>
      <div class="row">
        <div class="col-lg-12 col-md-12 col-sm-12">
          <button class="btn btn-sm btn-github" v-if="changeMultiWorker() && isMango" @click="saveChangeWorker()"><i class="fas fa-user-edit"></i> <span v-text="ui.csm_change_worker || 'บันทึก (สำหรับเปลี่ยนผู้ปฏิบัติงาน)'"></span></button>
          <!-- <button class="btn btn-sm btn-primary" v-if="(is_wait(formData.job_status_tmp) || formData.job_status_tmp=='H') && formData['request_empno'] == auth.empno" @click="addDetail"> -->
          <button class="btn btn-sm btn-primary" v-if="(is_wait(formData.job_status_tmp) || formData.job_status_tmp=='H') && formData['request_empno'] == auth.empno" @click="addDetailData">
            <i class="fa fa-plus"></i> <span v-text="ui.add_detail || 'Append Row'"></span>
          </button>
        </div>
      </div>
    </template>
    <template v-if="!isMango">
      <div class="row">
        <div class="col-lg-12 col-md-12 col-sm-12">
          <button class="btn btn-sm btn-github" v-if="changeMultiWorker()" @click="saveChangeWorker()"><i class="fas fa-user-edit"></i> <span v-text="ui.csm_change_worker || 'บันทึก (สำหรับเปลี่ยนผู้ปฏิบัติงาน)'"></span></button>
          <!-- <button class="btn btn-sm btn-primary" v-if="(is_wait(formData.job_status_tmp) || formData.job_status_tmp=='H') && formData['request_empno'] == auth.empno" @click="addDetail"><i class="fa fa-plus"></i> <span v-text="ui.add_detail || 'Append Row'"></span></button> -->
          <button class="btn btn-sm btn-primary" v-if="(is_wait(formData.job_status_tmp) || formData.job_status_tmp=='H') && formData['request_empno'] == auth.empno" @click="addDetailData"><i class="fa fa-plus"></i> <span v-text="ui.add_detail || 'Append Row'"></span></button>
        </div>
      </div>
    </template>
    <modal-2 ref="modalEditTask" class="custom-modal">
      <template #header>
        <h4>{{ ui.csm_trn_edit_tasks.replace('{0}', current_page).replace('{1}', detailData.length || 0) }}</h4>
      </template>
      <template #body>
        <div>
          <div class="row">
            <div class="col-md-12">
              <div class="nav-tabs-custom">
                <ul class="nav nav-tabs task-modal-tabs">
                  <li :class="{active:tabActive===0}"><a href="#" @click.prevent="changeTab(0)">{{ ui.csm_v2_description }}</a></li>
                  <li :class="{active:tabActive===1}"><a href="#" @click.prevent="changeTab(1)">{{ ui.erp_approval_status }}</a></li>
                  <li :class="{active:tabActive===2}"><a href="#" @click.prevent="changeTab(2)">{{ ui.csm_trn_comment }} <span class="tab-count tc-blue">{{showComment().length || 0}}</span></a></li>
                  <li :class="{active:tabActive===3}"><a href="#" @click.prevent="changeTab(3)">{{ ui.csm_trn_add_file_requestor }} <span class="tab-count tc-indigo">{{attachTasksCount('B') || 0}}</span></a></li>
                  <li :class="{active:tabActive===7}" v-if="isMango && send_test_bug.some(s => s.code_s_bug === editDetailData.item_type)">
                    <a href="#" class="text-" @click.prevent="changeTab(7)">{{ ui.csm_trn_add_file_checker_before }} <span class="tab-count tc-violet">{{attachTasksCount('S') || 0}}</span></a>
                  </li>
                  <li :class="{active:tabActive===4}"><a href="#" @click.prevent="changeTab(4)">{{ ui.csm_trn_add_file_worker }} <span class="tab-count tc-teal">{{attachTasksCount('A') || 0}}</span></a></li>
                  <li :class="{active:tabActive===5}"><a href="#" @click.prevent="changeTab(5)">{{ ui.csm_trn_add_file_checker_after }} <span class="tab-count tc-violet">{{attachTasksCount('Y') || 0}}</span></a></li>
                  <li :class="{active:tabActive===11}" v-if="isMango && (editDetailData['tester_empno'] == auth.empno || formData.request_empno == auth.empno || editDetailData['assign_empno'] == auth.empno || formData.assign_empno == auth.empno)">
                    <a href="#" @click.prevent="changeTab(11)">{{ ui.csm_trn_add_file_checker_sendback }} <span class="tab-count tc-violet">{{attachTasksCount('SB') || 0}}</span></a>
                  </li>
                  <li :class="{active:tabActive===6}" v-if="isMango"><a href="#" @click.prevent="changeTab(6)">{{ ui.csm_trn_add_file_quick_manual }} <span class="tab-count tc-amber">{{attachTasksCount('T') || 0}}</span></a></li>
                  <li :class="{active:tabActive===8}" v-if="isMango"><a href="#" @click.prevent="changeTab(8)">Addspec <span class="tab-count tc-rose">{{attachTasksCount('P') || 0}}</span></a></li>
                  <li :class="{active:tabActive===9}"><a href="#" @click.prevent="changeTab(9)">{{ ui.csm_trn_signature }} <span class="tab-count tc-green">{{attachTasksCount('S1') || 0}}</span></a></li>
                  <li :class="{active:tabActive===10, 'text-muted': formData.job_status === 'Y'}"><a href="#" @click.prevent="changeTab(10)" v-if="!xt.isEmpty(editDetailData.ref_docno)" :class="{'text-secondary': formData.job_status === 'Y'}">{{ ui.csm_trn_external_comment }} <span class="tab-count tc-orange">{{showCommentExtLength().length || 0}}</span></a></li>
                </ul>
                <div class="tab-content modal-tab-scroll">
                  <div class="tab-pane" v-bind:class="{active:tabActive===0}">
                    <component :is="editDetailsComp" ref="editDetails"
                                  :is_mango="is_mango"
                                  :formData="formData"
                                  :attachmentData="attachmentData"
                                  :allWorkers="allWorkers"
                                  :statusClass="statusClass"
                                  :statusName="statusName"
                                  :editDetailData="editDetailData"
                                  :filterService="filterService"
                                  :itemTypeChange="itemTypeChange"
                                  :openDescModal1="openDescModal1"
                                  :checkRisk="checkRisk"
                                  :appendRows="appendRows"
                                  :showRisk="showRisk"
                                  :spliceRows="spliceRows"
                                  :fromLine_req="fromLine_req"
                                  :datePriority="datePriority"
                                  :empModalSelected="empModalSelected"
                                  :clearData="clearData"
                                  :recoveryTesterTasks="recoveryTesterTasks"
                                  :emp_is_software_tester="emp_is_software_tester"
                                  :is_qc="is_qc"
                                  :recoveryTasks="recoveryTasks"
                                  :is_claim="is_claim"
                                  :openMapUrl="openMapUrl"
                                  :openModalLocation="openModalLocation"
                                  :customerWarData="customerWarData"
                                  :filterSubData="filterSubData"
                                  :filterSubData2="filterSubData2"
                                  :SearchWarrantyx="SearchWarrantyx"
                                  :isEditDetail="isEditDetail"
                                  :isViewOnly="isViewOnly"
                                  :war_text="war_text"
                                  :isView="isView"
                                  :moduleCodeData="moduleCodeData"
                                  :company="company"
                                  :warCheck="warCheck"
                                  :newModuleForMango="newModuleForMango"
                                  :moduleChange="moduleChange"
                                  :newPlatformCodeData="newPlatformCodeData"
                                  :newRequestCodeData="newRequestCodeData"
                                  :filterJobType="filterJobType"
                                  :numericOnly="numericOnly"
                                  :selectedWarrantyItem="selectedWarrantyItem"
                                  :formatOption="formatOption"
                                  :formatSelection="formatSelection"
                                  :loadCustomerWarranty="loadCustomerWarranty"
                                  :loadSupplierWarranty="loadSupplierWarranty"
                                  :sendComponent="sendComponent"
                                  :activeconfig="activeconfig"
                                  :calProgress="calProgress"
                                  @workers-updated="onWorkersUpdated"
                                  :itupdateAuto="itupdateAuto"
                                  :list_emp_sa_mg="list_emp_sa_mg"
                                  :program_list="program_list" />
                  </div>
                  <div class="tab-pane" v-bind:class="{active:tabActive===1}">
                    <edit-approve-status ref="approveStatusTab"
                                         :approveTab="approveTab"
                                         :formData="formData" />
                  </div>
                  <div class="tab-pane" v-bind:class="{active:tabActive===2}">
                    <edit-comment ref="comment"
                                  :key="editDetailData && editDetailData.itemno"
                                  :showComment="showComment"
                                  :createBr="createBr"
                                  :formData="formData"
                                  :editDetailData="editDetailData"
                                  :isAdmin="isAdmin"
                                  :commentText="commentText"
                                  :localCommentText="localCommentText"
                                  :isView="isView"
                                  :updateComment="updateComment"
                                  :setEditComment="setEditComment"
                                  :deleteComment="deleteComment"
                                  :createComment="createComment"
                                  :getFileExt="getFileExt"
                                  :isUserInWorkers="isUserInWorkers"
                                  @UpdateCommentText="updateCommentText($event)"
                                  @UpdateCommentText2="updateCommentText2($event)"
                                  :list_emp_sa_mg="list_emp_sa_mg"
                                  :is_mango="is_mango"
                                   />

                  </div>
                  <div class="tab-pane" v-bind:class="{active:tabActive===3}">
                    <edit-add-requester :formData="formData"
                                        :attachFileTab="attachFileTab"
                                        :createFilePath="createFilePath"
                                        :delFile="delFile"
                                        :downLoadFile="downLoadFile"
                                        :isView="isView"
                                        :isAdmin="isAdmin"
                                        :editDetailData="editDetailData"
                                        :addFile="addFile"
                                        :getFileExt="getFileExt"
                                        :fileUpload="fileUpload" />
                  </div>
                  <div class="tab-pane" v-bind:class="{active:tabActive===4}">
                    <edit-add-worker :formData="formData"
                                     :attachFileTab="attachFileTab"
                                     :createFilePath="createFilePath"
                                     :delFile="delFile"
                                     :downLoadFile="downLoadFile"
                                     :isView="isView"
                                     :isAdmin="isAdmin"
                                     :editDetailData="editDetailData"
                                     :addFile="addFile"
                                     :getFileExt="getFileExt"
                                     :attachmentData="attachmentData"
                                     :isUserInWorkers="isUserInWorkers"
                                     :list_emp_sa_mg="list_emp_sa_mg"
                                     :is_mango="is_mango"
                                     :fileUpload="fileUpload" />
                  </div>
                  <div class="tab-pane" v-bind:class="{active:tabActive===5}">
                    <edit-add-checker-after :formData="formData"
                                            :attachFileTab="attachFileTab"
                                            :createFilePath="createFilePath"
                                            :delFile="delFile"
                                            :downLoadFile="downLoadFile"
                                            :isView="isView"
                                            :isAdmin="isAdmin"
                                            :editDetailData="editDetailData"
                                            :addFile="addFile"
                                            :getFileExt="getFileExt"
                                            :emp_is_software_tester="emp_is_software_tester"
                                            :isSoftwareTester="isSoftwareTester"
                                            :fileUpload="fileUpload" />
                  </div>
                  <div class="tab-pane" v-bind:class="{active:tabActive===11}">
                    <edit-sendback-ref :is_mango="is_mango"
                                       :formData="formData"
                                       :attachFileTab="attachFileTab"
                                       :createFilePath="createFilePath"
                                       :delFile="delFile"
                                       :downLoadFile="downLoadFile"
                                       :isView="isView"
                                       :isAdmin="isAdmin"
                                       :editDetailData="editDetailData"
                                       :addFile="addFile"
                                       :getFileExt="getFileExt"
                                       :fileUpload="fileUpload" />
                  </div>
                  <div class="tab-pane" v-bind:class="{active:tabActive===6}">
                    <edit_add_manual :formData="formData"
                                     :attachFileTab="attachFileTab"
                                     :createFilePath="createFilePath"
                                     :delFile="delFile"
                                     :downLoadFile="downLoadFile"
                                     :isView="isView"
                                     :isAdmin="isAdmin"
                                     :editDetailData="editDetailData"
                                     :addFile="addFile"
                                     :getFileExt="getFileExt"
                                     :fileUpload="fileUpload" />
                  </div>
                  <div class="tab-pane" v-bind:class="{active:tabActive===7}">
                    <edit-add-checker-before :formData="formData"
                                             :attachFileTab="attachFileTab"
                                             :createFilePath="createFilePath"
                                             :delFile="delFile"
                                             :downLoadFile="downLoadFile"
                                             :isView="isView"
                                             :isAdmin="isAdmin"
                                             :editDetailData="editDetailData"
                                             :addFile="addFile"
                                             :getFileExt="getFileExt"
                                             :emp_is_software_tester="emp_is_software_tester"
                                             :isSoftwareTester="isSoftwareTester"
                                             :fileUpload="fileUpload" />
                  </div>
                  <div class="tab-pane" v-bind:class="{active:tabActive===8}">
                    <edit-add-spec :formData="formData"
                                   :attachFileTab="attachFileTab"
                                   :createFilePath="createFilePath"
                                   :delFile="delFile"
                                   :downLoadFile="downLoadFile"
                                   :isView="isView"
                                   :isAdmin="isAdmin"
                                   :editDetailData="editDetailData"
                                   :addFile="addFile"
                                   :getFileExt="getFileExt"
                                   :appendRows="appendRows"
                                   @openAddSpecModal="openAddSpecModal()" />
                  </div>
                  <div class="tab-pane" v-bind:class="{active:tabActive===9}">
                    <edit-signature :formData="formData"
                                    :attachFileTab="attachFileTab"
                                    :createFilePath="createFilePath"
                                    :delFile="delFile"
                                    :downLoadFile="downLoadFile"
                                    :isView="isView"
                                    :isAdmin="isAdmin"
                                    :editDetailData="editDetailData"
                                    :addFile="addFile"
                                    :getFileExt="getFileExt"
                                    :getParsedDescription="getParsedDescription" />
                  </div>
                  <div class="tab-pane" v-bind:class="{active:tabActive===10}">
                    <edit-comment-external ref="comment_external"
                                           :showCommentExtLength="showCommentExtLength"
                                           :showCommentExt="showCommentExt"
                                           :data_="data_"
                                           :updateCommentExt="updateCommentExt"
                                           :deleteCommentExt="deleteCommentExt"
                                           :setEditCommentExt="setEditCommentExt"
                                           :createBr="createBr"
                                           :formData="formData"
                                           :editDetailData="editDetailData"
                                           :isAdmin="isAdmin"
                                           :commentText="commentText"
                                           :localCommentText="localCommentText"
                                           :isView="isView"
                                           :getFileExt="getFileExt"
                                           :isUserInWorkers="isUserInWorkers"
                                           @UpdateCommentTextExt="updateCommentTextExt($event)"
                                           @UpdateCommentTextExt2="updateCommentTextExt2($event)" />

                  </div>
                  <input type="file" ref="myFile" name="myFile" accept=".doc, .docx, .xls, .xlsx, .txt, .ppt, .pptx, .pdf, .zip, .rar, .mp4, image/*" v-show="false" hidden>
                </div>
              </div>
            </div>
          </div>

        </div>
      </template>
      <template #footer>
        <div class="row">
          <!-- <hr /> -->
          <div class="col-lg-12 col-md-12 col-sm-12 text-left">
            <button class="btn btn-sm bg-navy" v-if="!editDetailData['is_db'] && (formData['request_empno'] == auth.empno || formData['assign_empno'] == auth.empno)" @click="confirmTasks()"><i class="fas fa-plus"></i> {{ ui.csm_v2_confirm_transaction }}</button>
            <button class="btn btn-sm bg-olive" v-if="canUpdateDetail" @click="confirmUpdateDetail()"><i class="fa fa-check-circle"></i> {{ ui.csm_trn_update_data }}</button>

            <button class="btn btn-sm btn-github" v-if="isMango && (editDetailData['tester_empno'] == auth.empno) && (send_test_bug.some(s => s.code_s_bug === editDetailData.item_type) && (formData.request_empno != auth.empno || editDetailData['tester_empno'] == auth.empno)) && ((editDetailData.tester_approve_tmp != 'Y' && editDetailData.status_tmp != 'Y') || editDetailData.tester_empno == auth.empno) && editDetailData.is_db && editDetailData.status_tmp == 'W' && editDetailData.send_pretest_to_tester_status != 'Y'" @click="updateTester()"><i class="fas fa-refresh"></i> บันทึกผลการทดสอบ (สำหรับ Tester เท่านั้น)</button>

            <!-- <button class="btn btn-sm bg-orange" @click="closeTasks()"><i class="fa fa-close"></i> <span v-text="editDetailData.is_db ? 'ปิดหน้าต่าง' : 'ยกเลิกรายการ'"></span></button> -->
            <button class="btn btn-sm bg-orange" @click="closeTasks()"><i class="fa fa-close"></i> <span v-text="formData.request_empno != auth.empno || editDetailData.is_db ? ui.csm_v2_close_window : ui.csm_trn_cancel_item"></span></button>

            <button class="btn btn-sm btn-danger" v-if="(formData['request_empno'] == auth.empno || isAdmin) && ['N','W','H'].includes(editDetailData['status_tmp']) && !['I','Y'].includes(formData.job_status) && editDetailData.is_db && !(isMango && send_test_bug.some(s => s.code_s_bug === editDetailData.item_type) && editDetailData.tester_empno == auth.empno)" @click="delTask()"><i class="fas fa-trash"></i> <span v-text="'ลบรายการ'"></span></button>

            <button class="btn btn-sm bg-navy" v-if="formData.job_status != 'Y' && detailData.length > 1 && editDetailData.itemno > 1" @click="handleClickTask('back')"><span v-text="ui.re_back || 'ย้อนกลับ'"></span></button>

            <button class="btn btn-sm bg-navy" v-if="(editDetailData.isViewOnly && !editDetailData.showEditOnly) ? (formData.job_status != 'Y' && detailData.length > 1 && editDetailData.itemno < detailData.length) : (formData.job_status != 'Y' && detailData.length >= 1)" :disabled="(formData['request_empno'] == auth.empno ) ? formData.job_status_tmp != 'W' && formData.job_status_tmp != null && editDetailData.itemno === detailData.length : editDetailData.itemno === detailData.length && formData.job_status_tmp != 'W'" @click="handleClickTask('next')"><span v-text="ui.re_next || 'ถัดไป'"></span></button>

            <button class="btn btn-sm btn-purple-pastel" @click.prevent="is_SA()"
                    v-if="list_emp_sa_mg.split(',').map(Number).includes(auth.empno) && !['Y','N'].includes(formData['job_status'])
                 && !xt.isEmpty(formData.job_no)&&(editDetailData.tester_approve=='Y'&&editDetailData.approve_status=='Y')&& isMango">
              <i class="far fa-file-code"></i> {{ ui.csm_trn_save_system_analyst }}
            </button>

          </div>
        </div>
      </template>
    </modal-2>

    <modal-2 ref="modalApprove" class="custom-modal">
      <template #header>
        <h4 style="margin: 0; color: #ffffffff; font-weight: 500;">
          <i class="fa fa-check-circle" style="color: #27ae60;"></i>
          {{ ui.csm_trn_approve_tasks }}
          <span style="font-size: 13px; color: #b7bfc0ff; font-weight: normal; margin-left: 8px;">( {{current_page}} / {{detailData.length || 0}} )</span>
        </h4>
      </template>
      <template #body>
        <div style="background: #f8f9fa; padding: 15px; margin: -15px; margin-bottom: 0;">
          <div style="background: white; border-radius: 8px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div class="row">
              <div class="col-md-12">
                <edit-approve-status ref="approveStatusModal"
                                     :approveTab="approveTab"
                                     :formData="formData" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer-left">
          <button type="button" class="btn btn-sm modal-close-btn" @click="$refs.modalApprove.closeModal()">
            <i class="fa fa-times"></i> {{ ui.csm_v2_close_window }}
          </button>
        </div>

        <div class="modal-footer-right approve-pager" v-if="formData.job_status != 'Y' && detailData.length > 1">
          <button type="button" class="btn btn-sm" v-if="editDetailData.itemno > 1" @click="handleClickApproveModal('back')">
            <i class="fa fa-arrow-left"></i> <span v-text="ui.re_back || 'ย้อนกลับ'"></span>
          </button>

          <button type="button" class="btn btn-sm" v-if="editDetailData.itemno < detailData.length" @click="handleClickApproveModal('next')">
            <span v-text="ui.re_next || 'ถัดไป'"></span> <i class="fa fa-arrow-right"></i>
          </button>
        </div>
      </template>
    </modal-2>
  </div>
</template>
<script>
  import edit_add_checker_after from './edit_tasks/edit_add_checker_after.vue'
  import edit_add_checker_before from './edit_tasks/edit_add_checker_before.vue'
  import edit_add_requester from './edit_tasks/edit_add_requester.vue'
  import edit_add_worker from './edit_tasks/edit_add_worker.vue'
  import edit_approve_status from './edit_tasks/edit_approve_status.vue'
  import edit_comment from './edit_tasks/edit_comment.vue'
  import edit_details from './edit_tasks/edit_details.vue'
  import edit_details_mobile from './edit_tasks/edit_details_mobile.vue'
  import edit_signature from './edit_tasks/edit_signature.vue'
  import edit_add_spec from './edit_tasks/edit_add_spec.vue'
  import edit_add_manual from './edit_tasks/edit_add_manual.vue'
  import edit_comment_external from './edit_tasks/edit_add_comment_external.vue'
  import edit_sendback_ref from './edit_tasks/edit_sendback_ref.vue'
  import { mapState } from 'vuex'


  export default {
    components: {
      "edit-add-checker-after": edit_add_checker_after,
      "edit-add-checker-before": edit_add_checker_before,
      "edit-add-requester": edit_add_requester,
      "edit-add-worker": edit_add_worker,
      "edit-approve-status": edit_approve_status,
      "edit-comment": edit_comment,
      "edit-details": edit_details,
      "edit-details-mobile": edit_details_mobile,
      "edit-signature": edit_signature,
      "edit-add-spec": edit_add_spec,
      "edit_add_manual": edit_add_manual,
      "edit-comment-external": edit_comment_external,
      "edit-sendback-ref": edit_sendback_ref
    },
    props: {
      is_mango: Function,
      changeMultiWorker: Function,
      statusClass: Function,
      // printTaskCsm:Function,
      editDetail: Function,
      itemTypeName: Function,
      reqTypeName: Function,
      empModalSelected: Function,
      saveChangeWorker: Function,
      is_wait: Function,
      detailData: Array,
      formData: Object,
      allWorkers: Array,
      addDetail: Function,
      statusName: Function,
      current_page: Number,
      editDetailData: Object,
      isEdit: Boolean,
      isAdmin: Boolean,
      showComment: Function,
      showCommentExtLength: Function,
      showCommentExt: Function,
      data_: Array,
      updateCommentExt: Function,
      deleteCommentExt: Function,
      setEditCommentExt: Function,
      createBr: Function,
      commentText: String,
      localCommentText: String,
      isView: Boolean,
      updateComment: Function,
      setEditComment: Function,
      deleteComment: Function,
      createComment: Function,
      attachmentData: Array,
      emp_is_software_tester: Function,
      isSoftwareTester: Boolean,
      approveTab: Function,
      appendRows: Function,
      isViewOnly: Boolean,
      isEditDetail: Boolean,
      filterService: Function,
      filterJobType: Function,
      itemTypeChange: Function,
      openDescModal1: Function,
      checkRisk: Function,
      showRisk: Function,
      spliceRows: Function,
      datePriority: Function,
      clearData: Function,
      recoveryTesterTasks: Function,
      is_qc: Function,
      recoveryTasks: Function,
      is_claim: Function,
      openMapUrl: Function,
      openModalLocation: Function,
      customerWarData: Array,
      fromLine_req: Function,
      // service_group_select2x: Array,
      // filteredOptionsX: Array,
      filterSubData: Function,
      filterSubData2: Function,
      moduleCodeData: Array,
      SearchWarrantyx: Function,
      war_text: String,
      warCheck: Number,
      company: String,
      navigate: Function,
      delTask: Function,
      closeTasks: Function,
      confirmUpdateDetail: Function,
      getParsedDescription: Function,
      risk: Array,
      newModuleForMango: Array,
      serviceCodeData: [Object, Array],
      moduleChange: Function,
      newPlatformCodeData: Array,
      newRequestCodeData: Array,
      numericOnly: Function,
      selectedWarrantyItem: Function,
      updateTester: Function,
      formatOption: Function,
      formatSelection: Function,
      loadCustomerWarranty: Function,
      loadSupplierWarranty: Function,
      activeconfig: [Object, Array],
      sendComponent: Function,
      calProgress: Function,
      itupdateAuto: String,
      isUserInWorkers: Function,
      list_emp_sa_mg: String,
      is_SA: Function,
      program_list: [Object, Array],
    },
    data() {
      return {
        // ตัวชี้ขาดว่าแท็บ Description จะเรนเดอร์ edit_details (≥940px)
        // หรือ edit_details_mobile (≤939px) — อ่านค่าผ่าน matchMedia ให้เป็น
        // แหล่งเดียวกับเบรกพอยต์ใน trn001-responsive.css
        isNarrowSheet: window.matchMedia('(max-width: 939px)').matches,
        // เปิดโมดัลอยู่หรือไม่ — ใช้ตรึงเทมเพลตไม่ให้สลับกลางทาง
        sheetOpen: false,
        auth,
        baseUrl,
        ui: window.ui,
        xt: $xt,
        tabActive: 0,
        workerList: [],
        // warCheck:0,
        // customerWarData:[],
        // isEditDetail: false,
        // current_page: 0,
        // editDetailData: {},
      }
    },
    methods: {
      // จุดเดียวที่ประเมินช่วงจอ:
      //   กลุ่ม 1  ≤639 (มือถือ) + 640-939 (tablet ตั้ง) -> edit_details_mobile
      //   กลุ่ม 2  ≥940 (tablet นอน / desktop)           -> edit_details (เดิม)
      syncSheetVariant() {
        this.isNarrowSheet = window.matchMedia('(max-width: 939px)').matches
      },
      onSheetResize() {
        // ห้ามสลับระหว่างโมดัลเปิดอยู่ — <component :is> จะ destroy/create ใหม่
        // ทำให้ state ที่ยังไม่บันทึกของ edit_details หาย (allWorkersLocal ที่ยัง
        // ไม่ sendX, select2, gauge, สถานะ accordion) ค่อยประเมินใหม่ตอนปิด
        if (this.sheetOpen) return
        clearTimeout(this._sheetResizeTid)
        this._sheetResizeTid = setTimeout(() => {
          if (this.sheetOpen) return
          this.syncSheetVariant()
        }, 200)
      },
      changeTab(index) {
        this.tabActive = index
        if (index === 1) {
          this.$nextTick(() => {
            if (this.$refs.approveStatusTab) {
              this.$refs.approveStatusTab.refresh();
            }
          });
        }
      },
      handleEditTask(itemno, type) {

        this.$refs.editDetails.reset();

        switch (type) {
          case 'edit':
            this.$refs.editDetails.sendX();
            this.editDetail(itemno, false);
            break;
          case 'view':
            this.$refs.editDetails.sendX();
            this.editDetail(itemno, true);
            break;
          case 'review':
            this.editDetail(itemno, true);
            break;
        }

        this.changeTab(0)
        this.$refs.modalEditTask.setSize('modal-xl-2');
        this.$refs.modalEditTask.openModal();
      },
      date_ch(x) {
        const newDue = moment(x.response_date).add(this.datePriority(), 'days').toDate();
        x.due_date = newDue;
      },
      async confirmTasks() {
        if (this.isMango) {
          const code = this.editDetailData.item_type;
          const hasSoftwareUpdate = $linq(this.detailData).where(x => x['item_type'] === '11').count() > 0;
          const matchedItem = this.serviceCodeData.find(x => x.serv_code === code);
          if (hasSoftwareUpdate && this.detailData.length > 1) {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_alert_dup_update_software, 'warning');
            return;
          }
          else if (matchedItem && matchedItem.addspec_request == 'R') {
            if (this.formData['request_empno'] == this.auth.empno) {
              const hasAttachment = this.attachmentData.some(a => a.ref_itemno === this.editDetailData.itemno && a.item_type == 'P');

              if (!hasAttachment) {
                await $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_addspec_task, `warning`);
                return;
              }
            }
          }
        }

        if ($xt.isEmpty(this.editDetailData.item_type)) {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_service_type, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.module) && !this.isMango && this.activeconfig.TRN001H === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_area, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.req_type) && this.activeconfig.TRN001I === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_department_submitted, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.serv_code_d) && !this.isMango && this.activeconfig.TRN001J === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_category_of_work, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.serv_code_d2) && !this.isMango && this.activeconfig.TRN001K === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_type_of_work, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.object_type) && this.isMango && (this.activeconfig.TRN001K === 'Y' || ['11'].includes(this.editDetailData['item_type']))) {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_type_of_work, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.upd_software_dt) && this.isMango && ['11'].includes(this.editDetailData['item_type'])) {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_update_datetime, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.website_url) && this.isMango && ['11'].includes(this.editDetailData['item_type']) && !['WIN', 'MOB'].includes(this.editDetailData.platform)) {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_website_url, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.module) && this.isMango && this.activeconfig.TRN001H === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.erp_module, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.platform) && this.isMango && this.activeconfig.TRN001J === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.erp_platform, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.req_type) && this.isMango && this.activeconfig.TRN001I === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_req_type, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.object_type) && this.isMango && this.activeconfig.TRN001K === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.erp_job_type, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.subject) && this.activeconfig.TRN001L === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_subject_of_detail, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.detail) && this.activeconfig.TRN001M === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_description_of_detail, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.ref_docdate) && this.activeconfig.TRN001N === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_requested_date, `warning`)
          return
        }
        else if (this.editDetailData.risk_status == 'Y' && $linq(this.risk).where(x => x.ref_itemno == this.editDetailData['itemno']).any(x => $xt.isEmpty(x.description)) && this.isMango) {

          // $msg.alert(this.ui.csm_v2_warning, 'กรุณาระบุ Risk / Requirements Security <br> หากไม่มีให้เลือก No', `warning`)
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_risk_security, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.response_date) && this.activeconfig.TRN001O === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_response_date, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.due_date)) {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.erp_due_date, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.noti_date) && !this.isMango && this.activeconfig.TRN001Q === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_alert_before_due, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.item_name) && !this.isMango && this.activeconfig.TRN001R === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_item_product_list, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.map_url) && !this.isMango && this.activeconfig.TRN001S === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.erp_google_map_url, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.map_gps) && !this.isMango && this.activeconfig.TRN001T === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_gps_coordinates, `warning`)
          return
        }
        else if ($xt.isEmpty(this.editDetailData.map_desc) && !this.isMango && this.activeconfig.TRN001U === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_workplace_desc, `warning`)
          return
        }
        else if (((this.formData.request_empno == this.auth.empno && (this.formData.job_status != 'Y' || this.editDetailData.status != 'Y') && !this.isView) || this.isAdmin) && this.attachTasksCount('B') == 0 && this.activeconfig.TRN001V === 'Y') {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_file_requestor, `warning`);
          return;
        }
        else if (this.send_test_bug.some(s => s.code_s_bug === this.editDetailData.item_type) && this.formData.request_empno == this.auth.empno && $xt.isEmpty(this.editDetailData.revision_bug) && this.isMango) {

          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_revision_bug, `warning`)
          return
        }
        else if (this.send_test_bug.some(s => s.code_s_bug === this.editDetailData.item_type) && this.formData.request_empno == this.auth.empno &&
          (this.editDetailData.revision_bug && this.editDetailData.revision_bug.length > 10) && this.isMango) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_revision_max_10_short, `warning`)
          return
        }
        else if (this.formData.request_empno == this.auth.empno && $xt.isEmpty(this.editDetailData.contract_type) && (this.isMango || this.company == 'SCJV')) {

          if (this.isMango) {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_contract_in_out, `warning`)
          }
          if (this.company == 'SCJV') {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_warranty_in_out, `warning`)
          }
          return
        }
        else {
          // if ((this.formData['request_empno'] == this.auth.empno || this.formData['assign_empno'] == this.auth.empno) && this.formData['job_status'] != 'Y') appForm.btnSave.show = true
          // this.changeTab2(0)
          // this.warCheck = null
          if ((this.formData['request_empno'] == this.auth.empno || this.formData['assign_empno'] == this.auth.empno) && this.formData['job_status'] != 'Y')
            //   this.warCheck = null
            this.$refs.modalEditTask.closeModal()

        }
      },
      /* Method : Upload File */
      attachFileTab() {
        /* B = Requestor , A = Worker , Y = Checker , T = Update List , P = Addspec , SB = Checker Send Back */
        let type = ''
        switch (this.tabActive) {
          case 3: type = 'B'
            break
          case 4: type = 'A'
            break
          case 5: type = 'Y'
            break
          case 6: type = 'T'
            break
          case 7: type = 'S'
            break
          case 8: type = 'P'
            break
          case 9: type = 'S1'
            break
          case 11: type = 'SB'
            break
        }
        let d = []
        if (type === 'S1') {
          d = $linq(this.attachmentData).where(x => x.item_type == 'S1' && x.description == 'signature' && x.ref_itemno == this.editDetailData.itemno).toArray() || []
        } else {
          d = $linq(this.attachmentData).where(x => x.item_type == type && x.ref_itemno == this.editDetailData.itemno).toArray() || []
        }
        return d
      },
      attachTasksCount(item_type) {
        return $linq(this.attachmentData).where(x => x.ref_itemno == this.editDetailData.itemno && x.item_type == item_type).count()
      },
      async delFile(itemno, item_type) {
        if (!await $msg.confirm(this.ui.csm_trn_confirm_delete_attachment)) return;

        let newData = $linq(this.attachmentData).where(x => !(x.itemno == itemno && x.ref_itemno == this.editDetailData.itemno && x.item_type == item_type)).toArray()
        this.$emit('updateAttachment', newData);
      },
      async fileUpload(file) {
        let f = new FormData()
        f.append('file', file)
        try {
          let r = await $xt.postServerForm('Data/CSM_FileUploadToTemp', f)
          //let r = await $xt.postServerForm('Data/CSM_FileUploadToTemp', f)//ใช้หลังบ้านของ anywhere
          if (!r.success) {
            throw r.error
          }

          /* หากสำเร็จจะทำการ Push Data ลงใน attachmentData */
          let itemno = (this.attachmentData.length == 0 ? 0 : ($linq(this.attachmentData).max(x => x.itemno) || 0)) + 1
          this.attachmentData.push({
            itemno: itemno,
            sort_order: this.tabActive == 11 ? this.editDetailData.sendback_round : null,
            item_type: this.tabActive == 3 ? 'B' : this.tabActive == 4 ? 'A' : this.tabActive == 5 ? 'Y' : this.tabActive == 6 ? 'T' : this.tabActive == 7 ? 'S' : this.tabActive == 11 ? 'SB' : '',
            filepath: r.id || '',
            filename: r.filename || '',
            ref_itemno: this.editDetailData.itemno,
            add_user: this.auth.userid,
            add_dt: new Date(),
          })

          /* Fix : Bug Upload ไฟล์ต่อไปไม่ได้ ให้ทำการ Clear ไฟล์เดิมออกจากกล่อง Input File (by Kitapon 29/5/2563) */
          $(this.$refs.myFile).val('')
        }
        catch (ex) {
          $msg.alert('', ex.toString(), 'danger')
        }
      },
      createFilePath(x) {
        return dataServer + 'Api/File/DownLoad?id=' + x
      },
      downLoadFile(x) {
        const filepath = x.filepath; // ไม่ต้อง encode ถ้าเป็น ID
        // เอาเฉพาะตัวอักษร safe
        let filename = (x.filename || 'file').replace(/[%&?#]/g, '_');
        filename = encodeURIComponent(filename);
        return `${dataServer}API/File/DownLoad?id=${filepath}&download=true&filename=${filename}`;
      },
      getFileExt(f) {
        return f?.split('.').pop().toLowerCase()
      },
      addFile() {
        $(this.$refs.myFile).click()
      },

      async copyRow(x) {
        let maxItemNo = $linq(this.detailData).max(x => x.itemno) || 0;
        let item = JSON.parse(JSON.stringify(x))
        item.add_user = ""
        item.itemno = maxItemNo
        this.detailData.push(item)

        let i = 1
        this.detailData.forEach(x => {
          x.itemno = i++
        })
      },
      async insertRow(x, index) {
        let obj = {
          itemno: x.itemno + 1,
          status_tmp: 'W',
          approve_status: 'N',

          add_user: ''
        }
        this.detailData.splice(index + 1, 0, { ...obj });
        let i = 1
        this.detailData.forEach(x => {
          x.itemno = i++
        })
      },
      async printTaskCsm(x, item) {
        if ($xt.isEmpty(x.add_user)) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_save_before_print, `warning`)
          return
        }
        else {
          this.$emit("loading", "show");
          // page.loadingBox.show()
          let path = []
          let resp = await $xt.printServerPath('CSM', 'CSM_TASK', x.job_no, 'CSM_TASK', { itemno: item + 1 }, auth.maincode)
          path.push(resp.path)

          /* Send Print */
          await $xt.mergeDocumentPath(path)
          this.$emit("loading", "hide");
          // page.loadingBox.hide()
        }
      },
      updateCommentText(newValue) {
        this.$emit('UpdateCommentText', newValue);
      },
      updateCommentText2(newValue) {
        this.$emit('UpdateCommentText2', newValue);
      },
      updateCommentTextExt(newValue) {
        this.$emit('UpdateCommentTextExt', newValue);
      },
      updateCommentTextExt2(newValue) {
        this.$emit('UpdateCommentTextExt2', newValue);
      },
      handleClickTask(type) {
        this.$refs.editDetails.reset();
        switch (type) {
          case 'next':
            this.navigate('next')
            break
          case 'back':
            this.navigate('back')
            break
        }
      },
      handleClickApproveModal(type) {
        let currentIndex = this.detailData.findIndex(x => x.itemno === this.editDetailData.itemno);
        if (type === 'next' && currentIndex < this.detailData.length - 1) {
          this.editDetail(this.detailData[currentIndex + 1].itemno, true);
        } else if (type === 'back' && currentIndex > 0) {
          this.editDetail(this.detailData[currentIndex - 1].itemno, true);
        }
      },
      addDetailData() {
        this.$refs.editDetails.reset();
        this.addDetail()
      },
      openAddSpecModal() {
        this.$emit('openAddSpecModal')
      },
      onWorkersUpdated(data) {
        this.$emit('workers-updated', data);
        this.workerList = data
      },
      async copyWorker() {

        if (this.detailData.length > 1) {
          if (!$xt.isEmpty(this.formData.job_no)) {
            this.workerList = [...this.allWorkers];
          }
          if (!$xt.isEmpty(this.detailData[0].assign_empno)) {
            if (!await $msg.confirm(this.ui.csm_trn_confirm_copy_workers)) {
              return
            }
            this.detailData.forEach(d => {
              d.assign_empno = this.detailData[0].assign_empno;
              d.assign_empno_name = this.detailData[0].assign_empno_name;
            });

            var checkWorker = $xt.isEmpty(this.formData.job_no) ? this.workerList.length > 0 : this.allWorkers.length > 0;
            // console.log('checkWorker', checkWorker);

            if (checkWorker) {
              let maxTask = Math.max(...this.detailData.map(w => w.itemno || 0))
              let group = this.workerList.filter(w => w.reftask === 1)

              let result = []
              for (let r = 1; r <= maxTask; r++) {
                group.forEach((w, idx) => {
                  result.push({
                    ...w,
                    reftask: r,
                    itemno: idx + 1
                  })
                })
              }

              this.$refs.editDetails.allWorkersLocal = result;
              // this.onWorkersUpdated(result)
              this.$eventBus.$emit('update-worker-task', result);
              // console.log('last data', result);
            }
          } else {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_no_worker_to_copy, `warning`)
          }
        } else {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_no_task_to_copy, `warning`)
        }
      },
      async openApprove(data) {
        if (data && data.itemno) {
          await this.editDetail(data.itemno, true);
        } else if (!this.editDetailData || !this.editDetailData.itemno) {
          if (this.detailData && this.detailData.length > 0) {
            await this.editDetail(this.detailData[0].itemno, true);
          }
        }
        this.$refs.modalApprove.openModal();
        this.$nextTick(() => {
          if (this.$refs.approveStatusModal) {
            this.$refs.approveStatusModal.refresh();
          }
        });
      }

    },
    computed: {
      // สลับ template ของแท็บ Description ตามขนาดจอ (logic/props ใช้ชุดเดียวกัน
      // เพราะ edit_details_mobile extends edit_details)
      //   ≤ 939px  (มือถือ ≤639 + tablet ตั้ง 640-939) -> edit-details-mobile
      //   ≥ 940px  (tablet นอน / desktop)              -> edit-details ตัวเดิม
      // ค่าถูกตรึงไว้ตลอดช่วงที่โมดัลเปิด ดู onSheetResize
      editDetailsComp() {
        return this.isNarrowSheet ? "edit-details-mobile" : "edit-details"
      },
      ...mapState(['send_test_bug']),

      isMango() {
        return this.is_mango()
      },

      isMyWorker() {
        console.log('this.allWorkersLocal---', this.allWorkers, 'fdf', this.editDetailData.itemno)

        return this.allWorkers.some(w => w.reftask === this.editDetailData.itemno && w.empno === this.auth.empno) || false;
      },

      isTesterBugTask() {
        return this.send_test_bug.some(s => s.code_s_bug === this.editDetailData.item_type)
          && this.editDetailData.tester_empno == this.auth.empno
      },

      canUpdateDetail() {
        const d = this.editDetailData

        if (this.isMango && this.isTesterBugTask) {
          return !!d['is_db']
            && !['H'].includes(this.formData['job_status'])
            && (d.status_tmp != 'W' || d.send_pretest_to_tester_status == 'Y' || d.tester_approve == 'Y')
        }

        return !!(((this.isEditDetail || this.isViewOnly || this.isMyWorker)
          && ((d['assign_empno_tmp'] == this.auth.empno
            || this.formData['request_empno'] == this.auth.empno
            || this.formData['assign_empno'] == this.auth.empno
            || this.isMyWorker
            || (d['tester_empno'] == this.auth.empno || d['tester_empno_tmp'] == this.auth.empno))
            && !['H'].includes(this.formData['job_status']))
          && d['is_db'])
          || (this.isAdmin && this.formData.job_no))
      }

    },
    mounted() {
      window.addEventListener("resize", this.onSheetResize)
      // modal-2 ย้าย .modal ไปแขวนที่ document.body (modal-2.vue:149) และคลาส
      // custom-modal ติดอยู่ที่ root ของคอมโพเนนต์ซึ่งไม่ได้ถูกย้ายไปด้วย
      // ทำให้ CSS ไม่มี ancestor ให้เกาะ — ติดคลาสให้ตัว .modal ตรง ๆ
      this.$nextTick(() => {
        const sheet = this.$refs.modalEditTask && this.$refs.modalEditTask.$refs.myModal
        if (!sheet) return
        sheet.classList.add('trn001-sheet')

        // เกาะ event ของ bootstrap ที่ตัว .modal เอง จึงครอบทุกทางที่เปิดโมดัลนี้
        // (handleEditTask ในไฟล์นี้ และ addDetail ที่เรียก openModal จาก
        //  v_csm_trn_001.vue โดยตรง) — ประเมินช่วงจอ "ก่อน" โมดัลจะโผล่
        // ครั้งเดียว แล้วตรึงไว้จนปิด
        $(sheet).on('show.bs.modal.trn001sheet', () => {
          clearTimeout(this._sheetResizeTid)
          this.syncSheetVariant()
          this.sheetOpen = true
        })
        $(sheet).on('hidden.bs.modal.trn001sheet', () => {
          this.sheetOpen = false
          this.syncSheetVariant()
        })
      })
      this.$nextTick(() => {
        $(this.$refs.myFile).on('change', (e) => {
          this.fileUpload(e.target.files[0])
        })
      }),
        this.$nextTick(() => {
          const modalBody = document.querySelector('.custom-modal .modal .modal-dialog .modal-content .modal-body');
          const modalFooter = document.querySelector('.custom-modal .modal .modal-dialog .modal-content .modal-footer');
          if (modalBody) {
            modalBody.style.paddingTop = "0px";
          }
        });
    },
    beforeDestroy() {
      window.removeEventListener("resize", this.onSheetResize)
      clearTimeout(this._sheetResizeTid)
      const sheet = this.$refs.modalEditTask && this.$refs.modalEditTask.$refs.myModal
      if (sheet) $(sheet).off('.trn001sheet')
    },
  }
</script>
<style scoped>
  /* ─── Modal ─────────────────────────────────────────── */
  ::v-deep(.custom-modal .modal-header) {
    background: #ef7529 !important;
  }

  .approve-pager {
    gap: 0;
    border: 1px solid #dbe3ef;
    border-radius: 9px;
    background: #fff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
    overflow: hidden;
  }

  .approve-pager .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 32px;
    margin: 0;
    padding: 0 15px;
    border: none;
    border-radius: 0;
    background: transparent;
    color: #2c4a72;
    font-size: 12.5px;
    font-weight: 600;
    box-shadow: none;
    transition: background-color .16s ease, color .16s ease;
  }

  .approve-pager .btn + .btn {
    border-left: 1px solid #e5ebf4;
  }

  .approve-pager .btn:hover {
    background: #eff4fb;
    color: #16324f;
  }

  .approve-pager .btn:active {
    background: #e3ebf7;
  }

  .approve-pager .btn:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px rgba(44, 74, 114, .35);
  }

  .approve-pager .btn[disabled] {
    background: transparent;
    color: #a9b6ca;
    cursor: not-allowed;
  }

  .approve-pager .btn > i {
    font-size: 11px;
    opacity: .85;
    transition: transform .22s cubic-bezier(.2, .8, .3, 1);
  }

  .approve-pager .btn:hover > i.fa-arrow-left {
    transform: translateX(-2px);
  }

  .approve-pager .btn:hover > i.fa-arrow-right {
    transform: translateX(2px);
  }

  body.dark-mode .approve-pager {
    border-color: rgba(148, 163, 184, .20);
    background: rgba(148, 163, 184, .08);
    box-shadow: none;
  }

  body.dark-mode .approve-pager .btn {
    color: #c3d1e4;
  }

  body.dark-mode .approve-pager .btn + .btn {
    border-left-color: rgba(148, 163, 184, .20);
  }

  body.dark-mode .approve-pager .btn:hover {
    background: rgba(148, 163, 184, .16);
    color: #eaf1fa;
  }

  body.dark-mode .approve-pager .btn:active {
    background: rgba(148, 163, 184, .22);
  }

  /* ─── Task modal tabs ─────────────────────────────────────────────────────────
     Chips on a light rail, matching the section headers in the panel below.
     Selectors are qualified with .nav-tabs-custom because AdminLTE's own
     ".nav-tabs-custom > .nav-tabs" rules are more specific than a lone class and
     were repainting the rail white and stacking a blue border-top on the active
     tab — that plus the orange inset gave the old strip three competing markers. */
  .nav-tabs-custom > .nav-tabs.task-modal-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px 10px;
    background: #f4f6fa;
    border: none;
    border-bottom: 1px solid #e0e6ed;
    border-radius: 0;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: none;
    margin: 0;
    list-style: none;
  }

  /* AdminLTE reserves a 3px transparent border-top per tab and colours it on
     .active — zero it out so the chip is the only indicator. */
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li,
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active {
    margin: 0;
    border-top: none;
    float: none;
  }

  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li > a {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    font-size: 12.5px;
    font-weight: 500;
    color: #5c6b7d;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    text-decoration: none;
    white-space: nowrap;
    line-height: 1.5;
    margin: 0;
    transition: background .15s, color .15s;
  }

  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li > a:hover,
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li > a:focus {
    background: #e6ecf5;
    border-color: transparent;
    color: #1e293b;
    text-decoration: none;
  }

  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active > a,
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active > a:hover,
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active > a:focus {
    background: #24365e;
    border-color: #24365e;
    color: #fff;
    font-weight: 600;
    box-shadow: none;
  }

  /* Count badge — reads as data, not as part of the label */
  /* พื้น badge เดิม (#dfe6ef) ต่างจากแถบแท็บ (#f4f6fa) แค่ 1.16:1 จึงกลืนหายไป
     เปลี่ยนเป็นพื้นสีเข้มตัวอักษรขาว + สีประจำแท็บ แยกหมวดได้ด้วยสายตา */
  .nav-tabs-custom > .nav-tabs.task-modal-tabs .tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 19px;
    padding: 0 7px;
    border-radius: 999px;
    background: #64748b;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    box-shadow: 0 1px 3px rgba(15, 23, 42, .18);
    transition: transform .12s;
  }

  .nav-tabs-custom > .nav-tabs.task-modal-tabs .tab-count.tc-blue   { background: #2563eb; }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs .tab-count.tc-indigo { background: #4338ca; }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs .tab-count.tc-violet { background: #7c3aed; }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs .tab-count.tc-teal   { background: #0d7d74; }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs .tab-count.tc-amber  { background: #b45309; }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs .tab-count.tc-rose   { background: #e11d48; }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs .tab-count.tc-green  { background: #15803d; }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs .tab-count.tc-orange { background: #c2410c; }

  /* ── กดแท็บแล้ว: badge เด้งขึ้นมาเป็นพิลล์ขาวบนพื้น navy + เลขเป็นสีประจำแท็บ
        + วงเรืองแสงสีเดียวกัน  (สีเข้มบนพื้นเข้มจะจม จึงกลับขั้วเป็นพื้นขาว)
        specificity (0,5,1) > กฎสีประจำแท็บ (0,5,0) จึงทับได้ทุกสี ── */
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active .tab-count {
    min-width: 24px;
    height: 21px;
    padding: 0 8px;
    background: #fff;
    color: #24365e;
    font-size: 11.5px;
    letter-spacing: .2px;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, .34), 0 3px 10px rgba(0, 0, 0, .3);
    animation: tabCountPop .34s cubic-bezier(.34, 1.56, .64, 1);
  }

  /* (0,6,1) — เลข + วงเรืองแสงตามสีประจำแท็บ */
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active .tab-count.tc-blue   { color: #1d4ed8; box-shadow: 0 0 0 2px rgba(147, 197, 253, .7), 0 3px 14px rgba(59, 130, 246, .65); }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active .tab-count.tc-indigo { color: #3730a3; box-shadow: 0 0 0 2px rgba(165, 180, 252, .7), 0 3px 14px rgba(99, 102, 241, .65); }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active .tab-count.tc-violet { color: #6d28d9; box-shadow: 0 0 0 2px rgba(196, 181, 253, .7), 0 3px 14px rgba(139, 92, 246, .65); }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active .tab-count.tc-teal   { color: #0f766e; box-shadow: 0 0 0 2px rgba(94, 234, 212, .7), 0 3px 14px rgba(20, 184, 166, .65); }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active .tab-count.tc-amber  { color: #a15c07; box-shadow: 0 0 0 2px rgba(253, 224, 71, .7), 0 3px 14px rgba(245, 158, 11, .65); }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active .tab-count.tc-rose   { color: #be123c; box-shadow: 0 0 0 2px rgba(253, 164, 175, .7), 0 3px 14px rgba(244, 63, 94, .65); }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active .tab-count.tc-green  { color: #15803d; box-shadow: 0 0 0 2px rgba(134, 239, 172, .7), 0 3px 14px rgba(34, 197, 94, .65); }
  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active .tab-count.tc-orange { color: #c2410c; box-shadow: 0 0 0 2px rgba(253, 186, 116, .7), 0 3px 14px rgba(249, 115, 22, .65); }

  /* เด้งใหม่ทุกครั้งที่ .active ถูกใส่ให้ li — เพราะ element ไม่ได้ถูกสร้างใหม่
     แต่กฎนี้เพิ่งเริ่มมีผล เบราว์เซอร์จึงเริ่ม animation รอบใหม่ */
  @keyframes tabCountPop {
    0%   { transform: scale(.62); }
    55%  { transform: scale(1.22); }
    100% { transform: scale(1); }
  }

  .nav-tabs-custom > .nav-tabs.task-modal-tabs > li > a:hover .tab-count {
    transform: scale(1.06);
  }

  @media (prefers-reduced-motion: reduce) {
    .nav-tabs-custom > .nav-tabs.task-modal-tabs > li.active .tab-count { animation: none; }
  }

  .modal-tab-scroll {
    max-height: calc(100vh - 310px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* ─── Table wrapper ──────────────────────────────────── */
  .task-table-wrapper {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  }

  .table-task {
    margin-bottom: 0;
    font-size: 13px;
    border-collapse: separate;
    border-spacing: 0;
  }

  /* ─── Header ─────────────────────────────────────────── */
  .table-task thead tr {
    background: linear-gradient(135deg, #2c3e50 0%, #3d5166 100%);
  }

  .table-task thead th {
    color: #fff;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.4px;
    padding: 10px 8px;
    border: none;
    white-space: nowrap;
    vertical-align: middle;
  }

  .table-task thead th small {
    opacity: 0.75;
    font-weight: 400;
  }

  /* Column widths */
  .th-check  { width: 36px; }
  .th-no     { width: 40px; }
  .th-action { width: 100px; }
  .th-link   { width: 80px; }
  .th-module { width: 100px; }
  .th-subject{ width: 280px; }
  .th-type   { width: 130px; }
  .th-reqtype{ width: 120px; }
  .th-status { width: 110px; }
  .th-worker { width: 180px; }
  .th-checker{ width: 150px; }
  .th-date   { width: 140px; }
  .th-date-sm{ width: 120px; }
  .th-overdue{ width: 80px; }
  .th-approve{ width: 170px; }

  /* ─── Rows ───────────────────────────────────────────── */
  .table-task tbody tr.task-row {
    transition: background 0.15s ease;
  }

  .table-task tbody tr.task-row:hover {
    background-color: #f0f6ff !important;
  }

  .table-task tbody td {
    padding: 7px 8px;
    vertical-align: middle;
    border-top: 1px solid #eef0f3;
  }

  /* Zebra stripe */
  .table-task tbody tr.task-row:nth-child(even) {
    background-color: #fafbfc;
  }

  /* Overdue row highlight */
  .table-task tbody tr.row-overdue {
    background-color: #fff5f5 !important;
  }

  /* ─── No. badge ──────────────────────────────────────── */
  .badge-no {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #e8edf2;
    color: #3d5166;
    font-weight: 700;
    font-size: 11px;
  }

  /* ─── Action buttons ─────────────────────────────────── */
  .action-btn-group {
    display: flex;
    gap: 4px;
    justify-content: center;
    align-items: center;
  }

  .btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border-radius: 6px;
    border: 1px solid transparent;
    background: none;
    transition: all 0.15s ease;
    cursor: pointer;
  }

  .btn-icon:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .btn-icon-blue  { color: #3c8dbc; border-color: #c5dff0; }
  .btn-icon-blue:not(:disabled):hover  { background: #3c8dbc; color: #fff; }

  .btn-icon-teal  { color: #00a65a; border-color: #b3e0cc; }
  .btn-icon-teal:not(:disabled):hover  { background: #00a65a; color: #fff; }

  .btn-icon-gray  { color: #777; border-color: #ddd; }
  .btn-icon-gray:not(:disabled):hover  { background: #555; color: #fff; }

  /* Copy worker button in header */
  .btn-copy-worker {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    color: #fff;
    border-radius: 4px;
    padding: 1px 5px;
    margin-left: 4px;
    font-size: 11px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-copy-worker:hover { background: rgba(255,255,255,0.3); }

  /* ─── Link badges (Edit / View / Review) ────────────── */
  .link-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 5px;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    letter-spacing: 0.3px;
    transition: all 0.15s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  }
  .link-badge:hover {
    text-decoration: none;
    transform: translateY(-1px);
    box-shadow: 0 3px 7px rgba(0,0,0,0.18);
  }
  .link-badge:active { transform: translateY(0); }

  /* Edit — solid blue */
  .link-edit {
    background: linear-gradient(135deg, #2980b9, #1a6fa8);
    color: #fff !important;
    border: 1px solid #1a6fa8;
  }
  .link-edit:hover { background: linear-gradient(135deg, #3498db, #2980b9); color: #fff !important; }

  /* View — solid teal/green */
  .link-view {
    background: linear-gradient(135deg, #27ae60, #1e8449);
    color: #fff !important;
    border: 1px solid #1e8449;
  }
  .link-view:hover { background: linear-gradient(135deg, #2ecc71, #27ae60); color: #fff !important; }

  /* Review — solid amber/orange */
  .link-review {
    background: linear-gradient(135deg, #e67e22, #ca6f1e);
    color: #fff !important;
    border: 1px solid #ca6f1e;
  }
  .link-review:hover { background: linear-gradient(135deg, #f39c12, #e67e22); color: #fff !important; }

  /* ─── Module tag ─────────────────────────────────────── */
  .module-tag {
    display: inline-block;
    background: #eef2f7;
    color: #4a5568;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 11px;
    font-weight: 500;
  }

  /* ─── Subject ────────────────────────────────────────── */
  .subject-wrapper {
    position: relative;
    display: inline-block;
    max-width: 280px;
    width: 100%;
  }

  .subject-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
    max-width: 280px;
    cursor: pointer;
  }

  .subject-tooltip {
    display: none;
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    z-index: 9999;
    background: #2c3e50;
    color: #fff;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 12px;
    line-height: 1.5;
    min-width: 200px;
    max-width: 400px;
    width: max-content;
    white-space: pre-wrap;
    word-wrap: break-word;
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    pointer-events: none;
  }

  .subject-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 20px;
    border: 6px solid transparent;
    border-top-color: #2c3e50;
  }

  .subject-wrapper:hover .subject-tooltip {
    display: block;
  }

  /* ─── Type badge ─────────────────────────────────────── */
  .type-badge {
    display: inline-block;
    background: #f0f4ff;
    color: #3d5a99;
    border-radius: 4px;
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 600;
  }

  /* ─── Status pill ────────────────────────────────────── */
  .status-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    background: #e2e8f0;
    color: #4a5568;
  }

  /* Map statusClass prefix 'pill-' to colors */
  .pill-W  { background: #f0f0f0; color: #BDBDBD; border: 1px solid #BDBDBD; }
  .pill-I  { background: #e3f2fd; color: #1976D2; border: 1px solid #1976D2; }
  .pill-S  { background: #E4FED7; color: #2E7D32; border: 1px solid #4CAF50; }
  .pill-X  { background: #ede7f6; color: #6200EE; border: 1px solid #6200EE; }
  .pill-T  { background: #e8eaf6; color: #3F51B5; border: 1px solid #3F51B5; }
  .pill-U  { background: #e0f2f1; color: #00897B; border: 1px solid #00897B; }
  .pill-Y  { background: #e8f5e9; color: #43A047; border: 1px solid #43A047; }
  .pill-R  { background: #ffebee; color: #C62828; border: 1px solid #C62828; }
  .pill-B  { background: #fff3e0; color: #E65100; border: 1px solid #EF6C00; }
  .pill-H  { background: #FFF9C4; color: #F9A825; border: 1px solid #FBC02D; }
  .pill-N  { background: #eceff1; color: #455A64; border: 1px solid #455A64; }

  /* Row status background tint */
  .row-status-W  { background-color: #f5f5f5 !important; }
  .row-status-I  { background-color: #e3f2fd !important; }
  .row-status-S  { background-color: #E4FED7 !important; }
  .row-status-X  { background-color: #ede7f6 !important; }
  .row-status-T  { background-color: #e8eaf6 !important; }
  .row-status-U  { background-color: #e0f2f1 !important; }
  .row-status-Y  { background-color: #e8f5e9 !important; }
  .row-status-R  { background-color: #ffebee !important; }
  .row-status-B  { background-color: #fff3e0 !important; }
  .row-status-H  { background-color: #FFF9C4 !important; }
  .row-status-N  { background-color: #eceff1 !important; }

  /* ─── Person name ────────────────────────────────────── */
  .person-name {
    font-size: 12px;
    color: #2d3748;
  }

  .btn-search-worker {
    margin-left: 4px;
    color: #3c8dbc;
    font-size: 12px;
  }

  /* ─── Date cells ─────────────────────────────────────── */
  .date-text {
    font-size: 12px;
    white-space: nowrap;
  }

  /* datepicker wrapper — block + full width */
  ::v-deep .td-date .vdp-datepicker {
    display: block;
    width: 116px;
    position: relative;
  }

  /* ซ่อน calendar-button icon ที่ทับ text */
  ::v-deep .td-date .vdp-datepicker__calendar-button {
    display: none !important;
  }

  /* input field — ไม่ต้องเผื่อ padding ขวาสำหรับ icon แล้ว */
  ::v-deep .td-date .vdp-datepicker input,
  .datepicker-compact {
    font-size: 12px !important;
    padding: 3px 6px !important;
    height: 28px !important;
    min-width: 110px !important;
    width: 116px !important;
    box-sizing: border-box !important;
    cursor: pointer;
  }

  /* ─── Overdue badge ──────────────────────────────────── */
  .overdue-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: #f8d7da;
    color: #721c24;
    border-radius: 10px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }

  /* ─── Approve Status badges ──────────────────────────── */
  .approve-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: filter 0.15s;
    background: #e2e8f0;
    color: #4a5568;
  }
  .approve-badge:hover { filter: brightness(0.93); }

  .approve-success { background: #d4edda; color: #155724; }
  .approve-danger  { background: #f8d7da; color: #721c24; }
  .approve-primary { background: #cce5ff; color: #004085; }
  .approve-purple  { background: #e8d5f5; color: #5b2c8d; }
  .approve-warning { background: #fff3cd; color: #856404; }

  /* ─── Checkbox ───────────────────────────────────────── */
  .td-check {
    width: 36px;
    text-align: center;
    vertical-align: middle;
  }

  /* ลด checkbox ให้พอดีกับแถว */
  .td-check .form-check-input {
    width: 20px !important;
    height: 20px !important;
    margin: 0 !important;
    vertical-align: middle;
    cursor: pointer;
    accent-color: #3c8dbc;
    position: relative;
    top: 0;
    border-radius: 4px !important;
  }
  .label-purple {
    background-color: purple;
  }

  .btn-purple-pastel {
    background-color: #c39bd3;
    color: white;
    border-color: #c39bd3;
  }
  .modal-open .modal{overflow-x: hidden;}
</style>
