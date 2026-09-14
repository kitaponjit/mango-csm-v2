import { describe, expect, it, vi } from 'vitest'
import { createAuthenticationService } from '../../app/services/authentication/authentication-service'

function createSession() {
  return {
    getContext: vi.fn(),
    establishSession: vi.fn(() => true),
    redirectToLogin: vi.fn(),
  }
}

describe('createAuthenticationService', () => {
  it('loads only company codes and names from the public company endpoint', async () => {
    const session = createSession()
    const fetcher = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          {
            maincode: 'MG1',
            mainname: 'Mango Demo',
            maintaxid: 'not-exposed-to-the-page',
            default_login: 'Y',
          },
          { maincode: '', mainname: 'Invalid row' },
        ],
      }),
    }))
    const service = createAuthenticationService({
      baseUrl: 'http://localhost:5075/',
      fetcher,
      session,
    })

    const result = await service.listCompanies()

    expect(result).toEqual({
      ok: true,
      data: [{ maincode: 'MG1', mainname: 'Mango Demo', defaultLogin: true }],
    })
    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:5075/Api/Public/LoginCompanies',
      { method: 'GET', headers: { Accept: 'application/json' } },
    )
  })

  it('stores a successful backend credential without returning it to the page', async () => {
    const session = createSession()
    const fetcher = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: true, error: null, data: 'issued-token' }),
    }))
    const service = createAuthenticationService({
      baseUrl: 'http://localhost:5075/',
      fetcher,
      session,
    })

    const result = await service.login({
      maincode: 'DEMO',
      userid: 'tester',
      userpass: 'not-a-real-password',
    })

    expect(result).toEqual({ ok: true })
    expect(result).not.toHaveProperty('data')
    expect(session.establishSession).toHaveBeenCalledWith('issued-token')
    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:5075/Api/Public/Login?is_api=N&app_name=CSM',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('surfaces a safe backend configuration error without creating a session', async () => {
    const session = createSession()
    const fetcher = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({
        success: false,
        error: 'Authentication database is not configured.',
        data: '',
      }),
    }))
    const service = createAuthenticationService({
      baseUrl: 'http://localhost:5075',
      fetcher,
      session,
    })

    const result = await service.login({ maincode: 'DEMO', userid: 'tester', userpass: 'x' })

    expect(result).toEqual({ ok: false, error: 'Authentication database is not configured.' })
    expect(session.establishSession).not.toHaveBeenCalled()
  })
})
