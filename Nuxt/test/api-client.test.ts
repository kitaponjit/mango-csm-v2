import { describe, expect, it, vi } from 'vitest'
import { createApiClient } from '../app/services/http/api-client'

function jsonResponse(body: unknown, status = 200, responseHeaders: Record<string, string> = {}) {
  const values = new Map(Object.entries(responseHeaders).map(([name, value]) => [name.toLowerCase(), value]))

  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name: string) => values.get(name.toLowerCase()) ?? null },
    json: vi.fn().mockResolvedValue(body),
  }
}

describe('createApiClient', () => {
  it('adds the internal credential header inside the transport boundary', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: { id: 7 } }))
    const client = createApiClient({
      baseUrl: 'https://api.example.test/service/',
      fetcher,
      credentialProvider: { getCredential: () => 'secret-token' },
      onMissingCredential: vi.fn(),
      onInvalidCredential: vi.fn(),
    })

    const result = await client.get<{ id: number }>('CSM/Manual/ManualReadList')

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.example.test/service/CSM/Manual/ManualReadList',
      { method: 'GET', headers: { 'X-Mango-Auth': 'secret-token' } },
    )
    expect(result).toEqual({ ok: true, data: { id: 7 }, status: 200 })
  })

  it('sends an authenticated JSON POST body', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ success: true }))
    const client = createApiClient({
      baseUrl: '/service/',
      fetcher,
      credentialProvider: { getCredential: () => 'token' },
      onMissingCredential: vi.fn(),
      onInvalidCredential: vi.fn(),
    })

    await client.post('CSM/Master/QCItem_Create', { item: [{ itemno: 1 }] })

    expect(fetcher).toHaveBeenCalledWith(
      '/service/CSM/Master/QCItem_Create',
      {
        method: 'POST',
        headers: {
          'X-Mango-Auth': 'token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item: [{ itemno: 1 }] }),
      },
    )
  })

  it('sends FormData without overriding its multipart boundary header', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: true }))
    const client = createApiClient({
      baseUrl: '/service/',
      fetcher,
      credentialProvider: { getCredential: () => 'token' },
      onMissingCredential: vi.fn(),
      onInvalidCredential: vi.fn(),
    })
    const form = new FormData()
    form.append('file', new File(['itemno,itemname,remark'], 'QCItem.xlsx'))

    await client.postForm('CSM/Master/QCItem_Import', form)

    expect(fetcher).toHaveBeenCalledWith(
      '/service/CSM/Master/QCItem_Import',
      { method: 'POST', headers: { 'X-Mango-Auth': 'token' }, body: form },
    )
  })

  it('returns an unauthenticated result without making a request when the credential is missing', async () => {
    const fetcher = vi.fn()
    const onMissingCredential = vi.fn()
    const client = createApiClient({
      baseUrl: 'https://api.example.test/service/',
      fetcher,
      credentialProvider: { getCredential: () => null },
      onMissingCredential,
      onInvalidCredential: vi.fn(),
    })

    const result = await client.get('CSM/Manual/ManualReadList')

    expect(result).toEqual({
      ok: false,
      error: { code: 'unauthenticated', message: 'Internal authentication is required.' },
    })
    expect(onMissingCredential).toHaveBeenCalledOnce()
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('preserves successful sibling payload fields while removing legacy envelope flags', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({
      success: true,
      error: '',
      data: [{ revision: 'R1' }],
      total: [{ module: 'GL', total: 1 }],
    }))
    const client = createApiClient({
      baseUrl: '/service/',
      fetcher,
      credentialProvider: { getCredential: () => 'token' },
      onMissingCredential: vi.fn(),
      onInvalidCredential: vi.fn(),
    })

    const result = await client.get('CSM/Manual/ManualReadList')

    expect(result).toEqual({
      ok: true,
      status: 200,
      data: {
        data: [{ revision: 'R1' }],
        total: [{ module: 'GL', total: 1 }],
      },
    })
  })

  it('normalizes an API-declared legacy error', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ success: false, error: 'No access' }))
    const client = createApiClient({
      baseUrl: '/service/',
      fetcher,
      credentialProvider: { getCredential: () => 'token' },
      onMissingCredential: vi.fn(),
      onInvalidCredential: vi.fn(),
    })

    const result = await client.get('CSM/Manual/ManualReadList')

    expect(result).toEqual({
      ok: false,
      error: { code: 'api', message: 'No access', status: 200 },
    })
  })

  it('invalidates a 401 response without treating a permission-denied 403 as an expired session', async () => {
    const onInvalidCredential = vi.fn()
    const fetcher = vi.fn()
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({}, 403))
    const client = createApiClient({
      baseUrl: '/service/',
      fetcher,
      credentialProvider: { getCredential: () => 'expired' },
      onMissingCredential: vi.fn(),
      onInvalidCredential,
    })

    expect(await client.get('first')).toEqual({
      ok: false,
      error: { code: 'unauthenticated', message: 'The internal session is invalid or expired.', status: 401 },
    })
    expect(await client.get('second')).toEqual({
      ok: false,
      error: { code: 'forbidden', message: 'The request is not permitted.', status: 403 },
    })
    expect(onInvalidCredential).toHaveBeenCalledOnce()
  })

  it('invalidates a 403 response when the backend marks it as an authentication failure', async () => {
    const onInvalidCredential = vi.fn()
    const client = createApiClient({
      baseUrl: '/service/',
      fetcher: vi.fn().mockResolvedValue(jsonResponse({}, 403, { 'X-MG-Auth-Error': 'MG_TIME' })),
      credentialProvider: { getCredential: () => 'expired' },
      onMissingCredential: vi.fn(),
      onInvalidCredential,
    })

    expect(await client.get('protected')).toEqual({
      ok: false,
      error: { code: 'unauthenticated', message: 'The internal session is invalid or expired.', status: 403 },
    })
    expect(onInvalidCredential).toHaveBeenCalledOnce()
  })

  it.each(['expired', 'revoked', 'malformed'])(
    'normalizes a %s credential rejection through the same safe 401 boundary',
    async credentialState => {
      const onInvalidCredential = vi.fn()
      const client = createApiClient({
        baseUrl: '/service/',
        fetcher: vi.fn().mockResolvedValue(jsonResponse({}, 401)),
        credentialProvider: { getCredential: () => `${credentialState}-candidate` },
        onMissingCredential: vi.fn(),
        onInvalidCredential,
      })

      expect(await client.get('CSM/Manual/ManualReadList')).toEqual({
        ok: false,
        error: { code: 'unauthenticated', message: 'The internal session is invalid or expired.', status: 401 },
      })
      expect(onInvalidCredential).toHaveBeenCalledOnce()
    },
  )

  it('normalizes malformed JSON and network failures', async () => {
    const invalidJson = { ok: true, status: 200, json: vi.fn().mockRejectedValue(new Error('bad json')) }
    const fetcher = vi.fn()
      .mockResolvedValueOnce(invalidJson)
      .mockRejectedValueOnce(new Error('offline'))
    const client = createApiClient({
      baseUrl: '/service/',
      fetcher,
      credentialProvider: { getCredential: () => 'token' },
      onMissingCredential: vi.fn(),
      onInvalidCredential: vi.fn(),
    })

    expect(await client.get('invalid')).toEqual({
      ok: false,
      error: { code: 'invalid-response', message: 'The server returned an unreadable response.', status: 200 },
    })
    expect(await client.get('offline')).toEqual({
      ok: false,
      error: { code: 'network', message: 'The request could not reach the server.' },
    })
  })
})
