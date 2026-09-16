# 05 — Typed server-generated Warranty Item export

**Target:** `frontend/` — Nuxt 4 + Vue 3.

**Language:** TypeScript mandatory for export request, token/result normalization, pending state, download result, and errors.

**Blocked by:** 01 — Typed shell, access, and server-paged catalog; minimum typed file/download abstraction in `frontend/`; endpoint round-trip confirmation.

**What to build:** An authorized user can request the full server-generated Warranty Item export once and hand the server-minted token to a target-owned typed download abstraction with honest failure reporting.

## Dependency rule

`frontend/` does not currently contain the typed file capability described by the old specification. Create or adapt the minimum target-owned abstraction needed by this ticket. The historical `Nuxt/` file capability may inform the design but must not be imported, copied wholesale, or treated as runtime ownership.

## Typed boundaries

- Export request and normalized API result.
- Server token validation/narrowing from `unknown`.
- Download-open request and observable result.
- Export pending state and normalized error.

## Acceptance criteria

- [ ] RED tests cover exact export endpoint, token normalization, pending state, duplicate invocation, access guard, missing token, popup/open failure, request failure, and false-success prevention.
- [ ] Export calls observed GET endpoint `CSM/Master/WarrantyItemExport_Master`; no request parameters are invented unless backend evidence requires them.
- [ ] The raw response is treated as `unknown`; only a validated non-empty token proceeds to download.
- [ ] The validated token is passed verbatim to the `frontend/`-owned typed download abstraction with `download=true` semantics.
- [ ] The download URL preserves observed contract `Api/File/DownLoad?download=true&id={token}` and uses the target runtime's configured backend base rather than a hardcoded host.
- [ ] The export action is disabled while pending and repeated clicks/handler calls send one export request.
- [ ] Request failure, missing/invalid token, or observable popup/open failure clears pending state, displays one normalized error, and never displays success.
- [ ] Opening the download successfully does not claim that the browser completed or saved the file when that state is not observable.
- [ ] Export requests the server-generated full catalog and does not serialize the current grid page.
- [ ] The legacy client-side `XLSX.writeFile` fallback is not added.
- [ ] Unauthorized/read-only users cannot trigger the protected export action.
- [ ] No runtime dependency on `Nuxt/`, no backend edit, and no broad shared refactor is introduced.
- [ ] Focused tests, relevant target regressions, typecheck, and `frontend/` build have recorded results.

## Contract status

- **VERIFIED:** current Warranty page export endpoint usage; shared form treats `rsp.data` as the token and opens the download URL.
- **VERIFIED:** backend knowledge states download ids are server-minted tokens passed through verbatim.
- **REQUIRES BACKEND CONFIRMATION:** endpoint-specific response shape, authorization/result errors, full-catalog semantics, and live token/download round trip.
