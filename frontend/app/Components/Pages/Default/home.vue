<template>
  <div class="home-page">
    <re-page ref="page">
      <template #body>
        <div class="row">
          <div class="col-lg-3 col-md-12 col-sm-12 hidden-sm hidden-xs">
            <!-- Panel : Search Customer Panel -->
            <div class="row">
              <div class="col-md-12">
                <div class="box box-solid" ref="scBox">
                  <div class="box-header with-border" ref="scHeader">
                    <h3 class="box-title"><i class="fa fa-search"></i> {{ ui.csm_home_search_customer }}</h3>
                  </div>
                  <div class="box-body hidden-sm hidden-xs" ref="scBody">
                    <vue-element-loading :active="customerLoading" spinner="spinner" color="#02234e" :text="ui.csm_home_searching" />
                    <!-- Search box -->
                    <div ref="scAboveList">
                      <div class="row">
                        <div class="col-md-12">
                          <div class="form-group">
                            <div class="input-group">
                              <input type="text" class="form-control input-sm" v-model.trim="customerSearch" v-bind:placeholder="ui.csm_search_key || 'Keyword : ชื่อ เบอร์โทรศัพท์ อีเมล'" @keyup.enter="searchCustomer()" />
                              <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click="searchCustomer()"><i class="fa fa-search"></i></button></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- Customer Total -->
                      <div class="row">
                        <div class="col-md-12">
                          <b class="pull-right">{{ui.csm_searsh_results||'ผลลัพธ์ของการค้นหามีทั้งหมด'}} {{customerTotal || 0}} {{ui.re_items||'รายการ'}}</b>
                        </div>
                      </div>
                    </div>
                    <!-- List Data Customer -->
                    <ul class="nav nav-pills nav-stacked" :style="{maxHeight: searchCustomerListMaxHeight + 'px', overflowY: 'auto'}">
                      <li v-for="(x,idx) in customerlist">
                        <a href="#" @click.prevent="openCSMbyCustomer(x)">
                          <i class="ion ion-person"></i>
                          <div class="ns-body">
                            <div style="font-weight:600;color:#1e293b;font-size:12.5px;">{{x.name_th}}</div>
                            <div style="font-size:11px;color:#64748b;margin-top:2px;">
                              <i class="ion ion-android-phone-portrait"></i> {{xt.isEmpty(x.tel) ? '-' : x.tel}} &nbsp;
                              <i class="ion ion-email"></i> {{xt.isEmpty(x.mail) ? '-' : x.mail}}
                            </div>
                            <div style="font-size:11px;color:#64748b;">โครงการ : {{x.project}}</div>
                          </div>
                     
                          <span class="pull-right">{{ x.customer_type == 'CM_CUSTOMER' ? (ui.erp_new_cust || 'ลูกค้าใหม่') : (ui.fin_cust_name || 'ลูกหนี้') }}</span>
                        </a>
                      </li>
                    </ul>
                    <!-- Pagination , Button Add Customer -->
                    <div style="margin-top: 10px" v-show="!is_mango()" ref="scBelowList">
                      <pagination class="pull-left" ref="customerPaging" @page-change="pageChange($event.page, 'customer')"></pagination>
                      <span class="pull-right"><button class="btn btn-sm bg-olive" @click="mainOpenCustomer()"><i class="fa fa-edit"></i> {{ui.re_add_customers || 'เพิ่มข้อมูลลูกค้า'}}</button></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Panel : CSM Due Date Panel -->
            <div class="row">
              <div class="col-md-12">
                <div class="box box-solid" id="DueDateBox" ref="ddBox">
                  <div class="box-header with-border" ref="ddHeader">
                    <h3 class="box-title"><i class="fa fa-clock-o"></i> {{ ui.csm_home_overdue_3days }}</h3>
                    <div class="box-tools pull-right">
                      <button type="button" class="btn btn-box-tool" data-widget="collapse">
                        <i class="fas fa-minus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="box-body no-padding" ref="dueDateBody" :style="{maxHeight: dueDateMaxHeight + 'px', overflowY: 'auto'}">
                    <vue-element-loading :active="duedateLoading" spinner="spinner" color="#02234e" :text="ui.csm_home_searching" />
                    <ul class="nav nav-pills nav-stacked">
                      <li v-for="x,idx in csmDueDate">
                        <a :href="openReq(x)" target="_blank">
                          <i class="fa fa-folder-open"></i>
                          <div class="ns-body">
                            <div style="font-weight:700;color:#1e293b;font-size:12.5px;">{{x.job_no}}</div>
                            <div style="font-size:11px;color:#64748b;margin-top:2px;">ผู้ปฏิบัติงาน : {{x.worker_name}}</div>
                          </div>
                          <span class="pull-right">{{ui.csm_v2_date || 'วันที่'}} : {{$date(x.due_date)}}</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-9 col-md-12 col-sm-12">
            <!-- Platform : PC, Notebook -->
            <div class="row">
              <div class="col-md-12">
                <div class="nav-tabs-custom">
                  <ul class="nav nav-tabs hidden-sm hidden-xs">
                    <li :class="{active:tabSelected===0}"><a class="text-green" href="#" @click.prevent="onTabChange(0)">{{ ui.csm_home_request_doc }} <span class="badge bg-green" v-text="total.total_request || 0"></span></a></li>
                    <li :class="{active:tabSelected===1}"><a class="text-aqua" href="#" @click.prevent="onTabChange(1)">{{ ui.csm_home_responsible_doc }} <span class="badge bg-aqua" v-text="total.total_responsible || 0"></span></a></li>
                    <li :class="{active:tabSelected===2}"><a class="text-orange" href="#" @click.prevent="onTabChange(2)">{{ ui.csm_home_assign_doc }} <span class="badge bg-orange" v-text="total.total_tasks || 0"></span></a></li>
                    <li :class="{active:tabSelected===4}"><a class="text-purple" href="#" @click.prevent="onTabChange(4)">{{ ui.csm_home_pending_doc_checking }} <span class="badge bg-purple" v-text="total.total_checking_web + total.total_tester_bug || 0"></span></a></li>
                    <li :class="{active:tabSelected===3}" v-if="isShowAllDoc()"><a class="text-teal" href="#" @click.prevent="onTabChange(3)">{{ui.erp_all_document}}<span class="badge bg-teal" v-text="total.total_items || 0"></span></a></li>
                  </ul>
                  <div class="tab-content">
                    <div class="tab-pane active tab-pane-scroll">
                      <vue-element-loading :active="isLoading" spinner="spinner" color="#02234e" text="ระบบกำลังค้นหาข้อมูล CSM ของท่าน กรุณารอสักครู่..." />
                      <!-- Panel : Search -->
                      <div class="home-filter-card">
                        <div class="row home-filter">
                          <div class="col-md-12 hidden-md hidden-lg">
                            <div class="form-group">
                              <label class="text-danger">{{ui.erp_doc||'เอกสาร'}}</label>
                              <select class="form-control input-sm" v-model.number="tabSelected" @change="onTabChange(tabSelected)">
                                <option value="0">{{ ui.csm_home_request_doc }}</option>
                                <option value="1">{{ ui.csm_home_responsible_doc }}</option>
                                <option value="2">{{ ui.csm_home_assign_doc }}</option>
                                <option value="4">{{ ui.csm_home_pending_doc }}</option>
                                <option value="3" v-if="isShowAllDoc()">{{ui.erp_all_document}} </option>
                              </select>
                            </div>
                          </div>
                          <div class="col-md-12 hidden-md hidden-lg" v-show="[0].includes(tabSelected) || [1,2,4].includes(tabSelected) && is_mango()">
                            <div class="form-group">
                              <label class="text-danger">Type</label>
                              <select class="form-control input-sm" v-model.number="subTabSelected" @change="onSubTabChange(subTabSelected)">
                                <option v-for="x in subtab" :value="x.value" v-show="x.show">{{x.name}}</option>
                              </select>
                            </div>
                          </div>
                          <div class="col-lg-2 col-md-3">
                            <div class="form-group">
                              <label>Search By</label>
                              <select class="form-control input-sm" v-model="retrieveSearch.field">
                                <option v-for="x in fields" :value="x.key">{{ x.name }}</option>
                              </select>
                            </div>
                          </div>
                          <div class="col-lg-2 col-md-3">
                            <div class="form-group">
                              <label>{{ ui.csm_home_job_status }}</label>
                              <select class="form-control input-sm" v-model="retrieveSearch.job_status" @change="retrieveSort()">
                                <option v-for="x in status" :value="x.value">{{ x.name }}</option>
                              </select>
                            </div>
                          </div>
                          <div v-if="tabSelected == 0" class="col-lg-2 col-md-3">
                            <div class="form-group">
                              <label>Type CSM</label>
                              <vue-select-2 :options="filterService()"
                                            :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                                            v-model="retrieveSearch.serv_code"
                                            @change="retrieveSort()">
                              </vue-select-2>
                            </div>
                          </div>
                          <div class="col-lg-4 col-md-3">
                            <div class="form-group">
                              <label>Search</label>
                              <div class="input-group">
                                <input type="text" class="form-control input-sm" v-model="retrieveSearch.text" @keyup.enter="searchData()" />
                                <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click="searchData()"><i class="fa fa-search"></i></button></span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- Panel : Add condition -->
                        <div class="row margin-b-5">
                          <div class="col-md-12">
                            <div class="home-cond-bar">
                              <button type="button" class="home-cond-btn" @click="addCond()" :disabled="!retrieveSearch.text">
                                <i class="fas fa-plus"></i> <span>{{ui.re_add_condition || 'Add condition'}}</span>
                              </button>
                              <button type="button" class="home-cond-toggle" @click="showConditions = !showConditions" v-if="conditions.length > 0">
                                <i class="fas" :class="showConditions ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                              </button>
                              <span class="home-cond-count" v-if="conditions.length > 0">{{conditions.length}}</span>
                            </div>
                          </div>
                        </div>
                        <!-- Panel : Additional conditions -->
                        <div class="row" v-if="showConditions && conditions.length > 0">
                          <div class="col-md-12">
                            <div class="home-cond-panel">
                              <div class="home-cond-row" v-for="(cond, idx) in conditions" :key="idx">
                                <span class="home-cond-join" :class="{'is-or': condJoin(idx) === 'OR'}">{{ condJoin(idx) }}</span>
                                <div class="home-cond-field">
                                  <select class="form-control input-sm" v-model="cond.field">
                                    <option v-for="x in fields" :key="x.key" :value="x.key">{{ x.name }}</option>
                                  </select>
                                </div>
                                <div class="home-cond-value">
                                  <input type="text" class="form-control input-sm" v-model.trim="cond.text" :placeholder="ui.search || 'Search'" @keyup.enter="searchData()" />
                                </div>
                                <button type="button" class="home-cond-remove" @click="removeAddCond(idx)"><i class="fas fa-times"></i></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- Panel : Detail Data -->
                      <div class="row hidden-sm hidden-xs">
                        <div class="col-md-12">
                          <div class="nav-tabs-custom" v-show="tabSelected===0">
                            <ul class="nav nav-tabs">
                              <li :class="{active:subTabSelected===0}"><a href="#" @click.prevent="onSubTabChange(0)" class="text-info">{{ ui.csm_home_active_doc }}</a></li>
                              <li :class="{active:subTabSelected===1}"><a href="#" @click.prevent="onSubTabChange(1)" class="text-warning">{{ ui.csm_home_draft_doc }} <span class="badge bg-yellow">{{total.total_hold || 0}}</span></a></li>
                              <li class="pull-right">
                                <div class="home-action-bar">
                                  <button type="button" class="home-action-btn is-ai" v-if="subTabSelected===1 && is_mango()" @click.prevent="setModalAiGenDraft()"><i class="fas fa-robot"></i> <span>AI Gen Draft</span></button>
                                  <button type="button" class="home-action-btn is-copy" @click.prevent="setModalCopy()"><i class="fas fa-copy"></i> <span>{{ ui.csm_home_copy_csm }}</span></button>
                                  <button type="button" class="home-action-btn is-new" @click.prevent="onCreateDocument()"><i class="fas fa-edit"></i> <span>{{ui.new || 'New Document'}}</span></button>
                                </div>
                              </li>
                            </ul>
                          </div>
                          <div class="nav-tabs-custom" v-show="[1].includes(tabSelected) && is_mango()">
                            <ul class="nav nav-tabs">
                              <li :class="{active:subTabSelected===5}"><a href="#" @click.prevent="onSubTabChange(5)">{{ui.erp_all_document||'ALL Document'}} <span class="badge bg-gray">{{total.total_responsible || 0}}</span></a></li>
                              <li :class="{active:subTabSelected===6}"><a href="#" @click.prevent="onSubTabChange(6)" class="text-danger">{{ ui.csm_home_bug_software }} <span class="badge bg-red">{{totalSub.bug_total || 0}}</span></a></li>
                              <li :class="{active:subTabSelected===7}"><a href="#" @click.prevent="onSubTabChange(7)" class="text-info">{{ui.erp_request||'Request'}} <span class="badge bg-aqua">{{totalSub.request_total || 0}}</span></a></li>
                              <li :class="{active:subTabSelected===9}"><a href="#" @click.prevent="onSubTabChange(9)" class="text-info">{{ui.erp_contract||'Contract'}} <span class="badge bg-light-blue">{{totalSub.contract_total || 0}}</span></a></li>
                              <li :class="{active:subTabSelected===8}"><a href="#" @click.prevent="onSubTabChange(8)">{{ui.erp_other ||'Other'}} <span class="badge bg-gray">{{totalSub.other_total || 0}}</span></a></li>
                            </ul>
                          </div>
                          <div class="nav-tabs-custom" v-show="[2].includes(tabSelected) && is_mango()">
                            <ul class="nav nav-tabs">
                              <li :class="{active:subTabSelected===5}"><a href="#" @click.prevent="onSubTabChange(5)">{{ui.erp_all_document||'ALL Document'}}<span class="badge bg-gray">{{total.total_tasks || 0}}</span></a></li>
                              <li :class="{active:subTabSelected===6}"><a href="#" @click.prevent="onSubTabChange(6)" class="text-danger">{{ ui.csm_home_bug_software }} <span class="badge bg-red">{{totalSub.bug_total || 0}}</span></a></li>
                              <li :class="{active:subTabSelected===7}"><a href="#" @click.prevent="onSubTabChange(7)" class="text-info">{{ui.erp_request||'Request'}}  <span class="badge bg-aqua">{{totalSub.request_total || 0}}</span></a></li>
                              <li :class="{active:subTabSelected===9}"><a href="#" @click.prevent="onSubTabChange(9)" class="text-info">{{ui.erp_contract||'Contract'}} <span class="badge bg-light-blue">{{totalSub.contract_total || 0}}</span></a></li>
                              <li :class="{active:subTabSelected===8}"><a href="#" @click.prevent="onSubTabChange(8)">{{ui.erp_other ||'Other'}} <span class="badge bg-gray">{{totalSub.other_total || 0}}</span></a></li>
                            </ul>
                          </div>
                          <div class="nav-tabs-custom" v-show="tabSelected===4 && is_mango()">
                            <ul class="nav nav-tabs">
                              <li :class="{active:subTabSelected===3}"><a href="#" @click.prevent="onSubTabChange(3)">{{ ui.csm_home_wait_test_doc }} <span class="badge bg-purple">{{total.total_checking_web || 0}}</span></a></li>
                              <li :class="{active:subTabSelected===5}"><a href="#" @click.prevent="onSubTabChange(5)">{{ ui.csm_home_wait_check_assigned_doc }} <span class="badge bg-orange">{{total.total_tester_assign || 0}}</span></a></li>
                              <li :class="{active:subTabSelected===4}"><a href="#" @click.prevent="onSubTabChange(4)">{{ ui.csm_home_wait_check_doc }} <span class="badge bg-red">{{total.total_tester_bug || 0}}</span></a></li>
                            </ul>
                          </div>
                        </div>
                        <div class="col-md-12">
                          <div class="home-view-toolbar">
                            <div class="home-view-toggle">
                              <button type="button" class="home-view-btn" :class="{'home-view-btn--active': viewMode === 'table'}" @click="viewMode = 'table'" title="Table View">
                                <i class="fas fa-th-list"></i> <span>{{ui.erp_table ||'Table'}}</span>
                              </button>
                              <button type="button" class="home-view-btn" :class="{'home-view-btn--active': viewMode === 'card'}" @click="viewMode = 'card'" title="Card View">
                                <i class="fas fa-th-large"></i> <span>Card</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-12 home-grid ag-grid-bordered" v-show="viewMode === 'table'">
                          <ag-table ref="agr"
                                    :scale="420"
                                    :footer="false"
                                    @ready="initTable()"
                                    :saveColumns="'Y'"
                                    :doctype="'RTCSM'"
                                    :page_name="'home'"></ag-table>

                        </div>
                        <div class="col-md-12" v-show="viewMode === 'card'">
                          <div class="home-doc-card-grid">
                            <a v-for="(x,idx) in datalist" :key="idx"
                               v-bind:href="openReq(x)" target="_blank"
                               class="csm-doc-card"
                               :class="x.job_status === 'W' ? 'csm-doc-card--unstarted' : (x.task_queued_count > 0 && is_mango() ? 'csm-doc-card--urgent' : '')">
                              <!-- Top: Icon + Info + Badge -->
                              <div class="csm-doc-top">
                                <div class="csm-doc-icon-box">
                                  <i class="fa fa-file-text-o"></i>
                                </div>
                                <div class="csm-doc-info">
                                  <div class="csm-doc-no">{{x.job_no}}</div>
                                  <div class="csm-doc-sub" v-if="x.task_count > 0"> {{x.task_qty || 0}} {{ui.erp_job}}</div>
                                  <div class="csm-doc-sub" v-else style="color:#94a3b8;">{{ ui.csm_home_no_task_yet }}</div>
                                </div>
                                <div class="csm-doc-badge-wrap">
                                  <span class="csm-pill csm-pill-danger" v-show="x.task_count == 0 && x.job_status != 'D'">{{ ui.csm_home_no_tasks }}</span>
                                  <span class="csm-pill csm-pill-muted" v-show="x.job_status == 'D'">{{ui.erp_draft}}</span>
                                  <span class="csm-pill csm-pill-success" v-show="is_complete(x) && x.task_count > 0 && x.job_status != 'D'">{{ ui.csm_home_done }}</span>
                                  <span class="csm-pill csm-pill-purple" v-show="x.task_count > 0 && x.task_send_qc > 0 && x.task_waiting_update == 0">{{ ui.csm_home_checking }}</span>
                                  <span class="csm-pill csm-pill-info" v-show="x.task_count > 0 && (x.task_tester_approve > 0 && x.task_tester_reject == 0)">{{ ui.csm_home_wait_tester }}</span>
                                  <span class="csm-pill csm-pill-info" v-show="x.task_count > 0 && x.task_waiting_approve > 0">{{ ui.csm_home_wait_approve }}</span>
                                  <span class="csm-pill csm-pill-info" v-show="x.task_count > 0 && x.task_waiting_update > 0">{{ ui.csm_home_update_program }}</span>
                                  <span class="csm-pill csm-pill-danger" v-show="x.task_count > 0 && x.task_tester_reject > 0">{{ ui.csm_home_reject_tester }}</span>
                                  <span class="csm-pill csm-pill-purple" v-show="x.task_count > 0 && x.task_waiting_test > 0">{{ ui.csm_home_testing }}</span>
                                  <span class="csm-pill" :class="'csm-pill-' + (statusClass('', x.job_status) || 'muted')" v-show="!is_complete(x) && x.task_count > 0 && x.task_send_qc == 0 && (x.task_tester_approve == 0 && x.task_tester_reject == 0) && x.task_waiting_approve == 0 && x.task_waiting_update == 0 && x.task_waiting_test == 0">{{statusName(x.job_status)}}</span>
                                </div>
                              </div>
                              <!-- Detail -->
                              <div class="csm-doc-detail">
                                <div class="csm-doc-detail-row"><span class="csm-doc-detail-label">{{ui.csm_v2_subject}} :</span> <span class="csm-doc-detail-value">{{truncateText(x.subject, 100)}}</span></div>
                                <div class="csm-doc-detail-row">
                                  <span class="csm-doc-detail-label">{{ui.csm_v2_project}} :</span>
                                  <span v-if="is_mango() && isDeveloper() && !xt.isEmpty(x.project)"
                                        class="csm-doc-detail-value csm-doc-project-link"
                                        style="color:#0069ec !important;"
                                        @click.stop.prevent="openProjectDetail(x)">{{truncateText(x.project, 100)}}</span>
                                  <span v-else class="csm-doc-detail-value" style="color:#0069ec !important;">{{truncateText(projectDisplayText(x), 100)}}</span>
                                </div>
                                <div class="csm-doc-detail-row"><span class="csm-doc-detail-label">{{ ui.csm_home_req_by }} :</span> <span class="csm-doc-detail-value">{{x.request_empno_name}}</span></div>
                              </div>
                              <!-- Footer -->
                              <div class="csm-doc-footer2">
                                <span class="csm-doc-footer-left">{{ui.erp_responsible ||'Resonsible'}} : {{x.assign_empno_name}}</span>
                                <span class="csm-doc-footer-right" :style="{color: priorityStatusClass(x.job_priority_code)}"> {{x.job_priority_text}}</span>
                              </div>
                            </a>
                            <div v-if="!datalist || datalist.length === 0" class="home-card-empty">
                              <i class="fas fa-inbox"></i>
                              <span>{{ui.bk_msg_no_data}}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- Platform : Mobile -->
                      <div class="row hidden-md hidden-lg home-mobile-actions">
                        <div class="col-xs-12">
                          <div class="home-action-bar">
                            <button type="button" class="home-action-btn is-ai" v-if="subTabSelected===1 && is_mango()" @click.prevent="setModalAiGenDraft()"><i class="fas fa-robot"></i> <span>AI Gen Draft</span></button>
                            <button type="button" class="home-action-btn is-copy" @click.prevent="setModalCopy()"><i class="fas fa-copy"></i> <span>{{ ui.csm_home_copy_csm }}</span></button>
                            <button type="button" class="home-action-btn is-new" @click.prevent="onCreateDocument()"><i class="fas fa-edit"></i> <span>{{ui.new || 'New Document'}}</span></button>
                          </div>
                        </div>
                      </div>
                    <div class="row hidden-md hidden-lg home-mobile-row">
                      <div class="col-xs-12 home-mobile-list">
                        <a v-for="(x,idx) in datalist" :key="idx"
                           v-bind:href="openReq(x)" target="_blank"
                           class="csm-doc-card"
                           :class="x.job_status === 'W' ? 'csm-doc-card--unstarted' : (x.task_queued_count > 0 && is_mango() ? 'csm-doc-card--urgent' : '')">
                            <!-- Top: Icon + Info + Badge -->
                            <div class="csm-doc-top">
                              <div class="csm-doc-icon-box">
                                <i class="fa fa-file-text-o"></i>
                              </div>
                              <div class="csm-doc-info">
                                <div class="csm-doc-no">{{x.job_no}}</div>
                             <div class="csm-doc-sub csm-doc-sub-clamp" style="font-weight: 500; font-size: small;">{{x.subject}}</div>
                                 <div class="csm-doc-sub" >  {{ui.csm_home_req_by|| 'Req. By'}} :{{x.request_empno_name}}  </div>
                                <div class="csm-doc-sub" v-if="x.task_count > 0">อนุมัติ {{x.task_qty || 0}}</div>
                                <div class="csm-doc-sub" v-else style="color:#94a3b8;">{{ ui.csm_home_no_task_yet }}</div>
                                <div class="csm-doc-sub" v-if="x.job_priority_text">
                                  <span class="home-cell-priority" :style="x.job_priority_code ? 'display:inline-flex; align-items:center; gap:4px;' : ''">
                                    <span v-if="x.job_priority_code" class="home-cell-priority-dot" :style="{ background: priorityStatusClass(x.job_priority_code), width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' }"></span>
                                    {{ x.job_priority_text }}
                                  </span>
                                </div>
                              </div>
                              <div class="csm-doc-badge-wrap">
                                <span class="csm-pill csm-pill-danger" v-show="x.task_count == 0 && x.job_status != 'D'">{{ ui.csm_home_no_tasks }}</span>
                                <span class="csm-pill csm-pill-muted" v-show="x.job_status == 'D'">Draft</span>
                                <span class="csm-pill csm-pill-success" v-show="is_complete(x) && x.task_count > 0 && x.job_status != 'D'">{{ ui.csm_home_done }}</span>
                                <span class="csm-pill csm-pill-purple" v-show="x.task_count > 0 && x.task_send_qc > 0 && x.task_waiting_update == 0">{{ ui.csm_home_checking }}</span>
                                <span class="csm-pill csm-pill-info" v-show="x.task_count > 0 && (x.task_tester_approve > 0 && x.task_tester_reject == 0)">{{ ui.csm_home_wait_tester }}</span>
                                <span class="csm-pill csm-pill-info" v-show="x.task_count > 0 && x.task_waiting_approve > 0">{{ ui.csm_home_wait_approve }}</span>
                                <span class="csm-pill csm-pill-info" v-show="x.task_count > 0 && x.task_waiting_update > 0">{{ ui.csm_home_update_program }}</span>
                                <span class="csm-pill csm-pill-danger" v-show="x.task_count > 0 && x.task_tester_reject > 0">{{ ui.csm_home_reject_tester }}</span>
                                <span class="csm-pill csm-pill-purple" v-show="x.task_count > 0 && x.task_waiting_test > 0">{{ ui.csm_home_testing }}</span>
                                <span class="csm-pill" :class="'csm-pill-' + (statusClass('', x.job_status) || 'muted')" v-show="!is_complete(x) && x.task_count > 0 && x.task_send_qc == 0 && (x.task_tester_approve == 0 && x.task_tester_reject == 0) && x.task_waiting_approve == 0 && x.task_waiting_update == 0 && x.task_waiting_test == 0">{{statusName(x.job_status)}}</span>
                              </div>
                            </div>
                            <!-- Progress Bar -->
                            <div class="csm-progress-wrap" v-if="x.task_count > 0">
                              <div class="csm-progress-track">
                                <div class="csm-progress-fill" :style="{width: Math.round(((x.task_qty || 0) / x.task_count) * 100) + '%'}"></div>
                              </div>
                              <div class="csm-progress-marks">
                                <span>0</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                              </div>
                            </div>
                            <!-- Footer -->
                            <div class="csm-doc-footer" v-if="x.task_count > 0">
                              <span class="csm-task-dot"></span>
                              <span class="csm-task-info">({{x.task_count - (x.task_qty || 0)}}/{{x.task_count}}) งาน</span>
                              <span class="csm-task-pct">{{Math.round(((x.task_qty || 0) / x.task_count) * 100)}}%</span>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div class="row text-center hidden-lg hidden-md home-loadmore">
                        <button class="btn btn-sm bg-navy" @click.prevent="loadData('take')"><i class="fas fa-refresh"></i> Load More</button>
                      </div>
                      <!-- End Platform : Mobile -->
                      <!-- Pagination -->
                      <div class="row home-paging">
                        <div class="col-md-12 margin-t-10">
                          <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page, 'main')"></pagination>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>

    <modal-2 ref="modalCopy" sheet-class="ct-sheet">
      <template #header>
        <h4>CSM Data List</h4>
      </template>
      <template #body>
        <div class="row d-flex">
          <div class="col-md-4">
            <div class="form-group">
              <label v-text="ui.search_by || 'Search By'"></label>
              <select class="form-control input-sm" v-model="search.field">
                <option value="job_no">{{ui.erp_csm_no ||'CSM No.'}}'</option>
                <option value="subject">{{ui.csm_v2_subject}}</option>
                <option value="pre_des">{{ui.csm_v2_project}}</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <label v-text="ui.search || 'Search'"></label>
              <div class="input-group">
                <input type="text" class="form-control input-sm" v-model="search.text" @keyup.enter="loadDataCopy()" />
                <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click.prevent="loadDataCopy()"><i class="fas fa-search"></i></button></span>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12 col-md-12 col-sm-12">
            <div class="home-view-toolbar">
              <div class="home-view-toggle">
                <button type="button" class="home-view-btn" :class="{'home-view-btn--active': copyViewMode === 'table'}" @click="copyViewMode = 'table'" title="Table View">
                  <i class="fas fa-th-list"></i> <span>{{ui.erp_table}}</span>
                </button>
                <button type="button" class="home-view-btn" :class="{'home-view-btn--active': copyViewMode === 'card'}" @click="copyViewMode = 'card'" title="Card View">
                  <i class="fas fa-th-large"></i> <span>Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="row" v-show="copyViewMode === 'table'">
          <div class="col-lg-12 col-md-12 col-sm-12 home-grid ag-grid-bordered">
            <ag-table ref="agrCopy"
                      :scale="400"
                      :footer="false"
                      @ready="initTableCopy()"
                      checkbox="true"
                      rowSelection="multiple"
                      :saveColumns="'Y'"
                      :doctype="'RTCSM'"
                      :page_name="'home_copy'"
                      @on-selected="selectCopyItem($event)"
                      @cell-clicked="onCellClickedCopy"></ag-table>
          </div>
        </div>
        <div class="row" v-show="copyViewMode === 'card'">
          <div class="col-lg-12 col-md-12 col-sm-12">
            <div class="copy-card-grid">
              <div class="copy-item-card"
                   v-for="x in datalistCopy"
                   :key="x.job_no"
                   :class="{'copy-item-card--selected': isCopySelected(x)}"
                   @click="toggleCopyCard(x)">
                <div class="copy-item-checkbox">
                  <input type="checkbox" :checked="isCopySelected(x)" @click.stop="toggleCopyCard(x)" />
                </div>
                <div class="copy-item-body">
                  <div class="copy-item-top">
                    <span class="copy-item-code">{{x.job_no}}</span>
                    <span class="copy-item-status" v-html="x.job_status_display"></span>
                  </div>
                  <div class="copy-item-subject" :title="x.subject">{{x.subject}}</div>
                  <div class="copy-item-meta" v-if="x.project">
                    <i class="fas fa-building"></i>{{x.project}}
                  </div>
                </div>
              </div>
              <div v-if="!datalistCopy || datalistCopy.length === 0" class="home-card-empty">
                <i class="fas fa-inbox"></i>
                <span>{{ui.bk_msg_no_data ||'ไม่พบข้อมูล'}}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <pagination class="pull-left" ref="copyPaging" @page-change="pageChange($event.page, 'copy')" />
        <button class="btn btn-sm btn-success" @click="saveTemplateCopy()">
          <i class="fas fa-copy"></i><span>{{ui.csm_v2_copy||'Copy'}}</span>
        </button>
      </template>
    </modal-2>

    <ai-gen-draft-modal ref="modalAiGenDraft" @saved="onAiGenDraftSaved()"></ai-gen-draft-modal>

  </div>
</template>

<script type="text/javascript">
  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first
  let page = { loadingBox: { show() {}, hide() {} } }
  let paging = {}
  let customerPaging = {}
  let copyPaging = {}

  let home = {
    data() {
      return {
        auth: window.auth,
        baseUrl,
        baseRoute,
        queryString,
        company: window.baseCompany,
        ui: window.ui,
        newDate: new Date(),
        isLoading: false,
        customerLoading: false,
        duedateLoading: false,
        height: 0,
        dueDateMaxHeight: 200,
        searchCustomerListMaxHeight: 200,
          fields: [
          { key: 'job_no', name: window.ui.erp_csm_no || 'CSM No.', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'subject', name: window.ui.csm_v2_subject || 'Subject', type: 's', search: true, sort: true, sort_default: false, width: 200 },
          { key: 'pre_des', name: window.ui.csm_v2_project || 'Project', type: 's', search: true, sort: true, sort_default: false, width: 200 },
          { key: 'dpt_name', name: window.ui.erp_department || 'Department', type: 's', search: true, sort: true, sort_default: false, width: 200 },
          { key: 'request_empno_name', name: window.ui.csm_home_req_by|| 'Req. By', type: 's', search: true, sort: true, sort_default: false, width: 200 },
          { key: 'contract_user', name: window.ui.erp_contact_by|| 'Contact By', type: 's', search: true, sort: true, sort_default: false, width: 200 },
          { key: 'ref_docno', name: window.ui.erp_ticket_no||'Ticket No.', type: 's', search: true, sort: true, sort_default: false, width: 200 },
        ],
        status: [
          { key: 'job_status', name: 'All Item', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: '' },
          { key: 'job_status', name: window.ui.erp_none||'None', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'W' },
          { key: 'job_status', name: window.ui.csm_v2_status_pending|| 'Pending', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'P' },
          { key: 'job_status', name: window.ui.csm_home_done|| 'Done', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'D' },
          { key: 'job_status', name: window.ui.csm_v2_status_done|| 'Complete', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'C' },
          { key: 'job_status', name: window.ui.cancel|| 'Cancel', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'N' },
          { key: 'job_status', name: window.ui.csm_home_send_back|| 'Send Back', type: 'f', search: true, sort: true, sort_default: true, width: 200, value: 'F' },
        ],
        subtab: [
          { value: 0, name: window.ui.csm_home_active_doc|| 'Active Document', group: 1, show: true },
          { value: 1, name: window.ui.csm_home_draft_doc|| 'Draft Document', group: 1, show: true },
          { value: 5, name: 'ALL Document', group: 4, show: false },
          { value: 6, name: window.ui.csm_home_bug_software|| 'Bug Software', group: 2, show: false },
          { value: 7, name: 'Request', group: 2, show: false },
          { value: 9, name: 'Contract', group: 2, show: false },
          { value: 8, name: 'Other', group: 2, show: false },
          { value: 3, name: window.ui.csm_home_waiting_tester|| 'Waiting Tester', group: 3, show: false },
          { value: 4, name: window.ui.csm_home_waiting_approve|| 'Waiting Approve', group: 3, show: false },
        ],
        retrieveSearch: {},
        conditions: [],
        showConditions: false,
        search: {},
        tabSelected: 0,
        subTabSelected: 0,
        datalist: [],

        customerlist: [],
        csmDueDate: [],
        callCenterStatus: [],
        callHistoryData: [],
        total: {},
        totalSub: {},
        customerSearch: '',
        customerTotal: 0,
        statusCode,
        xt: $xt,
        selected: 0,
        select_sub: 0,
        loadmore: 10,
        selectAllChecked: "N",
        selectedItems: [],
        itemlist: [],
        detailData: [],
        listJobNo: [],
        datalistCopy: [],
        user_config: {},
        Max_: 0,
        viewMode: 'table',
        copyViewMode: 'table',
      }
    },
    methods: {
      pageSize() {
        return window.innerWidth <= 991 ? 20 : 100
      },
      pageChange(pn, pt) {
        switch (pt) {
          case 'main':
            paging.setCurrentPage(pn)
            this.loadData()
            break
          case 'customer':
            customerPaging.setCurrentPage(pn)
            this.searchCustomer()
            break
          case 'copy':
            copyPaging.setCurrentPage(pn)
            this.loadDataCopy()
            break
        }
      },
      async setModalAiGenDraft() {
        await this.$refs.modalAiGenDraft.openModal()
      },
      async onAiGenDraftSaved() {
        paging.setCurrentPage(1)
        await this.loadTotal()
        await this.loadData()
      },
      async setModalCopy() {
        this.search = {
          text: "",
          field: "job_no"
        }
        
        // Clear selection
        this.selectedItems = []
        this.listJobNo = []
        this.detailData = []
        
        await copyPaging.setCurrentPage(1)
        await this.loadDataCopy()

        this.$refs.modalCopy.setSize("modal-xl")
        this.$refs.modalCopy.openModal()
      },
      selectAll() {
        this.selectAllChecked == "Y" ? this.selectedItems = [...this.datalistCopy] : this.selectedItems = []
        this.datalistCopy.forEach(x => x.checked = this.selectAllChecked == "Y" ? "Y" : "N")
      },
      /*  CSM Copy */
      selectItem(item) {
        let findIndex = this.datalistCopy.findIndex(x => x.job_no == item.job_no)

        this.datalistCopy[findIndex].checked = item.checked
        this.selectedItems = this.datalistCopy.filter(x => x.checked == "Y")
        this.selectAllChecked = this.datalistCopy.every(x => x.checked == "Y") ? "Y" : "N"
        this.listJobNo = []
        this.selectedItems.forEach(item => {
          this.listJobNo.push(item.job_no)
        });
        
        if (this.listJobNo.length > 0) {
          this.loadDetail()
        }
      },
      async selectCopyItem(e) {
        let data = e.data;
        
        // ตรวจสอบว่าเป็นการเลือกทั้งหมด (Select All) หรือไม่
        let isHeaderCheckbox = e.isSelectAll || (data.length === this.datalistCopy.length && this.datalistCopy.length > 0);
        
        console.log('selectCopyItem called:', { data, isHeaderCheckbox, selected: e.selected }); // Debug
        
        if (isHeaderCheckbox) {
          if (e.selected) {
            // เลือกทั้งหมด
            this.datalistCopy.forEach(item => {
              let exists = $linq(this.selectedItems).any(a => a.job_no == item.job_no);
              if (!exists) {
                this.selectedItems.push({ ...item });
              }
            });
          } else {
            // ยกเลิกเลือกทั้งหมด
            this.selectedItems = [];
          }
        } else {
          // การเลือกแต่ละรายการ
          if (e.selected) {
            // เพิ่มรายการที่เลือก
            data.forEach(f => {
              let exists = $linq(this.selectedItems).any(a => a.job_no == f.job_no);
              if (!exists) {
                this.selectedItems.push({ ...f });
              }
            });
          } else {
            // ลบรายการที่ยกเลิกการเลือก
            data.forEach(f => {
              this.selectedItems = $linq(this.selectedItems).where(w => w.job_no != f.job_no).toArray() || [];
            });
          }
        }
        
        // ลบ duplicate items
        this.selectedItems = $linq(this.selectedItems).distinctBy(d => d.job_no).toArray();
        
        // อัพเดท listJobNo
        this.listJobNo = this.selectedItems.map(x => x.job_no);
        
        console.log('Updated selectedItems:', this.selectedItems); // Debug
        console.log('Updated listJobNo:', this.listJobNo); // Debug
        
        // Load detail for selected items
        if (this.listJobNo.length > 0) {
          await this.loadDetail();
        }
        
        if (data.length == 0 && !isHeaderCheckbox) {
          this.selectedItems = [];
          this.listJobNo = [];
        }
      },
      onCellClickedCopy(event) {
        console.log('Cell clicked:', event); // Debug
        // สามารถเพิ่ม logic สำหรับการคลิก cell ได้ที่นี่
        // เช่น เปิด modal แสดงรายละเอียด หรือ edit
      },
      isCopySelected(x) {
        return $linq(this.selectedItems).any(a => a.job_no == x.job_no)
      },
      truncateText(text, len) {
        if (!text) return ''
        text = String(text)
        return text.length > len ? text.substring(0, len) + '...' : text
      },
      toggleCopyCard(x) {
        this.selectCopyItem({ data: [x], selected: !this.isCopySelected(x) })
      },
      async saveTemplateCopy() {
        console.log('saveTemplateCopy - selectedItems:', this.selectedItems); // Debug
        console.log('saveTemplateCopy - listJobNo:', this.listJobNo); // Debug
        
        if (this.selectedItems.length === 0) {
          $msg.alert('', 'กรุณาเลือกเอกสารที่ต้องการ Copy อย่างน้อย 1 รายการ', 'warning');
          return;
        }

        if (!await $msg.confirm(`คุณต้องการข้อมูลแบบฉบับร่างก่อน ใช่หรือไม่ เนื่องจากระบบจะทำการรันเลขที่เอกสารให้ทันที`)) {
          return
        }

        try {
          // Load detail if not already loaded
          if (this.detailData.length === 0 && this.listJobNo.length > 0) {
            await this.loadDetail();
          }
          
          let f = {
            form: this.selectedItems,
            detail: this.detailData,
          }

          console.log('Data to save:', f); // Debug log

          page.loadingBox.show()
          let act = `CSM/Data/CopyDocument`
          let rsp = await $xt.postServerJson(act, f)
          if (!rsp.success) {
            throw rsp.error
          }

          this.$refs.modalCopy.closeModal();
          $notify.success('บันทึกฉบับร่างเรียบร้อยแล้ว')
          await this.loadTotal()
          await this.loadData()

        } catch (ex) {
          $msg.alert(``, ex.toString(), `danger`)
        } finally {
          page.loadingBox.hide()
        }
      },
      async loadDetail(job_no) {
        let url = `CSM/Data/Read_detsilcopy?job_no=${this.listJobNo.join(",")}`
        let resp = await $xt.getServer(url)
        this.detailData = resp.data.detail
      },
      /*  CSM Copy */
      async onTabChange(t) {
        t = t ?? this.tabSelected
        this.tabSelected = t
        let tab = []
        this.retrieveSearch.serv_code = 'all_search'
        switch (this.tabSelected) {
          case 0:
            tab = [1]
            this.subTabSelected = 0
            this.retrieveSearch.job_status = 'P'
            break
          case 1:
            tab = this.is_mango ? [2] : [2, 4]
            this.subTabSelected = 5
            this.retrieveSearch.job_status = 'P'
            if (this.is_mango()) {
              this.loadTotalResponsible()
            }
            break
          case 2:
            tab = this.is_mango ? [2] : [2, 4]
            this.subTabSelected = 5
            this.retrieveSearch.job_status = 'P'
            if (this.is_mango()) {
              this.loadTotalTask()
            }
            break
          case 4:
            tab = this.is_mango ? [3] : [3, 4]
            this.subTabSelected = 3
            this.retrieveSearch.job_status = 'P'
            break
        }

        this.onSetTab(tab)
        paging.setCurrentPage(1)
        await this.loadTotal()
        await this.loadData()
      },
      async onSubTabChange(t) {
        this.subTabSelected = t


        if (this.subTabSelected == 0 || this.subTabSelected == 1) {
          this.retrieveSearch.job_status = 'P'
        }

        paging.setCurrentPage(1)
        await this.loadTotal()
        await this.loadData()
      },
      onSetTab(j = []) {
        this.subtab.forEach(x => {
          if (j.includes(x.group)) {
            if (x.value == 5) {
              x.name = [1, 2].includes(this.tabSelected) ? ui.csm_all_doc || 'เอกสารทั้งหมด' : ui.csm_waiting_approve_assign || ui.csm_home_wait_check_assigned_doc
            }
            x.show = true
          }
          else
            x.show = false
        })
      },
      async retrieveSort() {
        if (this.tabSelected == 1 && this.is_mango()) {
          this.loadTotalResponsible()
        } else if (this.tabSelected == 2 && this.is_mango()) {
          this.loadTotalTask()
        }
        paging.setCurrentPage(1)
        await this.loadData()
        this.loadTotal()
      },
      async searchData() {
        paging.setCurrentPage(1)
        await this.loadData()
      },
      addCond() {
        if (!this.retrieveSearch.text) return
        this.conditions.push({ text: '', field: $linq(this.fields).select(s => s.key).firstOrDefault() })
        this.showConditions = true
      },
      async removeAddCond(idx) {
        this.conditions.splice(idx, 1)
        if (this.conditions.length == 0) this.showConditions = false

        await this.searchData()
      },
      condJoin(idx) {
        let used = [this.retrieveSearch.field].concat($linq(this.conditions).take(idx).select(s => s.field).toArray())
        return used.includes(this.conditions[idx].field) ? 'OR' : 'AND'
      },
      setContentScroll(enable) {
        let content = page?.$refs?.content_body
        if (!content) return

        content.style.height = enable ? '' : 'auto'
        content.style.overflowY = enable ? '' : 'visible'
      },
      async loadTotal() {
        let act = `CSM/Data/Total?job_status=${this.retrieveSearch.job_status || ''}&&serv_code=${this.retrieveSearch.serv_code || ''}`
        let rsp = await $xt.getServer(act)
        this.total = rsp
      },
      async loadTotalResponsible() {
        let act = `CSM/Data/TotalResponsible?job_status=${this.retrieveSearch.job_status || ''}`
        let rsp = await $xt.getServer(act)
        this.totalSub = rsp
      },
      async loadTotalTask() {
        let act = `CSM/Data/TotalTasks?job_status=${this.retrieveSearch.job_status || ''}`
        let rsp = await $xt.getServer(act)
        this.totalSub = rsp
      },
      async loadData(take) {
        this.isLoading = true
        if (take) {
          this.loadmore = this.loadmore + 10
          paging.setItemsPerPage(this.loadmore)
        } else {
          paging.setItemsPerPage(this.pageSize())
        }

        let act = `CSM/Data/ReadDocument?skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}&tabSelected=${this.tabSelected || '0'}&subTabSelected=${this.subTabSelected || '0'}`
        for (var key in this.retrieveSearch) {
          act += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`
        }

        let more_cond = $linq(this.conditions).where(w => !$xt.isEmpty(w.field) && !$xt.isEmpty(w.text)).toArray()
        let rsp = more_cond.length > 0 ? await $xt.postServerJson(act, more_cond) : await $xt.getServer(act)
        let agr = this.$refs.agr;
        this.datalist = rsp.data.detail
        this.datalist.module = $linq(rsp.data.detail).select(x => x.module).firstOrDefault() || ''


        $linq(this.datalist).foreach(d => {
          //  d.job_date = this.$date(d.job_date, "DD/MM/YYYY HH:mm");
          //d.assign_date = this.$date(d.assign_date, "DD/MM/YYYY HH:mm");

          d.job_priority_text = this.priorityName(d.job_priority);
          d.job_priority_code = d.job_priority;
          d.job_code = d.job_status;
          d.job_status_class = this.statusClass('text-', d.job_status);


          d.job_name =
            d.task_Hoid > 0
              ? `<p class="text-warning">Hold</p>`
              : d.task_count == 0
                ? d.job_status == 'D'
                  ? '<p class="text-danger"><b class="text-black">Draft</b></p>'
                  : `<p class="text-danger">${this.ui.csm_home_no_tasks}</p>`
                : this.is_complete(d) && d.task_count > 0
                  ? d.job_status == 'D'
                    ? '<p class="text-danger"><b class="text-black">Draft</b></p>'
                    : `<p class="text-warning">${this.ui.csm_home_done} <i class="fa fa-warning"></i></p>`
                  : d.task_count > 0 && d.task_send_qc > 0 && d.task_waiting_update == 0
                    ? `<p class="text-purple">${this.ui.csm_home_checking} <i class="fa fa-warning"></i>${$xt.isEmpty(d.task_qty) ? '' : d.task_qty}</p>`
                    : d.task_count > 0 && d.task_tester_approve > 0 && d.task_tester_reject == 0
                      ? `<p class="text-teal">${this.ui.csm_home_wait_tester} <i class="fa fa-warning"></i></p>`
                      : d.task_count > 0 && d.task_waiting_approve > 0
                        ? `<p class="text-teal">${this.ui.csm_home_wait_approve} <i class="fa fa-warning"></i></p>`
                        : d.task_count > 0 && d.task_waiting_update > 0
                          ? `<p class="text-teal">${this.ui.csm_home_update_program} <i class="fa fa-warning"></i></p>`
                          : d.task_count > 0 && d.task_tester_reject > 0
                            ? `<p class="text-red">${this.ui.csm_home_reject_tester} <i class="fa fa-warning"></i></p>`
                            : d.task_count > 0 && d.task_waiting_test > 0
                              ? `<p class="text-purple">${this.ui.csm_home_testing} <i class="fa fa-warning"></i></p>`
                              : !this.is_complete(d)
                                && d.task_count > 0
                                && d.task_send_qc == 0
                                && d.task_tester_approve == 0
                                && d.task_tester_reject == 0
                                && d.task_waiting_approve == 0
                                && d.task_waiting_update == 0
                                && d.task_waiting_test == 0
                                ? `<p class="${d.job_status_class}">${this.statusName(d.job_status)} ${$xt.isEmpty(d.task_qty) ? '' : d.task_qty}</p>`
                                : '';
        });

        this.Max_ = Math.max(
          ...this.datalist.map(f => (typeof f.subject === 'string' ? f.subject.length : 0))
        );
        this.Max_ = this.Max_ < 80 ? 80 * 3 : this.Max_ * 3;


        let detail = this.datalist || []
        // console.log('ddd', detail)
        paging.setTotalItems(rsp.data.total)
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1)
        }
        paging.createPagesArray()

        await $xt.sleep(100)


        await this.$nextTick()
        await this.$refs.table_stick?.createStick?.()

        agr.setDisplay(detail);
        this.initTable()
        this.isLoading = false
      },
      async initTable() {
        let agr = this.$refs.agr;
        let bold_underline = { "font-weight": "bold" };
        let bold_style = (p) => (p?.data?.job_code == 'W' ? bold_underline : p?.data?.task_queued_count > 0 && this.is_mango() ? { "color": "#fd7e14" } : {});



        let fields = [
          ["job_no", this.ui.erp_csm_no||"CSM No.", "text", {
            width: 150,
            align: "left",
            pinned: 'left',
            sortable: true,
            cellRenderer: (params) => {
              if (params.value) {
                const jobNo = params.value;
                const isWaiting = params.data.job_code === 'W';
                const displayValue = isWaiting ? `<b>${jobNo}</b>` : jobNo;
                return `<a class="home-cell-link" href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${jobNo}"
                target="_blank">${displayValue}</a>`;
              }
              return "";
            },
          }],
          ["ref_docno",this.ui.erp_ticket_no|| "Ticket No.", "text", { width: 180, align: "left", sortable: true, pinned: 'left', cellStyle: bold_style }, { useCellRenderer: true }],
          ["upd_software_dt", this.ui.csm_home_process_time, "datetime", { width: 180, align: "left", sortable: true, pinned: 'left', cellStyle: bold_style, hide: !this.is_mango() }, { useCellRenderer: true }],
          ["job_date", this.ui.csm_v2_date|| "Date", "datetime", { width: 160, align: "center", sortable: true, pinned: 'left', cellStyle: bold_style }, { useCellRenderer: true }],
          ["assign_date", this.ui.csm_home_assign_date, "date", { width: 150, align: "center", sortable: true, cellStyle: bold_style }, { useCellRenderer: true }],
          ["subject", this.ui.csm_v2_subject||"Subject", "text", { width: this.Max_, align: "left", sortable: true, cellStyle: bold_style }],
          ["project", this.ui.csm_v2_project||"Project", "text", {
            width: 180, align: "left", sortable: true, cellStyle: bold_style, cellClass: params => $xt.isEmpty(params.data.project) ? "text-warning" : "",
            cellRenderer: params => {
              let x = params.data
              if (!this.is_mango()) {
                if ($xt.isEmpty(x.project) && $xt.isEmpty(x.dpt_no) && !$xt.isEmpty(x.customer_code)) {
                  return this.ui.csm_home_no_project
                } else if ($xt.isEmpty(x.project) && !$xt.isEmpty(x.customer_code)) {
                  return this.ui.csm_home_by_customer
                } else {
                  return x.project
                }
              }

              if (this.is_mango() && !this.isDeveloper()) {
                return $xt.isEmpty(x.project) && !$xt.isEmpty(x.customer_code)
                  ? this.ui.csm_home_by_customer
                  : x.project
              }

              if (this.is_mango() && this.isDeveloper() && !$xt.isEmpty(x.project)) {

                return `<a href="${this.baseUrl}page/CustomerDataView?customer_code=${x.customer_code}&pre_event=${x.pre_event}&tabSelected=tab1" class="home-cell-link" target="_blank" >${x.project}</a>`
              }
              return ''
            }
          }
          ],
          ["request_empno_name", this.ui.csm_home_req_by, "text", { width: 200, align: "left", sortable: true, cellStyle: bold_style }],
          ["assign_empno_name", this.ui.erp_responsible|| "Responsible", "text", { width: 200, align: "left", sortable: true, cellStyle: bold_style }],
           ["worker_end_date", this.ui.csm_home_due_date_worker, "date", { width: 200, align: "center", sortable: true, cellStyle: bold_style }, { useCellRenderer: true }],
          ["contract_user", this.ui.erp_contact_by||"Contact By", "text", { width: 150, align: "center", sortable: true, cellStyle: bold_style }],
          ["phone", this.ui.erp_bd_phone||"Phone", "text", { width: 150, align: "center", sortable: true, cellStyle: bold_style }],
          ["job_priority_text", this.ui.csm_home_job_priority, "text", {
            width: 175,
            align: "center", sortable: true, cellStyle: bold_style,
            cellRenderer: (params) => {
              let code = params.data.job_priority_code || "";
              let text = params.data.job_priority_text;
              if (!text) return "";
              let color = this.priorityStatusClass(code);
              let dot = color ? `<span class="home-cell-priority-dot" style="background:${color}"></span>` : '';
              return `<span class="home-cell-priority">${dot}${text}</span>`;
            },
          }],
          ["status_name", this.ui.csm_home_job_status, "text", {
            width: 155,
            align: "center", pinned: 'right', cellStyle: bold_style,
            cellRenderer: (params) => {
              let text = params.data.job_name;
              if (!text) return "";
              // job_name เป็น HTML สำเร็จที่มี text-* ของตัวเองอยู่ — เอาโทน badge จากคลาสนั้น
              // สีพื้นกับสีตัวอักษรจะมาจากแหล่งเดียวกัน ไม่หลุดเป็นพื้นน้ำเงินตัวอักษรส้ม
              let m = /text-([a-z-]+)/.exec(text);
              let tone = {
                success: 'is-success', info: 'is-info', primary: 'is-info',
                danger: 'is-danger', red: 'is-danger',
                warning: 'is-warning', orange: 'is-warning',
                purple: 'is-purple', teal: 'is-teal'
              }[m ? m[1] : ''] || '';

              return `<span class="home-cell-badge ${tone}">${text}</span>`;
            },
          }],
        ]

        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        this.grid_header = header;


      },
      async initTableCopy() {
        let agrCopy = this.$refs.agrCopy;
        if (!agrCopy) return;
        
        let fields = [
          ["checked", "", "checkbox", {
            width: 50,
            align: "center",
            pinned: 'left',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true
          }],
        ["job_no",this.ui.erp_csm_no||"CSM No.", "text", {
            width: 260,
            align: "center",
            pinned: 'left',
            sortable: true,
            cellRenderer: (params) => {
              if (params.value) {
                const jobNo = params.value;
                const isWaiting = params.data.job_code === 'W';
                const displayValue = isWaiting ? `<b>${jobNo}</b>` : jobNo;
                return `<a class="home-cell-link" href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${jobNo}"
                target="_blank">${displayValue}</a>`;
              }
              return "";
            },
          }],
          ["subject", this.ui.csm_v2_subject||"Subject", "text", {
            width: 500, 
            align: "left", 
            sortable: true 
          }],
          ["project", this.ui.csm_v2_project||"Project", "text", {
            width: 300,
            align: "left",
            sortable: true,
            cellClass: params => $xt.isEmpty(params.data.project) ? "text-warning" : "",
            cellRenderer: params => {
              let x = params.data;
              if (!this.is_mango()) {
                if ($xt.isEmpty(x.project) && $xt.isEmpty(x.dpt_no) && !$xt.isEmpty(x.customer_code)) {
                  return this.ui.csm_home_no_project;
                } else if ($xt.isEmpty(x.project) && !$xt.isEmpty(x.customer_code)) {
                  return this.ui.csm_home_by_customer;
                } else {
                  return x.project || '';
                }
              }

              if (this.is_mango() && !this.isDeveloper()) {
                return $xt.isEmpty(x.project) && !$xt.isEmpty(x.customer_code)
                  ? this.ui.csm_home_by_customer
                  : x.project || '';
              }

              if (this.is_mango() && this.isDeveloper() && !$xt.isEmpty(x.project)) {
                return `<a href="#" onclick="event.preventDefault(); window.queryStringRemoteIPCopy('${x.customer_code}', '${x.pre_event}')"
                        class="home-cell-link">${x.project}</a>`;
              }
              return '';
            }
          }],
          ["job_status_display", this.ui.csm_home_job_status, "text", {
            width: 220,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              return params.data.job_status_display || '';
            }
          }],
          ["moduled", this.ui.erp_module||"Module", "text", { 
            width: 200, 
            align: "left", 
            sortable: true,
            hide: !this.is_mango()
          }]
        ];

        // Add Area column for non-mango
        if (!this.is_mango()) {
          fields.push(["area", this.ui.erp_area|| "Area", "text", { 
            width: 200, 
            align: "left", 
            sortable: true 
          }]);
        }

        let header = agrCopy.createHeaderFromArray(fields);
        agrCopy.setHeader(header);

        // Global handler for project link
        window.queryStringRemoteIPCopy = (customerCode, preEvent) => {
          window.open(this.baseUrl + `page/CustomerDataView?customer_code=${customerCode}&pre_event=${preEvent}&tabSelected=tab2`, '_blank');
        };
      },
      async loadx() {

        let act = `CSM/Data/ReadDocumentx?skip=${copyPaging.skipItems()}&take=${copyPaging.getItemsPerPage()}&tabSelected=${this.tabSelected || '0'}&subTabSelected=${this.subTabSelected || '0'}`
        for (var key in this.search) {
          act += `&${key}=${encodeURIComponent(this.search[key])}`
        }
        let rsp = await $xt.getServer(act)
      },
      async loadDataCopy() {
        let act = `CSM/Data/ReadDocument?skip=${copyPaging.skipItems()}&take=${copyPaging.getItemsPerPage()}&tabSelected=0&subTabSelected=0`
        for (var key in this.search) {
          act += `&${key}=${encodeURIComponent(this.search[key])}`
        }
        let rsp = await $xt.getServer(act)
        this.datalistCopy = rsp.data.detail

        // Process data for ag-table
        $linq(this.datalistCopy).foreach(d => {
          d.checked = d.checked || 'N';
          d.job_status_class = this.statusClass('text-', d.job_status);
          
          // Generate job status display
          d.job_status_display = 
            d.task_count == 0
              ? d.job_status == 'D'
                ? '<p class="text-danger"><b class="text-black">Draft</b></p>'
                : `<p class="text-danger">${this.ui.csm_home_no_tasks}</p>`
              : this.is_complete(d) && d.task_count > 0
                ? d.job_status == 'D'
                  ? '<p class="text-danger"><b class="text-black">Draft</b></p>'
                  : `<p class="text-warning">${this.ui.csm_home_done} <i class="fa fa-warning"></i></p>`
                : d.task_count > 0 && d.task_send_qc > 0 && d.task_waiting_update == 0
                  ? `<p class="text-purple">${this.ui.csm_home_checking} ${d.task_qty || ''} <i class="fa fa-warning"></i></p>`
                  : d.task_count > 0 && d.task_tester_approve > 0 && d.task_tester_reject == 0
                    ? `<p class="text-teal">${this.ui.csm_home_wait_tester} <i class="fa fa-warning"></i></p>`
                    : d.task_count > 0 && d.task_waiting_approve > 0
                      ? `<p class="text-teal">${this.ui.csm_home_wait_approve} <i class="fa fa-warning"></i></p>`
                      : d.task_count > 0 && d.task_waiting_update > 0
                        ? `<p class="text-teal">${this.ui.csm_home_update_program} <i class="fa fa-warning"></i></p>`
                        : d.task_count > 0 && d.task_tester_reject > 0
                          ? `<p class="text-red">${this.ui.csm_home_reject_tester} <i class="fa fa-warning"></i></p>`
                          : d.task_count > 0 && d.task_waiting_test > 0
                            ? `<p class="text-purple">${this.ui.csm_home_testing} <i class="fa fa-warning"></i></p>`
                            : !this.is_complete(d)
                              && d.task_count > 0
                              && d.task_send_qc == 0
                              && d.task_tester_approve == 0
                              && d.task_tester_reject == 0
                              && d.task_waiting_approve == 0
                              && d.task_waiting_update == 0
                              && d.task_waiting_test == 0
                              ? `<p class="${d.job_status_class}">${this.statusName(d.job_status)} ${d.task_qty || ''}</p>`
                              : '';
        });

        copyPaging.setTotalItems(rsp.data.total)
        if (!copyPaging.getItemsPerPage()) {
          copyPaging.setCurrentPage(1)
        }
        copyPaging.createPagesArray()

        // Update ag-table
        let agrCopy = this.$refs.agrCopy;
        if (agrCopy) {
          agrCopy.setDisplay(this.datalistCopy);
          
          // Restore selection after data load
          await this.$nextTick();
          await $xt.sleep(100); // Wait for grid to fully render
          
          if (agrCopy.topGridOptions && agrCopy.topGridOptions.api) {
            agrCopy.topGridOptions.api.forEachNode(node => {
              if (node.data) {
                let isSelected = $linq(this.selectedItems).any(a => a.job_no == node.data.job_no);
                node.setSelected(isSelected);
              }
            });
          }
        }
      },
      async loadDocumentOverdue() {
        this.duedateLoading = true
        //  let act = `CSM/Data/DocumentOverdue`
        let act = `CSM/Data/DocumentOverdue1`
        let rsp = await $xt.getServer(act)
        this.csmDueDate = rsp.q
        this.duedateLoading = false
      },
      async loadCustomerService() {
        let act = `CSM/Data/CustomerService`
        let rsp = await $xt.getServer(act)
        this.callCenterStatus = rsp.agent
      },
      async loadHistoryService() {
        let act = `CSM/Data/HistoryService`
        let rsp = await $xt.getServer(act)
        this.callHistoryData = rsp.data
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
      queryStringRemoteIP(x) {
        window.open(this.baseUrl + `page/CustomerDataView?customer_code=${x.customer_code}&pre_event=${x.pre_event}&tabSelected=tab2`, '_blank')
      },
      openProjectDetail(x) {
        window.open(this.baseUrl + `page/CustomerDataView?customer_code=${x.customer_code}&pre_event=${x.pre_event}&tabSelected=tab1`, '_blank')
      },
      projectDisplayText(x) {
        if (!this.is_mango()) {
          if ($xt.isEmpty(x.project) && $xt.isEmpty(x.dpt_no) && !$xt.isEmpty(x.customer_code)) {
            return this.ui.csm_home_no_project
          } else if ($xt.isEmpty(x.project) && !$xt.isEmpty(x.customer_code)) {
            return this.ui.csm_home_by_customer
          } else {
            return x.project
          }
        }
        if (this.is_mango() && !this.isDeveloper()) {
          return $xt.isEmpty(x.project) && !$xt.isEmpty(x.customer_code) ? this.ui.csm_home_by_customer : x.project
        }
        return ''
      },
      onCreateDocument() {
        window.open(this.baseUrl + `page/Transaction/v_csm_trn_001/`, '_blank')
        //this.$router.push({ name: 'v_csm_trn_001' })
      },
      openCSMbyCustomer(x) {
        localStorage.setItem('X-Custome-Panel-CSM', JSON.stringify(x))
        window.open(this.baseUrl + `page/Transaction/v_csm_trn_001/`, '_blank')
      },
      mainOpenCustomer() {
        page.openCustomer()
      },
      async searchCustomer() {
        this.customerLoading = true
        let act = `csm/data/SearchCustomer?search_text=${encodeURIComponent(this.customerSearch)}&skip=${customerPaging.skipItems()}&take=${customerPaging.getItemsPerPage()}`
        let rsp = await $xt.getServer(act)
        this.customerlist = rsp.data.data_rows
        this.customerTotal = rsp.data.total

        customerPaging.setTotalItems(rsp.data.total)
        if (!customerPaging.getItemsPerPage()) {
          customerPaging.setCurrentPage(1)
        }
        customerPaging.createPagesArray()

        this.customerLoading = false
        this.$nextTick(() => this.adjustDueDateHeight())
      },
      priorityName(code) {
        return $linq(this.priorityCodeData).where(x => x.prioity_code == code).select(x => x.prioity_des).firstOrDefault() || ''
      },
      priorityStatusClass(code) {

        var color = $linq(this.priorityCodeData).where(w => w.prioity_code == code).select(x => x.priority_color).firstOrDefault() || ''

        return color || '#000000';
      },
      statusClass(prefix, status) {
        return status == 'Y' ? prefix + 'success' : status == 'I' ? prefix + 'info' : status == 'N' ? prefix + 'danger' : status == 'H' ? prefix + 'warning' : ''
      },
      statusName(code) {
        return $linq(this.statusCode).where(x => x.id == code).select(x => x.name).firstOrDefault() || ''
      },
      is_complete(x) {
        return x.task_send_pretest == x.task_count && !['Y', 'N'].includes(x.job_status)
      },
      is_mango() {

        let isMango = $linq(this.configData).where(x => x.config_id == 'TRN0001').select(x => x.config_value).firstOrDefault()
        return isMango == 'Y' ? true : false
      },
      isDeveloper() {
        let department = this.auth.empcode.substring(0, 2)
        return department == 'IT'
      },
      async usercsm() {
        let act = `CSM/Center/GetConfigByUser`
        let resp = await $xt.getServer(act)
        this.user_config = resp.data.data_rows
      },
      is_csm_all() {
        let csm_all = $linq(this.user_config).select(x => x.st_csm_all_doc).firstOrDefault()

        return csm_all == 'Y' ? true : false
      },
      isShowAllDoc() {
        return this.is_mango() || this.is_csm_all();
      },
      notificationDeveloper() {
        // `$swal` came from `Vue.use(VueSweetalert2)` in the legacy main.js.
        // vue-sweetalert2 v4 is Vue 2 only and was never ported, so this threw.
        // Routed to `$msg.alert`, the modal this app already uses in 778 other
        // places; it takes (title, message, type) and supports 'info' natively.
        $msg.alert(
          this.ui.csm_v2_notification||'แจ้งเตือน',
          `${this.ui.hello||'สวัสดี'} ${this.auth.empname} ${this.ui.csm_home_pending_task_count}`,
          'info'
        )
      },
      /* Method : Center */
      async loadCenter() {
        await this.$store.dispatch('findPriority')
        await this.$store.dispatch('findConnection')
      },
      adjustDueDateHeight() {
        let scBox = this.$refs.scBox
        let ddBox = this.$refs.ddBox
        if (!scBox || !ddBox) return

        let footer = document.querySelector('.main-footer')
        let footerTop = footer ? footer.getBoundingClientRect().top : window.innerHeight - 40

        let colTop = scBox.getBoundingClientRect().top
        let rowGap = ddBox.getBoundingClientRect().top - scBox.getBoundingClientRect().bottom
        let totalAvailable = footerTop - colTop - 50

        let ddHeaderH = this.$refs.ddHeader?.offsetHeight || 0

        if (!this.customerlist || !this.customerlist.length) {
          let scBoxH = scBox.getBoundingClientRect().height
          this.dueDateMaxHeight = Math.max(totalAvailable - scBoxH - rowGap - ddHeaderH, 100)
          return
        }

        let half = (totalAvailable - rowGap) / 2

        let scHeaderH = this.$refs.scHeader?.offsetHeight || 0
        let scAboveH = this.$refs.scAboveList?.offsetHeight || 0
        let scBelowH = this.$refs.scBelowList?.offsetHeight || 0

        let scBodyEl = this.$refs.scBody
        let scBodyStyle = scBodyEl ? window.getComputedStyle(scBodyEl) : null
        let scBodyPadding = scBodyStyle ? (parseFloat(scBodyStyle.paddingTop) || 0) + (parseFloat(scBodyStyle.paddingBottom) || 0) : 0

        this.searchCustomerListMaxHeight = Math.max(half - scHeaderH - scAboveH - scBelowH - scBodyPadding, 60)
        this.dueDateMaxHeight = Math.max(half - ddHeaderH, 100)
      },
      filterService() {
        const allService = { id: 'all_search', text: 'All' };
        const services = $linq(this.serviceCodeData).where(x => x.serv_code != '999' && x.active == 'Y').select(s => { return { id: s.serv_code, text: s.serv_name } }).toArray();
        return [allService, ...services];
      },
    },
    computed: {
      priorityCodeData() { return store.state.priorityCodeData },
      connectionCodeData() { return store.state.connectionCodeData },
      configData() { return store.state.configData },
      serviceCodeData() { return store.state.serviceCodeData }
    },
    watch: {
      showConditions(x) {
        this.$nextTick(() => this.setContentScroll(x && this.conditions.length > 0))
      },
    },
    async mounted() {
      page = this.$refs.page
      page.pageTitle = 'CSM :'+ (this.ui.erp_view_document||' View Document')
      document.title = page.pageTitle

      paging = this.$refs.paging
      paging.setCurrentPage(1)
      paging.setItemsPerPage(this.pageSize())

      customerPaging = this.$refs.customerPaging
      customerPaging.setCurrentPage(1)
      customerPaging.setItemsPerPage(5)

      copyPaging = this.$refs.copyPaging
      copyPaging.setCurrentPage(1)
      copyPaging.setItemsPerPage(50)

      let field_init = $linq(this.fields).where(x => x.search).firstOrDefault() || {}
      this.retrieveSearch.field = field_init.key || ''
      this.retrieveSearch.field_type = field_init.type || 's'
      this.retrieveSearch.job_status = this.status[2].value || ''
      this.retrieveSearch.serv_code = 'all_search'


      await this.loadCenter()

      await this.loadTotal()
      await this.loadData()
      await this.loadx()
      await this.usercsm()




      await this.loadDocumentOverdue()
      await this.loadCustomerService()
      await this.loadHistoryService()

      $(window).resize(() => {
        let windowHeight = $(window).height()
        this.height = windowHeight - 400
        this.adjustDueDateHeight()
      })
      $(window).trigger('resize')

      $('#HistoryBox').boxWidget()
      $('#DueDateBox').boxWidget()
      this.$nextTick(async () => {
        await this.$refs.table_stick?.createStick?.()
        this.adjustDueDateHeight()
        setTimeout(() => this.adjustDueDateHeight(), 300)

        this.setContentScroll(this.showConditions && this.conditions.length > 0)

        this.prevBodyOverflowY = document.body.style.overflowY
        document.body.style.overflowY = 'hidden'
      });
    },
    beforeUnmount() {
      document.body.style.overflowY = this.prevBodyOverflowY || ''
    }
  }
  export default home
</script>
<style>

  /* ─── Home : AG Table ──────────────────────────────────── */
  /* ทุก selector นำหน้าด้วย .home-grid — style block นี้ไม่ scoped */
  .home-grid .ag-theme-alpine .ag-root-wrapper {
    border-radius: 10px;
  }

  .home-grid .ag-theme-alpine .ag-header-cell-text {
    letter-spacing: .2px;
  }

  .home-grid .ag-theme-alpine .ag-row-hover {
    background-color: #f2f7fc;
  }

  /* เงาขอบคอลัมน์ที่ตรึงไว้ — รู้ว่าคอลัมน์ลอยอยู่ตอนเลื่อนแนวนอน */
  .home-grid .ag-theme-alpine .ag-pinned-left-cols-container {
    box-shadow: 6px 0 8px -6px rgba(2, 35, 78, .16);
  }

  .home-grid .ag-theme-alpine .ag-pinned-right-cols-container {
    box-shadow: -6px 0 8px -6px rgba(2, 35, 78, .16);
  }

  .home-grid .ag-overlay-no-rows-center {
    color: #93a1b0;
    font-size: 13px;
    font-weight: 600;
  }

  /* CSM No. / Project link */
  .home-cell-link {
    color: #1a6fa8;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px dashed rgba(26, 111, 168, .4);
  }

  .home-cell-link:hover {
    color: #02234e;
    border-bottom-color: #02234e;
  }

  /* Job Status badge — กว้างเท่ากันทุกแถว คอลัมน์จะเรียงเป็นสัดส่วน */
  .home-cell-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 112px;
    height: 24px;
    padding: 0 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    background: #eef1f6;
    color: #5b6479;
    border: 1px solid #e2e7ef;
  }

  /* job_name ส่งมาเป็น <p class="text-*"> — ต้องล้าง line-height 45px ที่ ag-table
     ตั้งไว้ให้ <p> ในเซลล์ ไม่งั้น badge จะสูง 49px ล้นแถว และบังคับสีให้ตรงกับโทน badge */
  .home-grid .ag-theme-alpine .ag-cell .home-cell-badge p,
  .home-grid .ag-theme-alpine .ag-cell .home-cell-badge b {
    display: inline;
    margin: 0;
    padding: 0;
    line-height: 1;
    font-weight: inherit;
    color: inherit !important;
  }

  .home-cell-badge i {
    font-size: 9px;
    opacity: .8;
  }

  .home-cell-badge.is-success { background: #e9f9ef; color: #16794a; border-color: #c4ecd3; }
  .home-cell-badge.is-info    { background: #e8f1fe; color: #1d5fbf; border-color: #c9dcfb; }
  .home-cell-badge.is-danger  { background: #fdecec; color: #c22b2b; border-color: #f7cfcf; }
  .home-cell-badge.is-warning { background: #fff5e5; color: #a15c07; border-color: #f5dfb0; }
  .home-cell-badge.is-purple  { background: #f4ecfe; color: #6d28d9; border-color: #ddd0fa; }
  .home-cell-badge.is-teal    { background: #e6f7f5; color: #0f766e; border-color: #bfe9e4; }

  /* Job Priority — จุดสีตามข้อมูล + ตัวอักษรสีเข้ม (สีอ่อนเป็นตัวอักษรอ่านยาก) */
  .home-cell-priority {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: #3d4a5c;
  }

  .home-cell-priority-dot {
    width: 7px;
    height: 7px;
    flex: 0 0 7px;
    border-radius: 50%;
  }

  body.dark-mode .home-cell-link { color: #6fb6e8; border-bottom-color: rgba(111, 182, 232, .4); }
  body.dark-mode .home-cell-link:hover { color: #a9d6f5; border-bottom-color: #a9d6f5; }
  body.dark-mode .home-cell-priority { color: #c9d1d9; }
  body.dark-mode .home-cell-badge { background: #1e2a3a; color: #8b949e; border-color: #2d4057; }
  body.dark-mode .home-cell-badge.is-success { background: rgba(34, 197, 94, .15); color: #86efac; border-color: rgba(34, 197, 94, .35); }
  body.dark-mode .home-cell-badge.is-info    { background: rgba(60, 141, 188, .18); color: #7dd3fc; border-color: rgba(60, 141, 188, .4); }
  body.dark-mode .home-cell-badge.is-danger  { background: rgba(239, 68, 68, .15); color: #fca5a5; border-color: rgba(239, 68, 68, .35); }
  body.dark-mode .home-cell-badge.is-warning { background: rgba(245, 158, 11, .15); color: #fcd34d; border-color: rgba(245, 158, 11, .35); }
  body.dark-mode .home-cell-badge.is-purple  { background: rgba(168, 85, 247, .16); color: #d8b4fe; border-color: rgba(168, 85, 247, .38); }
  body.dark-mode .home-cell-badge.is-teal    { background: rgba(20, 184, 166, .16); color: #7ee0d3; border-color: rgba(20, 184, 166, .38); }

  /* ─── Home : Filter Row ────────────────────────────────── */
  .home-filter-card {
    margin-bottom: 14px;
    padding: 14px 0 2px;
    background: #f7f9fc;
    border: 1px solid #e8edf4;
    border-radius: 12px;
  }

  .home-filter-card > .row {
    margin-left: 0;
    margin-right: 0;
  }

  .home-filter label {
    margin-bottom: 6px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .6px;
    text-transform: uppercase;
    color: #8794a8;
  }

  .home-filter .form-control {
    background-color: #fff;
    border-radius: 8px;
    border-color: #e2e8f2;
    box-shadow: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }

  .home-filter .form-control:focus {
    border-color: #8fb8e0 !important;
    box-shadow: 0 0 0 3px rgba(60, 141, 188, .14);
  }

  .home-filter .select2-container--bootstrap .select2-selection--single {
    background-color: #fff !important;
    border-radius: 8px !important;
    border-color: #e2e8f2 !important;
  }

  .home-filter .input-group .form-control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .home-filter .input-group-btn .btn {
    padding: 0 16px;
    border: none;
    border-radius: 0 8px 8px 0;
    background: linear-gradient(135deg, #0b3a76, #02234e);
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
  }

  .home-filter .input-group-btn .btn:hover {
    background: linear-gradient(135deg, #14508f, #05346f);
    box-shadow: 0 3px 12px rgba(2, 35, 78, .28);
  }

  body.dark-mode .home-filter-card { background: #16202e; border-color: #2d4057; }
  body.dark-mode .home-filter label { color: #7d8898; }
  body.dark-mode .home-filter .select2-container--bootstrap .select2-selection--single { border-radius: 8px !important; }

  /* ─── Home : Action Buttons ────────────────────────────── */
  .home-action-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
  }

  .home-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 32px;
    padding: 0 15px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    outline: none;
    white-space: nowrap;
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
  }

  .home-action-btn i {
    font-size: 12px;
    transition: transform 0.18s cubic-bezier(.4,0,.2,1);
  }

  .home-action-btn:hover {
    color: #fff;
    transform: translateY(-1px);
  }

  .home-action-btn:hover i {
    transform: scale(1.12);
  }

  .home-action-btn:active {
    transform: translateY(0);
  }

  .home-action-btn.is-ai {
    color: #a1620a;
    background: #fff5e5;
    border: 1px solid #f5dfb0;
  }

  .home-action-btn.is-ai:hover {
    color: #7d4b06;
    background: #ffeccd;
    border-color: #edcd8d;
    box-shadow: 0 3px 12px rgba(161, 98, 10, .16);
  }

  .home-action-btn.is-copy {
    color: #15794a;
    background: #e9f9ef;
    border: 1px solid #c4ecd3;
  }

  .home-action-btn.is-copy:hover {
    color: #0f5c37;
    background: #d8f4e3;
    border-color: #a8e0be;
    box-shadow: 0 3px 12px rgba(21, 121, 74, .16);
  }

  .home-action-btn.is-new {
    color: #fff;
    background: linear-gradient(135deg, #2f86c5, #0f6fa3);
    box-shadow: 0 2px 8px rgba(15, 111, 163, .28);
  }

  .home-action-btn.is-new:hover {
    background: linear-gradient(135deg, #3f97d6, #1279b0);
    box-shadow: 0 5px 16px rgba(15, 111, 163, .38);
  }

  body.dark-mode .home-action-btn.is-ai { color: #fcd34d; background: rgba(245, 158, 11, .15); border-color: rgba(245, 158, 11, .35); }
  body.dark-mode .home-action-btn.is-ai:hover { color: #fde68a; background: rgba(245, 158, 11, .24); }
  body.dark-mode .home-action-btn.is-copy { color: #86efac; background: rgba(34, 197, 94, .15); border-color: rgba(34, 197, 94, .35); }
  body.dark-mode .home-action-btn.is-copy:hover { color: #bbf7d0; background: rgba(34, 197, 94, .24); }

  /* ─── Home : Search Conditions ─────────────────────────── */
  .home-cond-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .home-cond-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 32px;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: #02234e;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    outline: none;
    white-space: nowrap;
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
  }

  .home-cond-btn i {
    font-size: 11px;
  }

  .home-cond-btn:hover:not(:disabled) {
    background: #05346f;
    box-shadow: 0 3px 12px rgba(2, 35, 78, .25);
  }

  .home-cond-btn:disabled {
    opacity: .4;
    cursor: not-allowed;
  }

  .home-cond-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: #5b6479;
    background: #eef1f6;
    border: 1px solid #e2e7ef;
    border-radius: 8px;
    cursor: pointer;
    outline: none;
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
  }

  .home-cond-toggle:hover {
    color: #02234e;
    background: #e2e8f2;
  }

  .home-cond-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    font-size: 11px;
    font-weight: 700;
    color: #1d5fbf;
    background: #e8f1fe;
    border: 1px solid #c9dcfb;
    border-radius: 999px;
  }

  .home-cond-panel {
    margin: 4px 0 12px;
    padding: 12px 14px;
    background: #fff;
    border: 1px solid #e8edf4;
    border-radius: 10px;
  }

  .home-cond-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .home-cond-row + .home-cond-row {
    margin-top: 8px;
  }

  .home-cond-join {
    flex: 0 0 44px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .5px;
    text-align: center;
    color: #94a3b8;
  }

  .home-cond-join.is-or {
    color: #1d5fbf;
  }

  .home-cond-field {
    flex: 0 0 190px;
  }

  .home-cond-value {
    flex: 1 1 auto;
    max-width: 460px;
  }

  .home-cond-row .form-control {
    border-radius: 8px;
    box-shadow: none;
  }

  .home-cond-row .form-control:focus {
    border-color: #8fb8e0 !important;
    box-shadow: 0 0 0 3px rgba(60, 141, 188, .14);
  }

  .home-cond-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 30px;
    width: 30px;
    height: 30px;
    font-size: 11px;
    color: #c22b2b;
    background: #fdecec;
    border: 1px solid #f7cfcf;
    border-radius: 8px;
    cursor: pointer;
    outline: none;
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
  }

  .home-cond-remove:hover {
    color: #fff;
    background: #c22b2b;
    border-color: #c22b2b;
  }

  @media (max-width: 767px) {
    .home-cond-row {
      flex-wrap: wrap;
    }

    .home-cond-join {
      flex: 0 0 100%;
      text-align: left;
    }

    .home-cond-field {
      flex: 1 1 100%;
    }

    .home-cond-value {
      max-width: none;
    }
  }

  body.dark-mode .home-cond-btn { background: #1d5fbf; }
  body.dark-mode .home-cond-btn:hover:not(:disabled) { background: #2f74d8; box-shadow: 0 3px 12px rgba(29, 95, 191, .35); }
  body.dark-mode .home-cond-toggle { color: #8b949e; background: #1e2a3a; border-color: #2d4057; }
  body.dark-mode .home-cond-toggle:hover { color: #c9d1d9; background: #253449; }
  body.dark-mode .home-cond-count { color: #7dd3fc; background: rgba(60, 141, 188, .18); border-color: rgba(60, 141, 188, .4); }
  body.dark-mode .home-cond-panel { background: #1c2839; border-color: #2d4057; }
  body.dark-mode .home-cond-join { color: #6b7688; }
  body.dark-mode .home-cond-join.is-or { color: #7dd3fc; }
  body.dark-mode .home-cond-remove { color: #fca5a5; background: rgba(239, 68, 68, .15); border-color: rgba(239, 68, 68, .35); }
  body.dark-mode .home-cond-remove:hover { color: #fff; background: #c22b2b; border-color: #c22b2b; }

  /* ─── Home : View Mode Toggle (Table/Card) ─────────────── */
  .home-view-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
  }

  .home-view-toggle {
    display: flex;
    align-items: center;
    background: #e8ecf2;
    border-radius: 8px;
    padding: 3px;
    gap: 2px;
  }

  .home-view-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    font-size: 11.5px;
    font-weight: 500;
    color: #6b7a90;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(.4,0,.2,1);
    outline: none;
    white-space: nowrap;
  }

  .home-view-btn i {
    font-size: 12px;
  }

  .home-view-btn:hover {
    color: #3d4a5c;
    background: rgba(255,255,255,.5);
  }

  .home-view-btn--active {
    color: #1e3a5f;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,.08);
    font-weight: 600;
  }

  .home-view-btn--active:hover {
    background: #fff;
    color: #1e3a5f;
  }

  /* ─── Home : Doc Card Grid (desktop card view) ─────────── */
  .home-doc-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 14px;
    max-height: calc(100vh - 400px);
    overflow-y: auto;
    padding: 2px 2px 14px;
  }

  .home-doc-card-grid .csm-doc-card {
    margin-bottom: 0;
  }

  /* ─── Home : Doc Card — Detail rows (Subject/Project/Req.By) ─── */
  .csm-doc-detail {
    margin-bottom: 10px;
  }

  .csm-doc-detail-row {
    font-size: 12px;
    color: #5f6368;
    line-height: 1.6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .csm-doc-detail-label {
    font-weight: 600;
    color: #202124;
  }

  .csm-doc-detail-value {
    color: #5f6368;
  }

  .csm-doc-project-link {
    cursor: pointer;
  }

  .csm-doc-project-link:hover {
    text-decoration: underline;
  }

  /* ─── Home : Doc Card — Footer (Responsible / Job Priority) ─── */
  .csm-doc-footer2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #eef0f3;
    font-size: 11.5px;
  }

  .csm-doc-footer-left {
    color: #5f6368;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .csm-doc-footer-right {
    flex-shrink: 0;
    font-weight: 600;
    color: #9B51E0;
    white-space: nowrap;
  }

  .home-card-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 20px;
    color: #b0bcc8;
    font-size: 13px;
    grid-column: 1 / -1;
  }

  .home-card-empty i {
    font-size: 28px;
    opacity: 0.35;
  }

  /* ─── Home : Copy CSM Card Grid (multi-select) ─────────── */
  .copy-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 8px;
    max-height: 420px;
    overflow-y: auto;
    padding: 2px;
  }

  .copy-item-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid #edf0f5;
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
  }

  .copy-item-card:hover {
    border-color: #b8d4f0;
    background: #f6faff;
    box-shadow: 0 2px 12px rgba(60,141,188,.1);
  }

  .copy-item-card--selected {
    border-color: #3c8dbc;
    background: #f0f7fd;
    box-shadow: inset 0 0 0 1px #3c8dbc;
  }

  .copy-item-checkbox {
    flex-shrink: 0;
    padding-top: 2px;
  }

  .copy-item-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .copy-item-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }

  .copy-item-code {
    font-size: 12.5px;
    font-weight: 700;
    color: #1f2937;
  }

  .copy-item-status {
    font-size: 11px;
    flex-shrink: 0;
  }

  .copy-item-status p {
    margin: 0;
  }

  .copy-item-subject {
    font-size: 12px;
    color: #3d4a5c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .copy-item-meta {
    font-size: 10.5px;
    color: #8b95a5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 2px;
  }

  .copy-item-meta i {
    margin-right: 4px;
    opacity: 0.6;
  }

  ::v-deep  .body {

    overflow-x: hidden;
    overflow-y: hidden !important;
}
</style>

<style>
  @import './CSS/home-responsive.css';
</style>
