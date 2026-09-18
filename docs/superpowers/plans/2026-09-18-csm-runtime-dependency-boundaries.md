I'm using the writing-plans skill to create the implementation plan.

ด้านล่างเป็นแผนตามรูปแบบ Superpowers จริง โดยตั้งใจให้ fresh Agent ที่ไม่เคยเห็นแชทนี้สามารถทำงานได้จาก plan อย่างเดียว และ **ไม่เปิดช่องให้กลายเป็น modernization/refactor project**

แนะนำให้บันทึกเป็น:

`docs/superpowers/plans/2026-09-18-csm-runtime-dependency-boundaries.md`

---

# CSM Runtime Dependency Boundaries Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the canonical repository documentation for current CSM runtime dependency boundaries and add minimal durable Agent guidance so future changes preserve verified behavior instead of triggering unnecessary wrapper/refactor work.

**Architecture:** Add one detailed current-state architecture document under `docs/architecture/` and a small pointer/policy section in root `AGENTS.md`. The architecture document separates repository facts, official framework/library guidance, intentional compatibility boundaries, observed architecture conditions, and concrete future-change triggers. It must not create a modernization backlog.

**Tech Stack:** Markdown documentation for a Nuxt 4 / Vue 3 frontend using Pinia, Vue Router, SignalR, AG Grid, `$xt`/Axios/fetch compatibility transport, static `config.js` runtime globals, Moment, SheetJS/ExcelJS/FileSaver, and browser platform APIs.

**Spec:** `docs/migrations/csm-stack-migration-closeout.md`. Architecture-decision requirements not present in that file are copied verbatim into **Global Constraints** below so this plan is self-contained.

## Global Constraints

* `Website/` = Legacy observable behavior / product specification.
* `frontend/` = current production/runtime target.
* `Nuxt/` = historical migration evidence only.
* Preserve exactly: `LEGACY = PRODUCT BEHAVIOR SPECIFICATION`.
* Preserve exactly: `TARGET STACK = IMPLEMENTATION CONSTRAINT`.
* Preserve exactly: `MIGRATION FEATURE DELTA = 0`.
* CSM implementation and parity migration are already complete; do not reopen migration analysis.
* Current dependency isolation is `PARTIALLY_WRAPPED`; that is a structural description, not a defect classification.
* Current dependency/library audit found **no current Legacy behavior defect caused by wrapper/direct-usage architecture**.
* No repository-wide wrapper/refactor work is authorized.
* No `$xt` replacement is authorized.
* No global migration to `$fetch`/`useFetch` is authorized.
* No Moment replacement is authorized.
* No runtime-global replacement is authorized.
* No generic download wrapper is authorized.
* No modal/grid/calendar consolidation is authorized.
* Direct dependency usage does not automatically imply a defect.
* Multiple wrappers do not automatically imply a defect.
* Modern framework APIs do not automatically supersede verified compatibility boundaries.
* `public/config.js` / runtime globals must be treated as a static-deployment compatibility mechanism unless new evidence establishes otherwise.
* Moment maintenance mode is a lifecycle risk, not a current runtime defect.
* Characterization tests are added just-in-time when a boundary is actually changing and observable behavior lacks sufficient protection; do not create speculative coverage solely because a boundary is untested.
* Documentation only. Do not change production source, tests, dependencies, lockfiles, configuration, generated output, or backend code.
* Do not modify `Website/AGENTS.md`.
* Never persist private machine paths.
* Official framework/library guidance must be described accurately as `supports`, `recommends`, or `documents`; do not upgrade “supported” into “required”.
* Audit counts are snapshots, not architecture invariants.
* Source audit snapshot SHA: `f1055c854e766350bf12fcf2e24abe6d1ffe00ee`.
* Re-measure source counts before planning any future cross-cutting implementation.
* Before execution, fetch `origin/main`. If it has moved past the snapshot SHA, inspect the intervening commits for changes to `AGENTS.md`, `docs/architecture/`, dependency boundaries, or runtime architecture before applying this plan.
* Use an isolated worktree at execution time via `superpowers:using-git-worktrees`.
* Do not touch a dirty user-owned worktree.

---

## File Structure

### Create

`docs/architecture/csm-runtime-dependency-boundaries.md`

Responsibility:

* canonical description of current CSM dependency-boundary architecture;
* distinguish supported direct usage from intentional compatibility layers;
* record official-framework interpretation;
* document known architecture conditions without converting them into defects;
* define future-change triggers and pre-change verification policy;
* preserve the dependency-audit snapshot as provenance only.

### Modify

`AGENTS.md`

Responsibility:

* concise durable Agent policy;
* prevent automatic wrapper/refactor work solely from observing direct imports;
* require observable-contract analysis before changing established compatibility boundaries;
* point future Agents to the canonical architecture document.

### Must remain unchanged

```text
Website/AGENTS.md
frontend/**
Nuxt/**
Website/** except root documentation references already present
package.json
lockfiles
tests
backend source
runtime configuration
```

---

### Task 1: Create the Canonical Current-State Architecture Document

**Files:**

* Create: `docs/architecture/csm-runtime-dependency-boundaries.md`
* Reference: `docs/migrations/csm-stack-migration-closeout.md`
* Reference: `AGENTS.md`
* Reference: `frontend/README.md`

**Interfaces:**

* Consumes: current CSM architecture authority and the accepted source/official-research conclusions copied into Global Constraints.

* Produces: canonical architecture reference at `docs/architecture/csm-runtime-dependency-boundaries.md` for future developers, Agents, and Task 3’s `AGENTS.md` link.

* [ ] **Step 1: Verify the execution base before editing**

Run:

```bash
git fetch origin --prune
git rev-parse origin/main
git status --short
```

Expected:

```text
- Current worktree is the isolated documentation worktree.
- Working tree is clean.
- The actual origin/main SHA is recorded in the implementation report.
```

If `origin/main` is newer than:

```text
f1055c854e766350bf12fcf2e24abe6d1ffe00ee
```

inspect:

```bash
git log --oneline f1055c854e766350bf12fcf2e24abe6d1ffe00ee..origin/main
git diff --name-status f1055c854e766350bf12fcf2e24abe6d1ffe00ee..origin/main
```

Stop before editing only if the intervening changes materially alter:

```text
AGENTS.md
docs/architecture/**
current dependency boundaries
frontend runtime/deployment architecture
```

Do not treat unrelated mainline changes as a blocker.

* [ ] **Step 2: Create the document with the authority, purpose, and decision model**

Create:

```text
docs/architecture/csm-runtime-dependency-boundaries.md
```

Start with this content:

````markdown
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

Direct dependency usage does not, by itself, imply a defect. Likewise, a partially wrapped dependency surface or multiple existing wrappers does not automatically require consolidation.

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
````

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
| --------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| Nuxt plugins          | client/runtime plugins and injected compatibility APIs                                                    | Nuxt supports application plugins and client-only plugins                                                                    | `ALIGNED`                                                | Keep                                                             |
| SignalR               | `plugins/signalr.client.js` owns connection lifecycle and compatibility mapping                           | SignalR requires deliberate connection/reconnect lifecycle ownership                                                         | `ALIGNED` / wrapped                                      | Keep                                                             |
| State                 | Pinia behind a Vuex-shaped compatibility facade                                                           | Pinia supports direct store use; the facade is repository migration compatibility                                            | `INTENTIONAL COMPATIBILITY BOUNDARY`                     | Keep                                                             |
| Router                | direct Nuxt/Vue Router configuration and APIs                                                             | direct framework routing is normal                                                                                           | `FRAMEWORK_DIRECT_USAGE`                                 | Keep direct                                                      |
| HTTP/API              | `$xt` dominant, with limited Axios and raw `fetch` exceptions                                             | Nuxt custom `$fetch` clients and Axios instances are supported approaches to shared transport concerns                       | `INTENTIONAL COMPATIBILITY BOUNDARY` / partially wrapped | Do not rewrite without a concrete requirement                    |
| Runtime configuration | deployment `config.js`, globals bridge, `window.dataServer`, `window.auth`, `window.ui`, `window.baseUrl` | Nuxt runtime configuration is standard, but purely static output cannot receive server runtime configuration after prerender | `INTENTIONAL STATIC-DEPLOYMENT COMPATIBILITY BOUNDARY`   | Keep unless deployment requirements change                       |
| Grid                  | `ag-table.vue`, `ag-report.vue`, `import-data.vue`                                                        | direct AG Grid component ownership is supported; repository wrappers may own application-specific behavior                   | `APPLICATION-SPECIFIC ABSTRACTIONS`                      | Keep; multiple owners are not automatically a defect             |
| File/download         | direct browser APIs plus feature-local capabilities such as Warranty Item download handling               | browser download, preview, popup, print, and Blob semantics are distinct                                                     | `BEHAVIOR-SPECIFIC` / partially wrapped                  | Do not create a generic wrapper without a concrete requirement   |
| Notifications         | `$msg`, `$notify`, and feature-specific confirmation/dialog behavior                                      | Vue plugins/global properties are supported but should be used deliberately                                                  | `INTENTIONAL COMPATIBILITY` / feature-specific           | Preserve observable ordering and callbacks                       |
| Date/time             | Moment, native `Date`, Flatpickr, shared formatters                                                       | multiple APIs are technically supported; Moment is in maintenance mode                                                       | `DOCUMENTED CONDITION` + `LIFECYCLE RISK`                | Document and defer                                               |
| Excel/import          | SheetJS, ExcelJS, FileSaver, server parsing, feature-specific adapters                                    | direct SheetJS imports are supported; business import contracts remain feature-specific                                      | `BEHAVIOR-SPECIFIC` / partially wrapped                  | Preserve mapping and value semantics; no generic wrapper mandate |

````

- [ ] **Step 3: Verify the first half contains the canonical invariants**

Run:

```bash
rg -n \
  "Website/|frontend/|Nuxt/|MIGRATION FEATURE DELTA = 0|NO DEFECT|NO REQUIRED CHANGE|PARTIALLY_WRAPPED" \
  docs/architecture/csm-runtime-dependency-boundaries.md
````

Expected:

```text
All authority roles, the migration invariant, the stop rule,
and the PARTIALLY_WRAPPED interpretation are present.
```

* [ ] **Step 4: Run whitespace validation**

Run:

```bash
git diff --check
```

Expected:

```text
PASS
```

* [ ] **Step 5: Commit the current-state architecture foundation**

```bash
git add docs/architecture/csm-runtime-dependency-boundaries.md
git commit -m "docs(csm): document runtime dependency boundaries"
```

---

### Task 2: Add Compatibility Decisions, Change Triggers, Audit Provenance, and Official References

**Files:**

* Modify: `docs/architecture/csm-runtime-dependency-boundaries.md`

**Interfaces:**

* Consumes: boundary vocabulary and matrix created by Task 1.

* Produces: durable maintenance policy explaining why current boundaries exist, what must be preserved, and when future architectural work is justified.

* [ ] **Step 1: Add the compatibility-boundary guidance**

Append:

````markdown
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
````

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

````

- [ ] **Step 2: Verify every high-risk boundary has a trigger policy**

Run:

```bash
rg -n \
  '\$xt|runtime globals|download|Date and Time|Excel|Notification|SignalR|state compatibility' \
  docs/architecture/csm-runtime-dependency-boundaries.md
````

Expected:

```text
HTTP/auth, runtime config, file/download, date/time,
Excel/import, notification/modal, SignalR, and state
all appear in both architecture explanation and/or trigger guidance.
```

* [ ] **Step 3: Verify the document does not convert observations into a mandatory modernization roadmap**

Run:

```bash
rg -n \
  'must replace|must migrate|must wrap|repository-wide rewrite|required modernization' \
  docs/architecture/csm-runtime-dependency-boundaries.md
```

Expected:

```text
No matches.
```

* [ ] **Step 4: Validate Markdown whitespace**

Run:

```bash
git diff --check
```

Expected:

```text
PASS
```

* [ ] **Step 5: Commit the maintenance policy and research references**

```bash
git add docs/architecture/csm-runtime-dependency-boundaries.md
git commit -m "docs(csm): add dependency change policy"
```

---

### Task 3: Add Minimal Durable Guidance to Root AGENTS.md

**Files:**

* Modify: `AGENTS.md`
* Must not modify: `Website/AGENTS.md`
* Reference: `docs/architecture/csm-runtime-dependency-boundaries.md`

**Interfaces:**

* Consumes: canonical architecture reference created by Tasks 1–2.

* Produces: concise repository-level instruction that future Agents must follow before changing CSM compatibility boundaries.

* [ ] **Step 1: Locate the existing CSM migration guidance**

Run:

```bash
rg -n \
  'MIGRATION FEATURE DELTA|Website/|frontend/|Nuxt/' \
  AGENTS.md
```

Expected:

```text
The existing repository-wide CSM/migration guidance is located.
```

Do not edit `Website/AGENTS.md`.

* [ ] **Step 2: Add the dependency-boundary subsection**

Immediately after the existing repository-level CSM migration guidance, add:

```markdown
### CSM dependency-boundary changes

Do not introduce, replace, or consolidate repository-wide dependency wrappers solely because direct library usage exists.

Before changing an established CSM compatibility boundary, establish:

- the observable behavior that must be preserved;
- the affected consumers;
- deployment/runtime assumptions;
- and the smallest verification needed for the requested change.

Modern framework APIs do not automatically supersede working compatibility boundaries.

Preserve verified behavior unless the task explicitly requires a change.

Detailed architecture and change-trigger guidance:

`docs/architecture/csm-runtime-dependency-boundaries.md`
```

* [ ] **Step 3: Verify the root guidance points to the canonical document**

Run:

```bash
rg -n \
  'CSM dependency-boundary changes|csm-runtime-dependency-boundaries.md|Modern framework APIs' \
  AGENTS.md
```

Expected:

```text
The subsection and canonical documentation link are present.
```

* [ ] **Step 4: Confirm Website/AGENTS.md is untouched**

Run:

```bash
git diff --name-only | rg '^Website/AGENTS\.md$'
```

Expected:

```text
No output.
```

* [ ] **Step 5: Validate documentation-only scope**

Run:

```bash
git diff --check
git status --short
git diff --name-status
```

Expected changed paths before commit:

```text
M AGENTS.md
```

The architecture document should already be committed by Tasks 1–2.

* [ ] **Step 6: Commit the Agent guidance**

```bash
git add AGENTS.md
git commit -m "docs(agents): add CSM dependency-boundary guidance"
```

---

### Task 4: Final Documentation Consistency and Scope Gate

**Files:**

* Verify: `docs/architecture/csm-runtime-dependency-boundaries.md`
* Verify: `AGENTS.md`
* Read-only comparison: `docs/migrations/csm-stack-migration-closeout.md`
* Read-only comparison: `frontend/README.md`

**Interfaces:**

* Consumes: all documentation produced by Tasks 1–3.

* Produces: independently verifiable documentation-only branch ready for code/documentation review.

* [ ] **Step 1: Verify the final changed-file scope against the execution base**

Record the actual base SHA:

```bash
BASE_SHA=$(git merge-base HEAD origin/main)
printf '%s\n' "$BASE_SHA"
```

Then run:

```bash
git diff --name-status "$BASE_SHA"...HEAD
```

Expected:

```text
M  AGENTS.md
A  docs/architecture/csm-runtime-dependency-boundaries.md
```

No production source, tests, dependencies, lockfiles, runtime configuration, or `Website/AGENTS.md` may appear.

* [ ] **Step 2: Verify current architecture authority is consistent**

Run:

```bash
rg -n \
  'Website/|frontend/|Nuxt/|FULL_CAPABILITY_AUDITED|BLOCKED_EXTERNAL_ENV' \
  AGENTS.md \
  docs/architecture/csm-runtime-dependency-boundaries.md \
  docs/migrations/csm-stack-migration-closeout.md \
  frontend/README.md
```

Expected interpretation:

```text
Website/ remains the Legacy behavior authority.
frontend/ remains the current runtime target.
Nuxt/ remains historical.
Nothing in the new documentation reopens Warranty or authenticated UAT.
```

* [ ] **Step 3: Verify no private workstation paths were introduced**

Run:

```bash
rg -n \
  'C:\\Users\\|/Users/[^/[:space:]]+/|/home/[^/[:space:]]+/' \
  AGENTS.md \
  docs/architecture/csm-runtime-dependency-boundaries.md
```

Expected:

```text
No matches.
```

* [ ] **Step 4: Verify official references are all HTTPS official-source links**

Run:

```bash
rg -n 'https://' docs/architecture/csm-runtime-dependency-boundaries.md
```

Expected domains are limited to:

```text
nuxt.com
vuejs.org
pinia.vuejs.org
learn.microsoft.com
axios-http.com
developer.mozilla.org
momentjs.com
docs.sheetjs.com
ag-grid.com
```

No community blog, Stack Overflow, Reddit, or unofficial mirror should appear.

* [ ] **Step 5: Run final whitespace and working-tree checks**

Run:

```bash
git diff --check origin/main...HEAD
git status --short
```

Expected:

```text
git diff --check: PASS
working tree: CLEAN
```

Documentation lint:

```text
NOT AVAILABLE
```

unless the current repository has gained an established documentation lint command since the earlier closeout.

Do not add tooling solely for this task.

* [ ] **Step 6: Inspect final history**

Run:

```bash
git log --oneline --decorate -3
```

Expected documentation commits include:

```text
docs(csm): document runtime dependency boundaries
docs(csm): add dependency change policy
docs(agents): add CSM dependency-boundary guidance
```

Do not squash or amend unless repository policy explicitly requires it.

* [ ] **Step 7: Produce the review handoff**

Report:

```text
# CSM Runtime Dependency Documentation — Implementation Report

Base SHA:
...

Branch:
...

HEAD:
...

Created:
docs/architecture/csm-runtime-dependency-boundaries.md

Updated:
AGENTS.md

Website/AGENTS.md changed:
NO

Production source changed:
NO

Tests changed:
NO

Dependencies changed:
NO

Lockfiles changed:
NO

Runtime behavior changed:
NO

Private paths introduced:
NO

Architecture conclusions:
- direct usage is not automatically a defect
- verified compatibility boundaries remain preserved
- no immediate wrapper/refactor backlog created
- Moment maintenance mode recorded as lifecycle risk
- static config globals documented as deployment compatibility
- future architectural changes are trigger-driven

Official references:
VERIFIED / <details>

git diff --check:
PASS

Documentation lint:
NOT AVAILABLE / <actual>

Working tree:
CLEAN
```

Finish with:

```text
CSM RUNTIME DEPENDENCY DOCUMENTATION COMPLETE —
READY FOR INDEPENDENT REVIEW
```

Do not merge automatically.

---

## Plan Self-Review

**Spec coverage:** Complete. The plan covers current architecture authority, dependency matrix, compatibility boundaries, static deployment rationale, supported direct usage, Moment lifecycle risk, trigger-driven change policy, characterization-test policy, audit snapshot provenance, official references, and minimal root Agent guidance.

**Placeholder scan:** No `TBD`, `TODO`, “implement later”, undefined implementation steps, or unspecified testing steps remain.

**Type/interface consistency:** No runtime code interfaces are introduced. The only cross-task interface is the canonical documentation path `docs/architecture/csm-runtime-dependency-boundaries.md`, used consistently by Tasks 1–4.

**Scope check:** This is one subsystem—documentation of CSM runtime dependency boundaries. No independent runtime/refactor subsystem is included.

---

Plan complete. Save it to:

`docs/superpowers/plans/2026-09-18-csm-runtime-dependency-boundaries.md`

Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task with review between tasks.

**2. Inline Execution** — execute the plan in batches using `superpowers:executing-plans` with checkpoints.
