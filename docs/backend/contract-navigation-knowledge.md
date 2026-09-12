# Backend Contract & Navigation Knowledge

| Field | Value |
|---|---|
| **Status** | Active reusable knowledge (agent navigation cache) |
| **Created** | 2026-09-12 |
| **Backend** | `MangoWebPoolService-DEV` (.NET Framework 4.8, MVC5 + WebAPI + OWIN + EF6, TFVC) |
| **Method** | READ-ONLY reconnaissance scout (partial-targeted coverage, marginal-gain stop) + synthesis with adversarial review |
| **Backend governance** | `MangoWebPoolService/AGENTS.md` + `CLAUDE.md` (authoritative for auth/envelope/data rules; read §§4–7 first) |

> Purpose: let future Agents answer "what does the frontend depend on / where does it live / where do I start"
> WITHOUT re-traversing the backend. Covers only frontend-relevant surfaces.
> Status tags: `[VERIFIED]` = backend source read · `[OBSERVED]` = structure/surface seen ·
> `[INFERRED]` = extrapolated, do not trust blindly · `[UNKNOWN]` = not found ·
> `[REQUIRES_EXECUTION]` = runtime evidence needed. Never upgrade an assumption to verified
> without direct backend evidence.

## 1. Architecture & traversal spine

- Solution `MangoWebPoolService.sln`; projects: `MangoWebPoolService` (main), `MangoMobileService`,
  `MangoReportService`, `SFC-DC-Service`, `MangoWebPoolService.Tests`.
- Areas under `MangoWebPoolService/Areas`: `AccountingforLabor`, `Anywhere`, `AnywhereAPI`, `Api`,
  `CSM`, `DC_System`, `Ext_API`, `Mint`, `Page`, `Planning`, `PrintApi`, `QCC`, `Report`. No CODEOWNERS file.
- Traversal spine for any endpoint work:
  `Controllers/_BasedController.cs` → `MangoWebPool/Authentication.cs` →
  `Areas/{Area}/Controllers/` → `Areas/{Area}/Models/`.
- Backend path differs per dev machine — ask the dev, verify `Test-Path` for `MangoWebPoolService.sln`,
  never hardcode (see `Website/AGENTS.md` §11).

## 2. Authentication contracts [VERIFIED, code-read, high confidence]

| Domain | Header in | Backend validator | Failure behavior |
|---|---|---|---|
| Internal | `X-Mango-Auth` (hex via `MangoWebToken.dll` → JSON) | `Authentication.GetAuthorize` (`MangoWebPool/Authentication.cs:1468-1620`): `hr_emp` lookup → session row `app_authen` (calendar-checked) or `app_authen2` (+1 month); touches `last_access` unless `X-Mango-No-Touch: Y` | Missing/invalid token does **NOT** 403 in `OnAuthentication` — sets `X-MG-Auth-Error` response header, `is_authenticated=false`; each controller's `OnActionExecuting` returns **bare HTTP 403 with no envelope** (CSM pattern: `AccessDeniedStatus()`). Pipeline: `Controllers/_BasedController.cs:44-99` |
| Customer portal | `X-Customer-Auth` | Separate pipeline `_BasedCustomerController` (NOT `_BasedController`) → `CustomerAuthorize.GetCustomerAuthorize` (`Areas/CSM/Models/Customer/Login.cs:69-145`): session `app_customer_authen(session_id, customer_code)`, +1h sliding touch, identity via `ar_cust UNION mg_csr_line_member`, default `maincode="MG1"` | `cus_auth.is_authen=false` → bare 403. **No** `X-MG-Auth-Error` header on this path |
| Local ASP.NET | `X-Post-Back-Token` + `postback_token` cookie | Double-submit guard (`_BasedController.cs:44-50`): both present and differ → immediate 403; either absent → skipped (API clients unaffected) | Nuxt `useApiClient` must NOT send this header (or must mirror the cookie) |
| Machine-to-machine OAuth (NOT UI login) | `Authorization: Bearer` | `OAuthController` / `OAuthAttribute`, `client_credentials` (`_BasedController.cs:222-340`) | **No SSO anywhere** — no SAML/OIDC interactive login. Target keeps token-header login [VERIFIED negative] |

Headers the backend reads that the frontend must send:
`X-Mango-Auth`, `X-Mango-Session-ID`, `X-Log-Code`, `X-Edit-Mode`, `X-Mango-No-Touch`.
Confirm current `xtools.js` coverage by grep before porting to Nuxt.

Exceptions: outsource path `X-Mango-Outsorce: Y` (sic spelling, `GetAuthorizeOutSource`,
`Authentication.cs:1665`); gateway path requires `X-Mango-Gateway: Y` plus token match.
Session-expiry timing (MG_TIME value) [REQUIRES_EXECUTION].

## 3. Response contracts [VERIFIED]

- Envelope `{ success, error, data }` with `success = IsNullOrEmpty(error)`, always HTTP 200 —
  built ONLY in `_BasedController.JsonContentResult(data, error)` (`:137-196`), mirrored in
  `_BasedCustomerController.JsonContentResult` (`:63-80`). Variants: raw `JsonContent(obj)`
  (unwrapped), `JsonContentResultEvolt` / `JsonContentResultCenter` (200-vs-400). Rights/auth gates = bare 403.
- **Killed assumption — envelope is NOT global.** Raw-`JsonContent` endpoints include:
  `ManualReadList` / `ManualReadListV2` / `ReadPicture`, `Config_ReadList`, `Customer_Read`,
  `GetSettings`, `Maincomp`, `StoreConfig`. Adapters must accept BOTH shapes.
- **Killed assumption — no global list wrapper.** `{ data_rows, total }` is constructed ad hoc
  inside each action, and shapes vary. Exact shapes of key endpoints:
  - `ContactType` / `Priority` / `ServiceType` / `RequestType` → `{ data_rows, total = q.Count() }`
    (`Areas/CSM/Controllers/CenterController.cs:174-191`)
  - `ServiceType_Send_Bug` → `{ data_rows }`, NO total (`:113-129`);
    `Customer_ReadList` → `{ data_rows }`, NO total (`MasterController.cs:1051-1057`)
  - `GetSettings` → `{ data, total }` keys via raw `JsonContent` (`Models/Center/DataCenter.cs:105-117`)
  - `Maincomp` → raw company object (`Anywhere/Controllers/CenterController.cs:653-667`);
    `StoreConfig` → raw `sm_config` list (`Anywhere/Controllers/APIController.cs:294-309`,
    takes caller-supplied `maincode`, NO `auth.maincode` scoping — never expose to portal);
    `Manual*` → raw objects (`ManualController.cs:27-43`)
  - Normalization rule: read `rsp.data.data_rows ?? rsp.data.data ?? rsp.data`, `.total` optional.
  - For any NEW endpoint, read its action body (10–30 lines); never assume sibling sameness.
    Sampling basis: canonical `ContactType` + complex `Customer_Create` + exceptions
    `GetSettings` / `ServiceType_Send_Bug`; counts `data_rows` ×63+102+24, `JsonContent` ×166
    vs `JsonContentResult` ×458 across CSM controllers.
- POST bodies: `Dtl.json_request()` plus pre-declared anonymous `FromJson` shape — field names are
  contract (e.g. Create/Update take `info` / `address` / `mobile` / `contact`, `:1067-1094`).

## 4. Localization [VERIFIED]

- `api/public/LanguageSelector?lang_code=TH` → 302 redirect to
  `LangDisplay?lang_code&last_edit=yyyyMMddHHmmss` (last-edit = max `sm_ui_language.add_dt`);
  `LangDisplay` returns `{ success: true, data: { lang: { langList, userLang }, uiLang } }`,
  hand-built (not via `JsonContentResult`) + file cache + 1-year OutputCache + CORS allowlist
  (`Areas/Api/Controllers/PublicController.cs:1192-1285`). `LangDisplay2` is file-based
  (`app_data/languages2/`) returning raw `{ languages, translate }`.
- Per-user default `auth.lang_web` (`TH`/`EN`, from `hr_emp.lang_web`, fallback `EN`)
  (`Authentication.cs:1600`); `ChangeLanguage` exists on both `PublicController` (internal)
  and `AuthCustomerController` (portal).
- Adapter recipe: follow the redirect, cache by `last_edit`, `uiLang[var] ?? var`, `user_lang` cookie `lang`.
- **Killed assumption:** `DD/MM/YYYY` is FRONTEND display only — backend culture is `en-US`
  (`Global.asax.cs:20`) with ISO-local dates; `Dtl.parse_date` (inside sourceless `DataTools.dll`)
  parses `yyyy-MM-dd` at call sites [INFERRED — edge formats REQUIRE_EXECUTION].
- Exception: docker mode returns an empty object for language calls.

## 5. Ownership map (frontend capability → controller → model)

- `CSM/Center` (lookups + `GetSettings`): `Areas/CSM/Controllers/CenterController.cs` →
  `Models/Center/*`. NOTE: `ContactType` SQL interpolates `auth.maincode` via string
  (not parameterized) — legacy pattern, preserve, do not "fix" incidentally.
- `CSM/Master` (Customer/Warranty/Contact/ServiceType CRUD + Excel import/export):
  `MasterController.cs` → `Models/Customer.cs` (internal CRUD) vs `Models/Center/Customer.cs`
  (CM/AR readlists) — TWO parallel customer models, do not confuse them.
- `CSM/Manual` (Manual/FAQ): `ManualController.cs` → `Models/Manual/*`.
- `CSM/Config` (Config/Active_Config/Holiday/Extension/State/SMTP): `ConfigController.cs` →
  `Models/Config/*`.
- Portal: `CustomerDataController` + `AuthCustomerController`
  (Login / GetInitCustomerData / ChangeLanguage / Logout / GetOTP) on `_BasedCustomerController.cs:16-47`.
  Portal `Login` + OTP round-trip (`Login.cs:158-228`) not traced — inspect before rebuilding login.
- Other CSM controllers: `TBug`, `Chat` (rooms/poll/messages), `Gateway` (async dispatch),
  `Data`, `API`, `Tools`, `Report`, `CSMItDev`. Route shape `CSM/{controller}/{action}`
  (`CSMAreaRegistration.cs`).
- `Anywhere/*` (ERP core, 29 controllers incl. AP/AR/GL/IC/PO/FA/MA/MRP/BD/EVAL/OF/OS/PM/RT/Memo/Master/Center/Config/Email/Etax/Ai):
  `Anywhere/Controllers/{M}Controller.cs` → `Models/{M}/...` (screen-code = model name = Vue filename).
  `AnywhereAPI/CSMController` = per-customer integrations (LoginMaintenance/ProjectMaintenance/LineOA).
- File: `Areas/Api/Controllers/FileController.cs:72-130` —
  `GET /Api/File/DownLoad?download&id&filename&noToken&isAnywhere`; `id` is a hex-tokenized path
  unless `noToken`; S3/OBS backed; 404 if unresolvable; `download=true` + filename →
  `application/octet-stream` (Anywhere) or copy-to-`download_export/` + redirect (non-Anywhere),
  else inline with real filename.
- Print: `Areas/PrintApi/Controllers/DocumentController.cs:33-310`
  (`Create` / `CreatePDF` / `MergeDocumentWithPath` / `AnywhereDocument` / `DashBoardPlanning`).
- Realtime: SignalR 2 hub `SocketHub` (`SignalR/GlobalHubs.cs:13-321`, `/signalr` via OWIN
  `StartUp.cs:257-266`): row-lock + case-comment + program-update events; auth via token PARAM
  (`JoinUserChannel(token2)`), not header. Which events the CSM UI subscribes needs a frontend
  grep [INFERRED].

## 6. Navigation recipes (start here — never from repo-wide search)

- **Manual listing change** → `ManualController.cs:27-43` → `Models/Manual/*` → response shape
  (raw, not envelope!) → stop unless the query changes (then persistence layer).
- **Customer CRUD change** → `MasterController.cs:1051-1094` → `Models/Customer.cs` (verify which of
  the two customer models applies) → round-trip test.
- **Session/login change** → `_BasedController.cs:44-99` → `Authentication.GetAuthorize` →
  controller `OnActionExecuting`. Portal → `_BasedCustomerController` → `Models/Customer/Login.cs`.
- **New list endpoint** → read its action body for the `{ data_rows / total }` variant (10–30 lines);
  grep `JsonContentResult` vs `JsonContent(` within that controller.
- **File-link feature** → `FileController.DownLoad` → FIRST hunt the token minter
  (grep `EncodeTokenHex` producers — minter currently [UNKNOWN], blocks Nuxt file links).
- **Config bootstrap** → `GetSettings` (`mg_csr_config`) vs `StoreConfig` (`sm_config`) are DISTINCT
  tables; confirm the consumer split by frontend usage grep.

## 7. Legacy contracts that must be preserved (all VERIFIED by code read)

1. URL shape `/{Area}/{Controller}/{Action}` (MVC routing, not REST).
2. Dual response shapes (envelope AND raw) — adapters normalize, backend untouched.
3. Per-endpoint `data_rows` / `total` variance (sometimes `data` / `total`, sometimes bare).
4. Bare-403-on-auth-fail + `X-MG-Auth-Error` header (internal only).
5. `maincode`-scoped reads (`WHERE maincode == auth.maincode`) on every read.
6. `Dtl.json_request()` + pre-declared anonymous `FromJson` POST shapes — field names are contract.
7. `ref string error → success` convention.
8. `X-Mango-Outsorce` misspelling (sic — do not "correct" it).
9. No direct MVC `Json()` returns.
10. File token-in-`id` + inline-vs-attachment semantics.
11. Language redirect + cache + `uiLang` fallback.
12. No SSO.

## 8. Known exceptions

- `ContactType` string-interpolated `maincode` SQL (legacy, preserve).
- `ServiceType_Send_Bug` / `Customer_ReadList` omit `total`; `GetSettings` uses `{ data, total }` keys.
- Docker mode returns empty language payloads.
- `StoreConfig(maincode)` trusts caller-supplied company code (with `MGF.Fake_auth` in sibling
  `StoreAttachFile`) — internal use only.
- Portal auth has no `X-MG-Auth-Error` header; outsource/gateway paths have extra header requirements.

## 9. Verification boundaries

- **Safe to trust:** auth pipelines (all 3 domains), envelope source + dual-shape rule, sampled
  per-endpoint list shapes, localization flow, ownership structure, the 12 legacy contracts.
- **Must inspect source:** any unlisted action body before relying on its shape;
  `Customer_Create` / `Update` field parity; portal `Login` + OTP (`Login.cs:158-228`).
- **Must execute at runtime:** session-expiry (MG_TIME) timing; whether `Customer_ReadList`
  honors server-side `skip` / `take` (matters for virtual scroll); `Dtl.parse_date` edge formats;
  file-download token round-trip; CSM SignalR subscription names (frontend grep first).

## 10. Open decisions

- Nuxt session behavior = OPEN (see `docs/migrations/future-auth-without-sso.md`): do NOT invent
  auth mechanisms, introduce SSO, or change token semantics.
- File-download token minter = [UNKNOWN] (blocks Nuxt file links until found).
- Which `sm_config` keys the frontend needs = [INFERRED] (confirm by usage grep).
- OAuth `test_api` scope consumers are out of CSM scope — ignore unless doing gateway work.

## 11. Freshness / staleness notes

- Backend lives in TFVC and moves independently of this repo — revalidate on: new controllers/actions
  (check envelope-vs-raw), new headers, session-table/auth changes, SignalR method renames.
- Staleness tripwire: any bare-403 or shape mismatch surfacing in Nuxt adapter logs →
  re-inspect that action body first before assuming a backend change.
