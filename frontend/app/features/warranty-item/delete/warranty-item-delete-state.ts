import type { WarrantyItemAccessSnapshot } from '../runtime/access-snapshot'
import {
  getWarrantyItemEditCompatibilityPolicy,
  type WarrantyItemEditCompatibilitySnapshot,
} from '../runtime/edit-compatibility'
import {
  isWarrantyItemDeleteTarget,
  WarrantyItemDeleteServiceError,
  type WarrantyItemDeleteService,
  type WarrantyItemDeleteTarget,
} from './warranty-item-delete-service'

export type WarrantyItemDeleteErrorCategory =
  | 'permission'
  | 'authorization'
  | 'contract'
  | 'backend'
  | 'transport'
  | 'refresh'

export class WarrantyItemDeleteError extends Error {
  readonly category: WarrantyItemDeleteErrorCategory
  override readonly cause: unknown

  constructor(category: WarrantyItemDeleteErrorCategory, message: string, cause?: unknown) {
    super(message)
    this.name = 'WarrantyItemDeleteError'
    this.category = category
    this.cause = cause
  }
}

export type WarrantyItemDeleteStatus =
  | 'idle'
  | 'confirming'
  | 'deleting'
  | 'refreshing'
  | 'deleted'
  | 'delete-failed'
  | 'refresh-failed-after-delete'
  | 'superseded'

export type WarrantyItemDeleteResult =
  | { status: 'cancelled' }
  | { status: 'deleted' }
  | { status: 'delete-failed', error: WarrantyItemDeleteError }
  | { status: 'refresh-failed-after-delete', error: WarrantyItemDeleteError }
  | { status: 'superseded' }

export interface WarrantyItemDeleteState {
  status: WarrantyItemDeleteStatus
  pending: boolean
  error: WarrantyItemDeleteError | null
  lastDeletedCode: string | null
}

export interface WarrantyItemDeleteControllerOptions {
  service: WarrantyItemDeleteService
  access: WarrantyItemAccessSnapshot
  editCompatibility?: WarrantyItemEditCompatibilitySnapshot
  confirm(target: WarrantyItemDeleteTarget): Promise<boolean>
  refreshList(): Promise<void>
}

export interface WarrantyItemDeleteController {
  state: WarrantyItemDeleteState
  delete(target: WarrantyItemDeleteTarget): Promise<WarrantyItemDeleteResult>
  retryRefresh(): Promise<WarrantyItemDeleteResult>
  isBlocked(code: string): boolean
}

const SUPERSEDED_REFRESH_MESSAGE = 'Warranty Item list refresh was superseded.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function permissionError(message: string): WarrantyItemDeleteError {
  return new WarrantyItemDeleteError('permission', message)
}

function asError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error('Warranty Item Delete request failed.')
}

function normalizeDeleteError(reason: unknown): WarrantyItemDeleteError {
  if (reason instanceof WarrantyItemDeleteError) {
    return reason
  }
  if (reason instanceof WarrantyItemDeleteServiceError) {
    return new WarrantyItemDeleteError(reason.category, reason.message, reason)
  }
  return new WarrantyItemDeleteError('transport', 'Warranty Item Delete request failed.', reason)
}

function isSupersededRefresh(reason: unknown): boolean {
  return reason instanceof Error && reason.message === SUPERSEDED_REFRESH_MESSAGE
}

export function createWarrantyItemDeleteState(): WarrantyItemDeleteState {
  return {
    status: 'idle',
    pending: false,
    error: null,
    lastDeletedCode: null,
  }
}

export function createWarrantyItemDeleteController(
  options: WarrantyItemDeleteControllerOptions,
  state: WarrantyItemDeleteState = createWarrantyItemDeleteState(),
): WarrantyItemDeleteController {
  const blockedCodes = new Set<string>()

  function canDelete(): boolean {
    if (!isRecord(options.access) || options.access.status !== 'editable') {
      return false
    }
    const compatibility = options.editCompatibility
    if (!isRecord(compatibility)
      || compatibility.status !== 'allowed'
      || (compatibility.trn0001 !== 'Y' && compatibility.trn0001 !== 'N')
      || typeof compatibility.isAdmin !== 'boolean') {
      return false
    }
    return getWarrantyItemEditCompatibilityPolicy(compatibility).canEdit
  }

  async function refreshAfterDelete(code: string): Promise<WarrantyItemDeleteResult> {
    state.status = 'refreshing'
    try {
      await options.refreshList()
      state.status = 'deleted'
      state.error = null
      state.lastDeletedCode = code
      return { status: 'deleted' }
    } catch (reason: unknown) {
      if (isSupersededRefresh(reason)) {
        state.status = 'superseded'
        state.error = null
        return { status: 'superseded' }
      }
      const cause = asError(reason)
      const error = new WarrantyItemDeleteError(
        'refresh',
        `Warranty Item was deleted, but the list could not be refreshed: ${cause.message}`,
        reason,
      )
      state.status = 'refresh-failed-after-delete'
      state.error = error
      state.lastDeletedCode = code
      return { status: 'refresh-failed-after-delete', error }
    }
  }

  async function deleteItem(target: WarrantyItemDeleteTarget): Promise<WarrantyItemDeleteResult> {
    if (state.pending) {
      return { status: 'superseded' }
    }
    if (!isWarrantyItemDeleteTarget(target)) {
      const error = new WarrantyItemDeleteError(
        'contract',
        'Warranty Item Delete context is unavailable or malformed.',
      )
      state.status = 'delete-failed'
      state.error = error
      return { status: 'delete-failed', error }
    }
    if (blockedCodes.has(target.code)) {
      return { status: 'superseded' }
    }
    if (!canDelete()) {
      const error = permissionError('Warranty Item Delete requires editable access and compatibility approval.')
      state.status = 'delete-failed'
      state.error = error
      return { status: 'delete-failed', error }
    }

    state.pending = true
    state.status = 'confirming'
    state.error = null

    try {
      let confirmed: boolean
      try {
        confirmed = await options.confirm(target)
      } catch (reason: unknown) {
        const error = new WarrantyItemDeleteError(
          'transport',
          'Warranty Item Delete confirmation could not be completed.',
          reason,
        )
        state.status = 'delete-failed'
        state.error = error
        return { status: 'delete-failed', error }
      }

      if (!confirmed) {
        state.status = 'idle'
        return { status: 'cancelled' }
      }

      state.status = 'deleting'
      try {
        await options.service.delete(target)
      } catch (reason: unknown) {
        const error = normalizeDeleteError(reason)
        state.status = 'delete-failed'
        state.error = error
        return { status: 'delete-failed', error }
      }

      blockedCodes.add(target.code)
      state.lastDeletedCode = target.code
      return await refreshAfterDelete(target.code)
    } finally {
      state.pending = false
    }
  }

  async function retryRefresh(): Promise<WarrantyItemDeleteResult> {
    if (state.pending || state.status !== 'refresh-failed-after-delete' || !state.lastDeletedCode) {
      return { status: 'superseded' }
    }

    state.pending = true
    state.error = null
    const code = state.lastDeletedCode
    try {
      return await refreshAfterDelete(code)
    } finally {
      state.pending = false
    }
  }

  return {
    state,
    delete: deleteItem,
    retryRefresh,
    isBlocked: code => blockedCodes.has(code),
  }
}
