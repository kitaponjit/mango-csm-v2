# Frontend Layout Inventory — Complete Source Baseline

| Field | Value |
|---|---|
| **Status** | Complete static-source inventory for UI consistency work |
| **Verified** | 2026-09-14 against commit `8e181f50c55c939bbb5379c1bb6ece5758322e4d` |
| **Physical scope** | All 443 `.vue` files in `Website/`, `frontend/`, and `Nuxt/`; first-party layout CSS; route tables; host/bootstrap files; frontend package manifests |
| **Logical scope** | 218 legacy components, their 218-file Vue 3 mirror, one extra `frontend/app/app.vue`, and 6 independent `Nuxt/app` Vue files |
| **Purpose** | Exhaustive source evidence for `docs/migrations/future-ui-consistency.md` and UI-1 through UI-5 planning |
| **Not proven here** | Runtime rendering, visual parity, keyboard behavior, screen-reader behavior, permissions, API behavior, browser compatibility, or production readiness |

This replaces the 2026-09-12 grouped survey. The old survey described important inconsistencies, but its `~175` file estimate omitted the later `frontend/` tree and did not enumerate every active route. Counts in this version use a single unit: **files containing at least one matching opening tag or source pattern**. Physical file counts and logical mirrored-component counts are kept separate.

## 1. How to use this inventory

- **UI-1 tokens and foundations:** use §8 and §10.
- **UI-2 page shells:** use §5, §6, and §9.
- **UI-3 primitives:** use §7 and §11.
- **UI-4 responsive behavior:** use §10.3.
- **UI-5 retirement:** use §11.
- **Route migration/parity:** use §4 and §12.
- **Scope checks after a change:** rerun §3 and update the snapshot commit and date.

Do not add the `Website/` and `frontend/` pattern counts together when estimating migration work. They are two physical implementations of the same 218 logical component paths. Do count both when estimating maintenance and drift risk.

## 2. Frontend topology and ownership

| Tree | Stack and role evidenced in the tree | Vue files | Route surface | Styling source | Validation state |
|---|---|---:|---:|---|---|
| `Website/` | Active legacy SPA: Vue 2.7, Vue Router 3, Vuex 3, Vite 5, ASP.NET host | 218 | 111 active route imports | AdminLTE/Bootstrap globals, `Content/*.css`, 7 component CSS files, SFC styles | Existing deployable application; browser validation remains manual |
| `frontend/` | Bulk Nuxt 4/Vue 3 port mirroring the legacy component and route trees | 219 | 111 active route imports; 2 inactive duplicate error routes in `routes/spike.js` | Copied legacy vendor CSS plus one app CSS import and mirrored SFC/CSS files | `MIGRATION.md` says never installed or built; blocked Vue-2-only libraries remain |
| `Nuxt/` | Independent governed first-slice target under `/csm-next/` | 6 | 3 file-based pages | `app/assets/css/main.css` with `--target-*` tokens and scoped page CSS | Vitest coverage exists; this inventory does not claim integration/UAT |
| **Total physical** | Three coexisting frontend trees | **443** | **111 mirrored legacy routes + 3 independent pages** | Three style systems | Transitional |

Breakdown:

| Tree | Pages | Shared controls | Layouts | Errors | Root app | Total |
|---|---:|---:|---:|---:|---:|---:|
| `Website/` | 188 | 25 | 3 | 2 | 0 | 218 |
| `frontend/` | 188 | 25 | 3 | 2 | 1 | 219 |
| `Nuxt/` | 3 | 2 | 0 | 0 | 1 | 6 |

`Website/Scripts/App/Application/Components/**` and `frontend/app/Components/**` have the same 218 relative `.vue` paths. At this snapshot, 68 pairs are byte-identical and 150 differ because of Vue 3 migration edits or subsequent drift. Their layout-tag counts remain equal, so §§6–11 describe the logical legacy surface once and §12 records the mirror risk.

**OPEN MIGRATION QUESTION:** repository governance identifies `Nuxt/` as the established target boundary, while `frontend/` describes itself as the Nuxt replacement and carries a full copied route/component tree. The owning team must decide whether `frontend/` supersedes, merges with, or is retired in favor of `Nuxt/`. Until then, neither target tree may be silently treated as the sole canonical frontend.

## 3. Reproduction method

Run from the repository root. Do not scan `node_modules/`.

```powershell
# Physical Vue-file totals
$vue = @(rg --files -g '*.vue')
$vue.Count
@($vue | Where-Object { $_.StartsWith('Website\') }).Count
@($vue | Where-Object { $_.StartsWith('frontend\') }).Count
@($vue | Where-Object { $_.StartsWith('Nuxt\') }).Count

# Legacy logical breakdown
@(Get-ChildItem Website/Scripts/App/Application/Components/Pages -Recurse -File -Filter '*.vue').Count
@(Get-ChildItem Website/Scripts/App/Application/Components/Center -Recurse -File -Filter '*.vue').Count
@(Get-ChildItem Website/Scripts/App/Application/Components/Layouts -Recurse -File -Filter '*.vue').Count
@(Get-ChildItem Website/Scripts/App/Application/Components/Errors -Recurse -File -Filter '*.vue').Count

# Active route imports; frontend/app/routes/spike.js is intentionally excluded
@(rg -o 'component:\s*\(\)\s*=>' Website/Scripts/App/Application/Routes).Count
@(rg -o 'component:\s*\(\)\s*=>' frontend/app/routes -g '!spike.js').Count

# Direct-consumer example: counts files, not opening/closing-tag hits
@(rg -l -i --glob '*.vue' -- '<modal-2(?:\s|>)' Website/Scripts/App/Application/Components).Count
```

The tables below scan every legacy page SFC. Definitions:

- `R/C/Q` = files containing `<re-page>` / `<customer-page>` / a locally registered `<report>` shell.
- `N/S/U/M` = no `<style>` / scoped-only / unscoped-only / mixed scoped and unscoped style blocks.
- `F/F2`, `M/M2/M3`, and `P/P2` refer to direct opening tags for the numbered legacy variants.
- `No ui.*` means no `ui.<key>` reference anywhere in the SFC. It does not prove every remaining file is fully localized.
- `Runtime CSS` means a jQuery `.css(...)` call. It excludes direct DOM `element.style` assignment.
- Commented markup can cause a small false-positive in tag counts; candidate retirement still requires a targeted read.

## 4. Exhaustive active route inventory

The following are all 111 active legacy route imports in both `Website/` and `frontend/`. The `frontend/` versions preserve route names and paths; the Vue Router 4 port changes only the wildcard syntax. There are 109 imports into `Components/Pages` and 2 error imports.

| Route module | Count | Route names |
|---|---:|---|
| `routes.config` | 4 | `v_csm_config_001`, `v_csm_config_002`, `v_csm_config_003`, `v_csm_config_004` |
| `routes.customerconfigcenter` | 3 | `v_csm_setup_company`, `v_csm_setup_application`, `v_csm_setup_document_running` |
| `routes.custommango` | 6 | `v_csm_create_case`, `v_csm_dashboard_case`, `v_csm_case_complete`, `v_csm_manage_program`, `v_csm_logs_program`, `v_csm_logs_report` |
| `routes.dashboard` | 12 | `v_csm_dashboard`, `v_csm_dashboard2`, `v_csm_most_defect`, `v_csm_dashboard1`, `v_csm_all_work_calendar`, `v_csm_remain_by_customer`, `v_csm_dashboard_req`, `it_dev_dashboard_001`, `it_dev_dashboard_001_details`, `operation_dashboard_001`, `operation_dashboard_002`, `operation_dashboard_003` |
| `routes.default` | 11 | `start`, `start2`, `login`, `login_cust`, `CustomerData`, `CustomerDataView`, `Form`, `FormDetail`, `MasterData`, `ModuleData`, `ScheduleUpdateSoftware` |
| `routes.external` | 8 | `v_csm_external`, `v_mas_update_list`, `v_mas_form_sign`, `v_csm_external_detail`, `v_csm_settings`, `v_csm_request_d`, `v_csm_request`, `v_csm_dataview` |
| `routes.manual` | 3 | `v_csm_manual_list`, `v_csm_manual_list_v2`, `v_csm_manual_list_admin` |
| `routes.master` | 26 | `v_csm_mas_001`, `v_csm_mas_002`, `v_csm_mas_003`, `v_csm_mas_004`, `v_csm_mas_005`, `v_csm_mas_006`, `v_csm_mas_007`, `v_csm_mas_008`, `v_csm_mas_008_delete`, `v_csm_mas_009`, `v_csm_mas_010`, `v_csm_mas_011`, `v_csm_mas_012`, `v_csm_mas_013`, `v_csm_mas_014`, `v_csm_mas_015`, `v_csm_mas_016`, `v_csm_mas_017`, `v_csm_mas_018`, `v_csm_mas_019`, `v_csm_mas_021`, `v_csm_mas_021_create`, `v_csm_mas_program`, `v_csm_mas_set_hide`, `v_csm_cus_001`, `v_csm_mas_set_emp_team` |
| `routes.others` | 9 | `access_denied`, `content_not_found`, `Approve Documents`, `v2_csm_login`, `v2_csm_register`, `v_csm_lineoa`, `landing_app`, `empty1`, `empty2` |
| `routes.report` | 12 | `v_csm_rpt_001`, `v_csm_rpt_002`, `v_csm_rpt_003`, `v_csm_rpt_004`, `v_csm_rpt_005`, `v_csm_rpt_006`, `v_csm_rpt_007`, `v_csm_war_rpt01`, `v_csm_war_rpt02`, `v_csm_rpt_contract_pmbm`, `v_csm_rpt_warraty_branch`, `v_csm_add_spec` |
| `routes.tools` | 9 | `v_csm_employee`, `v_csm_emp_d`, `v_csm_passcode`, `v_csm_revision`, `v_csm_tools`, `v_csm_doc_running`, `v_csm_erp_config`, `v_csm_db_list`, `v_csm_call_history` |
| `routes.transaction` | 8 | `v_csm_trn_001_old`, `v_csm_trn_001`, `v_csm_trn_002`, `v_csm_trn_003`, `v_csm_trn_004`, `v_csm_trn_000`, `v_csm_trn_update`, `v_service_detail_poch` |

The independent `Nuxt/` file-based pages are:

| Route | Source | State |
|---|---|---|
| `/csm-next/` | `Nuxt/app/pages/index.vue` | Placeholder shell; hardcoded English; no target state/dialog use |
| `/csm-next/authentication/login/` | `Nuxt/app/pages/authentication/login.vue` | Local-login slice; `t()` localization; `TargetState`; scoped CSS |
| `/csm-next/manual/` | `Nuxt/app/pages/manual/index.vue` | Reference slice; `t()` localization; `TargetState`; `TargetDialog`; scoped responsive CSS |

## 5. Complete legacy component coverage

Every one of the 188 logical files under `Components/Pages` is included in this matrix. `Routes` counts direct route imports, not child-component use. `Center` contains lookup components despite its location under `Pages`; none is directly routed.

| Group | Vue | Routes | Shell R/C/Q | Style N/S/U/M | No ui.* | `@media` | Inline style | `!important` | Runtime CSS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Approve | 1 | 1 | 1/0/0 | 0/1/0/0 | 0 | 0 | 1 | 1 | 1 |
| Authentication | 2 | 2 | 0/0/0 | 0/2/0/0 | 2 | 2 | 1 | 0 | 0 |
| Center | 17 | 0 | 0/0/0 | 2/15/0/0 | 0 | 0 | 15 | 1 | 0 |
| Config | 4 | 4 | 4/0/0 | 2/1/0/1 | 0 | 1 | 4 | 2 | 0 |
| Customer | 1 | 1 | 1/0/0 | 0/1/0/0 | 0 | 0 | 1 | 1 | 0 |
| CustomerConfigCenter | 3 | 3 | 3/0/0 | 0/3/0/0 | 0 | 0 | 1 | 3 | 2 |
| CustomMango | 6 | 6 | 5/0/1 | 1/2/0/3 | 5 | 3 | 4 | 4 | 0 |
| Dashboard | 7 | 7 | 7/0/0 | 2/4/0/1 | 4 | 1 | 7 | 6 | 0 |
| Default | 18 | 9 | 9/0/0 | 3/10/3/2 | 12 | 4 | 12 | 10 | 0 |
| Empty | 2 | 2 | 2/0/0 | 2/0/0/0 | 2 | 0 | 0 | 0 | 0 |
| External | 8 | 8 | 0/7/1 | 7/1/0/0 | 6 | 0 | 5 | 0 | 0 |
| History | 1 | 1 | 0/0/1 | 1/0/0/0 | 1 | 0 | 0 | 0 | 0 |
| ItDev | 15 | 5 | 0/0/0 | 13/0/2/0 | 15 | 2 | 9 | 0 | 0 |
| Manual | 3 | 3 | 2/0/1 | 1/2/0/0 | 3 | 2 | 3 | 2 | 0 |
| Master | 25 | 25 | 25/0/0 | 12/11/0/2 | 6 | 2 | 20 | 9 | 0 |
| Report | 12 | 12 | 0/0/12 | 11/1/0/0 | 12 | 0 | 8 | 0 | 0 |
| Tools | 8 | 8 | 8/0/0 | 2/2/0/4 | 2 | 2 | 7 | 4 | 0 |
| Transaction | 43 | 8 | 7/0/0 | 22/16/2/3 | 16 | 8 | 38 | 21 | 4 |
| V2 | 11 | 3 | 0/0/0 | 3/5/3/0 | 3 | 2 | 4 | 5 | 5 |
| webland | 1 | 1 | 0/0/0 | 1/0/0/0 | 1 | 0 | 0 | 0 | 0 |
| **Total** | **188** | **109** | **75/8/16** | **85/77/10/16** | **90** | **29** | **140** | **69** | **12** |

Additional non-page logical components are fully accounted for by:

- `Components/Center`: 25 shared controls listed in §7.
- `Components/Layouts`: `re-layout.vue`, `customer-layout.vue`, `menu.vue`.
- `Components/Errors`: `403.vue`, `404.vue`.

## 6. Primitive usage by page group

These are direct opening-tag file counts across the same 188 page SFCs.

| Group | Toolbar F/F2 | Table ag/native | Dialog M/M2/M3 | Pager P/P2 |
|---|---:|---:|---:|---:|
| Approve | 0/0 | 0/1 | 0/0/0 | 1/0 |
| Authentication | 0/0 | 0/0 | 0/0/0 | 0/0 |
| Center | 0/0 | 16/0 | 17/0/0 | 16/0 |
| Config | 2/1 | 0/2 | 0/1/0 | 0/0 |
| Customer | 1/0 | 1/1 | 0/0/0 | 1/0 |
| CustomerConfigCenter | 0/0 | 0/3 | 2/0/0 | 0/0 |
| CustomMango | 0/0 | 3/2 | 2/4/0 | 3/0 |
| Dashboard | 0/0 | 3/3 | 0/2/0 | 1/1 |
| Default | 0/0 | 4/8 | 2/7/0 | 9/1 |
| Empty | 0/1 | 0/0 | 0/0/0 | 0/0 |
| External | 0/0 | 0/4 | 2/0/0 | 1/0 |
| History | 0/0 | 0/1 | 0/0/0 | 0/0 |
| ItDev | 0/0 | 1/2 | 0/0/0 | 0/0 |
| Manual | 0/0 | 1/2 | 2/0/0 | 2/0 |
| Master | 4/17 | 17/13 | 4/11/3 | 24/0 |
| Report | 0/0 | 11/1 | 2/0/0 | 0/0 |
| Tools | 0/0 | 7/3 | 4/0/0 | 7/0 |
| Transaction | 2/1 | 13/13 | 5/10/3 | 8/0 |
| V2 | 0/0 | 0/1 | 0/0/0 | 1/0 |
| webland | 0/0 | 0/0 | 0/0/0 | 0/0 |
| **Direct-consumer files** | **9/20** | **77/62** | **47/35/6** | **74/2** |

Fifteen page files contain both `ag-table` and a native `<table>`. FullCalendar and Handsontable are separate specialized display systems and are not included in the `ag/native` columns.

## 7. Shared controls and layouts

All 25 `Components/Center` files are listed here. Consumer counts are logical `Website/` files; the same opening-tag counts exist in the mirrored `frontend/` tree.

| Concept | Shared files | Direct consumer files | Current observations |
|---|---|---:|---|
| Shell | `Layouts/re-layout.vue` → `<re-page>`; `Layouts/customer-layout.vue` → `<customer-page>`; `Layouts/menu.vue` | 75; 8; shell-owned | `re-layout` has mixed scoped/unscoped CSS; customer portal is a separate shell contract |
| Action/toolbar | `action-link.vue`; `form-template.vue`; `form-template-2.vue` | 2; 9; 20 | Two toolbar generations plus per-page custom bars; `form-template.vue` is unscoped and `form-template-2.vue` has no style block |
| Grid/table | `ag-report.vue`; `ag-table.vue`; `table-sticky.vue`; `table-sticky-2.vue` | 0; 77; 6; 12 | `ag-report` has no direct tag consumer; both ag wrappers carry unscoped grid CSS; sticky variants remain split |
| Report shell | `report-condition.vue`; `report-customer.vue` | 15; 1 | Both are locally registered as `<report>`; 16 page consumers total |
| Dialog | `modal.vue`; `modal-2.vue`; `modal-3.vue` | 47; 35; 6 | `modal-2` is the closest reusable legacy baseline; raw Bootstrap and V2 jQuery dialog paths also exist |
| Pagination | `pagination.vue`; `pagination-2.vue` | 74; 2 | `pagination-2` users are dashboard request and software-update schedule; V2 has another `pagination_v2.vue` |
| Date/time/number/input | `datepicker.vue`; `timepicker.vue`; `number.vue`; `input.vue` (`<i-input>`) | 25; 5; 12; 3 | Date wrapper is unscoped; flatpickr separately appears in 2 page files |
| File/data input | `file-attach.vue`; `file-attach-v2.vue`; `import-data.vue`; `voice-typing.vue` | 5; 2; 12; 1 | Multiple upload generations; voice typing is a singleton |
| Loading | `loading-box.vue` | 15 | Coexists with Pace/`firstLoading`, `vue-element-loading`, overlays, and page flags |
| Language/session | `change-language.vue`; `logout.vue` | 3; 1 | Primarily shell-owned; legacy globals and auth contracts remain part of the host boundary |

Style modes of the shared controls:

- Unscoped: `ag-report.vue`, `ag-table.vue`, `datepicker.vue`, `form-template.vue`.
- Mixed: `change-language.vue`, `file-attach.vue`.
- Scoped: `file-attach-v2.vue`, `import-data.vue`, `loading-box.vue`, `modal-2.vue`, `report-condition.vue`, `table-sticky.vue`, `table-sticky-2.vue`, `voice-typing.vue`.
- No local style: `action-link.vue`, `form-template-2.vue`, `input.vue`, `logout.vue`, `modal.vue`, `modal-3.vue`, `number.vue`, `pagination.vue`, `pagination-2.vue`, `report-customer.vue`, `timepicker.vue`.

## 8. Stylesheet, theme, and token inventory

### 8.1 Legacy and mirrored bulk-port foundations

| First-party stylesheet | Lines | Role |
|---|---:|---|
| `Website/Content/Site.css` | 9,595 | Global typography, forms, buttons, tables, tabs, modals, page-specific rules, and responsive overrides |
| `Website/Content/DarkTheme.css` | 2,521 | `body.dark-mode` overrides for shell, forms, tables, and page classes |
| `Website/Content/Helper.css` | 2,172 | Display, spacing, color, and responsive helpers |
| `Website/Content/Site-Skin.css` | 368 | AdminLTE shell/skin overrides |
| `Website/Content/icheck-material.min.css` | 6 | Checkbox/radio styling |

`frontend/public/vendor` copies the legacy vendor/content tree, and `frontend/nuxt.config.ts` loads the same Bootstrap/AdminLTE/font/script stack. `frontend/app/assets/css/app.css` only imports the shared lookup-sheet responsive CSS. Consequently, the bulk port preserves legacy layout debt rather than introducing a new token system.

Seven first-party component CSS files total 5,515 lines in each mirrored tree:

| File | Lines | Main consumers |
|---|---:|---|
| `Center/CSS/lookup-sheet-responsive.css` | 406 | Globally imported lookup/modal behavior |
| `Dashboard/CSS/v_csm_dashboard2.css` | 234 | `v_csm_dashboard2.vue` |
| `Dashboard/CSS/v_csm_remain_by_customer.css` | 1,205 | Remain dashboard and dashboard request |
| `Default/CSS/home-responsive.css` | 865 | `home.vue` |
| `Default/CSS/home2-responsive.css` | 267 | `home2.vue` |
| `Transaction/CSS/trn001-responsive.css` | 1,436 | TRN_001 shell and responsive detail flow |
| `V2/CSS/Style.css` | 1,102 | V2 login/register/LINE UI |

### 8.2 Independent Nuxt target tokens

`Nuxt/app/assets/css/main.css` is 547 lines and defines:

- semantic colors: brand, action, success, warning, danger, focus, surfaces, text, and border;
- body/heading font tokens;
- spacing `xs` through `2xl`;
- radii, control heights, panel/dialog elevations;
- declared breakpoint tokens at 36rem, 48rem, and 64rem;
- `target-*` page, panel, field, button, tab, table, state, and dialog classes.

The stylesheet has no dark-theme mapping. V2’s Prompt/hex palette and legacy Bootstrap/AdminLTE colors also have no documented mapping to `--target-*`. That mapping is migration work, not an incidental legacy fix.

## 9. Domain findings and canonical candidates

### 9.1 Transaction — 43 SFCs, 8 routes

| Routed surface | Current layout evidence |
|---|---|
| `v_csm_trn_000` | `re-page`; ag-grid; pagination; localized; 897 lines |
| `v_csm_trn_001` | `re-page`; delegates most detail/table work; `modal-2`; no active shared toolbar; 3 style blocks; 4,425 lines |
| `v_csm_trn_001_old` | `re-page`; `app-form`; native tables; `modal-2`; pagination; 5,658-line legacy monolith; still actively routed |
| `v_csm_trn_002` | `re-page`; custom toolbar; native table and `modal-2`; 1,504 lines |
| `v_csm_trn_003` | `re-page`; custom toolbar; native table and legacy `modal`; 884 lines |
| `v_csm_trn_004` | `re-page`; custom toolbar; ag-grid and pagination; 913 lines |
| `v_csm_trn_update` | `re-page`; ag-grid and pagination; no `ui.*` reference; 1,001 lines |
| `v_service_detail_poch` | Direct route without page shell; `app-form-2`, ag-grid, `modal-2`; mixed styles including `<style scope>` typo |

Other Transaction evidence:

- `document_details.vue` uses a custom flex shell and `app-form` rather than `re-page`.
- Assignment/POCH uses ag-grid, `table-stick-2`, and modal sizing; `v_jobcode_poch.vue` has no style block.
- `edit_details.vue` (3,793 lines) and `edit_details_mobile.vue` (2,198 lines) are deliberate desktop/narrow twins at 939px. Their template and scoped CSS must move together.
- Six attach/edit fragments remain near-duplicates and are drift candidates.
- The 13 files in `Transaction/components` span `modal`, `modal-2`, `modal-3`, and raw Bootstrap modal patterns.
- AI analysis and change-detail components contain substantial inline styling without a local style block.

Canonical candidate: `re-page` + semantic action bar + documented table choice + `modal-2`-compatible dialog adapter. Preserve the deliberate 939px domain split until parity is tested.

### 9.2 Master, Customer, Center, Dashboard, and Report — 62 SFCs, 45 routes

- Master: 25/25 use `re-page`; toolbar split is 4 `app-form`, 17 `app-form-2`, and custom/none elsewhere; 17 use ag-grid and 13 use native tables; modal use spans all three generations.
- Customer: `v_csm_cus_001` uses `re-page`, legacy `app-form`, ag-grid plus a native table, and pagination.
- Center: 17 lookup components are not routes; 16 use ag-grid, all 17 use legacy `modal`, 16 use pagination, 15 are scoped, and 2 have no style block.
- Dashboard: 7/7 use `re-page`; table, toolbar, and chart patterns differ by screen; `pagination-2` appears in `v_csm_dashboard_req`.
- Report: 12/12 use the local `<report>` shell; 11 use ag-grid; only `v_csm_rpt_007` has a local scoped style block; all 12 have no `ui.*` reference.
- `v_csm_rpt_contract_pmbm` imports a Transaction component, creating cross-domain UI coupling.

Canonical candidates: `re-page` + `app-form-2` behavior for master data, one lookup-dialog contract for Center, and the report-condition shell as a distinct report layout rather than forcing reports into `re-page`.

### 9.3 Config, setup, manual, tools, default, portal, charts, History, and V2 — 83 SFCs, 56 routes

- Config: 4/4 use `re-page`; `_001/_002` use native tables and `app-form`; `_003/_004` diverge into larger custom flows.
- CustomerConfigCenter: 3/3 use `re-page` and native tables; two use legacy `modal`; runtime jQuery sizing exists in two files.
- Manual: three routes, three treatments — `re-page` list, custom admin page, and `<report>`-shell V2 list.
- CustomMango: 5/6 use `re-page`; logs report uses `<report>`; logs program combines ag-grid, Handsontable, and flatpickr.
- Tools: 8/8 use `re-page`; 7 use ag-grid; `ec-*`/`ed-*` custom systems remain.
- Default: 18 SFCs but only 9 direct routes; 9 use `re-page`; routed containers own the remaining child components.
- External: 8 routes; 7 use `customer-page`, one uses the customer report shell; 7 have no local style block.
- History: one routed call-history report shell with a native table, no local style block, and no `ui.*` reference.
- ItDev: 15 SFCs, 5 routes; 13 have no local style, 15 have no `ui.*` reference, and many are chart fragments rather than full pages.
- Authentication: two standalone scoped pages with media rules and no `ui.*` references.
- Approve: one `re-page` route with a native table, pagination, inline/runtime sizing, and `!important` rules.
- Empty and webland: three active utility/test/landing routes with no localized text references; all three have no local styles.
- V2: 11 SFCs and 3 routes; standalone Prompt/LINE theme, jQuery modal files, `pagination_v2`, runtime body styling, and a 3,932-line `v_csm_lineoa.vue` shell.

## 10. Cross-cutting consistency evidence

### 10.1 Localization

- 90/188 legacy page SFCs contain no `ui.<key>` reference.
- Largest zero-reference groups: ItDev 15/15, Report 12/12, Default 12/18, Transaction 16/43, External 6/8, Master 6/25, CustomMango 5/6, Dashboard 4/7, Manual 3/3.
- `ct-company.vue` reads a `state.ui` dialect; most localized legacy pages use template `ui.*` and/or `this.ui`.
- Nuxt login and manual use the target `t()` adapter. Nuxt index is hardcoded English scaffolding.
- A file having one `ui.*` key is not proof that all labels, placeholders, grid headings, alerts, and fallback text are localized.

### 10.2 Dialog, table, loading, date, and icon systems

| Concept | Current systems | Consolidation direction |
|---|---|---|
| Dialog | `modal`, `modal-2`, `modal-3`, V2 `modal.vue`, V2 `modal_customize.vue`, raw Bootstrap/jQuery, Nuxt `TargetDialog` | One target dialog contract; adapt `modal-2` behavior during migration |
| Toolbar | `app-form`, `app-form-2`, csm/rc/bg-navy/d2/ec/ed/mv2 custom bars | One semantic action bar with explicit variants |
| Pagination | `pagination`, `pagination-2`, `pagination_v2`, target page-local controls | One pager event/prop contract |
| Table/list | ag-grid, native table, sticky-table wrappers, card/div lists, Handsontable, FullCalendar | Default table convention; specialized grids require documented need |
| Loading | Pace/`firstLoading`, `loading-box`, `vue-element-loading`, overlay markup, local flags, `TargetState` | One loading/empty/error model per scope |
| Date/time | shared date/time wrappers, flatpickr in 2 files, FullCalendar, native/custom inputs | One date-field contract; calendar remains a distinct domain control |
| Icons | Font Awesome 5/v4 shims, Ionicons, MDI, glyphicons, Vue icon components, SVG, PNG | One target icon policy with an explicit legacy adapter period |

### 10.3 Responsive behavior

- 29/188 page SFCs contain local `@media`; most other pages rely on Bootstrap grids, global CSS, shared shells, or table wrappers.
- First-party legacy CSS contains many distinct width decisions, including 480, 520, 560, 575/576, 639/640, 680, 760, 767/768, 880, 900, 939/940, 991/992, 1023/1024, 1080, 1100, 1199/1200, 1366, 1399/1400, 1536, and 1600px.
- JavaScript viewport branches additionally use 639, 939, 991, 992, 1023/1024, 1600, and 1645px.
- TRN_001’s desktop/mobile detail split intentionally aligns CSS and `matchMedia('(max-width: 939px)')`.
- V2 uses Bootstrap `visible-*`/`hidden-*` patterns and JavaScript width branches; `v_csm_lineoa.vue` duplicates large search/hero markup by viewport.
- Nuxt target CSS declares 36rem/48rem/64rem tokens, but actual media rules currently use 40rem and 48rem. CSS custom properties cannot themselves be used directly as media-query thresholds, so breakpoint naming and implementation still require an explicit policy.

### 10.4 Style leakage and runtime layout mutation

- 85/188 page SFCs have no local style block; this usually means reliance on global/shell CSS, not that the page is unstyled.
- 10 are unscoped-only and 16 mix scoped and unscoped blocks.
- `<style scope>` typos occur in `v_csm_line_register.vue` and `v_service_detail_poch.vue`. They are global in both physical mirrored trees.
- 140/188 page SFCs contain inline style bindings/attributes; 69 contain `!important`; 12 invoke jQuery `.css(...)`.
- Shared unscoped CSS exists in ag-grid wrappers, datepicker, legacy toolbar, and `re-layout`’s mixed style blocks.
- Runtime body/content mutations in V2 and fixed pixel/window-height calculations are especially risky when shells are unified.

### 10.5 Accessibility screening

- 144/188 legacy page SFCs contain a `<button>`, but only 11 contain any `aria-*` attribute and 11 contain any explicit `role=`.
- Only 9 contain an `alt=` attribute; this is a source signal, not a count of images missing alternatives.
- Native Bootstrap/jQuery modals need focus, Escape, backdrop, labelling, and focus-return testing before replacement.
- `TargetDialog` uses native `<dialog>`, `aria-labelledby`, a labelled close button, cancel handling, and backdrop close. Focus-return and cross-browser behavior still require browser tests.
- No WCAG conformance claim follows from this inventory.

## 11. Retirement and consolidation candidates

These are evidence-backed candidates, not authorization to delete code:

| Candidate | Evidence | Required gate |
|---|---|---|
| `v_csm_trn_001_old.vue` | 5,658-line duplicate-generation screen; still an active route | Confirm users/bookmarks/menu references have moved and parity is signed off |
| `pagination-2` + `vuejs-paginate` | 2 direct consumers | Port both consumers to the chosen pager and test page events |
| `ag-report.vue` | 0 direct `<ag-report>` consumers | Confirm there is no dynamic/global string usage before removal |
| `voice-typing.vue` | 1 direct consumer | Decide whether capability belongs in the target field primitive |
| `file-attach-v2.vue` | 2 direct consumers alongside 5 legacy attachment consumers | Select attachment contract after feature comparison |
| `flatpickr` page use | 2 files | Confirm shared date wrapper covers range/time/calendar behavior |
| `modal-3` | 6 direct consumer files | Compare features with target dialog adapter before consolidation |
| V2 jQuery modals/pager | Separate local generation | Replace as V2 routes migrate; preserve customer-auth behavior |
| `<style scope>` typos | 2 logical files / 4 physical files | Fix both mirrored implementations together and visually regression-test |
| `routes/spike.js` in `frontend/` | 2 inactive duplicate error routes; not imported by route index | Confirm it is not a retained experiment before removal |

## 12. Migration parity and maintenance rules

### 12.1 `Website/` ↔ `frontend/`

- The 218 component-relative paths match exactly.
- 150/218 pairs differ in content at this snapshot; differences include intentional Vue 3 changes and may also conceal drift.
- All page-group shell/table/dialog/pager opening-tag counts currently match, so no broad layout generation has yet diverged.
- `frontend/` preserves all 111 legacy routes. Its unused `routes/spike.js` is excluded from active counts.
- Any layout fix made before target ownership is resolved must be assessed in both trees. Do not mechanically overwrite Vue 3 compatibility changes with Vue 2 source.
- `frontend/MIGRATION.md` records unresolved Vue-2-only component packages, template-semantics checks, and the absence of a completed install/build. Source presence is not runtime parity.

### 12.2 Independent `Nuxt/` slice

- `app.vue` is a pass-through `<NuxtPage>` and does not yet provide a global application layout.
- `TargetDialog` and `TargetState` are the only shared Vue UI primitives.
- Manual is the strongest current reference for target page structure, state handling, table overflow, dialog use, localization, and responsive CSS.
- Authentication follows target tokens and state handling but has page-local layout CSS.
- Index remains scaffolding and must not be treated as a production pattern.

### 12.3 Required checks for future inventory updates

1. Record the new commit and verification date.
2. Recount physical `.vue` files by tree.
3. Recount active route imports and identify inactive route files.
4. Compare the 218-path mirror sets and report additions/deletions.
5. Recompute §5 and §6 using file counts, not raw opening/closing-tag hits.
6. Add new shared primitives, CSS files, shells, dialog/table/pager variants, and breakpoint values.
7. Update route and page tables in the same change that adds or retires a screen.
8. State whether build, browser, responsive, dark-mode, keyboard, and screen-reader checks were actually run.

## 13. Current conclusion

The repository does not have one frontend layout system. It has:

1. a large Vue 2/AdminLTE system in `Website/`;
2. a physical Vue 3/Nuxt mirror in `frontend/` that retains the same layouts and global CSS but is not build-verified; and
3. a small independent Nuxt target slice with a semantic token and state/dialog foundation.

The most reusable legacy structures are `re-page`, the customer shell, report-condition, `app-form-2`, ag-table, `modal-2`, and the primary pager. They are migration inputs, not target APIs. The target direction should preserve route/auth/business behavior while converging on the `--target-*` foundation, one action bar, one dialog contract, one pager, explicit table-selection rules, and shared loading/empty/error behavior.
