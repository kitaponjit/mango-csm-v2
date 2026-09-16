# 01 — Typed shell, access, and server-paged Warranty Item catalog

**Target:** `frontend/` — Nuxt 4 + Vue 3.

**Language:** TypeScript mandatory for newly owned Warranty Item code; page logic uses `<script setup lang="ts">`.

**Route:** Preserve verified target route `/page/master/v_csm_mas_002/` and `CSM_WEB / 20820`. Do not create `/csm-next/**`.

**Blocked by:** Minimum approved TypeScript, typecheck, test, typed API/result, and session/access enablement in `frontend/`.

**What to build:** An authorized user can open the existing target route, browse the server-paged catalog, search/filter it, and recover from loading, empty, and retryable errors without stale responses winning races.

## Typed boundaries

- List query: `skip`, `take`, `field`, `text`, and `active`.
- Raw API response as `unknown`, normalized into typed rows and total.
- Pagination: page, page size, skip, total, maximum page, and row number.
- Search/filter state.
- Access state.
- Loading, empty, error, retry, and request-generation state.

## Acceptance criteria

- [ ] RED tests cover route ownership, access outcomes, query construction, response normalization, paging boundaries, page reset, empty/error/retry behavior, and stale-response protection.
- [ ] Implementation is owned by `frontend/`; no production code or test is added to `Nuxt/` or `Website/`.
- [ ] Newly owned Vue logic uses `<script setup lang="ts">`; capability code uses `*.ts` where appropriate and does not use undocumented `any`.
- [ ] Navigation continues to resolve `/page/master/v_csm_mas_002/`; route name `v_csm_mas_002` and menu identity `CSM_WEB / 20820` remain intact.
- [ ] Anonymous users follow the existing login flow; users without the enabled menu right reach Access Denied.
- [ ] Read-only users can inspect the catalog but cannot invoke create, edit, delete, import, or export handlers.
- [ ] Initial render shows loading and sends exactly `skip=0`, `take=500`, `field=war_code`, empty `text`, and `active=Y`.
- [ ] A valid response normalizes `data_rows` and `total`; malformed or incompatible data produces a visible error rather than unsafe assumptions.
- [ ] A valid zero-row response ends loading and shows an empty state.
- [ ] Search by Warranty Code or Warranty Name resets to page one before requesting and preserves field/text after failure.
- [ ] Changing the active filter resets to page one; unchecked sends the observed `active=N` value without claiming unverified backend filtering semantics.
- [ ] First, Previous, numbered, Next, and Last controls stay within server-derived bounds for zero rows, a full page, and a partial final page.
- [ ] Displayed row numbers equal `skip + index + 1`; client sorting does not replace server order.
- [ ] Retry reuses the current query/filter and clears the previous error only when a new request starts.
- [ ] Each list/access generation has an identifier; a late older response cannot replace rows, totals, loading, error, or authorization state from a newer generation.
- [ ] Focused tests, relevant target regressions, typecheck, and `frontend/` build have recorded results.

## Evidence and open verification

- **VERIFIED:** route, component resolution, menu, and `CSM_WEB / 20820` from current `frontend/` source.
- **VERIFIED:** current clients use `WarrantyItem_ReadList` with the documented query names and read `data_rows` / `total`; runtime variants still require integration evidence.
- **UNVERIFIED:** external consumers of the URL and runtime behavior of `active=N`; preserve current contracts pending integration evidence.
