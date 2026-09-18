import type { WarrantyItemTransport } from '../runtime/legacy-xtools-transport'

export interface WarrantyItemReferenceIcRow {
  war_code?: string
  war_des?: string
  type_code?: string
  type_name?: string
  itemcode?: string
  war_date_start?: string
  war_date_end?: string
  cust_name?: string
  acct_no?: string
  ic_docno?: string
  ic_itemno?: string
  pre_event?: string
  pre_event2?: string
  loccode?: string
  cc_select?: 'Y' | 'N'
  row?: number
  [key: string]: unknown
}

export interface WarrantyItemReferenceIcKey {
  ic_docno?: string | null
  ic_itemno?: string | null
}

export interface WarrantyItemReferenceIcReadRequest {
  skip: number
  take: number
  searchField: string
  searchText: string
  exclude?: readonly WarrantyItemReferenceIcKey[]
}

export interface WarrantyItemReferenceIcReadResult {
  items: WarrantyItemReferenceIcRow[]
  total: number
}

export interface WarrantyItemReferenceIcCreateResult {
  status: 'created'
}

export interface WarrantyItemReferenceIcService {
  read(request: WarrantyItemReferenceIcReadRequest): Promise<WarrantyItemReferenceIcReadResult>
  create(rows: readonly WarrantyItemReferenceIcRow[]): Promise<WarrantyItemReferenceIcCreateResult>
}

interface WarrantyItemReferenceDuration {
  tot_year: number
  tot_month: number
  tot_date: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function unwrapSuccess(raw: unknown, message: string): unknown {
  if (!isRecord(raw) || typeof raw.success !== 'boolean') {
    throw new TypeError(message)
  }
  if (!raw.success) {
    throw new Error(typeof raw.error === 'string' && raw.error.trim() !== '' ? raw.error : 'Warranty Item Reference IC request failed.')
  }
  return raw.data
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function isExcluded(row: WarrantyItemReferenceIcRow, exclude: readonly WarrantyItemReferenceIcKey[]): boolean {
  return exclude.some(item => toStringOrEmpty(item.ic_docno) === toStringOrEmpty(row.ic_docno)
    && toStringOrEmpty(item.ic_itemno) === toStringOrEmpty(row.ic_itemno))
}

function parseDate(value: string): Date | null {
  if (!value.trim()) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function calculateWarrantyReferenceDuration(startDate: string | null | undefined, endDate: string | null | undefined): WarrantyItemReferenceDuration {
  if (!startDate || !endDate) return { tot_year: 0, tot_month: 0, tot_date: 0 }
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  if (!start || !end) return { tot_year: 0, tot_month: 0, tot_date: 0 }

  let years = end.getFullYear() - start.getFullYear()
  let cursor = new Date(start)
  cursor.setFullYear(cursor.getFullYear() + years)
  if (cursor > end) {
    years -= 1
    cursor = new Date(start)
    cursor.setFullYear(cursor.getFullYear() + years)
  }

  let months = end.getMonth() - cursor.getMonth() + (end.getFullYear() - cursor.getFullYear()) * 12
  cursor = new Date(cursor)
  cursor.setMonth(cursor.getMonth() + months)
  if (cursor > end) {
    months -= 1
    cursor = new Date(start)
    cursor.setFullYear(cursor.getFullYear() + years)
    cursor.setMonth(cursor.getMonth() + months)
  }

  const days = Math.floor((end.getTime() - cursor.getTime()) / 86_400_000)
  return { tot_year: Math.abs(years), tot_month: Math.abs(months), tot_date: Math.abs(days) }
}

function createHeader(row: WarrantyItemReferenceIcRow, defaultGroup: { type_code: string, type_name: string } | null): Record<string, unknown> {
  const duration = calculateWarrantyReferenceDuration(row.war_date_start, row.war_date_end)
  return {
    war_code: row.war_code || '',
    war_des: row.war_des || '',
    type_code: row.type_code || defaultGroup?.type_code || '',
    type_name: row.type_name || defaultGroup?.type_name || '',
    itemcode: row.itemcode || '',
    tot_date: duration.tot_date,
    tot_month: duration.tot_month,
    tot_year: duration.tot_year,
    lifetime: 'N',
    active: 'Y',
    acct_no: row.acct_no || '',
    ic_docno: row.ic_docno || '',
    ic_itemno: row.ic_itemno || '',
    war_date_start: row.war_date_start || '',
    war_date_end: row.war_date_end || '',
    vendor: row.cust_name || '',
    pre_event: row.pre_event,
    pre_event2: row.pre_event2,
    loccode: row.loccode,
  }
}

async function defaultWorkType(transport: WarrantyItemTransport): Promise<{ type_code: string, type_name: string } | null> {
  const raw = unwrapSuccess(await transport.get('csm/master/WarrantyGroup_ReadList?active=Y'), 'Warranty Group response is malformed.')
  if (!isRecord(raw) || !Array.isArray(raw.data)) throw new TypeError('Warranty Group response is malformed.')
  const row = raw.data.find(candidate => isRecord(candidate) && candidate.default_ === 'Y')
  if (!isRecord(row)) return null
  return {
    type_code: toStringOrEmpty(row.type_code),
    type_name: toStringOrEmpty(row.type_name),
  }
}

export function createWarrantyItemReferenceIcService(transport: WarrantyItemTransport): WarrantyItemReferenceIcService {
  return {
    async read(request) {
      const path = `csm/master/WarrantyRefIC?skip=${request.skip}&take=${request.take}&search_field=${encodeURIComponent(request.searchField)}&search_text=${encodeURIComponent(request.searchText)}`
      const data = unwrapSuccess(await transport.get(path), 'Warranty Item Reference IC response is malformed.')
      if (!isRecord(data) || !Array.isArray(data.data) || typeof data.total !== 'number') {
        throw new TypeError('Warranty Item Reference IC response is malformed.')
      }
      const exclude = request.exclude ?? []
      return { items: data.data.filter(isRecord).filter(row => !isExcluded(row, exclude)) as WarrantyItemReferenceIcRow[], total: data.total }
    },
    async create(rows) {
      const fallback = rows.some(row => !row.type_code || !row.type_name) ? await defaultWorkType(transport) : null
      await Promise.all(rows.map(async row => {
        const raw = unwrapSuccess(await transport.postJson('CSM/MASTER/WarrantyItem_Create', { header: createHeader(row, fallback) }), 'Warranty Item Reference IC create response is malformed.')
        if (raw !== true && raw !== undefined && !isRecord(raw)) {
          throw new TypeError('Warranty Item Reference IC create response is malformed.')
        }
      }))
      return { status: 'created' }
    },
  }
}
