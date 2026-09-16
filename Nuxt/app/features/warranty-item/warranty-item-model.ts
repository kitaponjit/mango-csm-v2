export interface WarrantyItem {
  war_code: string
  war_des: string
  type_code: string
  type_name?: string
  tot_date: number
  tot_month: number
  tot_year: number
  lifetime?: string
  itemcode?: string
  active: string
  add_user?: string | null
  add_dt?: string | null
  edit_user?: string | null
  edit_dt?: string | null
  ic_docno?: string | null
  ic_itemno?: string | null
  vendor?: string | null
}

export type WarrantyItemSearchField = 'war_code' | 'war_des'
export type WarrantyItemActiveFilter = 'Y' | 'N'

export interface WarrantyItemSearch {
  field: WarrantyItemSearchField
  text: string
  active: WarrantyItemActiveFilter
}

export interface WarrantyItemListParams extends WarrantyItemSearch {
  skip: number
  take: number
}

export interface WarrantyItemPage {
  data: WarrantyItem[]
  total: number
}

export interface WarrantyItemHeader {
  war_code: string
  war_des: string
  type_code: string
  tot_date: number
  tot_month: number
  tot_year: number
  lifetime: 'Y' | 'N'
  itemcode: string
  active: 'Y' | 'N'
}

export interface WarrantyItemForm extends WarrantyItemHeader {
  durationDisabled: boolean
  ic_docno?: string | null
  ic_itemno?: string | null
  vendor?: string | null
}

export interface WarrantyItemValidation {
  valid: boolean
  field?: keyof WarrantyItemHeader
}

export const DEFAULT_TAKE = 500
export const DEFAULT_SEARCH: WarrantyItemSearch = { field: 'war_code', text: '', active: 'Y' }
export const WARRANTY_ITEM_CODE_MAX_LENGTH = 15
export const WARRANTY_ITEM_NAME_MAX_LENGTH = 150
const WARRANTY_ITEM_CODE_PATTERN = /^[A-Za-z0-9]+$/

export function createWarrantyItemForm(value: Partial<WarrantyItemForm> = {}): WarrantyItemForm {
  return {
    war_code: value.war_code ?? '',
    war_des: value.war_des ?? '',
    type_code: value.type_code ?? '',
    tot_date: value.tot_date ?? 0,
    tot_month: value.tot_month ?? 0,
    tot_year: value.tot_year ?? 0,
    lifetime: value.lifetime === 'Y' ? 'Y' : 'N',
    itemcode: value.itemcode ?? '',
    active: value.active === 'N' ? 'N' : 'Y',
    durationDisabled: value.lifetime === 'Y',
    ic_docno: value.ic_docno ?? null,
    ic_itemno: value.ic_itemno ?? null,
    vendor: value.vendor ?? null,
  }
}

export function selectDefaultWarrantyGroup<T extends { default_: string, active: string }>(groups: T[]) {
  return groups.find(group => group.active === 'Y' && group.default_ === 'Y')
}

export function validateWarrantyItemForm(form: WarrantyItemForm): WarrantyItemValidation {
  const code = String(form.war_code ?? '').trim()
  if (!code || code.length > WARRANTY_ITEM_CODE_MAX_LENGTH || !WARRANTY_ITEM_CODE_PATTERN.test(code)) return { valid: false, field: 'war_code' }
  const name = String(form.war_des ?? '').trim()
  if (!name || name.length > WARRANTY_ITEM_NAME_MAX_LENGTH) return { valid: false, field: 'war_des' }
  if (!String(form.type_code ?? '').trim()) return { valid: false, field: 'type_code' }
  for (const field of ['tot_date', 'tot_month', 'tot_year'] as const) {
    const value = form[field]
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return { valid: false, field }
  }
  if (form.lifetime !== 'Y' && form.lifetime !== 'N') return { valid: false, field: 'lifetime' }
  if (form.active !== 'Y' && form.active !== 'N') return { valid: false, field: 'active' }
  return { valid: true }
}

export function toWarrantyItemHeader(form: WarrantyItemForm): WarrantyItemHeader {
  const lifetime = form.lifetime === 'Y'
  return {
    war_code: String(form.war_code).trim(),
    war_des: String(form.war_des).trim(),
    type_code: String(form.type_code).trim(),
    tot_date: lifetime ? 0 : form.tot_date,
    tot_month: lifetime ? 0 : form.tot_month,
    tot_year: lifetime ? 0 : form.tot_year,
    lifetime: form.lifetime,
    itemcode: String(form.itemcode ?? '').trim(),
    active: form.active,
  }
}

export function applyWarrantyItemLifetime(form: WarrantyItemForm, enabled: boolean): WarrantyItemForm {
  return {
    ...form,
    lifetime: enabled ? 'Y' : 'N',
    ...(enabled ? { tot_date: 0, tot_month: 0, tot_year: 0 } : {}),
    durationDisabled: enabled,
  }
}

function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

function integer(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (typeof value === 'string' && value.trim() === '') return null
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 ? number : null
}

function requiredText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

function audit(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value)
}

export function normalizeWarrantyItemRow(value: unknown): WarrantyItem | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  const war_code = requiredText(row.war_code)
  const war_des = requiredText(row.war_des)
  const type_code = requiredText(row.type_code)
  const tot_date = integer(row.tot_date)
  const tot_month = integer(row.tot_month)
  const tot_year = integer(row.tot_year)
  if (!war_code || !war_des || !type_code || tot_date === null || tot_month === null || tot_year === null) return null
  if (row.active !== 'Y' && row.active !== 'N') return null
  return {
    war_code, war_des, type_code, type_name: text(row.type_name), tot_date, tot_month, tot_year,
    lifetime: text(row.lifetime), itemcode: text(row.itemcode), active: row.active,
    add_user: audit(row.add_user), add_dt: audit(row.add_dt), edit_user: audit(row.edit_user), edit_dt: audit(row.edit_dt),
    ic_docno: audit(row.ic_docno), ic_itemno: audit(row.ic_itemno), vendor: audit(row.vendor),
  }
}

export function normalizeWarrantyItemPage(payload: unknown): WarrantyItemPage | null {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return null
  const envelope = payload as Record<string, unknown>
  if (!Array.isArray(envelope.data_rows) || typeof envelope.total !== 'number' || !Number.isInteger(envelope.total) || envelope.total < 0) return null
  const data = envelope.data_rows.map(normalizeWarrantyItemRow)
  if (data.some(row => row === null)) return null
  return { data: data as WarrantyItem[], total: envelope.total }
}

function takeSize(take: number) { return Math.max(1, Math.trunc(take) || DEFAULT_TAKE) }
export function getPageCount(total: number, take = DEFAULT_TAKE) { return Math.max(1, Math.ceil(Math.max(0, total) / takeSize(take))) }
export function getSkip(page: number, take = DEFAULT_TAKE, total = Number.MAX_SAFE_INTEGER) {
  const size = takeSize(take)
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), getPageCount(total, size))
  return (current - 1) * size
}
export function rowNumber(skip: number, index: number) { return skip + index + 1 }
/** Preserves the legacy behavior: unchecked means the unfiltered server result. */
export function toActiveParam(activeOnly: boolean): WarrantyItemActiveFilter { return activeOnly ? 'Y' : 'N' }
