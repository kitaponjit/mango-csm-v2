import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

import { formatNumberFilter, formatDateFilter } from './vue-filters'

// Start : Component Page Center
import actionLink from './Components/Center/action-link.vue'
import datepicker from './Components/Center/datepicker.vue'
import timepicker from './Components/Center/timepicker.vue'
import inumber from './Components/Center/number.vue'
import pagination from './Components/Center/pagination.vue'
import pagination2 from './Components/Center/pagination-2.vue'
import modal from './Components/Center/modal.vue'
import modal_2 from './Components/Center/modal-2.vue'
import appForm from './Components/Center/form-template.vue'
import appForm_erp from './Components/Center/form-template-2.vue'
import rePage from './Components/Layouts/re-layout.vue'
import customerPage from './Components/Layouts/customer-layout.vue'
import tableStick from './Components/Center/table-sticky.vue'
import tableStick2 from './Components/Center/table-sticky-2.vue'
import input from './Components/Center/input.vue'
import agReport from './Components/Center/ag-report.vue'
import ag_table from './Components/Center/ag-table.vue'
import modal_3 from './Components/Center/modal-3.vue'
import importData from './Components/Center/import-data.vue'
// End : Component Page Center

// Start : Modal Data Center
import ModalProject from './Components/Pages/Center/ct-project.vue'
import Modal2Project from './Components/Pages/Center/ct-project-2.vue'
import ModalProjectUnit from './Components/Pages/Center/ct-project-unit.vue'
import ModalWorkType from './Components/Pages/Center/ct-worktype.vue'
import ModalDepartment from './Components/Pages/Center/ct-department.vue'
import ModalCMCustomer from './Components/Pages/Center/ct-cm-customer.vue'
import ModalARCustomer from './Components/Pages/Center/ct-ar-customer.vue'
import ModalEMP from './Components/Pages/Center/ct-hr-emp.vue'
import ModalResponsibleEMP from './Components/Pages/Center/ct-emp-proj.vue'
import ModalItemCode from './Components/Pages/Center/ct-ibrcode.vue'
import ModalForm from './Components/Pages/Center/ct-form.vue'
import ModalAddspec from './Components/Pages/Center/ct-addspec.vue'
import ModalArea from './Components/Pages/Center/ct-area.vue'
import ModalAddspecrpt from './Components/Pages/Center/ct-addspec-rpt.vue'
import ModalJobs from './Components/Pages/Center/ct-jobs-type.vue'
// End : Modal Data Center

// Import : Information Center
import Company from './Components/Pages/Center/ct-company.vue'
// End : Information Center


// Start : Component Libary Other
import VTooltip from 'v-tooltip'
import feather from 'vue-icon'
import VuePictureSwipe from 'vue-picture-swipe'
import vueEventCalendar from 'vue-event-calendar'
import VueSweetalert2 from 'vue-sweetalert2'
import ElementLoading from 'vue-element-loading'
import VueSelect2 from 'v-select2-component'

import VueDocPreview from 'vue-doc-preview'
import VuePdfApp from 'vue-pdf-app'

import { plugin as echartsPlugin } from 'echarts-for-vue'
import * as echarts from 'echarts'

import { LicenseManager } from 'ag-grid-enterprise'
import VScrollSync from 'v-scroll-sync'
import VueThaiAddressInput from 'vue-thai-address-input'
import 'vue-thai-address-input/dist/vue-thai-address-input.css'

import PrettyCheckbox from 'pretty-checkbox-vue'
import 'pretty-checkbox/dist/pretty-checkbox.min.css'



LicenseManager.setLicenseKey("CompanyName=Mango Consultant Company Limited,LicensedGroup=MANGO CONSULTANT COMPANY LIMITED,LicenseType=MultipleApplications,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=0,AssetReference=AG-012819,ExpiryDate=11_January_2022_[v2]_MTY0MTg1OTIwMDAwMA==9cb9e9dbbb58c7885b88637b76cdafac")

import 'vue-event-calendar/dist/style.css'
import 'sweetalert2/dist/sweetalert2.min.css'
import '../../../Content/DarkTheme.css'
import './Components/Center/CSS/lookup-sheet-responsive.css'
import attachFile from './Components/Center/file-attach.vue'
import attachFileV2 from './Components/Center/file-attach-v2.vue'
import VoiceTyping from './Components/Center/voice-typing.vue'
import ModalDep from './Components/Pages/Transaction/components/vs_csm_trn_descmodal.vue'
import ModalWorkCalendar from './Components/Pages/Transaction/components/vs_csm_trn_workcalendar.vue'
import ModalApproveDetail from './Components/Pages/Transaction/components/vs_csm_trn_approvemodal.vue'
import ModalCancelRequest from './Components/Pages/Transaction/components/vs_csm_trn_cancelmodal.vue'
import ModalDescription2 from './Components/Pages/Transaction/components/vs_csm_trn_descmodal2.vue'
import ModalMapPreview from './Components/Pages/Transaction/components/vs_csm_trn_mappreview.vue'
import ModalSelectPlan from './Components/Pages/Transaction/components/vs_csm_trn_selectplan.vue'
import ModalChangeDetailTask from './Components/Pages/Transaction/components/vs_csm_trn_changedetailtask.vue'
import ModalAiAnalysis from './Components/Pages/Transaction/components/vs_csm_trn_aianalysis.vue'
import ModalAddWorker from './Components/Pages/Transaction/components/vs_csm_trn_addworker.vue'
import ModalAlertSW from './Components/Pages/Transaction/components/vs_csm_trn_alertsw.vue'
import ModalAiAnalysisEdit from './Components/Pages/Transaction/components/vs_csm_trn_aianalysis_edit.vue'
import ModalAiGenDraft from './Components/Pages/Default/components/vs_csm_ai_gen_draft.vue'
import { ColorPicker, ColorPanel } from 'one-colorpicker'

import ModalCustomerConfig from './Components/Pages/Center/ct-customer-config.vue'

// V2 Component
import ModalDesV2 from './Components/Pages/V2/Components/descmodal.vue'

// End : Component Libary Other

import store from './Store/store.js'
import { create } from 'jsondiffpatch'

const jsondiffpatch = create({
  objectHash: obj => obj.itemno || obj.id || JSON.stringify(obj)
})
window.jsondiffpatch = jsondiffpatch


Vue.config.keyCodes.f2 = 113
Vue.prototype.$date = formatDateFilter
Vue.prototype.$num = formatNumberFilter
Vue.use(VueRouter)
Vue.use(VTooltip)
Vue.use(feather, 'v-icon')
Vue.use(vueEventCalendar, { locale: 'en', color: '#010c1b' })
Vue.use(VueSweetalert2)
Vue.use(echartsPlugin, { echarts })
Vue.use(ColorPanel)
Vue.use(ColorPicker)
Vue.use(VScrollSync, { throttle: 1 })
Vue.use(VueThaiAddressInput)
Vue.use(PrettyCheckbox)

Vue.component('vue-picture-swipe', VuePictureSwipe)
Vue.component('vue-element-loading', ElementLoading)

Vue.component('action-link', actionLink)
Vue.component('datepicker', datepicker)
Vue.component('timepicker', timepicker)
Vue.component('number', inumber)
Vue.component('app-form', appForm)
Vue.component('app-form-2', appForm_erp)
Vue.component('re-page', rePage)
Vue.component("customer-page", customerPage)
Vue.component('modal', modal)
Vue.component('modal-2', modal_2)
Vue.component('pagination', pagination)
Vue.component('pagination-2', pagination2)
Vue.component('table-stick', tableStick)
Vue.component('table-stick-2', tableStick2)
Vue.component('i-input', input)
Vue.component('ag-report', agReport)
Vue.component('ag-table', ag_table)
Vue.component('modal-3', modal_3)
Vue.component('import-data', importData)
Vue.component('vue-project-list', ModalProject)
Vue.component('vue-project2-list', Modal2Project)
Vue.component('vue-project-unit-list', ModalProjectUnit)
Vue.component('vue-department-list', ModalDepartment)
Vue.component('vue-worktype-list', ModalWorkType)
Vue.component('vue-cm-customer-list', ModalCMCustomer)
Vue.component('vue-ar-customer-list', ModalARCustomer)
Vue.component('vue-employee-list', ModalEMP)
Vue.component('vue-responsible-employee-list', ModalResponsibleEMP)
Vue.component('vue-itemcode-list', ModalItemCode)
Vue.component('vue-form-list', ModalForm)
Vue.component('vue-addspec-list', ModalAddspec)
Vue.component('vue-select-2', VueSelect2)
Vue.component('file-attach', attachFile)
Vue.component('file-attach-v2', attachFileV2)
Vue.component('voice-typing', VoiceTyping)
Vue.component("description-modal", ModalDep)
Vue.component("description-modal-v2", ModalDesV2)
Vue.component("vue-area-list", ModalArea)
Vue.component("worker-calendar-modal", ModalWorkCalendar)
Vue.component("approve-detail-modal", ModalApproveDetail)
Vue.component("cancel-request-modal", ModalCancelRequest)
Vue.component("document-description-modal", ModalDescription2)
Vue.component("map-preview-modal", ModalMapPreview)
Vue.component("select-plan-modal", ModalSelectPlan)
Vue.component("change-detail-task-modal", ModalChangeDetailTask)
Vue.component("ai-analysis-modal", ModalAiAnalysis)
Vue.component("add-worker-modal", ModalAddWorker)
Vue.component("alert-sw-modal", ModalAlertSW)
Vue.component("ai-analysis-edit-modal", ModalAiAnalysisEdit)
Vue.component("ai-gen-draft-modal", ModalAiGenDraft)
Vue.component("vue-customer-config", ModalCustomerConfig)
Vue.component("vue-addspec-rpt", ModalAddspecrpt) 
Vue.component("vue-job", ModalJobs)
/* Component : Information Center */
Vue.component('vue-company-list', Company)

Vue.component('VueDocPreview', VueDocPreview)
Vue.component('vue-pdf-app', VuePdfApp)

const router = new VueRouter({
  routes,
  mode: 'history'
})

const bundleLangCode = { TH: 'TH', EN_MASTER: 'EN' }

let langBundle = null
const getLangBundle = async () => {
  if (langBundle) return langBundle
  try {
    /* no-cache = ถาม server ทุกครั้งว่าไฟล์เปลี่ยนไหม ถ้าไม่เปลี่ยนได้ 304 ไม่ต้องโหลดใหม่ทั้งก้อน
       ใช้ ?v=viewVersion อย่างเดียวไม่พอ เพราะคำแปลเปลี่ยนได้โดยไม่ต้อง build ใหม่ */
    let resp = await fetch(`${baseUrl}Scripts/Others/lang_bundle.json`, { cache: 'no-cache' })
    langBundle = await resp.json()
  }
  catch (err) {
    console.error(err)
    langBundle = {}
  }
  window.langBundle = langBundle
  return langBundle
}

/* ภาษาที่ยังไม่มีแถวใน sm_ui_language ใช้ EN_MASTER รองพื้นไว้ จะได้ไม่มีป้ายว่าง */
let fallbackUi = null
const getFallbackUi = async () => {
  if (fallbackUi) return fallbackUi
  try {
    let resp = await $xt.getServer(`api/public/LanguageSelector?lang_code=EN_MASTER`)
    fallbackUi = resp.data.uiLang || {}
  }
  catch (err) {
    console.error(err)
    fallbackUi = {}
  }
  return fallbackUi
}

router.beforeEach(async (to, from, next) => {
  if (to.meta.redirect) {
    window.location.href = to.meta.redirect
    return
  }

  let menu_name = ''
  let menu_id = ''
  let checkRight = false

  if (to.meta.mangoMenu && to.meta.mangoMenu.checkUserRight) {
    checkRight = true
    menu_name = to.meta.mangoMenu.menu_name || ''
    menu_id = to.meta.mangoMenu.menu_id || ''
  } else if (to.meta.mangoMenu && !to.meta.mangoMenu?.checkUserRight) { // Retrieve user rights for permission checks before using the Mango control panel, without restricting page access. (CustomerDataView -> Application).
    menu_name = to.meta.mangoMenu.menu_name || ''
    menu_id = to.meta.mangoMenu.menu_id || ''
  }

  let user_lang = localStorage.getItem('user_lang') || ''
  let resp_lang = await $xt.getServer(`api/public/LanguageSelector?lang_code=${user_lang}`)
  let bundle = await getLangBundle()
  let bundle_lang = bundleLangCode[user_lang] || user_lang || 'TH'

  let lang_data = (resp_lang.data || {}).lang || {}

  /* ตัด key ที่ยังไม่ได้แปลออก จะได้ปล่อยให้ bundle เติมแทนที่จะขึ้นค่าว่าง */
  let uiLang = (resp_lang.data || {}).uiLang || {}
  Object.keys(uiLang).forEach(x => { if ($xt.isEmpty(uiLang[x])) delete uiLang[x] })

  let db_lang = (lang_data.langList || []).map(x => x.lang_code)
  let base = user_lang && db_lang.indexOf(user_lang) < 0 ? await getFallbackUi() : {}

  window.ui = Object.assign({}, base, bundle.translate?.[bundle_lang], uiLang)
  window.langList = lang_data

  if (to.name == 'login') {
    if (window.location.hostname === 'csr.mangoconsultant.com' && window.location.href.toLowerCase().indexOf('/login_cust/') < 0) {
      window.location.href = '/page/authentication/login_cust/'
      return
    }
  }



  if (to.meta.auth) {
    let resp_init = await $xt.getServer(`api/public/ViewUserAuthentication?menu_name=${encodeURIComponent(menu_name)}&lang_code=&menu_id=${encodeURIComponent(menu_id)}`)
    let auth = resp_init.data.auth
    let appinfo = resp_init.data.appinfo
    let userRight = resp_init.data.menu_right || []
    let projectRight = resp_init.data.project_right || []

    window.auth = auth
    window.appinfo = appinfo
    window.userRight = userRight
    window.projectRight = projectRight
  }

  if (to.meta.customer) {
    let rsp = await $xt.getCustomerServer(`CSM/AuthCustomer/GetInitCustomerData`)
    let customerAuth = rsp.data.cus_auth
    window.customer_auth = customerAuth
    if (to.meta.customer_auth && !customerAuth.is_authen) {
      window.location.href = baseUrl + 'page/authentication/login_cust/'
    }
  }

  if (to.meta.customer_v2) {
    let rsp = await $xt.getCustomerServer(`CSM/AuthCustomer/GetInitCustomerData`)
    let customerAuth = rsp.data.cus_auth
    window.customer_auth = customerAuth
    if (to.meta.customer_auth && !customerAuth.is_authen) {
      localStorage.removeItem('customer_auth')
      localStorage.removeItem('customer_login')
      window.location.href = baseUrl + 'page/v2/authentication/login/'
    }

    if (customerAuth.is_authen && !$xt.isEmpty(customerAuth.lang_web) && customerAuth.lang_web != (localStorage.getItem('user_lang') || '')) {
      localStorage.setItem('user_lang', customerAuth.lang_web)
      window.location.reload()
      return
    }
  }
  if (checkRight && to.name !== 'access_denied') {
    let isEnable = $linq(window.userRight).any(x => x.menu_id == menu_id && x.isenabled == 1)

    if (!isEnable) {
      window.location.href = baseUrl + `page/error/access_denied/`
      return
    }

    if (window.projectRight.length > 0) {
      let pre_event2 = $xt.queryString.pre_event2 || ''
      if ($xt.isEmpty(pre_event2) && !$xt.isEmpty($xt.queryString.pre_event)) {
        let pre_event = $xt.queryString.pre_event || ''
        pre_event2 = pre_event.substring(pre_event.length - 4, pre_event.length) + pre_event.substring(0, 3)
      }
      if (!$xt.isEmpty(pre_event2)) {
        if (!$linq(window.projectRight).any(x => x.pre_event2 === pre_event2)) {
          window.location.href = baseUrl + `page/error/access_denied/`
          return
        }
      }
    }
  }

  if (to.meta.isAdmin && !auth.is_admin) {
    window.location.href = baseUrl + `page/error/access_denied/`
    return
  }

  if (to.meta.userMango && auth.userid.toLowerCase() !== 'mango') {
    window.location.href = baseUrl + `page/error/access_denied/`
    return
  }

  if (to.name === 'login' && auth.is_authen) {
    window.location.href = baseUrl + 'page/'
  } else if (to.meta.auth && !auth.is_authen) {
    window.location.href = baseUrl + 'page/authentication/login/'
  } else {
    $('#firstLoading').hide()
    next()
  }
})


Vue.config.devtools = true
Vue.prototype.$eventBus = new Vue();

new Vue({
  store,
  router,
}).$mount("#app")
