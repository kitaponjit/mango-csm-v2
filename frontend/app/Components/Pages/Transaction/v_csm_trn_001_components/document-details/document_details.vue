<template>
  <div class="dd-shell" style="display: flex; flex-direction: column; height: calc(100vh - 190px);">
    <div style="flex-shrink: 0;">
    <!-- Label : Cancel Document -->
    <div class="row" v-show="formData.job_status == 'N'">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="modern-callout modern-callout-danger">
          <div class="mc-header"><i class="fas fa-times-circle"></i> {{ ui.erp_cancel_document }}</div>
          {{ ui.erp_document_no }} {{formData.job_no}} {{ ui.csm_trn_doc_cancelled_by_requestor }} <br />
          <label v-show="formData['job_status'] == 'N'">{{ ui.csm_trn_cancel_reason }} : {{formData['cancel_remark']}}</label>
        </div>
      </div>
    </div>
    <!-- Label : Hold Document -->
    <div class="row" v-show="formData.job_status == 'H'">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="modern-callout modern-callout-warning">
          <div class="mc-header"><i class="fas fa-info-circle"></i> {{ ui.csm_v2_note }}</div>
          {{ ui.erp_document_no }} {{formData.job_no}} {{ ui.csm_trn_doc_is_draft }}
        </div>
      </div>
    </div>
    <!-- Label : Wait Approve Document -->
    <div class="row" v-show="(detailDataCount - prapproveDataReject) != prapproveDataAccept && formData.job_status != 'H'">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="modern-callout modern-callout-info">
          <div class="mc-header"><i class="fas fa-triangle-exclamation"></i> {{ ui.csm_trn_doc_wait_approve }}</div>
          {{ ui.erp_document_no }} <a href="#" @click.prevent="openApproveModal" class="mc-link" :title="ui.csm_trn_view_approve_detail">{{formData.job_no}}</a> {{ ui.csm_trn_doc_wait_approve_detail }} <br />
          <span class="text-bold">{{ ui.csm_v2_note }} : </span> {{ ui.csm_trn_note_edit_then_resend }}
        </div>
      </div>
    </div>
    <!-- Label : Wait Accept Document -->
    <div class="row" v-show="formData.assign_empno != auth.empno && formData.job_status_tmp == 'W' && detailDataCount > 0 && prapproveDataAccept > 0 && detailDataCount == prapproveDataAccept && testerApproveCount == 0 && isRejectCount == 0">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="modern-callout modern-callout-pink">
          <div class="mc-header"><i class="fas fa-triangle-exclamation"></i> {{ ui.csm_trn_doc_wait_accept }}</div>
          {{ ui.erp_document_no }} {{formData.job_no}} {{ ui.csm_trn_doc_wait_accept_from }} {{formData.assign_empno_name}} {{ ui.csm_trn_doc_wait_accept_note }}<br />
          <span><b>{{ ui.csm_v2_note }} : </b> {{ ui.csm_trn_note_can_edit_before_accept }}</span>
        </div>
      </div>
    </div>
    <!-- Label : Wait Tester Document -->
    <div class="row" v-show="formData.job_status_tmp == 'W' && detailDataCount > 0 && prapproveDataAccept > 0 && detailDataCount == prapproveDataAccept && testerApproveWait > 0 && formData.tester_approve != 'R'">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="modern-callout modern-callout-warning">
          <div class="mc-header"><i class="fas fa-triangle-exclamation"></i> {{ ui.csm_home_wait_check_doc }}</div>
          {{ ui.erp_document_no }} {{formData.job_no}} {{ ui.csm_trn_doc_wait_check_detail }}
        </div>
      </div>
    </div>
    <!-- Label : Reject by Tester Document -->
    <div class="row" v-show="testerApproveReject > 0">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="modern-callout modern-callout-danger">
          <div class="mc-header"><i class="fas fa-times-circle"></i> {{ ui.csm_trn_has_reject_from_tester }}</div>
          {{ ui.erp_document_no }} {{formData.job_no}} {{ ui.csm_trn_doc_reject_detail }}
        </div>
      </div>
    </div>
    <!-- Label : Customer MA Expire -->
    <div class="row" v-show="formData.mg_ma == 'N'">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="modern-callout modern-callout-danger">
          <div class="mc-header"><i class="fas fa-times-circle"></i> {{ ui.csm_trn_customer_ma_expire }}</div>
          {{ ui.csm_trn_customer_no_ma.replace('{0}', formData.customer_name) }}
        </div>
      </div>
    </div>
    <!-- Label : Current Job Status -->
    <div class="row job-status-strip" id="current_job_status">
      <info-status :formData="formData" :priorityCodeData_isActive="priorityCodeData_isActive" />
    </div>
    </div>
    <div class="dd-scroll" style="flex: 1; overflow-y: auto; min-height: 0;">
    <!-- Label : Acception Job -->
    <div class="row" v-show="formData['assign_empno'] == auth.empno && formData['job_status_tmp'] == 'W' && detailDataCount > 0 && prapproveDataAccept > 0 && detailDataCount == prapproveDataAccept && testerApproveCount == 0 && prapproveDataReject == 0">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="modern-section modern-section-success">
          <div class="ms-header">
            <i class="fas fa-clipboard-check"></i> {{ ui.csm_trn_acception }}
          </div>
          <div class="ms-body">
            <div class="row">
              <div class="col-lg-12 col-md-12 col-sm-12">
                <div class="modern-callout modern-callout-pink">
                  <div class="mc-header"><i class="fas fa-triangle-exclamation"></i> {{ ui.csm_v2_note }}</div>
                  {{ ui.csm_trn_accept_warning }}
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-12 col-md-12 col-sm-12">
                <p class="text-danger">
                  {{ ui.csm_trn_change_assignee_hint }}
                </p>
                <p class="text-danger">
                  {{ ui.csm_trn_accept_job_lock_note }}
                </p>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-12 col-md-12 col-sm-12">
                <button class="btn btn-sm bg-olive" @click="acceptJob"><i class="fas fa-check-circle"></i> {{ ui.csm_trn_accept_this_job }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Label : Reject Document Count -->
    <div class="row" v-show="formData['request_empno'] == auth.empno && isRejectCount > 0 && detailDataCount > 0 && formData['job_status'] != 'Y' && prapproveDataReject == 0">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="modern-callout modern-callout-danger">
          <div class="mc-header"><i class="fas fa-times-circle"></i> {{ ui.csm_trn_reject_count.replace('{0}', isRejectCount) }}</div>
          <p>{{ ui.csm_trn_reject_status_note }}</p>
        </div>
      </div>
    </div>
    <!-- Label : Confirm Close Job -->
    <div class="row" v-show="formData['request_empno'] == auth.empno && detailComplete == detailDataCount && detailDataCount > 0 && formData['job_status'] != 'Y'">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="modern-section modern-section-success">
          <div class="ms-body">
            <div class="row">
              <div class="col-md-12">
                <div class="modern-callout modern-callout-success">
                  <div class="mc-header"><i class="fas fa-circle-check"></i> {{ ui.csm_v2_note }}</div>
                  <p>{{ ui.csm_trn_ready_to_close_note }}</p>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <button class="btn btn-success btn-lg" href="#" @click.prevent="saveClick()">{{ui.csm_complete || 'ปิดงานนี้'}}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Header : QC Document -->
    <div class="row" v-if="formData['job_status'] == 'Y'">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="modern-section modern-section-success">
          <div class="ms-header" id="qc_panel">
            <i class="fas fa-star"></i> {{ ui.csm_trn_satisfaction_form }}
          </div>
          <div class="ms-body">
            <fieldset>
              <legend>{{ ui.csm_trn_survey_part1 }}</legend>
              <div class="row">
                <div class="col-lg-3 col-md-3 col-sm-3">
                  <label>{{ ui.csm_trn_select_question_set }}</label>
                  <select class="form-control input-sm" v-model.trim="qc_form_code" style="width:100%" @change="loadFormQCDetail" v-bind:disabled="!xt.isEmpty(qc_user) || (formData.request_empno != auth.empno)">
                    <option value="" selected="selected" disabled="disabled">{{ ui.csm_trn_select_question_set_ph }}</option>
                    <option :value="x.code" v-for="(x,idx) in questionData">{{x.description}}</option>
                  </select>
                </div>
              </div>
            </fieldset>
            <br />
            <fieldset>
              <legend>{{ ui.csm_trn_survey_part2 }}</legend>
              <template v-for="(x,idx) in answerData">
                <div class="row">
                  <div class="col-lg-12 col-md-12 col-sm-12">
                    <span style="font-size: 16px !important">{{ ui.csm_trn_question_no.replace('{0}', idx+1) }} {{x.itemname}}</span><span class="pull-right" style="font-size: 16px !important">{{ ui.csm_trn_score_received }} : {{x.score_ans}}</span>
                  </div>
                </div>
                <div class="row" style="margin-bottom:10px;">
                  <template v-for="(i,idx1) in x.max_score">
                    <div class="col-lg-1 col-md-1 col-sm-1">
                      <div class="input-group">
                        <div class="icheck-material-green">
                          <input type="radio" :id="'score_status'+idx+idx1" :name="'radio_score'+idx" v-model.number="x.score_ans" :value="i" v-bind:disabled="!xt.isEmpty(qc_user) || (formData.request_empno != auth.empno)" />
                          <label :for="'score_status'+idx+idx1">{{i}}</label>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </template>
              <div class="row" v-if="!isMango">
                <div class="col-lg-6 col-md-6 col-sm-12">
                  <label v-text="ui.suggestion || 'ข้อเสนอแนะ'"></label>
                  <textarea class="form-control input-sm" rows="3" v-model.trim="formData['qa_remark']"></textarea>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-12 col-md-12 col-sm-12">
                  <span class="pull-right" style="font-size: 16px;">{{ ui.csm_trn_total_score }} : {{calculateScore('score_ans')}} / {{ ui.csm_trn_full_score }} : {{calculateScore('max_score')}} / {{ ui.csm_trn_percent_of }} : {{calculatePercentage()}} %</span>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-6 col-md-6 col-sm-6">
                  <button class="btn btn-sm btn-success" @click="saveQC" v-bind:disabled="!xt.isEmpty(qc_user) || (formData.request_empno != auth.empno)"><i class="fa fa-save"></i> {{ ui.csm_trn_save_survey }}</button>
                </div>
                <div class="col-lg-6 col-md-6 col-sm-6">
                  <span class="pull-right">{{ ui.csm_trn_evaluator }} : {{qc_user || ""}} {{ ui.csm_v2_date }} : {{$date(qc_date, 'DD/MM/YYYY HH:mm')}}</span>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
    <!-- Tab New -->
    <div class="row">
      <div class="col-md-12">
        <div class="">
          <div class="nav-tabs-custom" id="document_panel">
            <div class="tabbable-line">
              <ul class="nav nav-tabs">
                <li :class="{active:tabActive===0}"><a href="#" @click.prevent="changeTab(0)">{{ ui.csm_trn_tab_doc_assignment }}</a></li>
                <li :class="{active:tabActive===1}"><a href="#" @click.prevent="changeTab(1)">{{ ui.csm_trn_tab_work_detail }}</a></li>
              </ul>
              <div class="tab-content" id="tabContentInner" style="padding: 0px 0;">

                <div class="tab-pane" v-bind:class="{active:tabActive===0}">
                  <!-- Header : Document || Assign Document -->
                  <document-detail-assignment ref="document_detail_assignment"
                                              :formData="formData"
                                              :isDisabled="isDisabled"
                                              :openDescModal1="openDescModal1"
                                              :clearData="clearData"
                                              :customerModalSelected="customerModalSelected"
                                              :openModalComponent="openModalComponent"
                                              :openDepartment="openDepartment"
                                              :queryStringRemoteIP="queryStringRemoteIP"
                                              :isDeveloper="isDeveloper"
                                              :is_mango="is_mango"
                                              :isAdmin="isAdmin"
                                              :setContractUser="setContractUser"
                                              :priorityCodeData_isActive="priorityCodeData_isActive"
                                              :chk_code="chk_code"
                                              :historyTotal="historyTotal"
                                              :historyData="historyData"
                                              :empModalSelected="empModalSelected"
                                              :loadData="loadData"
                                              :sendComponent="sendComponent"
                                              :editDetailData="editDetailData"
                                              :detailData="detailData"
                                              :loadSupplierWarranty="loadSupplierWarranty"
                                              :loadArea="loadArea"
                                              :setContractData="setContractData"
                                              :loadCheckWarranty="loadCheckWarranty"
                                              :activeconfig="activeconfig"
                                              :config_req="config_req"
                                              :connectionCodeData="connectionCodeData"
                                              :storeMapLocation="storeMapLocation"
                                              @loading="forwardLoadingEvent($event)"
                                              />
                </div>
                <div class="tab-pane" v-bind:class="{active:tabActive===1}">
                  <job-detail ref="job_detail"
                              :is_mango="is_mango"
                              :formData="formData"
                              :allWorkers="allWorkers"
                              :detailData="detailData"
                              :changeMultiWorker="changeMultiWorker"
                              :statusClass="statusClass"
                              :editDetail="editDetail"
                              :itemTypeName="itemTypeName"
                              :reqTypeName="reqTypeName"
                              :empModalSelected="empModalSelected"
                              :saveChangeWorker="saveChangeWorker"
                              :is_wait="is_wait"
                              :addDetail="addDetail"
                              :statusName="statusName"
                              :current_page="current_page"
                              :editDetailData="editDetailData"
                              :isEdit="isEdit"
                              :isAdmin="isAdmin"
                              :showComment="showComment"
                              :showCommentExtLength="showCommentExtLength"
                              :showCommentExt="showCommentExt "
                              :data_="data_"
                              :updateCommentExt="updateCommentExt"
                              :deleteCommentExt="deleteCommentExt"
                              :setEditCommentExt="setEditCommentExt"
                              :createBr="createBr"
                              :commentText="commentText"
                              :isView="isView"
                              :updateComment="updateComment"
                              :setEditComment="setEditComment"
                              :deleteComment="deleteComment"
                              :createComment="createComment"
                              :attachmentData="attachmentData"
                              :emp_is_software_tester="emp_is_software_tester"
                              :isSoftwareTester="isSoftwareTester"
                              :approveTab="approveTab"
                              :appendRows="appendRows"
                              :isViewOnly="isViewOnly"
                              :isEditDetail="isEditDetail"
                              :openDescModal1="openDescModal1"
                              :checkRisk="checkRisk"
                              :showRisk="showRisk"
                              :spliceRows="spliceRows"
                              :fromLine_req="fromLine_req"
                              :datePriority="datePriority"
                              :clearData="clearData"
                              :recoveryTesterTasks="recoveryTesterTasks"
                              :is_qc="is_qc"
                              :recoveryTasks="recoveryTasks"
                              :is_claim="is_claim"
                              :openMapUrl="openMapUrl"
                              :openModalLocation="openModalLocation"
                              :customerWarData="customerWarData"
                              :service_group_select2x="service_group_select2x"
                              :filteredOptionsX="filteredOptionsX"
                              :filterSubData="filterSubData"
                              :filterSubData2="filterSubData2"
                              :SearchWarrantyx="SearchWarrantyx"
                              :war_text="war_text"
                              :warCheck="warCheck"
                              :itemTypeChange="itemTypeChange"
                              :moduleCodeData="moduleCodeData"
                              :company="company"
                              :navigate="navigate"
                              :delTask="delTask"
                              :closeTasks="closeTasks"
                              :confirmUpdateDetail="confirmUpdateDetail"
                              :getParsedDescription="getParsedDescription"
                              :risk="risk"
                              :filterService="filterService"
                              :newModuleForMango="newModuleForMango"
                              :moduleChange="moduleChange"
                              :newPlatformCodeData="newPlatformCodeData"
                              :newRequestCodeData="newRequestCodeData"
                              :filterJobType="filterJobType"
                              :numericOnly="numericOnly"
                              :selectedWarrantyItem="selectedWarrantyItem"
                              :updateTester="updateTester"
                              :formatOption="formatOption"
                              :formatSelection="formatSelection"
                              :testerApproveCount="testerApproveCount"
                              :isRejectCount="isRejectCount"
                              :prapproveDataAccept="prapproveDataAccept"
                              :loadCustomerWarranty="loadCustomerWarranty"
                              :loadSupplierWarranty="loadSupplierWarranty"
                              :sendComponent="sendComponent"
                              :activeconfig="activeconfig"
                              @openAddSpecModal="openAddSpecModal()"
                              @loading="forwardLoadingEvent($event)"
                              @UpdateCommentText="updateCommentText($event)"
                              @UpdateCommentText2="updateCommentText2($event)"
                              @updateAttachment="updateAttachment($event)"
                              @UpdateCommentTextExt="updateCommentTextExt($event)"
                              @UpdateCommentTextExt2="updateCommentTextExt2($event)"
                              :CalProgress="calProgress"
                              @workers-updated="onWorkersUpdated"
                              :itupdateAuto="itupdateAuto" 
                              :isUserInWorkers="isUserInWorkers"
                              :list_emp_sa_mg="list_emp_sa_mg"
                              :is_SA= "is_SA"
                              :program_list= "program_list"
                              :serviceCodeData="serviceCodeData"
                              
                              />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    <!-- Modal :Open File PDF (Copy Database) -->
    <modal-2 ref="ModalFileCopyDatas" :hideFooter="true">
      <template #header>
        <!--<h4><i class='fas fa-tasks'>Add Worker </i></h4>-->
      </template>

      <template #body>
        <div class="row">
          <div class="col-md-12">
            <label class="d-block mb-3 text-justify"
                   style="white-space: normal; word-break: break-word;"
                   v-html="ui.csm_trn_copy_db_notice">
            </label>
          </div>

          <div class="col-md-12 text-center mb-4 pull-left">
            <a :href="showPDf" target="_blank" class="btn btn-download pull-left">
              📥 {{ ui.csm_trn_download_file }}
            </a>
          </div>
        </div>

        <div class="row pull-right">
          <div class="col-md-12 text-center">
            <button type="button"
                    class="btn btn-sm btn-primary me-2"
                    @click.prevent="checkTab()">
              {{ ui.csm_v2_ok }}
            </button>
            <button type="button"
                    class="btn btn-sm btn-secondary"
                    @click.prevent="$refs.ModalFileCopyDatas.closeModal()">
              {{ ui.erp_close }}
            </button>
          </div>
        </div>
      </template>
    </modal-2>


    <!-- Header : Detail Document -->
    <!-- <vue-project-list ref="ct_project" @send-data="sendComponent($event, 'project')"></vue-project-list>
    <vue-project2-list ref="ct_project2" @send-data="sendComponent($event, 'project')" :chk_code="chk_code"></vue-project2-list> -->
    <!-- <vue-department-list ref="ct_department" @send-data="sendComponent($event, 'department')"></vue-department-list> -->
    <vue-employee-list ref="ct_emp" @send-data="sendComponent($event, 'emp')"></vue-employee-list>
    <vue-responsible-employee-list ref="ct_responsible_emp" :pre_event="formData.pre_event" @send-data="sendComponent($event, 'emp')"></vue-responsible-employee-list>
    <vue-cm-customer-list ref="ct_cm_customer" @send-data="sendComponent($event, 'cm_customer')"></vue-cm-customer-list>
    <vue-form-list ref="form_modal_1" id="form_modal_1" :customer_code="formData['customer_code']" :pre_event="formData['pre_event']" :package_code="formData['package_code']" :formcode="editDetailData['formcode']" :item_type="editDetailData['item_type']" @send-data="sendComponent($event, 'form')"></vue-form-list>
    <vue-addspec-list ref="ct_addspec" @send-data="sendComponent($event, 'addspec')"></vue-addspec-list>
    <description-modal ref="descriptionModal" @send-data="sendComponent($event, currentForm )"></description-modal>
    <div class="dd-actionbar" style="flex-shrink: 0; background: #fff; box-shadow: 0 -2px 6px rgba(0,0,0,0.08); padding-top: 3px;">
      <app-form ref="appForm">
        <template slot="extraBtn">
          <button class="btn btn-sm btn-warning" v-if="(isEdit && formData.request_empno == auth.empno && !['I','H','N','Y'].includes(formData.job_status) && tabActive===0)|| isAdmin" @click="confirmNewApprove()"><i class="fas fa-refresh"></i> {{ ui.csm_trn_resend_approve }}</button>
          <button class="btn btn-sm btn-danger" v-if="isEdit && formData.request_empno == auth.empno && !['I','Y','N','H','D'].includes(formData['job_status']) && tabActive===0" data-toggle="modal" data-target="#cancelModal"><i class="fas fa-times-circle"></i> {{ ui.erp_cancel_document }}</button>
          <!-- <button class="btn btn-sm bg-orange" v-if="formData['request_empno'] == auth.empno && !['W','I','Y','N'].includes(formData['job_status']) && tabActive===0" @click="saveTemplate()"><i class="fas fa-save"></i> บันทึกฉบับร่าง</button> -->
          <button class="btn btn-sm bg-orange" v-if="!['W','I','Y','N'].includes(formData['job_status']) && tabActive===0" @click="saveTemplate()"><i class="fas fa-save"></i> {{ ui.csm_trn_save_draft }}</button>
          <button class="btn btn-sm btn-danger" v-if="formData['request_empno'] == auth.empno && !['W','I','Y','N'].includes(formData['job_status']) && tabActive===0 && !xt.isEmpty(formData.job_no)" @click="deleteTemplate()"><i class="fas fa-trash"></i> {{ ui.csm_trn_cancel_draft }}</button>
        </template>
      </app-form>
    </div>
  </div>
</template>

<script type="text/javascript">
  import stustus from './status_priority_document.vue'
  import documentDetailAssignment from './assignment/document_detail_assignment.vue'
  import jobDetail from './job-detail/job_detail.vue'

  import { mapState, mapGetters } from '~/stores/helpers'

  let page = {}
  let appForm = {}

  export default {
    components: {
      "info-status": stustus,
      "document-detail-assignment": documentDetailAssignment,
      "job-detail": jobDetail
    },
    props: {
      is_mango: Function,
      acceptJob: Function,
      // loadFormQCDetail: Function,
      // calculateScore: Function,
      // calculatePercentage: Function,
      // saveQC: Function,
      isDisabled: Function,
      openDescModal1: Function,
      clearData: Function,
      sendComponent: Function,
      customerModalSelected: Function,
      openModalComponent: Function,
      openDepartment: Function,
      isDeveloper: Function,
      queryStringRemoteIP: Function,
      setContractUser: Function,
      // questionData:Array,
      // answerData:Array,
      connectionCodeData: Array,
      formData: Object,
      allWorkers: Array,
      historyTotal: Object,
      historyData: Array,
      editDetailData: Object,
      priorityCodeData_isActive: Array,
      // qc_form_code: String,
      chk_code: String,
      detailDataCount: Number,
      prapproveDataReject: Number,
      testerApproveReject: Number,
      isRejectCount: Number,
      prapproveDataAccept: Number,
      detailComplete: Number,
      testerApproveCount: Number,
      testerApproveWait: Number,
      isAdmin: Boolean,
      historyPaging: Object,
      changeMultiWorker: Function,
      detailData: Array,
      statusClass: Function,
      editDetail: Function,
      itemTypeName: Function,
      reqTypeName: Function,
      saveChangeWorker: Function,
      empModalSelected: Function,
      is_wait: Function,
      addDetail: Function,
      statusName: Function,
      current_page: Number,
      isEdit: Boolean,
      showComment: Function,
      showCommentExtLength: Function,
      showCommentExt: Function,
      data_: Array,
      updateCommentExt: Function,
      deleteCommentExt: Function,
      setEditCommentExt: Function,
      createBr: Function,
      commentText: String,
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
      checkRisk: Function,
      showRisk: Function,
      spliceRows: Function,
      fromLine_req: Function,
      datePriority: Function,
      recoveryTesterTasks: Function,
      is_qc: Function,
      recoveryTasks: Function,
      is_claim: Function,
      openMapUrl: Function,
      openModalLocation: Function,
      customerWarData: Array,
      service_group_select2x: Array,
      filteredOptionsX: Array,
      filterSubData: Function,
      filterSubData2: Function,
      moduleCodeData: Array,
      SearchWarrantyx: Function,
      war_text: String,
      warCheck: Number,
      itemTypeChange: Function,
      company: String,
      navigate: Function,
      delTask: Function,
      closeTasks: Function,
      confirmUpdateDetail: Function,
      confirmNewApprove: Function,
      saveClick: Function,
      getParsedDescription: Function,
      risk: Array,
      loadData: Function,
      isAdmin: Boolean,
      filterService: Function,
      newModuleForMango: Array,
      moduleChange: Function,
      newPlatformCodeData: Array,
      newRequestCodeData: Array,
      filterJobType: Function,
      numericOnly: Function,
      saveTemplate: Function,
      deleteTemplate: Function,
      selectedWarrantyItem: Function,
      updateTester: Function,
      formatOption: Function,
      formatSelection: Function,
      loadSupplierWarranty: Function,
      loadArea: Function,
      setContractData: Function,
      loadCustomerWarranty: Function,
      qc_user: String,
      qc_date: Date,
      loadCheckWarranty: Function,
      activeconfig: [Object, Array],
      config_req: String,
      approveClick: Function,
      serviceCodeData: [Object, Array],
      prapproveDataTotal: Number,
      storeMapLocation: Object,
      calProgress: Function,
      itupdateAuto: String,
      // confirmTasks: Function,
      isUserInWorkers: Function,
      list_emp_sa_mg: String,
      is_SA: Function,
      program_list: [Object, Array],
    },
    data() {
      return {
        auth,
        baseUrl,
        ui: window.ui,
        xt: $xt,
        tabActive: 0,
        qc_form_code: '',
        answerData: [],
        questionData: [],
        showPDf: baseUrl + "Content/Images/PDF/MangoFORMCopyDB.pdf"
      }
    },
    methods: {
      changeTab(index) {
        this.tabActive = index
      },
      openApproveModal() {
        this.changeTab(1);
        this.$nextTick(() => {
          if (this.$refs.job_detail) {
            let dataToPass = this.formData;
            if (this.detailData && this.detailData.length > 0) {
              dataToPass = this.detailData[0];
            }
            this.$refs.job_detail.openApprove(dataToPass);
          }
        });
      },
      attachTasksCount(item_type) {
        return $linq(this.attachmentData).where(x => x.ref_itemno == this.editDetailData.itemno && x.item_type == item_type).count()
      },
      async isCheckSave() {
        //บันทึกข้อมูล
        let isSoftwareTester = await this.emp_is_software_tester();
        let hasMissingRevision = (this.detailData || []).some(i => this.send_test_bug.some(s => s.code_s_bug === i.item_type) && $xt.isEmpty(i.revision_bug))
        let invalidRevisionItems = (this.detailData || [])
          .filter(i =>
            this.send_test_bug.some(s => s.code_s_bug === i.item_type) &&
            i.revision_bug &&
            i.revision_bug.toString().length > 10
          )

        let hasMoreDigitRevision = invalidRevisionItems.length > 0

        let taskBugRevision = invalidRevisionItems.map(t => t.itemno)

        if ($xt.isEmpty(this.formData['subject'])) {
          this.changeTab(0)
          this.$refs.document_detail_assignment.$refs.subject.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_v2_subject, `warning`)
          return
        }
        else if ($xt.isEmpty(this.formData['job_priority'])) {
          this.changeTab(0)
          this.$refs.document_detail_assignment.$refs.job_priority.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_priority, `warning`)
          return
        }
        else if ($xt.isEmpty(this.formData['pre_event']) && $xt.isEmpty(this.formData['dpt_no']) && this.isMango) {
          this.changeTab(0)
          this.$refs.document_detail_assignment.$refs.pre_event.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_project_dept, `warning`)
          return
        }
        else if ((!$xt.isEmpty(this.formData['pre_event']) || !this.isMango) && $xt.isEmpty(this.formData['customer_code'])) {
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_v2_customer, `warning`)
          return
        }
        //////////////////////////////////////
        else if (this.formData.request_empno == this.auth.empno && this.isMango && hasMissingRevision) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_revision_all_task, 'warning')
          return;
        }
        else if ( this.formData.request_empno == this.auth.empno && this.isMango && hasMoreDigitRevision  ) {
          $msg.alert(
            this.ui.csm_v2_warning,
            this.ui.csm_trn_revision_max_10.replace('{0}', taskBugRevision.join(', ')),
            'warning'
          )
          return;
        }
        /////////////////////////////////////////
        else if ($xt.isEmpty(this.formData['contract_user']) && this.activeconfig.TRN001A == 'Y') {
          this.changeTab(0)
          this.$refs.document_detail_assignment.$refs.contract_user.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_contact_user, `warning`)
          return
        }
        else if ($xt.isEmpty(this.formData['contract_pos']) && this.activeconfig.TRN001B == 'Y') {
          this.changeTab(0)
          this.$refs.document_detail_assignment.$refs.contract_pos.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_contact_position, `warning`)
          return
        }
        else if ($xt.isEmpty(this.formData['phone']) && this.activeconfig.TRN001C == 'Y') {
          this.changeTab(0)
          this.$refs.document_detail_assignment.$refs.phone.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.erp_bd_phone, `warning`)
          return
        }
        else if ($xt.isEmpty(this.formData['email']) && this.activeconfig.TRN001D == 'Y') {
          this.changeTab(0)
          this.$refs.document_detail_assignment.$refs.email.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_v2_email, `warning`)
          return
        }
        else if ($xt.isEmpty(this.formData['connection_type']) && this.activeconfig.TRN001E == 'Y') {
          this.changeTab(0)
          this.$refs.document_detail_assignment.$refs.connection_type.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_connection, `warning`)
          return
        }
        else if ($xt.isEmpty(this.formData['remark']) && this.activeconfig.TRN001F == 'Y') {
          this.changeTab(0)
          this.$refs.document_detail_assignment.$refs.remark.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.erp_contact_details, `warning`)
          return
        }
        else if (this.detailData.length <= 0) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_at_least_one_task, `warning`)
          return
        }
        else if (((this.formData.request_empno == this.auth.empno && (this.formData.job_status != 'Y' || this.editDetailData.status != 'Y') && !this.isView) || this.isAdmin) && this.attachTasksCount('B') == 0 && this.activeconfig.TRN001V === 'Y') {
          this.$nextTick(() => {
            $('html,body').scrollTop($('#task_detail').offset().top);
          });
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_file_requestor, `warning`);
          return;
        }

        else if (((this.editDetailData.assign_empno == this.auth.empno && (this.formData.job_status != 'Y' || this.editDetailData.status != 'Y') && !this.isView) || this.isAdmin) && this.attachTasksCount('A') == 0 && this.activeconfig.TRN001W === 'Y') {
          this.$nextTick(() => {
            $('html,body').scrollTop($('#task_detail').offset().top);
          });
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_file_worker, `warning`);
          return;
        }
        else if (((this.editDetailData.tester_empno == this.auth.empno && this.editDetailData.send_pretest_to_tester_status == 'Y') || isSoftwareTester || this.isAdmin) && this.attachTasksCount('Y') == 0 && this.activeconfig.TRN001X == 'Y') {
          this.$nextTick(() => {
            $('html,body').scrollTop($('#task_detail').offset().top);
          });
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_file_checker_after, `warning`);
          return;
        }

        else if ($xt.isEmpty(this.formData['assign_empno_name'])) {
          this.changeTab(0)
          this.$refs.document_detail_assignment.$refs.assign_empno.focus()
          this.$nextTick(() => {
            $('html,body').scrollTop($('#document_panel').offset().top)
          })
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_responsibility_person, `warning`)
          return
        }
        else if (this.detailData.length > 0) {
          var countApprove = 0
          var hasWarning = false
          if (this.isMango) {
            // Check if there are multiple tasks with item_type '11'
            let hasMultipleType11 = false
            let type11Count = 0

            let otherTypeCount = $linq(this.detailData).where(x => x.item_type !== '11').count()
            
            type11Count = $linq(this.detailData).where(x => ['11'].includes(x['item_type'])).count()
            hasMultipleType11 = type11Count > 1

            // Show warning once if multiple item_type '11' tasks exist
            if (hasMultipleType11 || (type11Count > 0 && otherTypeCount > 0)) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_alert_dup_update_software, 'warning')
              hasWarning = true
              return
            }
            
            for (const item of this.detailData) {
              const code = item.item_type;
              const matchedItem = this.serviceCodeData.find(x => x.serv_code === code);
              
              if (matchedItem.addspec_request == 'R') {
                const hasAttachment = this.attachmentData.some(a => a.ref_itemno === item.itemno && a.item_type =='P');

                if (!hasAttachment && item.status=='W') {
                  await $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_addspec_item.replace('{0}', item.itemno), `warning`);
                  return;
                }
              }
            }

          }

          var file_name = $linq(this.attachmentData).where(x => x.item_type == 'B').toArray();
          var file_pretest = file_name.length;
          var item_type = $linq(this.detailData).where(x => x.item_type == '25').count();
          console.log('file------', 'tegg---', file_pretest, 'file_name', file_name, 'item_type===', item_type)

          if (item_type > 0 && this.isMango && file_pretest == 0) {
            this.$refs.ModalFileCopyDatas.openModal();
            return;
          }
          // return;

          const _serviceApproveMap = new Map(this.serviceCodeData.map(s => [s.serv_code, s.approve_st]))
          $linq(this.detailData).foreach(x => {
            let sm_service = _serviceApproveMap.get(x.item_type) || null
            if (sm_service == 'Y') {
              countApprove = countApprove + 1
            }
            if ($xt.isEmpty(x.response_date) && this.formData['request_empno'] == this.auth.empno && this.activeconfig.TRN001O === 'Y') {
              hasWarning = true
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_response_date + ' ' + this.ui.csm_trn_in_task.replace('{0}', x.itemno), `warning`)
              return
            }

            if ($xt.isEmpty(x.due_date)) {
              hasWarning = true
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_due_date_requestor, `warning`)
              //  $msg.alert(this.ui.csm_v2_warning, `These fields are required: Due Date(Requestor) in Tasks ${x.itemno}`, `warning`)
              return
            }
            if (this.isMango) {
              if (['11'].includes(x['item_type'])) {
                if ($xt.isEmpty(x.object_type)) {
                  hasWarning = true
                  $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_type_of_work + ' ' + this.ui.csm_trn_in_task.replace('{0}', x.itemno), `warning`)
                  return
                } else if ($xt.isEmpty(x.upd_software_dt)) {
                  hasWarning = true
                  $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_update_datetime + ' ' + this.ui.csm_trn_in_task.replace('{0}', x.itemno), `warning`)
                  return
                } else if ($xt.isEmpty(x.website_url) && !['WIN', 'MOB'].includes(x.platform)) {
                  hasWarning = true
                  $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_website_url + ' ' + this.ui.csm_trn_in_task.replace('{0}', x.itemno), `warning`)
                  return
                }
              }
            }
          })
          if (countApprove > 0 && this.formData['request_empno'] == this.auth.empno && !hasWarning) {
            if ((this.prapproveDataTotal == 0 && !this.isEdit) || (['H'].includes(this.formData['job_status']) && this.formData['request_empno'] == this.auth.empno)) {
              await this.approveClick()
            } else {
              this.saveClick()
            }
         //   console.log('dsdssddsw33333');
            return
          }
          else if (hasWarning) {
          //  console.log('dsdssdds');
            return
          }
          else if (this.formData.mg_ma == 'N' && $linq(this.detailData).any(x => !['03', '05', '08', '999', '22'].includes(x.item_type)) && this.isMango) {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_alert_no_ma_usage_form, `warning`)
            // $msg.alert(this.ui.csm_v2_warning, `As the customer has not renewed the MA, they are only allowed to open usage or form editing documents`, `warning`)
            return
          }
          else if (this.config.TENDER_JOB == 'Y' && $xt.isEmpty(this.formData.jobcode) && $xt.isEmpty(this.formData.dpt_no)) {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_required_fields_title + ': ' + this.ui.csm_trn_field_job_detail, `warning`)
            return
          }
          else {
            this.saveClick()
            return
          }
        }
        else {
          this.saveClick()
        }
      },
      /* Method : Question */
      async loadFormQC() {
        let act = `CSM/Master/QC_ReadList`
        let rsp = await $xt.getServer(act)
        this.questionData = rsp
      },
      async loadFormQCDetail() {
        let act = `csm/data/QCCSR_Read?form_code=${encodeURIComponent(this.qc_form_code || '')}&doctype=CSR`
        let rsp = await $xt.getServer(act)
        this.answerData = rsp.data

        let qadata = $linq(this.answerData).firstOrDefault()
        this.formData.qa_remark = qadata.remark
      },
      async saveQC() {
        if ($xt.isEmpty(this.qc_form_code)) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_formcode, `warning`)
          return
        }
        // หา ref_docno
        let check_refdocno = this.detailData.find(x => !$xt.isEmpty(x.ref_docno))
        // ถ้าไม่เจอให้เช็คชุดคำถาม
        if ($xt.isEmpty(check_refdocno)) {
          if (this.answerData.length > 0) {
            let countAnswer = $linq(this.answerData).where(x => x.score_ans == 0).count()
            if (countAnswer > 0) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_answer_count.replace('{0}', countAnswer), `warning`)
              return
            }
          }
        }
        // }
        try {
          var job_no = this.formData['job_no'] || ''
          let qa_remark = this.formData['qa_remark'] || ''
          let qadata = $linq(this.answerData).firstOrDefault()
          qadata.remark = qa_remark
          let f = {
            detail: this.answerData
          }
          this.$emit("loading", "show");
          let act = `CSM/Data/CSM_CreateQC?job_no=${job_no}`
          let rsp = await $xt.postServerJson(act, f)
          if (!rsp.success) {
            throw rsp.error
          }
          $notify.success(this.ui.alert_save_success)
          await this.loadData(job_no)
        } catch (ex) {
          this.$emit("loading", "hide");
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          this.$emit("loading", "hide");
        }
      },
      calculateScore(field) {
        return this.answerData.reduce((total, i) => {
          return total + i[field]
        }, 0)
      },
      calculatePercentage() {
        let score = $linq(this.answerData).sum(x => x.score_ans) || 0
        let max_score = $linq(this.answerData).sum(x => x.max_score) || 0
        return $xt.dec((score / max_score) * 100, 2)
      },
      // loading
      forwardLoadingEvent(status) {
        this.$emit("loading", status);  // ส่ง event ไปยัง Parent
      },
      updateCommentText(newValue) {
        this.$emit('UpdateCommentText', newValue);
      },
      updateCommentText2(newValue) {
        this.$emit('UpdateCommentText2', newValue);
      },
      updateAttachment(newValue) {
        this.$emit('updateAttachment', newValue);
      },
      openAddSpecModal() {
        this.$emit('openAddSpecModal')
      },
      updateCommentTextExt(newValue) {
        this.$emit('UpdateCommentTextExt', newValue);
      },
      updateCommentTextExt2(newValue) {
        this.$emit('UpdateCommentTextExt2', newValue);
      },
      onWorkersUpdated(data) {
        this.$emit('workers-updated', data);
      },
      checkTab() {
        let has_error = false
        let error_message = ''
        var file = $linq(this.attachmentData).where(x => x.item_type == 'B').toArray()
        if ($linq(file).count() == 0) {
          // error_message += `<li>กรุณาแนบไฟล์และป้อน Description หลังการทดสอบที่แท็บ ${tab_name} ด้วย</li>`
          has_error = true
        }
        console.log('filefilefile', file)
        if (has_error) {
          this.$refs.ModalFileCopyDatas.closeModal()
          this.changeTab(1)
          $xt.sleep(100);
          this.$refs.job_detail.$refs.modalEditTask.setSize('modal-xl-2');
          this.$refs.job_detail.$refs.modalEditTask.openModal();
          this.$refs.job_detail.changeTab(3)
          console.log('has_error', has_error)
        }
        //this.$refs.ModalFileCopyDatas.closeModal()
        return
      }
    },
    watch: {
      'formData.request_empno'(newVal) {
        this.$refs.appForm.btnSave.show = newVal === this.auth.empno;
      }
    },
    computed: {
      ...mapState(['config', 'send_test_bug']),
      isMango() {
        return this.is_mango()
      },
    },
    async mounted() {

      appForm = this.$refs.appForm
      appForm.btnNew.show = false
      appForm.btnAddRow.show = false
      appForm.btnRetrieve.show = false
      appForm.btnDelete.show = false
      appForm.btnPrint.show = false
      appForm.btnBack.show = false
      appForm.btnSave.show = true
      appForm.btnSave.click = this.isCheckSave
      this.$nextTick(() => {
        $(window).resize(() => {

          $('#tabContentInner').css({ 'max-height': ($(window).height() - 300) + 'px' })
          $('#tableFixed').css({ 'max-height': ($(window).height() - 220) + 'px' })
        })
        $(window).trigger('resize')
      })

    }
  }
</script>
<style scoped>
  .nav-tabs-custom .nav-tabs {
    position: sticky;
    top: 0;
    background: white;
    z-index: 99;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  }
  #tabContentInner {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  #tabContentInner::-webkit-scrollbar {
    display: none;
  }

  /* Dark Mode */
  body.dark-mode .nav-tabs-custom .nav-tabs {
    background: #152030 !important;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.4) !important;
  }

  /* ── Current Job Status strip ── */
  .job-status-strip {
    background: #fff;
    margin: -15px 0 0;
    border: 1px solid #e6ebf3;
    border-radius: 12px;
    box-shadow: 0 3px 14px rgba(15, 23, 42, .08);
    overflow: hidden;
  }

  /* ── Modern Callout ──
     ไอคอนเป็นชิปกลมสีทึบ = จุดโฟกัส / หัวเรื่อง 15px หนา 800 นำสายตา /
     พื้นไล่เฉด + เงาสีตัวเอง ทำให้แต่ละใบลอยแยกกันเมื่อซ้อนหลายอัน */
  .modern-callout {
    display: flex;
    flex-direction: column;
    gap: 5px;
    border-radius: 14px;
    border: 1px solid transparent;
    border-left-width: 5px;
    padding: 14px 18px 15px;
    margin-bottom: 11px;
    font-size: 13.5px;
    line-height: 1.65;
  }

  .modern-callout p { margin: 0; }
  .modern-callout > label { margin: 0; font-weight: 600; }

  .mc-header {
    font-weight: 800;
    font-size: 15px;
    letter-spacing: -.2px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 3px;
  }

  .modern-callout .mc-header > i {
    flex: 0 0 30px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
    color: #fff;
  }

  .mc-link {
    color: inherit;
    font-weight: 800;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
    padding: 1px 4px;
    border-radius: 5px;
    transition: background .15s;
  }
  .mc-link:hover { background: rgba(0, 0, 0, .07); color: inherit; }

  /* Danger — ระดับวิกฤต ให้เงาแรงสุดในชุด */
  .modern-callout-danger {
    background: linear-gradient(135deg, #fff6f6 0%, #ffeaea 100%);
    border-color: #f8b4b4;
    border-left-color: #ef4444;
    color: #7f1d1d;
    box-shadow: 0 0 0 1px rgba(239, 68, 68, .10), 0 5px 16px -6px rgba(239, 68, 68, .55);
  }
  .modern-callout-danger .mc-header { color: #c81e1e; }
  .modern-callout-danger .mc-header > i { background: #ef4444; box-shadow: 0 3px 9px -2px rgba(239, 68, 68, .8); }
  .modern-callout-danger > label {
    align-self: flex-start;
    margin-top: 3px;
    padding: 6px 12px;
    border-radius: 9px;
    background: rgba(239, 68, 68, .09);
    border: 1px solid rgba(239, 68, 68, .24);
    font-weight: 700;
  }

  /* Warning */
  .modern-callout-warning {
    background: linear-gradient(135deg, #fffcf0 0%, #fef3d4 100%);
    border-color: #f7d97b;
    border-left-color: #f59e0b;
    color: #78350f;
    box-shadow: 0 4px 14px -6px rgba(245, 158, 11, .5);
  }
  .modern-callout-warning .mc-header { color: #b45309; }
  .modern-callout-warning .mc-header > i { background: #f59e0b; box-shadow: 0 3px 9px -2px rgba(245, 158, 11, .8); }

  /* Info */
  .modern-callout-info {
    background: linear-gradient(135deg, #f4f9ff 0%, #e4eefe 100%);
    border-color: #a9caf9;
    border-left-color: #3b82f6;
    color: #1e3a5f;
    box-shadow: 0 4px 14px -6px rgba(59, 130, 246, .5);
  }
  .modern-callout-info .mc-header { color: #1d4ed8; }
  .modern-callout-info .mc-header > i { background: #3b82f6; box-shadow: 0 3px 9px -2px rgba(59, 130, 246, .8); }

  /* Success */
  .modern-callout-success {
    background: linear-gradient(135deg, #f4fdf7 0%, #dcfce7 100%);
    border-color: #86efac;
    border-left-color: #22c55e;
    color: #14532d;
    box-shadow: 0 4px 14px -6px rgba(34, 197, 94, .5);
  }
  .modern-callout-success .mc-header { color: #15803d; }
  .modern-callout-success .mc-header > i { background: #22c55e; box-shadow: 0 3px 9px -2px rgba(34, 197, 94, .8); }

  /* Pink */
  .modern-callout-pink {
    background: linear-gradient(135deg, #fef6fb 0%, #fbe8f7 100%);
    border-color: #eda8e8;
    border-left-color: #d946ef;
    color: #701a75;
    box-shadow: 0 4px 14px -6px rgba(217, 70, 239, .45);
  }
  .modern-callout-pink .mc-header { color: #a21caf; }
  .modern-callout-pink .mc-header > i { background: #d946ef; box-shadow: 0 3px 9px -2px rgba(217, 70, 239, .8); }

  /* ── Modern Section (replaces box box-*) ── */
  .modern-section {
    background: #ffffff;
    border-radius: 14px;
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    margin-bottom: 16px;
    overflow: hidden;
  }

  .ms-header {
    padding: 12px 18px;
    font-size: 14.5px;
    font-weight: 800;
    letter-spacing: -.2px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }

  .modern-section .ms-header > i {
    flex: 0 0 28px;
    width: 28px;
    height: 28px;
    border-radius: 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    line-height: 1;
    color: #fff;
  }

  .ms-body {
    padding: 16px 20px;
  }

  .modern-section-success .ms-header {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    color: #15803d;
  }
  .modern-section-success .ms-header > i {
    background: #22c55e;
    box-shadow: 0 3px 9px -2px rgba(34, 197, 94, .8);
  }

  /* ปุ่มลงมือทำในบล็อกพวกนี้เป็นปลายทางของ callout — ให้มีน้ำหนักพอ */
  .modern-section .ms-body .btn {
    border-radius: 10px;
    font-weight: 800;
    letter-spacing: .2px;
    transition: transform .12s, box-shadow .15s, filter .15s;
  }
  .modern-section .ms-body .btn:hover { filter: brightness(1.06); }
  .modern-section .ms-body .btn:active { transform: translateY(1px); }
  .modern-section .ms-body .btn-lg {
    padding: 11px 26px;
    font-size: 15px;
    box-shadow: 0 6px 18px -6px rgba(34, 197, 94, .85);
  }
  .modern-section .ms-body .bg-olive {
    box-shadow: 0 5px 14px -5px rgba(60, 141, 60, .75);
  }

  /* ── Dark Mode : callout / section ──
     ชิปไอคอนกับแถบซ้ายยังเป็นสีเต็มเหมือนเดิม เปลี่ยนแค่พื้นกับสีตัวอักษร */
  body.dark-mode .job-status-strip {
    background: #1e2a3a !important;
    border-color: #2d4057;
    box-shadow: 0 3px 14px rgba(0, 0, 0, .45);
  }

  body.dark-mode .modern-section {
    background: #1e2a3a;
    border-color: #2d4057;
    box-shadow: 0 2px 12px rgba(0, 0, 0, .4);
  }
  body.dark-mode .ms-header { border-bottom-color: #2d4057; }
  body.dark-mode .modern-section-success .ms-header {
    background: linear-gradient(135deg, rgba(34, 197, 94, .16), rgba(34, 197, 94, .07));
    color: #86efac;
  }

  body.dark-mode .modern-callout-danger {
    background: linear-gradient(135deg, rgba(239, 68, 68, .14), rgba(239, 68, 68, .06));
    border-color: rgba(239, 68, 68, .34);
    border-left-color: #ef4444;
    color: #fecaca;
    box-shadow: 0 5px 16px -6px rgba(0, 0, 0, .6);
  }
  body.dark-mode .modern-callout-danger .mc-header { color: #fca5a5; }
  body.dark-mode .modern-callout-danger > label {
    background: rgba(239, 68, 68, .16);
    border-color: rgba(239, 68, 68, .38);
  }

  body.dark-mode .modern-callout-warning {
    background: linear-gradient(135deg, rgba(245, 158, 11, .14), rgba(245, 158, 11, .06));
    border-color: rgba(245, 158, 11, .34);
    border-left-color: #f59e0b;
    color: #fde68a;
    box-shadow: 0 4px 14px -6px rgba(0, 0, 0, .55);
  }
  body.dark-mode .modern-callout-warning .mc-header { color: #fcd34d; }

  body.dark-mode .modern-callout-info {
    background: linear-gradient(135deg, rgba(59, 130, 246, .14), rgba(59, 130, 246, .06));
    border-color: rgba(59, 130, 246, .34);
    border-left-color: #3b82f6;
    color: #c7ddfd;
    box-shadow: 0 4px 14px -6px rgba(0, 0, 0, .55);
  }
  body.dark-mode .modern-callout-info .mc-header { color: #93c5fd; }

  body.dark-mode .modern-callout-success {
    background: linear-gradient(135deg, rgba(34, 197, 94, .14), rgba(34, 197, 94, .06));
    border-color: rgba(34, 197, 94, .34);
    border-left-color: #22c55e;
    color: #bbf7d0;
    box-shadow: 0 4px 14px -6px rgba(0, 0, 0, .55);
  }
  body.dark-mode .modern-callout-success .mc-header { color: #86efac; }

  body.dark-mode .modern-callout-pink {
    background: linear-gradient(135deg, rgba(217, 70, 239, .14), rgba(217, 70, 239, .06));
    border-color: rgba(217, 70, 239, .34);
    border-left-color: #d946ef;
    color: #f5d0fe;
    box-shadow: 0 4px 14px -6px rgba(0, 0, 0, .55);
  }
  body.dark-mode .modern-callout-pink .mc-header { color: #f0abfc; }

  body.dark-mode .mc-link:hover { background: rgba(255, 255, 255, .12); }
</style>

