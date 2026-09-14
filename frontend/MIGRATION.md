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

## Not yet done

- **Never installed or built.** `npm install` + `npm run generate` have not been run against
  `frontend/`, so nothing here is compile-verified.
- **5 global components** still point at Vue-2-only npm packages: `<vue-select-2>`,
  `<vue-element-loading>`, `<vue-picture-swipe>`, `<VueDocPreview>`, `<vue-pdf-app>`.
- **`datepicker.vue` / `timepicker.vue`** keep the old `value`/`input` contract — they wrap
  `vue2-datepicker`, so renaming the prop now would be redone when that library is swapped.
- **11 `Vue.use()` plugin registrations** from `main.js` are not ported (mostly blocked libraries).
- Template-level Vue 3 changes not yet audited: `v-if`/`v-for` precedence, `key` on `<template v-for>`,
  transition class renames.

## Remaining work, in order

1. **Install and build** `frontend/` — nothing is compile-verified yet. Expect the blocked
   libraries below to be the first failures.
2. **Resolve ag-Grid** (see above) — gates `ag-table.vue`, which backs 100 call sites and most pages.
3. **Replace the dead-end libraries** in the table above, wrapper-first: a shared wrapper for
   `<vue-select-2>` (40 unwrapped call sites) is the largest single item.
4. **Finish `datepicker.vue` / `timepicker.vue`** v-model contract once `vue2-datepicker` is swapped.
5. **Port the 11 `Vue.use()` registrations** from `main.js` as Nuxt plugins.
6. **Audit templates** for Vue 3 semantics: `v-if`/`v-for` precedence, `key` placement on
   `<template v-for>`, transition class renames.
7. **Walk the 111 routes** in the browser against their `menu_id` permission checks.

## Ordering note

`../Website` stays on Vue 2.7 + Vite and remains deployable throughout. From this point the two
frontends have diverged and both need maintaining until the port completes — any fix landed in
`Website/` must be mirrored into `frontend/`.
