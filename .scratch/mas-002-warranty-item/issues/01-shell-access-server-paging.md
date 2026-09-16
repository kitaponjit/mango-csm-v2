# 01 — Shell, access, and server-paged Warranty Item catalog

**What to build:** An authorized user can open the Warranty Item migration route, browse the server-paged catalog, search by Warranty Code or Warranty Name, filter active records, and recover from loading, empty, and retryable error states. Anonymous and unauthorized users receive the correct access outcome, while read-only users can inspect but not mutate.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] RED tests cover the missing route, access states, list model/service, paging, and page behavior before implementation.
- [ ] The target route is added without changing the legacy Warranty Item route or `v_csm_mas_002.vue`.
- [ ] Anonymous users are redirected through the existing session adapter; `CSM_WEB / 20820` yields checking, denied, read-only, and editable outcomes through the existing access service.
- [ ] Read-only users can read the catalog but cannot invoke New, Edit, Delete, Import, or Export handlers.
- [ ] The initial list request uses `skip=0`, `take=500`, Warranty Code as the default field, empty text, and `active=Y`.
- [ ] The list response is normalized from `data.data_rows` and `data.total`; malformed responses show an error state.
- [ ] Search resets to page one; First, Previous, numbered, Next, and Last paging work for empty, full, and partial final pages.
- [ ] Row numbers equal `skip + index + 1`, and fixed server ordering is rendered without client sorting.
- [ ] Unchecked Active sends `active=N` and preserves the verified legacy meaning of an unfiltered result set.
- [ ] Retry preserves search and filter state; stale asynchronous responses cannot overwrite a newer access generation.
- [ ] Focused ticket tests and relevant existing regression tests pass; no backend, shared-infrastructure, or legacy-page changes are made.
