import type { WarrantyItemTransport } from '../runtime/legacy-xtools-transport'

export type WarrantyItemListField = 'war_code' | 'war_des'
export type WarrantyItemListActiveFilter = 'Y' | 'N'

export interface WarrantyItemListRequest {
  page: number
  pageSize: number
  field: WarrantyItemListField
  text: string
  /** `N` is the backend's all-statuses mode; inactive-only is not available. */
  active: WarrantyItemListActiveFilter
}

export interface WarrantyItemListItem {
  code: string
  name: string
  groupName: string
  durationLabel: string
  lifetime: boolean
  active: boolean
  addedBy: string
  addedAt: string
  editedBy: string
  editedAt: string
}

export interface WarrantyItemListResult {
  items: WarrantyItemListItem[]
  total: number
}

export interface WarrantyItemListService {
  read(request: WarrantyItemListRequest): Promise<WarrantyItemListResult>
}

interface RawWarrantyItemRow {
  war_code: string
  war_des: string
  type_name: string
  tot_warranty: string
  lifetime: 'Y' | 'N'
  active: 'Y' | 'N'
  add_user: string
  add_dt: string
  edit_user: string
  edit_dt: string
}

const MALFORMED_RESPONSE_MESSAGE = 'Warranty Item list response is malformed.'
const MALFORMED_ROW_MESSAGE = 'Warranty Item list response contains a malformed row.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFlag(value: unknown): value is 'Y' | 'N' {
  return value === 'Y' || value === 'N'
}

function isWarrantyItemRow(value: unknown): value is RawWarrantyItemRow {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.war_code === 'string'
    && typeof value.war_des === 'string'
    && typeof value.type_name === 'string'
    && typeof value.tot_warranty === 'string'
    && isFlag(value.lifetime)
    && isFlag(value.active)
    && typeof value.add_user === 'string'
    && typeof value.add_dt === 'string'
    && typeof value.edit_user === 'string'
    && typeof value.edit_dt === 'string'
}

function normalizeRow(rawRow: unknown): WarrantyItemListItem {
  if (!isWarrantyItemRow(rawRow)) {
    throw new TypeError(MALFORMED_ROW_MESSAGE)
  }

  return {
    code: rawRow.war_code,
    name: rawRow.war_des,
    groupName: rawRow.type_name,
    durationLabel: rawRow.tot_warranty,
    lifetime: rawRow.lifetime === 'Y',
    active: rawRow.active === 'Y',
    addedBy: rawRow.add_user,
    addedAt: rawRow.add_dt,
    editedBy: rawRow.edit_user,
    editedAt: rawRow.edit_dt,
  }
}

function normalizeResponse(rawResponse: unknown): WarrantyItemListResult {
  if (!isRecord(rawResponse) || typeof rawResponse.success !== 'boolean') {
    throw new TypeError(MALFORMED_RESPONSE_MESSAGE)
  }
  if (!rawResponse.success) {
    if (typeof rawResponse.error !== 'string') {
      throw new TypeError(MALFORMED_RESPONSE_MESSAGE)
    }
    throw new Error(rawResponse.error || 'Warranty Item list request was unsuccessful.')
  }
  if (!isRecord(rawResponse.data)
    || !Array.isArray(rawResponse.data.data_rows)
    || typeof rawResponse.data.total !== 'number'
    || !Number.isFinite(rawResponse.data.total)) {
    throw new TypeError(MALFORMED_RESPONSE_MESSAGE)
  }

  return {
    items: rawResponse.data.data_rows.map(normalizeRow),
    total: rawResponse.data.total,
  }
}

function buildReadListPath(request: WarrantyItemListRequest): string {
  const skip = (request.page - 1) * request.pageSize
  return `csm/master/WarrantyItem_ReadList?skip=${skip}&take=${request.pageSize}&field=${request.field}&text=${encodeURIComponent(request.text)}&active=${request.active}`
}

export function createWarrantyItemListService(transport: WarrantyItemTransport): WarrantyItemListService {
  return {
    async read(request) {
      return normalizeResponse(await transport.get(buildReadListPath(request)))
    },
  }
}
