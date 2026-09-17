import { describe, expect, it, vi } from 'vitest'

import {
  createWarrantyItemExportController,
  createWarrantyItemExportState,
} from '../../../app/features/warranty-item/export/warranty-item-export-state'
import type { WarrantyItemDownloadCapability, WarrantyItemDownloadWindow } from '../../../app/features/warranty-item/export/warranty-item-download-capability'
import { WarrantyItemExportServiceError, type WarrantyItemExportService } from '../../../app/features/warranty-item/export/warranty-item-export-service'

function popup(): WarrantyItemDownloadWindow {
  return { location: { href: '' }, close: vi.fn() }
}

function createService(overrides: Partial<WarrantyItemExportService> = {}): WarrantyItemExportService {
  return { requestToken: vi.fn().mockResolvedValue('server-token'), ...overrides }
}

function createDownload(overrides: Partial<WarrantyItemDownloadCapability> = {}): WarrantyItemDownloadCapability {
  return {
    reserve: vi.fn().mockReturnValue(popup()),
    navigate: vi.fn(),
    close: vi.fn(),
    ...overrides,
  }
}

function createController(options: Parameters<typeof createWarrantyItemExportController>[0]) {
  return createWarrantyItemExportController({
    canExport: () => true,
    confirm: () => true,
    ...options,
  })
}

describe('Warranty Item Export controller', () => {
  it('does not request a token when the user cancels confirmation', async () => {
    const service = createService()
    const download = createDownload()
    const controller = createController({
      service,
      download,
      confirm: vi.fn().mockResolvedValue(false),
    })

    await expect(controller.start()).resolves.toMatchObject({ status: 'cancelled' })
    expect(download.reserve).not.toHaveBeenCalled()
    expect(service.requestToken).not.toHaveBeenCalled()
  })

  it('reports a blocked popup without requesting backend generation', async () => {
    const service = createService()
    const download = createDownload({ reserve: vi.fn().mockReturnValue(null) })
    const controller = createController({ service, download })

    await expect(controller.start()).resolves.toMatchObject({ status: 'popup-blocked' })
    expect(service.requestToken).not.toHaveBeenCalled()
  })

  it('reserves the popup before requesting the token and navigates only after validation', async () => {
    const events: string[] = []
    const popupWindow = popup()
    const service = createService({
      requestToken: vi.fn().mockImplementation(async () => {
        events.push('request')
        return 'server-token'
      }),
    })
    const download = createDownload({
      reserve: vi.fn().mockImplementation(() => {
        events.push('reserve')
        return popupWindow
      }),
      navigate: vi.fn().mockImplementation(() => events.push('navigate')),
    })
    const controller = createController({ service, download })

    await expect(controller.start()).resolves.toMatchObject({ status: 'initiated' })
    expect(events).toEqual(['reserve', 'request', 'navigate'])
    expect(download.navigate).toHaveBeenCalledWith(popupWindow, 'server-token')
    expect(controller.state.pending).toBe(false)
  })

  it('closes the popup when token generation fails', async () => {
    const popupWindow = popup()
    const service = createService({ requestToken: vi.fn().mockRejectedValue(new Error('Backend failed.')) })
    const download = createDownload({ reserve: vi.fn().mockReturnValue(popupWindow) })
    const controller = createController({ service, download })

    await expect(controller.start()).resolves.toMatchObject({ status: 'generation-failed' })
    expect(download.close).toHaveBeenCalledWith(popupWindow)
    expect(controller.state.pending).toBe(false)
  })

  it('closes the popup when the token response violates the export contract', async () => {
    const popupWindow = popup()
    const service = createService({ requestToken: vi.fn().mockRejectedValue(new WarrantyItemExportServiceError('contract', 'Malformed response.')) })
    const download = createDownload({ reserve: vi.fn().mockReturnValue(popupWindow) })
    const controller = createController({ service, download })

    await expect(controller.start()).resolves.toMatchObject({ status: 'contract-failed' })
    expect(download.close).toHaveBeenCalledWith(popupWindow)
  })

  it('closes the popup when navigation fails', async () => {
    const popupWindow = popup()
    const service = createService()
    const download = createDownload({
      reserve: vi.fn().mockReturnValue(popupWindow),
      navigate: vi.fn().mockImplementation(() => { throw new Error('navigation failed') }),
    })
    const controller = createController({ service, download })

    await expect(controller.start()).resolves.toMatchObject({ status: 'navigation-failed' })
    expect(download.close).toHaveBeenCalledWith(popupWindow)
  })

  it('blocks duplicate requests while the first export is pending', async () => {
    let resolveToken: (token: string) => void = () => undefined
    const service = createService({
      requestToken: vi.fn().mockReturnValue(new Promise(resolve => { resolveToken = resolve })),
    })
    const download = createDownload()
    const controller = createController({ service, download })

    const first = controller.start()
    await expect(controller.start()).resolves.toMatchObject({ status: 'superseded' })
    expect(service.requestToken).toHaveBeenCalledOnce()

    resolveToken('server-token')
    await expect(first).resolves.toMatchObject({ status: 'initiated' })
  })

  it('fails closed for unavailable permission without reserving a popup', async () => {
    const service = createService()
    const download = createDownload()
    const controller = createController({
      service,
      download,
      canExport: () => false,
    })

    await expect(controller.start()).resolves.toMatchObject({ status: 'permission-denied' })
    expect(download.reserve).not.toHaveBeenCalled()
    expect(service.requestToken).not.toHaveBeenCalled()
  })

  it('fails closed when the permission guard is omitted', async () => {
    const service = createService()
    const download = createDownload()
    const controller = createWarrantyItemExportController({ service, download })

    await expect(controller.start()).resolves.toMatchObject({ status: 'permission-denied' })
    expect(download.reserve).not.toHaveBeenCalled()
    expect(service.requestToken).not.toHaveBeenCalled()
  })

  it('fails closed when confirmation is omitted after permission is allowed', async () => {
    const service = createService()
    const download = createDownload()
    const controller = createWarrantyItemExportController({
      service,
      download,
      canExport: () => true,
    })

    await expect(controller.start()).resolves.toMatchObject({ status: 'cancelled' })
    expect(download.reserve).not.toHaveBeenCalled()
    expect(service.requestToken).not.toHaveBeenCalled()
  })
})
