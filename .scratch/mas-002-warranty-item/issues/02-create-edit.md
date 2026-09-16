# 02 — Typed create and edit Warranty Items

**Target:** `frontend/` — Nuxt 4 + Vue 3.

**Language:** TypeScript mandatory for form, validation, request/response, pending, and error state.

**Blocked by:** 01 — Typed shell, access, and server-paged catalog; minimum typed Warranty Group lookup capability in `frontend/`.

**What to build:** An editable user can create and edit Warranty Items through a typed dialog with explicit validation, immutable identity, duplicate-submit protection, and reliable success/failure behavior.

## Dependency rule

`frontend/` does not currently contain a typed `WarrantyGroupService`. Implement or adapt only the minimum typed active-group lookup needed by this ticket. Do not assume a service exists, restore Warranty Group code in `Nuxt/`, or expand this ticket into a Warranty Group feature/refactor.

## Typed boundaries

- Warranty Item form model and field-level validation state.
- Active Warranty Group lookup result and default-selection state.
- Create payload and result.
- Update payload and result.
- Save pending state and normalized error.
- Read-one response as `unknown` before normalization.

## Acceptance criteria

- [ ] RED tests cover group lookup/default selection, form validation, Lifetime behavior, fresh read-one prefill, exact create/update endpoints, payload normalization, pending state, duplicate invocation, and dialog lifecycle.
- [ ] Newly owned Vue logic uses `<script setup lang="ts">`; supporting capability files use TypeScript and avoid undocumented `any`.
- [ ] Add requests active Warranty Groups and selects `default_ == 'Y'` only when the response supplies one.
- [ ] Missing default, empty result, or failed group lookup does not invent a group; the user receives a usable empty/error state and may select a verified available group when possible.
- [ ] Warranty Code is trimmed, required, limited to 15 characters, and immutable after creation.
- [ ] The allowed-character rule is implemented only after backend/business confirmation; until then tests do not encode an invented character policy.
- [ ] Warranty Name is required and limited to 150 characters; backend validation differences stop implementation for confirmation.
- [ ] Days, Months, and Years accept non-negative discrete integers; Lifetime sets all three to zero and disables their inputs.
- [ ] Material Code remains manual input; no Material picker is added.
- [ ] Create calls `CSM/Master/WarrantyItem_Create`; Update calls exact verified spelling `CSM/Master/WarrantyItem_Update`.
- [ ] No alternate Update endpoint casing appears in production code or tests.
- [ ] Request payloads include only fields confirmed by backend evidence; current client-wide `formData` posting is not treated as proof of the minimum accepted contract.
- [ ] Edit loads fresh data with `WarrantyItem_Read?war_code=` before exposing editable state and keeps Warranty Code read-only.
- [ ] Reference IC fields are not intentionally editable; confirmed backend evidence determines whether read-one metadata is retained unchanged or omitted from Update, and no domain meaning is inferred from field names.
- [ ] While save is pending, controls are disabled and repeated clicks or handler calls send exactly one mutation.
- [ ] Invalid input sends no request and shows field-level feedback.
- [ ] Failed read/save preserves useful dialog inputs, clears pending state, displays one normalized error, and does not report success.
- [ ] Successful save reports success once, closes the dialog, and reloads the current list query once.
- [ ] Read-only users cannot open or invoke create/update actions.
- [ ] Focused tests, relevant target regressions, typecheck, and `frontend/` build have recorded results.

## Contract status

- **VERIFIED:** create/read/update endpoint names in both current clients; canonical Update casing is `WarrantyItem_Update`.
- **REQUIRES BACKEND CONFIRMATION:** minimum create/update header fields, read-one metadata round-trip requirements, accepted validation rules, ignored/server-owned fields, and response semantics.
- **UNVERIFIED DOMAIN TERM — REQUIRES DOMAIN/BUSINESS CONFIRMATION:** Reference IC; this ticket only prevents accidental mutation.
