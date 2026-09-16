# 04 — 12-column Master Import

**What to build:** An authorized administrator can map spreadsheet columns A–L to the verified Warranty Item Master fields, preview the result, and submit one atomic batch while preserving legacy normalization and blank-code behavior.

**Blocked by:** 01 — Shell, access, and server-paged Warranty Item catalog

**Status:** ready-for-agent

- [ ] RED tests cover parsing, A–L mapping, preview, blank-code filtering, Active normalization, duration coercion, submission, and error preservation before implementation.
- [ ] The Import dialog accepts the verified 12-column shape: Warranty Code, Warranty Name, Warranty Group, Days, Months, Years, Lifetime, Material Code, Vendor, Start Date, End Date, and Active.
- [ ] The user can map source columns A–L and inspect mapped rows in a preview before submission.
- [ ] Blank Warranty Codes are skipped; Active and numeric duration values are normalized according to verified legacy behavior without duration rollover.
- [ ] Submission is exactly one `{ data: [...] }` request to the verified Master Import endpoint; no client-side partial loop is introduced.
- [ ] Success reports the processed count and refreshes the catalog; parse/server errors preserve useful input or preview context and never claim success.
- [ ] Read-only users cannot open or submit Import.
- [ ] Material picker UI, Reference IC, Auto Import, and backend changes remain out of scope.
- [ ] Focused parser, service, and page tests plus relevant regression tests pass.
