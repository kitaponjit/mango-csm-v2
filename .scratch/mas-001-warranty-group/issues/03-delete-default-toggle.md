# 03 — Row delete with FK behavior and default toggle

**What to build:** an admin can delete a row after an explicit code-naming confirmation (blocked deletions surface the server's in-use message and reload safely), and can flip the default marker with one click — refused on inactive rows, reloaded after — reproducing backend default semantics exactly, sharp edges included.

**Blocked by:** 01 — Migration shell, access gate, server-paged list with search (needs the list, row identity, and reload flow). Independent of 02.

**Status:** ready-for-agent

Spec sections: User Stories 19–25; Implementation Decisions (API contracts – Delete/Default, Data invariants – default singleton convention).

- [ ] RED: delete/toggle tests fail against pre-change code, then GREEN with the minimum service delete/toggle methods + page actions
- [ ] Delete confirms with the code named; success reloads with notice; in-use rows show the server block message and keep the row
- [ ] Default marker renders exactly one highlighted row (honestly rendering zero/multiple if the data says so — never repairing)
- [ ] Toggle posts the row header to the verified default endpoint and reloads; clicks on inactive rows are refused as today; toggle-off leaving zero defaults behaves as today
- [ ] No invented guards (no delete-block on default rows, no locking, no uniqueness) — backend owns the invariant
