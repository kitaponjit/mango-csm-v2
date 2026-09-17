import type { WarrantyItemTransport } from '../runtime/legacy-xtools-transport'

export type WarrantyItemExportErrorCategory = 'backend' | 'authorization' | 'transport' | 'contract'

export class WarrantyItemExportServiceError extends Error {
  readonly category: WarrantyItemExportErrorCategory
  readonly cause: unknown

  constructor(category: WarrantyItemExportErrorCategory, message: string, cause?: unknown) {
    super(message)
    this.name = 'WarrantyItemExportServiceError'
    this.category = category
    this.cause = cause
  }
}

export interface WarrantyItemExportService {
  requestToken(): Promise<string>
}

const EXPORT_PATH = 'CSM/Master/WarrantyItemExport_Master'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

function callError(reason: unknown): WarrantyItemExportServiceError {
  if (reason instanceof WarrantyItemExportServiceError) {
    return reason
  }
  const status = authorizationStatus(reason)
  return new WarrantyItemExportServiceError(
    status === 401 || status === 403 ? 'authorization' : 'transport',
    status === 401 || status === 403
      ? 'Warranty Item Export request is not authorized.'
      : 'Warranty Item Export request failed.',
    reason,
  )
}

function contractError(message: string, cause?: unknown): WarrantyItemExportServiceError {
  return new WarrantyItemExportServiceError('contract', message, cause)
}

function normalizeResponse(rawResponse: unknown): string {
  if (!isRecord(rawResponse) || typeof rawResponse.success !== 'boolean') {
    throw contractError('Warranty Item Export response envelope is malformed.')
  }

  if (!rawResponse.success) {
    if (typeof rawResponse.error !== 'string' || rawResponse.error.trim() === '') {
      throw contractError('Warranty Item Export response contains an invalid backend error.')
    }
    throw new WarrantyItemExportServiceError('backend', rawResponse.error)
  }

  if (rawResponse.error !== null && typeof rawResponse.error !== 'string') {
    throw contractError('Warranty Item Export response error is malformed.')
  }
  if (typeof rawResponse.data !== 'string' || rawResponse.data.trim() === '') {
    throw contractError('Warranty Item Export response token is malformed.')
  }

  return rawResponse.data
}

export function createWarrantyItemExportService(transport: WarrantyItemTransport): WarrantyItemExportService {
  return {
    async requestToken() {
      let rawResponse: unknown
      try {
        rawResponse = await transport.get(EXPORT_PATH)
      } catch (reason: unknown) {
        throw callError(reason)
      }

      return normalizeResponse(rawResponse)
    },
  }
}
