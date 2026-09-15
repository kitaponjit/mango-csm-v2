# QCItem PR #23 Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the Nuxt QCItem route with menu-right authorization, safe read-only behavior, stale-request protection, exact date rendering, and `.xlsx`-only import validation while keeping Issue #22 frontend-only.

**Architecture:** A reusable target-owned `AccessControlService` converts the existing `ViewUserAuthentication` response into a strict discriminated union and is composed through the Nuxt plugin boundary. The QCItem page owns access and data state separately, permits ReadList only after a `readonly` or `editable` decision, and uses one access generation to invalidate both stale permission responses and their downstream ReadList responses. QCItem-specific constants and behavior remain in the feature boundary; raw auth payloads never reach the page.

**Tech Stack:** Nuxt 4.5.2 SPA, Vue 3.5 Composition API, TypeScript, native Fetch/FormData, Vitest 4, Vue Test Utils 2, happy-dom.

**Spec:** `docs/superpowers/specs/2026-09-14-qcitem-pr23-hardening-design.md`

## Global Constraints

- Implement on the existing `migration/22-qcitem` topic branch in an isolated worktree; do not modify the dirty main checkout.
- Keep `/page/Master/v_csm_mas_011/` unchanged and keep `/csm-next/master/qc-item/` owned by Nuxt.
- Use `api/public/ViewUserAuthentication`, `CSM/Master/QCItem_ReadList`, `QCItem_Create`, `QCItem_Import`, and `QCItem_ExportExcel` without changing their backend contracts.
- Use menu name `'CSM_WEB'` and menu ID `'21010'` as feature constants; exact-match both fields in `menu_right`.
- Treat missing, malformed, duplicate, ambiguous, or failed permission data as fail-closed.
- Read-only permits ReadList, pagination, and Export; it forbids Add, editing, Delete, Save, opening Import, file selection, and Upload.
- Import supports `.xlsx` only. Reject `.xls` before any backend request.
- Add Date displays `DD/MM/YYYY HH:mm:ss`; preserve ISO-like wall-clock components without an implicit timezone shift.
- Do not add dependencies, change lockfiles, modify backend code, modify `Website/**`, remove the legacy route, or introduce legacy globals/Vuex into Nuxt.
- The frontend access check restores route/UI parity but is not complete server-side authorization. Preserve this limitation in QA and PR notes.
- After behavior changes, use the `thai-testcases` skill to update the Thai QA document.
- Evidence must precede claims. Unit tests do not replace real-account authorization UAT.

---

## File Structure

Create these focused files:

- `Nuxt/app/services/access/access-control-service.ts` — shared auth-response parsing and strict menu-access decision.
- `Nuxt/app/composables/useAccessControlService.ts` — narrow Nuxt injection accessor.
- `Nuxt/app/features/qc-item/qc-item-access.ts` — QCItem menu-name and menu-ID constants.
- `Nuxt/test/access-control/access-control-service.test.ts` — service contract, malformed-response, duplicate-row, and fail-closed tests.

Modify these files:

- `Nuxt/app/plugins/target-services.client.ts` — compose and provide `AccessControlService` from the existing `ApiClient`.
- `Nuxt/app/pages/master/qc-item/index.vue` — access-first state machine, generation ownership, read-only/export guards, and access UI.
- `Nuxt/app/features/qc-item/qc-item-model.ts` — render date and time including seconds without shifting ISO-like wall-clock values.
- `Nuxt/app/services/localization/localization-adapter.ts` — Thai/English access-denied, access-error, retry, and read-only copy.
- `Nuxt/test/qc-item/qc-item-page.test.ts` — access ordering, zero-call, read-only, export, import, and stale-response coverage.
- `Nuxt/test/qc-item/qc-item-model.test.ts` — date-format regression coverage.
- `Nuxt/test/localization/localization-adapter.test.ts` — new access-state key coverage.
- `docs/testcases/qc-item-2026-09-14.md` — real-account access matrix, date seconds, `.xls` rejection, and security limitation.

Do not modify `Nuxt/app/features/qc-item/qc-item-service.ts`, `Nuxt/app/services/http/api-client.ts`, or their tests unless a failing regression proves their established contracts are wrong.

---

### Task 1: Add the shared target access-control capability

**Files:**
- Create: `Nuxt/app/services/access/access-control-service.ts`
- Create: `Nuxt/app/composables/useAccessControlService.ts`
- Modify: `Nuxt/app/plugins/target-services.client.ts:1-38`
- Test: `Nuxt/test/access-control/access-control-service.test.ts`

**Interfaces:**
- Consumes: `ApiClient.get<unknown>(path): Promise<ApiResult<unknown>>`.
- Produces: `createAccessControlService(api: ApiClient): AccessControlService`.
- Produces: `AccessControlService.checkMenuAccess(menuName: string, menuId: string): Promise<AccessControlResult>`.
- Produces: `useAccessControlService(): AccessControlService` through Nuxt injection.

- [x] **Step 1: Write the failing access-decision tests**

Create `Nuxt/test/access-control/access-control-service.test.ts` with a small API double and explicit decision cases:

```ts
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
    [{ menu_name: 'CSM_WEB', menu_id: '21010', isenabled: 0, isreadonly: 0 }],
    [{ menu_name: 'CSM_WEB', menu_id: '99999', isenabled: 1, isreadonly: 0 }],
    [{ menu_name: 'OTHER', menu_id: '21010', isenabled: 1, isreadonly: 0 }],
  ])('denies when no single enabled exact row exists', async row => {
    const access = createAccessControlService(apiWith(payload([row])))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toEqual({ status: 'denied' })
  })

  it('returns readonly for one enabled read-only row', async () => {
    const access = createAccessControlService(apiWith(payload([
      { menu_name: 'CSM_WEB', menu_id: '21010', isenabled: 1, isreadonly: 1 },
    ])))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toEqual({ status: 'readonly' })
  })

  it.each([
    [
      { menu_name: 'CSM_WEB', menu_id: '21010', isenabled: 1, isreadonly: 0 },
      { menu_name: 'CSM_WEB', menu_id: '21010', isenabled: 1, isreadonly: 1 },
    ],
    [
      { menu_name: 'CSM_WEB', menu_id: '21010', isenabled: 1, isreadonly: 0 },
      { menu_name: 'CSM_WEB', menu_id: '21010', isenabled: 1, isreadonly: 0 },
    ],
    [
      { menu_name: 'CSM_WEB', menu_id: '21010', isenabled: 1, isreadonly: 0 },
      { menu_name: 'CSM_WEB', menu_id: '21010', isenabled: 0, isreadonly: 0 },
    ],
  ])('fails closed for every duplicate exact-row response', async (...rows) => {
    const access = createAccessControlService(apiWith(payload(rows)))
    const result = await access.checkMenuAccess('CSM_WEB', '21010')
    expect(result).toMatchObject({ status: 'error', error: { code: 'invalid-response' } })
  })

  it('maps unauthenticated transport failure and auth=false to anonymous', async () => {
    const transport = createAccessControlService(apiWith({
      ok: false,
      error: { code: 'unauthenticated', message: 'Expired', status: 401 },
    }))
    await expect(transport.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toEqual({ status: 'anonymous' })

    const response = createAccessControlService(apiWith(payload([], false)))
    await expect(response.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toEqual({ status: 'anonymous' })
  })

  it('preserves non-authentication API failures as access errors', async () => {
    const error: ApiError = { code: 'network', message: 'Offline' }
    const access = createAccessControlService(apiWith({ ok: false, error }))
    await expect(access.checkMenuAccess('CSM_WEB', '21010'))
      .resolves.toEqual({ status: 'error', error })
  })
})
```

Add table-driven malformed cases for non-object data, missing/non-object `auth`, non-boolean `auth.is_authen`, missing/non-array `menu_right`, and unsupported `isenabled`/`isreadonly` values. Every malformed case must assert `status: 'error'` and `error.code: 'invalid-response'`.

- [x] **Step 2: Run the focused test and confirm RED**

Run from `Nuxt/`:

```powershell
npm test -- --reporter=verbose test/access-control/access-control-service.test.ts
```

Expected: FAIL because `services/access/access-control-service.ts` does not exist.

- [x] **Step 3: Implement the discriminated-union service**

Create `Nuxt/app/services/access/access-control-service.ts` with this public contract and strict evaluation:

```ts
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
      if (row.isenabled === 0) {
        return { status: 'denied' }
      }
      if (row.isenabled !== 1 || (row.isreadonly !== 0 && row.isreadonly !== 1)) {
        return invalid('The server returned invalid menu-right flags.')
      }
      return row.isreadonly === 1 ? { status: 'readonly' } : { status: 'editable' }
    },
  }
}
```

- [x] **Step 4: Run the focused test and confirm GREEN**

Run the focused command from Step 2. Expected: all access-control tests PASS.

- [x] **Step 5: Compose the service through the Nuxt boundary**

Create `Nuxt/app/composables/useAccessControlService.ts`:

```ts
export function useAccessControlService() {
  return useNuxtApp().$accessControlService
}
```

In `target-services.client.ts`, import `createAccessControlService`, create it immediately after `apiClient`, and add `accessControlService` to `provide`:

```ts
const accessControlService = createAccessControlService(apiClient)

return {
  provide: {
    sessionAdapter: session,
    authenticationService,
    apiClient,
    accessControlService,
    fileCapability,
    localization,
  },
}
```

- [x] **Step 6: Verify service integration and commit**

Run:

```powershell
npm test -- --reporter=dot
npm run build
git diff --check
git add Nuxt/app/services/access/access-control-service.ts Nuxt/app/composables/useAccessControlService.ts Nuxt/app/plugins/target-services.client.ts Nuxt/test/access-control/access-control-service.test.ts
git commit -m "feat(csm): add target menu access control"
```

Expected: tests and build exit 0; the commit contains only the four scoped files.

---

### Task 2: Gate QCItem data behind access state and request ownership

**Files:**
- Create: `Nuxt/app/features/qc-item/qc-item-access.ts`
- Modify: `Nuxt/app/pages/master/qc-item/index.vue:1-405`
- Modify: `Nuxt/app/services/localization/localization-adapter.ts`
- Test: `Nuxt/test/qc-item/qc-item-page.test.ts`
- Test: `Nuxt/test/localization/localization-adapter.test.ts`

**Interfaces:**
- Consumes: `AccessControlService.checkMenuAccess(QC_ITEM_MENU_NAME, QC_ITEM_MENU_ID)` from Task 1.
- Produces: `QC_ITEM_MENU_NAME = 'CSM_WEB'` and `QC_ITEM_MENU_ID = '21010'`.
- Produces: page-owned `AccessViewState`, access generation, `canEdit`, and `canExport`.
- Preserves: existing `QCItemService` methods and page test IDs unless this task explicitly adds an access-state test ID.

- [x] **Step 1: Add failing access-order and zero-call page tests**

Extend the page test setup with:

```ts
const checkMenuAccess = vi.fn()

vi.stubGlobal('useAccessControlService', () => ({ checkMenuAccess }))
```

Reset `checkMenuAccess` in `beforeEach`. Replace authenticated fixtures so they resolve access before ReadList. Add these cases:

```ts
it.each(['anonymous', 'denied'] as const)(
  'does not read QCItem data when access resolves to %s',
  async status => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({ status })

    mount(QCItemPage)
    await flushPromises()

    expect(checkMenuAccess).toHaveBeenCalledWith('CSM_WEB', '21010')
    expect(apiGet).not.toHaveBeenCalledWith('CSM/Master/QCItem_ReadList')
  },
)

it('keeps access errors separate and does not read QCItem data', async () => {
  getContext.mockReturnValue({ isAuthenticated: true })
  checkMenuAccess.mockResolvedValue({
    status: 'error',
    error: { code: 'invalid-response', message: 'Invalid access response' },
  })

  const wrapper = mount(QCItemPage)
  await flushPromises()

  expect(wrapper.get('[data-testid="qcitem-access-error"]').text())
    .toContain('Invalid access response')
  expect(apiGet).not.toHaveBeenCalled()
})

it('resolves editable access before starting ReadList', async () => {
  getContext.mockReturnValue({ isAuthenticated: true })
  checkMenuAccess.mockResolvedValue({ status: 'editable' })
  apiGet.mockResolvedValue({ ok: true, status: 200, data: [] })

  mount(QCItemPage)
  await flushPromises()

  expect(checkMenuAccess.mock.invocationCallOrder[0])
    .toBeLessThan(apiGet.mock.invocationCallOrder[0])
})
```

Retain the existing local-anonymous test and strengthen it to assert `checkMenuAccess` is called zero times.

- [x] **Step 2: Run the focused page test and confirm RED**

Run:

```powershell
npm test -- --reporter=verbose test/qc-item/qc-item-page.test.ts
```

Expected: FAIL because the page does not consume `useAccessControlService` and still starts ReadList after a local-session check alone.

- [x] **Step 3: Add feature constants and the access-first state machine**

Create `Nuxt/app/features/qc-item/qc-item-access.ts`:

```ts
export const QC_ITEM_MENU_NAME = 'CSM_WEB'
export const QC_ITEM_MENU_ID = '21010'
```

In the page, replace `AccessStatus` with:

```ts
import type { AccessControlResult } from '~/services/access/access-control-service'
import { QC_ITEM_MENU_ID, QC_ITEM_MENU_NAME } from '~/features/qc-item/qc-item-access'

type AccessViewState = { status: 'checking' } | AccessControlResult

const access = useAccessControlService()
const accessResult = ref<AccessViewState>({ status: 'checking' })
let accessGeneration = 0

const hasReadAccess = computed(() =>
  accessResult.value.status === 'readonly'
  || accessResult.value.status === 'editable',
)
```

Replace `initializePage`/`loadItems` with generation-owned functions:

```ts
function clearAccessOwnedState() {
  items.value = []
  currentPage.value = 1
  listStatus.value = 'idle'
  listError.value = ''
  importDialogOpen.value = false
  importStatus.value = 'idle'
  importError.value = ''
  importMessage.value = ''
  clearFileSelection()
}

async function loadItems(generation = accessGeneration) {
  if (generation !== accessGeneration || !hasReadAccess.value) return
  listStatus.value = 'loading'
  listError.value = ''

  const result = await service.readList()
  if (generation !== accessGeneration || !hasReadAccess.value) return
  if (!result.ok) {
    listStatus.value = 'error'
    listError.value = result.error.message
    return
  }
  if (!Array.isArray(result.data)) {
    listStatus.value = 'error'
    listError.value = t('qcItem.invalidResponse')
    return
  }

  items.value = normalizeQCItems(result.data)
  currentPage.value = 1
  listStatus.value = 'ready'
}

async function initializePage() {
  const generation = ++accessGeneration
  clearAccessOwnedState()
  accessResult.value = { status: 'checking' }

  if (!session.getContext().isAuthenticated) {
    accessResult.value = { status: 'anonymous' }
    session.redirectToLogin()
    return
  }

  const result = await access.checkMenuAccess(QC_ITEM_MENU_NAME, QC_ITEM_MENU_ID)
  if (generation !== accessGeneration) return
  accessResult.value = result

  if (result.status === 'anonymous') {
    session.redirectToLogin()
    return
  }
  if (result.status === 'readonly' || result.status === 'editable') {
    await loadItems(generation)
  }
}
```

The data-retry button must call `loadItems(accessGeneration)`. The access-error retry button must call `initializePage()`.

- [x] **Step 4: Render distinct access states and add localized copy**

Add Thai/English dictionary keys for:

```text
qcItem.accessDeniedTitle
qcItem.accessDeniedMessage
qcItem.accessErrorTitle
qcItem.accessRetry
qcItem.readOnly
```

Render `checking`, `anonymous`, `denied`, and `error` before the panel. Give the error state `data-testid="qcitem-access-error"` and the retry button `data-testid="qcitem-access-retry"`. Render the data panel only when `hasReadAccess` is true. Show a localized read-only badge when status is `readonly`.

Update the localization test's QCItem key list with all five keys and run:

```powershell
npm test -- --reporter=verbose test/localization/localization-adapter.test.ts test/qc-item/qc-item-page.test.ts
```

Expected: the new access-state tests PASS; existing mutation tests may still fail until fixtures default to `editable`.

- [x] **Step 5: Add failing stale-access and stale-ReadList tests**

Use deferred promises and call `initializePage` through Vue's setup state without adding a production-only public API:

```ts
type QCItemSetup = {
  initializePage(): Promise<void>
  addItem(): void
  deleteItem(item: { itemno: number, itemname: string, remark: string }): void
  saveItems(): Promise<void>
  openFilePicker(): void
  onFileChange(event: Event): void
  uploadFile(): Promise<void>
  exportFile(): Promise<void>
}

function pageSetup(wrapper: ReturnType<typeof mount>) {
  return (wrapper.vm as unknown as { $: { setupState: QCItemSetup } }).$.setupState
}
```

Add one test where access request 1 resolves after access request 2 and assert only generation 2 changes the page. Add this downstream case:

```ts
it('does not restore stale ReadList data after a newer denied decision', async () => {
  getContext.mockReturnValue({ isAuthenticated: true })
  checkMenuAccess
    .mockResolvedValueOnce({ status: 'editable' })
    .mockResolvedValueOnce({ status: 'denied' })
  let resolveRead!: (value: unknown) => void
  apiGet.mockReturnValue(new Promise(resolve => { resolveRead = resolve }))

  const wrapper = mount(QCItemPage)
  await flushPromises()
  await pageSetup(wrapper).initializePage()
  await flushPromises()

  resolveRead({
    ok: true,
    status: 200,
    data: [{ itemno: 1, itemname: 'Stale', remark: 'Must not render' }],
  })
  await flushPromises()

  expect(wrapper.text()).not.toContain('Stale')
  expect(wrapper.find('[data-testid="qcitem-table"]').exists()).toBe(false)
})
```

- [x] **Step 6: Run stale-request tests and confirm GREEN**

Run the focused page test. Expected: both stale access and stale downstream ReadList responses are ignored, while the latest state remains rendered.

- [x] **Step 7: Commit the access-first page state**

Run and commit:

```powershell
npm test -- --reporter=dot
git diff --check
git add Nuxt/app/features/qc-item/qc-item-access.ts Nuxt/app/pages/master/qc-item/index.vue Nuxt/app/services/localization/localization-adapter.ts Nuxt/test/qc-item/qc-item-page.test.ts Nuxt/test/localization/localization-adapter.test.ts
git commit -m "fix(csm): gate QCItem data by menu access"
```

Expected: all tests pass; the commit contains access sequencing/state only.

---

### Task 3: Enforce read-only/export guards and exact file/date parity

**Files:**
- Modify: `Nuxt/app/pages/master/qc-item/index.vue`
- Modify: `Nuxt/app/features/qc-item/qc-item-model.ts:108-126`
- Test: `Nuxt/test/qc-item/qc-item-page.test.ts`
- Test: `Nuxt/test/qc-item/qc-item-model.test.ts`

**Interfaces:**
- Consumes: `accessResult`, `listStatus`, `isDataBusy`, `exportStatus`, and generation-owned `loadItems` from Task 2.
- Produces: `canEdit` and `canExport` as the only eligibility predicates for page actions.
- Preserves: popup reservation before asynchronous export-token retrieval.

- [x] **Step 1: Write failing read-only and export-guard tests**

Add a reusable `readonly` setup whose Access API resolves before ReadList. Assert:

```ts
it('allows readonly users to read and export but blocks every mutation path', async () => {
  getContext.mockReturnValue({ isAuthenticated: true })
  checkMenuAccess.mockResolvedValue({ status: 'readonly' })
  apiGet
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: [{ itemno: 1, itemname: 'Description', remark: 'Remark' }],
    })
    .mockResolvedValueOnce({ ok: true, status: 200, data: 'server-token' })
  vi.stubGlobal('open', vi.fn().mockReturnValue({ closed: false, location: { href: '' } }))

  const wrapper = mount(QCItemPage)
  await flushPromises()

  expect(wrapper.get('[data-testid="qcitem-description-1"]').attributes('disabled')).toBeDefined()
  expect(wrapper.get('[data-testid="qcitem-add"]').attributes('disabled')).toBeDefined()
  expect(wrapper.get('[data-testid="qcitem-save"]').attributes('disabled')).toBeDefined()
  expect(wrapper.get('[data-testid="qcitem-import"]').attributes('disabled')).toBeDefined()
  expect(wrapper.get('[data-testid="qcitem-delete-1"]').attributes('disabled')).toBeDefined()

  await wrapper.get('[data-testid="qcitem-add"]').trigger('click')
  await wrapper.get('[data-testid="qcitem-save"]').trigger('click')
  await wrapper.get('[data-testid="qcitem-import"]').trigger('click')
  await wrapper.get('[data-testid="qcitem-export"]').trigger('click')
  const setup = pageSetup(wrapper)
  setup.addItem()
  setup.deleteItem({ itemno: 1, itemname: 'Description', remark: 'Remark' })
  await setup.saveItems()
  setup.openFilePicker()
  setup.onFileChange(new Event('change'))
  await setup.uploadFile()
  await flushPromises()

  expect(apiPost).not.toHaveBeenCalled()
  expect(apiPostForm).not.toHaveBeenCalled()
  expect(apiOpenUrl).toHaveBeenCalledWith('server-token', { download: true })
})
```

Add a `denied` case that invokes `exportFile` through setup state and asserts zero export API calls and zero popup calls. This verifies the handler guard independently of the hidden/disabled UI.

- [x] **Step 2: Run the page test and confirm RED**

Run the focused page test. Expected: FAIL because existing action eligibility depends only on busy/list state and Export has no access guard.

- [x] **Step 3: Centralize and apply action eligibility**

Add:

```ts
const canEdit = computed(() =>
  accessResult.value.status === 'editable'
  && listStatus.value === 'ready'
  && !isDataBusy.value,
)

const canExport = computed(() =>
  (accessResult.value.status === 'readonly'
    || accessResult.value.status === 'editable')
  && listStatus.value === 'ready'
  && exportStatus.value !== 'loading',
)
```

Guard `addItem`, `deleteItem`, `saveItems`, `openFilePicker`, `onFileChange`, and `uploadFile` with `if (!canEdit.value) return`. If a forbidden file-change event is triggered programmatically, clear the native input and selected file before returning. Guard `exportFile` before reserving a popup with `if (!canExport.value) return`.

Bind Add, Save, Import, Delete, both editable inputs, the hidden file input, and Upload to `!canEdit`. Bind Export to `!canExport`. Preserve Cancel's current upload-pending lock. Starting a new access generation must still force-close and clear Import state.

- [x] **Step 4: Run page tests and confirm GREEN**

Run:

```powershell
npm test -- --reporter=verbose test/qc-item/qc-item-page.test.ts
```

Expected: read-only ReadList and Export pass; all mutation spies remain at zero; editable regression tests pass.

- [x] **Step 5: Write failing `.xls` rejection and date-second tests**

Add a page test selecting `QCItem.xls`, then assert the `.xlsx`-only message appears, the dialog does not enable Upload, and `apiPostForm` remains uncalled even after a programmatic upload attempt.

Extend `qc-item-model.test.ts` with deterministic cases:

```ts
it('renders ISO-like timestamps with seconds without shifting wall-clock fields', () => {
  expect(formatQCItemDate('2026-09-14T10:05:06Z')).toBe('14/09/2026 10:05:06')
  expect(formatQCItemDate('2026-09-14 23:59:58')).toBe('14/09/2026 23:59:58')
  expect(formatQCItemDate('2026-09-14')).toBe('14/09/2026 00:00:00')
})

it('renders Date and .NET date values in local time with seconds', () => {
  const local = new Date(2026, 8, 14, 10, 5, 6)
  expect(formatQCItemDate(local)).toBe('14/09/2026 10:05:06')
  expect(formatQCItemDate(`/Date(${local.getTime()})/`)).toBe('14/09/2026 10:05:06')
})

it('renders missing and invalid dates as empty text', () => {
  expect(formatQCItemDate(null)).toBe('')
  expect(formatQCItemDate('not-a-date')).toBe('')
})
```

- [x] **Step 6: Run the focused tests and confirm RED**

Run:

```powershell
npm test -- --reporter=verbose test/qc-item/qc-item-model.test.ts test/qc-item/qc-item-page.test.ts
```

Expected: date assertions fail because the formatter currently returns date only. The `.xls` test must already reject at selection; strengthen the handler-level zero-call assertion if it passes only through UI disabling.

- [x] **Step 7: Implement the minimal date formatter**

Replace the formatter body with component-preserving parsing before the existing Date fallback:

```ts
export function formatQCItemDate(value: unknown) {
  if (!value) return ''

  const text = String(value)
  const wallClock = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}):(\d{2}))?/.exec(text)
  if (wallClock) {
    const [, year, month, day, hour = '00', minute = '00', second = '00'] = wallClock
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`
  }

  const dotNetDate = /^\/Date\((-?\d+)/.exec(text)
  const date = value instanceof Date
    ? value
    : dotNetDate
      ? new Date(Number(dotNetDate[1]))
      : new Date(text)
  if (Number.isNaN(date.getTime())) return ''

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
    + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
```

Keep `accept=".xlsx"` and the case-insensitive `/\.xlsx$/` validation. Do not add MIME-only rejection because browser-provided spreadsheet MIME values vary; the backend contract is extension-based.

- [x] **Step 8: Run focused/full tests and commit**

Run:

```powershell
npm test -- --reporter=verbose test/qc-item/qc-item-model.test.ts test/qc-item/qc-item-page.test.ts
npm test -- --reporter=dot
git diff --check
git add Nuxt/app/pages/master/qc-item/index.vue Nuxt/app/features/qc-item/qc-item-model.ts Nuxt/test/qc-item/qc-item-page.test.ts Nuxt/test/qc-item/qc-item-model.test.ts
git commit -m "fix(csm): enforce QCItem access parity"
```

Expected: focused and full tests pass; the commit contains only guard/import/date behavior and its tests.

---

### Task 4: Update Thai QA coverage and complete the release evidence

**Files:**
- Modify: `docs/testcases/qc-item-2026-09-14.md`
- Verify only: `Nuxt/.output/public/master/qc-item/index.html`
- External metadata after authorization: GitHub PR #23 description

**Interfaces:**
- Consumes: final access states, controls, date policy, and import policy from Tasks 1-3.
- Produces: a Thai checkbox-based UAT matrix for denied, read-only, and editable accounts.
- Produces: explicit PR disclosure that frontend access parity is not server-side menu enforcement.

- [x] **Step 1: Use `thai-testcases` to revise the QCItem QA document**

Update the existing document, retaining its current read/save/import/export tests and adding:

- `api/public/ViewUserAuthentication?menu_name=CSM_WEB&lang_code=&menu_id=21010` to the endpoint table.
- Three account fixtures: no enabled right, enabled `isreadonly=1`, and enabled `isreadonly=0`.
- A denied test proving no QCItem endpoint is called.
- A read-only test proving ReadList/pagination/Export work and Add/edit/Delete/Save/Import do not.
- An editable regression test covering the existing mutation flows.
- A check that Add Date includes hours, minutes, and seconds.
- A negative `.xls` test proving no Upload request is sent.
- Desktop and 390 px checks for every permission-relevant control.
- A note that real authenticated evidence and owner sign-off are required.
- A security warning that the backend QCItem actions authenticate but do not enforce menu ID `21010` against direct API calls.
- A separate compatibility note that `.xls` support requires a backend enhancement and is outside Issue #22.

- [x] **Step 2: Review the complete branch diff before final verification**

Run from the repository root:

```powershell
git status --short --branch
git diff --stat origin/main...HEAD
git diff --name-status origin/main...HEAD
git diff --stat
git diff --name-status
git diff --check
git diff --check origin/main...HEAD
```

Expected: the combined committed and working-tree views contain only the planned Nuxt files, the approved spec/plan, and the QCItem QA document for this hardening work; `Website/**` and backend files remain unchanged; both diff checks are silent.

- [x] **Step 3: Run fresh full target verification**

Run from `Nuxt/`:

```powershell
npm test -- --reporter=dot
npm audit
npm run build
npm run generate
Test-Path -LiteralPath '.output/public/master/qc-item/index.html'
```

Expected: all commands exit 0, audit reports zero vulnerabilities, and `Test-Path` returns `True`. Record the actual test-file/test counts from this run; do not retain the PR's old count if it changed.

- [x] **Step 4: Perform or explicitly defer real-account UAT**

Use `/csm-next/master/qc-item/`, not the legacy `/page/**` route. Execute the denied, read-only, and editable account sections from the Thai QA document at desktop and 390 px.

Expected:

- denied/anonymous/access-error paths make zero QCItem calls;
- read-only makes ReadList and Export calls but zero Create/Import calls;
- editable preserves read/add/edit/delete/save/Import/Export behavior;
- date seconds, `.xls` rejection, exported filename/bytes, persistence after reload, and Thai/English copy match the spec.

If suitable accounts or a working backend are unavailable, record each affected case as `NOT VERIFIED`, leave the PR not release-ready, and do not convert mocked tests into UAT evidence.

- [x] **Step 5: Update PR #23 notes with verified facts**

After the commands and UAT attempt, update the PR description so it:

- replaces stale automated test counts with the fresh output;
- states the result for denied/read-only/editable real-account UAT separately;
- records `.xlsx` as the only supported import format and `.xls` as a separate backend enhancement;
- states that frontend access control is route/UI parity, while direct API menu enforcement remains a separate security follow-up;
- retains the existing cross-company import lookup risk until backend ownership closes it.

Do not write `PASS`, `APPROVE`, or `release-ready` for any check that was not actually executed.

- [x] **Step 6: Commit the QA document and final scoped metadata files**

Run:

```powershell
git diff --check
git add docs/testcases/qc-item-2026-09-14.md docs/superpowers/specs/2026-09-14-qcitem-pr23-hardening-design.md docs/superpowers/plans/2026-09-14-qcitem-pr23-hardening.md
git commit -m "docs(csm): add QCItem access parity validation"
git status --short --branch
```

Expected: the commit contains only the design, implementation plan, and Thai QA updates; the final topic worktree is clean. Push or merge only when the user explicitly requests it.

---

## Deferred Follow-ups

Do not implement either item in this plan:

1. **Security:** enforce `CSM_WEB/21010` server-side for `QCItem_ReadList`, `QCItem_Create`, `QCItem_Import`, and `QCItem_ExportExcel`, with backend compatibility and direct-request tests.
2. **Compatibility:** support BIFF `.xls` through a backend parser or controlled `.xls`-to-`.xlsx` conversion, with backend integration tests.

The implementation handoff must name both follow-ups even if GitHub issues are not created during this work.

## Inline Execution Record — 2026-09-15

| Checkpoint | Local commits | Result |
|---|---|---|
| Shared access capability | `193776a` | 49 focused tests; service/plugin spec and quality review approved |
| Access-first page and stale requests | `55510ce` | Access ordering, fail-closed zero-call paths, separate retries, generation-owned access/ReadList; review approved |
| Read-only/import/date parity | `5b175a1`, `67b5036` | UI and handler guards, stale mutation/export completions, `.xls` zero-request rejection, exact seconds, strict invalid date handling; final review approved |
| QA and release evidence | Final scoped docs commit | 12 Thai QA cases / 47 checkbox steps; PR #23 description updated and read-back compared with the verified body file |

Fresh final commands at code HEAD `67b5036`: `npm test -- --reporter=dot` passed 16 files / 177 tests; `npm audit` found 0 vulnerabilities; `npm run build` and `npm run generate` exited 0; generated QCItem route exists. Both working-tree and `origin/main...HEAD` whitespace checks exit 0. Existing Nuxt/Nitro dependency warnings and Git line-ending warnings are recorded; dependencies/lockfiles unchanged.

Task 4 Step 4 was completed by explicit deferral: denied/read-only/editable real-account UAT at desktop and 390 px remains **NOT VERIFIED**. The local example backend timed out and suitable three-level account fixtures were unavailable. Anonymous local-browser redirect smoke is separate evidence. Frontend implementation is verified; release readiness and owner sign-off are not established.

PR notes explicitly distinguish these local hardening commits from the unpushed PR head. No push or merge occurred. Existing dirty main checkout and legacy Website remain untouched. Backend menu authorization, `.xls` compatibility, and the existing cross-company import lookup risk remain follow-ups as documented above and in QA.
