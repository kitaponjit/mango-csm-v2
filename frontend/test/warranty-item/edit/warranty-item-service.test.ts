import { describe, expect, it, vi } from 'vitest'

import {
  WarrantyItemServiceError,
  createWarrantyItemEditService,
  type WarrantyItemEditService,
} from '../../../app/features/warranty-item/edit/warranty-item-service'
import { createWarrantyItemDraft, type WarrantyItemDraft } from '../../../app/features/warranty-item/edit/warranty-item-draft'
import type { WarrantyItemTransport } from '../../../app/features/warranty-item/runtime/legacy-xtools-transport'

const validDraft: WarrantyItemDraft = {
  ...createWarrantyItemDraft(),
  code: 'WAR-001',
  name: 'Premium Warranty',
  groupCode: 'G01',
  groupName: 'Electrical',
  materialCode: 'MAT-7',
  materialName: 'Control Board',
}

function successful(data: unknown): unknown {
  return { success: true, error: '', data }
}

function createTransport(overrides: Partial<WarrantyItemTransport> = {}): WarrantyItemTransport {
  return {
    get: vi.fn().mockResolvedValue(successful({ data: [], total: 0 })),
    postJson: vi.fn().mockResolvedValue(successful('WAR-001')),
    postForm: vi.fn(),
    ...overrides,
  }
}

function serviceWith(transport: WarrantyItemTransport): { service: WarrantyItemEditService, transport: WarrantyItemTransport } {
  return { service: createWarrantyItemEditService(transport), transport }
}

describe('WarrantyItemEditService', () => {
  it('reads and normalizes detail through the exact endpoint', async () => {
    const transport = createTransport({
      get: vi.fn().mockResolvedValue(successful({
        war_code: 'WAR-001', war_des: 'Premium Warranty',
        type_code: 'G01', type_name: 'Electrical', itemcode: null, itemname: null,
        active: 'Y', lifetime: 'N', tot_year: null, tot_month: 3, tot_date: 4,
        tot_warranty: 'ignored', add_user: null, add_dt: null, edit_user: null, edit_dt: null,
      })),
    })
    const { service } = serviceWith(transport)

    await expect(service.readDetail('WAR/001')).resolves.toMatchObject({
      code: 'WAR-001',
      group: { code: 'G01' },
      material: null,
      duration: { years: null, months: 3, days: 4 },
    })
    expect(transport.get).toHaveBeenCalledWith('csm/master/WarrantyItem_Read?war_code=WAR%2F001')
  })

  it('loads active Groups and maps the backend data envelope', async () => {
    const transport = createTransport({
      get: vi.fn().mockResolvedValue(successful({
        data: [
          { type_code: 'G01', type_name: 'Electrical', active: 'Y', default_: 'Y' },
          { type_code: 'G02', type_name: 'Mechanical', active: 'Y', default_: 'N' },
        ],
        total: 2,
      })),
    })
    const { service } = serviceWith(transport)

    await expect(service.listActiveWarrantyGroups()).resolves.toEqual([
      { code: 'G01', name: 'Electrical', active: true, default: true, currentOnly: false },
      { code: 'G02', name: 'Mechanical', active: true, default: false, currentOnly: false },
    ])
    expect(transport.get).toHaveBeenCalledWith('csm/master/WarrantyGroup_ReadList?active=Y')
  })

  it('searches Material through the narrow lookup contract and maps its display name', async () => {
    const transport = createTransport({
      get: vi.fn().mockResolvedValue(successful({
        data_rows: [
          { type_code: 'MAT-7', type_name: 'Control Board', c_des: 'CB' },
        ],
        total: 1,
      })),
    })
    const { service } = serviceWith(transport)

    await expect(service.searchMaterials('Control Board')).resolves.toEqual({
      items: [{ code: 'MAT-7', name: 'Control Board' }],
      total: 1,
    })
    expect(transport.get).toHaveBeenCalledWith('CSM/Center/Material_ReadList?skip=0&take=500&search_text=Control%20Board')
  })

  it('uses c_des1 as the Material name when type_name is absent, even when c_des is present', async () => {
    const transport = createTransport({
      get: vi.fn().mockResolvedValue(successful({
        data_rows: [{ type_code: 'MAT-8', c_des: 'Material group', c_des1: 'Bearing' }],
        total: 1,
      })),
    })
    const { service } = serviceWith(transport)

    await expect(service.searchMaterials('Bearing')).resolves.toEqual({
      items: [{ code: 'MAT-8', name: 'Bearing' }],
      total: 1,
    })
  })

  it('posts exact whitelisted create and update requests to their observed endpoints', async () => {
    const transport = createTransport()
    const { service } = serviceWith(transport)

    await service.create(validDraft)
    await service.update(validDraft)

    const expected = {
      header: {
        war_code: 'WAR-001', war_des: 'Premium Warranty', type_code: 'G01', itemcode: 'MAT-7',
        tot_year: 0, tot_month: 0, tot_date: 0, lifetime: 'N', active: 'Y',
      },
    }
    expect(transport.postJson).toHaveBeenNthCalledWith(1, 'CSM/MASTER/WarrantyItem_Create', expected)
    expect(transport.postJson).toHaveBeenNthCalledWith(2, 'CSM/MASTER/WarrantyItem_Update', expected)
  })

  it('rejects a backend failure with a backend error category', async () => {
    const transport = createTransport({
      postJson: vi.fn().mockResolvedValue({ success: false, error: 'Duplicate code', data: null }),
    })
    const { service } = serviceWith(transport)

    await expect(service.create(validDraft)).rejects.toMatchObject({
      category: 'backend',
      message: 'Duplicate code',
    })
  })

  it('categorizes malformed envelopes and transport failures at the boundary', async () => {
    const malformed = createWarrantyItemEditService(createTransport({
      get: vi.fn().mockResolvedValue({ success: true, data: null }),
    }))
    await expect(malformed.readDetail('WAR-001')).rejects.toMatchObject({ category: 'contract' })

    const transportError = new Error('Network unavailable')
    const unavailable = createWarrantyItemEditService(createTransport({
      get: vi.fn().mockRejectedValue(transportError),
    }))
    await expect(unavailable.readDetail('WAR-001')).rejects.toMatchObject({
      category: 'transport',
      cause: transportError,
    })
    expect(transportError).toBeInstanceOf(Error)
  })

  it('classifies bare transport 401 and nested 403 failures as authorization', async () => {
    const unauthorized = createWarrantyItemEditService(createTransport({
      get: vi.fn().mockRejectedValue({ status: 401 }),
    }))
    await expect(unauthorized.readDetail('WAR-001')).rejects.toMatchObject({
      category: 'authorization',
      cause: { status: 401 },
    })

    const forbidden = createWarrantyItemEditService(createTransport({
      get: vi.fn().mockRejectedValue({ response: { status: 403 } }),
    }))
    await expect(forbidden.readDetail('WAR-001')).rejects.toMatchObject({
      category: 'authorization',
      cause: { response: { status: 403 } },
    })

    const serverFailure = createWarrantyItemEditService(createTransport({
      get: vi.fn().mockRejectedValue({ status: 500 }),
    }))
    await expect(serverFailure.readDetail('WAR-001')).rejects.toMatchObject({
      category: 'transport',
      cause: { status: 500 },
    })

    const cyclic: Record<string, unknown> = {}
    cyclic.cause = cyclic
    const cyclicFailure = createWarrantyItemEditService(createTransport({
      get: vi.fn().mockRejectedValue(cyclic),
    }))
    await expect(cyclicFailure.readDetail('WAR-001')).rejects.toMatchObject({
      category: 'transport',
      cause: cyclic,
    })
  })

  it('allows legacy-accepted draft values to reach the backend', async () => {
    const transport = createTransport()
    const { service } = serviceWith(transport)

    await expect(service.create({ ...validDraft, code: '' })).resolves.toBe('WAR-001')
    expect(transport.postJson).toHaveBeenCalledTimes(1)
  })
})
