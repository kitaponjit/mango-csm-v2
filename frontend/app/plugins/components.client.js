import actionLink from '~/Components/Center/action-link.vue'
// Local replacements for the Vue-2-only packages that had no Vue 3 build.
// See each file's header for what it reproduces and why.
import vueSelect2 from '~/Components/Center/vue-select-2.vue'
import vueElementLoading from '~/Components/Center/vue-element-loading.vue'
import pCheck from '~/Components/Center/p-check.vue'
import vuePdfApp from '~/Components/Center/vue-pdf-app.vue'
import vueEventCalendar from '~/Components/Center/vue-event-calendar.vue'
import docPreview from '~/Components/Center/doc-preview.vue'
import datepicker from '~/Components/Center/datepicker.vue'
import timepicker from '~/Components/Center/timepicker.vue'
import inumber from '~/Components/Center/number.vue'
import appForm from '~/Components/Center/form-template.vue'
import appForm_erp from '~/Components/Center/form-template-2.vue'
import rePage from '~/Components/Layouts/re-layout.vue'
import customerPage from '~/Components/Layouts/customer-layout.vue'
import modal from '~/Components/Center/modal.vue'
import modal_2 from '~/Components/Center/modal-2.vue'
import pagination from '~/Components/Center/pagination.vue'
import pagination2 from '~/Components/Center/pagination-2.vue'
import tableStick from '~/Components/Center/table-sticky.vue'
import tableStick2 from '~/Components/Center/table-sticky-2.vue'
import input from '~/Components/Center/input.vue'
import agReport from '~/Components/Center/ag-report.vue'
import ag_table from '~/Components/Center/ag-table.vue'
import modal_3 from '~/Components/Center/modal-3.vue'
import importData from '~/Components/Center/import-data.vue'
import ModalProject from '~/Components/Pages/Center/ct-project.vue'
import Modal2Project from '~/Components/Pages/Center/ct-project-2.vue'
import ModalProjectUnit from '~/Components/Pages/Center/ct-project-unit.vue'
import ModalDepartment from '~/Components/Pages/Center/ct-department.vue'
import ModalWorkType from '~/Components/Pages/Center/ct-worktype.vue'
import ModalCMCustomer from '~/Components/Pages/Center/ct-cm-customer.vue'
import ModalARCustomer from '~/Components/Pages/Center/ct-ar-customer.vue'
import ModalEMP from '~/Components/Pages/Center/ct-hr-emp.vue'
import ModalResponsibleEMP from '~/Components/Pages/Center/ct-emp-proj.vue'
import ModalItemCode from '~/Components/Pages/Center/ct-ibrcode.vue'
import ModalForm from '~/Components/Pages/Center/ct-form.vue'
import ModalAddspec from '~/Components/Pages/Center/ct-addspec.vue'
import attachFile from '~/Components/Center/file-attach.vue'
import attachFileV2 from '~/Components/Center/file-attach-v2.vue'
import VoiceTyping from '~/Components/Center/voice-typing.vue'
import ModalDep from '~/Components/Pages/Transaction/components/vs_csm_trn_descmodal.vue'
import ModalDesV2 from '~/Components/Pages/V2/Components/descmodal.vue'
import ModalArea from '~/Components/Pages/Center/ct-area.vue'
import ModalWorkCalendar from '~/Components/Pages/Transaction/components/vs_csm_trn_workcalendar.vue'
import ModalApproveDetail from '~/Components/Pages/Transaction/components/vs_csm_trn_approvemodal.vue'
import ModalCancelRequest from '~/Components/Pages/Transaction/components/vs_csm_trn_cancelmodal.vue'
import ModalDescription2 from '~/Components/Pages/Transaction/components/vs_csm_trn_descmodal2.vue'
import ModalMapPreview from '~/Components/Pages/Transaction/components/vs_csm_trn_mappreview.vue'
import ModalSelectPlan from '~/Components/Pages/Transaction/components/vs_csm_trn_selectplan.vue'
import ModalChangeDetailTask from '~/Components/Pages/Transaction/components/vs_csm_trn_changedetailtask.vue'
import ModalAiAnalysis from '~/Components/Pages/Transaction/components/vs_csm_trn_aianalysis.vue'
import ModalAddWorker from '~/Components/Pages/Transaction/components/vs_csm_trn_addworker.vue'
import ModalAlertSW from '~/Components/Pages/Transaction/components/vs_csm_trn_alertsw.vue'
import ModalAiAnalysisEdit from '~/Components/Pages/Transaction/components/vs_csm_trn_aianalysis_edit.vue'
import ModalAiGenDraft from '~/Components/Pages/Default/components/vs_csm_ai_gen_draft.vue'
import ModalCustomerConfig from '~/Components/Pages/Center/ct-customer-config.vue'
import ModalAddspecrpt from '~/Components/Pages/Center/ct-addspec-rpt.vue'
import ModalJobs from '~/Components/Pages/Center/ct-jobs-type.vue'
import Company from '~/Components/Pages/Center/ct-company.vue'

export default defineNuxtPlugin((nuxtApp) => {
  const app = nuxtApp.vueApp

  app.component('action-link', actionLink)
  app.component('datepicker', datepicker)
  app.component('timepicker', timepicker)
  app.component('number', inumber)
  app.component('app-form', appForm)
  app.component('app-form-2', appForm_erp)
  app.component('re-page', rePage)
  app.component('customer-page', customerPage)
  app.component('modal', modal)
  app.component('modal-2', modal_2)
  app.component('pagination', pagination)
  app.component('pagination-2', pagination2)
  app.component('table-stick', tableStick)
  app.component('table-stick-2', tableStick2)
  app.component('i-input', input)
  app.component('ag-report', agReport)
  app.component('ag-table', ag_table)
  app.component('modal-3', modal_3)
  app.component('import-data', importData)
  app.component('vue-project-list', ModalProject)
  app.component('vue-project2-list', Modal2Project)
  app.component('vue-project-unit-list', ModalProjectUnit)
  app.component('vue-department-list', ModalDepartment)
  app.component('vue-worktype-list', ModalWorkType)
  app.component('vue-cm-customer-list', ModalCMCustomer)
  app.component('vue-ar-customer-list', ModalARCustomer)
  app.component('vue-employee-list', ModalEMP)
  app.component('vue-responsible-employee-list', ModalResponsibleEMP)
  app.component('vue-itemcode-list', ModalItemCode)
  app.component('vue-form-list', ModalForm)
  app.component('vue-addspec-list', ModalAddspec)
  app.component('file-attach', attachFile)
  app.component('file-attach-v2', attachFileV2)
  app.component('voice-typing', VoiceTyping)
  app.component('description-modal', ModalDep)
  app.component('description-modal-v2', ModalDesV2)
  app.component('vue-area-list', ModalArea)
  app.component('worker-calendar-modal', ModalWorkCalendar)
  app.component('approve-detail-modal', ModalApproveDetail)
  app.component('cancel-request-modal', ModalCancelRequest)
  app.component('document-description-modal', ModalDescription2)
  app.component('map-preview-modal', ModalMapPreview)
  app.component('select-plan-modal', ModalSelectPlan)
  app.component('change-detail-task-modal', ModalChangeDetailTask)
  app.component('ai-analysis-modal', ModalAiAnalysis)
  app.component('add-worker-modal', ModalAddWorker)
  app.component('alert-sw-modal', ModalAlertSW)
  app.component('ai-analysis-edit-modal', ModalAiAnalysisEdit)
  app.component('ai-gen-draft-modal', ModalAiGenDraft)
  app.component('vue-customer-config', ModalCustomerConfig)
  app.component('vue-addspec-rpt', ModalAddspecrpt)
  app.component('vue-job', ModalJobs)
  app.component('vue-company-list', Company)

  // Replacements for the previously unregistered Vue-2-only components.
  app.component('vue-select-2', vueSelect2)
  app.component('vue-element-loading', vueElementLoading)
  app.component('p-check', pCheck)
  app.component('vue-pdf-app', vuePdfApp)
  app.component('vue-event-calendar', vueEventCalendar)
  app.component('VueDocPreview', docPreview)
})
