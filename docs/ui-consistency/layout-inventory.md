# Layout Inventory — All Pages (exhaustive)

| Field | Value |
|---|---|
| **Status** | Evidence for UI consistency work (read-only survey, 2026-09-12) |
| **Scope** | ~175 `.vue` files + layout/CSS/host files across `Website/.../Pages/*`, `Layouts/`, `Center/`, `V2/`, `Nuxt/app` |
| **Relation** | Makes `docs/migrations/future-ui-consistency.md` (representative sample) exhaustive. Feeds UI-1..UI-5 packages. Does not redesign anything. |
| **Method** | 4 teams × learners (read-only) → per-team review with spot-verified claims → synthesis. Counts below are `ui.`-dict occurrences unless noted; hit counts vs file counts may differ by 1–2 (unit variance, same conclusions). |

## How to use this file

- **UI-1 tokens:** start from §6 cross-team consolidation (canonical patterns per concept).
- **UI-3 primitives:** duplicate tables (§6.1) = candidates to unify; consumer counts = migration weight.
- **UI-4 responsive:** §6.4 (twin policy + breakpoint sprawl + no-style islands that can't respond to theme).
- **UI-5 retirement:** variant with ≤2 consumers + legacy `<modal>` pockets + unscoped leakage list (§6.5).

## T1 — Transaction (TRN_001–004 + fragments)

**Canonical:** `<re-page>` shell + `ui.*`-dict i18n + per-fragment modal root + ag-table-or-native per list. TRN_001 delegates tables to children; TRN_002–004 own theirs. `v_csm_trn_001_old.vue` (5658L monolith) coexists with `v_csm_trn_001.vue` — retire candidate, not a second page.

| Area | Deviation (grouped) |
|---|---|
| TRN_001.vue 4425L | No toolbar (btnSave all commented); modal-lg×3 + modal-xl×2; scoped + 2 unscoped `<style>`; inline ~17; i18n `ui.`×172 |
| TRN_001_old.vue | Native tables ×20; `<datepicker>` ×20; app-form btnSave ×13; legacy monolith |
| document_details.vue | No re-page (`div.dd-shell` flex) + app-form btnSave |
| assignment/ + poch/ | ag-table ×4–5 + `table-stick-2`; modal-xl via setSize; `v_service_detail_poch.vue:346` `<style scope>` TYPO (silently global); `v_jobcode_poch.vue` NO style tag |
| job-detail/edit_tasks/ | 6 near-identical attach fragments (no style, drift risk); edit_details 3793L + mobile twin 2198L; datepicker ×18 each side |
| TRN_002/003/004 | All custom toolbars (no app-form): csm-toolbar + `csm-table`; `table-stick-2`; ag-table + vue-element-loading mix; Thai-literal i18n fallbacks |
| components/ (13 .vue) | modal-2×4, modal-3×3, plain modal×4, raw Bootstrap fade×2; aianalysis_edit inline×126 / aianalysis×86 / changedetailtask×50 with NO style tag |

**Top inconsistencies:** HIGH — `scope` typo (global leak) + style-less fragments; HIGH — `$t(`-style counting invalid here (real system is `ui.` dict); MED — 4 modal systems + 3 table stacks + 6 attach-dups + twin weight.

## T2 — Data pages (Master 25 + Customer 1 + Center 17 + Dashboard 7 + Report 12)

**Canonicals:** Master = re-page + app-form-2 + ag-table + modal-2 + pagination (13/25 full match). Center = modal-hosted ag-table + legacy `<modal>` + pagination + scoped (15/17). Dashboard = re-page + custom bars, no app-form. Report = `report-condition` shell 12/12 (never re-page) + ag-table.

| Group | Deviation |
|---|---|
| Legacy toolbar | app-form (not -2) in mas_007/014/016, cus_001; mas_017 wires BOTH; none in 013/018/021_create/008_delete |
| Modal generations | Center 17/17 legacy `<modal>` vs Master modal-2 vs program/set_* modal-3 vs mas_003 6× legacy vs rpt_004/005 legacy |
| Native-table pocket | 13 Master + cus_001 + dashboard2/most_defect + war_rpt02; table-sticky never used in Master/Customer |
| Dashboard bars | `rc-bar__btn`, `bg-navy`, `d2-btn` systems; pagination-2 only in dashboard_req |
| Report outliers | rpt_007 sole scoped style; rpt_contract_pmbm cross-imports Transaction component |
| i18n | 15/25 Master + 6/6 Dashboard (excl. remain) + 12/12 Report have zero `this.ui`; only remain_by_customer clean (88 lines); ct-company uses `state.ui` dialect |

**Top inconsistencies:** HIGH — no single modal standard; HIGH — hardcoded-label zones block localization pass; MED — toolbar 4-way split, table split, chart/calendar lib mix (FullCalendar + echarts/Chart + datepicker).

## T3 — Config/Setup/Manual/Tools + Auth/Default/Approve/Portal/Charts (~60 files)

**Canonicals:** Config = re-page + native tabs/tables + app-form (003/004 go custom). Setup = re-page + Retrieve/btn-variant + native tables. Auth = standalone scoped + `@media`. Default = re-page + toolbar, mixed tables. CustomMango = re-page + btn-search + loading-box.

| Group | Deviation |
|---|---|
| Manual fragmentation | 3 files, 3 shells: list (re-page, NO style, i18n 0) / admin (custom `.mla`, sole ag-table) / v2 (`<report>` shell, custom `.mv2`) |
| Portal no-style island | External 7/8 zero `<style>` (only dataview has one) — restyle via shell, not pages |
| Chart no-shell/no-style island | ItDev 13/15 bare (plain `<div>` partials) — biggest gap in T3 |
| Double-grid singleton | logs_program: ag-table×2 + Handsontable ~19 + flatpickr×6 — split or standardize |
| Orphan tables | v_mas_update_list / logs_report / call_history on `<report>` shell, no toolbar/chrome |
| Custom systems | Tools ec-/ed- prefixes + ed-btn/ec-btn; Setup btn-facebook/linkedin/success variants |
| i18n dead zones | manual trio + erp_config/employee (`this.ui` = 0) |

## T4 — Shells + shared controls + V2 + Nuxt target

**Canonicals:** re-layout (`re-page`, 75 consumers) / customer-layout (8) / single menu.vue. Center primitives globally registered. V2 = standalone LINE theme + jQuery modals. Nuxt = `ssr:false`, `/csm-next/`, `--target-*` tokens, TargetDialog + TargetState, `t()` i18n; `pages/manual/index.vue` is the conformant reference.

| Area | Deviation |
|---|---|
| Dialogs | **5 systems**: modal/modal-2/modal-3 + V2 modal.vue/modal_customize.vue (jQuery) + raw Bootstrap one-offs |
| Toolbars/pagers | form-template vs form-template-2 (28 vs 20); pagination vs pagination-2 (81 vs 2, +vuejs-paginate dep) + V2 pagination_v2 |
| Leakage | ag-table unscoped `.ag-*`; datepicker unscoped css; re-layout 2nd unscoped style; `scope` typo ×2 (line_register:260, service_detail_poch:346); loading-box 5+ import-path spellings |
| God-shell | lineoa.vue 3932L, search/hero triplicated per `visible-*` (28 hits) |
| Token fork | V2 hex/Prompt theme disjoint from `--target-*`; needs mapping at V2 migration, not a bug |
| Nuxt gaps | app.vue pass-through (no layout); pages/index placeholder (EN hardcoded) — scaffolding, acceptable |

## Cross-team consolidation (feeds UI-1..UI-5)

### 6.1 Duplicate counts (unify candidates)

| Concept | Variants | Consumers (approx) | Direction |
|---|---|---|---|
| Dialog | modal / modal-2 / modal-3 / V2 modal+customize / raw Bootstrap+jQuery | 114 / 36 / 6 / V2 / one-offs | One TargetDialog; modal-2 closest legacy |
| Toolbar | app-form / app-form-2 / custom bars (csm/rc/bg-navy/d2/ed/ec/mv2) | 28 / 20 / per-page | One action bar; custom bars → semantic variants |
| Pagination | pagination / pagination-2 (+vuejs-paginate) / pagination_v2 / `@page-change` vs `@change` | 81 / 2 / V2 | One pager; drop dep |
| Tables | ag-table / native / table-sticky / div-card lists / Handsontable×1 / FullCalendar | ag standard; native pocket ~25 files | Table convention per §UI-1; grid only with documented need |
| Loading | Pace/firstLoading / loading-box / vue-element-loading / overlay spinners / flags | mixed per page | One loading model per scope |
| Date input | datepicker.vue / flatpickr×2 files / FullCalendar / custom | 25+ | One date field |
| Icons | FA5/v4-shims/Ionicons/vue-icon/SVG/PNG/glyphicon/v-icon | mixed | One icon policy |

### 6.2 No-style / no-shell islands (can't respond to theme/tokens)

External 7/8 zero-style · ItDev 13/15 bare · History/webland 3 bare · ~9 style-less TRN fragments ·
12/12 Report unscoped-or-none (11 unscoped, rpt_007 sole scoped) · login pages standalone (intentional).

### 6.3 i18n dead zones (`this.ui` = 0)

Manual trio · erp_config/employee/db_list/doc_running · 15/25 Master · 6/6 Dashboard (excl. remain) ·
12/12 Report · External (1-line each max) · ItDev/V2-Nuxt-placeholder (V2 uses `ui.csm_v2_*`, Nuxt needs `t()`).

### 6.4 Responsive reality

Deliberate twin: edit_details/desktop+mobile (939px matchMedia + trn001-responsive.css) — domain behavior, keep studying.
Duplicated markup: V2 `visible-*`/`hidden-xs` (esp. lineoa triplication) — normalize to layout+overflow.
Sprawl: Helper 576/768/992/1200/1400 + Site-Skin 767 + per-file media + JS innerWidth (config_004) + Nuxt 40/48rem.
No-twin zones rely on bootstrap grid + table-responsive only (Master/Center/Dashboard/Report/Config/Setup).

### 6.5 Retirement-ready (≤2 consumers or legacy pockets)

pagination-2 (2 users + extra dep) · modal-3 legacy pockets (mas_003 6× `<modal>`, rpt_004/005) ·
`v_csm_trn_001_old.vue` monolith · unscoped leakage files (ag-table, datepicker, form-template×2, pagination×2, re-layout 2nd block) · `scope`-typo ×2 · vuejs-paginate dep · flatpickr (2 files, if datepicker covers needs).

## Verification notes

Wave-1 reports cross-checked per team; conflicts resolved by direct file reads (i18n `$t(`→`ui.` correction, components 16→13 files, External 6/8→7/8 bare, ItDev 14/15→13/15 bare, datepicker x10→x5 in Tools, mas_021 custom toolbar found, call_history/v_mas_update_list confirmed on `<report>` shell). Hit-vs-file count deltas (±1–2) are unit variance. Method: read-only; no code touched.
