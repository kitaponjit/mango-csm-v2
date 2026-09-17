import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createWarrantyItemDownloadCapability,
  type WarrantyItemDownloadWindow,
} from '../../../app/features/warranty-item/export/warranty-item-download-capability'

function fakeWindow(): WarrantyItemDownloadWindow {
  return {
    location: { href: '' },
    close: vi.fn(),
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Warranty Item download capability', () => {
  it('reserves a blank popup before the token is available', () => {
    const popup = fakeWindow()
    const open = vi.fn().mockReturnValue(popup)
    vi.stubGlobal('window', { dataServer: 'https://api.example/service/', open })
    const capability = createWarrantyItemDownloadCapability()

    expect(capability.reserve()).toBe(popup)
    expect(open).toHaveBeenCalledWith('', '_blank')
  })

  it('constructs only the trusted download route and encoded token query', () => {
    vi.stubGlobal('window', { dataServer: 'https://api.example/service/' })
    const capability = createWarrantyItemDownloadCapability()
    const popup = fakeWindow()

    capability.navigate(popup, 'server token')

    expect(popup.location.href).toBe('https://api.example/service/API/File/DownLoad?download=true&id=server+token')
  })

  it('encodes reserved token characters as query data', () => {
    vi.stubGlobal('window', { dataServer: 'https://api.example/service/' })
    const capability = createWarrantyItemDownloadCapability()
    const popup = fakeWindow()

    capability.navigate(popup, 'server?token&part=1')

    expect(popup.location.href).toBe('https://api.example/service/API/File/DownLoad?download=true&id=server%3Ftoken%26part%3D1')
  })

  it('does not reserve a popup when the browser API is unavailable', () => {
    vi.stubGlobal('window', { dataServer: 'https://api.example/service/' })
    const capability = createWarrantyItemDownloadCapability()

    expect(capability.reserve()).toBeNull()
  })
})
