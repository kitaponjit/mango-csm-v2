import { describe, expect, it, vi } from 'vitest'

import {
  createWarrantyItemDeleteService,
  type WarrantyItemDeleteTarget,
} from '../../../app/features/warranty-item/delete/warranty-item-delete-service'
import type { WarrantyItemTransport } from '../../../app/features/warranty-item/runtime/legacy-xtools-transport'

const target: WarrantyItemDeleteTarget = {
  code: 'WAR-001',
  name: 'Premium Warranty',
  deleteContext: {
    accountNumber: 'ACCT-001',
    preEvent: 'PRE-001',
    preEvent2: null,
    locationCode: 'LOC-001',
  },
}

function createTransport(response: unknown): WarrantyItemTransport {
  return {
    get: vi.fn(),
    postJson: vi.fn().mockResolvedValue(response),
    postForm: vi.fn(),
  }
}

const success = { success: true, error: '', data: null }

describe('Warranty Item Delete service', () => {
  it('posts the exact five-field header through the verified endpoint', async () => {
    const transport = createTransport(success)
    const service = createWarrantyItemDeleteService(transport)

    await expect(service.delete(target)).resolves.toBeUndefined()

    expect(transport.postJson).toHaveBeenCalledOnce()
    expect(transport.postJson).toHaveBeenCalledWith('CSM/Master/WarrantyItem_Delete', {
      header: {
        war_code: 'WAR-001',
        acct_no: 'ACCT-001',
        pre_event: 'PRE-001',
        pre_event2: null,
        loccode: 'LOC-001',
      },
    })
    const body = vi.mocked(transport.postJson).mock.calls[0]?.[1] as { header: Record<string, unknown> }
    expect(Object.keys(body.header)).toEqual(['war_code', 'acct_no', 'pre_event', 'pre_event2', 'loccode'])
    expect(body.header).not.toHaveProperty('itemcode')
    expect(body.header).not.toHaveProperty('maincode')
  })

  it('rejects malformed Delete context before making a request', async () => {
    const transport = createTransport(success)
    const service = createWarrantyItemDeleteService(transport)

    await expect(service.delete({ ...target, deleteContext: null })).rejects.toMatchObject({
      category: 'contract',
    })
    expect(transport.postJson).not.toHaveBeenCalled()
  })

  it('normalizes a backend referential rejection without reporting success', async () => {
    const message = 'ข้อมูลชุดนี้ถูกนำไปใช้งานแล้ว'
    const service = createWarrantyItemDeleteService(createTransport({
      success: false,
      error: message,
      data: null,
    }))

    await expect(service.delete(target)).rejects.toMatchObject({
      category: 'backend',
      message,
    })
  })

  it.each([
    null,
    { success: 'true', error: '', data: null },
    { success: true, error: '' },
    { success: true, error: '', data: {} },
    { success: false, error: '', data: null },
    { success: false, error: null, data: null },
  ])('rejects malformed response %#', async response => {
    const service = createWarrantyItemDeleteService(createTransport(response))

    await expect(service.delete(target)).rejects.toMatchObject({ category: 'contract' })
  })

  it('classifies an unauthorized transport response separately', async () => {
    const transport = createTransport(success)
    vi.mocked(transport.postJson).mockRejectedValueOnce({ response: { status: 403 } })
    const service = createWarrantyItemDeleteService(transport)

    await expect(service.delete(target)).rejects.toMatchObject({
      category: 'authorization',
    })
  })
})
