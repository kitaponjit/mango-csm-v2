# 01 — Migration shell, access gate, server-paged list with search

**What to build:** an admin opening the new Warranty Groups route sees the server-paged group list (first page auto-loaded, total count, offset-aware row numbers), can page through it, search by Code/Name/Active with legacy-exact semantics, and gets loading / empty / error-with-retry states; anonymous users go to login, denied users see a denied state, read-only users see a non-mutable list. This is the walking skeleton every later ticket builds on.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

Spec sections: User Stories 1–11; Implementation Decisions (Seams, Modules, API contracts – List, Data invariants, Migration boundary).

- [ ] RED: list/search/paging/access tests fail against pre-change code, then GREEN with the minimum route + access unit + service list method + model normalize/paging + page
- [ ] List calls the verified list endpoint with skip/take/field/text/active (default take 500) and renders `{data, total}` with row number = skip + index
- [ ] `active=Y` filters, `active=N`/empty returns all (reproduced, clearly labeled); search resets to page 1; fixed server ordering untouched
- [ ] Pager First/Prev/numbered/Next/Last incl. empty (hidden pager, total 0) and last-page partial behavior
- [ ] Access gate order (session → menu right 20810 → checking/anonymous/denied/readonly/editable) with stale-response protection; read-only disables all mutation entry points
- [ ] Existing shared-shell tests and sibling-slice suites still pass; no backend/shared-shell/sibling edits
