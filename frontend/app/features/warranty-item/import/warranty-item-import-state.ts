import {
  mapWarrantyItemImportRows,
  DEFAULT_WARRANTY_ITEM_IMPORT_MAPPING,
  WarrantyItemImportServiceError,
  type WarrantyItemImportMapping,
  type WarrantyItemImportPreview,
  type WarrantyItemImportPreviewRow,
  type WarrantyItemImportService,
} from './warranty-item-import-service'

export type WarrantyItemImportStatus =
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

export type WarrantyItemImportActionResult =
  | { status: 'ready-to-import' }
  | { status: 'imported' }
  | { status: 'upload-failed', error: Error }
  | { status: 'import-failed', error: Error }
  | { status: 'refresh-failed-after-import', error: Error }
  | { status: 'superseded' }

export type WarrantyItemImportErrorCategory =
  | 'selection'
  | 'parser'
  | 'backend'
  | 'authorization'
  | 'transport'
  | 'contract'
  | 'permission'
  | 'refresh'

export class WarrantyItemImportControllerError extends Error {
  readonly category: WarrantyItemImportErrorCategory
  override readonly cause: unknown

  constructor(category: WarrantyItemImportErrorCategory, message: string, cause?: unknown) {
    super(message)
    this.name = 'WarrantyItemImportControllerError'
    this.category = category
    this.cause = cause
  }
}

export interface WarrantyItemImportState {
  status: WarrantyItemImportStatus
  fileName: string | null
  filePath: string | null
  rows: WarrantyItemImportPreviewRow[]
  uploadPending: boolean
  importPending: boolean
  refreshPending: boolean
  error: Error | null
}

export interface WarrantyItemImportControllerOptions {
  service: WarrantyItemImportService
  refreshList(): Promise<void>
  canImport?: () => boolean
  getMapping?: () => WarrantyItemImportMapping
}

export interface WarrantyItemImportController {
  state: WarrantyItemImportState
  upload(files: readonly File[]): Promise<WarrantyItemImportActionResult>
  import(): Promise<WarrantyItemImportActionResult>
  retryRefresh(): Promise<WarrantyItemImportActionResult>
  reset(): void
}

export function createWarrantyItemImportState(): WarrantyItemImportState {
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

function normalizeServiceError(reason: unknown, fallback: string): Error {
  if (reason instanceof WarrantyItemImportServiceError) {
    return reason
  }
  return new WarrantyItemImportControllerError('transport', fallback, reason)
}

function isSupersededRefresh(reason: unknown): boolean {
  return reason instanceof Error && reason.message === 'Warranty Item list refresh was superseded.'
}

function refreshFailure(reason: unknown): WarrantyItemImportControllerError {
  const cause = asError(reason, 'Warranty Item list refresh failed.')
  return new WarrantyItemImportControllerError(
    'refresh',
    `Warranty Item Import succeeded, but the list refresh failed: ${cause.message}`,
    reason,
  )
}

export function createWarrantyItemImportController(
  options: WarrantyItemImportControllerOptions,
  state: WarrantyItemImportState = createWarrantyItemImportState(),
): WarrantyItemImportController {
  let generation = 0

  function isCurrent(requestGeneration: number): boolean {
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

  async function upload(files: readonly File[]): Promise<WarrantyItemImportActionResult> {
    if (state.uploadPending || state.importPending || state.refreshPending) {
      return { status: 'superseded' }
    }
    if (files.length !== 1 || !files[0]) {
      const error = new WarrantyItemImportControllerError('selection', 'Select exactly one .xlsx Warranty Item workbook.')
      state.status = 'upload-failed'
      state.error = error
      return { status: 'upload-failed', error }
    }
    if (options.canImport && !options.canImport()) {
      const error = new WarrantyItemImportControllerError('permission', 'Warranty Item Import requires editable access.')
      state.status = 'upload-failed'
      state.error = error
      return { status: 'upload-failed', error }
    }

    const requestGeneration = ++generation
    const file = files[0]
    state.status = 'uploading'
    state.fileName = file.name
    state.filePath = null
    state.rows = []
    state.uploadPending = true
    state.error = null

    try {
      const preview = await options.service.upload(file)
      if (!isCurrent(requestGeneration)) {
        return { status: 'superseded' }
      }
      state.fileName = preview.fileName || file.name
      state.filePath = preview.filePath
      state.rows = preview.rows
      state.status = 'ready-to-import'
      return { status: 'ready-to-import' }
    } catch (reason: unknown) {
      if (!isCurrent(requestGeneration)) {
        return { status: 'superseded' }
      }
      const error = normalizeServiceError(reason, 'Warranty Item workbook upload failed.')
      state.status = 'upload-failed'
      state.error = error
      return { status: 'upload-failed', error }
    } finally {
      if (isCurrent(requestGeneration)) {
        state.uploadPending = false
      }
    }
  }

  async function finishImport(requestGeneration: number): Promise<WarrantyItemImportActionResult> {
    try {
      await options.refreshList()
    } catch (reason: unknown) {
      if (!isCurrent(requestGeneration)) {
        return { status: 'superseded' }
      }
      if (isSupersededRefresh(reason)) {
        state.status = 'superseded'
        state.error = null
        return { status: 'superseded' }
      }
      const error = refreshFailure(reason)
      state.status = 'refresh-failed-after-import'
      state.error = error
      return { status: 'refresh-failed-after-import', error }
    }

    if (!isCurrent(requestGeneration)) {
      return { status: 'superseded' }
    }
    state.status = 'imported'
    state.error = null
    clearRows()
    return { status: 'imported' }
  }

  async function importRows(): Promise<WarrantyItemImportActionResult> {
    if (state.uploadPending || state.importPending || state.refreshPending) {
      return { status: 'superseded' }
    }
    if (options.canImport && !options.canImport()) {
      const error = new WarrantyItemImportControllerError('permission', 'Warranty Item Import requires editable access.')
      state.status = 'import-failed'
      state.error = error
      return { status: 'import-failed', error }
    }
    if (state.rows.length === 0) {
      const error = new WarrantyItemImportControllerError('selection', 'There are no parsed Warranty Item rows to import.')
      state.status = 'import-failed'
      state.error = error
      return { status: 'import-failed', error }
    }

    const requestGeneration = ++generation
    const rows = state.rows
    state.status = 'importing'
    state.importPending = true
    state.error = null

    try {
      await options.service.importRows(mapWarrantyItemImportRows(
        rows,
        options.getMapping?.() ?? DEFAULT_WARRANTY_ITEM_IMPORT_MAPPING,
      ))
      if (!isCurrent(requestGeneration)) {
        return { status: 'superseded' }
      }
      return await finishImport(requestGeneration)
    } catch (reason: unknown) {
      if (!isCurrent(requestGeneration)) {
        return { status: 'superseded' }
      }
      const error = normalizeServiceError(reason, 'Warranty Item Import failed; the batch was not applied.')
      state.status = 'import-failed'
      state.error = error
      return { status: 'import-failed', error }
    } finally {
      if (isCurrent(requestGeneration)) {
        state.importPending = false
      }
    }
  }

  async function retryRefresh(): Promise<WarrantyItemImportActionResult> {
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
      if (isCurrent(requestGeneration)) {
        state.refreshPending = false
      }
    }
  }

  return {
    state,
    upload,
    import: importRows,
    retryRefresh,
    reset,
  }
}
