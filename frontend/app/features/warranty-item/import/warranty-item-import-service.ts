import type { WarrantyItemTransport } from '../runtime/legacy-xtools-transport'

export type WarrantyItemImportColumn =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M'
  | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V'

export type WarrantyItemImportCell = string | number | boolean | null

export type WarrantyItemImportColumns = Partial<Record<WarrantyItemImportColumn, WarrantyItemImportCell>>

export interface WarrantyItemImportPreviewRow {
  rowNumber: number
  columns: WarrantyItemImportColumns
}

export interface WarrantyItemImportPreview {
  fileName: string
  filePath: string | null
  rows: WarrantyItemImportPreviewRow[]
}

export interface WarrantyItemImportDto {
  war_code: WarrantyItemImportCell
  war_des: WarrantyItemImportCell
  type_code: WarrantyItemImportCell
  tot_date: WarrantyItemImportCell
  tot_month: WarrantyItemImportCell
  tot_year: WarrantyItemImportCell
  lifetime: WarrantyItemImportCell
  itemcode: WarrantyItemImportCell
  vendor: WarrantyItemImportCell
  war_date_start: WarrantyItemImportCell
  war_date_end: WarrantyItemImportCell
  active: WarrantyItemImportCell
}

export type WarrantyItemImportMapping = {
  [field in keyof WarrantyItemImportDto]: WarrantyItemImportColumn
}

export const DEFAULT_WARRANTY_ITEM_IMPORT_MAPPING: WarrantyItemImportMapping = {
  war_code: 'A',
  war_des: 'B',
  type_code: 'C',
  tot_date: 'D',
  tot_month: 'E',
  tot_year: 'F',
  lifetime: 'G',
  itemcode: 'H',
  vendor: 'J',
  war_date_start: 'K',
  war_date_end: 'L',
  active: 'M',
}

export type WarrantyItemImportErrorCategory =
  | 'selection'
  | 'parser'
  | 'backend'
  | 'authorization'
  | 'transport'
  | 'contract'

export class WarrantyItemImportServiceError extends Error {
  readonly category: WarrantyItemImportErrorCategory
  override readonly cause: unknown

  constructor(category: WarrantyItemImportErrorCategory, message: string, cause?: unknown) {
    super(message)
    this.name = 'WarrantyItemImportServiceError'
    this.category = category
    this.cause = cause
  }
}

export interface WarrantyItemImportResult {
  status: 'imported'
}

export interface WarrantyItemImportService {
  upload(file: File): Promise<WarrantyItemImportPreview>
  importRows(rows: readonly WarrantyItemImportDto[]): Promise<WarrantyItemImportResult>
  getTemplateToken?(templateName: string): Promise<string>
}

const UPLOAD_PATH = 'Anywhere/Import/ImportExcel'
const PERSISTENCE_PATH = 'CSM/Master/WarrantyItemImportData_Master'
const IMPORT_COLUMNS: WarrantyItemImportColumn[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
]

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

function callError(reason: unknown): WarrantyItemImportServiceError {
  if (reason instanceof WarrantyItemImportServiceError) {
    return reason
  }
  const status = authorizationStatus(reason)
  return new WarrantyItemImportServiceError(
    status === 401 || status === 403 ? 'authorization' : 'transport',
    status === 401 || status === 403
      ? 'Warranty Item Import request is not authorized.'
      : 'Warranty Item Import request failed.',
    reason,
  )
}

async function callTransport<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (reason: unknown) {
    throw callError(reason)
  }
}

function parserError(message: string): WarrantyItemImportServiceError {
  return new WarrantyItemImportServiceError('parser', message)
}

function contractError(message: string, cause?: unknown): WarrantyItemImportServiceError {
  return new WarrantyItemImportServiceError('contract', message, cause)
}

function backendError(message: string): WarrantyItemImportServiceError {
  const lower = message.toLowerCase()
  const category: WarrantyItemImportErrorCategory = /permission|forbidden|access denied|สิทธิ/.test(lower)
    ? 'authorization'
    : 'backend'
  return new WarrantyItemImportServiceError(category, message)
}

function isImportCell(value: unknown): value is WarrantyItemImportCell {
  return value === null
    || typeof value === 'string'
    || typeof value === 'boolean'
    || (typeof value === 'number' && Number.isFinite(value))
}

function normalizeParserRow(rawRow: unknown, index: number): WarrantyItemImportPreviewRow {
  if (!isRecord(rawRow)) {
    throw contractError(`Warranty Item Import parser row ${index + 1} is malformed.`)
  }

  const columns: WarrantyItemImportColumns = {}
  for (const column of IMPORT_COLUMNS) {
    if (!Object.prototype.hasOwnProperty.call(rawRow, column)) continue
    const value = rawRow[column]
    if (!isImportCell(value)) {
      throw contractError(`Warranty Item Import parser column ${column} in row ${index + 1} is malformed.`)
    }
    columns[column] = value
  }

  return { rowNumber: index + 1, columns }
}

function normalizeUploadResponse(rawResponse: unknown, fallbackFileName: string): WarrantyItemImportPreview {
  if (!isRecord(rawResponse) || typeof rawResponse.success !== 'boolean') {
    throw contractError('Warranty Item Import parser response envelope is malformed.')
  }
  if (!rawResponse.success) {
    if (typeof rawResponse.error !== 'string' || rawResponse.error.trim() === '') {
      throw contractError('Warranty Item Import parser response contains an invalid error.')
    }
    throw parserError(rawResponse.error)
  }
  if (!isRecord(rawResponse.data)
    || !Array.isArray(rawResponse.data.data)
    || typeof rawResponse.data.total !== 'number'
    || !Number.isInteger(rawResponse.data.total)
    || rawResponse.data.total < 0) {
    throw contractError('Warranty Item Import parser response data is malformed.')
  }

  const fileName = typeof rawResponse.data.filename === 'string'
    ? rawResponse.data.filename
    : fallbackFileName
  const filePath = typeof rawResponse.data.filepath === 'string'
    ? rawResponse.data.filepath
    : null

  return {
    fileName,
    filePath,
    rows: rawResponse.data.data.map(normalizeParserRow),
  }
}

function unwrapPersistenceResponse(rawResponse: unknown): WarrantyItemImportResult {
  if (!isRecord(rawResponse) || typeof rawResponse.success !== 'boolean') {
    throw contractError('Warranty Item Import response envelope is malformed.')
  }
  if (!rawResponse.success) {
    if (typeof rawResponse.error !== 'string' || rawResponse.error.trim() === '') {
      throw contractError('Warranty Item Import response contains an invalid backend error.')
    }
    throw backendError(rawResponse.error)
  }
  if (rawResponse.data !== true) {
    throw contractError('Warranty Item Import response data is malformed.')
  }
  return { status: 'imported' }
}

function mappedCell(row: WarrantyItemImportPreviewRow, column: WarrantyItemImportColumn): WarrantyItemImportCell {
  return row.columns[column] === undefined ? null : row.columns[column]!
}

export function mapWarrantyItemImportRow(
  row: WarrantyItemImportPreviewRow,
  mapping: WarrantyItemImportMapping = DEFAULT_WARRANTY_ITEM_IMPORT_MAPPING,
): WarrantyItemImportDto {
  return {
    war_code: mappedCell(row, mapping.war_code),
    war_des: mappedCell(row, mapping.war_des),
    type_code: mappedCell(row, mapping.type_code),
    tot_date: mappedCell(row, mapping.tot_date),
    tot_month: mappedCell(row, mapping.tot_month),
    tot_year: mappedCell(row, mapping.tot_year),
    lifetime: mappedCell(row, mapping.lifetime),
    itemcode: mappedCell(row, mapping.itemcode),
    vendor: mappedCell(row, mapping.vendor),
    war_date_start: mappedCell(row, mapping.war_date_start),
    war_date_end: mappedCell(row, mapping.war_date_end),
    active: mappedCell(row, mapping.active),
  }
}

export function mapWarrantyItemImportRows(
  rows: readonly WarrantyItemImportPreviewRow[],
  mapping: WarrantyItemImportMapping = DEFAULT_WARRANTY_ITEM_IMPORT_MAPPING,
): WarrantyItemImportDto[] {
  return rows.map(row => mapWarrantyItemImportRow(row, mapping))
}

function assertWorkbook(file: File): void {
  const name = file.name.toLowerCase()
  if (!name.endsWith('.xls') && !name.endsWith('.xlsx')) {
    throw new WarrantyItemImportServiceError('selection', 'Select one .xls or .xlsx Warranty Item workbook.')
  }
}

function normalizeTemplateResponse(rawResponse: unknown): string {
  if (!isRecord(rawResponse) || rawResponse.success !== true || typeof rawResponse.path !== 'string' || rawResponse.path.trim() === '') {
    throw contractError('Warranty Item Import template response is malformed.')
  }
  return rawResponse.path
}

export function createWarrantyItemImportService(transport: WarrantyItemTransport): WarrantyItemImportService {
  return {
    async upload(file) {
      assertWorkbook(file)
      const form = new FormData()
      form.append('file', file)
      const rawResponse = await callTransport(() => transport.postForm(UPLOAD_PATH, form))
      try {
        return normalizeUploadResponse(rawResponse, file.name)
      } catch (reason: unknown) {
        if (reason instanceof WarrantyItemImportServiceError) throw reason
        throw contractError('Warranty Item Import parser response is malformed.', reason)
      }
    },

    async importRows(rows) {
      const rawResponse = await callTransport(() => transport.postJson(PERSISTENCE_PATH, {
        data: rows,
      }))
      try {
        return unwrapPersistenceResponse(rawResponse)
      } catch (reason: unknown) {
        if (reason instanceof WarrantyItemImportServiceError) throw reason
        throw contractError('Warranty Item Import response is malformed.', reason)
      }
    },

    async getTemplateToken(templateName) {
      const rawResponse = await callTransport(() => transport.get(
        `Anywhere/Import/DownloadTemplateExcel?filename=${encodeURIComponent(templateName)}`,
      ))
      try {
        return normalizeTemplateResponse(rawResponse)
      } catch (reason: unknown) {
        if (reason instanceof WarrantyItemImportServiceError) throw reason
        throw contractError('Warranty Item Import template response is malformed.', reason)
      }
    },
  }
}
