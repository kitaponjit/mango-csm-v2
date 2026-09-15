# AGENTS.md

## Purpose

This file governs the whole repository. It contains repository-wide safety rules, migration policy, architecture boundaries, and routing to narrower guidance. It is not the implementation manual for the legacy Website.

The required migration direction is:

| Domain | Legacy | Target |
| --- | --- | --- |
| Frontend | Vue 2 | Nuxt.js |
| Bundler | Webpack 5 | Vite |
| Backend / host | ASP.NET Framework 4.8 + IIS | .NET 8 + IIS + Docker (`MangoServiceNetCore`) |
| Relational persistence | SQL Server | SQLite |
| Document persistence | No established implementation | MongoDB |

Treat these targets as project requirements. Do not silently replace them or invent missing architectural decisions.

## Instruction Scope and Governance Routing

- Explicit user and task instructions have highest priority.
- This root file applies repository-wide to migration, safety, architecture boundaries, and validation.
- `Website/AGENTS.md` governs detailed legacy Vue 2, Webpack, ASP.NET host, API, routing, component, and Website workflow behavior.
- `Website/CLAUDE.md` directs agents to `Website/AGENTS.md`; it is not a second implementation manual.
- `Website/.claude/skills/` contains narrow workflow/domain guidance. Apply it when its trigger scope matches the task.
- Verified backend contracts, ownership, and navigation recipes live in `docs/backend/contract-navigation-knowledge.md`. Read it before traversing the backend.
- How to wire `frontend/` to the .NET 8 backend — path base, CORS, the header-token auth model, SignalR, the `vendor/` asset rule, and a failure-mode table — lives in `docs/integration/frontend-backend-connection.md`. Read it before changing anything that crosses the frontend/backend boundary.
- UI/style consistency evidence lives in `docs/migrations/future-ui-consistency.md` (baseline + UI-1..UI-5) and `docs/ui-consistency/layout-inventory.md` (exhaustive page inventory).
- Legacy rules preserve compatibility where needed, but do not authorize expanding legacy architecture or overriding the migration target.
- Use the narrowest useful governance scope. Do not duplicate Website implementation detail in this file.

## Migration Mission

- Build new or migrated functionality against the target architecture established for that boundary.
- Do not add new Vue 2, Webpack, ASP.NET Framework 4.8, or SQL Server dependencies unless compatibility or an explicit user requirement requires them.
- Prefer small, reviewable migration boundaries over broad modernization rewrites.
- Use explicit adapters when legacy and target components must interoperate.
- Preserve business behavior, API contracts, authorization, validation, user-visible behavior, persistence semantics, and deployment behavior.
- Understand why legacy behavior exists before replacing it.
- Do not remove legacy functionality until its replacement exists and relevant parity has been verified.

## Architecture States

Use these labels independently for each migration domain:

- `LEGACY`: current implementation is the old stack.
- `TRANSITIONAL`: old and target implementations coexist under an explicit boundary.
- `TARGET`: the target implementation is established and should guide new work.
- `UNKNOWN`: repository evidence is insufficient; do not infer the design.

Current checkout evidence:

| Domain | State | Evidence / rule |
| --- | --- | --- |
| Vue 2 → Nuxt.js | `TRANSITIONAL` | `Website/` retains the Vue 2 runtime. `frontend/` is the target Nuxt 4 SPA: a full port of all 218 components and 111 routes, builds clean, and runs against the .NET 8 backend (dev decision 2026-09-15). `Nuxt/` is the superseded first-slice scaffold. |
| Webpack 5 → Vite | `TRANSITIONAL` | Legacy Website scripts still use Webpack; the `frontend/` target uses Nuxt's Vite build and separate output ownership. |
| ASP.NET Framework 4.8 → .NET 8 | `TRANSITIONAL` | Legacy backend remains on Framework/IIS; the dev-confirmed target backend repo `MangoServiceNetCore` (.NET 8; local path is per-machine — `D:\Migrate\MangoServiceNetCore` on the 2026-09-15 dev machine) now exists outside this checkout with all frontend-facing contracts ported and parity-tested (repo scout 2026-09-12). Cutover/topology not yet decided; do not rewrite Framework code incidentally. |
| IIS-only → IIS + Docker | `LEGACY` | IIS configuration exists and Docker topology is not established; do not assume Docker replaces or embeds IIS. |
| SQL Server → SQLite | `UNKNOWN` | Backend/data-access code is not in this checkout; determine ownership and relational semantics before selecting SQLite. A read-only survey of the separate backend found EF6 data access alongside extensive interpolated raw SQL in CSM scope (e.g. `SqlFetch2` in `Areas/CSM/Controllers/CenterController.cs`, `APIController.cs:221`); the ownership decision is still required. |
| MongoDB introduction | `UNKNOWN` | No MongoDB implementation is evidenced; do not assign data to MongoDB without an explicit ownership decision. Append-only logs/chat are the only fit candidate identified; still requires an explicit decision. |

## Repository Boundaries

- `Website/` is the current legacy frontend and ASP.NET host.
- `frontend/` is the target Nuxt 4 SPA boundary (dev decision 2026-09-15). It is a full port of the Website application — all 218 components, 111 routes — served at the site root and emitting artifacts under `frontend/.output/public/**`.
- `Nuxt/` is the superseded first-slice scaffold (6 components, 2 routes, `/csm-next/**`). Do not build new UI there; it is retained only as history until explicitly removed.
- Detailed Website implementation rules, including legacy API/auth, routing, Vuex, naming, responsive twins, grids, and Webpack operation, belong in `Website/AGENTS.md`.
- The legacy host injects runtime configuration and globals consumed by the Vue application. Preserve that host contract until its boundary is explicitly migrated.
- The backend/API service is maintained separately from this checkout. Locate the actual repository and read its governance before making backend changes; historical paths in Website documentation are not portable facts. The backend folder path differs per dev machine — ask the dev for their local path and verify it per `Website/AGENTS.md` §11; never assume a documented path.
- Do not invent backend endpoints, database schemas, deployment topology, or target-stack files when the owning repository or target configuration is absent.
- The frontend target boundary is established for the first slice only. Do not treat that as evidence that the backend, hosting, or persistence targets are implemented.

## Engineering Rules

- Inspect `git status` before editing and preserve existing user changes.
- Make the smallest change that satisfies the task and keep migration boundaries reviewable.
- Do not use destructive reset, checkout, restore, clean, or broad deletion commands.
- Do not modify unrelated files, generated output, dependencies, schemas, deployment files, or governance files outside the requested scope.
- Do not install packages or change lockfiles unless explicitly requested.
- Do not commit, push, or create a pull request unless explicitly requested.
- Do not read third-party trees such as `node_modules/` when manifests or targeted project files are sufficient.
- Match repository formatting and preserve existing comments unless the task requires otherwise.
- Do not claim a build, test, parity check, or manual verification that was not actually performed.
- Do not push directly to `main` — use topic branches with pull-request review and merge; delete branches after they are merged.
- Review knowledge and governance PRs on two axes (design compliance + factual accuracy) before merge — single-axis review missed blocking errors.

## Legacy Compatibility Policy

- Preserve current API, routing, authorization, menu-right, i18n, host, cache-busting, SignalR, and user-visible contracts at legacy/target boundaries.
- For Website implementation details, follow `Website/AGENTS.md` rather than reproducing its rules here.
- Do not couple target code directly to legacy globals, host-page internals, Vuex 3, Vue Router 3, or persistence details without an intentional adapter boundary.
- Do not expand legacy architecture merely because an existing pattern is convenient.
- Preserve legacy build and runtime behavior until the replacement is available and parity has been verified.

### Target Authentication Constraint

- The target frontend must not introduce a new SSO dependency.
- Preserve existing authentication and token behavior through explicit session and API contracts until the backend authentication source is verified.
- Do not classify OAuth- or token-related integrations as SSO without concrete evidence.

## Frontend Migration: Nuxt 4 + Vite

- The established target is the `frontend/` Nuxt 4 SPA with `ssr: false`, a configurable base URL (`NUXT_APP_BASE_URL`, default `/`), and static generation through Vite.
- It reaches the backend through `frontend/public/config.js` (`window.dataServer`), a per-deployment file that is never bundled. That value must include the backend path base (`/service/` by default; see `MANGO_PATH_BASE`) and must match `Website/Web.config`'s `dataServer` key.
- Vendor assets in `frontend/public/` must be referenced from the app base URL, never relatively — a relative URL resolves against the current route and 404s on any nested route.
- Do not introduce a different Nuxt application, router model, state library, or coexistence mechanism without a new architecture decision.
- New migrated UI must use the established Nuxt structure and lifecycle, not Vue 2 bootstrap or host-page mounting patterns.
- Do not create an ad hoc second Nuxt application inside `Website/` without an explicit boundary and ownership decision.
- When translating Webpack to Vite, preserve public paths, history fallback, aliases, environment semantics, asset URLs, code splitting, source-map needs, and deployment output.
- Do not add Webpack-only loaders, plugins, environment handling, or `require()` assumptions to migrated code.
- Keep legacy Webpack files while they have consumers; remove them only after Vite replacement and parity checks are complete.
- Preserve current routing, authorization, i18n, API, and responsive behavior; use `Website/AGENTS.md` for implementation rules.

## Backend and Hosting Migration

- The stated backend target is .NET 8 (dev-confirmed `MangoServiceNetCore`) with both IIS and Docker in the deployment direction.
- In an established .NET 8 boundary, use its hosting model, dependency injection, middleware, configuration providers, and environment configuration.
- Do not introduce new `System.Web`, `HttpApplication`, `Global.asax`, Framework-only packages, Web Forms/MVC host assumptions, or machine-local state into migrated code.
- Do not rewrite unrelated Framework code solely because it is legacy.
- Do not assume whether IIS runs inside Docker, beside Docker, or as a separate deployment stage. Do not add images, compose files, ports, health checks, reverse proxies, or secret mechanisms by guesswork.
- Prefer reproducible startup and environment-driven configuration. Preserve API/auth behavior, static asset routing, history fallback, compression, cache-busting, SignalR, and reverse-proxy behavior when the host boundary moves.

## Data Migration

- The frontend must not access SQL Server, SQLite, or MongoDB directly; persistence belongs behind an API/service boundary.
- Treat SQL Server → SQLite + MongoDB as a data-model and behavior migration, not a mechanical schema translation.
- Do not assume every SQL Server table maps to SQLite or every database domain maps to MongoDB.
- Select SQLite only when evidence requires relational integrity, transactions, constraints, or relational queries.
- Select MongoDB only when evidence and an explicit decision support document-oriented, nested, variable-schema, or aggregate-centric data.
- Preserve or intentionally redesign stored procedures, views, triggers, functions, identity/computed behavior, provider-specific types, raw SQL, locking, isolation, temporary tables, table-valued parameters, and transaction boundaries.
- Trace ownership, access patterns, consistency, retention, migration/backfill, rollback, and cross-store behavior before changing persistence.
- Do not change database schemas or data-access code from this frontend-only checkout.

## Configuration and Secrets

- Prefer portable, environment-driven configuration across local development, IIS, and Docker.
- Do not commit credentials, tokens, private keys, secret-bearing connection strings, or machine-specific paths.
- Keep browser-visible build configuration separate from server-only secrets.
- Use configuration providers established by the target project; do not invent a topology or secret mechanism.
- Document required variables with safe example values when introducing configuration.

## Validation and Parity

- Choose validation from the actual project scripts and configuration. Do not run a target build or test that is not present.
- Compilation alone is insufficient for migration validation. Check relevant business rules, API contracts, authorization, validation, i18n, navigation, persistence semantics, integration behavior, and deployment behavior.
- Follow `Website/AGENTS.md` for legacy Website build and browser-validation rules.
- For governance-only changes, reread the edited file, inspect the final diff, run `git diff --check`, and confirm no unrelated file changed.
- State skipped validation explicitly. Evidence must precede completion claims.
- Unit or component test success (e.g. Vitest) is not integration or UAT evidence. Production authorization additionally requires real-environment evidence plus owner sign-off.

## Change Safety

- Separate pre-existing working-tree changes from task changes.
- Do not remove or simplify behavior without evidence of its replacement and retirement criteria.
- Do not modify nested governance files merely to duplicate root migration policy.
- If a nested rule is materially wrong, record the conflict and request a scoped governance change unless the current task explicitly authorizes that nested edit.
- When uncertainty materially blocks the current task, report `OPEN MIGRATION QUESTION:` in the task result. Persist it in governance only when governance/documentation is part of the task or a designated decision log exists.
- When a reference target is missing, annotate the gap instead of silently deleting the reference. Re-verify delegated findings against source before relying on them for blocking decisions.

## Open Migration Questions

The current checkout leaves these decisions unresolved:

- Target state ownership and shared-context policy for routes beyond the first slice. Recommended direction: one slice per route, Master-first; shared primitives centrally gated.
- Vite/target artifact deployment automation and the retirement criteria for Webpack. Recommended direction: per-route strangler; the dead `Website/webpack.config.js` has been removed.
- Owning .NET 8 backend project: located and dev-confirmed — `MangoServiceNetCore` (`C:\Users\COM\Projects\MANGOdotNETMigration Proj\MangoServiceNetCore`, .NET 8, Docker default per compose). Remaining question: cutover plan and final IIS/Docker topology; requires a topology sheet from the backend/platform owner.
- SQLite/MongoDB ownership, SQL Server feature mapping, cross-store consistency, migration, and rollback. Recommended direction: SQLite-first (configs, then tickets, then reproduced sessions); MongoDB only for append-only logs/chat with explicit sign-off.
- Legacy endpoint/host retirement criteria after behavioral parity is demonstrated. Recommended direction: per-route checklist plus approvals; retireable today: nothing.

Report an unresolved item as `OPEN MIGRATION QUESTION:` only when it materially blocks the current task; do not invent an architectural answer.

## Definition of Done

A change is complete only when:

1. The applicable legacy/target boundary is identified from repository evidence.
2. The smallest appropriate change is made without expanding legacy debt.
3. Relevant business, API, authorization, UI, persistence, and deployment behavior is preserved or intentionally redesigned.
4. Applicable validation is run and its result is known; skipped validation is stated.
5. Generated files, configuration, secrets, and user changes are handled safely.
6. Unresolved architecture choices are reported rather than guessed.

## Quick Reference

```text
Legacy Website governance : Website/AGENTS.md
Legacy frontend           : Website/
Legacy host               : Website/Page/Default.aspx
Target frontend           : frontend/ (Nuxt 4 SPA, Vite, full port, dev on :3000)
Superseded scaffold       : Nuxt/ (first-slice only, /csm-next/**)
Backend                   : MangoServiceNetCore (.NET 8), separate repo; dev on http://localhost:5075/service/
Backend contracts         : docs/backend/contract-navigation-knowledge.md
Frontend<->backend wiring : docs/integration/frontend-backend-connection.md
UI consistency evidence   : docs/migrations/future-ui-consistency.md + docs/ui-consistency/layout-inventory.md
Target direction          : Nuxt + Vite + .NET 8 (MangoServiceNetCore) + IIS/Docker + SQLite/MongoDB
```
