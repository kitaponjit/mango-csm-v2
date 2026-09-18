# CSM Stack Migration Closeout

## Objective

Migrate CSM behavior from the legacy Vue 2 application to the current Nuxt/Vue 3 stack while
preserving observable product behavior.

The governing invariant is:

> LEGACY = PRODUCT BEHAVIOR SPECIFICATION
> TARGET STACK = IMPLEMENTATION CONSTRAINT
> MIGRATION FEATURE DELTA = 0

## Architecture

| Tree | Durable role |
| --- | --- |
| `Website/` | Legacy observable behavior and product reference. |
| `frontend/` | Current Nuxt 4/Vue 3/Vite runtime target. |
| `Nuxt/` | Historical first-slice evidence only; not a current runtime target. |

The target must preserve legacy behavior, API and authorization contracts, validation, navigation,
i18n, and user-visible workflow semantics. A target-only observable behavior is `EXTRA` until it
is intentionally approved. A missing legacy-observable capability is a migration `GAP`.

## Final implementation state

| Item | Result |
| --- | --- |
| PR | `#32` |
| Final PR HEAD | `4685fb6ceab671d8f3b332ca488d391b4380340d` |
| Merge strategy | Merge commit |
| Merge commit / `FINAL_MAIN_SHA` | `7ca1e766411adb5039b45175e700b2f7c1cd1a5e` |
| Migration units | `97 / 97` |
| Warranty | `FULL_CAPABILITY_AUDITED` |
| Active Warranty GAP | `0` |
| Warranty UNKNOWN | `0` |
| Known target-only extra | `v_csm_log_web` — `PARKED_EXTRA`; not legacy parity |

## Post-merge verification

The following gates passed against the merged `main` tree at `FINAL_MAIN_SHA`:

| Gate | Result |
| --- | --- |
| Focused Reference IC | `PASS` — 5 files / 13 tests |
| Focused date/grid | `PASS` — 3 files / 6 tests |
| Warranty Item | `PASS` — 36 files / 204 tests |
| Frontend / CSM | `PASS` |
| Query | `PASS` — 35 |
| Store | `PASS` — 28 |
| Parity integration | `PASS` — 64 against real MongoDB |
| Focused typecheck | `PASS` |
| Project typecheck | `PASS` |
| Production build | `PASS` |
| `git diff --check` | `PASS` |

Known warnings were non-fatal and pre-existing. Test, typecheck, and build success is not a
substitute for authenticated user acceptance.

## External verification debt

Authenticated UAT remains:

```text
BLOCKED_EXTERNAL_ENV
```

This is separate from implementation completion and must not be reported as a passed UAT result.

## Durable handoff rules

- Trace actual Legacy and Target behavior before asserting an API, permission, payload, or workflow contract.
- For a parity defect, establish Legacy behavior, demonstrate the Target mismatch, add a regression that is `RED`, make the minimal fix, and verify `GREEN`.
- Run focused checks first, then the established repository-wide tests, typechecks, and build gates appropriate to the change.
- Use the existing local `MangoServiceNetCore` checkout as backend contract evidence when required; do not commit machine-specific paths, credentials, or tokens.
- Keep authenticated UAT status separate from automated verification and label unrun or environment-blocked checks accurately.
