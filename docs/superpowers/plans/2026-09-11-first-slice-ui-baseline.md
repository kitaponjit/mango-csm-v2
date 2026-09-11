# First-Slice Semantic UI Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the small, target-owned semantic CSS and behavior primitives required by the Nuxt manual-list route.

**Architecture:** Keep visual vocabulary in the existing target stylesheet and introduce Vue components only for feedback-state and dialog behavior. Native HTML controls, tabs, tables, and links use documented target classes so the route remains lightweight and framework-independent.

**Tech Stack:** Nuxt 4.5.2, Vue 3.5, TypeScript, CSS, Vitest, Vue Test Utils, happy-dom.

## Global Constraints

- Do not add a UI framework or import Bootstrap 3, AdminLTE, Site.css, DarkTheme.css, or legacy Vue components.
- Keep all styles scoped to the Nuxt artifact and preserve `/page/**` unchanged.
- Provide visible focus, disabled, invalid, loading, empty, error, dialog, narrow-screen, and table-overflow behavior.
- Prefer one responsive structure; do not create desktop/mobile twin markup.
- Keep components route-focused and composable rather than creating a broad design system.

---

### Task 1: Component Test Harness and Feedback State

**Files:**
- Modify: `Nuxt/package.json`
- Modify: `Nuxt/package-lock.json`
- Create: `Nuxt/vitest.config.ts`
- Create: `Nuxt/test/ui/target-state.test.ts`
- Create: `Nuxt/app/components/ui/TargetState.vue`

- [x] **Step 1: Add Vue Test Utils and happy-dom, configure the DOM test environment, and confirm audit remains clean.**
- [x] **Step 2: Write tests for loading/empty status semantics and error alert semantics.**
- [x] **Step 3: Run the focused test and confirm it fails because `TargetState` is absent.**
- [x] **Step 4: Implement the minimal state component with accessible roles and live regions.**
- [x] **Step 5: Rerun the focused test and confirm it passes.**

### Task 2: Accessible Dialog Behavior

**Files:**
- Create: `Nuxt/test/ui/target-dialog.test.ts`
- Create: `Nuxt/app/components/ui/TargetDialog.vue`

- [x] **Step 1: Write tests for accessible title wiring, close-button behavior, Escape/cancel behavior, and backdrop close behavior.**
- [x] **Step 2: Run the focused test and confirm it fails because `TargetDialog` is absent.**
- [x] **Step 3: Implement a declarative native-dialog wrapper with close events and browser-safe open-state synchronization.**
- [x] **Step 4: Rerun the focused test and confirm it passes.**

### Task 3: Semantic Tokens and Route Primitives

**Files:**
- Modify: `Nuxt/app/assets/css/main.css`

- [x] **Step 1: Extend the target tokens for typography, spacing, success/warning/danger, focus, control sizes, radii, and dialog elevation.**
- [x] **Step 2: Add target-owned page, panel, form/date-control, button, tabs, table/list, state, dialog, file-action, and responsive conventions.**
- [x] **Step 3: Keep existing shell selectors operational and confirm no selector targets legacy host markup.**

### Task 4: Verification and Publication

- [x] **Step 1: Run the full test suite, audit, Nuxt build, and Nuxt generate.**
- [x] **Step 2: Scan source/dependencies for legacy CSS, UI frameworks, forbidden globals, and SSO additions.**
- [x] **Step 3: Inspect the generated `/csm-next/_nuxt/**` artifact and the incremental diff against Task 2.**
- [x] **Step 4: Self-review accessibility, responsive behavior, and scope; repair important findings.**
- [ ] **Step 5: Explicitly stage scoped files, inspect the staged diff, commit, push, and open a PR based on `migration/3-auth-api-foundation`.**
