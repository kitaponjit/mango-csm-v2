export interface WarrantyItemTransport {
  get(path: string): Promise<unknown>
  postJson(path: string, body: unknown): Promise<unknown>
  postForm(path: string, body: FormData): Promise<unknown>
}

interface LegacyXtools {
  getServer(path: string): Promise<unknown>
  postServerJson(path: string, body: unknown): Promise<unknown>
  postServerForm(path: string, body: FormData): Promise<unknown>
}

function readGlobalXtools(): unknown {
  return (globalThis as typeof globalThis & { $xt?: unknown }).$xt
}

function isLegacyXtools(value: unknown): value is LegacyXtools {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return typeof candidate.getServer === 'function'
    && typeof candidate.postServerJson === 'function'
    && typeof candidate.postServerForm === 'function'
}

export function createLegacyXtoolsTransport(source: unknown = readGlobalXtools()): WarrantyItemTransport {
  if (!isLegacyXtools(source)) {
    throw new TypeError('The legacy $xt transport is unavailable or invalid.')
  }

  return {
    get: path => source.getServer(path),
    postJson: (path, body) => source.postServerJson(path, body),
    postForm: (path, body) => source.postServerForm(path, body),
  }
}
