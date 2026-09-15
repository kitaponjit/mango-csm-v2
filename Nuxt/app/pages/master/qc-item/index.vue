<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TargetDialog from '~/components/ui/TargetDialog.vue'
import TargetState from '~/components/ui/TargetState.vue'
import {
  PAGE_SIZE,
  createNewQCItem,
  formatQCItemDate,
  getPageCount,
  getPageItems,
  normalizeQCItems,
  validateQCItems,
  type EditableQCItem,
} from '~/features/qc-item/qc-item-model'
import { createQCItemService } from '~/features/qc-item/qc-item-service'
import { QC_ITEM_MENU_ID, QC_ITEM_MENU_NAME } from '~/features/qc-item/qc-item-access'
import type { AccessControlResult } from '~/services/access/access-control-service'

type ViewStatus = 'idle' | 'loading' | 'ready' | 'success' | 'error'
type AccessViewState = { status: 'checking' } | AccessControlResult

const api = useApiClient()
const files = useFileCapability()
const localization = useLocalizationAdapter()
const session = useSessionAdapter()
const access = useAccessControlService()
const service = createQCItemService(api)
const t = localization.t

useHead({ title: t('qcItem.title') })

const items = ref<EditableQCItem[]>([])
const currentPage = ref(1)
const listStatus = ref<ViewStatus>('idle')
const listError = ref('')
const accessResult = ref<AccessViewState>({ status: 'checking' })
let accessGeneration = 0
const saveStatus = ref<ViewStatus>('idle')
const saveError = ref('')
const saveMessage = ref('')
const exportStatus = ref<ViewStatus>('idle')
const exportError = ref('')
const importDialogOpen = ref(false)
const importStatus = ref<ViewStatus>('idle')
const importError = ref('')
const importMessage = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const hasReadAccess = computed(() => (
  accessResult.value.status === 'readonly'
  || accessResult.value.status === 'editable'
))
const canEdit = computed(() => (
  accessResult.value.status === 'editable'
  && listStatus.value === 'ready'
  && !isDataBusy.value
))
const canExport = computed(() => (
  hasReadAccess.value
  && listStatus.value === 'ready'
  && exportStatus.value !== 'loading'
))

const pageCount = computed(() => getPageCount(items.value, PAGE_SIZE))
const pageItems = computed(() => getPageItems(items.value, currentPage.value, PAGE_SIZE))
const total = computed(() => items.value.length)
const isDataBusy = computed(() => (
  listStatus.value === 'loading'
  || saveStatus.value === 'loading'
  || importStatus.value === 'loading'
))

function clearAccessOwnedState() {
  items.value = []
  currentPage.value = 1
  listStatus.value = 'idle'
  listError.value = ''
  saveStatus.value = 'idle'
  saveError.value = ''
  saveMessage.value = ''
  exportStatus.value = 'idle'
  exportError.value = ''
  importDialogOpen.value = false
  importStatus.value = 'idle'
  importError.value = ''
  importMessage.value = ''
  clearFileSelection()
}

async function loadItems(generation = accessGeneration) {
  if (generation !== accessGeneration || !hasReadAccess.value) return
  listStatus.value = 'loading'
  listError.value = ''

  const result = await service.readList()
  if (generation !== accessGeneration || !hasReadAccess.value) return
  if (!result.ok) {
    listStatus.value = 'error'
    listError.value = result.error.message
    return
  }

  if (!Array.isArray(result.data)) {
    listStatus.value = 'error'
    listError.value = t('qcItem.invalidResponse')
    return
  }

  items.value = normalizeQCItems(result.data)
  currentPage.value = 1
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

  const result = await access.checkMenuAccess(QC_ITEM_MENU_NAME, QC_ITEM_MENU_ID)
  if (generation !== accessGeneration) return
  accessResult.value = result

  if (result.status === 'anonymous') {
    session.redirectToLogin()
    return
  }
  if (result.status === 'readonly' || result.status === 'editable') {
    await loadItems(generation)
  }
}

function addItem() {
  if (!canEdit.value) return

  items.value.push(createNewQCItem(items.value))
  currentPage.value = pageCount.value
  saveError.value = ''
  saveMessage.value = ''
}

function deleteItem(item: EditableQCItem) {
  if (!canEdit.value) return

  if (item.itemname && !confirm(t('qcItem.deleteConfirm'))) {
    return
  }

  items.value = items.value.filter(candidate => candidate !== item)
  currentPage.value = Math.min(currentPage.value, pageCount.value)
  saveError.value = ''
  saveMessage.value = ''
}

async function saveItems() {
  if (!canEdit.value) return
  const generation = accessGeneration

  const validation = validateQCItems(items.value)
  if (!validation.valid) {
    const messageKey = validation.field === 'description'
      ? 'qcItem.descriptionRequired'
      : 'qcItem.remarkRequired'
    saveError.value = `${t('qcItem.validation')} ${validation.itemno}: ${t(messageKey)}`
    saveMessage.value = ''
    return
  }

  saveStatus.value = 'loading'
  saveError.value = ''
  saveMessage.value = ''

  const result = await service.create(items.value)
  if (generation !== accessGeneration) return
  if (!result.ok) {
    saveStatus.value = 'error'
    saveError.value = result.error.message
    return
  }

  saveStatus.value = 'success'
  saveMessage.value = t('qcItem.saveSuccess')
  await loadItems(generation)
  if (generation !== accessGeneration) return
  saveStatus.value = 'success'
}

function openFilePicker() {
  if (!canEdit.value) return
  fileInput.value?.click()
}

function clearFileSelection() {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function closeImportDialog() {
  if (importStatus.value === 'loading') {
    return
  }

  importDialogOpen.value = false
  importStatus.value = 'idle'
  importError.value = ''
  clearFileSelection()
}

function onFileChange(event: Event) {
  if (!canEdit.value) {
    const input = event.target as HTMLInputElement | null
    if (input) input.value = ''
    clearFileSelection()
    return
  }

  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  importError.value = ''
  importMessage.value = ''

  if (!file) {
    return
  }

  if (!/\.xlsx$/i.test(file.name)) {
    clearFileSelection()
    importError.value = t('qcItem.fileTypeError')
    importDialogOpen.value = true
    return
  }

  selectedFile.value = file
  importStatus.value = 'idle'
  importDialogOpen.value = true
}

async function uploadFile() {
  if (!canEdit.value || !selectedFile.value) {
    return
  }
  const generation = accessGeneration

  importStatus.value = 'loading'
  importError.value = ''
  importMessage.value = ''

  const result = await service.importFile(selectedFile.value)
  if (generation !== accessGeneration) return
  if (!result.ok) {
    importStatus.value = 'error'
    importError.value = result.error.message
    return
  }

  importStatus.value = 'success'
  importMessage.value = t('qcItem.importSuccess')
  importDialogOpen.value = false
  clearFileSelection()
  await loadItems(generation)
  if (generation !== accessGeneration) return
  importStatus.value = 'success'
}

async function exportFile() {
  if (!canExport.value) return
  const generation = accessGeneration
  const exportWindow = globalThis.open?.('about:blank', '_blank')
  exportStatus.value = 'loading'
  exportError.value = ''

  const result = await service.exportFile()
  if (generation !== accessGeneration) {
    exportWindow?.close()
    return
  }
  if (!result.ok) {
    exportWindow?.close()
    exportStatus.value = 'error'
    exportError.value = result.error.message
    return
  }

  const url = files.openUrl(result.data, { download: true })
  if (exportWindow && !exportWindow.closed) {
    exportWindow.location.href = url
  }
  else {
    globalThis.open?.(url, '_blank', 'noopener')
  }
  exportStatus.value = 'success'
}

onMounted(() => {
  void initializePage()
})
</script>

<template>
  <main class="target-page qc-item-page">
    <header class="target-page__header">
      <div>
        <p class="target-eyebrow">Mango CSM</p>
        <h1 class="target-page__title">{{ t('qcItem.title') }}</h1>
        <p class="target-page__description">{{ t('qcItem.description') }}</p>
      </div>
    </header>

    <TargetState
      v-if="accessResult.status === 'checking'"
      kind="loading"
      :title="t('qcItem.authChecking')"
    />
    <TargetState
      v-else-if="accessResult.status === 'anonymous'"
      kind="error"
      :title="t('qcItem.authRequired')"
      :message="t('qcItem.authUnavailable')"
    />

    <TargetState
      v-else-if="accessResult.status === 'denied'"
      kind="error"
      :title="t('qcItem.accessDeniedTitle')"
      :message="t('qcItem.accessDeniedMessage')"
    />
    <TargetState
      v-else-if="accessResult.status === 'error'"
      kind="error"
      :title="t('qcItem.accessErrorTitle')"
      :message="accessResult.error.message"
      data-testid="qcitem-access-error"
    >
      <button type="button" class="target-button target-button--secondary" data-testid="qcitem-access-retry" @click="initializePage">
        {{ t('qcItem.accessRetry') }}
      </button>
    </TargetState>

    <section v-else-if="hasReadAccess" class="target-panel" aria-labelledby="qc-item-list-title">
      <div class="target-panel__section qc-item-toolbar">
        <div>
          <h2 id="qc-item-list-title" class="target-section-title">{{ t('qcItem.title') }}</h2>
          <p v-if="accessResult.status === 'readonly'" class="target-eyebrow">{{ t('qcItem.readOnly') }}</p>
          <p class="qc-item-count">{{ t('qcItem.count') }}: {{ total }}</p>
        </div>
        <div class="qc-item-actions" :aria-label="t('qcItem.actions')">
          <button type="button" class="target-button target-button--secondary" data-testid="qcitem-add" :disabled="!canEdit" @click="addItem">
            {{ t('qcItem.add') }}
          </button>
          <button type="button" class="target-button" data-testid="qcitem-save" :disabled="!canEdit" @click="saveItems">
            {{ saveStatus === 'loading' ? t('qcItem.saving') : t('qcItem.save') }}
          </button>
          <button type="button" class="target-button target-button--secondary" data-testid="qcitem-export" :disabled="!canExport" @click="exportFile">
            {{ exportStatus === 'loading' ? t('qcItem.exporting') : t('qcItem.export') }}
          </button>
          <button type="button" class="target-button target-button--secondary" data-testid="qcitem-import" :disabled="!canEdit" @click="openFilePicker">
            {{ t('qcItem.import') }}
          </button>
        </div>
        <p v-if="exportError" class="qc-item-feedback qc-item-feedback--error" role="alert">{{ exportError }}</p>
        <p v-else-if="importMessage" class="qc-item-feedback qc-item-feedback--success" role="status">{{ importMessage }}</p>
      </div>

      <div class="target-panel__section qc-item-results">
        <p v-if="saveError" class="qc-item-feedback qc-item-feedback--error" role="alert">{{ saveError }}</p>
        <p v-else-if="saveMessage" class="qc-item-feedback qc-item-feedback--success" role="status">{{ saveMessage }}</p>
        <TargetState v-if="listStatus === 'idle' || listStatus === 'loading'" kind="loading" :title="t('qcItem.loading')" />
        <TargetState v-else-if="listStatus === 'error'" kind="error" :title="t('qcItem.error')" :message="listError">
          <button type="button" class="target-button target-button--secondary" data-testid="qcitem-retry" @click="loadItems(accessGeneration)">
            {{ t('qcItem.retry') }}
          </button>
        </TargetState>
        <TargetState v-else-if="items.length === 0" kind="empty" :title="t('qcItem.empty')" />
        <div v-else class="target-table-wrap">
          <table class="target-table qc-item-table" data-testid="qcitem-table">
            <caption class="qc-item-visually-hidden">{{ t('qcItem.title') }}</caption>
            <thead>
              <tr>
                <th class="target-table__number" scope="col">{{ t('qcItem.number') }}</th>
                <th scope="col">{{ t('qcItem.action') }}</th>
                <th scope="col">{{ t('qcItem.descriptionColumn') }}</th>
                <th scope="col">{{ t('qcItem.remark') }}</th>
                <th scope="col">{{ t('qcItem.addDate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in pageItems" :key="item.itemno">
                <td class="target-table__number">{{ (currentPage - 1) * PAGE_SIZE + index + 1 }}</td>
                <td>
                  <button
                    type="button"
                    class="target-button target-button--danger qc-item-delete"
                    :data-testid="`qcitem-delete-${item.itemno}`"
                    :aria-label="`${t('qcItem.deleteItem')} ${item.itemno}`"
                    :disabled="!canEdit"
                    @click="deleteItem(item)"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </td>
                <td>
                  <input
                    v-model="item.itemname"
                    class="target-control qc-item-input"
                    :data-testid="`qcitem-description-${item.itemno}`"
                    :aria-label="`${t('qcItem.descriptionColumn')} ${item.itemno}`"
                    :disabled="!canEdit"
                    type="text"
                  >
                </td>
                <td>
                  <input
                    v-model="item.remark"
                    class="target-control qc-item-input"
                    :data-testid="`qcitem-remark-${item.itemno}`"
                    :aria-label="`${t('qcItem.remark')} ${item.itemno}`"
                    :disabled="!canEdit"
                    type="text"
                  >
                </td>
                <td>{{ formatQCItemDate(item.adddate) }}</td>
              </tr>
            </tbody>
          </table>

          <nav v-if="pageCount > 1" class="qc-item-pagination" :aria-label="t('qcItem.title')">
            <button
              v-for="page in pageCount"
              :key="page"
              type="button"
              class="target-button target-button--secondary"
              :data-testid="`qcitem-page-${page}`"
              :aria-current="currentPage === page ? 'page' : undefined"
              :disabled="isDataBusy"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </nav>
        </div>
      </div>
    </section>

    <input
      ref="fileInput"
      class="qc-item-file-input"
      data-testid="qcitem-file-input"
      type="file"
      accept=".xlsx"
      :disabled="!canEdit"
      @change="onFileChange"
    >

    <TargetDialog
      v-if="hasReadAccess"
      :open="importDialogOpen"
      :title="t('qcItem.importTitle')"
      :close-label="t('qcItem.cancel')"
      data-testid="qcitem-import-dialog"
      @close="closeImportDialog"
    >
      <p class="qc-item-dialog-copy">{{ t('qcItem.chooseFile') }}</p>
      <p v-if="selectedFile" class="qc-item-selected-file">
        <span>{{ t('qcItem.selectedFile') }}:</span> {{ selectedFile.name }}
      </p>
      <p v-if="importError" class="qc-item-feedback qc-item-feedback--error" role="alert">{{ importError }}</p>
      <p class="qc-item-dialog-hint">{{ t('qcItem.importHint') }}</p>
      <template #footer>
        <button type="button" class="target-button target-button--secondary" data-testid="qcitem-cancel-import" :disabled="importStatus === 'loading'" @click="closeImportDialog">
          {{ t('qcItem.cancel') }}
        </button>
        <button type="button" class="target-button" data-testid="qcitem-upload" :disabled="!canEdit || !selectedFile" @click="uploadFile">
          {{ importStatus === 'loading' ? t('qcItem.uploading') : t('qcItem.upload') }}
        </button>
      </template>
    </TargetDialog>
  </main>
</template>

<style scoped>
.qc-item-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--target-space-lg);
}

.qc-item-count {
  margin: calc(var(--target-space-sm) * -1) 0 0;
  color: var(--target-color-text-muted);
}

.qc-item-actions,
.qc-item-pagination {
  display: flex;
  flex-wrap: wrap;
  gap: var(--target-space-sm);
}

.qc-item-actions .target-button {
  white-space: nowrap;
}

.qc-item-results {
  padding-top: 0;
}

.qc-item-feedback {
  margin: 0 0 var(--target-space-md);
  line-height: 1.5;
}

.qc-item-feedback--error {
  color: var(--target-color-danger);
}

.qc-item-feedback--success {
  color: var(--target-color-success);
}

.qc-item-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.qc-item-dialog-copy,
.qc-item-selected-file,
.qc-item-dialog-hint {
  margin: 0 0 var(--target-space-md);
  line-height: 1.5;
}

.qc-item-selected-file {
  overflow-wrap: anywhere;
  font-weight: 650;
}

.qc-item-dialog-hint {
  color: var(--target-color-text-muted);
  font-size: 0.9rem;
}

.qc-item-table {
  min-width: 54rem;
}

.qc-item-input {
  min-width: 12rem;
}

.qc-item-delete {
  min-width: var(--target-control-height-sm);
  min-height: var(--target-control-height-sm);
  padding: 0.25rem 0.5rem;
}

.qc-item-pagination {
  padding-top: var(--target-space-md);
}

.qc-item-visually-hidden {
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
  .qc-item-toolbar {
    display: grid;
  }

  .qc-item-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
