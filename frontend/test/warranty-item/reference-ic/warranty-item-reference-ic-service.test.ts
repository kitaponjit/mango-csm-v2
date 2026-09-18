import { describe, expect, it, vi } from 'vitest'

import {
  calculateWarrantyReferenceDuration,
  createWarrantyItemReferenceIcService,
  type WarrantyItemReferenceIcRow,
} from '../../../app/features/warranty-item/reference-ic/warranty-item-reference-ic-service'
import type { WarrantyItemTransport } from '../../../app/features/warranty-item/runtime/legacy-xtools-transport'

function createTransport(overrides: Partial<WarrantyItemTransport> = {}): WarrantyItemTransport {
  return {
    get: vi.fn(async () => ({ success: true, data: { data: [], total: 0 } })),
    postJson: vi.fn(async () => ({ success: true, data: true })),
    postForm: vi.fn(async () => ({ success: true })),
    ...overrides,
  }
}

const row: WarrantyItemReferenceIcRow = {
  war_code: 'WAR-1',
  war_des: 'Warranty one',
  type_code: '',
  type_name: '',
  itemcode: 'MAT-1',
  war_date_start: '2024-01-15',
  war_date_end: '2026-04-20',
  cust_name: 'Vendor one',
  acct_no: 'ACCT-1',
  ic_docno: 'IC-1',
  ic_itemno: '1',
  pre_event: 'PE',
  pre_event2: 'PE2',
  loccode: 'LOC',
}

describe('createWarrantyItemReferenceIcService', () => {
  it('reads the legacy Reference IC endpoint and excludes rows already in the main list', async () => {
    const get = vi.fn(async () => ({
      success: true,
      data: { data: [row, { ...row, ic_itemno: '2' }], total: 2 },
    }))
    const transport = createTransport({ get })
    const service = createWarrantyItemReferenceIcService(transport)

    await expect(service.read({
      skip: 20,
      take: 10,
      searchField: 'war_code',
      searchText: 'WAR',
      exclude: [{ ic_docno: 'IC-1', ic_itemno: '1' }],
    })).resolves.toEqual({ items: [{ ...row, ic_itemno: '2' }], total: 2 })
    expect(get).toHaveBeenCalledWith('csm/master/WarrantyRefIC?skip=20&take=10&search_field=war_code&search_text=WAR')
  })

  it('calculates legacy calendar duration and uses the default group when the row has no type', async () => {
    const get = vi.fn()
      .mockResolvedValueOnce({ success: true, data: { data: [{ type_code: 'DEFAULT', type_name: 'Default work type', default_: 'Y', active: 'Y' }] } })
    const postJson = vi.fn(async () => ({ success: true, data: true }))
    const transport = createTransport({ get, postJson })
    const service = createWarrantyItemReferenceIcService(transport)

    expect(calculateWarrantyReferenceDuration('2024-01-15', '2026-04-20')).toEqual({ tot_year: 2, tot_month: 3, tot_date: 5 })
    await expect(service.create([row])).resolves.toEqual({ status: 'created' })
    expect(get).toHaveBeenCalledWith('csm/master/WarrantyGroup_ReadList?active=Y')
    expect(postJson).toHaveBeenCalledWith('CSM/MASTER/WarrantyItem_Create', {
      header: {
        war_code: 'WAR-1',
        war_des: 'Warranty one',
        type_code: 'DEFAULT',
        type_name: 'Default work type',
        itemcode: 'MAT-1',
        tot_date: 5,
        tot_month: 3,
        tot_year: 2,
        lifetime: 'N',
        active: 'Y',
        acct_no: 'ACCT-1',
        ic_docno: 'IC-1',
        ic_itemno: '1',
        war_date_start: '2024-01-15',
        war_date_end: '2026-04-20',
        vendor: 'Vendor one',
        pre_event: 'PE',
        pre_event2: 'PE2',
        loccode: 'LOC',
      },
    })
  })

  it('creates one request per selected row and propagates a failed response', async () => {
    const postJson = vi.fn()
      .mockResolvedValueOnce({ success: true, data: true })
      .mockResolvedValueOnce({ success: false, error: 'Create failed' })
    const transport = createTransport({ postJson })
    const service = createWarrantyItemReferenceIcService(transport)
    const typedRow = { ...row, type_code: 'T1', type_name: 'Type one' }

    await expect(service.create([typedRow, { ...typedRow, ic_itemno: '2' }])).rejects.toThrow('Create failed')
    expect(postJson).toHaveBeenCalledTimes(2)
  })
})
