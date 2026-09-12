# Vue 2 to Nuxt Migration Boundary

## Status and Scope

**Status:** Historical discovery record; implementation decisions are superseded by [the first-slice ADR](./vue2-to-nuxt-first-slice-adr.md).

This document records the first read-only migration-boundary pass made before the Nuxt target was implemented. It describes the Vue 2/Webpack/ASP.NET host contract and the evidence used to choose a safe migration boundary. Statements about the target being absent or decisions being open describe that discovery point; use the first-slice ADR and root `AGENTS.md` for current decisions.

The migration direction remains the project requirement:

| Current | Target |
| --- | --- |
| Vue 2 | Nuxt.js |
| Webpack 5 | Vite |

At the time of discovery, the target was not implemented. All target-side statements below are therefore historical proposals or questions unless explicitly marked as observed.

## Repository Evidence

Observed in the current working copy:

- `Website/package.json` declares Vue `2.6.14`, Vue Router `3.6.5`, Vuex `3.6.2`, Webpack 5, `webpack-cli`, `webpack-dev-server`, `vue-loader`, and `vue-template-compiler` 2.6.14.
- The active package scripts invoke `webpack.dev.config.js` for watch/development and `webpack.prod.config.js` for production. `build`, `start`, and `pub` are aliases around those legacy Webpack scripts.
- `Website/Scripts/App/Application/main.js` imports Vue, Vue Router, the Vue Composition API plugin, route definitions, and the Vuex store; registers many global components/plugins; creates a history-mode Vue Router; installs a global navigation guard; and mounts a new Vue instance on `#app`.
- `Website/Scripts/App/Application/routes.js` aggregates 12 route-module files. The route modules contain 111 `path:` entries in the current checkout, including a wildcard error route that is spread last.
- `Website/Scripts/App/Application/Store/store.js` creates a Vuex store with shared code/config/company state, asynchronous actions using the global `$xt` service helper, alert handling through `$msg`, and a `global.store` export.
- `Website/Page/Default.aspx` is an ASP.NET-rendered host page. It computes URLs and server settings from the request and `Web.config` app settings, emits runtime globals, creates `<div id="app"><router-view></router-view></div>`, loads legacy script globals, and finally loads `Scripts/bundle/Application.js`.
- `Website/webpack.common.js` discovers `Scripts/App/*/main.js` entries and emits bundles under `Scripts/Bundle`. The development config adds history fallback and BrowserSync on port `4060` proxying IIS on port `4061`; the production config cleans and minifies output.
- Only `Website/webpack.common/dev/prod.config.js` remain (`webpack.config.js`, a dead single-file config, was removed).
- No `Website/nuxt.config.*` or `Website/vite.config.*` exists. No Nuxt/Vite boundary or target entry point is established by repository files.

Applicable governance was read before this record was written:

- `AGENTS.md` defines the migration direction, prohibits expanding legacy debt, requires adapters and behavioral parity, and routes Website implementation detail to `Website/AGENTS.md`.
- `Website/AGENTS.md` remains the detailed legacy Website manual, including the no-manual-build rule, global `$xt`/auth behavior, route metadata, Vuex conventions, host-page globals, responsive twins, and Webpack output assumptions.
- `Website/CLAUDE.md` directs agents to `Website/AGENTS.md` and confirms that the nested file is the Website implementation source of truth.

## Current Runtime Graph

```text
ASP.NET Page/Default.aspx
  -> request/app-settings derived URLs and runtime globals
  -> #app + <router-view>
  -> legacy external scripts ($xt, auth helpers, SignalR, UI libraries)
  -> Scripts/bundle/Application.js
  -> Webpack entry Scripts/App/Application/main.js
  -> Vue 2 global plugins/components
  -> Vue Router history mode + Vuex 3 store
  -> route components and service calls
```

The current runtime is therefore not a self-contained Vue entry. It depends on host-page ordering, globals, dynamic base paths, external scripts, and an output filename that the ASP.NET page loads explicitly.

## Host, Build, and Runtime Contracts

| Contract | Current owner | Observed behavior | Migration risk | Evidence |
| --- | --- | --- | --- | --- |
| Document host | ASP.NET `Default.aspx` | Server-side `Page_Load` computes `baseUrl`, `basePath`, `baseRoute`, `dataServer`, print/server URLs, and build-version values. | A Nuxt entry cannot assume a fixed origin, root path, or host page lifecycle. | `Website/Page/Default.aspx` |
| Mount point | ASP.NET markup + Vue 2 | `#app` contains `<router-view>` and is mounted by `new Vue(...).$mount('#app')`. | A coexistence model must assign document and mount ownership explicitly. | `Website/Page/Default.aspx`, `main.js` |
| Runtime configuration | Inline host script | `window.baseUrl`, `basePath`, `baseRoute`, `dataServer`, `baseCompany`, `auth`, `ui`, menu/right objects, `viewVersion`, host/server URLs, and socket values are emitted before the bundle. | Nuxt runtime configuration and server/client execution must preserve the required values without leaking server-only settings. | `Website/Page/Default.aspx` |
| Legacy service globals | External scripts loaded before the bundle | `$xt`, `$msg`, `$linq`, `$notify`, jQuery, `moment`, `Decimal`, SignalR objects, and related helpers are made available globally. | Direct global access makes a page or store difficult to move independently. | `Website/Page/Default.aspx`, `Website/AGENTS.md` |
| Base URL and assets | ASP.NET `<base>` plus Webpack | The page sets `<base href="baseUrl">`; Webpack emits `Scripts/Bundle/Application.js` and route chunks; CSS/fonts/images are loaded from server paths. | Incorrect public paths or history fallback can break deep links and split chunks. | `Default.aspx`, `webpack.common.js`, dev/prod configs |
| Development server | Webpack + BrowserSync + IIS | BrowserSync uses `localhost:4060` and proxies IIS at `localhost:4061`; Webpack enables history fallback. | A Vite boundary must preserve local routing and proxy expectations until a new contract is approved. | `webpack.dev.config.js`, `Website/AGENTS.md` |
| Production cache/versioning | ASP.NET host + bundle timestamps | `Default.aspx` uses bundle timestamps/build version values in script and stylesheet URLs and sets no-cache response headers. | A new output strategy must preserve safe deployment and cache invalidation semantics. | `Default.aspx` |

## Route, State, and Service Ownership

### Route ownership

Routes are assembled in `Website/Scripts/App/Application/routes.js` from module files for default pages, dashboards, transactions, master data, reports, external/customer pages, manuals, tools, configuration, custom Mango features, customer configuration, and other/error routes. The final `errorRoutes` spread contains the wildcard `path: "*"` route and must remain last in the legacy router until a replacement owns the same behavior.

Route metadata is behavior, not decoration. The current guard reads combinations of `auth`, `customer`, `customer_v2`, `customer_auth`, `isAdmin`, `userMango`, `redirect`, and `mangoMenu` values. A future Nuxt route layer must preserve the outcome of these checks even if the implementation uses a different middleware mechanism.

### Bootstrap and authorization behavior

The `main.js` guard currently:

1. Applies metadata redirects before continuing.
2. Derives menu context from `mangoMenu` metadata.
3. Loads language data through `$xt`, fetches `lang_bundle.json` relative to `baseUrl`, and populates `window.ui` and `window.langList`.
4. For internal authenticated routes, calls `api/public/ViewUserAuthentication` and assigns `window.auth`, `window.appinfo`, `window.userRight`, and `window.projectRight`.
5. For customer routes, calls `$xt.getCustomerServer('CSM/AuthCustomer/GetInitCustomerData')` and manages `window.customer_auth` and customer login redirects.
6. Checks menu/project rights, administrator status, and the special Mango user rule; unauthorized navigation redirects to the existing access-denied route.
7. Redirects unauthenticated internal users to the existing login route, hides `#firstLoading`, and calls `next()` for permitted navigation.

The guard also contains a host-specific login redirect for `csr.mangoconsultant.com`. This is an observed compatibility behavior; its retirement criteria are not established.

### Vuex and service ownership

`store.js` owns shared connection/request/priority/service code lists, system and Anywhere configuration, company data, active configuration, configuration read-list data, and a service-bug list. Its actions call `$xt.getServer(...)` and read `window.auth.maincode`; error paths call `$msg.alert(...)`. Getters transform service/request lists for Select2 and group service data.

The migration boundary must not make migrated pages depend directly on Vuex 3 or undeclared globals. Before implementation, the project must decide whether these contracts are temporarily exposed through an adapter, duplicated behind a target-side service/state layer, or migrated as a coordinated unit. The current evidence does not establish that decision.

## Boundary Options

| Option | Description | Strength | Main risk | Status |
| --- | --- | --- | --- | --- |
| Host-preserving, route-scoped coexistence | Keep `Default.aspx` and the legacy bundle for existing routes; assign a clearly defined route or mount boundary to a future Nuxt surface. | Minimizes immediate host and rollback changes. | Requires an explicit URL owner, asset/public-path contract, and cross-stack navigation rule. | Proposed shape, not approved |
| Separate Nuxt entry alongside legacy bundle | Introduce a separately deployed target entry while Vue 2 continues to own current routes. | Makes build ownership explicit and limits legacy changes. | The repository has no established target directory, entry path, or deployment topology. | Candidate only |
| Full host replacement after parity | Make Nuxt the document/application owner after all required host globals and behavior are replaced. | Simplifies the eventual target state. | High migration blast radius; auth, URLs, external scripts, deep links, and rollback must all be solved first. | Not suitable as first slice |

The evidence supports route-scoped coexistence as the safest *shape* for incremental work, but not a concrete route prefix or application placement. No route is approved as the first slice yet because route modules share host globals, auth metadata, external libraries, and potentially shared Vuex state.

## Proposed First Boundary

The proposed first boundary is a **host-preserving, route-scoped target entry** with these constraints:

- Existing Vue 2 routes, `Default.aspx`, the Webpack output, and legacy globals remain unchanged while the boundary is evaluated.
- A future Nuxt surface receives an explicit URL/mount owner rather than competing with the existing history-mode router for the same paths.
- The target entry consumes a deliberate runtime contract for base URL, authenticated context, customer context, language, API access, and realtime behavior; it does not import or silently recreate `$xt` internals.
- Cross-stack navigation is explicit and reversible. The legacy application remains the fallback owner until the target route passes parity and rollback checks.
- Vite/Nuxt output and the existing `Scripts/Bundle` output have separate ownership until the retirement gate is passed.

This is a design proposal, not an implementation authorization. The first code task must not begin until the questions below are answered and the selected route has a measured dependency inventory.

## Candidate First-Slice Scorecard

Use this scorecard against a specific route before selecting it. The current checkout does not provide enough evidence to complete the scorecard safely without choosing a route and tracing its component tree.

| Criterion | Required evidence | Pass condition |
| --- | --- | --- |
| Route isolation | Route module, parent/layout imports, and navigation links | Target can own a distinct URL without duplicate history ownership. |
| Auth complexity | `meta` flags, guard calls, user/project rights, customer mode | Required auth context is known and can be supplied by an adapter. |
| Vuex coupling | Component `dispatch`, `commit`, mapped state/getters, and shared mutations | State dependencies are bounded or an explicit migration seam exists. |
| Global dependency count | `$xt`, `$msg`, `$linq`, jQuery, SignalR, window values, third-party widgets | Every required global has an owner and parity check. |
| Asset coupling | CSS, fonts, images, editor/grid/chart libraries, public paths | Assets can load under the target boundary without changing legacy output. |
| Business criticality | User workflow and authorization impact | Rollback and manual parity coverage are practical. |
| Rollback simplicity | Route switch, host fallback, and deployment artifact ownership | The unchanged legacy route can be restored without a data rollback. |

Representative traces support keeping the first-slice decision open:

- The four routes in `routes.config.js` use `auth: true` and dynamic imports, but `v_csm_config_001.vue` still reads `window.ui`, calls `$xt.getServer`/`$xt.postServerJson`, and uses `$msg.alert`. It is a bounded route family, but it is not independent of the legacy runtime contract.
- The `/page/` and `/page/document` routes point to `home2.vue` and `home.vue`. `home.vue` is 2,182 lines in the current checkout and reads `window.auth`, `window.baseCompany`, `window.ui`, `$xt`, `$msg`, and `$linq` while also containing data-table behavior. It is not a low-risk first slice based on static evidence alone.

No route is approved as the first slice. A future selection must trace the full component tree and shared controls for the chosen route, then complete this scorecard with actual consumers and a rollback owner.

## Behavioral Parity and Rollback Gates

Before removing or bypassing a legacy route, verify the target against the same baseline for:

- login, logout, session expiry, internal/customer auth separation, and authorization denial;
- route paths, redirects, browser refresh/deep links, wildcard/error behavior, and menu visibility;
- API helper selection, auth headers, request parameters, response envelopes, validation, and error handling;
- Vuex-derived data and transformations used by the migrated workflow;
- loading indicators, notifications, language selection/fallback, responsive behavior, and third-party widgets;
- SignalR/realtime behavior, file/print interactions, public assets, cache/version handling, and browser navigation;
- deploy and rollback behavior under the existing IIS-hosted environment.

The rollback gate is satisfied only when the legacy route/host can resume ownership without changing the target’s persistent data or leaving duplicate URL ownership. Compilation or a successful bundle build alone is insufficient.

## Historical Open Migration Questions

The questions below were open during discovery. The first-slice ADR closes the Nuxt version, rendering mode, coexistence prefix, artifact ownership, adapter direction, and first-route decisions; its external IIS, security, and UAT gates remain authoritative.

OPEN MIGRATION QUESTION: Which Nuxt major/version and execution mode are approved? The checkout contains no Nuxt config or target package manifest.

OPEN MIGRATION QUESTION: Will Nuxt own a route prefix, a mount inside `Default.aspx`, a separate host entry, or the full document after parity? The current ASP.NET page owns the document and emits required runtime globals.

OPEN MIGRATION QUESTION: What is the Vite boundary? The legacy Webpack build emits `Scripts/Bundle/Application.js` and split chunks consumed by `Default.aspx`; no target entry/output or retirement criteria exists.

OPEN MIGRATION QUESTION: Which runtime values may cross the target boundary, and which must move to an environment/configuration provider? The current host emits URLs, auth placeholders, company context, print/server URLs, version values, and socket values directly to `window`.

OPEN MIGRATION QUESTION: Will the target temporarily use an adapter around `$xt`/legacy API envelopes, or will a new service client be established before the first page migration? The current Vuex store and route guard call `$xt` directly.

OPEN MIGRATION QUESTION: Which state is shared during coexistence, and who owns authentication, language, menu rights, project rights, and customer context? The current values are populated in the Vue 2 navigation guard and stored on `window`.

OPEN MIGRATION QUESTION: Which route is approved as the first slice after dependency scoring? No route is isolated enough from the current evidence to select one without a component-level trace.

OPEN MIGRATION QUESTION: What are the deployment and rollback mechanics for IIS while a Vite/Nuxt artifact is introduced? The repository establishes IIS and BrowserSync/webpack behavior but not the target topology.

## Explicitly Out of Scope

- Creating or editing Nuxt/Vite files or package dependencies.
- Rewriting Vue components, routes, Vuex modules, API helpers, or host-page scripts.
- Choosing a Nuxt major version, SSR/SPA mode, state library, API architecture, Docker topology, or backend ownership.
- Migrating SQL Server, SQLite, MongoDB, .NET, IIS, or database schemas.
- Removing Webpack, Vue 2, ASP.NET host behavior, legacy globals, or existing routes.
- Changing `AGENTS.md`, `Website/AGENTS.md`, or `Website/CLAUDE.md`.

## Implementation Handoff Criteria

Application changes may begin only after the project records:

1. an approved Nuxt version/mode and target location;
2. an approved URL/document ownership model for coexistence;
3. a runtime configuration and auth/customer-context contract;
4. a service/API adapter decision preserving current envelopes and auth behavior;
5. a state ownership and synchronization decision;
6. a selected route with completed dependency scorecard;
7. a Vite output/public-path and local proxy contract;
8. a parity test matrix, rollout switch, and rollback procedure.
