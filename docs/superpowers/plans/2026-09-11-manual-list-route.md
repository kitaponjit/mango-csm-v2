# Manual List Route Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the internal, read-only `/csm-next/manual/` route with behavioral parity to `v_csm_manual_list` while leaving the legacy route untouched.

**Architecture:** Pure manual-domain functions own defaults, date formatting, totals, filtering, image detection, and keyboard tab movement. A manual service owns the three legacy endpoint contracts through `ApiClient`; a small localization adapter owns route labels and legacy language storage; the page composes these boundaries with the existing SessionAdapter, FileCapability, feedback state, dialog, and semantic CSS.

**Tech Stack:** Nuxt 4.5.2, Vue 3.5, TypeScript, native HTML date controls/dialog/table, Vitest, Vue Test Utils, happy-dom.

## Global Constraints

- Preserve `/page/manual/v_csm_manual_list/` and all Website source unchanged.
- Add only the read-oriented `/csm-next/manual/` route; do not add backend writes or change endpoints.
- Preserve `ManualReadList`, `ManualReadListV2`, and `ReadPicture` parameters and URL-encode all values.
- Do not expose `$xt`, `$msg`, `$linq`, Vuex 3, legacy globals/components, token keys, or auth-header construction to the page.
- Preserve internal auth, current-month date defaults, revision modes, all module tabs/totals, table meanings, attachments, localization fallbacks, and usable narrow-screen behavior.

---

### Task 1: Manual Domain Model

**Files:**
- Create: `Nuxt/test/manual/manual-model.test.ts`
- Create: `Nuxt/app/features/manual/manual-model.ts`

- [ ] **Step 1: Write tests for local-date defaults, `DD/MM/YYYY` API/display formatting, all module tabs and totals, module filtering, cyclic tab keyboard movement, and image-extension detection.**
- [ ] **Step 2: Run the focused test and confirm failure because the model is absent.**
- [ ] **Step 3: Implement the minimal pure functions and route types.**
- [ ] **Step 4: Rerun the focused test and confirm it passes.**

### Task 2: Manual API Service

**Files:**
- Create: `Nuxt/test/manual/manual-service.test.ts`
- Create: `Nuxt/app/features/manual/manual-service.ts`

- [ ] **Step 1: Write tests for date-search, revision-search, and attachment URLs plus normalized success/error propagation.**
- [ ] **Step 2: Run the focused test and confirm failure because the service is absent.**
- [ ] **Step 3: Implement the GET-only service over the existing `ApiClient` interface.**
- [ ] **Step 4: Rerun the focused test and confirm it passes.**

### Task 3: Localization Boundary

**Files:**
- Create: `Nuxt/test/localization/localization-adapter.test.ts`
- Create: `Nuxt/app/services/localization/localization-adapter.ts`
- Create: `Nuxt/app/composables/useLocalizationAdapter.ts`
- Modify: `Nuxt/app/plugins/target-services.client.ts`
- Modify: `Nuxt/app/components/ui/TargetDialog.vue`
- Modify: `Nuxt/test/ui/target-dialog.test.ts`

- [ ] **Step 1: Write tests for Thai default, English selection, unknown-language fallback, and localized dialog close labels.**
- [ ] **Step 2: Run focused tests and confirm the missing boundary/prop failures.**
- [ ] **Step 3: Implement the storage-safe dictionary adapter, inject it through target services, and add an optional dialog close label.**
- [ ] **Step 4: Rerun focused tests and confirm they pass.**

### Task 4: Nuxt Manual Page

**Files:**
- Create: `Nuxt/app/pages/manual/index.vue`

- [ ] **Step 1: Build the auth-gated date/revision forms, module tab list, results table, loading/empty/error states, and retry behavior from target boundaries.**
- [ ] **Step 2: Add attachment loading/empty/error handling, image/file presentation, open/download actions, and localized dialog labeling.**
- [ ] **Step 3: Add arrow/Home/End keyboard tab behavior and scoped responsive layout without desktop/mobile duplication.**
- [ ] **Step 4: Run the complete unit suite and Nuxt build; repair integration failures with the smallest evidence-based change.**

### Task 5: Verification and Publication

- [ ] **Step 1: Run tests, audit, build, and static generation; inspect the emitted manual route and `/csm-next/_nuxt/**` assets.**
- [ ] **Step 2: Validate normal, empty, error, attachment, dialog, focus, desktop, and narrow-screen states with a local mock transport where live backend access is unavailable.**
- [ ] **Step 3: Confirm missing-auth redirect behavior and scan target page source for forbidden legacy dependencies and writes.**
- [ ] **Step 4: Confirm `Website/**` is unchanged relative to Task 3 and inspect the incremental diff.**
- [ ] **Step 5: Self-review parity and accessibility, repair important findings, explicitly stage files, commit, push, and open a PR based on `migration/5-ui-baseline`.**
