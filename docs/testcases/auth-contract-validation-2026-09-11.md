# Authentication Contract Validation Evidence

## Scope and status

This record addresses the source-verifiable portion of GitHub Issue #11, "Production readiness: validate real authentication contract." It covers the internal `X-Mango-Auth` flow used by the Nuxt Manual first slice. It does not authorize production cutover.

Status: **BLOCKED FOR LIVE APPROVAL**. Source inspection, automated target tests, and anonymous/malformed live probes are complete. On 2026-09-13, Smart App Control user-mode enforcement was disabled by the workstation owner, the migrated backend started successfully, and an authorized development SQL Server connection was configured locally. Real-token execution, logout verification, token lifecycle confirmation, and security-owner approval remain blocked because the database password-encryption key is unavailable and no Mango application test identity was provided.

## Authoritative source and provenance

The backend repository establishes the following internal-token flow:

1. `Mango.Web/Areas/Api/Controllers/PublicController.cs` calls `auth.Login(...)` in `Login`.
2. After successful credential validation, `Login` creates the browser credential with `Mango.Core.Security.Token.CreateTokenHex(auth.CreateToken())` and returns it in the response `data` field.
3. `Mango.Web/ClientApp/src/views/Authentication/login.vue` stores that response value in browser local storage under `mango_auth`.
4. `Mango.Core/Controllers/BasedController.cs` reads `X-Mango-Auth`, decodes it with `Token.ReadTokenHex`, and validates the resulting session through `GetAuthorizeAsync`.
5. A rejected, expired, revoked, or otherwise invalid session produces HTTP 401 with a non-secret JSON error. Authorization denial remains a separate HTTP 403 outcome.
6. `Mango.Web/Areas/Api/Controllers/PublicController.cs` delegates `Logout` to `auth.Logout(...)`; the backend implementation removes the applicable server-side session rows for the current device or all devices.

The token is therefore issued and validated by the backend. It is not a static value stored in either repository, and it must not be copied into source, logs, documentation, URLs, or test fixtures.

## Target delivery boundary

The Nuxt target keeps provider details out of page code:

- `SessionAdapter` reads only the established `mango_auth` browser key and returns a credential-free `SessionContext`.
- The infrastructure-only credential provider supplies the token to `ApiClient`.
- `ApiClient` constructs `X-Mango-Auth` inside the transport boundary.
- Manual page code consumes only `SessionAdapter` and `ApiClient`; it does not read local storage or construct authentication headers.
- HTTP 401 invalidates the in-memory session, removes the rejected `mango_auth` value, and invokes the configured recovery route. This matches the established backend client and prevents a stale-token retry loop after refresh.
- HTTP 403 returns a forbidden result without clearing the session or treating permission denial as token expiry.
- A missing credential prevents the API request and redirects `/csm-next/manual` to the configured local login route.
- The local login route renders the Mango company/user/password form, sends credentials only to the backend login endpoint, and stores a successful token through `SessionAdapter` without exposing it to page state.

## Sanitized status matrix

| Scenario | Expected backend result | Target behavior | Current evidence |
| --- | --- | --- | --- |
| Valid credential | Manual endpoint succeeds with authenticated identity | Sends `X-Mango-Auth`; normalizes the successful envelope | Unit contract passes; live token not available |
| Missing credential | HTTP 401; no authenticated request is accepted | Does not send a protected request; redirects to the configured login route without exposing a token | Unit/page tests and browser redirect pass; live backend probe returned 401 |
| Expired credential | HTTP 401 | Clears `mango_auth`, marks session invalid, and enters configured recovery | Unit contract passes; live expiry not executed |
| Revoked credential | HTTP 401 | Same safe invalid-session recovery as expiry | Backend source normalizes invalid session to 401; live revocation not executed |
| Malformed credential | HTTP 401 | Same safe invalid-session recovery; token is never logged | Unit contract passes; live backend probe returned 401 |
| Authenticated but forbidden | HTTP 403 | Returns `forbidden`; does not clear the valid session | Unit contract passes |
| Backend unavailable | Network failure or HTTP 503 when authentication storage is not configured | Returns a non-secret error; protected page remains recoverable | Unit test passes; the currently configured development database is reachable |

## Logout and refresh/rotation

The backend source proves server-side logout supports current-device and all-device session removal. The current Nuxt first slice has no logout control, so end-to-end logout is not claimed.

No general internal-token refresh or rotation contract was proven. Token creation is visible at successful login and selected handoff endpoints, but that is not sufficient evidence of an approved refresh policy. The backend/security owner must confirm lifetime, rotation, revocation timing, cross-tab logout, and whether the optional `oauth2` / `ms_access_token` login branches remain in scope. No SSO dependency was added to the Nuxt target.

Production token-key configuration is also an explicit security gate. The backend token provider first reads `MANGO_TOKEN_PRIVATE_KEY` but retains a source-level compatibility fallback. The fallback value is intentionally not reproduced here. The security owner must verify that every approved environment supplies a managed key, defines rotation and rollback behavior, and determines whether the compatibility fallback can be retired without breaking active sessions.

## Live blocker

The migrated `.NET 8` host now starts at `http://localhost:5075`, reports healthy loaded assemblies, accepts the Nuxt development origin in CORS preflight, and returns the expected 401 responses for missing and malformed credentials. No new Code Integrity event 3077 was observed after the restart.

The Nuxt login page is implemented and was verified in the live browser at `/csm-next/authentication/login/`. A git-ignored local development settings override supplies the authorized SQL Server connection, allows only `http://localhost:3000` to call the backend across origins, and disables all background-job workers for safe interactive testing. The backend connects successfully. A synthetic invalid identity reached the normal login flow and returned a non-secret invalid-credentials envelope rather than HTTP 500 or 503. The supplied snapshot lacked three newer optional `sm_syscode` columns, so `MGF.GetSyscode` now uses compatibility-safe materialization that tolerates older snapshots without changing the database schema.

The remaining database blocker is password decryption. `sm_syscode.encode_userpass` is enabled, but SQL Server reports that symmetric key `key_pwd2` does not exist or the configured SQL login cannot access it. A replacement key cannot decrypt existing passwords, so no key or schema mutation was attempted. The original key and certificate must be restored from the source database, or an authorized database owner must grant the development login access. SQL command error logging now redacts password literals.

Required next evidence after the original database encryption key is restored or made accessible and an authorized Mango application test identity is available:

1. Environment and non-sensitive test identity class.
2. Sanitized request/status results for every row in the matrix.
3. Successful Manual API identity/header verification without token capture.
4. Current-device and all-device logout results.
5. Confirmed lifetime, refresh/rotation, revocation, and cross-tab behavior.
6. Evidence that `MANGO_TOKEN_PRIVATE_KEY` is managed in the deployment environment and the compatibility fallback has an approved disposition.
7. Backend/security-owner approval or explicit blocking decision.

Until those items are attached to Issue #11, production authentication remains unauthorized.
