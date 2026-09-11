import { describe, expect, it } from 'vitest'
import { createFileCapability } from '../app/services/files/file-capability'

describe('createFileCapability', () => {
  it('builds an encoded attachment URL from the configured file host', () => {
    const files = createFileCapability({
      fileHost: 'https://files.example.test/service',
      apiBaseUrl: 'https://api.example.test/service/',
    })

    expect(files.openUrl('folder/file name.png')).toBe(
      'https://files.example.test/service/Api/File/DownLoad?id=folder%2Ffile%20name.png',
    )
  })

  it('adds the legacy download flag only when requested', () => {
    const files = createFileCapability({ apiBaseUrl: '/service/' })

    expect(files.openUrl('manual.pdf', { download: true })).toBe(
      '/service/Api/File/DownLoad?download=true&id=manual.pdf',
    )
  })

  it('falls back to the API base when no dedicated file host is configured', () => {
    const files = createFileCapability({ apiBaseUrl: 'https://api.example.test/service/' })

    expect(files.openUrl('image.png')).toBe(
      'https://api.example.test/service/Api/File/DownLoad?id=image.png',
    )
  })
})
