<template>
  <div class="wrapper">
    <header class="main-header">
      <!-- Logo -->
      <a href="#" v-on:click.prevent="" class="logo">
        <!-- mini logo for sidebar mini 50x50 pixels -->
        <span class="logo-mini"><b>CSM</b></span>
        <!-- logo for regular state and mobile devices -->
        <span class="logo-lg">Mango CSM</span>
      </a>
      <!-- Header Navbar: style can be found in header.less -->
      <nav class="navbar navbar-static-top">
        <!-- Sidebar toggle button-->
        <a
          href="#"
          class="sidebar-toggle"
          data-toggle="push-menu"
          role="button"
        >
          <span class="sr-only">Toggle navigation</span>
          <span style="margin-left: 15px">{{ pageTitle }}</span>
        </a>
        <div class="navbar-custom-menu">
          <ul class="nav navbar-nav">
            <li>
              <a href="#" data-toggle="control-sidebar">
                <img
                  :src="`${baseUrl}Content/Images/Icon SVG/man.svg`"
                  width="22"
                />
                <span class="hidden-sm hidden-xs" style="margin-left: 5px">{{
                  (customerAuth.customer_name || "").toUpperCase()
                }}</span>
              </a>
            </li>
          </ul>
        </div>
        <div class="navbar-custom-menu">
          <ul class="nav navbar-nav">
            <li class="hidden-sm hidden-xs">
              <a
                :href="baseUrl + 'page/external/v_mas_update_list/'"
                target="_blank"
                ><i class="fas fa-list"></i> รายการอัพเดทโปรแกรม</a
              >
            </li>
            <li class="dropdown notifications-menu cx-noti">
              <a href="#" class="dropdown-toggle cx-noti__bell" data-toggle="dropdown">
                <i class="fas fa-bell"></i>
                <span class="cx-noti__badge" v-if="viewNotiCust.length">{{
                  viewNotiCust.length || 0
                }}</span>
              </a>
              <ul class="dropdown-menu cx-noti__panel">
                <li class="cx-noti__head">
                  <span class="cx-noti__head-ico"><i class="fas fa-pencil-alt"></i></span>
                  <span class="cx-noti__head-body">
                    <span class="cx-noti__head-title">รายการตรวจรับฟอร์ม</span>
                    <span class="cx-noti__head-sub">เอกสารที่รอการตรวจรับจากคุณ</span>
                  </span>
                  <span class="cx-noti__count">{{ viewNotiCust.length || 0 }}</span>
                </li>
                <li class="cx-noti__body">
                  <ul class="cx-noti__list">
                    <li v-for="(x, idx) in viewNotiCust" :key="idx">
                      <a
                        :href="
                          baseUrl +
                            'page/External/v_mas_form_sign/?customer_code=' +
                            customerAuth.customer_code +
                            '&formcode=' +
                            x.formcode
                        "
                        target="_blank"
                      >
                        <span class="cx-noti__ico"><i class="fas fa-file-signature"></i></span>
                        <span class="cx-noti__text">
                          <span class="cx-noti__no">{{ x.job_no }}</span>
                          <span class="cx-noti__form">ฟอร์ม: {{ x.formname }}</span>
                          <span class="cx-noti__date"><i class="far fa-clock"></i> {{ x.complete_date | date("DD/MM/YYYY HH:mm") }}</span>
                        </span>
                        <i class="fas fa-chevron-right cx-noti__go"></i>
                      </a>
                    </li>
                    <li class="cx-noti__empty" v-if="!viewNotiCust.length">
                      <i class="far fa-bell-slash"></i>
                      <span>ไม่มีรายการรอตรวจรับ</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <!-- Left side column. contains the logo and sidebar -->
    <aside class="main-sidebar">
      <!-- sidebar: style can be found in sidebar.less -->
      <section class="sidebar">
        <ul class="sidebar-menu tree" data-widget="tree">
          <li>
            <a :href="'page/external/v_csm_external/'">
              <img :src="`${baseUrl}Content/Images/Icon SVG/home.svg`"
                   width="22" /><span> หน้าหลัก</span>
            </a>
          </li>
          <li>
            <a :href="'page/external/v_csm_request/'">
              <img :src="`${baseUrl}Content/Images/Icon SVG/document.svg`"
                   width="22" /><span> ข้อเสนอแนะ</span>
            </a>
          </li>
          <li>
            <a :href="'page/external/v_csm_dataview/'">
              <i class="fa fa-server" style="font-size:20px"></i><span> Data View</span>
            </a>
          </li>
        </ul>
      </section>
      <!-- /.sidebar -->
    </aside>
    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
      <!-- Content Header (Page header) -->
      <!--<section class="content-header">
        <h1>
          <slot name="title"></slot>
        </h1>
      </section>-->
      <!-- Main content -->
      <section class="content">
        <slot name="body"></slot>
      </section>
      <!-- /.content -->
    </div>
    <!-- /.content-wrapper -->
    <footer class="main-footer">
      <strong
        >&copy; {{ year === 2019 ? "2019" : `2019-${year}` }} Mango Consultant
        Co., Ltd. |
        {{ customerAuth.customer_name || "ไม่ได้เข้าสู่ระบบ" }}</strong
      >
    </footer>
    <!-- Control Sidebar -->
    <aside class="control-sidebar control-sidebar-dark">
      <!-- Create the tabs -->
      <ul class="nav nav-tabs nav-justified control-sidebar-tabs">
        <li class="active">
          <a href="#control-sidebar-home-tab" data-toggle="tab"
            ><i class="fa fa-user"></i
          ></a>
        </li>
      </ul>
      <!-- Tab panes -->
      <div class="tab-content">
        <!-- Home tab content -->
        <div class="tab-pane active" id="control-sidebar-home-tab">
          <h3 class="control-sidebar-heading">Information</h3>
          <ul class="control-sidebar-menu">
            <li>
              <a>
                <i class="menu-icon ion ion-person bg-blue"></i>
                <div class="menu-info">
                  <h4 class="control-sidebar-subheading">
                    {{ customerAuth.customer_name }}
                  </h4>
                  <p>
                    Last Login : {{ new Date() | date("DD/MM/YYYY HH:mm") }}
                  </p>
                </div>
              </a>
            </li>
          </ul>
          <hr />
          <ul class="control-sidebar-menu">
            <li>
              <a href="#" v-on:click.prevent="changePassword()">
                <i class="menu-icon fa fa-key bg-yellow"></i>
                <div class="menu-info">
                  <h4 class="control-sidebar-subheading">
                    {{ ui.change_password }}
                  </h4>
                </div>
              </a>
            </li>
          </ul>
          <ul class="control-sidebar-menu">
            <li>
              <a href="#" v-on:click.prevent="logoutClick()">
                <i class="menu-icon fa fa-key bg-red"></i>
                <div class="menu-info">
                  <h4 class="control-sidebar-subheading">{{ ui.log_out }}</h4>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
    <!-- /.control-sidebar -->
    <!-- Add the sidebar's background. This div must be placed
    immediately after the control sidebar -->
    <div class="control-sidebar-bg"></div>
  </div>
  <!-- ./wrapper -->
  <!-- Modal : Language Selected -->
</template>
<script>
import sideMenu from "./menu.vue";
let cpn = {
  components: {
    sideMenu
  },
  data() {
    return {
      year: moment().year(),
      pageTitle: "",
      customerAuth: window.customer_auth,
      ui: window.ui,
      baseUrl,
      appinfo: window.appinfo,
      viewVersion: window.viewVersion,
      viewNotiCust: []
    };
  },
  methods: {

    async loadNotiCust() {
      let act = `CSM/CustomerData/NotiCust`;
      let rsp = await $xt.getCustomerServer(act);
      this.viewNotiCust = rsp.data;
      window.page_addspec = rsp.page_addspec
    },
    logoutClick() {
      $.confirm({
        title: window.ui.log_out,
        content: window.ui.log_out_message,
        theme: "material",
        animateFromElement: false,
        buttons: {
          btn1: {
            text: window.ui.this_device,
            btnClass: "btn-warning",
            action: function() {
              (async () => {
                let rs = await $xt.getCustomerServer(
                  "CSM/AuthCustomer/logout?all=false"
                );
                if (rs.success) {
                  try {
                    localStorage.removeItem("customer_auth");
                  } catch (ex) {}
                  window.location.href =
                    window.baseUrl + "page/authentication/login_cust/";
                }
              })();
            }
          },
          btn2: {
            text: window.ui.all_devices,
            btnClass: "btn-danger",
            action: function() {
              (async () => {
                let rs = await $xt.getCustomerServer(
                  "CSM/AuthCustomer/logout?all=true"
                );
                if (rs.success) {
                  try {
                    localStorage.removeItem("customer_auth");
                  } catch (ex) {}
                  window.location.href =
                    window.baseUrl + "page/authentication/login_cust/";
                }
              })();
            }
          },
          btn3: {
            text: window.ui.cancel,
            btnClass: "btn-default",
            action: function() {}
          }
        }
      });
    },
    changePassword() {
      $.confirm({
        title: "เปลี่ยนรหัสผ่าน",
        icon: "fas fa-key",
        content: `<div class="cx-pwd">
                    <div class="cx-pwd__note">
                      <i class="fas fa-exclamation-triangle"></i>
                      <span>หากทำการเปลี่ยน Password ระบบจะ Logout ให้ทันที</span>
                    </div>
                    <div class="cx-pwd__field">
                      <label for="newPassword">New Password</label>
                      <div class="cx-pwd__wrap">
                        <i class="fas fa-lock cx-pwd__lead"></i>
                        <input type="password" id="newPassword" class="cx-pwd__input" placeholder="รหัสผ่านใหม่" autocomplete="new-password" />
                        <button type="button" class="cx-pwd__eye" tabindex="-1" onclick="var i=this.parentNode.querySelector('input');var s=i.type==='password';i.type=s?'text':'password';this.querySelector('i').className=s?'fas fa-eye-slash':'fas fa-eye';"><i class="fas fa-eye"></i></button>
                      </div>
                    </div>
                    <div class="cx-pwd__field">
                      <label for="confirmPassword">Confirm Password</label>
                      <div class="cx-pwd__wrap">
                        <i class="fas fa-lock cx-pwd__lead"></i>
                        <input type="password" id="confirmPassword" class="cx-pwd__input" placeholder="ยืนยันรหัสผ่านใหม่" autocomplete="new-password" />
                        <button type="button" class="cx-pwd__eye" tabindex="-1" onclick="var i=this.parentNode.querySelector('input');var s=i.type==='password';i.type=s?'text':'password';this.querySelector('i').className=s?'fas fa-eye-slash':'fas fa-eye';"><i class="fas fa-eye"></i></button>
                      </div>
                    </div>
                    <div class="cx-pwd__hint"><i class="fas fa-info-circle"></i> ตั้งรหัสผ่านที่คาดเดายาก และไม่ซ้ำกับรหัสผ่านเดิม</div>
                  </div>`,
        theme: "material",
        boxWidth: "428px",
        useBootstrap: false,
        animation: "scale",
        closeAnimation: "scale",
        animateFromElement: false,
        onContentReady: function () {
          $("#newPassword").trigger("focus");
        },
        buttons: {
          change: {
            text: "ยืนยันการเปลี่ยนรหัสผ่าน",
            btnClass: "cx-pwd-ok",
            keys: ["enter"],
            action: async () => {
              try {
                let formData = {
                  newPassword: newPassword.value,
                  confirmPassword: confirmPassword.value
                };
                let url = `CSM/CustomerData/ChangePassword`;
                let resp = await $xt.postCustomerJson(url, formData);
                if (!resp.success) {
                  throw resp.error;
                }

                let rs = await $xt.getCustomerServer(
                  "CSM/AuthCustomer/logout?all=true"
                );
                if (rs.success) {
                  try {
                    localStorage.removeItem("customer_auth");
                  } catch (ex) {}
                  window.location.href =
                    window.baseUrl + "page/authentication/login_cust/";
                }
              } catch (ex) {
                $msg.alert(`เกิดข้อผิดพลาด`, ex.toString(), `danger`);
              }
            }
          },
          cancel: {
            text: "ยกเลิก",
            btnClass: "cx-pwd-cancel",
            action: () => {}
          }
        }
      });
    }
  },
  mounted() {
    this.loadNotiCust();
    (async () => {
      $xt.sleep(200);
      this.$nextTick(() => {
        $(window).trigger("resize");
      });
    })();
  }
};

export default cpn;
</script>
