import { describe, expect, it, vi } from 'vitest'

import {
  createWarrantyItemImportAllService,
  DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING,
  mapWarrantyItemImportAllRows,
} from '../../../app/features/warranty-item/import/warranty-item-import-all-service'
import type { WarrantyItemImportPreviewRow } from '../../../app/features/warranty-item/import/warranty-item-import-service'
import type { WarrantyItemTransport } from '../../../app/features/warranty-item/runtime/legacy-xtools-transport'

function createFile(name = 'warranty.xls'): File {
  return new File(['fixture'], name)
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
  return { rowNumber: 1, columns: { ...columns } }
}

describe('Warranty Item Import All service', () => {
  it('maps the complete legacy A–V field set without coercion', () => {
    const row = previewRow({ A: 'PR', B: 'AREA', C: 'Area Name', D: 'WAR-001', E: 'Premium', F: 'WORK', G: 'MAT-001', H: 'not-int', V: ' y ' })

    expect(mapWarrantyItemImportAllRows([row])).toEqual([expect.objectContaining({
      pre_event: 'PR',
      loccode: 'AREA',
      locname: 'Area Name',
      war_code: 'WAR-001',
      war_des: 'Premium',
      type_code: 'WORK',
      itemcode: 'MAT-001',
      tot_date: 'not-int',
      active: ' y ',
    })])
  })

  it('posts Import All rows only to the legacy WarrantyAutoImportData endpoint', async () => {
    const postJson = vi.fn().mockResolvedValue({ success: true, data: true })
    const service = createWarrantyItemImportAllService(createTransport({ postJson }))
    const row = mapWarrantyItemImportAllRows([previewRow({ A: 'PR', D: 'WAR-001', E: 'Premium', V: 'Y' })])[0]!

    await expect(service.importRows([row])).resolves.toEqual({ status: 'imported' })
    expect(postJson).toHaveBeenCalledWith('CSM/Master/WarrantyAutoImportData', { data: [row] })
    expect(postJson.mock.calls[0]?.[0]).not.toContain('WarrantyItemImportData_Master')
  })

  it('uses the full legacy default mapping and accepts both workbook extensions', async () => {
    expect(DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING).toMatchObject({ pre_event: 'A', war_code: 'D', active: 'V' })
    const postForm = vi.fn().mockResolvedValue({ success: true, data: { data: [], total: 0 } })
    const service = createWarrantyItemImportAllService(createTransport({ postForm }))

    await service.upload(createFile('warranty.xls'))
    await service.upload(createFile('warranty.xlsx'))
    expect(postForm).toHaveBeenCalledTimes(2)
  })
})
