# 04 — Typed Warranty Item Master Import

**Target:** `frontend/` — Nuxt 4 + Vue 3.

**Language:** TypeScript mandatory for file selection, upload, preview, mapping, validation, batch request/result, pending, and error state.

**Blocked by:** 01 — Typed shell, access, and server-paged catalog; backend confirmation for validation and result semantics.

**What to build:** An editable user can select a supported spreadsheet, upload it for preview parsing, map the observed 12 Warranty Item fields, validate the preview, and submit one Warranty Item batch request without duplicate mutations or fabricated success details.

## Observed two-stage flow

1. Common spreadsheet parser: multipart POST to `Anywhere/Import/ImportExcel`, field `file`.
2. Warranty Item submission: JSON POST to `CSM/Master/WarrantyItemImportData_Master` with `{ data: [...] }`.

This is client-observed behavior. Backend validation, transaction, upsert, and result semantics remain confirmation items.

## Typed boundaries

- `File | null` selection and client validation result.
- Multipart upload request and normalized parser response.
- Preview rows represented as unknown input before field narrowing.
- Field mapping and typed mapped Warranty Item row.
- Row/field validation errors.
- Batch request and normalized import result.
- Separate upload/submission pending states and normalized errors.

## Acceptance criteria

- [ ] RED tests cover file validation, multipart field name, parser response normalization, mapping/preview, invalid rows, exact batch endpoint/wrapper, pending states, duplicate invocations, error preservation, and refresh behavior.
- [ ] File selection accepts `.xls` and `.xlsx` extensions, matching the current target input; unsupported extensions send no upload request and show a validation error.
- [ ] MIME-type enforcement is not invented; it remains **UNVERIFIED** until backend/browser requirements are confirmed.
- [ ] Parser upload uses multipart field `file` at `Anywhere/Import/ImportExcel`.
- [ ] Parser response is treated as `unknown` and narrowed before reading observed rows `data.data` or file metadata `data.filepath` / `data.filename`.
- [ ] The preview exposes mappings for 12 fields: `war_code`, `war_des`, `type_code`, `tot_date`, `tot_month`, `tot_year`, `lifetime`, `itemcode`, `vendor`, `war_date_start`, `war_date_end`, and `active`.
- [ ] The observed default mapping is A–H and J–M, leaving source column I unused; tests do not replace it with an unverified contiguous A–L mapping.
- [ ] Invalid mapping or row data is shown before submission and sends no batch request.
- [ ] Blank Warranty Code, Active normalization, duration coercion, date parsing, and other business validation follow confirmed backend/business rules; unconfirmed rules are not silently invented.
- [ ] Submission sends one `{ data: [...] }` request to exact endpoint `CSM/Master/WarrantyItemImportData_Master`; no per-row mutation loop is introduced.
- [ ] Upload controls are disabled while upload is pending; submit controls are disabled while submission is pending; repeated clicks/handler calls send no duplicate request.
- [ ] Upload/parse failure preserves the selected-file context needed to retry or replace it and never enables an invalid submit.
- [ ] Validation or server failure preserves useful preview/mapping context, clears pending state, shows one normalized error, and does not claim success.
- [ ] Confirmed success closes the import flow, reports success once, and reloads the current catalog query once.
- [ ] A processed count is shown only when a confirmed response field supplies it; submitted-row count is not presented as server-processed count.
- [ ] Read-only users cannot open, upload, or submit Import.
- [ ] Material picker, Reference IC, 22-field Auto Import, backend edits, and client-side export remain out of scope.
- [ ] Focused tests, relevant target regressions, typecheck, and `frontend/` build have recorded results.

## Contract status

- **VERIFIED:** current client usage of accepted input extensions, parser endpoint, multipart field `file`, client-read parser fields, Warranty Item batch endpoint, and `{ data: [...] }` wrapper.
- **REQUIRES BACKEND CONFIRMATION:** MIME rules, parser response authority, row validation, blank-code policy, normalization, atomicity, upsert behavior, validation errors, and processed-count semantics.
