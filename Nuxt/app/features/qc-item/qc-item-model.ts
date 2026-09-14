export interface QCItem {
  itemno: number
  itemname: string
  remark: string
  adddate?: string | null
  editdate?: string | null
  adduser?: string | null
  edituser?: string | null
  line_number?: number | null
}

export interface EditableQCItem {
  itemno: number
  itemname: string
  remark: string
  adddate?: string | Date | null
  line_number?: number | null
}

export interface QCItemValidation {
  valid: boolean
  itemno?: number
  field?: 'description' | 'remark'
}

export const PAGE_SIZE = 10

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
}

function toItemNumber(value: unknown, fallback: number) {
  const itemno = Number(value)
  return Number.isInteger(itemno) && itemno > 0 ? itemno : fallback
}

function toText(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

export function normalizeQCItems(payload: unknown): EditableQCItem[] {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map((value, index) => {
    const row = asRecord(value)
    const normalized: EditableQCItem = {
      itemno: toItemNumber(row.itemno, index + 1),
      itemname: toText(row.itemname),
      remark: toText(row.remark),
    }

    if ('adddate' in row) {
      normalized.adddate = row.adddate as string | Date | null
    }
    if ('line_number' in row) {
      const lineNumber = Number(row.line_number)
      normalized.line_number = Number.isInteger(lineNumber) ? lineNumber : null
    }

    return normalized
  })
}

export function getPageCount<T>(rows: T[], pageSize = PAGE_SIZE) {
  const size = Math.max(1, pageSize)
  return Math.max(1, Math.ceil(rows.length / size))
}

export function getPageItems<T>(rows: T[], page: number, pageSize = PAGE_SIZE) {
  const size = Math.max(1, pageSize)
  const totalPages = getPageCount(rows, size)
  const currentPage = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages)
  const start = (currentPage - 1) * size
  return rows.slice(start, start + size)
}

export function createNewQCItem(rows: Pick<EditableQCItem, 'itemno'>[], now = new Date()): EditableQCItem {
  const maxItemNumber = rows.reduce((maximum, row) => Math.max(maximum, row.itemno), 0)
  const itemno = maxItemNumber + 1

  return {
    itemno,
    itemname: '',
    remark: '',
    adddate: now,
    line_number: itemno,
  }
}

export function validateQCItems(rows: Pick<EditableQCItem, 'itemno' | 'itemname' | 'remark'>[]): QCItemValidation {
  for (const row of rows) {
    if (!row.itemname.trim()) {
      return { valid: false, itemno: row.itemno, field: 'description' }
    }
    if (!row.remark.trim()) {
      return { valid: false, itemno: row.itemno, field: 'remark' }
    }
  }

  return { valid: true }
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function formatQCItemDate(value: unknown) {
  if (!value) {
    return ''
  }

  const text = String(value)
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(text)
  if (isoDate) {
    return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`
  }

  const dotNetDate = /^\/Date\((-?\d+)/.exec(text)
  const date = dotNetDate ? new Date(Number(dotNetDate[1])) : new Date(text)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}
