# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Governance comes first

Repository rules, migration policy and the definition of done live in [AGENTS.md](AGENTS.md); read it
before changing anything. If this file and `AGENTS.md` disagree, `AGENTS.md` wins. Legacy Vue 2 work
under `Website/` is governed by `Website/AGENTS.md` (entry point `Website/CLAUDE.md`). Durable
migration state is recorded in `docs/migrations/csm-stack-migration-closeout.md`.

Mango CSM (Customer Service Management) is mid-migration from a Vue 2 app hosted by ASP.NET
Framework 4.8 to a Nuxt 4 SPA backed by a .NET 8 API:

| Tree | Role |
|---|---|
| `frontend/` | The target: Nuxt 4 / Vue 3 / Vite SPA, a full port of the legacy app. Most work happens here. |
| `Website/` | Legacy Vue 2 app and ASP.NET host. The behavioural reference for parity work ("legacy = product spec"). |
| `Nuxt/` | Superseded first-slice scaffold. History only; never build in it or import from it. |
| `docs/` | Contracts and runbooks: `integration/frontend-backend-connection.md` (wiring, auth, CORS, failure table), `backend/contract-navigation-knowledge.md` (backend areas), `migrations/`. |

The backend (`MangoServiceNetCore`, .NET 8) is a **separate repository** whose local path differs per
machine; it serves every area under the `/service/` path base, on `http://localhost:5075/service/` in
development. The frontend never talks to a database directly.

## Commands

All from `frontend/`:

```bash
npm run dev                  # predev runs sync:vendor first; serves http://localhost:3000
npm run sync:vendor          # copy ../Website/Content + ../Website/Scripts/Others -> public/vendor (gitignored)
npm run build                # nuxt generate -> .output/public (static SPA)
npm run typecheck            # vue-tsc over the app
npm run typecheck:warranty-item   # stricter tsconfig.warranty-item.json: app/features/warranty-item + its tests
npm test                     # document store: test:query, test:store, then test:parity
npm run test:warranty-item   # Vitest, test/warranty-item/**/*.test.ts
npx vitest run test/warranty-item/edit/warranty-item-draft.test.ts   # one Vitest file
node app/services/document-store/query.test.mts                     # one document-store suite
```

- `sync:vendor` needs the `Website/` tree beside `frontend/`. Without it the app loads without
  jQuery, `$xt` and the other globals every screen depends on.
- `test:parity` starts a throwaway MongoDB via `mongodb-memory-server` (downloaded on first run); it
  compares the in-browser query engine with a real `mongod`.
- `typescript` is pinned to 5.9.x on purpose: with TypeScript 7, `vue-tsc` crashes before checking.
  `vue-tsc` prints a harmless "Resolve plugin path failed: vue-router/volar/sfc-route-blocks"
  warning twice; the exit code is what counts.
- There is no linter. The legacy `Website/` builds with its own Vite config; see `Website/AGENTS.md`.

Running the whole stack: the backend is started from its own checkout (runbook in
`docs/integration/frontend-backend-connection.md` §10) and needs its `.env`. Deployment of the static
build: `docker compose up --build` from the repo root (nginx on :8080, proxying `/service/` to
`API_UPSTREAM`), or IIS with `frontend/deploy/iis/web.config`; `frontend/deploy/iis/Test-IisDeploy.ps1`
stands up and checks a throwaway local IIS site. Details in `frontend/README.md`.

## How `frontend/` fits together

**Boot is a port of `Website/Page/Default.aspx`, not a normal Nuxt app.** `nuxt.config.ts` (`ssr: false`)
injects classic `<script>` tags in a fixed order: `public/config.js` first (per-deployment settings such
as `window.dataServer`; edited on the server, never bundled), then the legacy vendor scripts from
`/vendor/...` (jQuery, AdminLTE, `xtools.js` → `$xt`, `alert-service.js` → `$msg`, LinqJS → `$linq`,
TinyMCE, ...), then `public/globals-bridge.js`, which copies the vendors' lexical `const`/`let` globals
onto `window`. Screens use these globals directly. Vendor URLs must be built from the app base URL:
a relative URL breaks on nested routes.

**Routing is a hand-written table, not file-based.** `app/router.options.js` returns the arrays in
`app/routes/routes.*.js`, which keep the legacy URLs (`/page/Transaction/v_csm_trn_001/`) and their
`meta`: `auth`, `mangoMenu { menu_id, checkUserRight }`, `customer` / `customer_auth` / `customer_v2`.

**`app/middleware/auth.global.js` is the legacy `router.beforeEach`.** On every navigation it:
- loads translations into `window.ui` (from the `LanguageSelector` endpoint and
  `vendor/Scripts/Others/lang_bundle.json`);
- calls `ViewUserAuthentication` to fill `window.auth`, `window.userRight` and `window.projectRight`;
- enforces menu rights (redirecting to `/page/error/access_denied/`) and redirects to the login pages.

Auth is the `X-Mango-Auth` header set from `localStorage.mango_auth` by the vendor axios instances,
not cookies. A 401/419 is retried anonymously, but **any other error thrown here becomes Nuxt's
full-page "500"**; that is what an unreachable backend looks like.

**Screens** (`app/Components/Pages/**`) are Options-API components ported from Vue 2 with minimal change:
- **Backend calls:** `$xt.getServer('Area/Controller/Action?...')` / `$xt.postServerJson(...)`
  prefix `window.dataServer` and resolve to the response body, usually `{ success, data, error }`.
- **Translated text:** labels come from `ui.*`.
- **Layout:** `<re-page ref="page">` (staff) or `<customer-page>` (portal) provides the shell, and the
  module-level `let page` is assigned in `mounted()`.
- **Shared state:** `app/stores/csm.js` (Pinia), exposed through `plugins/store-compat.client.js` as the
  Vuex-shaped global `store` / `this.$store` (`store.state.X`, `store.dispatch('findX')`); use
  `mapState` / `mapGetters` from `~/stores/helpers`.

The plugins recreate what the legacy `main.js` installed:
- `components.client.js` registers the global components: layouts, `ag-table`, modals, pickers, and
  local replacements for Vue-2-only libraries;
- `globals.client.js` provides `$date`, `$num`, a mitt event bus and `window.jsondiffpatch`;
- `signalr.client.js` provides `window.signalR` on `@microsoft/signalr` (ASP.NET Core SignalR);
- `tooltip.client.js` provides the `v-tooltip` directive, on Bootstrap;
- `ag-grid.client.js` registers the AG Grid modules.

**Grids:** `<ag-table>` (`app/Components/Center/ag-table.vue`) wraps AG Grid 33 but keeps the
AG Grid 27 contract the screens were written against. When it mounts it puts each grid's API back on
`topGridOptions.api` / `bottomGridOptions.api`, then emits `ready`. Screens load rows with
`$refs.agr.setDisplay(rows)` and export through `exportExcel()` / `printPDF()`.

**`app/features/`** is the newer, typed, test-first structure used for parity remediation.
`warranty-item/` has a route-level page, a page policy, and service/state modules per capability
(list, edit, delete, import, export, reference IC), each covered by Vitest under `test/warranty-item/`.
The capability ledger is `docs/migrations/warranty-item-c4-capability-ledger.md`.

**`app/services/document-store/`** is a frontend-only, MongoDB-query-compatible store over
`public/data/*.json`, used by `v_csm_log_web`. The closeout marks that screen a parked target-only
extra, not legacy parity. Contract: `docs/integration/document-store-contract.md`.

`frontend/MIGRATION.md` is the running log of port decisions and regressions already fixed; check it
before "fixing" something that looks wrong.

## Porting traps that recur in this codebase

- **Vue 2 APIs that fail at runtime.** These compile fine:
  - `setup(props, { refs, root, parent })`: Vue 3's context has none of them;
  - `.sync`: dropped silently by the compiler;
  - `$on` / `$off` on instances;
  - `.x-enter` transition classes: now `.x-enter-from`;
  - directive `bind` / `unbind`: now `beforeMount` / `unmounted`;
  - `v-if` together with `v-for` on one element.
- **Removed AG Grid API.** AG Grid 31+ removed `gridOptions.api`, `gridOptions.columnApi`,
  `api.setRowData` and `getSortModel`. Inside `ag-table` use the restored `.api` and
  `setGridOption('rowData', …)`. Components with their own grid (e.g. `import-data.vue`) still use
  the removed API.
- **Missing files don't 404.** The dev server and the IIS/nginx configs fall back to `index.html`
  with **200** for unknown paths, so a missing JSON or asset surfaces as a parse error.
- **Unknown store actions only log.** Dispatching an action the store lacks logs
  `[store] unknown action type` and returns, as Vuex did. Some legacy screens rely on this.
- **Menu rights are data.** An account with no enabled `menu_right` rows is sent to access-denied on
  every `checkUserRight` route, even if `auth.is_admin` is set.
