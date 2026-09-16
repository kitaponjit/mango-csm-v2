import { describe, expect, it, vi } from 'vitest'
import type { ApiClient, ApiError } from '../../app/services/http/api-client'
import { createAccessControlService } from '../../app/services/access/access-control-service'

function apiWith(result: unknown) {
  return {
    get: vi.fn().mockResolvedValue(result),
    post: vi.fn(),
    postForm: vi.fn(),
  } as unknown as ApiClient
}

function payload(menuRight: unknown, isAuthenticated: unknown = true) {
  return {
    ok: true as const,
    status: 200,
    data: {
      auth: { is_authen: isAuthenticated },
      menu_right: menuRight,
    },
  }
}

const editableRow = { menu_name: 'CSM_WEB', menu_id: '21010', isenabled: 1, isreadonly: 0 }

describe('createAccessControlService', () => {
  it('encodes the menu identity and returns editable for one enabled editable row', async () => {
    const api = apiWith(payload([
      { menu_name: 'CSM WEB', menu_id: '21/010', isenabled: 1, isreadonly: 0 },
    ]))
    const access = createAccessControlService(api)

    await expect(access.checkMenuAccess('CSM WEB', '21/010'))
      .resolves.toEqual({ status: 'editable' })
    expect(api.get).toHaveBeenCalledWith(
      'api/public/ViewUserAuthentication?menu_name=CSM%20WEB&lang_code=&menu_id=21%2F010',
    )
  })

  it.each([
    { menu_name: 'CSM_WEB', menu_id: '21010', isenabled: 0, isreadonly: 0 },
    { menu_name: 'CSM_WEB', menu_id: '99999', isenabled: 1, isreadonly: 0 },
    { menu_name: 'OTHER', menu_id: '21010', isenabled: 1, isreadonly: 0 },
    { menu_name: 'CSM_WEB', menu_id: 21010, isenabled: 1, isreadonly: 0 },
    { menu_name: 'csm_web', menu_id: '21010', isenabled: 1, isreadonly: 0 },
  ])('denies when no single enabled exact row exists: %j', async row => {
    const access = createAccessControlService(apiWith(payload([row])))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toEqual({ status: 'denied' })
  })

  it('denies an empty menu-right list', async () => {
    const access = createAccessControlService(apiWith(payload([])))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toEqual({ status: 'denied' })
  })

  it('returns readonly for one enabled read-only row', async () => {
    const access = createAccessControlService(apiWith(payload([
      { ...editableRow, isreadonly: 1 },
    ])))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toEqual({ status: 'readonly' })
  })

  it('selects the exact row among unrelated menu rights', async () => {
    const access = createAccessControlService(apiWith(payload([
      { ...editableRow, menu_name: 'OTHER', isreadonly: 1 },
      editableRow,
      { ...editableRow, menu_id: '99999', isenabled: 0 },
    ])))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toEqual({ status: 'editable' })
  })

  it.each([
    { name: 'conflicting readonly flags', rows: [editableRow, { ...editableRow, isreadonly: 1 }] },
    { name: 'identical rows', rows: [editableRow, { ...editableRow }] },
    { name: 'conflicting enabled flags', rows: [editableRow, { ...editableRow, isenabled: 0 }] },
  ])('fails closed for duplicate exact rows: $name', async ({ rows }) => {
    const access = createAccessControlService(apiWith(payload(rows)))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toMatchObject({ status: 'error', error: { code: 'invalid-response' } })
  })

  it('maps unauthenticated transport failure to anonymous', async () => {
    const access = createAccessControlService(apiWith({
      ok: false,
      error: { code: 'unauthenticated', message: 'Expired', status: 401 },
    }))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toEqual({ status: 'anonymous' })
  })

  it('maps auth=false to anonymous', async () => {
    const access = createAccessControlService(apiWith(payload([], false)))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toEqual({ status: 'anonymous' })
  })

  it.each<ApiError>([
    { code: 'network', message: 'Offline' },
    { code: 'forbidden', message: 'Forbidden', status: 403 },
    { code: 'api', message: 'Rejected' },
    { code: 'http', message: 'Unavailable', status: 503 },
    { code: 'invalid-response', message: 'Unreadable' },
  ])('preserves non-authentication API failures: $code', async error => {
    const access = createAccessControlService(apiWith({ ok: false, error }))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toEqual({ status: 'error', error })
  })

  it.each([
    { name: 'null data', data: null },
    { name: 'array data', data: [] },
    { name: 'string data', data: 'invalid' },
    { name: 'missing auth', data: { menu_right: [] } },
    { name: 'null auth', data: { auth: null, menu_right: [] } },
    { name: 'array auth', data: { auth: [], menu_right: [] } },
    { name: 'string auth', data: { auth: 'true', menu_right: [] } },
    { name: 'missing auth flag', data: { auth: {}, menu_right: [] } },
    { name: 'numeric auth flag', data: { auth: { is_authen: 1 }, menu_right: [] } },
    { name: 'string auth flag', data: { auth: { is_authen: 'true' }, menu_right: [] } },
    { name: 'missing menu rights', data: { auth: { is_authen: true } } },
    { name: 'null menu rights', data: { auth: { is_authen: true }, menu_right: null } },
    { name: 'object menu rights', data: { auth: { is_authen: true }, menu_right: {} } },
    { name: 'string menu rights', data: { auth: { is_authen: true }, menu_right: 'invalid' } },
    { name: 'malformed anonymous response', data: { auth: { is_authen: false } } },
  ])('fails closed for malformed response data: $name', async ({ data }) => {
    const access = createAccessControlService(apiWith({ ok: true, status: 200, data }))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toMatchObject({ status: 'error', error: { code: 'invalid-response' } })
  })

  it.each([
    { name: 'null', row: null },
    { name: 'array', row: [] },
    { name: 'string', row: 'invalid' },
    { name: 'number', row: 1 },
  ])('fails closed for malformed menu-right row: $name', async ({ row }) => {
    const access = createAccessControlService(apiWith(payload([editableRow, row])))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toMatchObject({ status: 'error', error: { code: 'invalid-response' } })
  })

  it.each([
    { ...editableRow, isenabled: undefined },
    { ...editableRow, isenabled: null },
    { ...editableRow, isenabled: true },
    { ...editableRow, isenabled: '1' },
    { ...editableRow, isenabled: 2 },
    { ...editableRow, isreadonly: undefined },
    { ...editableRow, isreadonly: null },
    { ...editableRow, isreadonly: false },
    { ...editableRow, isreadonly: '0' },
    { ...editableRow, isreadonly: 2 },
    { ...editableRow, isenabled: 0, isreadonly: '0' },
  ])('fails closed for unsupported target-row flags: %j', async row => {
    const access = createAccessControlService(apiWith(payload([row])))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toMatchObject({ status: 'error', error: { code: 'invalid-response' } })
  })
})
