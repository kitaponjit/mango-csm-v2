import {
  WarrantyItemExportServiceError,
  type WarrantyItemExportErrorCategory,
  type WarrantyItemExportService,
} from './warranty-item-export-service'
import type { WarrantyItemDownloadCapability, WarrantyItemDownloadWindow } from './warranty-item-download-capability'

export type WarrantyItemExportStatus =
  | 'idle'
  | 'confirming'
  | 'cancelled'
  | 'permission-denied'
  | 'popup-blocked'
  | 'generating'
  | 'initiated'
  | 'generation-failed'
  | 'contract-failed'
  | 'navigation-failed'
  | 'confirmation-failed'
  | 'superseded'

export type WarrantyItemExportActionResult =
  | { status: 'cancelled' }
  | { status: 'permission-denied', error: Error }
  | { status: 'popup-blocked', error: Error }
  | { status: 'initiated' }
  | { status: 'generation-failed', error: Error }
  | { status: 'contract-failed', error: Error }
  | { status: 'navigation-failed', error: Error }
  | { status: 'confirmation-failed', error: Error }
  | { status: 'superseded' }

export type WarrantyItemExportControllerErrorCategory =
  | WarrantyItemExportErrorCategory
  | 'permission'
  | 'popup'
  | 'navigation'
  | 'confirmation'

export class WarrantyItemExportControllerError extends Error {
  readonly category: WarrantyItemExportControllerErrorCategory
  readonly cause: unknown

  constructor(category: WarrantyItemExportControllerErrorCategory, message: string, cause?: unknown) {
    super(message)
    this.name = 'WarrantyItemExportControllerError'
    this.category = category
    this.cause = cause
  }
}

export interface WarrantyItemExportState {
  status: WarrantyItemExportStatus
  pending: boolean
  error: Error | null
}

export interface WarrantyItemExportControllerOptions {
  service: WarrantyItemExportService
  download: WarrantyItemDownloadCapability
  canExport?: () => boolean
  confirm?: () => Promise<boolean> | boolean
}

export interface WarrantyItemExportController {
  state: WarrantyItemExportState
  start(): Promise<WarrantyItemExportActionResult>
}

export function createWarrantyItemExportState(): WarrantyItemExportState {
  return {
    status: 'idle',
    pending: false,
    error: null,
  }
}

function normalizeServiceError(reason: unknown, fallback: string): WarrantyItemExportControllerError {
  if (reason instanceof WarrantyItemExportServiceError) {
    return new WarrantyItemExportControllerError(reason.category, reason.message, reason)
  }
  return new WarrantyItemExportControllerError('transport', fallback, reason)
}

function closePopup(download: WarrantyItemDownloadCapability, target: WarrantyItemDownloadWindow): void {
  try {
    download.close(target)
  } catch {
    // Closing a browser popup is best effort after a failed export attempt.
  }
}

export function createWarrantyItemExportController(
  options: WarrantyItemExportControllerOptions,
  state: WarrantyItemExportState = createWarrantyItemExportState(),
): WarrantyItemExportController {
  async function start(): Promise<WarrantyItemExportActionResult> {
    if (state.pending) {
      return { status: 'superseded' }
    }
    if (!options.canExport || !options.canExport()) {
      const error = new WarrantyItemExportControllerError('permission', 'Warranty Item Export requires editable access.')
      state.status = 'permission-denied'
      state.pending = false
      state.error = error
      return { status: 'permission-denied', error }
    }

    state.pending = true
    state.status = 'confirming'
    state.error = null

    try {
      let confirmed: boolean
      try {
        confirmed = options.confirm ? Boolean(await options.confirm()) : false
      } catch (reason: unknown) {
        const error = new WarrantyItemExportControllerError(
          'confirmation',
          'Warranty Item Export confirmation could not be shown.',
          reason,
        )
        state.status = 'confirmation-failed'
        state.error = error
        return { status: 'confirmation-failed', error }
      }

      if (!confirmed) {
        state.status = 'cancelled'
        state.error = null
        return { status: 'cancelled' }
      }

      let popup: WarrantyItemDownloadWindow | null
      try {
        popup = options.download.reserve()
      } catch (reason: unknown) {
        const error = new WarrantyItemExportControllerError(
          'popup',
          'Warranty Item Export could not open a download window.',
          reason,
        )
        state.status = 'popup-blocked'
        state.error = error
        return { status: 'popup-blocked', error }
      }
      if (!popup) {
        const error = new WarrantyItemExportControllerError(
          'popup',
          'Allow popups to download the Warranty Item export.',
        )
        state.status = 'popup-blocked'
        state.error = error
        return { status: 'popup-blocked', error }
      }

      state.status = 'generating'
      try {
        const token = await options.service.requestToken()
        try {
          options.download.navigate(popup, token)
        } catch (reason: unknown) {
          closePopup(options.download, popup)
          const error = new WarrantyItemExportControllerError(
            'navigation',
            'Warranty Item Export download could not be started.',
            reason,
          )
          state.status = 'navigation-failed'
          state.error = error
          return { status: 'navigation-failed', error }
        }
        state.status = 'initiated'
        state.error = null
        return { status: 'initiated' }
      } catch (reason: unknown) {
        closePopup(options.download, popup)
        const error = normalizeServiceError(reason, 'Warranty Item Export generation failed.')
        if (error.category === 'contract') {
          state.status = 'contract-failed'
          state.error = error
          return { status: 'contract-failed', error }
        }
        state.status = 'generation-failed'
        state.error = error
        return { status: 'generation-failed', error }
      }
    } finally {
      state.pending = false
    }
  }

  return { state, start }
}
