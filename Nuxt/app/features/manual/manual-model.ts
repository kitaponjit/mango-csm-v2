export const MODULE_CODES = [
  'ALL',
  'BD',
  'OF',
  'PO',
  'IC',
  'AP',
  'AR',
  'FA',
  'GL',
  'PM',
  'SE',
  'RT',
  'MA',
  'MRP',
  'EVAL',
  'RE',
] as const

export type ManualModule = typeof MODULE_CODES[number]
export type RevisionCondition = 'between' | 'more_than' | 'less_than' | 'equal'

export interface ManualRow {
  job_no: string
  module: string
  revision: string
  subject: string
  add_dt: string
}

export interface ManualAttachment {
  filepath: string
  description?: string
}

export interface ManualModuleTotal {
  module: string
  total: number | string
}

export interface ManualListPayload {
  data: ManualRow[]
  total: ManualModuleTotal[]
}

export interface ManualTab {
  id: ManualModule
  text: string
  total: number
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function createDefaultDateRange(now: Date) {
  return {
    startDate: formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: formatLocalDate(now),
  }
}

export function formatLegacyApiDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : ''
}

export function formatDisplayDate(value: unknown) {
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

export function buildModuleTabs(totals: ManualModuleTotal[]): ManualTab[] {
  const byModule = new Map<string, number>()
  let allTotal = 0

  for (const row of totals) {
    const total = Number(row.total)
    const normalizedTotal = Number.isFinite(total) ? total : 0
    allTotal += normalizedTotal
    byModule.set(row.module, normalizedTotal)
  }

  return MODULE_CODES.map(id => ({
    id,
    text: id,
    total: id === 'ALL' ? allTotal : byModule.get(id) || 0,
  }))
}

export function filterManualRows(rows: ManualRow[], module: ManualModule) {
  return module === 'ALL' ? rows : rows.filter(row => row.module === module)
}

export function nextTabIndex(current: number, key: string, total: number) {
  if (total < 1) {
    return 0
  }
  if (key === 'ArrowRight') {
    return (current + 1) % total
  }
  if (key === 'ArrowLeft') {
    return (current - 1 + total) % total
  }
  if (key === 'Home') {
    return 0
  }
  if (key === 'End') {
    return total - 1
  }
  return current
}

export function isPreviewableImage(path: string) {
  const withoutQuery = path.split(/[?#]/, 1)[0] || ''
  return /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(withoutQuery)
}
