# Future Authentication — SSO Retirement

## Status

FUTURE WORK — HISTORICAL FIRST-SLICE FOUNDATION

This is a historical documentation and discovery record captured from the frontend checkout on 2026-09-11. It does not remove SSO or change authentication behavior. The first-slice architecture described here is historical; `frontend/` is the current runtime target, while `Nuxt/` and `/csm-next/` are historical evidence and route context only.

The internal first-slice `SessionAdapter`, authenticated GET `ApiClient`, runtime configuration, and file capability were implemented through PR #4 and exercised by the manual route in PR #8. This does not close AUTH-1: backend/security confirmation of token provenance, validation, lifetime, rotation, revocation, and logout semantics remains required before production cutover. Customer authentication and confirmed provider-specific retirement also remain future work.

Source-backed validation against the separately supplied .NET backend is recorded in [Authentication Contract Validation Evidence](../testcases/auth-contract-validation-2026-09-11.md). That evidence confirms the `X-Mango-Auth` issuance and transport boundary and records the remaining live-environment and security-owner blockers for GitHub Issue #11.

## Project Decision

SSO will not be used in the target architecture.

The target must preserve the authentication, authorization, session, logout, and customer-versus-internal behavior that the application still requires. SSO-specific redirects, callbacks, provider configuration, and token assumptions must be removed or replaced only after their ownership and server-side effects are confirmed.

During the first migration slice, the frontend boundary was documented in [the first-slice ADR](./vue2-to-nuxt-first-slice-adr.md):

- Nuxt 4 with client-side rendering;
- static artifact under the /csm-next/ route prefix;
- first route v_csm_manual_list;
- target-facing RuntimeConfig, SessionAdapter, ApiClient, LocalizationAdapter, and file capabilities;
- no direct target use of legacy globals.

These bullets preserve first-slice context only. They do not define the current runtime boundary;
the current target is `frontend/`.

SSO retirement is future work and does not automatically block creation of the Nuxt shell. The first slice does require the internal non-SSO session contract to remain available through the SessionAdapter.

## Current Authentication Landscape

### Evidence inspected

The analysis reviewed:

- Website/Scripts/App/Application/main.js
- Website/Scripts/App/Application/Routes/routes.default.js
- Website/Scripts/App/Application/Routes/routes.external.js
- Website/Scripts/App/Application/Routes/routes.others.js
- Website/Scripts/App/Application/Components/Pages/Authentication/login.vue
- Website/Scripts/App/Application/Components/Pages/Authentication/login_cust.vue
- Website/Scripts/App/Application/Components/Pages/V2/Authentication/login.vue
- Website/Scripts/App/Application/Components/Center/logout.vue
- Website/Scripts/App/Application/Components/Layouts/re-layout.vue
- Website/Scripts/App/Application/Components/Layouts/customer-layout.vue
- Website/Scripts/Others/Service/xtools.js
- Website/Scripts/App/Application/Components/Pages/webland/landing.vue
- Website/Scripts/App/Application/Components/Pages/CustomerConfigCenter/SetupCompany/v_csm_setup_company.vue
- Website/Page/Default.aspx
- Website/Page/Web.config
- Website/Web.config

The backend service is a separate repository and is not present in this checkout. Endpoint names and frontend call sites are therefore observable; server-side token issuance, validation, cookie behavior, and any hidden provider integration are not yet proven.

Update (2026-09-12): the dev-confirmed new backend `MangoServiceNetCore` (.NET 8) ports the token contracts with parity tests — `X-Mango-Auth` is re-implemented in-repo as `TokenCrypto.cs` (AES-256-CBC + SHA1, replacing the sourceless `MangoWebToken.dll`). Server-side validation semantics still require live-environment and security-owner confirmation before cutover.

### Observable models

| Model | Entry point | Session or credential source | Frontend context | API credential | Logout or expiry |
| --- | --- | --- | --- | --- | --- |
| Internal CSM user | /page/authentication/login/ | Username, password, selected maincode, optional extension; Login response data is stored as mango_auth in localStorage | main.js calls ViewUserAuthentication and populates window.auth, appinfo, userRight, and projectRight | axioscustom2 sends X-Mango-Auth from mango_auth to window.dataServer | logout.vue calls api/public/logout and removes mango_auth; re-layout checks UserAuthentication and reloads or invokes its expiry path |
| Customer portal v1 | /page/authentication/login_cust/ | Customer credentials; Login response data is stored as customer_auth | main.js calls GetInitCustomerData and populates window.customer_auth | axioscustom3 sends X-Customer-Auth from customer_auth | customer-layout calls CSM/AuthCustomer/logout and removes customer_auth |
| Customer portal v2 | /page/v2/Authentication/login/ and /page/v2/ | Customer login plus OTP/password-reset flows | routes.others.js marks the protected page customer_v2 and customer_auth; main.js loads customer data and language | customer_auth through the customer transport | V2 code removes customer_auth and customer_login and returns to the V2 login route |
| Internal-to-customer credential handoff | CustomerData.vue to login_cust.vue | X-Login-Customer in localStorage contains the selected customer credentials for the customer login page | login_cust.vue consumes and deletes the handoff value, then submits the normal customer login | Normal customer login transport | Same customer logout path |
| WebLand token handoff | /page/csm/landing/ | session_id query value is copied to mango_auth by landing.vue | Redirects to the application root after writing the token | Normal internal X-Mango-Auth transport after the handoff | Normal internal logout and expiry behavior |
| Gateway/service authentication | SetupCompany, SetupApplication, and related gateway calls | MangoToken is obtained or loaded for a service operation | Used for CSM/Gateway/GateWayLogin and CSM/Gateway/Dispath requests, not as the normal page auth guard | Existing internal transport plus gateway payload fields | Scope-specific; not the normal user logout model |

No frontend code in the searched runtime scope implements an OIDC, SAML, Azure AD, Entra, MSAL, or named Single Sign-On browser flow. That absence does not prove that the separate backend has no provider integration.

## SSO Evidence

### Classification

| Item searched or found | Evidence | Classification | SSO conclusion |
| --- | --- | --- | --- |
| SSO, SingleSignOn, Single Sign On, OIDC, OpenID, SAML, Azure AD, Entra, and MSAL | No explicit provider or callback implementation was found in the frontend runtime scope | UNKNOWN for the separate backend; no active frontend implementation evidenced | Do not delete anything solely from the negative search; obtain backend/security confirmation |
| oauth2 field in login.vue | Internal Login payload initializes oauth2 to N and no frontend branch sets it to an SSO provider mode | OPTIONAL | It is a compatibility/request flag, not proof of active SSO |
| Allkons ID OAuth in SetupCompany | oauth_id and oauth_pass are edited as company settings; Check Oauth calls ValidateAccessKeyAllkons through CSM/Gateway/Dispath | OPTIONAL | This is an optional external service credential check. Its relationship to user login is not established and must not be treated as the application SSO flow |
| WebLand session_id | landing.vue reads a query parameter, writes mango_auth, and redirects to the root | ACTIVE, but not shown to be SSO-specific | This is a token handoff path and needs security review; it is not an OIDC/SAML callback in the frontend |
| Gateway MangoToken | Several setup pages obtain or consume a gateway token for service calls | ACTIVE, but not user SSO | Preserve only where the future feature still needs the external service; do not use it as the target user-session contract |
| Domain-specific customer redirect | main.js sends hostname csr.mangoconsultant.com to login_cust when the login route is reached | ACTIVE routing behavior; SSO-specificity UNKNOWN | Confirm the domain/business reason before changing it |

### What is and is not deeply coupled

The legacy frontend is deeply coupled to a token-backed authentication contract, but it is not visibly coupled to a browser SSO protocol:

- main.js performs route-time language loading, internal auth initialization, customer auth initialization, permission checks, and hard redirects;
- xtools.js creates separate internal and customer Axios clients and reads their tokens from localStorage;
- re-layout.vue uses auth fields, session_id, company switching, user-online checks, a SignalR channel, and BroadcastChannel coordination;
- logout.vue and customer-layout.vue implement separate logout paths;
- Page/Default.aspx emits runtime globals, but it initializes window.auth as an empty object rather than receiving an SSO assertion;
- the current login pages post credentials to application endpoints and store returned values;
- generic Axios code contains cookie/XSRF and Basic-auth capability, but no application-level use of those mechanisms was found in the authentication paths reviewed.

The target must therefore remove direct legacy coupling through adapters, not remove ordinary authentication.

## Authentication Flow

### Internal user

    /page/authentication/login/
        ↓
    api/public/Login?is_api=N&app_name=CSM
        ↓
    returned token stored as localStorage mango_auth
        ↓
    X-Mango-Auth on the internal API client
        ↓
    Vue Router auth guard calls api/public/ViewUserAuthentication
        ↓
    window.auth + appinfo + menu_right + project_right
        ↓
    route permission checks and page access
        ↓
    re-layout session/user-online checks
        ↓
    api/public/logout plus local token removal

The target equivalent is an explicit SessionAdapter and ApiClient. The target page must not know the localStorage key, header construction, legacy response envelope, or global auth object.

### Customer user

    /page/authentication/login_cust/ or /page/v2/Authentication/login/
        ↓
    CSM/AuthCustomer/Login
        ↓
    returned value stored as customer_auth
        ↓
    X-Customer-Auth on the customer API client
        ↓
    CSM/AuthCustomer/GetInitCustomerData
        ↓
    customer_auth context and customer_auth route guard
        ↓
    CSM/AuthCustomer/logout

Customer auth is a separate model. An internal target route such as v_csm_manual_list must not accidentally use the customer header or customer session initializer.

### Special handoffs

- CustomerData.vue places X-Login-Customer in localStorage so login_cust.vue can perform a normal customer login. This is a credential handoff, not SSO.
- landing.vue copies session_id from the URL into mango_auth. This is a token-bearing URL flow and needs security review before it is carried into a target boundary.
- Gateway pages use MangoToken in service payloads. These tokens are not evidence that the user is logged in through SSO.

## Dependency Inventory

| Dependency | Location | Current role | SSO-specific? | Required after SSO removal? |
| --- | --- | --- | --- | --- |
| Internal credential form and company selection | Components/Pages/Authentication/login.vue | Collects maincode, userid, userpass, and extension and calls Login | No evidence | Yes |
| oauth2 request field | Components/Pages/Authentication/login.vue | Sends the current compatibility value N with Login | Possibly related; no active provider branch found | Verify with backend; not required by the target page itself |
| Internal token storage | login.vue, xtools.js, logout.vue, re-layout.vue | Stores, reads, replaces, and removes mango_auth | No; token semantics are general auth | Yes, behind SessionAdapter |
| X-Mango-Auth | xtools.js | Authenticates internal API requests | No | Yes, until the backend contract is intentionally replaced |
| Internal auth initializer | main.js | Loads auth, appinfo, menu rights, and project rights | No | Yes |
| Vue Router auth guard | main.js and route meta.auth | Redirects unauthenticated users and enforces route access | No | Yes |
| Internal permissions | main.js, menu.vue, pages | Controls menu and project-scoped visibility | No | Yes |
| Internal session check | re-layout.vue | Sends maincode and session_id to UserAuthentication and reacts to auth_status | No | Yes for authenticated shell parity |
| Internal logout | Center/logout.vue | Supports this-device and all-devices logout, then clears mango_auth | No | Yes |
| Customer token and header | login_cust.vue, V2 login, xtools.js, customer-layout.vue | Separate customer session and API model | No | Yes for customer routes, not for the manual first slice |
| Customer login handoff | CustomerData.vue and login_cust.vue | Passes customer credentials through X-Login-Customer | No; security-sensitive legacy handoff | Preserve only if the customer workflow still needs it; do not expose it to the internal target route |
| Customer OTP/password flow | V2/Authentication/login.vue | Customer OTP, password reset, and remembered customer login behavior | No | Yes for customer V2 parity |
| Host runtime globals | Page/Default.aspx | Emits base URLs, empty auth/ui objects, company, and socket values | No | Replace with explicit target runtime/config adapters |
| Host rewrite | Page/Web.config | Rewrites paths under Page to Default.aspx | No | Legacy compatibility remains; target prefix must be separately mapped |
| WebLand session_id | webland/landing.vue | Converts a URL value into the internal token key | Not shown to be SSO; security-sensitive | Needs an explicit security/product decision before target reuse |
| Allkons OAuth settings | CustomerConfigCenter/SetupCompany/v_csm_setup_company.vue | Optional company-level external integration credential test | Optional external OAuth integration, not proven user SSO | Needs product/integration owner decision |
| Gateway token flow | SetupCompany, SetupApplication, and related pages | Authenticates calls to a gateway service | Service-specific, not user SSO | Only for future features that still use the gateway |
| Domain-specific customer login redirect | main.js | Routes one hostname to customer login | Unknown | Confirm before changing; not required by internal manual route |

## Keep / Remove / Replace

| Classification | Direction |
| --- | --- |
| KEEP | Internal username/password login, selected company context, token-backed API authentication, auth context, route guards, permissions, session expiry, logout, and direct-link/refresh behavior |
| KEEP | Separate customer login, customer token/header, customer session initializer, customer logout, and customer OTP/password behavior for customer routes |
| REMOVE EVENTUALLY | Any provider redirect, callback, assertion processing, SSO-only host rule, or SSO-only configuration that backend/security confirms is part of the old architecture |
| REMOVE EVENTUALLY | Allkons OAuth settings only if the integration owner confirms that the external company integration is no longer required. Do not infer this from the project’s no-SSO decision |
| REPLACE | Target-facing direct use of window.auth, window.customer_auth, $xt, localStorage token keys, and legacy response parsing with SessionAdapter and ApiClient contracts |
| REPLACE | Target hard-coded legacy login redirects with a route-aware SessionAdapter redirect that preserves the target prefix and safe return path |
| NEEDS DECISION | Whether the separate backend creates or depends on any SSO session, token, callback, or provider-side redirect |
| NEEDS DECISION | Token lifetime, refresh/rotation, revocation, browser storage, and cross-tab logout requirements for the non-SSO target contract |
| NEEDS DECISION | Whether WebLand URL token handoff remains supported and, if so, whether a short-lived or one-time handoff is required |
| NEEDS DECISION | Whether Allkons OAuth and gateway tokens are in scope for the target authentication boundary or remain isolated integrations |

## Target Authentication Constraints

The target authentication contract must:

1. Use the approved non-SSO internal login/session behavior once the backend owner confirms it.
2. Keep internal and customer auth as separate modes and separate API credentials.
3. Expose an authenticated user context without exposing arbitrary legacy globals.
4. Preserve auth initialization before protected route content is treated as usable.
5. Preserve menu/project permission semantics where a target route requires them.
6. Preserve session-expiry behavior, including a safe login redirect and removal or invalidation of stale credentials.
7. Preserve logout semantics without assuming that local token removal alone invalidates the server session.
8. Keep token values out of URLs, logs, rendered markup, and application component props unless an explicitly approved handoff requires them.
9. Keep SSO libraries, provider SDKs, callback routes, and provider configuration out of the target bundle because SSO is not a target requirement.
10. Keep the compatibility transport inside the adapter layer. Page and component code must not call $xt or construct X-Mango-Auth/X-Customer-Auth themselves.

## Risks

| Risk | Why it matters | Required control |
| --- | --- | --- |
| Hidden backend SSO dependency | Frontend Login looks credential-based, but the separate backend may still issue or validate a provider-derived token | Backend/security confirmation before target cutover |
| Login redirect loop | An unauthenticated target route could redirect to legacy login, then return to the wrong root or target path | Define safe return-path handling and test direct target links and refresh |
| Expired token path is incomplete | re-layout.vue calls messageLogout on session failure, but no definition was found elsewhere in the searched Website scope | Verify or deliberately replace this behavior before relying on it in the target adapter |
| Internal/customer credential confusion | The two transports use different localStorage keys and headers | Make auth mode explicit; add tests that target internal routes cannot use customer auth |
| URL token leakage | landing.vue writes a session_id query value into mango_auth | Security review, referrer/log/browser-history analysis, and an approved replacement or documented exception |
| Permissions initialized by the legacy guard | window.userRight and window.projectRight are populated as part of navigation | Target route metadata and adapter must preserve the required authorization decision |
| Session logout mismatch | Current logout has this-device/all-devices choices and server calls | Confirm server semantics and cross-tab behavior before replacing the shell |
| Domain-specific routing | csr.mangoconsultant.com is forced to customer login | Confirm domain ownership and customer/internal intent before changing hostname behavior |
| Service OAuth mistaken for user SSO | Allkons OAuth and gateway tokens occur in setup workflows | Keep service integration auth isolated from user authentication decisions |
| Browser refresh/deep link | History-mode Vue routing and host rewrites determine whether auth initialization runs | Test direct internal, customer, and target URLs independently |

## Retirement Phases

| Phase | Future action | Exit evidence |
| --- | --- | --- |
| S1 — Confirm authentication source | Inspect the backend/security configuration for Login, ViewUserAuthentication, logout, UserAuthentication, customer auth, and any provider callbacks | Named backend/security owner confirms the non-SSO source and identifies any hidden provider dependency |
| S2 — Isolate SSO-specific behavior | Separate provider/domain/callback/config concerns from ordinary internal, customer, and gateway auth | Inventory maps every candidate to KEEP, REMOVE, REPLACE, or NEEDS DECISION |
| S3 — Define the non-SSO login/session contract | Document token issuance, validation, expiry, logout, storage, cross-tab behavior, and internal/customer separation | Approved SessionAdapter and ApiClient contract with security review |
| S4 — Implement target adapter cleanup | Keep compatibility transport internals behind the target adapter and prevent target components from importing legacy auth helpers | Static scan and code review show no target direct dependency on SSO or legacy globals |
| S5 — Verify auth/session/permission parity | Exercise internal login, direct target URL, refresh, API calls, permissions, expiry, logout, and rollback | Acceptance checklist passes in a representative environment |
| S6 — Identify and retire confirmed SSO paths | Retire only provider redirects, callbacks, SDK/config, or host rules that S1 and S2 prove are SSO-specific | No active consumer remains; backend/security approves retirement |
| S7 — Retirement verification | Re-scan source/configuration, observe login/logout/session telemetry, and retain rollback evidence | No target SSO dependency, no login loops, no lost permission behavior, and legacy compatibility remains until retired |

These phases are a future implementation sequence. They were not executed by this task.

## Future Work Packages

### Package AUTH-1 — Confirm the non-SSO authentication source of truth

Suggested Issue Title: Confirm backend token issuance and validation for the non-SSO target boundary

Goal: Establish which existing backend endpoints issue and validate internal and customer session tokens when SSO is not used.

Scope:

- Confirm the ownership and semantics of `mango_auth` and `customer_auth`.
- Confirm the expected `X-Mango-Auth` and `X-Customer-Auth` transport headers.
- Confirm expiry, logout, company-change, customer-login, and redirect behavior.
- Confirm whether any backend provider or federation dependency exists outside this checkout.

Out of Scope:

- Selecting or adding an SSO provider.
- Rewriting backend authentication in this frontend repository.
- Changing first-slice route ownership.

Acceptance Criteria:

- Internal and customer token provenance is documented by the backend owner.
- The non-SSO contract includes issuance, validation, expiry, logout, and invalid-session behavior.
- Any hidden provider dependency is either ruled out or recorded as an explicit external decision.

Dependencies: Backend owner and security owner; access to the current service authentication contract.

Risk: A hidden backend dependency could invalidate the assumption that the target can use ordinary token sessions without federation.

### Package AUTH-2 — Define the target SessionAdapter and auth transport contract

Suggested Issue Title: Define target-owned SessionAdapter and non-SSO API transport for the first migrated route

Goal: Make target authentication independent from Vue 2 globals, Vuex 3, and direct `$xt` access.

Scope:

- Define the minimum internal session shape required by `v_csm_manual_list`.
- Define how the target obtains safe runtime configuration and sends the existing token headers.
- Define unauthorized, expired-session, logout, and login-redirect behavior.
- Define the boundary between `SessionAdapter` and `ApiClient`.

Out of Scope:

- Customer authentication for the manual-list first slice.
- SSO, OIDC, SAML, MSAL, or federation implementation.
- Migrating legacy Vue 2 controls or the legacy router.

Acceptance Criteria:

- Target page code has no `$xt`, Vuex 3, or arbitrary `window.*` dependency.
- The adapter contract covers the manual route's required internal session and API behavior.
- Invalid or expired sessions produce the agreed legacy-compatible outcome without redirect loops.

Dependencies: AUTH-1; the decided first-slice API adapter and route-prefix contract.

Risk: An incomplete contract can make the target appear independent while silently depending on host-page implementation details.

### Package AUTH-3 — Identify and retire confirmed SSO/provider-specific paths and verify parity

Suggested Issue Title: Identify and retire confirmed SSO-specific authentication dependencies after non-SSO contract approval

Goal: Reduce authentication ambiguity after backend and security owners confirm that SSO will not be used.

Scope:

- Classify the `oauth2` login field, Allkons OAuth integration, domain redirects, and URL token handoffs.
- Remove or isolate only behavior proven to be SSO-specific and no longer required.
- Verify internal login, customer login, logout, expiry, permissions, and route redirects.
- Verify that optional external service OAuth remains available only if explicitly required.

Out of Scope:

- Broad auth redesign.
- Removing ordinary internal or customer token authentication.
- Removing unrelated external integrations without their owners' approval.

Acceptance Criteria:

- No active SSO-specific path remains unintentionally reachable.
- Ordinary internal and customer auth flows retain behavior parity.
- All retained handoffs have documented token lifetime, transport, and leakage controls.
- A route-specific rollback remains possible without restoring database state.

Dependencies: AUTH-1, AUTH-2, backend/security confirmation, and route parity evidence.

Risk: Premature cleanup could remove an optional integration or break domain-specific login and token handoff behavior.

## Acceptance Criteria

SSO retirement is complete only when all of the following are true:

- Backend/security owners confirm that the target login/session path does not depend on SSO.
- No target route imports or invokes an SSO SDK, provider callback, provider redirect, or SSO-only global.
- Internal login, selected company, X-Mango-Auth, auth initialization, permissions, expiry, logout, and refresh behavior pass parity checks.
- Customer routes continue to use their own login/session/header model.
- Allkons OAuth and gateway flows are either intentionally retained as isolated service integrations or explicitly retired by their owners.
- WebLand URL token handoff is either removed, secured and approved, or left legacy-only with a documented boundary.
- Direct target links do not loop through login or lose a safe return path.
- Rollback can disable the target prefix while leaving /page/** and legacy login untouched.

## Rollback / Compatibility Considerations

Do not remove legacy login or legacy token handling as part of target shell creation.

If the target authentication adapter fails:

1. Disable the /csm-next/** mapping or target artifact.
2. Leave /page/**, Page/Default.aspx, the Vue 2 router, legacy Webpack output, and legacy login untouched.
3. Verify /page/authentication/login/, internal API access, customer login, and the route-specific legacy page.
4. Revoke or clear only target-owned temporary state if the target implementation created any.
5. Do not restore a database or change backend data for authentication rollback.

The legacy login paths remain the compatibility fallback until target authentication parity and SSO retirement have both been accepted.

## OPEN AUTH DECISION

### Backend/provider confirmation

- **Question:** Does the separate backend or an upstream host create, validate, redirect, or depend on an SSO session or provider token for any current CSM authentication endpoint?
- **Decision owner:** Backend/platform owner and security owner.
- **Why architecture cannot decide it:** The backend and upstream identity configuration are outside this checkout; frontend call sites do not reveal server-side token provenance.
- **Blocks shell creation:** NO.
- **Blocks route cutover:** YES.

### Non-SSO token contract

- **Question:** What are the approved token lifetime, storage, rotation, revocation, logout, and cross-tab requirements for the target internal session?
- **Decision owner:** Security/platform owner with the backend owner.
- **Why architecture cannot decide it:** The current frontend exposes storage and header names, but not the authoritative security policy or endpoint implementation.
- **Blocks shell creation:** NO.
- **Blocks route cutover:** YES.

### External integration scope

- **Question:** Must Allkons OAuth credentials, gateway MangoToken flows, and WebLand session_id handoff remain available in future target routes?
- **Decision owner:** Product/integration owner with security review.
- **Why architecture cannot decide it:** These are feature-specific integrations and are not required by v_csm_manual_list; their business lifecycle is not encoded in the frontend architecture.
- **Blocks shell creation:** NO.
- **Blocks route cutover:** NO for v_csm_manual_list; YES for a future route that needs one of those integrations.

### Domain routing

- **Question:** Should the hostname-specific customer-login redirect remain after SSO retirement?
- **Decision owner:** Product owner, platform/infra owner, and security owner.
- **Why architecture cannot decide it:** The frontend shows the redirect but not the domain’s operational ownership or customer/internal policy.
- **Blocks shell creation:** NO.
- **Blocks route cutover:** NO for the internal manual route; YES for affected customer-domain routes.

## Handoff Notes

The next developer should:

1. Start with the backend/security confirmation in S1; do not equate the absence of frontend SSO strings with proof that SSO is absent everywhere.
2. Preserve internal and customer auth as separate contracts.
3. Treat localStorage token keys, URL token handoff, and credential handoff as security-sensitive seams.
4. Implement or verify SessionAdapter behavior before target route cutover.
5. Use the existing first-slice ADR for the /csm-next/ boundary and rollback.
6. Do not remove legacy auth until target parity and the SSO retirement acceptance criteria pass.
