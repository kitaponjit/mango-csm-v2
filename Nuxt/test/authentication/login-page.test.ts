import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from '../../app/pages/authentication/login.vue'

const login = vi.fn()
const listCompanies = vi.fn()
const replace = vi.fn()
const translations: Record<string, string> = {
  'auth.title': 'Sign in',
  'auth.description': 'Use your Mango account.',
  'auth.formTitle': 'Account details',
  'auth.company': 'Company',
  'auth.companyLoading': 'Loading companies...',
  'auth.companySelect': 'Select a company',
  'auth.companyLoadFailed': 'Could not load companies.',
  'auth.companyRetry': 'Try again',
  'auth.user': 'User name',
  'auth.password': 'Password',
  'auth.submit': 'Sign in',
  'auth.submitting': 'Signing in...',
  'auth.failed': 'Unable to sign in',
  'auth.required': 'Enter company code, user name, and password.',
}

beforeEach(() => {
  login.mockReset()
  listCompanies.mockReset()
  listCompanies.mockResolvedValue({
    ok: true,
    data: [
      { maincode: 'MG1', mainname: 'Mango Demo', defaultLogin: true },
      { maincode: 'MG2', mainname: 'Mango Second', defaultLogin: false },
    ],
  })
  replace.mockReset()
  vi.stubGlobal('useAuthenticationService', () => ({ login, listCompanies }))
  vi.stubGlobal('useLocalizationAdapter', () => ({
    language: 'en',
    t: (key: string) => translations[key] ?? key,
  }))
  vi.stubGlobal('useRouter', () => ({ replace }))
  vi.stubGlobal('useHead', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('authentication login page', () => {
  it('queries and renders company names from the backend', async () => {
    const wrapper = mount(LoginPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Sign in')
    expect(listCompanies).toHaveBeenCalledOnce()
    expect(wrapper.findAll('option')).toHaveLength(3)
    expect(wrapper.text()).toContain('Mango Demo (MG1)')
    expect(wrapper.get('select').element.value).toBe('MG1')
    expect(wrapper.findAll('input')).toHaveLength(2)
    expect(wrapper.get('input[type="password"]').attributes('autocomplete')).toBe('current-password')
  })

  it('signs in and returns to the protected manual page', async () => {
    login.mockResolvedValue({ ok: true })
    const wrapper = mount(LoginPage)
    await flushPromises()

    const inputs = wrapper.findAll('input')
    await wrapper.get('select').setValue('MG2')
    await inputs[0].setValue('tester')
    await inputs[1].setValue('not-a-real-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(login).toHaveBeenCalledWith({
      maincode: 'MG2',
      userid: 'tester',
      userpass: 'not-a-real-password',
    })
    expect(replace).toHaveBeenCalledWith('/manual')
  })
})
