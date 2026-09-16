import { describe, expect, it, vi } from 'vitest'
import type { ApiClient } from '../../app/services/http/api-client'
import { createWarrantyItemService } from '../../app/features/warranty-item/warranty-item-service'

describe('createWarrantyItemService list contract', () => {
  it('requests the initial active Warranty Code page with the legacy 500-row take', async () => {
    const result = { ok: true, status: 200, data: { data_rows: [], total: 0 } } as const
    const get = vi.fn().mockResolvedValue(result)
    const service = createWarrantyItemService({ get } as unknown as ApiClient)

    expect(await service.readList()).toEqual(result)
    expect(get).toHaveBeenCalledWith(
      'CSM/Master/WarrantyItem_ReadList?skip=0&take=500&field=war_code&text=&active=Y',
    )
  })

  it('sends every server-paging and search parameter, including N for unchecked Active', async () => {
    const get = vi.fn().mockResolvedValue({ ok: true, status: 200, data: { data_rows: [], total: 0 } })
    const service = createWarrantyItemService({ get } as unknown as ApiClient)

    await service.readList({ skip: 1_000, take: 500, field: 'war_des', text: 'A&B C', active: 'N' })

    expect(get).toHaveBeenCalledWith(
      'CSM/Master/WarrantyItem_ReadList?skip=1000&take=500&field=war_des&text=A%26B%20C&active=N',
    )
  })

  it('uses the exact read-one contract for fresh edit data', async () => {
    const get = vi.fn().mockResolvedValue({ ok: true, status: 200, data: { war_code: 'W001' } })
    const service = createWarrantyItemService({ get } as unknown as ApiClient)

    await service.readOne('W 001')

    expect(get).toHaveBeenCalledWith('CSM/Master/WarrantyItem_Read?war_code=W%20001')
  })

  it('uses exact create and update endpoints and excludes passive Reference IC fields', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 200, data: {} })
    const service = createWarrantyItemService({ post } as unknown as ApiClient)
    const header = {
      war_code: 'W001', war_des: 'Roof', type_code: 'G01',
      tot_date: 0, tot_month: 12, tot_year: 0, lifetime: 'N', itemcode: 'MAT01', active: 'Y',
    }

    await service.create(header)
    await service.update(header)

    expect(post).toHaveBeenNthCalledWith(1, 'CSM/Master/WarrantyItem_Create', { header })
    expect(post).toHaveBeenNthCalledWith(2, 'CSM/Master/Warrantyitem_Update', { header })
    expect(post.mock.calls[1][1].header).not.toHaveProperty('ic_docno')
    expect(post.mock.calls[1][1].header).not.toHaveProperty('default_')
  })
})
