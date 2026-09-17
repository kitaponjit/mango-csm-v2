import type { WarrantyItemDeleteContext } from '../list/warranty-item-list-service'
import type { WarrantyItemTransport } from '../runtime/legacy-xtools-transport'

export type { WarrantyItemDeleteContext } from '../list/warranty-item-list-service'

export interface WarrantyItemDeleteTarget {
  code: string
  name: string
  deleteContext: WarrantyItemDeleteContext | null
}

export interface WarrantyItemDeleteHeaderDto {
  war_code: string
  acct_no: string | null
  pre_event: string | null
  pre_event2: string | null
  loccode: string | null
}

export interface WarrantyItemDeleteRequestDto {
  header: WarrantyItemDeleteHeaderDto
}

export type WarrantyItemDeleteServiceErrorCategory = 'backend' | 'authorization' | 'transport' | 'contract'

export class WarrantyItemDeleteServiceError extends Error {
  readonly category: WarrantyItemDeleteServiceErrorCategory
  override readonly cause: unknown

  constructor(category: WarrantyItemDeleteServiceErrorCategory, message: string, cause?: unknown) {
    super(message)
    this.name = 'WarrantyItemDeleteServiceError'
    this.category = category
    this.cause = cause
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null
}

function isDeleteContext(value: unknown): value is WarrantyItemDeleteContext {
  return isRecord(value)
    && isNullableString(value.accountNumber)
    && isNullableString(value.preEvent)
    && isNullableString(value.preEvent2)
    && isNullableString(value.locationCode)
}

export function isWarrantyItemDeleteTarget(value: unknown): value is WarrantyItemDeleteTarget {
  return isRecord(value)
    && typeof value.code === 'string'
    && value.code.length > 0
    && typeof value.name === 'string'
    && isDeleteContext(value.deleteContext)
}

export function toWarrantyItemDeleteRequest(
  target: WarrantyItemDeleteTarget,
): WarrantyItemDeleteRequestDto {
  if (!isWarrantyItemDeleteTarget(target)) {
    throw new WarrantyItemDeleteServiceError(
      'contract',
      'Warranty Item Delete context is unavailable or malformed.',
    )
  }
  const context = target.deleteContext
  if (!context) {
    throw new WarrantyItemDeleteServiceError(
      'contract',
      'Warranty Item Delete context is unavailable or malformed.',
    )
  }

  return {
    header: {
      war_code: target.code,
      acct_no: context.accountNumber,
      pre_event: context.preEvent,
      pre_event2: context.preEvent2,
      loccode: context.locationCode,
    },
  }
}

function contractError(message: string, cause?: unknown): WarrantyItemDeleteServiceError {
  return new WarrantyItemDeleteServiceError('contract', message, cause)
}

function authorizationStatus(reason: unknown, seen = new Set<object>()): number | null {
  if (!isRecord(reason) || seen.has(reason)) {
    return null
  }
  seen.add(reason)

  for (const candidate of [reason.status, reason.statusCode]) {
    if (candidate === 401 || candidate === 403) return candidate
  }
  for (const candidate of [reason.response, reason.data, reason.cause]) {
    const status = authorizationStatus(candidate, seen)
    if (status !== null) return status
  }
  return null
}

async function callTransport<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (reason: unknown) {
    if (reason instanceof WarrantyItemDeleteServiceError) {
      throw reason
    }
    const status = authorizationStatus(reason)
    if (status === 401 || status === 403) {
      throw new WarrantyItemDeleteServiceError(
        'authorization',
        'Warranty Item Delete request is not authorized.',
        reason,
      )
    }
    throw new WarrantyItemDeleteServiceError(
      'transport',
      'Warranty Item Delete request failed.',
      reason,
    )
  }
}

function normalizeResponse(rawResponse: unknown): void {
  if (!isRecord(rawResponse)
    || typeof rawResponse.success !== 'boolean'
    || typeof rawResponse.error !== 'string'
    || !Object.prototype.hasOwnProperty.call(rawResponse, 'data')
    || rawResponse.data !== null) {
    throw contractError('Warranty Item Delete response envelope is malformed.')
  }

  if (!rawResponse.success) {
    if (rawResponse.error.trim() === '') {
      throw contractError('Warranty Item Delete response envelope contains an invalid backend error.')
    }
    throw new WarrantyItemDeleteServiceError('backend', rawResponse.error)
  }
}

export interface WarrantyItemDeleteService {
  delete(target: WarrantyItemDeleteTarget): Promise<void>
}

export function createWarrantyItemDeleteService(transport: WarrantyItemTransport): WarrantyItemDeleteService {
  return {
    async delete(target) {
      const request = toWarrantyItemDeleteRequest(target)
      const rawResponse = await callTransport(() => transport.postJson(
        'CSM/Master/WarrantyItem_Delete',
        request,
      ))
      normalizeResponse(rawResponse)
    },
  }
}
