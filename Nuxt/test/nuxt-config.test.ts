import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

async function loadConfig(environment: 'development' | 'production') {
  vi.stubEnv('NODE_ENV', environment)
  vi.stubGlobal('defineNuxtConfig', (config: unknown) => config)
  vi.resetModules()

  return (await import('../nuxt.config')).default
}

describe('Nuxt authentication routes', () => {
  it('redirects the legacy login URL to the local fallback during development', async () => {
    const config = await loadConfig('development')

    expect(config.runtimeConfig?.public?.loginPath).toBe('/csm-next/authentication/login/')
    expect(config.routeRules).toMatchObject({
      '/page/authentication/login': { redirect: '/csm-next/authentication/login/' },
      '/page/authentication/login/**': { redirect: '/csm-next/authentication/login/' },
    })
  })

  it('preserves backend ownership of the legacy login URL in production', async () => {
    const config = await loadConfig('production')

    expect(config.runtimeConfig?.public?.loginPath).toBe('/page/authentication/login/')
    expect(config.routeRules).toEqual({})
  })
})
