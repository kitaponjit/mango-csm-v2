import { describe, expect, it, vi } from 'vitest'

import type { WarrantyItemTransport } from '../../../app/features/warranty-item/runtime/legacy-xtools-transport'
import {
  createWarrantyItemExportService,
  WarrantyItemExportServiceError,
} from '../../../app/features/warranty-item/export/warranty-item-export-service'

function createTransport(get: WarrantyItemTransport['get']): WarrantyItemTransport {
  return {
    get,
    postJson: vi.fn(),
    postForm: vi.fn(),
  }
}

describe('Warranty Item Export service', () => {
  it('requests the exact export endpoint without query parameters or a body', async () => {
    const get = vi.fn().mockResolvedValue({ success: true, error: null, data: 'server-token' })
    const service = createWarrantyItemExportService(createTransport(get))

    await expect(service.requestToken()).resolves.toBe('server-token')
    expect(get).toHaveBeenCalledOnce()
    expect(get).toHaveBeenCalledWith('CSM/Master/WarrantyItemExport_Master')
  })

  it('preserves the server token without decoding or transforming it', async () => {
    const token = 'ABCDEF0123.token.with.dots'
    const get = vi.fn().mockResolvedValue({ success: true, error: null, data: token })
    const service = createWarrantyItemExportService(createTransport(get))

    await expect(service.requestToken()).resolves.toBe(token)
  })

  it('rejects a successful response that has no non-empty token', async () => {
    const get = vi.fn().mockResolvedValue({ success: true, error: null, data: '' })
    const service = createWarrantyItemExportService(createTransport(get))

    await expect(service.requestToken()).rejects.toMatchObject({
      category: 'contract',
    })
  })

  it('rejects a whitespace-only token', async () => {
    const get = vi.fn().mockResolvedValue({ success: true, error: '', data: '   ' })
    const service = createWarrantyItemExportService(createTransport(get))

    await expect(service.requestToken()).rejects.toMatchObject({ category: 'contract' })
  })

  it('rejects a malformed response envelope before exposing a token', async () => {
    const get = vi.fn().mockResolvedValue({ success: true, error: 42, data: 'server-token' })
    const service = createWarrantyItemExportService(createTransport(get))

    await expect(service.requestToken()).rejects.toMatchObject({
      category: 'contract',
    })
  })

  it('keeps backend rejection separate from transport authorization failure', async () => {
    const backendGet = vi.fn().mockResolvedValue({ success: false, error: 'Export failed.' })
    const backendService = createWarrantyItemExportService(createTransport(backendGet))
    await expect(backendService.requestToken()).rejects.toMatchObject({ category: 'backend' })

    const authorizationGet = vi.fn().mockRejectedValue({ response: { status: 403 } })
    const authorizationService = createWarrantyItemExportService(createTransport(authorizationGet))
    await expect(authorizationService.requestToken()).rejects.toMatchObject({ category: 'authorization' })
  })
})
