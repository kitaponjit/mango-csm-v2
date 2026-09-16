<template>
  <div>
    <div class="row" style="margin-bottom: 15px;">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="modern-status-bar" v-bind:class="statusClass('callout-', editDetailData['status_tmp'])">
          <span class="status-icon"><i class="fas fa-circle"></i></span>
          <span class="status-label">{{ ui.csm_trn_current_tasks_status }}</span>
          <span class="status-badge-pill">{{statusName(editDetailData['status_tmp'])}}</span>
        </div>
      </div>
    </div>
    <div class="row" id="task_detail" ref="task_detail">
      <!-- Start : Template for Mango -->
      <template v-if="isMango">
        <div class="col-md-12 mango-task-form" :class="{ 'mtf-narrow': isNarrow }">

          <!-- ═══ CARD 1 : Task Information ═══ -->
          <div class="panel-group" id="accordionTaskInfo" role="tablist" aria-multiselectable="true">
            <div class="info-card accordion-card">
              <div role="tab" id="headingTaskInfo">
                <a role="button" data-toggle="collapse" data-parent="#accordionTaskInfo" href="#collapseTaskInfo" aria-expanded="true" aria-controls="collapseTaskInfo" class="info-card-header accordion-toggle" :class="{'is-open': taskInfoOpen}" @click="taskInfoOpen = !taskInfoOpen">
                  <i class="fas fa-clipboard-list"></i>
                  <span>{{ ui.csm_trn_job_info }}</span>
                  <span class="accordion-toggle-icon"><i class="fas fa-chevron-down"></i></span>
                </a>
              </div>
              <div id="collapseTaskInfo" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingTaskInfo">
            <div class="info-card-body">
              <fieldset v-bind:disabled="((formData.request_empno != auth.empno && formData.assign_empno != auth.empno) ||
                          (formData.job_status != 'W' && editDetailData.status != 'W') || editDetailData.status == 'Y' || isView) && !isAdmin">

                <!-- Row 1: Service Type / Module / Platform / Req.Type / Job Type / Type Program -->
                <div class="row">
                  <div class="col-md-2 col-sm-4 col-xs-6">
                    <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.item_type)}">
                      <label class="text-danger" v-text="ui.csm_trn_field_service_type" ref="item_type"></label>
                      <vue-select-2 :options="service_group_select2x"
                                    :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                    v-model="editDetailData.item_type"
                                    :disabled="formData.job_status == 'I' && !isAdmin"
                                    @change="itemTypeChange();AlertCheckUpSW()">
                      </vue-select-2>
                    </div>
                  </div>
                  <div class="col-md-2 col-sm-4 col-xs-6">
                    <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.module)}">
                      <label :class="activeconfig.TRN001H === 'Y' ? 'text-danger' : ''" v-text="ui.module || 'Module'"></label>
                      <vue-select-2 :options="newModuleForMango"
                                    :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                    v-model="editDetailData.module"
                                    @change="moduleChange">
                      </vue-select-2>
                    </div>
                  </div>
                  <div class="col-md-2 col-sm-4 col-xs-6">
                    <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.platform)}">
                      <label :class="activeconfig.TRN001J === 'Y' ? 'text-danger' : ''" v-text="ui.csm_trn_field_platform"></label>
                      <vue-select-2 :options="newPlatformCodeData"
                                    :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                    v-model="editDetailData.platform">
                      </vue-select-2>
                    </div>
                  </div>
                  <div class="col-md-2 col-sm-4 col-xs-6">
                    <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.req_type)}">
                      <label :class="activeconfig.TRN001I === 'Y' ? 'text-danger' : ''" v-text="ui.csm_trn_field_req_type"></label>
                      <vue-select-2 :options="newRequestCodeData"
                                    :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                    v-model="editDetailData.req_type">
                      </vue-select-2>
                    </div>
                  </div>
                  <div class="col-md-2 col-sm-4 col-xs-6">
                    <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.object_type)}">
                      <label :class="activeconfig.TRN001K === 'Y' || ['11'].includes(editDetailData['item_type']) ? 'text-danger' : ''" v-text="ui.re_job_type || 'Job Type'"></label>
                      <vue-select-2 :options="filterJobType()"
                                    :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                    :disabled="formData.job_status && !['H', 'W'].includes(formData.job_status) && ['11'].includes(editDetailData['item_type'])"
                                    v-model="editDetailData.object_type">
                      </vue-select-2>
                    </div>
                  </div>
                  <div class="col-md-2 col-sm-4 col-xs-6" v-if=" (formData.assign_empno == auth.empno || editDetailData.assign_empno == auth.empno || editDetailData.tester_empno == auth.empno ||isMyWorker)">
                    <div class="form-group">
                      <label>{{ ui.csm_trn_type_program }}</label>
                      <input type="text" class="form-control input-sm" :value="editDetailData.pg_name" disabled />
                    </div>
                  </div>
                </div>

                <!-- Row 2 (item_type=11): Update DateTime / Website URL -->
                <div class="row" v-if="['11'].includes(editDetailData['item_type'])">
                  <div class="col-md-2 col-sm-4 col-xs-6">
                    <div class="form-group">
                      <label v-text="'Update Date Time'" class="text-danger"></label>
                      <datepicker input-class="form-control input-sm" :disabled="formData.job_status && !['H', 'W'].includes(formData.job_status)" type="datetime" format="DD/MM/YYYY HH:mm" v-model.trim="editDetailData['upd_software_dt']"></datepicker>
                    </div>
                  </div>
                  <div class="col-md-6 col-sm-8 col-xs-12">
                    <div class="form-group">
                      <label :class="['WIN', 'MOB'].includes(editDetailData.platform) ? '' : 'text-danger'">{{ ui.csm_trn_field_website_url }}</label>
                      <input type="text" class="form-control input-sm" v-model.trim="editDetailData['website_url']" maxlength="500" :disabled="formData.job_status && !['H', 'W'].includes(formData.job_status)" />
                    </div>
                  </div>
                </div>

                <!-- Warnings -->
                <div class="row" v-show="!formData['dpt_no'] && !isView && formData['request_empno'] == auth.empno">
                  <div class="col-md-10">
                    <div class="callout callout-warning" style="margin-bottom:10px;">
                      <strong>{{ ui.csm_v2_warning }}</strong> {{ ui.csm_trn_warn_subject_public }}
                    </div>
                  </div>
                </div>
                <div class="row" v-show="editDetailData['item_type']=='25' && !isView && formData['request_empno'] == auth.empno">
                  <div class="col-md-10">
                    <div class="callout callout-warning" style="margin-bottom:10px;">
                      <strong>{{ ui.csm_v2_warning }} :</strong> {{ ui.csm_trn_warn_copy_db_form }}
                    </div>
                  </div>
                </div>
                <!-- Subject -->
                <div class="row">
                  <div class="col-md-10 col-sm-12">
                    <div class="form-group">
                      <div class="fld-head">
                        <label :class="activeconfig.TRN001L === 'Y' ? 'text-danger' : ''" v-text="ui.csm_v2_subject"></label>
                        <span class="fld-hint">{{xt.textLength(editDetailData['subject'], 100)}} {{ ui.csm_trn_characters }}</span>
                      </div>
                      <div class="input-group">
                        <input type="text" class="form-control input-sm" v-model="editDetailData['subject']" maxlength="100" />
                        <span class="input-group-btn"><a class="btn btn-sm bg-navy" @click="openDescModal1('description2')"><i class="fa fa-search"></i></a></span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Detail -->
                <div class="row">
                  <div class="col-md-10 col-sm-12">
                    <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.detail)}">
                      <label :class="activeconfig.TRN001M === 'Y' ? 'text-danger' : ''" v-text="ui.csm_v2_description"></label>
                      <textarea class="form-control input-sm" rows="4" v-model.trim="editDetailData['detail']"></textarea>
                    </div>
                  </div>
                </div>

                <!-- Revision Bug (item_type 03/22) + Contract Type + Ticket No. -->
                <div class="fld-row">
                  <div class="form-group fld-2x" v-show="send_test_bug.some(s => s.code_s_bug === editDetailData['item_type'])">
                    <div class="fld-head">
                      <label :class="{'text-danger': formData['request_empno'] == auth.empno}">{{ ui.csm_trn_revision_bug_label }}</label>
                      <span class="fld-hint">{{ ui.csm_trn_number_only }}</span>
                    </div>
                    <input type="text" class="form-control input-sm" v-model.trim="editDetailData['revision_bug']" @keypress="numericOnly" v-bind:readonly="formData['request_empno'] != auth.empno" maxlength="28" ref="revision_bug" />
                  </div>
                  <div class="form-group">
                    <div class="fld-head">
                      <label class="text-danger" v-text="ui.csm_trn_field_contract_type"></label>
                    </div>
                    <select class="form-control input-sm" v-model.trim="editDetailData['contract_type']" ref="contract_type" v-bind:disabled="!['01', '02', '04', '05'].includes(editDetailData.item_type)">
                      <option value="">{{ ui.csm_trn_select_placeholder }}</option>
                      <option value="Y">{{ ui.csm_trn_in_contract }}</option>
                      <option value="N">{{ ui.csm_trn_out_contract }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <div class="fld-head">
                      <label v-text="'Ticket No.'"></label>
                    </div>
                    <input type="text" class="form-control input-sm" v-model="editDetailData['ref_docno']" disabled />
                  </div>
                </div>

                <!-- Risk Table -->
                <fieldset v-bind:disabled="formData.request_empno != auth.empno">
                  <div class="row">
                    <div class="col-md-10 col-sm-12">
                      <div class="table-responsive">
                        <table class="table table-bordered table-striped table-hover">
                          <thead>
                            <tr>
                              <th class="text-left text-middle risk-th" colspan="4">
                                <span class="d-flex risk-head">
                                  <span class="risk-head-title">{{ ui.csm_trn_risk_impact }}</span>
                                  <span class="form-check form-check-custom form-check-solid form-check-sm yn-toggle">
                                    <input class="form-check-input" type="radio" id="riskStatusYes" value="Y" v-model="editDetailData['risk_status']" @click="checkRisk('Y')" />
                                    <label class="form-check-label" for="riskStatusYes">{{ ui.erp_yes }}</label>
                                  </span>
                                  <span class="form-check form-check-custom form-check-solid form-check-sm yn-toggle">
                                    <input class="form-check-input" type="radio" id="riskStatusNo" value="N" v-model="editDetailData['risk_status']" @click="checkRisk('Y')" />
                                    <label class="form-check-label" for="riskStatusNo">{{ ui.erp_no_label }}</label>
                                  </span>
                                  <span class="risk-add pointer" @click="appendRows('risk')" v-show="editDetailData['risk_status']=='Y'">
                                    <i class="fas fa-plus"></i>{{ui.add_detail || 'เพิ่มรายการ'}}
                                  </span>
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="x,idx in showRisk()">
                              <td align="center" class="tf-1 text-middle"><b>{{idx+1}}.</b></td>
                              <td class="tf-4"><input type="text" class="form-control text-middle input-sm" v-model.trim="x.description" v-bind:disabled="editDetailData['risk_status']=='N'" /></td>
                              <td align="center" class="tf-3 text-middle">{{x.adduser}}</td>
                              <td align="center" class="tf-1 text-middle"><a href="#" @click.prevent="spliceRows(x.itemno, 'risk')"><i class="fas fa-times" v-show="editDetailData['risk_status']=='Y' && x.itemno > 1"></i></a></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </fieldset>

                <div class="row" v-if="editDetailData['status'] == 'Y' && formData['request_empno'] == auth.empno && ['01','02','03','04','06','07','11','14','22'].includes(editDetailData['item_type'])">
                  <div class="col-md-3 col-sm-4 col-xs-6">
                    <div class="form-group">
                      <label>{{ ui.csm_trn_revision_uat }}</label>
                      <input type="text" class="form-control input-sm" v-model.trim="editDetailData['revision']" readonly />
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-4 col-xs-6">
                    <div class="form-group">
                      <label>{{ ui.csm_trn_revision_prod }}</label>
                      <input type="text" class="form-control input-sm" v-model.trim="editDetailData['revision_prod']" readonly />
                    </div>
                  </div>
                </div>

              </fieldset>
            </div>
              </div>
            </div>
          </div>
          <!-- /CARD 1 -->

          <!-- ═══ CARD 1b : กำหนดการ (dates lifted out of Task Information) ═══ -->
          <div class="panel-group" id="accordionSchedule" role="tablist" aria-multiselectable="true">
            <div class="info-card accordion-card">
              <div role="tab" id="headingSchedule">
                <a role="button" data-toggle="collapse" data-parent="#accordionSchedule" href="#collapseSchedule" aria-expanded="true" aria-controls="collapseSchedule" class="info-card-header accordion-toggle" :class="{'is-open': scheduleOpen}" @click="scheduleOpen = !scheduleOpen">
                  <i class="fas fa-calendar-alt"></i>
                  <span>{{ ui.csm_trn_schedule }}</span>
                  <span class="accordion-toggle-icon"><i class="fas fa-chevron-down"></i></span>
                </a>
              </div>
              <div id="collapseSchedule" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingSchedule">
                <div class="info-card-body">
                  <fieldset v-bind:disabled="((formData.request_empno != auth.empno && formData.assign_empno != auth.empno) ||
                              (formData.job_status != 'W' && editDetailData.status != 'W') || editDetailData.status == 'Y' || isView) && !isAdmin">
                    <div class="wa-grid">
                      <div class="form-group">
                        <label :class="activeconfig.TRN001N === 'Y' ? 'text-danger' : ''" v-text="'Requested Date'"></label>
                        <datepicker input-class="form-control input-sm" :disabled="fromLine_req()" type="datetime" format="DD/MM/YYYY HH:mm" v-model.trim="editDetailData['ref_docdate']"></datepicker>
                      </div>
                      <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.response_date)}">
                        <label :class="activeconfig.TRN001O === 'Y' ? 'text-danger' : ''" v-text="ui.response_date || 'วันที่ติดต่อกลับ'"></label>
                        <datepicker input-class="form-control input-sm" :overdate="datePriority()" :beforedate="true" v-model.trim="editDetailData['response_date']"></datepicker>
                      </div>
                      <div class="form-group">
                        <label :class="{'text-danger': editDetailData.assign_empno == auth.empno}" v-text="'วันที่คาดหวัง'"></label>
                        <datepicker input-class="form-control input-sm" :beforedate="true" v-model.trim="editDetailData['due_date']"></datepicker>
                      </div>
                      <div class="form-group">
                        <label v-text="ui.re_completed_date_com || 'วันที่งานเสร็จ'"></label>
                        <datepicker input-class="form-control input-sm" v-model.trim="editDetailData['complete_date']" disabled="true"></datepicker>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
            </div>
          </div>
          <!-- /CARD 1b -->

          <!-- ═══ CARD 2 : Worker & Assignment ═══ -->
          <div class="panel-group" id="accordionWorkerAssign" role="tablist" aria-multiselectable="true">
            <div class="info-card accordion-card">
              <div role="tab" id="headingWorkerAssign">
                <a role="button" data-toggle="collapse" data-parent="#accordionWorkerAssign" href="#collapseWorkerAssign" aria-expanded="true" aria-controls="collapseWorkerAssign" class="info-card-header accordion-toggle" :class="{'is-open': workerAssignOpen}" @click="workerAssignOpen = !workerAssignOpen">
                  <i class="fas fa-users"></i>
                  <span>{{ ui.csm_trn_worker_and_assignment }} </span>
                  <span class="accordion-toggle-icon"><i class="fas fa-chevron-down"></i></span>
                </a>
              </div>
              <div id="collapseWorkerAssign" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingWorkerAssign">
            <div class="info-card-body">
              <!--<fieldset v-bind:disabled="((formData.request_empno != auth.empno && formData.assign_empno != auth.empno && editDetailData.assign_empno != auth.empno) || editDetailData.status_tmp != 'W' || isView) && !isAdmin">-->
              <fieldset v-bind:disabled="!canEdit_">

                <!-- Schedule : worker dates / difficulty / item no. -->
                <div class="wa-grid">
                  <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.worker_start_date)&& formData.job_status!='H' && editDetailData.assign_empno == auth.empno}">
                    <label :class="{'text-danger': xt.isEmpty(editDetailData.worker_start_date) && editDetailData.assign_empno == auth.empno}" v-text="ui.worker_start_date || 'วันที่เริ่มงาน(Worker)'"></label>
                    <datepicker input-class="form-control input-sm" type="datetime" format="DD/MM/YYYY HH:mm" v-model.trim="editDetailData['worker_start_date']" :disabled="!(formData.assign_empno === auth.empno && !xt.isEmpty(formData.ref_pre_event_ppn)) && formData.job_status === 'H'" @change="isValidDate('start')"></datepicker>
                  </div>
                  <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.worker_end_date) && editDetailData.assign_empno == auth.empno}">
                    <label :class="{'text-danger': xt.isEmpty(editDetailData.worker_end_date) && editDetailData.assign_empno == auth.empno}" v-text="ui.worker_end_date || 'วันที่คาดว่าจะเสร็จ(Worker)'"></label>
                    <datepicker input-class="form-control input-sm" v-model.trim="editDetailData['worker_end_date']" :disabled="!(formData.assign_empno === auth.empno && !xt.isEmpty(formData.ref_pre_event_ppn)) && formData.job_status === 'H'" @change="isValidDate('end')"></datepicker>
                  </div>
                  <div class="form-group">
                    <label v-text="ui.worker_end_date || 'วันที่ส่งมอบงาน(Worker)'"></label>
                    <datepicker input-class="form-control input-sm" v-model.trim="editDetailData['worker_send_date']" :disabled="editDetailData.assign_empno != auth.empno"></datepicker>
                  </div>
                  <div class="form-group" v-if="!xt.isEmpty(formData['ref_pre_event_ppn'])">
                    <label class="text-danger" v-text="'Level of Difficult'"></label>
                    <select class="form-control input-sm" v-model.trim="editDetailData['level_task']" ref="level_task" v-bind:disabled="formData.assign_empno != auth.empno">
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                </div>

                <!-- Edit Form warning -->
                <div class="callout callout-warning" v-show="editDetailData['edit_form_qty'] >= 2">
                  <strong>{{ ui.csm_v2_warning }}:</strong> {{ ui.csm_trn_warn_form_edit_charge.replace('{0}', editDetailData['edit_form_qty']) }}
                </div>

                <!-- Form Type (item_type 04/05) -->
                <fieldset v-show="['04','05'].includes(editDetailData['item_type']) && !['RE'].includes(editDetailData['module'])" v-bind:disabled="(['Y'].includes(editDetailData['status']) || isView)">
                  <div class="wa-formtype">
                    <div class="form-group wa-col-code">
                      <label class="text-danger">{{ ui.csm_trn_form_type }}</label>
                      <div class="input-group">
                        <input type="text" class="form-control input-sm" v-model.trim="editDetailData['formcode']" readonly>
                        <span class="input-group-btn">
                          <button class="btn btn-sm bg-navy" @click="$refs.form_modal_1.openModal()"><i class="fas fa-search"></i></button>
                        </span>
                      </div>
                    </div>
                    <div class="form-group wa-col-name">
                      <label>{{ ui.csm_trn_form_name }} <span class="wa-hint">{{ ui.csm_trn_form_name_hint }}</span></label>
                      <input type="text" class="form-control input-sm" v-model.trim="editDetailData['formname']" readonly>
                    </div>
                    <div class="form-group wa-col-flag">
                      <label>&nbsp;</label>
                      <div class="form-check form-check-custom form-check-solid form-check-sm">
                        <input class="form-check-input" type="checkbox" v-model="editDetailData['wrong_program']" true-value="Y" false-value="N" />
                        <label class="form-check-label">
                          <span v-tooltip="ui.csm_trn_tooltip_program_defect">
                            {{ ui.csm_trn_program_defect }} <i class="fas fa-info-circle text-danger"></i>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </fieldset>

                <!-- Worker -->
                <div class="form-group">
                  <label>{{ ui.csm_trn_worker_paren }} <a href="#" class="wa-link" @click.prevent="openCalenderModal()">{{ ui.csm_trn_check_worker_schedule_link }}</a></label>
                  <div class="wa-person wa-person--worker">
                    <span class="wa-avatar">{{ xt.isEmpty(editDetailData['assign_empno']) ? '—' : editDetailData['assign_empno'] }}</span>
                    <span class="wa-person-body">
                      <span class="wa-person-role">{{ ui.csm_trn_worker_dot_label }}</span>
                      <input type="text" class="wa-person-name" v-model.trim="editDetailData['assign_empno_name']" readonly />
                    </span>
                    <span class="wa-person-meta">
                      <input type="text" class="wa-meta-value" v-model="editDetailData['itemno']" readonly />
                      <span class="wa-meta-label">{{ ui.csm_trn_item_no_label }}</span>
                    </span>
                    <span class="wa-person-actions">
                      <button class="btn btn-sm bg-navy wa-icon-btn" @click="empModalSelected('assign_detail')"><i class="fa fa-search"></i></button>
                      <button class="btn btn-sm btn-danger wa-icon-btn wa-icon-btn--danger" @click="clearData(editDetailData, ['assign_empno', 'assign_empno_name'])"><i class="fa fa-close"></i></button>
                    </span>
                  </div>
                </div>
              </fieldset>

              <!-- Tester -->
              <fieldset v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno && (editDetailData.tester_empno != auth.empno && editDetailData.tester_empno_tmp != auth.empno && !emp_is_software_tester())) || ((!emp_is_software_tester() && editDetailData.tester_empno != auth.empno) && isView)">
                <div class="form-group">
                  <label>{{ ui.csm_trn_tester_paren }} <i class="fas fa-info-circle wa-info" v-tooltip="ui.csm_trn_tooltip_default_worker_checker"></i></label>
                  <div class="wa-person wa-person--tester">
                    <span class="wa-avatar">{{ xt.isEmpty(editDetailData['tester_empno']) ? '—' : editDetailData['tester_empno'] }}</span>
                    <span class="wa-person-body">
                      <span class="wa-person-role">{{ ui.csm_trn_tester_dot_label }}</span>
                      <input type="text" class="wa-person-name" v-model.trim="editDetailData['tester_empno_name']" readonly />
                    </span>
                    <span class="wa-person-actions">
                      <button class="btn btn-sm bg-navy wa-icon-btn" @click="empModalSelected('tester')"><i class="fa fa-search"></i></button>
                      <button class="btn btn-sm btn-danger wa-icon-btn wa-icon-btn--danger" @click="clearData(editDetailData, ['tester_empno', 'tester_empno_name'])"><i class="fa fa-close"></i></button>
                    </span>
                  </div>
                </div>
              </fieldset>

              <!-- Add worker / Worker no. / AI — one row -->
              <worker-ref-action :ref-worker-text="editDetailData.ref_worker_no"
                                 @add-worker="openAddWork('new')"
                                 @read-worker="openAddWork('read')"
                                 :refWorkerText="refWorkerCount">
                <template #trail>
                  <button type="button" class="btn wa-ai-btn"
                          v-if=" editDetailData.status !='W'&& (formData.assign_empno == auth.empno || editDetailData.assign_empno == auth.empno || editDetailData.tester_empno == auth.empno ||isMyWorker)"
                          @click.prevent="openAiAnalysisModal()"
                          v-tooltip="ui.csm_trn_view_ai_analysis">
                    <i class="fas fa-robot"></i>
                  </button>
                  <span class="wa-worker-no-cell" v-if="isMango && (editDetailData['tester_empno'] == auth.empno || formData.request_empno == auth.empno || editDetailData['assign_empno'] == auth.empno || formData.assign_empno == auth.empno)">
                    <span class="wa-worker-no-label text-danger" v-text="'Revise Defect :'"></span>
                    <span class="form-control input-sm text-center text-bold wa-worker-no">{{ xt.int(editDetailData['count_tester_sendback']) }}</span>
                  </span>
                </template>
              </worker-ref-action>

            </div>
              </div>
            </div>
          </div>
          <!-- /CARD 2 -->
             <!-- ═══  (Tester/QC) Update ═══ -->
              <template v-if="editDetailData['tester_empno'] == auth.empno && (editDetailData['send_pretest_to_tester_status'] == 'Y' || ['U','B','T','Y'].includes(editDetailData['status_tmp'])) && !['H','Y'].includes(editDetailData['status'])">
                <div class="panel-group" id="accordionTester" role="tablist" aria-multiselectable="true">
                  <div class="info-card accordion-card">
                    
                    <div role="tab" id="headingWorkerAssign">
                      <a role="button" data-toggle="collapse" data-parent="#accordionTester" href="#collapseTester" aria-expanded="true" aria-controls="collapseTester" class="info-card-header accordion-toggle" :class="{'is-open': workerAssignOpen}" @click="workerAssignOpen = !workerAssignOpen">
                        <i class="fas fa-users"></i>
                        <span>Tester/QC</span>
                        <span class="accordion-toggle-icon"><i class="fas fa-chevron-down"></i></span>
                      </a>
                    </div>
                    
                    <div id="collapseTester" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingWorkerAssign">
                      <div class="info-card-body">
                        
                        <!-- ย้าย fieldset เข้ามาใน info-card-body เพื่อให้มันถูกย่อ/ขยายได้ตาม Accordion -->
                        <fieldset v-bind:disabled="!canEdit_t">
                          <div class="wa-grid">
                            
                            <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.tester_start_date) && formData.job_status!='H' && editDetailData.tester_empno == auth.empno}">
                              <label :class="{'text-danger': xt.isEmpty(editDetailData.tester_start_date) && editDetailData.tester_empno == auth.empno}" v-text="'Start Date(Tester)'"></label>
                              <datepicker input-class="form-control input-sm" type="datetime" format="DD/MM/YYYY HH:mm" v-model.trim="editDetailData['tester_start_date']" :disabled="!(editDetailData.tester_empno === auth.empno) && formData.job_status === 'H'" @change="isValidDate('start')"></datepicker>
                            </div>
                            
                            <div class="form-group">
                              <label v-text="'End Date(Tester)'"></label>
                              <datepicker input-class="form-control input-sm" v-model.trim="editDetailData['tester_end_date']" :disabled="editDetailData.tester_empno != auth.empno"></datepicker>
                            </div>
                            
                          </div>
                        </fieldset>

                      </div>
                    </div> 
                    
                  </div> 
                </div>
              </template>
          <!-- ═══ Bug Software Check (Tester) ═══ -->
          <template v-if="editDetailData.tester_empno == auth.empno && editDetailData.status_tmp == 'W' && (send_test_bug.some(s => s.code_s_bug === editDetailData.item_type) && (formData.request_empno != auth.empno || editDetailData.tester_empno == auth.empno)) && formData.job_status == 'W' && editDetailData.is_db">
            <div class="info-card">
              <div class="info-card-header"><i class="fas fa-bug"></i> {{ ui.csm_trn_check_bug_software }}</div>
              <div class="info-card-body">
                <div class="row">
                  <div class="col-md-2 col-sm-4 col-xs-6">
                    <div class="icheck-material-green">
                      <input type="radio" id="testerApprove1" v-model="editDetailData['tester_approve']" value="Y" />
                      <label for="testerApprove1">{{ ui.erp_approve }}</label>
                    </div>
                  </div>
                  <div class="col-md-2 col-sm-4 col-xs-6">
                    <div class="icheck-material-red">
                      <input type="radio" id="testerApprove2" v-model="editDetailData['tester_approve']" value="R" />
                      <label for="testerApprove2">{{ ui.csm_trn_reject_to_requestor }}</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div class="row" v-if="editDetailData.tester_approve == 'R' && editDetailData.is_db">
            <div class="col-lg-10 col-md-10 col-sm-10">
              <div class="form-group">
                <label for="" class="text-danger">{{ ui.csm_trn_reject_tester_reason }}</label>
                <textarea class="form-control input-sm" rows="6" v-model="editDetailData['tester_approve_remark']" v-bind:disabled="(editDetailData.tester_empno != auth.empno || !emp_is_software_tester()) && editDetailData.status_tmp != 'W'"></textarea>
              </div>
            </div>
          </div>
          <div class="row" v-if="editDetailData.tester_approve == 'R' && formData.request_empno == auth.empno && editDetailData.status_tmp != 'Y' && editDetailData.is_db">
            <div class="col-md-12 col-sm-12 col-xs-12">
              <h5 class="text-bold">{{ ui.csm_trn_note_tester_reject_1 }} <a class="btn btn-sm btn-github" href="#" @click.prevent="recoveryTesterTasks('Tester')"><i class="fas fa-recycle"></i> {{ ui.csm_trn_restore_status }}</a> {{ ui.csm_trn_note_tester_reject_2 }} <a class="btn btn-sm btn-danger" href="#" @click.prevent="recoveryTesterTasks('Close')"><i class="fas fa-times-circle"></i> {{ ui.csm_trn_close_this_item }}</a></h5>
            </div>
          </div>

          <div v-show="isEditDetail ||isMyWorker">
            <fieldset v-show="formData['request_empno'] == auth.empno && ['S','T','X'].includes(editDetailData['status_tmp']) && (is_qc() ? editDetailData['tester_test_status'] == 'Y' : !['T'].includes(editDetailData['tester_test_status']))">
              <div class="row">
                <div class="col-md-8 col-sm-12 col-xs-12">
                  <div class="box box-info">
                    <div class="box-header with-border">
                      <h3 class="box-title"><i class="fa fa-folder-open"></i> {{ ui.csm_trn_requester_status }}</h3>
                    </div>
                    <div class="box-body">
                      <div class="row">
                        <div class="col-md-3 col-sm-6 col-xs-12">
                          <div class="form-group">
                            <label>{{ ui.csm_trn_revision_uat }}</label>
                            <input type="text" class="form-control input-sm" v-model.trim="editDetailData['revision']" readonly />
                          </div>
                        </div>
                        <div class="col-md-3 col-sm-6 col-xs-12">
                          <div class="form-group">
                            <label>{{ ui.csm_trn_revision_prod }}</label>
                            <input type="text" class="form-control input-sm" v-model.trim="editDetailData['revision_prod']" readonly />
                          </div>
                        </div>
                      </div>
                      <div class="status-radio-group">
                        <div class="icheck-material-amber">
                          <input type="radio" id="req_status1" v-model="editDetailData['status']" value="B" />
                          <label for="req_status1">{{ ui.csm_home_send_back }}</label>
                        </div>
                        <div class="icheck-material-deeppurple">
                          <input type="radio" id="req_status2" v-model="editDetailData['status']" value="T" />
                          <label for="req_status2">{{ ui.csm_trn_status_test }}</label>
                        </div>
                        <div class="icheck-material-green">
                          <input type="radio" id="req_status3" v-model="editDetailData['status']" value="Y" @click="checkRevisionProdOnComplete()" />
                          <label for="req_status3">{{ ui.csm_v2_status_finished }}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
            <fieldset v-show="(editDetailData ['assign_empno'] == auth.empno || isMyWorker ) && (!['X','T','Y'].includes(editDetailData['status_tmp'])) && formData['job_status'] !='H'  &&(!is_qc())">
              <div class="wa-stack">
                <div class="wa-sec">
                  <a class="wa-sec-head" :class="{'is-open': statusSecOpen}" @click.prevent="statusSecOpen = !statusSecOpen">
                    <span class="wa-sec-ic"><i class="fas fa-check-circle"></i></span>
                    <span class="wa-sec-title">{{ ui.csm_home_job_status }}</span>
                    <span class="wa-sec-chev"><i class="fas fa-chevron-down"></i></span>
                  </a>
                  <div class="wa-sec-body" v-show="statusSecOpen">
                    <div class="status-radio-group wa-pills">
                      <div class="icheck-material-bluegrey">
                        <input type="radio" id="taskStatus1" v-model="editDetailData['status']" value="W" />
                        <label for="taskStatus1"><i class="far fa-circle"></i> {{ ui.erp_none }}</label>
                      </div>
                      <div class="icheck-material-red">
                        <input type="radio" id="taskStatus2" v-model="editDetailData['status']" value="R" />
                        <label for="taskStatus2"><i class="fas fa-times"></i> {{ ui.erp_reject }}</label>
                      </div>
                      <div class="icheck-material-cyan">
                        <input type="radio" id="taskStatus3" v-model="editDetailData['status']" value="I" />
                        <label for="taskStatus3"><i class="far fa-clock"></i> {{ ui.csm_v2_status_in_progress }}</label>
                      </div>
                      <div class="icheck-material-amber">
                        <input type="radio" id="taskStatus4" v-model="editDetailData['status']" value="H" />
                        <label for="taskStatus4"><i class="fas fa-pause"></i> {{ ui.csm_trn_status_hold }}</label>
                      </div>
                      <div class="icheck-material-green">
                        <input type="radio" id="taskStatus5" v-model="editDetailData['status']" value="S" />
                        <label for="taskStatus5"><i class="fas fa-arrow-right"></i> {{ ui.csm_trn_send_pretest }}</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="wa-sec" v-if="!xt.isEmpty(formData['ref_pre_event_ppn']) &&  (editDetailData['assign_empno'] == auth.empno || isMyWorker)">
                  <a class="wa-sec-head" :class="{'is-open': progressSecOpen}" @click.prevent="progressSecOpen = !progressSecOpen">
                    <span class="wa-sec-ic"><i class="fas fa-chart-line"></i></span>
                    <span class="wa-sec-title">{{ ui.csm_trn_work_progress }}</span>
                    <span class="wa-sec-chev"><i class="fas fa-chevron-down"></i></span>
                  </a>
                  <div class="wa-sec-body" v-show="progressSecOpen">
                    <div class="gauge-card">
                      <div class="gauge-head">
                        <label>{{ ui.csm_trn_total_progress }}</label>
                        <span class="gauge-readout">
                          <span class="gauge-delta" v-if="progressDelta != 0" :class="progressDelta > 0 ? 'is-up' : 'is-down'">{{ progressDelta > 0 ? '+' : '' }}{{ progressDelta }}%</span>
                          <span class="gauge-value">{{ projectedProgress }}%</span>
                        </span>
                      </div>
                      <div class="gauge-track" :class="{'is-locked': progressLocked, 'is-dragging': gaugeDragging}"
                           tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="projectedProgress"
                           @mousedown="onGaugeDown" @touchstart="onGaugeDown" @keydown="onGaugeKey">
                        <div class="gauge-fill" :style="gaugeFillStyle"></div>
                        <div class="gauge-base" v-if="progressDelta != 0" :style="{left: baseProgress + '%'}"></div>
                        <div class="gauge-knob" :style="{left: projectedProgress + '%'}"></div>
                      </div>
                    </div>
                    <div class="stat-tiles">
                      <div class="stat-tile">
                        <label>{{ ui.csm_trn_new_progress }}</label>
                        <number decimals="3" class="form-control input-sm text-right" v-model.trim="editDetailData['n_progress']" @input="onProgressInput(editDetailData['n_progress']);onProgressInputx()" v-bind:disabled="editDetailData['assign_empno'] == auth.empno && editDetailData['status'] == 'R' "></number>
                      </div>
                      <div class="stat-tile" v-bind:class="{'has-error': editDetailData.assign_empno == auth.empno}">
                        <label :class="{'text-danger': editDetailData.assign_empno == auth.empno}">{{ ui.csm_trn_new_manhour }}</label>
                        <timepicker input-class="form-control input-sm" format="HH:mm" v-model="localManhour" @input="onManhourInput"></timepicker>
                      </div>
                      <div class="stat-tile">
                        <label>{{ ui.csm_trn_total_manhour }}</label>
                        <div class="stat-val">{{ xt.isEmpty(editDetailData['t_manhour']) ? 0 : editDetailData['t_manhour'] }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
            <fieldset v-show="(editDetailData ['assign_empno'] == auth.empno || isMyWorker )&& is_qc() && !['S','T','Y','U'].includes(editDetailData['status_tmp']) && formData['job_status'] !='H'  &&is_qc()">
              <div class="row">
                <div class="col-md-8 col-sm-12 col-xs-12">
                  <span class="pull-right"><b class="text-danger">{{ ui.csm_trn_note_for_worker }} : </b> {{ ui.csm_trn_note_checker_first }}</span>
                </div>
              </div>
              <div class="wa-stack">
                <div class="wa-sec">
                  <a class="wa-sec-head" :class="{'is-open': statusSecOpen}" @click.prevent="statusSecOpen = !statusSecOpen">
                    <span class="wa-sec-ic"><i class="fas fa-check-circle"></i></span>
                    <span class="wa-sec-title">{{ ui.csm_trn_job_status_qc }}</span>
                    <span class="wa-sec-hint">{{ ui.csm_trn_show_when_checker }}</span>
                    <span class="wa-sec-chev"><i class="fas fa-chevron-down"></i></span>
                  </a>
                  <div class="wa-sec-body" v-show="statusSecOpen">
                    <div class="status-radio-group wa-pills">
                      <div class="icheck-material-bluegrey">
                        <input type="radio" id="qcStatus1" v-model="editDetailData['status']" value="W" />
                        <label for="qcStatus1"><i class="far fa-circle"></i> {{ ui.erp_none }}</label>
                      </div>
                      <div class="icheck-material-red">
                        <input type="radio" id="qcStatus2" v-model="editDetailData['status']" value="R" />
                        <label for="qcStatus2"><i class="fas fa-times"></i> {{ ui.erp_reject }}</label>
                      </div>
                      <div class="icheck-material-cyan">
                        <input type="radio" id="qcStatus3" v-model="editDetailData['status']" value="I" />
                        <label for="qcStatus3"><i class="far fa-clock"></i> {{ ui.csm_v2_status_in_progress }}</label>
                      </div>
                      <div class="icheck-material-amber">
                        <input type="radio" id="qcStatus4" v-model="editDetailData['status']" value="H" />
                        <label for="qcStatus4"><i class="fas fa-pause"></i> {{ ui.csm_trn_status_hold }}</label>
                      </div>
                      <div class="icheck-material-green">
                        <input type="radio" id="qcStatus5" v-model="editDetailData['status']" value="X" />
                        <label for="qcStatus5"><i class="fas fa-arrow-right"></i> {{ ui.csm_trn_send_to_tester }}</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="wa-sec" v-if="!xt.isEmpty(formData['ref_pre_event_ppn']) && ( editDetailData['assign_empno'] == auth.empno|| isMyWorker)">
                  <a class="wa-sec-head" :class="{'is-open': progressSecOpen}" @click.prevent="progressSecOpen = !progressSecOpen">
                    <span class="wa-sec-ic"><i class="fas fa-chart-line"></i></span>
                    <span class="wa-sec-title">{{ ui.csm_trn_work_progress }}</span>
                    <span class="wa-sec-chev"><i class="fas fa-chevron-down"></i></span>
                  </a>
                  <div class="wa-sec-body" v-show="progressSecOpen">
                    <div class="gauge-card">
                      <div class="gauge-head">
                        <label>{{ ui.csm_trn_total_progress }}</label>
                        <span class="gauge-readout">
                          <span class="gauge-delta" v-if="progressDelta != 0" :class="progressDelta > 0 ? 'is-up' : 'is-down'">{{ progressDelta > 0 ? '+' : '' }}{{ progressDelta }}%</span>
                          <span class="gauge-value">{{ projectedProgress }}%</span>
                        </span>
                      </div>
                      <div class="gauge-track" :class="{'is-locked': progressLocked, 'is-dragging': gaugeDragging}"
                           tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="projectedProgress"
                           @mousedown="onGaugeDown" @touchstart="onGaugeDown" @keydown="onGaugeKey">
                        <div class="gauge-fill" :style="gaugeFillStyle"></div>
                        <div class="gauge-base" v-if="progressDelta != 0" :style="{left: baseProgress + '%'}"></div>
                        <div class="gauge-knob" :style="{left: projectedProgress + '%'}"></div>
                      </div>
                    </div>
                    <div class="stat-tiles">
                      <div class="stat-tile">
                        <label>{{ ui.csm_trn_new_progress }}</label>
                        <number decimals="3" class="form-control input-sm text-right" v-model.trim="editDetailData['n_progress']" @input="onProgressInput(editDetailData['n_progress']);onProgressInputx()" v-bind:disabled="editDetailData['assign_empno'] == auth.empno && editDetailData['status'] == 'R' "></number>
                      </div>
                      <div class="stat-tile" v-bind:class="{'has-error': editDetailData.assign_empno == auth.empno}">
                        <label :class="{'text-danger': editDetailData.assign_empno == auth.empno}">{{ ui.csm_trn_new_manhour }}</label>
                        <timepicker input-class="form-control input-sm" format="HH:mm" v-model="localManhour" @input="onManhourInput"></timepicker>
                      </div>
                      <div class="stat-tile">
                        <label>{{ ui.csm_trn_total_manhour }}</label>
                        <div class="stat-val">{{ xt.isEmpty(editDetailData['t_manhour']) ? 0 : editDetailData['t_manhour'] }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
            <fieldset v-show="editDetailData['tester_empno'] == auth.empno && (editDetailData['send_pretest_to_tester_status'] == 'Y' || ['U','B','T','Y'].includes(editDetailData['status_tmp'])) && !['H','Y'].includes(editDetailData['status'])">
              <div class="row">
                <div class="col-md-8 col-sm-12 col-xs-12">
                  <div class="box box-info">
                    <div class="box-header with-border">
                      <h3 class="box-title"><i class="fa fa-folder-open"></i> {{ ui.csm_trn_checker_status }}</h3>
                    </div>
                    <div class="box-body">
                      <div class="status-radio-group">
                        <div class="icheck-material-purple">
                          <input type="radio" id="testerStatus4" v-model="editDetailData['tester_test_status']" value="U" />
                          <label for="testerStatus4">{{ ui.csm_home_update_program }}</label>
                        </div>
                        <div class="icheck-material-amber">
                          <input type="radio" id="testerStatus1" v-model="editDetailData['tester_test_status']" value="B" />
                          <label for="testerStatus1">{{ ui.csm_trn_status_defect }}</label>
                        </div>
                        <div class="icheck-material-deeppurple">
                          <input type="radio" id="testerStatus2" v-model="editDetailData['tester_test_status']" value="T" />
                          <label for="testerStatus2">{{ ui.csm_trn_status_test }}</label>
                        </div>
                        <div class="icheck-material-green">
                          <input type="radio" id="testerStatus3" v-model="editDetailData['tester_test_status']" value="Y" />
                          <label for="testerStatus3">{{ ui.csm_trn_send_to_requester }}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
          <fieldset v-bind:disabled="['Y'].includes(editDetailData['status_tmp'])" v-if="['R','H'].includes(editDetailData['status'])">
            <div class="row">
              <div class="col-lg-10 col-md-10 col-sm-10">
                <div class="form-group">
                  <label for="" class="text-danger">{{ ui.csm_trn_worker_remark }} ({{editDetailData['status'] == 'R' ? ui.erp_reject : ui.csm_trn_status_hold}} {{ ui.erp_remark }})</label>
                  <textarea v-if="editDetailData['status'] == 'R'" class="form-control input-sm" rows="6" v-model.trim="editDetailData['reject_remark']" ref="reject_remark"></textarea>
                  <textarea v-else class="form-control input-sm" rows="6" v-model.trim="editDetailData['remark']" ref="remark"></textarea>
                </div>
              </div>
            </div>
          </fieldset>
          <div class="row" v-if="editDetailData.status == 'R' && formData.request_empno == auth.empno && formData.job_status != 'Y'">
            <div class="col-md-10 col-sm-12 col-xs-12">
              <h5 class="text-bold">{{ ui.csm_trn_note_requester_reject_1 }} <a class="btn btn-sm btn-github" href="#" @click.prevent="recoveryTasks()"><i class="fas fa-refresh"></i> {{ ui.csm_trn_change_status }}</a> {{ ui.csm_trn_note_requester_reject_2 }}</h5>
            </div>
          </div>

          <fieldset v-bind:disabled="(editDetailData['assign_empno'] != auth.empno || isView)"
                    v-show="(((['S','B','T','Y','X','U'].includes(editDetailData['status'])&& ['01','02','04','05','06','07'].includes(editDetailData['item_type']) && editDetailData['assign_empno'] == auth.empno) || (editDetailData['tester_empno'] == auth.empno && (editDetailData['revision_is_import'] == 'Y' || !xt.isEmpty(editDetailData['revision'])))) || isAdmin )&&  formData['job_status'] !='H' ">
               <div v-if="!xt.isEmpty(formData['ref_pre_event_ppn']) && ( editDetailData['assign_empno'] == auth.empno|| isMyWorker) && !((editDetailData['assign_empno'] == auth.empno || isMyWorker) && formData['job_status'] !='H' && (is_qc() ? !['S','T','Y','U'].includes(editDetailData['status_tmp']) : !['X','T','Y'].includes(editDetailData['status_tmp'])))">
                <div class="wa-stack">
                  <div class="wa-sec">
                    <a class="wa-sec-head" :class="{'is-open': progressSecOpen}" @click.prevent="progressSecOpen = !progressSecOpen">
                      <span class="wa-sec-ic"><i class="fas fa-chart-line"></i></span>
                      <span class="wa-sec-title">{{ ui.csm_trn_work_progress }}</span>
                      <span class="wa-sec-chev"><i class="fas fa-chevron-down"></i></span>
                    </a>
                    <div class="wa-sec-body" v-show="progressSecOpen">
                      <div class="gauge-card">
                        <div class="gauge-head">
                          <label>{{ ui.csm_trn_total_progress }}</label>
                          <span class="gauge-readout">
                            <span class="gauge-delta" v-if="progressDelta != 0" :class="progressDelta > 0 ? 'is-up' : 'is-down'">{{ progressDelta > 0 ? '+' : '' }}{{ progressDelta }}%</span>
                            <span class="gauge-value">{{ projectedProgress }}%</span>
                          </span>
                        </div>
                        <div class="gauge-track" :class="{'is-locked': progressLocked, 'is-dragging': gaugeDragging}"
                             tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="projectedProgress"
                             @mousedown="onGaugeDown" @touchstart="onGaugeDown" @keydown="onGaugeKey">
                          <div class="gauge-fill" :style="gaugeFillStyle"></div>
                          <div class="gauge-base" v-if="progressDelta != 0" :style="{left: baseProgress + '%'}"></div>
                          <div class="gauge-knob" :style="{left: projectedProgress + '%'}"></div>
                        </div>
                      </div>
                      <div class="stat-tiles">
                        <div class="stat-tile">
                          <label>{{ ui.csm_trn_new_progress }}</label>
                          <number decimals="3" class="form-control input-sm text-right" v-model.trim="editDetailData['n_progress']" @input="onProgressInput(editDetailData['n_progress']);onProgressInputx()" v-bind:disabled="editDetailData['assign_empno'] == auth.empno && editDetailData['status'] == 'R' "></number>
                        </div>
                        <div class="stat-tile" v-bind:class="{'has-error': editDetailData.assign_empno == auth.empno}">
                          <label :class="{'text-danger': editDetailData.assign_empno == auth.empno}">{{ ui.csm_trn_new_manhour }}</label>
                          <timepicker input-class="form-control input-sm" format="HH:mm" v-model="localManhour" @input="onManhourInput"></timepicker>
                        </div>
                        <div class="stat-tile">
                          <label>{{ ui.csm_trn_total_manhour }}</label>
                          <div class="stat-val">{{ xt.isEmpty(editDetailData['t_manhour']) ? 0 : editDetailData['t_manhour'] }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>


            <div class="wa-config-row">
              <div class="form-group wa-config-flag">
                <label>&nbsp;</label>
                <span class="form-check form-check-custom form-check-solid form-check-sm">
                  <input class="form-check-input"
                         type="checkbox"
                         true-value="Y"
                         false-value="N"
                         v-model="editDetailData['config']"
                         @click="checkRisk('Y')" />
                  <label class="form-check-label">{{ ui.erp_config }}</label>
                </span>
              </div>
              <div class="form-group wa-config-code">
                <label class="text-danger">{{ ui.csm_trn_config_code }}</label>
                <input type="text" class="form-control input-sm" v-model.trim="editDetailData['config_code']" maxlength="30" v-bind:disabled="editDetailData['config'] == 'N'" />
              </div>
              <div class="form-group wa-config-desc">
                <label class="text-danger">{{ ui.csm_trn_config_description }}</label>
                <input type="text" class="form-control input-sm" v-model.trim="editDetailData['config_desc']" maxlength="300" v-bind:disabled="editDetailData['config'] == 'N'" />
              </div>
            </div>
          </fieldset>
          <fieldset v-bind:disabled="(editDetailData['assign_empno'] != auth.empno || isView) && !isAdmin"
                    v-show="((['S','B','T','Y','X','U'].includes(editDetailData['status']) && !['08','09'].includes(editDetailData['item_type'])
                            && editDetailData['assign_empno'] == auth.empno) ||
                            (['03','11','14','22'].includes(editDetailData['item_type']))
                            || (editDetailData['tester_empno'] == auth.empno && (editDetailData['revision_is_import'] == 'Y' || !xt.isEmpty(editDetailData['revision'])))) || isAdmin">

            <div v-if="['01','02','03','04','06', '07','11','14','22','21','34','35'].includes(editDetailData['item_type'])
                        && ['S','B','T','Y','X','U'].includes(editDetailData['status'])">
              <fieldset class="d-flex margin-t-10" v-show="!['03','11','14','9999','22'].includes(editDetailData['item_type'])">
                <span class="form-check form-check-custom form-check-solid form-check-sm me-5">
                  <input class="form-check-input"
                         type="checkbox"
                         true-value="Y"
                         false-value="N"
                         v-model="editDetailData['revision_is_import']"
                         @click="checkRisk('Y')" />
                  <label class="form-check-label">{{ ui.csm_trn_goto_update_list }} <span class="text-danger">{{ ui.csm_trn_goto_update_list_hint }}</span></label>
                </span>
              </fieldset>
              <div class="wa-grid">
                <div class="form-group">
                  <label class="text-danger">{{ ui.csm_trn_revision_uat }}</label>
                  <input type="text" class="form-control input-sm" v-model.trim="editDetailData['revision']" :placeholder="ui.csm_trn_revision_uat_ph" @keypress="numericOnly" maxlength="28" />
                </div>
                <div class="form-group">
                  <label>{{ ui.csm_trn_revision_prod }}</label>
                  <input type="text" class="form-control input-sm" v-model.trim="editDetailData['revision_prod']" :placeholder="ui.csm_trn_revision_prod_ph" @keypress="numericOnly" maxlength="28" />
                </div>
                <div class="form-group" v-show="['11'].includes(editDetailData['item_type'])">
                  <label for="">{{ ui.csm_trn_update_program_date }}</label>
                  <datepicker input-class="form-control input-sm" v-model="editDetailData['update_software_dt']"></datepicker>
                </div>
              </div>
              <div class="form-group">
                <label for="">{{ ui.csm_trn_worker_remark }}</label>
                <textarea class="form-control input-sm" rows="6" :placeholder="ui.csm_trn_type_comment_ph" v-model.trim="editDetailData['description_worker']"></textarea>
              </div>
            </div>
          </fieldset>
        </div>
      </template>

      <!-- End : Template for Mango -->
      <!-- Start : Template For Customer -->
      <div v-show="!isMango">
        <div class="col-md-7" :class="{ 'mtf-narrow': isNarrow }">
          <fieldset v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno) || (formData.job_status != 'W' && editDetailData.status_tmp != 'W') || isView">
            <!-- Row 1: Service Type / Area / Req.Type -->
            <div class="row">
              <div class="col-md-4 col-sm-4 col-xs-12">
                <div class="form-group">
                  <label class="text-danger" v-text="ui.csm_trn_field_service_type"></label>
                  <vue-select-2 :options="service_group_select2x"
                                :settings="{
                            theme: 'bootstrap',
                            selectionCssClass: 'form-control input-sm',
                            templateResult: formatOption,
                            templateSelection: formatSelection
                        }"
                                v-model="editDetailData.item_type"
                                v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno) || (formData.job_status != 'W' && editDetailData.status_tmp != 'W') || isView"
                                @change="itemTypeChange()">
                  </vue-select-2>
                </div>
              </div>
              <div class="col-md-4 col-sm-4 col-xs-12">
                <div class="form-group">
                  <label :class="activeconfig.TRN001H === 'Y' ? 'text-danger' : ''" v-text="ui.area || 'Area'"></label>
                  <vue-select-2 :options="moduleCodeData || []"
                                :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                v-model="editDetailData.module"
                                @change="SearchArea()"
                                v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno) || (formData.job_status != 'W' && editDetailData.status_tmp != 'W') || isView">
                  </vue-select-2>
                </div>
              </div>
              <div class="col-md-4 col-sm-4 col-xs-12">
                <div class="form-group">
                  <label :class="activeconfig.TRN001I === 'Y' ? 'text-danger' : ''" v-text="ui.csm_trn_field_req_type"></label>
                  <vue-select-2 :options="filteredOptionsX"
                                :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                v-model="editDetailData.req_type"
                                v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno) || (formData.job_status != 'W' && editDetailData.status_tmp != 'W') || isView">
                  </vue-select-2>
                </div>
              </div>
            </div>
            <!-- Row 2: หมวดงาน / ประเภทงาน -->
            <div class="row">
              <div class="col-md-6 col-sm-6 col-xs-12">
                <div class="form-group">
                  <label :class="activeconfig.TRN001J === 'Y' ? 'text-danger' : ''">{{ ui.csm_trn_field_category_of_work }}</label>
                  <vue-select-2 :options="filterSubData()"
                                :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                v-model="editDetailData.serv_code_d"
                                v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno) || (formData.job_status != 'W' && editDetailData.status_tmp != 'W') || isView">
                  </vue-select-2>
                </div>
              </div>
              <div class="col-md-6 col-sm-6 col-xs-12">
                <div class="form-group">
                  <label :class="activeconfig.TRN001K === 'Y' ? 'text-danger' : ''">{{ ui.erp_job_type }}</label>
                  <vue-select-2 :options="filterSubData2()"
                                :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                v-model="editDetailData.serv_code_d2"
                                v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno) || (formData.job_status != 'W' && editDetailData.status_tmp != 'W') || isView">
                  </vue-select-2>
                </div>
              </div>
            </div>
            <hr />
            <!-- Subject -->
            <div class="row" style="margin-top:10px;">
              <div class="col-lg-12 col-md-12 col-sm-12">
                <div class="form-group">
                  <label :class="activeconfig.TRN001L === 'Y' ? 'text-danger' : ''" v-text="ui.csm_v2_subject"></label><span class="pull-right  text-bold">{{xt.textLength(editDetailData['subject'], 100)}} {{ ui.csm_trn_characters }}</span>
                  <div class="input-group">
                    <input type="text" class="form-control input-sm" v-model="editDetailData['subject']" maxlength="100" />
                    <span class="input-group-btn"><a class="btn btn-sm bg-navy" @click="openDescModal1('description2')"><i class="fa fa-search"></i></a></span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Detail -->
            <div class="row">
              <div class="col-lg-12 col-md-12 col-sm-12">
                <div class="form-group">
                  <label :class="activeconfig.TRN001M === 'Y' ? 'text-danger' : ''" v-text="ui.csm_v2_description"></label>
                  <textarea class="form-control input-sm" rows="5" v-model.trim="editDetailData['detail']"></textarea>
                </div>
              </div>
            </div>
            <!-- Row: Requested Date / Ticket No. -->
            <div class="row">
              <div class="col-md-6 col-sm-6 col-xs-12">
                <div class="form-group">
                  <label :class="activeconfig.TRN001N === 'Y' ? 'text-danger' : ''" v-text="'Requested Date'"></label>
                  <datepicker input-class="form-control input-sm" :disabled="fromLine_req()" type="datetime" format="DD/MM/YYYY HH:mm" v-model.trim="editDetailData['ref_docdate']"></datepicker>
                </div>
              </div>
              <div class="col-md-6 col-sm-6 col-xs-12">
                <div class="form-group">
                  <label v-text="'Ticket No.'"></label>
                  <input type="text" class="form-control input-sm" v-model="editDetailData['ref_docno']" disabled />
                </div>
              </div>
            </div>
            <!-- Row: Response Date / Due Date / Complete Date -->
            <div class="row">
              <div class="col-md-4 col-sm-4 col-xs-12">
                <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.response_date)}">
                  <label :class="activeconfig.TRN001O === 'Y' ? 'text-danger' : ''" v-text="ui.response_date || 'วันที่ติดต่อกลับ'"></label>
                  <datepicker input-class="form-control input-sm" :disabled="editDetailData.approve_status=='Y'" :overdate="datePriority()" :beforedate="true" v-model.trim="editDetailData['response_date']"></datepicker>
                </div>
              </div>
              <div class="col-md-4 col-sm-4 col-xs-12">
                <div class="form-group">
                  <label :class="{'text-danger': editDetailData.assign_empno == auth.empno}" v-text="ui.duedate || 'Due Date'"></label>
                  <datepicker input-class="form-control input-sm text-success" :disabled="editDetailData.approve_status=='Y'" :beforedate="true" v-model.trim="editDetailData['due_date']"></datepicker>
                </div>
              </div>
              <div class="col-md-4 col-sm-4 col-xs-12">
                <div class="form-group">
                  <label v-text="ui.re_completed_date_com || 'Complete Date'"></label>
                  <datepicker input-class="form-control input-sm" v-model.trim="editDetailData['complete_date']" disabled="true"></datepicker>
                </div>
              </div>
            </div>
            <!-- Worker Date accordion -->
            <div class="row">
              <div class="col-md-12">
                <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true" style="margin-top: 10px;">
                  <div class="info-card accordion-card">
                    <div role="tab" id="headingOne">
                      <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne" class="info-card-header accordion-toggle" :class="{'is-open': workerDateOpen}" @click="workerDateOpen = !workerDateOpen">
                        <i class="fas fa-calendar-alt"></i>
                        <span>{{ ui.csm_trn_worker_date }}</span>
                        <span class="accordion-toggle-icon"><i class="fas fa-chevron-down"></i></span>
                      </a>
                    </div>
                    <div id="collapseOne" class="panel-collapse collapse " role="tabpanel" aria-labelledby="headingOne">
                      <div class="info-card-body">
                        <div class="row">
                          <div class="col-md-4 col-sm-4 col-xs-12">
                            <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.worker_start_date)&& formData.job_status!='H' && editDetailData.assign_empno == auth.empno}">
                              <label :class="{'text-danger': xt.isEmpty(editDetailData.worker_start_date) && editDetailData.assign_empno == auth.empno}" v-text="ui.worker_start_date || 'วันที่เริ่มงาน(Worker)'"></label>
                              <datepicker input-class="form-control input-sm" type="datetime" format="DD/MM/YYYY HH:mm" v-model.trim="editDetailData['worker_start_date']" :disabled="editDetailData.assign_empno != auth.empno|| formData.job_status=='H'"></datepicker>
                            </div>
                          </div>
                          <div class="col-md-4 col-sm-4 col-xs-12">
                            <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.worker_end_date) && editDetailData.assign_empno == auth.empno}">
                              <label :class="{'text-danger': xt.isEmpty(editDetailData.worker_end_date) && editDetailData.assign_empno == auth.empno}" v-text="ui.worker_end_date || 'วันที่คาดว่าจะเสร็จ(Worker)'"></label>
                              <datepicker input-class="form-control input-sm" v-model.trim="editDetailData['worker_end_date']" :disabled="editDetailData.assign_empno != auth.empno||  formData.job_status=='H'"></datepicker>
                            </div>
                          </div>
                          <div class="col-md-4 col-sm-4 col-xs-12">
                            <div class="form-group">
                              <label v-text="ui.worker_end_date || 'วันที่ส่งมอบงาน(Worker)'"></label>
                              <datepicker input-class="form-control input-sm" v-model.trim="editDetailData['worker_send_date']" :disabled="editDetailData.assign_empno != auth.empno"></datepicker>
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-4 col-sm-6 col-xs-12">
                            <div class="form-group">
                              <label :class="activeconfig.TRN001Q === 'Y' ? 'text-danger' : ''">{{ ui.csm_trn_alert_due_days.replace('{0}', editDetailData['alert_type'] === 'A' ? ui.csm_trn_after : ui.csm_trn_before) }}</label>
                              <number class="form-control input-sm" v-model="editDetailData['noti_date']"></number>
                            </div>
                          </div>
                          <div class="col-md-8 col-sm-6 col-xs-12">
                            <div class="form-group">
                              <label class="d-block">&nbsp;</label>
                              <div class="alert-status-row">
                                <span class="alert-chip" :class="{'alert-chip--on': editDetailData['noti_active'] === 'Y'}">
                                  <i class="fas fa-bell"></i> {{ ui.csm_trn_alert_active }}
                                </span>
                                <span class="alert-chip" :class="{'alert-chip--on': editDetailData['noti_line'] === 'Y'}">
                                  <i class="fab fa-line"></i> {{ ui.csm_trn_channel_line }}
                                </span>
                                <span class="alert-chip" :class="{'alert-chip--on': editDetailData['noti_email'] === 'Y'}">
                                  <i class="fas fa-envelope"></i> {{ ui.csm_v2_email }}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Contract Type (SCJV) -->
            <div class="row" v-if="company == 'SCJV'">
              <div class="col-md-6 col-sm-6 col-xs-12">
                <div class="form-group">
                  <label class="text-danger" v-text="ui.csm_trn_field_warranty_type"></label>
                  <select class="form-control input-sm" v-model.trim="editDetailData['contract_type']" ref="contract_type">
                    <option value="">{{ ui.csm_trn_select_placeholder }}</option>
                    <option value="Y">{{ ui.csm_trn_in_warranty }}</option>
                    <option value="N">{{ ui.csm_trn_out_warranty }}</option>
                  </select>
                </div>
              </div>
            </div>
            <!-- Item / Serial Number / AR Status -->
            <div class="row">
              <div class="col-md-4 col-sm-4 col-xs-12">
                <div class="form-group">
                  <label :class="activeconfig.TRN001R === 'Y' ? 'text-danger' : ''">{{ ui.csm_trn_item_product }}</label>
                  <input type="text" class="form-control input-sm" v-model.trim="editDetailData['item_name']" readonly />
                </div>
              </div>
              <div class="col-md-5 col-sm-5 col-xs-12" v-bind:class="{'col-md-4' : (company=='GIS' || company=='SCJV')}">
                <div class="form-group">
                  <label>{{ ui.csm_trn_serial_number_code }}</label>
                  <input type="text" class="form-control input-sm" v-model.trim="editDetailData['serial_number']" readonly />
                </div>
              </div>
              <div class="col-md-3 col-sm-3 col-xs-12" v-if="is_claim() && (company=='GIS' || company=='SCJV')">
                <div style="margin-top:25px;">
                  <span class="checkbox checkbox-inline" v-tooltip="'ติ๊กเลือก เพื่อทำ AR ที่โปรแกรม ERP'">
                    <label>
                      <input type="checkbox" v-model="editDetailData['ar_status']" true-value="Y" false-value="N" />
                      <span class="cr"><i class="cr-icon glyphicon glyphicon-ok"></i></span> {{ ui.csm_trn_alert_open_invoice }}
                    </label>
                  </span>
                </div>
              </div>
            </div>
            <!-- Price (claim) -->
            <div class="row" v-if="is_claim() && company != 'GIS'">
              <div class="col-md-6 col-sm-6 col-xs-12">
                <div class="form-group">
                  <label>{{ ui.csm_trn_price_extra }}</label>
                  <div class="input-group">
                    <span class="input-group-addon"><i class="fas fa-coins"></i></span>
                    <number decimals="2" class="form-control input-sm" v-model="editDetailData['claim_price']" :disabled="!is_claim()"></number>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
          <!-- Worker row + Add Worker button + Worker No. -->
          <div class="row align-items-end">
            <!-- Fieldset เฉพาะ Worker -->
            <fieldset class="d-flex flex-wrap col-lg-8 col-md-9 col-sm-10"
                      v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno) || editDetailData.status != 'W'">
              <div class="col-md-5 col-sm-6 col-xs-12">
                <div class="form-group mb-0">
                  <label>{{ ui.csm_trn_worker_paren }}</label>
                  <span class="input-shell has-two">
                    <input type="text" class="form-control input-sm" v-model.trim="editDetailData['assign_empno']" readonly />
                    <button class="input-action search" @click="empModalSelected('assign_detail')" :title="ui.search">
                      <i class="fa fa-search"></i>
                    </button>
                    <button class="input-action danger" @click="clearData(editDetailData, ['assign_empno', 'assign_empno_name', ])" :title="ui.csm_trn_clear_data">
                      <i class="fa fa-close"></i>
                    </button>
                  </span>
                </div>
              </div>
              <div class="col-md-7 col-sm-6 col-xs-12">
                <div class="form-group mb-0">
                  <label class="d-block">
                    <a href="#" @click.prevent="openCalenderModal()">{{ ui.csm_trn_check_worker_schedule_paren }}</a>
                  </label>
                  <input type="text" class="form-control input-sm" v-model.trim="editDetailData['assign_empno_name']" readonly />
                </div>
              </div>
            </fieldset>
            <!-- Add Worker Button -->
            <div class="col-md-2 col-sm-2 col-xs-6">
              <div class="form-group mb-0 text-center">
                <label class="d-block">&nbsp;</label>
                <button class="btn btn-sm btn-primary btn-block" @click="openAddWork('add-worker')">
                  <i class="fa fa-plus"></i> {{ ui.csm_trn_worker }}
                </button>
              </div>
            </div>
            <!-- Worker No. -->
            <div class="col-md-1 col-sm-2 col-xs-6">
              <div class="form-group mb-0 text-center">
                <label class="d-block">{{ ui.csm_trn_worker_no }}</label>
                <span class="worker-count-badge">{{ refWorkerCount }}</span>
              </div>
            </div>
          </div>


          <fieldset v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno) || editDetailData.status != 'W'">
            <!-- Checker (QC) -->
            <div class="row" v-if="is_qc()">
              <div class="col-md-4 col-sm-4 col-xs-12">
                <div class="form-group">
                  <label>{{ ui.csm_trn_checker_paren }}</label>
                  <span class="input-group">
                    <input type="text" class="form-control input-sm" v-model.trim="editDetailData['tester_empno']" readonly />
                    <span class="input-group-btn">
                      <button class="btn btn-sm bg-navy" @click="empModalSelected('tester')"><i class="fa fa-search"></i></button>
                      <button class="btn btn-sm btn-danger" @click="clearData(editDetailData, ['tester_empno', 'tester_empno_name'])"><i class="fa fa-close"></i></button>
                    </span>
                  </span>
                </div>
              </div>
              <div class="col-md-8 col-sm-8 col-xs-12">
                <div class="form-group">
                  <label class="pull-right">{{ ui.csm_v2_note }} <i class="fas fa-info-circle text-danger" v-tooltip=" 'ข้อมูลของ Worker กับ Checker จะถูก Default ข้อมูลไว้ก่อน สามารถเปลี่ยนได้' "></i></label>
                  <input type="text" class="form-control input-sm" v-model.trim="editDetailData['tester_empno_name']" readonly />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <div class="row">
              <div class="col-md-12">
                <div class="panel-group" id="accordionLocation" role="tablist" aria-multiselectable="true" style="margin-top: 10px;">
                  <div class="info-card accordion-card">
                    <div role="tab" id="headingLocation">
                      <a role="button" data-toggle="collapse" data-parent="#accordionLocation" href="#collapseLocation" aria-expanded="true" aria-controls="collapseLocation" class="info-card-header accordion-toggle" :class="{'is-open': locationOpen}" @click="locationOpen = !locationOpen">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>{{ ui.csm_trn_workplace }}</span>
                        <span class="accordion-toggle-icon"><i class="fas fa-chevron-down"></i></span>
                      </a>
                    </div>
                    <div id="collapseLocation" class="panel-collapse collapse " role="tabpanel" aria-labelledby="headingLocation">
                      <div class="info-card-body">
                        <div class="row">
                          <div class="col-md-12">
                            <div class="form-group">
                              <label :class="activeconfig.TRN001S === 'Y' ? 'text-danger' : ''">{{ ui.erp_google_map_url }}</label>
                              <span class="input-shell">
                                <input type="text" class="form-control input-sm" v-model="editDetailData['map_url']" placeholder="https://goo.gl/maps/" :disabled="!xt.isEmpty(editDetailData['ref_docno'])" />
                                <button class="input-action" @click="openMapUrl(editDetailData['map_url'])" :title="ui.csm_trn_open_map"><i class="fas fa-map"></i></button>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-12">
                            <div class="form-group">
                              <label :class="activeconfig.TRN001T === 'Y' ? 'text-danger' : ''">{{ ui.erp_gps_coordinate_dd_lat_lng }}</label>
                              <span class="input-shell">
                                <input type="text" class="form-control input-sm" v-model="editDetailData['map_gps']" placeholder="10.00000, 10.00000" :disabled="!xt.isEmpty(editDetailData['ref_docno'])" />
                                <button class="input-action" @click="openModalLocation(editDetailData['map_gps'])" :title="ui.csm_trn_preview_map"><i class="fas fa-map-marked-alt"></i></button>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-12">
                            <div class="form-group">
                              <label :class="activeconfig.TRN001U === 'Y' ? 'text-danger' : ''">{{ ui.csm_v2_description }}</label> <span class="pull-right">{{xt.textLength(editDetailData['map_desc'], 2000)}}</span>
                              <input type="text" class="form-control input-sm" v-model="editDetailData['map_desc']" maxlength="2000" :disabled="!xt.isEmpty(editDetailData['ref_docno'])" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
          <div v-if="(isEditDetail || isViewOnly)">
            <fieldset v-show="formData['request_empno'] == auth.empno && ['S','T','X'].includes(editDetailData['status_tmp']) && (is_qc() ? editDetailData['tester_test_status'] == 'Y' : !['T'].includes(editDetailData['tester_test_status']))">
              <div class="row">
                <div class="col-lg-10 col-md-12 col-sm-12">
                  <div class="box box-info">
                    <div class="box-header with-border">
                      <h3 class="box-title"><i class="fa fa-folder-open"></i> {{ ui.csm_trn_requester_status }}</h3>
                    </div>
                    <div class="box-body">
                      <div class="status-radio-group">
                        <div class="icheck-material-amber">
                          <input type="radio" id="req_status1" v-model="editDetailData['status']" value="B" />
                          <label for="req_status1">{{ ui.csm_home_send_back }}</label>
                        </div>
                        <div class="icheck-material-deeppurple">
                          <input type="radio" id="req_status2" v-model="editDetailData['status']" value="T" />
                          <label for="req_status2">{{ ui.csm_trn_status_test }}</label>
                        </div>
                        <div class="icheck-material-green">
                          <input type="radio" id="req_status3" v-model="editDetailData['status']" value="Y" />
                          <label for="req_status3">{{ ui.csm_v2_status_finished }}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>


            <fieldset v-show="editDetailData['assign_empno'] == auth.empno && (!['X','T','Y'].includes(editDetailData['status_tmp'])) && formData['job_status'] !='H' && !is_qc()">
              <div class="row">

                <div class="col-lg-10 col-md-12 col-sm-12">
                  <div class="box box-info">
                    <div class="box-header with-border">
                      <h3 class="box-title"><i class="fa fa-folder-open"></i> {{ ui.csm_trn_worker_status }}</h3>
                    </div>
                    <div class="box-body">
                      <div class="status-radio-group">
                        <div class="icheck-material-cyan">
                          <input type="radio" id="taskStatus1" v-model="editDetailData['status']" value="W" />
                          <label for="taskStatus1">{{ ui.erp_none }}</label>
                        </div>
                        <div class="icheck-material-red">
                          <input type="radio" id="taskStatus2" v-model="editDetailData['status']" value="R" />
                          <label for="taskStatus2">{{ ui.erp_reject }}</label>
                        </div>
                        <div class="icheck-material-cyan">
                          <input type="radio" id="taskStatus3" v-model="editDetailData['status']" value="I" />
                          <label for="taskStatus3">{{ ui.csm_v2_status_in_progress }}</label>
                        </div>
                        <div class="icheck-material-amber">
                          <input type="radio" id="taskStatus4" v-model="editDetailData['status']" value="H" />
                          <label for="taskStatus4">{{ ui.csm_trn_status_hold }}</label>
                        </div>
                        <div class="icheck-material-green">
                          <input type="radio" id="taskStatus5" v-model="editDetailData['status']" value="S" />
                          <label for="taskStatus5">{{ ui.csm_trn_send_pretest }}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>


            <fieldset v-show="(editDetailData['assign_empno'] == auth.empno  ) && !['S','T','Y','U'].includes(editDetailData['status_tmp']) && !['H'].includes(formData['job_status'])  && is_qc()">
              <div class="row">
                <div class="col-lg-10 col-md-12 col-sm-12">
                  <span class="pull-right"><b class="text-danger">{{ ui.csm_trn_note_for_worker }} : </b> {{ ui.csm_trn_note_checker_first }}</span>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-10 col-md-10 col-sm-12">
                  <div class="box box-info">
                    <div class="box-header with-border">
                      <h3 class="box-title"><i class="fa fa-folder-open"></i> {{ ui.csm_trn_worker_status_qc }}</h3>
                    </div>
                    <div class="box-body">
                      <div class="status-radio-group">
                        <div class="icheck-material-cyan">
                          <input type="radio" id="qcStatus1" v-model="editDetailData['status']" value="W" />
                          <label for="qcStatus1">{{ ui.erp_none }}</label>
                        </div>
                        <div class="icheck-material-red">
                          <input type="radio" id="qcStatus2" v-model="editDetailData['status']" value="R" />
                          <label for="qcStatus2">{{ ui.erp_reject }}</label>
                        </div>
                        <div class="icheck-material-cyan">
                          <input type="radio" id="qcStatus3" v-model="editDetailData['status']" value="I" />
                          <label for="qcStatus3">{{ ui.csm_v2_status_in_progress }}</label>
                        </div>
                        <div class="icheck-material-amber">
                          <input type="radio" id="qcStatus4" v-model="editDetailData['status']" value="H" />
                          <label for="qcStatus4">{{ ui.csm_trn_status_hold }}</label>
                        </div>
                        <div class="icheck-material-green">
                          <input type="radio" id="qcStatus5" v-model="editDetailData['status']" value="X" />
                          <label for="qcStatus5">{{ ui.csm_trn_send_to_qc }}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
            <fieldset v-show="editDetailData['tester_empno'] == auth.empno && formData['assign_empno'] != auth.empno && editDetailData['send_pretest_to_tester_status'] == 'Y'">
              <div class="row">
                <div class="col-lg-10 col-md-12 col-sm-12">
                  <div class="box box-info">
                    <div class="box-header with-border">
                      <h3 class="box-title"><i class="fa fa-folder-open"></i> {{ ui.csm_trn_checker_status }}</h3>
                    </div>
                    <div class="box-body">
                      <div class="status-radio-group">
                        <div class="icheck-material-amber">
                          <input type="radio" id="testerStatus1" v-model="editDetailData['tester_test_status']" value="B" />
                          <label for="testerStatus1">{{ ui.csm_home_send_back }}</label>
                        </div>
                        <div class="icheck-material-deeppurple">
                          <input type="radio" id="testerStatus2" v-model="editDetailData['tester_test_status']" value="T" />
                          <label for="testerStatus2">{{ ui.csm_trn_status_test }}</label>
                        </div>
                        <div class="icheck-material-green">
                          <input type="radio" id="testerStatus3" v-model="editDetailData['tester_test_status']" value="Y" />
                          <label for="testerStatus3">{{ ui.csm_v2_status_finished }}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
          <fieldset v-bind:disabled="['Y'].includes(editDetailData['status_tmp'])" v-if="['R','H'].includes(editDetailData['status'])">
            <div class="row">
              <div class="col-lg-10 col-md-10 col-sm-10">
                <div class="form-group">
                  <label for="" class="text-danger"> {{editDetailData['status'] == 'R' ? ui.erp_reject : ui.csm_trn_status_hold}} {{ ui.erp_remark }}: *</label>
                  <textarea v-if="editDetailData['status'] == 'R'" class="form-control input-sm" rows="6" v-model.trim="editDetailData['reject_remark']" ref="reject_remark"></textarea>
                  <textarea v-else class="form-control input-sm" rows="6" v-model.trim="editDetailData['remark']" ref="remark"></textarea>
                </div>
              </div>
            </div>
          </fieldset>
        </div>
        <div class="col-lg-5 col-md-5 col-sm-5">
          <div class="row">
            <div class="col-lg-12 col-md-12 col-sm-12">
              <div class="box box-success" id="WarrantyBox">
                <div class="box-header with-border">
                  <h3 class="box-title"><i class="ion ion-folder"></i> {{ ui.csm_trn_warranty_by_project }}</h3>
                  <div class="box-tools pull-right">
                    <button type="button" class="btn btn-box-tool" data-widget="collapse">
                      <i class="fas fa-minus"></i>
                    </button>
                  </div>
                </div>
                <div class="box-body">
                  <!-- Detail : Search Keyword -->
                  <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12">
                      <div class="form-group">
                        <div class="input-group">
                          <input type="text" class="form-control input-sm" @keyup.enter="searchWarranty()" style="border-block-width: 1px;border-color: red;" v-model.trim="war_text" :placeholder="ui.csm_trn_warranty_search_ph" />
                          <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click="searchWarranty()"><i class="ion ion-search"></i></button></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Detail : Tab Customer and Supplier -->
                  <div class="nav-tabs-custom">
                    <ul class="nav nav-tabs">
                      <li :class="{active:tabWarrantyActive===0}"><a href="#" @click.prevent="changeTab(0)">{{ ui.csm_trn_warranty_item_count.replace('{0}', customerWarData.length || 0) }}</a></li>
                    </ul>
                    <div class="tab-content">
                      <!-- Detail : Customer -->
                      <div class="tab-pane" v-bind:class="{active:tabWarrantyActive===0}">
                        <!-- Table Customer -->
                        <div class="warranty-ag-table-wrap">
                          <ag-table ref="warrantyTable" :scale="400" :footer="false" @ready="initWarrantyTable()" @cell-clicked="onWarrantyCellClicked($event)"></ag-table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- End : Template For Customer -->
    </div>
    <br />
    <!-- Modal :Add Worker -->
    <add-worker-modal ref="openAddWork1"
                      :modalWorkers="modalWorkers"
                      :canEdit_="canEdit_"
                      :addWorkerLine="addWorkerLine"
                      :empModalSelectedWorker="empModalSelectedWorker"
                      :removeWorkerLine="removeWorkerLine"
                      :UpdateRefWork="UpdateRefWork"></add-worker-modal>
    <!-- Modal : Alert Update SW Auto -->
    <alert-sw-modal ref="AlertSW" :formData="formData" :showPDf="showPDf"></alert-sw-modal>
    <vue-form-list ref="form_modal_1" id="form_modal_1" :customer_code="formData['customer_code']" :pre_event="formData['pre_event']" :package_code="formData['package_code']" :formcode="editDetailData['formcode']" :item_type="editDetailData['item_type']" @send-data="sendComponent($event, 'form')"></vue-form-list>
    <vue-employee-list ref="ct_emp_ref" :default-show-all="true" @send-data="sendComponent1($event, 'emp_work')"></vue-employee-list>
    <vue-responsible-employee-list ref="ct_responsible_emp" :pre_event="formData.pre_event" @send-data="sendComponent1($event, 'emp')"></vue-responsible-employee-list>
    <!-- Modal : AI Analysis Result -->
    <ai-analysis-edit-modal ref="ai_analysis_modal_edit"
                           :canSaveAiExcel="canSaveAiExcel"
                           :aiAnalysisLoading="aiAnalysisLoading"
                           :runAiAnalysis="runAiAnalysis"
                           :editDetailData="editDetailData"
                           :aiModalTab.sync="aiModalTab"
                           :onClickCompareSpecTab="onClickCompareSpecTab"
                           :aiAnalysisModalDifficultyLevel="aiAnalysisModalDifficultyLevel"
                           :difficultyStyle="difficultyStyle"
                           :aiAnalysisModalEstimatedEndDate="aiAnalysisModalEstimatedEndDate"
                           :formatThaiDate="formatThaiDate"
                           :aiAnalysisModalEstimatedDays="aiAnalysisModalEstimatedDays"
                           :aiAnalysisModalDifficultyReason="aiAnalysisModalDifficultyReason"
                           :aiAnalysisSectionList="aiAnalysisSectionList"
                           :aiAnalysisModalText="aiAnalysisModalText"
                           :aiEffectiveWorkerSection5="aiEffectiveWorkerSection5"
                           :aiAnalysisModalTextWk="aiAnalysisModalTextWk"
                           :canEditAiChecklist="canEditAiChecklist"
                           :syncAiAnalysisFromMaster="syncAiAnalysisFromMaster"
                           :aiAnalysisChecklist="aiAnalysisChecklist"
                           :aiCompareSpecLoading="aiCompareSpecLoading"
                           :aiCompareSpecError="aiCompareSpecError"
                           :aiCompareSpecData="aiCompareSpecData"
                           :runAiCompareSpec="runAiCompareSpec"
                           :isMango="isMango"
                           :aiAnalysisChecklistSaving="aiAnalysisChecklistSaving"
                           :updateAiAnalysisChecklist="updateAiAnalysisChecklist"
                           :aiAnalysisExcelLoading="aiAnalysisExcelLoading"
                           :generateAiAnalysisChecklistExcel="generateAiAnalysisChecklistExcel"
                           :aiAnalysisPdfLoading="aiAnalysisPdfLoading"
                           :generateAiAnalysisPdf="generateAiAnalysisPdf"
                           :aiCompareSpecPdfLoading="aiCompareSpecPdfLoading"
                           :canCompareDefect="canCompareDefect"
                           :aiCompareDefectLoading="aiCompareDefectLoading"
                           :aiCompareDefectError="aiCompareDefectError"
                           :aiCompareDefectData="aiCompareDefectData"
                           :runAiCompareDefect="runAiCompareDefect"
                           :aiCompareDefectPdfLoading="aiCompareDefectPdfLoading"
                           :generateAiCompareDefectPdf="generateAiCompareDefectPdf"
                           :generateAiCompareSpecPdf="generateAiCompareSpecPdf"></ai-analysis-edit-modal>
  </div>
</template>
<script>
  import { mapState, mapGetters } from '~/stores/helpers'
  export default {
    name: 'ControlOpen',
    props: {
      is_mango: Function,
      formData: Object,
      attachmentData: Array,
      allWorkers: Array,
      allWorkers: Array,
      statusClass: Function,
      statusName: Function,
      editDetailData: Object,
      filterService: Function,
      itemTypeChange: Function,
      openDescModal1: Function,
      checkRisk: Function,
      showRisk: Function,
      appendRows: Function,
      spliceRows: Function,
      fromLine_req: Function,
      datePriority: Function,
      empModalSelected: Function,
      clearData: Function,
      recoveryTesterTasks: Function,
      emp_is_software_tester: Function,
      is_qc: Function,
      recoveryTasks: Function,
      company: String,
      is_claim: Function,
      openMapUrl: Function,
      openModalLocation: Function,
      customerWarData: Array,
      // service_group_select2x: Array,
      // filteredOptionsX: Array,
      filterSubData: Function,
      filterSubData2: Function,
      moduleCodeData: Array,
      SearchWarrantyx: Function,
      isEditDetail: Boolean,
      isViewOnly: Boolean,
      // war_text: String,
      isView: Boolean,
      warCheck: Number,
      isAdmin: Boolean,
      newModuleForMango: Array,

      moduleChange: Function,
      newPlatformCodeData: Array,
      newRequestCodeData: Array,
      filterJobType: Function,
      numericOnly: Function,
      selectedWarrantyItem: Function,
      // formatOption:Function,
      // formatSelection:Function,
      sendComponent: Function,
      loadCustomerWarranty:Function,
      loadSupplierWarranty:Function,
      // createBr:Funtion
      activeconfig: [Object, Array],
      calProgress: Function,
      itupdateAuto: String,
      list_emp_sa_mg: String,
      program_list: [Object, Array],
    },
    components: {
      WorkerRefAction: {
        name: "WorkerRefAction",
        props: {
          refWorkerText: {
            type: [String, Number],
            default: "",
          },
        },
        data() {
          return {
            ui: window.ui,
          }
        },
        // Single row: [lead slot — grows] [+ Worker] [counter + trail slot].
        // The lead slot absorbs the free width, which pushes the button and the
        // trailing pair to the right edge; the pair is wrapped so it stays together
        // when either member is removed by v-if.
        template: `
      <div class="wa-actions">
        <slot name="lead"></slot>
        <button class="btn btn-primary wa-add-btn" @click="$emit('add-worker')">
          <i class="fa fa-plus"></i> {{ ui.csm_trn_worker }}
        </button>
        <span class="wa-actions-trail">
          <span class="wa-worker-no-cell">
            <span class="wa-worker-no-label">{{ ui.csm_trn_worker_no }}</span>
            <span class="form-control input-sm text-center text-bold wa-worker-no">{{ refWorkerText }}</span>
          </span>
          <slot name="trail"></slot>
        </span>
      </div>`,
      },
    },
    data() {
      return {
        isNarrow: window.matchMedia('(max-width: 939px)').matches,
        auth,
        baseUrl,
        ui: window.ui,
        xt: $xt,
        aiAnalysisLoading: false,
        aiAnalysisPdfLoading: false,
        aiAnalysisExcelLoading: false,
        aiAnalysisModalText: '',
        aiAnalysisModalTextWk: '',
        aiModalTab: 'master',
        aiAnalysisModalDifficultyLevel: null,
        aiAnalysisModalDifficultyReason: '',
        aiAnalysisModalEstimatedDays: null,
        aiAnalysisModalEstimatedEndDate: null,
        aiAnalysisChecklist: {},
        aiAnalysisChecklistSaving: false,
        aiCompareSpecLoading: false,
        aiCompareSpecData: null,
        aiCompareSpecError: '',
        aiCompareSpecPdfLoading: false,
        aiCompareDefectLoading: false,
        aiCompareDefectData: null,
        aiCompareDefectError: '',
        aiCompareDefectPdfLoading: false,
        tabWarrantyActive: 0,
        workerDateOpen: true,
        locationOpen: true,
        workerAssignOpen: true,
        taskInfoOpen: true,
        scheduleOpen: true,
        // Worker Status / Progress sections. The QC and non-QC status blocks are
        // mutually exclusive (is_qc()), so one pair of flags serves both.
        statusSecOpen: true,
        progressSecOpen: true,
        gaugeDragging: false,
        gaugeTrackEl: null,
        war_text: '',
        supplierData: [],
        n_manhour:'',
        hours: Array.from({ length: 10 }).map((_, i) => i + 8),
        v_manhour:0,
        localManhour: null,
        workers: [],
        rowWorker: '',
        deputy_Worker:[],
        numWork: 0,
        modalWorkers: [],
        allWorkersLocal: [],
        showPDf: baseUrl + "vendor/Content/Images/PDF/UpdateSoftwareManual.pdf" ,

      }
    },
    methods: {
      onNarrowResize() {
        // ใช้ matchMedia ให้ตรงกับ @media (max-width: 939px) เป๊ะ ๆ
        // window.innerWidth นับความกว้าง scrollbar รวมด้วย จึงมีช่วง ~17px
        // ที่ JS กับ CSS ตัดสินไม่เหมือนกัน
        this.isNarrow = window.matchMedia('(max-width: 939px)').matches
      },
      changeTab(t) {
        this.tabWarrantyActive = t
      },
      initWarrantyTable() {
        let agr = this.$refs.warrantyTable
        let rowBg = (params) => params.data.bg_status ? { backgroundColor: params.data.bg_status } : null
        let fields = [
          ['itemno', '', 'text', {
            width: 50,
            align: 'center', pinned: 'left',
            sortable: false,
            cellStyle: rowBg,
            cellRenderer: (params) => {
              let checked = this.warCheck === params.data.itemno
              let disabled = this.editDetailData.approve_status === 'Y'
              return `<div class="form-check form-switch form-check-custom form-check-solid form-check-sm">
                <input class="form-check-input h-20px w-30px" type="checkbox" style="pointer-events:none;" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
              </div>`
            },
          }],
          ['locname', this.ui.csm_trn_field_area, 'text', { width: 140, align: 'left', sortable: false, cellStyle: rowBg }],
          ['war_des', this.ui.csm_v2_task, 'text', { width: 160, align: 'left', sortable: false, cellStyle: rowBg }],
          ['serial_number', this.ui.erp_serial_number, 'text', { width: 180, align: 'left', sortable: false, cellStyle: rowBg }],
          ['war_code', this.ui.csm_trn_warranty_code, 'text', { width: 140, align: 'left', sortable: false, cellStyle: rowBg }],
          ['remark', 'Remark', 'text', { width: 140, align: 'left', sortable: false, cellStyle: rowBg }],
          ['', this.ui.csm_trn_date_warranty_customer, 'text', {
                    width: 200,  child: [
                    ['startdate', this.ui.csm_trn_start_date, 'text', {
                      width: 160, align: 'center', sortable: false, cellStyle: rowBg,
                      cellRenderer: (params) => $xt.formatDate(params.value),
                    }],
                    ['enddate', this.ui.erp_expire_date, 'text', {
                      width: 160, align: 'center', sortable: false, cellStyle: rowBg,
                      cellRenderer: (params) => $xt.formatDate(params.value),
                    }],
                    ]
                  }],
          ['remainingCus', this.ui.erp_remain, 'text', {
            width: 150, align: 'center', sortable: false, cellStyle: rowBg,
            cellRenderer: (params) => params.data.lifetime === 'Y' ? this.ui.csm_trn_lifetime : (params.value || ''),
          }],
          ['vendor', 'Vendor', 'text', {
            width: 140, align: 'left', sortable: false, cellStyle: rowBg,
            cellRenderer: (params) => (!$xt.isEmpty(params.data.ic_docno) && !$xt.isEmpty(params.data.ic_itemno)) ? (params.data.vendorIC || '') : (params.data.vendor || ''),
          }],
           ['', this.ui.csm_trn_date_warranty_vendor, 'text', {
                    width: 200, child: [
                         ['war_date_start', this.ui.csm_trn_start_date, 'text', {
                        width: 160, align: 'center', sortable: false, cellStyle: rowBg,
                        cellRenderer: (params) => $xt.formatDate((!$xt.isEmpty(params.data.ic_docno) && !$xt.isEmpty(params.data.ic_itemno)) ? params.data.war_date_start : params.data.vendor_start_dt),
                      }],
                      ['war_date_end', this.ui.erp_expire_date, 'text', {
                        width: 160, align: 'center', sortable: false, cellStyle: rowBg,
                        cellRenderer: (params) => $xt.formatDate((!$xt.isEmpty(params.data.ic_docno) && !$xt.isEmpty(params.data.ic_itemno)) ? params.data.war_date_end : params.data.vendor_end_dt),
                      }],
                    ]
                  }],
          ['vendor_remark', this.ui.csm_trn_remark_vendor, 'text', { width: 160, align: 'left', sortable: false, cellStyle: rowBg }],
          ['remainingVendor', this.ui.erp_remain, 'text', { width: 160, align: 'center', sortable: false, cellStyle: rowBg }],
        ]
        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)
        this.refreshWarrantyTable()
      },
      refreshWarrantyTable() {
        if (this.$refs.warrantyTable) {
          this.$refs.warrantyTable.setDisplay(this.customerWarData || [])
        }
      },
      onWarrantyCellClicked(e) {
        if (e.col === 'itemno' && this.editDetailData.approve_status !== 'Y') {
          this.selectedWarrantyItem(e.data)
          this.$nextTick(() => this.refreshWarrantyTable())
        }
      },
      async runAiAnalysis() {
        this.aiAnalysisLoading = true
        try {
          let rsp = await $xt.postServerJson('CSM/Data/AiAnalysisTask', { job_no: this.formData.job_no, itemno: this.editDetailData.itemno })
          if (!rsp.success) {
            $msg.alert(this.ui.csm_v2_warning, rsp.error, `warning`)
            return
          }
          this.editDetailData.ai_analysis_result = rsp.data.ai_analysis_result
          this.editDetailData.ai_analysis_result_wk = rsp.data.ai_analysis_result_wk
          if (rsp.data.difficulty_level) {
            this.editDetailData.level_task = String(rsp.data.difficulty_level)
          }
          if (rsp.data.estimated_end_date) {
            this.editDetailData.worker_end_date = new Date(rsp.data.estimated_end_date)
          }
          this.openAiAnalysisModal()
        } finally {
          this.aiAnalysisLoading = false
        }
      },
      openAiAnalysisModal() {
        this.aiModalTab = 'master'
        this.aiAnalysisModalText = this.editDetailData.ai_analysis_result || ''
        this.aiAnalysisModalTextWk = this.editDetailData.ai_analysis_result_wk || ''
        this.aiAnalysisModalDifficultyLevel = this.editDetailData.level_task || null
        this.aiAnalysisModalDifficultyReason = this.parseAiDifficultyReason(this.aiAnalysisModalText)
        this.aiAnalysisModalEstimatedDays = this.parseAiEstimateDays(this.aiAnalysisModalText)
        this.aiAnalysisModalEstimatedEndDate = this.editDetailData.worker_end_date || null
        this.aiCompareSpecData = null
        this.aiCompareSpecError = ''
        this.aiCompareDefectError = ''
        this.aiCompareDefectData = this.parseAiCompareDefect(this.editDetailData.ai_compare_defect)
        this.refreshAiChecklistState()
        this.$refs.ai_analysis_modal_edit.setSize('modal-lg')
        this.$refs.ai_analysis_modal_edit.openModal()
      },
      parseAiCompareDefect(raw) {
        if ($xt.isEmpty(raw)) return null
        try {
          return typeof raw === 'string' ? JSON.parse(raw) : raw
        } catch (ex) {
          return null
        }
      },
      async runAiCompareDefect() {
        if (!this.editDetailData.itemno) return
        this.aiCompareDefectLoading = true
        this.aiCompareDefectError = ''
        try {
          let rsp = await $xt.postServerJson('CSM/Data/AiCompareDefectTask', { job_no: this.formData.job_no, itemno: this.editDetailData.itemno })
          if (!rsp.success) {
            this.aiCompareDefectError = rsp.error
            return
          }
          this.aiCompareDefectData = rsp.data
          this.editDetailData.ai_compare_defect = JSON.stringify(rsp.data)
        } finally {
          this.aiCompareDefectLoading = false
        }
      },
      async generateAiCompareDefectPdf() {
        if (!this.editDetailData.itemno || !this.aiCompareDefectData) return
        this.aiCompareDefectPdfLoading = true
        try {
          let rsp = await $xt.postServerJson('CSM/Data/GenerateAiCompareDefectPdf', {
            job_no: this.formData.job_no,
            itemno: this.editDetailData.itemno
          })
          if (!rsp.success) {
            $msg.alert(this.ui.csm_v2_warning, rsp.error, `warning`)
            return
          }
          let filename = encodeURIComponent(rsp.data.filename || 'AI_CompareDefect.pdf')
          let url = `${dataServer}Api/File/DownLoad?id=${rsp.data.id}&download=true&filename=${filename}`
          window.open(url, '_blank')
        } finally {
          this.aiCompareDefectPdfLoading = false
        }
      },
      onClickCompareSpecTab() {
        this.aiModalTab = 'compare'
        if (!this.aiCompareSpecData && !this.aiCompareSpecLoading) {
          this.runAiCompareSpec()
        }
      },
      async runAiCompareSpec() {
        if (!this.editDetailData.itemno) return
        this.aiCompareSpecLoading = true
        this.aiCompareSpecError = ''
        this.aiCompareSpecData = null
        try {
          let rsp = await $xt.postServerJson('CSM/Data/AiCompareSpecTask', { job_no: this.formData.job_no, itemno: this.editDetailData.itemno })
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
        if (!this.editDetailData.itemno || !this.aiCompareSpecData) return
        this.aiCompareSpecPdfLoading = true
        try {
          let rsp = await $xt.postServerJson('CSM/Data/GenerateAiCompareSpecPdf', {
            job_no: this.formData.job_no,
            itemno: this.editDetailData.itemno,
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
            itemno: this.editDetailData.itemno
          })
          if (!rsp.success) {
            $msg.alert(this.ui.csm_v2_warning, rsp.error, `warning`)
            return
          }
          this.editDetailData.ai_analysis_result_wk = rsp.data.ai_analysis_result_wk
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
          itemno: this.editDetailData.itemno,
          checked_steps: checkedSteps
        })
        if (!rsp.success) {
          $msg.alert(this.ui.csm_v2_warning, rsp.error, `warning`)
          return false
        }
        this.editDetailData.ai_analysis_result_wk = rsp.data.ai_analysis_result_wk
        this.aiAnalysisModalTextWk = rsp.data.ai_analysis_result_wk
        this.refreshAiChecklistState()
        return true
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
      async updateAiAnalysisChecklist() {
        this.aiAnalysisChecklistSaving = true
        try {
          await this.saveAiChecklistState()
        } finally {
          this.aiAnalysisChecklistSaving = false
        }
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
      parseAiTagBlock(text, tagName) {
        if (!text) return ''
        const tagMatch = text.match(new RegExp('^[#*_>\\s]*\\[' + tagName + '\\][#*_\\s]*$', 'm'))
        if (!tagMatch) return ''
        const rest = text.substring(tagMatch.index + tagMatch[0].length)
        const nextTagMatch = rest.match(/^[#*_>\s]*\[[A-Z0-9_]+\][#*_\s]*$/m)
        return (nextTagMatch ? rest.substring(0, nextTagMatch.index) : rest).trim()
      },
      parseAiDifficultyReason(text) {
        const block = this.parseAiTagBlock(text, 'DIFFICULTY')
        const numMatch = block.match(/[1-5]/)
        if (!numMatch) return ''
        return block.substring(numMatch.index + 1).trim().replace(/^[.:\-)]+/, '').trim()
      },
      parseAiEstimateDays(text) {
        const block = this.parseAiTagBlock(text, 'ESTIMATE_DAYS')
        const numMatch = block.match(/\d+/)
        return numMatch ? parseInt(numMatch[0], 10) : null
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
        this.aiAnalysisPdfLoading = true
        try {
          if (this.isMango && this.canEditAiChecklist) {
            const saved = await this.saveAiChecklistState()
            if (!saved) return
          }
          let rsp = await $xt.postServerJson('CSM/Data/GenerateAiAnalysisPdf', { job_no: this.formData.job_no, itemno: this.editDetailData.itemno })
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
        const choice = await this.confirmExcelSaveChoice()
        if (!choice) return
        this.aiAnalysisExcelLoading = true
        try {
          if (this.isMango && this.canEditAiChecklist) {
            const saved = await this.saveAiChecklistState()
            if (!saved) return
          }
          let rsp = await $xt.postServerJson('CSM/Data/GenerateAiAnalysisChecklistExcel', { job_no: this.formData.job_no, itemno: this.editDetailData.itemno, save_attachment: choice === 'save' })
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
      async searchWarranty() {
        await Promise.all([this.loadCustomerWarranty(), this.loadSupplierWarranty()])

        this.$eventBus.$emit('trigger-search-warranty', this.war_text);
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
      reset() {
        this.war_text = ""
        // this.localCustomerWarData = []
        // this.loadCustomerWarranty()
        // this.loadSupplierWarranty()
      },
      onProgressInput(n) {
        let val = parseFloat(n)
        if (val < -100) {
          this.editDetailData['n_progress'] = -100
        } else if (val > 100) {
          this.editDetailData['n_progress'] = 100
        }
      },
      isValidDate(type) {
        const start = this.editDetailData.worker_start_date;
        const end = this.editDetailData.worker_end_date;

        if (!start || !end) return;

        const startMoment = moment(start);
        const endMoment = moment(end);

        if (!startMoment.isValid() || !endMoment.isValid()) return;

        if (startMoment.isAfter(endMoment, 'day')) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_alert_end_before_start, 'warning');

          if (type === 'start') {
            this.editDetailData.worker_start_date = null;
          } else if (type === 'end') {
            this.editDetailData.worker_end_date = null;
          }
        }
      },
      async SearchArea() {
        this.SearchWarrantyx()
        await this.loadCustomerWarranty()
      },
      onGaugeDown(e) {
        if (this.progressLocked) return
        const track = e.currentTarget
        if (track.closest('fieldset[disabled]')) return
        e.preventDefault()
        track.focus()
        this.gaugeTrackEl = track
        this.gaugeDragging = true
        this.setGaugeFromEvent(e)
        document.addEventListener('mousemove', this.onGaugeMove)
        document.addEventListener('mouseup', this.onGaugeUp)
        document.addEventListener('touchmove', this.onGaugeMove, { passive: false })
        document.addEventListener('touchend', this.onGaugeUp)
      },
      onGaugeMove(e) {
        if (!this.gaugeDragging) return
        e.preventDefault()
        this.setGaugeFromEvent(e)
      },
      onGaugeUp() {
        this.gaugeDragging = false
        this.gaugeTrackEl = null
        document.removeEventListener('mousemove', this.onGaugeMove)
        document.removeEventListener('mouseup', this.onGaugeUp)
        document.removeEventListener('touchmove', this.onGaugeMove)
        document.removeEventListener('touchend', this.onGaugeUp)
      },
      setGaugeFromEvent(e) {
        const track = this.gaugeTrackEl
        if (!track) return
        const rect = track.getBoundingClientRect()
        if (!rect.width) return
        const clientX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX
        this.setGaugeProgress(Math.round(((clientX - rect.left) / rect.width) * 100))
      },
      onGaugeKey(e) {
        if (this.progressLocked) return
        if (e.currentTarget.closest('fieldset[disabled]')) return
        const step = e.shiftKey ? 10 : 1
        let next = null
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = this.projectedProgress + step
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = this.projectedProgress - step
        else if (e.key === 'Home') next = 0
        else if (e.key === 'End') next = 100
        if (next === null) return
        e.preventDefault()
        this.setGaugeProgress(next)
      },
      setGaugeProgress(pct) {
        const t = parseFloat(this.editDetailData.t_progress) || 0
        const next = Math.min(100, Math.max(0, pct))
        const n = Math.round((next - t) * 1000) / 1000
        this.editDetailData.n_progress = n
        this.onProgressInput(n)
        this.onProgressInputx()
      },
      onProgressInputx() {
        let n = parseFloat(this.editDetailData.n_progress) || 0;
        let t = parseFloat(this.editDetailData.t_progress) || 0;
        n = Math.round(n * 1000) / 1000;
        t = Math.round(t * 1000) / 1000;

        if (t >= 100 && n > 0) {
          this.editDetailData.n_progress = 0;
          $msg.alert(this.ui.csm_v2_warning,this.ui.csm_trn_progress_full_100,'warning');
        } else {
          const newTotal = t + n;

          if (newTotal > 100) {

            const maxAdd = 100 - t;
            this.editDetailData.n_progress = maxAdd;
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_progress_max_add.replace('{0}', maxAdd.toFixed(0)), 'warning');
          } else if (newTotal < 0) {

            const maxSubtract = -t;
            this.editDetailData.n_progress = maxSubtract
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_progress_max_reduce.replace('{0}', maxSubtract.toFixed(0)), 'warning');
          }
        }
      },
      onManhourInput(val) {
        // Always treat empty string or null as null, never set empty string
        if (val === '' || val === null) {
          this.localManhour = null;
          this.editDetailData.n_manhour = null;
        } else {
          // Format to HH:mm if needed
          this.localManhour = moment(val, 'HH:mm').isValid() ? moment(val, 'HH:mm').format('HH:mm') : val;
          this.editDetailData.n_manhour = this.localManhour;
        }
      },
      refreshManhour() {
        this.localManhour = null;
        this.editDetailData.n_manhour = null;
      },
      checkRevisionProdOnComplete() {
        if (['01', '02', '03', '04', '06', '07', '11', '14', '22'].includes(this.editDetailData['item_type']) && $xt.isEmpty(this.editDetailData['revision_prod'])) {
          $msg.alert(this.ui.csm_v2_notification, this.ui.csm_trn_req_followup_revision.replace('{0}', this.editDetailData['assign_empno_name']), 'warning')
        }
      },
      openCalenderModal() {
        this.$eventBus.$emit('open-calendar-modal', this.editDetailData.assign_empno)
      },
      openAddWork(mode) {
        console.log(' this.allWorkers', this.allWorkersLocal)
        this.modalWorkers = this.allWorkersLocal.filter(x => x.job_no === this.formData.job_no && x.reftask === this.editDetailData.itemno);
        this.modalWorkers.forEach((w, i) => {
          w.itemno = i + 1;
        });
        this.$refs.openAddWork1.openModal();
      },
      addWorkerLine() {
        let newNo = this.modalWorkers.length + 1;
        this.modalWorkers.push({ job_no: this.formData.job_no, reftask: this.editDetailData.itemno, itemno: newNo, empno: '', empfullname: '', reftaskppn: this.editDetailData.refid_ppn });
      },
      removeWorkerLine(rowNo) {
        this.modalWorkers = this.modalWorkers.filter(w => w.itemno !== rowNo);
        this.modalWorkers.forEach((w, i) => {
          w.itemno = i + 1;
        });
      },
      empModalSelectedWorker(index) {
        this.rowWorker = index;
        this.$refs.ct_emp_ref.openModal();
      },
      sendComponent1(e, type) {
        if (type === 'emp_work') {
          if (!e || !('empno' in e)) {
            console.error('ไม่พบข้อมูล e หรือ e.empno');
            return;
          }
          let ck_wk = this.modalWorkers.find(x => x.reftask === this.editDetailData.itemno && x.empno === e.empno);
          if (ck_wk) {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_worker_duplicate, `warning`);
            return;
          }

          let wk = this.modalWorkers.find( x => x.reftask === this.editDetailData.itemno && x.itemno === this.rowWorker );

          if (wk) {
            wk.empno = e.empno;
            wk.empfullname = e.empfullname;
          } else {
            console.warn('ไม่พบ worker row ที่จะอัปเดต');
          }
        }
      },
      refWorkerCount1() {
        return $linq(this.allWorkersLocal).where(x => x.reftask === this.editDetailData.itemno).count();
      },
      UpdateRefWork() {

        let ck_wkFF = this.modalWorkers.find(x => x.reftask === this.editDetailData.itemno && (x.empno === this.editDetailData.itemno || x.empno === this.formData.itemno));
        for (let w of this.modalWorkers) {
          if (w.reftask === this.editDetailData.itemno && (w.empno === this.editDetailData.assign_empno || w.empno === this.formData.assign_empno)) {
            $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_worker_duplicate_main, `warning`);
            return;
          }
          console.log('www', w.empno)
        }
        let emptyIndex = this.modalWorkers.findIndex(w => !w.empno);
        if (emptyIndex !== -1) {
          $msg.alert(this.ui.csm_v2_notification, this.ui.csm_trn_row_no_employee.replace('{0}', emptyIndex + 1), `warning`);
          return;
        }
        let duplicate = this.modalWorkers.some((w, idx, arr) =>
          arr.findIndex(t => t.empno === w.empno && t.reftask === w.reftask) !== idx
        );

        if (duplicate) {
          $msg.alert(this.ui.csm_v2_warning, this.ui.csm_trn_worker_duplicate, `warning`);
          return;
        }

        this.allWorkersLocal = this.allWorkersLocal.filter(
          x => !(x.job_no === this.formData.job_no && x.reftask === this.editDetailData.itemno)
        );

        this.allWorkersLocal.push(...this.modalWorkers);

        this.workers = [...this.allWorkersLocal];
        this.deputy_Worker = [...this.workers];

        this.$refs.openAddWork1.closeModal();

        this.$emit('workers-updated', this.deputy_Worker);

      },
      sendX() {
        console.log('senxx33', this.allWorkersLocal)
        this.deputy_Worker = [...this.allWorkersLocal];
        this.$emit('workers-updated', this.deputy_Worker);
      },
      AlertCheckUpSW() {
        //  editDetailData.item_type
        if (this.isMango)
        {
          if (this.editDetailData.item_type == '11' && this.itupdateAuto == 'Y')
          {
            this.$refs.AlertSW.openModal();
          }
        }
      },

    },
    watch: {
      'editDetailData.n_manhour': {
        immediate: true,
        handler(val) {
          // ถ้าเป็น null หรือ empty string ให้ set localManhour เป็น null
          if (val === null || val === '') {
            this.localManhour = null;
          } else {
            this.localManhour = val;
          }
        }
      },
      allWorkers: {
        immediate: true,
        handler(val) {
          this.allWorkersLocal = [...val];
        }
      },
      matchedProgram: {
        immediate: true,
        handler(val, oldVal) {
          console.log(val)
          if (val) {
            this.editDetailData.pg_code = val.pg_code
            this.editDetailData.pg_name = val.pg_name
          } else if (oldVal !== undefined) {
            this.editDetailData.pg_code = ''
            this.editDetailData.pg_name = ''
          }
        }
      },
      customerWarData() {
        this.refreshWarrantyTable()
      },
      warCheck() {
        this.refreshWarrantyTable()
      },
      'editDetailData.approve_status'() {
        this.refreshWarrantyTable()
      },
    },
    computed: {
      ...mapState(['send_test_bug']),
      ...mapGetters(['service_group_select2', 'request_select2']),
      isMango() {
        return this.is_mango()
      },
      baseProgress() {
        const t = parseFloat(this.editDetailData.t_progress) || 0
        return Math.min(100, Math.max(0, t))
      },
      projectedProgress() {
        const n = parseFloat(this.editDetailData.n_progress) || 0
        return Math.round(Math.min(100, Math.max(0, this.baseProgress + n)) * 100) / 100
      },
      progressDelta() {
        return Math.round((this.projectedProgress - this.baseProgress) * 100) / 100
      },
      progressLocked() {
        return this.editDetailData.assign_empno == this.auth.empno && this.editDetailData.status == 'R'
      },
      gaugeFillStyle() {
        const pct = this.projectedProgress
        return {
          width: pct + '%',
          backgroundSize: (pct > 0 ? Math.min(4000, 10000 / pct) : 100) + '% 100%'
        }
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
      filteredOptionsX() {
        return this.request_select2.filter(
          (x) =>
            x.active === "Y" || x.id === this.editDetailData.req_type
        );
      },
      service_group_select2x() {
        return this.service_group_select2.map(g => {
          g.children = g.children.map(c => {
            let isActive = c.active === "Y";
            let isActiveServiceGroup = c.active_service_group === "Y";
            let isPreviouslySelected = c.id === this.editDetailData.item_type; // เช็คว่าค่านี้ถูกเลือกอยู่ไหม
            let is_add_emp_sa_mg = c.add_emp_sa_mg;
            return {
              ...c,
              disabled: !isActive || !isActiveServiceGroup, // ปิดการเลือก
              hidden: (!isActive || !isActiveServiceGroup) && !isPreviouslySelected // ซ่อน ถ้าไม่ถูกเลือก
            };
          });

          return g;
        });
      },
      canEdit_() {
        if (this.formData.assign_empno === this.auth.empno) return true;
        return (
          (this.formData.request_empno === this.auth.empno || this.editDetailData.assign_empno === this.auth.empno) &&
          ((this.editDetailData.status_tmp === 'W' && !this.isView || this.isAdmin  && this.isMango) || (!this.isMango && this.editDetailData.status === 'W'))
        );
      },
      canEdit_t() {
        if (this.editDetailData.tester_empno === this.auth.empno) return true;
        return (
          (this.formData.request_empno === this.auth.empno || this.editDetailData.tester_empno === this.auth.empno) &&
          ((this.editDetailData.status_tmp === 'W' && !this.isView || this.isAdmin  && this.isMango) || (!this.isMango && this.editDetailData.status === 'W'))
        );
      },
      refWorkerCount() {
        return $linq(this.allWorkersLocal)
          .where(x => x.reftask === this.editDetailData.itemno)
          .count();
      },
      canEdit() {
        return this.formData.request_empno === this.auth.empno || this.formData.assign_empno === this.auth.empno;
      },
      isMyWorker() {
      //  console.log('this.allWorkersLocal', this.allWorkersLocal, 'fdf', this.editDetailData.itemno)
        return this.allWorkersLocal.some(w => w.reftask === this.editDetailData.itemno && w.empno === this.auth.empno) || false;
      },
      canEditAiChecklist() {
        return this.formData.assign_empno === this.auth.empno
          || this.editDetailData.assign_empno === this.auth.empno
          || this.isMyWorker;
      },
      canCompareDefect() {
        return (this.attachmentData || []).some(x => x.ref_itemno == this.editDetailData.itemno && x.item_type == 'SB' && $xt.int(x.sort_order) >= 2);
      },
      canSaveAiExcel() {
        return this.formData.assign_empno === this.auth.empno
          || this.editDetailData.assign_empno === this.auth.empno;
      },
      programListArray() {
        if (!this.isMango) return null
        if (!this.program_list) return []

        let arr = Array.isArray(this.program_list)
          ? this.program_list
          : Object.values(this.program_list)

        // 🔥 flatten ถ้าเป็น array ซ้อน
        return arr.flat()
      },
      matchedProgram() {
        if (!this.isMango) return null
        if (!this.editDetailData.module || !this.editDetailData.platform) return null

        const moduleVal =
          typeof this.editDetailData.module === 'object'
            ? this.editDetailData.module.id
            : this.editDetailData.module

        const platformVal =
          typeof this.editDetailData.platform === 'object'
            ? this.editDetailData.platform.id
            : this.editDetailData.platform

        return this.programListArray.find(p =>
          p.mo_dule === moduleVal &&
          p.platform === platformVal
        ) || null
      },
    },
    mounted() {
      window.addEventListener("resize", this.onNarrowResize)
      this.$eventBus.$on('refresh-manhour', this.refreshManhour);
      this.allWorkersLocal = [...this.allWorkers];

      $('#WarrantyBox').boxWidget()
    },
    beforeUnmount() {
      window.removeEventListener("resize", this.onNarrowResize)
      this.$eventBus.$off('refresh-manhour', this.refreshManhour)
      this.onGaugeUp()
    },
  }
</script>
<style scoped>
  /* ─── Warranty ag-table (compact height inside the box) ─── */
  .warranty-ag-table-wrap {
    margin-bottom: 6px;
  }
  .warranty-ag-table-wrap /deep/ .content-body {
    height: 300px !important;
    max-height: 300px !important;
    overflow: auto !important;
  }
  .warranty-ag-table-wrap /deep/ .ag-flex {
    height: 100% !important;
  }
  .warranty-ag-table-wrap /deep/ .ag-theme-alpine {
    height: 100% !important;
  }
  .warranty-ag-table-wrap /deep/ .ag-body-viewport {
    overflow-y: auto !important;
  }

  /* ─── Info Card (card-based section layout) ─────────── */
  .info-card {
    border: 1px solid #e0e6ed;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .info-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #1a2a4a 0%, #243b6e 100%);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    padding: 9px 16px;
    letter-spacing: 0.3px;
  }
  .info-card-header i {
    font-size: 13px;
    opacity: 0.85;
  }
  .info-card-body {
    background: #fff;
    padding: 16px 18px 10px;
  }
  .info-card-body .row {
    margin-bottom: 2px;
  }

  /* ─── Worker Date accordion header ────────────────────── */
  .accordion-card {
    margin-top: 0;
  }
  .accordion-toggle {
    cursor: pointer;
    text-decoration: none;
  }
  .accordion-toggle:hover,
  .accordion-toggle:focus {
    color: #fff;
    text-decoration: none;
    filter: brightness(1.12);
  }
  .accordion-toggle-icon {
    margin-left: auto;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.25s ease, background 0.15s;
  }
  .accordion-toggle-icon i {
    opacity: 1;
    font-size: 12px;
  }
  .accordion-toggle:hover .accordion-toggle-icon {
    background: rgba(255,255,255,0.3);
  }
  .accordion-toggle.is-open .accordion-toggle-icon {
    transform: rotate(180deg);
  }

  /* ─── Status radio pills (Requester/Worker/Checker Status) ─── */
  .status-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
  }
  .status-radio-group [class*="icheck-material"] {
    margin: 0 !important;
  }
  .status-radio-group [class*="icheck-material"] > label {
    display: inline-flex !important;
    align-items: center;
    padding: 7px 16px 7px 29px !important;
    border: 1.5px solid #e2e6ec;
    border-radius: 999px;
    background: #fff;
    font-weight: 600;
    font-size: 13px;
    color: #5c6b7d;
    transition: background .15s, border-color .15s, color .15s;
  }
  .status-radio-group [class*="icheck-material"] > input:not(:disabled):hover + label {
    background: #f8f9fb;
  }
  .status-radio-group [class*="icheck-material"] > input:disabled + label {
    cursor: default;
  }
  .status-radio-group .icheck-material-red > input:checked + label { background: #fdeceb; border-color: #f44336; color: #c0392b; }
  .status-radio-group .icheck-material-amber > input:checked + label { background: #fff8e1; border-color: #ffc107; color: #946200; }
  .status-radio-group .icheck-material-deeppurple > input:checked + label { background: #efe9fb; border-color: #673ab7; color: #4a2a82; }
  .status-radio-group .icheck-material-green > input:checked + label { background: #e8f5e9; border-color: #4caf50; color: #2e7d32; }
  .status-radio-group .icheck-material-cyan > input:checked + label { background: #e0f7fa; border-color: #00bcd4; color: #00707d; }
  .status-radio-group .icheck-material-purple > input:checked + label { background: #f3e5f5; border-color: #9c27b0; color: #6a1b7a; }
  /* "None" is the idle state — a slate neutral so it never reads as an active status like In Progress does */
  .status-radio-group .icheck-material-bluegrey > input:checked + label { background: #eef1f5; border-color: #7d8ea1; color: #46586c; }

  /* re-center the checked-state inner dot for the taller pill (plugin's default top/left assumed a 0-padding label) */
  .status-radio-group [class*="icheck-material"] > input[type="radio"]:first-child:checked + label::after {
    top: 13px !important;
    left: 10px !important;
  }
  .status-radio-group [class*="icheck-material"]>input:first-child+label::before
  {
    margin-left: -25px !important;
  }

  /* ─── Alert status chips (replaces disabled checkboxes) ─── */
  .alert-status-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    height: 36px;
  }
  .alert-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    background: #f1f3f5;
    color: #98a2ae;
    border: 1px solid #e4e7ec;
  }
  .alert-chip i { font-size: 11px; }
  .alert-chip--on {
    background: #e6f4ea;
    color: #1c8a5b;
    border-color: #bfe3cd;
  }

  /* ─── Inline field actions (search/clear inside the input) ─── */
  .input-shell {
    position: relative;
    display: flex;
    align-items: center;
  }
  .input-shell .form-control {
    padding-right: 36px;
  }
  .input-shell.has-two .form-control {
    padding-right: 64px;
  }
  .input-action {
    position: absolute;
    right: 4px;
    width: 26px;
    height: 26px;
    border: 1px solid #e2e6ec;
    background: #eef2f7;
    color: #5c6b7d;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .input-shell.has-two .input-action.search { right: 32px; }
  .input-action:hover { background: #2471a3; border-color: #2471a3; color: #fff; }
  .input-action.danger { color: #c0392b; }
  .input-action.danger:hover { background: #c0392b; border-color: #c0392b; color: #fff; }

  /* ─── Worker No. counter badge (replaces a disabled-looking box) ─── */
  .worker-count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 30px;
    padding: 0 10px;
    border-radius: 999px;
    background: #e8f0fb;
    color: #2461a8;
    font-size: 13px;
    font-weight: 700;
  }

  /* ─── Base Utilities ─────────────────────────────────── */
  .text-middle {
    vertical-align: middle;
  }

  /* ─── Current task status ────────────────────────────────────────────────────
     A lozenge that hugs its content instead of a full-width bar — stretched to
     the column width it was three small items in a wide empty rail, and the
     dead space is what made it read as nothing. Light ground so it stays part
     of the page; the hue is carried by the outline, the beacon and the value
     ring. The value chip is the brightest thing inside a tinted shell, which is
     where the emphasis comes from. Per-status rules re-point three properties. */
  .modern-status-bar {
    --st: #6c757d;
    --st-ink: #495057;
    --st-soft: rgba(108, 117, 125, 0.12);
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    max-width: 100%;
    padding: 7px 10px 7px 8px;
    border: 1.5px solid var(--st);
    border-radius: 999px;
    background-color: #fff;
    background-image: linear-gradient(var(--st-soft), var(--st-soft));
    box-shadow: 0 2px 12px var(--st-soft), 0 1px 3px rgba(15, 23, 42, 0.07);
    margin-bottom: 4px;
    font-size: 13px;
    animation: status-bar-in .45s cubic-bezier(.2, .8, .25, 1) backwards;
  }
  .modern-status-bar .status-icon {
    position: relative;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: #fff;
    box-shadow: inset 0 0 0 1.5px var(--st);
    color: var(--st);
    font-size: 9px;
  }
  .modern-status-bar .status-icon::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: 50%;
    border: 1.5px solid var(--st);
    animation: status-pulse 2.4s ease-out infinite;
  }
  .modern-status-bar .status-label {
    font-family: "Bahnschrift", "Arial Narrow", Arial, sans-serif;
    font-size: 11.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.3px;
    color: #64748b;
    white-space: nowrap;
  }
  .modern-status-bar .status-badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 17px;
    border-radius: 999px;
    background: #fff;
    border: 2px solid var(--st);
    color: var(--st-ink);
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.3px;
    white-space: nowrap;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
  }
  .modern-status-bar .status-badge-pill::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--st);
    box-shadow: 0 0 0 3px var(--st-soft);
    flex-shrink: 0;
  }
  @keyframes status-pulse {
    0%   { opacity: 0.55; transform: scale(1); }
    70%  { opacity: 0; transform: scale(1.35); }
    100% { opacity: 0; transform: scale(1.35); }
  }
  @keyframes status-bar-in {
    from { opacity: 0; transform: translateY(-5px); }
  }

  body.dark-mode .modern-status-bar {
    background-color: #f8fafc;
    box-shadow: 0 2px 14px rgba(0, 0, 0, 0.35);
  }

  @media (prefers-reduced-motion: reduce) {
    .modern-status-bar {
      animation: none;
    }
    .modern-status-bar .status-icon::after {
      animation: none;
      opacity: 0.4;
    }
  }

  /* สีตาม callout status */
  .modern-status-bar.callout-W { --st: #f9a825; --st-ink: #8a5a00; --st-soft: rgba(249,168,37,0.16); }
  .modern-status-bar.callout-I { --st: #2196f3; --st-ink: #0d47a1; --st-soft: rgba(33,150,243,0.13); }
  .modern-status-bar.callout-S { --st: #9c27b0; --st-ink: #6a1b7a; --st-soft: rgba(156,39,176,0.13); }
  .modern-status-bar.callout-X { --st: #f0b400; --st-ink: #8a6100; --st-soft: rgba(240,180,0,0.18); }
  .modern-status-bar.callout-T { --st: #00bcd4; --st-ink: #00707d; --st-soft: rgba(0,188,212,0.14); }
  .modern-status-bar.callout-U { --st: #009688; --st-ink: #00695c; --st-soft: rgba(0,150,136,0.13); }
  .modern-status-bar.callout-Y { --st: #4caf50; --st-ink: #2e7d32; --st-soft: rgba(76,175,80,0.15); }
  .modern-status-bar.callout-R { --st: #f44336; --st-ink: #c0392b; --st-soft: rgba(244,67,54,0.13); }
  .modern-status-bar.callout-B { --st: #ff5722; --st-ink: #bf360c; --st-soft: rgba(255,87,34,0.13); }
  .modern-status-bar.callout-H { --st: #f9a825; --st-ink: #8a5a00; --st-soft: rgba(249,168,37,0.16); }
  .modern-status-bar.callout-N { --st: #607d8b; --st-ink: #37474f; --st-soft: rgba(96,125,139,0.14); }
  .modern-status-bar.callout-default { --st: #6c757d; --st-ink: #495057; --st-soft: rgba(108,117,125,0.13); }

  /* ─── Modern Card (box-info) ─────────────────────────── */
  .box {
    border-radius: 12px !important;
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.09) !important;
    border: none !important;
    overflow: hidden;
    margin-bottom: 18px;
  }
  .box.box-info > .box-header.with-border {
    background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%) !important;
    border-bottom: none !important;
    padding: 11px 18px !important;
  }
  .box.box-info > .box-header.with-border .box-title,
  .box.box-info > .box-header.with-border .box-title i {
    color: #fff !important;
    font-size: 13.5px !important;
    font-weight: 600 !important;
  }
  .box .box-body {
    background: #f8fafc;
    padding: 16px 20px;
  }

  /* ─── Section Title ──────────────────────────────────── */
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #1565c0;
    padding-bottom: 8px;
    border-bottom: 2px solid #e3f2fd;
    margin-bottom: 12px;
    letter-spacing: 0.3px;
  }

  /* ─── Modern Callout ─────────────────────────────────── */
  .callout {
    border-radius: 10px !important;
    border: none !important;
    border-left: 5px solid !important;
    padding: 11px 16px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
    font-size: 13px;
    margin-bottom: 14px;
  }
  .callout.callout-warning {
    background: linear-gradient(135deg, #fffde7, #fff8e1) !important;
    border-left-color: #f9a825 !important;
    color: #5c3d00 !important;
  }
  .callout.callout-info {
    background: linear-gradient(135deg, #e3f2fd, #e8eaf6) !important;
    border-left-color: #1976d2 !important;
    color: #0d3b6e !important;
  }
  .callout.callout-success {
    background: linear-gradient(135deg, #e8f5e9, #f1f8e9) !important;
    border-left-color: #2e7d32 !important;
    color: #1b4d1e !important;
  }
  .callout.callout-danger {
    background: linear-gradient(135deg, #ffebee, #fce4ec) !important;
    border-left-color: #c62828 !important;
    color: #7f0000 !important;
  }

  /* ─── Risk Table ─────────────────────────────────────── */
  .table-bordered {
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  }
  .table-hover tbody tr:hover {
    background-color: #f0f7ff !important;
  }
  .risk-th {
    background: linear-gradient(135deg, #e32121, #b71c1c) !important;
    border-radius: 0 !important;
    vertical-align: middle;
    height: 50px;
    color: #fff;
  }

  /* ─── Form Inputs ────────────────────────────────────── */
  .form-control {
    border-radius: 6px !important;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-control:focus {
    border-color: #1976d2 !important;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.14) !important;
    outline: none !important;
  }
  label {
    font-size: 13.5px;
    font-weight: 600;
    color: #555;
    margin-bottom: 4px;
  }

  /* ─── Sticky Table Header ────────────────────────────── */
  thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }
  tbody {
    position: relative;
    z-index: 1;
  }

  /* ─── Misc ───────────────────────────────────────────── */
  .form-check-input {
    position: relative;
    z-index: 5;
  }
  .nav-tabs-custom .nav-tabs {
    position: sticky;
    top: 0;
    background: white;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  }
  .modal-body ::v-deep {
    overflow-y: hidden !important;
  }
  .modal-open .modal ::v-deep {  overflow-x: hidden;}

  /* ─── Mango Task Form (isMango) — proportion refinements ───
     Scoped under .mango-task-form so the Customer template above,
     which shares several of these class names, stays untouched. */
  .mango-task-form label {
    font-size: 12.5px;
    color: #5c6b7d;
  }
  /* Field labels own their line, so a following control can never flow up beside them
     and a pull-right hint can reach the field's right edge. */
  .mango-task-form .form-group > label {
    display: block;
    overflow: hidden;
  }

  /* Label + trailing hint on one line. Replaces the old float/pull-right pairing, which
     broke once labels became block-level: the hint dropped to its own line, colliding
     with the input-group below it and knocking neighbouring columns out of alignment. */
  .mango-task-form .fld-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    min-height: 21px;
  }
  .mango-task-form .fld-head > label {
    margin-bottom: 4px;
  }
  .mango-task-form .fld-hint {
    flex: 0 0 auto;
    font-size: 11px;
    font-weight: 600;
    color: #98a2ae;
    white-space: nowrap;
  }

  /* Field row that keeps its proportions and redistributes when a field is v-show'd off */
  .mango-task-form .fld-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0 14px;
  }
  .mango-task-form .fld-row > .form-group {
    flex: 1 1 190px;
    min-width: 0;
  }
  .mango-task-form .fld-row > .fld-2x {
    flex-grow: 2;
  }

  /* Unify height / radius / border across form-control, select2 and datepickers */
  .mango-task-form .form-control,
  .mango-task-form .select2-container--bootstrap .select2-selection {
    border-radius: 8px !important;
    border-color: #dbe1ea !important;
    box-shadow: none !important;
    font-size: 13px !important;
  }
  .mango-task-form textarea.form-control {
    border-radius: 10px !important;
    padding: 8px 10px !important;
  }
  .mango-task-form .form-control:focus {
    border-color: #24365e !important;
    box-shadow: 0 0 0 3px rgba(36, 59, 110, 0.14) !important;
  }
  .mango-task-form .select2-container--bootstrap.select2-container--focus .select2-selection,
  .mango-task-form .select2-container--bootstrap.select2-container--open .select2-selection {
    border-color: #24365e !important;
    box-shadow: 0 0 0 3px rgba(36, 59, 110, 0.14) !important;
  }
  .mango-task-form .select2-container--bootstrap .select2-selection--single .select2-selection__rendered {
    color: #1e293b;
  }
  .mango-task-form .mx-input {
    border-radius: 8px !important;
  }

  /* Read-only / disabled fields read as clearly non-editable */
  .mango-task-form .form-control[readonly],
  .mango-task-form .form-control:disabled {
    background-color: #f3f5f8 !important;
    color: #5c6b7d !important;
  }

  /* Condensed display face for headers/labels/buttons — a system font, no files loaded */
  .mango-task-form .info-card-header,
  .mango-task-form .box.box-info > .box-header.with-border .box-title,
  .mango-task-form .btn,
  .mango-task-form .yn-toggle .form-check-label {
    font-family: "Bahnschrift", "Arial Narrow", Arial, sans-serif;
  }

  /* ─── CARD 2 : Worker & Assignment ──────────────────────
     Self-contained layout for this card. Every row is a grid/flex container that
     distributes leftover space itself, so nothing depends on Bootstrap col-* fractions
     summing to 12 (the source of the dead-gap problems this replaced). */

  /* Schedule row — equal columns that reflow when the conditional fields are hidden */
  .mango-task-form .wa-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(165px, 1fr));
    gap: 0 14px;
    margin-bottom: 6px;
  }

  /* Form-type row — code / name / flag at a deliberate 1 : 2.4 : 1 rhythm */
  .mango-task-form .wa-formtype {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0 14px;
  }
  .mango-task-form .wa-col-code { flex: 1 1 170px; }
  .mango-task-form .wa-col-name { flex: 2.4 1 260px; }
  .mango-task-form .wa-col-flag { flex: 1 1 170px; }
  .mango-task-form .wa-col-flag .form-check {
    height: 30px;
  }
  .mango-task-form .wa-hint {
    font-weight: 400;
    font-size: 10.5px;
    color: #98a2ae;
  }

  /* Worker / Tester — a full-width roster panel: avatar, identity, meta, actions pinned right */
  .mango-task-form .wa-person {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 9px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
  }
  .mango-task-form .wa-avatar {
    flex: 0 0 auto;
    min-width: 42px;
    height: 42px;
    padding: 0 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Consolas", "Cascadia Mono", monospace;
    font-weight: 700;
    font-size: 12px;
    background: rgba(36, 54, 94, 0.08);
    color: #24365e;
    border: 1.5px solid #24365e;
  }
  .mango-task-form .wa-person--tester .wa-avatar {
    background: rgba(178, 92, 0, 0.08);
    color: #b25c00;
    border-color: #b25c00;
  }
  .mango-task-form .wa-person-body {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .mango-task-form .wa-person-role {
    font-family: "Bahnschrift", "Arial Narrow", Arial, sans-serif;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: #8894a6;
  }
  .mango-task-form .wa-person-name {
    width: 100%;
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    height: auto !important;
    font-weight: 700;
    font-size: 14px;
    color: #1e293b !important;
    box-shadow: none !important;
    text-overflow: ellipsis;
  }
  /* Item-no. readout riding inside the worker panel, divided off from the identity */
  .mango-task-form .wa-person-meta {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding-right: 14px;
    margin-right: 2px;
    border-right: 1px solid #eef1f6;
  }
  .mango-task-form .wa-meta-value {
    width: 46px;
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    height: auto !important;
    box-shadow: none !important;
    text-align: center;
    font-weight: 700;
    font-size: 14px;
    color: #1e293b !important;
  }
  .mango-task-form .wa-meta-label {
    font-size: 10px;
    color: #98a2ae;
    white-space: nowrap;
  }

  /* Ghost icon buttons — outlined by default, colour only on hover */
  .mango-task-form .wa-person-actions {
    flex: 0 0 auto;
    display: flex;
    gap: 6px;
  }
  .mango-task-form .wa-icon-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 8px !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: none !important;
    background: #fff !important;
    border: 1px solid #e2e6ec !important;
    color: #64748b !important;
    transition: background .15s, border-color .15s, color .15s;
  }
  .mango-task-form .wa-icon-btn:hover:not(:disabled),
  .mango-task-form .wa-icon-btn:focus:not(:disabled) {
    background: #24365e !important;
    border-color: #24365e !important;
    color: #fff !important;
  }
  .mango-task-form .wa-icon-btn--danger:hover:not(:disabled),
  .mango-task-form .wa-icon-btn--danger:focus:not(:disabled) {
    background: #c0392b !important;
    border-color: #c0392b !important;
    color: #fff !important;
  }

  .mango-task-form .wa-link {
    margin-left: 8px;
    font-weight: 400;
    color: #2f6fb5;
  }
  .mango-task-form .wa-info {
    color: #98a2ae;
    margin-left: 2px;
  }

  /* Action row — one line: "+ Worker" anchors left, counter and AI ride the right
     edge. align-items:flex-end keeps the buttons on the inputs' baseline. */
  .mango-task-form .wa-actions {
    display: block;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 10px;
    margin: 16px 0 14px;
  }
  /* Labelled cells sit in a row of unlabelled controls — drop the stacking margin */
  .mango-task-form .wa-actions .form-group {
    margin-bottom: 0;
  }
  .mango-task-form .wa-ai-btn {
    width: 40px;
    height: 34px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #6b4c9a;
    color: #fff;
    border: none;
    box-shadow: none;
  }
  .mango-task-form .wa-ai-btn:hover,
  .mango-task-form .wa-ai-btn:focus {
    background: #7d5bb0;
    color: #fff;
  }

  /* Config row — flag / code / description across the full width */
  .mango-task-form .wa-config-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0 14px;
  }
  .mango-task-form .wa-config-flag {
    flex: 0 0 auto;
  }
  .mango-task-form .wa-config-flag .form-check {
    height: 30px;
  }
  .mango-task-form .wa-config-code { flex: 1 1 200px; min-width: 0; }
  .mango-task-form .wa-config-desc { flex: 2.6 1 300px; min-width: 0; }

  /* Risk decision — a subtle tinted bar with a true segmented YES/NO toggle */
  /* A question, not an alarm — the red wash read as an error state even on "NO".
     Colour is carried by the selected toggle instead. */
  .mango-task-form .risk-th {
    padding: 11px 16px !important;
    background: #f4f6fa !important;
    border: 1px solid #e7ebf1;
    color: #1e293b !important;
  }
  .mango-task-form .risk-th .pointer {
    color: #154b82;
    font-weight: 600;
  }
  /* Header bar: question left, toggle beside it, add-action pinned right.
     (The old markup relied on justify-content-end set on a flex *child*, which is inert.) */
  .mango-task-form .risk-head {
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
  }
  .mango-task-form .risk-head-title {
    font-weight: 600;
  }
  .mango-task-form .risk-add {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid #c9d6e8;
    background: #fff;
    color: #24365e;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    transition: background .15s, border-color .15s, color .15s;
  }
  .mango-task-form .risk-add:hover {
    background: #24365e;
    border-color: #24365e;
    color: #fff;
  }
  .mango-task-form .risk-add i {
    font-size: 10px;
  }
  .mango-task-form .risk-th .yn-toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    border: 1.5px solid #d7dfe9;
    background: #fff;
    overflow: hidden;
    transition: background .15s, border-color .15s;
  }
  .mango-task-form .risk-th .yn-toggle .form-check-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    pointer-events: none;
  }
  .mango-task-form .risk-th .yn-toggle .form-check-label {
    display: block;
    margin: 0;
    padding: 6px 16px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #5c6b7d;
    cursor: pointer;
  }
  .mango-task-form .risk-th .yn-toggle:has(.form-check-input:checked) {
    background: #b71c1c;
    border-color: #b71c1c;
  }
  .mango-task-form .risk-th .yn-toggle:has(.form-check-input:checked) .form-check-label {
    color: #fff;
  }

  /* ─── Status + Progress: stacked full-width sections with light headers ─────
     Side-by-side navy cards left the short status card padded with dead space
     and squeezed the progress fields into half the width. */
  .mango-task-form .wa-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 14px;
  }
  .mango-task-form .wa-sec {
    border: 1px solid #e0e6ed;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
  }
  .mango-task-form .wa-sec-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: #f4f6fa;
    border-bottom: 1px solid #e7ebf1;
    cursor: pointer;
    text-decoration: none;
  }
  .mango-task-form .wa-sec-head:hover,
  .mango-task-form .wa-sec-head:focus {
    background: #eef2f7;
    text-decoration: none;
  }
  .mango-task-form .wa-sec-ic {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: #e5edf6;
    color: #0d3661;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }
  .mango-task-form .wa-sec-title {
    font-family: "Bahnschrift", "Arial Narrow", Arial, sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }
  /* Hint (when present) claims the free space, otherwise the chevron does */
  .mango-task-form .wa-sec-hint {
    margin-left: auto;
    font-size: 11.5px;
    color: #8894a6;
  }
  .mango-task-form .wa-sec-title + .wa-sec-chev {
    margin-left: auto;
  }
  .mango-task-form .wa-sec-chev {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #5c6b7d;
    font-size: 11px;
    flex-shrink: 0;
    transition: transform .2s ease;
  }
  /* Same down/up swing as .accordion-toggle-icon — collapsed points down, open points
     up. A sideways chevron here read as a different kind of control. */
  .mango-task-form .wa-sec-head.is-open .wa-sec-chev {
    transform: rotate(180deg);
  }
  .mango-task-form .wa-sec-body {
    padding: 16px;
  }

  /* Pills in these sections lead with a glyph instead of the radio dot */
  .mango-task-form .wa-pills [class*="icheck-material"] > input:first-child + label::before,
  .mango-task-form .wa-pills [class*="icheck-material"] > input:first-child + label::after {
    display: none !important;
  }
  .mango-task-form .wa-pills [class*="icheck-material"] > label {
    padding: 7px 16px !important;
    gap: 7px;
  }
  .mango-task-form .wa-pills [class*="icheck-material"] > label > i {
    font-size: 11px;
    opacity: .75;
  }

  /* Total Progress % sits in its own tinted card above three equal readout tiles */
  .mango-task-form .gauge-card {
    background: #f4f6fa;
    border: 1px solid #e7ebf1;
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 14px;
  }
  .mango-task-form .stat-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 14px;
  }
  .mango-task-form .stat-tile {
    background: #f4f6fa;
    border: 1px solid #e7ebf1;
    border-radius: 10px;
    padding: 12px 14px;
  }
  .mango-task-form .stat-tile > label {
    display: block;
    font-size: 11.5px;
    color: #5c6b7d;
    margin-bottom: 8px;
  }
  .mango-task-form .stat-tile .stat-val {
    font-family: "Bahnschrift", "Arial Narrow", Arial, sans-serif;
    font-weight: 700;
    font-size: 22px;
    color: #1e293b;
  }

  .mango-task-form .box .box-body {
    background: #fff;
  }

  /* Tighter pill grouping here only — the shared 30px gap still serves the Customer template */
  .mango-task-form .status-radio-group {
    gap: 30px;
  }

  /* Total Progress % — value sits on the label's line, bar spans beneath */
  .mango-task-form .gauge-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
  }
  .mango-task-form .gauge-head label {
    margin-bottom: 6px;
  }
  /* Drag the track to set the projected total; the delta lands in New Progress % */
  .mango-task-form .gauge-track {
    position: relative;
    height: 12px;
    background: #eef1f6;
    border: 1px solid #dbe1ea;
    border-radius: 6px;
    margin-bottom: 4px;
    cursor: pointer;
    outline: none;
    touch-action: none;
  }
  /* Widens the grab area without changing the bar's visual height */
  .mango-task-form .gauge-track::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: -9px;
    bottom: -9px;
  }
  .mango-task-form .gauge-track:focus {
    box-shadow: 0 0 0 3px rgba(47, 111, 208, .25);
  }
  /* background-size is bound so the ramp always spans the full track, not the fill */
  .mango-task-form .gauge-fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background-image: linear-gradient(90deg, #24365e 0%, #2f6fd0 45%, #12b886 100%);
    background-repeat: no-repeat;
    border-radius: 6px;
    transition: width .25s ease, background-size .25s ease;
  }
  .mango-task-form .gauge-knob {
    position: absolute;
    top: 50%;
    width: 18px;
    height: 18px;
    margin-left: -9px;
    transform: translateY(-50%);
    background: #fff;
    border: 2px solid #2f6fd0;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(15, 32, 66, .25);
    cursor: grab;
    transition: left .25s ease, transform .12s ease, box-shadow .12s ease;
  }
  .mango-task-form .gauge-track:hover .gauge-knob {
    box-shadow: 0 2px 8px rgba(15, 32, 66, .32);
  }
  .mango-task-form .gauge-track.is-dragging .gauge-fill,
  .mango-task-form .gauge-track.is-dragging .gauge-knob {
    transition: none;
  }
  .mango-task-form .gauge-track.is-dragging .gauge-knob {
    cursor: grabbing;
    transform: translateY(-50%) scale(1.12);
  }
  /* Tick marking the committed total, so the unsaved delta stays readable */
  .mango-task-form .gauge-base {
    position: absolute;
    top: -3px;
    bottom: -3px;
    width: 2px;
    margin-left: -1px;
    background: #94a3b8;
    border-radius: 1px;
  }
  .mango-task-form .gauge-track.is-locked {
    cursor: not-allowed;
    opacity: .75;
  }
  .mango-task-form .gauge-track.is-locked .gauge-knob {
    display: none;
  }
  .mango-task-form .gauge-readout {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .mango-task-form .gauge-delta {
    font-family: "Consolas", monospace;
    font-size: 12px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .mango-task-form .gauge-delta.is-up {
    color: #087f5b;
    background: #e6fcf5;
  }
  .mango-task-form .gauge-delta.is-down {
    color: #c92a2a;
    background: #fff5f5;
  }
  /* The readout anchors the gauge — it needs enough weight to be the row's focal point */
  .mango-task-form .gauge-value {
    font-family: "Consolas", monospace;
    font-size: 18px;
    line-height: 1;
    font-weight: 700;
    color: #24365e;
    white-space: nowrap;
  }

  /* Search / clear buttons attached to inputs */
  .mango-task-form .input-group-btn .btn {
    border-radius: 8px !important;
    box-shadow: none !important;
  }
  .mango-task-form .input-group .form-control {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }
  .mango-task-form .input-group-btn .btn:first-child {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
  }
  .mango-task-form .input-group-btn .btn + .btn {
    margin-left: 2px;
  }
  .mango-task-form .input-group-btn .btn.bg-navy:hover {
    background-color: #33497a !important;
  }

  /* ─── Section headers: light bar + navy icon chip ───────────────────────────
     Matches the Worker status / progress sections above. Solid navy bars on
     every card made the form read as a stack of competing banners. */
  .mango-task-form .info-card-header,
  .mango-task-form .box.box-info > .box-header.with-border {
    background: #b2c5ff !important;
    background-image: none !important;
    color: #1e293b !important;
    border-bottom: 1px solid #e7ebf1;
    padding: 12px 16px !important;
    font-size: 14px;
    letter-spacing: 0;
    text-transform: none;
  }
  .mango-task-form .info-card-header:hover,
  .mango-task-form .info-card-header:focus {
    background: #eef2f7 !important;
    color: #1e293b !important;
    filter: none;
  }
  .mango-task-form .box.box-info > .box-header.with-border .box-title {
    color: #1e293b;
    font-size: 14px;
    letter-spacing: 0;
    text-transform: none;
  }
  /* Leading glyph becomes a tinted chip */
  .mango-task-form .info-card-header > i:first-child,
  .mango-task-form .box.box-info > .box-header.with-border .box-title > i:first-child {
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #e5edf6;
    color: #0d3661;
    border-radius: 7px;
    font-size: 12px !important;
    opacity: 1;
    margin-right: 4px;
    vertical-align: middle;
  }
  /* Chevron loses its white pill — it sat on navy before */
  .mango-task-form .accordion-toggle-icon {
    background: transparent;
    border: none;
    color: #5c6b7d;
    width: 24px;
    height: 24px;
  }
  .mango-task-form .accordion-toggle:hover .accordion-toggle-icon {
    background: #e3e9f1;
  }

</style>

<!--
  worker-ref-action builds its own template inside this file, so its inner nodes are not
  reliably reached by the scoped block above (a /deep/ selector here depended on the parent's
  scope attribute landing on the child's root, and in practice it did not — the button stayed
  Bootstrap-blue and the counter never moved right). These rules are therefore unscoped, but
  every one is namespaced under .mango-task-form, a class that exists only in this file, so
  they cannot reach any other component.
-->
<style>
  .mango-task-form .wa-actions .wa-add-btn {
    height: 38px;
    padding: 0 22px;
    border-radius: 8px;
    background: #24365e;
    border: 1px solid #24365e;
    color: #fff;
    font-family: "Bahnschrift", "Arial Narrow", Arial, sans-serif;
    font-weight: 600;
    letter-spacing: 0.4px;
    white-space: nowrap;
    box-shadow: none;
  }
  .mango-task-form .wa-actions .wa-add-btn:hover,
  .mango-task-form .wa-actions .wa-add-btn:focus,
  .mango-task-form .wa-actions .wa-add-btn:active {
    background: #33497a;
    border-color: #33497a;
    color: #fff;
  }
  /* The trailing pair is one group pinned right, so losing either the counter or the
     AI button to a v-if leaves the other still hugging the edge. This no longer relies
     on the lead slot growing — that slot is currently v-if="false" and contributes nothing. */
  .mango-task-form .wa-actions .wa-actions-trail {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .mango-task-form .wa-actions .wa-worker-no-cell {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .mango-task-form .wa-actions .wa-worker-no-label {
    font-size: 12.5px;
    color: #5c6b7d;
    white-space: nowrap;
  }
  .mango-task-form .wa-actions .wa-worker-no {
    display: inline-block;
    width: 66px;
    height: 34px;
    line-height: 22px;
    border-radius: 8px;
    border-color: #dbe1ea;
    box-shadow: none;
    font-size: 13px;
  }
</style>

<style scoped>
  /* ─── โหมดจอแคบ : แยกการแสดงผลออกจาก desktop ─────────────
     เปิดผ่าน :class="{ 'mtf-narrow': isNarrow }" ที่ root ของทั้งสองเทมเพลต
     isNarrow = window.innerWidth <= 939 (อัปเดตตอน resize)
     ที่ 940px ขึ้นไปคลาสนี้ไม่ถูกใส่ การแสดงผลเดิมจึงไม่ถูกแตะเลย

     ต้นเหตุที่ช่องกรอกหายไปครึ่งขวา : ฟอร์มนี้ใช้ col-xs-* ซึ่งมีความกว้าง
     ทุกขนาดจอ (เช่น col-xs-6 = 50%) พอกรอบโมดัลแคบลง คอลัมน์จึงล้นออกขวา
     แล้วถูก .modal-body ที่เป็น overflow-x:hidden ตัดทิ้ง
     กฎชุดนี้อยู่ใน scoped style ของคอมโพเนนต์เดียวกับ markup จึงได้
     [data-v-xxx] พ่วงมาให้และเกาะถูกตัวแน่นอน */

  .mtf-narrow .row {
    margin-left: 0;
    margin-right: 0;
  }

  .mtf-narrow [class*="col-xs-"],
  .mtf-narrow [class*="col-sm-"],
  .mtf-narrow [class*="col-md-"],
  .mtf-narrow [class*="col-lg-"] {
    float: none;
    width: 100%;
    max-width: 100%;
    padding-left: 0;
    padding-right: 0;
  }

  /* .fld-row เป็น flex ที่ตั้ง flex-basis 190px ต่อช่อง */
  .mtf-narrow .fld-row {
    display: block;
  }

  .mtf-narrow .wa-col-code,
  .mtf-narrow .wa-col-name,
  .mtf-narrow .wa-col-flag {
    flex: 1 1 100%;
  }

  .mtf-narrow .form-group {
    margin-bottom: 12px;
  }

  .mtf-narrow .info-card {
    border-radius: 3px;
    box-shadow: none;
  }

  .mtf-narrow .info-card-body {
    padding: 12px;
  }

  .mtf-narrow .table-responsive {
    max-width: 100%;
    overflow-x: auto;
  }
</style>
