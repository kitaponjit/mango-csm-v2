<template>
  <div>
    <div class="row">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="section-card section-card-info" id="DocumentDetailBox">
          <div class="section-card-header box-header">
            <span class="section-card-icon section-icon-info"><i class="far fa-file-alt"></i></span>
            <span class="section-card-title">{{ ui.erp_document_details }}</span>
            <div class="box-tools pull-right">
              <button type="button" class="btn btn-box-tool" data-widget="collapse">
                <i class="fas fa-minus"></i>
              </button>
            </div>
          </div>
          <div class="section-card-body box-body">
            <fieldset v-bind:disabled="isDisabled('h1')">
              <div class="row">
                <div class="col-lg-6 col-md-4 col-sm-4">
                  <div class="form-group">
                    <div class="field-label-row">
                      <label class="field-label field-required" id="subject" v-text="ui.csm_v2_subject"></label>
                      <span class="char-count">{{xt.textLength(formData['subject'], 250)}}  {{ ui.csm_trn_characters }}</span>
                    </div>
                    <span class="input-shell">
                      <input type="text" class="form-control input-sm" v-model="formData['subject']" ref="subject" maxlength="250" />
                      <button class="input-action" @click="openDescModal1('description1')" :title="ui.search"><i class="fa fa-search"></i></button>
                    </span>
                  </div>
                </div>
                <div class="col-lg-3 col-md-4 col-sm-4">
                  <div class="form-group">
                    <label class="field-label" v-text="ui.csm_reqno || 'Req. No'"></label>
                    <input type="text" class="form-control input-sm field-readonly text-bold" v-model="formData['job_no']" readonly />
                  </div>
                </div>
                <div class="col-lg-3 col-md-4 col-sm-4">
                  <div class="form-group">
                    <label class="field-label field-required" v-text="ui.csm_priority || 'Req. Priority'"></label>
                    <select class="form-control input-sm" v-model="formData['job_priority']" v-bind:disabled="(formData.request_empno != auth.empno || ['I','Y'].includes(formData['job_status']))" ref="job_priority">
                      <option v-for="x in priorityCodeData_isActive" :value="x.prioity_code" :hidden="x.active !== 'Y'">{{x.prioity_des}}</option>
                    </select>
                  </div>
                </div>
              </div>
            </fieldset>
            <div class="row">
              <div class="col-lg-6 col-md-6 col-sm-6">
                <fieldset v-bind:disabled="isDisabled('h1')">
                  <div class="row">
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="field-label" v-text="ui.csm_docdate || 'Doc. Date'"></label>
                        <datepicker input-class="form-control input-sm field-readonly" v-model="formData['job_date']" overdate="" :disabled="true"></datepicker>
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="field-label" v-text="ui.re_complete_date_v2 || 'Completed Date'"></label>
                        <datepicker input-class="form-control input-sm field-readonly" v-model="formData['job_complete_date']" disabled="true"></datepicker>
                      </div>
                    </div>
                  </div>
                  <div class="row" v-if="pickerUndecided">
                    <div class="col-lg-12">
                      <div class="form-group">
                        <label class="field-label field-required">{{ (ui.project || 'Project') + ' / ' + (ui.department || 'Department') }}</label>
                        <div class="picker-tabs">
                          <button type="button" class="picker-tab" :class="{active: pickerTab === 'project'}" @click="pickerTab = 'project'">{{ ui.project || 'Project' }}</button>
                          <button type="button" class="picker-tab" :class="{active: pickerTab === 'department'}" @click="pickerTab = 'department'">{{ ui.department || 'Department' }}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row" v-if="showProjectPanel">
                    <div class="col-lg-4 col-md-6 col-sm-6">
                      <div class="form-group">
                        <label class="field-label field-required" v-text="ui.project || 'Project'" v-if="!pickerUndecided"></label>
                        <label class="field-label" v-else>&nbsp;</label>
                        <span class="input-shell has-two">
                          <input type="text" class="form-control input-sm field-readonly" v-model="formData['pre_event']" readonly />
                          <button class="input-action search" @click="openModalComponent('project')" ref="pre_event" :title="ui.search"><i class="fa fa-search"></i></button>
                          <button class="input-action danger" @click="clearData(formData, ['pre_event', 'pre_des', 'refcode', 'customer_code', 'customer_name','mg_ma','cust_type_name', 'cust_contact_name', 'cust_contact_phone', 'cust_contact_email'])" :title="ui.csm_trn_clear_data"><i class="fa fa-times"></i></button>
                        </span>
                      </div>
                    </div>
                    <div class="col-lg-8 col-md-6 col-sm-6">
                      <div class="form-group">
                        <label class="field-label">&nbsp;</label>
                        <input type="text" class="form-control input-sm field-readonly" :value="(formData['pre_des'] || '') + (xt.isEmpty(formData['refcode']) ? '' : ' (' + formData['refcode'] + ')')" readonly />
                      </div>
                    </div>
                  </div>
                  <div class="row" v-if="showDeptPanel">
                    <div class="col-lg-4 col-md-6 col-sm-6">
                      <div class="form-group">
                        <label class="field-label field-required" v-text="ui.department || 'Department'" v-if="!pickerUndecided"></label>
                        <label class="field-label" v-else>&nbsp;</label>
                        <span class="input-shell has-two">
                          <input type="text" class="form-control input-sm field-readonly" v-model="formData['dpt_no']" readonly />
                          <button class="input-action search" @click="openModalComponent('department')" :title="ui.search"><i class="fa fa-search"></i></button>
                          <button class="input-action danger" @click="clearData(formData, ['dpt_no', 'dpt_no_name'])" :title="ui.csm_trn_clear_data"><i class="fa fa-times"></i></button>
                        </span>
                      </div>
                    </div>
                    <div class="col-lg-8 col-md-6 col-sm-6">
                      <div class="form-group">
                        <label class="field-label">&nbsp;</label>
                        <input type="text" class="form-control input-sm field-readonly" v-model="formData['dpt_no_name']" readonly />
                      </div>
                    </div>
                  </div>
                </fieldset>
                <fieldset v-bind:disabled="isDisabled('h2')">
                  <div class="row">
                    <div class="col-lg-4 col-md-6 col-sm-6">
                      <div class="form-group">
                        <label class="field-label field-required" v-text="ui.customer || 'Customer'"></label>
                        <span class="input-shell has-two">
                          <input type="text" class="form-control input-sm field-readonly" v-model="formData['customer_code']" readonly />
                          <button class="input-action search" @click="openModalComponent('cm_customer')" :title="ui.search"><i class="fa fa-search"></i></button>
                          <button class="input-action danger" @click="clearData(formData, ['customer_code', 'customer_name','cust_type_name', 'cust_contact_name', 'cust_contact_phone', 'cust_contact_email'])" :title="ui.csm_trn_clear_data"><i class="fa fa-times"></i></button>
                        </span>
                      </div>
                    </div>
                    <div class="col-lg-4 col-md-3 col-sm-3">
                      <div class="form-group">
                        <label class="field-label" v-if="!isDeveloper() || !isMango">&nbsp;</label>
                        <label class="field-label pull-right"><a href="#" target="_blank" class="dev-link pointer" @click.prevent="queryStringRemoteIP()" v-if="isDeveloper() && isMango">{{ ui.csm_trn_it_customer_data }}</a></label>
                        <input type="text" class="form-control input-sm field-readonly" v-model="formData['customer_name']" readonly />
                      </div>
                    </div>
                    <div class="col-lg-4 col-md-3 col-sm-3">
                      <div class="form-group">
                        <label class="field-label" v-text="'ประเภทลูกค้า'"></label>
                        <input type="text" class="form-control input-sm field-readonly" v-model="formData['cust_type_name']" readonly />
                      </div>
                    </div>
                  </div>
                </fieldset>
                <!-- Job Poch -->
                <fieldset v-if="this.config.TENDER_JOB == 'Y' && !xt.isEmpty(formData['pre_event'])" v-bind:disabled="isDisabled('h2')">
                  <div class="row">
                    <div class="col-lg-4 col-md-6 col-sm-6">
                      <div class="form-group">
                        <label class="field-label field-required" v-text="'Job Detail'"></label>
                        <span class="input-shell has-two">
                          <input type="text" class="form-control input-sm field-readonly" v-model="formData['jobcode']" readonly />
                          <button class="input-action search" @click="openModalPoch('job_details')" :title="ui.search"><i class="fa fa-search"></i></button>
                          <button class="input-action danger" @click="clearData(formData, ['jobcode', 'jobname'])" :title="ui.csm_trn_clear_data"><i class="fa fa-times"></i></button>
                        </span>
                      </div>
                    </div>
                    <div class="col-lg-8 col-md-6 col-sm-6">
                      <div class="form-group">
                        <label class="field-label">&nbsp;</label>
                        <input type="text" class="form-control input-sm field-readonly" v-model="formData['jobname']" readonly />
                      </div>
                    </div>
                  </div>
                </fieldset>
                <fieldset v-bind:disabled="isDisabled('h1')">
                  <div class="row">
                    <div class="col-lg-4">
                      <div class="form-group">
                        <label :class="['field-label', activeconfig.TRN001A === 'Y' ? 'field-required' : '']" v-text="ui.csm_contract_user || 'Contract User'"></label>
                        <input type="text" class="form-control input-sm" v-model="formData['contract_user']" maxlength="255" ref="contract_user" />
                      </div>
                    </div>
                    <div class="col-lg-4">
                      <div class="form-group">
                        <label :class="['field-label', activeconfig.TRN001B === 'Y' ? 'field-required' : '']" v-text="ui.contract_pos || 'Contact Position'"></label>
                        <input type="text" class="form-control input-sm" v-model="formData['contract_pos']" maxlength="255" ref="contract_pos" />
                      </div>
                    </div>
                    <div class="col-lg-4">
                      <div class="form-group">
                        <label :class="['field-label', activeconfig.TRN001E === 'Y' ? 'field-required' : '']" v-text="ui.csm_contact_code || 'Connection'"></label>
                        <select class="form-control input-sm" v-model="formData['connection_type']" v-bind:disabled="(formData.request_empno != auth.empno || ['I','Y'].includes(formData['job_status']))" ref="connection_type">
                          <option v-for="(x,idx) in connectionCodeData" :value="x.contact_code" :hidden="x.active !== 'Y'">{{x.contact_name}}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-4">
                      <div class="form-group">
                        <label :class="['field-label', activeconfig.TRN001C === 'Y' ? 'field-required' : '']" v-text="ui.re_phone || 'Tel.'"></label>
                        <input type="text" class="form-control input-sm" v-model="formData['phone']" maxlength="10" ref="phone" @keypress="isNumber" />
                      </div>
                    </div>
                    <div class="col-lg-4">
                      <div class="form-group">
                        <label :class="['field-label', activeconfig.TRN001D === 'Y' ? 'field-required' : '']" v-text="ui.re_email || 'E-mail'"></label>
                        <input type="text" class="form-control input-sm" v-model="formData['email']" maxlength="255" ref="email" />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-12">
                      <div class="cust-self-report-toggle">
                        <label class="switch-toggle">
                          <input class="form-check-input" type="checkbox" true-value="Y" false-value="N" v-model="formData['contract_by_cust']" @change="setContractUser()" id="chk_contract_by_cust" />
                          <span class="switch-track"><span class="switch-knob"></span></span>
                        </label>
                        <label for="chk_contract_by_cust" class="cust-self-report-label">
                          <span v-tooltip="ui.csm_trn_tooltip_default_contract_user">
                            {{ ui.csm_trn_customer_self_report }}
                            <i class="fas fa-info-circle text-danger"></i>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="row" v-if="formData['contract_by_cust'] == 'Y'">
                    <div class="col-lg-12">
                      <div class="cust-contact-panel">
                        <div class="cust-contact-row">
                          <div class="cust-contact-item">
                            <label class="field-label" v-text="'ผู้ติดต่อ (Customer)'"></label>
                            <input type="text" class="form-control input-sm field-readonly" v-model="formData['cust_contact_name']" disabled/>
                          </div>
                          <div class="cust-contact-item">
                            <label class="field-label" v-text="'เบอร์โทร (Customer)'"></label>
                            <input type="text" class="form-control input-sm field-readonly" v-model="formData['cust_contact_phone']" disabled/>
                          </div>
                          <div class="cust-contact-item">
                            <label class="field-label" v-text="'อีเมล (Customer)'"></label>
                            <input type="text" class="form-control input-sm field-readonly" v-model="formData['cust_contact_email']" disabled/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
                <div :disabled="true">
                  <div class="row">
                    <div class="col-lg-10">
                      <div class="form-group">
                        <label :class="['field-label', activeconfig.TRN001F === 'Y' ? 'field-required' : '']">
                          {{ ui.csm_v2_contact_request_details }}
                          <a @click="openDescModal1('description')" class="field-action-btn" :title="ui.search"><i class="fa fa-search"></i></a>
                          <a @click="clearData(formData, ['descode', 'remark'])" class="field-action-btn field-action-clear" :title="ui.csm_trn_clear_data"><i class="fa fa-times"></i></a>
                        </label>
                        <textarea class="form-control input-sm" rows="4" v-model.trim="formData['remark']" ref="remark"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-6 col-md-6 col-sm-6">
                <div class="gemini-card" id="CustomerHistoryBox">
                  <div class="gemini-card-header box-header">
                    <span class="gemini-card-icon"><i class="fa fa-folder-open"></i></span>
                    <span class="gemini-card-title">{{ ui.csm_trn_customer_job_history }}</span>
                    <div class="box-tools pull-right">
                      <button type="button" class="btn btn-box-tool" data-widget="collapse">
                        <i class="fas fa-minus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="gemini-card-body box-body">
                    <div class="gemini-stat-row">
                      <div class="gemini-stat gemini-stat--request">
                        <span class="gemini-stat-label"><span class="gemini-stat-dot"></span>{{ ui.erp_request }}</span>
                        <span class="gemini-stat-value">{{ (historyTotal.total_request || 0).toLocaleString() }}</span>
                      </div>
                      <div class="gemini-stat gemini-stat--warn">
                        <span class="gemini-stat-label"><span class="gemini-stat-dot"></span>{{ ui.csm_v2_status_pending }}</span>
                        <span class="gemini-stat-value">{{ (historyTotal.total_assign || 0).toLocaleString() }}</span>
                      </div>
                      <div class="gemini-stat gemini-stat--allitems">
                        <span class="gemini-stat-label"><span class="gemini-stat-dot"></span>{{ ui.csm_trn_all_items }}</span>
                        <span class="gemini-stat-value">{{ (historyTotal.total_allitem || 0).toLocaleString() }}</span>
                      </div>
                    </div>
                    <div class="gemini-meta-row hidden-md hidden-sm">
                      <span class="gemini-remark"><i class="fa fa-info-circle"></i> {{ ui.csm_trn_history_exclude_note }}</span>
                      <span class="gemini-legend">
                        <span><span class="status-dot dot-W"></span>{{ ui.csm_v2_status_pending }}</span>
                        <span><span class="status-dot dot-I"></span>{{ ui.csm_v2_status_in_progress }}</span>
                        <span><span class="status-dot dot-Y"></span>{{ ui.csm_v2_status_finished }}</span>
                      </span>
                    </div>
                    <div class="history-ag-table-wrap">
                      <ag-table ref="historyTable" :scale="400" :footer="false" @ready="initHistoryTable()"></ag-table>
                    </div>
                    <div class="gemini-card-footer">
                      <span class="gemini-count-label">{{ ui.csm_trn_total_items.replace('{0}', (historyTotal.total_allitem || 0).toLocaleString()) }}</span>
                      <pagination ref="historyPaging" @page-change="onPageChange($event.page, 'history')"></pagination>
                    </div>
                  </div>
                </div>
                <div v-if="this.config.TENDER_JOB == 'Y' && !xt.isEmpty(formData.jobcode)" class="col-md-12">
                  <div class="col-md-8">
                    <table-stick-2>
                      <table class="table table-hover">
                        <thead>
                          <tr>
                            <th class="tf-3">{{ ui.csm_v2_status_pending }}</th>
                            <th class="tf-3">{{ ui.csm_v2_status_finished }}</th>
                            <th class="tf-3-5">{{ ui.csm_trn_contract_remain }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td align="center">
                              <a href="#" @click.prevent="openModalPoch('pending')">
                                {{ contractList.pending && contractList.pending.total ? contractList.pending.total : 0 }}
                              </a>
                            </td>
                            <td align="center">
                              <a href="#" @click.prevent="openModalPoch('complete')">
                                {{ contractList.complete && contractList.complete.total ? contractList.complete.total : 0 }}
                              </a>
                            </td>
                            <td align="center" :class="contractList.expire_status == 'Y' ? 'text-danger' : ''">
                              {{
                                contractList.qty_tot - (
                                                      (contractList.pending && contractList.pending.total ? contractList.pending.total : 0) +
                                                      (contractList.complete && contractList.complete.total ? contractList.complete.total : 0)
                                                    ) || 0
                              }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </table-stick-2>
                  </div>
                  <div class="col-md-4">
                    <button class="btn btn-small bg-green text-white" @click="openModalPoch('detail')">{{ ui.csm_trn_service_detail }}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-12 col-md-12 col-sm-12">
        <div class="section-card section-card-primary" id="AssignmentBox">
          <div class="section-card-header box-header">
            <span class="section-card-icon section-icon-primary"><i class="fa fa-users"></i></span>
            <span class="section-card-title">{{ ui.csm_trn_assignment }}</span>
            <div class="box-tools pull-right">
              <button type="button" class="btn btn-box-tool" data-widget="collapse">
                <i class="fas fa-minus"></i>
              </button>
            </div>
          </div>
          <div class="section-card-body box-body" style="padding: 12px 16px;">
            <div class="assign-grid">
              <!-- Request by -->
              <div class="assign-card assign-card-req" :class="{'is-empty': !requestPerson.has}">
                <div class="assign-card-top">
                  <span class="assign-monogram">
                    <span v-if="requestPerson.has">{{requestPerson.initial}}</span>
                    <i v-else class="fa fa-user-plus"></i>
                  </span>
                  <div class="assign-identity">
                    <span class="assign-role"><i class="fa fa-user-circle"></i> {{ ui.csm_trn_reporter }}</span>
                    <div class="assign-name-line">
                      <span class="assign-name">{{requestPerson.name || ui.csm_trn_not_specified}}</span>
                      <span class="assign-nick" v-if="requestPerson.nick">{{requestPerson.nick}}</span>
                    </div>
                  </div>
                  <button class="btn btn-xs btn-search assign-search-btn" @click="empModalSelected('request')" v-bind:disabled="config_req !== 'Y' || ['W','I','Y','N'].includes(formData.job_status) && !isAdmin" :title="ui.csm_trn_change_reporter">
                    <i class="fa fa-search"></i>
                  </button>
                </div>
                <div class="assign-ledger">
                  <div class="ledger-cell">
                    <span class="ledger-label" :title="ui.re_email || 'E-mail'"><i class="fa fa-envelope"></i>{{ui.re_email || 'E-mail'}}</span>
                    <a v-if="formData['request_empno_email']" class="ledger-value" :href="'mailto:' + formData['request_empno_email']" :title="formData['request_empno_email']">{{formData['request_empno_email']}}</a>
                    <span v-else class="ledger-value is-blank">—</span>
                  </div>
                  <div class="ledger-cell">
                    <span class="ledger-label" :title="ui.re_phone || 'Tel.'"><i class="fa fa-phone"></i>{{ui.re_phone || 'Tel.'}}</span>
                    <a v-if="formData['request_empno_emptel']" class="ledger-value is-num" :href="telHref(formData['request_empno_emptel'])">{{formData['request_empno_emptel']}}</a>
                    <span v-else class="ledger-value is-blank">—</span>
                  </div>
                  <div class="ledger-cell">
                    <span class="ledger-label" :title="ui.csm_trn_contact_mobile"><i class="fa fa-mobile"></i>{{ ui.csm_trn_contact_mobile }}</span>
                    <a v-if="formData['request_empno_empmob']" class="ledger-value is-num" :href="telHref(formData['request_empno_empmob'])">{{formData['request_empno_empmob']}}</a>
                    <span v-else class="ledger-value is-blank">—</span>
                  </div>
                </div>
              </div>
              <!-- Responsible Person -->
              <div class="assign-card assign-card-assign" :class="{'is-empty': !assignPerson.has}">
                <div class="assign-card-top">
                  <span class="assign-monogram">
                    <span v-if="assignPerson.has">{{assignPerson.initial}}</span>
                    <i v-else class="fa fa-user-plus"></i>
                  </span>
                  <div class="assign-identity">
                    <span class="assign-role"><i class="fa fa-user-tie"></i> {{ ui.csm_trn_main_responsible }}</span>
                    <div class="assign-name-line">
                      <span class="assign-name">{{assignPerson.name || ui.csm_trn_not_specified}}</span>
                      <span class="assign-nick" v-if="assignPerson.nick">{{assignPerson.nick}}</span>
                    </div>
                  </div>
                  <button class="btn btn-xs btn-search assign-search-btn" @click="empModalSelected('assign')" v-bind:disabled="['I','Y','N'].includes(formData['job_status']) && !isAdmin" :title="ui.csm_trn_change_responsible" ref="assign_empno">
                    <i class="fa fa-search"></i>
                  </button>
                </div>
                <div class="assign-ledger">
                  <div class="ledger-cell">
                    <span class="ledger-label" :title="ui.re_email || 'E-mail'"><i class="fa fa-envelope"></i>{{ui.re_email || 'E-mail'}}</span>
                    <a v-if="formData['assign_empno_email']" class="ledger-value" :href="'mailto:' + formData['assign_empno_email']" :title="formData['assign_empno_email']">{{formData['assign_empno_email']}}</a>
                    <span v-else class="ledger-value is-blank">—</span>
                  </div>
                  <div class="ledger-cell">
                    <span class="ledger-label" :title="ui.re_phone || 'Tel.'"><i class="fa fa-phone"></i>{{ui.re_phone || 'Tel.'}}</span>
                    <a v-if="formData['assign_empno_emptel']" class="ledger-value is-num" :href="telHref(formData['assign_empno_emptel'])">{{formData['assign_empno_emptel']}}</a>
                    <span v-else class="ledger-value is-blank">—</span>
                  </div>
                  <div class="ledger-cell">
                    <span class="ledger-label" :title="ui.csm_trn_contact_mobile"><i class="fa fa-mobile"></i>{{ ui.csm_trn_contact_mobile }}</span>
                    <a v-if="formData['assign_empno_empmob']" class="ledger-value is-num" :href="telHref(formData['assign_empno_empmob'])">{{formData['assign_empno_empmob']}}</a>
                    <span v-else class="ledger-value is-blank">—</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <history_poch ref="historyPochModal" :type="statusPoch" :dataList="contractList.detail"></history_poch>
    <service_detail ref="serviceDetail" :type="statusPoch" :pre-event="formData['pre_event']" :job-type="formData['jobcode']"></service_detail>
    <job_detail ref="jobDetail" @send-data="sendComponent($event, 'job-detail')" @select-job="selectJobCode($event)" :pre-event="formData['pre_event']"></job_detail>
    <!-- <vue-project2-list ref="ct_project2" @send-data="sendComponent($event, 'project')" :chk_code="chk_code"></vue-project2-list> -->
    <!-- <vue-department-list ref="ct_department" @send-data="sendComponent($event, 'department')"></vue-department-list> -->
  </div>
</template>
<script type="text/javascript">
  import historyPochModal from './components_poch/v_history_poch.vue'
  import serviceDetail from './components_poch/v_service_detail_poch.vue'
  import jobDetail from './components_poch/v_jobcode_poch.vue'

  import { mapState, mapGetters } from 'vuex'

  let historyPaging = {}
  let page = {}
  export default {
    components: {
      "history_poch": historyPochModal,
      "service_detail": serviceDetail,
      "job_detail": jobDetail,
    },
    props: {
      chk_code: String,
      formData: Object,
      isDisabled: Function,
      openDescModal1: Function,
      clearData: Function,
      customerModalSelected: Function,
      openModalComponent: Function,
      openDepartment: Function,
      queryStringRemoteIP: Function,
      isDeveloper: Function,
      is_mango: Function,
      isAdmin: Boolean,
      setContractUser: Function,
      priorityCodeData_isActive: Array,
      connectionCodeData: Array,
      empModalSelected: Function,
      loadData: Function,
      editDetailData: Object,
      detailData: Array,
      loadSupplierWarranty: Function,
      loadArea: Function,
      setContractData: Function,
      loadCheckWarranty: Function,
      activeconfig: [Object, Array],
      config_req: String,
      sendComponent: Function,
    },
    data() {
      return {
        auth,
        baseUrl,
        ui: window.ui,
        xt: $xt,
        queryString,
        historyTotal: {},
        historyData: [],
        statusPoch: "",
        contractList: [],
        pickerTab: this.formData['dpt_no'] ? 'department' : 'project',
      }
    },
    methods: {
      async loadHistory() {
        let act = `csm/data/CSM_History?pre_event=${this.formData['pre_event'] || ''}&dpt_no=${this.formData['dpt_no'] || ''}&job_no=${this.formData['job_no'] || ''}&skip=${historyPaging.skipItems()}&take=${historyPaging.getItemsPerPage()}`
        let rsp = await $xt.getServer(act)
        this.historyData = rsp.data
        this.historyTotal = rsp.total

        historyPaging.setTotalItems(rsp.total.total_allitem)
        if (!historyPaging.getItemsPerPage()) {
          historyPaging.setCurrentPage(1)
        }
        historyPaging.createPagesArray()

        this.$refs.historyTable.setDisplay(this.historyData)
      },
      initHistoryTable() {
        let agr = this.$refs.historyTable
        let deptHeader = !$xt.isEmpty(this.formData['pre_event']) ? this.ui.csm_v2_project : this.ui.erp_department
        let fields = [
          ['job_no', this.ui.erp_csm_no, 'text', {
            width: 160,
            align: 'left', pinned: 'left',
            sortable: false,
            cellRenderer: (params) => {
              let jobNo = params.value
              if (!jobNo) return ''
              let dotColor = { W: '#d99a2b', I: '#2f7fe0', Y: '#189358' }[params.data.job_status] || '#9aa1ab'
              return `<span style="display:inline-flex;align-items:center;gap:8px;">
                <span style="width:9px;height:9px;border-radius:50%;background:${dotColor};display:inline-block;flex-shrink:0;"></span>
                <a href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${jobNo}" target="_blank" style="color:#1a73e8;font-weight:600;text-decoration:none;">${jobNo}</a>
              </span>`
            },
          }],
          ['job_date', 'Date', 'date', { width: 110, align: 'center', sortable: false }, { useCellRenderer: true }],
          ['subject', 'Subject', 'text', { width: 170, align: 'left', sortable: false }],
          ['pre_des', deptHeader, 'text', {
            width: 150,
            align: 'left',
            sortable: false,
            cellRenderer: (params) => $xt.isEmpty(params.data.pre_event) ? (params.data.dpt_name || '') : (params.data.pre_des || ''),
          }],
          ['request_empname', this.ui.csm_home_req_by, 'text', { width: 140, align: 'left', sortable: false }],
          ['contract_user', this.ui.erp_contact_by, 'text', { width: 120, align: 'left', sortable: false }],
        ]
        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)
      },
      async onPageChange(pn, pt) {
        switch (pt) {
          case 'history':
            historyPaging.setCurrentPage(pn)
            await this.loadHistory()
            break
        }
      },
      parsePerson(raw) {
        let full = (raw || '').trim()
        if ($xt.isEmpty(full) || full === '-') {
          return { has: false, name: '', nick: '', initial: '' }
        }
        let nick = (full.match(/\(([^)]*)\)\s*$/) || [])[1] || ''
        let name = full.replace(/\s*\([^)]*\)\s*$/, '').trim()
        let bare = name.replace(/^(นางสาว|นาง|นาย|น\.ส\.|ด\.ช\.|ด\.ญ\.|ดร\.|คุณ|Mr\.?|Mrs\.?|Ms\.?)\s*/i, '').trim()
        return {
          has: true,
          name: name,
          nick: nick.trim(),
          initial: (bare || name).charAt(0)
        }
      },
      telHref(value) {
        return 'tel:' + String(value || '').replace(/[^\d+]/g, '')
      },
      isNumber(evt) {
        evt = evt || window.event;
        var charCode = evt.which || evt.keyCode;
        if (charCode < 48 || charCode > 57) {
          evt.preventDefault();
          return false;
        }
        return true;
      },
      openModalPoch(type) {
        switch (type) {
          case 'pending':
            // console.log('pending');
            this.statusPoch = 'Pending'
            this.$refs.historyPochModal.setSize('modal-xl')
            this.$refs.historyPochModal.type = 'Pending'
            this.$refs.historyPochModal.openModal()
            break
          case 'complete':
            // console.log('complete');
            this.statusPoch = 'Complete'
            this.$refs.historyPochModal.setSize('modal-xl')
            this.$refs.historyPochModal.type = 'Complete'
            this.$refs.historyPochModal.openModal()
            break
          case 'detail':
            // console.log('detail');
            this.$refs.serviceDetail.setSize('modal-xl')
            this.$refs.serviceDetail.openModal()
            // window.open(this.baseUrl + 'page/poch/v_service_detail_poch/');
            break
          case 'job_details':
            // console.log('job_details');
            this.$refs.jobDetail.openModal()
            break
        }
      },
      selectJobCode(data) {
        // console.log('data', data);
        this.loadContractData(data)
      },
      async loadContractData2(data) {
        let act = `csm/data/CSM_Contract?pre_event=${this.formData['pre_event'] || ''}&jobcode=${data.jobcode || ''}`
        let rsp = await $xt.getServer(act)
        let list = rsp.data || []
        await this.$set(this, 'contractList', list)

        // รวมจำนวน pending (W,I,N)
        let totalPending = list.header.filter(row => ['W', 'I', 'N'].includes(row.job_status)).reduce((sum, row) => sum + (row.total || 0), 0)

        // รวมจำนวน complete (Y)
        let totalComplete = list.header.filter(row => row.job_status === 'Y').reduce((sum, row) => sum + (row.total || 0), 0)

        // เก็บ pending / complete เป็น object
        this.$set(this.contractList, 'pending', { total: totalPending })
        this.$set(this.contractList, 'complete', { total: totalComplete })
        this.$set(this.contractList, 'qty_tot', list.header[0].service_qty)

        // console.log('contract', this.contractList)
      },
      async loadContractData(data) {
        this.isLoaded = false
        let act = `csm/data/CSM_Contract?pre_event=${this.formData['pre_event'] || ''}&jobcode=${data.jobcode || ''}`
        let rsp = await $xt.getServer(act)
        let list = rsp.data || []

        // console.log('list', list);


        let totalPending = list.header.filter(row => ['W', 'I', 'N'].includes(row.job_status)).reduce((sum, row) => sum + (row.total || 0), 0)

        let totalComplete = list.header.filter(row => row.job_status === 'Y').reduce((sum, row) => sum + (row.total || 0), 0)

        this.contractList = {
          header: list.header,
          detail: list.detail,
          pending: { total: totalPending },
          complete: { total: totalComplete },
          qty_tot: list.qty_tot.service_qty || 0,
          expire_status: list.qty_tot.expire_status || ''
        }

        // console.log('contractList', this.contractList);


        this.isLoaded = true
      }
    },
    computed: {
      ...mapState(['config']),
      isMango() {
        return this.is_mango()
      },
      pickerUndecided() {
        return !this.formData['dpt_no'] && !this.formData['pre_event']
      },
      showProjectPanel() {
        return !this.formData['dpt_no'] && (!!this.formData['pre_event'] || this.pickerTab === 'project')
      },
      showDeptPanel() {
        return !this.formData['pre_event'] && (!!this.formData['dpt_no'] || this.pickerTab === 'department')
      },
      requestPerson() {
        return this.parsePerson(this.formData['request_empno_name'])
      },
      assignPerson() {
        return this.parsePerson(this.formData['assign_empno_name'])
      },
    },
    async mounted() {
      historyPaging = this.$refs.historyPaging
      historyPaging.setCurrentPage(1)
      historyPaging.setItemsPerPage(5)
      await this.loadHistory()

      $('#CustomerHistoryBox').boxWidget()
      $('#DocumentDetailBox').boxWidget()
      $('#AssignmentBox').boxWidget()

      if (!$xt.isEmpty(this.formData['jobcode'])) {
        this.loadContractData({ jobcode: this.formData['jobcode'] })
      }

      // create a stable handler so we pass a function reference
      this.reloadHistoryHandler = () => this.onPageChange(1, 'history')
      this.$eventBus.$on('reload-history', this.reloadHistoryHandler);
      this.$eventBus.$on('load-contract', this.loadContractData);
    },
    beforeDestroy() {
      // remove the same handler reference
      if (this.reloadHistoryHandler) {
        this.$eventBus.$off('reload-history', this.reloadHistoryHandler);
      }
      this.$eventBus.$off('load-contract', this.loadContractData);
    },
  }
</script>
<style scoped>
  /* ─── Section Card (แทน AdminLTE box) ───────────────── */
  .section-card {
      border-radius: 12px;
  }

  .section-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px;
    border-bottom: 1px solid #eef0f3;
  }

  .section-card-info .section-card-header  { background: linear-gradient(135deg, #1a6fa8 0%, #2980b9 100%); }
  .section-card-primary .section-card-header { background: linear-gradient(135deg, #1a5276 0%, #2471a3 100%); }

  .section-card-header .box-tools {
    margin-left: auto;
  }
  .section-card-header .btn-box-tool {
    color: rgba(255,255,255,0.85);
  }
  .section-card-header .btn-box-tool:hover {
    color: #fff;
    background: rgba(255,255,255,0.15);
    border-radius: 6px;
  }

  .section-card-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 13px;
    flex-shrink: 0;
  }

  .section-card-title {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.02em;
  }

  .section-card-body {
    padding: 16px 18px;
  }

  /* ─── Field labels ───────────────────────────────────── */
  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 4px;
    display: block;
  }

  .field-label-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .field-label-row .field-label {
    margin-bottom: 0;
  }

  .field-required::after {
    content: ' *';
    color: #e53e3e;
  }

  .field-readonly {
    background-color: #f7f8fa !important;
    color: #6b7280 !important;
  }

  .char-count {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 400;
  }

  /* ─── Search / Clear buttons (assignment cards) ──────── */
  .btn-search {
    background: #2471a3;
    color: #fff;
    border-color: #2471a3;
    transition: background 0.15s;
  }
  .btn-search:hover:not(:disabled) { background: #1a5276; border-color: #1a5276; color: #fff; }
  .btn-search:disabled { opacity: 0.5; }

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

  /* ─── Project / Department picker ────────────────────── */
  .picker-tabs {
    display: inline-flex;
    background: #f4f6fa;
    border: 1px solid #e2e6ec;
    border-radius: 8px;
    padding: 3px;
    gap: 2px;
  }
  .picker-tab {
    border: none;
    background: transparent;
    font-size: 12.5px;
    font-weight: 600;
    color: #5c6b7d;
    padding: 6px 16px;
    border-radius: 6px;
    cursor: pointer;
  }
  .picker-tab.active {
    background: #fff;
    color: #2471a3;
    box-shadow: 0 1px 2px rgba(0,0,0,.08);
  }

  /* ─── Switch toggle (replaces plain checkbox) ────────── */
  .switch-toggle {
    position: relative;
    display: inline-flex;
    width: 34px;
    height: 20px;
    flex-shrink: 0;
    margin: 0;
    cursor: pointer;
  }
  .switch-toggle input {
    position: absolute;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }
  .switch-track {
    position: absolute;
    inset: 0;
    background: #cbd3dd;
    border-radius: 999px;
    transition: background 0.2s;
  }
  .switch-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,.25);
    transition: transform 0.2s;
  }
  .switch-toggle input:checked + .switch-track {
    background: #2471a3;
  }
  .switch-toggle input:checked + .switch-track .switch-knob {
    transform: translateX(14px);
  }

  /* ─── Textarea label action buttons ─────────────────── */
  .field-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 5px;
    background: #eef2f7;
    color: #2471a3;
    margin-left: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.15s;
    vertical-align: middle;
  }
  .field-action-btn:hover { background: #2471a3; color: #fff; }
  .field-action-clear { color: #e74c3c; }
  .field-action-clear:hover { background: #e74c3c; color: #fff; }

  /* ─── Dev link ───────────────────────────────────────── */
  .dev-link {
    font-size: 11px;
    color: #2471a3;
    text-decoration: none;
  }
  .dev-link:hover { text-decoration: underline; }

  /* ─── Customer self-report toggle ────────────────────── */
  .cust-self-report-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 8px;
    margin: 6px 0 10px;
    width: fit-content;
  }

  .cust-self-report-label {
    font-size: 13px;
    font-weight: 500;
    color: #92400e;
    margin: 0;
    cursor: pointer;
  }

  /* ─── Customer contact panel ─────────────────────────── */
  .cust-contact-panel {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 8px;
  }

  .cust-contact-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .cust-contact-item {
    flex: 1;
    min-width: 160px;
  }

  /* ─── Assignment sections (card grid) ───────────────── */
  .assign-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
    gap: 12px;
  }

  .assign-card {
    position: relative;
    min-width: 0;
    border-radius: 12px;
    border: 1px solid #e4e7ec;
    background:
      linear-gradient(100deg, var(--role-soft) 0%, rgba(255,255,255,0) 52%),
      #fff;
    padding: 14px 16px 12px 20px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(16,24,40,.05);
    transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
    animation: assignCardIn .38s cubic-bezier(.22,.68,.36,1) backwards;
  }

  .assign-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, var(--role) 0%, var(--role-deep) 100%);
    transition: width .18s ease;
  }

  .assign-card:hover {
    border-color: var(--role-ring);
    box-shadow: 0 6px 18px rgba(16,24,40,.09);
    transform: translateY(-1px);
  }
  .assign-card:hover::before { width: 5px; }

  .assign-card-req {
    --role: #2b6cb0;
    --role-deep: #1e4e8c;
    --role-soft: rgba(43,108,176,.12);
    --role-ring: #b9d1ec;
    animation-delay: .02s;
  }

  .assign-card-assign {
    --role: #12866b;
    --role-deep: #0b6a54;
    --role-soft: rgba(18,134,107,.12);
    --role-ring: #a8dbca;
    animation-delay: .09s;
  }

  @keyframes assignCardIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: none; }
  }

  .assign-card-top {
    display: flex;
    align-items: flex-start;
    gap: 11px;
  }

  .assign-monogram {
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    background: linear-gradient(145deg, var(--role) 0%, var(--role-deep) 100%);
    box-shadow: 0 2px 7px var(--role-soft), inset 0 1px 0 rgba(255,255,255,.22);
  }

  .assign-card.is-empty .assign-monogram {
    background: #fff;
    border: 1px dashed #cfd6e0;
    box-shadow: none;
    color: #b6bec9;
    font-size: 13px;
  }

  .assign-identity {
    flex: 1;
    min-width: 0;
  }

  .assign-role {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 5px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    color: var(--role);
  }
  .assign-role i { font-size: 10px; opacity: .75; }

  .assign-name-line {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 7px;
  }

  .assign-name {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
    color: #16202c;
    word-break: break-word;
  }

  .assign-card.is-empty .assign-name {
    font-weight: 500;
    font-style: italic;
    color: #98a2b3;
  }

  .assign-nick {
    padding: 1px 8px;
    border-radius: 999px;
    border: 1px solid #e6eaf0;
    background: #f1f4f8;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.55;
    color: #5b6675;
    white-space: nowrap;
  }

  .assign-search-btn {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid #e2e7ee;
    background: #f7f9fc;
    color: #64748b;
    font-size: 11px;
    opacity: .7;
    transition: all .16s ease;
  }
  .assign-card:hover .assign-search-btn { opacity: 1; }
  .assign-search-btn:hover:not(:disabled),
  .assign-search-btn:focus:not(:disabled) {
    background: var(--role);
    border-color: var(--role);
    color: #fff;
    box-shadow: 0 2px 8px var(--role-soft);
  }
  .assign-search-btn:disabled {
    opacity: .3;
    cursor: not-allowed;
  }

  .assign-ledger {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px 14px;
    margin-top: 12px;
    padding-top: 11px;
    border-top: 1px solid #eef1f5;
  }

  .ledger-cell {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .ledger-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.4;
    color: #98a2b3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ledger-label i {
    width: 11px;
    flex-shrink: 0;
    text-align: center;
    font-size: 10px;
    color: #b6bec9;
  }

  .ledger-value {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.35;
    color: #1f2a37;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  a.ledger-value:hover,
  a.ledger-value:focus {
    color: var(--role);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .ledger-value.is-num {
    font-variant-numeric: tabular-nums;
    letter-spacing: .01em;
  }
  .ledger-value.is-blank {
    font-weight: 400;
    color: #cbd2dc;
  }

  @media (max-width: 480px) {
    .assign-ledger { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .assign-card,
    .assign-card::before,
    .assign-search-btn { animation: none; transition: none; }
    .assign-card:hover { transform: none; }
  }

  body.dark-mode .assign-card-req {
    --role: #5b9bd5;
    --role-deep: #2b6cb0;
    --role-soft: rgba(91,155,213,.14);
    --role-ring: #3f6b96;
  }
  body.dark-mode .assign-card-assign {
    --role: #34b894;
    --role-deep: #12866b;
    --role-soft: rgba(52,184,148,.14);
    --role-ring: #2b7a63;
  }
  body.dark-mode .assign-card {
    border-color: #33455c;
    background:
      linear-gradient(100deg, var(--role-soft) 0%, rgba(0,0,0,0) 52%),
      #243447;
    box-shadow: 0 1px 2px rgba(0,0,0,.3);
  }
  body.dark-mode .assign-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,.38); }
  body.dark-mode .assign-card.is-empty .assign-monogram {
    background: transparent;
    border-color: #44586f;
    color: #7c8899;
  }
  body.dark-mode .assign-name { color: #e6edf5; }
  body.dark-mode .assign-card.is-empty .assign-name { color: #7c8899; }
  body.dark-mode .assign-nick {
    border-color: #3b5069;
    background: #2c3e54;
    color: #b3c0d1;
  }
  body.dark-mode .assign-search-btn {
    border-color: #3b5069;
    background: #2a3b4f;
    color: #9fb0c4;
  }
  body.dark-mode .assign-ledger { border-top-color: #33455c; }
  body.dark-mode .ledger-label { color: #7c8899; }
  body.dark-mode .ledger-label i { color: #66748a; }
  body.dark-mode .ledger-value { color: #d7e0ea; }
  body.dark-mode .ledger-value.is-blank { color: #5a6779; }

  /* ─── Gemini-style Card (history) ───────────────────── */
  .gemini-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e8eaed;
    box-shadow: 0 1px 3px rgba(60,64,67,.08), 0 4px 12px rgba(60,64,67,.06);
    overflow: hidden;
    margin-bottom: 16px;
  }

  .gemini-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid #f1f3f4;
    background: #fafafa;
  }

  .gemini-card-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: linear-gradient(135deg, #4285f4, #34a853);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 13px;
    flex-shrink: 0;
  }

  .gemini-card-title {
    font-size: 13px;
    font-weight: 600;
    color: #202124;
  }

  .gemini-card-header .box-tools {
    margin-left: auto;
  }

  .gemini-card-body { padding: 12px 16px; }

  .gemini-stat-row {
    display: flex;
    margin-bottom: 10px;
  }

  .gemini-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 14px;
  }
  .gemini-stat:first-child { padding-left: 0; }
  .gemini-stat:not(:first-child) { border-left: 1px solid #eef0f3; }

  .gemini-stat-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #9aa5b1;
  }
  .gemini-stat-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    background: #c7ccd3;
  }
  .gemini-stat-value {
    font-size: 19px;
    font-weight: 700;
    color: #202124;
  }

  .gemini-stat--request .gemini-stat-dot { background: #4f83c4; }
  .gemini-stat--request .gemini-stat-value { color: #35618f; }

  .gemini-stat--warn .gemini-stat-label { color: #b7791f; }
  .gemini-stat--warn .gemini-stat-dot { background: #d99a2b; }
  .gemini-stat--warn .gemini-stat-value { color: #b7791f; }

  .gemini-stat--allitems .gemini-stat-dot { background: #2f9e83; }
  .gemini-stat--allitems .gemini-stat-value { color: #227a67; }

  .gemini-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 11px;
    color: #5f6368;
    background: #f8f9fa;
    padding: 6px 10px;
    border-radius: 6px;
    margin-bottom: 10px;
  }

  .gemini-remark { display: inline-flex; align-items: center; gap: 5px; }

  .gemini-legend {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .gemini-legend span { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }

  .status-cell { display: flex; align-items: center; gap: 8px; }
  .status-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
    background: #9aa1ab;
    box-shadow: 0 0 0 2px currentColor;
    color: rgba(154,161,171,0.18);
  }
  .status-dot.dot-W { background: #d99a2b; color: rgba(217,154,42,0.22); }
  .status-dot.dot-I { background: #2f7fe0; color: rgba(47,127,224,0.22); }
  .status-dot.dot-Y { background: #189358; color: rgba(24,147,88,0.22); }

  .gemini-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 10px;
    flex-wrap: wrap;
  }
  .gemini-count-label { font-size: 11px; color: #9aa5b1; }
  .gemini-count-label b { color: #5f6368; }

  .history-ag-table-wrap {
    margin-bottom: 4px;
  }
  .history-ag-table-wrap /deep/ .content-body {
    height: 260px !important;
    max-height: 260px !important;
    overflow: auto !important;
  }
  .history-ag-table-wrap /deep/ .ag-flex {
    height: 100% !important;
  }
  .history-ag-table-wrap /deep/ .ag-theme-alpine {
    height: 100% !important;
  }
  .history-ag-table-wrap /deep/ .ag-body-viewport {
    overflow-y: auto !important;
  }

  /* ─── Misc ───────────────────────────────────────────── */
  .info-box { min-height: 64px; }

     .content-body{overflow-y: hidden !important;}
</style>
