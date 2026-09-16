# 03 — Delete with referential-integrity protection

**What to build:** An authorized administrator can deliberately delete an unused Warranty Item, while server-reported references from units or project area allocations prevent deletion and remain visible to the user.

**Blocked by:** 01 — Shell, access, and server-paged Warranty Item catalog

**Status:** ready-for-agent

- [ ] RED tests cover confirmation, cancellation, delete request, read-only guard, server rejection, and successful reload before implementation.
- [ ] Delete requires explicit confirmation naming both Warranty Code and Warranty Name; cancel sends no request.
- [ ] The request uses the verified delete contract with `{ header: { war_code } }`.
- [ ] Server rejection caused by unit warranty or project area references leaves the row intact and displays the server's explanatory message.
- [ ] Successful deletion reports completion and reloads the catalog safely.
- [ ] Read-only users cannot open confirmation or trigger the delete handler.
- [ ] No client-side referential-integrity substitute, backend change, or legacy-page change is added.
- [ ] Focused service and page tests plus relevant regression tests pass.
