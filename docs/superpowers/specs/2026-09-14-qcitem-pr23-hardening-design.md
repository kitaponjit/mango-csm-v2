# QCItem PR #23 Hardening Design

## Objective

Harden the Nuxt QCItem migration in PR #23 so `/csm-next/master/qc-item/` preserves the legacy menu-access contract, provides a safe read-only mode, matches the supported import and date-display contracts, and cannot restore stale data after a newer access decision.

This design keeps Issue #22 frontend-only. It does not change the legacy Website, the .NET backend, database behavior, deployment topology, or other migrated routes.

## Established Boundary

- Legacy `/page/Master/v_csm_mas_011/` remains available as rollback.
- Nuxt owns `/csm-next/master/qc-item/` and uses the existing `SessionAdapter`, `ApiClient`, and `FileCapability` boundaries.
- Target code must not read `window.userRight`, `window.menuRight`, Vuex 3 state, or other legacy globals.
- The existing QCItem endpoints and payloads remain unchanged.
- Menu access is evaluated before any QCItem data request.

## Verified Contracts

### Menu access

`api/public/ViewUserAuthentication` returns the standard envelope `{ success, error, data }`. Its `data` object contains `auth`, `appinfo`, `menu_right`, `lang_code`, and `token`.

The backend uses `menu_name` to retrieve the menu-right collection. It uses `menu_id` only to retrieve page metadata, so the target frontend must exact-match the requested menu ID inside `menu_right`.

QCItem uses these feature constants:

```ts
export const QC_ITEM_MENU_NAME = 'CSM_WEB'
export const QC_ITEM_MENU_ID = '21010'
```

The menu ID remains a string because the route and backend menu contracts represent it as text.

The backend exposes both `auth.is_authen` and `auth.is_authenticated` and sets them together. The access adapter reads `auth.is_authen` to match the established frontend contract.

### Read-only semantics

`isreadonly` and `issaveas` are separate backend permission fields. For this feature, an enabled menu row with `isreadonly === 1` means:

- ReadList, pagination, and Export are allowed.
- Add, inline editing, Delete, Save, opening Import, file selection, and Upload are forbidden.

This policy is explicit for QCItem and does not introduce a generic interpretation of `issaveas` for other target routes.

### Import format

QCItem import supports `.xlsx` only. The .NET 8 implementation validates the `.xlsx` extension and reads the workbook with `ExcelPackage`. The legacy input's `.xls` accept value is a legacy UI mismatch, not evidence of server support.

The target input and message copy must state `.xlsx`. A selected `.xls` or any other extension must be rejected before `postForm` is called.

### Date display

Add Date displays `DD/MM/YYYY HH:mm:ss`.

- ISO-like backend values preserve their wall-clock date and time components without an implicit timezone shift.
- `.NET /Date(...)` values and JavaScript `Date` objects are rendered in local time.
- Missing or invalid values render as an empty string.

## Access-Control Boundary

Add a target-owned, reusable `AccessControlService`. The page supplies the menu identity, but it never receives or interprets the raw authentication payload.

```ts
import type { ApiError } from '~/services/http/api-client'

export type AccessControlResult =
  | { status: 'anonymous' }
  | { status: 'denied' }
  | { status: 'readonly' }
  | { status: 'editable' }
  | { status: 'error'; error: ApiError }

export interface AccessControlService {
  checkMenuAccess(menuName: string, menuId: string): Promise<AccessControlResult>
}
```

The service calls:

```text
api/public/ViewUserAuthentication?menu_name=CSM_WEB&lang_code=&menu_id=21010
```

Both query values must be encoded by the service. The `ApiClient` continues to own credential headers, missing-session behavior, invalid-session handling, envelope normalization, and network/HTTP error classification.

The service evaluates the normalized response with fail-closed rules:

1. An API result with error code `unauthenticated` becomes `anonymous`.
2. Other API failures become `error` and preserve the `ApiError`.
3. A response without an object `auth`, boolean `auth.is_authen`, or array `menu_right` becomes `error` with code `invalid-response`.
4. `auth.is_authen !== true` becomes `anonymous`.
5. Filter `menu_right` by exact string equality for both `menu_name` and `menu_id`.
6. Zero exact rows becomes `denied`.
7. More than one exact row becomes `error`, regardless of whether the duplicate rows carry identical or conflicting permissions.
8. One exact row with `isenabled === 0` becomes `denied`.
9. One exact row with `isenabled === 1` and `isreadonly === 1` becomes `readonly`.
10. One exact row with `isenabled === 1` and `isreadonly === 0` becomes `editable`.
11. Any other `isenabled` or `isreadonly` value becomes `error`.

No project-right behavior is added. QCItem has no `pre_event` or `pre_event2` context, and introducing project-scoped authorization here would be speculative.

The Nuxt client plugin composes the service from the existing `ApiClient` and exposes it through `useAccessControlService()`. The access service remains independent of QCItem types and endpoints.

## Page State and Request Ownership

The page owns separate access and data state:

```ts
type AccessViewState = { status: 'checking' } | AccessControlResult
type ViewStatus = 'idle' | 'loading' | 'ready' | 'error'
```

`accessResult` controls whether the feature is accessible. `listStatus` and `listError` describe QCItem data only. Access failures must never be shown as data-load failures, and each retry action must retry only its owning flow.

Initialization follows this sequence:

```text
Page mount
→ no local session: anonymous → redirect login
→ local session present: checking → checkMenuAccess(CSM_WEB, 21010)
  → anonymous: redirect login; clear data; stop
  → denied: show access-denied state; clear data; stop
  → error: show access-error state; clear data; stop
  → readonly/editable: load QCItem data
```

`anonymous`, `denied`, and `error` must call `QCItem_ReadList` zero times. Only `readonly` and `editable` may start a read.

The page maintains a monotonically increasing access generation. Starting or retrying an access check increments the generation, clears the current rows, and invalidates both the previous access request and every ReadList request it started. Before applying either an access response or its downstream ReadList response, the page compares the captured generation with the current generation. A stale response performs no state update.

This protects the sequence where generation 1 is allowed and starts ReadList, generation 2 later becomes denied, and generation 1's ReadList returns last.

## Action Guards

The page centralizes edit and export eligibility:

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

Add, Delete, Save, open Import, file selection, and Upload return immediately when `canEdit` is false. Inputs are disabled when `canEdit` is false. The normal Cancel/close action remains disabled while an Upload is pending, matching the existing mutation lock. Starting a new access generation forcibly closes and clears the dialog regardless of its previous import status so a stale editable dialog cannot survive a newer access decision.

Export returns immediately when `canExport` is false. This guard is required in addition to the button's disabled state. Pagination remains available in read-only mode but stays disabled while existing data-busy operations are active.

When access leaves `editable`, the page closes the import dialog and clears its selected file and import feedback.

## Error Handling and Retry

- Access errors show an access-specific `TargetState` and an access retry action.
- Access denial shows an access-denied `TargetState` without a data retry action.
- Anonymous state redirects through `SessionAdapter` and retains the existing sign-in fallback presentation.
- Data errors appear only after access has resolved to `readonly` or `editable`; their retry action reruns ReadList within the current access generation.
- A ReadList retry does not recheck menu access. A full access retry starts a new generation and invalidates all earlier reads.
- Mutation and export errors remain attached to their existing action-specific feedback.

## Test Strategy

### Access-control unit tests

Cover all service decisions without mounting a page:

- URL construction and encoding for `menu_name` and `menu_id`.
- `unauthenticated` API failure becomes `anonymous`.
- Network, HTTP, forbidden, API, and invalid-response failures become `error` with the original `ApiError`.
- Missing/non-object `auth`, non-boolean `auth.is_authen`, and missing/non-array `menu_right` fail closed.
- `auth.is_authen === false` becomes `anonymous`.
- Wrong menu name, wrong menu ID, or one disabled exact row becomes `denied`.
- One enabled exact row with `isreadonly: 1` becomes `readonly`.
- One enabled exact row with `isreadonly: 0` becomes `editable`.
- Every duplicate exact-row case becomes `error`, including an enabled/disabled conflict and identical permissions.
- Unsupported `isenabled` or `isreadonly` values do not grant access.

### QCItem page tests

- Local anonymous session does not call Access API or QCItem API and redirects once.
- Access `anonymous`, `denied`, and `error` call `QCItem_ReadList` zero times.
- Access `readonly` and `editable` resolve before `QCItem_ReadList` starts.
- Read-only users can load, paginate, and Export.
- Every read-only mutation path calls QCItem `create` and `importFile` zero times.
- Read-only UI has disabled inputs and no usable Add, Delete, Save, or Import controls.
- `handleExport` performs no API or popup work when `canExport` is false.
- A stale access response cannot overwrite a newer decision.
- A stale downstream ReadList response cannot restore rows after a newer denied, anonymous, or error decision.
- Existing editable add, validation, delete, replace-all save, import, popup-safe export, loading lock, and error behavior remains covered.
- `.xlsx` reaches `postForm` using field `file`; `.xls` and unrelated extensions call `postForm` zero times.

### Model tests

- ISO-like date strings render `DD/MM/YYYY HH:mm:ss` without timezone shifting.
- `.NET /Date(...)` and `Date` objects render local date and time including seconds.
- Missing and invalid date values render empty strings.

### Automated verification

Run the focused tests first, then the full target verification from `Nuxt/`:

```powershell
npm test -- --reporter=dot test/access-control/access-control-service.test.ts
npm test -- --reporter=dot test/qc-item/qc-item-model.test.ts test/qc-item/qc-item-page.test.ts
npm test -- --reporter=dot
npm audit
npm run build
npm run generate
git diff --check origin/main...HEAD
```

Confirm the generated route exists at `.output/public/master/qc-item/index.html`. Automated frontend tests are not integration or production-authorization evidence.

### UAT

Exercise `/csm-next/master/qc-item/` with real authenticated accounts representing:

1. No enabled `CSM_WEB/21010` right: access denied and no QCItem request.
2. Enabled read-only right: list and Export work; mutation and Import do not.
3. Enabled editable right: list, add/edit/delete, replace-all Save, `.xlsx` Import, and Export work.

Repeat the essential flows at desktop width and 390 px. Verify Thai and English copy, Add Date seconds, missing/expired authentication, access retry, data retry, export filename/bytes, and persistence after reload.

## Security Boundary and Follow-ups

The Nuxt check restores route/UI authorization parity; it is not a complete server-side security boundary. The current QCItem backend actions require authentication but do not enforce `CSM_WEB/21010`, so a directly issued authenticated API request can bypass the frontend menu decision.

Create a separate security follow-up to enforce menu authorization on `QCItem_ReadList`, `QCItem_Create`, `QCItem_Import`, and `QCItem_ExportExcel` at the backend. That work requires backend ownership, compatibility tests, and real-environment validation and does not expand Issue #22.

Create a separate enhancement only if legacy `.xls` compatibility is still required. It must cover backend BIFF parsing or a controlled `.xls`-to-`.xlsx` conversion flow plus backend integration tests; changing the frontend accept list alone is not support.

## Acceptance Criteria

- The page checks `CSM_WEB/21010` through the target-owned access service before ReadList.
- The page treats anonymous, denied, malformed, duplicate, and failed access results as fail-closed.
- Read-only users can read and Export but cannot invoke any mutation or Import path.
- Stale access and ReadList responses cannot overwrite a newer access generation.
- Add Date matches `DD/MM/YYYY HH:mm:ss` without unintended timezone conversion.
- `.xlsx` import works and `.xls` is rejected before any backend request.
- Access and data failures remain distinct and retry the correct flow.
- Focused and full automated verification passes, and real-account UAT records separate results for denied, read-only, and editable users.
- The PR and QA notes explicitly state that server-side menu authorization and `.xls` compatibility remain separate follow-ups.
