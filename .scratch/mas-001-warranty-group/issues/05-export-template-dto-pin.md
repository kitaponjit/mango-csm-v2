# 05 — Export download and template download with backend DTO pin

**What to build:** an admin can export the full server dataset in the verified 7-column format and download the 3-column import template, both as real files via file tokens — with blocked popups and bad tokens reporting errors instead of false success — and the suite pins the shared list response shape so the sibling consumer can never break silently.

**Blocked by:** 01 — Migration shell, access gate, server-paged list with search (needs the route and shared file plumbing). Independent of 02, 03, and 04.

**Status:** ready-for-agent

Spec sections: User Stories 29–31; Implementation Decisions (API contracts – Export/Template, Data invariants – downstream compatibility).

- [ ] RED: export/template/DTO-pin tests fail against pre-change code, then GREEN with the minimum service export/template methods + page actions via the shared file opener
- [ ] Export requests the full tenant dataset (not the loaded page) and downloads a file through the token → download-URL flow with popup-safe handling
- [ ] Template downloads the verified header-only 3-column file through the same flow
- [ ] Blocked popup / failed token shows an error and never reports success
- [ ] A contract test pins the list response shape (`{data, total}` + row fields incl. default/active) as the cross-page guarantee for the sibling screen; no backend DTO change anywhere
