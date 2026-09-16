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

export function createNewQCItem(rows: Pick<EditableQCItem, 'itemno' | 'line_number'>[], now = new Date()): EditableQCItem {
  const maxItemNumber = rows.reduce((maximum, row) => Math.max(maximum, row.itemno), 0)
  const maxLineNumber = rows.reduce((maximum, row) => {
    const lineNumber = Number(row.line_number)
    return Number.isInteger(lineNumber) && lineNumber > 0 ? Math.max(maximum, lineNumber) : maximum
  }, 0)
  const itemno = maxItemNumber + 1

  return {
    itemno,
    itemname: '',
    remark: '',
    adddate: now,
    line_number: (maxLineNumber > 0 ? maxLineNumber : maxItemNumber) + 1,
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

function isValidCalendarDate(year: number, month: number, day: number) {
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1]!
}

export function formatQCItemDate(value: unknown) {
  if (!value) {
    return ''
  }

  const text = String(value)
  if (/^\d{4}-/.test(text)) {
    const wallClock = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-](\d{2}):?(\d{2}))?)?$/.exec(text)
    if (!wallClock) return ''

    const [, year, month, day, hour = '00', minute = '00', second = '00', offsetHour = '00', offsetMinute = '00'] = wallClock
    if (!isValidCalendarDate(Number(year), Number(month), Number(day))
      || Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59
      || Number(offsetHour) > 23 || Number(offsetMinute) > 59) return ''

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`
  }

  const dotNetDate = /^\/Date\((-?\d+)(?:[+-](\d{2})(\d{2}))?\)\/$/.exec(text)
  if (text.startsWith('/Date(') && (!dotNetDate
    || Number(dotNetDate[2] ?? 0) > 23 || Number(dotNetDate[3] ?? 0) > 59)) return ''

  const yearFirst = /^(\d{4})\/(\d{1,2})\/(\d{1,2})(?=$|[ T])/.exec(text)
  const monthFirst = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?=$|[ T])/.exec(text)
  if (yearFirst && !isValidCalendarDate(Number(yearFirst[1]), Number(yearFirst[2]), Number(yearFirst[3]))) return ''
  if (monthFirst && !isValidCalendarDate(Number(monthFirst[3]), Number(monthFirst[1]), Number(monthFirst[2]))) return ''

  const date = value instanceof Date
    ? value
    : dotNetDate ? new Date(Number(dotNetDate[1])) : new Date(text)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
    + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
