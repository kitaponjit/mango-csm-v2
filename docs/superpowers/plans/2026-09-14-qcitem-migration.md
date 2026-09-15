# Issue #22 — QCItem Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the target Nuxt route `/csm-next/master/qc-item/` with read, inline add/edit/delete, replace-all save, `.xlsx` import, server export, authentication states, localization, and responsive target-native UI while preserving the existing backend contract and legacy route.

**Architecture:** The page owns the full QCItem dataset and client-side page window because `QCItem_ReadList` returns a raw full list and the legacy page uses 10-row client pagination. `qc-item-service.ts` owns endpoint paths, request bodies, and response types; `ApiClient` owns authentication headers, JSON/multipart transport, response normalization, and HTTP errors; `FileCapability` owns the tokenized download URL. The target page uses `TargetState`, `TargetDialog`, target tokens, native HTML table/controls, and `LocalizationAdapter`, with no Vuex, legacy globals, ag-Grid, or backend changes.

**Tech Stack:** Nuxt 4.5.2 SPA, Vue 3 Composition API, TypeScript, Vitest, Vue Test Utils, happy-dom, native `FormData`, and existing target CSS tokens/primitives.

**Spec:** Approved Issue #22 Context Report from the conversation, GitHub Issue #22, `docs/backend/contract-navigation-knowledge.md`, and the legacy/backend source evidence recorded in that report.

## Global Constraints

- Target route is `/csm-next/master/qc-item/`; legacy `/page/Master/v_csm_mas_011/` remains unchanged.
- Use `CSM/Master/QCItem_ReadList`, `CSM/Master/QCItem_Create`, `CSM/Master/QCItem_Import`, and `CSM/Master/QCItem_ExportExcel` exactly as verified.
- `QCItem_Create` receives JSON `{ item: QCItem[] }`; an empty array preserves legacy replace-all semantics and clears the current company list.
- `QCItem_Import` receives multipart field `file` and `.xlsx`; do not send `noToken` or mint file tokens in Nuxt.
- Export response is a server-minted file token; pass it unchanged to `FileCapability.openUrl(token, { download: true })`.
- `QCItem_ReadList` is raw JSON array; API envelope responses are normalized by `ApiClient`.
- Client page size is 10; list numbering is one-based across the full dataset, not only the current page.
- Save validation rejects any row whose `itemname` or `remark` is empty after trimming and identifies the first invalid row.
- Do not add dependencies, change lockfiles, modify backend files, modify `Website/**`, remove the legacy route, commit, push, or create a PR.
- Preserve the pre-existing `Website/AGENTS.md` modification in the main checkout; work only in the isolated worktree.

---

## File Map

Create the following focused target files:

- `Nuxt/app/features/qc-item/qc-item-model.ts` — QCItem types, normalization, pagination, row creation, validation, and display-date formatting.
- `Nuxt/app/features/qc-item/qc-item-service.ts` — four backend action calls and their exact request contracts.
- `Nuxt/app/pages/master/qc-item/index.vue` — authenticated target page, actions, editable table, import dialog, and export flow.
- `Nuxt/test/qc-item/qc-item-model.test.ts` — pure model behavior.
- `Nuxt/test/qc-item/qc-item-service.test.ts` — endpoint/body/FormData behavior.
- `Nuxt/test/qc-item/qc-item-page.test.ts` — page access, read, paging, add/edit/delete/save/import/export states.
- `docs/testcases/qc-item-2026-09-14.md` — Thai QA test cases for the changed route and its backend actions.

Modify only these existing target files:

- `Nuxt/app/services/http/api-client.ts` — add authenticated JSON POST and multipart POST while retaining GET behavior.
- `Nuxt/test/api-client.test.ts` — prove JSON and multipart transport plus shared auth/error normalization.
- `Nuxt/app/services/localization/localization-adapter.ts` — add `qcItem.*` Thai/English labels and messages.
- `Nuxt/test/localization/localization-adapter.test.ts` — assert both new dictionaries are available and fallback remains intact.

No other repository files are required for the feature.

## Task 1: Extend the target API transport

**Files:**
- Modify: `Nuxt/app/services/http/api-client.ts`
- Test: `Nuxt/test/api-client.test.ts`

**Interfaces:**
- Add `post<T>(path: string, body: unknown): Promise<ApiResult<T>>`.
- Add `postForm<T>(path: string, body: FormData): Promise<ApiResult<T>>`.
- Keep `get<T>` output and all existing `401`, `403`, API-envelope, HTTP, malformed-response, and network behavior unchanged.

- [ ] **Step 1: Write failing tests for JSON POST and multipart POST**

Add tests to `describe('createApiClient')` that instantiate the existing test client and assert:

```ts
it('sends an authenticated JSON POST body', async () => {
  const fetcher = vi.fn().mockResolvedValue(jsonResponse({ success: true }))
  const client = createApiClient({
    baseUrl: '/service/',
    fetcher,
    credentialProvider: { getCredential: () => 'token' },
    onMissingCredential: vi.fn(),
    onInvalidCredential: vi.fn(),
  })

  await client.post('CSM/Master/QCItem_Create', { item: [{ itemno: 1 }] })

  expect(fetcher).toHaveBeenCalledWith(
    '/service/CSM/Master/QCItem_Create',
    {
      method: 'POST',
      headers: {
        'X-Mango-Auth': 'token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ item: [{ itemno: 1 }] }),
    },
  )
})

it('sends FormData without overriding its multipart boundary header', async () => {
  const fetcher = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: true }))
  const client = createApiClient({
    baseUrl: '/service/',
    fetcher,
    credentialProvider: { getCredential: () => 'token' },
    onMissingCredential: vi.fn(),
    onInvalidCredential: vi.fn(),
  })
  const form = new FormData()
  form.append('file', new File(['itemno,itemname,remark'], 'QCItem.xlsx'))

  await client.postForm('CSM/Master/QCItem_Import', form)

  expect(fetcher).toHaveBeenCalledWith(
    '/service/CSM/Master/QCItem_Import',
    { method: 'POST', headers: { 'X-Mango-Auth': 'token' }, body: form },
  )
})
```

- [ ] **Step 2: Run the focused tests and verify the expected RED failure**

Run from `Nuxt/`:

```text
npm test -- test/api-client.test.ts --reporter=verbose
```

Expected: the new tests fail because `ApiClient` has no `post` or `postForm` methods.

- [ ] **Step 3: Implement the minimal shared request path**

Refactor the existing GET body into a private request helper that accepts:

```ts
type RequestOptions = {
  method: 'GET' | 'POST'
  headers: Record<string, string>
  body?: string | FormData
}
```

The helper must obtain `X-Mango-Auth` once per request, call `onMissingCredential` without fetching when absent, call `onInvalidCredential` only for HTTP 401, preserve 403 as forbidden, parse JSON, apply `normalizePayload`, and map failures using the existing messages. Implement `post` with `Content-Type: application/json` and `JSON.stringify(body)`. Implement `postForm` with only the auth header and the supplied `FormData` body.

- [ ] **Step 4: Run the focused and full API tests**

Run:

```text
npm test -- test/api-client.test.ts --reporter=verbose
npm test -- --reporter=dot
```

Expected: focused and full suites pass; existing GET assertions remain unchanged.

## Task 2: Build the QCItem domain model

**Files:**
- Create: `Nuxt/app/features/qc-item/qc-item-model.ts`
- Test: `Nuxt/test/qc-item/qc-item-model.test.ts`

**Interfaces:**

```ts
export interface QCItem {
  itemno: number
  itemname: string
  remark: string
  adddate?: string | null
  editdate?: string | null
  adduser?: string | null
  edituser?: string | null
  line_number?: number | null
}

export interface EditableQCItem {
  itemno: number
  itemname: string
  remark: string
  adddate?: string | Date | null
  line_number?: number | null
}

export interface QCItemValidation {
  valid: boolean
  itemno?: number
  field?: 'description' | 'remark'
}
```

Export `PAGE_SIZE = 10`, `normalizeQCItems`, `getPageCount`, `getPageItems`, `createNewQCItem`, `validateQCItems`, and `formatQCItemDate`.

- [ ] **Step 1: Write failing model tests**

Cover these exact behaviors:

```ts
it('normalizes a raw list into editable QCItem values', () => {
  expect(normalizeQCItems([{ itemno: '2', itemname: null, remark: ' OK ' }])).toEqual([
    { itemno: 2, itemname: '', remark: ' OK ' },
  ])
})

it('paginates ten rows and preserves the global one-based row offset', () => {
  const rows = Array.from({ length: 11 }, (_, index) => ({
    itemno: index + 1,
    itemname: `Description ${index + 1}`,
    remark: 'Remark',
  }))
  expect(getPageCount(rows, PAGE_SIZE)).toBe(2)
  expect(getPageItems(rows, 2, PAGE_SIZE).map(row => row.itemno)).toEqual([11])
})

it('creates the next item number and starts blank editable fields', () => {
  expect(createNewQCItem([{ itemno: 4, itemname: 'A', remark: 'B' }], new Date('2026-09-14T10:00:00Z')))
    .toMatchObject({ itemno: 5, itemname: '', remark: '', line_number: 5 })
})

it('rejects the first row with a blank description or remark', () => {
  expect(validateQCItems([{ itemno: 7, itemname: 'Description', remark: '  ' }])).toEqual({
    valid: false,
    itemno: 7,
    field: 'remark',
  })
})
```

Also cover empty-list pagination, invalid item numbers in raw input being normalized safely, and `formatQCItemDate` for ISO, .NET date, empty, and invalid values.

- [ ] **Step 2: Run model tests and verify RED**

Run:

```text
npm test -- test/qc-item/qc-item-model.test.ts --reporter=verbose
```

Expected: failure because the QCItem model module does not exist.

- [ ] **Step 3: Implement the pure model functions**

Normalize `itemno` with `Number`, default invalid values to the one-based source index, and normalize nullable `itemname`/`remark` to empty strings without trimming stored values. `getPageItems` must clamp the requested page to the range `1..getPageCount` and use the 10-row slice. `createNewQCItem` must use `max(itemno) + 1`, set `line_number` to the same number, and use the supplied date. `validateQCItems` must check `itemname.trim()` then `remark.trim()` and return the first failing row with `field: 'description'` or `field: 'remark'`; the page maps that field through localization. Reuse the legacy date display semantics without importing legacy filters.

- [ ] **Step 4: Run model tests and the full suite**

Run:

```text
npm test -- test/qc-item/qc-item-model.test.ts --reporter=verbose
npm test -- --reporter=dot
```

Expected: all pass.

## Task 3: Add the QCItem service contract

**Files:**
- Create: `Nuxt/app/features/qc-item/qc-item-service.ts`
- Test: `Nuxt/test/qc-item/qc-item-service.test.ts`

**Interfaces:**

```ts
export interface QCItemService {
  readList(): Promise<ApiResult<QCItem[]>>
  create(items: EditableQCItem[]): Promise<ApiResult<unknown>>
  importFile(file: File): Promise<ApiResult<unknown>>
  exportFile(): Promise<ApiResult<string>>
}
```

- [ ] **Step 1: Write failing service tests**

Use a test double with `get`, `post`, and `postForm` spies and assert:

```ts
it('maps the QCItem read action to the raw list endpoint', async () => {
  const result = { ok: true, status: 200, data: [] } as const
  const api = { get: vi.fn().mockResolvedValue(result) } as unknown as ApiClient
  const service = createQCItemService(api)

  expect(await service.readList()).toEqual(result)
  expect(api.get).toHaveBeenCalledWith('CSM/Master/QCItem_ReadList')
})

it('sends the replace-all create body under the item field', async () => {
  const api = { post: vi.fn().mockResolvedValue({ ok: true, status: 200, data: {} }) } as unknown as ApiClient
  const service = createQCItemService(api)
  const items = [{ itemno: 1, itemname: 'Description', remark: 'Remark' }]

  await service.create(items)

  expect(api.post).toHaveBeenCalledWith('CSM/Master/QCItem_Create', { item: items })
})

it('appends the upload as the backend-required file field', async () => {
  const api = { postForm: vi.fn().mockResolvedValue({ ok: true, status: 200, data: true }) } as unknown as ApiClient
  const service = createQCItemService(api)
  const file = new File(['xlsx'], 'QCItem.xlsx')

  await service.importFile(file)

  const form = vi.mocked(api.postForm).mock.calls[0][1] as FormData
  expect(api.postForm).toHaveBeenCalledWith('CSM/Master/QCItem_Import', form)
  expect(form.get('file')).toBe(file)
})

it('reads the server-minted export token through the export action', async () => {
  const api = { get: vi.fn().mockResolvedValue({ ok: true, status: 200, data: 'token' }) } as unknown as ApiClient
  const service = createQCItemService(api)

  expect(await service.exportFile()).toEqual({ ok: true, status: 200, data: 'token' })
  expect(api.get).toHaveBeenCalledWith('CSM/Master/QCItem_ExportExcel')
})
```

- [ ] **Step 2: Run service tests and verify RED**

Run `npm test -- test/qc-item/qc-item-service.test.ts --reporter=verbose`. Expected: module/method failures because the service does not exist.

- [ ] **Step 3: Implement the minimal service**

Use exact action paths. `create` must send `{ item: items }`. `importFile` must create `new FormData()`, append `file` with the provided `File`, and call `postForm`. `exportFile` must call `get<string>` and return the result unchanged.

- [ ] **Step 4: Run service tests and the full suite**

Run the focused service test and `npm test -- --reporter=dot`; expect all pass.

## Task 4: Extend localization for the target page

**Files:**
- Modify: `Nuxt/app/services/localization/localization-adapter.ts`
- Test: `Nuxt/test/localization/localization-adapter.test.ts`

- [ ] **Step 1: Write failing localization assertions**

Assert that Thai and English adapters return non-key values for the complete `qcItem` key set used by the page: `title`, `description`, `count`, `number`, `action`, `actions`, `descriptionColumn`, `remark`, `addDate`, `add`, `save`, `saving`, `export`, `exporting`, `import`, `importTitle`, `selectedFile`, `chooseFile`, `cancel`, `upload`, `uploading`, `importHint`, `loading`, `empty`, `error`, `retry`, `validation`, `descriptionRequired`, `remarkRequired`, `deleteConfirm`, `saveSuccess`, `importSuccess`, `exportError`, `fileTypeError`, `authChecking`, `authRequired`, and `authUnavailable`.

- [ ] **Step 2: Run the focused localization test and verify RED**

Run `npm test -- test/localization/localization-adapter.test.ts --reporter=verbose`; expected: new keys fall back to their key strings.

- [ ] **Step 3: Add concise Thai/English dictionary entries**

Add the keys under `qcItem.*` in both existing dictionaries. Keep technical endpoint/action names out of user-facing text, use existing `…` loading style, and retain the existing fallback behavior.

- [ ] **Step 4: Run localization and full tests**

Run the focused test and `npm test -- --reporter=dot`; expect all pass.

## Task 5: Implement the authenticated QCItem page

**Files:**
- Create: `Nuxt/app/pages/master/qc-item/index.vue`
- Test: `Nuxt/test/qc-item/qc-item-page.test.ts`

**Interfaces:**
- Use `useApiClient`, `useFileCapability`, `useLocalizationAdapter`, `useSessionAdapter`, `TargetState`, and `TargetDialog` exactly like the existing manual target route.
- Page-local state includes `accessStatus`, `listStatus`, `items`, `currentPage`, `saveStatus`, `saveError`, `importDialogOpen`, `selectedFile`, `importStatus`, `importError`, and `fileInput`.

- [ ] **Step 1: Write failing page tests for auth and initial read**

Stub the four target composables and `useHead`, then cover:

1. Anonymous session renders the auth error, redirects once, and makes no protected API call.
2. Authenticated session calls `CSM/Master/QCItem_ReadList`, renders the five required columns, and displays an empty state for `[]`.
3. A read failure renders `TargetState` error plus retry action.

The API stub must expose `get`, `post`, and `postForm` so page behavior is tested against the service boundary rather than a direct fetch.

- [ ] **Step 2: Run page tests and verify RED**

Run `npm test -- test/qc-item/qc-item-page.test.ts --reporter=verbose`; expected: failure because the page does not exist.

- [ ] **Step 3: Implement page access, read state, and table**

Implement `onMounted` auth initialization. For authenticated users, call `readList`, normalize the raw array, reset `currentPage` to 1, and render loading/empty/error/ready states through `TargetState`. The table must render:

- No. — one-based global row number computed as `(currentPage - 1) * PAGE_SIZE + rowIndex + 1`.
- Action — delete button with a localized accessible label.
- Description — `<input>` bound to `item.itemname`.
- Remark — `<input>` bound to `item.remark`.
- Add Date — formatted with `formatQCItemDate`.

Do not introduce ag-Grid or a new table dependency. Use semantic labels/captions, keyboard-focusable buttons, `aria-label`, and responsive table overflow.

- [ ] **Step 4: Add failing tests for add/edit/delete/paging/save**

Cover these user-visible behaviors:

```ts
it('adds a blank row, edits it inline, and moves to the last page', async () => {
  getContext.mockReturnValue({ isAuthenticated: true })
  apiGet.mockResolvedValue({ ok: true, status: 200, data: Array.from({ length: 10 }, (_, index) => ({
    itemno: index + 1,
    itemname: `Description ${index + 1}`,
    remark: 'Remark',
  })) })
  const wrapper = mount(QCItemPage)
  await flushPromises()

  await wrapper.get('[data-testid="qcitem-add"]').trigger('click')

  expect(wrapper.text()).toContain('2')
  expect(wrapper.find('[data-testid="qcitem-page-2"]').attributes('aria-current')).toBe('page')
  expect(wrapper.find('[data-testid="qcitem-description-11"]').exists()).toBe(true)
  await wrapper.get('[data-testid="qcitem-description-11"]').setValue('New description')
  expect((wrapper.get('[data-testid="qcitem-description-11"]').element as HTMLInputElement).value)
    .toBe('New description')
})

it('deletes an existing row after the confirmation dialog is accepted', async () => {
  getContext.mockReturnValue({ isAuthenticated: true })
  apiGet.mockResolvedValue({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Description', remark: 'Remark' }] })
  vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
  const wrapper = mount(QCItemPage)
  await flushPromises()

  await wrapper.get('[data-testid="qcitem-delete-1"]').trigger('click')

  expect(wrapper.find('[data-testid="qcitem-description-1"]').exists()).toBe(false)
  expect(apiPost).not.toHaveBeenCalled()
})

it('blocks save and identifies the first incomplete row', async () => {
  getContext.mockReturnValue({ isAuthenticated: true })
  apiGet.mockResolvedValue({ ok: true, status: 200, data: [{ itemno: 7, itemname: 'Description', remark: '' }] })
  const wrapper = mount(QCItemPage)
  await flushPromises()

  await wrapper.get('[data-testid="qcitem-save"]').trigger('click')

  expect(wrapper.text()).toContain('Remark is required')
  expect(apiPost).not.toHaveBeenCalled()
})

it('sends the full current dataset under item and reloads after success', async () => {
  getContext.mockReturnValue({ isAuthenticated: true })
  apiGet
    .mockResolvedValueOnce({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Old', remark: 'Remark' }] })
    .mockResolvedValueOnce({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Updated', remark: 'Remark' }] })
  apiPost.mockResolvedValue({ ok: true, status: 200, data: {} })
  const wrapper = mount(QCItemPage)
  await flushPromises()
  await wrapper.get('[data-testid="qcitem-description-1"]').setValue('Updated')
  await wrapper.get('[data-testid="qcitem-save"]').trigger('click')
  await flushPromises()

  expect(apiPost).toHaveBeenCalledWith('CSM/Master/QCItem_Create', {
    item: [{ itemno: 1, itemname: 'Updated', remark: 'Remark' }],
  })
  expect(apiGet).toHaveBeenCalledTimes(2)
})
```

Use actual DOM actions and assert request bodies/results, not only that a mock function was called.

- [ ] **Step 5: Run the focused page tests and verify RED for the new cases**

Run the focused page test; expected: failures for the unimplemented action handlers.

- [ ] **Step 6: Implement row actions and replace-all save**

The Add action pushes `createNewQCItem(items, new Date())` and sets `currentPage` to the last page. Delete uses native `window.confirm` only when the row has a non-empty description, removes by row identity/item number, clamps the page, and does not call the backend until Save. Save runs `validateQCItems`, shows the localized validation message, calls `create(items)` with only editable fields needed by the backend, keeps a loading/disabled state, reloads on successful `QCItem_Create`, and renders API errors without losing local edits.

- [ ] **Step 7: Run add/edit/delete/paging/save tests and the full suite**

Run the focused test, then `npm test -- --reporter=dot`; expected: all pass.

## Task 6: Implement import dialog and server export

**Files:**
- Modify: `Nuxt/app/pages/master/qc-item/index.vue`
- Modify: `Nuxt/test/qc-item/qc-item-page.test.ts`

- [ ] **Step 1: Add failing import/export page tests**

Cover:

```ts
it('opens the import dialog for an xlsx file, uploads field file, and reloads on success', async () => {
  getContext.mockReturnValue({ isAuthenticated: true })
  apiGet.mockResolvedValue({ ok: true, status: 200, data: [] })
  apiPostForm.mockResolvedValue({ ok: true, status: 200, data: true })
  const wrapper = mount(QCItemPage)
  await flushPromises()
  const file = new File(['xlsx'], 'QCItem.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const input = wrapper.get('[data-testid="qcitem-file-input"]').element as HTMLInputElement
  Object.defineProperty(input, 'files', { configurable: true, value: [file] })
  await wrapper.get('[data-testid="qcitem-file-input"]').trigger('change')

  expect(wrapper.text()).toContain('QCItem.xlsx')
  await wrapper.get('[data-testid="qcitem-upload"]').trigger('click')
  await flushPromises()

  const form = apiPostForm.mock.calls[0][1] as FormData
  expect(form.get('file')).toBe(file)
  expect(apiGet).toHaveBeenCalledTimes(2)
})

it('keeps the import dialog open and shows the server error when upload fails', async () => {
  getContext.mockReturnValue({ isAuthenticated: true })
  apiGet.mockResolvedValue({ ok: true, status: 200, data: [] })
  apiPostForm.mockResolvedValue({ ok: false, error: { code: 'api', message: 'Invalid workbook' } })
  const wrapper = mount(QCItemPage)
  await flushPromises()
  const input = wrapper.get('[data-testid="qcitem-file-input"]').element as HTMLInputElement
  Object.defineProperty(input, 'files', { configurable: true, value: [new File(['bad'], 'bad.xlsx')] })
  await wrapper.get('[data-testid="qcitem-file-input"]').trigger('change')
  await wrapper.get('[data-testid="qcitem-upload"]').trigger('click')
  await flushPromises()

  expect(wrapper.find('[data-testid="qcitem-import-dialog"]').exists()).toBe(true)
  expect(wrapper.text()).toContain('Invalid workbook')
})

it('opens the server export token through FileCapability with download=true', async () => {
  getContext.mockReturnValue({ isAuthenticated: true })
  apiGet
    .mockResolvedValueOnce({ ok: true, status: 200, data: [] })
    .mockResolvedValueOnce({ ok: true, status: 200, data: 'server-token' })
  apiOpenUrl.mockReturnValue('/service/Api/File/DownLoad?download=true&id=server-token')
  const open = vi.fn()
  vi.stubGlobal('open', open)
  const wrapper = mount(QCItemPage)
  await flushPromises()
  await wrapper.get('[data-testid="qcitem-export"]').trigger('click')
  await flushPromises()

  expect(apiOpenUrl).toHaveBeenCalledWith('server-token', { download: true })
  expect(open).toHaveBeenCalledWith('/service/Api/File/DownLoad?download=true&id=server-token', '_blank', 'noopener')
})
```

Stub `window.open` and the file capability. Test the actual `FormData.get('file')`, token value, and localized success/error state.

- [ ] **Step 2: Run the focused tests and verify RED**

Run `npm test -- test/qc-item/qc-item-page.test.ts --reporter=verbose`; expected: import/export cases fail before handlers exist.

- [ ] **Step 3: Implement `.xlsx` import flow**

Render a hidden `<input type="file" accept=".xlsx">` and an Import button. Clicking Import invokes the input. On change, reject a missing or non-`.xlsx` file with `fileTypeError`; otherwise store the file and open `TargetDialog`. The dialog shows filename, Cancel, and Upload controls. Upload disables controls while `importFile` runs, keeps the dialog open on error, and on success closes the dialog, clears the input/file state, resets the import status, and reloads the list. The UI must state that the server-generated export can be used for round-trip import; do not fabricate a client-side workbook or add an xlsx dependency because no dedicated template endpoint exists.

- [ ] **Step 4: Implement server export flow**

The Export button calls `exportFile`. On success, pass the raw `result.data` token unchanged to `files.openUrl(result.data, { download: true })` and call `window.open(url, '_blank', 'noopener')`. On failure, show a localized error state/message and keep the page usable. Do not parse, decode, or append `noToken`.

- [ ] **Step 5: Run import/export tests and the full suite**

Run the focused page tests and `npm test -- --reporter=dot`; expected: all pass.

## Task 7: Responsive/accessibility polish and static validation

**Files:**
- Modify: `Nuxt/app/pages/master/qc-item/index.vue`.

- [ ] **Step 1: Add page-scoped target styles**

Use existing `--target-*` tokens and native target classes. Add a compact action bar, total-count text, editable-cell input styling, table minimum width/overflow, page controls, dialog file summary, and a mobile breakpoint that stacks actions while preserving table horizontal scroll. Keep styles scoped to the page.

- [ ] **Step 2: Add page tests for state/keyboard affordances**

Assert buttons have accessible labels, Save/Upload are disabled while their request is pending, TargetState is used for loading/empty/error, and dialog Cancel closes without uploading. Keep these as component-level tests, not snapshot-only tests.

- [ ] **Step 3: Run all automated validation**

From `Nuxt/`, run:

```text
npm test -- --reporter=dot
npm run build
npm run generate
```

Expected: all tests pass and both Nuxt build and static generation exit 0. Inspect `Nuxt/.output/public/master/qc-item/index.html` (served under `/csm-next/master/qc-item/` by the configured base URL) to confirm the target artifact contains the QCItem route; generated output remains ignored and is not committed.

- [ ] **Step 4: Run repository audit commands**

From the worktree root, run:

```text
git diff --check
git status --short
rg -n "QCItem|qc-item|CSM/Master/QCItem" Nuxt/app Nuxt/test docs/superpowers/plans/2026-09-14-qcitem-migration.md
rg -n "Website/|\\bWebsite\\b|ag-grid|\\$xt|\\$linq|noToken" Nuxt/app/pages/master/qc-item Nuxt/app/features/qc-item Nuxt/test/qc-item
```

Expected: only the planned Nuxt files, plan, and Thai QA document are changed; no `Website/**` files are changed; QCItem target code contains no legacy globals, ag-Grid, or forbidden `noToken`; action paths and the plan references are present.

- [ ] **Step 5: Perform final diff review against the plan**

Read the complete `git diff`, verify every acceptance item against the diff and tests, confirm `Website/AGENTS.md` is absent from the worktree diff, confirm no package/lockfile/schema/backend changes, and report any live backend/auth/filename/bytes parity checks that remain unavailable. Do not commit, push, or create a PR unless separately requested.

## Known UAT Gate

The frontend implementation can be completed with mocked/unit evidence, but final UAT still requires a real authenticated backend session. Specifically verify:

- `QCItem_ReadList` returns the current company’s raw array.
- `QCItem_Create` persists the full replace-all list and enforces backend renumbering.
- `QCItem_Import` accepts the generated `.xlsx` and does not update another company’s row when the same `itemno` exists (backend source currently lacks `maincode` in its lookup; this is outside Issue #22 frontend scope).
- `QCItem_ExportExcel` returns a valid token, real bytes, and the expected server filename through `Api/File/DownLoad?download=true&id=...`.
- missing credential, 401, and 403 behavior matches the actual deployment.

These are release/UAT checks, not reasons to add backend changes to this frontend branch.
