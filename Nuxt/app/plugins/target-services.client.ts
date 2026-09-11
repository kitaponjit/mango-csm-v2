import { createFileCapability } from '~/services/files/file-capability'
import { createApiClient } from '~/services/http/api-client'
import { createInternalSessionAdapter } from '~/services/session/session-adapter'

export default defineNuxtPlugin(() => {
  const runtime = useTargetRuntimeConfig()
  const { session, transport } = createInternalSessionAdapter({
    storage: window.localStorage,
    navigation: { assign: path => window.location.assign(path) },
    loginPath: runtime.loginPath,
  })
  const apiClient = createApiClient({
    baseUrl: runtime.apiBaseUrl || '',
    fetcher: (url, options) => window.fetch(url, options),
    credentialProvider: transport,
    onMissingCredential: () => session.redirectToLogin(),
    onInvalidCredential: () => transport.handleInvalidCredential(),
  })
  const fileCapability = createFileCapability(runtime)

  return {
    provide: {
      sessionAdapter: session,
      apiClient,
      fileCapability,
    },
  }
})
