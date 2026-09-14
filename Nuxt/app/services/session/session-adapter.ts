export type AuthScope = 'internal' | 'customer' | 'local'
export type SessionStatus = 'authenticated' | 'anonymous' | 'invalid'

export interface SessionContext {
  scope: Extract<AuthScope, 'internal'>
  status: SessionStatus
  isAuthenticated: boolean
}

export interface SessionAdapter {
  getContext(): SessionContext
  establishSession(credential: string): boolean
  redirectToLogin(): void
}

export interface InternalCredentialProvider {
  getCredential(): string | null
  handleInvalidCredential(): void
}

interface StoragePort {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

interface NavigationPort {
  assign(path: string): void
}

interface InternalSessionOptions {
  storage: StoragePort
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

  const clearCredential = () => {
    try {
      options.storage.removeItem(credentialKey)
    }
    catch {
      // In-memory invalidation still prevents reuse when browser storage is unavailable.
    }
  }

  const session: SessionAdapter = {
    getContext() {
      const isAuthenticated = !invalid && readCredential() !== null

      return {
        scope: 'internal',
        status: invalid ? 'invalid' : isAuthenticated ? 'authenticated' : 'anonymous',
        isAuthenticated,
      }
    },
    establishSession(credential) {
      const normalized = credential.trim()
      if (!normalized) {
        return false
      }

      try {
        options.storage.setItem(credentialKey, normalized)
        invalid = false
        return true
      }
      catch {
        return false
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
      clearCredential()
      redirectToLogin()
    },
  }

  return { session, transport }
}
