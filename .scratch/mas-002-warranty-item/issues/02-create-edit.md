# 02 — Create and edit Warranty Items

**What to build:** An authorized administrator can create and edit Warranty Items in validated dialogs, with the existing Warranty Group service supplying active groups and the tenant default group, while identity and passive Reference IC metadata remain safe.

**Blocked by:** 01 — Shell, access, and server-paged Warranty Item catalog

**Status:** ready-for-agent

- [ ] RED tests cover form validation, Warranty Group default selection, fresh read-one prefill, create/update payloads, and modal lifecycle before implementation.
- [ ] Add loads active Warranty Groups through the existing `WarrantyGroupService` and selects `default_ == 'Y'` when present; no new Warranty Group ticket or refactor is created.
- [ ] Missing or failed default lookup leaves the group selectable and does not invent a default.
- [ ] Warranty Code is trimmed, required, limited to 15 legal alphanumeric characters, and immutable after creation; Warranty Name is required and limited to 150 characters.
- [ ] Days, Months, and Years accept non-negative discrete integers; Lifetime zeroes and disables all three duration inputs.
- [ ] Create sends the exact verified header contract, closes only after success, reports success, and reloads the list; invalid input sends no request.
- [ ] Edit performs a fresh single-item read before opening, keeps Warranty Code read-only, and updates only approved mutable fields.
- [ ] Passive Reference IC metadata may be displayed read-only but is never sent as a mutable update field; no Reference IC workflow is added.
- [ ] Failed reads and saves preserve useful dialog context and show the server error; successful saves close, report success, and reload.
- [ ] Read-only users cannot open or trigger create/update handlers.
- [ ] Focused model, service, and page tests plus relevant regression tests pass.
