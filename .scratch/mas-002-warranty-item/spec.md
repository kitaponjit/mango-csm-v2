# mas_002 Warranty Item Core — Architecture-Aligned Specification

## 1. Goal and approved boundary

Implement Warranty Item Core inside `frontend/`, the existing Nuxt 4.5.2 + Vue 3 SPA. All newly owned Warranty Item code uses TypeScript; Vue SFC logic uses `<script setup lang="ts">`.

The capability preserves the registered target route `/page/master/v_csm_mas_002/` and authorization key `CSM_WEB / 20820`. It replaces or composes through the current route-owned implementation without creating `/csm-next/**`, reviving `Nuxt/`, or modifying `Website/`.

The core slice includes list/search/server paging, create/edit, delete, Master Import, and server export. Reference IC and 22-field Auto Import remain deferred.

## 2. Ownership and evidence

| Boundary | Classification | Rule |
|---|---|---|
| `frontend/` | TARGET | Owns runtime implementation, tests, and the minimum typed integration seams. |
| `Website/` | LEGACY | Read-only source for observable behavior and existing client contract usage. |
| `Nuxt/` | HISTORY_ONLY | Read-only source for typed patterns and migration lessons; no runtime imports or production edits. |
| Backend repository | CONTRACT OWNER | Confirms server semantics that client source cannot prove. It is not available in this checkout. |

Existing JavaScript in `frontend/` is preserved unless a scoped route integration change is required. The feature does not authorize broad conversion, adjacent-page refactoring, or a second Nuxt application.

## 3. Target route and access contract

### Verified repository contract

- Route name: `v_csm_mas_002`.
- Route path: `/page/master/v_csm_mas_002/`.
- Current resolution: `frontend/app/Components/Pages/Master/v_csm_mas_002.vue`.
- Route metadata: `auth: true`, menu `CSM_WEB / 20820`, rights check enabled.
- Menu: `frontend/app/Components/Layouts/menu.vue` links item `20820` to the same path.

The capability preserves the path and menu identity. Whether external bookmarks or integrations depend on the URL is **UNVERIFIED**, so a route rename is not authorized.

### Required access behavior

1. Anonymous users follow the existing target login behavior.
2. Users without the enabled `CSM_WEB / 20820` right reach Access Denied.
3. Read-only users may inspect the catalog but cannot invoke create, edit, delete, import, or export actions that require write permission.
4. Access state and list generations prevent late responses from repopulating an unauthorized, reset, or newer view.
5. No authentication, token, or SSO contract is redesigned in this slice.

## 4. TypeScript requirements

The future feature PR must define and use typed boundaries for at least:

- `WarrantyItemListQuery`, list response, row, and normalized pagination state.
- Search/filter, loading, empty, error, and retry state.
- `WarrantyItemFormState`, validation state, create payload, and update payload.
- Warranty Group lookup request/result and default-selection state.
- Delete request/result and per-row mutation state.
- Selected import file, upload request/response, mapped preview row, validation error, submission payload/result, and import pending state.
- Export request, token result, download result, and export pending state.
- Normalized success/failure result and error model.

Raw network, vendor-global, spreadsheet, and browser values are `unknown` until narrowed. `any` is not a default escape hatch; each unavoidable use must document the external boundary.

The current `frontend/` tree has no tracked application `tsconfig.json`, typecheck script, feature-test baseline, typed API client, typed session/access service, typed file/download abstraction, or typed Warranty Group service. The implementation phase must establish only the minimum viable seams needed by Warranty Item and review shared changes separately. This documentation PR creates none of that infrastructure.

## 5. Capability behavior

### 5.1 List, search, and server paging

1. Initial navigation shows an explicit loading state and requests page one with `skip=0`, `take=500`, field `war_code`, empty text, and `active=Y`.
2. A successful empty response shows an empty state, not a loading spinner or error.
3. Search supports Warranty Code and Warranty Name, preserves entered criteria on failure/retry, and resets the current page to one before requesting.
4. Changing the active filter resets to page one before requesting.
5. `active=N` preserves the current client-observed meaning of the unchecked/all-records state; backend filtering semantics require runtime confirmation.
6. First, Previous, numbered, Next, and Last controls derive boundaries from server `total`; row numbers equal `skip + index + 1`.
7. A request failure keeps the current query and filter state and offers retry without displaying stale data as fresh.
8. Each request has a generation/request identifier. Only the latest still-authorized request may commit rows, totals, loading, or error state.

### 5.2 Create and edit

1. Form state, validation, payloads, pending state, and results are typed.
2. Warranty Code is required, trimmed, limited to 15 characters, and immutable after creation. The exact allowed-character rule is **UNVERIFIED** and requires backend/business confirmation before implementation.
3. Warranty Name is required and limited to 150 characters based on current client fields; backend validation requires confirmation.
4. Days, Months, and Years accept non-negative discrete integers. Lifetime sets all three to zero and disables their inputs.
5. Material Code remains manual input; a new picker is out of scope.
6. Add requires an active Warranty Group lookup and selects `default_ == 'Y'` only when returned. `frontend/` has no typed `WarrantyGroupService`; the feature must introduce or adapt the minimum typed lookup capability rather than assume one exists.
7. Edit loads current data by Warranty Code before opening the editable state.
8. Save is disabled while pending and the handler rejects duplicate invocation.
9. Invalid input sends no request. A failed read/save preserves useful form context and leaves the dialog available for correction.
10. A successful save closes the dialog, reports success once, and reloads the current list query.
11. Reference IC fields are not intentionally edited. Whether read-one metadata must round-trip unchanged in an update payload is **REQUIRES BACKEND CONFIRMATION**; do not strip, reinterpret, or mutate it by assumption. The business meaning remains an **UNVERIFIED DOMAIN TERM — REQUIRES DOMAIN/BUSINESS CONFIRMATION**.

### 5.3 Delete

1. Confirmation identifies both Warranty Code and Warranty Name; cancel sends no request.
2. Delete request/result and error normalization are typed.
3. The affected row/action remains pending until the request settles; repeated clicks while pending send no additional request.
4. Server rejection leaves the row visible and displays the normalized server message. The exact referential rules and tables are **REQUIRES BACKEND CONFIRMATION**.
5. Success reports once and reloads a valid page.
6. After deletion, compute `maxPage = max(1, ceil(totalAfterDelete / pageSize))` for non-empty data and request `min(currentPage, maxPage)`. If the dataset becomes empty, request/show page one with an empty state.
7. Required edge evidence includes normal deletion, the last row on a non-final page, the last row on the final page, and the dataset becoming empty.
8. Example: page 3, page size 10, total 21; deleting row 21 makes total 20 and clamps the next request to page 2.

### 5.4 Master Import

The observed target flow has two network stages and both require typed boundaries.

1. The selected value is `File | null`; client validation permits `.xls` and `.xlsx` extensions, matching `frontend/app/Components/Center/import-data.vue`. MIME validation is **UNVERIFIED**.
2. Spreadsheet parsing/preview upload uses `Anywhere/Import/ImportExcel` as multipart form data with field name `file` in the current client. The observed client reads rows from `rsp.data.data` and file metadata from `rsp.data.filepath` / `rsp.data.filename`; the authoritative backend response contract requires confirmation.
3. The user maps and previews 12 Warranty Item fields. The current client default maps source columns A–H and J–M; column I is unused. A contiguous A–L contract is not verified and must not be asserted.
4. The mapped fields are `war_code`, `war_des`, `type_code`, `tot_date`, `tot_month`, `tot_year`, `lifetime`, `itemcode`, `vendor`, `war_date_start`, `war_date_end`, and `active`.
5. Feature submission uses one observed JSON request to `CSM/Master/WarrantyItemImportData_Master` with `{ data: [...] }`.
6. File selection, upload, preview validation, mapped rows, submission, and server errors have distinct typed states.
7. Upload and submission controls disable while their respective request is pending; duplicate invocations send no additional request.
8. Invalid selection, upload failure, invalid preview/mapping, and submit failure preserve useful context and never report success.
9. On confirmed success, close the import flow and reload the current catalog query.
10. Blank-code handling, value normalization, transaction atomicity, upsert behavior, validation-error shape, and processed-count semantics are **REQUIRES BACKEND CONFIRMATION**. Do not fabricate a processed count when the response does not provide one.

### 5.5 Server export

1. `frontend/` must own a typed file/download abstraction suitable for Warranty Item. The historical `Nuxt/` file capability is design evidence only and is not imported.
2. The current clients configure GET `CSM/Master/WarrantyItemExport_Master`; no request parameters are observed.
3. Current shared form code treats `rsp.data` as the server-minted token and opens `{dataServer}API/File/DownLoad?download=true&id={token}`.
4. Backend knowledge verifies that download ids are server-minted tokens passed verbatim; the endpoint-specific export response and runtime round trip still require confirmation.
5. Export pending state prevents duplicate requests. Missing/invalid tokens, request failure, and observable popup/download-open failure produce an error and no success notification.
6. Export never serializes the currently loaded page and does not use `XLSX.writeFile`.

## 6. Contract registry

Statuses describe current evidence, not desired behavior.

| Contract | Status | Evidence |
|---|---|---|
| Target route `/page/master/v_csm_mas_002/` | VERIFIED | `frontend/app/routes/routes.master.js` and target menu link. |
| Menu/access identity `CSM_WEB / 20820` | VERIFIED | Target route metadata and menu source. |
| External dependency on route URL | UNVERIFIED | No repository evidence proves third-party use. |
| List endpoint and query names | VERIFIED | Both current clients call `WarrantyItem_ReadList` with `skip`, `take`, `field`, `text`, and `active`. |
| List response keys `data_rows` and `total` | VERIFIED | Both clients read these keys; this verifies current client usage, while malformed/runtime variants still need integration tests. |
| Read-one endpoint | VERIFIED | Both clients call `WarrantyItem_Read?war_code=`. |
| Create endpoint | VERIFIED | Both clients call `WarrantyItem_Create`. |
| Update endpoint spelling `WarrantyItem_Update` | VERIFIED | Exact casing appears in both clients; no alternate casing is authoritative. |
| Create/update minimum accepted payload | REQUIRES BACKEND CONFIRMATION | Current clients send `{ header: formData }`; the server-owned accepted/ignored fields are not proven here. |
| Read-one metadata round trip during Update | REQUIRES BACKEND CONFIRMATION | Current Edit re-posts `formData`; client source does not prove which metadata must be retained or omitted. |
| Delete endpoint | VERIFIED | Both clients call `WarrantyItem_Delete`. |
| Delete minimum payload and referential semantics | REQUIRES BACKEND CONFIRMATION | Current clients send `{ header: row }`; accepted minimum fields and guard behavior require owning backend evidence. |
| Import parser endpoint, multipart field `file`, and client-read response fields | VERIFIED | Current client usage in `frontend/app/Components/Center/import-data.vue`; backend semantics are classified separately. |
| Master Import endpoint and `{ data: [...] }` request wrapper | VERIFIED | Current usage in both Warranty Item clients; backend semantics are classified separately. |
| Import validation, atomicity, upsert, blank-code, and count semantics | REQUIRES BACKEND CONFIRMATION | Not proven by client source. |
| Export endpoint and token pass-through shape | VERIFIED | Current client usage in the Warranty page and shared form component; endpoint-specific backend semantics are classified separately. |
| Export token generation and download-id semantics | VERIFIED | `docs/backend/contract-navigation-knowledge.md` E9; endpoint-specific round trip still needs execution. |
| Reference IC meaning | UNVERIFIED DOMAIN TERM — REQUIRES DOMAIN/BUSINESS CONFIRMATION | UI label/fields are insufficient to define the business term. |

## 7. Implementation ownership

All production code and tests created for this capability live under `frontend/`. Exact feature directories and filenames are deferred to the implementation plan because the target currently has no established typed feature folder or test layout.

The implementation plan must identify the smallest set of:

- Route/component integration files.
- Capability-owned TypeScript model, service, and state files.
- Typed Warranty Group lookup seam.
- Typed API/result and file/download seams.
- Focused test files and their runner/configuration.
- Typecheck/build commands.

`Nuxt/app/**`, `Nuxt/test/**`, and `/csm-next/**` may appear only as historical evidence, never as target ownership.

## 8. Test and verification plan

Tests assert observable behavior: requests, exact endpoint names, payloads, normalized responses, rendered access/loading/empty/error states, pending controls, duplicate-mutation prevention, modal lifecycle, page clamp, and reload behavior.

Each feature ticket follows RED → GREEN → focused regression. The future feature PR must run the established `frontend/` build plus the newly approved typecheck and test commands. Local tests do not prove backend parity, browser behavior, authorization in a real tenant, or UAT.

Required integration evidence includes:

- Route/menu navigation and authorization with real target middleware.
- Endpoint round trips against the owning backend.
- Create/update accepted payload fields and validation errors.
- Delete guard response semantics.
- Import upload and batch-result semantics.
- Export token/download round trip and popup behavior.

## 9. Dependencies and stop conditions

```text
Architecture enablement
└── Ticket 01: shell/access/list
    ├── Ticket 02: create/edit + typed Warranty Group lookup
    ├── Ticket 03: delete/guard/page clamp
    ├── Ticket 04: Master Import
    └── Ticket 05: server export + typed download abstraction
```

Stop and request confirmation instead of guessing when:

- Backend source/runtime conflicts with a registry entry.
- A typed seam requires a broad shared refactor or package change beyond the minimum capability need.
- Route ownership or deployment would change.
- Delete, import, export, tenant, audit, or Reference IC semantics remain necessary but unverified.
- Implementation would require `Website/`, `Nuxt/`, backend, schema, deployment, or unrelated feature changes.

## 10. Explicitly deferred

- Reference IC toolbar, browsing, linking, mutations, and glossary meaning.
- `WarrantyRefIC` and receipt/date-difference workflows.
- 22-field `WarrantyAutoImportData` workflow.
- Material picker UI.
- Client-side XLSX export fallback.
- Broad TypeScript modernization.
- Warranty Group feature/refactor beyond the required typed lookup seam.
- Backend/controller/DTO/schema/deployment changes.
- Production cutover, legacy retirement, and merge approval.

## 11. Rollback and completion definition

The implementation must preserve the registered `/page/master/v_csm_mas_002/` route and provide a route-level rollback strategy before replacing the current component. The untouched `Website/` implementation remains the behavioral fallback until parity and owner sign-off are complete.

This specification is complete for Supervisor review when it remains consistent with the Epic and tickets, leaves uncertain contracts explicitly classified, and keeps implementation/configuration changes outside this documentation PR.
