export interface FileOpenOptions {
  download?: boolean
}

export interface FileCapability {
  openUrl(id: string, options?: FileOpenOptions): string
}

interface FileCapabilityOptions {
  apiBaseUrl?: string
  fileHost?: string
}

export function createFileCapability(options: FileCapabilityOptions): FileCapability {
  const baseUrl = (options.fileHost || options.apiBaseUrl || '').replace(/\/+$/, '')

  return {
    openUrl(id, openOptions = {}) {
      const query = openOptions.download ? 'download=true&' : ''
      const path = `Api/File/DownLoad?${query}id=${encodeURIComponent(id)}`
      return baseUrl ? `${baseUrl}/${path}` : path
    },
  }
}
