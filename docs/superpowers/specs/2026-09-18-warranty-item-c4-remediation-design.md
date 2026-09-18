# Warranty Item C4 Remediation Design

## Goal

Restore observable Warranty Item behavior from the legacy `v_csm_mas_002.vue` page on the established Nuxt/Vue 3 target so PR #32 has no confirmed Warranty gaps or unresolved Warranty capability unknowns.

## Scope and constraints

- Continue on PR #32's existing branch and add new remediation commit(s); do not amend or rewrite reviewed commits.
- Change the target `frontend/` implementation and its regression tests. Do not change backend code or invent endpoints.
- Reuse only endpoint and payload behavior evidenced by the legacy page:
  - `csm/master/WarrantyRefIC`
  - `CSM/MASTER/WarrantyItem_Create`
  - `CSM/Master/WarrantyAutoImportData`
  - `Anywhere/Import/ImportExcel`
  - `CSM/Master/WarrantyItemImportData_Master`
- Keep Standard Import and Import All Warranty as distinct workflows with distinct mappings, templates, and persistence endpoints.
- Do not perform an i18n refactor. Convert hard-coded Warranty labels/messages only if executable evidence proves a lost legacy language-switching capability.
- Remove the unrelated `.scratch/` and `.superpower/` additions from `.gitignore`, without deleting local files or directories.
- Do not add dependencies or modify lockfiles unless existing package capabilities prove insufficient.

## Architecture

The existing Warranty Item feature modules remain the boundary. Workbook parsing is shared only at the parser seam; Standard Import and Import All each retain their own mapping, DTO, state, and persistence service. Reference IC receives an analogous service/state/controller seam so selection, fallback, date arithmetic, and create payloads can be tested without mounting the full page.

The list uses the already-registered target `ag-table` only if behavioral tests confirm it supplies the required observable contract: client-side sorting, saved-column restoration/persistence under `MSCSM` / `v_csm_mas_002`, legacy column semantics, and action-cell events. If it cannot provide that contract cleanly, the implementation must use the smallest target abstraction that reproduces the behavior and tests must remain behavior-focused rather than asserting a component name.

## Behavior design

### Reference IC

- Visibility follows the legacy condition `maincomp.iccost == '3'` in addition to the page's established read/edit permissions.
- Lookup requests use `csm/master/WarrantyRefIC` with the legacy search fields and paging parameters.
- Opening the workflow clears prior selections, resets the select-all state, and filters out rows whose `(ic_docno, ic_itemno)` pair is already present in the current Warranty list.
- Per-row and select-all selection operate on the current lookup page and keep the selected count/state synchronized.
- Saving maps each selected row exactly as legacy does, including default active/lifetime flags, vendor/document/location fields, default Work Type fallback, and duration calculated from the reference start/end dates.
- Each selected item is posted to `CSM/MASTER/WarrantyItem_Create`; success refreshes the main list and closes the workflow; failures preserve the legacy error category/observable state.

### Standard Import

- The standard A–M field set remains separate from Import All.
- `.xls` and `.xlsx` files are accepted where the legacy import control accepted both.
- Mapping controls remain editable and default to the legacy A–M mapping.
- Mapped cell values are forwarded unchanged. The target must not coerce invalid integers to `0`, trim/uppercase `active`, or otherwise normalize values unless the backend contract requires it.
- Column I remains unmapped by default and is not sent unless the user explicitly maps a target field to it.
- The persistence request remains `{ data: rows }` to `CSM/Master/WarrantyItemImportData_Master`.
- The template action downloads `Template_List_Warranty`.

### Import All Warranty

- The workflow is separate from Standard Import and accepts the legacy A–V mapping.
- Mapping controls and the default mapping use the legacy field names and positions: `pre_event`, `loccode`, `locname`, `war_code`, `war_des`, `type_code`, `itemcode`, `tot_date`, `tot_month`, `tot_year`, `lifetime`, `itemname_other`, `serial_number`, `startdate`, `enddate`, `vendor`, `vendor_start_dt`, `vendor_end_dt`, `vendor_remark`, `remark`, `active_row`, and `active`.
- Mapped values are forwarded unchanged in `{ data: rows }` to `CSM/Master/WarrantyAutoImportData`.
- The template action downloads `Template_All_Warranty`.
- Upload, import, refresh, error, and retry states are independently represented from Standard Import.

### Create/Edit validation

- Remove target-only rejection of blank Warranty Code/Name and non-integer duration values where the legacy page posted them to the API.
- Keep the observed UI maximum lengths (15 for code and 150 for name), lifetime behavior, readonly code-on-edit behavior, permission gating, and backend envelope/error handling.
- Add regression coverage proving legacy-accepted drafts reach the API service rather than failing in the target validation layer.

### Grid and audit display

- Preserve required columns and legacy semantics: No., Edit/Delete actions, Warranty Code, Warranty Name, Work Type, Warranty Duration, Lifetime, Active, Add User, Add Date, Edit User, and Edit Date.
- Restore client-side sorting and saved-column behavior with the target's established grid abstraction or an equivalent target seam.
- Render `add_dt` and `edit_dt` with the existing formatter using `DD/MM/YYYY HH:mm:ss`.
- Keep server paging/filter behavior and existing authorization/readonly behavior intact.

## Error and state handling

Each workflow keeps transport, parser/contract, backend, authorization, and refresh failures distinguishable at its service/controller boundary. A successful mutation followed by a failed list refresh must remain retryable without repeating the mutation. Stale asynchronous requests must not overwrite newer state.

## Verification strategy

Use RED/GREEN tests at behavioral seams before each production change. Coverage must include:

- Reference IC lookup, duplicate filtering, selection, default Work Type, date calculation, exact create payloads, error handling, and refresh behavior.
- Import All endpoint, A–V mapping, template identifier, `.xls`/`.xlsx` acceptance, and independent state transitions.
- Standard mapping configurability, raw value preservation, `.xls`/`.xlsx` acceptance, and standard template identifier.
- Legacy-accepted create/edit inputs reaching the API.
- Grid sorting, saved-column behavior, required columns/actions, and audit timestamp formatting.
- Permissions, readonly/editable behavior, status handling, export, search/filter, paging, list/read, create, edit, delete, and the no-i18n-refactor decision.

## Capability ledger exit criteria

Before declaring C4 complete, every row below must have a source-backed implementation or a source-backed explicit not-applicable decision, with no `UNKNOWN` remaining:

| Capability | Required evidence |
|---|---|
| List/read | Target service and legacy endpoint parity test |
| Search/filter | Target query and legacy parameter test |
| Paging | Target page-size/skip behavior test |
| Create | Exact payload and endpoint test |
| Edit | Exact payload, readonly code, and API reachability test |
| Delete | Guarded endpoint, permission, and refresh tests |
| Reference IC | Lookup, selection, duplicate filter, fallback, date, create tests |
| Standard Import | A–M mapping, parser, endpoint, state tests |
| Import All Warranty | A–V mapping, parser, endpoint, state tests |
| Mappings | Editable mapping controls and configurable mapper tests |
| `.xls` | Upload acceptance test if legacy accepts it |
| `.xlsx` | Upload acceptance test |
| Templates | `Template_List_Warranty` and `Template_All_Warranty` action tests |
| Export | Existing guarded export tests and page contract |
| Grid sorting | Behavioral grid seam test |
| Saved columns | Behavioral persistence/restoration seam test |
| Audit formatting | `DD/MM/YYYY HH:mm:ss` formatter test |
| Permissions | Access, visibility, and mutation gating tests |
| Readonly/editable behavior | Form and Reference IC visibility tests |
| Validation | Legacy-accepted and retained-constraint tests |
| Status handling | Load, mutation, refresh failure, and retry tests |
| i18n | Evidence audit; remediate only if runtime capability loss is proven |

The ledger must end at `FULL_CAPABILITY_AUDITED`, `Warranty GAP = 0`, and `Warranty UNKNOWN = 0`.

