import { describe, expect, it, vi } from 'vitest'

import {
  createWarrantyItemImportService,
  mapWarrantyItemImportRows,
  WarrantyItemImportServiceError,
  type WarrantyItemImportPreviewRow,
} from '../../../app/features/warranty-item/import/warranty-item-import-service'
import type { WarrantyItemTransport } from '../../../app/features/warranty-item/runtime/legacy-xtools-transport'

function createFile(name = 'warranty.xlsx'): File {
  return new File(['fixture'], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

function createTransport(overrides: Partial<WarrantyItemTransport> = {}): WarrantyItemTransport {
  return {
    get: vi.fn(),
    postJson: vi.fn(),
    postForm: vi.fn(),
    ...overrides,
  }
}

function previewRow(columns: Record<string, string | number | boolean | null>): WarrantyItemImportPreviewRow {
  return { rowNumber: 3, columns: { ...columns } as WarrantyItemImportPreviewRow['columns'] }
}

describe('createWarrantyItemImportService', () => {
  it('uploads one .xlsx file as multipart field file to the generic parser endpoint', async () => {
    const postForm = vi.fn().mockResolvedValue({
      success: true,
      error: '',
      data: {
        data: [],
        total: 0,
        filename: 'warranty.xlsx',
        filepath: 'temp/warranty.xlsx',
      },
    })
    const transport = createTransport({ postForm })
    const service = createWarrantyItemImportService(transport)

    await service.upload(createFile())

    expect(postForm).toHaveBeenCalledOnce()
    expect(postForm).toHaveBeenCalledWith('Anywhere/Import/ImportExcel', expect.any(FormData))
    const form = postForm.mock.calls[0]?.[1]
    expect(form).toBeInstanceOf(FormData)
    expect(Array.from((form as FormData).keys())).toEqual(['file'])
    expect((form as FormData).get('file')).toMatchObject({ name: 'warranty.xlsx' })
  })

  it.each(['warranty.xls', 'warranty.csv', 'warranty'])('rejects a non-.xlsx file before upload: %s', async name => {
    const postForm = vi.fn()
    const service = createWarrantyItemImportService(createTransport({ postForm }))

    await expect(service.upload(createFile(name))).rejects.toMatchObject({
      category: 'selection',
    })
    expect(postForm).not.toHaveBeenCalled()
  })

  it('normalizes the parser response into typed positional preview columns and ignores column I in the DTO', async () => {
    const transport = createTransport({
      postForm: vi.fn().mockResolvedValue({
        success: true,
        error: '',
        data: {
          data: [{
            A: 'WAR-001', B: 'Premium', C: 'WORK', D: '7', E: 2, F: 1, G: 'Y', H: 'MAT-001',
            I: 'ignored material name', J: 'Vendor', K: '01/02/2026', L: '28/02/2026', M: ' y ',
            extra: 'must not escape the parser boundary',
          }],
          total: 1,
          filename: 'warranty.xlsx',
          filepath: 'temp/warranty.xlsx',
        },
      }),
    })
    const service = createWarrantyItemImportService(transport)

    const preview = await service.upload(createFile())
    expect(preview.rows[0]).toEqual({
      rowNumber: 1,
      columns: {
        A: 'WAR-001', B: 'Premium', C: 'WORK', D: '7', E: 2, F: 1, G: 'Y', H: 'MAT-001',
        I: 'ignored material name', J: 'Vendor', K: '01/02/2026', L: '28/02/2026', M: ' y ',
      },
    })
    expect(Object.keys(preview.rows[0]!.columns)).toEqual([
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    ])

    const mapped = mapWarrantyItemImportRows(preview.rows)
    expect(mapped).toEqual([{
      war_code: 'WAR-001',
      war_des: 'Premium',
      type_code: 'WORK',
      tot_date: 7,
      tot_month: 2,
      tot_year: 1,
      lifetime: 'Y',
      itemcode: 'MAT-001',
      vendor: 'Vendor',
      war_date_start: '01/02/2026',
      war_date_end: '28/02/2026',
      active: 'Y',
    }])
    expect(mapped[0]).not.toHaveProperty('material_name')
    expect(mapped[0]).not.toHaveProperty('I')
  })

  it('keeps blank Warranty Code rows for the JSON backend to skip', () => {
    expect(mapWarrantyItemImportRows([previewRow({ A: '', B: 'Blank row', M: 'Y' })])).toEqual([{
      war_code: '',
      war_des: 'Blank row',
      type_code: '',
      tot_date: 0,
      tot_month: 0,
      tot_year: 0,
      lifetime: null,
      itemcode: '',
      vendor: null,
      war_date_start: null,
      war_date_end: null,
      active: 'Y',
    }])
  })

  it('maps vendor and dates without pretending the frontend controls existing-row persistence asymmetry', () => {
    const mapped = mapWarrantyItemImportRows([previewRow({
      A: 'WAR-001', J: 'Vendor', K: '01/02/2026', L: '28/02/2026', M: 'Y',
    })])

    expect(mapped[0]).toMatchObject({
      vendor: 'Vendor',
      war_date_start: '01/02/2026',
      war_date_end: '28/02/2026',
    })
  })

  it('rejects a malformed parser response and parser rejection with typed errors', async () => {
    const malformed = createWarrantyItemImportService(createTransport({
      postForm: vi.fn().mockResolvedValue({ success: true, error: '', data: { data: 'not rows' } }),
    }))
    await expect(malformed.upload(createFile())).rejects.toMatchObject({
      category: 'contract',
    })

    const rejected = createWarrantyItemImportService(createTransport({
      postForm: vi.fn().mockResolvedValue({ success: false, error: 'Workbook could not be parsed.', data: null }),
    }))
    await expect(rejected.upload(createFile())).rejects.toMatchObject({
      category: 'parser',
      message: 'Workbook could not be parsed.',
    })
  })
})

describe('Warranty Item Import persistence service', () => {
  it('posts one explicit data payload to WarrantyItemImportData_Master without tenant identity', async () => {
    const postJson = vi.fn().mockResolvedValue({ success: true, error: '', data: true })
    const service = createWarrantyItemImportService(createTransport({ postJson }))
    const row = mapWarrantyItemImportRows([previewRow({
      A: 'WAR-001', B: 'Premium', C: 'WORK', D: '1', E: '2', F: '3', G: 'N', H: 'MAT-001',
      I: 'ignored', J: 'Vendor', K: '01/02/2026', L: '28/02/2026', M: 'Y',
    })])[0]!

    await expect(service.importRows([row])).resolves.toEqual({ status: 'imported' })
    expect(postJson).toHaveBeenCalledOnce()
    expect(postJson).toHaveBeenCalledWith('CSM/Master/WarrantyItemImportData_Master', { data: [row] })
    expect(postJson.mock.calls[0]?.[1]).not.toHaveProperty('maincode')
  })

  it('rejects a malformed persistence response and a backend rejection', async () => {
    const malformed = createWarrantyItemImportService(createTransport({
      postJson: vi.fn().mockResolvedValue({ success: true, error: '', data: false }),
    }))
    await expect(malformed.importRows([])).rejects.toBeInstanceOf(WarrantyItemImportServiceError)
    await expect(malformed.importRows([])).rejects.toMatchObject({ category: 'contract' })

    const rejected = createWarrantyItemImportService(createTransport({
      postJson: vi.fn().mockResolvedValue({ success: false, error: 'Batch rolled back.', data: false }),
    }))
    await expect(rejected.importRows([])).rejects.toMatchObject({
      category: 'backend',
      message: 'Batch rolled back.',
    })
  })
})
