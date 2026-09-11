# Target Authentication and API Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add target-owned runtime, internal-session, authenticated API, and file URL boundaries for the first Nuxt route without migrating that route yet.

**Architecture:** Pure TypeScript factories own legacy compatibility details and accept browser dependencies through narrow interfaces so behavior is unit-testable. A client-only Nuxt plugin composes those factories from public runtime config, while composables expose only target-safe interfaces to future pages.

**Tech Stack:** Nuxt 4.5.2, Vue 3.5, TypeScript, native Fetch API, Vitest.

## Global Constraints

- Keep `/page/**` owned by the legacy Vue 2/Webpack application and `/csm-next/**` owned by Nuxt.
- Keep the target SPA-only with `ssr: false` and generated artifacts under `Nuxt/.output/public/**`.
- Implement internal authentication only; preserve explicit `internal`, `customer`, and `local` scope types.
- Do not add SSO, backend changes, a UI framework, or direct target-page dependencies on `$xt`, legacy globals, token storage keys, or auth-header construction.
- Treat backend token lifecycle and production IIS/security approval as production-cutover blockers, not development blockers.

---

### Task 1: Internal Session Adapter

**Files:**
- Modify: `Nuxt/package.json`
- Modify: `Nuxt/package-lock.json`
- Create: `Nuxt/test/session-adapter.test.ts`
- Create: `Nuxt/app/services/session/session-adapter.ts`

**Interfaces:**
- Produces: `SessionAdapter.getContext(): SessionContext`, `SessionAdapter.redirectToLogin(): void`, and an infrastructure-only `InternalCredentialProvider.getCredential(): string | null`.

- [x] **Step 1: Add Vitest as the unit-test runner and add `npm test` / `npm run test:watch` scripts.**
- [x] **Step 2: Write tests for present/missing credentials, safe session context, and login redirection.**
- [x] **Step 3: Run `npm test -- test/session-adapter.test.ts` and confirm failure because the adapter module is absent.**
- [x] **Step 4: Implement the minimal dependency-injected browser session factory.**
- [x] **Step 5: Rerun the focused test and confirm all session cases pass.**

### Task 2: Normalized API and File Boundaries

**Files:**
- Create: `Nuxt/test/api-client.test.ts`
- Create: `Nuxt/test/file-capability.test.ts`
- Create: `Nuxt/app/services/http/api-client.ts`
- Create: `Nuxt/app/services/files/file-capability.ts`

**Interfaces:**
- Consumes: `InternalCredentialProvider.getCredential()` and `SessionAdapter.redirectToLogin()`.
- Produces: `ApiClient.get<T>(path): Promise<ApiResult<T>>` and `FileCapability.openUrl(id, options?): string`.

- [x] **Step 1: Write API tests for header construction, missing credentials, successful legacy envelope normalization, API-declared errors, invalid credentials, malformed responses, and network failures.**
- [x] **Step 2: Write file capability tests for encoded IDs, download mode, and configured host/base fallback.**
- [x] **Step 3: Run the focused tests and confirm they fail because the modules are absent.**
- [x] **Step 4: Implement the minimum GET-only client and URL builder required by the first route.**
- [x] **Step 5: Rerun focused tests and confirm they pass.**

### Task 3: Nuxt Composition Boundary

**Files:**
- Modify: `Nuxt/nuxt.config.ts`
- Modify: `Nuxt/.env.example`
- Modify: `Nuxt/app/composables/useTargetRuntimeConfig.ts`
- Create: `Nuxt/app/plugins/target-services.client.ts`
- Create: `Nuxt/app/composables/useSessionAdapter.ts`
- Create: `Nuxt/app/composables/useApiClient.ts`
- Create: `Nuxt/app/composables/useFileCapability.ts`

**Interfaces:**
- Consumes: public `apiBaseUrl`, `fileHost`, and `loginPath` runtime settings.
- Produces: Nuxt-injected target services whose composables do not expose credential storage or header construction.

- [x] **Step 1: Add the browser-safe login path to runtime config and its example environment file.**
- [x] **Step 2: Compose the browser storage/location/fetch dependencies in one client-only plugin.**
- [x] **Step 3: Add narrow composables for the session, API, and file capabilities.**
- [x] **Step 4: Run the complete unit suite and fix type/integration failures with the smallest changes.**

### Task 4: Verification and Publication

**Files:**
- Verify only: `Nuxt/.output/public/**`, Git diff, and GitHub metadata.

- [x] **Step 1: Run `npm test`, `npm audit`, `npm run build`, and `npm run generate`.**
- [x] **Step 2: Inspect generated asset paths and scan target source/dependencies for forbidden legacy globals and SSO packages.**
- [x] **Step 3: Run `git diff --check` and inspect the complete incremental diff against `migration/nuxt-4-shell`.**
- [x] **Step 4: Self-review the implementation against Issue #3 and repair any important findings.**
- [ ] **Step 5: Explicitly stage scoped files, inspect the staged diff, commit, push, and open a stacked PR based on `migration/nuxt-4-shell`.**
