# Future UI / Style Consistency

## Status

FUTURE WORK — HISTORICAL FIRST-SLICE BASELINE

This is a migration-oriented UI audit captured from representative frontend sources on 2026-09-11. It documents the baseline considered during the former first-slice Nuxt work. It does not redesign a page, change CSS, or change application behavior.

The first-slice semantic tokens and feedback/dialog primitives were implemented through PR #6, and the target-native manual route was implemented through PR #8 with local automated and browser acceptance. Product/design approval, live-data UAT, wider shared primitives, responsive exception policy, and legacy visual-debt retirement remain future work.

During the first migration slice, the approved route was v_csm_manual_list under `/csm-next/`.
That route structure is historical context only; the current runtime target is `frontend/`, and
`Nuxt/` plus `/csm-next/` do not define current runtime ownership. The route architecture and
artifact boundary are documented in [the first-slice ADR](./vue2-to-nuxt-first-slice-adr.md).

## Problem Statement

The legacy Website has useful domain behavior but multiple overlapping visual systems. A target page that copies all legacy HTML and global CSS would inherit accidental coupling and make later normalization harder.

The strongest evidence is structural:

- Website/Content/Site.css is approximately 9,595 lines and contains global typography, forms, buttons, tabs, tables, modals, themes, page-specific sections, and many literal colors and !important overrides.
- Website/Content/DarkTheme.css is approximately 2,521 lines and overrides the host, shell, forms, tables, and page classes through body.dark-mode and high-specificity rules.
- Website/Content/Helper.css is approximately 2,172 lines and combines Bootstrap-like color variables, responsive helpers, spacing/display utilities, and many semantic-looking color classes.
- Website/Content/Site-Skin.css overrides AdminLTE skin behavior and the shell with additional !important rules.
- At the time of the audit, 121 Vue files contained a style block and 155 contained inline style attributes in the application source scope.

This is UI consistency debt, not evidence that the first Nuxt route is technically impossible. The target should preserve business behavior, workflow, information hierarchy, permissions, and expected actions while normalizing the implementation.

## Current Styling Landscape

The current page host loads a global stack before the Vue bundle:

1. Bootstrap 3.
2. Font Awesome 5 plus v4 shims.
3. Ionicons.
4. Select2 and Select2 Bootstrap styles.
5. AdminLTE.
6. Site-Skin.css, Site.css, Helper.css, hover effects, jQuery Confirm, toastr, animate.css, and iCheck styles.

The application source adds more styling through:

- component-scoped CSS and unscoped component CSS;
- inline style attributes and dynamic :style expressions;
- vue2-datepicker CSS and global overrides;
- ag-Grid Alpine theme CSS;
- vue-event-calendar, SweetAlert2, pretty-checkbox, and vue-thai-address-input styles imported from main.js;
- custom V2 classes and custom login-page CSS;
- SVG, PNG, Font Awesome, glyphicon, Ionicons, and vue-icon/Feather-style icons.

The repository also contains local font families Inter, Manrope, Sarabun, Prompt, Nunito, and Iosevka. Default.aspx loads Inter, Manrope, Sarabun, and Prompt. Site.css defines body and heading font variables, but page-specific and V2 styles can choose other families and direct sizes.

## Representative Pages Reviewed

| Representative source | What it shows |
| --- | --- |
| Components/Layouts/re-layout.vue | AdminLTE shell, Bootstrap rows and nav classes, global runtime values, inline spacing, fixed content/footer behavior, side menu, control sidebar, logout, language, company switching, and dark-mode/session behavior |
| Components/Pages/Manual/v_csm_manual_list.vue | Standard box and Bootstrap grid, two filter modes, nav tabs, native table, table-responsive, overlay spinner, datepicker, and a read-only attachment modal |
| Components/Pages/Config/v_csm_config_001.vue | Standard Bootstrap table with edit/delete actions using v-icon rather than the shell’s Font Awesome convention |
| Components/Pages/Report/v_csm_rpt_001.vue | ag-table usage, collapsible report rows, inline cursor/spacing/link colors, and report-specific data presentation |
| Components/Pages/Transaction/v_csm_trn_001.vue | Multiple style blocks, inline status colors and gradients, custom modal/table treatment, and transaction-specific presentation |
| Components/Pages/V2/Transaction/v_csm_lineoa.vue | Separate visible-xs/hidden-xs markup, custom V2 tokens/classes, large inline-style usage, SVG assets, Font Awesome, glyphicon, and customer-facing workflows |
| Components/Pages/Authentication/login.vue and login_cust.vue | Dedicated scoped login compositions that do not use the standard shell’s visual language and use their own backgrounds, typography, spacing, and responsive rules |
| Components/Center/form-template.vue, modal.vue, modal-2.vue, modal-3.vue, pagination.vue, pagination-2.vue, datepicker.vue, loading-box.vue, and ag-table.vue | Reusable domain behavior exists, but several versions and plugin-specific implementations coexist |

This sample is intentionally representative rather than exhaustive.

## Style Sources

| Source | Ownership and evidence | Migration meaning |
| --- | --- | --- |
| Bootstrap 3 | Loaded by Page/Default.aspx; used by row, col-*, btn, form-control, table, nav, modal, and responsive utility classes | Preserve behavior where useful, but do not make target components depend on legacy global selectors |
| AdminLTE | Loaded by Page/Default.aspx; re-layout.vue uses wrapper, main-header, main-sidebar, content-wrapper, box, nav-tabs-custom, and control-sidebar | The shell contains domain/navigation behavior, but AdminLTE markup is a legacy implementation |
| Site.css | Global stylesheet containing variables, typography, forms, buttons, tabs, tables, modals, themes, page sections, and literal values | Useful evidence of existing visual intent; unsafe as an unbounded target dependency |
| Site-Skin.css | Modern override of the AdminLTE black skin with navy, white, shadow, sidebar, and control-sidebar rules | Preserve recognizable shell intent where required, not the selector/specificity structure |
| Helper.css | Bootstrap-like variables, responsive flex helpers, spacing/display utilities, and semantic color helpers | Candidate source for token vocabulary, but values and names need target normalization |
| DarkTheme.css | Global body.dark-mode overrides with many !important declarations | Preserve theme readability if required; do not import global dark-mode behavior into target by accident |
| Component-scoped CSS | Login, transaction, V2, loading, and other components contain local styles; some components use unscoped style blocks | Target should use intentional CSS ownership and avoid scope leakage |
| Inline styles | Manual, transaction, report, V2, layout, and setup pages use literal width, margin, padding, color, gradients, and positioning | Convert repeated intent to semantic tokens/classes during target work |
| Font Awesome, v4 shims, Ionicons, vue-icon, SVG/PNG, glyphicon | Multiple icon systems are used across shell, pages, V2, and config | Establish a target icon policy before migrating many pages |
| Third-party styles | Select2, vue2-datepicker, ag-Grid, toastr, jQuery Confirm, SweetAlert2, calendar, checkbox, and input components | Include only what a target route needs and wrap it behind target-owned styling |

## Consistency Findings

### Typography

- Site.css sets body/html to 13.5px with Manrope/Sarabun fallback, headings to Inter, and labels to weight 500.
- Default.aspx loads four font families, while the repository contains two more local families.
- Site.css, Helper.css, login pages, V2 classes, and inline styles use different sizes, weights, and family choices.
- The target needs semantic roles such as page title, section heading, label, body, helper, table header, and muted text rather than copying page-specific font declarations.

### Spacing

- Bootstrap form-group, row gutters, and column padding coexist with Helper margin/padding utilities and flex gap utilities.
- Layout and V2 components also use direct pixel margins and padding.
- form-template.vue has a styled toolbar with its own padding, radius, minimum height, and button spacing, while manual.vue uses the older page layout.
- Repeated spacing should be tokenized; one-off visual adjustments should remain local and documented.

### Layout

- The standard shell is AdminLTE-based, with fixed header/footer behavior and a scrollable content body.
- Pages use Bootstrap rows and columns, flex helpers, absolute/fixed positioning, custom card layouts, and nested modal surfaces.
- V2 pages often render separate desktop and mobile sections with visible-xs/hidden-xs rather than one responsive structure.
- The transaction job-detail area has a deliberate desktop/mobile twin policy with a 939px matchMedia boundary. That is domain behavior worth understanding, not a generic target pattern.

### Color

- Helper.css defines a Bootstrap-like palette including primary, secondary, success, info, warning, danger, dark, and many direct utility colors.
- Site.css and Site-Skin.css add navy, blue, green, orange, gray, white, gradients, shadows, and rgba values.
- V2 pages use a separate family of bg-success-v2, bg-secondary-v3, bg-danger-v2, bg-navy, and other custom classes.
- DarkTheme.css changes the same surfaces with high-specificity !important overrides.
- Color meaning is therefore not consistently encoded by one token or one semantic class. Target components should use semantic action/status/surface/border tokens.

### Forms

- Standard inputs use form-control and input-sm; other pages use app-input, qt-input__el, custom border/radius helpers, or inline styles.
- Labels, required indicators, disabled colors, and validation presentation differ between standard pages, login pages, and V2.
- datepicker.vue wraps vue2-datepicker, imports its CSS, and globally overrides mx-input, popup, calendar cells, and Today button styles.
- Target forms should preserve labels, required state, validation meaning, disabled behavior, and date values while normalizing control height and field spacing.

### Buttons

- form-template.vue provides retrieve, new, save, delete, print, back, export, refresh, and add-row buttons using Bootstrap variants.
- Pages also use btn-default, btn-primary, bg-navy, bg-orange, bg-danger-v2, bg-success-v2, qt-btn, app-btn, and direct gradients.
- Icon placement and text vary; some actions are anchors styled as buttons.
- Target buttons should use a small semantic set: primary, secondary, danger, and link/icon action, with consistent loading/disabled/focus states.

### Tables

- manual.vue uses a native striped/hover table inside table-responsive.
- report pages use ag-table and ag-Grid Alpine theme styles.
- table-sticky and other table abstractions exist for specialized layouts.
- Config pages use native Bootstrap bordered/hover tables, while V2 pages use custom card/list and responsive variants.
- Target list/table conventions should define header, row density, numeric/text alignment, loading, empty state, action placement, and narrow-screen overflow.

### Modals

- modal.vue, modal-2.vue, and modal-3.vue are distinct implementations with different backdrop behavior, sizing defaults, drag/center behavior, scrolling, and DOM relocation.
- jQuery Confirm, SweetAlert2, and direct Bootstrap modal markup are also used.
- Stacking and focus behavior are managed in different places; modal-2 and modal-3 contain their own body sizing and body-append logic.
- Target dialogs need one explicit close, focus, escape, size, header/body/footer, and action-order convention.

### Feedback

- The host has firstLoading and Pace assets.
- manual.vue uses an overlay with a spinning Font Awesome refresh icon.
- loading-box.vue provides a large animated branded loading surface.
- ag-table uses vue-element-loading.
- toastr, $msg/alert-service, jQuery Confirm, and SweetAlert2 provide overlapping transient, error, warning, and confirmation behaviors.
- Target feedback should distinguish page loading, inline loading, transient notification, blocking error, confirmation, and empty state.

### Responsive

- Helper.css has 576, 768, 992, 1200, and 1400px breakpoints; Site-Skin uses a 767px breakpoint; individual components add their own media rules.
- re-layout.vue hides navigation elements with hidden-sm/hidden-xs.
- manual.vue relies on Bootstrap columns and table-responsive but does not have a page-specific mobile template.
- V2 pages duplicate visible-xs and hidden-xs sections, and transaction job detail uses a deliberate mobile twin.
- Target policy should prefer responsive layout and overflow rules over duplicated templates, except where a workflow genuinely needs separate semantic markup.

## Duplicate UI Patterns

| UI concept | Implementations found | Consistency risk |
| --- | --- | --- |
| Modal/dialog | modal.vue, modal-2.vue, modal-3.vue, Bootstrap modal markup, jQuery Confirm, SweetAlert2 | Different stacking, focus, sizing, close, backdrop, and button behavior |
| Pagination | pagination.vue, pagination-2.vue, vuejs-paginate usage through the second implementation, and page-specific pagination patterns | Different APIs, layout, page-size controls, and compact/mobile behavior |
| Date input | datepicker.vue plus direct page-specific input classes and vue2-datepicker global overrides | Different height, radius, format, disabled state, popup, and Today behavior |
| Loading | firstLoading/Pace, loading-box.vue, vue-element-loading in ag-table, manual overlay spinner, and page-specific loading flags | Users see different surfaces and error/empty transitions |
| Tables/lists | native Bootstrap table, ag-table/ag-Grid, table-sticky, report grids, V2 cards/lists | Different row density, headers, actions, sorting, overflow, and empty states |
| Action buttons | form-template toolbar, direct Bootstrap variants, bg-* helpers, qt-btn, app-btn, inline styles | Color and icon semantics are not consistent across modules |
| Icons | Font Awesome 5/v4 shims, Ionicons, vue-icon, SVG, PNG, glyphicon, and MDI dependency | Mixed shapes, sizes, alignment, and meaning |
| Page shell | re-layout.vue, customer-layout.vue, V2 custom shell, login-specific compositions | Navigation, header, footer, theme, and spacing expectations differ |
| Responsive view | Bootstrap visibility utilities, CSS media rules, V2 duplicated markup, and the transaction desktop/mobile twin | Breakpoint and maintenance behavior varies |

## Existing Reusable Behavior

The following patterns contain useful domain knowledge but should not be copied wholesale into Nuxt:

| Existing pattern | Classification | Preserve in target | Target implementation direction |
| --- | --- | --- | --- |
| form-template.vue | DOMAIN BEHAVIOR WORTH PRESERVING and LEGACY IMPLEMENTATION ONLY | Action visibility, disabled/read-only rules, button intent, and callbacks | Target-owned action bar with semantic button variants |
| datepicker.vue | DOMAIN BEHAVIOR WORTH PRESERVING and REPLACE | Date model, accepted formats, Today behavior, bounds, disabled state | Target date field with a controlled adapter or native-equivalent implementation |
| modal.vue family | DOMAIN BEHAVIOR WORTH PRESERVING and REPLACE | Open/close flow, title/body/footer slots, size, attachment viewing | One target dialog primitive with explicit focus and stacking rules |
| pagination.vue family | DOMAIN BEHAVIOR WORTH PRESERVING and REPLACE | Current page, page count, page-size, and change event semantics | Target pagination only when a migrated route needs it |
| loading-box.vue and ag-table loading | DOMAIN BEHAVIOR WORTH PRESERVING and REPLACE | Loading state, cancellation/disabled state, and transition to data/empty/error | Target loading and empty primitives with one visual language |
| native table and ag-table | DOMAIN BEHAVIOR WORTH PRESERVING; LEGACY IMPLEMENTATION ONLY | Column meaning, alignment, row actions, sorting/filtering where required | Use the smallest target list/table implementation; manual does not need ag-Grid |
| file-attach behavior | DOMAIN BEHAVIOR WORTH PRESERVING and REPLACE | File/image preview, download, attachment description, and access control | Target File/Download capability and route-specific preview |
| re-layout.vue | DOMAIN BEHAVIOR WORTH PRESERVING and LEGACY IMPLEMENTATION ONLY | Authenticated context, information hierarchy, language/logout access, and required navigation | Target shell contract; do not port AdminLTE DOM or global state |
| change-language.vue and localization loading | DOMAIN BEHAVIOR WORTH PRESERVING and REPLACE | Language selection and fallback/label semantics | Target LocalizationAdapter |

## Legacy Patterns Not to Carry Forward

- Direct component access to $xt, $msg, $linq, Vuex 3, window.auth, window.ui, window.dataServer, or arbitrary Default.aspx globals.
- Wholesale import of Site.css, DarkTheme.css, AdminLTE, or all legacy plugin CSS into the target artifact.
- Unbounded reliance on selector specificity and !important to resolve cross-page style conflicts.
- New inline literal colors, gradients, dimensions, and positioning when the value represents a repeated semantic pattern.
- A new modal, loading, date, table, or button variant created only because an older variant is inconvenient.
- Duplicated desktop/mobile templates by default. The transaction twin rule remains a special legacy case to study, not a target mandate.
- ag-Grid for a simple read-only list that needs no grid features.
- Visual reuse of Vue 2 components as a substitute for target runtime independence.

## Proposed Target UI Baseline

No UI framework or design-system package is selected by this document. The baseline is a lightweight vocabulary that can be implemented with target-owned CSS and components while the framework decision remains open.

### Semantic tokens

| Token group | Initial semantic vocabulary | Rule |
| --- | --- | --- |
| Typography | font-body, font-heading, text-page-title, text-section-title, text-label, text-body, text-caption, text-muted, weight-regular, weight-medium, weight-semibold | Choose a Thai-capable family and exact values through visual review; do not copy every legacy font choice |
| Spacing | space-xs, space-sm, space-md, space-lg, space-xl | Use one documented scale. A 4/8/12/16/24/32px starting scale is a reviewable baseline, not a framework requirement |
| Color | color-brand, color-action, color-success, color-warning, color-danger, color-surface, color-surface-muted, color-text, color-text-muted, color-border, color-focus | Components consume semantic tokens, not page-specific hex values |
| Radius | radius-sm, radius-md, radius-lg | Use a small consistent set; retain a sharper variant only when a domain control needs it |
| Control size | control-height-sm, control-height-md, control-height-lg | Pick one default input/button height and one compact height; date fields and buttons must align |
| Elevation | elevation-panel, elevation-dialog, elevation-floating | Keep shadows subtle and consistent; avoid page-specific shadow recipes |
| Breakpoints | breakpoint-mobile, breakpoint-tablet, breakpoint-desktop, breakpoint-wide | Start from observed 576/768/939/992/1200 boundaries, then reduce the number of target breakpoints after route review |

### Component conventions

- Page shell: one target-owned shell with predictable header, content, navigation, and error boundaries.
- Page layout: a page title, a clear content surface, filter/action region, data region, and explicit loading/empty/error states.
- Forms: labels stay visible, required state is explicit, errors are associated with fields, disabled values remain readable, and control heights align.
- Buttons: primary for the main retrieval/save action, secondary for neutral actions, danger for destructive actions, and link/icon actions for low-emphasis navigation. Icon-only buttons need accessible names.
- Tables: define header treatment, row density, column alignment, link/action behavior, horizontal overflow, and empty state once. Do not add ag-Grid unless the route requires grid behavior.
- Dialogs: title, body, and action regions are stable; close and cancel behavior is predictable; destructive confirmation uses a consistent button order; focus and escape behavior are intentional.
- Feedback: one loading model per scope, one empty-state pattern, one inline validation pattern, one transient-notification pattern, and one blocking-confirmation pattern.
- Responsive behavior: use layout changes and controlled overflow first. Avoid separate markup unless semantics or interaction genuinely differ.
- Themes: if light/dark mode is carried into the target shell, map both modes through the same semantic tokens; do not depend on body.dark-mode selectors from the legacy host.

This baseline deliberately does not select Tailwind, Vuetify, PrimeVue, Element Plus, Bootstrap replacement, or a custom design-system package.

## v_csm_manual_list First-Slice Considerations

### MUST PRESERVE

- The authenticated internal CSM context and the target route’s auth behavior.
- The page information hierarchy: page title, date filters, revision filters, condition selector, module tabs, list/table, and attachment detail.
- Date range defaults: beginning of the current month through today, with the existing displayed date semantics.
- Revision search semantics: start revision, optional end revision, and between/more-than/less-than/equal conditions.
- Both read operations and their loading transitions: date-based manual list and revision-based manual list.
- Module tab behavior, totals, ALL tab behavior, and filtering of the returned list by module.
- List columns and meanings: row number, revision number, subject link, and added date.
- Subject interaction: selecting a row opens the attachment view without changing the business meaning.
- Attachment read behavior: ReadPicture lookup, subject title, file/image presentation, description, and opening the downloadable image/file target.
- Localization and fallback label behavior for user-visible page text.
- Usable narrow-screen behavior: filters must remain operable and the table must remain readable through stacking or controlled horizontal overflow.
- Read-only scope. This route has no identified backend create, update, delete, grid, chart, editor, or realtime behavior.

### CAN NORMALIZE

- Bootstrap row/col layout into target CSS grid or flex layout.
- Box, tab, button, input, table, modal, and overlay styling into the target token/component baseline.
- Datepicker visual treatment and implementation, provided value/format/bounds behavior stays equivalent.
- The table’s exact stripes, border, radius, and typography, provided scanability and link/action meaning remain recognizable.
- Font selection, icon implementation, spacing, and color values through the target baseline.
- Attachment modal sizing and focus behavior.
- Internal service function and adapter implementation; endpoint strings and response parsing remain outside page markup.
- Dark-mode implementation, if provided by the target shell, as long as contrast and user expectations are preserved.

### CAN DEFER

- Full parity with every legacy side-menu/control-sidebar feature that this route does not use.
- Pagination, ag-Grid, print, realtime/socket, company switching, and menu-right UI that are not required by the traced manual route.
- Pixel-identical reproduction of legacy CSS.
- Broad normalization of unrelated reports, transaction pages, customer portal pages, and legacy login pages.
- Removal of legacy global CSS or third-party libraries from the Vue 2 application.

The target must not become a surprise redesign: the workflow, labels, controls, data meanings, attachment behavior, and expected placement of actions remain recognizable even where the implementation is normalized.

## Debt Priority

### P0

No current cosmetic inconsistency is a P0 migration blocker.

The migration safety requirement is CSS and artifact isolation: target styles must not depend on or accidentally overwrite the legacy global stack. That boundary is already established in the first-slice ADR.

### P1

- Define the target manual page layout and semantic tokens before implementing the route.
- Implement target-owned date field, tabs, table/list, loading, empty state, dialog, and attachment/file behavior.
- Verify font loading, asset paths, narrow-screen behavior, keyboard focus, disabled states, and contrast.
- Decide how much authenticated shell/navigation is required for the manual route.
- Compare the target route against the legacy workflow using the parity checklist rather than screenshot similarity alone.

### P2

- Establish shared target tokens for typography, spacing, colors, control sizes, radius, elevation, and breakpoints.
- Establish shared target primitives for buttons, forms, dialogs, loading/empty/error feedback, tables/lists, and icon usage.
- Define responsive policy and an exception process for genuinely divergent mobile workflows.
- Define a target localization and theme contract.
- Define when a route needs a grid library versus a native list/table.

### P3

- Retire unused legacy CSS, plugin styles, icon shims, and duplicated component variants after route parity.
- Normalize remaining report, transaction, customer, and login pages.
- Reduce or remove legacy desktop/mobile twin templates when target workflows make that safe.
- Remove page-specific literal styles after their target equivalents are proven.

## Future Work Packages

### Package UI-1 — Establish the target semantic UI baseline

- **Suggested Issue Title:** Define Nuxt target UI tokens and component conventions
- **Goal:** Approve a small, framework-neutral vocabulary for typography, spacing, colors, controls, dialogs, feedback, tables, and responsive behavior.
- **Scope:** Token names, starter values, accessibility rules, light/dark policy, responsive breakpoints, and examples based on the manual route.
- **Out of Scope:** Selecting or installing a UI framework; rewriting legacy CSS; migrating unrelated pages.
- **Acceptance Criteria:** Frontend architecture and product/design owners approve the token vocabulary; a manual-route specimen demonstrates each required state; target CSS ownership is documented.
- **Dependencies:** Nuxt shell boundary, product/design review, Thai typography review.
- **Risk:** Premature values may create a second inconsistent system; keep the baseline semantic and small.

### Package UI-2 — Implement manual-route visual parity with target-native controls

- **Suggested Issue Title:** Build v_csm_manual_list target UI using the approved baseline
- **Goal:** Demonstrate target runtime independence while preserving the legacy manual-list workflow.
- **Scope:** /csm-next/manual/ page structure, filters, tabs, list/table, loading/empty states, attachment dialog, file/image behavior, responsive layout, and localization.
- **Out of Scope:** Reusing Vue 2 controls, importing the entire legacy stylesheet stack, adding ag-Grid, adding writes, or changing backend APIs.
- **Acceptance Criteria:** Direct target link and refresh work; filter and revision semantics match; tabs/totals/list/attachments match; errors and empty state are usable; accessibility and responsive checks pass; legacy route remains unchanged.
- **Dependencies:** Approved first-slice ADR, RuntimeConfig, SessionAdapter, ApiClient, LocalizationAdapter, File capability, IIS prefix mapping.
- **Risk:** Visual normalization can accidentally change date semantics, attachment behavior, or user expectations; use behavior-first parity review.

### Package UI-3 — Create target shared primitives

- **Suggested Issue Title:** Add target-owned form, dialog, feedback, and list primitives
- **Goal:** Prevent each migrated route from inventing another button, modal, loading, or table variant.
- **Scope:** Button/action bar, form field/date field, dialog, loading, empty/error feedback, native list/table, and icon wrapper with documented APIs.
- **Out of Scope:** Migrating all legacy components or providing a universal replacement for ag-Grid and every third-party control.
- **Acceptance Criteria:** The manual route uses the primitives; focus/keyboard/disabled/loading/error states are tested; APIs do not expose legacy globals; a route can opt into a grid only with a documented requirement.
- **Dependencies:** UI-1 and UI-2; target accessibility review.
- **Risk:** Over-generalized primitives reproduce legacy complexity; keep APIs route-focused and composable.

### Package UI-4 — Define responsive and mobile exception policy

- **Suggested Issue Title:** Establish target responsive layout policy and legacy twin exceptions
- **Goal:** Make responsive behavior predictable without blindly carrying duplicated desktop/mobile markup.
- **Scope:** Breakpoint guidance, table overflow, filter stacking, action wrapping, keyboard/touch behavior, and documented exceptions for domain workflows such as transaction job detail.
- **Out of Scope:** Rewriting legacy mobile twins in this issue; redesigning all page layouts.
- **Acceptance Criteria:** Manual route behavior is documented at mobile/tablet/desktop widths; any separate target markup has a semantic justification; visual regression checks cover the approved widths.
- **Dependencies:** UI-1 and route acceptance review.
- **Risk:** A single responsive template may not fit every workflow; use explicit exceptions rather than accidental duplication.

### Package UI-5 — Retire legacy visual debt incrementally

- **Suggested Issue Title:** Remove unused legacy style and plugin dependencies after route parity
- **Goal:** Reduce global specificity, duplicate variants, and unused plugin CSS without breaking remaining Vue 2 routes.
- **Scope:** Usage inventory, route-by-route CSS ownership, icon/style retirement, and removal only after parity evidence.
- **Out of Scope:** Bulk deletion before consumers are mapped; changing the legacy visual language during the first slice.
- **Acceptance Criteria:** Each removed asset has no active consumer; affected legacy routes are checked; target artifact remains independently deployable; rollback can restore only the retired target/legacy asset change.
- **Dependencies:** Multiple migrated routes, usage telemetry or repository scan, release owner.
- **Risk:** Legacy styles have indirect global consumers; remove in small batches with route checks.

## OPEN UI DECISION

### Decide whether a UI framework or design-system library is needed

- **Question:** Is a dedicated UI framework/design-system library needed for future Nuxt routes, or are target-owned CSS and semantic primitives sufficient?
- **Decision framing:** Evaluate target-owned CSS and components, a utility-CSS approach with target-owned components, an approved component library, or another explicitly justified option. Do not assume that a dedicated framework is required.
- **Decision owner:** Frontend architecture with product/design and accessibility owners.
- **Evaluation criteria:** Nuxt 4/Vite/static-IIS compatibility, CSS isolation, Thai typography, accessibility, theming, bundle size, table/dialog/date/file support, migration effort, licensing, and coexistence with the legacy Website.
- **Blocks shell creation:** NO. The shell can begin with the semantic baseline and plain target-owned CSS.
- **Blocks v_csm_manual_list migration:** NO for the first route if the baseline is approved; YES for broader rollout if a shared framework is made mandatory.

### Target font and pixel-parity threshold

- **Question:** Which target font combination and visual-difference threshold are acceptable for the first route?
- **Decision owner:** Product/design owner with frontend and QA.
- **Why it remains open:** The repository contains multiple valid font families and several visual themes; code inspection cannot determine the product’s preferred future appearance.
- **Blocks shell creation:** NO.
- **Blocks v_csm_manual_list migration:** NO for functional migration; YES for final UAT/cutover if product requires a specific threshold.

## Handoff Notes

The next developer should:

1. Read the first-slice ADR before creating target files.
2. Treat existing components as behavior references, not copy sources.
3. Start with the manual route’s MUST PRESERVE list and build only the controls it needs.
4. Keep target styles and assets inside the independent target artifact; do not import the entire legacy host stack.
5. Resolve UI-1 before migrating a second or third route.
6. Record any visual exception as a semantic or workflow decision, not as an unexplained inline style.
7. Re-check responsive, keyboard, focus, loading, empty, error, and attachment states before route cutover.
