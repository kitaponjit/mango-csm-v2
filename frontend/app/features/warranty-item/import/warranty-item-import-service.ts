import type { WarrantyItemTransport } from '../runtime/legacy-xtools-transport'

export type WarrantyItemImportColumn =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M'

export type WarrantyItemImportCell = string | number | boolean | null

export type WarrantyItemImportColumns = Record<WarrantyItemImportColumn, WarrantyItemImportCell>

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
  war_code: string
  war_des: string | null
  type_code: string
  tot_date: number
  tot_month: number
  tot_year: number
  /** Backend normalizes non-Y values to N; Import does not impose a duration invariant. */
  lifetime: string | null
  itemcode: string
  /** Sent for inserts; the backend intentionally does not overwrite it on existing rows. */
  vendor: string | null
  /** Sent for inserts; the backend intentionally does not overwrite them on existing rows. */
  war_date_start: string | null
  war_date_end: string | null
  /** Backend normalizes non-Y/N values to N; the mapper preserves that authority. */
  active: string | null
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
}

const UPLOAD_PATH = 'Anywhere/Import/ImportExcel'
const PERSISTENCE_PATH = 'CSM/Master/WarrantyItemImportData_Master'
const IMPORT_COLUMNS: WarrantyItemImportColumn[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
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

  const columns = {} as WarrantyItemImportColumns
  for (const column of IMPORT_COLUMNS) {
    const value = rawRow[column]
    if (value !== undefined && !isImportCell(value)) {
      throw contractError(`Warranty Item Import parser column ${column} in row ${index + 1} is malformed.`)
    }
    columns[column] = value === undefined ? null : value
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

function textValue(value: WarrantyItemImportCell): string | null {
  if (value === null) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return null
}

function integerValue(value: WarrantyItemImportCell): number {
  if (typeof value === 'number') {
    return Number.isInteger(value) && Number.isFinite(value) ? value : 0
  }
  if (typeof value !== 'string') return 0
  const normalized = value.trim()
  if (!/^[+-]?\d+$/.test(normalized)) return 0
  const parsed = Number(normalized)
  return Number.isSafeInteger(parsed) ? parsed : 0
}

function activeValue(value: WarrantyItemImportCell): string | null {
  const text = textValue(value)
  return text === null ? null : text.toUpperCase().trim()
}

export function mapWarrantyItemImportRow(row: WarrantyItemImportPreviewRow): WarrantyItemImportDto {
  const { columns } = row
  return {
    war_code: textValue(columns.A) ?? '',
    war_des: textValue(columns.B),
    type_code: textValue(columns.C) ?? '',
    tot_date: integerValue(columns.D),
    tot_month: integerValue(columns.E),
    tot_year: integerValue(columns.F),
    lifetime: textValue(columns.G),
    itemcode: textValue(columns.H) ?? '',
    vendor: textValue(columns.J),
    war_date_start: textValue(columns.K),
    war_date_end: textValue(columns.L),
    active: activeValue(columns.M),
  }
}

export function mapWarrantyItemImportRows(rows: readonly WarrantyItemImportPreviewRow[]): WarrantyItemImportDto[] {
  return rows.map(mapWarrantyItemImportRow)
}

function assertXlsx(file: File): void {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    throw new WarrantyItemImportServiceError('selection', 'Select one .xlsx Warranty Item workbook.')
  }
}

export function createWarrantyItemImportService(transport: WarrantyItemTransport): WarrantyItemImportService {
  return {
    async upload(file) {
      assertXlsx(file)
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
  }
}
