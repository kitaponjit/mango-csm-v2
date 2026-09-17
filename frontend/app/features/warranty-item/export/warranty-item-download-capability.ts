export interface WarrantyItemDownloadWindow {
  location: { href: string }
  close(): void
}

export interface WarrantyItemDownloadCapability {
  reserve(): WarrantyItemDownloadWindow | null
  navigate(target: WarrantyItemDownloadWindow, token: string): void
  close(target: WarrantyItemDownloadWindow): void
}

interface WarrantyItemRuntimeWindow {
  dataServer?: unknown
  open?: (url?: string, target?: string) => WarrantyItemDownloadWindow | null
}

function readRuntimeWindow(): WarrantyItemRuntimeWindow | null {
  const value = (globalThis as typeof globalThis & { window?: unknown }).window
  return typeof value === 'object' && value !== null
    ? value as WarrantyItemRuntimeWindow
    : null
}

function buildDownloadUrl(dataServer: unknown, token: string): string {
  if (typeof dataServer !== 'string' || dataServer.trim() === '') {
    throw new TypeError('The trusted Warranty Item download base URL is unavailable.')
  }

  const base = dataServer.endsWith('/') ? dataServer : `${dataServer}/`
  const url = new URL('API/File/DownLoad', base)
  url.searchParams.set('download', 'true')
  url.searchParams.set('id', token)
  return url.toString()
}

export function createWarrantyItemDownloadCapability(): WarrantyItemDownloadCapability {
  return {
    reserve() {
      const runtimeWindow = readRuntimeWindow()
      if (!runtimeWindow || typeof runtimeWindow.open !== 'function') {
        return null
      }
      return runtimeWindow.open('', '_blank')
    },

    navigate(target, token) {
      const runtimeWindow = readRuntimeWindow()
      target.location.href = buildDownloadUrl(runtimeWindow?.dataServer, token)
    },

    close(target) {
      target.close()
    },
  }
}
