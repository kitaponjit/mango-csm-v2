# Warranty Item C4 Remediation Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

Goal: Restore all legacy-observable Warranty Item capabilities on the Nuxt/Vue 3 target and produce evidence for FULL_CAPABILITY_AUDITED, Warranty GAP = 0, and Warranty UNKNOWN = 0.

Architecture: Keep frontend/app/features/warranty-item/ as the feature boundary. Share only the workbook parser/transport seam; keep Standard Import, Import All Warranty, and Reference IC as separate typed services/controllers. Use the registered ag-table only through a tested grid contract that preserves legacy sorting, saved columns, actions, and date formatting.

Tech Stack: Nuxt 4 SPA, Vue 3 Composition API, TypeScript, Vitest, existing ag-table, existing $xt transport, existing moment/$xt.formatDate formatter.

## Global Constraints

- Continue on PR #32 branch remediation/csm-final-parity-gaps; do not amend or rewrite reviewed commits.
- Use only legacy-evidenced endpoints and payloads; do not edit backend code.
- Preserve Standard Import and Import All as separate workflows.
- Do not refactor i18n unless executable evidence proves a lost translated/runtime capability.
- Accept .xls and .xlsx where the legacy import control accepts both.
- Write the failing test before each production parity fix and observe the expected RED failure.
- Remove only the unrelated .scratch/ and .superpower/ .gitignore entries; do not delete local files/directories.
- Do not add dependencies or change lockfiles unless an existing package capability is insufficient and the change is explicitly justified.

---

### Task 1: Lock Standard Import parity with RED tests

Files:
- Modify: frontend/test/warranty-item/import/warranty-item-import-service.test.ts
- Modify: frontend/test/warranty-item/import/warranty-item-import-page-contract.test.ts
- Modify: frontend/test/warranty-item/import/warranty-item-import-state.test.ts
- Create: frontend/test/warranty-item/import/warranty-item-import-template-service.test.ts

Interfaces:
- Consumes existing WarrantyItemImportService, WarrantyItemImportPreviewRow, and WarrantyItemTransport.
- Produces failing examples for configurable mapping, raw cells, .xls acceptance, standard template lookup, and independent state transitions.

Steps:
- [ ] Add a test that maps through a caller-provided mapping and expects values such as not-an-integer and space-padded y to remain unchanged.
- [ ] Add a parameterized upload test for warranty.xls and warranty.xlsx.
- [ ] Add a template test expecting GET Anywhere/Import/DownloadTemplateExcel?filename=Template_List_Warranty and the returned path token.
- [ ] Run from frontend/:

~~~powershell
npm run test:warranty-item -- --run test/warranty-item/import/warranty-item-import-service.test.ts test/warranty-item/import/warranty-item-import-page-contract.test.ts test/warranty-item/import/warranty-item-import-state.test.ts test/warranty-item/import/warranty-item-import-template-service.test.ts
~~~

Expected: the new tests fail because mapping is fixed/coercing, .xls is rejected, and the template service does not exist.

### Task 2: Implement the shared workbook seam and Standard Import

Files:
- Modify: frontend/app/features/warranty-item/import/warranty-item-import-service.ts
- Modify: frontend/app/features/warranty-item/import/warranty-item-import-state.ts
- Create: frontend/app/features/warranty-item/import/warranty-item-import-template-service.ts
- Modify: frontend/app/features/warranty-item/WarrantyItemPage.vue
- Modify the Task 1 tests.

Interfaces:
- Produces WarrantyItemImportColumn support through V, WarrantyItemImportMapping, DEFAULT_WARRANTY_ITEM_IMPORT_MAPPING, mapWarrantyItemImportRows(rows, mapping), and template-token lookup.

Steps:
- [ ] Change preview columns to Partial<Record<WarrantyItemImportColumn, WarrantyItemImportCell>> so A–M fixtures remain valid and Import All can use N–V.
- [ ] Normalize only present A–V primitive cell values and reject unsupported objects.
- [ ] Define the standard mapping fields and default mapping:
  { war_code: A, war_des: B, type_code: C, tot_date: D, tot_month: E, tot_year: F, lifetime: G, itemcode: H, vendor: J, war_date_start: K, war_date_end: L, active: M }.
- [ ] Delete integerValue and activeValue. Each mapped field is the exact selected cell or null when absent.
- [ ] Accept .xls and .xlsx. Add getTemplateToken(templateName) for Anywhere/Import/DownloadTemplateExcel?filename=<name>, requiring a successful string path.
- [ ] Reuse the existing download URL capability to open the returned token.
- [ ] Add editable Standard Import mapping controls defaulted to the A–M mapping and retain Column I as unmapped by default.
- [ ] Keep the existing upload, preview, explicit import, refresh-failure, and retry states.
- [ ] Run:

~~~powershell
npm run test:warranty-item -- --run test/warranty-item/import
~~~

Expected: all Standard Import tests pass, including raw values, configurable mapping, both extensions, and Template_List_Warranty.

### Task 3: Restore Import All Warranty separately

Files:
- Create: frontend/app/features/warranty-item/import/warranty-item-import-all-service.ts
- Create: frontend/app/features/warranty-item/import/warranty-item-import-all-state.ts
- Create: frontend/test/warranty-item/import/warranty-item-import-all-service.test.ts
- Create: frontend/test/warranty-item/import/warranty-item-import-all-state.test.ts
- Create: frontend/test/warranty-item/import/warranty-item-import-all-page-contract.test.ts
- Modify: frontend/app/features/warranty-item/WarrantyItemPage.vue

Interfaces:
- Consumes the shared workbook preview/upload seam and WarrantyItemTransport.
- Produces WarrantyItemImportAllMapping, DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING, mapWarrantyItemImportAllRows, the WarrantyAutoImportData service, and independent controller state.

Steps:
- [ ] Add a RED test that maps all 22 legacy fields and posts { data: rows } to CSM/Master/WarrantyAutoImportData.
- [ ] Add tests for raw A–V values, .xls/.xlsx acceptance, Template_All_Warranty, malformed envelopes, parser failures, backend failures, and refresh retry.
- [ ] Run:

~~~powershell
npm run test:warranty-item -- --run test/warranty-item/import/warranty-item-import-all-service.test.ts test/warranty-item/import/warranty-item-import-all-state.test.ts test/warranty-item/import/warranty-item-import-all-page-contract.test.ts
~~~

Expected: RED because the modules and page workflow do not exist.
- [ ] Implement the exact field order: pre_event, loccode, locname, war_code, war_des, type_code, itemcode, tot_date, tot_month, tot_year, lifetime, itemname_other, serial_number, startdate, enddate, vendor, vendor_start_dt, vendor_end_dt, vendor_remark, remark, active_row, active.
- [ ] Add a distinct Import All action/panel with editable A–V mappings, Template_All_Warranty, .xls/.xlsx input, preview, import, refresh retry, and cancel/close behavior.
- [ ] Do not reuse Standard Import persistence or endpoint.
- [ ] Run npm run test:warranty-item -- --run test/warranty-item/import and confirm GREEN.

### Task 4: Restore Reference IC

Files:
- Create: frontend/app/features/warranty-item/reference-ic/warranty-item-reference-ic-service.ts
- Create: frontend/app/features/warranty-item/reference-ic/warranty-item-reference-ic-state.ts
- Create: frontend/app/features/warranty-item/reference-ic/warranty-item-reference-ic-date.ts
- Create: frontend/test/warranty-item/reference-ic/warranty-item-reference-ic-service.test.ts
- Create: frontend/test/warranty-item/reference-ic/warranty-item-reference-ic-state.test.ts
- Create: frontend/test/warranty-item/reference-ic/warranty-item-reference-ic-date.test.ts
- Create: frontend/test/warranty-item/reference-ic/warranty-item-reference-ic-page-contract.test.ts
- Modify: frontend/app/features/warranty-item/WarrantyItemPage.vue
- Modify: frontend/app/features/warranty-item/runtime/access-snapshot.ts

Interfaces:
- Consumes WarrantyItemTransport, current list rows, store.state.maincomp.iccost, and existing edit compatibility.
- Produces lookup/search, duplicate filtering, selection, date arithmetic, exact create payload, and refresh-safe save seams.

Steps:
- [ ] Add RED tests for legacy date arithmetic: end.diff(start, years), then remaining months, then remaining days, with absolute component values.
- [ ] Add RED tests for duplicate filtering by ic_docno and ic_itemno, select-all synchronization, and lookup query parameters.
- [ ] Add RED tests for default Work Type lookup at csm/master/WarrantyGroup_ReadList?active=Y, one create per selected row at CSM/MASTER/WarrantyItem_Create, exact payload fields, failure propagation, and successful refresh/close state.
- [ ] Run npm run test:warranty-item -- --run test/warranty-item/reference-ic and confirm the expected RED.
- [ ] Implement legacy defaults lifetime N and active Y, vendor from cust_name, document/location fields, empty strings for absent fields, and default Work Type only when either row type code or type name is missing.
- [ ] Read maincomp through the existing store.state global shape. Show Reference IC only when iccost is '3' and the existing page mutation gate allows it.
- [ ] Wire lookup search, select-all, row selection, selected count, paging, date display, save, cancel, and filtered opening behavior.
- [ ] Run:

~~~powershell
npm run test:warranty-item -- --run test/warranty-item/reference-ic test/warranty-item/list test/warranty-item/edit test/warranty-item/delete
~~~

Expected: all selected tests pass.

### Task 5: Remove unsupported create/edit rejection

Files:
- Modify: frontend/app/features/warranty-item/edit/warranty-item-draft.ts
- Modify: frontend/app/features/warranty-item/edit/warranty-item-service.ts
- Modify: frontend/app/features/warranty-item/edit/warranty-item-form-state.ts
- Modify: frontend/test/warranty-item/edit/warranty-item-draft.test.ts
- Modify: frontend/test/warranty-item/edit/warranty-item-service.test.ts
- Modify: frontend/test/warranty-item/edit/warranty-item-form-state.test.ts

Steps:
- [ ] Add a RED service test that creates a draft with blank code/name and non-integer or negative duration values and expects the legacy create endpoint to be called.
- [ ] Run npm run test:warranty-item -- --run test/warranty-item/edit and confirm validation is the expected failure.
- [ ] Remove only required and finite-integer client rejection rules. Keep observed 15/150 UI limits, lifetime behavior, readonly code-on-edit, permission gates, request whitelists, and backend envelope checks.
- [ ] Run the edit suite again and confirm legacy-accepted inputs reach the transport while retained constraints still pass.

### Task 6: Restore grid behavior and audit timestamps

Files:
- Create: frontend/app/features/warranty-item/list/warranty-item-grid.ts
- Create: frontend/test/warranty-item/list/warranty-item-grid.test.ts
- Modify: frontend/app/features/warranty-item/WarrantyItemPage.vue
- Modify: frontend/test/warranty-item/edit/warranty-item-page-contract.test.ts

Interfaces:
- Produces required legacy field tuples, row projection, action metadata, grid configuration, and audit formatting.

Steps:
- [ ] Add RED tests for sorting=true, saveColumns=Y, doctype=MSCSM, pageName=v_csm_mas_002, required legacy fields/actions, and audit output DD/MM/YYYY HH:mm:ss.
- [ ] Run the grid test and observe RED because no target grid contract exists.
- [ ] Implement a pure grid contract and page adapter. Use the registered ag-table with sorting=true, saveColumns=Y, doctype=MSCSM, page_name=v_csm_mas_002. Project target semantic rows to legacy field names, route action cells to edit/delete, call setDisplay after list load/refresh, and format add_dt/edit_dt with the existing target formatter and seconds.
- [ ] Do not add unrelated grid capabilities.
- [ ] Run:

~~~powershell
npm run test:warranty-item -- --run test/warranty-item/list/warranty-item-grid.test.ts test/warranty-item/edit/warranty-item-page-contract.test.ts
~~~

Expected: GREEN.

### Task 7: Integrate, audit, and write the capability ledger

Files:
- Modify: frontend/app/features/warranty-item/WarrantyItemPage.vue
- Modify relevant Warranty page contract tests.
- Modify: .gitignore
- Create: docs/migrations/warranty-item-c4-capability-ledger.md

Steps:
- [ ] Add/adjust tests for Reference IC visibility, both import actions, both template identifiers, .xls/.xlsx input, ag-table behavior configuration, action routing, timestamp formatting, and independent workflow state.
- [ ] Ensure opening one workflow resets only its own state; pending close is blocked; successful mutation refreshes once; refresh failure retries without repeating mutation; unmount removes listeners.
- [ ] Run the complete Warranty suite:

~~~powershell
npm run test:warranty-item
~~~

Expected: zero failures.
- [ ] Fill the ledger with legacy source location, target module/test evidence, status PARITY or NOT_APPLICABLE, and rationale for every capability: list/read, search/filter, paging, create, edit, delete, Reference IC, Standard Import, Import All, mappings, .xls, .xlsx, templates, export, grid sorting, saved columns, audit formatting, permissions, readonly/editable behavior, validation, status handling, and i18n.
- [ ] Resolve every capability; do not write UNKNOWN. If a stop condition is reached, report it instead of guessing.
- [ ] Remove only .scratch/ and .superpower/ from .gitignore with apply_patch. Confirm no local files/directories were deleted.

### Task 8: Verify, commit, push, and hand off

Steps:
- [ ] Run from the repository root:

~~~powershell
Set-Location frontend
npm run test:warranty-item
npm run test:query
npm run test:store
npm run test:parity
npm run typecheck:warranty-item
npm run typecheck
npm run build
Set-Location ..
git diff --check
~~~

Record environment failures explicitly; skipped checks are not passing checks.
- [ ] Inspect git status, final diff, .gitignore, and the capability ledger. Confirm no backend, generated output, credentials, or unintended lockfile changes.
- [ ] Commit new remediation changes without rewriting prior commits:

~~~powershell
git add .gitignore frontend/app/features/warranty-item frontend/test/warranty-item docs/migrations/warranty-item-c4-capability-ledger.md docs/superpowers/specs/2026-09-18-warranty-item-c4-remediation-design.md docs/superpowers/plans/2026-09-18-warranty-item-c4-remediation.md
git commit -m "fix(warranty-item): restore legacy parity workflows"
~~~

- [ ] Verify 4a022999c555e0e16b92a3c03be8380709341d10 is an ancestor of the new HEAD and HEAD differs from it.
- [ ] Push the existing branch with git push origin remediation/csm-final-parity-gaps.
- [ ] Do not merge. Report the new HEAD, verification evidence, ledger status, and any environment-blocked checks, ending with:

~~~text
PR #32 REMEDIATED —
READY FOR INDEPENDENT RE-REVIEW

READY FOR SUPERVISOR REVIEW
~~~
