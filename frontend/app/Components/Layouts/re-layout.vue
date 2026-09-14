<template>
  <div class="wrapper">
    <header class="main-header">
      <a href="#" v-on:click.prevent="" class="logo hidden-xs">
        <!-- mini logo for sidebar mini 50x50 pixels -->
        <span class="logo-mini font-extra">
          <img :src="`${baseUrl}Content/Images/PNG/LogoSmall.png`" width="50" height="50"
               style="padding-right:10px;" />
        </span>
        <!-- logo for regular state and mobile devices -->
        <span class="logo-lg log font-extra">{{ ui.csm_layout_app_name }}</span>
      </a>
      <nav class="navbar navbar-static-top">
        <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button" style="padding-top:16px">
          <span class="sr-only">{{ ui.csm_layout_toggle_nav }}</span>
          <span class="hidden-md hidden-sm hidden-xs font-extra" style="margin-left: 10px">{{ pageTitle }}</span>
        </a>

        <div class="navbar-custom-menu">
          <ul class="nav navbar-nav">
            <li class="hidden-sm hidden-xs" v-if="!xt.isEmpty(auth.extension)" style="margin-top:7px;margin-right:7px;">
              <select class="form-control" v-model="viewStatus" @change="setState()" style="width:150px">
                <option value="" selected="selected" disabled="disabled">{{ ui.csm_layout_select }}</option>
                <option v-for="x in stateData" :key="x.state_code" :value="x.state_code"
                        v-show="x.state_code != '11' && x.state_code != '12'">
                  {{ x.state_name }}
                </option>
              </select>
            </li>
            <li class="hidden-sm hidden-xs" v-if="!xt.isEmpty(auth.extension)">
              <a href="#" @click.prevent="">
                <i class="fa fa-phone"></i> {{ ui.csm_layout_extension }} : {{ auth.extension || '' }}
              </a>
            </li>
            <li class="dropdown hidden-sm hidden-xs" v-if="is_mango()">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                <i class="fas fa-wrench"></i> {{ ui.csm_layout_document_settings }}
                <span class="caret"></span>
              </a>
              <ul class="dropdown-menu" role="menu">
                <li v-if="(isSuperAdmin() && is_mango())||isAdminMG()">
                  <a :href="baseUrl + 'page/tools/v_csm_tools'" target="_blank"><i class="fas fa-check-circle"></i> {{ ui.csm_layout_edit_document_dev }}</a>
                </li>
                <li>
                  <a :href="baseUrl + 'page/tools/v_csm_doc_running'" target="_blank">
                    <i class="fas fa-check-circle"></i> {{ ui.csm_layout_doc_running_form }}
                  </a>
                </li>
                <li>
                  <a :href="baseUrl + 'page/tools/v_csm_erp_config'" target="_blank">
                    <i class="fas fa-check-circle"></i> {{ ui.csm_layout_software_erp_config }}
                  </a>
                </li>
              </ul>
            </li>
            <li class="dropdown hidden-sm hidden-xs" v-if="isDeveloper() && is_mango()">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                <i class="fas fa-user-shield"></i> {{ ui.csm_layout_for_it_mango }}
                <span class="caret"></span>
              </a>
              <ul class="dropdown-menu" role="menu">
                <li>
                  <a :href="baseUrl + 'page/tools/v_csm_employee'" target="_blank">
                    <i class="fas fa-user-shield"></i> {{ ui.csm_layout_list_it_employee }}
                  </a>
                </li>
                <li>
                  <a :href="baseUrl + 'page/tools/v_csm_passcode'" target="_blank">
                    <i class="fas fa-key"></i> {{ ui.csm_layout_create_passcode_dev }}
                  </a>
                </li>
                <li>
                  <a :href="baseUrl + 'page/tools/v_csm_db_list'" target="_blank">
                    <i class="fas fa-key"></i> {{ ui.csm_layout_database_list }}
                  </a>
                </li>
                 <li>
                  <a :href="baseUrl + 'page/master/'" target="_blank">
                    <i class="fas fa-key"></i> {{ ui.csm_layout_view_master_passcode }}
                  </a>
                </li>
              </ul>
            </li>
            <li class="dropdown hidden-sm hidden-xs" v-if="isAdmin()">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                <i class="fas fa-user-secret"></i> {{ ui.csm_menu_admin_only }}
                <span class="caret"></span>
              </a>
              <ul class="dropdown-menu" role="menu">
                <li>
                  <a :href="baseUrl + 'page/manual/v_csm_manual_list_admin'" target="_blank">
                    <i class="fas fa-check-circle"></i> {{ ui.csm_layout_checking_update_program }}
                  </a>
                </li>
              </ul>
            </li>
            <li class="hidden-sm hidden-xs" v-if="is_mango()">
              <a :href="baseUrl+'page/manual/v_csm_manual_list_v2'" target="_blank">
                <i class="fas fa-list"></i> {{ ui.csm_layout_update_list_program }}
              </a>
            </li>

            <!-- Logs Programs -->
            <li class="dropdown hidden-sm hidden-xs" v-if="is_mango()">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                <i class="fas fa-clipboard-list"></i> {{ ui.csm_layout_logs_programs }}
                <span class="caret"></span>
              </a>
              <ul class="dropdown-menu" role="menu">
                <li class="hidden-sm hidden-xs">
                  <a :href="baseUrl+'page/custommango/v_csm_logs_program'" target="_blank">
                    <i class="fas fa-clipboard-list"></i> {{ ui.csm_layout_logs_programs }}
                  </a>
                </li>
                <li>
                  <a :href="baseUrl + 'page'" target="_blank">
                    <i class="fas fa-check-circle"></i> {{ ui.csm_layout_rpt_update_list_task }}
                  </a>
                </li>
              </ul>
            </li>

            <li class="hidden-sm hidden-xs">
              <a :href="baseUrl+'page/transaction/v_csm_trn_002'" target="_blank">
                <i class="fas fa-file-alt"></i>
                <span class="label label-warning" v-if="totalCSMLine > 0">{{ totalCSMLine }}</span>
              </a>
            </li>
            <!-- <li class="hidden-sm hidden-xs">
              <a :href="baseUrl+'page/transaction/v_csm_trn_001'" target="_blank">
                <i class="fas fa-comment-dots"></i>
                <span class="label label-warning" v-if="NotiNewMsg.length > 0">{{ NotiNewMsg.length }}</span>
              </a>
            </li> -->
            <!-- Notifications -->
            <!--<li class="dropdown notifications-menu hidden-sm hidden-xs">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                <i class="fas fa-comment"></i>
                <span class="label label-warning" v-if="NotiNewMsg.length > 0">{{ NotiNewMsg.length || 0 }}</span>
              </a>
              <ul class="dropdown-menu">
                <li class="header">เอกสารที่มีข้อความใหม่ {{ NotiNewMsg.length || 0 }} รายการ</li>
                <li>
                  <ul class="menu">
                    <li v-for="x, idx in NotiNewMsg">
                      <a :href="baseUrl + 'page/transaction/v_csm_trn_001/?job_no=' + x.job_no + '&ref_itemno=' + x.itemno"
                         target="_blank">
                        <span style="font-size:13px">
                          {{ ui.erp_document_no }} <span class="text-bold text-danger" v-text="x.job_no"></span> <br />
                          Subject : {{ x.subject }}<br />
                          Task No. : {{ x.itemno }}
                        </span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>-->
            <li class="dropdown notifications-menu hidden-sm hidden-xs rn-noti">
              <a href="#" class="dropdown-toggle rn-noti__bell" data-toggle="dropdown">
                <i class="fas fa-bell"></i>
                <span class="rn-noti__badge" v-if="viewNotiDueDate.length > 0">
                  {{ viewNotiDueDate.length || 0 }}
                </span>
              </a>
              <ul class="dropdown-menu rn-noti__panel">
                <li class="rn-noti__head">
                  <span class="rn-noti__head-ico"><i class="far fa-clock"></i></span>
                  <span class="rn-noti__head-title">{{ ui.csm_layout_near_due_count.replace('{0}', viewNotiDueDate.length || 0) }}</span>
                </li>
                <li class="rn-noti__body">
                  <ul class="rn-noti__list">
                    <li v-for="(x, idx) in viewNotiDueDate" :key="idx">
                      <a :href="baseUrl + 'page/transaction/v_csm_trn_001/?job_no=' + x.job_no" target="_blank">
                        <span class="rn-noti__ico"><i class="fas fa-file-alt"></i></span>
                        <span class="rn-noti__text">
                          <span class="rn-noti__no">{{ ui.erp_document_no }} <b>{{ x.job_no }}</b></span>
                          <span class="rn-noti__meta" v-show="!xt.isEmpty(x.pre_des)"><i class="fas fa-city"></i> {{ ui.csm_v2_project }} : {{ x.pre_des }}</span>
                          <span class="rn-noti__meta" v-show="!xt.isEmpty(x.dpt_name)"><i class="fas fa-sitemap"></i> {{ ui.csm_layout_dept_short }} : {{ x.dpt_name }}</span>
                          <span class="rn-noti__due" v-if="x.alr_duedate"><i class="far fa-calendar-times"></i> {{ ui.erp_due_date }} : {{ $date(x.alr_duedate, 'DD/MM/YYYY') }}</span>
                        </span>
                        <i class="fas fa-chevron-right rn-noti__go"></i>
                      </a>
                    </li>
                    <li class="rn-noti__empty" v-if="!viewNotiDueDate.length">
                      <i class="far fa-bell-slash"></i>
                      <span>{{ ui.erp_no_data }}</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li>
              <a href="#" data-toggle="control-sidebar">
                <img :src="`${baseUrl}Content/Images/Icon SVG/man.svg`" width="20" style="margin-bottom:3px" /> <span class="hidden-md hidden-sm hidden-xs">{{ (auth.userid || '').toUpperCase() }}</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <aside class="main-sidebar">
      <section class="sidebar">
        <div class="user-panel">
          <div class="pull-left image">
            <img :src="`${baseUrl}Content/Images/Icon PNG/man.png`" width="160" class="img-circle" />
          </div>
          <div class="pull-left info">
            <p>{{ auth.empname }}</p>
            <a href="#" @click.prevent><i class="fa fa-circle text-success"></i> {{ ui.csm_layout_online }}</a>
          </div>
        </div>
        <side-menu ref="sideMenu" :is-mango="is_mango()"></side-menu>
      </section>
    </aside>
    <div class="content-wrapper" style="padding-top:50px !important; padding-bottom:40px !important;">
      <!--Main content-->
      <section class="content">
        <div class="content-body" ref="content_body">
          <slot name="body"></slot>
        </div>
      </section>
    </div>
    <!-- Layout : Footer -->
    <footer class="main-footer hidden-sm hidden-xs">
      <span class="footer-left">
        <span>&copy; {{ year === 2019 ? '2019' : `2019-${year}` }} Mango Consultant Co., Ltd.</span>
        <span class="footer-dot"></span>
        <span>{{ auth.mainname }}</span>
        <span class="footer-dot"></span>
      </span>
      <span class="footer-right">
        <span>{{ ui.csm_layout_app_version }} : {{ viewVersion }}</span>
        <span class="footer-dot"></span>
        <span>{{ ui.csm_layout_api_version }} : {{ appinfo.build_version }}</span>
      </span>
    </footer>
    <!-- Control Sidebar -->
    <aside class="control-sidebar control-sidebar-dark">
      <!-- Tabs -->
      <ul class="nav nav-tabs nav-justified control-sidebar-tabs cs-tabs">
        <li class="active"><a href="#control-sidebar-home-tab" data-toggle="tab"><i class="fa fa-user"></i></a></li>
        <!-- <li><a href="#control-sidebar-settings-tab" data-toggle="tab"><i class="fa fa-bell"></i></a></li> -->
        <li><a href="#control-sidebar-settings-tab-2" data-toggle="tab"><i class="fa fa-gears"></i></a></li>
      </ul>

      <div class="tab-content" style="padding: 0;">

        <!-- Tab: Profile -->
        <div class="tab-pane active" id="control-sidebar-home-tab">
          <!-- User card -->
          <div class="cs-user-card">
            <div class="cs-avatar">
              <img :src="`${baseUrl}Content/Images/Icon PNG/man.png`" />
            </div>
            <div class="cs-user-info">
              <div class="cs-user-name">{{ auth.empname }}</div>
              <div class="cs-user-status"><span class="cs-dot"></span> {{ ui.csm_layout_online }}</div>
            </div>
          </div>
   <!-- Section: Change Company -->
        <!-- Section: Change Company -->
        <h4 class="control-sidebar-heading font-extra"><i class="fas fa-building"></i> {{ ui.csm_layout_change_company }}</h4>
        <div class="control-sidebar-company-section">
          <vue-select-2 :options="companyList"
                        :settings="{theme: 'bootstrap', selectionCssClass: 'form-control input-sm'}"
                        v-model="selectedMaincode">
          </vue-select-2>
          <button type="button"
                  class="btn btn-sm btn-primary btn-block margin-t-10"
                  @click="changeCompany()"
                  v-bind:disabled="isLoadingCompany">
            <i class="fa" v-bind:class="{'fa-spinner fa-spin': isLoadingCompany, 'fa-exchange-alt': !isLoadingCompany}"></i>
            {{ ui.csm_layout_confirm_change_company }}
          </button>
        </div>
          <div class="cs-section-label">{{ ui.csm_layout_quick_links }}</div>
          <ul class="control-sidebar-menu cs-menu">
            <li v-if="is_mango()">
              <a :href="baseUrl + 'page/customerdata/'" target="_blank">
                <span class="cs-icon bg-teal"><i class="fas fa-users"></i></span>
                <div class="menu-info">
                  <h4 class="control-sidebar-subheading">{{ ui.csm_layout_customer_data }}</h4>
                </div>
              </a>
            </li>
            <li v-if="is_mango()">
              <a :href="baseUrl + 'page/scheduleupdatesoftware/'" target="_blank">
                <span class="cs-icon bg-orange"><i class="fas fa-clock"></i></span>
                <div class="menu-info">
                  <h4 class="control-sidebar-subheading">{{ ui.csm_layout_schedule_update }}</h4>
                </div>
              </a>
            </li>
            <li v-if="is_mango() && isDeveloper()">
              <a :href="baseUrl + 'page/master/'" target="_blank">
                <span class="cs-icon bg-navy"><i class="fas fa-folder"></i></span>
                <div class="menu-info">
                  <h4 class="control-sidebar-subheading">{{ ui.master_data }}</h4>
                </div>
              </a>
            </li>
           <li v-if="is_mango() && isDeveloper()">
              <a :href="baseUrl + 'page/modules/'" target="_blank">
                <span class="cs-icon bg-navy"><i class="fas fa-file-contract"></i></span>
                <div class="menu-info">
                  <h4 class="control-sidebar-subheading">{{ ui.csm_layout_module_data }}</h4>
                </div>
              </a>
            </li>
            <li>
              <a href="#" @click.prevent="$refs.logout.openModal()">
                <span class="cs-icon bg-red"><i class="fa fa-sign-out-alt"></i></span>
                <div class="menu-info">
                  <h4 class="control-sidebar-subheading">{{ ui.log_out }}</h4>
                </div>
              </a>
            </li>
          </ul>
        </div>

        <!-- Tab: Notifications       ปิดก่อน -->
        <!-- <div class="tab-pane" id="control-sidebar-settings-tab">
          <div class="cs-section-label">{{ ui.notification }}</div>
        </div> -->

        <!-- Tab: Settings -->
        <div class="tab-pane" id="control-sidebar-settings-tab-2">
          <div class="cs-section-label">{{ ui.user_setting }}</div>
          <ul class="control-sidebar-menu cs-menu">
            <!-- <li>
              <a href="javascript:void(0)">
                <span class="cs-icon bg-yellow"><i class="fa fa-key"></i></span>
                <div class="menu-info">
                  <h4 class="control-sidebar-subheading">{{ ui.change_password }}</h4>
                </div>
              </a>
            </li> -->
            <li>
              <a href="#" @click.prevent="changeLanguage()">
                <span class="cs-icon bg-aqua"><i class="fa fa-globe"></i></span>
                <div class="menu-info">
                  <h4 class="control-sidebar-subheading">{{ ui.select_language }}</h4>
                </div>
              </a>
            </li>
            <li v-if="auth.userid.toUpperCase() == 'MANGO' || auth.is_admin">
              <a :href="dataServer" target="_blank">
                <span class="cs-icon bg-black"><i class="fas fa-database"></i></span>
                <div class="menu-info">
                  <h4 class="control-sidebar-subheading">{{ ui.csm_layout_database_program }}</h4>
                </div>
              </a>
            </li>
            <li >
              <a href="#" @click.prevent="toggleDarkMode">
                <span class="cs-icon" v-bind:class="isDarkMode ? 'bg-navy' : 'bg-black'">
                  <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
                </span>
                <div class="menu-info">
                  <h4 class="control-sidebar-subheading">{{ ui.csm_layout_dark_mode }}</h4>
                  <p>{{ isDarkMode ? 'On' : 'Off' }}</p>
                </div>
              </a>
            </li>
          </ul>

          <div class="cs-build-info">
            <div class="cs-build-row">
              <span class="cs-build-label">{{ ui.csm_layout_app_build }}</span>
              <span class="cs-build-value">{{ viewVersion }}</span>
            </div>
            <div class="cs-build-row">
              <span class="cs-build-label">{{ ui.csm_layout_api_build }}</span>
              <span class="cs-build-value">{{ appinfo.build_version }}</span>
            </div>
            <div class="cs-build-row">
              <span class="cs-build-label">{{ ui.csm_layout_users_online }}</span>
              <span class="cs-build-value">{{ onlineUser.current }} / {{ onlineUser.max }}</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
    <div class="control-sidebar-bg"></div>

    <loading-box ref="myLB"></loading-box>
    <logout ref="logout"></logout>
    <change-lang ref="changeLang"></change-lang>

    <!-- Modal : Pop-up Call Center -->
    <modal ref="phoneModal">
      <template slot="header">
        <h3 class="text-center"><i class="fa fa-bell shake text-danger"></i> {{ ui.csm_layout_incoming_call }}</h3>
      </template>
      <template slot="body">
        <div class="row">
          <div class="col-lg-12 col-md-12 col-sm-12">
            <div class="text-center">
              <h2><i class="ion ion-android-phone-portrait"></i> {{ ui.erp_tel }} : <span v-text="viewPhone"></span></h2>
              <h3 v-if="xt.isEmpty(viewData.customer_name)">{{ ui.csm_layout_no_customer_by_phone }}</h3>
              <template v-if="!xt.isEmpty(viewData.customer_name)">
                <h3 v-text="viewData.customer_name"></h3>
                <h5>{{ ui.csm_v2_project }} : [{{ viewData.pre_event }}] {{ viewData.pre_des }}</h5>
                <h5 v-text="viewData.address"></h5>
              </template>
            </div>
          </div>
        </div>
      </template>
      <template slot="footer">
        <div class="pull-left">
          <button class="btn btn-sm bg-olive" v-if="xt.isEmpty(viewData.customer) && !is_mango()"
                  @click="newCusByRing()">
            <i class="fas fa-user-plus"></i> {{ ui.erp_new_cust }}
          </button>
        </div>

        <button class="btn btn-sm bg-navy" @click="popupDocument()"><i class="fas fa-edit"></i> {{ ui.erp_create_document }}</button>
      </template>
    </modal>
    <!-- Modal Customer -->
    <modal ref="addCustomerModal">
      <template slot="header">
        <h4><i class="fa fa-edit"></i> {{ ui.erp_new_cust }}</h4>
      </template>
      <template slot="body">
        <!-- Callout -->
        <div class="row">
          <div class="col-lg-12 col-md-12 col-sm-12">
            <div class="callout callout-info">
              <h4>{{ ui.erp_option_3 }}</h4>
              <p>
                {{ ui.csm_layout_note_master_customer }} <a href="#" @click.prevent="openMasCustomer()">Master Customer</a> {{ ui.csm_layout_note_suffix }}
              </p>
            </div>
          </div>
        </div>
        <!-- First Name , Last Name , Nickname -->
        <div class="row">
          <div class="col-lg-4 col-md-4 col-sm-4">
            <div class="form-group">
              <label class="text-danger">{{ ui.csm_layout_firstname }}</label>
              <input type="text" class="form-control" v-model="customerData['first_name']" />
            </div>
          </div>
          <div class="col-lg-4 col-md-4 col-sm-4">
            <div class="form-group">
              <label class="text-danger">{{ ui.csm_layout_lastname }}</label>
              <input type="text" class="form-control" v-model="customerData['last_name']" />
            </div>
          </div>
          <div class="col-lg-4 col-md-4 col-sm-4">
            <div class="form-group">
              <label>{{ ui.csm_layout_nickname }}</label>
              <input type="text" class="form-control" v-model="customerData['nickname']" />
            </div>
          </div>
        </div>
        <!-- Tel , Email -->
        <div class="row">
          <div class="col-lg-6 col-md-6 col-sm-6">
            <div class="form-group">
              <label><i class="ion ion-ios-telephone"></i> {{ ui.erp_tel }}</label><span class="pull-right">
                {{ ui.csm_layout_tel_example }}
              </span>
              <input type="text" class="form-control" v-model="customerData['tel']" />
            </div>
          </div>
          <div class="col-lg-6 col-md-6 col-sm-6">
            <div class="form-group">
              <label><i class="ion ion-email"></i> {{ ui.csm_v2_email }}</label><span class="pull-right">
                {{ ui.csm_layout_email_example }}
              </span>
              <input type="text" class="form-control" v-model="customerData['mail']" />
            </div>
          </div>
        </div>
        <!-- Create CSM by Customer -->
        <div class="row">
          <div class="col-lg-12 col-md-12 col-sm-12">
            <b>{{ ui.csm_layout_customer_code_hint }} </b><a href="#" @click.prevent="openReqbyCustomer()">{{ customerRef.customer_code }}</a>
          </div>
        </div>
      </template>
      <template slot="footer">
        <button class="btn btn-sm btn-success" @click="createCustomer()"><i class="fa fa-save"></i> {{ ui.csm_v2_save }}</button>
      </template>
    </modal>

    <div class="phone" v-show="auth.extension">
      <a href="#" @click.prevent="$refs.phoneModal.openModal()">
        <div class="quick-alo-ph-circle"></div>
        <div class="quick-alo-ph-circle-fill"></div>
        <div class="quick-alo-ph-img-circle"></div>
      </a>
    </div>

    <!-- Sidenav : nav-content slot -->
    <transition name="re-snav-fade">
      <div v-if="showNavContent"
           @click.self="closeNav()"
           class="re-snav-backdrop"></div>
    </transition>
    <transition name="re-snav-slide">
      <div v-if="showNavContent" class="re-snav-panel">
        <div class="re-snav-header">
          <span class="re-snav-title">{{ ui.csm_layout_more_menu }}</span>
          <button @click="closeNav()" class="re-snav-close"><i class="fa fa-times"></i></button>
        </div>
        <div class="re-snav-divider"></div>
        <div class="re-snav-body">
          <slot name="nav-content"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import loadingBox from '../Center/loading-box.vue'
  import logout from '../Center/logout.vue'
  import changeLang from '../Center/change-language.vue'
  import sideMenu from './menu.vue'
  import { BroadcastChannel, createLeaderElection } from 'broadcast-channel'

  // SignalR instance และ session interval (module-level เพื่อไม่ให้ reactive)
  let xR = {}
  let docheck = null

  const channel = new BroadcastChannel('csm_channel')
  const elector = createLeaderElection(channel)

  // รายชื่อ empno ที่มีสิทธิ์ Admin / SuperAdmin
  const ADMIN_LIST = [983, 211, 154, 172, 202, 253, 324, 310, 223, 510, 384, 514, 495]
  const SUPER_ADMIN_LIST = [983, 211, 253, 324, 310, 223, 207, 121, 259, 510, 356, 357, 358, 476]

  export default {
    components: { loadingBox, logout, changeLang, sideMenu },

    data() {
      return {
        year: moment().year(),
        pageTitle: '',
        auth: window.auth,
        ui: window.ui,
        appinfo: window.appinfo,
        dataServer: window.dataServer,
        onlineUser: {
          current: 0,
          max: 0,
          is_authen: false,
          right_s3: false
        },
        viewVersion: window.viewVersion,
        viewStatus: '',
        viewNotiDueDate: [],
        NotiNewMsg: [],
        viewData: {},
        viewPhone: '',
        stateData: [],
        xt: $xt,
        baseUrl,
        customerData: {},
        customerRef: {},
        empsign: {},
        totalCSMLine: 0,
        isDarkMode: false,
        selectedMaincode: (window.auth || {}).maincode || '',
        companyList: [],
        isLoadingCompany: false,
        isLeader: false,
        showNavContent: false,
        lastActivityTime: Date.now(),
        presenceStatus: 'online',
        IDLE_THRESHOLD: 300, // 5 นาที (วินาที)
        AWAY_THRESHOLD: 900, // 15 นาที (วินาที)
        heartbeatIntervalId: null,
      }
    },

    computed: {
      configData() { return store.state.configData },
    },

    // โหลด store ทุกตัวพร้อมกันก่อน component render
    async created() {
      await Promise.all([
        this.$store.dispatch('findConnection'),
        this.$store.dispatch('findRequest'),
        this.$store.dispatch('findPriority'),
        this.$store.dispatch('findService'),
        this.$store.dispatch('findServiceBug'),
        this.$store.dispatch('findConfig'),
        this.$store.dispatch('findCodeConfig'),
        this.$store.dispatch('findCompany'),
      ])
    },

    async mounted() {
      // ตั้งค่า Dark Mode จาก localStorage
      if (localStorage.getItem('mango_dark_mode') === '1') {
        this.isDarkMode = true
        document.body.classList.add('dark-mode')
      }

      // รับ broadcast จาก tab อื่น
      channel.onmessage = async (msg) => {
        try {
          const data = this.parseBroadcastMessage(msg)
          if (data) await this.handleBroadcastAction(data)
        } catch (e) {
          console.warn('Invalid broadcast message:', e)
        }
      }

const activityHandler = () => {
    this.lastActivityTime = Date.now();
  };
  document.addEventListener('mousemove', activityHandler);
  document.addEventListener('keydown', activityHandler);


      this.initSignalR()
      this.loadCompanyByUserID()
      this.loadingBox = this.$refs.myLB
      this.$refs.phoneModal.setSize('modal-lg')
      this.$refs.addCustomerModal.setSize('modal-lg')

      // คืนค่า viewStatus จาก localStorage
      this.viewStatus = localStorage.getItem('viewStatus') || ''

      // โหลด notification และ CSM line พร้อมกัน
      this.loadNotiDueDate()
      this.loadNotiNewMsg()
      this.loadCSM_Line()

      elector.awaitLeadership().then(() => {
        console.log('This tab is now leader.');
        this.isLeader = true;
        this.startLeaderTasks();
      });

      if (!$xt.isEmpty(this.auth.extension)) {
        this.loadState()
      }

      this.$nextTick(() => $(window).trigger('resize'))
    },

    methods: {
      // ─── UI ──────────────────────────────────────────────────────────────────
            changeLanguage() {
              this.$refs.changeLang.openModal()
            },
            // ─── SignalR ──────────────────────────────────────────────────────────────
            initSignalR() {
              const cfn = {
                 sessionResult: (resp) => {
                  this.onlineUser = {
                    current: resp.count,
                    max: resp.max,
                    is_authen: resp.is_authen
                  }
                },
                popUp: (resp, phone) => {
                  this.viewData = JSON.parse(resp) || {}
                  this.viewPhone = phone
                  this.$refs.phoneModal.openModal()
                },
                notifyCSM: (msg, status) => {
                  const map = { W: 'warning', R: 'error', S: 'success' }
                  const fn = map[status] || 'info'
                  $notify[fn](msg)
                },
                reloadCallHistory: () => { try { this.$parent.loadHistoryService() } catch (e) { } },
                reloadCallCenter: () => { try { this.$parent.loadCustomerService() } catch (e) { } },
                reloadTransaction: () => { try { this.$parent.loadTotal(); this.$parent.loadData() } catch (e) { } },
                AiChatChunk: (data) => { this.$root.$emit('AiChatChunk', data) },
                AiChatDone: (data) => { this.$root.$emit('AiChatDone', data) },
                AiChatError: (data) => { this.$root.$emit('AiChatError', data) },
              }

              xR = window.signalR(cfn, () => {
                const token = localStorage.getItem('mango_auth') || ''
                xR.reHub.server.joinUserChannel(token)
                if (xR.hubProxy?.isConnectionOwner()) {
                  if (docheck) clearInterval(docheck)
                  const checkSession = () => xR.reHub.server.userOnlineCheck(token)
                  checkSession()
                  docheck = setInterval(checkSession, 60000)
                }
              })
            },
            // ─── Data Loaders ─────────────────────────────────────────────────────────
            async loadNotiDueDate() {
              const rsp = await $xt.getServer('CSM/Data/NotificationDocument')
              this.viewNotiDueDate = rsp.data
            },
            async loadNotiNewMsg() {
              const rsp = await $xt.getServer('CSM/Data/NotificationNewMessages')
              this.NotiNewMsg = rsp.data
            },
            async loadState() {
              const rsp = await $xt.getServer('csm/config/State_ReadList')
              this.stateData = rsp.data.data_rows.filter(x => !['11', '12'].includes(x.state_code))
            },
            async setState() {
              const rsp = await $xt.getServer(`CSM/Data/ChangeState?state_code=${this.viewStatus}`)
              if (rsp.success) {
                localStorage.setItem('viewStatus', rsp.data)
              } else {
                $msg.alert(this.ui.erp_error, rsp.error, 'danger')
              }
            },
            async loadEmpSign() {
              const rsp = await $xt.getServer('CSM/Center/GetEmpSign')
              this.empsign = rsp.data
            },
            async loadCSM_Line() {
              const rsp = await $xt.getServer('CSM/Data/CSM_Line_ReadListX_Count?status=N')
              this.totalCSMLine = rsp.total
            },
            // ─── Document Popup ───────────────────────────────────────────────────────
            popupDocument() {
              if (!Object.keys(this.viewData).length) {
                this.viewData.phone = this.viewPhone
              }
              localStorage.setItem('Customer-Popup-CSM', JSON.stringify(this.viewData))
              window.open(`${this.baseUrl}page/Transaction/v_csm_trn_001/`, '_blank')
            },
            // ─── Customer Methods ─────────────────────────────────────────────────────
            openCustomer() {
              this.$refs.addCustomerModal.openModal()
              this.customerData = {}
              this.customerRef = {}
            },
            async createCustomer() {
              try {
                if ($xt.isEmpty(this.customerData.first_name) || $xt.isEmpty(this.customerData.last_name)) {
                  $notify.warning(this.ui.csm_layout_req_name)
                  return
                }
                const rsp = await $xt.postServerJson('csm/data/CreateCustomer', { header: this.customerData })
                if (!rsp.success) throw rsp.error
                this.customerRef = rsp.data
                $notify.success(this.ui.alert_save_success)
              } catch (ex) {
                $msg.alert('', ex.toString(), 'danger')
              }
            },
            openReqbyCustomer() {
              localStorage.setItem('X-Customer-CSM', JSON.stringify(this.customerRef))
              window.open(`${this.baseUrl}page/Transaction/v_csm_trn_001/`, '_blank')
            },
            openMasCustomer() {
              localStorage.setItem('X-Master-Customer', JSON.stringify(this.customerRef))
              window.open(`${this.baseUrl}page/Customer/v_csm_cus_001/`, '_blank')
            },
            newCusByRing() {
              this.$refs.phoneModal.closeModal()
              this.$refs.addCustomerModal.openModal()
              this.customerData.tel = this.viewPhone
            },
            // ─── Permission Checks ────────────────────────────────────────────────────
            /** ตรวจสอบว่าเป็น Mango company หรือไม่ */
            is_mango() {
              const cfg = this.configData.find(x => x.config_id === 'TRN0001')
              return cfg?.config_value === 'Y'
            },
            /** ตรวจสอบว่าเป็น IT Developer */
            isDeveloper() {
              return auth.empcode.substring(0, 2) === 'IT'
            },
            /** ตรวจสอบว่าเป็น Admin ของ Mango */
            isAdminMG() {
              return auth.empcode.substring(0, 7) === 'ADMINMG'
            },
            /** ตรวจสอบสิทธิ์ Admin */
            isAdmin() {
              return ADMIN_LIST.includes(this.auth.empno)
            },
            /** ตรวจสอบสิทธิ์ Super Admin */
            isSuperAdmin() {
              return SUPER_ADMIN_LIST.includes(this.auth.empno)
            },
            /** ตรวจสอบว่ามีสิทธิ์ Approve */
            isApprove() {
              return this.empsign.some(x => x.empcode === auth.empcode)
            },
            // ─── Dark Mode ────────────────────────────────────────────────────────────
            toggleDarkMode() {
              this.isDarkMode = !this.isDarkMode
              document.body.classList.toggle('dark-mode', this.isDarkMode)
              if (this.isDarkMode) localStorage.setItem('mango_dark_mode', '1')
              else localStorage.removeItem('mango_dark_mode')
              this.sendBroadcast('dark_mode', { enabled: this.isDarkMode })
            },
            // ─── Broadcast ────────────────────────────────────────────────────────────
            sendBroadcast(action, data = null) {
              try {
                channel.postMessage(JSON.stringify({ action, data, timestamp: Date.now() }))
              } catch (e) {
                console.error('Broadcast failed:', e)
              }
            },
            parseBroadcastMessage(msg) {
              try {
                return typeof msg === 'string' ? JSON.parse(msg) : msg
              } catch (e) {
                return null
              }
            },
            async handleBroadcastAction({ action, data }) {
              if (action === 'dark_mode') {
                const enabled = data?.enabled ?? false
                this.isDarkMode = enabled
                document.body.classList.toggle('dark-mode', enabled)
                if (enabled) localStorage.setItem('mango_dark_mode', '1')
                else localStorage.removeItem('mango_dark_mode')
              }
            },
          async loadCompanyByUserID() {
          try {
            this.isLoadingCompany = true
            let resp = await $xt.getServer(`api/public/LoginCompaniesByUserID?userid=${encodeURIComponent(this.auth.userid)}`)
            if (!resp.success) throw resp.error
            let list = $linq(resp.data).select(x => ({ id: x.maincode, text: x.mainname })).toArray()
            this.companyList = list
            this.selectedMaincode = this.auth.maincode
          } catch (ex) {
            $msg.alert(this.ui.csm_v2_warning, ex, 'warning')
          } finally {
            this.isLoadingCompany = false
          }
        },
      async changeCompany() {
        if (!this.selectedMaincode) {
          $msg.alert(this.ui.erp_error, this.ui.csm_layout_req_company, 'warning')
          return
        }
        if (this.selectedMaincode === this.auth.maincode) {
          $msg.alert(this.ui.erp_info, this.ui.csm_layout_already_in_company, 'info')
          return
        }
        try {
          this.isLoadingCompany = true
          const payload = {
            maincode: this.selectedMaincode,
            session_id: this.auth.session_id
          }
          const resp = await $xt.postServerJson('API/UserOnline/UserChangeCompany', payload)
          if (!resp.success) throw resp.error
          localStorage.setItem('mango_auth', resp.token)
          this.sendBroadcast('reload')
          window.location.reload()
        }
        catch (ex) {
          $msg.alert(this.ui.erp_error, ex, 'danger')
        }
        finally {
          this.isLoadingCompany = false
        }
      },
    async checkUserOnline() {
        if (!window.navigator.onLine) {
          $notify.error(this.ui.csm_layout_no_connection)
          return
        }

        try {
          const payload = {
            maincode: this.auth.maincode,
            session_id: this.auth.session_id
          }
          const resp = await $xt.postServerJson('API/UserOnline/UserAuthentication', payload)

          this.onlineUser = {
            current: resp.useronline.count,
            max: resp.useronline.max,
            right_s3: resp.right_log_s3
          }
          this.expire_user = {
            check_expire: resp.check_expire,
            start_expire: moment(resp.expire_dt, 'YYYY-MM-DD').add(-3, 'days'),
            end_expire: moment(resp.expire_dt, 'YYYY-MM-DD')
          }

          if (!resp.auth_status) await this.messageLogout()
        } catch (ex) {
          await $msg.alert(this.ui.csm_v2_warning, this.ui.csm_layout_session_expired, 'warning')
          await this.messageLogout()
        }
      },
      updatePresenceStatus() {
    const idle = Math.floor((Date.now() - this.lastActivityTime) / 1000)
    if (idle >= this.AWAY_THRESHOLD) this.presenceStatus = 'away'
    else if (idle >= this.IDLE_THRESHOLD) this.presenceStatus = 'idle'
    else this.presenceStatus = 'online'
  },
  // ฟังก์ชันหลักที่ Leader จะใช้ยิง API
  async checkUserOnline2() {
    if (!window.navigator.onLine) return;
    try {
      this.updatePresenceStatus();
      const idleSeconds = Math.floor((Date.now() - this.lastActivityTime) / 1000);
      
      const resp = await $xt.postServerJson('API/UserOnline/UserAuthentication', {
        maincode: this.auth.maincode,
        session_id: this.auth.session_id,
        idle_seconds: idleSeconds,
        presence_status: this.presenceStatus
      });

      const sessionData = {
        onlineUser: {
          current: resp.useronline.count,
          max: resp.useronline.max,
        },
        presenceStatus: this.presenceStatus
      };

      this.onlineUser = sessionData.onlineUser;
      this.sendBroadcast('update', sessionData); // ส่งบอก Tab อื่นๆ

      if (!resp.auth_status) {
        this.sendBroadcast('logout');
        window.location.reload();
      }
    } catch (ex) { console.error(ex); }
  },
  // ฟังก์ชันเริ่มงานของ Leader
  async startLeaderTasks() {
    while (this.isLeader) {
      await this.checkUserOnline2();
      await $xt.sleep(20000); // เช็คทุก 20 วินาที
    }
  },
  // ปรับปรุง handleBroadcastAction ให้รองรับการ update ข้อมูล
  async handleBroadcastAction({ action, data }) {
    if (action === 'update') {
      if (data.onlineUser) this.onlineUser = data.onlineUser;
      if (data.presenceStatus) this.presenceStatus = data.presenceStatus;
    }
    if (action === 'logout') window.location.reload();
    // ... dark_mode logic เดิม ...
  },
  openNav() { this.showNavContent = true },
  closeNav() { this.showNavContent = false },

    },
  }
</script>

<style scoped>
  .content-body {
    overflow-x: hidden;
    height: calc(100vh - 100px);
    overflow-y: auto;
  }

  .main-footer {
    position: fixed !important;
    bottom: 0; left: 0; right: 0;
    z-index: 820;
  }

  /* ── Control Sidebar Tabs ── */
  .cs-tabs {
    display: flex !important;
    border-bottom: 1px solid rgba(255,255,255,0.1) !important;
    background: transparent !important;
    margin: 0 !important;
  }
  .cs-tabs > li {
    flex: 1;
    background: transparent !important;
  }
  .cs-tabs > li > a {
    display: flex !important;
    align-items: center;
    justify-content: center;
    height: 44px;
    color: rgba(255,255,255,0.35) !important;
    border: none !important;
    border-bottom: 3px solid transparent !important;
    border-radius: 0 !important;
    background: transparent !important;
    transition: color 0.2s, border-color 0.2s;
    font-size: 15px;
    margin: 0 !important;
    padding: 0 !important;
  }
  .cs-tabs > li > a:hover {
    color: rgba(255,255,255,0.7) !important;
    background: rgba(255,255,255,0.04) !important;
    border-bottom-color: rgba(255,255,255,0.2) !important;
  }
  .cs-tabs > li.active > a,
  .cs-tabs > li.active > a:focus,
  .cs-tabs > li.active > a:hover {
    color: #fff !important;
    background: rgba(255,255,255,0.06) !important;
    border-bottom: 3px solid #3c8dbc !important;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
  }

  /* ── Control Sidebar: User Card ── */
  .cs-user-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 12px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .cs-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    border: 2px solid rgba(255,255,255,0.2);
  }
  .cs-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .cs-user-info { flex: 1; min-width: 0; }
  .cs-user-name {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    line-height: 1.3;
    white-space: normal;
    word-break: break-word;
  }
  .cs-user-status {
    font-size: 11px;
    color: rgba(255,255,255,0.55);
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
  }
  .cs-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #2ecc71;
    display: inline-block;
    box-shadow: 0 0 4px #2ecc71;
    flex-shrink: 0;
  }

  /* ── Section Label ── */
  .cs-section-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.35);
    padding: 10px 12px 5px;
  }

  /* ── Menu Items ── */
  .cs-menu { padding: 0 4px; margin: 0; list-style: none; }
  .cs-menu > li > a {
    display: flex !important;
    align-items: center;
    gap: 10px;
    padding: 6px 8px !important;
    border-radius: 7px;
    margin-bottom: 1px;
    transition: background 0.15s;
    text-decoration: none;
  }
  .cs-menu > li > a:hover { background: rgba(255,255,255,0.08) !important; }
  .cs-menu .menu-info { flex: 1; min-width: 0; margin-left: 0 !important; }
  .cs-menu .menu-info h4 {
    font-size: 12.5px;
    font-weight: 500;
    color: rgba(255,255,255,0.85);
    margin: 0;
    white-space: normal;
    word-break: break-word;
    line-height: 1.3;
  }
  .cs-menu .menu-info p {
    font-size: 11px;
    color: rgba(255,255,255,0.45);
    margin: 0;
  }

  /* ── Icon pill ── */
  .cs-icon {
    width: 30px; height: 30px;
    border-radius: 7px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
    color: #fff;
  }

  /* ── Build Info ── */
  .cs-build-info {
    margin: 8px 8px 0;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
    padding: 7px 10px;
  }
  .cs-build-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .cs-build-row:last-child { border-bottom: none; }
  .cs-build-label {
    font-size: 10px;
    color: rgba(255,255,255,0.4);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .cs-build-value {
    font-size: 11px;
    color: rgba(255,255,255,0.75);
    font-weight: 500;
  }

  .quick-alo-phone .quick-alo-show {
    visibility: visible;
  }

  .quick-alo-phone {
    position: fixed;
    visibility: hidden;
    background-color: transparent;
    height: 200px;
    width: 82px;
    height: 64px;
    right: 150px;
    top: 60%;
    cursor: pointer;
    z-index: 200000 !important;
    -webkit-backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transition: visibility .5s;
  }

    .quick-alo-phone .quick-alo-green .quick-alo-ph-circle {
      border-color: #00A1FF;
      opacity: 0.5;
    }

  .quick-alo-ph-circle {
    position: fixed;
    width: 160px;
    height: 160px;
    bottom: -30px;
    right: -20px;
    border: 2px solid #00A1FF;
    background-color: transparent;
    border-radius: 100%;
    opacity: .1;
    animation: quick-alo-circle-anim 1.2s infinite ease-in-out;
    transition: all .5s;
    transform-origin: 50% 50%;
  }

  .quick-alo-phone .quick-alo-green .quick-alo-ph-circle-fill {
    background-color: rgb(246, 202, 98);
    opacity: .75 !important;
  }

  .quick-alo-ph-circle-fill {
    position: fixed;
    width: 100px;
    height: 100px;
    bottom: 1px;
    right: 10px;
    background-color: rgba(0, 161, 255, 0.5);
    border-radius: 100%;
    border: 2px solid transparent;
    opacity: .1;
    animation: quick-alo-circle-fill-anim 2.3s infinite ease-in-out;
    transition: all .5s;
    transform-origin: 50% 50%;
  }

  .quick-alo-phone.quick-alo-green .quick-alo-ph-img-circle {
    background-color: #00A1FF;
  }

  .quick-alo-ph-img-circle {
    position: fixed;
    width: 60px;
    height: 60px;
    bottom: 20px;
    right: 30px;
    background: #00A1FF url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABrklEQVRYR82XjTEEQRCFX0dABlwEiAARkAEyIAJEoERACETARUAIJwIyeOqptfbm5qeP3lpTdVVXVzPd3/R0v+4zTLxsYv/4XwAkrwDsV6JyZmaLyKj1ESB5AOCpYfzazAQZttYFuDWz8zDvwE8OkNwF8NIwvjCz2SgAMkqSDuOzyDxYqgKSrwB2GhBKxHsHqGtLCiDDJ42Tj2Z27LLu2JQCnAK4a5x7M7Nth23XlhRgE8B74+SemempQtaKEpKsPUPo++sGOYCSIIU7zwJ05ficSLLkV6H/CIn7wEi2GRVkOVwFixEoREE/hz9DsR2TVKkp2zeSsI9bBUNnJNV4bhIA5cFhVCk2B5JCWVYhSEopjwAob6qa4QGQOKkqcj1iJSdIpmoqWEHIhr7Ph1BNgC4haxAPAC7UITPOc1UrCOXR12TlAnBAyKhAdHvPUg4pIn6AAYQc1ebG8QC+LXfD66XHU2HP7yKQlKhGODWu1gCTY/g7wCAaendNyltrRCQOIAERjCc/ejV1V4H3dp2ES4jU1vVJpXxpogoHSEE7oOEIp9G+/3c1OkArcpMDfAIqL6EhVS6JOAAAAABJRU5ErkJggg==") no-repeat center center;
    border-radius: 100%;
    border: 2px solid transparent;
    opacity: .99;
    animation: quick-alo-circle-img-anim 1s infinite ease-in-out;
    transform-origin: 50% 50%;
  }

  .quick-alo-phone .quick-alo-green .quick-alo-hover .quick-alo-ph-img-circle,
  .quick-alo-phone.quick-alo-green:hover .quick-alo-ph-img-circle {
    background-color: #ff0101;
  }

  @-moz-keyframes quick-alo-circle-anim {
    0% {
      -moz-transform: rotate(0) scale(.5) skew(1deg);
      opacity: .1;
      -moz-opacity: .1;
      -webkit-opacity: .1;
      -o-opacity: .1
    }

    30% {
      -moz-transform: rotate(0) scale(.7) skew(1deg);
      opacity: .5;
      -moz-opacity: .5;
      -webkit-opacity: .5;
      -o-opacity: .5
    }

    100% {
      -moz-transform: rotate(0) scale(1) skew(1deg);
      opacity: .6;
      -moz-opacity: .6;
      -webkit-opacity: .6;
      -o-opacity: .1
    }
  }

  @-webkit-keyframes quick-alo-circle-anim {
    0% {
      -webkit-transform: rotate(0) scale(.5) skew(1deg);
      -webkit-opacity: .1
    }

    30% {
      -webkit-transform: rotate(0) scale(.7) skew(1deg);
      -webkit-opacity: .5
    }

    100% {
      -webkit-transform: rotate(0) scale(1) skew(1deg);
      -webkit-opacity: .1
    }
  }

  @-o-keyframes quick-alo-circle-anim {
    0% {
      -o-transform: rotate(0) kscale(.5) skew(1deg);
      -o-opacity: .1
    }

    30% {
      -o-transform: rotate(0) scale(.7) skew(1deg);
      -o-opacity: .5
    }

    100% {
      -o-transform: rotate(0) scale(1) skew(1deg);
      -o-opacity: .1
    }
  }

  @-moz-keyframes quick-alo-circle-fill-anim {
    0% {
      -moz-transform: rotate(0) scale(.7) skew(1deg);
      opacity: .2
    }

    50% {
      -moz-transform: rotate(0) -moz-scale(1) skew(1deg);
      opacity: .2
    }

    100% {
      -moz-transform: rotate(0) scale(.7) skew(1deg);
      opacity: .2
    }
  }

  @-webkit-keyframes quick-alo-circle-fill-anim {
    0% {
      -webkit-transform: rotate(0) scale(.7) skew(1deg);
      opacity: .2
    }

    50% {
      -webkit-transform: rotate(0) scale(1) skew(1deg);
      opacity: .2
    }

    100% {
      -webkit-transform: rotate(0) scale(.7) skew(1deg);
      opacity: .2
    }
  }

  @-o-keyframes quick-alo-circle-fill-anim {
    0% {
      -o-transform: rotate(0) scale(.7) skew(1deg);
      opacity: .2
    }

    50% {
      -o-transform: rotate(0) scale(1) skew(1deg);
      opacity: .2
    }

    100% {
      -o-transform: rotate(0) scale(.7) skew(1deg);
      opacity: .2
    }
  }

  @-moz-keyframes quick-alo-circle-img-anim {
    0% {
      transform: rotate(0) scale(1) skew(1deg)
    }

    10% {
      -moz-transform: rotate(-25deg) scale(1) skew(1deg)
    }

    20% {
      -moz-transform: rotate(25deg) scale(1) skew(1deg)
    }

    30% {
      -moz-transform: rotate(-25deg) scale(1) skew(1deg)
    }

    40% {
      -moz-transform: rotate(25deg) scale(1) skew(1deg)
    }

    50% {
      -moz-transform: rotate(0) scale(1) skew(1deg)
    }

    100% {
      -moz-transform: rotate(0) scale(1) skew(1deg)
    }
  }

  @-webkit-keyframes quick-alo-circle-img-anim {
    0% {
      -webkit-transform: rotate(0) scale(1) skew(1deg)
    }

    10% {
      -webkit-transform: rotate(-25deg) scale(1) skew(1deg)
    }

    20% {
      -webkit-transform: rotate(25deg) scale(1) skew(1deg)
    }

    30% {
      -webkit-transform: rotate(-25deg) scale(1) skew(1deg)
    }

    40% {
      -webkit-transform: rotate(25deg) scale(1) skew(1deg)
    }

    50% {
      -webkit-transform: rotate(0) scale(1) skew(1deg)
    }

    100% {
      -webkit-transform: rotate(0) scale(1) skew(1deg)
    }
  }

  @-o-keyframes quick-alo-circle-img-anim {
    0% {
      -o-transform: rotate(0) scale(1) skew(1deg)
    }

    10% {
      -o-transform: rotate(-25deg) scale(1) skew(1deg)
    }

    20% {
      -o-transform: rotate(25deg) scale(1) skew(1deg)
    }

    30% {
      -o-transform: rotate(-25deg) scale(1) skew(1deg)
    }

    40% {
      -o-transform: rotate(25deg) scale(1) skew(1deg)
    }

    50% {
      -o-transform: rotate(0) scale(1) skew(1deg)
    }

    100% {
      -o-transform: rotate(0) scale(1) skew(1deg)
    }
  }

  @-moz-keyframes fadeInRight {
    0% {
      opacity: 0;
      -webkit-transform: translate3d(100%, 0, 0);
      -ms-transform: translate3d(100%, 0, 0);
      transform: translate3d(100%, 0, 0)
    }

    100% {
      opacity: 1;
      -webkit-transform: none;
      -ms-transform: none;
      transform: none
    }
  }

  @-webkit-keyframes fadeInRight {
    0% {
      opacity: 0;
      -webkit-transform: translate3d(100%, 0, 0);
      -ms-transform: translate3d(100%, 0, 0);
      transform: translate3d(100%, 0, 0)
    }

    100% {
      opacity: 1;
      -webkit-transform: none;
      -ms-transform: none;
      transform: none
    }
  }

  @-o-keyframes fadeInRight {
    0% {
      opacity: 0;
      -webkit-transform: translate3d(100%, 0, 0);
      -ms-transform: translate3d(100%, 0, 0);
      transform: translate3d(100%, 0, 0)
    }

    100% {
      opacity: 1;
      -webkit-transform: none;
      -ms-transform: none;
      transform: none
    }
  }

  .shake {
    animation: shake 0.82s cubic-bezier(.36, .07, .19, .97) both infinite;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  @keyframes shake {

    10%, 90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%, 80% {
      transform: translate3d(2px, 0, 0);
    }

    30%, 50%, 70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%, 60% {
      transform: translate3d(4px, 0, 0);
    }
  }
</style>

<!-- Modern Sidebar Styles (unscoped to affect AdminLTE) -->
<style>
  /* ═══════════════════════════════════════════
     Sidebar — Subtle modernization
     Keep AdminLTE layout intact, just style upgrades
  ═══════════════════════════════════════════ */

  .main-sidebar {
    background: #02234e !important;
    border-right: none !important;
  }

  .main-sidebar .sidebar {
    padding-top: 6px;
  }

  /* User Panel */
  .main-sidebar .user-panel {
    border-bottom: 1px solid rgba(255,255,255,0.08) !important;
    padding-bottom: 12px !important;
  }

  .main-sidebar .user-panel .info > p {
    color: #fff !important;
    font-weight: 600;
  }

  .main-sidebar .user-panel .info > a {
    color: #4ade80 !important;
  }

  /* Menu items */
  .sidebar-menu > li > a {
    color: rgba(255,255,255,0.75) !important;
    font-size: 13px !important;
    padding: 10px 16px !important;
    border-left: 3px solid transparent !important;
    transition: all 0.15s ease !important;
  }

  .sidebar-menu > li > a:hover {
    background: rgba(255,255,255,0.05) !important;
    color: #fff !important;
    border-left-color: rgba(59,130,246,0.5) !important;
  }

  .sidebar-menu > li.active > a {
    background: rgba(37,99,235,0.15) !important;
    color: #60a5fa !important;
    border-left-color: #3b82f6 !important;
  }

  .sidebar-mini.sidebar-collapse .sidebar-menu > li > a {
    padding-left: 12px !important;
    padding-right: 0 !important;
  }

  .sidebar-menu > li > a > img {
    opacity: 0.75;
    transition: opacity 0.15s;
  }

  .sidebar-menu > li > a:hover > img,
  .sidebar-menu > li.active > a > img {
    opacity: 1;
  }

  /* Submenu */
  .sidebar-menu .treeview-menu {
    background: rgba(0,0,0,0.2) !important;
    padding: 4px 0 !important;
  }

  .sidebar-menu .treeview-menu > li > a {
    color: rgba(255,255,255,0.6) !important;
    font-size: 12.5px !important;
    padding: 8px 20px 8px 36px !important;
    transition: all 0.15s ease !important;
  }

  .sidebar-menu .treeview-menu > li > a:hover {
    color: #fff !important;
    background: rgba(255,255,255,0.04) !important;
  }

  .sidebar-menu .treeview-menu > li.active > a {
    color: #60a5fa !important;
    background: rgba(37,99,235,0.1) !important;
  }

  .sidebar-menu .treeview-menu > li > a > i {
    font-size: 6px !important;
    color: rgba(255,255,255,0.3);
  }

  .sidebar-menu .treeview-menu > li.active > a > i {
    color: #60a5fa !important;
  }

  /* Scrollbar */
  .sidebar::-webkit-scrollbar { width: 4px; }
  .sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  /* ═══════════ Header ═══════════ */
  .main-header .navbar {
    background: #02234e !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
    border: none !important;
  }

  .main-header .logo {
    background: #02234e !important;
    border: none !important;
  }

  .main-header .logo span {
    color: #fff !important;
  }

  .main-header .sidebar-toggle {
    color: #ffffff !important;
    background: transparent !important;
  }

  .main-header .sidebar-toggle:hover {
    background: rgba(255,255,255,0.1) !important;
    color: #ffffff !important;
  }

  .main-header .navbar-custom-menu > .nav > li > a {
    color: rgba(255,255,255,0.85) !important;
    font-size: 13px !important;
  }

  .main-header .navbar-custom-menu > .nav > li > a:hover {
    background: rgba(255,255,255,0.1) !important;
    color: #fff !important;
  }

  /* Page title in header */
  .main-header .sidebar-toggle ~ .hidden-md,
  .main-header .sidebar-toggle .font-extra,
  .main-header .navbar-static-top .sidebar-toggle span.font-extra {
    color: #ffffff !important;
    font-weight: 600 !important;
  }

  /* ═══════════ Footer ═══════════ */
  .main-footer {
    background: #fff !important;
    border-top: 1px solid #f1f5f9 !important;
    color: #94a3b8 !important;
    font-size: 12px !important;
    padding: 8px 20px !important;
  }

  .footer-left, .footer-right {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .footer-dot {
    width: 3px;
    height: 3px;
    background: #e2e8f0;
    border-radius: 50%;
    display: inline-block;
  }

  /* ═══════════ Content ═══════════ */
  .content-wrapper {
    background: #f8fafc !important;
  }

  /* ═══════════ Sidenav ═══════════ */
  .re-snav-backdrop {
    position: fixed; inset: 0; z-index: 1039; background: rgba(0,0,0,.35);
  }
  .re-snav-panel {
    position: fixed; top: 0; right: 0; bottom: 0; width: 250px; z-index: 1040;
    background: #fff; box-shadow: -4px 0 18px rgba(0,0,0,.15);
    display: flex; flex-direction: column;
  }
  .re-snav-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 12px; border-bottom: 1px solid #e9ecef;
  }
  .re-snav-title { font-size: 13px; font-weight: 700; color: #1e293b; letter-spacing: .02em; }
  .re-snav-close {
    background: none; border: none; cursor: pointer;
    padding: 2px 6px; color: #64748b; font-size: 16px; line-height: 1;
  }
  .re-snav-divider { height: 1px; background: linear-gradient(to right, #e0e0e0, transparent); margin: 0 16px; }
  .re-snav-body { flex: 1; overflow-y: auto; padding: 16px 12px; }

  .re-snav-slide-enter-active,
  .re-snav-slide-leave-active { transition: transform .25s ease; }
  .re-snav-slide-enter, .re-snav-slide-leave-to { transform: translateX(100%); }

  /* ═══════════════════════════════════════════
     Notification bell — due-date dropdown
  ═══════════════════════════════════════════ */
  .rn-noti > .rn-noti__bell { position: relative; }
  .rn-noti > .rn-noti__bell > i { font-size: 15px; }
  .rn-noti__badge {
    position: absolute;
    top: 7px;
    right: 2px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 2px solid #fff;
    background: #E2574C;
    color: #fff;
    font-family: Manrope, Sarabun, sans-serif;
    font-size: 10px;
    font-weight: 800;
    line-height: 1;
    box-shadow: 0 2px 6px rgba(226, 87, 76, .45);
    animation: rnPulse 2.4s ease-out infinite;
  }
  @keyframes rnPulse {
    0%, 100% { box-shadow: 0 2px 6px rgba(226, 87, 76, .45), 0 0 0 0 rgba(226, 87, 76, .45); }
    70% { box-shadow: 0 2px 6px rgba(226, 87, 76, .45), 0 0 0 7px rgba(226, 87, 76, 0); }
  }
  .navbar-nav > .rn-noti > .rn-noti__panel {
    width: 388px !important;
    padding: 0 !important;
    margin: 8px 0 0 !important;
    border: 0 !important;
    border-radius: 16px !important;
    background: #fff !important;
    box-shadow: 0 20px 46px -18px rgba(2, 35, 78, .45), 0 4px 14px rgba(2, 35, 78, .08) !important;
    overflow: hidden;
    font-family: Manrope, Sarabun, sans-serif;
  }
  .rn-noti__head {
    display: flex !important;
    align-items: center;
    gap: 11px;
    height: auto !important;
    padding: 14px 16px !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: linear-gradient(135deg, #B4372C 0%, #E2574C 55%, #F08A5D 100%) !important;
    color: #fff !important;
    font-size: inherit !important;
    white-space: normal !important;
  }
  .rn-noti__head-ico {
    width: 34px; height: 34px;
    flex: 0 0 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 11px;
    background: rgba(255, 255, 255, .16);
    border: 1px solid rgba(255, 255, 255, .22);
    font-size: 14px;
  }
  .rn-noti__head-title {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.45;
    color: #fff;
  }
  .rn-noti__body { padding: 0 !important; }
  .rn-noti__list {
    max-height: 342px;
    overflow-y: auto;
    overscroll-behavior: contain;
    margin: 0;
    padding: 6px;
    list-style: none;
  }
  .rn-noti__list::-webkit-scrollbar { width: 7px; }
  .rn-noti__list::-webkit-scrollbar-thumb { background: #CFD8E6; border-radius: 8px; }
  .rn-noti__list::-webkit-scrollbar-thumb:hover { background: #B9C5D8; }
  .rn-noti__list::-webkit-scrollbar-track { background: transparent; }
  .rn-noti__list > li { border: 0 !important; }
  .rn-noti__list > li > a {
    display: flex !important;
    align-items: flex-start;
    gap: 11px;
    padding: 10px 12px !important;
    border-radius: 12px;
    color: #33415C !important;
    white-space: normal !important;
    text-decoration: none;
    transition: background .14s ease, box-shadow .18s ease;
  }
  .rn-noti__list > li > a:hover,
  .rn-noti__list > li > a:focus {
    background: #F6F9FE !important;
    box-shadow: inset 3px 0 0 #E2574C;
  }
  .rn-noti__ico {
    width: 34px; height: 34px;
    flex: 0 0 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 11px;
    background: #FDECEA;
    color: #D63A2E;
    font-size: 14px;
    transition: background .16s ease, color .16s ease;
  }
  .rn-noti__list > li > a:hover .rn-noti__ico { background: #E2574C; color: #fff; }
  .rn-noti__text { flex: 1; min-width: 0; }
  .rn-noti__no {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #7A8699;
  }
  .rn-noti__no b {
    font-weight: 800;
    color: #0E1B2E;
    letter-spacing: .01em;
  }
  .rn-noti__meta {
    display: block;
    margin-top: 2px;
    font-size: 11.5px;
    font-weight: 500;
    line-height: 1.5;
    color: #7A8699;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rn-noti__meta > i { width: 12px; font-size: 10px; color: #A9B6CA; margin-right: 3px; }
  .rn-noti__due {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 6px;
    padding: 2px 9px;
    border-radius: 999px;
    background: #FDECEA;
    color: #B22A20;
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .rn-noti__due > i { font-size: 10px; }
  .rn-noti__go {
    flex: 0 0 auto;
    margin-top: 11px;
    font-size: 10px;
    color: #C3CCDB;
    transition: transform .18s ease, color .18s ease;
  }
  .rn-noti__list > li > a:hover .rn-noti__go { transform: translateX(3px); color: #E2574C; }
  .rn-noti__empty {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 34px 16px !important;
    color: #7A8699;
    font-size: 12.5px;
    font-weight: 600;
  }
  .rn-noti__empty > i { font-size: 26px; opacity: .45; }
  @media (prefers-reduced-motion: reduce) {
    .rn-noti__badge { animation: none; }
    .rn-noti__list > li > a, .rn-noti__ico, .rn-noti__go { transition: none; }
  }

  .re-snav-fade-enter-active,
  .re-snav-fade-leave-active { transition: opacity .2s ease; }
  .re-snav-fade-enter, .re-snav-fade-leave-to { opacity: 0; }
</style>
