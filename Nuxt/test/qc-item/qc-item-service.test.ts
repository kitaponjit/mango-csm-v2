import { describe, expect, it, vi } from 'vitest'
import type { ApiClient } from '../../app/services/http/api-client'
import { createQCItemService } from '../../app/features/qc-item/qc-item-service'

describe('createQCItemService', () => {
  it('maps the QCItem read action to the raw list endpoint', async () => {
    const result = { ok: true, status: 200, data: [] } as const
    const get = vi.fn().mockResolvedValue(result)
    const api = { get } as unknown as ApiClient
    const service = createQCItemService(api)

    expect(await service.readList()).toEqual(result)
    expect(get).toHaveBeenCalledWith('CSM/Master/QCItem_ReadList')
  })

  it('sends the replace-all create body under the item field', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 200, data: {} })
    const api = { post } as unknown as ApiClient
    const service = createQCItemService(api)
    const items = [{ itemno: 1, itemname: 'Description', remark: 'Remark' }]

    await service.create(items)

    expect(post).toHaveBeenCalledWith('CSM/Master/QCItem_Create', { item: items })
  })

  it('appends the upload as the backend-required file field', async () => {
    const postForm = vi.fn().mockResolvedValue({ ok: true, status: 200, data: true })
    const api = { postForm } as unknown as ApiClient
    const service = createQCItemService(api)
    const file = new File(['xlsx'], 'QCItem.xlsx')

    await service.importFile(file)

    const form = postForm.mock.calls[0][1] as FormData
    expect(postForm).toHaveBeenCalledWith('CSM/Master/QCItem_Import', form)
    expect(form.get('file')).toBe(file)
  })

  it('reads the server-minted export token through the export action', async () => {
    const result = { ok: true, status: 200, data: 'token' } as const
    const get = vi.fn().mockResolvedValue(result)
    const api = { get } as unknown as ApiClient
    const service = createQCItemService(api)

    expect(await service.exportFile()).toEqual(result)
    expect(get).toHaveBeenCalledWith('CSM/Master/QCItem_ExportExcel')
  })
})
