<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { createWarrantyGroupService } from '~/features/warranty-group/warranty-group-service'
import { normalizeWarrantyGroupPage, type WarrantyGroup } from '~/features/warranty-group/warranty-group-model'
import {
  applyWarrantyItemLifetime,
  createWarrantyItemForm,
  selectDefaultWarrantyGroup,
  toWarrantyItemHeader,
  validateWarrantyItemForm,
  type WarrantyItemForm,
} from '~/features/warranty-item/warranty-item-model'
import TargetDialog from '~/components/ui/TargetDialog.vue'
import TargetState from '~/components/ui/TargetState.vue'
import {
  DEFAULT_SEARCH,
  DEFAULT_TAKE,
  getPageCount,
  getSkip,
  normalizeWarrantyItemPage,
  rowNumber,
  toActiveParam,
  type WarrantyItem,
  type WarrantyItemSearchField,
} from '~/features/warranty-item/warranty-item-model'
import { WARRANTY_ITEM_MENU_ID, WARRANTY_ITEM_MENU_NAME } from '~/features/warranty-item/warranty-item-access'
import { createWarrantyItemService } from '~/features/warranty-item/warranty-item-service'
import { DEFAULT_IMPORT_MAPPING, mapImportRows, parsePastedImportSheet, type WarrantyItemImportMapping } from '~/features/warranty-item/warranty-item-import'
import { MAS002_TEXTS } from '~/features/warranty-item/warranty-item-texts'
import type { AccessControlResult } from '~/services/access/access-control-service'

type ViewStatus = 'idle' | 'loading' | 'ready' | 'error'
type AccessViewState = { status: 'checking' } | AccessControlResult

const api = useApiClient()
const localization = useLocalizationAdapter()
const session = useSessionAdapter()
const access = useAccessControlService()
const service = createWarrantyItemService(api)
const groupService = createWarrantyGroupService(api)
const REVIEW_TEXTS: Record<string, string> = {
  'mas002.saveSuccess': 'Warranty Item saved successfully.',
  'mas002.deleteSuccess': 'Warranty Item deleted successfully.',
  'mas002.deleteConfirm': 'Delete Warranty Item {code} — {name}?',
  'mas002.groupsError': 'Unable to load Warranty Groups.',
  'mas002.invalidField': 'Please correct this field.',
}

function t(key: string) {
  const localized = localization.t(key)
  return localized !== key ? localized : MAS002_TEXTS[localization.language]?.[key] ?? REVIEW_TEXTS[key] ?? key
}
useHead({ title: t('mas002.title') })

const rows = ref<WarrantyItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const searchField = ref<WarrantyItemSearchField>(DEFAULT_SEARCH.field)
const searchText = ref(DEFAULT_SEARCH.text)
const activeOnly = ref(DEFAULT_SEARCH.active === 'Y')
const listStatus = ref<ViewStatus>('idle')
const listError = ref('')
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const form = ref<WarrantyItemForm>(createWarrantyItemForm())
const groups = ref<WarrantyGroup[]>([])
const groupError = ref('')
const saveError = ref('')
const saveMessage = ref('')
const savePending = ref(false)
const deletePending = ref(false)
const deleteError = ref('')
const formError = ref('')
const validationField = ref<keyof WarrantyItemForm | undefined>()
const readError = ref('')
const readCode = ref('')
const readLoading = ref(false)
const importOpen = ref(false)
const importText = ref('')
const importMapping = ref<WarrantyItemImportMapping>({ ...DEFAULT_IMPORT_MAPPING })
const importError = ref('')
const importPending = ref(false)
const accessResult = ref<AccessViewState>({ status: 'checking' })
let accessGeneration = 0

const hasReadAccess = computed(() => accessResult.value.status === 'readonly' || accessResult.value.status === 'editable')
const canEdit = computed(() => accessResult.value.status === 'editable' && listStatus.value === 'ready' && !savePending.value && !deletePending.value && !readLoading.value)
const isBusy = computed(() => listStatus.value === 'loading')
const skip = computed(() => getSkip(currentPage.value, DEFAULT_TAKE, total.value))
const pageCount = computed(() => getPageCount(total.value, DEFAULT_TAKE))

function clearAccessOwnedState() {
  rows.value = []
  total.value = 0
  currentPage.value = 1
  searchField.value = DEFAULT_SEARCH.field
  searchText.value = DEFAULT_SEARCH.text
  activeOnly.value = true
  listStatus.value = 'idle'
  listError.value = ''
}

async function loadList(generation = accessGeneration) {
  if (generation !== accessGeneration || !hasReadAccess.value) return
  listStatus.value = 'loading'
  listError.value = ''
  const result = await service.readList({
    skip: skip.value,
    take: DEFAULT_TAKE,
    field: searchField.value,
    text: searchText.value,
    active: toActiveParam(activeOnly.value),
  })
  if (generation !== accessGeneration || !hasReadAccess.value) return
  if (!result.ok) {
    listStatus.value = 'error'
    listError.value = result.error.message
    return
  }
  const page = normalizeWarrantyItemPage(result.data)
  if (!page) {
    listStatus.value = 'error'
    listError.value = t('mas002.invalidResponse')
    return
  }
  rows.value = page.data
  total.value = page.total
  listStatus.value = 'ready'
}

async function initializePage() {
  const generation = ++accessGeneration
  clearAccessOwnedState()
  accessResult.value = { status: 'checking' }
  if (!session.getContext().isAuthenticated) {
    accessResult.value = { status: 'anonymous' }
    session.redirectToLogin()
    return
  }
  const result = await access.checkMenuAccess(WARRANTY_ITEM_MENU_NAME, WARRANTY_ITEM_MENU_ID)
  if (generation !== accessGeneration) return
  accessResult.value = result
  if (result.status === 'anonymous') {
    session.redirectToLogin()
    return
  }
  if (result.status === 'readonly' || result.status === 'editable') await loadList(generation)
}

function doSearch() {
  if (!hasReadAccess.value || isBusy.value) return
  currentPage.value = 1
  void loadList()
}

function goPage(page: number) {
  if (!hasReadAccess.value || isBusy.value) return
  currentPage.value = Math.min(Math.max(1, Math.trunc(page) || 1), pageCount.value)
  void loadList()
}

const importPreview = computed(() => {
  try {
    return { rows: mapImportRows(parsePastedImportSheet(importText.value), importMapping.value), error: '' }
  } catch (error) {
    return { rows: [], error: error instanceof Error ? error.message : String(error) }
  }
})

function openImport() {
  if (!canEdit.value) return
  importOpen.value = true
  importText.value = ''
  importMapping.value = { ...DEFAULT_IMPORT_MAPPING }
  importError.value = ''
}

function closeImport() {
  if (!importPending.value) importOpen.value = false
}

async function submitImport() {
  if (!canEdit.value || !importOpen.value || importPending.value) return
  importError.value = importPreview.value.error
  if (importError.value || importPreview.value.rows.length === 0) {
    if (!importError.value) importError.value = t('mas002.importEmpty')
    return
  }
  importPending.value = true
  try {
    const result = await service.importData(importPreview.value.rows)
    if (!result.ok) {
      importError.value = result.error.message
      return
    }
    importOpen.value = false
    saveMessage.value = `${t('mas002.importSuccess')} (${importPreview.value.rows.length})`
    await loadList()
  } finally {
    importPending.value = false
  }
}

async function loadGroups() {
  groups.value = []
  groupError.value = ''
  const result = await groupService.readList({ skip: 0, take: DEFAULT_TAKE, field: 'type_code', text: '', active: 'Y' })
  if (!result.ok) {
    groupError.value = `${t('mas002.groupsError')} ${result.error.message}`
    return
  }
  const page = normalizeWarrantyGroupPage(result.data)
  if (!page) {
    groupError.value = `${t('mas002.groupsError')} ${t('mas002.invalidResponse')}`
    return
  }
  groups.value = page.data
}

async function openCreate() {
  if (!canEdit.value) return
  dialogMode.value = 'create'
  form.value = createWarrantyItemForm()
  saveError.value = ''
  saveMessage.value = ''
  formError.value = ''
  validationField.value = undefined
  readError.value = ''
  readCode.value = ''
  await loadGroups()
  dialogOpen.value = true
  const selected = selectDefaultWarrantyGroup(groups.value)
  if (selected) form.value.type_code = selected.type_code
}

async function openEdit(code: string) {
  if (!canEdit.value) return
  readCode.value = code
  readLoading.value = true
  saveError.value = ''
  saveMessage.value = ''
  formError.value = ''
  validationField.value = undefined
  readError.value = ''
  await loadGroups()
  const result = await service.readOne(code)
  readLoading.value = false
  if (!result.ok) {
    readError.value = result.error.message
    return
  }
  if (!result.data) {
    readError.value = t('mas002.invalidResponse')
    return
  }
  dialogMode.value = 'edit'
  form.value = createWarrantyItemForm(result.data)
  dialogOpen.value = true
}

function closeDialog() {
  if (!savePending.value) dialogOpen.value = false
}

function validationMessage(field: keyof WarrantyItemForm | undefined) {
  return field ? `${field}: ${t('mas002.invalidField')}` : t('mas002.invalidInput')
}

function fieldHasError(field: keyof WarrantyItemForm) {
  return validationField.value === field
}

async function deleteRow(row: WarrantyItem) {
  if (!canEdit.value || deletePending.value) return
  const message = t('mas002.deleteConfirm').replace('{code}', row.war_code).replace('{name}', row.war_des)
  if (!window.confirm(message)) return
  deleteError.value = ''
  deletePending.value = true
  try {
    const result = await service.delete(row.war_code)
    if (!result.ok) {
      deleteError.value = result.error.message
      return
    }
    saveMessage.value = t('mas002.deleteSuccess')
    await loadList()
    if (currentPage.value > pageCount.value) {
      currentPage.value = pageCount.value
      await loadList()
    }
  } finally {
    deletePending.value = false
  }
}

async function saveForm() {
  if (!canEdit.value || !dialogOpen.value || savePending.value) return
  formError.value = ''
  saveError.value = ''
  validationField.value = undefined
  const validation = validateWarrantyItemForm(form.value)
  if (!validation.valid) {
    validationField.value = validation.field
    formError.value = validationMessage(validation.field)
    return
  }
  const header = toWarrantyItemHeader(form.value)
  savePending.value = true
  try {
    const result = dialogMode.value === 'create' ? await service.create(header) : await service.update(header)
    if (!result.ok) {
      saveError.value = result.error.message
      return
    }
    dialogOpen.value = false
    saveMessage.value = t('mas002.saveSuccess')
    await loadList()
  } finally {
    savePending.value = false
  }
}

onMounted(() => { void initializePage() })
</script>

<template>
  <main class="target-page warranty-item-page">
    <header class="target-page__header">
      <div>
        <p class="target-eyebrow">Mango CSM</p>
        <h1 class="target-page__title">{{ t('mas002.title') }}</h1>
        <p class="target-page__description">{{ t('mas002.description') }}</p>
      </div>
    </header>

    <TargetState v-if="accessResult.status === 'checking'" kind="loading" :title="t('mas002.authChecking')" />
    <TargetState v-else-if="accessResult.status === 'anonymous'" kind="error" :title="t('mas002.authRequired')" :message="t('mas002.authUnavailable')" />
    <TargetState v-else-if="accessResult.status === 'denied'" kind="error" :title="t('mas002.accessDeniedTitle')" :message="t('mas002.accessDeniedMessage')" />
    <TargetState v-else-if="accessResult.status === 'error'" kind="error" :title="t('mas002.accessErrorTitle')" :message="accessResult.error.message">
      <button type="button" class="target-button target-button--secondary" @click="initializePage">{{ t('mas002.accessRetry') }}</button>
    </TargetState>

    <p v-if="readError" class="target-error" role="alert" data-testid="warranty-item-read-error">
      {{ readCode ? `${readCode}: ` : '' }}{{ readError }}
      <button v-if="readCode" type="button" class="target-button target-button--secondary" data-testid="warranty-item-read-retry" :disabled="readLoading" @click="openEdit(readCode)">{{ t('mas002.retry') }}</button>
    </p>

    <section v-if="hasReadAccess" class="target-panel" aria-labelledby="warranty-item-list-title">
      <div class="target-panel__section warranty-item-toolbar">
        <div>
          <h2 id="warranty-item-list-title" class="target-section-title">{{ t('mas002.title') }}</h2>
          <p v-if="accessResult.status === 'readonly'" class="target-eyebrow">{{ t('mas002.readOnly') }}</p>
          <p>{{ t('mas002.count') }}: {{ total }}</p>
          <p v-if="saveMessage" class="target-success" role="status" data-testid="warranty-item-save-message">{{ saveMessage }}</p>
          <p v-if="deleteError" class="target-error" role="alert" data-testid="warranty-item-delete-error">{{ deleteError }}</p>
        </div>
        <div class="warranty-item-actions">
          <button type="button" class="target-button" data-testid="warranty-item-new" :disabled="!canEdit" @click="openCreate">{{ t('mas002.new') }}</button>
          <button type="button" class="target-button target-button--secondary" data-testid="warranty-item-import" :disabled="!canEdit" @click="openImport">{{ t('mas002.import') }}</button>
          <button type="button" class="target-button target-button--secondary" data-testid="warranty-item-export" disabled>{{ t('mas002.export') }}</button>
        </div>
      </div>

      <div class="target-panel__section warranty-item-search">
        <label><span>{{ t('mas002.searchBy') }}</span>
          <select v-model="searchField" data-testid="warranty-item-field" :disabled="isBusy"><option value="war_code">{{ t('mas002.searchFieldCode') }}</option><option value="war_des">{{ t('mas002.searchFieldName') }}</option></select>
        </label>
        <label><span>{{ t('mas002.search') }}</span><input v-model="searchText" data-testid="warranty-item-text" :disabled="isBusy" type="text" @keyup.enter="doSearch"></label>
        <label><input v-model="activeOnly" data-testid="warranty-item-active" :disabled="isBusy" type="checkbox"><span>{{ t('mas002.activeFilter') }}</span></label>
        <button type="button" class="target-button target-button--secondary" data-testid="warranty-item-search" :disabled="isBusy" @click="doSearch">{{ t('mas002.search') }}</button>
      </div>

      <div class="target-panel__section">
        <TargetState v-if="listStatus === 'idle' || listStatus === 'loading'" kind="loading" :title="t('mas002.loading')" />
        <TargetState v-else-if="listStatus === 'error'" kind="error" :title="t('mas002.error')" :message="listError"><button type="button" class="target-button target-button--secondary" data-testid="warranty-item-retry" @click="loadList(accessGeneration)">{{ t('mas002.retry') }}</button></TargetState>
        <TargetState v-else-if="rows.length === 0" kind="empty" :title="t('mas002.empty')" />
        <div v-else class="target-table-wrap">
          <table class="target-table" data-testid="warranty-item-table">
            <thead><tr><th>{{ t('mas002.number') }}</th><th>{{ t('mas002.codeColumn') }}</th><th>{{ t('mas002.nameColumn') }}</th><th>{{ t('mas002.groupColumn') }}</th><th>{{ t('mas002.durationColumn') }}</th><th>{{ t('mas002.activeColumn') }}</th><th>{{ t('mas002.addUserColumn') }}</th><th>{{ t('mas002.addDateColumn') }}</th><th>{{ t('mas002.editUserColumn') }}</th><th>{{ t('mas002.editDateColumn') }}</th><th>{{ t('mas002.edit') }}</th><th>{{ t('mas002.delete') }}</th></tr></thead>
            <tbody><tr v-for="(row, index) in rows" :key="row.war_code">
              <td>{{ rowNumber(skip, index) }}</td><td>{{ row.war_code }}</td><td>{{ row.war_des }}</td><td>{{ row.type_name || row.type_code }}</td>
              <td>{{ row.tot_date }}d {{ row.tot_month }}m {{ row.tot_year }}y</td><td>{{ row.active === 'Y' ? t('mas002.yes') : t('mas002.no') }}</td><td>{{ row.add_user || '' }}</td><td>{{ row.add_dt || '' }}</td><td>{{ row.edit_user || '' }}</td><td>{{ row.edit_dt || '' }}</td>
              <td><button type="button" class="target-button target-button--secondary" :data-testid="`warranty-item-edit-${row.war_code}`" :disabled="!canEdit" @click="openEdit(row.war_code)">{{ t('mas002.edit') }}</button></td>
              <td><button type="button" class="target-button target-button--danger" :data-testid="`warranty-item-delete-${row.war_code}`" :disabled="!canEdit" @click="deleteRow(row)">{{ t('mas002.delete') }}</button></td>
            </tr></tbody>
          </table>
          <nav v-if="pageCount > 1" aria-label="Pagination" class="warranty-item-pagination">
            <button type="button" class="target-button target-button--secondary" data-testid="warranty-item-first" :disabled="isBusy || currentPage === 1" @click="goPage(1)">{{ t('mas002.first') }}</button>
            <button type="button" class="target-button target-button--secondary" data-testid="warranty-item-prev" :disabled="isBusy || currentPage === 1" @click="goPage(currentPage - 1)">{{ t('mas002.prev') }}</button>
            <button v-for="page in pageCount" :key="page" type="button" class="target-button target-button--secondary" :data-testid="`warranty-item-page-${page}`" :aria-current="currentPage === page ? 'page' : undefined" :disabled="isBusy" @click="goPage(page)">{{ page }}</button>
            <button type="button" class="target-button target-button--secondary" data-testid="warranty-item-next" :disabled="isBusy || currentPage === pageCount" @click="goPage(currentPage + 1)">{{ t('mas002.next') }}</button>
            <button type="button" class="target-button target-button--secondary" data-testid="warranty-item-last" :disabled="isBusy || currentPage === pageCount" @click="goPage(pageCount)">{{ t('mas002.last') }}</button>
          </nav>
        </div>
      </div>
    </section>

    <TargetDialog
      v-if="dialogOpen"
      :open="dialogOpen"
      :title="dialogMode === 'create' ? t('mas002.new') : t('mas002.edit')"
      :close-label="t('mas002.cancel')"
      data-testid="warranty-item-dialog"
      @close="closeDialog"
    >
      <form @submit.prevent="saveForm">
        <p v-if="groupError" class="target-error" role="alert" data-testid="warranty-item-group-error">{{ groupError }}</p>
        <p v-if="formError" id="warranty-item-form-error" class="target-error" role="alert" data-testid="warranty-item-form-error">{{ formError }}</p>
        <p v-if="saveError" class="target-error" role="alert" data-testid="warranty-item-save-error">{{ saveError }}</p>
        <label>Warranty Code
          <input v-model="form.war_code" data-testid="warranty-item-code" :readonly="dialogMode === 'edit'" :disabled="savePending" :aria-invalid="fieldHasError('war_code')" aria-describedby="warranty-item-form-error" maxlength="15">
        </label>
        <label>Warranty Name
          <input v-model="form.war_des" data-testid="warranty-item-name" maxlength="150" :disabled="savePending" :aria-invalid="fieldHasError('war_des')" aria-describedby="warranty-item-form-error">
        </label>
        <label>Warranty Group
          <select v-model="form.type_code" data-testid="warranty-item-group" :disabled="savePending" :aria-invalid="fieldHasError('type_code')" aria-describedby="warranty-item-form-error">
            <option value="">Select group</option>
            <option v-for="group in groups" :key="group.type_code" :value="group.type_code">{{ group.type_name }}</option>
          </select>
        </label>
        <div>
          <label>Days <input v-model.number="form.tot_date" data-testid="warranty-item-days" type="number" min="0" step="1" :disabled="form.durationDisabled || savePending" :aria-invalid="fieldHasError('tot_date')" aria-describedby="warranty-item-form-error"></label>
          <label>Months <input v-model.number="form.tot_month" data-testid="warranty-item-months" type="number" min="0" step="1" :disabled="form.durationDisabled || savePending" :aria-invalid="fieldHasError('tot_month')" aria-describedby="warranty-item-form-error"></label>
          <label>Years <input v-model.number="form.tot_year" data-testid="warranty-item-years" type="number" min="0" step="1" :disabled="form.durationDisabled || savePending" :aria-invalid="fieldHasError('tot_year')" aria-describedby="warranty-item-form-error"></label>
        </div>
        <label><input :checked="form.lifetime === 'Y'" data-testid="warranty-item-lifetime" type="checkbox" :disabled="savePending" :aria-invalid="fieldHasError('lifetime')" aria-describedby="warranty-item-form-error" @change="form = applyWarrantyItemLifetime(form, ($event.target as HTMLInputElement).checked)"> Lifetime</label>
        <label>Material Code <input v-model="form.itemcode" data-testid="warranty-item-material" :disabled="savePending"></label>
        <label>Active <input :checked="form.active === 'Y'" data-testid="warranty-item-active-status" type="checkbox" :disabled="savePending" :aria-invalid="fieldHasError('active')" aria-describedby="warranty-item-form-error" @change="form.active = ($event.target as HTMLInputElement).checked ? 'Y' : 'N'"></label>
        <p v-if="form.ic_docno || form.ic_itemno || form.vendor" data-testid="warranty-item-reference-ic">Reference IC: {{ form.ic_docno || '' }} {{ form.ic_itemno || '' }} {{ form.vendor || '' }}</p>
      </form>
      <template #footer>
        <button type="button" class="target-button" data-testid="warranty-item-save" :disabled="savePending" @click="saveForm">{{ savePending ? 'Saving...' : 'Save' }}</button>
        <button type="button" class="target-button target-button--secondary" data-testid="warranty-item-cancel" :disabled="savePending" @click="closeDialog">Cancel</button>
      </template>
    </TargetDialog>

    <TargetDialog
      v-if="importOpen"
      :open="importOpen"
      :title="t('mas002.importTitle')"
      :close-label="t('mas002.importCancel')"
      data-testid="warranty-item-import-dialog"
      @close="closeImport"
    >
      <p v-if="importError" class="target-error" role="alert" data-testid="warranty-item-import-error">{{ importError }}</p>
      <label>Spreadsheet rows
        <textarea v-model="importText" data-testid="warranty-item-import-paste" rows="5" :disabled="importPending" />
      </label>
      <div class="warranty-item-import-mapping">
        <label v-for="(column, field) in importMapping" :key="field">{{ field }}
          <input v-model="importMapping[field as keyof WarrantyItemImportMapping]" :data-testid="`warranty-item-import-map-${field}`" maxlength="3" :disabled="importPending">
        </label>
      </div>
      <p>{{ t('mas002.importPreview') }}: {{ importPreview.rows.length }}</p>
      <table v-if="importPreview.rows.length" data-testid="warranty-item-import-preview">
        <tbody><tr v-for="(row, index) in importPreview.rows" :key="`${row.war_code}-${index}`" data-testid="warranty-item-import-preview-row">
          <td>{{ row.war_code }}</td><td>{{ row.war_des }}</td><td>{{ row.type_code }}</td><td>{{ row.tot_date }}</td><td>{{ row.tot_month }}</td><td>{{ row.tot_year }}</td><td>{{ row.lifetime }}</td><td>{{ row.itemcode }}</td><td>{{ row.vendor }}</td><td>{{ row.war_date_start }}</td><td>{{ row.war_date_end }}</td><td>{{ row.active }}</td>
        </tr></tbody>
      </table>
      <template #footer>
        <button type="button" class="target-button" data-testid="warranty-item-import-submit" :disabled="importPending" @click="submitImport">{{ t('mas002.importUpload') }}</button>
        <button type="button" class="target-button target-button--secondary" data-testid="warranty-item-import-cancel" :disabled="importPending" @click="closeImport">{{ t('mas002.importCancel') }}</button>
      </template>
    </TargetDialog>
  </main>
</template>

<style scoped>
.warranty-item-toolbar,.warranty-item-search,.warranty-item-actions,.warranty-item-pagination { display:flex; flex-wrap:wrap; gap:var(--target-space-md); align-items:center; }
.warranty-item-toolbar { justify-content:space-between; align-items:flex-start; }
.warranty-item-search label { display:flex; flex-direction:column; gap:var(--target-space-xs); }
.warranty-item-pagination { padding-top:var(--target-space-md); }
</style>
