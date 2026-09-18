import type {
  WarrantyItemImportCell,
  WarrantyItemImportColumn,
  WarrantyItemImportPreview,
  WarrantyItemImportPreviewRow,
} from './warranty-item-import-service'
import { createWarrantyItemImportService, WarrantyItemImportServiceError } from './warranty-item-import-service'
import type { WarrantyItemTransport } from '../runtime/legacy-xtools-transport'

export interface WarrantyItemImportAllDto {
  pre_event: WarrantyItemImportCell
  loccode: WarrantyItemImportCell
  locname: WarrantyItemImportCell
  war_code: WarrantyItemImportCell
  war_des: WarrantyItemImportCell
  type_code: WarrantyItemImportCell
  itemcode: WarrantyItemImportCell
  tot_date: WarrantyItemImportCell
  tot_month: WarrantyItemImportCell
  tot_year: WarrantyItemImportCell
  lifetime: WarrantyItemImportCell
  itemname_other: WarrantyItemImportCell
  serial_number: WarrantyItemImportCell
  startdate: WarrantyItemImportCell
  enddate: WarrantyItemImportCell
  vendor: WarrantyItemImportCell
  vendor_start_dt: WarrantyItemImportCell
  vendor_end_dt: WarrantyItemImportCell
  vendor_remark: WarrantyItemImportCell
  remark: WarrantyItemImportCell
  active_row: WarrantyItemImportCell
  active: WarrantyItemImportCell
}

export type WarrantyItemImportAllMapping = {
  [field in keyof WarrantyItemImportAllDto]: WarrantyItemImportColumn
}

export const DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING: WarrantyItemImportAllMapping = {
  pre_event: 'A',
  loccode: 'B',
  locname: 'C',
  war_code: 'D',
  war_des: 'E',
  type_code: 'F',
  itemcode: 'G',
  tot_date: 'H',
  tot_month: 'I',
  tot_year: 'J',
  lifetime: 'K',
  itemname_other: 'L',
  serial_number: 'M',
  startdate: 'N',
  enddate: 'O',
  vendor: 'P',
  vendor_start_dt: 'Q',
  vendor_end_dt: 'R',
  vendor_remark: 'S',
  remark: 'T',
  active_row: 'U',
  active: 'V',
}

export interface WarrantyItemImportAllResult {
  status: 'imported'
}

export interface WarrantyItemImportAllService {
  upload(file: File): Promise<WarrantyItemImportPreview>
  importRows(rows: readonly WarrantyItemImportAllDto[]): Promise<WarrantyItemImportAllResult>
  getTemplateToken(templateName: string): Promise<string>
}

const PERSISTENCE_PATH = 'CSM/Master/WarrantyAutoImportData'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function contractError(message: string, cause?: unknown): WarrantyItemImportServiceError {
  return new WarrantyItemImportServiceError('contract', message, cause)
}

async function callTransport<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (reason: unknown) {
    if (reason instanceof WarrantyItemImportServiceError) throw reason
    throw new WarrantyItemImportServiceError('transport', 'Warranty Item Import All request failed.', reason)
  }
}

function mappedCell(row: WarrantyItemImportPreviewRow, column: WarrantyItemImportColumn): WarrantyItemImportCell {
  return row.columns[column] === undefined ? null : row.columns[column]!
}

export function mapWarrantyItemImportAllRow(
  row: WarrantyItemImportPreviewRow,
  mapping: WarrantyItemImportAllMapping = DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING,
): WarrantyItemImportAllDto {
  const output = {} as WarrantyItemImportAllDto
  for (const field of Object.keys(mapping) as Array<keyof WarrantyItemImportAllDto>) {
    output[field] = mappedCell(row, mapping[field])
  }
  return output
}

export function mapWarrantyItemImportAllRows(
  rows: readonly WarrantyItemImportPreviewRow[],
  mapping: WarrantyItemImportAllMapping = DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING,
): WarrantyItemImportAllDto[] {
  return rows.map(row => mapWarrantyItemImportAllRow(row, mapping))
}

function normalizePersistenceResponse(rawResponse: unknown): WarrantyItemImportAllResult {
  if (!isRecord(rawResponse) || typeof rawResponse.success !== 'boolean') {
    throw contractError('Warranty Item Import All response envelope is malformed.')
  }
  if (!rawResponse.success) {
    throw new WarrantyItemImportServiceError(
      'backend',
      typeof rawResponse.error === 'string' && rawResponse.error.trim() !== ''
        ? rawResponse.error
        : 'Warranty Item Import All request was unsuccessful.',
    )
  }
  if (rawResponse.data !== true) {
    throw contractError('Warranty Item Import All response data is malformed.')
  }
  return { status: 'imported' }
}

export function createWarrantyItemImportAllService(transport: WarrantyItemTransport): WarrantyItemImportAllService {
  const workbookService = createWarrantyItemImportService(transport)
  return {
    upload: file => workbookService.upload(file),
    getTemplateToken: templateName => {
      if (!workbookService.getTemplateToken) {
        return Promise.reject(new Error('Warranty Item Import template download is unavailable.'))
      }
      return workbookService.getTemplateToken(templateName)
    },
    async importRows(rows) {
      const rawResponse = await callTransport(() => transport.postJson(PERSISTENCE_PATH, { data: rows }))
      try {
        return normalizePersistenceResponse(rawResponse)
      } catch (reason: unknown) {
        if (reason instanceof WarrantyItemImportServiceError) throw reason
        throw contractError('Warranty Item Import All response is malformed.', reason)
      }
    },
  }
}
