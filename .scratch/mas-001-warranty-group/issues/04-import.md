# 04 — Import mapping, preview, and mapped-rows upload

**What to build:** an admin can open the import dialog, map spreadsheet columns A/B/C to Code/Name/Active with a live preview, upload the mapped rows, and see the result reported with the list reloaded — matching legacy import outcome row for row (upsert, skips, coercion).

**Blocked by:** 01 — Migration shell, access gate, server-paged list with search (needs the list and reload flow). Independent of 02 and 03.

**Status:** ready-for-agent

Spec sections: User Stories 26–28; Implementation Decisions (API contracts – Import, Data invariants – import semantics).

- [ ] RED: mapping/normalize/upload tests fail against pre-change code, then GREEN with the minimum local import mapper + preview + service upload method
- [ ] Default A/B/C mapping is user-editable with live preview before send; payload is the mapped row array (Code/Name/Active), not a file upload
- [ ] Blank-code skip, Active coercion, tenant upsert, IMPORT audit, and preserved default state all asserted at contract level
- [ ] Result reported, list reloaded; failures keep the dialog usable with the server message
- [ ] Mapper stays slice-local — no shared importer abstraction
