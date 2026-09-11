# Vue 2 to Nuxt Migration Boundary Discovery Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce an evidence-backed design for the first Vue 2 to Nuxt migration boundary without changing application code, dependencies, build configuration, or governance files.

**Architecture:** Treat the existing Vue 2/Webpack application as a legacy runtime that must continue to work while a future Nuxt/Vite surface is introduced behind an explicit boundary. Trace the current document host, bootstrap globals, router, Vuex store, service client, assets, and deployment assumptions before proposing ownership or coexistence decisions. Keep unresolved Nuxt, Vite, host, and rollout choices visible rather than inventing them.

**Tech Stack:** Vue 2.6.14, Vue Router 3.6.5, Vuex 3.6.2, Webpack 5, ASP.NET-rendered `Default.aspx`, IIS-hosted legacy frontend, and a future Nuxt.js/Vite target whose major version and deployment mode are not established.

**Spec:** Current user request in this conversation: use the existing governance to begin a read-only “สำรวจและออกแบบ migration boundary ของ Vue 2 → Nuxt” phase.

## Global Constraints

- Do not modify application code, `Website/AGENTS.md`, `Website/CLAUDE.md`, the root `AGENTS.md`, package manifests, lockfiles, database files, Docker files, or IIS configuration.
- Do not install dependencies, upgrade packages, run `npm install`, or run the legacy `npm` build/dev commands; the nested Website governance requires those commands to be explicitly requested.
- Preserve the target direction: Vue 2 → Nuxt.js and Webpack 5 → Vite; do not choose a Nuxt major version or silently redefine the migration boundary.
- Preserve current behavior as the baseline: routing, authentication, authorization, API envelopes, validation, loading/error states, menu visibility, localization, responsive behavior, realtime integrations, asset paths, and browser history behavior.
- Treat `Default.aspx`, `main.js`, `routes.js`, route fragments, `store.js`, `package.json`, and active Webpack configs as evidence, not as permission to rewrite them.
- Record uncertain decisions with the exact marker `OPEN MIGRATION QUESTION:` in the design document.
- Do not commit, push, create a PR, reset, clean, or revert user changes.
- Respect the existing working tree. The pre-existing change to `Website/AGENTS.md` and the existing untracked root `AGENTS.md` are outside this phase’s write scope.

## File Map

Read-only inputs:

- `AGENTS.md` — repository governance, migration requirements, and routing rules.
- `Website/AGENTS.md` — Website-specific legacy compatibility and operational rules.
- `Website/CLAUDE.md` — local instruction routing and project context.
- `Website/package.json` — current scripts and Vue/Webpack dependency contract.
- `Website/Scripts/App/Application/main.js` — current Vue bootstrap, global plugins, router/store wiring, and mount behavior.
- `Website/Scripts/App/Application/routes.js` and `Website/Scripts/App/Application/Routes/*.js` — current route composition and route ownership evidence.
- `Website/Scripts/App/Application/Store/store.js` — current Vuex state, actions, getters, mutations, and service-client coupling.
- `Website/Page/Default.aspx` — ASP.NET-rendered host document, runtime globals, static assets, and bundle loading contract.
- `Website/webpack.common.js`, `Website/webpack.dev.config.js`, and `Website/webpack.prod.config.js` — active legacy build entry/output and asset behavior.

Create only:

- `docs/migrations/vue2-to-nuxt-boundary.md` — the evidence-backed discovery and boundary design record produced by this phase.

Do not create a Nuxt app, Vite config, adapter, proxy, route, component, test fixture, package manifest, or deployment file in this phase.

---

### Task 1: Capture the repository baseline and instruction scope

**Files:**
- Read: `AGENTS.md`, `Website/AGENTS.md`, `Website/CLAUDE.md`
- Read: `Website/package.json`
- Create later: `docs/migrations/vue2-to-nuxt-boundary.md`

**Interfaces:**
- Consumes: current working tree and the repository governance hierarchy.
- Produces: a baseline section with the exact current status, applicable instructions, and a list of read-only evidence files.

- [ ] **Step 1: Record working-tree state**

Run from the repository root:

```powershell
git status --short --branch
```

Expected: the known pre-existing `M Website/AGENTS.md` and untracked root `AGENTS.md` remain visible; do not alter either state.

- [ ] **Step 2: Read applicable governance completely**

Read the three governance files and extract only rules that affect this discovery:

```powershell
Get-Content -Raw AGENTS.md
Get-Content -Raw Website/AGENTS.md
Get-Content -Raw Website/CLAUDE.md
```

Expected: the design record distinguishes repository migration policy from Website implementation details and does not duplicate the Website manual into the root governance file.

- [ ] **Step 3: Record current package/build evidence**

Read `Website/package.json` and note the actual scripts and versions without changing them. Record that the current scripts invoke Webpack and that Vue 2, Vue Router 3, and Vuex 3 are present.

- [ ] **Step 4: Define the read-only boundary**

Add a short scope statement to the design record: this phase creates documentation only, leaves the legacy runtime untouched, and does not make a Nuxt/Vite architectural decision that the repository has not established.

### Task 2: Trace the current bootstrap, host, and build boundary

**Files:**
- Read: `Website/Scripts/App/Application/main.js`
- Read: `Website/Page/Default.aspx`
- Read: `Website/webpack.common.js`
- Read: `Website/webpack.dev.config.js`
- Read: `Website/webpack.prod.config.js`
- Modify: `docs/migrations/vue2-to-nuxt-boundary.md`

**Interfaces:**
- Consumes: baseline scope from Task 1.
- Produces: a runtime graph and a host/build contract that later tasks can use without guessing.

- [ ] **Step 1: Trace the browser-to-Vue bootstrap**

Use targeted searches and then read the surrounding code:

```powershell
rg -n "new Vue|VueRouter|VueCompositionAPI|Vue\.prototype|\$mount|router|store" Website/Scripts/App/Application/main.js
rg -n "id=\"app\"|Application\.js|window\.|baseUrl|basePath|baseRoute|dataServer|auth|signalR" Website/Page/Default.aspx
```

Record the observed sequence: the ASP.NET page emits runtime values, creates the `#app` mount point, loads legacy browser globals and the generated bundle, and `main.js` creates the Vue application. Use exact observations from the files.

- [ ] **Step 2: Trace the bundle entry and output contract**

Read the active Webpack configs and record:

- entry discovery under `Scripts/App/*/main.js`;
- output directory and filename pattern;
- public path and chunk behavior;
- Vue loader, Babel, CSS/Sass, asset, and environment handling that affects a future boundary;
- which config is selected by each package script.

Do not translate any of these settings into Vite configuration yet.

- [ ] **Step 3: Document host/build dependencies**

Create a table with columns `Contract`, `Current owner`, `Observed behavior`, `Migration risk`, and `Evidence file`. Include the mount element, base URLs, runtime globals, bundle URL, static assets, history/base path, and cache-busting/version values only when present in source.

- [ ] **Step 4: Draw the current runtime graph in Markdown**

Add a compact flow such as:

```text
ASP.NET Default.aspx -> window runtime contract + #app
                   -> legacy scripts/globals
                   -> Webpack Application.js
                   -> Vue 2 main.js -> Vue Router + Vuex -> page components/services
```

Adjust the labels to match evidence; do not claim Nuxt or Vite already exists.

### Task 3: Trace routes, state, and service contracts

**Files:**
- Read: `Website/Scripts/App/Application/routes.js`
- Read: `Website/Scripts/App/Application/Routes/*.js`
- Read: `Website/Scripts/App/Application/Store/store.js`
- Read: relevant `Website/Scripts/App/Application/Components/**/*.vue` files identified by route or bootstrap references
- Modify: `docs/migrations/vue2-to-nuxt-boundary.md`

**Interfaces:**
- Consumes: runtime graph and host contract from Task 2.
- Produces: route/state/service ownership tables and a parity inventory for a future Nuxt boundary.

- [ ] **Step 1: Build a route ownership inventory**

Use the route composition files to record route family, path/name, component owner, auth/meta guards, redirect behavior, and whether the route depends on a legacy host global. Prefer a summarized inventory over copying every route implementation into the design document.

```powershell
rg -n "path:|name:|component:|redirect:|meta:|beforeEnter|beforeEach" Website/Scripts/App/Application/routes.js Website/Scripts/App/Application/Routes
```

- [ ] **Step 2: Trace global navigation and authorization behavior**

Read the router guard and related bootstrap code. Record how authentication, authorization, user/company context, login redirects, denied access, base URLs, and browser navigation are currently enforced. Mark any behavior that requires an adapter or host decision instead of assuming Nuxt middleware is a drop-in replacement.

- [ ] **Step 3: Trace Vuex ownership and side effects**

Inventory the Vuex state, actions, mutations, getters, initialization timing, and consumers. Mark actions that call `$xt`, read `window.auth`, call alert/notification globals, or transform API data. Preserve these as behavioral contracts; do not redesign them during discovery.

```powershell
rg -n "state:|actions:|mutations:|getters:|\$xt\.|window\.|\$msg|dispatch\(|mapState|mapGetters|mapActions" Website/Scripts/App/Application/Store/store.js Website/Scripts/App/Application
```

- [ ] **Step 4: Build the legacy-to-target contract table**

Add columns `Legacy contract`, `Consumers`, `Candidate target owner`, `Compatibility adapter needed`, `Parity evidence`, and `Decision status`. Candidate target owners must be labels such as “Nuxt route layer”, “Nuxt state layer”, “shared service adapter”, or “host integration”; do not choose a library or Nuxt major version without evidence.

### Task 4: Define and compare migration-boundary options

**Files:**
- Read: all evidence collected in Tasks 1–3
- Modify: `docs/migrations/vue2-to-nuxt-boundary.md`

**Interfaces:**
- Consumes: current runtime graph, route inventory, and legacy contracts.
- Produces: an explicit boundary proposal, rejected alternatives, and visible open questions for implementation planning.

- [ ] **Step 1: Compare coexistence models**

Evaluate these models against the observed host contract without implementing any of them:

1. Keep the ASP.NET page as the host while a Nuxt surface owns an explicit route or mount boundary.
2. Introduce a separate Nuxt entry/application boundary while the legacy Vue bundle continues to own its current routes.
3. Replace the host document only after a parity gate proves the required runtime contract is available.

For each model, record URL ownership, navigation between stacks, auth/bootstrap ownership, asset/base-path behavior, rollback path, and the condition that would make the model unsafe.

- [ ] **Step 2: Define the minimum boundary contract**

Specify the interfaces a future implementation must settle before code changes:

- document and URL ownership;
- authentication and authorization context;
- API client and response-envelope compatibility;
- shared configuration and environment values;
- route transition and error handling;
- state ownership and synchronization;
- realtime/event integration;
- static asset and public-path behavior;
- observability, rollout, and rollback.

Keep each item tied to an evidence file or mark it as an open question.

- [ ] **Step 3: Select a candidate first slice without implementing it**

Use a scorecard with `route isolation`, `auth complexity`, `Vuex coupling`, `global dependency count`, `asset coupling`, `business criticality`, and `rollback simplicity`. Identify the best-supported candidate only if the route evidence supports it; otherwise state `OPEN MIGRATION QUESTION:` and explain what evidence is missing. Do not invent a page or claim a route is safe merely because it compiles.

- [ ] **Step 4: Define parity and retirement gates**

State that the legacy route or host cannot be removed until functional, authorization, API, persistence-facing, visual/responsive, localization, realtime, and error/loading parity are verified for the migrated surface. Define rollback as returning ownership to the unchanged legacy route/host boundary.

### Task 5: Write the migration-boundary design record

**Files:**
- Create: `docs/migrations/vue2-to-nuxt-boundary.md`

**Interfaces:**
- Consumes: all evidence and decisions from Tasks 1–4.
- Produces: the single reviewable, implementation-independent design record for the next migration phase.

- [ ] **Step 1: Write the document structure**

Use these sections in this order:

```markdown
# Vue 2 to Nuxt Migration Boundary
## Status and Scope
## Repository Evidence
## Current Runtime Graph
## Host, Build, and Runtime Contracts
## Route, State, and Service Ownership
## Boundary Options
## Proposed First Boundary
## Behavioral Parity and Rollback Gates
## Open Migration Questions
## Explicitly Out of Scope
```

- [ ] **Step 2: Separate facts, proposals, and unknowns**

Label statements as `Observed`, `Proposed`, or `OPEN MIGRATION QUESTION:`. Do not present a candidate Nuxt major version, SSR/SPA mode, Vite ownership model, Docker topology, API architecture, or state library as decided.

- [ ] **Step 3: Include implementation handoff criteria**

End the document with the concrete evidence required before application changes begin: approved route/host ownership, approved runtime-global adapter contract, service/API parity mapping, selected state ownership, build/deployment boundary, test matrix, rollout switch, and rollback procedure.

### Task 6: Perform read-only validation and handoff

**Files:**
- Read: `docs/migrations/vue2-to-nuxt-boundary.md`
- Read: Git status and diff metadata
- Do not modify: application files, governance files, package files, or deployment files

**Interfaces:**
- Consumes: completed design record.
- Produces: verified documentation-only change and a concise handoff report.

- [ ] **Step 1: Re-read the written document**

Run:

```powershell
Get-Content -Raw docs/migrations/vue2-to-nuxt-boundary.md
```

Confirm the document contains the observed runtime graph, host/build contract, route/state/service inventory, boundary comparison, parity gates, and open questions.

- [ ] **Step 2: Run structural checks**

Run:

```powershell
rg -n "^#|^##|OPEN MIGRATION QUESTION:|Default\.aspx|main\.js|routes\.js|store\.js|Webpack|Nuxt|Vite|Vuex|#app" docs/migrations/vue2-to-nuxt-boundary.md
git diff --check
```

Expected: all required sections and evidence anchors are present; `git diff --check` reports no whitespace errors.

- [ ] **Step 3: Verify application immutability**

Run:

```powershell
git status --short
$applicationChanges = @(git status --short | Where-Object {
  $_ -match 'Website/(Scripts|Page|package\.json|webpack\.common\.js|webpack\.dev\.config\.js|webpack\.prod\.config\.js|CLAUDE\.md|AGENTS\.md)'
})
if ($applicationChanges.Count -eq 0) { 'application_and_website_governance_changes=PASS' } else { $applicationChanges; exit 1 }
$phaseArtifact = 'docs/superpowers/plans/2026-09-11-vue2-to-nuxt-boundary-discovery.md'
if (Test-Path $phaseArtifact) { "phase_plan_present=$phaseArtifact" } else { 'phase_plan_present=FAIL'; exit 1 }
```

Expected: no application or Website governance file was changed by this phase. The plan file is present as the phase artifact; pre-existing user changes, including the root `AGENTS.md`, remain clearly distinguishable.

- [ ] **Step 4: Report unresolved decisions accurately**

Report the actual status as “design discovery complete with open migration questions” unless every boundary decision is supported by repository evidence and an explicit project decision. Do not report implementation readiness or parity as complete.

## Completion Criteria

- The design record is based on current files, not a previous report.
- The current Vue 2/Webpack/ASP.NET host contract is explicit.
- Nuxt/Vite ownership is proposed only where evidence supports it; otherwise the uncertainty is visible.
- No application code, dependency, build, hosting, database, or governance file was modified.
- Parity, rollback, and legacy-retirement conditions are defined before any future implementation work.
- The final handoff lists the exact open decisions needed before the first code migration.
