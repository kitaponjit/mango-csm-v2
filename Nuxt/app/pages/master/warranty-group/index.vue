<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TargetDialog from '~/components/ui/TargetDialog.vue'
import TargetState from '~/components/ui/TargetState.vue'
import {
  DEFAULT_SEARCH,
  DEFAULT_TAKE,
  getPageCount,
  getSkip,
  normalizeWarrantyGroupPage,
  normalizeWarrantyGroupRow,
  rowNumber,
  toActiveParam,
  validateWarrantyGroupRow,
  type WarrantyGroup,
  type WarrantyGroupSearchField,
} from '~/features/warranty-group/warranty-group-model'
import { createWarrantyGroupService } from '~/features/warranty-group/warranty-group-service'
import { WARRANTY_GROUP_MENU_ID, WARRANTY_GROUP_MENU_NAME } from '~/features/warranty-group/warranty-group-access'
import { MAS001_TEXTS } from '~/features/warranty-group/warranty-group-texts'
import { DEFAULT_IMPORT_MAPPING, mapImportRows, parsePastedImportSheet } from '~/features/warranty-group/warranty-group-import'
import type { AccessControlResult } from '~/services/access/access-control-service'

type ViewStatus = 'idle' | 'loading' | 'ready' | 'error'
type SaveStatus = 'idle' | 'loading' | 'success' | 'error'
type AccessViewState = { status: 'checking' } | AccessControlResult

const api = useApiClient()
const localization = useLocalizationAdapter()
const session = useSessionAdapter()
const access = useAccessControlService()
const service = createWarrantyGroupService(api)

function t(key: string): string {
  const localized = localization.t(key)
  if (localized !== key) {
    return localized
  }
  if (key.startsWith('mas001.')) {
    return MAS001_TEXTS[localization.language]?.[key] ?? key
  }
  return localized
}

useHead({ title: t('mas001.title') })

const take = DEFAULT_TAKE
const rows = ref<WarrantyGroup[]>([])
const total = ref(0)
const currentPage = ref(1)
const searchField = ref<WarrantyGroupSearchField>(DEFAULT_SEARCH.field)
const searchText = ref(DEFAULT_SEARCH.text)
const activeOnly = ref(DEFAULT_SEARCH.active === 'Y')
const listStatus = ref<ViewStatus>('idle')
const listError = ref('')
const dialogOpen = ref(false)
const isEdit = ref(false)
const editLoading = ref(false)
const formCode = ref('')
const formName = ref('')
const formActive = ref(true)
const formError = ref('')
const saveStatus = ref<SaveStatus>('idle')
const saveError = ref('')
const saveMessage = ref('')
const exportStatus = ref<ViewStatus>('idle')
const exportError = ref('')
const templateStatus = ref<ViewStatus>('idle')
const templateError = ref('')
const accessResult = ref<AccessViewState>({ status: 'checking' })
let accessGeneration = 0

const hasReadAccess = computed(() => (
  accessResult.value.status === 'readonly'
  || accessResult.value.status === 'editable'
))
const canEdit = computed(() => (
  accessResult.value.status === 'editable'
  && listStatus.value === 'ready'
  && saveStatus.value !== 'loading'
  && !editLoading.value
))
const isBusy = computed(() => listStatus.value === 'loading')
const canDownload = computed(() => (
  hasReadAccess.value
  && listStatus.value === 'ready'
  && exportStatus.value !== 'loading'
  && templateStatus.value !== 'loading'
))
const skip = computed(() => getSkip(currentPage.value, take, total.value))
const pageCount = computed(() => getPageCount(total.value, take))

function clearAccessOwnedState() {
  rows.value = []
  total.value = 0
  currentPage.value = 1
  searchField.value = DEFAULT_SEARCH.field
  searchText.value = DEFAULT_SEARCH.text
  activeOnly.value = DEFAULT_SEARCH.active === 'Y'
  listStatus.value = 'idle'
  listError.value = ''
  dialogOpen.value = false
  isEdit.value = false
  editLoading.value = false
  formCode.value = ''
  formName.value = ''
  formActive.value = true
  formError.value = ''
  saveStatus.value = 'idle'
  saveError.value = ''
  saveMessage.value = ''
  exportStatus.value = 'idle'
  exportError.value = ''
  templateStatus.value = 'idle'
  templateError.value = ''
}

async function loadList(generation = accessGeneration) {
  if (generation !== accessGeneration || !hasReadAccess.value) return
  listStatus.value = 'loading'
  listError.value = ''

  const result = await service.readList({
    skip: skip.value,
    take,
    field: searchField.value,
    text: searchText.value,
    // LEGACY-EXACT: only active=Y filters; active=N returns all (not fixed).
    active: toActiveParam(activeOnly.value),
  })
  if (generation !== accessGeneration || !hasReadAccess.value) return
  if (!result.ok) {
    listStatus.value = 'error'
    listError.value = result.error.message
    return
  }

  const page = normalizeWarrantyGroupPage(result.data)
  if (!page) {
    listStatus.value = 'error'
    listError.value = t('mas001.invalidResponse')
    return
  }

  // Fixed server ordering is rendered untouched — no client-side sorting.
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

  const result = await access.checkMenuAccess(WARRANTY_GROUP_MENU_NAME, WARRANTY_GROUP_MENU_ID)
  if (generation !== accessGeneration) return
  accessResult.value = result

  if (result.status === 'anonymous') {
    session.redirectToLogin()
    return
  }
  if (result.status === 'readonly' || result.status === 'editable') {
    await loadList(generation)
  }
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

function openCreate() {
  if (!canEdit.value) return
  isEdit.value = false
  formCode.value = ''
  formName.value = ''
  formActive.value = true
  formError.value = ''
  saveError.value = ''
  saveMessage.value = ''
  dialogOpen.value = true
}

async function openEdit(type_code: string) {
  if (!canEdit.value) return
  const generation = accessGeneration
  editLoading.value = true
  saveError.value = ''
  saveMessage.value = ''

  const result = await service.readOne(type_code)
  if (generation !== accessGeneration || !hasReadAccess.value) return
  editLoading.value = false
  if (!result.ok) {
    saveError.value = result.error.message
    return
  }

  const row = normalizeWarrantyGroupRow(result.data)
  if (!row) {
    saveError.value = t('mas001.invalidResponse')
    return
  }

  // Fresh single-row prefill — never stale grid data. Code is locked.
  isEdit.value = true
  formCode.value = row.type_code
  formName.value = row.type_name
  formActive.value = row.active === 'Y'
  formError.value = ''
  saveError.value = ''
  dialogOpen.value = true
}

function closeDialog() {
  if (saveStatus.value === 'loading') return
  dialogOpen.value = false
}

async function confirmDelete(type_code: string) {
  if (!canEdit.value) return
  const row = rows.value.find(candidate => candidate.type_code === type_code)
  if (!row) return
  const generation = accessGeneration
  if (!confirm(`${t('mas001.deleteConfirm')} : ${row.type_code} (${row.type_name}) ?`)) return

  const result = await service.remove({
    type_code: row.type_code,
    type_name: row.type_name,
    default_: row.default_,
    active: row.active,
  })
  if (generation !== accessGeneration || !hasReadAccess.value) return
  if (!result.ok) {
    // FK-block: surface the server in-use message, keep the row, reload safely.
    saveMessage.value = ''
    saveError.value = result.error.message
    await loadList(generation)
    return
  }

  saveError.value = ''
  saveMessage.value = t('mas001.deleteSuccess')
  await loadList(generation)
}

async function toggleDefault(type_code: string) {
  if (!canEdit.value) return
  const row = rows.value.find(candidate => candidate.type_code === type_code)
  if (!row) return
  // LEGACY-EXACT: refused on inactive rows — no request, no reload.
  if (row.active === 'N') return
  const generation = accessGeneration
  // default_ carries the toggled value; the backend owns blanket-reset +
  // selected-row write. Toggle-off (Y to N) may leave zero defaults.
  const result = await service.updateDefault({
    type_code: row.type_code,
    type_name: row.type_name,
    default_: row.default_ === 'Y' ? 'N' : 'Y',
    active: row.active,
  })
  if (generation !== accessGeneration || !hasReadAccess.value) return
  if (!result.ok) {
    saveMessage.value = ''
    saveError.value = result.error.message
    await loadList(generation)
    return
  }

  saveError.value = ''
  saveMessage.value = t('mas001.saveSuccess')
  await loadList(generation)
}

function validationMessage(field: 'type_code' | 'type_name' | 'active' | undefined) {
  if (field === 'type_name') return t('mas001.nameInvalid')
  if (field === 'active') return t('mas001.activeInvalid')
  return t('mas001.codeInvalid')
}

async function saveForm() {
  if (!canEdit.value || !dialogOpen.value) return
  const generation = accessGeneration
  const payload = {
    type_code: formCode.value.trim(),
    type_name: formName.value.trim(),
    active: formActive.value ? 'Y' : 'N',
  }

  const validation = validateWarrantyGroupRow(payload)
  if (!validation.valid) {
    formError.value = validationMessage(validation.field)
    return
  }

  formError.value = ''
  saveStatus.value = 'loading'
  saveError.value = ''
  saveMessage.value = ''

  const result = isEdit.value
    ? await service.update(payload)
    : await service.create(payload)
  if (generation !== accessGeneration || !hasReadAccess.value) return
  if (!result.ok) {
    // A failed save keeps the dialog input so the user can correct and retry.
    saveStatus.value = 'error'
    saveError.value = result.error.message
    return
  }

  saveStatus.value = 'success'
  saveMessage.value = t('mas001.saveSuccess')
  dialogOpen.value = false
  formCode.value = ''
  formName.value = ''
  formActive.value = true
  formError.value = ''
  await loadList(generation)
  if (generation !== accessGeneration) return
  saveStatus.value = 'success'
}

async function downloadThroughPopup(kind: 'export' | 'template') {
  if (!canDownload.value) return
  const generation = accessGeneration
  const popup = globalThis.open?.('about:blank', '_blank')
  const setLoading = kind === 'export' ? exportStatus : templateStatus
  const setError = kind === 'export' ? exportError : templateError
  setLoading.value = 'loading'
  setError.value = ''

  const result = kind === 'export' ? await service.exportFile() : await service.downloadTemplate()
  if (generation !== accessGeneration) {
    popup?.close()
    return
  }
  if (!result.ok || typeof result.data !== 'string' || result.data === '') {
    popup?.close()
    setLoading.value = 'error'
    // Failed token (or empty token) reports the server message when there
    // is one — never a false success.
    setError.value = !result.ok ? result.error.message : t('mas001.exportFailed')
    return
  }

  // Resolved at click time (not setup) so mounting the page never requires
  // the file seam; the shared opener itself is reused unchanged.
  const url = useFileCapability().openUrl(result.data, { download: true })
  if (popup && !popup.closed) {
    popup.location.href = url
  }
  else {
    const fallback = globalThis.open?.(url, '_blank', 'noopener')
    if (!fallback || fallback.closed) {
      // Blocked popup on both attempts: error, never false success.
      setLoading.value = 'error'
      setError.value = t('mas001.exportBlocked')
      return
    }
  }
  setLoading.value = 'success'
}

async function exportFile() {
  await downloadThroughPopup('export')
}

async function downloadTemplate() {
  await downloadThroughPopup('template')
}

const importOpen = ref(false)
const importPaste = ref('')
const importMapCode = ref(DEFAULT_IMPORT_MAPPING.type_code)
const importMapName = ref(DEFAULT_IMPORT_MAPPING.type_name)
const importMapActive = ref(DEFAULT_IMPORT_MAPPING.active)
const importStatus = ref<'idle' | 'loading' | 'error'>('idle')
const importError = ref('')
const importSheetRows = computed(() => parsePastedImportSheet(importPaste.value))
const importPreview = computed(() => mapImportRows(importSheetRows.value, {
  type_code: importMapCode.value,
  type_name: importMapName.value,
  active: importMapActive.value,
}))
const canImport = computed(() => (
  accessResult.value.status === 'editable'
  && listStatus.value === 'ready'
  && importStatus.value !== 'loading'
))

function openImport() {
  if (!canImport.value) return
  importPaste.value = ''
  importMapCode.value = DEFAULT_IMPORT_MAPPING.type_code
  importMapName.value = DEFAULT_IMPORT_MAPPING.type_name
  importMapActive.value = DEFAULT_IMPORT_MAPPING.active
  importStatus.value = 'idle'
  importError.value = ''
  importOpen.value = true
}

function closeImport() {
  if (importStatus.value === 'loading') return
  importOpen.value = false
}

async function uploadImport() {
  if (!canImport.value || !importOpen.value) return
  // The upload carries mapped rows only — empty previews never send.
  const rows = importPreview.value
  if (rows.length === 0) return
  const generation = accessGeneration
  importStatus.value = 'loading'
  importError.value = ''
  const result = await service.importData(rows)
  if (generation !== accessGeneration || !hasReadAccess.value) return
  if (!result.ok) {
    // A failed upload keeps the dialog usable with the server message.
    importStatus.value = 'error'
    importError.value = result.error.message
    return
  }
  importStatus.value = 'idle'
  importError.value = ''
  importOpen.value = false
  importPaste.value = ''
  saveError.value = ''
  saveMessage.value = t('mas001.importSuccess')
  await loadList(generation)
}

onMounted(() => {
  void initializePage()
})
</script>

<template>
  <main class="target-page warranty-group-page">
    <header class="target-page__header">
      <div>
        <p class="target-eyebrow">Mango CSM</p>
        <h1 class="target-page__title">{{ t('mas001.title') }}</h1>
        <p class="target-page__description">{{ t('mas001.description') }}</p>
      </div>
    </header>

    <TargetState
      v-if="accessResult.status === 'checking'"
      kind="loading"
      :title="t('mas001.authChecking')"
    />
    <TargetState
      v-else-if="accessResult.status === 'anonymous'"
      kind="error"
      :title="t('mas001.authRequired')"
      :message="t('mas001.authUnavailable')"
    />
    <TargetState
      v-else-if="accessResult.status === 'denied'"
      kind="error"
      :title="t('mas001.accessDeniedTitle')"
      :message="t('mas001.accessDeniedMessage')"
    />
    <TargetState
      v-else-if="accessResult.status === 'error'"
      kind="error"
      :title="t('mas001.accessErrorTitle')"
      :message="accessResult.error.message"
      data-testid="wgroup-access-error"
    >
      <button type="button" class="target-button target-button--secondary" data-testid="wgroup-access-retry" @click="initializePage">
        {{ t('mas001.accessRetry') }}
      </button>
    </TargetState>

    <section v-else-if="hasReadAccess" class="target-panel" aria-labelledby="warranty-group-list-title">
      <div class="target-panel__section warranty-group-toolbar">
        <div>
          <h2 id="warranty-group-list-title" class="target-section-title">{{ t('mas001.title') }}</h2>
          <p v-if="accessResult.status === 'readonly'" class="target-eyebrow">{{ t('mas001.readOnly') }}</p>
          <p class="warranty-group-count" data-testid="wgroup-total">{{ t('mas001.count') }}: {{ total }}</p>
          <p v-if="saveMessage" class="warranty-group-feedback warranty-group-feedback--success" role="status" data-testid="wgroup-save-message">{{ saveMessage }}</p>
          <p v-else-if="saveError && !dialogOpen" class="warranty-group-feedback warranty-group-feedback--error" role="alert">{{ saveError }}</p>
        </div>
        <div class="warranty-group-actions">
          <button type="button" class="target-button" data-testid="wgroup-add" :disabled="!canEdit" @click="openCreate">
            {{ t('mas001.add') }}
          </button>
          <button type="button" class="target-button target-button--secondary" data-testid="wgroup-import" :disabled="!canImport" @click="openImport">
            {{ t('mas001.import') }}
          </button>
          <button type="button" class="target-button target-button--secondary" data-testid="wgroup-export" :disabled="!canDownload" @click="exportFile">
            {{ exportStatus === 'loading' ? t('mas001.exporting') : t('mas001.export') }}
          </button>
          <button type="button" class="target-button target-button--secondary" data-testid="wgroup-template" :disabled="!canDownload" @click="downloadTemplate">
            {{ templateStatus === 'loading' ? t('mas001.templateDownloading') : t('mas001.template') }}
          </button>
        </div>
        <p v-if="exportError" class="warranty-group-feedback warranty-group-feedback--error" role="alert" data-testid="wgroup-export-error">{{ exportError }}</p>
        <p v-else-if="templateError" class="warranty-group-feedback warranty-group-feedback--error" role="alert" data-testid="wgroup-template-error">{{ templateError }}</p>
      </div>

      <div class="target-panel__section warranty-group-search">
        <label class="warranty-group-field">
          <span>{{ t('mas001.searchBy') }}</span>
          <select
            v-model="searchField"
            class="target-control"
            data-testid="wgroup-field"
            :disabled="isBusy"
          >
            <option value="type_code">{{ t('mas001.searchFieldCode') }}</option>
            <option value="type_name">{{ t('mas001.searchFieldName') }}</option>
          </select>
        </label>
        <label class="warranty-group-field">
          <span>{{ t('mas001.search') }}</span>
          <input
            v-model="searchText"
            class="target-control"
            data-testid="wgroup-text"
            type="text"
            :disabled="isBusy"
            @keyup.enter="doSearch"
          >
        </label>
        <label class="warranty-group-field warranty-group-field--check">
          <input
            v-model="activeOnly"
            data-testid="wgroup-active"
            type="checkbox"
            :disabled="isBusy"
          >
          <span>{{ t('mas001.activeFilter') }}</span>
        </label>
        <button type="button" class="target-button target-button--secondary" data-testid="wgroup-search" :disabled="isBusy" @click="doSearch">
          {{ t('mas001.search') }}
        </button>
      </div>

      <div class="target-panel__section warranty-group-results">
        <TargetState v-if="listStatus === 'idle' || listStatus === 'loading'" kind="loading" :title="t('mas001.loading')" />
        <TargetState v-else-if="listStatus === 'error'" kind="error" :title="t('mas001.error')" :message="listError">
          <button type="button" class="target-button target-button--secondary" data-testid="wgroup-retry" @click="loadList(accessGeneration)">
            {{ t('mas001.retry') }}
          </button>
        </TargetState>
        <TargetState v-else-if="rows.length === 0" kind="empty" :title="t('mas001.empty')" />
        <div v-else class="target-table-wrap">
          <table class="target-table warranty-group-table" data-testid="wgroup-table">
            <caption class="warranty-group-visually-hidden">{{ t('mas001.title') }}</caption>
            <thead>
              <tr>
                <th class="target-table__number" scope="col">{{ t('mas001.number') }}</th>
                <th scope="col">{{ t('mas001.codeColumn') }}</th>
                <th scope="col">{{ t('mas001.nameColumn') }}</th>
                <th scope="col">{{ t('mas001.defaultColumn') }}</th>
                <th scope="col">{{ t('mas001.activeColumn') }}</th>
                <th scope="col">{{ t('mas001.edit') }}</th>
                <th scope="col">{{ t('mas001.delete') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in rows" :key="row.type_code">
                <td class="target-table__number">{{ rowNumber(skip, index) }}</td>
                <td>{{ row.type_code }}</td>
                <td>{{ row.type_name }}</td>
                <td>
                  <button
                    type="button"
                    class="target-button target-button--secondary warranty-group-default"
                    :class="{ 'is-default': row.default_ === 'Y' }"
                    :data-testid="`wgroup-default-${row.type_code}`"
                    :aria-pressed="row.default_ === 'Y' ? 'true' : 'false'"
                    :aria-label="`${t('mas001.defaultColumn')} ${row.type_code}`"
                    :disabled="!canEdit"
                    @click="toggleDefault(row.type_code)"
                  >
                    <span v-if="row.default_ === 'Y'" aria-hidden="true">●</span>
                    <span v-else aria-hidden="true">○</span>
                  </button>
                </td>
                <td>{{ row.active === 'Y' ? t('mas001.yes') : t('mas001.no') }}</td>
                <td>
                  <button
                    type="button"
                    class="target-button target-button--secondary"
                    :data-testid="`wgroup-edit-${row.type_code}`"
                    :disabled="!canEdit"
                    @click="openEdit(row.type_code)"
                  >
                    {{ t('mas001.edit') }}
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    class="target-button target-button--secondary"
                    :data-testid="`wgroup-delete-${row.type_code}`"
                    :disabled="!canEdit"
                    @click="confirmDelete(row.type_code)"
                  >
                    {{ t('mas001.delete') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <nav
            v-if="total > 0 && pageCount > 1"
            class="warranty-group-pagination"
            data-testid="wgroup-pager"
            :aria-label="t('mas001.title')"
          >
            <button
              type="button"
              class="target-button target-button--secondary"
              data-testid="wgroup-first"
              :disabled="currentPage === 1 || isBusy"
              @click="goPage(1)"
            >
              {{ t('mas001.first') }}
            </button>
            <button
              type="button"
              class="target-button target-button--secondary"
              data-testid="wgroup-prev"
              :disabled="currentPage === 1 || isBusy"
              @click="goPage(currentPage - 1)"
            >
              {{ t('mas001.prev') }}
            </button>
            <button
              v-for="page in pageCount"
              :key="page"
              type="button"
              class="target-button target-button--secondary"
              :data-testid="`wgroup-page-${page}`"
              :aria-current="currentPage === page ? 'page' : undefined"
              :disabled="isBusy"
              @click="goPage(page)"
            >
              {{ page }}
            </button>
            <button
              type="button"
              class="target-button target-button--secondary"
              data-testid="wgroup-next"
              :disabled="currentPage === pageCount || isBusy"
              @click="goPage(currentPage + 1)"
            >
              {{ t('mas001.next') }}
            </button>
            <button
              type="button"
              class="target-button target-button--secondary"
              data-testid="wgroup-last"
              :disabled="currentPage === pageCount || isBusy"
              @click="goPage(pageCount)"
            >
              {{ t('mas001.last') }}
            </button>
          </nav>
        </div>
      </div>
    </section>

    <TargetDialog
      v-if="hasReadAccess && dialogOpen"
      :open="dialogOpen"
      :title="isEdit ? t('mas001.editTitle') : t('mas001.addTitle')"
      :close-label="t('mas001.cancel')"
      data-testid="wgroup-dialog"
      @close="closeDialog"
    >
      <div class="warranty-group-form">
        <label class="warranty-group-field">
          <span>{{ t('mas001.codeColumn') }}</span>
          <input
            v-model.trim="formCode"
            class="target-control"
            data-testid="wgroup-code"
            type="text"
            maxlength="20"
            :readonly="isEdit"
            :disabled="saveStatus === 'loading'"
          >
        </label>
        <label class="warranty-group-field">
          <span>{{ t('mas001.nameColumn') }}</span>
          <input
            v-model.trim="formName"
            class="target-control"
            data-testid="wgroup-name"
            type="text"
            maxlength="200"
            :disabled="saveStatus === 'loading'"
          >
        </label>
        <label class="warranty-group-field warranty-group-field--check">
          <input
            v-model="formActive"
            data-testid="wgroup-dialog-active"
            type="checkbox"
            :disabled="saveStatus === 'loading'"
          >
          <span>{{ t('mas001.activeFilter') }}</span>
        </label>
        <p v-if="formError" class="warranty-group-feedback warranty-group-feedback--error" role="alert" data-testid="wgroup-form-error">{{ formError }}</p>
        <p v-if="saveError" class="warranty-group-feedback warranty-group-feedback--error" role="alert" data-testid="wgroup-save-error">{{ saveError }}</p>
      </div>
      <template #footer>
        <button type="button" class="target-button target-button--secondary" data-testid="wgroup-cancel" :disabled="saveStatus === 'loading'" @click="closeDialog">
          {{ t('mas001.cancel') }}
        </button>
        <button type="button" class="target-button" data-testid="wgroup-save" :disabled="!canEdit" @click="saveForm">
          {{ saveStatus === 'loading' ? t('mas001.saving') : t('mas001.save') }}
        </button>
      </template>
    </TargetDialog>
    <TargetDialog
      v-if="hasReadAccess && importOpen"
      :open="importOpen"
      :title="t('mas001.importTitle')"
      :close-label="t('mas001.importCancel')"
      data-testid="wgroup-import-dialog"
      @close="closeImport"
    >
      <div class="warranty-group-form">
        <div class="warranty-group-import-mapping">
          <label class="warranty-group-field">
            <span>{{ t('mas001.importMapCode') }}</span>
            <input
              v-model.trim="importMapCode"
              class="target-control"
              data-testid="wgroup-import-map-code"
              type="text"
              maxlength="2"
              :disabled="importStatus === 'loading'"
            >
          </label>
          <label class="warranty-group-field">
            <span>{{ t('mas001.importMapName') }}</span>
            <input
              v-model.trim="importMapName"
              class="target-control"
              data-testid="wgroup-import-map-name"
              type="text"
              maxlength="2"
              :disabled="importStatus === 'loading'"
            >
          </label>
          <label class="warranty-group-field">
            <span>{{ t('mas001.importMapActive') }}</span>
            <input
              v-model.trim="importMapActive"
              class="target-control"
              data-testid="wgroup-import-map-active"
              type="text"
              maxlength="2"
              :disabled="importStatus === 'loading'"
            >
          </label>
        </div>
        <label class="warranty-group-field">
          <span>{{ t('mas001.importPaste') }}</span>
          <textarea
            v-model="importPaste"
            class="target-control"
            data-testid="wgroup-import-paste"
            rows="4"
            :disabled="importStatus === 'loading'"
          />
        </label>
        <div class="warranty-group-import-preview">
          <h3 class="target-section-title">{{ t('mas001.importPreview') }}</h3>
          <p v-if="importPreview.length === 0" class="warranty-group-feedback" data-testid="wgroup-import-empty">{{ t('mas001.importEmpty') }}</p>
          <table v-else class="target-table" data-testid="wgroup-import-preview">
            <thead>
              <tr>
                <th scope="col">{{ t('mas001.codeColumn') }}</th>
                <th scope="col">{{ t('mas001.nameColumn') }}</th>
                <th scope="col">{{ t('mas001.activeColumn') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(previewRow, previewIndex) in importPreview" :key="previewIndex" data-testid="wgroup-import-preview-row">
                <td>{{ previewRow.type_code }}</td>
                <td>{{ previewRow.type_name }}</td>
                <td>{{ previewRow.active === 'Y' ? t('mas001.yes') : t('mas001.no') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="importError" class="warranty-group-feedback warranty-group-feedback--error" role="alert" data-testid="wgroup-import-error">{{ importError }}</p>
      </div>
      <template #footer>
        <button type="button" class="target-button target-button--secondary" data-testid="wgroup-import-cancel" :disabled="importStatus === 'loading'" @click="closeImport">
          {{ t('mas001.importCancel') }}
        </button>
        <button type="button" class="target-button" data-testid="wgroup-import-upload" :disabled="!canImport || importPreview.length === 0" @click="uploadImport">
          {{ t('mas001.importUpload') }}
        </button>
      </template>
    </TargetDialog>
  </main>
</template>

<style scoped>
.warranty-group-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--target-space-lg);
}

.warranty-group-count {
  margin: calc(var(--target-space-sm) * -1) 0 0;
  color: var(--target-color-text-muted);
}

.warranty-group-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--target-space-sm);
}

.warranty-group-search {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--target-space-md);
  padding-top: 0;
}

.warranty-group-field {
  display: grid;
  gap: var(--target-space-sm);
}

.warranty-group-field--check {
  display: flex;
  align-items: center;
  gap: var(--target-space-sm);
  padding-bottom: 0.5rem;
}

.warranty-group-results {
  padding-top: 0;
}

.warranty-group-feedback {
  margin: var(--target-space-sm) 0 0;
  line-height: 1.5;
}

.warranty-group-feedback--error {
  color: var(--target-color-danger);
}

.warranty-group-feedback--success {
  color: var(--target-color-success);
}

.warranty-group-form {
  display: grid;
  gap: var(--target-space-md);
}

.warranty-group-pagination {
  display: flex;
  flex-wrap: wrap;
  gap: var(--target-space-sm);
  padding-top: var(--target-space-md);
}

.warranty-group-table {
  min-width: 48rem;
}

.warranty-group-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  border: 0;
  margin: -1px;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 48rem) {
  .warranty-group-toolbar {
    display: grid;
  }
}
</style>
