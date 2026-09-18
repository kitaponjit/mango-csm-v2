import { describe, expect, it, vi } from 'vitest'

import {
  createWarrantyItemImportAllController,
  createWarrantyItemImportAllState,
} from '../../../app/features/warranty-item/import/warranty-item-import-all-state'
import type { WarrantyItemImportAllService } from '../../../app/features/warranty-item/import/warranty-item-import-all-service'

function createService(overrides: Partial<WarrantyItemImportAllService> = {}): WarrantyItemImportAllService {
  return {
    upload: vi.fn(),
    importRows: vi.fn(),
    getTemplateToken: vi.fn(),
    ...overrides,
  }
}

describe('Warranty Item Import All controller', () => {
  it('keeps successful persistence and failed refresh as separate states', async () => {
    const service = createService({
      importRows: vi.fn().mockResolvedValue({ status: 'imported' }),
    })
    const refreshList = vi.fn().mockRejectedValueOnce(new Error('refresh unavailable')).mockResolvedValue(undefined)
    const state = createWarrantyItemImportAllState()
    state.rows = [{ rowNumber: 1, columns: { D: 'WAR-001', E: 'Premium', V: 'Y' } }]
    state.status = 'ready-to-import'
    const controller = createWarrantyItemImportAllController({ service, refreshList }, state)

    await expect(controller.import()).resolves.toMatchObject({ status: 'refresh-failed-after-import' })
    expect(state.status).toBe('refresh-failed-after-import')
    await expect(controller.retryRefresh()).resolves.toEqual({ status: 'imported' })
    expect(service.importRows).toHaveBeenCalledOnce()
    expect(refreshList).toHaveBeenCalledTimes(2)
  })
})
