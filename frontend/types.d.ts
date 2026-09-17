/*
 * Ambient types for the globals the legacy host contract provides.
 *
 * The vendor scripts in public/vendor declare these with `const`/`let`, which
 * land in the global *lexical* environment; public/globals-bridge.js then
 * promotes them onto `window` (see that file for why both are needed). Nothing
 * generates types for them, so this declares only the members TypeScript code
 * in this app actually touches rather than pretending to describe the whole
 * vendor surface.
 */

interface MangoServerEnvelope {
  success?: boolean
  error?: string
  data?: Record<string, unknown>
}

declare global {
  /** Vendor HTTP helper. Attaches the X-Mango-Auth header and the dataServer base. */
  const $xt: {
    getServer: (action: string) => Promise<MangoServerEnvelope>
    postServerJson: (action: string, body: unknown) => Promise<MangoServerEnvelope>
    postServerForm: (action: string, body: unknown) => Promise<MangoServerEnvelope>
    formatDate: (value: unknown, format?: string) => string
    formatNumber: (value: unknown, decimals?: number) => string
    isEmpty: (value: unknown) => boolean
  }

  /** Modal alert/confirm helper (jquery-confirm), from Service/alert-service.js. */
  const $msg: {
    alert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'danger') => Promise<boolean>
    confirm: (text: string) => Promise<boolean>
    prompt: (text: string) => Promise<string | null>
  }

  /** Toast helper (toastr). */
  const $notify: {
    success: (message: string) => void
    info: (message: string) => void
    warning: (message: string) => void
    error: (message: string) => void
  }

  interface Window {
    /** Origin + '/' — set by public/config.js. Vendor asset URLs build on it. */
    baseUrl?: string
    /** Same value; xtools.js reads the capitalised spelling. */
    baseURL?: string
    /** Backend origin INCLUDING its path base, e.g. 'http://localhost:5075/service/'. */
    dataServer?: string
    /** UI translation dictionary, filled by the auth middleware from the backend. */
    ui?: Record<string, string>
    /** Session/user info, filled by the auth middleware. */
    auth?: Record<string, unknown>
    baseCompany?: string
  }
}

export {}
