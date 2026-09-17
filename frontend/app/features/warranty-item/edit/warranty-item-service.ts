import type { WarrantyItemTransport } from '../runtime/legacy-xtools-transport'
import {
  normalizeWarrantyItemDetail,
  toCreateRequest,
  toUpdateRequest,
  validateWarrantyItemDraft,
  type WarrantyItemDraft,
  type WarrantyItemGroup,
  type WarrantyItemMaterial,
} from './warranty-item-draft'

export type WarrantyItemServiceErrorCategory = 'validation' | 'backend' | 'authorization' | 'transport' | 'contract'

export class WarrantyItemServiceError extends Error {
  readonly category: WarrantyItemServiceErrorCategory
  readonly cause: unknown

  constructor(category: WarrantyItemServiceErrorCategory, message: string, cause?: unknown) {
    super(message)
    this.name = 'WarrantyItemServiceError'
    this.category = category
    this.cause = cause
  }
}

export interface WarrantyItemMaterialSearchResult {
  items: WarrantyItemMaterial[]
  total: number
}

export interface WarrantyItemEditService {
  readDetail(code: string): Promise<ReturnType<typeof normalizeWarrantyItemDetail>>
  listActiveWarrantyGroups(): Promise<WarrantyItemGroup[]>
  searchMaterials(searchText: string): Promise<WarrantyItemMaterialSearchResult>
  create(draft: WarrantyItemDraft): Promise<unknown>
  update(draft: WarrantyItemDraft): Promise<unknown>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFlag(value: unknown): value is 'Y' | 'N' {
  return value === 'Y' || value === 'N'
}

function isFiniteInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0
}

function contractError(message: string, cause?: unknown): WarrantyItemServiceError {
  return new WarrantyItemServiceError('contract', message, cause)
}

function backendError(message: string): WarrantyItemServiceError {
  const lower = message.toLowerCase()
  const category: WarrantyItemServiceErrorCategory = /permission|forbidden|access denied|สิทธิ/.test(lower)
    ? 'authorization'
    : 'backend'
  return new WarrantyItemServiceError(category, message)
}

function unwrapEnvelope(raw: unknown): unknown {
  if (!isRecord(raw) || typeof raw.success !== 'boolean') {
    throw contractError('Warranty Item response envelope is malformed.')
  }
  if (!raw.success) {
    if (typeof raw.error !== 'string' || raw.error.trim() === '') {
      throw contractError('Warranty Item response envelope contains an invalid backend error.')
    }
    throw backendError(raw.error)
  }
  if (!('data' in raw)) {
    throw contractError('Warranty Item response envelope is missing data.')
  }
  return raw.data
}

async function callTransport<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (reason: unknown) {
    if (reason instanceof WarrantyItemServiceError) {
      throw reason
    }
    const status = authorizationStatus(reason)
    throw new WarrantyItemServiceError(
      status === 401 || status === 403 ? 'authorization' : 'transport',
      status === 401 || status === 403
        ? 'Warranty Item request is not authorized.'
        : 'Warranty Item request failed.',
      reason,
    )
  }
}

function authorizationStatus(reason: unknown, seen = new Set<object>()): number | null {
  if (!isRecord(reason)) {
    return null
  }
  if (seen.has(reason)) {
    return null
  }
  seen.add(reason)

  const direct = [reason.status, reason.statusCode]
  const nested = [reason.response, reason.data, reason.cause]
  for (const candidate of direct) {
    if (candidate === 401 || candidate === 403) return candidate
  }
  for (const candidate of nested) {
    const nestedStatus = authorizationStatus(candidate, seen)
    if (nestedStatus !== null) return nestedStatus
  }
  return null
}

function normalizeGroupRows(data: unknown): WarrantyItemGroup[] {
  if (!isRecord(data) || !Array.isArray(data.data)) {
    throw contractError('Warranty Group response data is malformed.')
  }

  return data.data.map((row: unknown) => {
    if (!isRecord(row)
      || typeof row.type_code !== 'string'
      || typeof row.type_name !== 'string'
      || !isFlag(row.active)
      || !isFlag(row.default_)) {
      throw contractError('Warranty Group response contains a malformed row.')
    }
    return {
      code: row.type_code,
      name: row.type_name,
      active: row.active === 'Y',
      default: row.default_ === 'Y',
      currentOnly: false,
    }
  })
}

function normalizeMaterialRows(data: unknown): WarrantyItemMaterialSearchResult {
  if (!isRecord(data)
    || !Array.isArray(data.data_rows)
    || !isFiniteInteger(data.total)) {
    throw contractError('Material response data is malformed.')
  }

  return {
    items: data.data_rows.map((row: unknown) => {
      if (!isRecord(row) || typeof row.type_code !== 'string') {
        throw contractError('Material response contains a malformed row.')
      }
      const name = typeof row.type_name === 'string'
        ? row.type_name
        : typeof row.c_des1 === 'string'
          ? row.c_des1
          : null
      if (name === null) {
        throw contractError('Material response contains a malformed row.')
      }
      return { code: row.type_code, name }
    }),
    total: data.total,
  }
}

function ensureValidDraft(draft: WarrantyItemDraft): void {
  const errors = validateWarrantyItemDraft(draft)
  if (errors.length > 0) {
    throw new WarrantyItemServiceError('validation', errors[0]!.message, errors)
  }
}

export function createWarrantyItemEditService(transport: WarrantyItemTransport): WarrantyItemEditService {
  return {
    async readDetail(code) {
      const raw = await callTransport(() => transport.get(
        `csm/master/WarrantyItem_Read?war_code=${encodeURIComponent(code)}`,
      ))
      try {
        return normalizeWarrantyItemDetail(unwrapEnvelope(raw))
      } catch (reason: unknown) {
        if (reason instanceof WarrantyItemServiceError) throw reason
        throw contractError('Warranty Item detail response is malformed.', reason)
      }
    },

    async listActiveWarrantyGroups() {
      const raw = await callTransport(() => transport.get('csm/master/WarrantyGroup_ReadList?active=Y'))
      try {
        return normalizeGroupRows(unwrapEnvelope(raw))
      } catch (reason: unknown) {
        if (reason instanceof WarrantyItemServiceError) throw reason
        throw contractError('Warranty Group response is malformed.', reason)
      }
    },

    async searchMaterials(searchText) {
      const raw = await callTransport(() => transport.get(
        `CSM/Center/Material_ReadList?skip=0&take=500&search_text=${encodeURIComponent(searchText)}`,
      ))
      try {
        return normalizeMaterialRows(unwrapEnvelope(raw))
      } catch (reason: unknown) {
        if (reason instanceof WarrantyItemServiceError) throw reason
        throw contractError('Material response is malformed.', reason)
      }
    },

    async create(draft) {
      ensureValidDraft(draft)
      const raw = await callTransport(() => transport.postJson(
        'CSM/MASTER/WarrantyItem_Create',
        toCreateRequest(draft),
      ))
      return unwrapEnvelope(raw)
    },

    async update(draft) {
      ensureValidDraft(draft)
      const raw = await callTransport(() => transport.postJson(
        'CSM/MASTER/WarrantyItem_Update',
        toUpdateRequest(draft),
      ))
      return unwrapEnvelope(raw)
    },
  }
}
