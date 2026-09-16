export interface WarrantyGroup {
  type_code: string
  type_name: string
  default_: string
  active: string
  add_user?: string | null
  add_dt?: string | null
  edit_user?: string | null
  edit_dt?: string | null
}

export type WarrantyGroupSearchField = 'type_code' | 'type_name'

export type WarrantyGroupActiveFilter = 'Y' | 'N' | ''

export interface WarrantyGroupSearch {
  field: WarrantyGroupSearchField
  text: string
  active: WarrantyGroupActiveFilter
}

export interface WarrantyGroupListParams extends WarrantyGroupSearch {
  skip: number
  take: number
}

export interface WarrantyGroupPage {
  data: WarrantyGroup[]
  total: number
}

export interface WarrantyGroupValidation {
  valid: boolean
  field?: 'type_code' | 'type_name' | 'active'
}

/** Legacy list page size: the pager requests 500 rows per server round trip. */
export const DEFAULT_TAKE = 500

/** Legacy search defaults: Group Code field, empty text, Active-only switch on. */
export const DEFAULT_SEARCH: WarrantyGroupSearch = { field: 'type_code', text: '', active: 'Y' }

function toText(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

function toAudit(value: unknown): string | null {
  if (value === null || value === undefined) return null
  return typeof value === 'string' ? value : String(value)
}

export function normalizeWarrantyGroupRow(value: unknown): WarrantyGroup | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }

  const row = value as Record<string, unknown>
  return {
    type_code: toText(row.type_code),
    type_name: toText(row.type_name),
    default_: toText(row.default_),
    active: toText(row.active),
    add_user: toAudit(row.add_user),
    add_dt: toAudit(row.add_dt),
    edit_user: toAudit(row.edit_user),
    edit_dt: toAudit(row.edit_dt),
  }
}

/**
 * Strict paged-envelope parse: the list endpoint wraps `{data, total}` where
 * total is the filtered count before pagination. Anything else is an invalid
 * server response (the page renders its error state); malformed single rows
 * are dropped without losing the envelope total.
 */
export function normalizeWarrantyGroupPage(payload: unknown): WarrantyGroupPage | null {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return null
  }

  const envelope = payload as Record<string, unknown>
  if (!Array.isArray(envelope.data) || typeof envelope.total !== 'number' || !Number.isFinite(envelope.total)) {
    return null
  }

  const data: WarrantyGroup[] = []
  for (const item of envelope.data) {
    const row = normalizeWarrantyGroupRow(item)
    if (row) {
      data.push(row)
    }
  }

  return { data, total: envelope.total }
}

function takeSize(take: number) {
  return Math.max(1, Math.trunc(take) || DEFAULT_TAKE)
}

export function getPageCount(total: number, take = DEFAULT_TAKE) {
  const size = takeSize(take)
  return Math.max(1, Math.ceil(Math.max(0, total) / size))
}

export function getSkip(page: number, take = DEFAULT_TAKE, total = Number.MAX_SAFE_INTEGER) {
  const size = takeSize(take)
  const currentPage = Math.min(Math.max(1, Math.trunc(page) || 1), getPageCount(total, size))
  return (currentPage - 1) * size
}

/** Legacy-exact row number: the server skip is 0-based, so the first visible row is skip + 1. */
export function rowNumber(skip: number, index: number) {
  return skip + index + 1
}

/**
 * LEGACY-EXACT QUIRK (reproduced, not fixed): only `active=Y` filters
 * server-side; `active=N` and empty return the unfiltered set. The Active
 * switch therefore means "Active only" when checked and "All rows" when
 * unchecked.
 */
export function toActiveParam(activeOnly: boolean): 'Y' | 'N' {
  return activeOnly ? 'Y' : 'N'
}

/**
 * Single-row create/edit validation, verified against the backend
 * (Worktype.Create/Update) and the row entity:
 * - Group Code: required after trim, at most 20 chars, charset
 *   A-Z / 0-9 / dash / underscore (backend `^[a-z0-9_-]+$`, case-insensitive).
 * - Group Name: required after trim, at most 200 chars.
 * - Active: strictly Y or N.
 */
export const WARRANTY_GROUP_CODE_MAX_LENGTH = 20
export const WARRANTY_GROUP_NAME_MAX_LENGTH = 200
const WARRANTY_GROUP_CODE_PATTERN = /^[A-Za-z0-9_-]+$/

export function validateWarrantyGroupRow(row: Pick<WarrantyGroup, 'type_code' | 'type_name' | 'active'>): WarrantyGroupValidation {
  const type_code = (row.type_code ?? '').trim()
  if (!type_code || type_code.length > WARRANTY_GROUP_CODE_MAX_LENGTH || !WARRANTY_GROUP_CODE_PATTERN.test(type_code)) {
    return { valid: false, field: 'type_code' }
  }

  const type_name = (row.type_name ?? '').trim()
  if (!type_name || type_name.length > WARRANTY_GROUP_NAME_MAX_LENGTH) {
    return { valid: false, field: 'type_name' }
  }

  if (row.active !== 'Y' && row.active !== 'N') {
    return { valid: false, field: 'active' }
  }

  return { valid: true }
}
