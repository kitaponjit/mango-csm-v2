# Mango CSM — Nuxt frontend

Nuxt 4 replacement for the Vue 2 SPA in `../Website`. Generates a **fully static** bundle that
runs unchanged on **IIS** and on **Linux**.

> **Status: current runtime target.** The full 218-component, 111-route port is present in this
> Nuxt 4/Vue 3 application. PR #32 completed the CSM Warranty Item parity closeout on `main`;
> `MIGRATION.md` retains detailed evidence and remaining external verification caveats.

---

## Why static

The target API is the separate .NET 8 `MangoServiceNetCore` service. The legacy `Website/` host
remains an ASP.NET Framework application and is the behavioral reference; the target frontend
does not depend on that host to boot.

`ssr: false` + `nuxt generate` gives a plain folder of HTML/JS/CSS:

- no Node process in production
- no `Default.aspx`, no application pool code
- IIS serves it as static files; nginx/Apache/S3/any CDN serves the same folder

SSR is not an option regardless: auth, i18n, and config all arrive as `window.*` globals, and
the app depends on browser-only jQuery/AdminLTE/SignalR.

---

## What replaced `Page/Default.aspx`

| `Default.aspx` did | Now |
|---|---|
| injected 8 config values from `Web.config` | `public/config.js` — a plain file edited per server, loaded first |
| loaded 24 global `<script>` tags in a fixed order | `app.head.script` in `nuxt.config.ts`, same order |
| loaded 19 stylesheets | `app.head.link` in `nuxt.config.ts` |
| `<script src="<%=dataServer%>SignalR/Hubs">` | `public/signalr-hubs.js` (needs `dataServer` at runtime) |
| `router.beforeEach` guard | `app/middleware/auth.global.js` |
| mounted `<router-view>` into `#app` | `app/app.vue` |

`config.js` is **not bundled** — change it on the server and reload, no rebuild. Both deployment
configs mark it `no-cache`.

---

## Build

```bash
npm install
npm run sync:vendor    # copies Website/Content + Website/Scripts/Others -> public/vendor
npm run generate       # -> .output/public
```

`sync:vendor` is what makes the app self-contained. The legacy globals (jQuery, AdminLTE, select2,
tinymce, `xtools.js`, SignalR, …) are not on npm, so they are copied out of the Website tree.
Re-run it whenever those files change.

---

## Deploy — IIS

1. Copy `.output/public/*` into the site root.
2. Copy `deploy/iis/web.config` next to it.
3. Install the [URL Rewrite module](https://www.iis.net/downloads/microsoft/url-rewrite) if absent.
4. Edit `config.js` — set `dataServer` to the API base URL.

The site needs no ASP.NET; an application pool set to **No Managed Code** is enough.

### Test on the local IIS

`deploy/iis/Test-IisDeploy.ps1` does the steps above on this machine's IIS as a throwaway site
(port 8081, folder `C:\inetpub\mango-csm-iis-test`), then checks deep links, content types, cache
headers and that `web.config` is not downloadable. Build first in a normal terminal
(`npm run sync:vendor`, `npm run generate`), then from the repo root in PowerShell **run as
administrator**:

```powershell
powershell -ExecutionPolicy Bypass -File frontend\deploy\iis\Test-IisDeploy.ps1
powershell -ExecutionPolicy Bypass -File frontend\deploy\iis\Test-IisDeploy.ps1 -Remove
```

`-DataServer /service/` (or a full URL) sets `dataServer` in the deployed copy of `config.js`;
`-TestOnly` runs only the checks and needs no admin rights. If the backend is on another host or
port, its `cors_allowed_origins` must include the site's origin, or every page shows a 500.

## Deploy — Docker

From the **repository root** (not `frontend/`):

```bash
docker compose up --build
```

Open http://localhost:8080. This runs the frontend only; the .NET 8 backend is a separate
repository and is not started. Until the backend is reachable, `/service/` calls return 502 but
the site itself loads.

- **Build context is the repo root.** The image runs `sync:vendor` itself, which needs
  `Website/Content` and `Website/Scripts/Others`; `public/vendor` is gitignored, so a fresh clone
  has nothing to copy otherwise. `deploy/Dockerfile.dockerignore` limits the upload to those
  folders and `frontend/` (minus `node_modules`, `.nuxt`, `.output`).
- **Backend calls go through nginx.** Compose sets `DATA_SERVER=/service/`, so `config.js` points
  the browser at the container's own origin and nginx forwards `/service/` to `API_UPSTREAM`
  (default `http://host.docker.internal:5075`, the backend's dev port on the host). Same origin
  means the backend's CORS list does not need the container's port.
- **Overrides:** `FRONTEND_PORT` (default `8080`) and `API_UPSTREAM`, in the shell or a `.env`
  next to `compose.yaml`.

Without compose:

```bash
docker build -f frontend/deploy/Dockerfile -t mango-csm-frontend .
docker run -p 8080:80 --add-host host.docker.internal:host-gateway \
  -e DATA_SERVER=/service/ mango-csm-frontend
```

To configure an environment with a whole file instead, mount it read-only:
`-v /etc/mango/config.js:/usr/share/nginx/html/config.js:ro` (then `DATA_SERVER` is ignored).

Files: `deploy/Dockerfile`, `deploy/Dockerfile.dockerignore`, `deploy/docker/default.conf.template`
(nginx site), `deploy/docker/40-mango-config.sh` (applies `DATA_SERVER` at startup).

## Deploy — Linux without Docker

`npm run sync:vendor && npm run generate`, copy `.output/public` to `/usr/share/nginx/html`, and
use `deploy/linux/nginx.conf`.

### Cross-origin note

On Linux the frontend and API are on different hosts. Either:

- **proxy** — keep the `location /service/` block in `nginx.conf` so the browser stays
  same-origin (simplest; the SignalR block is already configured), or
- **direct** — point `window.dataServer` at the API host and enable CORS on the target service for
  the `X-Mango-Auth` / `X-Customer-Auth` headers.

The proxy route is recommended — it avoids CORS preflight on every `$xt` call and keeps SignalR
negotiation simple.

---

## Routing

`app/router.options.js` feeds Vue Router the existing route table from `app/routes/` instead of
using file-based routing.

This is deliberate. The 111 routes have URLs like `/page/Transaction/v_csm_trn_001/` that are
bookmarked, linked from the backend, and tied to `menu_id` permission checks. Mirroring them as a
file tree risks changing URLs silently. Porting the route files verbatim preserves every URL and
every `meta` flag.

File-based routing can be adopted per-module afterwards; Nuxt merges both.

---

## Linux portability

Linux filesystems are case-sensitive, so a wrong-case import that works on Windows fails in CI.
`../Website` currently has **16** such imports (`../../center/report-condition.vue` where the
folder is `Center/`). These must be corrected as files are ported. See `AGENTS.md` §12.14.
