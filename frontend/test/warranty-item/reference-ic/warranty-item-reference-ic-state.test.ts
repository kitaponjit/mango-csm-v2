import { describe, expect, it, vi } from 'vitest'

import {
  createWarrantyItemReferenceIcController,
  createWarrantyItemReferenceIcState,
} from '../../../app/features/warranty-item/reference-ic/warranty-item-reference-ic-state'
import type { WarrantyItemReferenceIcService } from '../../../app/features/warranty-item/reference-ic/warranty-item-reference-ic-service'

function createService(overrides: Partial<WarrantyItemReferenceIcService> = {}): WarrantyItemReferenceIcService {
  return {
    read: vi.fn(async () => ({ items: [], total: 0 })),
    create: vi.fn(async () => ({ status: 'created' as const })),
    ...overrides,
  }
}

describe('createWarrantyItemReferenceIcController', () => {
  it('loads, tracks selection, and refreshes the main list after a successful create', async () => {
    const row = { ic_docno: 'IC-1', ic_itemno: '1', war_code: 'W1', war_des: 'One' }
    const service = createService({ read: vi.fn(async () => ({ items: [row], total: 1 })) })
    const refreshList = vi.fn(async () => undefined)
    const state = createWarrantyItemReferenceIcState()
    const controller = createWarrantyItemReferenceIcController({ service, refreshList }, state)

    await expect(controller.open()).resolves.toEqual({ status: 'loaded' })
    expect(state.items).toEqual([row])
    controller.toggleSelection(row)
    expect(state.selectedItems).toEqual([row])
    await expect(controller.createSelected()).resolves.toEqual({ status: 'created' })
    expect(refreshList).toHaveBeenCalledTimes(1)
    expect(state.status).toBe('created')
    expect(state.selectedItems).toEqual([])
  })

  it('keeps selection and reports a retryable load failure', async () => {
    const service = createService({ read: vi.fn(async () => { throw new Error('Reference IC unavailable') }) })
    const state = createWarrantyItemReferenceIcState()
    const controller = createWarrantyItemReferenceIcController({ service, refreshList: vi.fn(async () => undefined) }, state)

    await expect(controller.open()).resolves.toEqual({ status: 'load-failed', error: expect.any(Error) })
    expect(state.status).toBe('load-failed')
    expect(state.error?.message).toBe('Reference IC unavailable')
    await expect(controller.retry()).resolves.toEqual({ status: 'load-failed', error: expect.any(Error) })
  })
})
