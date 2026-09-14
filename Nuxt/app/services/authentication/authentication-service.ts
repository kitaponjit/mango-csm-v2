import type { SessionAdapter } from '~/services/session/session-adapter'

export interface LoginCredentials {
  maincode: string
  userid: string
  userpass: string
}

export type LoginResult =
  | { ok: true }
  | { ok: false, error: string }

export interface LoginCompany {
  maincode: string
  mainname: string
  defaultLogin: boolean
}

export type CompanyLookupResult =
  | { ok: true, data: LoginCompany[] }
  | { ok: false, error: string }

export interface AuthenticationService {
  login(credentials: LoginCredentials): Promise<LoginResult>
  listCompanies(): Promise<CompanyLookupResult>
}

interface FetchResponse {
  ok: boolean
  status: number
  json(): Promise<unknown>
}

type FetchPort = (
  url: string,
  options: {
    method: 'GET' | 'POST'
    headers?: Record<string, string>
    body?: string
  },
) => Promise<FetchResponse>

interface AuthenticationServiceOptions {
  baseUrl: string
  fetcher: FetchPort
  session: SessionAdapter
}

function joinUrl(baseUrl: string, path: string) {
  const base = baseUrl.replace(/\/+$/, '')
  const relativePath = path.replace(/^\/+/, '')
  return base ? `${base}/${relativePath}` : relativePath
}

export function createAuthenticationService(
  options: AuthenticationServiceOptions,
): AuthenticationService {
  return {
    async listCompanies() {
      let response: FetchResponse
      try {
        response = await options.fetcher(
          joinUrl(options.baseUrl, 'Api/Public/LoginCompanies'),
          { method: 'GET', headers: { Accept: 'application/json' } },
        )
      }
      catch {
        return { ok: false, error: 'The company list could not reach the server.' }
      }

      let payload: unknown
      try {
        payload = await response.json()
      }
      catch {
        return { ok: false, error: 'The company service returned an unreadable response.' }
      }

      const envelope = typeof payload === 'object' && payload !== null
        ? payload as Record<string, unknown>
        : null
      const serverError = envelope && typeof envelope.error === 'string'
        ? envelope.error.trim()
        : ''
      if (!response.ok || envelope?.success === false) {
        return {
          ok: false,
          error: serverError || `Company lookup failed with HTTP ${response.status}.`,
        }
      }

      const rows = Array.isArray(envelope?.data) ? envelope.data : []
      const companies = rows.flatMap((row): LoginCompany[] => {
        if (typeof row !== 'object' || row === null) return []
        const item = row as Record<string, unknown>
        const maincode = typeof item.maincode === 'string' ? item.maincode.trim() : ''
        const mainname = typeof item.mainname === 'string' ? item.mainname.trim() : ''
        if (!maincode || !mainname) return []

        const defaultValue = item.default_login
        return [{
          maincode,
          mainname,
          defaultLogin: defaultValue === true || defaultValue === 1 || defaultValue === 'Y',
        }]
      })

      return { ok: true, data: companies }
    },
    async login(credentials) {
      let response: FetchResponse
      try {
        response = await options.fetcher(
          joinUrl(options.baseUrl, 'Api/Public/Login?is_api=N&app_name=CSM'),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...credentials,
              platform: 'WEB',
              app_name: 'CSM',
            }),
          },
        )
      }
      catch {
        return { ok: false, error: 'The sign-in request could not reach the server.' }
      }

      let payload: unknown
      try {
        payload = await response.json()
      }
      catch {
        return { ok: false, error: 'The sign-in service returned an unreadable response.' }
      }

      const envelope = typeof payload === 'object' && payload !== null
        ? payload as Record<string, unknown>
        : null
      const serverError = envelope && typeof envelope.error === 'string'
        ? envelope.error.trim()
        : ''

      if (!response.ok || envelope?.success === false) {
        return {
          ok: false,
          error: serverError || `Sign-in failed with HTTP ${response.status}.`,
        }
      }

      const credential = envelope && typeof envelope.data === 'string'
        ? envelope.data
        : ''
      if (!options.session.establishSession(credential)) {
        return { ok: false, error: 'The browser could not save the authenticated session.' }
      }

      return { ok: true }
    },
  }
}
