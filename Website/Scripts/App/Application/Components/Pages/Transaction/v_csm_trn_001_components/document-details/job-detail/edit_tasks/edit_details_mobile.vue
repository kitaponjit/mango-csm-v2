<template>
  <div class="mob-root">
    <div class="m-row" style="margin-bottom: 15px;">
      <div class="m-col">
        <div class="modern-status-bar" v-bind:class="statusClass('callout-', editDetailData['status_tmp'])">
          <span class="status-icon"><i class="fas fa-circle"></i></span>
          <span class="status-label">{{ ui.csm_trn_current_tasks_status }}</span>
          <span class="status-badge-pill">{{statusName(editDetailData['status_tmp'])}}</span>
        </div>
      </div>
    </div>
    <div class="m-row" id="task_detail" ref="task_detail">
      <!-- Start : Template for Mango -->
      <template v-if="isMango">
        <div class="m-col mango-task-form">

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
                <div class="m-row">
                  <div class="m-col">
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
                  <div class="m-col">
                    <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.module)}">
                      <label :class="activeconfig.TRN001H === 'Y' ? 'text-danger' : ''" v-text="ui.module || 'Module'"></label>
                      <vue-select-2 :options="newModuleForMango"
                                    :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                    v-model="editDetailData.module"
                                    @change="moduleChange">
                      </vue-select-2>
                    </div>
                  </div>
                  <div class="m-col">
                    <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.platform)}">
                      <label :class="activeconfig.TRN001J === 'Y' ? 'text-danger' : ''" v-text="ui.csm_trn_field_platform"></label>
                      <vue-select-2 :options="newPlatformCodeData"
                                    :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                    v-model="editDetailData.platform">
                      </vue-select-2>
                    </div>
                  </div>
                  <div class="m-col">
                    <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.req_type)}">
                      <label :class="activeconfig.TRN001I === 'Y' ? 'text-danger' : ''" v-text="ui.csm_trn_field_req_type"></label>
                      <vue-select-2 :options="newRequestCodeData"
                                    :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                    v-model="editDetailData.req_type">
                      </vue-select-2>
                    </div>
                  </div>
                  <div class="m-col">
                    <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.object_type)}">
                      <label :class="activeconfig.TRN001K === 'Y' || ['11'].includes(editDetailData['item_type']) ? 'text-danger' : ''" v-text="ui.re_job_type || 'Job Type'"></label>
                      <vue-select-2 :options="filterJobType()"
                                    :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                    :disabled="formData.job_status && !['H', 'W'].includes(formData.job_status) && ['11'].includes(editDetailData['item_type'])"
                                    v-model="editDetailData.object_type">
                      </vue-select-2>
                    </div>
                  </div>
                  <div class="m-col" v-if=" (formData.assign_empno == auth.empno || editDetailData.assign_empno == auth.empno || editDetailData.tester_empno == auth.empno ||isMyWorker)">
                    <div class="form-group">
                      <label>{{ ui.csm_trn_type_program }}</label>
                      <input type="text" class="form-control input-sm" :value="editDetailData.pg_name" disabled />
                    </div>
                  </div>
                </div>

                <!-- Row 2 (item_type=11): Update DateTime / Website URL -->
                <div class="m-row" v-if="['11'].includes(editDetailData['item_type'])">
                  <div class="m-col">
                    <div class="form-group">
                      <label v-text="'Update Date Time'" class="text-danger"></label>
                      <datepicker input-class="form-control input-sm" :disabled="formData.job_status && !['H', 'W'].includes(formData.job_status)" type="datetime" format="DD/MM/YYYY HH:mm" v-model.trim="editDetailData['upd_software_dt']"></datepicker>
                    </div>
                  </div>
                  <div class="m-col">
                    <div class="form-group">
                      <label :class="['WIN', 'MOB'].includes(editDetailData.platform) ? '' : 'text-danger'">{{ ui.csm_trn_field_website_url }}</label>
                      <input type="text" class="form-control input-sm" v-model.trim="editDetailData['website_url']" maxlength="500" :disabled="formData.job_status && !['H', 'W'].includes(formData.job_status)" />
                    </div>
                  </div>
                </div>

                <!-- Warnings -->
                <div class="m-row" v-show="!formData['dpt_no'] && !isView && formData['request_empno'] == auth.empno">
                  <div class="m-col">
                    <div class="callout callout-warning" style="margin-bottom:10px;">
                      <strong>{{ ui.csm_v2_warning }}</strong> {{ ui.csm_trn_warn_subject_public }}
                    </div>
                  </div>
                </div>
                <div class="m-row" v-show="editDetailData['item_type']=='25' && !isView && formData['request_empno'] == auth.empno">
                  <div class="m-col">
                    <div class="callout callout-warning" style="margin-bottom:10px;">
                      <strong>{{ ui.csm_v2_warning }} :</strong> {{ ui.csm_trn_warn_copy_db_form }}
                    </div>
                  </div>
                </div>
                <!-- Subject -->
                <div class="m-row">
                  <div class="m-col">
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
                <div class="m-row">
                  <div class="m-col">
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
                  <div class="m-row">
                    <div class="m-col">
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

                <div class="m-row" v-if="editDetailData['status'] == 'Y' && formData['request_empno'] == auth.empno && ['01','02','03','04','06','07','11','14','22'].includes(editDetailData['item_type'])">
                  <div class="m-col">
                    <div class="form-group">
                      <label>{{ ui.csm_trn_revision_uat }}</label>
                      <input type="text" class="form-control input-sm" v-model.trim="editDetailData['revision']" readonly />
                    </div>
                  </div>
                  <div class="m-col">
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
                <template slot="trail">
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
                <div class="m-row">
                  <div class="m-col">
                    <div class="icheck-material-green">
                      <input type="radio" id="testerApprove1" v-model="editDetailData['tester_approve']" value="Y" />
                      <label for="testerApprove1">{{ ui.erp_approve }}</label>
                    </div>
                  </div>
                  <div class="m-col">
                    <div class="icheck-material-red">
                      <input type="radio" id="testerApprove2" v-model="editDetailData['tester_approve']" value="R" />
                      <label for="testerApprove2">{{ ui.csm_trn_reject_to_requestor }}</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div class="m-row" v-if="editDetailData.tester_approve == 'R' && editDetailData.is_db">
            <div class="m-col">
              <div class="form-group">
                <label for="" class="text-danger">{{ ui.csm_trn_reject_tester_reason }}</label>
                <textarea class="form-control input-sm" rows="6" v-model="editDetailData['tester_approve_remark']" v-bind:disabled="(editDetailData.tester_empno != auth.empno || !emp_is_software_tester()) && editDetailData.status_tmp != 'W'"></textarea>
              </div>
            </div>
          </div>
          <div class="m-row" v-if="editDetailData.tester_approve == 'R' && formData.request_empno == auth.empno && editDetailData.status_tmp != 'Y' && editDetailData.is_db">
            <div class="m-col">
              <h5 class="text-bold">{{ ui.csm_trn_note_tester_reject_1 }} <a class="btn btn-sm btn-github" href="#" @click.prevent="recoveryTesterTasks('Tester')"><i class="fas fa-recycle"></i> {{ ui.csm_trn_restore_status }}</a> {{ ui.csm_trn_note_tester_reject_2 }} <a class="btn btn-sm btn-danger" href="#" @click.prevent="recoveryTesterTasks('Close')"><i class="fas fa-times-circle"></i> {{ ui.csm_trn_close_this_item }}</a></h5>
            </div>
          </div>

          <div v-show="isEditDetail ||isMyWorker">
            <fieldset v-show="formData['request_empno'] == auth.empno && ['S','T','X'].includes(editDetailData['status_tmp']) && (is_qc() ? editDetailData['tester_test_status'] == 'Y' : !['T'].includes(editDetailData['tester_test_status']))">
              <div class="m-row">
                <div class="m-col">
                  <div class="box box-info">
                    <div class="box-header with-border">
                      <h3 class="box-title"><i class="fa fa-folder-open"></i> {{ ui.csm_trn_requester_status }}</h3>
                    </div>
                    <div class="box-body">
                      <div class="m-row">
                        <div class="m-col">
                          <div class="form-group">
                            <label>{{ ui.csm_trn_revision_uat }}</label>
                            <input type="text" class="form-control input-sm" v-model.trim="editDetailData['revision']" readonly />
                          </div>
                        </div>
                        <div class="m-col">
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
              <div class="m-row">
                <div class="m-col">
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
              <div class="m-row">
                <div class="m-col">
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
            <div class="m-row">
              <div class="m-col">
                <div class="form-group">
                  <label for="" class="text-danger">{{ ui.csm_trn_worker_remark }} ({{editDetailData['status'] == 'R' ? ui.erp_reject : ui.csm_trn_status_hold}} {{ ui.erp_remark }})</label>
                  <textarea v-if="editDetailData['status'] == 'R'" class="form-control input-sm" rows="6" v-model.trim="editDetailData['reject_remark']" ref="reject_remark"></textarea>
                  <textarea v-else class="form-control input-sm" rows="6" v-model.trim="editDetailData['remark']" ref="remark"></textarea>
                </div>
              </div>
            </div>
          </fieldset>
          <div class="m-row" v-if="editDetailData.status == 'R' && formData.request_empno == auth.empno && formData.job_status != 'Y'">
            <div class="m-col">
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

            <div v-if="['01','02','03','04','06', '07','11','14','22'].includes(editDetailData['item_type'])
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
        <div class="m-col">
          <fieldset v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno) || (formData.job_status != 'W' && editDetailData.status_tmp != 'W') || isView">
            <!-- Row 1: Service Type / Area / Req.Type -->
            <div class="m-row">
              <div class="m-col">
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
              <div class="m-col">
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
              <div class="m-col">
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
            <div class="m-row">
              <div class="m-col">
                <div class="form-group">
                  <label :class="activeconfig.TRN001J === 'Y' ? 'text-danger' : ''">{{ ui.csm_trn_field_category_of_work }}</label>
                  <vue-select-2 :options="filterSubData()"
                                :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                v-model="editDetailData.serv_code_d"
                                v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno) || (formData.job_status != 'W' && editDetailData.status_tmp != 'W') || isView">
                  </vue-select-2>
                </div>
              </div>
              <div class="m-col">
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
            <div class="m-row" style="margin-top:10px;">
              <div class="m-col">
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
            <div class="m-row">
              <div class="m-col">
                <div class="form-group">
                  <label :class="activeconfig.TRN001M === 'Y' ? 'text-danger' : ''" v-text="ui.csm_v2_description"></label>
                  <textarea class="form-control input-sm" rows="5" v-model.trim="editDetailData['detail']"></textarea>
                </div>
              </div>
            </div>
            <!-- Row: Requested Date / Ticket No. -->
            <div class="m-row">
              <div class="m-col">
                <div class="form-group">
                  <label :class="activeconfig.TRN001N === 'Y' ? 'text-danger' : ''" v-text="'Requested Date'"></label>
                  <datepicker input-class="form-control input-sm" :disabled="fromLine_req()" type="datetime" format="DD/MM/YYYY HH:mm" v-model.trim="editDetailData['ref_docdate']"></datepicker>
                </div>
              </div>
              <div class="m-col">
                <div class="form-group">
                  <label v-text="'Ticket No.'"></label>
                  <input type="text" class="form-control input-sm" v-model="editDetailData['ref_docno']" disabled />
                </div>
              </div>
            </div>
            <!-- Row: Response Date / Due Date / Complete Date -->
            <div class="m-row">
              <div class="m-col">
                <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.response_date)}">
                  <label :class="activeconfig.TRN001O === 'Y' ? 'text-danger' : ''" v-text="ui.response_date || 'วันที่ติดต่อกลับ'"></label>
                  <datepicker input-class="form-control input-sm" :disabled="editDetailData.approve_status=='Y'" :overdate="datePriority()" :beforedate="true" v-model.trim="editDetailData['response_date']"></datepicker>
                </div>
              </div>
              <div class="m-col">
                <div class="form-group">
                  <label :class="{'text-danger': editDetailData.assign_empno == auth.empno}" v-text="ui.duedate || 'Due Date'"></label>
                  <datepicker input-class="form-control input-sm text-success" :disabled="editDetailData.approve_status=='Y'" :beforedate="true" v-model.trim="editDetailData['due_date']"></datepicker>
                </div>
              </div>
              <div class="m-col">
                <div class="form-group">
                  <label v-text="ui.re_completed_date_com || 'Complete Date'"></label>
                  <datepicker input-class="form-control input-sm" v-model.trim="editDetailData['complete_date']" disabled="true"></datepicker>
                </div>
              </div>
            </div>
            <!-- Worker Date accordion -->
            <div class="m-row">
              <div class="m-col">
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
                        <div class="m-row">
                          <div class="m-col">
                            <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.worker_start_date)&& formData.job_status!='H' && editDetailData.assign_empno == auth.empno}">
                              <label :class="{'text-danger': xt.isEmpty(editDetailData.worker_start_date) && editDetailData.assign_empno == auth.empno}" v-text="ui.worker_start_date || 'วันที่เริ่มงาน(Worker)'"></label>
                              <datepicker input-class="form-control input-sm" type="datetime" format="DD/MM/YYYY HH:mm" v-model.trim="editDetailData['worker_start_date']" :disabled="editDetailData.assign_empno != auth.empno|| formData.job_status=='H'"></datepicker>
                            </div>
                          </div>
                          <div class="m-col">
                            <div class="form-group" v-bind:class="{'has-error': xt.isEmpty(editDetailData.worker_end_date) && editDetailData.assign_empno == auth.empno}">
                              <label :class="{'text-danger': xt.isEmpty(editDetailData.worker_end_date) && editDetailData.assign_empno == auth.empno}" v-text="ui.worker_end_date || 'วันที่คาดว่าจะเสร็จ(Worker)'"></label>
                              <datepicker input-class="form-control input-sm" v-model.trim="editDetailData['worker_end_date']" :disabled="editDetailData.assign_empno != auth.empno||  formData.job_status=='H'"></datepicker>
                            </div>
                          </div>
                          <div class="m-col">
                            <div class="form-group">
                              <label v-text="ui.worker_end_date || 'วันที่ส่งมอบงาน(Worker)'"></label>
                              <datepicker input-class="form-control input-sm" v-model.trim="editDetailData['worker_send_date']" :disabled="editDetailData.assign_empno != auth.empno"></datepicker>
                            </div>
                          </div>
                        </div>
                        <div class="m-row">
                          <div class="m-col">
                            <div class="form-group">
                              <label :class="activeconfig.TRN001Q === 'Y' ? 'text-danger' : ''">{{ ui.csm_trn_alert_due_days.replace('{0}', editDetailData['alert_type'] === 'A' ? ui.csm_trn_after : ui.csm_trn_before) }}</label>
                              <number class="form-control input-sm" v-model="editDetailData['noti_date']"></number>
                            </div>
                          </div>
                          <div class="m-col">
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
            <div class="m-row" v-if="company == 'SCJV'">
              <div class="m-col">
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
            <div class="m-row">
              <div class="m-col">
                <div class="form-group">
                  <label :class="activeconfig.TRN001R === 'Y' ? 'text-danger' : ''">{{ ui.csm_trn_item_product }}</label>
                  <input type="text" class="form-control input-sm" v-model.trim="editDetailData['item_name']" readonly />
                </div>
              </div>
              <div class="m-col" v-bind:class="{'col-md-4' : (company=='GIS' || company=='SCJV')}">
                <div class="form-group">
                  <label>{{ ui.csm_trn_serial_number_code }}</label>
                  <input type="text" class="form-control input-sm" v-model.trim="editDetailData['serial_number']" readonly />
                </div>
              </div>
              <div class="m-col" v-if="is_claim() && (company=='GIS' || company=='SCJV')">
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
            <div class="m-row" v-if="is_claim() && company != 'GIS'">
              <div class="m-col">
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
          <div class="m-row align-items-end">
            <!-- Fieldset เฉพาะ Worker -->
            <fieldset class="m-col d-flex flex-wrap"
                      v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno) || editDetailData.status != 'W'">
              <div class="m-col">
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
              <div class="m-col">
                <div class="form-group mb-0">
                  <label class="d-block">
                    <a href="#" @click.prevent="openCalenderModal()">{{ ui.csm_trn_check_worker_schedule_paren }}</a>
                  </label>
                  <input type="text" class="form-control input-sm" v-model.trim="editDetailData['assign_empno_name']" readonly />
                </div>
              </div>
            </fieldset>
            <!-- Add Worker Button -->
            <div class="m-col">
              <div class="form-group mb-0 text-center">
                <label class="d-block">&nbsp;</label>
                <button class="btn btn-sm btn-primary btn-block" @click="openAddWork('add-worker')">
                  <i class="fa fa-plus"></i> {{ ui.csm_trn_worker }}
                </button>
              </div>
            </div>
            <!-- Worker No. -->
            <div class="m-col">
              <div class="form-group mb-0 text-center">
                <label class="d-block">{{ ui.csm_trn_worker_no }}</label>
                <span class="worker-count-badge">{{ refWorkerCount }}</span>
              </div>
            </div>
          </div>


          <fieldset v-bind:disabled="(formData.request_empno != auth.empno && formData.assign_empno != auth.empno) || editDetailData.status != 'W'">
            <!-- Checker (QC) -->
            <div class="m-row" v-if="is_qc()">
              <div class="m-col">
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
              <div class="m-col">
                <div class="form-group">
                  <label class="pull-right">{{ ui.csm_v2_note }} <i class="fas fa-info-circle text-danger" v-tooltip=" 'ข้อมูลของ Worker กับ Checker จะถูก Default ข้อมูลไว้ก่อน สามารถเปลี่ยนได้' "></i></label>
                  <input type="text" class="form-control input-sm" v-model.trim="editDetailData['tester_empno_name']" readonly />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <div class="m-row">
              <div class="m-col">
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
                        <div class="m-row">
                          <div class="m-col">
                            <div class="form-group">
                              <label :class="activeconfig.TRN001S === 'Y' ? 'text-danger' : ''">{{ ui.erp_google_map_url }}</label>
                              <span class="input-shell">
                                <input type="text" class="form-control input-sm" v-model="editDetailData['map_url']" placeholder="https://goo.gl/maps/" :disabled="!xt.isEmpty(editDetailData['ref_docno'])" />
                                <button class="input-action" @click="openMapUrl(editDetailData['map_url'])" :title="ui.csm_trn_open_map"><i class="fas fa-map"></i></button>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="m-row">
                          <div class="m-col">
                            <div class="form-group">
                              <label :class="activeconfig.TRN001T === 'Y' ? 'text-danger' : ''">{{ ui.erp_gps_coordinate_dd_lat_lng }}</label>
                              <span class="input-shell">
                                <input type="text" class="form-control input-sm" v-model="editDetailData['map_gps']" placeholder="10.00000, 10.00000" :disabled="!xt.isEmpty(editDetailData['ref_docno'])" />
                                <button class="input-action" @click="openModalLocation(editDetailData['map_gps'])" :title="ui.csm_trn_preview_map"><i class="fas fa-map-marked-alt"></i></button>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="m-row">
                          <div class="m-col">
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
              <div class="m-row">
                <div class="m-col">
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
              <div class="m-row">

                <div class="m-col">
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
              <div class="m-row">
                <div class="m-col">
                  <span class="pull-right"><b class="text-danger">{{ ui.csm_trn_note_for_worker }} : </b> {{ ui.csm_trn_note_checker_first }}</span>
                </div>
              </div>
              <div class="m-row">
                <div class="m-col">
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
              <div class="m-row">
                <div class="m-col">
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
            <div class="m-row">
              <div class="m-col">
                <div class="form-group">
                  <label for="" class="text-danger"> {{editDetailData['status'] == 'R' ? ui.erp_reject : ui.csm_trn_status_hold}} {{ ui.erp_remark }}: *</label>
                  <textarea v-if="editDetailData['status'] == 'R'" class="form-control input-sm" rows="6" v-model.trim="editDetailData['reject_remark']" ref="reject_remark"></textarea>
                  <textarea v-else class="form-control input-sm" rows="6" v-model.trim="editDetailData['remark']" ref="remark"></textarea>
                </div>
              </div>
            </div>
          </fieldset>
        </div>
        <div class="m-col">
          <div class="m-row">
            <div class="m-col">
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
                  <div class="m-row">
                    <div class="m-col">
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

<script type="text/javascript">
  /* edit_details_mobile.vue — หน้าจอแคบ (<= 939px)
     template แปลงเชิงกลจาก edit_details.vue : เปลี่ยนเฉพาะ wrapper ของ grid
     (col-*-N -> m-col, row -> m-row) binding ทุกตัวยกมาครบ
     logic ไม่ได้คัดลอกเลย — ใช้ extends จึงได้ props/data/methods/computed เดิม
     จอ >= 940px ยังใช้ edit_details.vue ตัวเดิม ไม่ถูกแตะ */
  import EditDetails from './edit_details.vue'

  export default {
    name: 'ControlOpenMobile',
    extends: EditDetails,
  }
</script>

<style scoped>
  /* ══════════════════════════════════════════════════════════════
     สไตล์ของหน้าจอแคบ — เขียนใหม่ทั้งชุดจากดีไซน์ csm-requirement.html
     ไม่ได้คัด CSS ของ desktop มาเลย จึงไม่มีกฎเก่าที่กำหนดความกว้าง
     (flex-basis 190px / 260px, .mango-task-form ฯลฯ) มาดันให้ล้นอีก
     ≥ 940px ใช้ edit_details.vue ตัวเดิม ไฟล์นี้ไม่ถูกเรียก
     ══════════════════════════════════════════════════════════════ */

  .mob-root {
    --paper:  #ffffff;
    --tint:   #e8f0fa;
    --tint2:  #f4f7fc;
    --ink:    #0a1c3d;
    --ink2:   #44567a;
    --ink3:   #6f7f9c;
    --rule:   #ccd7e8;
    --navy:   #1748a8;
    --deep:   #0b2a63;
    --ok:     #0d7a58;
    --warn:   #a06805;
    --danger: #bd2740;
    width: 100%;
    max-width: 100%;
    color: var(--ink);
  }

  /* ─── กันล้นเป็นกฎพื้นฐาน ─────────────────────────────────
     min-width:auto คือค่าตั้งต้นของ flex item ทำให้มันไม่ยอมหด
     ต่ำกว่าเนื้อหาข้างใน แล้วดัน container ให้ล้น จึงต้องปลดทิ้ง */
  .mob-root *,
  .mob-root *::before,
  .mob-root *::after {
    box-sizing: border-box;
    min-width: 0;
  }

  .mob-root *:not(table):not(thead):not(tbody):not(tr):not(td):not(th) {
    max-width: 100%;
  }

  /* ─── โครง : ทุกอย่างเรียงลงมาช่องละแถว ─── */
  .mob-root .m-row,
  .mob-root .m-col {
    display: block;
    float: none;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .mob-root .form-group {
    margin: 0 0 13px;
  }

  /* ─── การ์ดหัวข้อ = .sec ของดีไซน์ ─── */
  .mob-root .info-card,
  .mob-root .panel-group {
    margin: 0 0 14px;
  }

  .mob-root .info-card {
    border: 1px solid var(--rule);
    border-radius: 3px;
    background: var(--paper);
    box-shadow: none;
    overflow: hidden;
  }

  /* .sec-head : พื้นฟ้าอ่อน ตัวอักษรสีหมึก ไม่ใช่หัวสีทึบ */
  .mob-root .info-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: var(--tint);
    border: 0;
    border-radius: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    text-decoration: none;
  }

  /* ไอคอนหน้าหัวข้อ = .ci ชิป 22px สีน้ำเงิน */
  .mob-root .info-card-header > i:first-child {
    display: grid;
    place-items: center;
    flex: none;
    width: 22px;
    height: 22px;
    border-radius: 2px;
    background: var(--navy);
    color: #fff;
    font-size: 11px;
  }

  .mob-root .info-card-header > span {
    flex: 1;
  }

  .mob-root .info-card-header .accordion-toggle-icon {
    flex: none;
    font-size: 11px;
    color: var(--ink3);
  }

  /* .sec-pad */
  .mob-root .info-card-body {
    padding: 16px 14px 4px;
  }

  /* ─── ป้ายกำกับ = .f label ─── */
  .mob-root label {
    display: block;
    margin: 0 0 6px;
    font-size: 9.5px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: .17em;
    text-transform: uppercase;
    color: var(--ink3) !important;
    white-space: normal;
  }

  .mob-root label.text-danger,
  .mob-root label .text-danger {
    color: var(--danger) !important;
  }

  /* ─── ช่องกรอก = .inp ─── */
  .mob-root .form-control,
  .mob-root .form-control.input-sm,
  .mob-root .select2-container--bootstrap .select2-selection {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 40px;
    padding: 9px 11px;
    font-size: 14px;
    line-height: 1.45;
    color: var(--ink);
    background: var(--paper);
    border: 1px solid var(--rule);
    border-radius: 2px;
    box-shadow: none;
  }

  .mob-root .form-control:focus,
  .mob-root .select2-container--bootstrap.select2-container--focus .select2-selection {
    outline: none;
    border-color: var(--navy);
    box-shadow: 0 0 0 3px rgba(23, 72, 168, .14);
  }

  .mob-root .form-control[readonly],
  .mob-root .form-control:disabled,
  .mob-root fieldset:disabled .form-control {
    background: var(--tint2);
    color: var(--ink2);
  }

  .mob-root textarea.form-control {
    min-height: 88px;
    resize: vertical;
  }

  .mob-root .select2-container {
    display: block;
    width: 100% !important;
  }

  /* ─── ช่องที่มีปุ่มค้นหา/ล้างค่าลอยอยู่ข้างใน ─── */
  .mob-root .input-shell {
    position: relative;
    display: block;
  }

  .mob-root .input-shell .form-control {
    padding-right: 40px;
  }

  .mob-root .input-shell.has-two .form-control {
    padding-right: 74px;
  }

  .mob-root .input-action {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border: 1px solid var(--rule);
    border-radius: 2px;
    background: var(--tint2);
    color: var(--ink2);
  }

  .mob-root .input-shell.has-two .input-action.search {
    right: 39px;
  }

  /* ─── แถบสถานะปัจจุบัน = .curstate ─── */
  .mob-root .modern-status-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
    width: fit-content;
    margin: 0 0 14px;
    padding: 9px 15px;
    border: 1.5px solid var(--warn);
    border-radius: 999px;
    background: rgba(160, 104, 5, .08);
  }

  .mob-root .modern-status-bar .status-label {
    font-size: 9.5px;
    letter-spacing: .15em;
    text-transform: uppercase;
    color: var(--ink3);
  }

  .mob-root .modern-status-bar .status-badge-pill {
    font-size: 13px;
    font-weight: 500;
    color: var(--warn);
  }

  /* ─── กลุ่มปุ่มสถานะ = .states ────────────────────────────
     auto-fit ทำให้จอ ~360px ได้ 1 ช่อง จอกว้างขึ้นได้ 2 ช่องเอง
     ของเดิมบังคับ 2 ช่องตายตัว ข้อความยาวจึงเบียดกัน */
  .mob-root .status-radio-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 6px;
  }

  .mob-root .status-radio-group > * {
    margin: 0 !important;
    min-width: 0;
  }

  /* ─── ตัวเลือกสถานะ : สัดส่วนวงกลมกับตัวอักษร ────────────────
     ต้นเหตุที่วงกลมใหญ่กว่าตัวอักษรหลายเท่า :
     icheck-material ตรึง label::before ไว้ที่ 22px (ไฟล์ package)
     ส่วนกฎ .mob-root label ด้านบนตั้งใจไว้สำหรับป้ายกำกับฟิลด์
     (9.5px uppercase letter-spacing .17em) แต่มันเหมารวม label ของ
     radio/checkbox ไปด้วย จึงได้ตัวอักษร 9.5px คู่กับวงกลม 22px
     ชุดนี้คืนขนาดตัวอักษรของ label ที่เป็นตัวเลือกให้อ่านได้ตามปกติ
     ตัวเลือก (0,2,1) ยาวกว่า .mob-root label (0,1,1) จึงทับได้ */
  .mob-root [class*="icheck-material"] {
    min-height: 0;
    margin: 0 !important;
  }

  .mob-root [class*="icheck-material"] > label {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 34px;
    margin: 0;
    padding-left: 30px !important;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.35;
    letter-spacing: 0;
    text-transform: none;
    color: var(--ink) !important;
    white-space: normal;
  }

  /* วงกลมกลับมาอยู่กลางแนวตั้งของบรรทัดที่สูงขึ้น
     (package ตรึง top ไว้ที่ 0 ซึ่งอ้างกับ line-height 22px เดิม) */
  .mob-root [class*="icheck-material"] > input:first-child + label::before {
    top: 50%;
    margin-top: -11px;
  }

  .mob-root [class*="icheck-material"] > input:first-child:checked + label::after {
    top: 65%;
    margin-top: -11px;
  }

  /* ไอคอนนำหน้าข้อความตัวเลือก */
  .mob-root [class*="icheck-material"] > label > i {
    flex: none;
    width: 14px;
    font-size: 11px;
    color: var(--ink3);
    text-align: center;
  }

  /* ─── การ์ดพับได้ย่อย = .sec ขนาดเล็ก ─────────────────────
     markup ชุด .wa-sec / .gauge-* / .stat-tiles ได้ layout จาก scoped
     style ของ edit_details.vue ซึ่งผูกกับ data-v ของไฟล์นั้น จึงไม่ตกมา
     ถึงไฟล์นี้ ผลคือหัวข้อเป็นลิงก์ลอย ๆ และแถบ gauge สูง 0 จนมองไม่เห็น */
  .mob-root .wa-stack {
    display: block;
    width: 100%;
  }

  .mob-root .wa-sec {
    margin: 0 0 12px;
    border: 1px solid var(--rule);
    border-radius: 3px;
    background: var(--paper);
    overflow: hidden;
  }

  .mob-root .wa-sec-head {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px 12px;
    background: var(--tint);
    color: var(--ink);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
  }

  .mob-root .wa-sec-head:hover,
  .mob-root .wa-sec-head:focus {
    color: var(--ink);
    text-decoration: none;
  }

  .mob-root .wa-sec-ic {
    display: grid;
    place-items: center;
    flex: none;
    width: 22px;
    height: 22px;
    border-radius: 2px;
    background: var(--navy);
    color: #fff;
    font-size: 11px;
  }

  .mob-root .wa-sec-title {
    flex: 1 1 auto;
    min-width: 0;
  }

  /* คำอธิบายท้ายหัวข้อ : ตกบรรทัดใหม่เต็มแถวบนจอแคบ ไม่เบียดชื่อ */
  .mob-root .wa-sec-hint {
    flex: 1 1 100%;
    order: 3;
    font-size: 10.5px;
    font-weight: 400;
    line-height: 1.4;
    color: var(--ink3);
  }

  .mob-root .wa-sec-chev {
    flex: none;
    font-size: 11px;
    color: var(--ink3);
    transition: transform .2s ease;
  }

  .mob-root .wa-sec-head.is-open .wa-sec-chev {
    transform: rotate(180deg);
  }

  .mob-root .wa-sec-body {
    padding: 12px;
  }

  /* ─── แถบความก้าวหน้า = .prog-wrap ─── */
  .mob-root .gauge-card {
    margin: 0 0 14px;
    padding: 12px;
    border: 1px solid var(--rule);
    border-radius: 2px;
    background: var(--tint2);
  }

  .mob-root .gauge-head {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 10px;
  }

  .mob-root .gauge-head > label {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
  }

  .mob-root .gauge-readout {
    display: flex;
    align-items: baseline;
    gap: 7px;
    flex: none;
  }

  .mob-root .gauge-value {
    font-size: 17px;
    font-weight: 700;
    color: var(--deep);
  }

  .mob-root .gauge-delta {
    font-size: 11.5px;
    font-weight: 600;
  }

  .mob-root .gauge-delta.is-up {
    color: var(--ok);
  }

  .mob-root .gauge-delta.is-down {
    color: var(--danger);
  }

  /* แถบสูง 14px + พื้นที่กดเผื่อรอบ 10px ให้นิ้วโดนง่ายบนจอสัมผัส */
  .mob-root .gauge-track {
    position: relative;
    height: 14px;
    border-radius: 999px;
    background: var(--tint);
    cursor: pointer;
    touch-action: none;
  }

  .mob-root .gauge-track::before {
    content: '';
    position: absolute;
    top: -10px;
    right: 0;
    bottom: -10px;
    left: 0;
  }

  .mob-root .gauge-fill {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    border-radius: 999px;
    background: var(--navy);
  }

  .mob-root .gauge-knob {
    position: absolute;
    top: 50%;
    width: 24px;
    height: 24px;
    margin-left: -12px;
    border: 2px solid var(--navy);
    border-radius: 50%;
    background: #fff;
    transform: translateY(-50%);
    box-shadow: 0 1px 4px rgba(10, 28, 61, .28);
  }

  .mob-root .gauge-base {
    position: absolute;
    top: -3px;
    bottom: -3px;
    width: 2px;
    background: var(--ink3);
  }

  .mob-root .gauge-track.is-locked {
    cursor: not-allowed;
    opacity: .75;
  }

  .mob-root .gauge-track.is-locked .gauge-knob {
    display: none;
  }

  /* ─── ช่องตัวเลขสามช่อง = .dl ─── */
  .mob-root .stat-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
    gap: 10px;
  }

  .mob-root .stat-tile {
    min-width: 0;
  }

  .mob-root .stat-val {
    min-height: 40px;
    padding: 9px 11px;
    border: 1px solid var(--rule);
    border-radius: 2px;
    background: var(--tint2);
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
  }

  /* ─── ปุ่ม ─── */
  .mob-root .btn {
    border-radius: 2px;
    min-height: 36px;
    white-space: normal;
  }

  /* ─── ตาราง : เลื่อนแนวนอนในกรอบตัวเอง ไม่ดันกรอบ ─── */
  .mob-root .table-responsive,
  .mob-root .warranty-ag-table-wrap {
    max-width: 100%;
    overflow-x: auto;
  }

  /* ─── datepicker (vue2-datepicker) ───────────────────────
     .mx-datepicker ตั้ง width:210px มาจาก package css
     datepicker.vue ใส่ style="width:100%" ที่ root ให้แล้ว แต่ยังมี
     .mx-input-wrapper ชั้นในที่ไม่ได้กำหนด จึงย้ำทั้งชุดให้เต็มช่อง */
  .mob-root .mx-datepicker,
  .mob-root .mx-datepicker-range,
  .mob-root .mx-input-wrapper {
    display: block;
    width: 100% !important;
    max-width: 100%;
  }

  /* ─── input-group ที่มีปุ่มค้นหา/ล้างค่าต่อท้าย ─────────────
     bootstrap 3 ใช้ display:table ซึ่งไม่สนใจ min-width:0 ของกฎด้านบน
     ปล่อยไว้ปุ่มจะดันช่องกรอกให้ล้น จึงเปลี่ยนเป็น flex แล้วให้ช่องกรอกหดได้ */
  .mob-root .input-group {
    display: flex;
    width: 100%;
  }

  .mob-root .input-group > .form-control {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
  }

  .mob-root .input-group > .input-group-btn,
  .mob-root .input-group > .input-group-addon {
    flex: none;
    width: auto;
    white-space: nowrap;
  }

  /* ─── การ์ดคนทำงาน / ผู้ตรวจ = .pick ของดีไซน์ ─────────────
     markup ชุด .wa-person เดิมได้ layout จาก scoped style ของ
     edit_details.vue ซึ่งผูกกับ data-v ของไฟล์นั้น จึงไม่ตกมาถึงไฟล์นี้
     ผลคือ span/input เรียงแบบ inline ที่ความกว้างตั้งต้นของเบราว์เซอร์
     (~180px ต่อช่อง) สามช่องต่อกันจึงล้นออกนอกจอ — กำหนดใหม่เป็น
     กรอบเดียวที่ห่อบรรทัดได้ */
  .mob-root .wa-person {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--rule);
    border-radius: 2px;
    background: var(--paper);
  }

  /* วงกลมรหัสพนักงาน 34px */
  .mob-root .wa-avatar {
    display: grid;
    place-items: center;
    flex: none;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--tint);
    color: var(--deep);
    font-size: 11px;
    font-weight: 700;
  }

  /* ชื่อ : กินที่ว่างที่เหลือ และหดได้เมื่อจอแคบ */
  .mob-root .wa-person-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1 1 140px;
    min-width: 0;
  }

  .mob-root .wa-person-role {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: .15em;
    text-transform: uppercase;
    color: var(--ink3);
  }

  .mob-root .wa-person-name,
  .mob-root .wa-meta-value {
    width: 100%;
    min-width: 0;
    padding: 4px 0;
    font-size: 13.5px;
    color: var(--ink);
    background: transparent;
    border: 0;
  }

  .mob-root .wa-person-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: none;
  }

  .mob-root .wa-meta-value {
    width: 46px;
    text-align: center;
    border: 1px solid var(--rule);
    border-radius: 2px;
  }

  .mob-root .wa-meta-label {
    font-size: 9.5px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--ink3);
  }

  .mob-root .wa-person-actions {
    display: flex;
    gap: 6px;
    flex: none;
  }

  .mob-root .wa-icon-btn {
    display: grid;
    place-items: center;
    width: 34px;
    min-height: 34px;
    padding: 0;
  }

  /* ─── แถวปุ่ม + Worker / Revise Defect ─────────────────────
     ของเดิมเป็นแถวเดียวไม่ห่อบรรทัด (.wa-actions-trail มี
     flex-shrink:0 จาก style ไม่ scoped ของ edit_details.vue ที่
     namespace ด้วย .mango-task-form ซึ่ง root ของไฟล์นี้ก็มี)
     ตัวเลือกที่ยาวกว่า (0,4,0) จึงทับได้ทั้งชุด */
  .mob-root .wa-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    width: 100%;
    margin-bottom: 13px;
  }

  /* ตัวนับแยกลงบรรทัดของตัวเองและกระจายเต็มแถว ไม่กองอยู่ชิดขวา
     (ของเดิม margin-left:auto จาก style ไม่ scoped ของ edit_details.vue
      ดันทั้งกลุ่มไปติดขอบขวา เหลือช่องว่างใหญ่กลางแถว) */
  .mob-root .wa-actions .wa-actions-trail {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-left: 0;
    flex: 1 1 100%;
    min-width: 0;
  }

  .mob-root .wa-actions .wa-worker-no-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 140px;
    min-width: 0;
  }

  .mob-root .wa-actions .wa-worker-no-label {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 11px;
    white-space: normal;
  }

  .mob-root .wa-actions .wa-worker-no {
    flex: none;
    width: 52px;
    min-height: 34px;
    height: auto;
    padding: 5px 4px;
  }

  /* ปุ่มเต็มความกว้างบนจอแคบ = เป้ากดใหญ่ และไม่ทิ้งช่องว่างข้างขวา */
  .mob-root .wa-actions .wa-add-btn {
    flex: 1 1 100%;
    height: auto;
    min-height: 40px;
    padding: 0 16px;
    border-radius: 2px;
  }

  .mob-root .wa-ai-btn {
    flex: none;
    width: 38px;
    min-height: 38px;
    padding: 0;
  }

  /* ─── tablet แนวตั้ง : ขยายระยะขอบ ─── */
  @media (min-width: 640px) {
    .mob-root .info-card-body {
      padding: 20px 20px 6px;
    }
  }

  @media (min-width: 940px) {
    .mob-root {
      max-width: 760px;
      margin: 0 auto;
    }
  }
</style>
