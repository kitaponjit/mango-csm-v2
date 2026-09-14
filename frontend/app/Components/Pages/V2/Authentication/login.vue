<template>
  <div>
    <div class="content-header">
      <div id="content-navbar">
        <nav class="navbar mb-0">
          <!-- <nav class="navbar navbar-inverse navbar-fixed-top"> -->
          <div class="container-fluid py-5">
            <div class="navbar-header">
              <a class="navbar-brand m-0 p-0 ">
                <img :src="`${baseUrl}Content/Images/Logo/logo_mango_dark_default.png`" class=" max-height w-100 profile-img" alt="Mango Consultant">
              </a>
              <button type="button" class="navbar-toggle">
                <span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span>
              </button>
              <!-- <a class="navbar-brand visible-xs m-0 text-white"><span>แจ้งซ่อม</span></a>
              <a class="navbar-brand visible-xs m-0 text-white"><span>ติดตามสถานะ</span></a>
              <a class="navbar-brand visible-xs m-0  text-white"><span>เข้าสู่ระบบ</span></a> -->

            </div>
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              <ul class="nav navbar-nav navbar-right">
                <li><a href="#" class="text-white">{{is_mango === 'Y' ? ui.csm_v2_create_request_mango : ui.csm_v2_create_request}}</a></li>
                <li><a href="#" class="text-white">{{ ui.csm_v2_status_follow_up }}</a></li>
                <li><a href="#" class="text-white">{{ ui.csm_v2_login }}</a></li>
              </ul>
            </div>
          </div>
        </nav>
        <div class="container-fluid p-0">
          <div class="Header_tab1">
            <div class="visible-lg">
              <p class="text-bold text-white fs-4vw text-white-60">{{ ui.csm_v2_welcome_to }}</p>
              <p class="text-bold text-white fs-4vw">{{is_mango === 'Y' ? ui.csm_v2_system_desc_mango : ui.csm_v2_system_desc}}</p>
              <p class="text-bold text-white fs-4vw">{{ ui.csm_v2_customer_menu_hint }}</p>
            </div>
            <div class="visible-md visible-sm">
              <h1 class="text-bold text-white-60">{{ ui.csm_v2_welcome_to }}</h1>
              <h2 class="text-bold text-white fs-3vw">{{is_mango === 'Y' ? ui.csm_v2_system_desc_mango : ui.csm_v2_system_desc}}</h2>
              <h2 class="text-bold text-white fs-3vw">{{ ui.csm_v2_customer_menu_hint }}</h2>
            </div>
            <div class="visible-xs">
              <h1 class="text-bold text-white-60">{{ ui.csm_v2_welcome_to }}</h1>
              <h2 class="text-bold text-white">{{is_mango === 'Y' ? ui.csm_v2_system_desc_line1_mango : ui.csm_v2_system_desc_line1}}</h2>
              <h2 class="text-bold text-white">{{is_mango === 'Y' ? ui.csm_v2_system_desc_line2_mango : ui.csm_v2_system_desc_line2}}</h2>
              <h4 class="text-bold text-white">{{ ui.csm_v2_customer_menu_hint }}</h4>
            </div>
            <div class="btn-group">
              <a class="btn btn-outline-light margin-r-20 margin-t-20">{{is_mango === 'Y' ? ui.csm_v2_create_request_mango : ui.csm_v2_create_request}}</a>
              <a class="btn btn-outline-light margin-t-20">{{ ui.csm_v2_status_follow_up }}</a>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal Login -->
    <div class="modal fade" id="myModal" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div class="modal-dialog login qt-dialog" role="document">
        <div class="modal-content qt-card">
          <div class="qt-card__top">
            <a class="qt-lang" @click="$refs.changeLang.openModal()"><i class="fas fa-globe"></i>{{ user_lang =='EN_MASTER' ?'EN':user_lang }}</a>
            <img class="qt-logo" :src="baseUrl + 'Content/Images/Logo/logo_mango.png'" alt="Logo">
          </div>
          <div class="modal-body qt-card__body">
            <div class="qt-head">
              <h4 class="qt-head__title">{{ ui.csm_v2_login }}</h4>
              <span class="qt-head__sub">{{ ui.csm_v2_login_hint }}</span>
            </div>

            <div class="qt-form">
              <div class="qt-field">
                <label><i class="fas fa-user"></i> {{ui.csm_v2_username ||'Username'}}</label>
                <div class="qt-input">
                  <input type="text" class="qt-input__el" v-model="form['userid']" :placeholder="ui.csm_v2_username" @keyup.enter="submit()">
                </div>
              </div>
              <div class="qt-field">
                <label><i class="fas fa-lock"></i> {{ui.erp_password ||'Password'}}</label>
                <div class="qt-input">
                  <input :type="showPassword ? 'text' : 'password'" class="qt-input__el qt-input__el--action" v-model="form['userpass']" :placeholder="ui.erp_password" @keyup.enter="submit()">
                  <a class="qt-eye" @click="showPassword = !showPassword"><i class="far" :class="[ !showPassword ? 'fa-eye' : 'fa-eye-slash' ]"></i></a>
                </div>
              </div>
            </div>

            <div class="qt-forgot">
              <a @click.prevent="formToForgetPW">{{ ui.csm_v2_forgot_password }}?</a>
            </div>

            <button type="submit" class="qt-btn qt-btn--main" @click.prevent="submit()">
              <i class="fas fa-sign-in-alt"></i>{{ ui.csm_v2_login }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Forgot Password -->
    <div class="modal fade" id="modalForgetPW" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="forgetPWLabel" aria-hidden="true">
      <div class="modal-dialog login qt-dialog" role="document">
        <div class="modal-content qt-card">
          <div class="qt-card__top">
            <img class="qt-logo" :src="baseUrl + 'Content/Images/Logo/logo_mango.png'" alt="Logo">
          </div>
          <div class="modal-body qt-card__body">
            <div class="qt-badge"><i class="fas fa-unlock-alt"></i></div>
            <div class="qt-head">
              <h4 class="qt-head__title">{{ ui.csm_v2_forgot_password }}</h4>
              <span class="qt-head__sub">{{ ui.csm_v2_reset_password_hint }}</span>
            </div>

            <div class="qt-form">
              <div class="qt-field">
                <label><i class="fas fa-user"></i> {{ui.csm_v2_username ||'Username'}}</label>
                <div class="qt-input">
                  <input type="text" class="qt-input__el" v-model="forgetForm['username']" :placeholder="ui.csm_v2_username">
                </div>
              </div>
              <div class="qt-field">
                <label><i class="fas fa-envelope"></i> {{ ui.csm_v2_email }}</label>
                <div class="qt-input">
                  <input type="text" class="qt-input__el" v-model="forgetForm['contact']" :placeholder="ui.csm_v2_input_email" @input="forgetForm.contact = forgetForm.contact.replace(/[ก-๙]/g, '')">
                </div>
              </div>
            </div>

            <div class="qt-actions">
              <button type="button" class="qt-btn qt-btn--ghost" data-dismiss="modal" @click="backToLogin('home')">
                <i class="fas fa-arrow-left"></i>{{ui.erp_go_back||'ย้อนกลับ'}}
              </button>
              <button type="button" class="qt-btn qt-btn--main" @click="resetPassword()">
                <i class="fas fa-paper-plane"></i>{{ ui.csm_v2_reset_password }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal OTP -->
    <div class="modal fade" id="modalOTP" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="otpLabel" aria-hidden="true">
      <div class="modal-dialog login qt-dialog" role="document">
        <div class="modal-content qt-card">
          <div class="qt-card__top">
            <img class="qt-logo" :src="baseUrl + 'Content/Images/Logo/logo_mango.png'" alt="Logo">
          </div>
          <div class="modal-body qt-card__body">
            <div class="qt-badge"><i class="fas fa-shield-alt"></i></div>
            <div class="qt-head">
              <h4 class="qt-head__title">{{ui.confirm ||'ยืนยัน'}} OTP</h4>
              <span class="qt-head__sub">{{ ui.csm_v2_otp_sent_to }}: <b>{{ maskedContact() }}</b></span>
            </div>

            <div class="qt-ref">{{ ui.csm_v2_otp_ref }}: <b>{{ otp_ref }}</b></div>

            <div class="qt-otp">
              <input v-for="(d, i) in 6"
                     :key="i"
                     type="text"
                     maxlength="1"
                     class="form-control otp-input"
                     v-model="otp[i]"
                     @input="focusNext($event, i)"
                     @keydown="focusPrev($event, i)">
            </div>

            <div class="qt-warn"><i class="fas fa-exclamation-circle"></i>{{ ui.csm_v2_otp_expire }}</div>

            <div class="qt-resend">
              <a v-if="!opt_disable_request" @click="resetPassword()">
                <i class="fas fa-redo"></i>{{ ui.csm_v2_otp_resend }}
              </a>
              <span v-else>{{ ui.csm_v2_otp_resend_in }} <b>{{ opt_disable_count }}</b> {{ ui.csm_v2_second }}</span>
            </div>

            <div class="qt-actions">
              <button type="button" class="qt-btn qt-btn--ghost" data-dismiss="modal" @click="backToLogin('toOtp')">
                <i class="fas fa-arrow-left"></i>{{ui.erp_go_back||'ย้อนกลับ'}}
              </button>
              <button type="button" class="qt-btn qt-btn--main" @click="verifyOTP()">
                <i class="fas fa-check"></i>{{ui.confirm ||'ยืนยัน'}}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Change Password -->
    <div class="modal fade" id="modalChangePW" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="forgetPWLabel" aria-hidden="true">
      <div class="modal-dialog login qt-dialog" role="document">
        <div class="modal-content qt-card">
          <div class="qt-card__top">
            <img class="qt-logo" :src="baseUrl + 'Content/Images/Logo/logo_mango.png'" alt="Logo">
          </div>
          <div class="modal-body qt-card__body">
            <div class="qt-badge"><i class="fas fa-key"></i></div>
            <div class="qt-head">
              <h4 class="qt-head__title">{{ ui.csm_v2_change_password }}</h4>
              <span class="qt-head__sub">{{ ui.csm_v2_set_new_password_hint }}</span>
            </div>

            <div class="qt-note">
              <div class="qt-note__row">
                <i class="fas fa-user"></i>
                <span>{{ui.csm_v2_username ||'Username'}} : <b>{{ form_member.userid }}</b></span>
              </div>
              <div class="qt-note__row">
                <i class="fas fa-envelope"></i>
                <span>{{ ui.csm_v2_email }} : <b>{{ form_member.contact }}</b></span>
              </div>
            </div>

            <div class="qt-form">
              <div class="qt-field" :class="{ 'has-error' : xt.isEmpty(form_member.userpass)}">
                <label>
                  <i class="fas fa-lock"></i>
                  <span class="qt-req">{{ui.csm_v2_new_password || 'New Password' }}<sup>*</sup></span>
                  <span class="qt-count">{{ xt.textLength(form_member.userpass, 10) }}</span>
                </label>
                <div class="qt-input">
                  <input type="password" class="qt-input__el" maxlength="10" v-model.trim="form_member.userpass" :placeholder="ui.csm_v2_new_password">
                </div>
                <span class="qt-err" v-if="!validatePassword('userpass')">{{ ui.csm_v2_valid_password_rule }}</span>
              </div>
              <div class="qt-field" :class="{ 'has-error' : xt.isEmpty(form_member.userpass_cf)}">
                <label>
                  <i class="fas fa-check-double"></i>
                  <span class="qt-req">{{ui.csm_v2_confirm_new_password||'Confirm new password' }}<sup>*</sup></span>
                  <span class="qt-count">{{ xt.textLength(form_member.userpass_cf, 10) }}</span>
                </label>
                <div class="qt-input">
                  <input type="password" class="qt-input__el" maxlength="10" v-model.trim="form_member.userpass_cf" :placeholder="ui.csm_v2_confirm_new_password">
                </div>
                <span class="qt-err" v-if="!validatePassword('userpass_match')">{{ ui.csm_v2_valid_password_match }}</span>
              </div>
            </div>

            <div class="qt-rule">
              <i class="fas fa-info-circle"></i>
              <span>{{ ui.csm_v2_password_rule||'รหัสผ่าน 8-10 ตัวอักษร ประกอบด้วย ตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ'}}</span>
            </div>

            <button class="qt-btn qt-btn--main qt-btn--block" @click="LineOA_Before_UpdatePasswordMember()">
              <i class="fas fa-save"></i>{{ ui.csm_v2_confirm_change_password }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <change-lang ref="changeLang"></change-lang>

  </div>
</template>
<script>
  import changeLang from "../Components/change_language.vue"

  let doSubmit = false;

  export default {
    props: ['customer_code'],
    components: {
      changeLang
    },
    data() {
      return {
        baseUrl,
        form: {},
        showPassword: false,
        image_bg: [],
        ui: window.ui,
        user_lang: localStorage.getItem('user_lang') || 'TH',
        xt: $xt,
        is_mango: '',
        maincode_: '',
        //only use OTP
        showPassword: false,
        forgetForm: {},
        otp: ["", "", "", "", "", ""],
        opt_signature: '',
        opt_disable_request: false,
        otp_last_request: null,
        opt_disable_count: 0,
        otp_ref: '',
        next_otp: false,
        form_member: {},
        type_cus: ''


      }
    },
    methods: {
      async submit() {
        if (doSubmit) return;
        (async () => {
          let f = this.form;
          f.customer_code = this.customer_code
          if (!f.userid || !f.userpass) {
            await $msg.alert('', this.ui.csm_v2_alert_incomplete ||'Please fill in all required fields.', 'danger');
            return;
          }
          // let action = `CSM/AuthCustomer/LineOA_Login`;
          let action = `CSM/AuthCustomer/login`;
          try {
            doSubmit = true;
            // this.isLoading = true;
            let d = await $xt.postServerJson(action, f)
            if (d.error) {
              await $msg.alert('', d.error, 'danger');
              $('#myModal').modal('show');
            } else {
              localStorage.setItem("customer_auth", d.data)
              localStorage.setItem("customer_login", JSON.stringify(this.form))
              window.location = baseUrl + 'page/v2/';
            }
          }
          catch (err) {
            await $msg.alert('', err.toString(), 'danger');
          }
          doSubmit = false;
        })();
      },
      async readImg() {
        let act = `CSM/API/csm_img_bg`;
        let resp = await $xt.getServer(act);

        this.image_bg = resp.data || [];
      },
      async loadConfig() {
        let action = `CSM/API/GetConfig`
        let data = await $xt.getCustomerServer(action);
        this.is_mango = data.config_value;
        this.maincode_ = data.maincode;
      },
      setBackground() {
        this.$nextTick(() => {
          if (this.image_bg.length > 0) {
            $('body').css({
              'background-image': `url(${dataServer + 'Api/File/DownLoad?id=' + this.image_bg[0].phi_path})`,
              'background-size': 'cover',
              'background-repeat': 'no-repeat',
              'background-position': 'center center',
            });
            // console.log('ccc mounted', `url(${dataServer + 'Api/File/DownLoad?id=' + this.img_bg[0].phi_path}) `)
          } else if (this.is_mango === "Y") {
            $('body').css({
              'background-image': `url(${this.baseUrl + 'Content/Images/PNG/v2_mangoBG.png'})`,
              'background-size': 'cover',
              'background-repeat': 'no-repeat',
              'background-position': 'center center',
            });
          }
          else if (this.is_mango === "N") {
            $('body').css({
              'background-image': `url(${this.baseUrl + 'Content/Images/PNG/v2_customerBG.png'})`,
              'background-size': 'cover',
              'background-repeat': 'no-repeat',
              'background-position': 'center center',
            });
          } else {
            $('body').css({
              'background-image': `url(${this.baseUrl + 'Content/Images/PNG/bg.jpg'})`,
              'background-size': 'cover',
              'background-repeat': 'no-repeat',
              'background-position': 'center center',
            });
          }
        })
      },
      formToForgetPW() {
        $('#myModal').modal('hide');
        $('#modalForgetPW').modal('show');
      },
      backToLogin(gf) {
        if (gf == 'home') {
          $('#modalForgetPW').modal('hide');
          $('#myModal').modal('show');
          this.forgetForm.username = '';
          this.forgetForm.contact = '';

        }
        else if (gf == 'toOtp') {

          $('#modalOTP').modal('hide');
          $('#modalForgetPW').modal('show');
          this.forgetForm.username = '';
          this.forgetForm.contact = '';
          //this.otp = ["", "", "", "", "", ""]
          this.otp = Array(6).fill("");
        }

      },
      async resetPassword() {
        if ($xt.isEmpty(this.forgetForm.username)) {
          $msg.alert(`Warning`, this.ui.csm_v2_alert_input_username, `warning`);
          return;
        }
        if ($xt.isEmpty(this.forgetForm.contact)) {
        //  $msg.alert(`Warning`, `กรุณากรอกเบอร์โทรศัพท์ หรือ อีเมล`, `warning`);
          $msg.alert(`Warning`, this.ui.csm_v2_alert_input_email, `warning`);
          return;
        }
        if (/[ก-๙]/.test(this.forgetForm.contact)) {
          $msg.alert(`Warning`, this.ui.csm_v2_alert_no_thai, `warning`);
          return;
        }

        let contact = this.forgetForm.contact.trim();
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let phoneRegex = /^[0-9]{9,12}$/;

        let contactType = "";
        if (emailRegex.test(contact)) {
          contactType = "email";
        } else if (phoneRegex.test(contact)) {
          contactType = "phone";
        } else {
          $msg.alert(`Warning`, this.ui.csm_v2_alert_email_format, `warning`);
          return;
        }

        let gf = {
          userid: this.forgetForm.username.toUpperCase(),
          contact: contact,
          contactType: contactType
        };

        console.log("forget", gf);

        let action = `CSM/AuthCustomer/GetOTP`;

        try {
          let d = await $xt.postServerJson(action, gf);

          if (d.data.error) {
            await $msg.alert('Warning', d.data.error, 'warning');
            $('#modalForgetPW').modal('show');
          } else {
            this.opt_disable_request = false;
            if (d.data.type) {
              this.type_cus = d.data.type;
             // console.log(' this.type_cus==', this.type_cus)
            }
            await this.requestOtp();
            await $xt.sleep(1000);
            if (this.next_otp) {
              await $('#modalOTP').modal('show');
            }
          }
        } catch (err) {
          await $msg.alert('', err.toString(), 'danger');
        }
      },
      maskedContact() {
        let contact = this.forgetForm.contact;
        if (!contact) return "";

        // ถ้าเป็น email
        if (contact.includes("@")) {
          let [user, domain] = contact.split("@");
          if (user.length > 2) {
            user = user.substring(0, 2) + "*".repeat(user.length - 2);
          } else {
            user = user[0] + "*";
          }
          return user + "@" + domain;
        }
        if (/^\d+$/.test(contact)) {
          if (contact.length >= 10) {
            return contact.substring(0, 2) + "****" + contact.substring(contact.length - 2);
          } else {
            return contact[0] + "****";
          }
        }
        return contact;
      },
      focusNext(event, index) {
        const value = event.target.value;
        if (value && index < this.otp.length - 1) {
          event.target.nextElementSibling.focus();
        }
      },
      focusPrev(event, index) {
        if (event.key === "Backspace" && !event.target.value && index > 0) {
          event.preventDefault(); // กันไม่ให้ลบ index นี้อีก
          event.target.previousElementSibling.focus();
        }
      },
      async requestOtp() {
        if (this.opt_disable_request) { return }
        try {
          if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.forgetForm?.contact || '')) {
            throw this.ui.csm_v2_alert_email_invalid
          }

          this.otp_ref = ''
          this.forgetForm.otp_pass = ''

          this.opt_signature = Math.random().toString()
          let fd = new FormData()
          fd.append('maincode', this.maincode_ || '')
          fd.append('userid', this.forgetForm?.username || '')
          fd.append('signature', this.opt_signature)
          fd.append('email', this.forgetForm?.contact)
          // this.$refs.ldb.show()
          let rsp = await $xt.postServerForm(`api/public/RequestMangoOTP`, fd)
          let { refc, token, error } = rsp
          if (error) {
            throw error
          }
          this.otp_ref = refc

          this.otp_last_request = new Date()
          this.opt_disable_request = true
          this.opt_disable_count = 60
          this.form.otp_ref = refc
          this.forgetForm.otp_signature = this.opt_signature
          this.forgetForm.otp_token = token
          this.next_otp = true

        } catch (ex) {
          $msg.alert(`Error`, ex.toString(), `danger`)
        }

        //  this.$refs.ldb.hide()
      },
      async verifyOTP() {
        const otpCode = this.otp.join("");
        if (otpCode.length !== 6) {
          alert(this.ui.csm_v2_alert_otp_required);
          return;
        }
        console.log("Verify OTP:", otpCode);
        let action = `CSM/API/ValidOTP?ref_text=${this.otp_ref}&p_text=${otpCode}&signature=${this.forgetForm.otp_signature}&maincode=${this.maincode_}&userid=${this.forgetForm?.username}`
        let resp = await $xt.getServer(action)

        if (resp === true) {
          this.form_member.userid = this.forgetForm.username || ''
          this.form_member.contact = this.forgetForm.contact || ''
          this.form_member.maincode = this.maincode_ || ''
          this.form_member.type_cus = this.type_cus || ''
          $("#modalOTP").modal("hide");
          $("#modalChangePW").modal("show");
        } else {
          this.otp = Array(6).fill("");
          this.$nextTick(() => {
            let firstInput = document.querySelector(".otp-input");
            if (firstInput) firstInput.focus();
          });
          await $msg.alert('', this.ui.csm_v2_alert_otp_invalid, 'danger');
        }

      },
      validatePassword(keyword) {
        // const pattern = /^(?=.*[!@#$%^&*()-_=+[\]{};:'",.<>/?])[\w!@#$%^&*()-_=+[\]{};:'",.<>/?]{8,}$/;
        // const pattern = /^^(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\-]).{8,}$/;
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,10}$/;

        switch (keyword) {
          case "userpass":
            return pattern.test(this.form_member.userpass)
          case "userpass_match":
            return pattern.test(this.form_member.userpass_cf) && this.form_member.userpass == this.form_member.userpass_cf
        }
      },
      async LineOA_Before_UpdatePasswordMember() {
        let user = this.form_member
        console.log('1', user)
        if ($xt.isEmpty(user.userid)) {
          console.log('1', user.userid)
          return
        }
        if ($xt.isEmpty(user.userpass)) {
          console.log('1', user.userpass)
          return
        }
        if (!this.validatePassword('userpass')) {
          console.log('2')
          return
        }
        if (!this.validatePassword('userpass_match')) {
          console.log('4')
          return
        }

        this.LineOA_updatePasswordMember()
      },
      async LineOA_updatePasswordMember() {
        try {
          let gf = new FormData()
          gf.append('maincode',  'MG1')
          gf.append('userid', this.form_member?.userid || '')
          gf.append('type_cus', this.form_member.type_cus)
          gf.append('userpass', this.form_member?.userpass)

          let resp = await $xt.postServerForm(`CSM/API/UpdatePasswordMemberOTP`, gf)

          if (!resp.success) {
            $msg.alert('Error', resp.error, 'danger')
          }
          $notify.success(this.ui.alert_save_success)
          $("#modalChangePW").modal("hide");
          $("#modalForgetPW").modal("hide");
          $("#modalOTP").modal("hide");
          $("#myModal").modal("show");
        } catch (error) {
          $msg.alert('Error', error.toString(), 'danger')
        }
      },
      runq() {
        $("#modalOTP").modal("hide");
        $("#modalChangePW").modal("show");
      },
      async checkOtpBotton() {
        while (true) {
          if (this.otp_last_request && moment(this.otp_last_request).add(1, 'minutes').isAfter(moment(new Date()))) {
            this.opt_disable_request = true
            this.opt_disable_count = parseInt(moment(this.otp_last_request).add(1, 'minutes').diff(moment(new Date()), 'seconds'))
          }
          else {
            this.opt_disable_request = false
            this.opt_disable_count = 0
          }
          await $xt.sleep(1000)
        }
      },


    },
    created() {
      document.title = this.ui.csm_v2_page_title;
    },
    async mounted() {
      let logincust = localStorage.getItem("customer_login");

      this.checkOtpBotton()
      await this.loadConfig();
      await this.readImg();

      if (logincust != null || logincust != undefined) {
        let p = JSON.parse(logincust);
        this.form.userid = p.userid;
        this.form.userpass = p.userpass;

        this.submit();
      } else {
        $('#myModal').modal('show');
      }
      this.setBackground();
      // if (this.image_bg.length > 0) {
      //   $(window).resize(() => {
      //     $('.content-header').css({
      //       'min-width': $(window).width() + 'px',
      //       'min-height': $(window).height() + 'px',
      //       'background-image': `url(${dataServer + 'Api/File/DownLoad?id=' + this.image_bg[0].phi_path} )`
      //     });
      //   });
      //   $(window).trigger("resize");
      // }
      // else {
      //   $(window).resize(() => {
      //     $('.content-header').css({
      //       'min-width': $(window).width() + 'px',
      //       'min-height': $(window).height() + 'px',
      //       'background-image': `url(${this.baseUrl + 'Content/Images/PNG/bg.jpg'})`
      //     });
      //   });
      //   $(window).trigger("resize");
      // }

    }
  }
</script>

<style>
  @import './../CSS/Style.css';
  /* ! Modal */
  .modal .modal-dialog.login {
    top: 50% !important;
    transform: translate(0%, -50%) !important;
  }

  .modal .modal-header.login {
    height: 30% !important;
    width: 50% !important;
    padding: 15px 0px 0px 15px !important;
    background: none !important;
  }

    .modal .modal-header.login img {
      max-width: 100% !important;
      max-height: 100% !important;
      object-fit: contain !important;
    }

  /* ── QuickTicket auth cards ── */
  .qt-dialog {
    width: 424px !important;
    max-width: calc(100vw - 28px) !important;
    margin: 0 auto !important;
  }
  .modal .modal-content.qt-card {
    position: relative;
    border: 0 !important;
    border-radius: 22px !important;
    overflow: hidden;
    background: #fff !important;
    box-shadow: 0 28px 64px -22px rgba(0, 52, 44, .55), 0 6px 18px rgba(0, 52, 44, .12) !important;
    font-family: 'Manrope', 'Sarabun', sans-serif;
  }
  .qt-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, #00BF9D, #35D6B0 55%, #A9F0DD);
  }
  .qt-card__top {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 26px 24px 18px;
    background:
      radial-gradient(120% 150% at 50% -35%, rgba(0, 191, 157, .16) 0%, rgba(0, 191, 157, 0) 62%),
      linear-gradient(180deg, #F6FDFB 0%, #FFFFFF 100%);
    border-bottom: 1px solid #EEF4F2;
  }
  .qt-logo {
    max-height: 42px;
    max-width: 62%;
  }
  .qt-lang {
    position: absolute;
    top: 12px;
    right: 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 11px;
    border-radius: 999px;
    background: rgba(0, 191, 157, .1);
    color: #049E83;
    font-size: 11.5px;
    font-weight: 800;
    letter-spacing: .04em;
    cursor: pointer;
    transition: background .16s ease, color .16s ease;
  }
  .qt-lang:hover { background: #00BF9D; color: #fff; }
  .qt-lang > i { font-size: 11px; }

  .modal-body.qt-card__body { padding: 22px 26px 26px !important; }

  .qt-badge {
    width: 56px;
    height: 56px;
    margin: 0 auto 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    background: linear-gradient(135deg, #E4FBF5, #CFF5EA);
    color: #00A98C;
    font-size: 22px;
    box-shadow: 0 10px 22px -12px rgba(0, 169, 140, .8);
  }
  .qt-head { text-align: center; margin-bottom: 20px; }
  .qt-head__title {
    margin: 0 0 5px;
    font-family: 'Manrope', 'Sarabun', sans-serif;
    font-size: 21px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #14251F;
  }
  .qt-head__sub {
    display: block;
    font-size: 12.5px;
    font-weight: 500;
    line-height: 1.6;
    color: #7B8C87;
  }
  .qt-head__sub b { color: #049E83; font-weight: 800; }

  .qt-form { display: flex; flex-direction: column; gap: 14px; }
  .qt-field > label {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 0 0 6px;
    font-family: 'Manrope', 'Sarabun', sans-serif;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #6F817C;
  }
  .qt-field > label > i { font-size: 11px; color: #00BF9D; }
  .qt-req { color: #6F817C; }
  .qt-req sup { color: #E2574C; margin-left: 2px; }
  .qt-count {
    margin-left: auto;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0;
    color: #A9B7B3;
    text-transform: none;
  }
  .qt-input { position: relative; display: flex; align-items: center; }
  .qt-input__el {
    width: 100%;
    height: 46px;
    padding: 0 14px;
    border: 1.5px solid #E4EBE9;
    border-radius: 13px;
    background: #F8FBFA;
    font-family: 'Manrope', 'Sarabun', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #14251F;
    outline: none;
    box-shadow: none;
    transition: border-color .16s ease, background .16s ease, box-shadow .16s ease;
  }
  .qt-input__el--action { padding-right: 46px; }
  .qt-input__el::placeholder { font-weight: 500; color: #AFBDB9; }
  .qt-input__el::-ms-reveal { display: none; }
  .qt-input__el:focus {
    border-color: #00BF9D;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(0, 191, 157, .14);
  }
  .has-error .qt-input__el { border-color: #F0B4AE; background: #FEF7F6; }
  .qt-eye {
    position: absolute;
    right: 6px;
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #9DAAA6;
    font-size: 13px;
    cursor: pointer;
    transition: background .15s ease, color .15s ease;
  }
  .qt-eye:hover { background: rgba(0, 191, 157, .1); color: #049E83; }
  .qt-err { display: block; margin-top: 5px; font-size: 11px; font-weight: 600; color: #E2574C; }

  .qt-forgot { text-align: right; margin-top: 11px; }
  .qt-forgot > a {
    font-size: 12px;
    font-weight: 700;
    color: #049E83;
    cursor: pointer;
    text-decoration: none;
  }
  .qt-forgot > a:hover { text-decoration: underline; }

  .qt-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 46px;
    padding: 0 18px;
    border: 0;
    border-radius: 13px;
    font-family: 'Manrope', 'Sarabun', sans-serif;
    font-size: 14.5px;
    font-weight: 800;
    letter-spacing: 0;
    cursor: pointer;
    white-space: nowrap;
    transition: transform .13s ease, box-shadow .2s ease, background .18s ease, color .18s ease;
  }
  .qt-btn > i { font-size: 13px; }
  .qt-btn--main {
    position: relative;
    overflow: hidden;
    width: 100%;
    margin-top: 18px;
    background: linear-gradient(135deg, #00C9A5 0%, #00BF9D 45%, #00937A 100%);
    color: #fff;
    box-shadow: 0 12px 24px -12px rgba(0, 147, 122, .85);
  }
  .qt-btn--main::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(100deg, rgba(255, 255, 255, 0) 34%, rgba(255, 255, 255, .38) 50%, rgba(255, 255, 255, 0) 66%);
    transform: translateX(-101%);
  }
  .qt-btn--main:hover {
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 16px 30px -12px rgba(0, 147, 122, .95);
  }
  .qt-btn--main:hover::after { animation: qtShine .85s ease-out; }
  .qt-btn--main:active { transform: translateY(0); }
  @keyframes qtShine {
    from { transform: translateX(-101%); }
    to { transform: translateX(101%); }
  }
  .qt-btn--ghost {
    background: #F1F5F4;
    color: #5B6B67;
  }
  .qt-btn--ghost:hover { background: #E5EBE9; color: #14251F; }
  .qt-actions {
    display: flex;
    gap: 10px;
    margin-top: 22px;
  }
  .qt-actions .qt-btn { margin-top: 0; }
  .qt-actions .qt-btn--ghost { flex: 1 1 38%; }
  .qt-actions .qt-btn--main { flex: 1 1 62%; width: auto; }
  .qt-btn--block { width: 100%; }

  .qt-note {
    padding: 12px 14px;
    margin-bottom: 18px;
    border: 1px solid #E7F1EE;
    border-radius: 13px;
    background: #F7FBFA;
  }
  .qt-note__row {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 12.5px;
    color: #6F817C;
  }
  .qt-note__row + .qt-note__row { margin-top: 6px; }
  .qt-note__row > i { width: 14px; text-align: center; color: #00BF9D; font-size: 12px; }
  .qt-note__row b { color: #14251F; font-weight: 800; }

  .qt-ref {
    margin: 0 auto 14px;
    padding: 5px 13px;
    width: fit-content;
    border-radius: 999px;
    background: #F1F5F4;
    font-size: 11.5px;
    font-weight: 600;
    color: #6F817C;
  }
  .qt-ref b { color: #14251F; font-weight: 800; letter-spacing: .04em; }
  .qt-otp {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .modal .qt-otp .otp-input {
    width: 46px !important;
    height: 54px !important;
    padding: 0 !important;
    flex-shrink: 0;
    border: 1.5px solid #E4EBE9 !important;
    border-radius: 12px !important;
    background: #F8FBFA !important;
    font-family: 'Manrope', 'Sarabun', sans-serif;
    font-size: 20px !important;
    font-weight: 800 !important;
    text-align: center;
    color: #14251F;
    box-shadow: none !important;
    transition: border-color .16s ease, background .16s ease, box-shadow .16s ease;
  }
  .modal .qt-otp .otp-input:focus {
    border-color: #00BF9D !important;
    background: #fff !important;
    box-shadow: 0 0 0 4px rgba(0, 191, 157, .14) !important;
  }
  .qt-warn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin-bottom: 13px;
    font-size: 11.5px;
    font-weight: 600;
    color: #E2574C;
  }
  .qt-resend { text-align: center; margin-bottom: 4px; font-size: 12.5px; color: #7B8C87; }
  .qt-resend > a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
    color: #049E83;
    cursor: pointer;
  }
  .qt-resend > a:hover { text-decoration: underline; }
  .qt-resend b { color: #049E83; font-weight: 800; }

  .qt-rule {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 11px 14px;
    margin-top: 15px;
    border: 1px solid #E7F1EE;
    border-radius: 13px;
    background: #F7FBFA;
    font-size: 11.5px;
    line-height: 1.65;
    color: #7B8C87;
  }
  .qt-rule > i { margin-top: 2px; color: #00BF9D; }

  @media only screen and (max-width: 480px) {
    .qt-dialog { width: calc(100vw - 24px) !important; }
    .modal-body.qt-card__body { padding: 18px 18px 22px !important; }
    .qt-head__title { font-size: 19px; }
    .modal .qt-otp .otp-input { width: 42px !important; height: 50px !important; font-size: 18px !important; }
    .qt-otp { gap: 6px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .qt-btn, .qt-input__el, .qt-eye, .qt-lang, .modal .qt-otp .otp-input { transition: none; }
    .qt-btn--main:hover::after { animation: none; }
  }

  @media only screen and (max-width : 768px) {
    .modal .modal-dialog.login {
      padding: 0 30px;
    }

    .otp-input {
      width: 50px;
      height: 50px;
      font-size: 1.5rem;
      border: 1px solid #00BF9D;
      border-radius: 4px;
    }
  }
</style>



<!--<div class="row">
  <div class="col-md-12 margin-b-20">
    <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_member.userpass)}">
      <label for="password" class="text-secondary-v2 text-danger">New Password<sup>*</sup></label><label class="pull-right text-secondary-v2">{{ xt.textLength(form_member.userpass, 10) }}</label>
      <input type="password" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="10" v-model.trim="form_member.userpass" placeholder="Userpass" id="userpass">

    </div>
    <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form_member.userpass_cf)}">
      <label for="password" class="text-secondary-v2 text-danger">Confirm Password<sup>*</sup></label><label class="pull-right text-secondary-v2">{{ xt.textLength(form_member.userpass_cf, 10) }}</label>
      <input type="password" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="10" v-model.trim="form_member.userpass_cf" placeholder="Userpass" id="password_cf">

    </div>
  </div>
</div>-->
