# [EPIC] Migrate Warranty Item Core to frontend target

| Field | Value |
|---|---|
| Status | PLANNING / READY FOR DEV (no implementation) |
| Owner (handoff_to) | Thanat-wut |
| Source slice | mas_002 Warranty Item Core (T1–T4 GREEN in Nuxt scaffold, T5 PAUSED) |
| Target | `frontend/` Nuxt 4 SPA (dev decision 2026-09-15) — `Nuxt/` is HISTORY_ONLY |
| Legacy owner | `Website/.../Master/v_csm_mas_002.vue` + `frontend/.../Master/v_csm_mas_002.vue` (ported verbatim, still shippable) |
| Date | 2026-09-16 |

## 1. Context

Warranty Items live on legacy screen `/page/master/v_csm_mas_002/` (Vue 2 idioms, ported verbatim to `frontend/`). The combined screen mixes ordinary catalog CRUD with Reference IC linking and 22-column Auto Import. T1–T4 proved the Core slice (list/search/paging, create/edit, delete guard, 12-col Master Import) in the superseded `Nuxt/` scaffold (`/csm-next/master/warranty-item/`, 81/81 suite, build pass). T5 export PAUSED after PR #25 declared `frontend/` the target. This Epic translates — never blind-copies — the proven Core slice into the `frontend/` target. No `Nuxt/` revival. No legacy/backend edits. No Reference IC / Auto Import.

Authoritative inputs: `.scratch/mas-002-warranty-item/spec.md`, `issues/01–05`, root `AGENTS.md`, `frontend/MIGRATION.md`, `docs/integration/frontend-backend-connection.md`, `frontend/app/Components/Pages/Master/v_csm_mas_002.vue` (~1547 lines), `docs/backend/contract-navigation-knowledge.md` §3 (MasterController pointer only).

## 2. Domain Model (4 layers)

**Business:** Tenant-scoped warranty catalog. Warranty Group (type_code/type_name, `default_=='Y'` pick) classifies items. Warranty Item = salable warranty definition (war_code PK within tenant, war_des, group, discrete Days/Months/Years OR Lifetime, material ref, vendor + validity window, active flag). Duration rule: discrete non-negative integers, no rollover; Lifetime Y ⟺ D=M=Y=0. Material (itemcode/itemname) is a manual reference, no picker. Reference IC = passive receipt linkage (ic_docno/ic_itemno, cust→vendor, war_date_start/end, acct_no, loccode, pre_event) shown read-only, bulk-created via Create reuse with computed durations — NOT core. Unit/Area refs (`rd_mas_area_item`, `rd_mas_proj_warranty` per spec) are server-side delete guards only, never client-invented.
**Legacy storage:** SQL Server behind API (EF6 + raw SQL per backend survey; tables `rd_mas_area_item`/`rd_mas_proj_warranty` cited in spec only, unverified in this checkout — UNKNOWN authority). No tenant field in payloads; audit cols (add_user/add_dt/edit_user/edit_dt) display-only.
**API contract (verified client-side, server behavior UNKNOWN):** `CSM/Master/WarrantyItem_ReadList?skip&take&field&text&active` → `{data_rows,total}` (≠ Group's `data.data`); `WarrantyItem_Read?war_code=` (fresh edit prefill + passive IC meta); `WarrantyItem_Create/Update {header:{war_code,war_des,type_code,tot_date,tot_month,tot_year,lifetime,itemcode,active}}` (code immutable, IC omitted; preserve lowercase `Warrantyitem_Update`); `WarrantyItem_Delete {header:{war_code}}`; `WarrantyItemImportData_Master {data:[12-col rows]}` (one batch, upsert by tenant+code); `WarrantyItemExport_Master` → token → `Api/File/DownLoad?download=true&id=`; `WarrantyRefIC?skip&take&search_field&search_text` → `{data,total}` (deferred); `WarrantyAutoImportData` 22-col A–V (deferred); sibling consumer `WarrantyItem_ReadList2?search_text=` in mas_003.
**Frontend representation (target):** Route `/page/master/v_csm_mas_002/` (`routes.master.js:17-28`, meta `CSM_WEB/20820 checkUserRight`), menu `menu.vue:175-187` under 20800 group. Page state in SFC `data()` + vendor `Pagination.js`; transport `$xt.getServer/postServerJson` at `{dataServer}/service/...`; auth via `auth.global.js` + `X-Mango-Auth`; language bundle for `mas002.*`; dialogs via `jquery-confirm`/`toastr`/`alert-service.js`; grids ag-Grid v33 + `ModuleRegistry`.

## 3. Scope IN / OUT

IN: catalog list/search (`war_code|war_des`)/active filter/server paging (take=500 default); create/edit with group-default + validation + lifetime rule; delete with server guard surfacing; 12-col Master Import (A–L logical: code,name,group,d,m,y,lifetime,itemcode,vendor,start,end,active — legacy physical skips I/uses M, follow logical per T4 contract); server export via File capability; `CSM_WEB/20820` gating; read-only guards; legacy quirks preserved (`active=N`=unfiltered, no `testday()` hook, single init path).
OUT: Reference IC toolbar/dialog/receipt linking (`iccost=='3'` gate, `WarrantyRefIC`, `addRefIC` bulk, IC readonly section); 22-col Auto Import (`WarrantyAutoImportData`, `Template_All_Warranty`); Material picker (`vue-itemcode-list` stays manual input); client `XLSX.writeFile` fallback; backend/schema/migration changes; `Website/` edits; shared-infra abstractions; new Group ticket; cutover/retirement/E2E (deferred with evidence).

## 4. Evidence links

- Spec: `.scratch/mas-002-warranty-item/spec.md` §§1–10; tickets `issues/01–05`.
- Legacy: `Website/Scripts/App/Application/Components/Pages/Master/v_csm_mas_002.vue` (ReadList L659, RefIC L683, Read L745, Create L759+964, Update L761, Delete L795, ImportMaster L883, AutoImport L1028, exportUrl L8; no `rd_mas_*` client refs; dead `testday()` binding).
- Target mirror: `frontend/app/Components/Pages/Master/v_csm_mas_002.vue` (mechanical port only: `#slots`, `~/stores/helpers`, `loadingBox` no-op guard).
- T1–T4 proof (HISTORY): `Nuxt/app/features/warranty-item/*`, `Nuxt/app/pages/master/warranty-item/index.vue`, `Nuxt/test/warranty-item/*` (81/81); T4 contract: logical A–L, one-batch `{data}`, blank-code skip, blank-active throws, lifetime-Y zeroes.
- Platform: root `AGENTS.md` (frontend/=target, Nuxt/=superseded, no direct DB, no new SSO); `frontend/MIGRATION.md` (port deltas, ag-Grid/v-model/SignalR/vendor fixes); `docs/integration/frontend-backend-connection.md` §§2–9 (path base `/service/`, `X-Mango-Auth`, URL shape, vendor rule, failure modes).
- Consumers: mas_003 (ReadList2 pick + area attach), mas_008 (expiry calc duplicate), mas_008_delete (match-key), trn_001 + edit_details (lifetime text), war_rpt01/branch/rpt_002 (war_des/war_code filters). See V2 report §5.

## 5. Strategy: Discover → Model → Verify → Translate → Test → Learn → Next

D: read-only domain + consumer survey (this Epic). M: 4-layer model + INV register (V2 report). V: backend contract confirmation in owning repo (guard tables, import validation, count semantics) before delete/import parity claims. T: per-capability translation into `frontend/` idioms (§6), smallest diff, no generic abstractions. T: RED→GREEN observable-behavior tests + regression (sibling masters, shared seams) + build; unit ≠ UAT. L: record deltas/quirks as evidence. N: Phase plan §7.

## 6. frontend/ target mapping + T1–T4 disposition

| Capability | Target seam | T1–T4 artifact → disposition |
|---|---|---|
| Route/ownership | `routes.master.js` 20820 entry + `Master/v_csm_mas_002.vue` (owner) | `index.vue` structure → REBUILD (AdminLTE + vendor dialogs) |
| API | `$xt.getServer/postServerJson` at `{dataServer}/service/...` | `warranty-item-service.ts` (6 endpoints+shapes, lowercase Update) → TRANSLATE |
| Auth/authz | `auth.global.js` + `ViewUserAuthentication` + `meta.mangoMenu` | `warranty-item-access.ts` (`CSM_WEB/20820`) → REUSE verbatim |
| State/paging | SFC `data()` + `Pagination.js` vendor | `warranty-item-model.ts` (take=500, `data_rows`, pager math, validation) → ADAPT |
| Dialogs | `jquery-confirm`/`toastr`/`alert-service.js`, `#slots` | page handlers/generation guard/`data-testid` → REBUILD; guard logic → ADAPT |
| Import | page script + `$xt.postServerJson`, upload via `postServerForm` pattern | `warranty-item-import.ts` (A–L map, coerce, paste parse) → ADAPT |
| Export | server token → shared File capability `DownLoad?id=` | T5 (no artifact; exportUrl L8 + local XLSX noted) → REBUILD (server path only) |
| Localization | language bundle (`LanguageSelector→LangDisplay`) + `window.auth/userRight` | `warranty-item-texts.ts` (`mas002.*` EN/TH) → ADAPT via bundle/`$t` |
| Testing | route-level observable tests (ports of T1–T4 suites) | all `Nuxt/test/warranty-item/*` → TRANSLATE (assert same behaviors, vendor idioms) |
| History | `Nuxt/` scaffold retained, not built upon | all `Nuxt/` files → HISTORY_ONLY; legacy quirks (`active=N`, no `testday`) → REUSE as behavior |

## 7. Next Work (Phases A–H)

A Discover-verify: confirm backend guard/import/export semantics in owning repo. In: spec+legacy evidence. Out: verified contract sheet. Dep: backend access. Stop: guard tables unconfirmed → no delete parity claim. Ev: contract sheet.
B Model-freeze: lock 4-layer model + INV-01..15. Out: this Epic + V2 report. Dep: A. Stop: ambiguity → OPEN QUESTION, not guess.
C Route seam: establish `frontend/` capability slice boundary (no shared-infra edits). Dep: B. Stop: shared change needed → separate approval.
D List/paging/auth (ex-T1): translate. Dep: C. Stop: envelope mismatch → halt.
E Create/edit (ex-T2): group-default + validation + IC-exclusion. Dep: D (+Group service as-is).
F Delete guard (ex-T3): server message surfacing. Dep: D+A. Stop: no backend proof → message-passthrough only.
G Master Import (ex-T4): A–L map/preview/one-batch. Dep: D+A.
H Server Export (ex-T5): token→File capability. Dep: D+A. Stop: token semantics unconfirmed → error-path only.
Each phase: RED→GREEN, focused + sibling regression, build, `git diff --check`; unit ≠ UAT stated.

## 8. Acceptance / DoD

Parity for IN-scope behaviors with evidence; no OUT-scope leakage; smallest reviewable diff; `frontend/` idioms only; `active=N` quirk + lifetime rule + code immutability + IC-exclusion preserved; read-only guards enforced; no `Nuxt/` edits; no legacy/backend edits; validation known, skips stated; unresolved items as OPEN MIGRATION QUESTIONs.

## 9. Constraints (binding)

No `Nuxt/` revival. No blind copy of T1–T4 (translate per §6). No `Website/`/`Backend/` edits. No Reference IC / Auto Import / Material picker / client-XLSX. No new SSO. No generic CRUD/pager/importer/abstraction. No production cutover/retirement claim. Unit/component pass ≠ integration/UAT.

## 10. Open questions

1. Server delete-guard tables/rules (`rd_mas_area_item`, `rd_mas_proj_warranty`) — no client evidence; needs owning-repo read. 2. Import processed-count semantics (backend exposes none; T4 used submitted count). 3. Blank-active reject vs coerce (backend rejects per survey). 4. `WarrantyItem_ReadList2` ownership (mas_003 consumer). 5. Group-broadcast/realtime for warranty screens (none — `JoinGroup` has no caller). 6. Cutover/retirement criteria (nothing retireable today per AGENTS.md).
