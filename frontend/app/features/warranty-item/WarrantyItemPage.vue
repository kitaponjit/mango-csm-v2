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
import { getWarrantyItemPagePolicy } from './page-policy'
import { readWarrantyItemAccessSnapshot } from './runtime/access-snapshot'
import { getWarrantyItemEditCompatibilityPolicy, readWarrantyItemEditCompatibilitySnapshot, type WarrantyItemEditCompatibilitySnapshot } from './runtime/edit-compatibility'
import { createLegacyXtoolsTransport } from './runtime/legacy-xtools-transport'
import {
  createWarrantyItemImportController,
  createWarrantyItemImportState,
  type WarrantyItemImportController,
} from './import/warranty-item-import-state'
import { createWarrantyItemImportService, type WarrantyItemImportColumn } from './import/warranty-item-import-service'

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
const importFileInput = ref<HTMLInputElement | null>(null)
const importOpen = ref(false)
const materialSearchText = ref('')
const setupError = ref<Error | null>(null)
const busy = computed(() => state.status === 'initial-loading' || state.status === 'refreshing')
const displayedPage = ref(1)
const pageNumbers = computed(() => getWarrantyItemPageNumbers(state.maxPage))
const formOpen = computed(() => formState.mode !== 'closed' && Boolean(formState.draft))
const deletePending = computed(() => deleteState.pending)
const importPending = computed(() => importState.uploadPending || importState.importPending || importState.refreshPending)
const formPending = computed(() => formState.detailPending
  || formState.groupsPending
  || formState.materialsPending
  || formState.savePending
  || deletePending.value
  || importPending.value)

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
  store?: { state?: { configData?: unknown } }
  $msg?: { confirm?: (message: string) => Promise<unknown> | unknown }
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

async function refreshList(): Promise<void> {
  if (!controller.value) {
    throw new Error('Warranty Item list service is unavailable.')
  }
  await refreshWarrantyItemList(controller.value)
}

let formOptions: WarrantyItemFormControllerOptions | null = null
let deleteOptions: WarrantyItemDeleteControllerOptions | null = null

async function confirmDelete(target: { code: string, name: string }): Promise<boolean> {
  const globals = globalThis as typeof globalThis & WarrantyItemRuntimeGlobals
  if (typeof globals.$msg?.confirm !== 'function') {
    return false
  }
  return Boolean(await globals.$msg.confirm(formatWarrantyItemDeleteConfirmation(target)))
}

function connectController(): void {
  if (!access.canReadList) return
  try {
    const transport = createLegacyXtoolsTransport()
    const listService = createWarrantyItemListService(transport)
    const editService = createWarrantyItemEditService(transport)
    const deleteService = createWarrantyItemDeleteService(transport)
    const importService = createWarrantyItemImportService(transport)
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
      service: importService,
      canImport: () => access.canCreate,
      refreshList,
    }, importState)
    setupError.value = null
    state.error = null
    formState.error = null
    importState.error = null
  } catch (reason: unknown) {
    setupError.value = reason instanceof Error ? reason : new Error('Warranty Item service is unavailable.')
    state.status = 'error'
    state.error = setupError.value
    formState.error = setupError.value
    importState.error = setupError.value
  }
}

connectController()

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
  importController.value?.reset()
  importOpen.value = true
}

function closeImport(): void {
  if (importPending.value) return
  importController.value?.reset()
  importOpen.value = false
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
                  <label><input type="number" min="0" v-model.number="formState.draft.duration.years" :disabled="formPending || formState.draft.lifetime"> Years</label>
                  <label><input type="number" min="0" v-model.number="formState.draft.duration.months" :disabled="formPending || formState.draft.lifetime"> Months</label>
                  <label><input type="number" min="0" v-model.number="formState.draft.duration.days" :disabled="formPending || formState.draft.lifetime"> Days</label>
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
              <button type="button" class="btn btn-sm bg-navy" :disabled="busy || formPending" @click="startCreate">Create</button>
              <button type="button" class="btn btn-sm btn-tumblr" :disabled="busy || formPending" @click="openImport">Import</button>
            </div>
            <section v-if="importOpen" class="warranty-item-import-panel" aria-labelledby="warranty-item-import-title">
              <div class="warranty-item-import-heading">
                <div>
                  <h2 id="warranty-item-import-title">Import Warranty Items</h2>
                  <p>Select one .xlsx workbook, review the parsed A–M rows, then explicitly import the batch.</p>
                </div>
                <button type="button" class="btn btn-sm btn-default" :disabled="formPending" @click="closeImport">Close</button>
              </div>
              <div class="warranty-item-import-controls">
                <input
                  ref="importFileInput"
                  type="file"
                  accept=".xlsx"
                  :disabled="formPending"
                  @change="selectImportFile"
                >
                <span v-if="importState.fileName">{{ importState.fileName }}</span>
              </div>
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
            <form class="warranty-item-filters" @submit.prevent="controller?.updateFilters(filters)">
              <div class="form-group">
                <label for="warranty-item-field">Search by</label>
                <select id="warranty-item-field" v-model="filters.field" class="form-control input-sm" :disabled="formPending">
                  <option value="war_code">Warranty Code</option>
                  <option value="war_des">Warranty Name</option>
                </select>
              </div>
              <div class="form-group">
                <label for="warranty-item-text">Search</label>
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

            <div v-if="state.items.length" class="table-responsive" :aria-busy="busy">
              <table class="table table-bordered table-striped">
                <caption>Warranty Items — page {{ displayedPage }}, {{ state.total }} total rows</caption>
                <thead>
                  <tr>
                    <th scope="col">No.</th>
                    <th scope="col">Code</th>
                    <th scope="col">Name</th>
                    <th scope="col">Group</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Lifetime</th>
                    <th scope="col">Active</th>
                    <th scope="col">Added by</th>
                    <th scope="col">Added at</th>
                    <th scope="col">Edited by</th>
                    <th scope="col">Edited at</th>
                    <th v-if="canEditNow" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in state.items" :key="item.code">
                    <td>{{ (displayedPage - 1) * state.query.pageSize + index + 1 }}</td>
                    <td>{{ item.code }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.groupName }}</td>
                    <td>{{ item.durationLabel }}</td>
                    <td>{{ item.lifetime ? 'Yes' : 'No' }}</td>
                    <td>{{ item.active ? 'Yes' : 'No' }}</td>
                    <td>{{ item.addedBy ?? '—' }}</td>
                    <td>{{ item.addedAt ?? '—' }}</td>
                    <td>{{ item.editedBy ?? '—' }}</td>
                    <td>{{ item.editedAt ?? '—' }}</td>
                    <td v-if="canEditNow">
                      <button type="button" class="btn btn-sm btn-default" :disabled="busy || formPending" @click="startEdit(item.code)">Edit</button>
                      <button type="button" class="btn btn-sm btn-danger" :disabled="busy || formPending || !item.deleteContext || isDeleteBlocked(item.code)" @click="deleteItem(item)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
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
.warranty-item-import-preview { margin-top: 12px; }
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
