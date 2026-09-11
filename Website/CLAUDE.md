# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read AGENTS.md

**All project knowledge, conventions, and rules for this repository live in [AGENTS.md](AGENTS.md). Read it before writing, reviewing, or refactoring any code here, and follow it exactly.**

`AGENTS.md` is the single source of truth. It covers:

| Section | Contents |
|---|---|
| 1. Working Agreement | non-negotiable rules (no `node_modules/`, no added comments, don't run builds) |
| 2. Project Overview | Vue 2 + ASP.NET 4.8 stack, key UI libraries |
| 3. Build & Development | npm scripts, ports, webpack config layout |
| 4. HTTP / API Layer | the four Axios instances, `$xt` helpers, response envelope |
| 5. Routing & Permissions | route shape, `meta` flags, menu IDs, i18n |
| 6. Vuex Store | state, actions → endpoints, getters |
| 7. Component Layout | layouts, shared controls, page modules, file naming, **responsive twin files** |
| 8. Component Skeleton | the canonical v1 page pattern; V2 / Composition API |
| 9. ag-Grid | `ag-table` props, events, ref methods, column tuples |
| 10. ASP.NET Host Page | `Page/Default.aspx` globals and script tags |
| 11. Backend API Service | `MangoWebPoolService-DEV` path rule + `Areas/CSM` rule |
| 12. Conventions Checklist | the rules to verify against before finishing |
| 13. Quick Reference | paths, ports, "I need… → go to" table |

If anything in this file appears to conflict with `AGENTS.md`, **`AGENTS.md` wins** — and update this file to match.

## Claude Code specifics

- **If the `andrej-karpathy-skills` plugin is installed on this machine, invoke its `karpathy-guidelines` skill FIRST** (before writing, reviewing, or refactoring code) and follow it. If the skill is not installed, apply the same principles manually: think before coding, keep changes simple and surgical, define verifiable success criteria.
- Project skill `csm-customer-service` (`.claude/skills/csm-customer-service/SKILL.md`) auto-triggers when working on `v_csm_cus_*`, `v_csm_trn_*`, `customer-layout`, `getServer` / `getCustomerServer`, or `ag-table`.
- **`edit_details.vue` ↔ `edit_details_mobile.vue` are one unit.** The TRN_001 Description tab renders `edit_details_mobile.vue` at ≤939px (phone + tablet portrait) and `edit_details.vue` at ≥940px. Any change to `edit_details.vue` — new variable, new alert, new function, new condition, removed function, removed condition, new markup or style — must be carried over to `edit_details_mobile.vue` in the same change. `extends` shares the `<script>`, but the `<template>` and the scoped CSS are copies and do not follow. Details and the mirroring checklist: [AGENTS.md](AGENTS.md) §7 "Responsive twin components" and checklist item 15.
