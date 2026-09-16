export type ApiErrorCode =
  | 'unauthenticated'
  | 'forbidden'
  | 'api'
  | 'http'
  | 'invalid-response'
  | 'network'

export interface ApiError {
  code: ApiErrorCode
  message: string
  status?: number
}

export type ApiResult<T> =
  | { ok: true, data: T, status: number }
  | { ok: false, error: ApiError }

export interface ApiClient {
  get<T>(path: string): Promise<ApiResult<T>>
  post<T>(path: string, body: unknown): Promise<ApiResult<T>>
  postForm<T>(path: string, body: FormData): Promise<ApiResult<T>>
}

interface CredentialProvider {
  getCredential(): string | null
}

interface FetchResponse {
  ok: boolean
  status: number
  headers?: {
    get(name: string): string | null
  }
  json(): Promise<unknown>
}

interface FetchRequestOptions {
  method: 'GET' | 'POST'
  headers: Record<string, string>
  body?: string | FormData
}

type FetchPort = (
  url: string,
  options: FetchRequestOptions,
) => Promise<FetchResponse>

interface ApiClientOptions {
  baseUrl: string
  fetcher: FetchPort
  credentialProvider: CredentialProvider
  onMissingCredential(): void
  onInvalidCredential(): void
}

function joinUrl(baseUrl: string, path: string) {
  const base = baseUrl.replace(/\/+$/, '')
  const relativePath = path.replace(/^\/+/, '')
  return base ? `${base}/${relativePath}` : relativePath
}

function apiFailure(code: ApiErrorCode, message: string, status?: number): ApiResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(status === undefined ? {} : { status }),
    },
  }
}

function normalizePayload<T>(payload: unknown, status: number): ApiResult<T> {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return { ok: true, data: payload as T, status }
  }

  const envelope = payload as Record<string, unknown>
  if (envelope.success === false) {
    const message = typeof envelope.error === 'string' && envelope.error
      ? envelope.error
      : 'The server rejected the request.'
    return apiFailure('api', message, status)
  }

  if (envelope.success !== true) {
    return { ok: true, data: payload as T, status }
  }

  const normalized = Object.fromEntries(
    Object.entries(envelope).filter(([key]) => key !== 'success' && key !== 'error'),
  )
  const keys = Object.keys(normalized)
  const data = keys.length === 1 && keys[0] === 'data' ? normalized.data : normalized

  return { ok: true, data: data as T, status }
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  async function request<T>(path: string, requestOptions: FetchRequestOptions): Promise<ApiResult<T>> {
    const credential = options.credentialProvider.getCredential()
    if (!credential) {
      options.onMissingCredential()
      return apiFailure('unauthenticated', 'Internal authentication is required.')
    }

    let response: FetchResponse
    try {
      response = await options.fetcher(joinUrl(options.baseUrl, path), {
        ...requestOptions,
        headers: {
          'X-Mango-Auth': credential,
          ...requestOptions.headers,
        },
      })
    }
    catch {
      return apiFailure('network', 'The request could not reach the server.')
    }

    if (response.status === 401) {
      options.onInvalidCredential()
      return apiFailure(
        'unauthenticated',
        'The internal session is invalid or expired.',
        response.status,
      )
    }

    if (response.status === 403 && response.headers?.get('X-MG-Auth-Error')?.trim()) {
      options.onInvalidCredential()
      return apiFailure(
        'unauthenticated',
        'The internal session is invalid or expired.',
        response.status,
      )
    }

    if (response.status === 403) {
      return apiFailure('forbidden', 'The request is not permitted.', response.status)
    }

    let payload: unknown
    try {
      payload = await response.json()
    }
    catch {
      return apiFailure(
        'invalid-response',
        'The server returned an unreadable response.',
        response.status,
      )
    }

    if (!response.ok) {
      const envelope = payload as Record<string, unknown> | null
      const message = envelope && typeof envelope.error === 'string' && envelope.error
        ? envelope.error
        : `The server returned HTTP ${response.status}.`
      return apiFailure('http', message, response.status)
    }

    return normalizePayload<T>(payload, response.status)
  }

  return {
    get<T>(path: string) {
      return request<T>(path, { method: 'GET', headers: {} })
    },
    post<T>(path: string, body: unknown) {
      return request<T>(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    },
    postForm<T>(path: string, body: FormData) {
      return request<T>(path, { method: 'POST', headers: {}, body })
    },
  }
}
