# CSM Runtime Dependency Boundaries

## Purpose

This document describes the current dependency boundaries of the CSM frontend and the rules for changing them safely.

It is a current-state architecture reference, not a modernization backlog.

Its purpose is to help future changes preserve verified observable behavior while distinguishing:

- framework-supported direct usage;
- repository-owned abstractions;
- intentional Legacy compatibility boundaries;
- feature-specific behavior contracts;
- known lifecycle or maintenance risks;
- conditions that actually justify architectural change.

Direct dependency usage does not by itself imply a defect. A partially wrapped dependency surface, or multiple existing wrappers or owners, does not automatically require consolidation.

## Architecture Authority

The repository roles are:

- `Website/` — Legacy observable behavior and product specification.
- `frontend/` — current production/runtime target.
- `Nuxt/` — historical migration evidence only.

The migration invariant remains:

```text
LEGACY = PRODUCT BEHAVIOR SPECIFICATION
TARGET STACK = IMPLEMENTATION CONSTRAINT
MIGRATION FEATURE DELTA = 0
```

The CSM stack migration is complete and its verified behavior remains authoritative unless a later product requirement explicitly changes that behavior.

## Current State

At the dependency-audit baseline:

* CSM behavioral migration was complete.
* Migration-unit accounting was `97 / 97`.
* Warranty was `FULL_CAPABILITY_AUDITED`.
* Warranty `GAP = 0`.
* Warranty `UNKNOWN = 0`.
* no dependency-wrapper defect affecting verified Legacy behavior was identified;
* dependency isolation was classified as `PARTIALLY_WRAPPED`.

`PARTIALLY_WRAPPED` is a structural observation. It is not a migration-gap or runtime-defect classification.

## Decision Principle

Use the following rule when evaluating dependency-boundary work:

```text
NO DEFECT
+ NO REQUIRED CHANGE
+ VERIFIED BEHAVIOR
= DO NOT MODIFY
```

Architectural change requires a concrete trigger such as:

1. an observed behavior defect;
2. an approved feature requirement;
3. a required dependency or platform upgrade;
4. a security or deployment requirement;
5. an unsupported runtime pattern;
6. repeated defects caused by duplicated behavior;
7. a change that cannot be safely verified through the current boundary.

Do not create repository-wide abstractions solely to remove direct imports or make the codebase appear more uniform.

## Interpretation Vocabulary

Use these terms consistently:

* `ALIGNED` — the current pattern is consistent with the documented framework/library model.
* `INTENTIONAL COMPATIBILITY BOUNDARY` — repository-owned compatibility behavior exists to preserve current consumers or deployment behavior.
* `APPLICATION-SPECIFIC ABSTRACTION` — the repository wraps a dependency because shared application behavior exists, not because the dependency requires wrapping.
* `FRAMEWORK_DIRECT_USAGE` — direct use of a framework API is intentional and does not require another abstraction layer.
* `BEHAVIOR-SPECIFIC` — superficially similar calls have different observable contracts and must not be generalized without evidence.
* `DOCUMENTED CONDITION` — an architecture characteristic worth knowing but not a current defect.
* `LIFECYCLE RISK` — a dependency or pattern may require future attention when a concrete change is required, but no immediate remediation is implied.

## Dependency Boundary Matrix

| Capability            | Current boundary                                                                                          | Official-model interpretation                                                                                                | Classification                                           | Current action                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| Nuxt plugins          | client/runtime plugins and injected compatibility APIs                                                    | Nuxt supports application plugins and client-only plugins                                                                    | `ALIGNED`                                                | Keep                                                             |
| SignalR               | `plugins/signalr.client.js` owns connection lifecycle and compatibility mapping                           | SignalR documents connection and reconnect lifecycle APIs; this repository centralizes ownership for compatibility           | `ALIGNED` / wrapped                                      | Keep                                                             |
| State                 | Pinia behind a Vuex-shaped compatibility facade                                                           | Pinia supports direct store use; the facade is repository migration compatibility                                            | `INTENTIONAL COMPATIBILITY BOUNDARY`                     | Keep                                                             |
| Router                | direct Nuxt/Vue Router configuration and APIs                                                             | direct framework routing is normal                                                                                           | `FRAMEWORK_DIRECT_USAGE`                                 | Keep direct                                                      |
| HTTP/API              | `$xt` dominant, with limited Axios and raw `fetch` exceptions                                             | Nuxt custom `$fetch` clients and Axios instances are supported approaches to shared transport concerns                       | `INTENTIONAL COMPATIBILITY BOUNDARY` / partially wrapped | Do not rewrite without a concrete requirement                    |
| Runtime configuration | deployment `config.js`, globals bridge, `window.dataServer`, `window.auth`, `window.ui`, `window.baseUrl` | Nuxt runtime configuration is standard, but purely static output cannot receive server runtime configuration after prerender | `INTENTIONAL STATIC-DEPLOYMENT COMPATIBILITY BOUNDARY`   | Keep unless deployment requirements change                       |
| Grid                  | `ag-table.vue`, `ag-report.vue`, `import-data.vue`                                                        | direct AG Grid component ownership is supported; repository wrappers may own application-specific behavior                   | `APPLICATION-SPECIFIC ABSTRACTIONS`                      | Keep; multiple owners are not automatically a defect             |
| File/download         | direct browser APIs plus feature-local capabilities such as Warranty Item download handling               | browser download, preview, popup, print, and Blob semantics are distinct                                                     | `BEHAVIOR-SPECIFIC` / partially wrapped                  | Do not create a generic wrapper without a concrete requirement   |
| Notifications         | `$msg`, `$notify`, and feature-specific confirmation/dialog behavior                                      | Vue plugins/global properties are supported but should be used deliberately                                                  | `INTENTIONAL COMPATIBILITY` / feature-specific           | Preserve observable ordering and callbacks                       |
| Date/time             | Moment, native `Date`, Flatpickr, shared formatters                                                       | multiple APIs are technically supported; Moment is in maintenance mode                                                       | `DOCUMENTED CONDITION` + `LIFECYCLE RISK`                | Document and defer                                               |
| Excel/import          | SheetJS, ExcelJS, FileSaver, server parsing, feature-specific adapters                                    | direct SheetJS imports are supported; business import contracts remain feature-specific                                      | `BEHAVIOR-SPECIFIC` / partially wrapped                  | Preserve mapping and value semantics; no generic wrapper mandate |

## Intentional Compatibility Boundaries

### HTTP and `$xt`

`$xt` is the dominant repository transport compatibility boundary for existing CSM consumers. The existence of modern Nuxt `$fetch` APIs does not, by itself, justify replacing this boundary.

Before any task changes `$xt`, direct Axios usage, authentication transport, or related request behavior, establish the currently required contract for:

- API/base URL selection;
- authentication headers;
- tenant or `maincode` context;
- request serialization;
- response normalization;
- `401` behavior;
- `403` behavior;
- network-error behavior;
- error object shape consumed by existing features.

A transport rewrite is not authorized unless a concrete requirement makes it necessary.

### Static Runtime Configuration

The current frontend is deployed as static SPA output and uses deployment/runtime globals such as:

- `window.dataServer`;
- `window.baseUrl`;
- `window.auth`;
- `window.ui`.

These values are exposed through the repository's configuration/compatibility bridge.

Nuxt `runtimeConfig` is an appropriate framework mechanism when server/runtime execution can supply those values, but a purely static prerendered deployment has different post-build configuration constraints.

Therefore the current external `config.js` model is an intentional static-deployment compatibility boundary. Do not replace it merely because Nuxt provides `runtimeConfig`.

Re-evaluate this decision when the deployment model, hosting strategy, configuration-loading requirements, or security requirements change.

### State Compatibility

Pinia is the target state technology, while existing CSM consumers may continue to use the repository's Vuex-shaped compatibility facade.

The facade exists to preserve consumer contracts during migration. Direct Pinia usage is valid where repository conventions support it, but removing the compatibility facade requires an explicit migration task with an inventory of affected `$store` consumers.

### SignalR

SignalR connection ownership is centralized in the client plugin.

Preserve:

- connection creation;
- reconnect behavior;
- connection-state handling;
- queued or compatibility behavior;
- the existing consumer-facing compatibility shape.

Do not distribute `HubConnection` ownership into feature pages without a concrete architectural requirement.

## Supported Direct Usage

Not every direct dependency call requires an application wrapper.

Supported or potentially appropriate direct usage includes:

- Nuxt/Vue Router framework APIs;
- Pinia APIs where repository conventions permit direct store access;
- AG Grid inside designated component owners;
- SheetJS in feature-specific spreadsheet workflows;
- browser APIs when their exact semantics are part of the required behavior.

Use an abstraction when it owns a real application contract, not merely to eliminate a direct import.

## Behavior-Specific Boundaries

### File, Download, Preview, Popup, and Print

Do not treat every `window.open()` or file-related call as the same capability.

These behaviors may have materially different contracts:

- server-token download;
- direct URL download;
- Blob download;
- file preview;
- attachment open;
- report popup;
- print popup;
- external navigation.

Browser user-activation requirements, popup behavior, target behavior, same-origin restrictions, download filename handling, and Blob URL lifecycle can differ.

Before consolidating any of these calls, prove that their observable contracts are equivalent.

### Notifications and Confirmation

Notification behavior includes more than message text.

Preserve, where observable:

- alert vs toast vs confirmation semantics;
- blocking vs non-blocking behavior;
- success/error category;
- callback timing;
- notification-before-close ordering;
- modal reset/close ordering.

Do not unify `$msg`, `$notify`, and confirmation behavior unless the affected workflows have been individually characterized.

### Date and Time

Date/time behavior is contract-sensitive.

Before changing date libraries, formatters, timezone handling, or API serialization, establish:

- accepted input;
- display format;
- API payload format;
- timezone assumptions;
- null/empty semantics;
- invalid-value behavior.

Moment is currently a lifecycle risk because the project is in maintenance mode. This does not create an immediate requirement to replace it.

### Excel and Import/Export

Spreadsheet behavior is feature-contract driven.

Before changing spreadsheet libraries or introducing a shared abstraction, establish:

- `.xls` / `.xlsx` requirements;
- column mapping;
- raw-value preservation;
- blank/null handling;
- numeric/string handling;
- date-cell interpretation;
- server-vs-client parsing responsibility;
- API payload semantics.

Direct use of SheetJS or another spreadsheet library does not, by itself, justify a shared wrapper.

## Known Architecture Conditions

The following conditions are intentionally documented but are not classified as current defects:

- HTTP uses more than one transport path.
- File/download behavior is distributed.
- Date handling uses more than one mechanism.
- notification and modal behavior is not fully centralized.
- grid, calendar, and chart ownership is not represented by one universal wrapper.
- runtime globals remain part of static deployment compatibility.
- Moment is in maintenance mode.

These conditions become implementation work only when a concrete trigger requires change.

## Future-Change Trigger Policy

Before modifying a sensitive boundary, use this table.

| Future task touches | Required analysis before implementation |
| --- | --- |
| `$xt`, Axios, `fetch`, auth | establish transport, headers, tenant context, serialization, `401/403`, response and error contracts |
| `config.js` or runtime globals | establish static deployment and configuration-loading assumptions |
| download, preview, popup, print | classify the exact browser behavior and preserve user-activation/navigation semantics |
| Moment, date parsing, date serialization | lock input, display, payload, timezone, null, and invalid-value behavior |
| Excel/import/export | lock mapping, raw-value, file-format, parser, and payload semantics |
| notifications, confirmation, modal lifecycle | preserve callback, visibility, and close/reset ordering |
| SignalR | preserve connection ownership, reconnect, state, and compatibility behavior |
| state compatibility facade | inventory existing `$store` consumers and required compatibility behavior |

## Characterization-Test Policy

Do not add characterization tests merely because a compatibility boundary lacks complete coverage.

Add the smallest characterization protection when all of the following apply:

1. the boundary is about to change;
2. observable behavior must be preserved;
3. existing automated evidence does not establish that behavior.

Preferred sequence:

```text
establish observable contract
→ add the smallest characterization/regression evidence needed
→ change the implementation
→ verify the observable contract remains intact
```

Do not freeze incidental implementation details that have not been established as required behavior.

## When Not to Refactor

Do not start architectural work solely because:

* a direct package import exists;
* a framework exposes a newer API;
* several wrappers or owners exist;
* a compatibility global appears stylistically old;
* another module uses a different implementation style;
* a dependency is old but no current requirement demands replacement;
* an audit reports partial wrapping.

Architecture work should follow a concrete behavior, product, platform, security, deployment, or dependency requirement.

## Audit Snapshot

The source dependency audit was performed against:

```text
f1055c854e766350bf12fcf2e24abe6d1ffe00ee
```

At that snapshot the audit observed approximately:

* `$xt`: 1,425 references across 180 application files;
* `window.open`: 87 usages across 49 files;
* `API/File/DownLoad`: 79 usages across 47 files;
* direct `xlsx` imports: 14 page files;
* Moment: 316 source matches across approximately 62 files.

These numbers are informational snapshots only.

They are not architecture invariants and must be re-measured before estimating or planning future cross-cutting work.

## Official References

The architecture interpretation above was checked against official documentation for:

### Nuxt 4

* Plugins and client-only plugins:
  `https://nuxt.com/docs/4.x/directory-structure/app/plugins`
* Runtime configuration:
  `https://nuxt.com/docs/4.x/guide/going-further/runtime-config`
* Environment/static configuration considerations:
  `https://nuxt.com/docs/4.x/directory-structure/env`
* Deployment/static hosting:
  `https://nuxt.com/docs/4.x/getting-started/deployment`
* `$fetch`:
  `https://nuxt.com/docs/4.x/api/utils/dollarfetch`
* Custom `useFetch` / API client recipe:
  `https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch`

### Vue 3

* Application API / global properties:
  `https://vuejs.org/api/application`
* Plugins:
  `https://vuejs.org/guide/reusability/plugins`

### Pinia

* Vuex migration guidance:
  `https://pinia.vuejs.org/cookbook/migration-vuex.html`

### Microsoft SignalR

* JavaScript client and reconnect lifecycle:
  `https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client`

### Axios

* Custom instances:
  `https://axios-http.com/docs/instance`

### Browser Platform / MDN

* `window.open()`:
  `https://developer.mozilla.org/en-US/docs/Web/API/Window/open`
* `<a>` and `download`:
  `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a`
* Blob URLs:
  `https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob`

### Moment

* Project documentation and maintenance status:
  `https://momentjs.com/docs/`

### SheetJS

* Framework installation and module-import guidance:
  `https://docs.sheetjs.com/docs/getting-started/installation/frameworks/`

### AG Grid

* Vue integration:
  `https://www.ag-grid.com/vue-data-grid/getting-started/`

## Final Maintenance Rule

Use the simplest rule that preserves verified behavior:

```text
NO DEFECT
+ NO REQUIRED CHANGE
+ VERIFIED BEHAVIOR
= DO NOT MODIFY
```

Use this document as a risk map and planning aid, not as a backlog generator.
