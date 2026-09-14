import { describe, expect, it, vi } from 'vitest'
import { createInternalSessionAdapter } from '../app/services/session/session-adapter'

function createStorage(value: string | null) {
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  }
}

describe('createInternalSessionAdapter', () => {
  it('reports an authenticated internal session without exposing the credential', () => {
    const storage = createStorage('secret-token')
    const navigation = { assign: vi.fn() }
    const { session, transport } = createInternalSessionAdapter({
      storage,
      navigation,
      loginPath: '/page/authentication/login/',
    })

    expect(session.getContext()).toEqual({
      scope: 'internal',
      status: 'authenticated',
      isAuthenticated: true,
    })
    expect(session.getContext()).not.toHaveProperty('credential')
    expect(transport.getCredential()).toBe('secret-token')
    expect(storage.getItem).toHaveBeenCalledWith('mango_auth')
  })

  it('reports an anonymous session when the internal credential is absent', () => {
    const { session, transport } = createInternalSessionAdapter({
      storage: createStorage(null),
      navigation: { assign: vi.fn() },
      loginPath: '/page/authentication/login/',
    })

    expect(session.getContext()).toEqual({
      scope: 'internal',
      status: 'anonymous',
      isAuthenticated: false,
    })
    expect(transport.getCredential()).toBeNull()
  })

  it('redirects to the configured legacy login route', () => {
    const navigation = { assign: vi.fn() }
    const { session } = createInternalSessionAdapter({
      storage: createStorage(null),
      navigation,
      loginPath: '/page/authentication/login/',
    })

    session.redirectToLogin()

    expect(navigation.assign).toHaveBeenCalledWith('/page/authentication/login/')
  })

  it('marks an invalid credential, clears rejected storage, and redirects', () => {
    const storage = createStorage('expired-token')
    const navigation = { assign: vi.fn() }
    const { session, transport } = createInternalSessionAdapter({
      storage,
      navigation,
      loginPath: '/page/authentication/login/',
    })

    transport.handleInvalidCredential()

    expect(session.getContext()).toEqual({
      scope: 'internal',
      status: 'invalid',
      isAuthenticated: false,
    })
    expect(navigation.assign).toHaveBeenCalledWith('/page/authentication/login/')
    expect(storage.removeItem).toHaveBeenCalledWith('mango_auth')
    expect(transport.getCredential()).toBeNull()
  })

  it('keeps the session invalid and redirects when browser storage cleanup fails', () => {
    const navigation = { assign: vi.fn() }
    const storage = {
      getItem: vi.fn(() => 'rejected-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(() => { throw new Error('storage unavailable') }),
    }
    const { session, transport } = createInternalSessionAdapter({
      storage,
      navigation,
      loginPath: '/page/authentication/login/',
    })

    transport.handleInvalidCredential()

    expect(session.getContext().status).toBe('invalid')
    expect(transport.getCredential()).toBeNull()
    expect(navigation.assign).toHaveBeenCalledWith('/page/authentication/login/')
  })

  it('establishes a session without exposing the credential in page context', () => {
    let value: string | null = null
    const storage = {
      getItem: vi.fn(() => value),
      setItem: vi.fn((_key: string, credential: string) => { value = credential }),
      removeItem: vi.fn(),
    }
    const { session, transport } = createInternalSessionAdapter({
      storage,
      navigation: { assign: vi.fn() },
      loginPath: '/page/authentication/login/',
    })

    expect(session.establishSession(' new-token ')).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith('mango_auth', 'new-token')
    expect(session.getContext()).toEqual({
      scope: 'internal',
      status: 'authenticated',
      isAuthenticated: true,
    })
    expect(session.getContext()).not.toHaveProperty('credential')
    expect(transport.getCredential()).toBe('new-token')
  })
})
