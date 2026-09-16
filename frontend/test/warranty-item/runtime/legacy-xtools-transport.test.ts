import { describe, expect, it, vi } from 'vitest'

import { createLegacyXtoolsTransport } from '../../../app/features/warranty-item/runtime/legacy-xtools-transport'

describe('createLegacyXtoolsTransport', () => {
  it('delegates GET and returns the raw response unchanged', async () => {
    const rawResponse = { data: { arbitrary: true } }
    const getServer = vi.fn().mockResolvedValue(rawResponse)
    const transport = createLegacyXtoolsTransport({
      getServer,
      postServerJson: vi.fn(),
      postServerForm: vi.fn(),
    })

    const result = await transport.get('csm/master/example')

    expect(getServer).toHaveBeenCalledOnce()
    expect(getServer).toHaveBeenCalledWith('csm/master/example')
    expect(result).toBe(rawResponse)
  })

  it('delegates JSON POST with the original body', async () => {
    const body = { code: 'WAR001' }
    const postServerJson = vi.fn().mockResolvedValue({ ok: true })
    const transport = createLegacyXtoolsTransport({
      getServer: vi.fn(),
      postServerJson,
      postServerForm: vi.fn(),
    })

    await transport.postJson('csm/master/example', body)

    expect(postServerJson).toHaveBeenCalledOnce()
    expect(postServerJson).toHaveBeenCalledWith('csm/master/example', body)
  })

  it('delegates multipart POST with the original FormData', async () => {
    const body = new FormData()
    body.append('file', new Blob(['fixture']), 'fixture.txt')
    const postServerForm = vi.fn().mockResolvedValue({ ok: true })
    const transport = createLegacyXtoolsTransport({
      getServer: vi.fn(),
      postServerJson: vi.fn(),
      postServerForm,
    })

    await transport.postForm('csm/master/example', body)

    expect(postServerForm).toHaveBeenCalledOnce()
    expect(postServerForm).toHaveBeenCalledWith('csm/master/example', body)
  })

  it('propagates the original transport rejection', async () => {
    const transportError = new Error('network unavailable')
    const transport = createLegacyXtoolsTransport({
      getServer: vi.fn().mockRejectedValue(transportError),
      postServerJson: vi.fn(),
      postServerForm: vi.fn(),
    })

    await expect(transport.get('csm/master/example')).rejects.toBe(transportError)
  })

  it('works with an injected transport and no auth or storage globals', async () => {
    expect(globalThis.localStorage).toBeUndefined()
    const getServer = vi.fn().mockResolvedValue('raw')
    const transport = createLegacyXtoolsTransport({
      getServer,
      postServerJson: vi.fn(),
      postServerForm: vi.fn(),
    })

    await expect(transport.get('csm/master/example')).resolves.toBe('raw')
  })

  it('rejects an unavailable legacy transport at the boundary', () => {
    expect(() => createLegacyXtoolsTransport(undefined)).toThrow(TypeError)
  })
})
