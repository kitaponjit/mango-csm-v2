# Backend Contract & Navigation Knowledge

| Field | Value |
|---|---|
| **Status** | Agent Navigation Cache (refactored from reconnaissance report, 2026-09-12) |
| **Backend** | `MangoWebPoolService-DEV` (.NET Framework 4.8, MVC5 + WebAPI + OWIN + EF6, TFVC) |
| **Backend governance** | `MangoWebPoolService/AGENTS.md` §§4–7 + `CLAUDE.md` (authoritative; read before endpoint work) |
| **Backend path** | Per-machine — ask the dev, verify `Test-Path` for `MangoWebPoolService.sln`, never hardcode |
| **Method** | READ-ONLY recon (partial-targeted coverage, marginal-gain stop); this file is a refactor only — no re-scout, no new backend facts |

## How to read this file

Two layers. **Layer A (§§1–9)** is what an Agent reads before starting work — compact, decision-oriented.
**Layer B (§10)** proves why — source locations and implementation evidence for when verification is needed.
Rule: **source code wins over this document** (see §8).

Statement discipline — never merged into one sentence:

```text
FACT           → what the source confirms
IMPLICATION    → what the fact means for frontend / future agents
RECOMMENDATION → what the agent should do (labeled as such, not as backend behavior)
POLICY         → rule from governance or explicit decision (labeled with its source)
```

Status discipline:

```text
[VERIFIED]           backend source read, owner located
[OBSERVED]           structure/surface seen, behavior not fully traced
[INFERRED]           extrapolated — do not trust blindly
[UNKNOWN]            not found — do not fill with assumption
[REQUIRES_EXECUTION] runtime evidence needed
[REQUESTED]          frontend expectation, NOT yet confirmed by backend — never upgrade to VERIFIED
```

Knowledge classes used below: `CONTRACT` · `COMPATIBILITY CONSTRAINT` · `OBSERVED CONVENTION` ·
`LEGACY QUIRK` · `NAVIGATION HEURISTIC` · `SECURITY/AUTH CONSTRAINT` · `RUNTIME-DEPENDENT` · `OPEN DECISION`.

---

# LAYER A — Agent Navigation Knowledge

## 1. Quick Navigation Map

```text
Auth / session (internal) → Authentication.GetAuthorize          (E1)
Portal auth               → _BasedCustomerController / Models/Customer/Login.cs  (E2)
Manual listing            → CSM/Manual/ManualController → Models/Manual          (E4)
Customer CRUD             → CSM/Master/MasterController → Models/Customer.cs     (E5)
Lookups / settings        → CSM/Center/CenterController → Models/Center          (E6)
Config                    → CSM/Config/ConfigController → Models/Config          (E7)
Shared ERP                → Areas/Anywhere/Controllers/{Module}Controller        (E8)
File download             → Api/FileController.DownLoad (+ verbatim token pass-through) (E9)
Print / documents         → PrintApi/DocumentController                         (E10)
Realtime                  → SignalR/GlobalHubs.cs (SocketHub)                    (E11)
Language                  → Api/PublicController.LanguageSelector/LangDisplay   (E12)
```

`E#` = evidence entry in §10. **Do not start with repo-wide search unless the target is genuinely unknown**
(`NAVIGATION HEURISTIC`).

## 2. Critical Contracts

### 2.1 Authentication Contract Map

**Internal** (`CONTRACT` + `SECURITY/AUTH CONSTRAINT`) [VERIFIED — E1]

```text
FACT:        Header X-Mango-Auth (hex via MangoWebToken.dll → JSON) → Authentication.GetAuthorize
             → hr_emp lookup → session row app_authen
             (calendar-checked) or app_authen2 (+1 month). last_access touched unless
             X-Mango-No-Touch: Y.
FACT:        Missing/invalid token does NOT 403 in OnAuthentication — sets X-MG-Auth-Error
             header, is_authenticated=false; each controller's OnActionExecuting returns
             bare HTTP 403 with NO envelope (CSM pattern: AccessDeniedStatus()).
IMPLICATION: Adapters must surface X-MG-Auth-Error and treat bare 403 as session-expired.
RECOMMENDATION: Send X-Mango-Auth + X-Mango-Session-ID + X-Log-Code + X-Edit-Mode
             (+ X-Mango-No-Touch where applicable). Session-expiry (MG_TIME) timing is
             RUNTIME-DEPENDENT.
```

**Customer portal** (`CONTRACT`, separate pipeline) [VERIFIED — E2]

```text
FACT:        Portal controllers inherit _BasedCustomerController (NOT _BasedController).
             X-Customer-Auth → CustomerAuthorize.GetCustomerAuthorize; session
             app_customer_authen(session_id, customer_code), +1h sliding touch; identity
             ar_cust UNION mg_csr_line_member; default maincode="MG1".
FACT:        Failure → cus_auth.is_authen=false → bare 403. No X-MG-Auth-Error on this path.
IMPLICATION: Internal and portal tokens are NOT interchangeable. Portal uses its own
             login/logout/language endpoints on AuthCustomerController (portal ChangeLanguage exists:
auth-gated, persists lang_web).
```

**Local ASP.NET** (`CONTRACT`) [VERIFIED — E1]

```text
FACT:        X-Post-Back-Token header + postback_token cookie both present and differ
             → immediate 403 before any auth decode. Either absent → check skipped.
IMPLICATION: Nuxt useApiClient must NOT send this header (or must mirror the cookie).
             (Frontend integration rule — not backend behavior.)
```

**Machine-to-machine OAuth** (`CONTRACT`, negative scope) [VERIFIED — E3]

```text
FACT:        OAuthController/OAuthAttribute, client_credentials only — for external APIs,
             unrelated to CSM/Anywhere UI login (token headers).
POLICY:      No SSO in target (source: root AGENTS.md migration constraint).
             No SAML/OIDC exists in backend; keep token-header login.
```

**Exceptions** (`LEGACY QUIRK` / `OBSERVED CONVENTION`): outsource path `X-Mango-Outsorce: Y`
(sic spelling, `GetAuthorizeOutSource`); gateway path needs `X-Mango-Gateway: Y` + token match.
Portal Login+OTP round-trip untraced — inspect `Login.cs:158-228` before rebuilding login.

### 2.2 Response Contract Map

```text
Response Contract
├── Envelope   CONTRACT [VERIFIED — E13]: {success, error, data}, success =
│              IsNullOrEmpty(error), always HTTP 200. Built ONLY in
│              _BasedController.JsonContentResult(data,error), mirrored in
│              _BasedCustomerController. Variants: JsonContentResultEvolt /
│              JsonContentResultCenter (200-vs-400). Rights/auth gates = bare 403.
├── Raw JSON   CONTRACT [VERIFIED — E13]: raw JsonContent(obj), unwrapped. Used by
│              ManualReadList/V2/ReadPicture, Config_ReadList, Customer_Read,
│              GetSettings, Maincomp, StoreConfig.
├── List variants  OBSERVED CONVENTION [VERIFIED sampled — E14]:
│              ContactType/Priority/ServiceType/RequestType → {data_rows,total};
│              ServiceType_Send_Bug → {data_rows}, NO total; Customer_ReadList → {data_rows:{data,total}}
│              nested (server-paged per model);
│              GetSettings → {data,total} keys; Maincomp/StoreConfig/Manual* → raw.
├── Exceptions KNOWN (details in §5 and §10-Evidence): docker-mode empty
│              language payloads; StoreConfig caller-supplied maincode (internal only).
└── Normalization strategy  NAVIGATION HEURISTIC:
                           read rsp.data.data_rows ?? rsp.data.data ?? rsp.data;
                           .total optional. For a NEW endpoint, inspect its action body
                           (10–30 lines) before assuming sibling behavior — never assume
                           siblings are identical.
```

### Claim C1 — No single global response contract [VERIFIED]

```text
Status: VERIFIED (JsonContent ×166 vs JsonContentResult ×458 across CSM controllers;
        4 representative endpoints: canonical ContactType, complex Customer_Create,
        exceptions GetSettings + ServiceType_Send_Bug)
Scope: sampled CSM endpoints; pattern presumed — verify per-action.
Implication: adapters normalize; backend untouched. "Global list wrapper" assumption is dead.
Navigation: per-endpoint action body (§10-E14). Stop when envelope-vs-raw + list keys known.
Escalation: re-inspect if adapter logs a shape mismatch (see §8).
```

### 2.3 Localization, File/Print, Realtime (compact contracts)

- **Localization** (`CONTRACT`) [VERIFIED — E12]: `LanguageSelector?lang_code=TH` → 302 to
  `LangDisplay?lang_code&last_edit=…` → `{success, data:{lang:{langList,userLang}, uiLang}}`,
  file-cached, 1-yr OutputCache. Adapter: follow redirect, cache by `last_edit`,
  `uiLang[var] ?? var`. `DD/MM/YYYY` is FRONTEND display only (backend `en-US`, ISO-local dates).
- **File download** (`CONTRACT`) [VERIFIED — E9]: `GET /Api/File/DownLoad?…&id…`;
  `id` is hex-tokenized path unless `noToken`; inline vs `application/octet-stream` semantics.
  Token minted server-side in read-lists/uploads/exports via MGF.CreateTokenHex (stateless hex, no DB/expiry); Nuxt cannot mint (needs MangoWebToken.dll key) — pass minted filepath/pathto_hex/rsp.data verbatim; noToken forbidden (see §7).
- **Print** (`CONTRACT`) [OBSERVED — E10]: `Areas/PrintApi/Controllers/DocumentController.cs:33-310`.
- **Realtime** (`OBSERVED CONVENTION`) [OBSERVED/INFERRED — E11]: SignalR 2 `SocketHub`
  (`/signalr`); row-lock + case-comment events; auth via token PARAM, not header.
  Which events CSM UI subscribes needs a frontend grep.

## 3. Capability / Ownership Map

```text
CSM/Center    lookups + GetSettings          → CenterController → Models/Center
CSM/Master    Customer/Warranty CRUD + Excel → MasterController → Models/Customer.cs
              (≠ Models/Center/Customer.cs CM/AR readlists — TWO parallel customer models)
CSM/Manual    Manual/FAQ                     → ManualController → Models/Manual
CSM/Config    Config/Active/Holiday/…        → ConfigController → Models/Config
Portal        login/data/language/OTP        → AuthCustomerController + CustomerDataController
              (on _BasedCustomerController) → Models/Customer/Login.cs
Anywhere/*    ERP core, 29 controllers       → {Module}Controller → Models/{Module}
              (screen-code = model name = Vue filename)
AnywhereAPI   per-customer integrations      → CSMController (LoginMaintenance/…)
Api           File + LanguageSelector        → FileController / PublicController
PrintApi      documents                      → DocumentController
SignalR       realtime hub                   → GlobalHubs.cs (SocketHub)
```

Route shape `/{Area}/{Controller}/{Action}` (`CONTRACT`, MVC routing, not REST).
POST field names via `Dtl.json_request()` + pre-declared `FromJson` shapes are contract
(e.g. Create/Update: `info/address/mobile/contact`).

## 4. Navigation Recipes (with stop conditions)

**R1 — Manual listing change.** Start: `ManualController.cs:27-43`. Inspect: `Models/Manual/*`
(note: raw responses, not envelope). Continue if: query/filtering/pagination/persistence changes.
Stop when: response contract + controller/model behavior understood. Escalate if: generated-query
or runtime behavior matters. Evidence: E4.

**R2 — Customer CRUD change.** Start: `MasterController.cs:1051-1094`. Inspect: confirm which of the
two customer models applies. Continue if: field shapes change. Stop when: request/response parity
understood. Escalate if: round-trip write behavior must be proven (execute). Evidence: E5.

**R3 — Session/login change.** Start: `_BasedController.cs:44-99` → `Authentication.GetAuthorize`.
Portal: `_BasedCustomerController` → `Models/Customer/Login.cs`. Stop when: validator + failure mode
mapped. Continue if: validator chain or session sources change. Escalate if: expiry timing or OTP flow (execute / inspect `Login.cs:158-228`). Evidence: E1, E2.

**R4 — New list endpoint.** Start: its action body (10–30 lines). Inspect: `JsonContentResult` vs
`JsonContent(` in that controller. Stop when: envelope-vs-raw + list keys known. Escalate if:
paging is server-side and UI depends on it (execute). Evidence: E13, E14.

**R5 — File-link feature.** Start: `FileController.DownLoad`. Take the minted token from the
read-list/upload/export response (filepath/pathto_hex/rsp.data) and pass it verbatim — never
construct ids from raw paths. Stop when: link round-trips. Escalate if: orphan path with no
minting read (needs backend mint proxy — do not invent). Evidence: E9.

**R6 — Config bootstrap.** Start: `GetSettings` (`mg_csr_config`) vs `StoreConfig` (`sm_config`) —
DISTINCT tables. Inspect: frontend usage grep for the consumer split. Continue if: new config keys appear.
Stop when: key ownership mapped. Escalate if: table ownership unclear. Evidence: E6, E8.

## 5. Compatibility Constraints

**Must Preserve** (`COMPATIBILITY CONSTRAINT`): 3 auth domains + token headers; dual
envelope/raw compatibility; per-endpoint list variance; bare-403 + `X-MG-Auth-Error` (internal);
`maincode`-scoped reads; `FromJson` field names; `ref string error → success`; file token-in-`id`
+ inline/attachment semantics; language redirect+cache + `uiLang` fallback; `/{Area}/{Controller}/{Action}`;
no direct MVC `Json()` returns.

**Legacy Quirks** (`LEGACY QUIRK`, observe — do not normalize incidentally):
`X-Mango-Outsorce` misspelling; inconsistent response shapes; `ContactType` string-interpolated
`maincode` SQL (see security note below).

**Do Not Assume** (`NAVIGATION HEURISTIC`): envelope is global · every list has `total` ·
siblings behave identically · `DD/MM/YYYY` is backend-enforced · portal accepts internal tokens.

**Migration Constraints:** no SSO (`POLICY`, source: root AGENTS.md); Nuxt adapters adapt to
existing backend behavior — no backend redesign for the target (`IMPLICATION`).

**Security-reviewed observations** (fact ≠ policy):

```text
OBSERVED: ContactType builds SQL with string-interpolated maincode (not parameterized).
RISK: legacy unsafe pattern.
SCOPE DISCIPLINE (recommendation, not backend policy): do not silently expand unrelated
refactoring during feature work; if modifying this path, reassess separately.

OBSERVED: StoreConfig trusts caller-supplied maincode (sibling uses MGF.Fake_auth).
RISK: company-code spoofing if exposed beyond internal callers.
SCOPE DISCIPLINE: internal use only — never expose to portal; reassess if the call path changes.
```

## 6. Verification Boundaries

- **Trust (no re-traversal):** auth pipelines, envelope source + dual-shape rule, sampled list
  shapes, localization flow, ownership structure, §5 constraints, recipes R1–R6 start points.
- **Inspect source:** any unlisted action body before relying on its shape; `Customer_Create/Update`
  field parity; portal Login+OTP; SignalR subscription names (frontend grep first).
- **Execute runtime:** MG_TIME expiry timing; `Customer_ReadList` server-side `skip/take`
  (matters for virtual scroll); `Dtl.parse_date` edge formats; file-token round-trip.

## 7. Open Decisions (remain open — do not invent)

1. Nuxt session behavior — OPEN (see `docs/migrations/future-auth-without-sso.md`): no new auth,
   no SSO, no token-semantics change.
2. File-download token minter — FOUND: MGF.CreateTokenHex in read-lists/uploads/exports (E9); Nuxt passes minted tokens through, cannot mint.
3. `sm_config` keys the frontend needs — INFERRED (confirm by usage grep).
4. Extra send-headers (`X-Mango-Session-ID`, `X-Log-Code`, `X-Edit-Mode`) — backend reads them
   [VERIFIED]; current `xtools.js` coverage [REQUESTED] (verify by frontend grep before Nuxt port).

## 8. When NOT to Trust This Knowledge

Re-inspect source (that action/controller first) when ANY of these fires — **source wins**:

```text
- backend branch/TFVC version changed under you
- new controller/action introduced
- auth/session implementation changed
- response shape mismatch appears in adapter logs
- Nuxt adapter receives unexpected bare 403
- file token behavior changes
- SignalR method names change
- any statement here contradicts code you are reading
```

## 9. Traversal Reduction (what this cache eliminates)

```text
Known task              Old traversal                                        Cached start + stop
Manual list change      repo search → CSM → Manual → controller → model     R1: ManualController:27-43; stop at contract understood
Customer CRUD           search → which Customer model?                      R2: MasterController:1051-1094 + 2-model warning
Session/login           search auth infra                                   R3: _BasedController:44-99 → GetAuthorize
New list shape          assume sibling sameness (WRONG)                     R4: read 10–30-line action body; stop at keys known
File links              search File infra                                  R5: DownLoad + verbatim token pass-through
Config keys             confuse mg_csr_config vs sm_config                 R6: distinct-table rule + usage grep
```

## 10. Freshness (operational)

- **Stable:** ownership boundaries, area structure, traversal spine, auth pipelines, no-SSO policy.
- **Potentially volatile:** endpoint response shapes, session behavior/timing, SignalR methods,
  config keys, file-token mechanics.
- **Revalidation trigger:** any contract mismatch → revalidate that action first (§8).
  Backend moves independently in TFVC — never assume this file tracks it in real time.

---

# LAYER B — Evidence / Deep Reference

E1 Internal auth: `Controllers/_BasedController.cs:44-99` (pipeline incl. post-back guard `:44-50`,
envelope builders `:137-196`) · `MangoWebPool/Authentication.cs:1468-1620` (`GetAuthorize`),
`:1665` (outsource) · `Areas/CSM/Controllers/CenterController.cs:11-16`,
`ManualController.cs:17-22` (`OnActionExecuting` gates) · `Global.asax.cs:20` (`en-US` culture).
E2 Portal: `Areas/CSM/Controllers/_BasedCustomerController.cs:16-47` (pipeline,
`JsonContentResult` `:63-80`) · `Areas/CSM/Models/Customer/Login.cs:69-145`
(`GetCustomerAuthorize`), `:158-228` (Login+OTP, UNTRACED) · `CustomerDataController.cs`
(403 gate).
E3 OAuth/negative-SSO: `_BasedController.cs:222-340` (`OAuthController`, `OAuthAttribute`).
E4 Manual: `ManualController.cs:27-43` · `Models/Manual/*` · `CSMAreaRegistration.cs` (route shape).
E5 Customer CRUD: `MasterController.cs:1051-1057` (ReadList → `{data_rows:{data,total}}` nested,
`:1067-1094` (Create/Update shapes) · `Models/Customer.cs` vs `Models/Center/Customer.cs`.
E6 Center/lookups: `CenterController.cs:174-191` (ContactType `{data_rows,total}`),
`:113-129` (Send_Bug, no total), `:356-360` (GetSettings raw) ·
`Models/Center/DataCenter.cs:105-117` (`{data,total}`).
E7 Config: `ConfigController.cs` (CSM) → `Models/Config/*`.
E8 Anywhere: `Anywhere/Controllers/APIController.cs:294-309` (StoreConfig raw) ·
`CenterController.cs:653-667` (Maincomp raw) · `AnywhereAPI/Controllers/CSMController.cs`.
E9 File: `Areas/Api/Controllers/FileController.cs:72-130` (DownLoad body).
E10 Print: `Areas/PrintApi/Controllers/DocumentController.cs:33-310`.
E11 SignalR: `SignalR/GlobalHubs.cs:13-321` · OWIN `StartUp.cs:257-266`.
E12 Language: `Areas/Api/Controllers/PublicController.cs:1192-1285` (LanguageSelector/LangDisplay,
LangDisplay2 file-based) · `Authentication.cs:1600` (`lang_web`) · `AuthCustomerController.cs`
(portal ChangeLanguage: auth-gated lang_web setter).
E13 Envelope: `_BasedController.cs:137-196` vs raw `JsonContent(`; customer mirror
`_BasedCustomerController.cs:63-80`.
E14 List-shape sampling: canonical ContactType + complex Customer_Create + exceptions GetSettings /
Send_Bug; counts `data_rows` ×63+102+24, `JsonContent` ×166 vs `JsonContentResult` ×458 (CSM).
Remaining actions OBSERVED via counts, not per-action reads.
