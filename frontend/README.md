# Mango CSM — Nuxt frontend

Nuxt 4 replacement for the Vue 2 SPA in `../Website`. Generates a **fully static** bundle that
runs unchanged on **IIS** and on **Linux**.

> **Status: scaffold.** The bootstrap layer, routing hook, and both deployment targets are in
> place. The 218 page//component files in `../Website/Scripts/App/Application` are **not yet
> ported** — that work needs Vue 3 and is tracked in `MIGRATION.md`.

---

## Why static

The API (`MangoWebPoolService`) is **.NET Framework 4.8 — Windows only**. It cannot move to Linux.
So "run on Linux" applies to the frontend alone, and the frontend must stop depending on
ASP.NET to boot.

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

## Deploy — Linux

```bash
docker build -f deploy/Dockerfile -t mango-csm-frontend .
docker run -p 8080:80 \
  -v /etc/mango/config.js:/usr/share/nginx/html/config.js:ro \
  mango-csm-frontend
```

Or without Docker: `npm run generate`, copy `.output/public` to `/usr/share/nginx/html`, and use
`deploy/linux/nginx.conf`.

Mount `config.js` read-only so one image serves every environment.

### Cross-origin note

On Linux the frontend and API are on different hosts. Either:

- **proxy** — keep the `location /service/` block in `nginx.conf` so the browser stays
  same-origin (simplest; the SignalR block is already configured), or
- **direct** — point `window.dataServer` at the API host and enable CORS on
  `MangoWebPoolService` for the `X-Mango-Auth` / `X-Customer-Auth` headers.

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
