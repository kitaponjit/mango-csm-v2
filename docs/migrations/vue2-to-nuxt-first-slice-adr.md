# Vue 2 to Nuxt First Slice ADR

## Status

`DECIDED`

This ADR closes the first-slice architecture for the Vue 2 to Nuxt and Webpack 5 to Vite boundary. It authorized the boundary and route selection before implementation; implementation status is tracked through repository history and Pull Requests rather than by changing this decision record.

Initial implementation was delivered through PR #2 (Nuxt shell), PR #4 (authentication/API foundation), PR #6 (semantic UI baseline), and PR #8 (manual route). Their current review and merge states must be checked on GitHub; this ADR does not imply deployment or production cutover approval.

The following labels are used in this record:

- `OBSERVED` - present in the current checkout.
- `DECIDED` - the architecture selected for this first slice.
- `REJECTED` - not suitable for this first slice.
- `IMPLEMENTATION DETAIL` - can be resolved while building the shell without changing this ADR.
- `EXTERNAL DECISION` - requires an owner outside this repository or outside architecture-only work.

## Context

The current frontend is a Vue 2.6.14, Vue Router 3.6.5, Vuex 3.6.2 application built by Webpack 5. `Website/Page/Default.aspx` is the ASP.NET-rendered legacy host. It emits browser runtime values, creates `#app`, loads legacy browser scripts, and finally loads `Scripts/bundle/Application.js`.

`Website/Page/Web.config` currently rewrites requests within the Page path to `Default.aspx`. The legacy router owns the existing `/page/**` URL space, including `/page/manual/v_csm_manual_list/`, and ends with a wildcard error route. `Website/Scripts/Bundle/**` is the current Webpack artifact and remains unchanged.

The previous discovery and ADR established route-prefix coexistence and an adapter boundary but left the Nuxt major, literal prefix, artifact/deployment model, API strategy, and route selection open. Current checkout evidence is sufficient to close those first-slice decisions.

Evidence used for this closure includes:

- `Website/Page/Default.aspx`, `Website/Page/Web.config`, and `Website/Web.config`;
- `Website/Scripts/App/Application/main.js`, `routes.js`, `Routes/routes.manual.js`, and `Store/store.js`;
- `Website/Scripts/Others/Service/xtools.js`;
- `Website/Scripts/App/Application/Components/Pages/Manual/v_csm_manual_list.vue`;
- `Website/package.json`, `webpack.common.js`, `webpack.dev.config.js`, and `webpack.prod.config.js`;
- `docs/migrations/vue2-to-nuxt-boundary.md` and the prior version of this ADR.

The legacy working-tree change to `Website/AGENTS.md`, the untracked root `AGENTS.md`, and existing documentation artifacts are outside this ADR's write scope.

## Final Decisions

### Nuxt Version

**DECIDED: Nuxt 4.**

The target is a new application boundary, not an upgrade of the existing Vue 2 application. The current Vue 2, Vue Router 3, Vuex 3, and Webpack dependencies therefore provide no concrete blocker to Nuxt 4 when the target has an independent package/build boundary. The absence of a Nuxt project at decision time was an implementation gap, not a reason to defer the major version.

Nuxt 4 supports client-side-only output with `ssr: false`, static generation, and a configured application base URL. These capabilities support the selected boundary; see the [Nuxt 4 deployment documentation](https://nuxt.com/docs/4.x/getting-started/deployment). The exact Nuxt 4 patch version and Node build version are `IMPLEMENTATION DETAIL` items to pin when the shell is created.

### Rendering Mode

**DECIDED: SPA/client-side rendering with `ssr: false`.**

The first slice does not require SEO, server-rendered HTML, Nuxt server routes, server-side session processing, or server-side data fetching. The browser will load the target entrypoint and obtain session, localization, and API data through the target-facing contracts.

SSR and hybrid rendering are `REJECTED` for this slice. They may be reconsidered only after the target independently owns the required server, session, and deployment lifecycles.

### Deployment Runtime

**DECIDED: static artifact served by IIS; no persistent Nuxt/Nitro/Node process.**

The target build will produce a static SPA artifact using Nuxt 4's Vite-based build path and static generation. IIS will serve the target files under the selected prefix. A permanent Node process, IISNode, reverse proxy to Nitro, or Docker runtime is not part of this first slice.

The build machine still needs Node to generate the artifact. That build-tool requirement does not create a production Node runtime requirement. Docker and the long-term .NET/IIS deployment direction remain outside this first-slice hosting decision.

### Coexistence Prefix

**DECIDED: target prefix `/csm-next/`.**

The prefix is selected from actual checkout evidence. Existing Website serving directories are `Page`, `Scripts`, and `Content`; the current route modules use `/page/**`; the configured backend base is `http://localhost/service/`; and no `app`, `next`, or `csm-next` serving directory or route was found.

Candidate scoring uses `5 = lower collision/deployment risk`:

| Candidate | Existing route collision | Physical/static collision | API/rewrite isolation | Namespace stability | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/csm-next/` | 5 | 5 | 5 | 5 | **20/20** |
| `/next/` | 5 | 5 | 5 | 3 | **18/20** |
| `/app/` | 5 | 5 | 4 | 3 | **17/20** |

`/csm-next/` is preferred because it is explicit about the CSM target boundary without coupling the public URL to the Nuxt or Vite implementation. The mapping must be scoped to this prefix and ordered before any broad fallback.

The target route for this slice is conceptually `/csm-next/manual/`. The legacy route `/page/manual/v_csm_manual_list/` remains legacy-owned during coexistence; it is not silently reassigned or redirected by this ADR.

### URL Ownership

No URL is owned by both Vue Router and Nuxt. The ownership contract is:

| URL | Owner | Behavior |
| --- | --- | --- |
| `/` and `/Default.aspx` | Legacy ASP.NET host | Existing root redirect to `/page/`. |
| `/page/**` | Legacy `Page/Default.aspx` and Vue 2 router | Existing Page rewrite and Vue 2 history-mode behavior remain in force. |
| `/csm-next/` | Nuxt 4 static artifact | Serves the target `index.html`. |
| `/csm-next/**` | Nuxt 4 static artifact and target client router | Static target assets are served directly; target client routes fall back to target `index.html`. |
| `/Scripts/Bundle/**` | Legacy Webpack | `Application.js` and legacy split chunks remain owned and deployed as they are today. |
| `/Scripts/Others/**` and `/Content/**` | Legacy IIS static files | Target assets do not overwrite or compete with these paths. |
| Configured `dataServer/**` such as `http://localhost/service/**` | Existing backend service | Target requests use the `ApiClient` compatibility boundary. |
| Everything else | Existing IIS behavior | No new target catch-all is permitted. |

### Runtime Contract

Only these first-slice capabilities are exposed to target code:

```ts
interface RuntimeConfig {
  publicBasePath: '/csm-next/'
  apiBaseUrl: string
  fileHost?: string
}

interface SessionAdapter {
  getInternalContext(): Promise<{
    isAuthenticated: boolean
    userId?: string
  }>
  redirectToLegacyLogin(): void
}

interface ApiClient {
  get<T>(path: string, query?: Record<string, string>): Promise<T>
}

interface LocalizationAdapter {
  load(): Promise<{ language: string; ui: Record<string, string> }>
}

interface FileCapability {
  imageOrDownloadUrl(fileId: string): string
}
```

`RuntimeConfig` contains browser-safe values only. Tokens, auth headers, arbitrary `window.*` objects, `$xt`, response parsing, and legacy login implementation remain inside adapters. `companyCode`/maincode, socket values, print values, and unrelated host globals are not part of the minimum contract because this route does not use them directly.

The internal session adapter must preserve the current `meta.auth: true` outcome, including the existing authentication initialization semantics and redirect to the legacy internal login when the session is not authenticated. The adapter may use the current backend and browser storage internally; target components do not read those details.

### API Adapter

**DECIDED: Strategy C - transitional target-facing API adapter.**

The call chain is:

```text
Nuxt page
    -> manual domain/service functions
    -> ApiClient
    -> temporary compatibility transport
    -> existing backend
```

For `v_csm_manual_list`, the service boundary covers:

- `CSM/Manual/ManualReadList` with date parameters;
- `CSM/Manual/ManualReadListV2` with revision/condition parameters;
- `CSM/Manual/ReadPicture` for attachment metadata;
- `Api/File/DownLoad` through `FileCapability` for attachment URLs.

The compatibility transport preserves the existing internal `dataServer` base URL, `X-Mango-Auth` semantics, success/data/total response envelopes, query encoding, and error behavior. It may call the legacy `$xt` implementation internally during transition, but target page and domain code must not know `$xt`, auth-header details, or legacy envelope parsing.

Strategy A, direct target use of `$xt`, is `REJECTED`. Strategy B, a fully target-native API client, remains a possible later replacement after endpoint/auth/envelope parity is demonstrated.

### Target Artifact

```text
Target source boundary:
  <repository-root>/Nuxt/** (future conceptual boundary; not created in this task)

Target build artifact:
  Nuxt/.output/public/** from static Nuxt generation,
  packaged as an independent csm-next deployment unit

Public/base URL:
  /csm-next/ (Nuxt app.baseURL)

Target asset ownership:
  /csm-next/**, including the target entrypoint, _nuxt/** bundles,
  and target public assets

Legacy artifact:
  Website/Scripts/Bundle/**

Overlap:
  NONE
```

The target artifact is deployable, cacheable, and removable independently of the legacy bundle. It must not be emitted into, cleaned with, or referenced as a replacement for `Website/Scripts/Bundle/**`. Target-owned CSS, images, and JavaScript are packaged with the target artifact rather than relying on legacy global script registration.

### IIS Deep-Link Contract

This is a conceptual contract only. `Web.config` is not changed by this task.

```text
GET /csm-next/_nuxt/<asset>  -> target static asset
GET /csm-next/<target-file>  -> target static file when present
GET /csm-next/               -> target index.html
GET /csm-next/manual         -> target index.html
GET /csm-next/manual/        -> target index.html

GET /page/...                -> existing Page/Default.aspx -> Vue 2 flow
GET /Scripts/Bundle/...      -> existing legacy static artifact
GET /Scripts/Others/...      -> existing legacy static artifact
GET /Content/...             -> existing legacy static artifact
GET configured API paths     -> existing backend behavior
GET everything else          -> existing IIS behavior
```

The target fallback applies only inside `/csm-next/**`, after target static-file checks. It must not capture `/page/**`, the legacy asset paths, or backend requests. The current Page rewrite and legacy Vue wildcard remain legacy-only; they are not a fallback for the target prefix.

## Candidate Route Decision

`v_csm_manual_list` remains the highest-ranked candidate at `134/165`, and the previously unresolved dependencies are now bounded by the selected contracts.

Observed route facts:

- `routes.manual.js` declares `/page/manual/v_csm_manual_list/` with `meta.auth: true` and no menu/project-right metadata;
- the component has no direct Vuex call, ag-Grid, editor, chart, write operation, or realtime dependency;
- its backend behavior is read-oriented and limited to the three manual endpoints plus attachment file access;
- its legacy seams are `$xt`, `$linq`, `window.ui`, `auth`, `dataServer`, `moment`, the `date`/`number` filters, and global `re-page`, `datepicker`, and `modal` controls.

The route is suitable for a first target slice because each seam has a specific owner: session/auth, localization, API, file capability, or a small target-native replacement. The route does not require migrating the Vue 2 runtime components for reuse.

`v_csm_config_001` remains unselected because create/delete operations make rollback and mutation parity more complex. `v_csm_rpt_001` remains rejected because of its ag-Grid/report-condition/export tree, transaction navigation, and unresolved `findDataType`/`datatype` store reference.

## APPROVED FIRST SLICE: `v_csm_manual_list`

The first target URL is `/csm-next/manual/`. The source legacy URL remains `/page/manual/v_csm_manual_list/` until a separately approved cutover. Approval is architectural; implementation still requires the parity and external operational gates below.

## Ownership Boundary

### Legacy

- `/page/**`, including the current manual route;
- `Website/Page/Default.aspx`, its `#app` mount, and legacy runtime globals;
- Vue 2, Vue Router 3, Vuex 3, global Vue 2 controls, and the legacy navigation guard;
- Webpack scripts/configuration and `Website/Scripts/Bundle/**`;
- current legacy static asset paths and current backend contracts.

### Target

- `/csm-next/**` only;
- the future Nuxt 4 client-side application and its router;
- the independent `Nuxt/.output/public/**` artifact;
- target-native manual page controls and target-facing adapters.

### Shared Contract

- browser-safe runtime configuration;
- internal session/authentication outcome;
- existing backend API semantics through `ApiClient`;
- localization and `EN_MASTER` fallback semantics through `LocalizationAdapter`;
- route-required image/download behavior through `FileCapability`.

### Forbidden

- same-path ownership by Vue Router and Nuxt;
- target components importing or calling `$xt`, `$msg`, `$linq`, Vuex 3, or arbitrary `window.*` values;
- target output inside or over `Website/Scripts/Bundle/**`;
- target fallback capture of `/page/**`, legacy assets, or API paths;
- migrating Vue 2 global controls into Nuxt only for code reuse;
- adding realtime, print, company, or database capabilities without route evidence.

## First-Slice Dependency Mapping

| Dependency | RuntimeConfig | Adapter | Replace natively | Not needed | Decision |
| --- | --- | --- | --- | --- | --- |
| API base URL (`window.dataServer`) | YES |  |  |  | Browser-safe `apiBaseUrl`; only `ApiClient` consumes it. |
| Target application/base path (`/csm-next/`) | YES |  |  |  | Fixed target public base; do not reuse legacy `basePath`/`baseRoute`. |
| Internal authentication/session (`meta.auth: true`, `auth`) |  | YES |  |  | `SessionAdapter`; preserve initialization and login redirect. |
| Maincode/company context |  |  |  | YES | No direct use in this component or its request parameters. Add only if endpoint evidence later requires it. |
| Language and UI labels (`window.ui`, language bundle) |  | YES |  |  | `LocalizationAdapter`; preserve language loading and `EN_MASTER` fallback. |
| Menu/project permissions |  |  |  | YES | No `mangoMenu`, menu id, or project-right metadata is present for this route. Authentication remains required. |
| File/image host base | YES |  |  |  | Safe file host may be configured separately from the API base. |
| Image/download behavior (`Api/File/DownLoad`) |  | YES |  |  | `FileCapability`; target code receives a URL/capability, not raw host globals. |
| `$xt` transport |  | YES |  |  | Hidden inside `ApiClient` compatibility transport. |
| `$linq` collection operations |  |  | YES |  | Use ordinary target-native filter/reduce/forEach operations. |
| `$msg` |  |  |  | YES | No direct use found in this route; do not expose it. Target-owned errors may be added only for parity. |
| Realtime/socket values |  |  |  | YES | No SignalR/socket use found in the route. |
| `moment` date formatting/defaults |  |  | YES |  | Use a target-owned date utility or browser APIs; do not import the legacy global. |
| Vue filters `date` and `number` |  |  | YES |  | Implement only the formats used by the route. |
| `re-page`, `datepicker`, `modal` |  |  | YES |  | Build minimal target-native equivalents; do not migrate the Vue 2 components. |
| Vuex store |  |  |  | YES | No direct store dependency; use route-local state and service functions. |

The minimum runtime contract therefore consists of `RuntimeConfig`, `SessionAdapter`, `ApiClient`, `LocalizationAdapter`, and `FileCapability`. `PermissionAdapter` and `RealtimeAdapter` are not required for this route's first slice.

## Parity Checklist

- [ ] `/csm-next/` serves the target entrypoint and `/csm-next/manual/` survives direct navigation and refresh.
- [ ] Target fallback is limited to `/csm-next/**`; `/page/**`, legacy assets, and API paths remain unaffected.
- [ ] Browser back/forward and target-to-legacy navigation preserve the separate URL ownership boundary.
- [ ] Internal authentication calls preserve the existing authenticated/unauthenticated outcomes and legacy login redirect.
- [ ] `X-Mango-Auth` behavior is preserved inside the compatibility transport; target components cannot access the header implementation.
- [ ] Date search uses the current-month first day and current date defaults with equivalent formatting and query parameters.
- [ ] Revision search preserves `between`, `more_than`, `less_than`, and `equal` behavior and parameter encoding.
- [ ] Manual list rows, totals, module tabs, filtering, loading overlay, and empty state match the legacy route.
- [ ] `ManualReadList`, `ManualReadListV2`, and `ReadPicture` response envelopes are normalized without changing displayed data.
- [ ] Attachment modal, image rendering, new-tab behavior, and download URLs match current behavior.
- [ ] Language/UI behavior and `EN_MASTER` fallback are verified for supported languages.
- [ ] Small target-native date, modal, layout, and formatting controls are responsive at the legacy supported widths.
- [ ] Target assets use `/csm-next/` paths and do not depend on legacy bundle ownership or incidental globals.
- [ ] API failures, empty responses, loading completion, and user-visible error behavior are verified.
- [ ] No database mutation or database restoration is required for this read-only slice.
- [ ] Legacy login, `/page/`, and `/page/manual/v_csm_manual_list/` still work after target publication.

## Rollback Procedure

Rollback is scoped to the target prefix and target artifact:

1. Disable only the IIS mapping/fallback that assigns `/csm-next/**` to the target artifact.
2. Stop serving the target static package or remove only the target artifact/cache entries.
3. Leave `/page/**`, `Website/Page/Default.aspx`, legacy routes, legacy scripts, and `Website/Scripts/Bundle/**` untouched.
4. If a later release temporarily assigned an old URL to the target, restore that URL to its existing legacy mapping. The first coexistence slice does not require such reassignment.
5. Verify the legacy login, `/page/`, `/page/manual/v_csm_manual_list/`, and one existing API request.
6. Do not restore or alter any database. The approved route is read-oriented and introduces no backend mutation.

## Decision Closure and Remaining External Decisions

The previous open items are classified as follows:

| Previous item | Classification | Result |
| --- | --- | --- |
| Nuxt major/version and SPA setting | CLOSE NOW | Nuxt 4 with `ssr: false`. |
| Literal target prefix | CLOSE NOW | `/csm-next/`. |
| First-slice static serving versus a target process | CLOSE NOW | Static artifact served by IIS; no persistent Node runtime. |
| Long-term IIS/Docker relationship | EXTERNAL DECISION | Not needed for this static slice; future platform topology remains outside the frontend boundary. |
| Public host values versus adapter-owned values | CLOSE NOW | Only safe base/file values are runtime config; auth and arbitrary globals stay behind adapters. |
| Strategy C API transport | CLOSE NOW | Transitional `ApiClient` compatibility transport. |
| First read-only route | CLOSE NOW | `v_csm_manual_list`. |
| `findDataType`/`datatype` source for the report candidate | IMPLEMENTATION DETAIL | Not relevant while `v_csm_rpt_001` is rejected; resolve only if that route is reconsidered. |
| Nuxt/Vite entry, exact patch, Node version, and cache settings | IMPLEMENTATION DETAIL | Resolve during shell creation within the selected source/artifact boundary. |
| Legacy retirement criteria | CLOSE NOW | Retirement requires the parity checklist, rollback rehearsal, and explicit cutover approval. |
| .NET 7 backend ownership and eventual API retirement | EXTERNAL DECISION | Separate backend repository/project-owner decision; not needed for the first slice. |
| SQLite/MongoDB ownership and data migration | EXTERNAL DECISION | Outside this frontend-only slice and not touched by the read-only route. |

### External decision: production IIS publication

- **Question:** Who approves and applies the production IIS mapping, static fallback, cache policy, and release switch for `/csm-next/**`?
- **Decision owner:** Infrastructure/DevOps and release owner.
- **Why architecture cannot decide it:** The checkout does not contain the deployment site topology, IIS permissions, release automation, or operational monitoring configuration.
- **Blocks shell creation:** NO.
- **Blocks route cutover:** YES.

### External decision: runtime configuration and security handling

- **Question:** What production mechanism supplies the browser-safe `apiBaseUrl`, optional `fileHost`, and target base path, and confirms that tokens/secrets are not exposed as public config?
- **Decision owner:** Platform/security owner with the frontend owner.
- **Why architecture cannot decide it:** Values and secret-handling rules are environment-specific and are not established in this checkout.
- **Blocks shell creation:** NO; local development can use an explicit safe fixture/adapter contract.
- **Blocks route cutover:** YES.

### External decision: product/UAT cutover approval

- **Question:** Who accepts manual-list functional, authorization, localization, responsive, and attachment parity and authorizes any future old-URL cutover?
- **Decision owner:** CSM product owner and QA/release owner.
- **Why architecture cannot decide it:** Business acceptance and release timing are not repository architecture decisions.
- **Blocks shell creation:** NO.
- **Blocks route cutover:** YES.

### External decision: long-term platform migration

- **Question:** What are the owning project and retirement plan for the .NET 7 backend, IIS/Docker topology, API migration, and SQL Server/SQLite/MongoDB decisions?
- **Decision owner:** Backend/platform/data owners and project owner.
- **Why architecture cannot decide it:** Those systems are outside this checkout and outside the Vue 2/Nuxt boundary.
- **Blocks shell creation:** NO.
- **Blocks route cutover:** NO for the scoped static first slice; YES for eventual full legacy platform retirement.

No unresolved first-slice architecture question remains. The external decisions above are operational, product, or long-term platform decisions and do not require this ADR to remain `PROPOSED`.

## Implementation Gate

This ADR does not create the Nuxt shell. When implementation is explicitly started, it must:

1. create the independent Nuxt 4 source/package boundary without changing `Website/package.json` or the legacy Webpack configuration;
2. configure `ssr: false` and `/csm-next/` as the public base path;
3. emit the target artifact outside `Website/Scripts/Bundle/**`;
4. implement only the target-facing contracts required by `v_csm_manual_list`;
5. implement scoped IIS mapping/fallback in the deployment workstream, without allowing target fallback to capture legacy paths;
6. execute the parity checklist and a prefix-only rollback rehearsal before any route cutover;
7. obtain the external publication, security/configuration, and product/UAT decisions listed above before production cutover.

The architectural result is:

```text
DECIDED
TARGET: Nuxt 4 client-side static SPA under /csm-next/**
API: Strategy C through target-facing ApiClient
FIRST SLICE: v_csm_manual_list
LEGACY: /page/** and Website/Scripts/Bundle/**
OVERLAP: NONE
```
