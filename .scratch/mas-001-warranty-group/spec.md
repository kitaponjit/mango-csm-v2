# mas_001 Warranty Group — Migration Spec

## Problem Statement

Warranty work groups (Group Code / Group Name) are still managed only in the legacy Vue 2 page. Admins who set up warranty classification have no path into the new `/csm-next/` migration surface, and every future Master slice would otherwise rediscover server paging, modal row CRUD, and flag-toggle mutation from scratch. The migration method proven on QCItem (single-entity replace-all, client paging, no toggles) does not cover these three behaviors, so the method cannot be called general until a slice proves them.

## Solution

Migrate Warranty Group as a self-contained capability slice behind a new `/csm-next/` route that talks to the **unchanged** backend actions through the proven shared shells, reproducing legacy behavior exactly — including its sharp edges — while the legacy page keeps serving users untouched. When the slice passes its tests, the migration method gains three proven behaviors (server paging, modal CRUD, default-toggle) reusable by the Master family.

## User Stories

### List, search, paging

1. As an admin, I want to open Warranty Groups from the migration surface, so that I can work without the legacy page.
2. As an admin, I want the list to load the first server page automatically, so that I see data immediately.
3. As an admin, I want to page First / Prev / numbered / Next / Last through the full filtered set, so that I can reach any row.
4. As an admin, I want to search by Group Code or Group Name with free text, so that I can find a group.
5. As an admin, I want the Active switch to show active-only by default and everything otherwise, so that inactive rows stay out of the way but remain reachable.
6. As an admin, I want the total count and per-row numbers that account for paging offset, so that position is unambiguous.
7. As an admin, I want a loading state while the list loads and an empty state with zero total when nothing matches, so that I always know what happened.
8. As an admin, I want a failed list load to show an error with retry that does not destroy my search input, so that transient failures are recoverable.

### Access

9. As an anonymous visitor, I want to be sent to login instead of seeing groups, so that data stays protected.
10. As a user without the Warranty Group menu right, I want a denied state instead of the list, so that I know access was refused.
11. As a read-only user, I want all mutation controls disabled and their handlers guarded, so that I cannot change data by any path.

### Create / edit

12. As an admin, I want to open an Add Group Code dialog with blank Code / Name and Active defaulting to on, so that creation is explicit.
13. As an admin, I want Code limited to the verified length and character set with leading/trailing blanks trimmed, so that I cannot create unusable codes.
14. As an admin, I want to save a valid new group and see it in the reloaded list with a success notice, so that creation is confirmed.
15. As an admin, I want to open an Edit Group Code dialog for one row with Code locked, so that identity can never change by accident.
16. As an admin, I want the edit dialog prefilled from a fresh single-row read, so that I never edit stale grid data.
17. As an admin, I want validation failures explained inline with no request sent, so that mistakes are cheap.
18. As an admin, I want a failed save to keep my dialog input and show the server message, so that I can correct and retry.

### Delete

19. As an admin, I want to delete a row only after an explicit confirmation naming the code, so that deletion is deliberate.
20. As an admin, I want deletion blocked with the server message when the group is used by warranty items, so that referential data is never orphaned silently.
21. As an admin, I want the list to reload with a success notice after deletion, so that the outcome is visible.

### Default toggle

22. As an admin, I want to see exactly which row is the default (one highlighted marker), so that the current default is obvious.
23. As an admin, I want to flip the default by clicking its marker and see the change after reload, so that reassignment is one gesture.
24. As an admin, I want the toggle refused on inactive rows exactly as today, so that no inactive default can be created through the UI.
25. As an admin, I want toggling the current default off to behave exactly as today (possibly leaving zero defaults), so that downstream consumers see unchanged semantics.

### Import

26. As an admin, I want to map spreadsheet columns A / B / C to Code / Name / Active with a live preview, so that I control the import shape.
27. As an admin, I want blank-code rows skipped and Active coerced exactly as the backend does today, so that import outcome matches legacy.
28. As an admin, I want the import result reported and the list reloaded, so that I can verify what landed.

### Export / template

29. As an admin, I want to export the server's full tenant dataset in the verified 7-column format, so that I have a complete extract.
30. As an admin, I want to download the 3-column import template, so that my spreadsheet matches the expected shape.
31. As an admin, I want a blocked download popup or failed token to report an error rather than false success, so that I never believe a missing file arrived.

## Implementation Decisions

### Seams (existing, highest first)

- The slice lives behind one seam: the new target route. Everything below it (feature service, page state) is slice-local.
- Transport seam: the shared API client (GET / POST / envelope normalization with the session credential). No new transport.
- Session seam: the shared session adapter (authenticated gate + login redirect). No new session logic.
- File seam: the shared file-capability opener (download-by-id with download flag). No new download abstraction.
- UI seams: the shared loading/empty/error state primitive and the shared native-dialog primitive. Dialog content stays local.
- Config seam: the shared runtime-config plumbing (base URL, API host, login path). No hardcoded hosts.

### Modules (new, slice-local)

- A `warranty-group` feature module with three units: access (menu constants for the Warranty Group menu + the five access states with generation guard), model (row type, search/paging params, paged-response normalize, single-row validate, row-number helper), service (one thin method per backend action, endpoint paths only).
- A target page composing the shells + the feature module: access gate → server-paged list → search → modal form → row actions → import dialog → export/template actions.
- A localization namespace for the slice (search labels, titles, confirm text, total line). The adapter itself is reused unchanged.

### API contracts (frozen, reproduced exactly)

- List: GET with skip / take / field / text / active (default take 500); response envelope wrapping `{data, total}` where total is the filtered count before pagination; fixed server ordering by code; client row number = skip + index; search resets to page 1; `active=Y` filters, `active=N`/empty returns all (reproduce, do not "fix"; label it clearly).
- Single-row read by code for edit prefill.
- Create / Update with a header object (code required on create; code immutable on edit; update never sends the default flag).
- Delete with a header object (hard delete; server blocks only on warranty-item usage; default rows deletable — reproduce).
- Default mutation with a header object (backend resets all tenant defaults then writes the row in one transaction; Y→N allowed; reproduce, do not harden).
- Import: POST mapped row array (Code / Name / Active) → upsert per tenant, blank codes skipped, Active coerced, audit user IMPORT, existing-row default state preserved.
- Export: full tenant dataset, verified 7-column server format, via file token. Template: header-only 3-column file via file token. Download via the shared file opener with popup-safe handling.

### Data invariants (preserved, from discovery)

- Identity `(tenant, code)`; code immutable after creation; verified code character set on create.
- Single-default-by-convention (no database constraint): zero or multiple defaults are representable states the UI must render honestly, never silently repair.
- Active/inactive semantics and the `active=N`-means-unfiltered quirk.
- Tenant scoping on every action (server-owned credential; no client tenant fields).
- Audit authorship (creator/updater recorded server-side; import stamped IMPORT).
- Downstream compatibility: the sibling Warranty Item screen reads the same list endpoint filtered to active plus the default marker to prefill new records. The backend response shape is therefore a cross-page contract — the slice MUST NOT change any backend DTO.

### Migration boundary

- Legacy route, menu entry, and page stay byte-identical; no redirect, no shared-component edits.
- Target route coexists under the migration prefix; rollback is removing/never publishing the slice.
- No changes outside the slice: no backend edits, no shared-shell edits, no sibling-screen edits.

### deliberately NOT built

- No shared pager, modal, CRUD, importer, or authorization abstraction (each has exactly one consumer; the sibling slice proved the opposite shape).
- No optimistic locking, uniqueness constraint, delete-block on defaults, or race redesign (backend-owner hardening topics).
- No client-side restrictions beyond what legacy enforces (e.g. no invented delete guard for default rows).

## Testing Decisions

- What makes a good test here: observable request/response and rendered-behavior assertions (URLs, bodies, states, totals, markers), never implementation internals; backend-contract tests pin exact shapes so the sibling consumer stays safe.
- Units under test: the feature service (endpoint + payload + envelope mapping), the model (normalize, validate, paging math, row numbers), the access unit (five states), the page (ordering of gate→list, guards, dialogs, reload flows) with adapters stubbed exactly as the sibling slice's page tests do.
- Prior art: the sibling slice's service / model / page test files and the shared adapter test files (API client, session, file capability, access control) — same runners, same stubbing style.
- RED → GREEN is mandatory per ticket: new contract tests must fail against pre-change code (prove with a temporary revert where cheap) before implementation lands.

## Out of Scope

Sibling Warranty Item screen; Reference IC; dual-import beyond the mapped JSON path; the unused multipart upload endpoint; reports; Parcel; portal; realtime; backend hardening (parameterization, constraints, RefIC totals, DDL gaps); shared-framework extraction; production topology; live/browser verification infrastructure; unrelated legacy defects (including the legacy error-path variable bug — the target must not copy it, but fixing legacy is out of scope).

## Further Notes

- Seams were checked against expectations: one new route seam, all lower seams reused. No new seam is proposed.
- The sibling consumer constraint is the slice's most important non-obvious requirement: any backend shape drift breaks another screen, so the DTO pin is a first-class test, not a comment.
- Known sharp edges to reproduce (not repair): `active=N` unfiltered, toggle-off leaving zero defaults, deletable default rows, blank-row import skips, page-bounded client export build vs full server export, fixed server ordering.
- Live verification (seeded data, real paging counts at volume, browser modal flows, tenant matrix) belongs to the deferred verification track and MUST NOT gate implementation.
