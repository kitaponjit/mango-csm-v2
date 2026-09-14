<template>
  <div class="trn001-page">
    <re-page ref="page">
      <template #body>
        <div class="col-lg-12 col-md-12 col-sm-12">
          <div v-if="isMango" style="position:absolute;right:0px;z-index:999;">
            <i class="fa fa-chevron-circle-left"
               @click="$refs.page.openNav()"
               style="font-size:32px;color:rgb(144, 143, 143);cursor:pointer;
                      opacity:.85;transition:opacity .15s,transform .15s;"
               onmouseover="this.style.opacity='1';this.style.transform='scale(1.1)'"
               onmouseout="this.style.opacity='.85';this.style.transform='scale(1)'"></i>
          </div>
          <div class="nav-tabs-custom">
            <div class="tabbable-line">
              <ul class="nav nav-tabs navbar ">
                <li v-bind:class="{active:tabActive===0}"><a href="#" @click.prevent="changeTab(0)">{{ui.erp_document_datail||'รายละเอียดเอกสาร'}}</a></li>
                <li v-bind:class="{active:tabActive===1}"><a href="#" @click.prevent="changeTab(1)">{{ui.erp_status_document||'สถานะเอกสาร'}} ({{statusData.length || 0}})</a></li>
                <li v-bind:class="{active:tabActive===2}"><a href="#" @click.prevent="changeTab(2)">{{ ui.csm_trn_assignment_history }} ({{assignmentData.length || 0}})</a></li>
                <li v-bind:class="{active:tabActive===3}"><a href="#" @click.prevent="changeTab(3)">{{ ui.csm_trn_doc_history }} ({{csmHistotyData.length || 0}})</a></li>
                <li class="pull-right" v-if="!xt.isEmpty(formData.ref_plancode) && isMango">
                  <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; padding:8px 12px;">
                    <span style="font-size:11px; color:#666;">{{ui.erp_proj_ppn||'โครงการ PPN'}} :</span>
                    <span style="background:#fff3cd; color:#856404; border:1px solid #ffc107;
                                 border-radius:4px; padding:2px 8px; font-size:11px; font-weight:600;">
                      {{ formData.ref_pre_event_ppn }}
                      <span v-if="formData.ppnname" style="font-weight:400;">({{ formData.ppnname }})</span>
                    </span>
                    <span style="font-size:11px; color:#666;">{{ui.erp_plan||'แผน'}} :</span>
                    <span style="background:#d1f5d3; color:#155724; border:1px solid #28a745;
                                 border-radius:4px; padding:2px 8px; font-size:11px; font-weight:600;">
                      {{ formData.ref_plancode }}
                      <span v-if="formData.planname" style="font-weight:400;">({{ formData.planname }})</span>
                    </span>
                  </div>
                </li>

              </ul>
            
                <div class="tab-content" ref="myContent" id="tabContent" style="padding: 0px 0 !important;">
                  <!-- Tab : Open Requirement -->
                  <div class="tab-pane" v-bind:class="{active:tabActive===0}">
                    <document-details ref="document_details"
                                      :is_mango="is_mango"
                                      :formData="formData"
                                      :allWorkers="allWorkers"
                                      :acceptJob="acceptJob"
                                      :qc_form_code="qc_form_code"
                                      :loadFormQCDetail="loadFormQCDetail"
                                      :questionData="questionData"
                                      :answerData="answerData"
                                      :calculateScore="calculateScore"
                                      :calculatePercentage="calculatePercentage"
                                      :saveQC="saveQC"
                                      :isDisabled="isDisabled"
                                      :openDescModal1="openDescModal1"
                                      :priorityCodeData_isActive="priorityCodeData_isActive"
                                      :chk_code="chk_code"
                                      :clearData="clearData"
                                      :sendComponent="sendComponent"
                                      :customerModalSelected="customerModalSelected"
                                      :openModalComponent="openModalComponent"
                                      :openDepartment="openDepartment"
                                      :queryStringRemoteIP="queryStringRemoteIP"
                                      :isDeveloper="isDeveloper"
                                      :historyTotal="historyTotal"
                                      :historyData="historyData"
                                      :empModalSelected="empModalSelected"
                                      :editDetailData="editDetailData"
                                      :detailDataCount="detailDataCount"
                                      :prapproveDataReject="prapproveDataReject"
                                      :testerApproveReject="testerApproveReject"
                                      :isRejectCount="isRejectCount"
                                      :isAdmin="isAdmin"
                                      :prapproveDataAccept="prapproveDataAccept"
                                      :setContractUser="setContractUser"
                                      :detailComplete="detailComplete"
                                      :testerApproveCount="testerApproveCount"
                                      :testerApproveWait="testerApproveWait"
                                      :changeMultiWorker="changeMultiWorker"
                                      :detailData="detailData"
                                      :statusClass="statusClass"
                                      :editDetail="editDetail"
                                      :itemTypeName="itemTypeName"
                                      :reqTypeName="reqTypeName"
                                      :saveChangeWorker="saveChangeWorker"
                                      :is_wait="is_wait"
                                      :addDetail="addDetail"
                                      :statusName="statusName"
                                      :current_page="current_page"
                                      :isEdit="isEdit"
                                      :showComment="showComment"
                                      :showCommentExtLength="showCommentExtLength"
                                      :showCommentExt="showCommentExt"
                                      :data_="data_"
                                      :updateCommentExt="updateCommentExt"
                                      :deleteCommentExt="deleteCommentExt"
                                      :setEditCommentExt="setEditCommentExt"
                                      :createCommentExt="createCommentExt"
                                      :createBr="createBr"
                                      :commentText="commentText"
                                      :localCommentText="localCommentText"
                                      :localCommentExt="localCommentExt"
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
                                      :filterService="filterService"
                                      :itemTypeChange="itemTypeChange"
                                      :filterJobType="filterJobType"
                                      :checkRisk="checkRisk"
                                      :showRisk="showRisk"
                                      :spliceRows="spliceRows"
                                      :fromLine_req="fromLine_req"
                                      :datePriority="datePriority"
                                      :recoveryTesterTasks="recoveryTesterTasks"
                                      :is_qc="is_qc"
                                      :recoveryTasks="recoveryTasks"
                                      :is_claim="is_claim"
                                      :openMapUrl="openMapUrl"
                                      :openModalLocation="openModalLocation"
                                      :customerWarData="customerWarData"
                                      :filterSubData="filterSubData"
                                      :filterSubData2="filterSubData2"
                                      :SearchWarrantyx="SearchWarrantyx"
                                      :war_text="war_text"
                                      :warCheck="warCheck"
                                      :moduleCodeData="moduleCodeData"
                                      :company="company"
                                      :navigate="navigate"
                                      :delTask="delTask"
                                      :closeTasks="closeTasks"
                                      :confirmUpdateDetail="confirmUpdateDetail"
                                      :confirmNewApprove="confirmNewApprove"
                                      :saveClick="saveClick"
                                      :getParsedDescription="getParsedDescription"
                                      :risk="risk"
                                      :newModuleForMango="newModuleForMango"
                                      :moduleChange="moduleChange"
                                      :newPlatformCodeData="newPlatformCodeData"
                                      :newRequestCodeData="newRequestCodeData"
                                      :numericOnly="numericOnly"
                                      :loadData="loadData"
                                      :saveTemplate="saveTemplate"
                                      :deleteTemplate="deleteTemplate"
                                      :selectedWarrantyItem="selectedWarrantyItem"
                                      :updateTester="updateTester"
                                      :formatOption="formatOption"
                                      :formatSelection="formatSelection"
                                      :loadSupplierWarranty="loadSupplierWarranty"
                                      :loadArea="loadArea"
                                      :setContractData="setContractData"
                                      :loadCustomerWarranty="loadCustomerWarranty"
                                      :qc_user="qc_user"
                                      :loadCheckWarranty="loadCheckWarranty"
                                      :activeconfig="activeconfig"
                                      :config_req="config_req"
                                      :connectionCodeData="connectionCodeData"
                                      :approveClick="approveClick"
                                      :serviceCodeData="serviceCodeData"
                                      :prapproveDataTotal="prapproveDataTotal"
                                      :storeMapLocation="storeMapLocation"
                                      @openAddSpecModal="openAddSpecModal()"
                                      @UpdateCommentText="updateCommentText($event)"
                                      @UpdateCommentText2="updateCommentText2($event)"
                                      @updateAttachment="updateAttachment($event)"
                                      @loading="loadingBox($event)"
                                      @UpdateCommentTextExt="updateCommentTextExt($event)"
                                      @UpdateCommentTextExt2="updateCommentTextExt2($event)"
                                      :CalProgress="calProgress"
                                      @workers-updated="onWorkersUpdated"
                                      :itupdateAuto="itupdateAuto"
                                      :isUserInWorkers="isUserInWorkers"
                                      :list_emp_sa_mg="list_emp_sa_mg"
                                      :is_SA="is_SA"
                                      :program_list="program_list"
                                      />
                  </div>
                  <!-- Tab : Status -->
                  <div class="tab-pane" v-bind:class="{active:tabActive===1}">
                    <document-status ref="document_status"
                                     :formData="formData"
                                     :statusCodeData="statusCodeData"
                                     :queryString="queryString"
                                     @statusDataLoaded="val => statusData = val" />
                  </div>
                  <!-- Tab : Assign History -->
                  <div class="tab-pane" v-bind:class="{active:tabActive===2}">
                    <submission-history ref="submission_history"
                                        :assignmentData="assignmentData"
                                        :queryString="queryString"
                                        @assignmentDataLoaded="val => assignmentData = val" />
                  </div>
                  <!-- Tab : History -->
                  <div class="tab-pane" v-bind:class="{active:tabActive===3}">
                    <document-history ref="document-history"
                                      :csmHistotyData="csmHistotyData"
                                      :queryString="queryString"
                                      @csmHistotyDataDataLoaded="val => csmHistotyData = val" />
                  </div>
                </div>
              </div>

            </div>
        </div>
      </template>
      <template v-if="isMango" #nav-content>
        <div class="snav-grid">
          <!-- Analyze Similar Cases -->
          <div class="snav-tile" @click="$refs.page.closeNav(); Similar_case()">
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="14" width="23" height="29" rx="4" fill="#bfdbfe" stroke="#93c5fd" stroke-width="1.5"/>
              <rect x="9" y="9" width="23" height="29" rx="4" fill="#ffffff" stroke="#bfdbfe" stroke-width="1.5"/>
              <rect x="14" y="17" width="13" height="2.5" rx="1.25" fill="#bfdbfe"/>
              <rect x="14" y="22" width="13" height="2.5" rx="1.25" fill="#bfdbfe"/>
              <rect x="14" y="27" width="8" height="2.5" rx="1.25" fill="#bfdbfe"/>
              <circle cx="35" cy="35" r="11.5" fill="white" stroke="#2563eb" stroke-width="2.5"/>
              <circle cx="35" cy="35" r="7" fill="#eff6ff"/>
              <path d="M35 29.5L36.4 33.6L40.7 35L36.4 36.4L35 40.5L33.6 36.4L29.3 35L33.6 33.6Z" fill="#60a5fa"/>
              <line x1="43" y1="43" x2="49" y2="49" stroke="#1d4ed8" stroke-width="3.5" stroke-linecap="round"/>
            </svg>
            <span class="snav-label">Analyze<br>Similar Cases</span>
          </div>
          <!-- Setup Project Planning -->
          <div class="snav-tile"
               v-if="!['W','H','Y'].includes(formData.job_status) && xt.isEmpty(formData.ref_plancode) && xt.isEmpty(formData.ref_pre_event_ppn) && formData.assign_empno == auth.empno && (new Date(formData.add_dt) >= new Date('2025-07-01') || new Date(formData.job_date) >= new Date('2025-07-01'))"
               @click="$refs.page.closeNav(); openProjectPpnEmpty()">
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="7" y="11" width="36" height="38" rx="5" fill="#d1fae5" stroke="#6ee7b7" stroke-width="1.5"/>
              <rect x="19" y="6" width="16" height="10" rx="3.5" fill="#6ee7b7"/>
              <rect x="21" y="8" width="12" height="6" rx="2" fill="#ecfdf5"/>
              <rect x="13" y="23" width="18" height="5" rx="2.5" fill="#059669"/>
              <rect x="13" y="31" width="12" height="5" rx="2.5" fill="#34d399"/>
              <rect x="13" y="39" width="24" height="5" rx="2.5" fill="#6ee7b7" stroke="#34d399" stroke-width="1"/>
              <circle cx="37" cy="19" r="7" fill="#059669"/>
              <circle cx="37" cy="19" r="4.5" fill="#d1fae5"/>
              <rect x="36" y="11" width="2" height="3" rx="1" fill="#059669"/>
              <rect x="36" y="24" width="2" height="3" rx="1" fill="#059669"/>
              <rect x="29.5" y="18" width="3" height="2" rx="1" fill="#059669"/>
              <rect x="44.5" y="18" width="3" height="2" rx="1" fill="#059669"/>
            </svg>
            <span class="snav-label">{{ui.erp_setup_project||'Setup Project'}}<br>{{ui.erp_planning||'Planning'}}</span>
          </div>
          <!-- Reload Task -->
          <div class="snav-tile"
               v-if="!xt.isEmpty(formData.ref_plancode) && formData.assign_empno == auth.empno"
               @click="$refs.page.closeNav(); openModalChange()">
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 27 A14 14 0 0 1 41 27" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
              <path d="M41 27 A14 14 0 0 1 13 27" stroke="#fcd34d" stroke-width="3.5" stroke-linecap="round" fill="none"/>
              <polygon points="41,21 48,28 34,28" fill="#f59e0b"/>
              <polygon points="13,33 6,26 20,26" fill="#fcd34d"/>
              <rect x="17" y="19" width="20" height="16" rx="3" fill="white" stroke="#f59e0b" stroke-width="1.5"/>
              <polyline points="21,27 24,30 30,23" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <rect x="21" y="32" width="12" height="1.5" rx=".75" fill="#fcd34d"/>
            </svg>
            <span class="snav-label">Reload<br>Task</span>
          </div>
        </div>
      </template>
    </re-page>

    <!-- Modal : Approve Detail -->
    <approve-detail-modal ref="approveModal"
                          :approveFormOptions="approveFormOptions"
                          :approveFormCode.sync="approveFormCode"
                          :approveDetailData="approveDetailData"
                          :loadFormDetail="loadFormDetail"
                          :closeApproveModal="closeApproveModal"
                          :confirmApprove="confirmApprove"></approve-detail-modal>
    <!-- Modal : Cancel Request -->
    <cancel-request-modal :formData="formData" :cancelRequest="cancelRequest"></cancel-request-modal>
    <!-- Modal : Description -->
    <document-description-modal ref="descModal"
                                modalRef="DescModal"
                                eventType="description"
                                :descriptionData="descriptionData"
                                :desc_text.sync="desc_text"
                                :loadDescriptionData="loadDescriptionData"
                                :sendComponent="sendComponent"
                                :onPageChange="onPageChange"
                                :closeModal="closeDescModal"></document-description-modal>
    <!-- Modal : Description1 -->
    <document-description-modal ref="descModal1"
                                modalRef="DescModal1"
                                eventType="description1"
                                :showExtraColumn="true"
                                :descriptionData="descriptionData"
                                :desc_text.sync="desc_text"
                                :loadDescriptionData="loadDescriptionData"
                                :sendComponent="sendComponent"
                                :onPageChange="onPageChange"
                                :closeModal="closeDescModal1"></document-description-modal>
    <!-- Modal : Map Previe -->
    <map-preview-modal ref="prviewModal" :editDetailData="editDetailData"></map-preview-modal>
    <!-- Modal :Select Plan -->
    <select-plan-modal ref="select_plan"
                       :list_ppn="list_ppn"
                       :selectedPlan.sync="selectedPlan"
                       :DBgetApiPPN="DBgetApiPPN"
                       :getApiPPN="getApiPPN"></select-plan-modal>
    <!-- Modal : Change Detail Task -->
    <change-detail-task-modal ref="change_w"
                              :detailChange="detailChange"
                              :formData="formData"
                              :runAiAnalysis="runAiAnalysis"
                              :validateWorkerDates="validateWorkerDates"
                              :empModalSelected2="empModalSelected2"
                              :copyWorkerTaskToAll="copyWorkerTaskToAll"
                              :openAiAnalysisModal="openAiAnalysisModal"
                              :ValidUpdateDetailTask="ValidUpdateDetailTask"></change-detail-task-modal>
    <!-- Modal : AI Analysis Result -->
    <ai-analysis-modal ref="ai_analysis_modal"
                       :aiModalTab.sync="aiModalTab"
                       :aiAnalysisModalTokenIn="aiAnalysisModalTokenIn"
                       :aiAnalysisModalTokenOut="aiAnalysisModalTokenOut"
                       :aiAnalysisModalSubject="aiAnalysisModalSubject"
                       :aiAnalysisModalDifficultyLevel="aiAnalysisModalDifficultyLevel"
                       :aiAnalysisModalEstimatedEndDate="aiAnalysisModalEstimatedEndDate"
                       :aiAnalysisModalEstimatedDays="aiAnalysisModalEstimatedDays"
                       :aiAnalysisModalDifficultyReason="aiAnalysisModalDifficultyReason"
                       :aiAnalysisModalApprovalInfo="aiAnalysisModalApprovalInfo"
                       :aiAnalysisSectionList="aiAnalysisSectionList"
                       :aiAnalysisModalText="aiAnalysisModalText"
                       :aiEffectiveWorkerSection5="aiEffectiveWorkerSection5"
                       :aiAnalysisModalTextWk="aiAnalysisModalTextWk"
                       :canEditAiChecklist="canEditAiChecklist()"
                       :aiAnalysisChecklist="aiAnalysisChecklist"
                       :aiAnalysisChecklistSaving="aiAnalysisChecklistSaving"
                       :aiCompareSpecLoading="aiCompareSpecLoading"
                       :aiCompareSpecError="aiCompareSpecError"
                       :aiCompareSpecData="aiCompareSpecData"
                       :aiAnalysisExcelLoading="aiAnalysisExcelLoading"
                       :aiAnalysisPdfLoading="aiAnalysisPdfLoading"
                       :aiCompareSpecPdfLoading="aiCompareSpecPdfLoading"
                       :difficultyStyle="difficultyStyle"
                       :formatThaiDate="formatThaiDate"
                       :syncAiAnalysisFromMaster="syncAiAnalysisFromMaster"
                       :updateAiAnalysisChecklist="updateAiAnalysisChecklist"
                       :onClickCompareSpecTab="onClickCompareSpecTab"
                       :runAiCompareSpec="runAiCompareSpec"
                       :generateAiAnalysisChecklistExcel="generateAiAnalysisChecklistExcel"
                       :generateAiAnalysisPdf="generateAiAnalysisPdf"
                       :generateAiCompareSpecPdf="generateAiCompareSpecPdf"></ai-analysis-modal>
    <!-- <vue-project-list ref="ct_project" @send-data="sendComponent($event, 'project')"></vue-project-list> -->
    <vue-project2-list ref="ct_project2" @send-data="sendComponent($event, 'project')" :chk_code="chk_code" :is_mango="is_mango"></vue-project2-list>
    <vue-department-list ref="ct_department" @send-data="sendComponent($event, 'department')"></vue-department-list>
    <vue-employee-list ref="ct_emp" @send-data="sendComponent($event, 'emp')"></vue-employee-list>
    <vue-responsible-employee-list ref="ct_responsible_emp" :pre_event="formData.pre_event" @send-data="sendComponent($event, 'emp')"></vue-responsible-employee-list>
    <vue-cm-customer-list ref="ct_cm_customer" @send-data="sendComponent($event, 'cm_customer')"></vue-cm-customer-list>
    <vue-form-list ref="form_modal_1" id="form_modal_1" :customer_code="formData['customer_code']" :pre_event="formData['pre_event']" :package_code="formData['package_code']" :formcode="editDetailData['formcode']" :item_type="editDetailData['item_type']" @send-data="sendComponent($event, 'form')"></vue-form-list>
    <vue-addspec-list ref="ct_addspec" @send-data="sendComponent($event, 'addspec')"></vue-addspec-list>
    <description-modal ref="descriptionModal" @send-data="sendComponent($event, currentForm )"></description-modal>
    <worker-calendar-modal ref="worker_calendar" :worker_empno="worker_empno"></worker-calendar-modal>
    <!-- Modal : Analyze Similar Cases -->
    <modal-2 ref="modalSimilarCase">
      <template #header>
        <div class="modal-head">
          <div class="modal-head__icon" style="background:linear-gradient(135deg,#4f6ef7,#22d3ee);"><i class="fa fa-gears"></i></div>
          <div class="modal-head__text">
            <div class="modal-head__title">Analyze Similar Cases</div>
            <div class="modal-head__sub"><i class="fa fa-lightbulb-o"></i> {{ ui.csm_trn_analyze_similar_title }}</div>
          </div>
        </div>
      </template>
      <template #body>
        <div class="sc-wrap">
          <div class="row">
            <!-- LEFT PANEL -->
            <div class="col-md-6">
              <div class="sc-panel">
                <div class="sc-panel__head"><i class="fa fa-filter"></i> {{ ui.csm_trn_search_condition }}</div>
                <div class="sc-field">
                  <label class="sc-label">Name File Add Spec</label>
                  <span class="input-group input-group-sm">
                    <input type="text" class="form-control field-readonly" :value="scSpecName" readonly :placeholder="ui.csm_trn_select_spec_file" />
                    <span class="input-group-btn">
                      <button class="btn btn-default" @click="openAddSpecSimilar()" type="button" :title="ui.search"><i class="fa fa-search"></i></button>
                      <button class="btn btn-danger" @click="clearAddSpecSimilar()" type="button" :title="ui.csm_trn_clear_data"><i class="fa fa-times"></i></button>
                    </span>
                  </span>
                </div>
                <div class="sc-field">
                  <label class="sc-label">{{ ui.csm_trn_filter_detail }}</label>
                  <textarea class="form-control input-sm" v-model="scFilter" rows="3" style="resize:vertical" :placeholder="ui.csm_trn_type_keyword"></textarea>
                </div>
                <div class="sc-field" v-if="formData.job_no">
                  <label class="sc-label">{{ ui.erp_document_no }}</label>
                  <div class="sc-jobno-badge"><i class="fa fa-file-text-o"></i> {{ formData.job_no }}</div>
                </div>
                <div class="sc-field">
                  <label class="sc-label">{{ui.erp_attach_file||'ไฟล์แนบ'}}</label>
                  <div class="sc-attach-zone">
                    <label class="sc-attach-trigger">
                      <i class="fa fa-paperclip"></i> {{ ui.csm_trn_add_attachment }}
                      <input type="file" multiple style="display:none" ref="scFileInput" @change="onSimilarAttachChange($event)" />
                    </label>
                    <template v-if="scAttachFiles.length">
                      <div class="sc-attach-row" v-for="(f, i) in scAttachFiles" :key="i">
                        <i class="fa fa-file-o"></i>
                        <span class="sc-attach-name">{{ f.name }}</span>
                        <i class="fa fa-times sc-attach-del" @click="scAttachFiles.splice(i, 1)" :title="ui.erp_delete"></i>
                      </div>
                    </template>
                    <div class="sc-attach-empty" v-else>{{ ui.csm_trn_no_attachment }}</div>
                  </div>
                </div>
                <div class="sc-field sc-field-action">
                  <button class="sc-btn-analyze" type="button" :disabled="scAnalyzeLoading || !scSpecData" @click="analyzeSimilarCases()">
                    <i :class="scAnalyzeLoading ? 'fa fa-spinner fa-spin' : 'fa fa-magic'"></i>
                    {{ scAnalyzeLoading ? ui.csm_trn_analyzing : ui.csm_trn_analyze_similar }}
                  </button>
                </div>
              </div>
            </div>
            <!-- RIGHT PANEL -->
            <div class="col-md-6" style="padding-right:0">
              <div class="sc-panel sc-panel--dark">
                <div class="sc-panel__head--dark">
                  <span class="sc-ph-dot"></span> {{ ui.csm_trn_analysis_result }}
                  <span class="sc-badge-count" v-if="scResults.length">{{ scResults.length }} {{ ui.csm_trn_case_unit }}</span>
                </div>
                <div v-if="scResults.length || scAnalysis" class="sc-dark-body">
                  <div class="sc-no-result" v-if="!scResults.length && scAnalysis">
                    <i class="fa fa-search-minus"></i>
                    <span>{{ scAnalysis }}</span>
                  </div>
                  <div class="sc-tl-section" v-if="scResults.length">
                    <div class="sc-dark-label">{{ ui.csm_trn_similar_case }}</div>
                    <div class="sc-timeline">
                      <div class="sc-tl-row" v-for="(r, i) in scResults" :key="i">
                        <div class="sc-tl-track">
                          <div class="sc-tl-dot"></div>
                          <div class="sc-tl-line" v-if="i < scResults.length - 1"></div>
                        </div>
                        <div class="sc-tl-info">
                          <span class="sc-tl-no">{{ r.job_no }}</span>
                          <span class="sc-tl-date">{{ r.date }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="sc-report" v-if="analysisBlocks.length">
                    <div class="sc-dark-label" style="margin-top:12px">{{ ui.csm_trn_analysis_result }}</div>
                    <div v-for="(b, i) in analysisBlocks" :key="i" :class="['sc-rblock', 'sc-rblock--' + b.key]">
                      <div class="sc-rblock__head">
                        <span class="sc-rblock__icon">{{ b.icon }}</span>
                        <span class="sc-rblock__title">{{ b.label }}</span>
                      </div>
                      <div class="sc-rblock__body">{{ b.content }}</div>
                    </div>
                  </div>
                  <div class="sc-raw-text" v-else-if="scAnalysis">{{ scAnalysis }}</div>
                </div>
                <div class="sc-empty-state" v-else>
                  <div class="sc-empty-hex">⬡</div>
                  <div class="sc-empty-text">{{ ui.csm_trn_no_analysis_result }}</div>
                  <div class="sc-empty-hint">{{ ui.csm_trn_fill_and_analyze }}</div>
                </div>
              </div>
              <div class="sc-footer-actions">
                <button class="btn btn-default btn-sm" type="button"
                        :disabled="!scAnalysis || scPdfLoading"
                        @click="generateSimilarCasePdf()">
                  <i :class="scPdfLoading ? 'fa fa-spinner fa-spin' : 'fa fa-file-pdf-o'"></i>
                  {{ scPdfLoading ? 'กำลังสร้าง...' : 'Print PDF' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <vue-addspec-rpt ref="ct_addspec_sc" @send-data="addSpecSimilarSelected($event)"></vue-addspec-rpt>
      </template>
    </modal-2>
  </div>
  </template>
  <script type="text/javascript">
    import { mapState, mapGetters } from '~/stores/helpers'
    import document_details from './v_csm_trn_001_components/document-details/document_details.vue'
    import document_status from './v_csm_trn_001_components/document-status/document_status.vue'
    import submission_history from './v_csm_trn_001_components/submission-history/submission_history.vue'
    import document_history from './v_csm_trn_001_components/document-history/document_history.vue'
    import document_detail_assignment from './v_csm_trn_001_components/document-details/assignment/document_detail_assignment.vue'
    import status_priority_document from './v_csm_trn_001_components/document-details/status_priority_document.vue'

    let page = {}
    let appForm = {}
    let supplierPaging = {}
    let historyPaging = {}
    let descPaging = {}
    export default {
      components:{
        "document-details": document_details,
        "document-status": document_status,
        "submission-history": submission_history,
        "document-history": document_history,
        "document-detail-assignment": document_detail_assignment,
        "document-status-priority": status_priority_document
      },
      data() {
        return {
          auth,
          baseUrl,
          // baseRoute,
          queryString,
          ui: window.ui,
          xt: $xt,
          company: window.baseCompany,
          tabActive: 0,
          formData: {},
          editDetailData: {},
          detailData: [],
          prapproveData: [],
          prapproveDataTotal: 0,
          detailComplete: 0,
          commentData: [],
          // commentCusData: [],
          attachmentData: [],
          statusData: [],
          csmHistotyData: [],
          assignmentData: [],
          historyData: [],
          historyTotal: {},
          supplierData: [],
          customerWarData: [],
          // employeeData: [],
          contactData: {},
          // eventEmployee: [],
          // checkEmpno: 0,
          detailDataCount: 0,
          testerApproveCount: 0,
          testerApproveWait: 0,
          testerApproveReject: 0,
          prapproveDataAccept: 0,
          isRejectCount: 0,
          prapproveDataReject: 0,
          commentText: '',
          // commentCusText: '',
          approveHeaderData: [],
          approveDetailData: [],
          approveFormCode: '',
          questionData: [],
          answerData: [],
          descriptionData: [],
          subCodeData: [],
          subCodeData2: [],
          subData: [],
          qc_form_code: '',
          qc_user: '',
          qc_date: new Date(),
          empType: '',
          empIno: '',
          war_text: '',
          desc_text: '',
          risk: [],
          type_impact: '',
          isView: false,
          isEdit: false,
          isEditDetail: false,
          // isAppendRow: false,
          reloadData: false,
          checkAll: false,
          isNewApprove: false,
          newApprove: false,
          isAdmin: false,
          /* Variable : Center */
          moduleCodeData: [],
          moduleForMango: moduleCodeData,
          platformCodeData,
          statusCodeData,
          isViewOnly: false,
          newModuleForMango: [],
          newPlatformCodeData: [],
          newRequestCodeData: [],
          priorityCodeData_isActive: [],
          storeMapLocation: {},
          warCheck: 0,
          currentForm: "",
          statusDLine: '',
          current_page: 0,
          chk_code: "Y",
          config_req: "",
          localCommentText: '',
          isSoftwareTester: false,
          data_: [],
          localCommentExt: '',
          commentTextExt: '',
          editExt: false,
          list_ppn: [],
          selectedPlan: null,
          listTask: [],
          worker_empno: 0,
          detailChange: [],
          aiAnalysisModalText: '',
          aiAnalysisModalSubject: '',
          aiAnalysisModalItemno: null,
          aiAnalysisModalAssignEmpno: null,
          aiAnalysisModalDifficultyLevel: null,
          aiAnalysisModalDifficultyReason: '',
          aiAnalysisModalEstimatedDays: null,
          aiAnalysisModalEstimatedEndDate: null,
          aiAnalysisModalApprovalInfo: null,
          aiAnalysisModalTokenIn: null,
          aiAnalysisModalTokenOut: null,
          aiAnalysisModalTextWk: '',
          aiModalTab: 'master',
          aiAnalysisChecklist: {},
          aiAnalysisChecklistSaving: false,
          aiAnalysisPdfLoading: false,
          aiAnalysisExcelLoading: false,
          aiCompareSpecLoading: false,
          aiCompareSpecData: null,
          aiCompareSpecError: '',
          aiCompareSpecPdfLoading: false,
          retureIDppn: [],
          receivedWorkers: [],
          allWorkers: [],
          editworkcount: 0,
          itupdateAuto: '',
          list_emp_sa_mg: '',
          program_list:[],
          ppnEmpno: null,
          scSpecName: '',
          scSpecData: null,
          scFilter: '',
          scAttachFiles: [],
          scResults: [],
          scAnalysis: null,
          scAnalyzeLoading: false,
          scPdfLoading: false,
        }
      },
      methods: {
        /* Method : Control */
        changeTab(t) {
          this.tabActive = t
          this.$refs.document_details.changeTab(0)
        },
        onPageChange(pn, pt) {
          switch (pt) {
            case 'supplier':
              supplierPaging.setCurrentPage(pn)
              this.loadSupplierWarranty()
              break
            case 'description':
              descPaging.setCurrentPage(pn)
              this.loadDescriptionData()
              break
          }
        },
        /* Method : Main Function */
        addDetail() {
          let q = $linq(this.detailData)
          let max = q.count() == 0 ? 0 : q.max(x => x.itemno)
          max = max + 1
          let todayDate = new Date()
          todayDate = moment(todayDate).add(this.datePriority(), 'days')
          this.customerWarData=[]
          this.detailData.push({
            itemno: max,
            subject: '',
            contract_user: '',
            phone: '',
            status: 'W',
            status_tmp: 'W',
            module: '',
            platform: '',
            item_type: '',
            req_type: '',
            assign_empno: this.formData['assign_empno'],
            assign_empno_tmp: this.formData['assign_empno'],
            assign_empno_name: this.formData['assign_empno_name'],
            tester_empno: this.formData['request_empno'],
            tester_empno_name: this.formData['request_empno_name'],
            tester_empno_tmp: this.formData['request_empno'],
            tester_empno_name_tmp: this.formData['request_empno_name'],
            add_user: this.auth.userid,
            add_dt: new Date(),
            due_date: todayDate,
            response_date: '',
            complete_date: '',
            revision: '',
            description_worker: '',
            is_db: false,
            contract_user: '',
            contract_type: '',
            ref_docdate: new Date(),
            risk_status: 'N',
            serv_code_d: '',
            serv_code_d2: '',
            map_desc: this.storeMapLocation.map_desc || '',
            map_gps: this.storeMapLocation.map_gps || '',
            map_url: this.storeMapLocation.map_url || '',
            map_src: '',
            upd_software_dt: null,
          })
          q = $linq(this.detailData)
          this.editDetailData = q.where(x => x.itemno == max).firstOrDefault()
          this.checkRisk('Y')
          this.$refs.document_details.$refs.job_detail.changeTab(0);
          this.$refs.document_details.$refs.job_detail.$refs.modalEditTask.setSize('modal-xl-2');
          this.$refs.document_details.$refs.job_detail.$refs.modalEditTask.openModal();
          this.current_page = this.detailData.length
        },
        async delTask() {
          if (!await $msg.confirm(this.ui.csm_trn_confirm_delete_task)) {
            return
          }
          this.detailData = $linq(this.detailData).where(w => !(w.itemno == this.editDetailData['itemno'])).toArray()
          this.attachmentData = $linq(this.attachmentData).where(w => !(w.ref_itemno == this.editDetailData['itemno'])).toArray()
          this.risk = $linq(this.risk).where(w => !(w.ref_itemno == this.editDetailData['itemno'])).toArray()
          let itemno = 1
          this.detailData.forEach((f, idx) => {
            let old_itemno = f.itemno
            f.itemno = itemno++
            $linq(this.attachmentData).where(w => w.ref_itemno == old_itemno).foreach(g => {
              g.ref_itemno = f.itemno
            })
            $linq(this.risk).where(w => w.ref_itemno == old_itemno).foreach(g => {
              g.ref_itemno = f.itemno
            })
          })
          this.closeTasks()
        },
        async deleteDetail() {
          if (!await $msg.confirm(this.ui.csm_trn_confirm_delete_task)) {
            return
          }
          else {
            this.detailData = $linq(this.detailData).where(w => !(w.itemno == this.editDetailData['itemno'])).toArray() || []
          }
          if (['N', 'W', 'H'].includes(editDetailData['status_tmp'])) {
            try {
              let f = {
                form: this.formData,
              }
              page.loadingBox.show()
              let act = `CSM/Data/CSM_DeleteTemplate`
              let rsp = await $xt.postServerJson(act, f)
              if (!rsp.success) {
                throw rsp.error
              }
              $notify.success(this.ui.csm_trn_draft_cancelled)
              var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname
              window.history.pushState({ path: newurl }, '', newurl)
              await $xt.sleep(1000)
              window.location.reload()
            } catch (ex) {
              $msg.alert(``, ex.toString(), `danger`)
            } finally {
              page.loadingBox.hide()
            }
          }
        },
        async editDetail(itemno, isView) {
          let job_no = this.formData.job_no
          let ref_docno = $linq(this.detailData).where(x => x.itemno == itemno).select(x => x.ref_docno).firstOrDefault();
          //this.editDetailData.n_manhour = null;
          this.$eventBus.$emit('refresh-manhour')
          this.editDetailData.n_progress = 0;
          await this.showCommentExt(job_no, ref_docno);
          this.isView = isView || false
          if ($linq(this.detailData).any(x => x.itemno == itemno && x.is_db && !isView)) {
            this.isEditDetail = true
          }
          else {
            this.isEditDetail = false
          }
          this.current_page = itemno
          var q = $linq(this.detailData).where(x => x.itemno == itemno).firstOrDefault()
          this.editDetailData = q
          if($xt.isEmpty(this.editDetailData.module)){
            this.editDetailData.module = ''
          } else {
            await this.loadCustomerWarranty()
          }
          var status = $linq(this.impact).where(x => x.ref_itemno == this.editDetailData.itemno).select(x => x.status).firstOrDefault()
          this.type_impact = status
          if (!isView && this.isMango) {
            this.updateReadStatus(itemno)
          }
         console.log('test--q',q)
          if (q.refitemno_war != null) {
   
            let matchedItem2 = (this.customerWarData || []).find(x => x.itemno === q.refitemno_war);
            let matchedItem = (this.customerWarData || []).find(item =>item.serial_number != null &&q.serial_number != null && item.serial_number === q.serial_number);
            if (matchedItem2 || matchedItem) {

              console.log('test--q', matchedItem, 'dsdsdskloksapdtgjkop', matchedItem2)
              let selectedItem = matchedItem2 && matchedItem2.itemno != null ? matchedItem2.itemno: matchedItem?.itemno;   // ใช้ optional chaining ป้องกัน error

              this.warCheck = selectedItem;
            }
          }
          else {
            this.warCheck = null
          }

          if (this.isMango) {
       
            let noti = $linq(this.serviceCodeData).where(x => x.serv_code == this.editDetailData.item_type).firstOrDefault()
            let saArray = [];
            if (noti && noti.add_emp_sa_mg) {
              try {
                saArray = JSON.parse(noti.add_emp_sa_mg)
              } catch (e) {
                console.error('Invalid JSON:', noti.add_emp_sa_mg)
                saArray = []
              }
            }
      
            this.list_emp_sa_mg = Array.isArray(saArray) && saArray.length
                ? saArray.map(x => x.empno).join(',')
                : ''
     
          }
          //let ck = ((['S', 'B', 'T', 'Y', 'X', 'U'].includes(this.editDetailData['status']) && !['08', '09'].includes(this.editDetailData['item_type']) && this.editDetailData['assign_empno'] == auth.empno) ||
          //  (['03', '11'].includes(this.editDetailData['item_type']))
          //  || (this.editDetailData['tester_empno'] == auth.empno && (this.editDetailData['revision_is_import'] == 'Y' || !xt.isEmpty(this.editDetailData['revision'])))) || this.isAdmin
          //let ckk = ['01', '02', '03', '04', '06', '07', '11'].includes(this.editDetailData['item_type']) && ['S', 'B', 'T', 'Y', 'X', 'U'].includes(this.editDetailData['status'])
          //console.log('check revision status ' + ck + 'status2' + ckk)
        },
        checkRisk(status) {
          switch (status) {
            case 'Y':
              $linq(this.risk).where(w => (w.ref_itemno == this.editDetailData.itemno)).count() < 1 ? this.appendRows('risk') : ''
              break
          }
        },
        closeTasks() {
          if (!this.isEditDetail && !this.editDetailData.is_db && this.formData.request_empno != this.auth.empno) {
            this.$refs.document_details.$refs.job_detail.$refs.modalEditTask.closeModal()
          return
          }
          if (!this.isEditDetail && !this.editDetailData.is_db) {
            this.detailData = $linq(this.detailData).where(w => !(w.itemno == this.editDetailData.itemno)).toArray() || []
            this.risk = $linq(this.risk).where(w => !(w.ref_itemno == this.editDetailData.itemno)).toArray() || []
          }
          if (((this.formData.request_empno == this.auth.empno || this.formData.assign_empno == this.auth.empno) && !['Y', 'N'].includes(this.formData.job_status) && this.testerApproveCount == 0 && this.isRejectCount == 0 && this.prapproveDataAccept > 0) || (this.prapproveDataAccept == 0 && $xt.isEmpty(this.formData.job_status)) || (this.formData.request_empno == this.auth.empno && ['W'].includes(this.formData.job_status))) {
            // appForm.btnSave.show = true
            // console.log('closeTasks1 ' + appForm.btnSave.show.toString())
          }
          if (['H'].includes(this.formData['job_status']) && this.formData['request_empno'] == this.auth.empno) {
            // appForm.btnSave.show = true
            // console.log('closeTasks2 ' + appForm.btnSave.show.toString())
          }
          if (this.isAdmin) {
            // appForm.btnSave.show = true
            // console.log('closeTasks3 ' + appForm.btnSave.show.toString())
          }
          this.$refs.document_details.$refs.job_detail.$refs.modalEditTask.closeModal()
          this.commentText = ''
        },
        async acceptJob() {
          if (this.isMango) {
            let url = `CSM/Data/is_emp_ppn?emp=${encodeURIComponent(this.auth.empno)}`
            let resp = await $xt.getServer(url)
            let form = resp
            if (!$xt.isEmpty(form.pre_event_ppn) )
            {
              this.ppnEmpno = form.empno
              await this.retrievePlanWhenAcceptJob()
              this.$refs.select_plan.setSize('modal-s');
              this.$refs.select_plan.openModal()
              return;
            }
            else
            {
              if (!await $msg.confirm(this.ui.csm_trn_confirm_accept_no_plan.replace('{0}', this.queryString.job_no || (this.ui.erp_data_not_found||'ไม่พบข้อมูล')))) {
                this.formData.job_status = 'W'
                return
              }
              else {
                this.formData.job_status = 'I'
                await this.saveClick()
                this.reloadData = true
              }
            }
          }
          else {
            if (!await $msg.confirm(this.ui.csm_trn_confirm_accept_job.replace('{0}', this.queryString.job_no || (this.ui.erp_data_not_found||'ไม่พบข้อมูล')))) {
              this.formData.job_status = 'W'
              return
            }
            else {
              this.formData.job_status = 'I'
              await this.saveClick()
              this.reloadData = true
            }
          }
        },
        async loadData(job_no) {
         page.loadingBox.show()
          let url = `CSM/Data/CSM_Read?job_no=${encodeURIComponent(job_no)}`
          let resp = await $xt.getServer(url)
          let form = resp.data.form
          form.job_date = form.job_date
          form.job_complete_date = form.job_complete_date
          form.assign_empno_tmp = form.assign_empno
          form.request_empno_tmp = form.request_empno
          form.job_status_tmp = form.job_status
          form.job_priority = form.job_priority || '2'
          form.job_priority_tmp = form.job_priority
          this.isEdit = true
          this.formData = form
          this.detailData = resp.data.detail
          this.commentData = resp.data.comment
          this.attachmentData = resp.data.attach
          this.prapproveData = resp.data.approve_seq
          this.risk = resp.data.risk
          this.prapproveDataTotal = $linq(this.prapproveData).count()
          let _detailCount = 0, _rejectCount = 0, _complete = 0,
              _tApproveCount = 0, _tApproveWait = 0, _tApproveReject = 0,
              _ppAccept = 0, _ppReject = 0, _hasNewApprove = false
          this.detailData.forEach(x => {
            _detailCount++
            if (x.status === 'R') _rejectCount++
            if (x.status === 'Y' || x.status === 'R') _complete++
            if (x.status !== 'Y') {
              if (x.tester_approve === 'N' || x.tester_approve === 'R') _tApproveCount++
              if (x.tester_approve === 'N') _tApproveWait++
              if (x.tester_approve === 'R') _tApproveReject++
            }
            if (x.approve_status === 'Y') _ppAccept++
            if (x.approve_status === 'C') _ppReject++
            if (!_hasNewApprove && this.isApprove(x.item_type)) _hasNewApprove = true
          })
          this.detailDataCount = _detailCount
          this.isRejectCount = _rejectCount
          this.detailComplete = _complete
          this.testerApproveCount = _tApproveCount
          this.testerApproveWait = _tApproveWait
          this.testerApproveReject = _tApproveReject
          this.prapproveDataAccept = _ppAccept
          this.prapproveDataReject = _ppReject
          this.isNewApprove = _hasNewApprove
          this.storeMapLocation = resp.data.map_location || {}
          this.allWorkers = resp.data.refW
          this.receivedWorkers = resp.data.refW
          // console.log(' this.allWorkers', this.allWorkers)
          this.detailData.forEach((x, idx) => {
            x.isCheckData = false
            var isViewOnly = ((x.assign_empno != this.auth.empno && this.formData['request_empno'] != this.auth.empno) ||
              (x.assign_empno == this.auth.empno && this.formData['request_empno'] == this.auth.empno) && x.approve_status == 'N' ||
              (this.formData['request_empno'] != this.auth.empno && x.assign_empno == this.auth.empno && ['C', 'N'].includes(x.approve_status)) ||
              ((x.assign_empno == this.auth.empno && this.formData['request_empno'] != this.auth.empno) && this.formData['job_status'] == 'W' && x.approve_status == 'Y') || (x.status == 'R' && this.formData['request_empno'] != this.auth.empno))
            x.isViewOnly = isViewOnly
            var isTesterOnly = this.formData['job_status'] == 'W' && ((x.tester_empno == this.auth.empno || this.emp_is_software_tester()) && this.send_test_bug.some(s => s.code_s_bug === x.item_type) && this.isMango) && (this.formData['request_empno'] != this.auth.empno || x.tester_empno == this.auth.empno)
            x.isTesterOnly = isTesterOnly
            var showEditOnly = ((x.assign_empno == this.auth.empno || x.tester_empno == this.auth.empno) && !['W'].includes(this.formData.job_status) && x.approve_status == 'Y') || this.formData.request_empno == this.auth.empno || (this.isAdmin && this.formData['job_status'] != 'W' && !this.send_test_bug.some(s => s.code_s_bug === x.item_type) && this.emp_is_software_tester() && this.isMango)
            x.showEditOnly = showEditOnly
            //  console.log('showEditOnly',x.showEditOnly)
           var isBugTester = this.send_test_bug.some(s => s.code_s_bug === x.item_type) && this.isMango && this.emp_is_software_tester()
            x.isBugTester = isBugTester
            x.assign_empno_tmp = x.assign_empno
            x.tester_empno_tmp = x.tester_empno
            x.status_tmp = x.status
            x.sendback_round = x.status == 'B' ? $xt.int(x.count_tester_sendback) : $xt.int(x.count_tester_sendback) + 1
            x.tester_test_status = x.tester_test_status
            x.tester_approve_tmp = x.tester_approve
            x.is_db = true
          })
          this.detailData.sort((a, b) => a.itemno - b.itemno)
          this.commentData.forEach((x, idx) => {
            x.edit = false
          })

       
          ////////
          // await this.$refs.document_details.$refs.document_detail_assignment.loadHistory()
          this.$eventBus.$emit('reload-history')
          // this.$eventBus.$on('historyDataLoaded');
          // await this.loadStatus()
          // await this.loadCSMHistory()
          // await this.loadAssignment()
          if (!this.isMango) {
            //  await this.loadDescriptionData()
            await Promise.all([this.loadArea(), this.loadCustomerWarranty(), this.loadSupplierWarranty()])
          }
          let hideBtn = ['W', 'N'].includes(this.formData.job_status) && (this.formData.request_empno != this.auth.empno)
          if (hideBtn) {
            // appForm.btnSave.show = false
          }
          if (['H'].includes(this.formData.job_status)) {
            // appForm.btnSave.show = true
          }
          if (['Y'].includes(this.formData.job_status)) {
            // appForm.btnSave.show = false
            await this.$refs.document_details.loadFormQC()
            if (resp.data.qc.length > 0) {
              this.$refs.document_details.qc_form_code = $linq(resp.data.qc).select(x => x.qaform).firstOrDefault()
              this.qc_user = $linq(resp.data.qc).select(x => x.adduser_name).firstOrDefault()
              this.qc_date = $linq(resp.data.qc).select(x => x.add_dt).firstOrDefault()
              this.$refs.document_details.answerData = resp.data.qc
              this.formData.qa_remark = $linq(resp.data.qc).select(x => x.remark).firstOrDefault()
            }
          }
          if (!$xt.isEmpty(this.queryString.ref_itemno)) {
            let x = $linq(this.detailData).where(x => x.itemno == this.queryString.ref_itemno).firstOrDefault()
            this.editDetail(this.queryString.ref_itemno, x.isViewOnly)
            this.updateReadStatus(this.queryString.ref_itemno)
          }
          document.title = `CSM No. ${job_no}`
              page.loadingBox.hide()
        },
        async loadArea() {
          let act = `CSM/MASTER/ProjArea_ReadList?pre_event2=${this.formData['pre_event2']}`
          let rsp = await $xt.getServer(act)
          this.moduleCodeData = $linq(rsp.data.data_rows.data).where(x => x.active == 'Y').select(s => {
            return {
              id: s?.loccode,
              text: s?.locname
            }
          }).toArray()
        },
        async SearchWarrantyx() {
          await this.loadCustomerWarranty()
          this.warCheck = null
        },
        async loadCustomerWarranty() {
        try {
          let search_war = this.war_text.length ? this.war_text : ''
          let act = `csm/data/CSM_WarrantyProjectList?pre_event=${this.formData['pre_event']}&text=${search_war || ''}&warcode=${this.editDetailData.module || ''}`
          let rsp = await $xt.getServer(act)
          $linq(rsp.data).foreach(x => {
            let remainingCus = this.calculateDifference(x.startdate, x.enddate)
            x.remainingCus = remainingCus
            let startdate = new Date(x.startdate)
            let enddate = new Date(x.enddate)
            let today = new Date()
            let duration
            let bg_status = ""
            if (x.lifetime !== 'Y') {
              if (today <= startdate) {
                // ก่อนรายประกัน
                duration = Math.floor((enddate - startdate) / (1000 * 60 * 60 * 24))
              } else if (today >= enddate) {
                // ประกันหมดอายุ
                // duration = Math.floor((today - enddate) / (1000 * 60 * 60 * 24))
                duration = Math.floor((enddate - today) / (1000 * 60 * 60 * 24))
              } else if (startdate < today && today < enddate) {
                // อยู่ในระยะประกัน
                duration = Math.floor((enddate - today) / (1000 * 60 * 60 * 24))
              }
            }
            // Convert milliseconds into days
            //let durationInDays = duration / (1000 * 60 * 60 * 24);
            let durationInDays = duration
            //console.log(`${Math.abs(durationInDays)} วัน`);
            if ((x.war_date_start !== null && x.war_date_end !== null) || (x.vendor_start_dt !== null && x.vendor_end_dt !== null)) {
              let startDatex = !$xt.isEmpty(x.ic_docno) && !$xt.isEmpty(x.ic_itemno) ? x.war_date_start : x.vendor_start_dt
              let endDatex = !$xt.isEmpty(x.ic_docno) && !$xt.isEmpty(x.ic_itemno) ? x.war_date_end : x.vendor_end_dt
              let startDatex1 = new Date(startDatex);
              let endDatex1 = new Date(endDatex);
              var remainingVendor = this.calculateDifference(startDatex1, endDatex1);
              x.remainingVendor = remainingVendor
            }
            if (x.lifetime === 'Y') {
              bg_status = ''
            }
            // else if (durationInDays <= 30) {
            else if (0 < durationInDays && durationInDays <= 30) {
              //ก่อนหมดประกัน
              bg_status = '#fecba1'
            }
            else if (durationInDays < 0) {
              //หมดประกัน
              //bg_status = '#ff9494'
              if (x.startdate !== null && x.enddate !== null) {
                bg_status = 'Salmon'
              }
            }
            x.bg_status = bg_status
          })
            this.customerWarData = rsp.data.filter(item => item.active_row === 'Y');
        }
        catch (err) {
          $msg.alert(``, err.toString(), `danger`)
        } finally {
        }
      },
        async loadSupplierWarranty() {
        let act = `csm/data/Warranty_VenderReadList?pre_event=${this.formData['pre_event']}&search_text=${this.war_text || ''}`
        let rsp = await $xt.getServer(act)
        this.supplierData = rsp.data.data_rows
      },
        calculateDifference(startDate, endDate) {
        let start = moment(startDate);
        let end = moment(endDate);
        let today = moment();
        if (!$xt.isEmpty(startDate) && !$xt.isEmpty(endDate)) {
          let diffInYears, diffInMonths, diffInDays;
          let isNegative = false;
          if (today.isBefore(start)) {
            // กรณี Today น้อยกว่าหรือเท่ากับ Start Date
            diffInYears = end.diff(start, 'years');
            diffInMonths = end.diff(start.clone().add(diffInYears, 'years'), 'months');
            diffInDays = end.diff(start.clone().add(diffInYears, 'years').add(diffInMonths, 'months'), 'days');
          } else if (today.isSameOrAfter(end)) {
            // กรณี Today หมดอายุประกัน
            diffInYears = today.diff(end, 'years');
            diffInMonths = today.diff(end.clone().add(diffInYears, 'years'), 'months');
            diffInDays = today.diff(end.clone().add(diffInYears, 'years').add(diffInMonths, 'months'), 'days');
            if (diffInYears + diffInMonths + diffInDays > 0) {
              isNegative = true;
            }
          } else {
            // กรณีอยู่ในระยะประกัน
            diffInYears = end.diff(today, 'years');
            today = today.clone().add(diffInYears, 'years');
            diffInMonths = end.diff(today, 'months');
            today = today.clone().add(diffInMonths, 'months');
            // ปัดวันขึ้นด้วย Math.ceil()
            diffInDays = Math.ceil(end.diff(today, 'days', true));
          }
          return `${isNegative ? '-' : ''} ${Math.abs(diffInYears)} ${this.ui.erp_year} ${Math.abs(diffInMonths)} ${this.ui.erp_month} ${Math.abs(diffInDays)} ${this.ui.erp_day}`;
        } else {
          return '';
        }
      },
        async saveClick() {
          if ($xt.isEmpty(this.formData['job_priority'])) {
            this.$refs.document_details.changeTab(0)
            this.$refs.document_details.$refs.document_detail_assignment.$refs.job_priority.focus()
            this.$nextTick(() => {
              $('html,body').scrollTop($('#document_panel').offset().top)
            })
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_priority, `warning`)
            return
          }
          if ($xt.isEmpty(this.formData['pre_event']) && $xt.isEmpty(this.formData['dpt_no']) && !this.isMango && this.detailComplete == this.detailDataCount && this.detailDataCount > 0) {
            this.$refs.document_details.$refs.document_detail_assignment.$refs.pre_event.focus()
            this.$nextTick(() => {
              $('html,body').scrollTop($('#document_panel').offset().top)
            })
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_project_dept, `warning`)
            return
          }
          if (this.isMango) {
            const missingFormcodeIdx = this.detailData.findIndex(x =>
              ['04', '05'].includes(x.item_type) &&
              !['RE'].includes(x.module) &&
              (x.wrong_program ?? 'N') !== 'Y' &&
              $xt.isEmpty(x.formcode)
            )
            if (missingFormcodeIdx !== -1) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_contract_type.replace('{0}', missingFormcodeIdx + 1), 'warning')
              return
            }
            const missingTesterStart = this.detailData.find(x =>
              this.isTesterTurn(x) &&
              ['U', 'B', 'T', 'Y'].includes(x.tester_test_status) &&
              $xt.isEmpty(x.tester_start_date)
            )
            if (missingTesterStart) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_tester_start_date.replace('{0}', missingTesterStart.itemno), 'warning')
              return
            }
            const missingTesterEnd = this.detailData.find(x =>
              this.isTesterTurn(x) &&
              x.tester_test_status == 'Y' &&
              $xt.isEmpty(x.tester_end_date)
            )
            if (missingTesterEnd) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_tester_end_date.replace('{0}', missingTesterEnd.itemno), 'warning')
              return
            }
            const missingSendbackRef = this.detailData.find(x =>
              this.isTesterTurn(x) &&
              x.tester_test_status == 'B' &&
              !this.hasSendbackRef(x)
            )
            if (missingSendbackRef) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_ref_issue_send_back.replace('{0}', missingSendbackRef.itemno), 'warning')
              return
            }
          }
          try {
            let f = {
              form: this.formData,
              detail: this.detailData,
              risk: this.risk,
              attach: this.attachmentData,
              formcode: this.approveFormCode,
              baseUrl: (this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=`).toString(),
              refWorker: this.receivedWorkers
            }
         //   console.log('fffffff',f)
         //return;
            page.loadingBox.show()
            let act = `CSM/Data/CSM_Create`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            $notify.success(this.ui.alert_save_success)

            // Broadcast to other tabs that CSM data was updated
            try {
              const bc = new BroadcastChannel('csm_data_updated');
              bc.postMessage({ type: 'csm_updated', job_no: rsp.data.data });
              bc.close();
            } catch (e) { /* ignore if BroadcastChannel not supported */ }

            if (!this.isMango)
            {
              await this.autoPrintForm(rsp.data.data, rsp.data.detail)
            }
            var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?job_no=' + rsp.data.data
            window.history.pushState({ path: newurl }, '', newurl)
            await this.loadData(rsp.data.data)
            
            if(!$xt.isEmpty(this.formData['jobcode'])) {
              this.$eventBus.$emit('load-contract', {jobcode: this.formData['jobcode']})
            }

            // เรียกใช้ฟังก์ชันตรวจสอบ PreCase หลังจากบันทึกสำเร็จ
            if (this.isMango) {
              await this.checkFromPrecase()
              const hasUnapprovedApproveType = this.detailData.some(x =>
                x.approve_status !== 'Y' &&
                this.isApprove(x.item_type) &&
                !this.prapproveData.some(p => p.refitemno == x.itemno)
              )
              if (hasUnapprovedApproveType) {
                if (await $msg.confirm(this.ui.csm_trn_confirm_approve_loop)) {
                  this.isEdit = true
                  await this.confirmNewApprove()
                  return
                }
              }
            }

            if (!$xt.isEmpty(this.editDetailData.itemno)) {
              let itemno = this.editDetailData.itemno
              let view = this.editDetailData.showEditOnly
              await this.editDetail(itemno, view)
            }
            $('html,body').animate({ scrollTop: 0 }, 'slow')
            this.isEdit = true
            this.approveFormCode = ''
            this.approveDetailData = []
            this.$refs.approveModal.closeModal()
          } catch (ex) {
            $msg.alert(``, ex.toString(), typeof ex === 'string' ? 'warning' : 'danger')
          } finally {
            page.loadingBox.hide()
          }
        },
        async autoPrintForm(docno,detail) {
            page.loadingBox.show()
          try {
              let path = []
              let oth = {}
            let params = {
              cc_trn :'csm_print_task',
              cc_doc : $linq(detail).select(c => c.itemno).toArray()
            }
              let arr = ['CSM_TASK']
              oth = await $xt.findSelectFormPrint('CSM', docno, arr, params, true, auth.maincode)
              if (oth != null) path.push(oth.path)
            await $xt.mergeDocumentPath(path)
            }
            catch {
              await $msg.alert((this.ui.erp_error || 'System Error'), this.ui.csm_trn_alert_print_failed, 'danger')
            }
            finally {
              page.loadingBox.hide()
          //  await this.loadData(docno)
            }
        },
        async checkFromPrecase() {
          // ตรวจสอบว่าข้อมูลมาจาก Dashboard Case หรือไม่
          let isPreCase = false
          let preCaseDocno = null
          
          if (this.detailData && this.detailData.length > 0) {
            // ตรวจสอบ field ref_docno ที่บ่งบอกว่ามาจาก PreCase (ต้องขึ้นต้นด้วย PC)
            const dashboardCaseData = this.detailData.find(item => 
              item.ref_docno && item.ref_docno.toString().startsWith('PC')
            )
            
            if (dashboardCaseData) {
              isPreCase = true
              preCaseDocno = dashboardCaseData.ref_docno
            }
          }
          
          if (isPreCase) {
            try {
              // สร้าง selectedCase object สำหรับปิด case
              let caseToClose = {
                docno: preCaseDocno,
                close_case: 'Y',
                // accept_user: this.auth.empno, // ผู้รับ case
                accept_case: 'Y',  // ต้องรับก่อนถึงจะปิดได้
                // accept_case_dt: new Date(), // วันที่รับ case
                // close_case_dt: new Date(), // วันที่ปิด case
                // close_user: this.auth.empno, // ผู้ปิด case
                // files_path: this.formData.test
                
              }
              
              let closeCaseForm = {
                form: caseToClose,
                // ck_modal: 'wait'
              }

              // console.log('closeCaseForm', closeCaseForm);
              
              
              let action = `CSM/Data/CSM_PreCase_Update`;
              await $xt.postServerJson(action, closeCaseForm);

              // แจ้งให้หน้า dashboard รีเฟรชข้อมูลหลังจากปิด case
              localStorage.setItem('CSM_CASE_CLOSED', Date.now().toString())
              
              // แจ้งให้หน้า case complete รีเฟรชข้อมูลด้วย
              localStorage.setItem('CSM_CASE_COMPLETED', Date.now().toString())
              
              
            } catch (error) {
              console.error('เกิดข้อผิดพลาดในการปิด Dashboard Case:', error)
            }
          }
          
          return isPreCase
        },
        async saveTemplate() {
          // await this.checkFromPrecase()
          // return
          if (this.formData.mg_ma == 'N' && $linq(this.detailData).any(x => !['03', '05', '08', '999', '22'].includes(x.item_type)) && this.isMango) {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_alert_no_ma, `warning`)
            return
          }
          if (!await $msg.confirm(this.ui.csm_trn_confirm_save_draft)) {
            return
          }
          try {
            this.formData.request_empno_tmp = this.formData.request_empno
            let f = {
              form: this.formData,
              detail: this.detailData,
              risk: this.risk,
              attach: this.attachmentData,
            }
            page.loadingBox.show()
            let act = `CSM/Data/CSM_CreateTemplete`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            // เรียกใช้ฟังก์ชันตรวจสอบ PreCase
            if (this.isMango) {
              await this.checkFromPrecase()
            }
            
            $notify.success(this.ui.csm_trn_draft_saved)
            var job_no = rsp.data
            var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?job_no=' + job_no
            window.history.pushState({ path: newurl }, '', newurl)
            await this.loadData(job_no)
          } catch (ex) {
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
          }
        },
        async deleteTemplate() {
          if (!await $msg.confirm(this.ui.csm_trn_confirm_cancel_draft)) {
            return
          }
          try {
            let f = {
              form: this.formData,
            }
            page.loadingBox.show()
            let act = `CSM/Data/CSM_DeleteTemplate`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            $notify.success(this.ui.csm_trn_draft_cancelled)
            var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname
            window.history.pushState({ path: newurl }, '', newurl)
            await $xt.sleep(1000)
            window.location.reload()
          } catch (ex) {
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
          }
        },
        async confirmUpdateDetail() {
          //อับเดทข้่อมูล
          if (this.isMango) {
            let isSoftwareTester = await this.emp_is_software_tester();
            const code = this.editDetailData.item_type;
            const matchedItem = this.serviceCodeData.find(x => x.serv_code === code);



            let isWorkerMG = $linq(this.serviceCodeData).where(w => w.serv_code == this.editDetailData['item_type']).select(x => x.add_file_worker).firstOrDefault()
          //  consoole.log('this.formData[', this.formData, 'dddd',this.formData['job_status'])
            // ค้นหาตำแหน่งเดิมในช่วงต้นของ function
            if (this.formData.request_empno == this.auth.empno && this.send_test_bug.some(s => s.code_s_bug === this.editDetailData.item_type) && $xt.isEmpty(this.editDetailData.revision_bug)) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_revision_bug, 'warning')
              return
            }
            if (this.isTesterTurn(this.editDetailData) && ['U', 'B', 'T', 'Y'].includes(this.editDetailData.tester_test_status) && this.formData['job_status'] != 'W' && $xt.isEmpty(this.editDetailData.tester_start_date)) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_tester_start_date.replace('{0}', this.editDetailData.itemno), 'warning')
              return
            }
            if (this.isTesterTurn(this.editDetailData) && this.editDetailData.tester_test_status == 'Y' && this.formData['job_status'] != 'W' && $xt.isEmpty(this.editDetailData.tester_end_date)) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_tester_end_date.replace('{0}', this.editDetailData.itemno), 'warning')
              return
            }
            if (this.isTesterTurn(this.editDetailData) && this.editDetailData.tester_test_status == 'B' && this.formData['job_status'] != 'W' && !this.hasSendbackRef(this.editDetailData)) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_ref_issue_send_back.replace('{0}', this.editDetailData.itemno), 'warning')
              return
            }
            if (matchedItem.addspec_request == 'R') {
              // เพิ่มเงื่อนไข: เฉพาะคนเปิดใบงาน (request_empno) เท่านั้นที่จะถูกบังคับแจ้งเตือน
              if (this.formData['request_empno'] == this.auth.empno) {
                const hasAttachment = this.attachmentData.some(a => a.ref_itemno === this.editDetailData.itemno && a.item_type == 'P');

                if (!hasAttachment) {
                  await $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_addspec_task, `warning`);
                  return;
                }
              }
            }
            if (this.editDetailData.status == 'Y') {
              this.editDetailData.complete_date = new Date()
              let has_error = false
              let error_message = '<ul>'
              if (this.editDetailData['revision_is_import'] == 'Y' || (this.formData['request_empno'] == this.auth.empno && ['01', '02', '06', '07'].includes(this.editDetailData['item_type']))) {
                var p = this.checkAttachFiles('T', this.ui.csm_trn_add_file_quickguide, 6)
                has_error = p.has_error
                error_message = p.error_message
              }
              if (this.is_qc() && this.emp_is_software_tester() && this.editDetailData['tester_empno'] == this.auth.empno) {
                var p = this.checkAttachFiles('Y', this.ui.csm_trn_add_file_checker, 5)
                has_error = p.has_error
                error_message = p.error_message
              }
              if (this.editDetailData['assign_empno'] == this.auth.empno) {
                if (this.editDetailData['item_type'] == '11' && !['W', 'R', 'I', 'H'].includes(this.editDetailData['status'])) {
                  if (!this.editDetailData['revision'] || this.editDetailData['update_software_dt'] == null) {
                    error_message += `<li>${this.ui.csm_trn_req_revision_update}</li>`
                    has_error = true
                  } 
                }
                if ($xt.isEmpty(this.editDetailData['response_date']) && this.formData['request_empno'] == this.auth.empno) {
                  error_message += `<li>${this.ui.csm_trn_contact_back_date}</li>`
                  has_error = true
                }
                if ($xt.isEmpty(this.editDetailData['due_date']) && this.formData['assign_empno'] == this.auth.empno) {
                  error_message += `<li>${this.ui.erp_due_date}</li>`
                  has_error = true
                }
                if (['04', '05'].includes(this.editDetailData['item_type']) && !['RE'].includes(this.editDetailData['module'])) {
                  if ($xt.isEmpty(this.editDetailData['formcode'])) {
                    error_message += `<li>${this.ui.erp_document_type||'ประเภทเอกสาร'}</li>`
                    has_error = true
                  }
                  var file_pretest = $linq(this.attachmentData).where(x => x.ref_itemno == this.editDetailData['itemno'] && x.item_type == 'A').count()
                  if (file_pretest < 1) {
                    let item_type_name = this.itemTypeName(this.editDetailData['item_type'])
                    error_message += `<li>${this.ui.csm_trn_req_attach_worker.replace('{0}', item_type_name)}</li>`
                    has_error = true
                  }
                }
                if (this.editDetailData['config'] == 'Y' && $xt.isEmpty(this.editDetailData['config_code']) && this.formData['assign_empno'] == this.auth.empno) {
                  error_message += `<li>${this.ui.csm_trn_config_code}</li>`
                  has_error = true
                }
              }
              if (['01', '02', '03', '04', '06', '07', '14', '22'].includes(this.editDetailData['item_type']) && $xt.isEmpty(this.editDetailData['revision_prod'])) {
                error_message += `<li>${this.ui.csm_trn_req_followup_revision.replace('{0}', this.editDetailData['assign_empno_name'])}</li>`
                has_error = true
              }
              error_message += '</ul>'
              if (has_error) {
                $msg.alert(this.ui.csm_v2_warning, error_message, `warning`)
                return true
              }
              if (this.editDetailData['status_tmp'] == 'Y') {
                // console.log('re5')
                await this.updateDetail()
              } else {
                if (!await $msg.confirm(this.ui.csm_trn_confirm_complete_final)) {
                  return
                }
             //   console.log('re4')
                await this.updateDetail()
              }
            }
            else if ((this.editDetailData['status'] == 'B' && this.formData['request_empno'] == this.auth.empno) || (this.editDetailData['tester_test_status'] == 'B' && this.is_qc() && this.editDetailData['tester_empno'] == this.auth.empno) && this.emp_is_software_tester()) {
              let has_error = false
              let error_message = '<ul>'
              if (this.editDetailData['tester_empno'] == this.auth.empno && $xt.isEmpty(this.commentText)) {
                error_message += `<li>${this.ui.csm_trn_req_sendback_reason}</li>`
                has_error = true
              }
              error_message += '</ul>'
              if (has_error) {
                $msg.alert(this.ui.csm_v2_warning, error_message, `warning`)
                return true
              }
              //  console.log('re3')
              if ((this.editDetailData['status'] == 'B' || this.editDetailData['tester_test_status'] == 'B') && !$xt.isEmpty(this.formData['ref_pre_event_ppn']) ) {
                let n_progress = -10;
                  let man_hour = "00:20";
                this.calProgress('tester');
                await this.updateProgress(
                  this.editDetailData["refid_ppn"],
                  this.formData["ref_pre_event_ppn"],
                  this.formData["ref_plancode"],
                  $xt.dec(n_progress),
                  man_hour,
                  'Y', 'N', 'N'
                );
              }
              await this.updateDetail()
            }
            else {
              let has_error = false
              let error_message = '<ul>'
              if (((this.editDetailData.assign_empno == this.auth.empno && this.editDetailData.status == 'X' && !this.isView) || this.isAdmin) && this.attachTasksCount('A') == 0 && this.activeconfig.TRN001W === 'Y') {
               // this.$refs.task_detail.focus();
                this.$refs.document_details.$refs.job_detail.$refs.editDetails.$refs.task_detail.focus()
                this.$nextTick(() => {
                  $('html,body').scrollTop($('#task_detail').offset().top);
                });
                $msg.alert(this.ui.csm_v2_warning, 'Please add the Worker file', `warning`);
                return;
              }else if ((this.editDetailData.tester_empno == this.auth.empno && this.editDetailData.tester_test_status == 'Y' && !this.isView) && this.attachTasksCount('Y') == 0  && this.activeconfig.TRN001X === 'Y') {
              // this.$refs.task_detail.focus();
                this.$refs.document_details.$refs.job_detail.$refs.editDetails.$refs.task_detail.focus()
                this.$nextTick(() => {
                  $('html,body').scrollTop($('#task_detail').offset().top);
                });
                $msg.alert(this.ui.csm_v2_warning, 'Please add the Checker (After) file', `warning`);
                return;
              }
              if (this.isMango) {
                const hasSoftwareUpdate = $linq(this.detailData).where(x => x['item_type'] === '11').count() > 0
                if (hasSoftwareUpdate && this.detailData.length > 1) {
                  $msg.alert(this.ui.csm_v2_warning, 'A task with Update Software Type already exists. You cannot add another task.', 'warning')
                  return
                }
              }

              if (['11'].includes(this.editDetailData['item_type'])) {
                if ($xt.isEmpty(this.editDetailData.object_type)) {
                  error_message += `<li>${this.ui.csm_trn_req_type_of_work}</li>`
                  has_error = true
                } else if ($xt.isEmpty(this.editDetailData.upd_software_dt)) {
                  error_message += `<li>${this.ui.csm_trn_req_update_datetime}</li>`
                  has_error = true
                } else if ($xt.isEmpty(this.editDetailData.website_url) && !['WIN', 'MOB'].includes(this.editDetailData.platform)) {
                  error_message += `<li>${this.ui.csm_trn_req_website_url}</li>`
                  has_error = true
                }
              }
              if ($xt.isEmpty(this.editDetailData['response_date']) && this.formData['request_empno'] == this.auth.empno) {
                error_message += `<li>${this.ui.csm_trn_contact_back_date}</li>`
                has_error = true
              }
              if ($xt.isEmpty(this.editDetailData['due_date']) && this.formData['assign_empno'] == this.auth.empno) {
                error_message += `<li>${this.ui.erp_due_date}</li>`
                has_error = true
              }
              if (this.editDetailData['assign_empno'] == this.auth.empno) {
                if (($xt.isEmpty(this.editDetailData['worker_start_date']) || $xt.isEmpty(this.editDetailData['worker_end_date'])) && this.formData.job_status != 'H' && !['W', 'R', 'H'].includes(this.editDetailData['status'])) {
                  error_message += `<li>${this.ui.csm_trn_req_start_end_date}</li>`
                  has_error = true
                  this.$refs.document_details.$refs.job_detail.$refs.editDetails.$refs.task_detail.focus()
                  this.$nextTick(() => {
                    $('html,body').scrollTop($('#task_detail').offset().top)
                  })
                }
                if (((this.editDetailData['assign_empno'] == this.auth.empno && (this.editDetailData.status == 'X' || this.editDetailData.status == 'S') && !this.isView) || this.isAdmin) && this.attachTasksCount('A') == 0 && isWorkerMG === 'Y') {
                  this.$refs.document_details.$refs.job_detail.$refs.editDetails.$refs.task_detail.focus()
                  this.$nextTick(() => {
                    $('html,body').scrollTop($('#task_detail').offset().top);
                  });
                  $msg.alert(this.ui.csm_v2_warning, 'Please add the Worker file', `warning`);
                  return;

                }

                if (this.editDetailData['status'] == 'R' && $xt.isEmpty(this.editDetailData['reject_remark'])) {
                  error_message += '<li>Reject Remark</li>'
                  has_error = true
                }
                if ((this.editDetailData['revision_is_import'] == 'Y' || (['S', 'X'].includes(this.editDetailData['status']) && ['01', '02', '03', '04', '06', '07', '22'].includes(this.editDetailData['item_type']))) && !this.editDetailData['revision']) {
                  error_message += `<li>${this.ui.csm_trn_req_revision_no}</li>`
                  has_error = true
                }
                if (this.editDetailData['item_type'] == '11' && !['W', 'R', 'I', 'H'].includes(this.editDetailData['status'])) {
                if (!this.editDetailData['revision'] || this.editDetailData['update_software_dt'] == null) {
                    error_message += `<li>${this.ui.csm_trn_req_revision_update}</li>`
                    has_error = true
                  }
                }
                if (this.is_qc() && this.formData['request_empno'] == this.editDetailData['tester_empno'] && this.editDetailData['status'] == 'X' && this.editDetailData['module'] == 'RE' && this.editDetailData['platform'] == 'WEB') {
                  this.editDetailData.status = 'S'
                }
                if (!$xt.isEmpty(this.formData['ref_pre_event_ppn']) && $xt.isEmpty(this.editDetailData["n_manhour"]) && !(['W', 'H'].includes(this.formData.job_status) && this.editDetailData['status'] == 'W') && !['S', 'X', 'Y'].includes(this.editDetailData['status']))
                {
                  error_message += `<li> ${this.ui.csm_trn_req_new_manhour}</li>`
                  has_error = true
                }
              }
              // if (this.editDetailData['tester_empno'] == this.auth.empno && this.is_qc()) {
              //   if (this.editDetailData['tester_test_status'] == 'Y' && this.emp_is_software_tester()) {
              //     var p = this.checkAttachFiles('T', 'เพิ่มไฟล์ (สำหรับคู่มือย่อ)', 6)
              //     has_error = p.has_error
              //     error_message = p.error_message
              //   }
              // }
              const code = this.editDetailData['item_type'];
              const matchedItem = this.serviceCodeData.find(x => x.serv_code === code);
              if ((this.editDetailData['status'] == 'X' || this.editDetailData['status'] == 'S') && matchedItem.addspec_request == 'W') {
                var file_pretest = $linq(this.attachmentData).where(x => x.ref_itemno == this.editDetailData['itemno'] && x.item_type == 'P').count()
                if (file_pretest <= 0) {
                    error_message += `<li>${this.ui.csm_trn_req_attach_addspec}</li>`
                    has_error = true
                  }
              }
              if (['04', '05'].includes(this.editDetailData['item_type']) && !['RE'].includes(this.editDetailData['module'])) {
                if ($xt.isEmpty(this.editDetailData['formcode'])) {
                  error_message += '<li>Form Type</li>'
                  has_error = true
                }
                if (this.editDetailData['assign_empno'] == this.auth.empno && this.editDetailData['status'] == 'S') {
                  var file_pretest = $linq(this.attachmentData).where(x => x.ref_itemno == this.editDetailData['itemno'] && x.item_type == 'A').count()
                  if (file_pretest < 1 && this.editDetailData['assign_empno'] == this.auth.empno) {
                    let item_type_name = this.itemTypeName(this.editDetailData['item_type'])
                    error_message += `<li>${this.ui.csm_trn_req_attach_worker.replace('{0}', item_type_name)}</li>`
                    has_error = true
                  }
                }
              }
              if (['11'].includes(this.editDetailData['item_type']) && this.editDetailData['platform'] == 'WEB') {
                if (this.formData['request_empno'] == this.auth.empno && $xt.isEmpty(this.editDetailData['website_url'])) {
                  let item_type_name = this.itemTypeName(this.editDetailData['item_type'])
                  error_message += `<li>${this.ui.csm_trn_req_website_url_task.replace('{0}', item_type_name)}</li>`
                  has_error = true
                }
              }
              error_message += '</ul>'
              if (has_error) {
                $msg.alert(this.ui.csm_v2_warning, error_message, `warning`)
                return true
              }
              if (this.is_qc() && this.editDetailData['tester_test_status'] == 'Y' && this.editDetailData['status'] == 'Y' && this.editDetailData['tester_empno'] == this.auth.empno) {
                if (!await $msg.confirm(this.ui.csm_trn_confirm_complete_retest)) {
                  return
                }
                // console.log('re1')
                // console.log('this.editDetailData[]', this.editDetailData['status'])
                await this.updateDetail()
              }
              else {
                console.log('re2')
                // console.log('this.editDetailData[]', this.editDetailData['status'])
                 /*ถ้าเป็นเคส worker  */
                if ((this.editDetailData['assign_empno'] == this.auth.empno || this.isMyRefWorker()) && !$xt.isEmpty(this.formData['ref_pre_event_ppn'])) {
                  // ถ้าเป็นเคส reject
                  if (this.editDetailData['status'] == 'R') {
                    this.calProgress('reject');
                    await this.updateProgress(
                      this.editDetailData["refid_ppn"],
                      this.formData["ref_pre_event_ppn"],
                      this.formData["ref_plancode"],
                      this.editDetailData.n_progress,
                      this.editDetailData.n_manhour,
                      'N', 'Y', 'N'
                    );
                  }
                  // ถ้าเป็นเคส worker none, inprogress
                  if (['W', 'I', 'H'].includes(this.editDetailData['status'])) {
                    if (this.editDetailData.t_progress < 1 && this.editDetailData.n_progress < 0) {
                      $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_progress_zero_no_negative, `warning`);
                      this.editDetailData.n_progress = 0
                      return;
                    }
                    else if (this.editDetailData.t_progress >= 100 && this.editDetailData.n_progress > 100) {
                      $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_progress_over_100, `warning`);
                      return;
                    }
                    else if (this.editDetailData.t_progress >= 100 && this.editDetailData.n_progress > 0) {
                      $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_progress_is_100, `warning`);
                      return;
                    }
                    else if (this.editDetailData.t_progress <= 0 && this.editDetailData.n_progress < 0) {
                      $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_progress_is_zero, `warning`);
                      return;
                    }
                    this.calProgress('all');
                    // console.log('this.editDetailData.t_progress', this.editDetailData.t_progress, 'this.editDetailData.n_progress', this.editDetailData.n_progress)
                    $xt.sleep(1000)
                    await this.updateProgress(
                      this.editDetailData["refid_ppn"],
                      this.formData["ref_pre_event_ppn"],
                      this.formData["ref_plancode"],
                      this.editDetailData.n_progress,
                      this.editDetailData.n_manhour,
                      'Y', 'N', 'N'
                    );
                  }
                  // ถ้าเป็นเคส worker none, inprogress
                  if (['X', 'S'].includes(this.editDetailData['status']))
                  {    
                    if (this.editDetailData.t_progress < 1 && this.editDetailData.n_progress < 0) {
                      $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_progress_zero_no_negative, `warning`);
                      this.editDetailData.n_progress = 0
                      return;
                    }
                    else if (this.editDetailData.t_progress >= 100 && this.editDetailData.n_progress > 100) {
                      $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_progress_over_100, `warning`);
                      return;
                    }
                    else if (this.editDetailData.t_progress >= 100 && this.editDetailData.n_progress > 0) {
                      $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_progress_is_100, `warning`);
                      return;
                    }
                    else if (this.editDetailData.t_progress <= 0 && this.editDetailData.n_progress < 0) {
                      $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_progress_is_zero, `warning`);
                      return;
                    }
                    this.calProgress('all');
                    if (this.editDetailData.status == 'X' && this.editDetailData.t_progress < 100 ) {
                      $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_progress_100, `warning`);
                      return;
                    }
                    $xt.sleep(1000)
                    await this.updateProgress(
                      this.editDetailData["refid_ppn"],
                      this.formData["ref_pre_event_ppn"],
                      this.formData["ref_plancode"],
                      this.editDetailData.n_progress,
                      this.editDetailData.n_manhour,
                      'Y', 'N', 'Y'
                    );
                  }
                  if (!$xt.isEmpty(this.editDetailData['worker_start_date']) && !$xt.isEmpty(this.editDetailData['worker_end_date']) ) {
                    await this.updateTaskToPPN(this.editDetailData['worker_start_date'], this.editDetailData['worker_end_date'], this.editDetailData['subject'], this.editDetailData["refid_ppn"]);
                  }
                }
                // console.log('this.emp_is_software_tester()', this.emp_is_software_tester());
                let emp_is_software_tester = await this.emp_is_software_tester();
                if (
                  this.editDetailData.assign_empno != this.auth.empno && !$xt.isEmpty(this.formData['ref_pre_event_ppn']) && emp_is_software_tester == false) {
                  // console.log('this.emp_is_software_tccccccester()', this.emp_is_software_tester())
                  await this.changeWorkerUpdateToPPN(
                    this.editDetailData["refid_ppn"],
                    this.editDetailData['assign_empno']
                  )
                }
                if (!$xt.isEmpty(this.formData['ref_pre_event_ppn']) && !$xt.isEmpty(this.editDetailData['refid_ppn']) && emp_is_software_tester == false && this.receivedWorkers.length > 0 )
                {
                  //console.log('this.emp_is_software_tccccccester()')
                  //console.log('this.editDetailData["refid_ppn"]', this.editDetailData["refid_ppn"])
                  await this.AddRefWorker(this.editDetailData["itemno"], this.editDetailData["refid_ppn"])
                }
          
                await this.updateDetail()
              }
            }
          }
          else {
            let isSoftwareTester = await this.emp_is_software_tester();

           
            let isWorker = $linq(this.serviceCodeData).where(w => w.serv_code == this.editDetailData['item_type']).select(x => x.add_file_worker).firstOrDefault()
            if (((this.editDetailData.assign_empno == this.auth.empno && (this.editDetailData.status == 'X') && !this.isView) || this.isAdmin) && this.attachTasksCount('A') == 0  && this.activeconfig.TRN001W === 'Y') {
              this.$refs.document_details.$refs.job_detail.$refs.editDetails.$refs.task_detail.focus()

              this.$nextTick(() => {
                $('html,body').scrollTop($('#task_detail').offset().top);
              });
              $msg.alert(this.ui.csm_v2_warning, 'Please add the Worker file', `warning`);
              return;
            }
            if (((this.editDetailData.tester_empno == this.auth.empno && this.editDetailData.tester_test_status == 'Y' && !this.isView) || isSoftwareTester || this.isAdmin) && this.attachTasksCount('Y') == 0  && this.activeconfig.TRN001X === 'Y') {
              this.$refs.document_details.$refs.job_detail.$refs.editDetails.$refs.task_detail.focus()
              this.$nextTick(() => {
                $('html,body').scrollTop($('#task_detail').offset().top);
              });
              $msg.alert(this.ui.csm_v2_warning, 'Please add the Checker (After) file', `warning`);
              return;
            }
            
            //if (((this.editDetailData.assign_empno == this.auth.empno && (this.editDetailData.status == 'X') && !this.isView) || this.isAdmin) && this.attachTasksCount('A') == 0 && isWorker === 'Y') {
            //  this.$refs.document_details.$refs.job_detail.$refs.editDetails.$refs.task_detail.focus()
            //  this.$nextTick(() => {
            //    $('html,body').scrollTop($('#task_detail').offset().top);
            //  });
            //  $msg.alert(this.ui.csm_v2_warning, 'Please add the Worker file', `warning`);
            //  return;
            //}
            await this.updateDetail()
          }
        },
        attachTasksCount(item_type) {
          return $linq(this.attachmentData).where(x => x.ref_itemno == this.editDetailData.itemno && x.item_type == item_type).count()
        },
        isTesterTurn(d) {
          return d.tester_empno == this.auth.empno && (d.send_pretest_to_tester_status == 'Y' || ['U', 'B', 'T', 'Y'].includes(d.status_tmp))
        },
        hasSendbackRef(d) {
          return this.attachmentData.some(x => x.ref_itemno == d.itemno && x.item_type == 'SB' && x.sort_order == d.sendback_round)
        },
        async updateDetail() {
          try {
            const originalApproveStatus = this.editDetailData.approve_status
            let comment = {
              job_no: this.formData.job_no,
              ref_itemno: this.editDetailData.itemno,
              itemno: null,
              description: this.commentText || '',
              edit: false,
              add_user: this.auth.user_id,
              add_dt: new Date()
            }
            let workers = $linq(this.receivedWorkers).where(x => x.reftask == this.editDetailData.itemno).toArray();
            console.log('workers ===', workers)
            console.log(' this.editworkcount ===', this.editworkcount)

            let form = this.editDetailData
            if (this.isMango && this.editDetailData['tester_empno'] == this.auth.empno && this.formData['job_status'] == 'W') {
              form = Object.assign({}, this.editDetailData, { tester_test_status: null })
            }

            let f = {
              form: form,
              risk: this.risk,
              impact: this.impact,
              comment: $xt.isEmpty(this.commentText) ? null : comment,
              arr_comment: $linq(this.showComment()).where(x => x.edit == true).toArray(),
              attachfile: this.attachmentData,
              baseUrl: (this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=`).toString(),
              config_desc: this.editDetailData['config_desc'],
              refWorker: workers
            }
            console.log('File-----',f)

          //return;

            page.loadingBox.show()
            let act = `CSM/Data/CSM_UpdateDetail`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            if (rsp.success) {
              await this.loadData(rsp.data.m.job_no)
              var q = $linq(this.detailData).where(x => x.itemno == rsp.data.m.itemno).firstOrDefault()
              this.editDetailData = q
              this.commentText = ''
              this.$refs.document_details.$refs.job_detail.$refs.comment.clearComment();
              $notify.success(this.ui.alert_save_success)
              this.$refs.document_details.$refs.job_detail.$refs.modalEditTask.closeModal();

              // Broadcast to other tabs that CSM data was updated
              try {
                const bc = new BroadcastChannel('csm_data_updated');
                bc.postMessage({ type: 'csm_updated', job_no: rsp.data.m.job_no });
                bc.close();
              } catch (e) { /* ignore if BroadcastChannel not supported */ }

              const newSmSvc = this.serviceCodeData.find(x => x.serv_code === q?.item_type)
              if (this.isMango && originalApproveStatus != 'N' && (q?.approve_status || 'N') == 'N' && (newSmSvc?.approve_st ?? 'N') == 'Y') {
                if (await $msg.confirm(this.ui.csm_trn_confirm_approve_loop)) {
                  this.confirmNewApprove()
                }
              }
            } else {
              this.isView = false
            }
          } catch (ex) {
            $msg.alert(``, ex.toString(), typeof ex === 'string' ? 'warning' : 'danger')
          } finally {
            page.loadingBox.hide()
          }
        },
        async createComment() {
          try {
            if ($xt.isEmpty(this.commentText)) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_v2_alert_input_comment, `warning`)
              return
            }
            let comment = {
              job_no: this.formData.job_no,
              ref_itemno: this.editDetailData.itemno,
              itemno: null,
              description: this.commentText || '',
              edit: false,
              add_user: this.auth.user_id,
              add_dt: new Date()
            }
            let f = {
              comment: $xt.isEmpty(this.commentText) ? null : comment,
            }
            page.loadingBox.show()
            let act = `CSM/Data/CSM_CreateComment`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            if (rsp.success) {
              await this.loadData(rsp.data.job_no)
              var q = $linq(this.detailData).where(x => x.itemno == rsp.data.ref_itemno).firstOrDefault()
              this.editDetailData = q
              this.commentText = ''
              this.$refs.document_details.$refs.job_detail.$refs.comment.clearComment();
              $notify.success(this.ui.alert_save_success)
            } else {
              this.isView = false
            }
          } catch (ex) {
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
          }
        },
        setEditComment(x) {
          x.edit = !x.edit
          if (x.edit) {
            x.old_desc = x.description
          }
          else {
            x.description = x.old_desc
          }
        },
        async updateComment(x) {
          try {
            let f = {
              comment: x
            }
            // console.log('ffff', f)
            
            page.loadingBox.show()
            let act = `CSM/Data/CSM_UpdateComment`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            $notify.success(this.ui.alert_save_success)
            await this.loadData(rsp.data)
          } catch (ex) {
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
          }
        },
        async deleteComment(x) {
          if (!await $msg.confirm(this.ui.csm_v2_confirm_delete_comment)) {
            return
          }
          try {
            let f = {
              comment: x
            }
            page.loadingBox.show()
            let act = `CSM/Data/CSM_DeleteComment`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            $notify.success(this.ui.alert_delete_success)
            await this.loadData(rsp.data)
          } catch (ex) {
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
          }
        },
        async recoveryTasks() {
          if (!await $msg.confirm(this.ui.csm_trn_confirm_send_back_worker.replace('{0}', this.editDetailData.itemno))) {
            return
          }
          try {
            this.editDetailData.status = 'W'
            this.editDetailData.reject_remark = null
            let f = {
              detail: this.editDetailData
            }
            page.loadingBox.show()
            let act = `CSM/Data/CSM_RecoveryTasks`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            $notify.success(this.ui.alert_save_success)
            await this.loadData(rsp.data.job_no)
            this.editDetailData = $linq(this.detailData).where(x => x.itemno === rsp.data.itemno).firstOrDefault()
            this.commentText = ''
          } catch (ex) {
            page.loadingBox.hide()
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
          }
        },
        async recoveryTesterTasks(keyword) {
          try {
            let f = {
              detail: this.editDetailData
            }
            page.loadingBox.show()
            let act = ``
            act = keyword == `Tester` ? `CSM/Data/CSM_RecoveryTester` : keyword == 'Close' ? `CSM/Data/CSM_CloseTasks` : ''
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            $notify.success(this.ui.alert_save_success)
            await this.loadData(rsp.data.job_no)
            this.editDetailData = $linq(this.detailData).where(x => x.itemno === rsp.data.itemno).firstOrDefault()
            this.commentText = ''
          } catch (ex) {
            page.loadingBox.hide()
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
          }
        },
        async cancelRequest() {
          try {
            let f = {
              job_no: this.formData.job_no,
              cancel_remark: this.formData.cancel_remark,
            }
            page.loadingBox.show()
            let act = `CSM/Data/CSM_CancelRequest`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            $notify.success(this.ui.alert_save_success)
            await this.loadData(rsp.data)
            $('#cancelModal').modal('hide')
          } catch (ex) {
            page.loadingBox.hide()
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
          }
        },
        showComment() {
          return $linq(this.commentData).where(x => x.ref_itemno == this.editDetailData.itemno).orderBy(x => x.itemno).toArray()
        },
        showCommentExtLength() {
          return $linq(this.data_).where(x => x.reqno == this.editDetailData.ref_docno).orderBy(x => x.itemno).toArray()
        },
        async showCommentExt(job_no, ref_docno) {
          // console.log("job_no, ref_docno", job_no, ref_docno)
          if ($xt.isEmpty(ref_docno)||$xt.isEmpty(job_no)) return;
          try {
            let action = `CSM/Data/read_comment_ext?job_no=${encodeURIComponent(job_no)}&ref_docno=${encodeURIComponent(ref_docno)}`;
            let resp = await $xt.getServer(action)
            this.data_ = resp.data.commentData||[]
          } catch (error) {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_v2_alert_comment_error, `warning`)
          }
        },
        setEditCommentExt(x,edit) {
          if (edit == true) {
          this.editExt = true
            x.old_desc = x.detail_c
            x.editExt = true
          }
          else {
            this.editExt = false
            x.detail_c = x.old_desc
            x.editExt = false
          }
        },
        async createCommentExt() {
            try {
                if ($xt.isEmpty(this.commentTextExt)) {
                    $msg.alert(this.ui.csm_v2_warning, this.ui.csm_v2_alert_input_comment, `warning`);
                    return;
                }
                let comment = {
                    description: this.commentTextExt || "",
                    job_no: this.formData.job_no,
                    customer_name: this.formData.customer_name,
                    maincode: this.auth.maincode,
                    req_empno: this.auth.empno,
                    editExt: false,
                };
                let f = {
                    comment: $xt.isEmpty(this.commentTextExt) ? null : comment,
                    docno: this.formData.job_no,
                };
                page.loadingBox.show()
                let act = `CSM/Data/CSM_CreateComment_External`;
                let rsp = await $xt.postServerJson(act, f);
                if (!rsp.success) {
                    throw rsp.error;
                }
                if (rsp.success) {
                  this.commentTextExt = ''
                  await this.showCommentExt(rsp.data.job_no, rsp.data.reqno);
                  this.$refs.document_details.$refs.job_detail.$refs.comment_external.clearCommentExt();
                  $notify.success(this.ui.alert_save_success);
                  let newCaseData = rsp.data || [];
                  let hub = window.signalR();
                // console.log("Sending case to hub", newCaseData, hub);
                  hub.reHub.server.sendNewComment(newCaseData);
                } else {
                    this.isView = false;
                }
            } catch (ex) {
                $msg.alert(``, ex.toString(), `danger`);
            } finally {
               page.loadingBox.hide()
            }
        },
        async updateCommentExt(x) {
          try {
            let comment = {
              job_no: x.job_no,
              reqno: x.reqno,
              refitemno: x.itemno,
              description: x.detail_c,
              maincode: auth.maincode,
              req_empno: x.req_empno,
            }
            let t = {
              comment: comment,
            }
            page.loadingBox.show()
            let act = `CSM/Data/CSM_UpdateCommentExt`
            let rsp = await $xt.postServerJson(act,t )
            if (!rsp.success) {
              throw rsp.error
            }
            let newCaseData = rsp.data || [];
            let hub = window.signalR();
         //   console.log("Sending case to hub", newCaseData, hub);
            hub.reHub.server.sendNewComment(newCaseData);
            $notify.success(this.ui.alert_save_success)
            await this.showCommentExt(rsp.data.job_no, rsp.data.reqno);
            this.editExt = false
          } catch (ex) {
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
          }
        },
        async deleteCommentExt(x) {
          if (!await $msg.confirm(this.ui.csm_v2_confirm_delete_comment)) {
            return
          }
          try {
            let comment = {
              maincode : auth.maincode,
              job_no: x.job_no,
              reqno: x.reqno,
              refitemno: x.itemno,
            }
            let f = {
              comment: comment,
            }
            page.loadingBox.show()
            let act = `CSM/Data/CSM_DeleteCommentExt`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            let newCaseData = rsp.data || [];
            let hub = window.signalR();
          //  console.log("Sending case to hub", newCaseData, hub);
            hub.reHub.server.sendNewComment(newCaseData);
            $notify.success(this.ui.alert_delete_success)
            await this.showCommentExt(rsp.data.job_no, rsp.data.reqno);
          } catch (ex) {
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
          }
        },
        selectedWarrantyItem(x) {
          let detail = this.editDetailData
          if (this.warCheck === x.itemno) {
            this.warCheck = null
            this.editDetailData.item_name = ''
            this.editDetailData.serial_number = ''
            this.editDetailData.refitemno_war = ''
          } else {
            this.warCheck = x.itemno
            detail.module = x.loccode
            detail.item_name = x.war_des
            detail.serial_number = x.serial_number
            detail.refitemno_war = x.itemno
          }
        },
        /* Method : Approve */
        async approveClick() {
          this.$refs.approveModal.setSize('modal-lg');
          this.$refs.approveModal.openModal()
          await this.loadFormHeader()
        },
        closeApproveModal() {
          this.newApprove = false
          this.$refs.approveModal.closeModal()
        },
        async newApproveClick() {
          try {
            let f = {
              header: this.formData,
              detail: this.detailData,
              formcode: this.approveFormCode
            }
            page.loadingBox.show()
            let act = `CSM/Data/NewApprove`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            $notify.success(this.ui.alert_save_success)
            await this.loadData(rsp.data)
            this.newApprove = false
            this.approveFormCode = ''
            this.closeApproveModal()
          } catch (ex) {
            page.loadingBox.hide()
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
          }
        },
        async confirmApprove() {
          if ($xt.isEmpty(this.approveFormCode)) {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_select_formcode, `warning`)
            return
          }
          if (this.newApprove && this.isEdit) {
            await  this.newApproveClick()
           // await this.saveClick()
            return
          }
          await this.saveClick()
        },
        async confirmNewApprove() {
          if (this.isMango) {

            for (const item of this.detailData) {
              if (item.approve_status === 'Y') continue
              const code = item.item_type;
              const matchedItem = this.serviceCodeData.find(x => x.serv_code === code);
              if (matchedItem?.addspec_request == 'R') {
                const hasAttachment = this.attachmentData.some(a => a.ref_itemno === item.itemno && a.item_type == 'P');
                if (!hasAttachment) {
                  await $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_addspec_item.replace('{0}', item.itemno), `warning`);
                  return;
                }
              }
            }

            this.approveClick()
            this.newApprove = true
          }
          else
          {
            this.approveClick()
            this.newApprove = true
          }

        },
        async loadFormHeader() {
          this.approveFormCode = ''
          let act = `CSM/Data/CSM_FormApproveHeader`
          let rsp = await $xt.getServer(act)
          this.approveHeaderData = rsp
        },
        async loadFormDetail() {
          let act = `CSM/Data/CSM_FormApproveDetail?formcode=${this.approveFormCode}&pre_event=${this.formData.pre_event || ''}&dpt_no=${this.formData.dpt_no || ''}`
          let rsp = await $xt.getServer(act)
          this.approveDetailData = rsp
        },
        /* Method : Description Contact */
        async loadDescriptionData() {
          let act = `Anywhere/Master/Description_ReadList?type=CSM&skip=${descPaging.skipItems()}&take=${descPaging.getItemsPerPage()}&text=${this.desc_text}`
          let resp = await $xt.getServer(act)
          this.descriptionData = resp.data
          descPaging.setTotalItems(resp.total ?? 1)
          if (!descPaging.getItemsPerPage()) {
            descPaging.setCurrentPage(1)
          }
          descPaging.createPagesArray()
        },
        async openDescModal() {
          await this.loadDescriptionData()
          $('#DescModal').modal('show')
        },
        async openDescModal1(from) {
          this.currentForm = from
          this.$refs.descriptionModal.openModal()
        },
        closeDescModal() {
          $('#DescModal').modal('hide')
        },
        /* close :modal1 */
        closeDescModal1() {
          $('#DescModal1').modal('hide')
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
            page.loadingBox.show()
            let act = `CSM/Data/CSM_CreateQC?job_no=${job_no}`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            $notify.success(this.ui.alert_save_success)
            await this.loadData(job_no)
          } catch (ex) {
            page.loadingBox.hide()
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
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
        /* Method : Component */
        empModalSelected(e) {
          this.empType = e || ''
          // console.log('www',e)
        if (e == 'assign_detail') {
          (async () => {
            let act = `csm/data/CSM_CheckResponsibleEmp?pre_event=${encodeURIComponent(this.formData.pre_event)}`
            let rsp = await $xt.getServer(act)
            if (rsp > 0) {
              let respon_type = 'W'
              this.$refs.ct_responsible_emp.openModal(respon_type)
            }
            else {
              this.$refs.ct_emp.openModal()
            }
          })()
        }
        else {
          this.$refs.ct_emp.openModal()
        }
        },
        empModalSelected2(e, i) {
  
          this.empType =e
          this.empIno =i
          this.$refs.ct_emp.openModal()
        },
        customerModalSelected() {
          this.$refs.ct_cm_customer.openModal()
        },
        openModalComponent(type) {
          switch (type) {
            case 'department':
              this.$refs.ct_department.openModal()
              break
            case 'cm_customer':
              this.$refs.ct_cm_customer.openModal()
              break
            case 'project':
              this.$refs.ct_project2.openModal()
              break
          }
        },
        async sendComponent(e, type) {
          switch (type) {
            case 'department':
              this.formData.dpt_no = e.dpt_code
              this.formData.dpt_no_name = e.dpt_name
              // await this.$refs.document_details.$refs.document_detail_assignment.loadHistory()
              this.$eventBus.$emit('reload-history')
              break
            case 'cm_customer':
              this.formData.customer_code = e.customer_code
              this.formData.customer_name = e.name_th
              this.formData.cust_type_name = e.cust_type_name
              this.setContractData(e.customer_code)
              if (this.isMango) { this.setUpdateSW(e.customer_code) }

              break
            case 'emp':
              switch (this.empType) {
                case 'assign_detail':
                  this.editDetailData.assign_empno = e.empno
                  this.editDetailData.assign_empno_name = e.empfullname
                
                  break
                case 'tester':
                  this.editDetailData.tester_empno = e.empno
                  this.editDetailData.tester_empno_name = e.empfullname
                  break
                case 'request':
                  this.formData.request_empno = e.empno
                  this.formData.request_empno_name = e.empfullname
                  this.formData.request_empno_email = e.email
                  this.formData.request_empno_emptel = e.emptel
                  this.formData.request_empno_empmob = e.empmob
                  if(this.formData.request_empno != this.auth.empno) {
                    this.detailData.forEach((item) => {
                      item.isViewOnly = true
                      item.showEditOnly = false
                    });
                  } else {
                    this.detailData.forEach((item) => {
                      item.isViewOnly = false
                      item.showEditOnly = true
                    });
                  }
                  break
                case 'assign':
                  this.formData.assign_empno = e.empno
                  this.formData.assign_empno_name = e.empfullname
                  this.formData.assign_empno_email = e.email
                  this.formData.assign_empno_emptel = e.emptel
                  this.formData.assign_empno_empmob = e.empmob
           
                  //เปลี่ยน Worker ตาม Rsponsible
                  $linq(this.detailData).foreach(x => {
                    x.isCheckData = 'Y'
                    x.assign_empno = e.empno
                    x.assign_empno_name = e.empfullname
                  })
                  break
                case 'change_worker':
                  let arr = $linq(this.detailData).where(x => x.isCheckData).toArray()
                  arr.forEach((x, idx) => {
                    x.assign_empno = e.empno
                    x.assign_empno_name = e.empfullname
                  })
                
                  break
                case 'change_worker_d':
                  let arr2 = $linq(this.detailChange).where(x => x.itemno == this.empIno).firstOrDefault()
                  arr2.assign_empno = e.empno
                  arr2.assign_empno_name = e.empfullname
                  break
              }
              break
            case 'form':
              this.editDetailData.formcode = e.formcode
              this.editDetailData.formname = e.formname
              break
            case 'description':
              this.formData.descode = e.descode
              this.formData.remark = e.desname
              this.closeDescModal()
              break
            case 'addspec':
              this.appendRows(type, e)
              // this.att.module = e.module
              // this.editDetailData.object_name = e.object_name
              break
            case 'description1':
              this.formData.subject = e.desname.length > 250 ? e.desname.substring(0, 250) : e.desname
              break
            case 'description2':
              this.editDetailData.subject = e.desname.length > 100 ? e.desname.substring(0, 100) : e.desname
              break
            case 'project':
             // console.log('EEEEE:', e);
              
              if (this.isMango) {
                await this.loadCheckWarranty(e.customer_code)
                let test = ''
                if (test != 'Y') {
                  if (this.formData.mg_ma == 'N') {
                    $msg.alert(this.ui.csm_v2_warning,
                    this.ui.erp_customer_code + ' ' + e.customer_code + '</br>' +
                    this.ui.erp_cust_name + ' ' + e.customer_name + '</br></br>' +
                    this.ui.csm_trn_alert_no_ma_with.replace('{0}', this.auth.mainname) + '</br>' +
                    this.ui.csm_trn_alert_no_ma_detail
                    , `warning`)
                  }
                  else if (this.formData.mg_ma == 'S') {
                    $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_alert_no_passcode, `warning`)
                      return
                    }
                  }
                }
                this.editDetailData.module = ''
                this.formData.pre_event = e.pre_event
                this.formData.pre_event2 = e.pre_event2
                this.formData.pre_des = e.pre_des
                this.formData.refcode = e.refcode
                this.formData.customer_code = e.customer_code
                this.formData.customer_name = e.customer_name
                this.formData.cust_type_name = e.cust_type_name

                // Auto check 'contract_by_cust' when project is selected
                // this.formData.contract_by_cust = 'Y'

                if (this.config.PROJECT_PRIORITY == 'Y') {
                  this.formData.job_priority = e.prioity_code
                }
                this.detailData.forEach((item) => {
                  item.map_url = !$xt.isEmpty(e.map_location) ? e.map_location.map_url : '';
                  item.map_gps = !$xt.isEmpty(e.map_location) ? e.map_location.map_gps : '';
                  item.map_desc = !$xt.isEmpty(e.map_location) ? e.map_location.map_desc : '';
                });
                this.storeMapLocation = e.map_location || {}
                this.customerWarData = []
                // await this.loadHistory()
                // await this.$refs.document_details.$refs.document_detail_assignment.loadHistory()
                this.$eventBus.$emit('reload-history')
                if (!this.isMango) {
                  this.loadArea()
                  // this.loadSupplierWarranty()
                  // this.loadCustomerWarranty()
                }
              this.setContractData(e.customer_code)
              if (this.isMango) { this.setUpdateSW(e.customer_code) }
              this.formData.jobcode = ''
              this.formData.jobname = ''
                break

            case 'job-detail':
              //console.log(e);
              //console.log('this job detail case');
              this.formData.jobcode = e.jobcode
              this.formData.jobname = e.jobname
              break
          }
        },
        clearData(data, field) {
          $linq(field).foreach(x => data[x] = null)
          this.$eventBus.$emit('reload-history')
        },
        /* Method : Default Value */
        datePriority() {
          var to_date = $linq(this.priorityCodeData_isActive).where(w => w.prioity_code == this.formData.job_priority).select(x => x.to_date).firstOrDefault() || 0
          return to_date
        },
        itemTypeName(code) {
          return $linq(this.serviceCodeData).where(x => x.serv_code == code).select(x => x.serv_name).firstOrDefault() || ''
        },
        reqTypeName(code) {
          return $linq(this.requestCodeData).where(x => x.req_code == code).select(x => x.req_des).firstOrDefault() || ''
        },
        statusName(code) {
          let d = this.formData.job_status == 'I' && code == 'W' ? 'Queued' : $linq(this.statusCodeData).where(x => x.id == code).select(x => x.name).firstOrDefault() || ''
          return d
        },
        statusClass(prefix, status) {
          const map = { W:'W', I:'I', S:'S', X:'X', T:'T', U:'U', Y:'Y', R:'R', B:'B', H:'H', N:'N' }
          return prefix + (map[status] || 'default')
        },
        // areaName(code) {
        //   return $linq(this.moduleCodeData).where(x => x.id == code).select(x => x.text).firstOrDefault() || ''
        // },
        async loadCheckWarranty(customer_code) {
          let act = `CSM/Data/CustomerWarrantyDate?customer_code=${customer_code || ''}`
          let res = await $xt.getServer(act)
          if(res == null) {
            this.formData.mg_ma = 'N'
            this.formData.package_code = ''
          } else {
            this.formData.mg_ma = res.status || 'N'
            this.formData.package_code = res.package_code || ''
          }
        },
        async loadContactData(customer_code) {
          let act = `CSM/master/CSM_CustomerContact?customer_code=${customer_code}&skip=0&take=100&search_text=`
          let rsp = await $xt.getServer(act)
          // this.contactData = rsp.data
          this.contactData.header = rsp.data.header
          this.contactData.detail = rsp.data.detail
        },
        async setContractData(customer_code) {
          let code = customer_code || this.formData.customer_code
          
          await this.loadContactData(code)

          let contact = this.contactData || null
          let detail = (contact && contact.detail) ? contact.detail : null

          this.formData.cust_contact_name = detail ? detail.cust_contact_name : ''
          this.formData.cust_contact_phone = detail ? detail.cust_contact_phone : ''
          this.formData.cust_contact_email = detail ? detail.cust_contact_email : ''
        },
        async setUpdateSW(cuscode) {
          let act = `CSM/master/CSM_CustomerUpdateSW?customer_code=${cuscode}`
          let rsp = await $xt.getServer(act)
          this.itupdateAuto = rsp.data||'N'
        },
        async setContractUser() {
          await this.loadContactData(this.formData.customer_code)
          let contact = this.contactData || null
          let detail = (contact && contact.detail) ? contact.detail : null
          
          this.formData.cust_contact_name = detail ? detail.cust_contact_name : ''
          this.formData.cust_contact_phone = detail ? detail.cust_contact_phone : ''
          this.formData.cust_contact_email = detail ? detail.cust_contact_email : ''
        },
        async loadSubData() {
          let act = `csm/master/CSM_SubService_ReadList?skip=0&take=1000`
          let rsp = await $xt.getServer(act)
          let data = rsp.data.data2
          this.subCodeData = $linq(data).where(x => x.hdtype == 'H') || []
          this.subCodeData2 = $linq(data).where(x => x.hdtype == 'D') || []
        },
        filterReqCodeData() {
          let arr = []
          $linq(this.requestCodeData).foreach(x => {
            arr.push(
              {
                id: x.req_code,
                text: x.req_des
              }
            )
          })
          let d = arr
          return d
        },
        filterSubData() {
          let arr = []
          $linq(this.subCodeData).foreach(x => {
            arr.push(
              {
                id: x.serv_code,
                text: x.remark
              }
            )
          })
          let d = arr
          return d
        },
        filterSubData2() {
          let arr = []
          let d = $linq(this.subCodeData2).where(x => x.serv_code == this.editDetailData.serv_code_d).toArray()
          $linq(d).foreach(x => {
            arr.push(
              {
                id: x.serv_code_d,
                text: x.remark
              }
            )
          })
          let e = arr
          return e
        },
        openCalenderModal(data) {
          this.$refs.worker_calendar.openModal()
          this.worker_empno = data
        },
        eventSelected(event) {
          window.open(this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${event}`, '_blank')
        },
        /* Method : Upload File */
        /* Method : Other */
        is_wait(status) {
          return !status || ['W', 'H'].includes(status)
        },
        is_claim() {
          let isClaim = $linq(this.serviceCodeData).where(w => w.serv_code == this.editDetailData['item_type']).select(x => x.claim_st).firstOrDefault()
          return isClaim == 'Y' ? true : false
        },
        is_qc() {
          let isQC = $linq(this.serviceCodeData).where(w => w.serv_code == this.editDetailData['item_type']).select(x => x.qc_st).firstOrDefault()
          return isQC == 'Y' ? true : false
        },
        is_mango() {
          let isMango = $linq(this.configData).where(x => x.config_id == 'TRN0001').select(x => x.config_value).firstOrDefault()
          return isMango == 'Y' ? true : false
        },
        isApprove(item_type) {
          let approve = $linq(this.serviceCodeData).where(x => x.serv_code == item_type).select(x => x.approve_st).firstOrDefault()
          return approve == 'Y' ? true : false
        },
        isAutoComplete() {
          let auto_complete = $linq(this.serviceCodeData).where(x => x.serv_code == this.editDetailData.item_type).select(x => x.auto_task).firstOrDefault()
          return auto_complete == 'Y'
        },
        commentCount(itemno) {
          return $linq(this.commentData).where(x => x.ref_itemno == itemno).count()
        },
        attachCount(itemno) {
          return $linq(this.attachmentData).where(x => x.ref_itemno == itemno).count()
        },
        approveTab() {
          return $linq(this.prapproveData).where(x => x.refitemno == this.editDetailData.itemno).toArray()
        },
        numericOnly(evt) {
          evt = (evt) ? evt : window.event
          var charCode = (evt.which) ? evt.which : evt.keyCode
          if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46 && charCode !== 45) {
            evt.preventDefault()
          } else {
            return true
          }
        },
        /* Method : Mango Condition */
        async updateReadStatus(itemno) {
          try {
            let comment = $linq(this.commentData).where(x => x.ref_itemno == itemno).toArray()
            let f = {
              comment,
              tester_empno: this.editDetailData.tester_empno,
              assign_empno: this.editDetailData.assign_empno,
            }
            let act = `CSM/Data/UpdateReadStatus`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
          } catch (ex) {
          }
        },
        async getManagerTester() {
          let act = `CSM/Center/EmployeeTesterManager?type=${this.editDetailData.module}`
          let resp = await $xt.getServer(act)
          if (resp.data) {
            this.editDetailData.tester_empno = resp.data.empno
            this.editDetailData.tester_empno_name = resp.data.name
            this.editDetailData.tester_empno_tmp = this.editDetailData['tester_empno']
            this.editDetailData.tester_empno_name_tmp = this.editDetailData['tester_empno_name']
          }
        },
        async updateTester() {
          try {
         
            if($xt.isEmpty(this.editDetailData.tester_approve) ||this.editDetailData.tester_approve == 'N' ){
             
               $msg.alert(this.ui.csm_v2_warning,this.ui.csm_trn_req_bug_result, `warning`)
                 return;
            }

            if (this.editDetailData.tester_approve == 'R' && $xt.isEmpty(this.editDetailData.tester_approve_remark)) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_reject_reason, `warning`)
              return;
            }
            let f = {
              detail: this.editDetailData,
              attachfile: $linq(this.attachmentData).where(x => x.ref_itemno == this.editDetailData.itemno).toArray()
            }
            page.loadingBox.show()
            let act = `CSM/Data/CSM_ApproveTester`
            let rsp = await $xt.postServerJson(act, f)
            if (!rsp.success) {
              throw rsp.error
            }
            $notify.success(this.ui.alert_save_success)
            await this.loadData(rsp.data.job_no)
            this.editDetailData = $linq(this.detailData).where(x => x.itemno === rsp.data.itemno).firstOrDefault()
            this.commentText = ''
            this.$refs.document_details.$refs.job_detail.$refs.modalEditTask.closeModal();
          } catch (ex) {
            page.loadingBox.hide()
            $msg.alert(``, ex.toString(), typeof ex === 'string' ? 'warning' : 'danger')
          } finally {
            page.loadingBox.hide()
          }
        },
        emp_is_software_tester() {
          return ['006'].includes(this.auth.dpt_code)
        },
        changeMultiWorker() {
          return this.formData.assign_empno_tmp == this.auth.empno && !['Y'].includes(this.formData.job_status)
        },
        async saveChangeWorker() {
          try {
            let q = $linq(this.detailData).where(x => x.isCheckData).toArray()
            let has_error = false
            let error_message = '<ul>'
            if ($linq(q).count() < 1 && this.formData.assign_empno == this.auth.empno) {
              error_message += `<li>${this.ui.csm_trn_req_select_worker_item}</li>`
              has_error = true
            }
            error_message += '</ul>'
            if (has_error) {
              $msg.alert(this.ui.csm_trn_required_fields_title, error_message, `warning`)
              return
            }
            page.loadingBox.show()
            /* กรณี assign ที่ detail มีการเปลี่ยน ให้ update ที่ ppn only mango */
            if (this.isMango && !$xt.isEmpty(this.formData.ref_pre_event_ppn) && !$xt.isEmpty(this.formData.ref_plancode) && $linq(q).count() >= 1) {
              for (let i of q) {
                let act = `/Planning/Public/updateWorkerToTask`;
                let rsp = await $xt.postServerJson(act, {
                  empno: i.assign_empno,
                  plan_code: this.formData["ref_plancode"],
                  pre_event: this.formData["ref_pre_event_ppn"],
                  taskid: i.refid_ppn
                });
              }
            }
            let act = `CSM/Data/CSM_UpdateWorker`
            let rsp = await $xt.postServerJson(act, { form: q, assign: this.formData.assign_empno })
            if (!rsp.success) {
              throw rsp.error
            }
            $notify.success(this.ui.alert_save_success)
            this.loadData(this.formData.job_no)
            this.checkAll = false
          } catch (ex) {
            page.loadingBox.hide()
            $msg.alert(``, ex.toString(), `danger`)
          } finally {
            page.loadingBox.hide()
          }
        },
        itemTypeChange() {

          if (this.is_qc()) {
            this.getManagerTester()
          } else {
            this.editDetailData.tester_empno = this.formData['request_empno']
            this.editDetailData.tester_empno_name = this.formData['request_empno_name']
          }
          if ((this.auth.empcode.substring(0, 3) == 'CUS' || this.auth.empcode.substring(0, 2) == 'CS' || ['P013', 'P014'].includes(this.auth.emppos)) && !this.emp_is_software_tester()) {
            this.editDetailData.req_type = '04'
          } else if (this.auth.empcode.substring(0, 3) == 'IMP') {
            this.editDetailData.req_type = '03'
          } else if (this.emp_is_software_tester() == true) {
            this.editDetailData.req_type = '07'
          }
          if (!['01', '02', '04', '05'].includes(this.editDetailData.item_type)) {
            this.editDetailData.contract_type = 'N'
          } else {
            this.editDetailData.contract_type = ''
          }
          if (this.isAutoComplete()) {
            this.editDetailData.module = 'Other'
            this.editDetailData.platform = '111'
            this.editDetailData.subject = this.formData.subject
            this.editDetailData.due_date = new Date()
            this.editDetailData.response_date = new Date()
          } else {
            let todayDate = new Date()
            todayDate = moment(todayDate).add(this.datePriority(), 'days')
            this.editDetailData.module = this.editDetailData.module ?? ''
            this.editDetailData.platform = this.editDetailData.platform ?? ''
            this.editDetailData.subject = this.editDetailData.subject ?? ''
            this.editDetailData.due_date = todayDate
            this.editDetailData.response_date = new Date()
          }
          let noti = $linq(this.serviceCodeData).where(x => x.serv_code == this.editDetailData.item_type).firstOrDefault()
          if (!this.isMango) {
            this.editDetailData.noti_date = noti.noti_date ?? 0
            this.editDetailData.noti_active = noti.noti_active ?? 'N'
            this.editDetailData.noti_line = noti.noti_line ?? 'N'
            this.editDetailData.noti_email = noti.noti_email ?? 'N'
          }
          if (this.isMango) {
            let saArray = []

            if (noti && noti.add_emp_sa_mg) {
              try {
                saArray = JSON.parse(noti.add_emp_sa_mg)
              } catch (e) {
                console.error('Invalid JSON add_emp_sa_mg:', noti.add_emp_sa_mg)
                saArray = []
              }
            }

            this.list_emp_sa_mg = Array.isArray(saArray) && saArray.length
                ? saArray.map(x => x.empno).join(',')
                : ''
          }

          this.editDetailData.alert_type = noti.alert_type ?? 'B'
          this.editDetailData.auto_complete = noti.auto_complete ?? 'N'
          this.editDetailData.complete_days = noti.complete_days ?? 1

     

          console.log('editDetailData: ', this.editDetailData);
        },
        moduleChange() {
          if (this.is_qc()) {
            this.getManagerTester()
          }
          if (['RE', 'QCM', 'CSM', 'PPN', 'TS','RERENT'].includes(this.editDetailData.module)) this.editDetailData.platform = 'WEB'
          else this.editDetailData.platform = 'WIN'
        },
        checkAttachFiles(item_type, tab_name, tab_selected) {
          let has_error = false
          let error_message = ''
          var file = $linq(this.attachmentData).where(x => x.item_type == item_type && x.ref_itemno == this.editDetailData['itemno']).toArray()
          if ($linq(file).count() == 0) {
            error_message += `<li>${this.ui.csm_trn_req_attach_after_test.replace('{0}', tab_name)}</li>`
            has_error = true
          }
          let item_no = 0
          $linq(file).foreach(x => {
            ++item_no
            if (!x.description) {
              error_message += `<li>${this.ui.csm_trn_req_description_item.replace('{0}', item_no).replace('{1}', tab_name)}</li>`
              has_error = true
            }
          })
          if (has_error) {
            this.$refs.document_details.$refs.job_detail.changeTab(tab_selected)
          }
          return { has_error: has_error, error_message: error_message }
        },
        isAnyType(arr) {
          return $linq(this.detailData).any(x => arr.includes(x.item_type))
        },
        isCountType(arr) {
          return $linq(this.detailData).where(x => arr.includes(x.item_type)).count()
        },
        createBr(text) {
          text = text.replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@@:%_\+.~#?&//=]*)/ig, (url) => {
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
          });
          return (text || '').replace(/(?:\r\n|\r|\n)/g, '<br />')
        },
        appendRows(type, data) {
          let x = {}
          switch (type) {
            case 'risk':
              x.ref_itemno = this.editDetailData.itemno
              x.itemno = $linq(this.risk).where(y => y.ref_itemno == x.ref_itemno).count()
              ++x.itemno
              x.adduser = auth.userid
              x.description = ''
              this.risk.push(x)
              break
            case 'addspec':
              const dataArray = Array.isArray(data) ? data : [data]
              dataArray.forEach(item => {
                let specObj = {}
                specObj.ref_itemno = this.editDetailData.itemno
                specObj.itemno = $linq(this.attachmentData).where(y => y.ref_itemno == specObj.ref_itemno).count()
                ++specObj.itemno
                specObj.item_type = 'P'
                specObj.adduser = auth.userid
                specObj.filename = item.module || ''
                specObj.description = item.object_name || ''
                specObj.description2 = ''
                specObj.add_user = auth.userid
                specObj.add_dt = new Date()
                this.attachmentData.push(specObj)
              })
              break
          }
        },
        spliceRows(itemno, keyword) {
          switch (keyword) {
            case 'risk':
              this.risk = $linq(this.risk).where(x => !(x.itemno == itemno && x.ref_itemno == this.editDetailData.itemno)).toArray()
              break
          }
        },
        showRisk() {
          return $linq(this.risk).where(x => x.ref_itemno == this.editDetailData.itemno).orderBy(x => x.itemno).toArray()
        },
        filterService() {
          if ((this.formData.mg_ma == 'N' && this.isMango)) {
            return $linq(this.serviceCodeData).where(x => ['03', '05', '08', '999', '22'].includes(x.serv_code)).select(s => { return { id: s.serv_code, text: s.serv_name } }).toArray()
          }
          else {
            return $linq(this.serviceCodeData).where(x => x.serv_code != '999').select(s => { return { id: s.serv_code, text: s.serv_name } }).toArray()
          }
        },
        queryStringRemoteIP() {
          if ($xt.isEmpty(this.formData.pre_event)) {
            return
          }
          window.open(this.baseUrl + `page/CustomerDataView?customer_code=${this.formData.customer_code}&pre_event=${this.formData.pre_event}&tabSelected=tab2`, '_blank')
        },
        isDeveloper() {
          let department = this.auth.empcode.substring(0, 2)
          return department == 'IT'
        },
        isUsevendor() {
          return !['MG', 'PAL', 'PANNA'].includes(this.company)
        },
        isDisabled(type, value) {
          let value2 = !$xt.isEmpty(value) ? value : true
          switch (type) {
            case 'h1':
              value2 = ((this.formData.request_empno != this.auth.empno || ['I', 'Y', 'N'].includes(this.formData['job_status'])) && !this.isAdmin)
              break
            case 'h2':
              value2 = ((this.formData.request_empno != this.auth.empno || (($xt.isEmpty(this.formData.dpt_no) || !this.isMango) && ['I', 'Y', 'N'].includes(this.formData['job_status'])) && !this.isAdmin))
              break
          }
          return value2
        },
        filterJobType() {
          if (this.isMango) {
            if (this.editDetailData && ['11'].includes(this.editDetailData['item_type'])) {
              return [
                { id: 'P', text: 'Production' },
                { id: 'D', text: 'Demo' }
              ]
            }
          }
          let data = [
            { id: 'T', text: 'Transaction' },
            { id: 'M', text: 'Master' },
            { id: 'R', text: 'Report' },
            { id: 'F', text: 'Form' },
            { id: 'O', text: 'Other' }
          ]
          return data
        },
        navigate(direction) {
          let index = this.detailData.map(item => item.itemno)
          let number = this.editDetailData.itemno
          let view = this.editDetailData.isViewOnly
          // this.editDetailData.module = this.editDetailData.module || ''
          if($xt.isEmpty(this.editDetailData.module)){
            this.editDetailData.module = ''
          }
          if (direction === 'next') {
            this.customerWarData=[]
            if (this.formData['request_empno'] == this.auth.empno) {
              if (number === Math.max(...index) && (['W'].includes(this.formData['job_status_tmp']) || this.formData.job_status_tmp == null)) {
                this.addDetail()
             //   this.warCheck = null
              } else {
                let nextNumber = index.find(num => num > number)
                if (nextNumber !== undefined) {
                 this.warCheck = nextNumber
                  this.editDetail(nextNumber, view)
                }
              }
            } else {
              if (number < Math.max(...index)) {
                let nextNumber = index.find(num => num > number)
               this.warCheck = nextNumber
                this.editDetail(nextNumber, view)
              }
            }
          }
          else {
            this.customerWarData = []
            if (number > Math.min(...index)) {
              let prevNum = [...index].reverse().find(num => num < number)
              if (prevNum !== undefined) {
               this.warCheck = prevNum
                this.editDetail(prevNum, view)
              }
            }
          }
        },
        fromLine_req() {
          // req_line default from v_csm_trn_002
          return (!$xt.isEmpty(this.editDetailData['ref_docno']) || typeof this.editDetailData['ref_docno'] != 'undefined')
        },
        getParsedDescription(description) {
          if (description) {
            const parts = description.split(':');
            return parts.length > 1 ? parts[1].trim() : description;
          }
          return '';
        },
        openModalLocation(data) {
          let gps = (data || '').trim();
          if (!gps) {
            $msg.alert('', this.ui.csm_trn_req_gps, 'warning');
            return;
          }
          let key = this.config.API_KEY_GOOGLE_remark1 || '';
          if (!key) {
            $msg.alert('', this.ui.csm_trn_alert_no_map_key, 'warning');
            return;
          }
          let src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${gps}`;
          this.editDetailData.map_src = src;
          // this.editDetailData.map_src = src
          this.$refs.prviewModal.openModal()
        },
        openMapUrl(data) {
          if (data) {
            window.open(data, '_blank');
          } else {
            alert('Please enter a valid Google Maps URL.');
          }
        },
        async setJobPriority() {
          if (!$xt.isEmpty(this.queryString.job_no)) {
            // ถ้ามี job_no ให้ใช้ priorityCodeData ทั้งหมด
            this.priorityCodeData_isActive = this.priorityCodeData;
          } else {
            do {
              // จัดเรียงข้อมูลให้ default_ === 'Y' มาก่อน
              const priority_isActive = $linq(this.priorityCodeData).toArray();
              const sortedData = priority_isActive.sort((a, b) => {
                if (a.default_ === "Y" && b.default_ === "N") return -1;
                if (a.default_ === "N" && b.default_ === "Y") return 1;
                return 0;
              });
              this.priorityCodeData_isActive = sortedData;
              await $xt.sleep(100);
            } while (this.priorityCodeData_isActive.length <= 0);
            do {
              // เลือก priority ที่ default_ === 'Y' ก่อน ถ้าไม่มีให้ใช้ตัวแรก
              let selectedPriority = $linq(this.priorityCodeData_isActive).where(c => c.default_ === 'Y').select(x => x.prioity_code).firstOrDefault();
              if ($xt.isEmpty(selectedPriority)) {
                selectedPriority = $linq(this.priorityCodeData_isActive).where(c => c.active === 'Y').select(x => x.prioity_code).firstOrDefault();
              }
              this.formData.job_priority = selectedPriority;
              await $xt.sleep(100);
            } while ($xt.isEmpty(this.formData.job_priority));
          }
          // console.log('Priority Code Data:', this.priorityCodeData_isActive);
        },
        formatOption(state) {
          if (!state.id) return state.text; // ป้องกันค่าที่ไม่มี ID
          if (state.hidden) return null
          if (state.disabled) return null
          return state.text;
        },
        formatSelection(state) {
          return state.text; // แสดงค่าที่ถูกเลือกปกติ
        },
        async loadActiveConfig() {
          await this.$store.dispatch('findActiveConfig')
          await this.$store.dispatch('findConfigReadList')
          this.config_req = this.configReadlist.TRN000X.config_value
        },
        updateCommentTextExt(newValue) {
          this.commentTextExt = newValue;
          this.createCommentExt();
        },
        updateCommentTextExt2(newValue) {
          this.commentTextExt = newValue;
        },
        updateCommentText(newValue) {
          this.commentText = newValue;
          this.createComment();
        },
        updateCommentText2(newValue) {
          this.commentText = newValue;
        },
        updateAttachment(newValue) {
          this.attachmentData = newValue;
        },
        // Loading
        loadingBox(status) {
        if (status == 'show') {
          this.$refs.page.loadingBox.show()
        } else {
          this.$refs.page.loadingBox.hide()
        }
      },
      openDepartment() {
        this.$refs.ct_department.openModal()
      },
      openAddSpecModal() {
        this.$refs.ct_addspec.openModal()
        },
         /* CSM ----- X  ----- PPN */
        async retrievePlanWhenAcceptJob() {
          let act = `Planning/Public/retrievePlanWhenAcceptJob?empno=${this.ppnEmpno}`
          let resp = await $xt.getServer(act)
          this.list_ppn = resp.data.plan_auth
        },

        async getApiPPN() {
          if (!this.selectedPlan) {
            $msg.alert(this.ui.csm_v2_warning, "Please select a plan.", `warning`)
            return;
          }
          let csm_no = this.formData.job_no;
          let plan_code = this.selectedPlan.plan_code;
          let act = `/Planning/Public/onCreateCSMToPlanning?csm_no=${csm_no}&plan_code=${plan_code}`;
          let rsp = await $xt.getServer(act);
          if (!rsp.success) {
            throw rsp.error
          }
          this.listTask = rsp.data
          this.formData.job_status = 'I'
          await this.saveClick()
          await $xt.sleep(1000)
          await this.updateTaskIdPPN(this.listTask)
          this.reloadData = true
          this.$refs.select_plan.closeModal();
          await $xt.sleep(1000)
          await this.loadData(csm_no)
          await  this.openModalChange();
         
        },
        async DBgetApiPPN(ppn,idx) {
          if (!ppn) {
            $msg.alert(this.ui.csm_v2_warning, "Please select a plan.", `warning`)
            return;
          }
          let csm_no = this.formData.job_no;
          let plan_code = ppn.plan_code;
          let act = `/Planning/Public/onCreateCSMToPlanning?csm_no=${csm_no}&plan_code=${plan_code}`;
          let rsp = await $xt.getServer(act);
          if (!rsp.success) {
            throw rsp.error
          }
          this.listTask = rsp.data
          this.formData.job_status = 'I'
          await this.saveClick()
          await $xt.sleep(1000)
          await this.updateTaskIdPPN(this.listTask)
          this.reloadData = true
          this.$refs.select_plan.closeModal();
          await $xt.sleep(1000)
          this.openModalChange();
          // await this.loadData(csm_no)
        },
        openModalChange() {
       
          this.detailChange = this.detailData
          this.detailChange.forEach(i =>
          {
            i.worker_start_date = i.worker_start_date ?? moment()

          })
          this.$refs.change_w.setSize('modal-lg');
          this.$refs.change_w.openModal()
        },
        ValidUpdateDetailTask() {
     
          let invalidTasks = this.detailChange.filter(x => !x.level_task || x.level_task.trim() === '');

          if (invalidTasks.length > 0) {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_difficulty, `warning`)
            return;
          }
          this.UpdateDetailTask();
        },
        async UpdateDetailTask() {
          let f = {
            detail: this.detailChange
          };
          // console.log(this.f);
          page.loadingBox.show();
          let act = `CSM/Data/updateTasktoplan`;
          let rsp = await $xt.postServerJson(act, f);

          if (!rsp.success) {
            throw rsp.error;
          }
          if (rsp.success) {
            await $notify.success('Update Progress');
          }
          await this.loadData(this.formData.job_no);
          // ถ้า detailChange เป็น array
          //if (this.isMango && !$xt.isEmpty(this.formData.ref_plancode) && !$xt.isEmpty(this.formData.ref_pre_event_ppn)) {
          //  for (let d of this.detailChange) {
          //    let ppnItem = this.retureIDppn.find(a => a.job_no === d.job_no && a.itemno === d.itemno);

          //    let ppndi = ppnItem ? ppnItem.refid_ppn : d.refid_ppn;
          //    await this.updateTaskToPPN(
          //      d.worker_start_date,
          //      d.worker_end_date,
          //      d.subject,
          //      ppndi
          //    );
          //    await $xt.sleep(500); // ต้อง await ด้วย
          //    await this.changeWorkerUpdateToPPN(ppndi, d.assign_empno);
          //  }
          //}
          if (
            this.isMango &&
            !$xt.isEmpty(this.formData.ref_plancode) &&
            !$xt.isEmpty(this.formData.ref_pre_event_ppn)
          ) {
            for (let d of this.detailChange) {
              // หา refid_ppn
              let ppnItem = this.retureIDppn.find(
                a => a.job_no === d.job_no && a.itemno === d.itemno
              );
              let ppndi = ppnItem ? ppnItem.refid_ppn : d.refid_ppn;

              // อัปเดตหัวหน้า
              await this.updateTaskToPPN(
                d.worker_start_date,
                d.worker_end_date,
                d.subject,
                ppndi
              );
              await $xt.sleep(100);

              if (d.assign_empno) {
                await this.changeWorkerUpdateToPPN(ppndi, d.assign_empno);
              }

              // อัปเดตทีมงานทั้งหมดที่ match กับ itemno
              let teamMembers = this.receivedWorkers.filter(
                a => a.reftask === d.itemno
              );

              console.log("teamMembers", teamMembers);

              for (let empRef of teamMembers) {
                if (empRef.empno) {
                  await this.changeWorkerUpdateToPPN(ppndi, empRef.empno);
                }
              }
            }
          }

          this.$refs.change_w.closeModal()
          page.loadingBox.hide()
          $xt.sleep(500)
          
        },
        send_ppn(csm, codeppn) {
          this.selectedPlan = { plan_code: codeppn, csm_no: csm };
        },
        async updateTaskIdPPN(list) {
          let ref_plancode = list?.[0]?.plan_code ?? null;
          let ref_pre_event = list?.[0]?.pre_event ?? null;
          let detail = list.map(p => ({
            maincode: auth.maincode,
            job_no: p.ref_csmno,
            itemno: p.ref_csm_itemno,
            refid_ppn: p.taskid,
          }));
          let act = `CSM/Data/csm_updateTaskId_ppn`;
          let rsp = await $xt.postServerJson(act, { detail, ref_plancode, ref_pre_event });
          
          if (!rsp.success) {
            throw rsp.error;
          }
          this.retureIDppn = rsp.data 
          await $notify.success('Create Plan Task PPN Success');
        },
        timeToMinutes(x) {
            if (x instanceof Date) {
              let hours = x.getHours();
              let minutes = x.getMinutes();
              return (hours * 60) + minutes;
            }
            if (typeof x === 'string') {
              let [hours, minutes] = x.split(':').map(Number);
              return (hours * 60) + minutes;
            }
            return 0;
          },
        async updateProgress(taskid, pre_event, plan_code, percent_pg, man_hour, update_hour, reject, comcplete) {
          let totalMinutes = this.timeToMinutes(man_hour);
          let form = {
            plan_code: plan_code,
            pre_event: pre_event,
            percent_pg: $xt.dec(percent_pg),
            man_hour: totalMinutes,
            remark_pg: this.editDetailData.reject_remark,
            remark_mh:'',
            update_hour: $xt.isEmpty(update_hour) ? 'N' : update_hour,
            progress_reject: $xt.isEmpty(reject) ? 'N' : reject,
            progress_comcplete: $xt.isEmpty(comcplete) ? 'N' : comcplete,
          };
          // console.log('totalMinutes', totalMinutes)
          let act = `/Planning/Public/updateProgressAndManHour?taskid=${taskid}`;
          let rsp = await $xt.postServerJson(act, form);
          if (!rsp.success) {
            throw rsp.error;
          }
          if (rsp.success) { await $notify.success('Update Progress'); }
        },
        async calProgress(key) {
          switch (key) {
            case "tester":
              let t_progress = $xt.dec(this.editDetailData.t_progress, 2) ?? 0;
              t_progress = (-10) + t_progress
              this.editDetailData.t_progress = t_progress
              let t_manhour0 = this.editDetailData.t_manhour;
              t_manhour0 = 30 + $xt.dec(t_manhour0, 2)
              this.editDetailData.t_manhour = t_manhour0;
              break;
            case "all":
              // console.log('test back')
              let n_progress2 = $xt.dec(this.editDetailData.n_progress, 2) ?? 0;
              let t_progress2 = $xt.dec(this.editDetailData.t_progress, 2) ?? 0;
              let new_total = n_progress2 + t_progress2;
              let n_ = 0
              if (new_total > 100)
              {
                new_total = new_total - t_progress2
                n_ = n_progress2 - t_progress2
                this.editDetailData.n_progress = n_;
              }
              if (new_total < 0)
              {
                new_total = 0
                n_ = 0
                this.editDetailData.n_progress = n_;
               }
                this.editDetailData.t_progress = new_total;
              // =------------------------------------------------------
              let n_manhour = this.editDetailData.n_manhour;
              let t_manhour = this.editDetailData.t_manhour;
              function timeToMinutes(timeInput) {
                if (timeInput instanceof Date) {
                  let hours = timeInput.getHours();
                  let minutes = timeInput.getMinutes();
                  return (hours * 60) + minutes;
                }
                if (typeof timeInput === 'string') {
                  let [hours, minutes] = timeInput.split(':').map(Number);
                  return (hours * 60) + minutes;
                }
                return 0;
              }
              let totalMinutes = timeToMinutes(n_manhour);
              // console.log('result t_manhour:', this.editDetailData.v_manhour);
              t_manhour = $xt.dec(totalMinutes, 2) + $xt.dec(t_manhour, 2)
              this.editDetailData.t_manhour = t_manhour;
              // this.editDetailData.n_manhour = totalMinutes;
              // console.log('result t_manhour:22', this.editDetailData.t_manhour);
              // console.log('result t_mat_progressnhour:22', this.editDetailData.t_progress);
              break;
            case "reject":
              let n_progress3 = $xt.dec(this.editDetailData.n_progress, 2) ?? 0;
              let t_progress3 = $xt.dec(this.editDetailData.t_progress, 2) ?? 0;
              if (t_progress3 > 0) {
                let pro = 100 - t_progress3
                this.editDetailData.t_progress = 100;
                this.editDetailData.n_progress = pro;
              }
              else if (t_progress3 < 1) {
                this.editDetailData.t_progress = 0;
                this.editDetailData.n_progress = 0;
              }
              break;
          }
        },
        async changeWorkerUpdateToPPN(taSKid,assign_no) {
          let form = {
            empno: assign_no,
            plan_code: this.formData["ref_plancode"],
            pre_event: this.formData["ref_pre_event_ppn"],
            taskid: taSKid
          }
          let act = `/Planning/Public/updateWorkerToTask`;
          let rsp = await $xt.postServerJson(act, form);
          if (!rsp.success) {
            throw rsp.error;
          }
          if (rsp.success)
          { await $notify.success(this.ui.csm_trn_change_worker_done); }
        },
        async AddRefWorker(taSKid,refppn) {
          try {
           // console.log(' this.taSKid===', taSKid)
           // console.log(' this.receivedWorkers', this.receivedWorkers)
            const workers = this.receivedWorkers.filter(f => f.reftask == taSKid);
          //  console.log('workers---', workers)


            for (const f of workers) {
              let form = {
                empno: f.empno,
                plan_code: this.formData["ref_plancode"],
                pre_event: this.formData["ref_pre_event_ppn"],
                taskid: refppn
              };
              let act = `/Planning/Public/updateWorkerToTask`;
              let rsp = await $xt.postServerJson(act, form);

              if (!rsp.success) {
                throw rsp.error;
              }

              await $notify.success(this.ui.csm_trn_change_worker_done);
            }
          } catch (err) {
            $msg.alert('Error', err, 'error');
          }
        },
        async updateTaskToPPN(startDate, endDate, taskName, taSKid) {
          let form = {
            plan_code: this.formData["ref_plancode"],
            pre_event: this.formData["ref_pre_event_ppn"],
            taskname : taskName,
            start_date:  moment(startDate).format("YYYY-MM-DD"),
            end_date: moment(endDate).format("YYYY-MM-DD"),
          }
          let act = `/Planning/Public/updateTaskNameAndChangeDate?taskid=${taSKid}`;
          let rsp = await $xt.postServerJson(act, form);
          if (!rsp.success) {
            throw rsp.error;
          }
          // if (rsp.success)
          // { await $notify.success('Change Worker (คนปฏิบัติงาน) เรียบร้อย'); }
        },
        async handleSearchWarranty(warText) {
          this.war_text = warText || '';
          await this.loadCustomerWarranty();
          await this.loadSupplierWarranty();
        },
        validateWorkerDates(x) {
          let start = x.worker_start_date ? moment(x.worker_start_date).startOf("day").toDate() : null;
          let end = x.worker_end_date ? moment(x.worker_end_date).startOf("day").toDate() : null;

          if (start && end) {
            if (start > end) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_valid_dates, `warning`)
              x.worker_start_date = null;
              return false;
            }
           else if (end < start) {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_valid_dates, `warning`)
              x.worker_end_date = null;
              return false;
            }
          }
          return true;
        },
        copyWorkerTaskToAll() {
          let first = this.detailChange[0]
          if (!first || $xt.isEmpty(first.assign_empno)) {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_req_first_worker_task, `warning`)
            return
          }
          this.detailChange.forEach((x, idx) => {
            if (idx === 0) return
            x.assign_empno = first.assign_empno
            x.assign_empno_name = first.assign_empno_name
          })
        },
        async runAiAnalysis(x) {
          x.aiAnalysisLoading = true
          try {
            let rsp = await $xt.postServerJson('CSM/Data/AiAnalysisTask', { job_no: this.formData.job_no, itemno: x.itemno })
            if (!rsp.success) {
              $msg.alert(this.ui.csm_v2_warning, rsp.error, `warning`)
              return
            }
            x.ai_analysis_result = rsp.data.ai_analysis_result
            x.ai_analysis_result_wk = rsp.data.ai_analysis_result_wk
            if (rsp.data.difficulty_level) {
              x.level_task = String(rsp.data.difficulty_level)
              x.ai_difficulty_reason = rsp.data.difficulty_reason
            }
            if (rsp.data.estimated_end_date) {
              x.worker_end_date = new Date(rsp.data.estimated_end_date)
              x.ai_estimated_days = rsp.data.estimated_days
              this.validateWorkerDates(x)
            }
            x.ai_approval_info = rsp.data.approval_info
            x.ai_token_usage_in = rsp.data.token_usage_in
            x.ai_token_usage_out = rsp.data.token_usage_out
            this.openAiAnalysisModal(x)
          } finally {
            x.aiAnalysisLoading = false
          }
        },
        openAiAnalysisModal(x) {
          this.aiModalTab = 'master'
          this.aiAnalysisModalSubject = x.subject || ''
          this.aiAnalysisModalText = x.ai_analysis_result || ''
          this.aiAnalysisModalTextWk = x.ai_analysis_result_wk || ''
          this.aiAnalysisModalItemno = x.itemno
          this.aiAnalysisModalAssignEmpno = x.assign_empno || null
          this.aiAnalysisModalDifficultyLevel = x.level_task || null
          this.aiAnalysisModalDifficultyReason = x.ai_difficulty_reason || ''
          this.aiAnalysisModalEstimatedDays = x.ai_estimated_days || null
          this.aiAnalysisModalEstimatedEndDate = x.worker_end_date || null
          this.aiAnalysisModalApprovalInfo = x.ai_approval_info || null
          this.aiAnalysisModalTokenIn = x.ai_token_usage_in || null
          this.aiAnalysisModalTokenOut = x.ai_token_usage_out || null
          this.aiCompareSpecData = null
          this.aiCompareSpecError = ''
          this.refreshAiChecklistState()
          this.$refs.ai_analysis_modal.setSize('modal-lg')
          this.$refs.ai_analysis_modal.openModal()
        },
        onClickCompareSpecTab() {
          this.aiModalTab = 'compare'
          if (!this.aiCompareSpecData && !this.aiCompareSpecLoading) {
            this.runAiCompareSpec()
          }
        },
        async runAiCompareSpec() {
          if (!this.aiAnalysisModalItemno) return
          this.aiCompareSpecLoading = true
          this.aiCompareSpecError = ''
          this.aiCompareSpecData = null
          try {
            let rsp = await $xt.postServerJson('CSM/Data/AiCompareSpecTask', { job_no: this.formData.job_no, itemno: this.aiAnalysisModalItemno })
            if (!rsp.success) {
              this.aiCompareSpecError = rsp.error
              return
            }
            this.aiCompareSpecData = rsp.data
          } finally {
            this.aiCompareSpecLoading = false
          }
        },
        async generateAiCompareSpecPdf() {
          if (!this.aiAnalysisModalItemno || !this.aiCompareSpecData) return
          this.aiCompareSpecPdfLoading = true
          try {
            let rsp = await $xt.postServerJson('CSM/Data/GenerateAiCompareSpecPdf', {
              job_no: this.formData.job_no,
              itemno: this.aiAnalysisModalItemno,
              stages: this.aiCompareSpecData.stages,
              comparisons: this.aiCompareSpecData.comparisons,
              overall_summary: this.aiCompareSpecData.overall_summary
            })
            if (!rsp.success) {
              $msg.alert(this.ui.csm_v2_warning, rsp.error, `warning`)
              return
            }
            let filename = encodeURIComponent(rsp.data.filename || 'AI_CompareSpec.pdf')
            let url = `${dataServer}Api/File/DownLoad?id=${rsp.data.id}&download=true&filename=${filename}`
            window.open(url, '_blank')
          } finally {
            this.aiCompareSpecPdfLoading = false
          }
        },
        refreshAiChecklistState() {
          const source = this.aiAnalysisModalTextWk ? this.aiAnalysisModalTextWk : this.aiAnalysisModalText
          const sections = this.parseAiSections(source)
          this.aiAnalysisChecklist = sections[5] ? this.parseAiChecklistState(sections[5]) : {}
        },
        async syncAiAnalysisFromMaster() {
          if (!await $msg.confirm(this.ui.csm_trn_confirm_reload_checklist)) {
            return
          }
          this.aiAnalysisChecklistSaving = true
          try {
            let rsp = await $xt.postServerJson('CSM/Data/SyncAiAnalysisFromMaster', {
              job_no: this.formData.job_no,
              itemno: this.aiAnalysisModalItemno
            })
            if (!rsp.success) {
              $msg.alert(this.ui.csm_v2_warning, rsp.error, `warning`)
              return
            }
            this.aiAnalysisModalTextWk = rsp.data.ai_analysis_result_wk
            this.refreshAiChecklistState()
          } finally {
            this.aiAnalysisChecklistSaving = false
          }
        },
        parseAiChecklistState(sectionText) {
          if (!sectionText) return {}
          const lines = sectionText.split(/\r\n|\n/).map(l => l.trim()).filter(l => l)
          const matches = lines.map(l => l.match(/^-\s*\[([ xX])\]\s*(.*)$/)).filter(Boolean)
          if (matches.length === 0) return {}
          const state = {}
          matches.forEach((m, i) => { state[i] = m[1].trim().toLowerCase() === 'x' })
          return state
        },
        async saveAiChecklistState() {
          const sec5 = this.aiEffectiveWorkerSection5
          if (!sec5) return true
          const checkedSteps = sec5.steps.map((_, i) => !!this.aiAnalysisChecklist[i])
          let rsp = await $xt.postServerJson('CSM/Data/UpdateAiAnalysisChecklist', {
            job_no: this.formData.job_no,
            itemno: this.aiAnalysisModalItemno,
            checked_steps: checkedSteps
          })
          if (!rsp.success) {
            $msg.alert(this.ui.csm_v2_warning, rsp.error, `warning`)
            return false
          }
          this.aiAnalysisModalTextWk = rsp.data.ai_analysis_result_wk
          this.refreshAiChecklistState()
          return true
        },
        async updateAiAnalysisChecklist() {
          this.aiAnalysisChecklistSaving = true
          try {
            await this.saveAiChecklistState()
          } finally {
            this.aiAnalysisChecklistSaving = false
          }
        },
        buildAiSectionList(text) {
          const sections = this.parseAiSections(text)
          const defs = [
            { num: 1, title: this.ui.csm_trn_ai_requestor_need, color: '#3c8dbc' },
            { num: 2, title: this.ui.csm_trn_ai_solution, color: '#12a86e' },
            { num: 3, title: this.ui.csm_trn_ai_method, color: '#7c3fc4' },
            { num: 4, title: this.ui.csm_trn_ai_risk, color: '#e3543f' },
            { num: 5, title: this.ui.csm_trn_ai_todo, color: '#f39c12' },
          ]
          return defs
            .filter(d => sections[d.num])
            .map(d => ({
              ...d,
              text: sections[d.num],
              steps: d.num === 5 ? this.splitAiSteps(sections[d.num]) : null
            }))
        },
        parseAiSections(text) {
          const result = {}
          if (!text) return result
          const tagRe = /^[#*_>\s]*\[SECTION([1-5])\][#*_\s]*$/gm
          const matches = []
          let m
          while ((m = tagRe.exec(text)) !== null) {
            matches.push({ num: parseInt(m[1], 10), start: m.index, end: m.index + m[0].length })
          }
          const endMatch = text.match(/^[#*_>\s]*\[END\][#*_\s]*$/m)
          const endIndex = endMatch ? text.indexOf(endMatch[0]) : -1
          matches.forEach((mm, i) => {
            let end = (i + 1 < matches.length) ? matches[i + 1].start : text.length
            if (endIndex >= 0 && endIndex >= mm.end && endIndex < end) end = endIndex
            if (!(mm.num in result)) result[mm.num] = text.substring(mm.end, end).trim()
          })
          return result
        },
        splitAiSteps(text) {
          if (!text) return []
          // แบ่งตามย่อหน้า (คั่นด้วยบรรทัดว่าง) ก่อน เพื่อให้แต่ละ Test Case ที่ AI เขียนหลายบรรทัด
          // กลายเป็น 1 รายการที่ข้อมูลครบ ไม่ถูกตัดขาดเป็นเสี่ยงๆ แบบแบ่งทีละบรรทัด
          let items = text.trim().split(/\r?\n\s*\r?\n/)
            .map(p => p.trim().replace(/\s*\r?\n\s*/g, ' ').trim())
            .filter(p => p)
          if (items.length <= 1) {
            items = text.split(/\r\n|\n/)
              .map(l => l.trim().replace(/^(?:-\s*\[[ xX]\]|[-•*]|\d+[.)])\s*/, '').trim())
              .filter(l => l)
            if (items.length <= 1) {
              items = text.split(/\.\s+/).map(l => l.trim()).filter(l => l.length > 3)
            }
          }
          // บางครั้ง AI เขียนหลายขั้นตอนอัดรวมในย่อหน้าเดียว แต่มีเลขกำกับฝังอยู่ข้างใน (เช่น "1. ... 2. ... 3. ...")
          // ให้แตกย่อยตามเลขกำกับนั้นอีกชั้น เพื่อไม่ให้หลายขั้นตอนกลายเป็น 1 รายการก้อนใหญ่
          items = items.flatMap(item => {
            const parts = item.split(/(?=\d+[.)]\s)/).map(p => p.trim()).filter(p => p)
            return parts.length > 1 ? parts : [item]
          })
          return items.slice(0, 30)
        },
        difficultyStyle(level) {
          const lv = Number(level)
          if (lv <= 2) return { bg: '#eafaf1', text: '#00a65a', border: '#c8f0da', label: this.ui.csm_trn_difficulty_easy }
          if (lv === 3) return { bg: '#fef5e7', text: '#b9770e', border: '#fbe4b4', label: this.ui.csm_trn_difficulty_medium }
          if (lv === 4) return { bg: '#fdedec', text: '#c0392b', border: '#f5c6c0', label: this.ui.csm_trn_difficulty_hard }
          return { bg: '#fdedec', text: '#922b21', border: '#f5b7b1', label: this.ui.csm_trn_difficulty_very_hard }
        },
        formatThaiDate(date) {
          return date ? moment(date).format('DD/MM/YYYY') : ''
        },
        async generateAiAnalysisPdf() {
          if (!this.aiAnalysisModalItemno) return
          this.aiAnalysisPdfLoading = true
          try {
            if (this.isMango && this.canEditAiChecklist) {
              const saved = await this.saveAiChecklistState()
              if (!saved) return
            }
            let rsp = await $xt.postServerJson('CSM/Data/GenerateAiAnalysisPdf', { job_no: this.formData.job_no, itemno: this.aiAnalysisModalItemno })
            if (!rsp.success) {
              $msg.alert(this.ui.csm_v2_warning, rsp.error, `warning`)
              return
            }
            let filename = encodeURIComponent(rsp.data.filename || 'AI_Analysis.pdf')
            let url = `${dataServer}Api/File/DownLoad?id=${rsp.data.id}&download=true&filename=${filename}`
            window.open(url, '_blank')
          } finally {
            this.aiAnalysisPdfLoading = false
          }
        },
        async confirmExcelSaveChoice() {
          const canSave = this.canSaveAiExcel
          return new Promise((resolve) => {
            $.confirm({
              title: false,
              content: `
                <div class="ai-excel-confirm">
                  <style>
                    .ai-excel-confirm { text-align:center; padding:4px 4px 2px; }
                    .ai-excel-confirm .icon-badge { width:60px; height:60px; border-radius:50%; background:#eafaf3; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }
                    .ai-excel-confirm .icon-badge i { font-size:28px; color:#12a86e; }
                    .ai-excel-confirm .title { font-size:17px; font-weight:700; color:#333; margin-bottom:6px; }
                    .ai-excel-confirm .subtitle { font-size:14px; color:#888; margin-bottom:20px; }
                    .ai-excel-confirm .btn-choice { display:block; width:100%; padding:12px; margin-bottom:10px; border-radius:8px; font-weight:600; font-size:14px; cursor:pointer; transition:opacity .15s; }
                    .ai-excel-confirm .btn-choice:last-child { margin-bottom:0; }
                    .ai-excel-confirm .btn-choice:hover { opacity:.85; }
                    .ai-excel-confirm .btn-download { background:#fff; color:#444; border:1px solid #d5dbe0; }
                    .ai-excel-confirm .btn-save { background:#12a86e; color:#fff; border:none; }
                  </style>
                  <div class="icon-badge"><i class="fas fa-file-excel"></i></div>
                  <div class="title">${this.ui.csm_trn_create_excel}</div>
                  <div class="subtitle">${this.ui.csm_trn_choose_action}</div>
                  <button type="button" class="btn-choice btn-download"><i class="fas fa-download" style="margin-right:6px;"></i>${this.ui.csm_trn_download_excel}</button>
                  ${canSave ? `<button type="button" class="btn-choice btn-save"><i class="fas fa-save" style="margin-right:6px;"></i>${this.ui.csm_trn_save_download_excel}</button>` : ''}
                </div>
              `,
              theme: 'material',
              animation: 'opacity',
              closeAnimation: 'opacity',
              animateFromElement: false,
              useBootstrap: false,
              boxWidth: '420px',
              buttons: false,
              onContentReady: function () {
                const jc = this
                this.$content.find('.btn-download').on('click', function () { resolve('download'); jc.close() })
                if (canSave) {
                  this.$content.find('.btn-save').on('click', function () { resolve('save'); jc.close() })
                }
              },
              onClose: function () { resolve(null) }
            })
          })
        },
        async generateAiAnalysisChecklistExcel() {
          if (!this.aiAnalysisModalItemno) return
          const choice = await this.confirmExcelSaveChoice()
          if (!choice) return
          this.aiAnalysisExcelLoading = true
          try {
            if (this.isMango && this.canEditAiChecklist) {
              const saved = await this.saveAiChecklistState()
              if (!saved) return
            }
            let rsp = await $xt.postServerJson('CSM/Data/GenerateAiAnalysisChecklistExcel', { job_no: this.formData.job_no, itemno: this.aiAnalysisModalItemno, save_attachment: choice === 'save' })
            if (!rsp.success) {
              $msg.alert(this.ui.csm_v2_warning, rsp.error, `warning`)
              return
            }
            let filename = encodeURIComponent(rsp.data.filename || 'AI_Checklist.xlsx')
            let url = `${dataServer}Api/File/DownLoad?id=${rsp.data.id}&download=true&filename=${filename}`
            window.open(url, '_blank')
          } finally {
            this.aiAnalysisExcelLoading = false
          }
        },
        onWorkersUpdated(data) {
          console.log('ได้ worker list มาแล้ว', data);
          this.receivedWorkers = data;
        },
        async openProjectPpnEmpty() {
          if (this.isMango) {
            let url = `CSM/Data/is_emp_ppn?emp=${encodeURIComponent(this.auth.empno)}`
            let resp = await $xt.getServer(url)
            let form = resp
            if (!$xt.isEmpty(form.pre_event_ppn)) {
              this.ppnEmpno = form.empno
              await this.retrievePlanWhenAcceptJob()
              this.$refs.select_plan.setSize('modal-s');
              this.$refs.select_plan.openModal()
              return;
            }
            else {
              $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_alert_no_project_plan, `warning`)
              return;
            }
          }
        },
        isMyRefWorker() {
        //  console.log('this.allWorkersLocal---', this.receivedWorkers, 'fdf', this.editDetailData.itemno)
          return this.receivedWorkers.some(w => w.reftask === this.editDetailData.itemno && w.empno === this.auth.empno) || false;
        },
        canEditAiChecklist() {
          return this.formData.assign_empno === this.auth.empno
            || this.aiAnalysisModalAssignEmpno === this.auth.empno
            || this.receivedWorkers.some(w => w.reftask === this.aiAnalysisModalItemno && w.empno === this.auth.empno);
        },
        canSaveAiExcel() {
          return this.formData.assign_empno === this.auth.empno
            || this.aiAnalysisModalAssignEmpno === this.auth.empno;
        },
        isUserInWorkers(empno) {
          if (this.isMango) {
            if (!this.receivedWorkers || !this.editDetailData) return false;
            const result = this.receivedWorkers.some(worker => { return worker.reftask === this.editDetailData.itemno && worker.empno === empno; });
            return result;
          }
          return;
        },
        async is_SA() {
          if (!this.isMango) {
            return;
          }

          try {
            let comment = {
              job_no: this.formData.job_no,
              ref_itemno: this.editDetailData.itemno,
              itemno: null,
              description: this.commentText || '',
              edit: false,
              add_user: this.auth.user_id,
              add_dt: new Date()
            }
            let gf = {
              form: this.editDetailData,
              comment: $xt.isEmpty(this.commentText) ? null : comment,
              arr_comment: $linq(this.showComment()).where(x => x.edit == true).toArray(),
              attachfile: this.attachmentData,
            }
            console.log(gf)

            page.loadingBox.show()

            let act = `CSM/Data/CSM_UpdatSA`
            let rsp = await $xt.postServerJson(act, gf)

            if (!rsp.success) {
              throw rsp.error
            }

            if (rsp.success) {
              await this.loadData(rsp.data.job_no)
              this.$refs.document_details.$refs.job_detail.$refs.comment.clearComment();
              $notify.success(this.ui.alert_save_success)
              this.$refs.document_details.$refs.job_detail.$refs.modalEditTask.closeModal();
            } else {
              this.isView = false
            }

          } catch (ex) {
            $msg.alert(``, ex.toString(), typeof ex === 'string' ? 'warning' : 'danger')
          } finally {
            page.loadingBox.hide()
          }
        },
        async PG_ReadList() {
          let act = `CSM/Master/PG_list`
          let rsp = await $xt.getServer(act)
          this.program_list = rsp.data
          console.log(this.program_list,'pg')
        },
        Similar_case() {
          this.$refs.modalSimilarCase.setSize('modal-xl')
          this.$refs.modalSimilarCase.openModal()
        },
        openAddSpecSimilar() {
          this.$refs.ct_addspec_sc.openModal()
        },
        clearAddSpecSimilar() {
          this.scSpecName = ''
          this.scSpecData = null
        },
        addSpecSimilarSelected(e) {
          if (!e) return
          let item = Array.isArray(e) ? e[0] : e
          if (!item) return
          this.scSpecName = item.object_name || ''
          this.scSpecData = item
        },
        onSimilarAttachChange(e) {
          let files = Array.from(e.target.files || [])
          this.scAttachFiles = [...this.scAttachFiles, ...files]
          if (this.$refs.scFileInput) this.$refs.scFileInput.value = ''
        },
        async analyzeSimilarCases() {
          if (!this.scSpecData) {
            $msg.alert('', this.ui.csm_trn_req_addspec_name, 'warning')
            return
          }
          this.scAnalyzeLoading = true
          this.scResults = []
          this.scAnalysis = null
          try {
            let fd = new FormData()
            fd.append('file_name', this.scSpecData.object_name || '')
            fd.append('module_name', this.scSpecData.module || '')
            fd.append('details', this.scFilter || '')
            this.scAttachFiles.forEach(f => fd.append('attachments', f))
            let rsp = await $xt.postServerForm('CSM/Data/SimilarCaseAnalyze', fd)
            if (!rsp.success) throw rsp.error
            this.scResults = rsp.data.similar_cases || []
            this.scAnalysis = rsp.data.analysis_text
              || (rsp.data.analysis && rsp.data.analysis.prediction ? rsp.data.analysis.prediction : null)
              || null
          } catch (ex) {
            $msg.alert(this.ui.csm_v2_warning, ex.toString(), 'warning')
          } finally {
            this.scAnalyzeLoading = false
          }
        },
        async generateSimilarCasePdf() {
          if (!this.scAnalysis) return
          this.scPdfLoading = true
          try {
            let rsp = await $xt.postServerJson('CSM/Data/GenerateSimilarCasePdf', {
              job_no: this.formData.job_no || '',
              spec_name: this.scSpecData ? (this.scSpecData.object_name || '') : '',
              module_name: this.scSpecData ? (this.scSpecData.module || '') : '',
              analysis_text: this.scAnalysis || '',
              similar_cases: this.scResults || [],
            })
            if (!rsp.success) throw rsp.error
            let filename = encodeURIComponent(rsp.data.filename || 'SimilarCase.pdf')
            window.open(`${dataServer}Api/File/DownLoad?id=${rsp.data.id}&download=true&filename=${filename}`, '_blank')
          } catch (ex) {
            $msg.alert(this.ui.csm_v2_warning, ex.toString(), 'warning')
          } finally {
            this.scPdfLoading = false
          }
        },
      },
      computed: {
        ...mapState(['connectionCodeData', 'requestCodeData', 'priorityCodeData', 'serviceCodeData', 'configData', 'config', 'activeconfig', 'configReadlist','send_test_bug']),
        isMango() {
          return $linq(this.configData).where(x => x.config_id == 'TRN0001').select(x => x.config_value).firstOrDefault() == 'Y'
        },
        approveFormOptions() {
          return (this.approveHeaderData || []).map(x => ({
            id: x.formcode,
            text: x.form_name
          }))
        },
        aiAnalysisSectionList() {
          return this.buildAiSectionList(this.aiAnalysisModalText)
        },
        aiAnalysisWkSectionList() {
          return this.buildAiSectionList(this.aiAnalysisModalTextWk)
        },
        aiEffectiveWorkerSection5() {
          const list = this.aiAnalysisModalTextWk ? this.aiAnalysisWkSectionList : this.aiAnalysisSectionList
          return list.find(s => s.num === 5) || null
        },
        analysisBlocks() {
          if (!this.scAnalysis) return []
          const defs = [
            { marker: '🔍', key: 'verdict', label: this.ui.csm_trn_ai_verdict },
            { marker: '📑', key: 'link',    label: this.ui.csm_trn_ai_link },
            { marker: '💡', key: 'cause',   label: this.ui.csm_trn_ai_cause },
            { marker: '🔄', key: 'freq',    label: this.ui.csm_trn_ai_freq },
            { marker: '🛠', key: 'action',  label: this.ui.csm_trn_ai_action },
          ]
          const text = this.scAnalysis
          const positions = []
          defs.forEach(d => {
            const idx = text.indexOf(d.marker)
            if (idx !== -1) positions.push({ ...d, idx })
          })
          if (!positions.length) return []
          positions.sort((a, b) => a.idx - b.idx)
          return positions.map((pos, i) => {
            const start = pos.idx
            const end = i + 1 < positions.length ? positions[i + 1].idx : text.length
            const chunk = text.slice(start, end).trim()
            const nl = chunk.indexOf('\n')
            const firstLine = nl === -1 ? chunk : chunk.slice(0, nl)
            const body = nl === -1 ? '' : chunk.slice(nl + 1).trim()
            const colon = firstLine.indexOf(':')
            const inlineVal = colon !== -1 ? firstLine.slice(colon + 1).trim().replace(/\*/g, '') : ''
            const content = (inlineVal + (body ? (inlineVal ? '\n' : '') + body : '')).trim().replace(/\*\*/g, '')
            return { key: pos.key, label: pos.label, icon: pos.marker, content }
          })
        },
      },
      async mounted() {
        page = this.$refs.page
        page.pageTitle = 'Open Requirement'
        document.title = page.pageTitle
        appForm = this.$refs.appForm
        this.formData.job_date = moment()
        this.formData.request_empno = this.auth.empno
        this.formData.request_empno_tmp = this.auth.empno
        this.formData.assign_empno_tmp = this.auth.empno
        this.formData.connection_type = ''
        this.formData.description_select = ''
        this.formData.assign_dpt = ''
        this.isAdmin = page.isAdmin()
        this.formData.contract_by_cust = 'Y'
        this.$nextTick(() => {
          $(window).resize(() => {
            $('#tabContent').css({ 'max-height': ($(window).height() - 120) + 'px' })
            $('#tableFixed').css({ 'max-height': ($(window).height() - 50) + 'px' })
          })
          $(window).trigger('resize')
          $('.content-body').css('overflow-y', 'hidden')
        })
        descPaging = this.$refs.descModal1.$refs.descPaging
        descPaging.setCurrentPage(1)
        descPaging.setItemsPerPage(10)
        let ref_customer = localStorage.getItem('X-Customer-CSM')
        if (ref_customer != null || ref_customer != undefined) {
          let p = JSON.parse(ref_customer)
          this.formData.customer_code = p.customer_code
          this.formData.customer_name = p.name_th
          localStorage.removeItem('X-Customer-CSM')
        }
        let ref_panel_customer = localStorage.getItem('X-Custome-Panel-CSM')
        if (ref_panel_customer != null || ref_panel_customer != undefined) {
          let p = JSON.parse(ref_panel_customer)
          this.formData.pre_event = p.pre_event
          this.formData.pre_event2 = p.pre_event2
          this.formData.pre_des = p.project
          this.formData.customer_code = p.customer_code
          this.formData.customer_name = p.name_th
          this.formData.contract_user = p.name_th
          this.formData.phone = p.tel
          this.formData.email = p.mail
          // await this.$refs.document_details.$refs.document_detail_assignment.loadHistory()
          this.$eventBus.$emit('reload-history')
          if (!this.isMango) {
            await this.loadArea()
            await this.loadSupplierWarranty()
            await this.loadCustomerWarranty()
          }
          localStorage.removeItem('X-Custome-Panel-CSM')
        }
        let ref_draft_csm = localStorage.getItem('X-Customer-Draft')
        if (ref_draft_csm != null || ref_draft_csm != undefined) {
          let p = JSON.parse(ref_draft_csm)
          // $msg.alert(``, ref_draft_csm.toString(), `danger`)
          this.formData = p.formData
          this.formData.pre_des = p.formData.pre_des

          this.detailData = p.detailData
          this.attachmentData = p.attachmentData
          this.statusDLine = 'H'
          
          this.detailData.length > 1 ? this.formData['subject'] = '' : this.formData.subject
          if (p.detailData.length > 0) {
            this.storeMapLocation = {
              map_desc: p.detailData[0].map_desc,
              map_gps: p.detailData[0].map_gps,
              map_url: p.detailData[0].map_url
            };
          }
          if (!this.isMango) {
            if($xt.isEmpty(this.editDetailData.module)){
              this.editDetailData.module = ''
            } else {
              await this.loadArea()
              await this.loadSupplierWarranty()
              await this.loadCustomerWarranty()
            }
          }
          await this.loadArea()
          localStorage.removeItem('X-Customer-Draft')
        }
        if (!this.isMango) {
          await this.loadSubData()
        }
        if (this.isMango) {
          await this.PG_ReadList()
        }
        /*   load data */
        if (!$xt.isEmpty(this.queryString.job_no)) {
          await this.loadData(this.queryString.job_no)
        }
        else {
          let url = `CSM/Center/Employee_GetData?empno=${this.auth.empno}`
          let resp = await $xt.getServer(url)
          if (resp.data) {
            this.formData.request_empno_name = resp.data.name
            this.formData.request_empno_email = resp.data.email
            this.formData.request_empno_emptel = resp.data.emptel
            this.formData.request_empno_empmob = resp.data.empmob
          }
        }

        // ตรวจสอบข้อมูลจาก PreCase
        let ref_precase_data = localStorage.getItem('X-CSM-PreCase-Data')
        if (!$xt.isEmpty(ref_precase_data)) {
          let p = JSON.parse(ref_precase_data)
          this.formData = p.formData
          this.detailData = p.detailData
          this.attachmentData = p.attachmentData  
          

          // โหลดข้อมูลลูกค้าต่อให้เอง เหมือนตอนเลือกลูกค้าจาก modal
          if (!$xt.isEmpty(this.formData.customer_code)) {
            if (this.isMango) { await this.loadCheckWarranty(this.formData.customer_code) }
            await this.setContractData(this.formData.customer_code)
            if (this.isMango) { await this.setUpdateSW(this.formData.customer_code) }
          }

          $notify.success(this.ui.csm_trn_precase_loaded)

          localStorage.removeItem('X-CSM-PreCase-Data')
        }

        this.newModuleForMango = $linq(this.moduleForMango).select(s => {
          return {
            id: s,
            text: s
          }
        }).toArray()
        this.newPlatformCodeData = $linq(this.platformCodeData).select(s => {
          return {
            id: s.id,
            text: s.name
          }
        }).toArray()
        this.newRequestCodeData = $linq(this.requestCodeData).select(s => {
          return {
            id: s.req_code,
            text: s.req_des
          }
        }).toArray()
        await this.loadActiveConfig()
        await this.setJobPriority()
        this.isSoftwareTester = await this.emp_is_software_tester()
       //setInterval(() => {
       //  if  (this.editExt == false)
       //  {
       //   let job_no = $linq(this.data_).select((x) => x.job_no).firstOrDefault();
       //   let reqno = $linq(this.data_).select((x) => x.reqno).firstOrDefault();
       //   this.showCommentExt(job_no, reqno);
       //  }
       // }, 10000);
        this.$eventBus.$on('trigger-search-warranty', this.handleSearchWarranty);
        this.$eventBus.$on('open-calendar-modal', this.openCalenderModal);
        this.$eventBus.$on('update-worker-task', this.onWorkersUpdated);
      },
      beforeUnmount() {
        this.$eventBus.$off('trigger-search-warranty', this.handleSearchWarranty);
        this.$eventBus.$off('open-calendar-modal', this.openCalenderModal);
        this.$eventBus.$off('update-worker-task', this.onWorkersUpdated);
        $('.content-body').css('overflow-y', '')
      },
    }
  </script>
  <style scoped>
    thead tr:nth-child(2) th {
      position: -webkit-sticky;
      position: sticky;
      top: 31.5px !important;
      z-index: 50;
    }
    .nav-tabs-custom .nav-tabs {
      position: sticky;
      top: 0;
      background: white;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
      z-index:99;
    }
    .pointer {
      cursor: pointer;
    }
    #tabContent {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    #tabContent::-webkit-scrollbar {
      display: none;
    }
    .pointer:hover {
        background-color: #aebee9;
      }

    /* ── Dark Mode ── */
    body.dark-mode .nav-tabs-custom .nav-tabs {
      background: #152030 !important;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.4) !important;
    }

    body.dark-mode .pointer:hover {
      background-color: #2d4057 !important;
    }

    /* PPN / Plan badges ที่ใช้ inline style yellow/lightgreen */
    body.dark-mode span[style*="background-color: yellow"] {
      background-color: #5a4a00 !important;
      color: #fde68a !important;
    }

    body.dark-mode span[style*="background-color: lightgreen"] {
      background-color: #1a3d22 !important;
      color: #86efac !important;
    }

    /* Select Plan modal cards – dark mode */
    body.dark-mode .select-plan-card {
      background: #1e2d3d !important;
      border-color: #2d4057 !important;
      color: #cdd9e5 !important;
    }

    body.dark-mode .select-plan-card:hover {
      background: #243447 !important;
    }

    /* Change Detail Task modal cards – dark mode */
    body.dark-mode .change-task-card {
      background: #1a2535 !important;
      border-color: #2d4057 !important;
    }

    body.dark-mode .change-task-card-header {
      background: #152030 !important;
      border-color: #2d4057 !important;
    }

    body.dark-mode .change-task-worker-box {
      background: #1e2d3d !important;
      border-color: #2d4057 !important;
      color: #cdd9e5 !important;
    }

    /* ── Sidenav Tiles ── */
    .snav-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 4px 2px; }
    .snav-tile { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 6px 12px; border-radius: 12px; background: #fff; border: 1px solid #e8ecf0; box-shadow: 0 1px 3px rgba(0,0,0,.06); cursor: pointer; transition: box-shadow .15s, border-color .15s, transform .12s; user-select: none; }
    .snav-tile:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); border-color: #c8d3de; transform: translateY(-2px); }
    .snav-tile:active { transform: translateY(0); box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .snav-tile svg { flex-shrink: 0; }
    .snav-label { font-size: 10px; font-weight: 700; color: #374151; text-align: center; line-height: 1.45; letter-spacing: .01em; }

    /* ── Similar Case Modal ── */
    .sc-wrap { padding: 2px 0; }
    .sc-panel { background: #fafbff; border: 1px solid #e3e8f0; border-radius: 8px; padding: 16px; }
    .sc-panel__head { display: flex; align-items: center; gap: 7px; font-size: 10px; font-weight: 700; color: #4f6ef7; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #e8ecf5; }
    .sc-field { margin-bottom: 12px; }
    .sc-label { display: block; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 5px; }
    .sc-field-action { margin-top: 16px; text-align: center; }
    .sc-jobno-badge { display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 5px; padding: 4px 12px; font-weight: 700; font-size: 13px; font-family: 'Courier New', monospace; }
    .sc-attach-zone { border: 1px dashed #c8d3e0; border-radius: 6px; padding: 8px 10px; background: #fff; }
    .sc-attach-trigger { cursor: pointer; display: inline-flex; align-items: center; gap: 5px; margin: 0; padding: 3px 10px; background: #f0f4ff; color: #4f6ef7; border: 1px solid #c7d2fe; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: .03em; }
    .sc-attach-trigger:hover { background: #e0e7ff; }
    .sc-attach-row { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #475569; padding: 3px 0; border-top: 1px solid #f1f5f9; margin-top: 4px; }
    .sc-attach-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sc-attach-del { cursor: pointer; color: #ef4444; flex-shrink: 0; }
    .sc-attach-empty { font-size: 11px; color: #94a3b8; padding: 4px 0; }
    .sc-btn-analyze { display: inline-flex; align-items: center; gap: 8px; padding: 8px 22px; background: linear-gradient(135deg,#0e1623,#1a2d4a); color: #22d3ee; border: 1px solid rgba(34,211,238,.4); border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: .04em; cursor: pointer; transition: background .2s,box-shadow .2s; }
    .sc-btn-analyze:not(:disabled):hover { background: linear-gradient(135deg,#152035,#1e3654); box-shadow: 0 0 14px rgba(34,211,238,.25); }
    .sc-btn-analyze:disabled { opacity: .45; cursor: not-allowed; }

    .sc-panel--dark { background: #0e1623; border: 1px solid rgba(34,211,238,.2); border-radius: 8px; padding: 14px; min-height: 280px; display: flex; flex-direction: column; }
    .sc-panel__head--dark { display: flex; align-items: center; gap: 7px; font-size: 10px; font-weight: 700; color: #22d3ee; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(34,211,238,.15); }
    .sc-ph-dot { width: 6px; height: 6px; border-radius: 50%; background: #22d3ee; display: inline-block; }
    .sc-badge-count { margin-left: auto; background: rgba(34,211,238,.15); color: #22d3ee; border-radius: 10px; padding: 1px 8px; font-size: 9px; }
    .sc-dark-body { flex: 1; overflow-y: auto; }
    .sc-dark-label { font-size: 9px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 8px; }

    .sc-tl-section { margin-bottom: 12px; }
    .sc-timeline { padding-left: 2px; }
    .sc-tl-row { display: flex; gap: 10px; align-items: flex-start; }
    .sc-tl-track { display: flex; flex-direction: column; align-items: center; width: 14px; flex-shrink: 0; padding-top: 5px; }
    .sc-tl-dot { width: 7px; height: 7px; border-radius: 50%; border: 1.5px solid #f59e0b; background: #0e1623; flex-shrink: 0; }
    .sc-tl-line { flex: 1; width: 1px; background: linear-gradient(to bottom, rgba(245,158,11,.4), rgba(245,158,11,.06)); min-height: 18px; margin-top: 3px; }
    .sc-tl-info { display: flex; align-items: baseline; gap: 10px; padding: 2px 0 6px; flex: 1; }
    .sc-tl-no { font-family: 'Courier New', Courier, monospace; font-size: 11.5px; font-weight: 700; color: #f59e0b; letter-spacing: .02em; }
    .sc-tl-date { font-size: 10px; color: #334155; font-variant-numeric: tabular-nums; }

    .sc-report { }
    .sc-rblock { border-radius: 4px; border-left: 2px solid; padding: 7px 10px 8px; margin-bottom: 5px; background: #111d2e; }
    .sc-rblock--verdict { border-color: #22d3ee; }
    .sc-rblock--link    { border-color: #fbbf24; }
    .sc-rblock--cause   { border-color: #fb7185; }
    .sc-rblock--freq    { border-color: #a78bfa; }
    .sc-rblock--action  { border-color: #34d399; }
    .sc-rblock__head { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; }
    .sc-rblock__icon { font-size: 12px; line-height: 1; }
    .sc-rblock__title { font-size: 9px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .09em; }
    .sc-rblock__body { font-size: 11.5px; color: #7a8fa6; line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
    .sc-rblock--verdict .sc-rblock__body { color: #67e8f9; font-weight: 600; font-size: 12px; }
    .sc-rblock--action  .sc-rblock__body { color: #6ee7b7; }
    .sc-rblock--cause   .sc-rblock__body { color: #fda4af; }
    .sc-rblock--freq    .sc-rblock__body { color: #c4b5fd; }

    .sc-no-result { display: flex; align-items: flex-start; gap: 10px; background: #1a1200; border: 1px solid rgba(245,158,11,.25); border-radius: 6px; padding: 12px 14px; margin-bottom: 8px; }
    .sc-no-result i { color: #f59e0b; font-size: 15px; flex-shrink: 0; margin-top: 1px; }
    .sc-no-result span { font-size: 12px; color: #d97706; line-height: 1.6; white-space: pre-wrap; }
    .sc-raw-text { font-size: 11.5px; color: #475569; white-space: pre-wrap; line-height: 1.65; background: #111d2e; border-radius: 4px; padding: 10px 12px; }
    .sc-empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
    .sc-empty-hex { font-size: 34px; color: #1c2e42; margin-bottom: 10px; line-height: 1; }
    .sc-empty-text { font-size: 12px; font-weight: 600; color: #3d5a7a; text-align: center; }
    .sc-empty-hint { font-size: 10.5px; color: #2a4560; margin-top: 5px; text-align: center; letter-spacing: .03em; }
    .sc-footer-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }

  </style>

<style>
  @import './CSS/trn001-responsive.css';
</style>
