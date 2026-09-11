export interface TargetRuntimeConfig {
  publicBasePath: string
  apiBaseUrl?: string
  fileHost?: string
  loginPath: string
}

export function useTargetRuntimeConfig(): TargetRuntimeConfig {
  const config = useRuntimeConfig()

  return {
    publicBasePath: config.app.baseURL,
    apiBaseUrl: config.public.apiBaseUrl || undefined,
    fileHost: config.public.fileHost || undefined,
    loginPath: config.public.loginPath,
  }
}
