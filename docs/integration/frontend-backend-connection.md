# Connecting `frontend/` to the MangoServiceNetCore Backend

| Field | Value |
|---|---|
| **Status** | Integration runbook — written from a working connection, 2026-09-15 |
| **Frontend** | `frontend/` (Nuxt 4.5.2, Vue 3, `ssr: false`, Vite) — the target SPA per root `AGENTS.md` |
| **Backend** | `MangoServiceNetCore` (.NET 8, ASP.NET Core + Kestrel) — separate repository, per-machine path |
| **Verified against** | Backend running on `http://localhost:5075`, frontend dev server on `http://localhost:3000`, live SQL Server |
| **Not covered** | Production/IIS/Docker topology, cutover plan — still open decisions (root `AGENTS.md`) |

## How to read this file

Same discipline as `docs/backend/contract-navigation-knowledge.md`:

```text
[VERIFIED]   observed working against the running stack on 2026-09-15
[OBSERVED]   read in source or config, not exercised end-to-end
[MACHINE]    true on the 2026-09-15 dev machine; re-check on yours
[UNKNOWN]    not established — do not fill with assumption
```

**Source code wins over this document.** If `Mango.Web/Program.cs` or `frontend/nuxt.config.ts`
disagrees with anything here, they are right and this file is stale — fix it.

`§9` is the part to read first when something is broken. Every failure mode listed there was
actually hit and fixed, not imagined.

---

## 1. Topology

```text
browser
  └─ Nuxt SPA            http://localhost:3000/         (frontend/, dev server)
       │  static: /vendor/**  ← synced from Website/ by scripts/sync-vendor.mjs
       │
       └─ XHR + WebSocket → http://localhost:5075/service/**
                              └─ MangoServiceNetCore (Kestrel)
                                   └─ SQL Server (remote, per backend .env)
```

`[VERIFIED]` The frontend never talks to the database. All persistence is behind the API, which
root `AGENTS.md` requires.

`[VERIFIED]` There is **no dev proxy**. The SPA calls the backend cross-origin and CORS allows
it. This works because auth is a header token, not a cookie — see §4.

---

## 2. The `/service` path base — the single most common mistake

`[VERIFIED]` The backend mounts **every** area under a path base, default `/service`:

```csharp
// Mango.Web/Program.cs
var pathBase = Environment.GetEnvironmentVariable("MANGO_PATH_BASE") ?? "/service";
if (!string.IsNullOrEmpty(pathBase)) app.UsePathBase(pathBase);
```

So the origin alone is **not** a valid API root. `window.dataServer` must include it and end in a
slash:

```text
correct    http://localhost:5075/service/
wrong      http://localhost:5075/          → 404 on every call
```

`[VERIFIED]` This value must match `Website/Web.config`'s `dataServer` app-setting, so the legacy
Vue 2 app and the Nuxt app address the same backend.

---

## 3. Configuration knobs

### Frontend — `frontend/public/config.js`

`[VERIFIED]` A plain script served from `public/`. It is **never bundled**, so it is the
per-deployment knob: edit it on the server, no rebuild. It replaces the globals
`Page/Default.aspx` used to inject from `Web.config`.

| Global | Dev value | Meaning |
|---|---|---|
| `window.dataServer` | `http://localhost:5075/service/` | API root, **including the path base** |
| `window.hostServer` | = `dataServer` | File download/host base |
| `window.printServer` | `dataServer + 'PrintApi/Document/Create/'` | Print API |
| `window.baseUrl` / `baseURL` | `origin + '/'` | The SPA's own root, for assets and redirects |
| `window.baseCompany` | `MG` | Default company code |

> `window.baseURL` (capital URL) is defined alongside `baseUrl` because `xtools.js` reads that
> spelling for one of its axios instances. Dropping it leaves that instance with no base URL.

### Backend — `.env` / `appsettings.Development.json`

`[VERIFIED]` The frontend origin must be allowlisted or every call fails preflight:

```ini
cors_allowed_origins=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001
```

`[OBSERVED]` The policy is an explicit allowlist (`SetIsOriginAllowed` + `CorsPolicy.GetAllowedOrigin`),
**not** `AllowAnyOrigin` — that was a deliberate pentest fix. Adding a port means editing this
config; there is no wildcard fallback.

`[VERIFIED]` A second named policy, `"signalr"`, adds `AllowCredentials` and is applied to the hub.

---

## 4. Authentication — header token, not cookies

`[VERIFIED]` This is why no proxy is needed. `xtools.js` reads the token from `localStorage`
**once, at script load**, and sets it as a default header:

```js
axioscustom2.defaults.headers.common['X-Mango-Auth'] = localStorage.getItem('mango_auth') || ''
```

**IMPLICATION** — clearing `localStorage` alone does not log the user out for the rest of the page
session; the dead token keeps being sent. Any code that invalidates a session must clear *both*.
`app/middleware/auth.global.js` does this in `clearExpiredSession()`.

**IMPLICATION** — no `withCredentials`, so plain CORS suffices.

### Flow

1. `POST api/public/Login?is_api=N&app_name=CSM` with `{ maincode, userid, userpass }`
2. On success the token is in `d.data` → stored as `localStorage.mango_auth`
3. Every later call carries it as `X-Mango-Auth`
4. `app/middleware/auth.global.js` runs on **every** route: loads the language bundle, calls
   `api/public/ViewUserAuthentication`, populates `window.auth` / `userRight` / `projectRight`,
   enforces `meta.auth` and menu-permission checks, then hides the `#firstLoading` overlay

`[VERIFIED]` An **expired** token makes the backend answer `401 {"error":"Session expired or invalid"}`
on *every* endpoint — including the otherwise-public `LanguageSelector`. The middleware treats 401
as "not authenticated": it clears the session and retries anonymously, so the login page still
renders. Without that handling an uncaught throw in Nuxt middleware becomes a **500 error page**.

---

## 5. URL shape

`[VERIFIED]` The backend deliberately preserves the legacy URL shape, so ported call sites did not
change:

```text
{dataServer}{Area}/{Controller}/{Action}
```

| Example call site | Resolves to |
|---|---|
| `$xt.getServer('CSM/Center/GetSettings')` | `/service/CSM/Center/GetSettings` |
| `$xt.getServer('api/public/LoginCompanies')` | `/service/api/public/LoginCompanies` |
| `$xt.postServerForm('Anywhere/Center/FileUploadToTemp', fd)` | `/service/Anywhere/Center/FileUploadToTemp` |

`[OBSERVED]` Areas present: `Api`, `CSM`, `Anywhere`, `AnywhereAPI`, `PrintApi`, `Page`, `Mint`,
`Planning`, `QCC`, `Ext_API`, `DC_System`, `AccountingforLabor`.

`[VERIFIED]` Route matching is case-insensitive in practice — both `api/public/...` and
`Api/Public/...` appear in the codebase and both work.

`[VERIFIED]` Some endpoints redirect (`LanguageSelector` → `LangDisplay` for cache-busting). The
redirect target also carries CORS headers, so axios follows it transparently.

---

## 6. Realtime (SignalR)

`[VERIFIED]` The backend uses **ASP.NET Core SignalR**, one hub:

```csharp
app.MapHub<Mango.Web.SignalR.SocketHub>("/signalr").RequireCors("signalr");
```

**Do not reintroduce the SignalR 2.x jQuery client.** It needs a generated `/SignalR/Hubs` proxy
that Core does not serve, and its wire protocol is incompatible. That whole vendor stack
(`jquery.signalR-2.3.0.js`, `signalr-patch.js`, `iwc-all.js`, `iwc-signalr.js`, `MangoSignalR.js`)
has been removed.

`[VERIFIED]` `app/plugins/signalr.client.js` provides the replacement using `@microsoft/signalr`,
keeping the original contract so no call site changed:

```js
const xR = window.signalR(clientMethods, onStartedCallback)
xR.reHub.server.sendNewComment(payload)   // camelCase → hub's PascalCase method
xR.hubProxy.isConnectionOwner()
```

Behaviour worth knowing before you touch it:

- Handlers **accumulate** across separate `window.signalR()` calls — several screens each register
  their own; replacing instead of adding would silently break the others.
- Server calls made before the connection is live are **queued** and flushed on connect. Screens
  rely on this (`window.signalR()` immediately followed by a server call).
- `onclose` clears the memoised start promise, otherwise the client never redials after an explicit
  stop and queued calls strand.
- One connection **per tab** (the old IWC layer shared one across tabs), so `isConnectionOwner()`
  is always true and the 60s `userOnlineCheck` runs per tab.

`[VERIFIED]` Connect → the hub pushes `welcomeMessage`. `sendNewComment` round-trips as
`ReceiveNewComment`.

`[UNKNOWN]` Group-scoped broadcasts (`SendNewCase` → `CSM_PC` group) reach nobody: **nothing in the
frontend joins that group.** `JoinGroup` exists on the hub with no caller. The transport works; the
group wiring is an open question for the feature owner.

---

## 7. Static assets — the `vendor/` rule

`[VERIFIED]` `scripts/sync-vendor.mjs` copies `Website/Content` and `Website/Scripts/Others` into
`frontend/public/vendor/` (gitignored). The legacy app served these at the app root, so **every
legacy asset path is wrong by one directory level**.

```text
legacy / wrong   ${baseUrl}Content/Images/Icon SVG/home.svg
correct          ${baseUrl}vendor/Content/Images/Icon SVG/home.svg
```

**This fails in a way that does not look like a failure.** Nuxt's SPA fallback answers unknown
paths with `index.html`, **status 200, `text/html`** — so `<img>` receives a web page, not a 404,
and just renders a broken-image glyph. When checking, look at the **content-type**, not the status:

```bash
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:3000/vendor/Content/Images/Icon%20SVG/home.svg
```

The same rule applies in `nuxt.config.ts`, where vendor scripts and styles must be referenced from
the app base URL (`${baseURL}vendor/...`) — **relative URLs resolve against the current route** and
404 on every nested page.

---

## 8. AdminLTE body classes

`[VERIFIED]` `Page/Default.aspx` rendered:

```html
<body class="hold-transition skin-black fixed sidebar-mini sidebar-collapse">
```

AdminLTE keys its whole layout off these — `.main-sidebar` / `.content-wrapper` positioning, the
mini/collapsible sidebar, the skin. They are set once via `app.head.bodyAttrs` in `nuxt.config.ts`.
Remove them and the sidebar renders full-width in normal flow with no content offset.

---

## 9. Failure modes (read this first when something breaks)

| Symptom | Cause | Fix |
|---|---|---|
| Every API call 404s | `dataServer` missing the `/service/` path base | §2 |
| CORS preflight fails | Frontend origin not in `cors_allowed_origins` | §3 |
| **500** "Request failed with status code 401" | Expired `mango_auth`; middleware let the throw escape | §4 |
| Still sending a token after clearing storage | `xtools.js` cached it in the axios defaults at load | §4 |
| Login page blank / `$ is not defined` on nested routes | Vendor scripts referenced **relatively**, 404 off-root | §7 |
| Images show broken glyph, network says **200** | Asset path missing `vendor/` → SPA fallback HTML | §7 |
| Sidebar full-width, no content offset | Missing AdminLTE body classes | §8 |
| Screen renders **blank** but route resolves, no error | Vue 2 `<template slot="x">` — Vue 3 routes nothing to `<slot name="body">` | use `<template #x>` |
| `setRowData` of undefined / "No AG Grid modules are registered!" | ag-Grid v33 needs `ModuleRegistry.registerModules` | `plugins/ag-grid.client.js` |
| `$.connection.hub.stateChanged is not a function` | SignalR 2.x vendor stack reintroduced | §6 |

---

## 10. Runbook

### Start the backend

```bash
dotnet run --project Mango.Web/Mango.Web.csproj
```

`[MACHINE]` Path is per-machine — **ask the dev, never hardcode** (root `AGENTS.md`). It was
`D:\Migrate\MangoServiceNetCore` on 2026-09-15. Listens on `http://localhost:5075`
(`Properties/launchSettings.json`). Requires `.env` with a reachable `CONNECTION_STRING`.

### Start the frontend

```bash
npm run dev
```

`[VERIFIED]` Pinned to `--port 3000` in `package.json` because that is what the backend allowlists.
`[MACHINE]` Port **3001 is reserved by Windows** (owned by PID 4) on the 2026-09-15 machine, so
Nuxt's auto-fallback lands on 3002 — which is *not* allowlisted, and every call then fails CORS.
If the port moves, either free 3000 or add the new origin to `cors_allowed_origins`.

### Production build

```bash
npm run build
```

Emits a static SPA to `frontend/.output/public/` (`dist` is a symlink to it). Deployment configs
live in `frontend/deploy/` (IIS `web.config`, nginx).

---

## 11. Verify the connection in four steps

Each step isolates one layer, so a failure tells you where to look.

```bash
# 1. backend alive (path base included)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5075/service/Health

# 2. CORS preflight from the frontend origin, with the auth header
curl -s -i -X OPTIONS "http://localhost:5075/service/CSM/Manual/List" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Mango-Auth,content-type" | grep -i "access-control-allow"

# 3. backend reaches the database — an intentionally invalid probe should be
#    REJECTED BY THE DB, not fail to connect. Never use real credentials here.
curl -s -X POST "http://localhost:5075/service/api/public/Login?is_api=N&app_name=CSM" \
  -H "Origin: http://localhost:3000" -H "Content-Type: application/json" \
  -d '{"maincode":"__probe__","userid":"__probe__","userpass":"__probe__"}'
# expect: {"success":false,"error":"Username or password is not vaild.", ...}

# 4. SignalR hub negotiates
curl -s -X POST "http://localhost:5075/service/signalr/negotiate?negotiateVersion=1" \
  -H "Origin: http://localhost:3000"
# expect: connectionId + availableTransports [WebSockets, ServerSentEvents, LongPolling]
```

`[VERIFIED]` Step 3 returning that exact error is the strongest cheap signal: it proves
browser-origin → CORS → backend → **database** all work, and that the JSON shape matches what
`login.vue` reads (`d.error` / `d.data`).

---

## 12. Open / not established

- `[UNKNOWN]` Production topology — IIS vs Docker, TLS, and whether the SPA is served same-origin
  with the API (which would make CORS moot). Root `AGENTS.md` still lists this as undecided.
- `[UNKNOWN]` Which group the frontend should join for `CSM_PC` broadcasts (§6).
- `[UNKNOWN]` Whether sending `userid` on the SignalR query string is wanted. The hub reads it for
  presence, but the Vue 2 frontend never sent it, so that tracking never worked. It is now sent —
  an addition, not parity.
- `[OBSERVED]` Transient `503`s were seen from the backend under rapid navigation and not traced.
- Screens have been verified to **render**; they have not been verified to be **correct**. No forms
  submitted, no records saved, no data compared against the legacy app.
