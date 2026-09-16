export interface WarrantyItemImportMapping {
  war_code: string
  war_des: string
  type_code: string
  tot_date: string
  tot_month: string
  tot_year: string
  lifetime: string
  itemcode: string
  vendor: string
  war_date_start: string
  war_date_end: string
  active: string
}

export interface WarrantyItemImportRow {
  war_code: string
  war_des: string
  type_code: string
  tot_date: number
  tot_month: number
  tot_year: number
  lifetime: 'Y' | 'N'
  itemcode: string
  vendor: string
  war_date_start: string
  war_date_end: string
  active: 'Y' | 'N'
}

export const DEFAULT_IMPORT_MAPPING: WarrantyItemImportMapping = {
  war_code: 'A', war_des: 'B', type_code: 'C', tot_date: 'D', tot_month: 'E', tot_year: 'F',
  lifetime: 'G', itemcode: 'H', vendor: 'I', war_date_start: 'J', war_date_end: 'K', active: 'L',
}

function column(value: unknown) {
  return String(value ?? '').trim().toUpperCase()
}

function cell(value: unknown) {
  return value === null || value === undefined ? '' : String(value).trim()
}

export function coerceImportDuration(value: unknown): number {
  const text = cell(value)
  if (!text) return 0
  const number = Number(text)
  return Number.isInteger(number) && number >= 0 ? number : 0
}

/** Mirrors the JSON importer: blank Active is invalid; other non-Y values become N. */
export function coerceImportActive(value: unknown): 'Y' | 'N' {
  const normalized = cell(value).toUpperCase()
  if (!normalized) throw new Error('Active is not null')
  return normalized === 'Y' ? 'Y' : 'N'
}

function coerceLifetime(value: unknown): 'Y' | 'N' {
  return value === 'Y' ? 'Y' : 'N'
}

const IMPORT_COLUMNS = new Set(Array.from({ length: 12 }, (_, index) => String.fromCharCode(65 + index)))

function validateMapping(mapping: WarrantyItemImportMapping) {
  const columns = Object.values(mapping).map(column)
  if (columns.some(value => !IMPORT_COLUMNS.has(value)) || new Set(columns).size !== columns.length) {
    throw new Error('Import columns must be unique letters A-L')
  }
}

function lookup(row: Record<string, unknown>, selected: string) {
  const wanted = column(selected)
  const key = Object.keys(row).find(candidate => column(candidate) === wanted)
  return key === undefined ? undefined : row[key]
}

export function mapImportRows(
  sheetRows: Record<string, unknown>[],
  mapping: Partial<WarrantyItemImportMapping> = {},
): WarrantyItemImportRow[] {
  const selected = { ...DEFAULT_IMPORT_MAPPING, ...mapping }
  validateMapping(selected)
  const rows: WarrantyItemImportRow[] = []
  for (const source of sheetRows) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) continue
    const war_code = cell(lookup(source, selected.war_code))
    if (!war_code) continue
    const lifetime = coerceLifetime(lookup(source, selected.lifetime))
    rows.push({
      war_code,
      war_des: cell(lookup(source, selected.war_des)),
      type_code: cell(lookup(source, selected.type_code)),
      tot_date: lifetime === 'Y' ? 0 : coerceImportDuration(lookup(source, selected.tot_date)),
      tot_month: lifetime === 'Y' ? 0 : coerceImportDuration(lookup(source, selected.tot_month)),
      tot_year: lifetime === 'Y' ? 0 : coerceImportDuration(lookup(source, selected.tot_year)),
      lifetime,
      itemcode: cell(lookup(source, selected.itemcode)),
      vendor: cell(lookup(source, selected.vendor)),
      war_date_start: cell(lookup(source, selected.war_date_start)),
      war_date_end: cell(lookup(source, selected.war_date_end)),
      active: coerceImportActive(lookup(source, selected.active)),
    })
  }
  return rows
}

function parseDelimitedLine(line: string, delimiter: string) {
  const cells: string[] = []
  let value = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"') {
      if (quoted && line[index + 1] === '"') { value += '"'; index += 1 } else quoted = !quoted
    } else if (character === delimiter && !quoted) {
      cells.push(value.trim()); value = ''
    } else value += character
  }
  cells.push(value.trim())
  return cells
}

export function parsePastedImportSheet(text: string): Record<string, string>[] {
  const rows: Record<string, string>[] = []
  for (const line of String(text ?? '').split(/\r?\n/)) {
    const cells = parseDelimitedLine(line, line.includes('\t') ? '\t' : ',')
    if (cells.every(value => value === '')) continue
    const row: Record<string, string> = {}
    cells.forEach((value, index) => { row[String.fromCharCode(65 + index)] = value })
    rows.push(row)
  }
  return rows
}
