import { describe, expect, it, vi } from 'vitest'
import type { ApiClient } from '../../app/services/http/api-client'
import { createWarrantyItemService } from '../../app/features/warranty-item/warranty-item-service'

describe('Warranty Item delete service contract (RED)', () => {
  it('posts the exact referential-integrity delete header', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 200, data: {} })
    const service = createWarrantyItemService({ post } as unknown as ApiClient)

    await (service as unknown as { delete(war_code: string): Promise<unknown> }).delete('W001')

    expect(post).toHaveBeenCalledWith('CSM/Master/WarrantyItem_Delete', {
      header: { war_code: 'W001' },
    })
  })
})
