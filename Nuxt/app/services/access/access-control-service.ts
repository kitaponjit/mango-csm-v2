import type { ApiClient, ApiError } from '~/services/http/api-client'

export type AccessControlResult =
  | { status: 'anonymous' }
  | { status: 'denied' }
  | { status: 'readonly' }
  | { status: 'editable' }
  | { status: 'error', error: ApiError }

export interface AccessControlService {
  checkMenuAccess(menuName: string, menuId: string): Promise<AccessControlResult>
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function invalid(message: string): AccessControlResult {
  return {
    status: 'error',
    error: { code: 'invalid-response', message },
  }
}

export function createAccessControlService(api: ApiClient): AccessControlService {
  return {
    async checkMenuAccess(menuName, menuId) {
      const path = 'api/public/ViewUserAuthentication'
        + `?menu_name=${encodeURIComponent(menuName)}`
        + '&lang_code='
        + `&menu_id=${encodeURIComponent(menuId)}`
      const result = await api.get<unknown>(path)

      if (!result.ok) {
        return result.error.code === 'unauthenticated'
          ? { status: 'anonymous' }
          : { status: 'error', error: result.error }
      }

      const data = record(result.data)
      const auth = record(data?.auth)
      const menuRight = data?.menu_right
      if (!data || !auth || typeof auth.is_authen !== 'boolean' || !Array.isArray(menuRight)) {
        return invalid('The server returned an invalid access response.')
      }
      if (!auth.is_authen) {
        return { status: 'anonymous' }
      }

      const rows: Record<string, unknown>[] = []
      for (const value of menuRight) {
        const row = record(value)
        if (!row) {
          return invalid('The server returned an invalid menu-right row.')
        }
        rows.push(row)
      }
      const exactRows = rows
        .filter(row => row.menu_name === menuName && row.menu_id === menuId)
      if (exactRows.length === 0) {
        return { status: 'denied' }
      }
      if (exactRows.length !== 1) {
        return invalid('The server returned duplicate menu rights.')
      }

      const row = exactRows[0]!
      if ((row.isenabled !== 0 && row.isenabled !== 1) || (row.isreadonly !== 0 && row.isreadonly !== 1)) {
        return invalid('The server returned invalid menu-right flags.')
      }
      if (row.isenabled === 0) {
        return { status: 'denied' }
      }
      return row.isreadonly === 1 ? { status: 'readonly' } : { status: 'editable' }
    },
  }
}
