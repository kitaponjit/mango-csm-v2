# mas_002 Warranty Item (Core Slice) — Formal Implementation Specification

## 1. Problem statement

Warranty Items are still managed through the legacy Vue 2 screen at `/page/master/v_csm_mas_002/`. That screen combines the ordinary warranty catalog with Reference IC linking and a multi-table Auto Import workflow. The combined surface contains legacy quirks and makes the core catalog unavailable to the `/csm-next/` migration surface.

The migration target is the ordinary Warranty Item catalog only. It must preserve the verified legacy API behavior and remain safe to operate beside the untouched legacy screen. It must not broaden into Reference IC, receipt linking, or Auto Import work.

## 2. Goal and approved boundary

Build the core Warranty Item capability at:

`/csm-next/master/warranty-item/`

The slice must provide:

- Catalog list, search, active filtering, and server paging.
- Authentication and `CSM_WEB / 20820` menu-right enforcement.
- Create and edit, including Warranty Group default selection.
- Delete with server-enforced referential-integrity protection.
- The verified 12-column Master Import workflow.
- Server-side catalog export through the shared file capability.

The legacy page, route, menu entries, and backend remain operational and unchanged by this slice.

## 3. User-visible behavior

### 3.1 Catalog and navigation

1. An authenticated user with read access can navigate to the target route and see the Warranty Item catalog.
2. The first request loads the first server page with `take=500` and active-only filtering (`active=Y`).
3. The user can use First, Previous, numbered pages, Next, and Last controls.
4. Search can target Warranty Code or Warranty Name and accepts free text.
5. Search starts from page one and preserves the selected field and text when retrying a failed request.
6. `active=Y` requests active records only. `active=N` requests the legacy unfiltered result set, including inactive records; this behavior must not be “fixed” in the target UI.
7. Each row displays its pagination-aware row number, Warranty Code, Warranty Name, Warranty Group, duration, Active state, and available audit metadata.
8. Loading, empty, and retryable error states are explicit and mutually understandable.
9. A failed list request does not discard the current search or filter state.

### 3.2 Access control

1. An unauthenticated user is redirected through the existing session/login adapter.
2. A user without `CSM_WEB / 20820` receives an Access Denied state.
3. A read-only user can inspect the catalog but cannot invoke New, Edit, Delete, Import, or Export mutations/actions that require edit permission.
4. Access checks and asynchronous list responses are generation-guarded so stale responses cannot repopulate a reset or unauthorized view.
5. No new authentication or SSO dependency is introduced.

### 3.3 Create

1. An editable user can open an Add Warranty Item dialog.
2. The dialog loads active Warranty Groups using the existing `WarrantyGroupService`.
3. The group with `default_ == 'Y'` is selected automatically when one is available.
4. If no default exists, or the group request fails, the user can select an active group manually; the page does not invent a default.
5. Warranty Code is required, trimmed, limited to 15 characters, and restricted to the verified alphanumeric character set.
6. Warranty Name is required and limited to 150 characters.
7. Days, Months, and Years accept non-negative integers and remain discrete values; they do not roll over into one another.
8. Enabling Lifetime sets Days, Months, and Years to zero and disables those inputs.
9. Material Code is optional and entered manually; no material-picker dialog is added.
10. A valid create submits one atomic request with the verified header contract, closes the dialog, reports success, and reloads the list.
11. Invalid input prevents the request and shows field-level feedback.

### 3.4 Edit

1. An editable user can open Edit for a catalog row.
2. Edit loads fresh data through the single-item read endpoint rather than trusting stale grid data.
3. Warranty Code is displayed read-only and remains the lookup/identity key.
4. The user can change Warranty Name, Warranty Group, discrete duration values, Lifetime, Material Code, and Active status.
5. Existing passive Reference IC metadata may be shown read-only when returned by the read endpoint.
6. Reference IC fields are never sent as mutable update fields and cannot be cleared accidentally.
7. A rejected update leaves the dialog open with the current inputs and displays the server error.
8. A successful update closes the dialog, reports success, and reloads the list.

### 3.5 Delete

1. An editable user must confirm deletion before a request is sent.
2. The confirmation names both Warranty Code and Warranty Name.
3. The request uses the verified delete header shape.
4. If the server reports a reference from unit warranty records or project area allocations, the item remains and the server message is shown.
5. A successful delete reports completion and reloads the current catalog view safely.
6. There is no client-side referential-integrity guess; the server remains authoritative.

### 3.6 Master Import

1. An editable user can open the Master Import dialog.
2. The accepted source has 12 columns, in the verified logical order:
   Warranty Code, Warranty Name, Warranty Group, Days, Months, Years, Lifetime, Material Code, Vendor, Start Date, End Date, Active.
3. The user can map spreadsheet columns A through L to those fields.
4. A preview is shown before submission.
5. Rows with blank Warranty Code are skipped.
6. Active values are normalized according to the verified legacy ingestion behavior.
7. Numeric duration values are coerced to the request representation without introducing rollover behavior.
8. The confirmed mapped rows are submitted as one atomic request to the master import endpoint.
9. Success reports the processed count and reloads the catalog.
10. Import is disabled and its handler is guarded for read-only users.

### 3.7 Server Export

1. An authorized user can request a full tenant catalog extract through the server export endpoint.
2. The server-returned token is passed to the shared file capability for download.
3. Export does not build a client-side file from the currently loaded page.
4. Popup blockage, missing tokens, and download failures report an error and never show a false success message.

## 4. Technical decisions and contracts

### 4.1 Migration seam and reuse

The target route is the only new feature seam. Reuse the existing shared adapters and primitives:

- `ApiClient` for transport and `{ success, error, data }` envelope handling.
- `SessionAdapter` for authentication context and login redirection.
- `AccessControlService` for `CSM_WEB / 20820` access states.
- `TargetState` for loading, empty, and error/retry rendering.
- `TargetDialog` for Add/Edit and Import dialogs.
- `FileCapability` for token-based export download.
- `LocalizationAdapter` for slice-scoped text.
- Existing `WarrantyGroupService` for active groups and `default_ == 'Y'` lookup.

Do not modify shared infrastructure to make this slice fit. Adapt only within the Warranty Item feature/page boundary.

### 4.2 Feature units

The slice is organized as six focused units:

1. Access mapping: menu name/id and access-state handling.
2. Domain model: row types, form types, response normalization, duration/lifetime rules, validation, and pagination helpers.
3. Service: thin methods for the verified Warranty Item API actions.
4. Texts: localized `mas002.*` strings.
5. Import: 12-column parsing, A–L mapping, preview rows, blank-code filtering, and value normalization.
6. Page: route-level composition of access gate, list, dialogs, row actions, import, and export.

No new generic CRUD, pager, importer, or authorization abstraction is justified by this slice.

### 4.3 API contracts

The frontend must preserve these verified contracts. No backend change is part of this work.

| Capability | Contract |
|---|---|
| Read list | `CSM/Master/WarrantyItem_ReadList` with `skip`, `take`, `field`, `text`, `active`; default `take=500` and `active=Y`. |
| Read-list response | The API result envelope contains `data.data_rows` for rows and `data.total` for the filtered count. This differs from Warranty Group's `data.data` shape. |
| Read one | `CSM/Master/WarrantyItem_Read?war_code={code}`; used for fresh Edit prefill and may include material and passive Reference IC metadata. |
| Create | `CSM/Master/WarrantyItem_Create` with `{ header: { war_code, war_des, type_code, tot_date, tot_month, tot_year, lifetime, itemcode, active } }`. |
| Update | `CSM/Master/Warrantyitem_Update` with the same mutable header shape. `war_code` is the lookup key and is immutable. Reference IC fields are omitted. |
| Delete | `CSM/Master/WarrantyItem_Delete` with `{ header: { war_code } }`; the server rejects rows referenced by `rd_mas_area_item` or `rd_mas_proj_warranty`. |
| Import | `CSM/Master/WarrantyItemImportData_Master` with `{ data: Array<Mapped12ColRow> }`; server upserts by tenant and Warranty Code. |
| Export | `CSM/Master/WarrantyItemExport_Master`; the returned token is downloaded using `Api/File/DownLoad?download=true&id={token}` through the shared file capability. |

The request builder must trim user-entered text where the legacy contract expects trimmed values, preserve server-owned tenant/audit fields, and avoid adding client-only fields to payloads.

### 4.4 Domain invariants

- Identity is tenant plus Warranty Code.
- Warranty Code is immutable after creation.
- Warranty Code and Warranty Name validation is enforced before mutation requests.
- Days, Months, and Years are non-negative discrete integers.
- Lifetime is mutually exclusive with non-zero duration inputs and forces all three values to zero.
- The legacy `@change="testday()"` hook is not reproduced; the target has no undefined hook.
- The legacy duplicate `reset()` behavior is replaced by one predictable form initialization path.
- The `active=N` list quirk is preserved.
- Passive Reference IC metadata is display-only and never part of a mutable update payload.
- Server referential-integrity responses are authoritative.
- Tenant scoping and audit authorship remain server-owned.

## 5. Ticket breakdown and acceptance criteria

Exactly five tickets are authorized. T2–T5 all depend on T1. T2 consumes the existing Warranty Group capability and does not create another Warranty Group ticket.

### T1 — Shell, access, and server-paged catalog

**Blocked by:** None — can start immediately.

**What it delivers:** An authorized user can open the target route, browse the server-paged Warranty Item catalog, search/filter it, and recover from loading, empty, and error states.

**Acceptance criteria:**

- [ ] RED tests demonstrate missing list, model, access, service, and page behavior before implementation.
- [ ] The target route exists without changing the legacy route or page.
- [ ] Authentication redirects anonymous users through `SessionAdapter`.
- [ ] `CSM_WEB / 20820` produces checking, anonymous, denied, read-only, and editable states through the existing access service.
- [ ] Read-only users see the catalog but cannot invoke mutation handlers.
- [ ] Initial list request uses `skip=0`, `take=500`, Warranty Code search by default, empty text, and `active=Y`.
- [ ] List service uses `data.data_rows` and `data.total`; malformed responses become a visible error state.
- [ ] Search resets to page one; pager supports First, Previous, numbered, Next, and Last, including a zero-result state and partial final page.
- [ ] Row numbers equal `skip + index + 1`; server ordering is not replaced by client sorting.
- [ ] `active=N` is sent for the unchecked/all-records state and is documented as the preserved legacy behavior.
- [ ] Retry preserves search/filter state and stale async responses cannot overwrite a newer access generation.
- [ ] Slice-level tests pass without backend, shared-shell, or legacy-page edits.

### T2 — Create and edit Warranty Items

**Blocked by:** T1. Consumes the existing `WarrantyGroupService`; no new Warranty Group ticket.

**What it delivers:** An authorized administrator can create and edit Warranty Items with validated durations, default Warranty Group selection, immutable identity, and safe passive metadata handling.

**Acceptance criteria:**

- [ ] RED tests demonstrate missing form, validation, group-default, read-one, create, update, and modal lifecycle behavior before implementation.
- [ ] Add loads active Warranty Groups and selects the row with `default_ == 'Y'` when present.
- [ ] Missing or failed default-group lookup leaves the group selectable rather than inventing a value.
- [ ] Create validates code, name, duration integers, Lifetime, and Active before sending.
- [ ] Warranty Code is limited to 15 legal alphanumeric characters; Warranty Name is limited to 150 characters.
- [ ] Lifetime zeroes and disables Days, Months, and Years; non-lifetime values remain discrete.
- [ ] Create sends the exact verified header contract, closes only after success, reports success, and reloads the list.
- [ ] Edit reads the item by code before opening the form; the code field is read-only.
- [ ] Edit can change only the approved mutable fields and never sends Reference IC fields or an unsupported default flag.
- [ ] Passive Reference IC metadata is shown read-only when supplied and survives a successful update.
- [ ] Failed reads/saves preserve useful modal context and display the server error.
- [ ] Read-only users cannot open the dialog or trigger create/update handlers.
- [ ] Slice-level model, service, and page tests pass.

### T3 — Delete with referential-integrity protection

**Blocked by:** T1.

**What it delivers:** An authorized administrator can deliberately delete an unused Warranty Item and receives the server's explanatory error when the item is referenced.

**Acceptance criteria:**

- [ ] RED tests demonstrate missing confirmation, delete request, server-error, guard, and reload behavior before implementation.
- [ ] Confirmation explicitly names Warranty Code and Warranty Name.
- [ ] Cancel sends no request.
- [ ] Delete sends `{ header: { war_code } }` to the verified endpoint.
- [ ] Server rejection for unit warranty or project area references is displayed without removing the row.
- [ ] Successful deletion reports completion and reloads the catalog.
- [ ] Read-only users cannot open confirmation or trigger the delete handler.
- [ ] No client-side referential-integrity substitute or legacy-page change is added.
- [ ] Slice-level service and page tests pass.

### T4 — 12-column Master Import

**Blocked by:** T1.

**What it delivers:** An authorized administrator can map, preview, validate, and atomically submit the verified 12-column Master Import.

**Acceptance criteria:**

- [ ] RED tests demonstrate missing parser, mapping, normalization, preview, and submission behavior before implementation.
- [ ] The Import dialog accepts the verified A–L source shape and provides configurable field mapping.
- [ ] Preview reflects the mapped rows before submission.
- [ ] Blank Warranty Codes are skipped.
- [ ] Active values and numeric duration values are normalized according to verified legacy behavior.
- [ ] The submitted request is exactly `{ data: [...] }` for the master import endpoint.
- [ ] Import is one atomic batch request from the page perspective; partial client-side loops are not introduced.
- [ ] Success reports the processed total and refreshes the catalog.
- [ ] Parse or server errors preserve useful input/preview context and do not claim success.
- [ ] Read-only users cannot open or submit Import.
- [ ] Slice-level parser, service, and page tests pass.

### T5 — Server catalog export

**Blocked by:** T1.

**What it delivers:** An authorized user can download a full server-generated Warranty Item catalog extract safely.

**Acceptance criteria:**

- [ ] RED tests demonstrate missing export request, token handling, access guard, and failure behavior before implementation.
- [ ] Export calls the verified server export endpoint without paging the currently displayed rows.
- [ ] A valid token is passed to the existing shared file capability with the download flag.
- [ ] Missing token, blocked popup, and download failure report an error and do not report false success.
- [ ] Export does not use the deferred legacy client-side `XLSX.writeFile` fallback.
- [ ] Read-only/unauthorized users cannot trigger export when the shared capability treats export as a protected action.
- [ ] Slice-level service and page tests pass.

## 6. File ownership and change map

The following is the intended ownership map. It is a planning constraint, not permission to create extra abstractions.

### New or slice-owned files

- `Nuxt/app/features/warranty-item/warranty-item-access.ts` — `CSM_WEB / 20820` constants and access mapping.
- `Nuxt/app/features/warranty-item/warranty-item-model.ts` — domain types, normalization, validation, duration/lifetime rules, and pagination.
- `Nuxt/app/features/warranty-item/warranty-item-service.ts` — Warranty Item endpoint methods.
- `Nuxt/app/features/warranty-item/warranty-item-texts.ts` — `mas002.*` localized text.
- `Nuxt/app/features/warranty-item/warranty-item-import.ts` — 12-column parser, mapper, preview rows, and normalization.
- `Nuxt/app/pages/master/warranty-item/index.vue` — route page and feature composition.
- `Nuxt/test/warranty-item/warranty-item-access.test.ts` — access behavior.
- `Nuxt/test/warranty-item/warranty-item-model.test.ts` — model, validation, duration, lifetime, and paging behavior.
- `Nuxt/test/warranty-item/warranty-item-service.test.ts` — exact endpoint, query, payload, and response-shape contracts.
- `Nuxt/test/warranty-item/warranty-item-import.test.ts` — mapping and normalization behavior.
- `Nuxt/test/warranty-item/warranty-item-page.test.ts` — observable route/page workflows.

### Existing files allowed for read-only reuse

- Warranty Group feature service and its tests, specifically the existing `WarrantyGroupService` list operation used for default selection.
- Shared API, session, access-control, dialog, target-state, localization, and file-capability modules.
- QCItem and `mas_001` tests as behavioral patterns only.

### Files explicitly not owned by this slice

- `Website/**` legacy implementation, including `v_csm_mas_002.vue`.
- Backend controllers, DTOs, database schema, migrations, and deployment configuration.
- Shared infrastructure files, unless a pre-existing defect blocks the slice and receives separate approval.
- Warranty Group production code, except consuming its existing service contract.
- Unrelated QCItem or other Master slices.

## 7. Test and verification plan

### 7.1 Required test style

Tests assert externally observable behavior: requests, payloads, response normalization, rendered states, disabled controls, modal transitions, and reload behavior. They must not couple to private component implementation details.

Every ticket follows this order:

1. Add focused RED tests proving the behavior is absent or incorrect before the production change.
2. Implement the smallest change that turns those tests GREEN.
3. Run the ticket's focused tests.
4. Run the complete Warranty Item suite and relevant existing shared/sibling suites.
5. Perform slice-level static/build verification available in the repository.

A test passing is evidence of the test's stubbed or local behavior only. It is not live backend parity or browser UAT evidence.

### 7.2 Coverage matrix

| Area | Required evidence |
|---|---|
| Access | Anonymous redirect, denied, read-only, editable, generation/stale-response guard. |
| Model | `data_rows` envelope, malformed response, row numbering, page boundaries, code/name validation, duration discreteness, Lifetime zeroing. |
| Service | Exact list query, single read, create/update/delete headers, import body, export endpoint, and token result. |
| Import | A–L mapping, preview, blank-code skip, Active normalization, duration coercion, error preservation. |
| Page | Initial load, search, filter, pager, loading/empty/error/retry, Add/Edit lifecycle, default Warranty Group, immutable code, delete confirmation/FK error, import, export, read-only guards. |
| Regression | Existing QCItem, Warranty Group, shared adapter, and target-shell suites relevant to touched integration points. |

### 7.3 Deferred verification

Live/browser E2E against seeded multi-tenant staging data is useful follow-up evidence but is not an implementation blocker for these tickets. It must not be represented as completed by unit or component test results.

## 8. Dependencies and stop conditions

### Dependency graph

```text
T1 Shell + access + list
├── T2 Create/Edit
├── T3 Delete + referential guard
├── T4 12-column Master Import
└── T5 Server Export
```

T2 additionally depends on the already-existing Warranty Group service contract. It does not depend on a new Warranty Group ticket.

### Stop conditions

Stop implementation and report an open blocking issue instead of guessing when:

- The verified backend endpoint, response envelope, or payload shape conflicts with the specification.
- The existing shared adapter cannot provide the required behavior without a cross-slice change.
- A requested behavior requires changing the legacy page or backend, which is outside this slice.
- The Warranty Group default-selection contract is unavailable or materially different from `default_ == 'Y'`.
- Referential-integrity behavior cannot be represented through the server response without inventing client-side data rules.
- A test exposes a migration requirement that changes tenant scoping, authorization, persistence, or audit semantics.
- A ticket would require another blocking ticket or a wide refactor not listed here.
- Focused tests fail twice without a new evidence-based hypothesis; preserve the failure and report it rather than retrying randomly.

Do not proceed past a stop condition by weakening acceptance criteria, changing verified legacy behavior, or adding an unapproved ticket.

## 9. Explicitly deferred

The following are not part of the Warranty Item Core Slice and must not be implemented as hidden prerequisites:

- Reference IC toolbar or workflows.
- `WarrantyRefIC` dialog and goods-receipt browsing.
- ERP receipt batch linking and receipt-date difference calculations.
- The 22-column `WarrantyAutoImportData` multi-table import across Project and Unit.
- Material Master picker UI (`vue-itemcode-list`); Material Code remains manual text input.
- Legacy client-side export fallback, including `XLSX.writeFile`.
- Backend controller, DTO, database schema, migration, stored procedure, or deployment changes.
- Changes to legacy `/page/master/v_csm_mas_002/` or `v_csm_mas_002.vue`.
- Shared pager, CRUD, importer, access, or file abstractions.
- New Warranty Group ticket or Warranty Group refactor.
- Production cutover, legacy retirement, seeded staging verification, and browser/live E2E.
- Unrelated legacy bug fixes, including defects outside the target route.

## 10. Rollback and completion definition

Rollback is route-level: stop publishing or disable `/csm-next/master/warranty-item/`; the untouched legacy screen remains available and no database rollback is required.

The specification is complete when all five tickets satisfy their acceptance criteria, focused and relevant regression tests have known results, no deferred item has been pulled into scope, and the final diff contains only approved Warranty Item slice files and tests. Live/browser E2E remains explicitly deferred rather than implied by local test success.
