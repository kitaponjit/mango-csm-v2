export type AuthScope = 'internal' | 'customer' | 'local'
export type SessionStatus = 'authenticated' | 'anonymous' | 'invalid'

export interface SessionContext {
  scope: Extract<AuthScope, 'internal'>
  status: SessionStatus
  isAuthenticated: boolean
}

export interface SessionAdapter {
  getContext(): SessionContext
  redirectToLogin(): void
}

export interface InternalCredentialProvider {
  getCredential(): string | null
  handleInvalidCredential(): void
}

interface StorageReader {
  getItem(key: string): string | null
}

interface NavigationPort {
  assign(path: string): void
}

interface InternalSessionOptions {
  storage: StorageReader
  navigation: NavigationPort
  loginPath: string
}

export interface InternalSessionFoundation {
  session: SessionAdapter
  transport: InternalCredentialProvider
}

export function createInternalSessionAdapter(
  options: InternalSessionOptions,
): InternalSessionFoundation {
  const credentialKey = 'mango_auth'
  let invalid = false

  const readCredential = () => {
    try {
      const credential = options.storage.getItem(credentialKey)
      return credential?.trim() ? credential : null
    }
    catch {
      return null
    }
  }

  const redirectToLogin = () => options.navigation.assign(options.loginPath)

  const session: SessionAdapter = {
    getContext() {
      const isAuthenticated = !invalid && readCredential() !== null

      return {
        scope: 'internal',
        status: invalid ? 'invalid' : isAuthenticated ? 'authenticated' : 'anonymous',
        isAuthenticated,
      }
    },
    redirectToLogin,
  }

  const transport: InternalCredentialProvider = {
    getCredential() {
      return invalid ? null : readCredential()
    },
    handleInvalidCredential() {
      invalid = true
      redirectToLogin()
    },
  }

  return { session, transport }
}
