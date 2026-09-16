# [EPIC] Align Warranty Item Core with the frontend Nuxt 4 target

| Field | Value |
|---|---|
| Status | PLANNING / DOCUMENTATION ALIGNMENT |
| Owner (handoff_to) | Thanat-wut |
| Capability | `mas_002` Warranty Item Core |
| Target application | `frontend/` |
| Target framework | Nuxt 4.5.2 + Vue 3, SPA mode |
| New capability language | TypeScript mandatory; Vue SFC logic uses `<script setup lang="ts">` |
| Legacy behavioral source | `Website/` |
| Historical migration evidence | `Nuxt/` (SUPERSEDED / HISTORY_ONLY) |
| Date | 2026-09-16 |

## 1. Architecture decision

Warranty Item Core will be implemented as a typed capability inside the existing `frontend/` application. `frontend/` is already the repository's Nuxt 4 + Vue 3 target runtime even though most ported screens still use Options API JavaScript.

New Warranty Item-owned code must use TypeScript for the page logic, models, service/API contracts, form and page state, pagination, mutation results, error normalization, import/export results, and any capability-owned composables or adapters. Raw or untrusted values enter as `unknown` and are normalized or narrowed. `any` requires a documented boundary.

Existing JavaScript in `frontend/` remains in place unless the Warranty Item integration seam requires a scoped change. This Epic does not authorize a bulk TypeScript conversion or adjacent-page modernization.

`Website/` remains the behavioral and client-contract reference. The separate `Nuxt/` application remains historical migration evidence only. “No Nuxt revival” means do not restore or extend that superseded application; it does not prohibit Nuxt, because the selected `frontend/` runtime is Nuxt 4. Knowledge and proven patterns may be re-evaluated, but runtime code must not be cross-imported from `Nuxt/`.

## 2. Verified route ownership

Repository evidence in `frontend/app/routes/routes.master.js` verifies:

- Route name: `v_csm_mas_002`
- Route path: `/page/master/v_csm_mas_002/`
- Current component resolution: `frontend/app/Components/Pages/Master/v_csm_mas_002.vue`
- Authorization metadata: `CSM_WEB / 20820`, `checkUserRight: true`

`frontend/app/Components/Layouts/menu.vue` links menu item `20820` to the same path under the `20800` Warranty group. The target capability must preserve this registered route and menu contract unless a separate routing decision is approved. Repository evidence does not establish whether third-party bookmarks or integrations depend on the URL, so external dependency is **UNVERIFIED**.

The historical `/csm-next/master/warranty-item/` route belongs to the superseded scaffold and is not a target route.

## 3. Scope

### In scope for the future feature PR

- Typed list, search, active filter, server paging, loading, empty, retry, and stale-response handling.
- Typed create/edit form, validation, pending state, duplicate-submit protection, and Warranty Group lookup dependency.
- Typed delete flow with pending state, duplicate-click protection, server-error surfacing, and pagination clamp.
- Typed two-stage Master Import flow: spreadsheet upload/preview followed by Warranty Item batch submission.
- Typed server export/download flow owned by `frontend/`.
- Existing `CSM_WEB / 20820` authentication and authorization behavior.
- Focused automated tests plus build/typecheck evidence once the minimum target test/typecheck seam exists.

### Out of scope

- Feature implementation in this documentation PR.
- Production feature work in `Nuxt/` or runtime imports from it.
- Broad conversion of existing `frontend/` JavaScript.
- `Website/`, backend, schema, deployment, or root-governance changes.
- Reference IC workflows or glossary definition.
- 22-field Auto Import, Material picker, client-side XLSX export fallback, and unrelated Master features.
- Warranty Group implementation or refactor beyond the minimum typed lookup capability required by Warranty Item.
- Cutover, retirement, live UAT, or merge approval.

## 4. Evidence roles

| Boundary | Role | Use |
|---|---|---|
| `Website/` | LEGACY | Observable behavior and current client API usage. Do not modify in this slice. |
| `frontend/` | TARGET | Nuxt 4 + Vue 3 runtime owner and only production implementation destination. |
| `Nuxt/` | HISTORY_ONLY | Typed API/result, session, access, file, testing, stale-response, and race-protection patterns. Re-evaluate; do not import or restore. |
| Backend repository | CONTRACT OWNER | Required to confirm mutation, guard, import, and export semantics that client code alone cannot prove. |

## 5. Contract status

The detailed registry lives in `spec.md`. The following summary prevents assumptions from becoming contracts.

| Contract | Status | Evidence / boundary |
|---|---|---|
| Target route `/page/master/v_csm_mas_002/` and menu `CSM_WEB / 20820` | VERIFIED | Current `frontend/` route and menu source. |
| `WarrantyItem_Update` casing | VERIFIED | Both `Website/.../v_csm_mas_002.vue` and `frontend/.../v_csm_mas_002.vue` call this exact spelling. |
| List/read/create/update/delete/import/export endpoint names | VERIFIED | Both clients contain the calls; this verifies current client usage only, while backend action behavior still requires owning-repository or runtime confirmation where noted in the spec. |
| Delete referential-guard tables and rejection rules | REQUIRES BACKEND CONFIRMATION | No owning backend source is available in this checkout. |
| Master Import validation, upsert, atomicity, and processed-count semantics | REQUIRES BACKEND CONFIRMATION | Client code shows request flow, not server transaction/result semantics. |
| Export endpoint returns a file token in `rsp.data` | VERIFIED | Shared form code passes `rsp.data` to `Api/File/DownLoad`; this verifies current client usage only, while the endpoint-specific response needs backend/runtime confirmation. |
| Reference IC business meaning | UNVERIFIED DOMAIN TERM — REQUIRES DOMAIN/BUSINESS CONFIRMATION | Client labels and fields exist, but no authoritative business definition was found. |

## 6. Target architecture

The implementation will introduce the smallest typed Warranty Item slice under `frontend/app/`. Exact directories and filenames are intentionally not fixed until the implementation plan accounts for the current `frontend/` structure. The slice must nevertheless provide clear typed boundaries for:

1. Route/page composition using `<script setup lang="ts">`.
2. Domain and form models.
3. Query, request, response, and normalized-result types.
4. Capability-owned service methods.
5. Pagination and async generation state.
6. Import upload/preview/submission state.
7. Export request/token/download state.
8. Error normalization from `unknown`.

The current target has no tracked application `tsconfig.json`, typecheck script, Warranty Item test baseline, typed API client, typed file/download abstraction, or `WarrantyGroupService`. Those are future architecture-enablement requirements. Gate 2 only documents them; it adds no config, dependencies, source, or tests.

## 7. Delivery sequence

1. **Architecture enablement:** establish the minimum source-controlled TypeScript, typecheck, test, typed API/result, session/access, and file/download seams required by this capability. Each shared change needs narrow ownership and review.
2. **Ticket 01:** route-owned shell, access, list, search, server paging, and async race protection.
3. **Ticket 02:** create/edit and the required typed Warranty Group lookup capability.
4. **Ticket 03:** delete guard handling, duplicate-mutation protection, and pagination clamp.
5. **Ticket 04:** Master Import upload, preview/mapping, validation, and batch submission.
6. **Ticket 05:** server export and target-owned typed download abstraction.
7. **Integration verification:** real backend contract checks, browser behavior, authorization, and parity against `Website/`.

## 8. Completion boundary

This Epic is ready for implementation planning only when the Epic, specification, and five tickets agree on `frontend/` ownership, Nuxt 4 + Vue 3, mandatory TypeScript for new Warranty Item code, the verified route, and the contract classifications. Feature implementation remains blocked wherever the specification says **REQUIRES BACKEND CONFIRMATION** or **UNVERIFIED**.
