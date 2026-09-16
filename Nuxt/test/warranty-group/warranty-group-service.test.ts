import { describe, expect, it, vi } from 'vitest'
import type { ApiClient } from '../../app/services/http/api-client'
import { DEFAULT_TAKE } from '../../app/features/warranty-group/warranty-group-model'
import { createWarrantyGroupService } from '../../app/features/warranty-group/warranty-group-service'

describe('createWarrantyGroupService', () => {
  it('requests the first server page with legacy defaults (take 500, code field, active Y)', async () => {
    const result = { ok: true, status: 200, data: { data: [], total: 0 } } as const
    const get = vi.fn().mockResolvedValue(result)
    const api = { get } as unknown as ApiClient
    const service = createWarrantyGroupService(api)

    expect(await service.readList()).toEqual(result)
    expect(get).toHaveBeenCalledWith(
      `CSM/Master/WarrantyGroup_ReadList?skip=0&take=${DEFAULT_TAKE}&field=type_code&text=&active=Y`,
    )
  })

  it('sends explicit skip/take/field/text/active for server paging and search', async () => {
    const get = vi.fn().mockResolvedValue({ ok: true, status: 200, data: { data: [], total: 0 } })
    const api = { get } as unknown as ApiClient
    const service = createWarrantyGroupService(api)

    await service.readList({ skip: 500, take: 500, field: 'type_name', text: 'pump', active: 'N' })

    expect(get).toHaveBeenCalledWith(
      'CSM/Master/WarrantyGroup_ReadList?skip=500&take=500&field=type_name&text=pump&active=N',
    )
  })

  it('encodes free-text search for the query string', async () => {
    const get = vi.fn().mockResolvedValue({ ok: true, status: 200, data: { data: [], total: 0 } })
    const api = { get } as unknown as ApiClient
    const service = createWarrantyGroupService(api)

    await service.readList({ skip: 0, take: 500, field: 'type_code', text: 'A&B C', active: 'Y' })

    expect(get).toHaveBeenCalledWith(
      'CSM/Master/WarrantyGroup_ReadList?skip=0&take=500&field=type_code&text=A%26B%20C&active=Y',
    )
  })

  it('reads one row by code for the edit prefill', async () => {
    const result = { ok: true, status: 200, data: { type_code: 'G01', type_name: 'Group 1' } } as const
    const get = vi.fn().mockResolvedValue(result)
    const api = { get } as unknown as ApiClient
    const service = createWarrantyGroupService(api)

    expect(await service.readOne('G01')).toEqual(result)
    expect(get).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_Read?type_code=G01')
  })

  it('encodes the code for the single-row read', async () => {
    const get = vi.fn().mockResolvedValue({ ok: true, status: 200, data: null })
    const api = { get } as unknown as ApiClient
    const service = createWarrantyGroupService(api)

    await service.readOne('A&B C')

    expect(get).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_Read?type_code=A%26B%20C')
  })

  it('creates with the verified header shape and trimmed values', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 200, data: 'G01' })
    const api = { post } as unknown as ApiClient
    const service = createWarrantyGroupService(api)

    await service.create({ type_code: '  G01  ', type_name: '  Pump group  ', active: 'Y' })

    expect(post).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_Create', {
      header: { type_code: 'G01', type_name: 'Pump group', active: 'Y' },
    })
  })

  it('updates mutable fields only and never sends the default flag', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 200, data: 'G01' })
    const api = { post } as unknown as ApiClient
    const service = createWarrantyGroupService(api)

    await service.update({ type_code: 'G01', type_name: 'Pump group x', active: 'N' })

    expect(post).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_Update', {
      header: { type_code: 'G01', type_name: 'Pump group x', active: 'N' },
    })
    expect(Object.keys(post.mock.calls[0][1].header).sort()).toEqual(['active', 'type_code', 'type_name'])
  })

  it('hard-deletes with the row header and keeps default rows deletable', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 200, data: 'G01' })
    const api = { post } as unknown as ApiClient
    const service = createWarrantyGroupService(api)

    await service.remove({ type_code: 'G01', type_name: 'Group 1', default_: 'Y', active: 'Y' })

    expect(post).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_Delete', {
      header: { type_code: 'G01', type_name: 'Group 1', default_: 'Y', active: 'Y' },
    })
  })

  it('posts the toggled default_ explicitly to the verified default endpoint', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 200, data: 'G02' })
    const api = { post } as unknown as ApiClient
    const service = createWarrantyGroupService(api)

    await service.updateDefault({ type_code: 'G02', type_name: 'Group 2', default_: 'Y', active: 'Y' })

    expect(post).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_UpdateD', {
      header: { type_code: 'G02', type_name: 'Group 2', default_: 'Y', active: 'Y' },
    })
    expect(Object.keys(post.mock.calls[0][1].header)).toContain('default_')
    expect(post.mock.calls[0][1].header.default_).toBe('Y')
  })

  it('sends default_ N on toggle-off without repairing the zero-default state', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 200, data: 'G01' })
    const api = { post } as unknown as ApiClient
    const service = createWarrantyGroupService(api)

    await service.updateDefault({ type_code: 'G01', type_name: 'Group 1', default_: 'N', active: 'Y' })

    expect(post).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_UpdateD', {
      header: { type_code: 'G01', type_name: 'Group 1', default_: 'N', active: 'Y' },
    })
  })
})
