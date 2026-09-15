<template>
  <div>
    <div v-show="show" class="container-fluid">
      <div class="container h-100p main-content">
        <div class="row">
          <div class="col-md-12 padding-t-20">
            <!-- <img :src="`${baseUrl}vendor/Content/Images/Logo/logo_mango_dark.png`" class="profile-img" alt="Mango Consultant"> -->
            <img :src="baseUrl + 'vendor/Content/Images/Logo/logo_mango_dark_default.png'" class="max-height w-100 profile-img" alt="Your Logo">
            
          </div>
          <div class="col-md-12 margin-b-20">
            <h3 class="fw-bold">{{ ui.csm_v2_register_title }}</h3>
          </div>
          <div class="col-md-12">
            <div class="form-group">
              <label for="customer_name" class="text-secondary-v2">{{ ui.csm_v2_project_owner }}(Owner)</label>
              <input type="text" class="form-control input-sm border-x-0 border-t-0 border-radius-0" disabled v-model="form.customer_name" id="customer_name">
            </div>
          </div>
          <div class="col-md-12">
            <div class="form-group">
              <label for="house_no" class="text-secondary-v2">{{ ui.csm_v2_project }}</label>
              <input type="text" class="form-control input-sm border-x-0 border-t-0 border-radius-0" disabled v-model="form.pre_des" id="house_no">
            </div>
          </div>
          <div class="col-md-12">
            <h5 class="fw-bold">{{ ui.csm_v2_personal_info }}</h5>
          </div>
          <div class="col-md-12 margin-b-20">
            <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form.name_th)}">
              <label for="name" class="text-secondary-v2">{{ ui.csm_v2_contact_name }}</label><sup class="text-danger">*</sup>
              <input type="text" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="2000" v-model="form.name_th" :placeholder="ui.csm_v2_input_name" id="name">
              <span class="text-danger" v-show="xt.isEmpty(form.name_th)">{{ ui.csm_v2_valid_required }}</span>
            </div>
          </div>
          <div class="col-md-12 margin-b-20">
            <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form.telephone)}">
              <label for="tel" class="text-secondary-v2">{{ ui.csm_v2_tel }}</label><sup class="text-danger">*</sup>
              <input type="tel" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="10" v-model="form.telephone" @keyup="onlyPressNumber($event)" :placeholder="ui.csm_v2_input_tel" id="tel">
              <span class="text-danger" v-show="xt.isEmpty(form.telephone)">{{ ui.csm_v2_valid_required }}</span>
            </div>
          </div>
          <div class="col-md-12 margin-b-30">
            <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form.mail)}">
              <label for="email" class="text-secondary-v2 text-danger">{{ ui.csm_v2_email }}<sup>*</sup></label>
              <input type="email" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="200" v-model="form.mail" :placeholder="ui.csm_v2_input_email" id="email">
              <span class="text-danger" v-show="xt.isEmpty(form.mail)">{{ ui.csm_v2_valid_required }}</span>
            </div>
          </div>
          <div class="col-md-12">
            <h5 class="fw-bold">{{ ui.csm_v2_login_info }}</h5>
          </div>
          
          <input type="text" name="username" style="display:none">
          <input type="password" name="password" style="display:none">

          <div class="col-md-12 margin-b-20">
            <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form.userid)}">
              <label for="Username" class="text-secondary-v2">Username</label><sup class="text-danger">*</sup><label class="pull-right text-secondary-v2">{{ xt.textLength(form.userid, 20) }}</label>
              <input type="text" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="20" v-model.trim="form.userid" placeholder="Username" id="Username" @input="filterInput($event)" autocomplete="off">
              <span class="text-danger" v-show="xt.isEmpty(form.userid)">{{ ui.csm_v2_valid_required }}</span>
            </div>
          </div>
          <div class="col-md-12 margin-b-20">
            <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form.userpass)}">
              <label for="password" class="text-secondary-v2">Password</label><sup class="text-danger">*</sup><label class="pull-right text-secondary-v2">{{ xt.textLength(form.userpass, 10) }}</label>
              <div class="input-group">
                <input :type="showPassword ? 'text' : 'password'" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="10" v-model.trim="form.userpass" placeholder="Userpass" id="password" autocomplete="off">
                <span class="input-group-btn" @click="showPassword = !showPassword">
                      <a class="btn btn-sm bg-navy"><i class="far text-white" :class="[ !showPassword ? 'fa-eye' : 'fa-eye-slash' ]" ></i></a>
                    </span>
              </div>
              <span class="text-danger" v-if="!validatePassword('userpass')">{{ ui.csm_v2_valid_password_rule }}</span>
            </div>
            <div class="form-group" :class="{ 'has-error' : xt.isEmpty(form.userpass_cf)}">
              <label for="password" class="text-secondary-v2">Confirm Password</label><sup class="text-danger">*</sup><label class="pull-right text-secondary-v2">{{ xt.textLength(form.userpass_cf, 10) }}</label>
              <div class="input-group">
                <input :type="showPassword_cf ? 'text' : 'password'" class="form-control input-sm border-x-0 border-t-0 border-radius-0" maxlength="10" v-model.trim="form.userpass_cf" placeholder="Userpass" id="password_cf">
                <span class="input-group-btn" @click="showPassword_cf = !showPassword_cf">
                      <a class="btn btn-sm bg-navy"><i class="far text-white" :class="[ !showPassword_cf ? 'fa-eye' : 'fa-eye-slash' ]" ></i></a>
                    </span>
              </div> 
              <span class="text-danger" v-if="!validatePassword('userpass_match')">{{ ui.csm_v2_valid_password_match }}</span>              
            </div>
          </div>
          <div class="col-md-12">
            <button class="btn btn-sm btn-block border-radius-10 bg-success-v2 text-white margin-b-10" style="padding : 12px 100px;" @click="LineOA_Before_CreateUser()">{{ ui.csm_v2_register }}</button>
          </div>
        </div>
      </div>
    </div>

    <div v-show="!show" class="container-fluid success" style="width : 100%;"
    :style="{
      'background': 'url(' + baseUrl + 'vendor/Content/Images/PNG/success-submit3.png), linear-gradient(to bottom, #00BF9D 0%, #00BF9D 53%, white 0%, white 100%)',
      'background-size': 'auto, auto',
      'background-repeat': 'no-repeat',
      'background-position': '50% 50%'
    }"

    >

    </div>


    <loading-box ref="myLB"></loading-box>
  </div>
</template>

<script>
import { onMounted, reactive, computed, ref, nextTick } from "vue";
import loadingBox from './../../../Center/loading-box.vue'

export default {
  props : {
    maincode : String,
    pre_event : String,
    pre_event2 : String
  },
  components: {
    loadingBox
  },
  data() {
    return {
      baseUrl,
      auth,
      baseRoute,
      queryString,
      ui: window.ui,
      xt: $xt,
      company: window.baseCompany,
      customer : window.customer_auth,
      form : {},
      show : false,
      showPassword : false,
      showPassword_cf : false
      }
  },
  methods: {
    async LineOA_CheckHouse() {
      let action = `AnywhereAPI/CSM/LineOA_CheckHouse?maincode=${this.maincode}&pre_event2=${this.pre_event2}&pre_event=${this.pre_event}`
      let resp = await $xt.getServer(action);
      if($xt.isEmpty(resp.data)) {
        await $msg.alert('System Error', ` Data not found`, 'danger')
        window.location = baseUrl + 'page/v2/v_csm_line_register/data_not_found';
      } else {
        let data = resp.data
        this.form = {
          maincode : data.maincode,
          pre_event2 : data.pre_event2, 
          pre_event : data.pre_event,
          pre_des : data.pre_des,
          projrunno : data.projrunno,
          address : data.address,
          customer_code : data.customer_code,
          customer_name : data.customer_name
        }
        this.show = true
      }
    },
    async LineOA_Before_CreateUser(){
      let user = this.form
      if($xt.isEmpty(user.name_th) || $xt.isEmpty(user.telephone) || $xt.isEmpty(user.mail) || $xt.isEmpty(user.userid) || $xt.isEmpty(user.userpass)) {
        $msg.alert(this.ui.csm_v2_warning, this.ui.csm_v2_alert_incomplete, 'warning')
        return
      }
      if(!this.validatePassword('userpass')) {
        return
      }
      if(!this.validatePassword('userpass_match')) {
        return
      }
      this.LineOA_CreateUser()
    },
    async LineOA_CreateUser(){
      this.$refs.myLB.show()
      try {
        this.form.userid = this.form.userid.toLowerCase()
        let obj = {
          data : this.form
        }
        let url = `AnywhereAPI/CSM/LineOA_RegisterUser`
        let resp = await $xt.postServerJson(url, obj)
        if(!resp.success) {
          throw resp.error
        }
        this.show = false
      } catch (error) {
        $msg.alert('Error', error.toString(), 'danger')
      } finally {
        this.$refs.myLB.hide()
      }
    },

    ToggleShowpassword(){
      let password = $('#password').attr("type")
      if(password === "password") {
        $('#password').attr("type","text")
        $('#toggle_eye').addClass('fa-eye').removeClass('fa-eye-slash')
      } else {
        $('#password').attr("type","password")
        $('#toggle_eye').addClass('fa-eye-slash').removeClass('fa-eye')
      }
    },
    CopyClipboard(){
      if($xt.isEmpty(this.form.userpass)) {
        $notify.warning(this.ui.csm_v2_alert_no_password);
      } else {
        navigator.clipboard.writeText(this.form.userpass)
        $notify.success(this.ui.csm_v2_alert_copy_password);

      }
    },
    validatePassword(keyword) {
      // const pattern = /^(?=.*[!@#$%^&*()-_=+[\]{};:'",.<>/?])[\w!@#$%^&*()-_=+[\]{};:'",.<>/?]{8,}$/;
      // const pattern = /^^(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\-]).{8,}$/;
      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,10}$/;

      switch(keyword) {
        case "userpass" :
          return pattern.test(this.form.userpass)
        case "userpass_match" :
          return pattern.test(this.form.userpass_cf) && this.form.userpass == this.form.userpass_cf
      }
    },
    onlyPressNumber() {
      
      this.form.telephone = this.form.telephone.replace(/[^0-9]/g, '')
      // this.form.contract_tel = this.form.contract_tel.replace(/[^0-9]/g, '');
    },
    filterInput(event) {
      this.form.userid = event.target.value.replace(/[^a-z0-9]/gi, '')
    }

  },
  async mounted(){
    await this.LineOA_CheckHouse()
    // this.$nextTick(() => {
    //   $('.success').css({'width': '100%',
    //   'background' : 'url('+this.baseUrl+'vendor/Content/Images/PNG/success-submit2.png), linear-gradient(to bottom, #00BF9D 0%, #00BF9D 53%, white 0%, white 100%)',
    //   'background-size': 'auto, auto',
    //   'background-repeat' : 'no-repeat',
    //   'background-position' : '50% 50%'})
    // })

    // nextTick(() => {
    //   $(window).resize(() => {
        $(".success").css({
          "min-height" : ($(window).height()  ) + "px",
        })

    //   });
    //   $(window).trigger("resize");
    // });

  }
}
</script>

<style scope>
@import './../CSS/Style.css';
</style>