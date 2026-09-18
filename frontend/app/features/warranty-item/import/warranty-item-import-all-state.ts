import {
  DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING,
  mapWarrantyItemImportAllRows,
  type WarrantyItemImportAllService,
} from './warranty-item-import-all-service'
import {
  type WarrantyItemImportPreview,
  type WarrantyItemImportPreviewRow,
} from './warranty-item-import-service'

export type WarrantyItemImportAllStatus =
  | 'idle'
  | 'uploading'
  | 'ready-to-import'
  | 'importing'
  | 'refreshing-after-import'
  | 'imported'
  | 'upload-failed'
  | 'import-failed'
  | 'refresh-failed-after-import'
  | 'superseded'

export type WarrantyItemImportAllActionResult =
  | { status: 'ready-to-import' }
  | { status: 'imported' }
  | { status: 'upload-failed', error: Error }
  | { status: 'import-failed', error: Error }
  | { status: 'refresh-failed-after-import', error: Error }
  | { status: 'superseded' }

export interface WarrantyItemImportAllState {
  status: WarrantyItemImportAllStatus
  fileName: string | null
  filePath: string | null
  rows: WarrantyItemImportPreviewRow[]
  uploadPending: boolean
  importPending: boolean
  refreshPending: boolean
  error: Error | null
}

export interface WarrantyItemImportAllControllerOptions {
  service: WarrantyItemImportAllService
  refreshList(): Promise<void>
  canImport?: () => boolean
  getMapping?: () => typeof DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING
}

export interface WarrantyItemImportAllController {
  state: WarrantyItemImportAllState
  upload(files: readonly File[]): Promise<WarrantyItemImportAllActionResult>
  import(): Promise<WarrantyItemImportAllActionResult>
  retryRefresh(): Promise<WarrantyItemImportAllActionResult>
  reset(): void
}

export function createWarrantyItemImportAllState(): WarrantyItemImportAllState {
  return {
    status: 'idle',
    fileName: null,
    filePath: null,
    rows: [],
    uploadPending: false,
    importPending: false,
    refreshPending: false,
    error: null,
  }
}

function asError(reason: unknown, fallback: string): Error {
  return reason instanceof Error ? reason : new Error(fallback)
}

function normalizeError(reason: unknown, fallback: string): Error {
  return reason instanceof Error ? reason : new Error(fallback)
}

function isSupersededRefresh(reason: unknown): boolean {
  return reason instanceof Error && reason.message === 'Warranty Item list refresh was superseded.'
}

export function createWarrantyItemImportAllController(
  options: WarrantyItemImportAllControllerOptions,
  state: WarrantyItemImportAllState = createWarrantyItemImportAllState(),
): WarrantyItemImportAllController {
  let generation = 0

  function current(requestGeneration: number): boolean {
    return requestGeneration === generation
  }

  function clearRows(): void {
    state.fileName = null
    state.filePath = null
    state.rows = []
  }

  function reset(): void {
    generation += 1
    state.status = 'idle'
    clearRows()
    state.uploadPending = false
    state.importPending = false
    state.refreshPending = false
    state.error = null
  }

  async function upload(files: readonly File[]): Promise<WarrantyItemImportAllActionResult> {
    if (state.uploadPending || state.importPending || state.refreshPending) return { status: 'superseded' }
    if (files.length !== 1 || !files[0]) {
      const error = new Error('Select exactly one .xls or .xlsx Import All Warranty workbook.')
      state.status = 'upload-failed'
      state.error = error
      return { status: 'upload-failed', error }
    }
    if (options.canImport && !options.canImport()) {
      const error = new Error('Import All Warranty requires editable access.')
      state.status = 'upload-failed'
      state.error = error
      return { status: 'upload-failed', error }
    }

    const requestGeneration = ++generation
    state.status = 'uploading'
    state.fileName = files[0]!.name
    state.filePath = null
    state.rows = []
    state.uploadPending = true
    state.error = null
    try {
      const preview: WarrantyItemImportPreview = await options.service.upload(files[0]!)
      if (!current(requestGeneration)) return { status: 'superseded' }
      state.fileName = preview.fileName || files[0]!.name
      state.filePath = preview.filePath
      state.rows = preview.rows
      state.status = 'ready-to-import'
      return { status: 'ready-to-import' }
    } catch (reason: unknown) {
      if (!current(requestGeneration)) return { status: 'superseded' }
      const error = normalizeError(reason, 'Import All Warranty workbook upload failed.')
      state.status = 'upload-failed'
      state.error = error
      return { status: 'upload-failed', error }
    } finally {
      if (current(requestGeneration)) state.uploadPending = false
    }
  }

  async function finishImport(requestGeneration: number): Promise<WarrantyItemImportAllActionResult> {
    try {
      await options.refreshList()
    } catch (reason: unknown) {
      if (!current(requestGeneration)) return { status: 'superseded' }
      if (isSupersededRefresh(reason)) {
        state.status = 'superseded'
        state.error = null
        return { status: 'superseded' }
      }
      const error = new Error(`Import All Warranty succeeded, but the list refresh failed: ${asError(reason, 'List refresh failed.').message}`)
      state.status = 'refresh-failed-after-import'
      state.error = error
      return { status: 'refresh-failed-after-import', error }
    }
    if (!current(requestGeneration)) return { status: 'superseded' }
    state.status = 'imported'
    state.error = null
    clearRows()
    return { status: 'imported' }
  }

  async function importRows(): Promise<WarrantyItemImportAllActionResult> {
    if (state.uploadPending || state.importPending || state.refreshPending) return { status: 'superseded' }
    if (options.canImport && !options.canImport()) {
      const error = new Error('Import All Warranty requires editable access.')
      state.status = 'import-failed'
      state.error = error
      return { status: 'import-failed', error }
    }
    if (state.rows.length === 0) {
      const error = new Error('There are no parsed Import All Warranty rows to import.')
      state.status = 'import-failed'
      state.error = error
      return { status: 'import-failed', error }
    }

    const requestGeneration = ++generation
    state.status = 'importing'
    state.importPending = true
    state.error = null
    try {
      await options.service.importRows(mapWarrantyItemImportAllRows(
        state.rows,
        options.getMapping?.() ?? DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING,
      ))
      if (!current(requestGeneration)) return { status: 'superseded' }
      return await finishImport(requestGeneration)
    } catch (reason: unknown) {
      if (!current(requestGeneration)) return { status: 'superseded' }
      const error = normalizeError(reason, 'Import All Warranty failed; the batch was not applied.')
      state.status = 'import-failed'
      state.error = error
      return { status: 'import-failed', error }
    } finally {
      if (current(requestGeneration)) state.importPending = false
    }
  }

  async function retryRefresh(): Promise<WarrantyItemImportAllActionResult> {
    if (state.uploadPending || state.importPending || state.refreshPending || state.status !== 'refresh-failed-after-import') {
      return { status: 'superseded' }
    }
    const requestGeneration = generation
    state.status = 'refreshing-after-import'
    state.refreshPending = true
    state.error = null
    try {
      return await finishImport(requestGeneration)
    } finally {
      if (current(requestGeneration)) state.refreshPending = false
    }
  }

  return { state, upload, import: importRows, retryRefresh, reset }
}
