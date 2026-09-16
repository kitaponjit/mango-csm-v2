import { describe, expect, it, vi } from 'vitest'

import type { WarrantyItemTransport } from '../../../app/features/warranty-item/runtime/legacy-xtools-transport'
import { createWarrantyItemListService } from '../../../app/features/warranty-item/list/warranty-item-list-service'

function createTransport(response: unknown): WarrantyItemTransport {
  return {
    get: vi.fn().mockResolvedValue(response),
    postJson: vi.fn(),
    postForm: vi.fn(),
  }
}

const responseRow = {
  war_code: 'WAR-001',
  war_des: 'Premium Warranty',
  type_name: 'Electrical',
  tot_warranty: '24 months',
  lifetime: 'N',
  active: 'Y',
  add_user: 'creator',
  add_dt: '2026-09-16T09:30:00',
  edit_user: 'editor',
  edit_dt: '2026-09-16T10:15:00',
}

function successfulResponse(row: unknown = responseRow): unknown {
  return {
    success: true,
    error: '',
    data: {
      data_rows: [row],
      total: 31,
    },
  }
}

describe('createWarrantyItemListService', () => {
  it('requests the exact read-list endpoint with paging, field, encoded text, and all-active filter', async () => {
    const transport = createTransport(successfulResponse())
    const service = createWarrantyItemListService(transport)

    await service.read({
      page: 3,
      pageSize: 10,
      field: 'war_des',
      text: 'A & B/100%',
      active: 'N',
    })

    expect(transport.get).toHaveBeenCalledOnce()
    expect(transport.get).toHaveBeenCalledWith(
      'csm/master/WarrantyItem_ReadList?skip=20&take=10&field=war_des&text=A%20%26%20B%2F100%25&active=N',
    )
  })

  it('normalizes a successful backend row and exposes the total', async () => {
    const service = createWarrantyItemListService(createTransport(successfulResponse()))

    await expect(service.read({
      page: 1,
      pageSize: 25,
      field: 'war_code',
      text: '',
      active: 'Y',
    })).resolves.toEqual({
      total: 31,
      items: [{
        code: 'WAR-001',
        name: 'Premium Warranty',
        groupName: 'Electrical',
        durationLabel: '24 months',
        lifetime: false,
        active: true,
        addedBy: 'creator',
        addedAt: '2026-09-16T09:30:00',
        editedBy: 'editor',
        editedAt: '2026-09-16T10:15:00',
      }],
    })
  })

  it('propagates the backend error when the response is unsuccessful', async () => {
    const service = createWarrantyItemListService(createTransport({
      success: false,
      error: 'No permission',
      data: null,
    }))

    await expect(service.read({
      page: 1,
      pageSize: 25,
      field: 'war_code',
      text: '',
      active: 'Y',
    })).rejects.toThrow('No permission')
  })

  it.each([
    ['a non-object envelope', null],
    ['an envelope without a boolean success flag', { success: 'true' }],
    ['a successful envelope without list data', { success: true, error: '', data: null }],
    ['a successful envelope with a non-numeric total', {
      success: true,
      error: '',
      data: { data_rows: [], total: '31' },
    }],
  ])('rejects %s', async (_name, response) => {
    const service = createWarrantyItemListService(createTransport(response))

    await expect(service.read({
      page: 1,
      pageSize: 25,
      field: 'war_code',
      text: '',
      active: 'Y',
    })).rejects.toThrow('Warranty Item list response is malformed.')
  })

  it('rejects a malformed row instead of coercing its fields', async () => {
    const service = createWarrantyItemListService(createTransport(successfulResponse({
      ...responseRow,
      active: 'maybe',
    })))

    await expect(service.read({
      page: 1,
      pageSize: 25,
      field: 'war_code',
      text: '',
      active: 'Y',
    })).rejects.toThrow('Warranty Item list response contains a malformed row.')
  })
})
