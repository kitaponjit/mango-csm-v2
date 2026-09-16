# 02 — Modal create and edit with validation

**What to build:** an admin can open an Add Group Code dialog (blank, Active on), create a valid group and see it after reload with success notice; can open an Edit dialog for one row (Code locked, prefilled from a fresh single-row read), save changes, and gets inline validation plus server-error-preserving retry. Invalid input never sends a request.

**Blocked by:** 01 — Migration shell, access gate, server-paged list with search (needs the route, list, reload flow, and service pattern).

**Status:** ready-for-agent

Spec sections: User Stories 12–18; Implementation Decisions (API contracts – Create/Edit, Data invariants – code immutability).

- [ ] RED: create/edit/validation tests fail against pre-change code, then GREEN with the minimum modal form + service create/update/read-one methods + single-row validate
- [ ] Create sends the verified header shape; code length/charset/trim enforced client-side; Active defaults on
- [ ] Edit prefills from a fresh single-row read (never stale grid data); Code input locked; update sends mutable fields only, never the default flag
- [ ] Validation failures explain inline with no request; failed saves keep dialog input and surface the server message; success reloads the list
- [ ] Read-only users cannot reach or trigger either dialog handler
