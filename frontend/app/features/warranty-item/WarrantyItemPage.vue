<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue'

import { createWarrantyItemFormController, createWarrantyItemFormState, type WarrantyItemFormController, type WarrantyItemFormControllerOptions, type WarrantyItemSaveResult } from './edit/warranty-item-form-state'
import { LEGACY_UI_WARRANTY_CODE_MAX, LEGACY_UI_WARRANTY_NAME_MAX } from './edit/warranty-item-draft'
import { createWarrantyItemEditService } from './edit/warranty-item-service'
import { createWarrantyItemDeleteController, createWarrantyItemDeleteState, type WarrantyItemDeleteController, type WarrantyItemDeleteControllerOptions } from './delete/warranty-item-delete-state'
import { formatWarrantyItemDeleteConfirmation } from './delete/warranty-item-delete-confirmation'
import { createWarrantyItemDeleteService } from './delete/warranty-item-delete-service'
import { createWarrantyItemListService } from './list/warranty-item-list-service'
import {
  createWarrantyItemListController,
  createWarrantyItemListState,
  getWarrantyItemPageNumbers,
  refreshWarrantyItemList,
  type WarrantyItemListController,
} from './list/warranty-item-list-state'
import type { WarrantyItemListItem } from './list/warranty-item-list-service'
import {
  createWarrantyItemGridFields,
  createWarrantyItemGridRows,
  type WarrantyItemGridRow,
} from './list/warranty-item-grid'
import { getWarrantyItemPagePolicy } from './page-policy'
import { readWarrantyItemAccessSnapshot } from './runtime/access-snapshot'
import { getWarrantyItemEditCompatibilityPolicy, readWarrantyItemEditCompatibilitySnapshot, type WarrantyItemEditCompatibilitySnapshot } from './runtime/edit-compatibility'
import { createLegacyXtoolsTransport } from './runtime/legacy-xtools-transport'
import {
  createWarrantyItemImportController,
  createWarrantyItemImportState,
  type WarrantyItemImportController,
} from './import/warranty-item-import-state'
import {
  createWarrantyItemImportService,
  DEFAULT_WARRANTY_ITEM_IMPORT_MAPPING,
  type WarrantyItemImportColumn,
  type WarrantyItemImportMapping,
  type WarrantyItemImportService,
} from './import/warranty-item-import-service'
import {
  createWarrantyItemImportAllController,
  createWarrantyItemImportAllState,
  type WarrantyItemImportAllController,
} from './import/warranty-item-import-all-state'
import {
  createWarrantyItemImportAllService,
  DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING,
  type WarrantyItemImportAllMapping,
} from './import/warranty-item-import-all-service'
import {
  createWarrantyItemReferenceIcController,
  createWarrantyItemReferenceIcState,
  type WarrantyItemReferenceIcController,
} from './reference-ic/warranty-item-reference-ic-state'
import { createWarrantyItemReferenceIcService } from './reference-ic/warranty-item-reference-ic-service'
import { formatWarrantyItemReferenceDate } from './reference-ic/warranty-item-reference-ic-display'
import { createWarrantyItemExportService } from './export/warranty-item-export-service'
import { createWarrantyItemDownloadCapability } from './export/warranty-item-download-capability'
import {
  createWarrantyItemExportController,
  createWarrantyItemExportState,
  type WarrantyItemExportController,
} from './export/warranty-item-export-state'

const title = 'Master : รายการสินค้าประกัน'
const page = ref<{ pageTitle: string } | null>(null)
const access = getWarrantyItemPagePolicy(readWarrantyItemAccessSnapshot())
const state = reactive(createWarrantyItemListState())
const filters = reactive({
  field: state.query.field,
  text: state.query.text,
  active: state.query.active,
})
const controller = shallowRef<WarrantyItemListController | null>(null)
const deleteState = reactive(createWarrantyItemDeleteState())
const deleteController = shallowRef<WarrantyItemDeleteController | null>(null)
const formState = reactive(createWarrantyItemFormState())
const formController = shallowRef<WarrantyItemFormController | null>(null)
const importState = reactive(createWarrantyItemImportState())
const importController = shallowRef<WarrantyItemImportController | null>(null)
const importAllState = reactive(createWarrantyItemImportAllState())
const importAllController = shallowRef<WarrantyItemImportAllController | null>(null)
const referenceIcState = reactive(createWarrantyItemReferenceIcState())
const referenceIcController = shallowRef<WarrantyItemReferenceIcController | null>(null)
interface WarrantyItemGridApi {
  createHeaderFromArray(fields: unknown[]): unknown[]
  setHeader(header: unknown[]): void
  setDisplay(rows: WarrantyItemGridRow[]): void
}
const warrantyItemGrid = shallowRef<WarrantyItemGridApi | null>(null)
const warrantyItemGridReady = ref(false)
const warrantyItemGridSortModel = ref<unknown[]>([])
const exportState = reactive(createWarrantyItemExportState())
const exportController = shallowRef<WarrantyItemExportController | null>(null)
const importFileInput = ref<HTMLInputElement | null>(null)
const importOpen = ref(false)
const importAllOpen = ref(false)
const referenceIcOpen = ref(false)
const importTemplatePending = ref(false)
const importAllTemplatePending = ref(false)
const materialSearchText = ref('')
const setupError = ref<Error | null>(null)
const busy = computed(() => state.status === 'initial-loading' || state.status === 'refreshing')
const displayedPage = ref(1)
const pageNumbers = computed(() => getWarrantyItemPageNumbers(state.maxPage))
const formOpen = computed(() => formState.mode !== 'closed' && Boolean(formState.draft))
const deletePending = computed(() => deleteState.pending)
const importPending = computed(() => importState.uploadPending || importState.importPending || importState.refreshPending)
const importAllPending = computed(() => importAllState.uploadPending || importAllState.importPending || importAllState.refreshPending)
const referenceIcPending = computed(() => referenceIcState.status === 'loading' || referenceIcState.status === 'creating')
const exportPending = computed(() => exportState.pending)
const formPending = computed(() => formState.detailPending
  || formState.groupsPending
  || formState.materialsPending
  || formState.savePending
  || deletePending.value
  || importPending.value
  || importTemplatePending.value
  || importAllPending.value
  || importAllTemplatePending.value
  || referenceIcPending.value
  || exportPending.value)

const importMapping = reactive<WarrantyItemImportMapping>({ ...DEFAULT_WARRANTY_ITEM_IMPORT_MAPPING })
const importMappingFields: ReadonlyArray<{ key: keyof WarrantyItemImportMapping, label: string }> = [
  { key: 'war_code', label: 'Warranty Code' },
  { key: 'war_des', label: 'Warranty Name' },
  { key: 'type_code', label: 'Work Type' },
  { key: 'tot_date', label: 'Warranty Day' },
  { key: 'tot_month', label: 'Warranty Month' },
  { key: 'tot_year', label: 'Warranty Year' },
  { key: 'lifetime', label: 'Lifetime' },
  { key: 'itemcode', label: 'Material Code' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'war_date_start', label: 'Start Date' },
  { key: 'war_date_end', label: 'End Date' },
  { key: 'active', label: 'Active' },
]
const importMappingColumns: WarrantyItemImportColumn[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
]
const importAllMapping = reactive<WarrantyItemImportAllMapping>({ ...DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING })
const importAllMappingFields: ReadonlyArray<{ key: keyof WarrantyItemImportAllMapping, label: string }> = [
  { key: 'pre_event', label: 'Pre Event' },
  { key: 'loccode', label: 'Location Code' },
  { key: 'locname', label: 'Location Name' },
  { key: 'war_code', label: 'Warranty Code' },
  { key: 'war_des', label: 'Warranty Name' },
  { key: 'type_code', label: 'Work Type' },
  { key: 'itemcode', label: 'Material Code' },
  { key: 'tot_date', label: 'Warranty Day' },
  { key: 'tot_month', label: 'Warranty Month' },
  { key: 'tot_year', label: 'Warranty Year' },
  { key: 'lifetime', label: 'Lifetime' },
  { key: 'itemname_other', label: 'Other Material Name' },
  { key: 'serial_number', label: 'Serial Number' },
  { key: 'startdate', label: 'Start Date' },
  { key: 'enddate', label: 'End Date' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'vendor_start_dt', label: 'Vendor Start Date' },
  { key: 'vendor_end_dt', label: 'Vendor End Date' },
  { key: 'vendor_remark', label: 'Vendor Remark' },
  { key: 'remark', label: 'Remark' },
  { key: 'active_row', label: 'Active Row' },
  { key: 'active', label: 'Active' },
]
const importAllMappingColumns: WarrantyItemImportColumn[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
]

const importPreviewColumns: ReadonlyArray<{ key: WarrantyItemImportColumn, label: string }> = [
  { key: 'A', label: 'Warranty Code' },
  { key: 'B', label: 'Warranty Name' },
  { key: 'C', label: 'Work Type' },
  { key: 'D', label: 'Days' },
  { key: 'E', label: 'Months' },
  { key: 'F', label: 'Years' },
  { key: 'G', label: 'Lifetime' },
  { key: 'H', label: 'Material Code' },
  { key: 'I', label: 'Ignored' },
  { key: 'J', label: 'Vendor' },
  { key: 'K', label: 'Start Date' },
  { key: 'L', label: 'End Date' },
  { key: 'M', label: 'Active' },
]

interface WarrantyItemRuntimeGlobals {
  auth?: unknown
  store?: { state?: { configData?: unknown, maincomp?: unknown } }
  ui?: Record<string, unknown>
  $msg?: {
    confirm?: (message: string) => Promise<unknown> | unknown
    alert?: (title: string, message: string, type: string) => unknown
  }
}

function readCurrentEditCompatibility(): WarrantyItemEditCompatibilitySnapshot {
  const globals = globalThis as typeof globalThis & WarrantyItemRuntimeGlobals
  return readWarrantyItemEditCompatibilitySnapshot({
    configData: globals.store?.state?.configData,
    auth: globals.auth,
  })
}

const editCompatibility = ref<WarrantyItemEditCompatibilitySnapshot>(readCurrentEditCompatibility())
const canEditNow = computed(() => access.canCreate
  && editCompatibility.value.status === 'allowed'
  && (editCompatibility.value.trn0001 === 'Y' || editCompatibility.value.trn0001 === 'N')
  && typeof editCompatibility.value.isAdmin === 'boolean'
  && getWarrantyItemEditCompatibilityPolicy(editCompatibility.value).canEdit)

function readReferenceIcCost(): string | null {
  const globals = globalThis as typeof globalThis & WarrantyItemRuntimeGlobals
  const maincomp = globals.store?.state?.maincomp
  if (typeof maincomp !== 'object' || maincomp === null || Array.isArray(maincomp)) return null
  const iccost = (maincomp as Record<string, unknown>).iccost
  if (iccost === '3') return '3'
  return typeof iccost === 'string' ? iccost : null
}

const referenceIcAvailable = computed(() => access.canCreate && readReferenceIcCost() === '3')
const referenceIcMaxPage = computed(() => Math.max(1, Math.ceil(referenceIcState.total / referenceIcState.pageSize)))
const referenceIcAllSelected = computed(() => referenceIcState.items.length > 0
  && referenceIcState.items.every(item => referenceIcState.selectedItems.some(selected => (
    selected.ic_docno ?? ''
  ) === (item.ic_docno ?? '') && (selected.ic_itemno ?? '') === (item.ic_itemno ?? ''))))
const warrantyItemGridRows = computed(() => createWarrantyItemGridRows(state.items, state.query.page, state.query.pageSize))

function warrantyItemUi(key: string, fallback: string): string {
  const globals = globalThis as typeof globalThis & WarrantyItemRuntimeGlobals
  const value = globals.ui?.[key]
  return typeof value === 'string' && value.trim() !== '' ? value : fallback
}

async function refreshList(): Promise<void> {
  if (!controller.value) {
    throw new Error('Warranty Item list service is unavailable.')
  }
  await refreshWarrantyItemList(controller.value)
}

let formOptions: WarrantyItemFormControllerOptions | null = null
let deleteOptions: WarrantyItemDeleteControllerOptions | null = null
let importService: WarrantyItemImportService | null = null
const importDownload = createWarrantyItemDownloadCapability()
const importAllDownload = createWarrantyItemDownloadCapability()

async function confirmDelete(target: { code: string, name: string }): Promise<boolean> {
  const globals = globalThis as typeof globalThis & WarrantyItemRuntimeGlobals
  if (typeof globals.$msg?.confirm !== 'function') {
    return false
  }
  return Boolean(await globals.$msg.confirm(formatWarrantyItemDeleteConfirmation(target)))
}

async function confirmExport(): Promise<boolean> {
  const globals = globalThis as typeof globalThis & WarrantyItemRuntimeGlobals
  if (typeof globals.$msg?.confirm !== 'function') {
    return false
  }
  return Boolean(await globals.$msg.confirm('Exporting data may take a long time if there is a large amount of data. Please confirm to proceed with the operation.'))
}

function connectController(): void {
  if (!access.canReadList) return
  try {
    const transport = createLegacyXtoolsTransport()
    const listService = createWarrantyItemListService(transport)
    const editService = createWarrantyItemEditService(transport)
    const deleteService = createWarrantyItemDeleteService(transport)
    const createdImportService = createWarrantyItemImportService(transport)
    const createdImportAllService = createWarrantyItemImportAllService(transport)
    const createdReferenceIcService = createWarrantyItemReferenceIcService(transport)
    importService = createdImportService
    const exportService = createWarrantyItemExportService(transport)
    const exportDownload = createWarrantyItemDownloadCapability()
    const accessSnapshot = readWarrantyItemAccessSnapshot()
    controller.value = createWarrantyItemListController(listService, state)
    formOptions = access.canCreate
      ? {
          service: editService,
          access: accessSnapshot,
          editCompatibility: editCompatibility.value,
          refreshList,
        }
      : null
    const createdDeleteOptions: WarrantyItemDeleteControllerOptions = {
      service: deleteService,
      access: accessSnapshot,
      editCompatibility: editCompatibility.value,
      confirm: confirmDelete,
      refreshList,
    }
    deleteOptions = createdDeleteOptions
    deleteController.value = createWarrantyItemDeleteController(createdDeleteOptions, deleteState)
    if (formOptions) {
      formController.value = createWarrantyItemFormController(formOptions, formState)
    } else {
      formController.value = null
    }
    importController.value = createWarrantyItemImportController({
      service: createdImportService,
      canImport: () => access.canCreate,
      refreshList,
      getMapping: () => ({ ...importMapping }),
    }, importState)
    importAllController.value = createWarrantyItemImportAllController({
      service: createdImportAllService,
      canImport: () => access.canCreate,
      refreshList,
      getMapping: () => ({ ...importAllMapping }),
    }, importAllState)
    referenceIcController.value = createWarrantyItemReferenceIcController({
      service: createdReferenceIcService,
      refreshList,
      onCreateSettled: closeReferenceIc,
      getExcluded: () => state.items.flatMap(item => item.referenceIcDocument || item.referenceIcItem
        ? [{ ic_docno: item.referenceIcDocument, ic_itemno: item.referenceIcItem }]
        : []),
    }, referenceIcState)
    exportController.value = createWarrantyItemExportController({
      service: exportService,
      download: exportDownload,
      canExport: () => access.canCreate,
      confirm: confirmExport,
    }, exportState)
    setupError.value = null
    state.error = null
    formState.error = null
    importState.error = null
    importAllState.error = null
    referenceIcState.error = null
    exportState.error = null
  } catch (reason: unknown) {
    setupError.value = reason instanceof Error ? reason : new Error('Warranty Item service is unavailable.')
    state.status = 'error'
    state.error = setupError.value
    formState.error = setupError.value
    importState.error = setupError.value
    importAllState.error = setupError.value
    referenceIcState.error = setupError.value
    exportState.error = setupError.value
  }
}

connectController()

function configureWarrantyItemGridHeader(): void {
  if (!warrantyItemGrid.value) return
  warrantyItemGrid.value.setHeader(warrantyItemGrid.value.createHeaderFromArray(createWarrantyItemGridFields(canEditNow.value)))
}

function updateWarrantyItemGridDisplay(): void {
  if (!warrantyItemGrid.value) return
  warrantyItemGrid.value.setDisplay(warrantyItemGridRows.value)
}

function onWarrantyItemGridReady(): void {
  warrantyItemGridReady.value = true
  configureWarrantyItemGridHeader()
  updateWarrantyItemGridDisplay()
}

function onWarrantyItemGridCellClicked(event: { col?: string, data?: WarrantyItemGridRow }): void {
  if (!event.data) return
  if (event.col === 'action_edit') {
    void startEdit(event.data.source.code)
  } else if (event.col === 'action_del') {
    deleteItem(event.data.source)
  }
}

function onWarrantyItemGridSortChanged(event: { model?: unknown[] }): void {
  warrantyItemGridSortModel.value = event.model ?? []
}

watch(warrantyItemGridRows, () => {
  if (warrantyItemGridReady.value) updateWarrantyItemGridDisplay()
}, { flush: 'post' })

watch(canEditNow, () => {
  if (warrantyItemGridReady.value) {
    configureWarrantyItemGridHeader()
    updateWarrantyItemGridDisplay()
  }
}, { flush: 'post' })

// Retained rows still belong to the last successful page if a later request fails.
watch(() => state.status, status => {
  if (status === 'loaded') displayedPage.value = state.query.page
}, { flush: 'sync' })

function retry(): void {
  if (!controller.value) connectController()
  void controller.value?.retry()
}

function refreshEditCompatibility(): void {
  const snapshot = readCurrentEditCompatibility()
  editCompatibility.value = snapshot
  if (formOptions) formOptions.editCompatibility = snapshot
  if (deleteOptions) deleteOptions.editCompatibility = snapshot
}

function startCreate(): void {
  void formController.value?.startCreate()
}

async function startEdit(code: string): Promise<boolean> {
  refreshEditCompatibility()
  return formController.value?.startEdit(code) ?? false
}

function cancelForm(): void {
  materialSearchText.value = ''
  formController.value?.cancel()
}

async function saveForm(): Promise<WarrantyItemSaveResult> {
  refreshEditCompatibility()
  return formController.value?.save() ?? {
    status: 'mutation-failed',
    error: new Error('Warranty Item form is unavailable.'),
  }
}

function deleteItem(item: WarrantyItemListItem): void {
  refreshEditCompatibility()
  void deleteController.value?.delete({
    code: item.code,
    name: item.name,
    deleteContext: item.deleteContext,
  })
}

function isDeleteBlocked(code: string): boolean {
  return deleteController.value?.isBlocked(code) ?? false
}

function retryDeleteRefresh(): void {
  void deleteController.value?.retryRefresh()
}

async function searchMaterialOptions(): Promise<boolean> {
  return formController.value?.searchMaterials(materialSearchText.value) ?? false
}

function selectMaterialByCode(event: Event): void {
  const code = (event.target as HTMLSelectElement).value
  if (!code) {
    formController.value?.clearMaterial()
    return
  }
  const material = formState.materials.find(candidate => candidate.code === code)
  if (material) formController.value?.selectMaterial(material)
}

function selectGroupByCode(event: Event): void {
  formController.value?.setGroup((event.target as HTMLSelectElement).value)
}

function toggleLifetime(event: Event): void {
  formController.value?.setLifetime((event.target as HTMLInputElement).checked)
}

function openImport(): void {
  Object.assign(importMapping, DEFAULT_WARRANTY_ITEM_IMPORT_MAPPING)
  importController.value?.reset()
  importOpen.value = true
}

function openImportAll(): void {
  Object.assign(importAllMapping, DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING)
  importAllController.value?.reset()
  importAllOpen.value = true
}

function closeImport(): void {
  if (importPending.value) return
  importController.value?.reset()
  importOpen.value = false
}

function closeImportAll(): void {
  if (importAllPending.value || importAllTemplatePending.value) return
  importAllController.value?.reset()
  importAllOpen.value = false
}

function selectImportFile(event: Event): void {
  const input = event.target as HTMLInputElement
  void importController.value?.upload(Array.from(input.files ?? []))
  input.value = ''
}

function importRows(): void {
  void importController.value?.import()
}

function retryImportRefresh(): void {
  void importController.value?.retryRefresh()
}

function selectImportAllFile(event: Event): void {
  const input = event.target as HTMLInputElement
  void importAllController.value?.upload(Array.from(input.files ?? []))
  input.value = ''
}

function importAllRows(): void {
  void importAllController.value?.import()
}

function retryImportAllRefresh(): void {
  void importAllController.value?.retryRefresh()
}

function openReferenceIc(): void {
  if (!referenceIcAvailable.value) return
  referenceIcController.value?.reset()
  referenceIcOpen.value = true
  void referenceIcController.value?.open()
}

function closeReferenceIc(): void {
  if (referenceIcPending.value) return
  referenceIcController.value?.reset()
  referenceIcOpen.value = false
}

function searchReferenceIc(): void {
  void referenceIcController.value?.search()
}

function retryReferenceIc(): void {
  void referenceIcController.value?.retry()
}

function goToReferenceIcPage(page: number): void {
  if (!referenceIcController.value) return
  referenceIcState.page = Math.min(Math.max(1, page), referenceIcMaxPage.value)
  void referenceIcController.value.search()
}

function toggleReferenceIcRow(row: typeof referenceIcState.items[number]): void {
  referenceIcController.value?.toggleSelection(row)
}

function toggleAllReferenceIc(event: Event): void {
  referenceIcController.value?.toggleAll((event.target as HTMLInputElement).checked)
}

function createReferenceIcItems(): void {
  void referenceIcController.value?.createSelected()
}

async function downloadStandardImportTemplate(): Promise<void> {
  if (!importService?.getTemplateToken || importTemplatePending.value) return
  const target = importDownload.reserve()
  if (!target) return

  importTemplatePending.value = true
  try {
    const token = await importService.getTemplateToken('Template_List_Warranty')
    importDownload.navigate(target, token)
  } catch (reason: unknown) {
    importDownload.close(target)
    const globals = globalThis as typeof globalThis & WarrantyItemRuntimeGlobals
    globals.$msg?.alert?.(
      'Warranty Item Import',
      reason instanceof Error ? reason.message : 'Template download failed.',
      'danger',
    )
  } finally {
    importTemplatePending.value = false
  }
}

async function downloadImportAllTemplate(): Promise<void> {
  if (!importAllController.value || importAllTemplatePending.value) return
  const target = importAllDownload.reserve()
  if (!target) return

  importAllTemplatePending.value = true
  try {
    const transport = createLegacyXtoolsTransport()
    const service = createWarrantyItemImportAllService(transport)
    const token = await service.getTemplateToken('Template_All_Warranty')
    importAllDownload.navigate(target, token)
  } catch (reason: unknown) {
    importAllDownload.close(target)
    const globals = globalThis as typeof globalThis & WarrantyItemRuntimeGlobals
    globals.$msg?.alert?.(
      'Warranty Item Import All',
      reason instanceof Error ? reason.message : 'Template download failed.',
      'danger',
    )
  } finally {
    importAllTemplatePending.value = false
  }
}

function exportWarrantyItems(): void {
  void exportController.value?.start()
}

onMounted(() => {
  if (page.value) page.value.pageTitle = title
  document.title = title
  refreshEditCompatibility()
  if (typeof window !== 'undefined') window.addEventListener('focus', refreshEditCompatibility)
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', refreshEditCompatibility)
  void controller.value?.loadInitial()
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('focus', refreshEditCompatibility)
  if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', refreshEditCompatibility)
})
</script>

<template>
  <re-page ref="page">
    <template #body>
      <section class="box box-widget warranty-item-page" aria-labelledby="warranty-item-title">
        <div class="box-header with-border">
          <h1 id="warranty-item-title" class="box-title">Warranty Item</h1>
          <p class="access-label">{{ access.label }}</p>
        </div>
        <div class="box-body">
          <p v-if="access.status === 'unavailable'" role="alert">
            Warranty Item access could not be verified. Reload the page to try again.
          </p>
          <p v-else-if="access.status === 'denied'" role="alert">
            You do not have permission to view Warranty Items.
          </p>
          <template v-else-if="access.canReadList">
            <p v-if="formState.error && !formOpen" class="alert alert-danger" role="alert">{{ formState.error.message }}</p>
            <p v-if="deleteState.status === 'deleted'" class="alert alert-success" role="status">Warranty Item deleted.</p>
            <p v-else-if="deleteState.status === 'superseded' && deleteState.lastDeletedCode" class="alert alert-success" role="status">Warranty Item deletion completed; the newer list result is shown.</p>
            <p v-if="deleteState.error" class="alert alert-danger" role="alert">{{ deleteState.error.message }}</p>
            <p v-if="exportState.status === 'generating'" role="status">Preparing Warranty Item Export…</p>
            <p v-else-if="exportState.status === 'initiated'" class="alert alert-success" role="status">Warranty Item Export initiated.</p>
            <p v-if="exportState.error" class="alert alert-danger" role="alert">{{ exportState.error.message }}</p>
            <button v-if="deleteState.status === 'refresh-failed-after-delete'" type="button" class="btn btn-sm btn-default" :disabled="busy || formPending" @click="retryDeleteRefresh">Retry list refresh</button>
            <div v-if="formOpen" class="warranty-item-form-panel" aria-labelledby="warranty-item-form-title">
              <h2 id="warranty-item-form-title">{{ formState.mode === 'create' ? 'Create Warranty Item' : 'Edit Warranty Item' }}</h2>
              <p v-if="formState.error" class="alert alert-danger" role="alert">{{ formState.error.message }}</p>
              <ul v-if="formState.validationErrors.length" class="alert alert-danger" role="alert">
                <li v-for="validationError in formState.validationErrors" :key="`${validationError.field}-${validationError.code}`">
                  {{ validationError.message }}
                </li>
              </ul>
              <form v-if="formState.draft" class="warranty-item-form" @submit.prevent="saveForm">
                <div class="form-group">
                  <label for="warranty-item-code">Warranty Code</label>
                  <input id="warranty-item-code" name="warranty-item-code" v-model="formState.draft.code" class="form-control input-sm" :maxlength="LEGACY_UI_WARRANTY_CODE_MAX" :readonly="formState.mode === 'edit'" :disabled="formPending">
                </div>
                <div class="form-group">
                  <label for="warranty-item-name">Warranty Name</label>
                  <input id="warranty-item-name" v-model="formState.draft.name" class="form-control input-sm" :maxlength="LEGACY_UI_WARRANTY_NAME_MAX" :disabled="formPending">
                </div>
                <div class="form-group">
                  <label for="warranty-item-group">Group</label>
                  <select id="warranty-item-group" :value="formState.draft.groupCode" class="form-control input-sm" :disabled="formPending || formState.groupsPending" @change="selectGroupByCode">
                    <option value="">Select Group</option>
                    <option v-for="group in formState.groups" :key="group.code" :value="group.code" :disabled="group.currentOnly">
                      {{ group.name }}{{ group.currentOnly ? ' (current, inactive)' : '' }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="warranty-item-material-search">Material search</label>
                  <div class="warranty-item-inline-controls">
                    <input id="warranty-item-material-search" v-model="materialSearchText" class="form-control input-sm" :disabled="formPending">
                    <button type="button" class="btn btn-sm btn-default" :disabled="formPending" @click="searchMaterialOptions">Search</button>
                  </div>
                  <select id="warranty-item-material" class="form-control input-sm" :value="formState.draft.materialCode" :disabled="formPending || formState.materialsPending" @change="selectMaterialByCode">
                    <option value="">No Material</option>
                    <option v-if="formState.draft.materialCode && !formState.materials.some(material => material.code === formState.draft?.materialCode)" :value="formState.draft.materialCode">
                      {{ formState.draft.materialName }} (current)
                    </option>
                    <option v-for="material in formState.materials" :key="material.code" :value="material.code">{{ material.name }}</option>
                  </select>
                  <button type="button" class="btn btn-sm btn-default" :disabled="formPending" @click="formController?.clearMaterial()">Clear Material</button>
                </div>
                <fieldset class="warranty-item-duration">
                  <legend>Warranty duration</legend>
                  <label><input type="number" step="any" v-model.number="formState.draft.duration.years" :disabled="formPending || formState.draft.lifetime"> Years</label>
                  <label><input type="number" step="any" v-model.number="formState.draft.duration.months" :disabled="formPending || formState.draft.lifetime"> Months</label>
                  <label><input type="number" step="any" v-model.number="formState.draft.duration.days" :disabled="formPending || formState.draft.lifetime"> Days</label>
                </fieldset>
                <div class="checkbox">
                  <label><input type="checkbox" :checked="formState.draft.lifetime" :disabled="formPending" @change="toggleLifetime"> Lifetime</label>
                </div>
                <div class="checkbox">
                  <label><input type="checkbox" v-model="formState.draft.active" :disabled="formPending"> Active</label>
                </div>
                <div class="warranty-item-form-actions">
                  <button type="submit" class="btn btn-sm bg-navy" :disabled="formPending">Save</button>
                  <button type="button" class="btn btn-sm btn-default" :disabled="formPending" @click="cancelForm">Cancel</button>
                </div>
              </form>
            </div>

            <div v-if="access.canCreate" class="warranty-item-list-actions">
              <button type="button" class="btn btn-sm btn-instagram" :disabled="busy || formPending || !exportController" @click="exportWarrantyItems">Export</button>
              <button type="button" class="btn btn-sm bg-navy" :disabled="busy || formPending" @click="startCreate">Create</button>
              <button type="button" class="btn btn-sm btn-tumblr" :disabled="busy || formPending" @click="openImport">Import</button>
              <button type="button" class="btn btn-sm btn-warning" :disabled="busy || formPending" @click="openImportAll">Import All Warranty</button>
              <button v-if="referenceIcAvailable" type="button" class="btn btn-sm bg-purple" :disabled="busy || formPending" @click="openReferenceIc">Reference IC</button>
            </div>
            <section v-if="importOpen" class="warranty-item-import-panel" aria-labelledby="warranty-item-import-title">
              <div class="warranty-item-import-heading">
                <div>
                  <h2 id="warranty-item-import-title">Import Warranty Items</h2>
                  <p>Select one .xls or .xlsx workbook, review the parsed A–M rows, then explicitly import the batch.</p>
                </div>
                <button type="button" class="btn btn-sm btn-default" :disabled="formPending" @click="closeImport">Close</button>
              </div>
              <div class="warranty-item-import-controls">
                <input
                  ref="importFileInput"
                  type="file"
                  accept=".xls,.xlsx"
                  :disabled="formPending"
                  @change="selectImportFile"
                >
                 <span v-if="importState.fileName">{{ importState.fileName }}</span>
               </div>
               <div class="warranty-item-import-mapping">
                 <div v-for="field in importMappingFields" :key="field.key" class="form-group">
                   <label :for="`warranty-item-import-${field.key}`">{{ field.label }}</label>
                   <select :id="`warranty-item-import-${field.key}`" v-model="importMapping[field.key]" class="form-control input-sm" :disabled="formPending">
                     <option v-for="column in importMappingColumns" :key="column" :value="column">{{ column }}</option>
                   </select>
                 </div>
               </div>
               <button type="button" class="btn btn-sm btn-success" :disabled="formPending || !importService" @click="downloadStandardImportTemplate">Download Template_List_Warranty</button>
              <p v-if="importState.status === 'uploading'" role="status">Uploading and parsing workbook…</p>
              <p v-else-if="importState.status === 'ready-to-import'" role="status">Preview ready. Review the rows before importing.</p>
              <p v-else-if="importState.status === 'importing' || importState.status === 'refreshing-after-import'" role="status">{{ importState.status === 'importing' ? 'Importing Warranty Items…' : 'Refreshing Warranty Items…' }}</p>
              <p v-else-if="importState.status === 'imported'" class="alert alert-success" role="status">Warranty Item Import completed.</p>
              <p v-if="importState.error" class="alert alert-danger" role="alert">{{ importState.error.message }}</p>
              <p v-if="importState.status === 'refresh-failed-after-import'" class="alert alert-warning" role="status">
                Import succeeded, but the list refresh failed. Retry refresh without importing the batch again.
              </p>
              <button v-if="importState.status === 'refresh-failed-after-import'" type="button" class="btn btn-sm btn-default" :disabled="formPending" @click="retryImportRefresh">Retry list refresh</button>
              <div v-if="importState.rows.length" class="table-responsive warranty-item-import-preview">
                <p>Column I is ignored and is not sent to the persistence endpoint.</p>
                <table class="table table-bordered table-striped">
                  <caption>Import preview — {{ importState.rows.length }} parsed row(s)</caption>
                  <thead>
                    <tr>
                      <th scope="col">Row</th>
                      <th v-for="column in importPreviewColumns" :key="column.key" scope="col">{{ column.key }} · {{ column.label }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in importState.rows" :key="row.rowNumber">
                      <td>{{ row.rowNumber }}</td>
                      <td v-for="column in importPreviewColumns" :key="column.key">{{ row.columns[column.key] ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="warranty-item-import-actions">
                <button type="button" class="btn btn-sm bg-olive" :disabled="formPending || importState.status !== 'ready-to-import' || !importState.rows.length" @click="importRows">Import</button>
                <button type="button" class="btn btn-sm btn-default" :disabled="formPending" @click="closeImport">Cancel</button>
              </div>
            </section>
            <section
              v-if="importAllOpen"
              class="warranty-item-import-panel warranty-item-import-all-panel"
              aria-labelledby="warranty-item-import-all-title"
              data-persistence-endpoint="CSM/Master/WarrantyAutoImportData"
            >
              <div class="warranty-item-import-heading">
                <div>
                  <h2 id="warranty-item-import-all-title">Import All Warranty</h2>
                  <p>Select one .xls or .xlsx workbook, review the parsed A–V rows, then explicitly import the batch.</p>
                </div>
                <button type="button" class="btn btn-sm btn-default" :disabled="formPending" @click="closeImportAll">Close</button>
              </div>
              <div class="warranty-item-import-controls">
                <input type="file" accept=".xls,.xlsx" :disabled="formPending" @change="selectImportAllFile">
                <span v-if="importAllState.fileName">{{ importAllState.fileName }}</span>
              </div>
              <div class="warranty-item-import-mapping">
                <div v-for="field in importAllMappingFields" :key="field.key" class="form-group">
                  <label :for="`warranty-item-import-all-${field.key}`">{{ field.label }}</label>
                  <select :id="`warranty-item-import-all-${field.key}`" v-model="importAllMapping[field.key]" class="form-control input-sm" :disabled="formPending">
                    <option v-for="column in importAllMappingColumns" :key="column" :value="column">{{ column }}</option>
                  </select>
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-success" :disabled="formPending || !importAllController" @click="downloadImportAllTemplate">Download Template_All_Warranty</button>
              <p v-if="importAllState.status === 'uploading'" role="status">Uploading and parsing Import All Warranty workbook…</p>
              <p v-else-if="importAllState.status === 'ready-to-import'" role="status">Import All preview ready. Review the rows before importing.</p>
              <p v-else-if="importAllState.status === 'importing' || importAllState.status === 'refreshing-after-import'" role="status">{{ importAllState.status === 'importing' ? 'Importing All Warranty Items…' : 'Refreshing Warranty Items…' }}</p>
              <p v-else-if="importAllState.status === 'imported'" class="alert alert-success" role="status">Import All Warranty completed.</p>
              <p v-if="importAllState.error" class="alert alert-danger" role="alert">{{ importAllState.error.message }}</p>
              <p v-if="importAllState.status === 'refresh-failed-after-import'" class="alert alert-warning" role="status">
                Import All succeeded, but the list refresh failed. Retry refresh without importing the batch again.
              </p>
              <button v-if="importAllState.status === 'refresh-failed-after-import'" type="button" class="btn btn-sm btn-default" :disabled="formPending" @click="retryImportAllRefresh">Retry list refresh</button>
              <div v-if="importAllState.rows.length" class="table-responsive warranty-item-import-preview">
                <table class="table table-bordered table-striped">
                  <caption>Import All preview — {{ importAllState.rows.length }} parsed row(s)</caption>
                  <thead>
                    <tr>
                      <th scope="col">Row</th>
                      <th v-for="column in importAllMappingColumns" :key="column" scope="col">{{ column }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in importAllState.rows" :key="row.rowNumber">
                      <td>{{ row.rowNumber }}</td>
                      <td v-for="column in importAllMappingColumns" :key="column">{{ row.columns[column] ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="warranty-item-import-actions">
                <button type="button" class="btn btn-sm bg-olive" :disabled="formPending || importAllState.status !== 'ready-to-import' || !importAllState.rows.length" @click="importAllRows">Import All Warranty</button>
                <button type="button" class="btn btn-sm btn-default" :disabled="formPending" @click="closeImportAll">Cancel</button>
              </div>
            </section>
            <section v-if="referenceIcOpen" class="warranty-item-reference-ic-panel" aria-labelledby="warranty-item-reference-ic-title" data-lookup-endpoint="csm/master/WarrantyRefIC" data-create-endpoint="CSM/MASTER/WarrantyItem_Create">
              <div class="warranty-item-import-heading">
                <div>
                  <h2 id="warranty-item-reference-ic-title">Reference IC</h2>
                  <p>Choose receiving-document warranty rows to create Warranty Items.</p>
                </div>
                <button type="button" class="btn btn-sm btn-default" :disabled="formPending" @click="closeReferenceIc">Close</button>
              </div>
              <form class="warranty-item-filters" @submit.prevent="searchReferenceIc">
                <div class="form-group">
                  <label for="warranty-item-reference-ic-field">{{ warrantyItemUi('search_by', 'Search by') }}</label>
                  <select id="warranty-item-reference-ic-field" v-model="referenceIcState.searchField" class="form-control input-sm" :disabled="formPending">
                    <option value="war_code">Warranty Code</option>
                    <option value="war_des">Warranty Name</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="warranty-item-reference-ic-text">{{ warrantyItemUi('search', 'Search') }}</label>
                  <input id="warranty-item-reference-ic-text" v-model="referenceIcState.searchText" type="search" class="form-control input-sm" :disabled="formPending">
                </div>
                <button type="submit" class="btn btn-sm bg-navy" :disabled="formPending || !referenceIcController">Search</button>
              </form>
              <p v-if="referenceIcState.status === 'loading'" role="status">Loading Reference IC…</p>
              <div v-else-if="referenceIcState.status === 'load-failed'" class="alert alert-danger" role="alert">
                <p>{{ referenceIcState.error?.message || 'Unable to load Reference IC rows.' }}</p>
                <button type="button" class="btn btn-sm btn-default" :disabled="formPending" @click="retryReferenceIc">Retry</button>
              </div>
              <p v-else-if="referenceIcState.status === 'creating'" role="status">Creating Warranty Items from Reference IC…</p>
              <p v-else-if="referenceIcState.status === 'created'" class="alert alert-success" role="status">Reference IC Warranty Items created.</p>
              <p v-if="referenceIcState.status === 'create-failed' && referenceIcState.error" class="alert alert-danger" role="alert">{{ referenceIcState.error.message }}</p>
              <div class="table-responsive warranty-item-reference-ic-table">
                <table class="table table-bordered table-striped">
                  <caption>Reference IC — {{ referenceIcState.selectedItems.length }} selected of {{ referenceIcState.total }}</caption>
                  <thead>
                    <tr>
                      <th scope="col"><input type="checkbox" :checked="referenceIcAllSelected" :disabled="formPending || !referenceIcState.items.length" aria-label="Select all Reference IC rows" @change="toggleAllReferenceIc"></th>
                      <th scope="col">No.</th>
                      <th scope="col">Warranty Code</th>
                      <th scope="col">Warranty Name</th>
                      <th scope="col">Vendor</th>
                      <th scope="col">Start Date</th>
                      <th scope="col">End Date</th>
                      <th scope="col">IC Doc No.</th>
                      <th scope="col">IC No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in referenceIcState.items" :key="`${row.ic_docno ?? ''}:${row.ic_itemno ?? ''}`">
                      <td><input type="checkbox" :checked="referenceIcState.selectedItems.some(selected => (selected.ic_docno ?? '') === (row.ic_docno ?? '') && (selected.ic_itemno ?? '') === (row.ic_itemno ?? ''))" :disabled="formPending" @change="toggleReferenceIcRow(row)"></td>
                      <td>{{ (referenceIcState.page - 1) * referenceIcState.pageSize + index + 1 }}</td>
                      <td>{{ row.war_code ?? '—' }}</td>
                      <td>{{ row.war_des ?? '—' }}</td>
                      <td>{{ row.cust_name ?? '—' }}</td>
                      <td>{{ formatWarrantyItemReferenceDate(row.war_date_start) }}</td>
                      <td>{{ formatWarrantyItemReferenceDate(row.war_date_end) }}</td>
                      <td>{{ row.ic_docno ?? '—' }}</td>
                      <td>{{ row.ic_itemno ?? '—' }}</td>
                    </tr>
                    <tr v-if="!referenceIcState.items.length">
                      <td colspan="9" class="text-center">No Reference IC rows found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <nav class="warranty-item-paging" aria-label="Reference IC pages">
                <button type="button" class="btn btn-sm btn-default" :disabled="formPending || referenceIcState.page <= 1" @click="goToReferenceIcPage(referenceIcState.page - 1)">Previous</button>
                <span>Page {{ referenceIcState.page }} of {{ referenceIcMaxPage }} · {{ referenceIcState.total }} total rows</span>
                <button type="button" class="btn btn-sm btn-default" :disabled="formPending || referenceIcState.page >= referenceIcMaxPage" @click="goToReferenceIcPage(referenceIcState.page + 1)">Next</button>
                <button type="button" class="btn btn-sm bg-olive" :disabled="formPending || !referenceIcState.selectedItems.length" @click="createReferenceIcItems">Create selected</button>
              </nav>
            </section>
            <form class="warranty-item-filters" @submit.prevent="controller?.updateFilters(filters)">
              <div class="form-group">
                <label for="warranty-item-field">{{ warrantyItemUi('search_by', 'Search by') }}</label>
                <select id="warranty-item-field" v-model="filters.field" class="form-control input-sm" :disabled="formPending">
                  <option value="war_code">Warranty Code</option>
                  <option value="war_des">Warranty Name</option>
                </select>
              </div>
              <div class="form-group">
                <label for="warranty-item-text">{{ warrantyItemUi('search', 'Search') }}</label>
                <input id="warranty-item-text" v-model="filters.text" type="search" class="form-control input-sm" :disabled="formPending">
              </div>
              <div class="form-group">
                <label for="warranty-item-active">Status</label>
                <select id="warranty-item-active" v-model="filters.active" class="form-control input-sm" :disabled="formPending">
                  <option value="Y">Active only</option>
                  <option value="N">All statuses</option>
                </select>
              </div>
              <button type="submit" class="btn btn-sm bg-navy" :disabled="busy || formPending || !controller">Search</button>
            </form>

            <p v-if="state.status === 'initial-loading'" role="status">Loading Warranty Items…</p>
            <p v-else-if="state.status === 'refreshing'" role="status">Refreshing Warranty Items… Previous results remain visible.</p>
            <div v-else-if="state.status === 'error'" class="alert alert-danger" role="alert">
              <p>{{ state.error?.message || 'Unable to load Warranty Items.' }}</p>
              <p v-if="state.items.length">Showing previous results from page {{ displayedPage }}.</p>
              <button type="button" class="btn btn-sm btn-default" :disabled="busy || formPending" @click="retry">Retry</button>
            </div>
            <p v-else-if="state.status === 'loaded' && !state.items.length" role="status">No Warranty Items found.</p>

            <div v-if="state.items.length" class="warranty-item-grid" :aria-busy="busy">
              <ag-table
                ref="warrantyItemGrid"
                :sorting="true"
                :saveColumns="'Y'"
                :doctype="'MSCSM'"
                :page_name="'v_csm_mas_002'"
                @ready="onWarrantyItemGridReady"
                @cell-clicked="onWarrantyItemGridCellClicked"
                @on-sort-changed="onWarrantyItemGridSortChanged"
              />
            </div>
            <nav class="warranty-item-paging" aria-label="Warranty Item pages">
              <button type="button" class="btn btn-sm btn-default" :disabled="busy || formPending || !controller || state.query.page <= 1" aria-label="First page" @click="controller?.goToPage(1)">First</button>
              <button type="button" class="btn btn-sm btn-default" :disabled="busy || formPending || !controller || state.query.page <= 1" aria-label="Previous page" @click="controller?.goToPage(state.query.page - 1)">Previous</button>
              <button v-for="pageNumber in pageNumbers" :key="pageNumber" type="button" class="btn btn-sm btn-default" :disabled="busy || formPending || !controller || pageNumber === state.query.page" :aria-current="pageNumber === state.query.page ? 'page' : undefined" :aria-label="`Page ${pageNumber}`" @click="controller?.goToPage(pageNumber)">{{ pageNumber }}</button>
              <span>Page {{ state.query.page }} of {{ state.maxPage }} · {{ state.total }} total rows</span>
              <button type="button" class="btn btn-sm btn-default" :disabled="busy || formPending || !controller || state.query.page >= state.maxPage" aria-label="Next page" @click="controller?.goToPage(state.query.page + 1)">Next</button>
              <button type="button" class="btn btn-sm btn-default" :disabled="busy || formPending || !controller || state.query.page >= state.maxPage" aria-label="Last page" @click="controller?.goToPage(state.maxPage)">Last</button>
            </nav>
          </template>
        </div>
      </section>
    </template>
  </re-page>
</template>

<style scoped>
.access-label { margin: 8px 0 0; }
.warranty-item-list-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.warranty-item-import-panel { border: 1px solid #ddd; padding: 12px; margin-bottom: 16px; }
.warranty-item-import-heading, .warranty-item-import-controls, .warranty-item-import-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.warranty-item-import-heading { justify-content: space-between; }
.warranty-item-import-heading h2 { margin-top: 0; }
.warranty-item-import-mapping { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin-top: 12px; }
.warranty-item-import-mapping .form-group { margin-bottom: 0; }
.warranty-item-import-preview { margin-top: 12px; }
.warranty-item-reference-ic-panel { border: 1px solid #ddd; padding: 12px; margin-bottom: 16px; }
.warranty-item-reference-ic-table { margin-top: 12px; }
.warranty-item-filters { display: flex; flex-wrap: wrap; align-items: end; gap: 12px; margin-bottom: 16px; }
.warranty-item-filters .form-group { margin-bottom: 0; }
.warranty-item-form-panel { border: 1px solid #ddd; padding: 12px; margin-bottom: 16px; }
.warranty-item-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; align-items: end; }
.warranty-item-form .form-group { margin-bottom: 0; }
.warranty-item-form-actions, .warranty-item-inline-controls, .warranty-item-duration { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.warranty-item-form-actions { grid-column: 1 / -1; }
.warranty-item-duration { border: 0; padding: 0; margin: 0; }
.warranty-item-duration legend { width: auto; margin: 0 8px 0 0; font-size: inherit; }
.warranty-item-duration input { width: 72px; }
.warranty-item-paging { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 16px; }
</style>
