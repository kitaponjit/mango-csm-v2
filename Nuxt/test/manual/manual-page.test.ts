import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ManualPage from '../../app/pages/manual/index.vue'

const apiGet = vi.fn()
const redirectToLogin = vi.fn()
const getContext = vi.fn()

const translations: Record<string, string> = {
  'manual.authChecking': 'Checking your session',
  'manual.authRequired': 'Sign-in required',
  'manual.authUnavailable': 'The sign-in page is currently unavailable.',
}

beforeEach(() => {
  apiGet.mockReset()
  redirectToLogin.mockReset()
  getContext.mockReset()

  vi.stubGlobal('useApiClient', () => ({ get: apiGet }))
  vi.stubGlobal('useFileCapability', () => ({ openUrl: vi.fn() }))
  vi.stubGlobal('useLocalizationAdapter', () => ({
    language: 'en',
    t: (key: string) => translations[key] ?? key,
  }))
  vi.stubGlobal('useSessionAdapter', () => ({ getContext, redirectToLogin }))
  vi.stubGlobal('useHead', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('manual page access', () => {
  it('sends anonymous users to the configured login route without calling the protected API', async () => {
    getContext.mockReturnValue({
      scope: 'internal',
      status: 'anonymous',
      isAuthenticated: false,
    })

    const wrapper = mount(ManualPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Sign-in required')
    expect(wrapper.text()).toContain('The sign-in page is currently unavailable.')
    expect(wrapper.find('.target-state--error').exists()).toBe(true)
    expect(redirectToLogin).toHaveBeenCalledOnce()
    expect(apiGet).not.toHaveBeenCalled()
  })

  it('continues loading the manual list for an authenticated session', async () => {
    getContext.mockReturnValue({
      scope: 'internal',
      status: 'authenticated',
      isAuthenticated: true,
    })
    apiGet.mockResolvedValue({
      ok: true,
      status: 200,
      data: { data: [], total: [] },
    })

    mount(ManualPage)
    await flushPromises()

    expect(apiGet).toHaveBeenCalledOnce()
    expect(redirectToLogin).not.toHaveBeenCalled()
  })
})
