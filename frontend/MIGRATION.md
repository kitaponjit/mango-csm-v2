# Migration tracker — Vue 2 SPA → Nuxt

Source: `../Website/Scripts/App/Application` (218 `.vue`, ~142k LOC, 111 routes).

## Done

In `../Website` (still shippable on Vue 2.7):
- [x] webpack → Vite
- [x] `@vue/composition-api` → `vue` (20 files)
- [x] Vue filters removed — 224 template sites + 9 `$options.filters` calls → `$date` / `$num`

In `frontend/` (Nuxt 4 + Vue 3):
- [x] Scaffold: config bootstrap, global-script loading, auth middleware, router hook
- [x] IIS + Linux deployment configs
- [x] 218 components copied across, mirroring the Website tree so relative imports still resolve
- [x] **1492 `$set` → direct assignment**, 33 `beforeDestroy`/`destroyed` → `beforeUnmount`/`unmounted` (139 files)
- [x] `Vue.set` → assignment; last `import Vue` removed
- [x] Vuex → Pinia: store ported, `$store.dispatch`/`.state` shim + array-syntax `mapState`/`mapGetters`
      so **no call site changed** (19 files re-pointed at `~/stores/helpers`)
- [x] 111 routes ported verbatim; wildcard `path: "*"` → `/:pathMatch(.*)*`
- [x] 16 case-sensitive import paths corrected (Linux)
- [x] 53 of 58 global component registrations → `plugins/components.client.js`
- [x] v-model contract (`value`/`input` → `modelValue`/`update:modelValue`) in `input`, `number`,
      `voice-typing` — done inside the wrappers so all 109 `v-model=` call sites stay unchanged

Verified absent from the ported tree: `$set`, `$delete`, `Vue.set`, `import Vue`, `vuex`,
`beforeDestroy`, `$children`, `$scopedSlots`, `$listeners`, `$options.filters`.

`$parent` (3 files) and `$eventBus.$on/$off/$emit` (5 files) were left as-is deliberately —
`$parent` still exists in Vue 3, and the mitt shim in `plugins/globals.client.js` keeps the
`$on/$off/$emit` surface.

## ag-Grid — resolved, much smaller than feared

Scanned for real Enterprise APIs (`sideBar`, `statusBar`, `setFilterModel`, `masterDetail`,
`pivotMode`, `excelStyles`, `getContextMenuItems`, `enableRangeSelection`, `aggFunc`): **none used**.
The `ag-grid-enterprise` imports were only CSS (identical in community) plus `LicenseManager`.

The single Enterprise feature in use is **row grouping**, in 4 column definitions across 3 files:

| File | Grouped column |
|---|---|
| `v_csm_rpt_002.vue` | `proj` (x2) |
| `v_csm_war_rpt01.vue` | `pre_des` |
| `v_csm_trn_000.vue` | `year_group` |

So **215 of 218 components need only `ag-grid-community`** — free, no licence. Migrated to
`ag-grid-community` + `ag-grid-vue3` v33. Only those 3 screens need a decision: buy Enterprise,
or group the rows before handing them to the grid.

Handsontable is imported directly (not via `@handsontable/vue`), so v16 works under Vue 3 unchanged.

## Libraries with no Vue 3 successor

Verified against the npm registry. Usage counts are files in `../Website`.

| Package | Files | Replacement |
|---|---|---|
| `vue2-datepicker` | 5 | `@vuepic/vue-datepicker` — 2 are the `datepicker.vue` wrapper |
| `v-select2-component` | 1 import, **40 tags** | not wrapped; needs a shared wrapper first |
| `vue2-timepicker` | wrapper | `timepicker.vue` wraps it |
| `vue2-dropzone` | 2 | `dropzone-vue` |
| `vue-pdf-app` | 3 | `vue-pdf-embed` |
| `vue-doc-preview` | 3 | `@vue-office/*` |
| `vue-element-loading` | 6 | trivial to hand-roll |
| `vue-event-calendar` | 2 | FullCalendar (already a dependency) |
| `vue-picture-swipe` | 1 | photoswipe directly |
| `pretty-checkbox-vue` | 1 | CSS-only |
| `vuejs-paginate` | 1 | `vuejs-paginate-next` |
| `one-colorpicker` | 1 | `vue3-colorpicker` |
| `echarts-for-vue` | 4 | `vue-echarts` |
| `vue-thai-address-input` | 1 | no successor — port or vendor |
| `chart.js` 2 + 2 plugins | 5 | Chart.js 4; `chartjs-plugin-labels` and `-piechart-outlabels` are v2-only |

Straightforward bumps: `vuedraggable` 2→4, `v-tooltip`→`floating-vue`, `splitpanes` 3,
`@fullcalendar/vue`→`vue3`, `vue-sweetalert2` 5.

Droppable: `vue-property-decorator` (0 uses), `vue-currency-filter` (removed with the filters).

## Status as of 2026-09-15

`frontend/` is the target frontend (see root `AGENTS.md`). It **installs, builds clean
(`npm run build` → exit 0) and runs against the .NET 8 backend**, superseding the
"never installed or built" note this file previously carried.

### Done since

- Dead Vue-2-only packages resolved — the build no longer has an unresolvable import:
  - `vue2-datepicker` → `@vuepic/vue-datepicker` in `datepicker.vue`, `timepicker.vue`
    and `v_csm_most_defect.vue`. The wrappers keep their external contract, so all
    116 `<datepicker>` / 16 `<timepicker>` call sites are unchanged.
  - `vue2-dropzone` → local `Components/Center/file-dropzone.vue`. It was only ever a
    file picker — its `options.url` pointed at `httpbin.org` and the real upload goes
    through `$xt.postServerForm` — so no dependency was needed to replace it.
  - `vue-doc-preview` → local `Components/Center/doc-preview.vue` (Office Online iframe).
  - `@mdi/font` installed; it is a dependency of the legacy `Website` that the port missed,
    and 5 `mdi-check` icons render from it.
- **v-model contract fixed on `datepicker` / `timepicker`.** They still declared the Vue 2
  `value`/`input` contract while 53 call sites use `v-model`, which silently binds
  `modelValue` in Vue 3. They now accept both and emit `update:modelValue` alongside the
  legacy `input` / `change`.
- **Vendor asset URLs fixed.** `nuxt.config.ts` referenced `vendor/...` and `config.js`
  relatively, so they resolved against the current route and 404'd on every nested route —
  the app only ever worked at `/`. They now resolve from the app base URL.
- **Backend wired.** `public/config.js` points `window.dataServer` at
  `http://localhost:5075/service/` (MangoServiceNetCore, .NET 8). Auth travels as the
  `X-Mango-Auth` header from localStorage, so plain CORS is enough; the backend already
  allowlists `http://localhost:3000`, and `npm run dev` is pinned to that port to match.
- **Global auth middleware enabled.** `middleware/auth.global.js` was parked as
  `.stage2` and was the only code that hides `#firstLoading` — so the boot overlay never
  cleared and no route guard ran. Its `lang_bundle.json` path was also missing the
  `vendor/` prefix. Verified: language + UI dictionary (10,880 keys) load from the backend,
  and a protected route redirects to login when unauthenticated.

- **Expired sessions no longer 500.** An expired `mango_auth` makes the backend answer
  401 "Session expired or invalid" on *every* call, including the otherwise-public
  `LanguageSelector`. The guard had no error handling, and an uncaught throw in Nuxt
  middleware renders the 500 error page (Vue Router 3 merely aborted the navigation, which
  is why the legacy app never showed this). The guard now treats 401 as "not authenticated":
  it clears the dead credentials and redirects to login. Clearing localStorage alone is not
  enough — `xtools.js` copies the token into the axios defaults once at script load, so the
  dead token is also cleared there, otherwise it keeps being sent for the rest of the session.

- **Root path had no route.** The legacy SPA was only ever served under `/page/**`
  (`Website/Page/Web.config` rewrote everything there to Default.aspx), so the site root
  never needed one. Nuxt serves this app from the root, so `/` fell through to the wildcard
  "content not found" route. `routes/index.js` now redirects `/` to `/page/`.
- **Vuex→Pinia compat only shimmed the wrong name.** Components read the bare global
  `store.state.X` (56 sites) and call `store.dispatch(...)` (2 sites) — there are zero
  `this.$store` uses. The plugin shimmed `$store` but assigned the *raw Pinia instance* to
  `window.store`, and Pinia has no `.state` (it exposes state directly, plus `$state`).
  So every `store.state.X` read as undefined. Both names now get the same Vuex-shaped facade.
- **Vendor globals were never promoted onto `window`.** The vendor scripts declare
  `$xt`, `$msg`, `Pagination`, `signalR`, `statusCode`, `platformCodeData`,
  `moduleCodeData`, `statusCodeData` with `const`/`let`, which land in the global *lexical*
  environment — reachable bare, but never as `window.X`. Default.aspx promoted them
  explicitly after loading the scripts (lines 188-201); the port copied the placeholder
  assignments in config.js but not the promotion, so `window.$xt` and friends were
  undefined and `window.signalR` stayed the `{}` placeholder instead of the MangoSignalR
  function. `public/globals-bridge.js` now replicates that step.
- **An optional subsystem could abort the layout.** `re-layout.vue`'s `mounted()` called
  `initSignalR()` *before* wiring its template refs. Since realtime cannot work here, that
  throw aborted `mounted()` and left `this.loadingBox` unassigned, surfacing later as
  "Cannot read properties of undefined (reading 'show')". The ref wiring now runs first and
  the realtime init is contained.
- **`page` placeholder made safe (84 files).** Components keep a module-scoped
  `let page = {}` assigned from `this.$refs.page` in `mounted()`, then call
  `page.loadingBox.show()/hide()` (453 sites across 67 files). Child callbacks —
  FullCalendar's `datesSet`, for one — fire before the parent's `mounted()`, so `page` was
  still the bare placeholder and threw. The placeholder now carries a no-op `loadingBox`.

### Route walk (2026-09-15)

All 98 staff routes driven through the SPA router with an error collector attached.
Six customer-session routes (`meta.customer*`) were excluded — they correctly bounce to the
customer login, which a staff session cannot satisfy. Two systemic faults were found:

- **177 uses of the removed Vue 2 `<template slot="x">` syntax, in 84 files.** `re-layout.vue`
  declares `<slot name="body">`, and Vue 3 does not route `slot="body"` to it — so the body
  slot received nothing and **those screens rendered completely blank** (verified: `.content-body`
  text length 0, no tables, no pagination). They looked healthy: the route resolved, the title
  was set and no error was thrown, which is why this survived until an explicit empty-body check.
  The port had converted some files by hand (`home2.vue` uses `#body`) but left the rest.
  Converted all 184 occurrences to `#name`.
  Knock-on: 88 `setCurrentPage` errors across 76 routes disappeared — they were `$refs` into
  the slot content that never rendered, not a pagination bug.
- **ag-Grid v33 modules were never registered.** v33 is modular and renders nothing until
  `ModuleRegistry.registerModules([AllCommunityModule])` runs; the legacy app was on v27, which
  had no such step. Without it the grid throws "No AG Grid modules are registered!" and leaves
  `gridOptions.api` undefined, which surfaced as `setRowData` of undefined. Added
  `plugins/ag-grid.client.js`. Registering the modules also restored `gridOptions.api`, so the
  58 `setRowData` call sites needed no change after all.
- **One invalid slot nesting.** `v_service_detail_poch.vue` wrapped its slot in a bare
  `<template>`; Vue 3 requires a slot template to be a direct child of the component, and the
  file failed to compile ("Codegen node is missing for element/if/for node"), taking the main
  transaction screen `v_csm_trn_001` down with it. Wrapper removed; that screen now renders
  (58 grids).

Final state of the walk: **0 blank, 0 server errors, 0 not-found**; 94 render, 1 is the
access-denied page itself, 1 is the `/` → `/page/` redirect.

Still open from the walk: `p-check` (pretty-checkbox), `vue-event-calendar`, `vue-select-2`,
`vue-element-loading`, `vue-picture-swipe`, `VueDocPreview` and `vue-pdf-app` remain
unregistered components, so the handful of screens using them render those widgets as nothing.
`v_csm_trn_001_old.vue` also still carries the one `slot-scope` usage, which is moot until
`vue-event-calendar` has a replacement.

### Unregistered components resolved (2026-09-15)

The Vue-2-only packages with no Vue 3 build are replaced by local components in
`Components/Center/`, registered in `plugins/components.client.js`. Every call site keeps its
original props, events and slots, so no screen markup changed except the leftover Vue 2 slot
attributes noted below.

| Tag | Uses | Replacement |
| --- | --- | --- |
| `vue-select-2` | 40 tags, 11 files | Wrapper over the **jQuery Select2 plugin already loaded as a vendor script** — that is all `v-select2-component` ever did, so the widget and its bootstrap theme are unchanged. Keeps `options` / `settings` / `v-model` / `change` / `disabled`. |
| `vue-element-loading` | 7 tags, 5 files | Hand-rolled overlay spinner (`active` / `spinner` / `color` / `text`). No dependency needed. |
| `p-check` | 5 tags, 3 files | Reproduces pretty-checkbox's `.pretty > input + .state` markup, honouring `true-value` / `false-value`. |
| `vue-pdf-app` | 2 tags, 2 files | Embeds the PDF directly; every modern browser ships a viewer with the same essentials, so no PDF.js dependency was added. `config` is accepted and ignored. |
| `vue-event-calendar` | 1 tag, 1 file | Rebuilt on FullCalendar (already a dependency), preserving the default scoped slot that exposes `showEvents`. |
| `VueDocPreview` | 2 tags | Now also registered globally; the two file-attach screens already imported it locally. |

`vue-picture-swipe` was listed as outstanding but has **zero** call sites — nothing to replace.

Also converted the last Vue 2 slot syntax these components carried: 5 `<i slot="extra">` became
`<template #extra>`, the 2 empty `<label slot="off-label">` were dropped, and the one
`slot-scope="props"` became `#default="props"`. **No `slot=` or `slot-scope=` remains in the tree.**

Verified by mounting all six on a temporary unauthenticated route: Select2 initialises and
round-trips `v-model` both ways, `p-check` flips `N`→`Y` on click, the calendar's scoped slot
receives the right day's events, and the spinner/PDF/doc-preview render. The probe route was
removed afterwards.

**Known gap:** only a subset of pretty-checkbox's CSS ships in `Content/Site.css`, so `p-check`
renders as a standard browser checkbox rather than the decorated control. It is functionally
correct and correctly bound; restoring the full look needs the upstream stylesheet.

### SignalR realtime ported to ASP.NET Core SignalR (2026-09-15)

The bundled `jquery.signalR-2.3.0.js` client could never work against this backend: it needs
the generated `/SignalR/Hubs` proxy that only ASP.NET SignalR 2.x served, and it speaks an
incompatible wire protocol. MangoServiceNetCore maps a single Core hub at
`<dataServer>signalr` (`app.MapHub<SocketHub>`).

`plugins/signalr.client.js` replaces the whole vendor stack with the `@microsoft/signalr`
client. **The public contract is unchanged, so no call site was edited** - `window.signalR`,
`reHub.server.<camelCaseMethod>()` and `hubProxy` all behave as before. Server methods are
reached through a `Proxy` that upper-cases the first letter, so every hub method works without
enumerating them.

Removed from the vendor script list (all dead against a Core hub): `jquery.signalR-2.3.0.js`,
`signalr-patch.js`, `iwc-all.js`, `iwc-signalr.js`, `MangoSignalR.js`, plus `public/signalr-hubs.js`
which only existed to fetch the 2.x proxy. Nothing outside that stack referenced `SJ.*`.
`globals-bridge.js` no longer promotes `window.signalR`, and the `{}` placeholder is gone from
`config.js` - the plugin owns the name now.

Verified against the running backend: the hub negotiates with correct CORS
(WebSockets/SSE/LongPolling offered); the C# hub's `welcomeMessage` push arrives on connect;
`sendNewComment` / `sendNewComment001` round-trip back as `ReceiveNewComment` /
`ReceiveNewComment001` with the exact payload; handlers registered by separate
`window.signalR()` calls accumulate instead of clobbering each other; and a server call made
while disconnected is queued, redials, and flushes on reconnect. **A cold page load now has a
completely clean console** - the `signalr-patch` throw and the `/SignalR/Hubs` 404 are both gone.

Two deliberate differences from the 2.x stack:

- The old IWC layer shared **one** connection across browser tabs and elected an owner. Core
  SignalR connections are cheap, so each tab holds its own and `isConnectionOwner()` is true
  everywhere; the only consequence is that the 60-second `userOnlineCheck` runs per tab.
- `userid` is now sent on the connection query string when the session provides it. The hub
  reads it for presence (`UserOnline`/`UserOffline`), but the 2.x frontend never sent it, so
  that tracking had never actually worked.

Still unverified: the realtime **features** themselves (live comments, case-status pushes) need
a logged-in session on the screens that use them - group-scoped broadcasts such as
`SendNewCase` go to the `CSM_PC` group, which nothing currently joins. `JoinGroup` exists on
the hub but has no caller in the frontend.

### Broken images and AdminLTE layout (2026-09-15)

Two more consequences of the `public/vendor/` layout that `sync-vendor.mjs` introduced.

**Images silently resolved to HTML.** Components build asset URLs the way the legacy IIS app
did - `${baseUrl}Content/Images/...`, where `Content/` sat directly under the app root. The port
copies those trees to `public/vendor/`, so every such URL missed. Worse, it did not 404: Nuxt's
SPA fallback answers unknown paths with **`index.html`, status 200, `text/html`**, so `<img>`
received a page instead of an image and rendered the broken-image glyph - which is exactly what
the sidebar icons and avatar were showing. **80 references across 12 files** now point at
`${baseUrl}vendor/Content/...`, matching what `nuxt.config.ts` already does for scripts and
styles. Four spellings were in use and all are fixed:

    `${baseUrl}Content/...`     baseUrl + 'Content/...'
    baseUrl + "/Content/..."    baseUrl + `Content/...`

The leading-slash form was doubly wrong - `baseUrl` already ends in `/`, so it produced `//Content/`.

**AdminLTE lost its body classes.** `Page/Default.aspx` rendered
`<body class="hold-transition skin-black fixed sidebar-mini sidebar-collapse">`, and AdminLTE
keys its entire layout off them - `.main-sidebar` / `.content-wrapper` positioning, the
mini/collapsible sidebar and the skin. The port never set them, so the sidebar rendered
full-width in normal flow and the content area lost its offset. They are now set once via
`app.head.bodyAttrs` in `nuxt.config.ts`; `login.vue` still adds `login-page` on top, exactly as
it did on the legacy host page.

Verified: the login background image and all previously-broken asset URLs now return real
`image/*` responses, and `<body>` carries the AdminLTE classes plus `login-page`. The
**authenticated sidebar layout itself is unverified** - it needs a logged-in session.

### Vue 3 template audit (2026-09-16)

The last pending item from this file. All three checks were run against the whole tree.

**`v-if` + `v-for` on the same element - 19 found, 18 genuinely broken.** Vue 2 gave `v-for` the
higher priority, so the condition ran per iteration. **Vue 3 reverses it**: the condition is
hoisted *outside* the loop, where the loop variable does not exist yet. Confirmed by compiling the
pattern rather than assuming - `@vue/compiler-dom` emits

    return (x.ok) ? (... _renderList(list, (x) => ...)) : _createCommentVNode()

so `x` in the condition resolves against the render context, not the iteration, and throws.

These did **not** surface in the 98-route walk because each sits behind a parent `v-if` - a closed
modal, an unselected tab, an empty table - so they only fire once a user opens the right screen
with data. Latent by nature.

Fixed by lifting `v-for` (and its `:key`, where present) onto a wrapping `<template v-for>` and
leaving `v-if` on the element, which is the canonical Vue 3 form. 18 sites across 11 files.
The 19th (`v_csm_most_defect.vue`) had a loop-**invariant** condition, `v-if="dashDetail.length"`
next to `v-for="x,idx in dashDetail"` - harmless, and redundant since a `v-for` over an empty
array renders nothing, so the guard was simply dropped.

**`key` on `<template v-for>` - nothing to fix.** A loose scan suggested 6 misplaced keys, but the
compiler only rejects a key on a **direct child** of the template, and it raises that as a hard
error, not a warning - a build that exits 0 proves there are none. The 6 were keys nested deeper,
including the deliberate `:key="'agrArea' + idx + agTableKey"` remount pattern on `<ag-table>`.
Moving those would have broken intentional behaviour.

**Transition class renames - nothing to fix.** Zero custom `v-enter*` / `v-leave*` CSS in the tree.

Still open from the original list: `chart.js` remains pinned to v2 with two v2-only plugins.

### Legacy `Vue.use()` plugins ported (2026-09-16)

The old "11 `Vue.use()` registrations from `main.js` are not ported" item. Working from the legacy
`main.js` rather than guessing, the plugins were: `VTooltip`, `feather` (the `vue-icon` package,
registered as `v-icon`), `echartsPlugin`, `ColorPanel`/`ColorPicker`, `PrettyCheckbox`,
`VueThaiAddressInput`, `vueEventCalendar`, `VueSweetalert2`, `VScrollSync` and `VueRouter`.
`PrettyCheckbox` and `vueEventCalendar` were already handled; `VueRouter` is Nuxt's job.

| Provided | Uses | Resolution |
| --- | --- | --- |
| `<ECharts>` (`echarts-for-vue`) | 26 in 9 files | Wrapper over **`vue-echarts`, already a dependency**. It exposes a different surface - Vue events and `.chart` - so the wrapper re-presents the old contract: an `events` array of `[name, handler]` pairs and `.inst`. No call site changed. |
| `<v-icon>` (`vue-icon`) | 41 in 17 files | The 7 Feather icons actually used are inlined, **copied verbatim from `vue-icon/lib/vue-feather.esm.js`** rather than retyped, along with its exact decoder and SVG attributes. Every `name` is a static literal - there is not one dynamic `:name` - so no dependency was added. |
| `v-tooltip` directive | 35 in 11 files | Backed by **Bootstrap's jQuery tooltip, already loaded as a vendor script**, instead of adding floating-vue and a second tooltip style. All call sites pass a plain string with no modifiers. |
| `<color-panel>` (`one-colorpicker`) | 2 in 2 files | Rebuilt on the native colour input plus a preset palette. |

A registration diff against the legacy `main.js` confirms the global component list is otherwise
complete: of its 58 `Vue.component()` names, the only one missing from the port is
`vue-picture-swipe`, which has **zero** call sites.

Verified by rendering all four: 7 icons emit the same `icon` / `icon-<name>` classes and shape
counts as the source encoding, a chart draws to canvas with `.inst` returning a live echarts
instance and the click handler attached, and the tooltip initialises.

**Still unresolved, and why each is a decision rather than a task:**

- `<thai-address-input>` (3 uses, 1 file). `vue-thai-address-input` is Vue 2 and has no successor.
  Replacing it means vendoring its **3.8 MB bundled Thai address database** and rebuilding the
  autocomplete (`type` = subdistrict/district/province, `v-model`, `@selected` filling the sibling
  fields). That bundling decision is not one to make silently.
- `<ModalEMP>` and `<worker-ref-action>`. These resolve to nothing - but they are used identically
  in `Website/` and registered nowhere there either, so they were **already broken before the
  port**. Mapping them to a component would be a guess that could switch on a dead code path.

### chart.js: investigated, left on v2 (2026-09-16)

**chart.js v2 is not broken.** It is framework-agnostic — not a Vue plugin — so it runs unchanged
under Vue 3 and Vite. Verified by constructing a pie, a `horizontalBar` and an outlabels pie in the
running app: all three instantiated, and `Chart.instances` showed the right type, data and size for
each. They first appeared blank only because `requestAnimationFrame` is throttled in a background
tab; a forced render painted immediately. So this was a modernization item on the list, not a fault.

Smaller than the list implied, too. Of the 5 files importing chart.js, only **3 actually create
charts** (5 instances):

| File | `new Chart()` |
| --- | --- |
| `v_csm_dashboard1.vue` | 3 |
| `v_csm_dashboard2.vue` | 1 |
| `v_csm_most_defect.vue` | 1 |
| `v_csm_dashboard.vue` | 0 — but **keep its imports** (see below) |
| `v_csm_trn_003.vue` | 0 — import removed |

Only one import was genuinely dead: `import { platform } from 'chart.js'` in `v_csm_trn_003.vue`,
which nothing referenced (every other `platform` in that file is a data property). Removed.

`v_csm_dashboard.vue` creates no charts but its imports are **load-bearing** and must stay: it sets
`Chart.defaults.global` font family/colour/size, and Chart is a singleton, so those defaults apply
to the charts other components create. Its `chartjs-plugin-piechart-outlabels` import is likewise a
global side-effect registration other files may depend on.

**What a v4 upgrade would actually cost**, if it is ever wanted:

- `chartjs-plugin-labels` and `chartjs-plugin-piechart-outlabels` are both v2-only. Community v3/v4
  forks exist (`chartjs-plugin-labels-dv`, `@energiency/chartjs-plugin-piechart-outlabels`), so the
  path is not blocked — but adopting third-party forks is a dependency decision.
- `type: 'horizontalBar'` was removed in v3; it becomes `type: 'bar'` with `indexAxis: 'y'`.
- The `scales: { xAxes: [...], yAxes: [...] }` array shape (used in 2 files) becomes
  `scales: { x: {}, y: {} }`, and `legend` / `title` / `tooltips` move under `options.plugins`.
- The visible result is pie-slice percentage labels and outside labels on dashboard charts, which
  cannot be checked without a logged-in session on those screens. Upgrading blind risks a silent
  visual regression on exactly the screens people look at most.

There are no security advisories against the pinned chart.js version.

### Verified working end-to-end

Login page renders with the company list from SQL Server via the .NET 8 backend;
`api/public/LoginCompanies`, `api/public/LanguageSelector` → `LangDisplay`,
`api/public/ViewUserAuthentication`, `api/public/Extension_ForCallCenter` and
`CSM/API/CSM_Read_img_csm` all return 200 with correct CORS headers.

## Still outstanding

- ~~SignalR / realtime~~ **ported 2026-09-15** - see below.
- All 98 staff routes were walked (see the route-walk section); what remains is that they were
  walked as **one admin user**, so per-role `menu_id` permission gating is still unexercised.
- `datepicker` call sites pass `:beforedate` / `:overdate` (26 sites), which match no
  declared prop and are silently ignored — a **pre-existing** Vue 2 bug, preserved
  deliberately rather than "fixed" into newly-enforced date limits. Decide the intent
  before changing it.
- ~~`slot="extra"` in the CustomerConfigCenter screens~~ **done** - converted with the rest of
  the Vue 2 slot syntax; no `slot=` or `slot-scope=` remains anywhere in the tree.
- ~~Template audit~~ **done 2026-09-16** - see below.
- `chart.js` stays on v2 — **verified working, not broken**. See the chart.js note below; the
  upgrade is a decision, not a defect.
- `<thai-address-input>` (3 uses, 1 file) is still unresolved - see below, it needs a decision.
- `<ModalEMP>` and `<worker-ref-action>` resolve to nothing, but they did in the **legacy Vue 2
  app too** - pre-existing bugs, not port regressions. Do not guess a mapping.
- `$swal` (1 use) - `vue-sweetalert2` was a legacy `Vue.use()` and is not installed.

## Ordering note

`../Website` stays on Vue 2.7 + Vite and remains deployable throughout. From this point the two
frontends have diverged and both need maintaining until the port completes — any fix landed in
`Website/` must be mirrored into `frontend/`.
