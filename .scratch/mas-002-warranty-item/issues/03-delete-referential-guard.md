# 03 — Typed delete, referential guard, and pagination clamp

**Target:** `frontend/` — Nuxt 4 + Vue 3.

**Language:** TypeScript mandatory for delete request/result, pending state, pagination decision, and normalized errors.

**Blocked by:** 01 — Typed shell, access, and server-paged catalog; backend confirmation before encoding specific referential rules.

**What to build:** An editable user can deliberately delete an unreferenced Warranty Item once, see authoritative server rejection without losing the row, and remain on a valid page after success.

## Typed boundaries

- Delete identity/request and normalized result.
- Per-row or action-scoped pending state.
- Confirmation state.
- Server error normalization from `unknown`.
- Post-delete total, maximum-page, clamp, and reload decision.

## Acceptance criteria

- [ ] RED tests cover confirmation/cancel, endpoint and confirmed payload, read-only guard, pending state, duplicate click, server rejection, successful reload, and every required page-clamp case.
- [ ] Confirmation identifies both Warranty Code and Warranty Name; cancel sends no request.
- [ ] Delete calls verified endpoint `CSM/Master/WarrantyItem_Delete`.
- [ ] The exact minimum header fields are based on backend evidence; the current client posting the full row does not prove that `{ header: { war_code } }` is sufficient.
- [ ] The affected action is disabled while pending and a second click/handler call sends no duplicate request.
- [ ] A failed request clears pending state, retains the row, shows one normalized server error, and does not reload or report success.
- [ ] Referential rejection is treated as server-authoritative; no client-side table/reference guess is introduced.
- [ ] A successful request reports success once and performs one reload using a valid page.
- [ ] With rows remaining, compute `maxPage = max(1, ceil(totalAfterDelete / pageSize))` and request `min(currentPage, maxPage)`.
- [ ] Example test: page 3, page size 10, total 21; deleting row 21 produces total 20 and the next request is page 2.
- [ ] Normal deletion that leaves the current page valid keeps that page.
- [ ] Deleting the last row of a non-final page reloads that still-valid page.
- [ ] Deleting the last row of the final page clamps to the new final page.
- [ ] Deleting the only remaining row resets to page one and displays the empty state.
- [ ] Read-only users cannot open confirmation or invoke the delete handler.
- [ ] Newly owned code uses TypeScript, contains no undocumented `any`, and adds no `Nuxt/`, `Website/`, or backend changes.
- [ ] Focused tests, relevant target regressions, typecheck, and `frontend/` build have recorded results.

## Contract status

- **VERIFIED:** delete endpoint name from both current clients.
- **REQUIRES BACKEND CONFIRMATION:** minimum accepted delete payload, referential tables/rules, error shape, and success-result semantics.
- Implementation may pass through a normalized server message before detailed guard semantics are confirmed; tests must not name unverified tables as business truth.
