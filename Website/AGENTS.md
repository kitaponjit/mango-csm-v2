# AGENTS.md

Knowledge base for AI coding agents working on **Mango CSM (Website)**.
This is the single source of truth for project conventions — `CLAUDE.md` defers to this file.

---

## 1. Working Agreement (read first)

1. **Think before coding.** Keep changes simple and surgical; define verifiable success criteria before editing.
2. **NEVER read files inside `node_modules/`.** It is third-party code. Use `package.json` for dependency info.
3. **Write edits like a human developer would.** Match the surrounding file's style, naming, structure, and idioms so a change blends in.
4. **Do NOT add code comments after editing.** No explanatory/AI-style comments. Keep a comment only if it already existed there, or the user explicitly asks for one.
5. **Do NOT run `npm run dev` / `npm start` / `npm run build` yourself.** A watch build is normally already running and rebuilds on save. Only build manually when explicitly asked.
6. **Do not invent endpoints.** If a feature has no backend data in the CSM or ERP areas, say so.

---

## 2. Project Overview

Enterprise Customer Service Management web app.

| Layer | Technology |
|---|---|
| Frontend | Vue.js **2.6.14**, Vuex 3, Vue Router 3 (history mode) |
| Bundler | Webpack 5 + `webpack-merge`, Babel 7, vue-loader 15 |
| Host page | ASP.NET Framework **4.8** (IIS) — `Page/Default.aspx` |
| API backend | `MangoWebPoolService-DEV` — .NET Framework **4.7.2**, separate solution |
| Database | SQL Server (accessed server-side only) |

The Vue app is compiled to a bundle and mounted into `#app` inside `Page/Default.aspx`. The frontend never touches the database — it talks REST + SignalR.

### Key UI libraries

- **ag-Grid Enterprise v26** — the primary data table (`ag-grid-community` / `-enterprise` / `-vue` all pinned to `26`)
- **ECharts 5** (`echarts-for-vue`) and **Chart.js 2** — visualizations
- **FullCalendar 6**, **Handsontable 16** — calendar and spreadsheet grids
- **AdminLTE + Bootstrap 3** — page chrome (loaded from `Content/Library`, not npm)
- **jQuery**, **jquery-confirm**, **toastr**, **select2**, **moment**, **decimal.js**, **jslinq** — legacy globals loaded via `<script>` tags in `Default.aspx`, *not* imported by the bundle

---

## 3. Build & Development

```bash
npm run dev         # Webpack watch + browser-sync; writes Scripts/Bundle, IIS serves it
npm start           # alias for npm run dev
npm run build       # production build (minify + source maps)
npm run build:prod  # same as build (npm run pub is another alias)
```

- **browser-sync:** `http://localhost:4060`, proxying the IIS site at `http://localhost:4061`
- **Entry point:** `Scripts/App/Application/main.js` → **output:** `Scripts/Bundle/Application.js` plus route-level split chunks in the same folder. **Deploy the whole `Scripts/Bundle` folder.**
- Entries are auto-discovered: `webpack.common.js` scans `Scripts/App/*/main.js`, so each folder under `Scripts/App/` containing a `main.js` becomes a bundle named after the folder.

### Webpack config layout

| File | Role |
|---|---|
| `webpack.common.js` | shared: entry discovery, loaders, `vue$ → vue/dist/vue.esm.js` alias, asset rules |
| `webpack.dev.config.js` | merged dev: filesystem cache, no minify, no splitChunks, `BrowserSyncPlugin`, eval source maps |
| `webpack.prod.config.js` | merged prod: Terser (keeps `console`), filesystem cache in `.webpack-cache-prod`, `LimitChunkCountPlugin` max 100 |
| `webpack.config.js` | **legacy leftover** — the old single-file prod config. Not referenced by any npm script. Do not edit it. |

**There are no automated tests in this project.** Verify changes by exercising the running dev build in the browser.

---

## 4. HTTP / API Layer

Four Axios instances live in `Scripts/Others/Service/xtools.js`, alongside the `$xt` helper object. This file is loaded as a plain `<script>` (not bundled), so `$xt`, `$msg`, `$linq`, `$notify`, `moment`, `Decimal` are **global** — never `import` them.

| Instance | Base URL | Auth header | Purpose |
|---|---|---|---|
| `axioscustom` | `window.baseURL` | `X-Post-Back-Token` | Local ASP.NET endpoints |
| `axioscustom2` | `window.dataServer` | `X-Mango-Auth` (`localStorage.mango_auth`) | **Main internal CSM API** |
| `axioscustom3` | `window.dataServer` | `X-Customer-Auth` (`localStorage.customer_auth`) | Customer portal API |
| `axiosLog` | `http://localhost:5091/` | `X-Mango-Auth` | Dev log server |

### `$xt` request helpers

**Choosing the right one matters — internal and customer auth are fully separate.**

```js
// internal CSM (axioscustom2)
await $xt.getServer(url)
await $xt.postServerJson(url, data)
await $xt.postServerForm(url, formData)

// customer portal (axioscustom3)
await $xt.getCustomerServer(url)
await $xt.postCustomerJson(url, data)
await $xt.postCustomerForm(url, formData)

// local ASP.NET (axioscustom)
await $xt.getLocal(url)
await $xt.postLocalJson(url, data)
await $xt.postLocalForm(url, formData)
```

### Standard response envelope

```js
{ success: true|false, error: '...', data: { ... } }
```

List payloads sit at `rsp.data.data_rows.data` with the count at `rsp.data.data_rows.total`.

**Always check `rsp.success` and surface errors via `$msg.alert`:**

```js
try {
  let rsp = await $xt.getServer(`CSM/Master/Customer_ReadList?${params}`)
  if (!rsp.success) throw rsp.error
  this.customerList = rsp.data.data_rows.data
  this.customerTotal = rsp.data.data_rows.total
} catch (ex) {
  $msg.alert('System Error', ex, 'danger')
}
```

### `$xt` utility methods

`isEmpty()`, `isObjectEmpty()`, `int()`, `dec(x, n)`, `formatNumber(x, n)`, `formatDate(d, fmt)` (default `DD/MM/YYYY`), `replaceZeroStart(n, digits)`, `checkEmpty(obj, props)`, `strStartWith()`, `strContains()`, `textLength(text, max)`, `sleep(ms)`, `removeRow(arr, idx, keyItem)`, `sumTotal(tbl, field, decimals)`, `generateRandomString(len)`, `showResult()`, `showError()`, `queryString`, `cookie`.

Printing: `$xt.findSelectFormPrint(...)`, `$xt.printServiceParams(...)`, `$xt.printServerPath(...)`, `$xt.mergeDocumentPath(...)`.

### Global dialogs (`Scripts/Others/Service/alert-service.js`)

```js
$msg.alert(title, message, type)   // type: 'success' | 'danger' | 'warning' | 'info'
await $msg.confirm(text)           // resolves truthy on OK
await $msg.prompt(text)
$notify.success(text)              // toastr
```

---

## 5. Routing & Permissions

Routes are split per module in `Scripts/App/Application/Routes/` and aggregated in `Scripts/App/Application/routes.js`.

| File | Covers |
|---|---|
| `routes.default.js` | auth, home |
| `routes.transaction.js` | TRN_001–TRN_004 + |
| `routes.master.js` | master data |
| `routes.report.js` | reports |
| `routes.dashboard.js` | dashboards |
| `routes.config.js` / `routes.customerconfigcenter.js` | configuration |
| `routes.external.js`, `routes.faq.js`, `routes.manual.js`, `routes.tools.js` | misc modules |
| `routes.custommango.js` | custom features |
| `routes.others.js` | exports `errorRoutes`, `approveRoutes`, `trackingRoutes`, `v2Routes`, `weblandRoutes`, `emptyRoutes` |

`errorRoutes` is spread **last** in `routes.js` because it contains the `path: "*"` wildcard. Keep it there.

### Route shape

```js
{
  name: 'v_csm_trn_002',
  path: '/page/Transaction/v_csm_trn_002/',
  component: () => import(`../Components/Pages/Transaction/v_csm_trn_002.vue`),
  meta: {
    auth: true,
    mangoMenu: {
      menu_name: 'CSM_WEB',
      menu_id: '10400',
      checkUserRight: true,
    },
  },
}
```

Always use the dynamic `import()` form — it is what produces the route-level split chunks.

### `meta` flags (enforced by the guard in `main.js`)

| Flag | Effect |
|---|---|
| `auth: true` | requires internal login; loads `window.auth`, `appinfo`, `userRight`, `projectRight` |
| `mangoMenu.checkUserRight: true` | denies unless `userRight` has a matching `menu_id` with `isenabled == 1` |
| `mangoMenu` without `checkUserRight` | still fetches rights (for control-panel checks) but does not gate the page |
| `customer: true` | customer portal (v1); loads `window.customer_auth` |
| `customer_v2: true` | customer portal (v2); also syncs `user_lang` from `customer_auth.lang_web` |
| `customer_auth: true` | redirects unauthenticated customers to the login page |
| `isAdmin: true` | requires `auth.is_admin` |
| `userMango: true` | requires `auth.userid` to be `mango` |
| `redirect` | hard `window.location.href` redirect |

Access denial redirects to `page/error/access_denied/`. `projectRight` is additionally checked against the `pre_event2` query-string value when the user has project-scoped rights.

### Known menu IDs

| menu_id | Page |
|---|---|
| `10100` | `v_csm_trn_001` (and `_old`) |
| `10200` | `v_csm_trn_003` |
| `10300` | `v_csm_trn_004` |
| `10400` | `v_csm_trn_002` |
| `60000` | Customer Config Center |

### i18n

The guard resolves the UI dictionary on **every** navigation, merging three sources into `window.ui`:

1. `EN_MASTER` fallback from `api/public/LanguageSelector` (only when the user's language has no DB rows)
2. `Scripts/Others/lang_bundle.json` (fetched with `cache: 'no-cache'`; translations can change without a rebuild)
3. DB `uiLang` for the user's language (empty keys are stripped so the bundle can fill in)

In components read labels as `this.ui.some_key || 'Fallback'` and check `this.lang` (`(window.langList || {}).userLang`).

---

## 6. Vuex Store

Single store at `Scripts/App/Application/Store/store.js`, also exposed as `global.store`.

### State

| Key | Contents |
|---|---|
| `connectionCodeData` | ประเภทการติดต่อ (contact types) |
| `requestCodeData` | ประเภทการร้องขอ (request types) |
| `priorityCodeData` | ระดับความสำคัญ (priority levels) |
| `serviceCodeData` | ประเภทบริการ (service types) |
| `configData` | main system settings (`GetSettings`) |
| `config` | Anywhere key-value config |
| `maincomp` | main company record |
| `activeconfig` | merged active config |
| `configReadlist` | config readlist filtered to `TRN000X` |
| `send_test_bug` | service types flagged for bug send-back |

### Actions → endpoints

| Action | Endpoint |
|---|---|
| `findConnection` | `CSM/Center/ContactType` |
| `findRequest` | `CSM/Center/RequestType` |
| `findPriority` | `CSM/Center/Priority` |
| `findService` | `CSM/Center/ServiceType` |
| `findServiceBug` | `CSM/Center/ServiceType_Send_Bug` |
| `findConfig` | `CSM/Center/GetSettings` |
| `findCodeConfig(maincode)` | `Anywhere/API/StoreConfig?maincode=…` or `Anywhere/Center/Config` |
| `findCompany` | `anywhere/center/Maincomp?maincode=…` |
| `findActiveConfig` | `CSM/Config/Active_Config_ReadList` |
| `findConfigReadList` | `CSM/Config/Config_ReadList` |

### Getters

`service_select2`, `request_select2`, `service_group_select2` (grouped by `serv_group_code`), `config`.

The select2 helpers map rows to `{ id, text, active }`. `findCodeConfig` flattens each config row into `code`, `code_value`, `code_remark1` keys.

---

## 7. Component Layout

### Layouts (`Components/Layouts/`)

| File | Role |
|---|---|
| `re-layout.vue` | standard Mango CSM shell (`<re-page>`) — nav, side menu, loading box, logout, language switch |
| `customer-layout.vue` | customer portal shell (`<customer-page>`) |
| `menu.vue` | side menu used by `re-layout` |

`re-layout` exposes `pageTitle` and `loadingBox` on its ref — pages set them in `mounted()`.

### Shared controls (`Components/Center/`)

`ag-table`, `ag-report`, `form-template` (+`-2`), `modal` (+`-2`, `-3`), `datepicker`, `timepicker`, `number`, `input`, `pagination` (+`-2`), `table-sticky` (+`-2`), `file-attach` (+`-v2`), `import-data`, `loading-box`, `action-link`, `report-condition`, `report-customer`, `change-language`, `logout`, `voice-typing`.

The `vue-select-2` tag comes from the npm package `v-select2-component`, not from a file in this folder.

### Page components (`Components/Pages/`)

`Transaction/`, `Master/`, `Customer/`, `Dashboard/`, `Report/`, `Config/`, `CustomerConfigCenter/`, `Authentication/`, `Default/`, `Approve/`, `Tracking/`, `External/`, `FAQ/`, `Manual/`, `Tools/`, `CustomMango/`, `ItDev/`, `History/`, `webland/`, `Empty/`, plus:

- `Center/` — ~40 modal/lookup components (`ct-project`, `ct-customer`, `ct-employee`, …)
- `V2/` — newer iteration (`Authentication/`, `Transaction/`, `Components/`, `Layout/`, `CSS/`)

**All globally-registered components are declared in `main.js`.** A new shared component or lookup modal must be imported and registered there (`Vue.component('name', Cpn)`) before pages can use it.

### File naming

Page files follow `v_csm_<module>_<nnn>.vue`:

| Prefix | Module |
|---|---|
| `v_csm_trn_*` | Transaction |
| `v_csm_mas_*` | Master |
| `v_csm_cus_*` | Customer |
| `v_csm_rpt_*` | Report |
| `v_csm_config_*` | Config |
| `v_csm_dashboard*` | Dashboard |

Transaction sub-components use the `vs_csm_trn_*` prefix and live in `Transaction/components/`.

#### Naming rules for new files

Three naming styles exist in the tree for historical reasons. **For anything new, follow this table** — do not mass-rename existing files just to conform; convert a file only when you are already editing it for another reason.

| What you are adding | Style | Example |
|---|---|---|
| Shared control in `Components/Center/` | `kebab-case` | `ag-table.vue`, `file-attach.vue` |
| Lookup / modal in `Pages/Center/` | `ct-` + `kebab-case` | `ct-project.vue`, `ct-hr-emp.vue` |
| Page (routed) | `v_csm_<module>_<nnn>` | `v_csm_trn_001.vue` |
| Sub-component owned by one page | `vs_csm_<module>_*` | `vs_csm_trn_faqmodal.vue` |

Sub-component folders are lowercase `components/` (not `Component/`). A page with many sub-components keeps them in `<page>_components/`.

**Folder names describe content, not screen position.** Name a folder for what it holds — `document-details/`, `job-detail/`, `assignment/` — never `Tab1/`, `Tab2/`, `Step3/`. Where a folder backs a named component, match that component's tag (`document-details/` ↔ `<document-details>`).

**Never put a space in a file or folder name.**

#### Path casing — treat as case-sensitive

Windows and IIS resolve paths case-insensitively, so a wrong-case `import` works locally and fails only on a case-sensitive filesystem (Linux/Docker CI). Always write the import path with the **exact** on-disk casing:

```js
// folder on disk is External/
import(`../Components/Pages/External/v_csm_external.vue`)   // correct
import(`../Components/Pages/external/v_csm_external.vue`)   // works on Windows, breaks on Linux
```

Note that `core.ignorecase=true` in this repo: renaming a folder to a different case needs two `git mv` steps through a temporary name.

### Responsive twin components — `edit_details.vue` ↔ `edit_details_mobile.vue`

The Description tab of the TRN_001 job-detail sheet ships as **two files**. `job_detail.vue` picks one at runtime with `<component :is="editDetailsComp">`:

| Viewport | Component rendered |
|---|---|
| ≤ 639px (phone) | `edit_tasks/edit_details_mobile.vue` |
| 640 – 939px (tablet portrait) | `edit_tasks/edit_details_mobile.vue` |
| ≥ 940px (tablet landscape / desktop) | `edit_tasks/edit_details.vue` |

The breakpoint is read with `window.matchMedia('(max-width: 939px)')` — the same value as `Transaction/CSS/trn001-responsive.css`. The choice is frozen while the sheet is open (`sheetOpen`), because `<component :is>` destroys and recreates the child and unsaved state would be lost.

#### RULE — never change one twin alone

`edit_details_mobile.vue` is `extends: EditDetails`, so the two halves behave differently:

- **`<script>` is inherited.** `props` / `data` / `computed` / `methods` / `watch` added, changed, or deleted in `edit_details.vue` reach the mobile file automatically. Do **not** copy them there — a duplicate block overrides the parent and the two versions drift apart.
- **`<template>` is a full copy, not inherited.** Every markup change has to be made twice.
- **`<style scoped>` is separate.** Mobile CSS is written from scratch under `.mob-root`; no desktop rule reaches it.

After **any** edit to `edit_details.vue`, walk this table before calling the task done:

| Change in `edit_details.vue` | What `edit_details_mobile.vue` needs |
|---|---|
| new / renamed / removed `data` variable or `computed` | inherited — but mirror every template spot that reads it |
| new / changed / removed method, `$msg` alert, confirm flow | inherited — mirror the buttons and handlers that call it |
| new field, row, button, column, table | add the same markup in the `.mob-root` layout (`m-row` / `m-col`, never `col-*-N`) |
| new / changed `v-if`, `v-show`, `:disabled`, `:class`, `v-model` | copy the identical expression onto the twin element |
| removed block or condition | delete the matching markup in the mobile template |
| new prop or `$emit` | mirror the binding that passes or handles it |
| new style for new markup | add rules to the mobile `<style scoped>`; do not import desktop rules |

Sanity check before finishing — every handler and binding the desktop template uses should exist in the mobile one:

```bash
cd .../job-detail/edit_tasks
diff <(grep -o '@click="[^"]*"' edit_details.vue        | sort -u) \
     <(grep -o '@click="[^"]*"' edit_details_mobile.vue | sort -u)
```

The same rule applies to any future `*_mobile.vue` twin: **the desktop file and the mobile file are edited in the same change, never one without the other.**

---

## 8. Component Skeleton (v1 — Options API)

This is the dominant pattern (~170 files). Module-scoped `let` variables hold refs; they are **not** reactive data.

```vue
<template>
  <re-page ref="page">
    <app-form ref="appForm">
      <ag-table ref="agr" :scale="0.8" :sorting="true" @cell-clicked="onCellClicked" />
      <pagination ref="paging" @change="view" />
    </app-form>
  </re-page>
</template>

<script>
  let process = false;
  let page = {};
  let appForm = {};
  let paging = {};

  let cpn = {
    data() {
      return {
        auth,
        ui: window.ui,
        lang: (window.langList || {}).userLang,
        search: {},
        form: {},
        dataList: [],
        dataTotal: 0,
        editMode: false,
      };
    },
    methods: {
      initTable() { /* build header + setDisplay */ },
      async view() { /* fetch + fill */ },
      async saveClick() { /* validate + post */ },
    },
    mounted() {
      (async () => {
        page = this.$refs.page;
        page.pageTitle = `Setup : Customers`;
        document.title = page.pageTitle;

        appForm = this.$refs.appForm;
        appForm.btnNew.show = false;
        appForm.btnPrint.show = false;
        appForm.btnSave.click = this.saveClick;
        appForm.btnBack.click = this.resetData;
        appForm.btnDelete.click = this.deleteClick;

        paging = this.$refs.paging;
        paging.setCurrentPage(1);
        paging.setItemsPerPage(15);

        this.resetData();
        this.view();
      })();
    }
  };

  export default cpn;
</script>

<style scoped>
</style>
```

### `form-template` buttons

`btnRetrieve`, `btnNew`, `btnSave`, `btnSaveAs`, `btnDelete`, `btnPrint`, `btnBack`, `btnRefresh`, `btnAddRow` — each has `.show` (visibility) and `.click` (handler). Wire them in `mounted()`.

### V2 / Composition API

`@vue/composition-api` is installed and `setup()` is used in ~18 components (notably `ag-table.vue` and the `V2/` tree). **When a `V2/` equivalent exists, follow the V2 pattern for new work.**

---

## 9. ag-Grid — the primary table

`Components/Center/ag-table.vue` wraps `AgGridVue`. Registered globally as `<ag-table>`.

### Props

`scale`, `footer`, `sorting`, `footerHeight`, `checkbox`, `notScrollReset`, `saveColumns`, `doctype`, `page_name`

### Events

`cell-clicked`, `double-cell-clicked`, `on-selected`, `on-sort-changed`, `ready`
— payload shape: `{ col, data, params }` for cell events; `{ selected, items, data, node }` for selection.

### Exposed ref methods

`createHeaderFromArray(arr)`, `setHeader(h)`, `getHeader()`, `setDisplay(rows)`, `setBottomData(rows)`, `showFooter()`, `exportExcel(fileName)`, `printPDF()`, `createPdfData()`, `applySelectRow()`.

### Column tuple format

Columns are `[field, headerName, type, options]`. Options accept ag-Grid `colDef` keys plus `align` and a nested `child` array for grouped headers.

```js
initTable() {
  let agr = this.$refs.agr;
  if (!agr) return;

  let fields = [
    ['', 'Action', 'text', {
      width: 120, align: 'center', pinned: 'left', sortable: false,
      child: [
        ['', '', 'text', {
          width: 120, align: 'center', pinned: 'left',
          cellRenderer: (params) =>
            `<a href="#" class="ag-action-edit" data-idx="${params.rowIndex}"><i class="fas fa-edit"></i></a>`
        }]
      ]
    }],
    ['customer_code', 'Code', 'text', { width: 180, sortable: true, pinned: 'left' }],
    ['address', 'Address', 'text', { width: 500, sortable: false }],
    ['telephone', 'Mobile', 'text', { width: 160, align: 'center' }],
  ];

  agr.setHeader(agr.createHeaderFromArray(fields));
  agr.setDisplay(this.dataList);
}
```

Cell actions are commonly rendered as raw HTML in `cellRenderer` and wired with a delegated `click` listener on `agr.$el` inside `this.$nextTick()`, keyed by a `data-idx` attribute.

**Note:** the ag-Grid Enterprise license key in `main.js` is expired (`ExpiryDate=11_January_2022`), so the console shows a watermark/warning. This is known — not a bug to "fix" incidentally.

---

## 10. ASP.NET Host Page

`Page/Default.aspx` is the shell. It:

- computes `host`, `baseUrl`, `basePath`, `baseRoute`, `dataServer`, `printServer`, `hostServer`, `mangoSocketUrl` from `Web.config` `AppSettings`
- sets `window.baseUrl`, `basePath`, `baseRoute`, `dataServer`, `baseCompany`, `viewVersion`, `hostServer`, `mangoSocketUrl`, `printServer`, plus empty `auth`, `ui`, `menu`, `menuRight`, `signalR`
- loads all legacy globals via `<script>` tags **before** the bundle: jQuery, jQuery UI, Bootstrap 3, select2, slimscroll, fastclick, AdminLTE, jquery-confirm, toastr, lodash.core, jslinq, moment, `axios.js`, `xtools.js`, decimal.js, Pagination, `alert-service.js`, tinymce, signalR + hubs, `iwc-*`, `MangoSignalR.js`, `data-center.js`
- cache-busts with `BuildVersion.txt` and a `DateTime.UtcNow.Ticks` query string
- finally loads `Scripts/bundle/Application.js` and mounts `<router-view>` into `#app`

Root `Default.aspx` simply redirects to `~/page/`.

**Consequence:** anything on `window` from those scripts is available to Vue components without an import. Conversely, adding a new global library usually means adding a `<script>` tag here, not an npm import.

---

## 11. Backend API Service

The REST/business-logic backend behind `$xt.getServer` / `$xt.getCustomerServer` is a separate .NET Framework **4.7.2** solution: **`MangoWebPoolService-DEV`**.

- **Path varies per dev machine** — the solution file is `MangoWebPoolService.sln` inside a `MangoWebPoolService-DEV` folder. Never assume a listed path is correct here; follow the RULE below and reuse the confirmed-paths table.
- **Projects:** `MangoWebPoolService` (main web/API), `MangoMobileService`, `MangoReportService`, `SFC-DC-Service`, `MangoWebPoolService.Tests`
- **Reusable knowledge:** `docs/backend/contract-navigation-knowledge.md` — verified auth/response/list contracts, ownership map, and navigation recipes. Read it before traversing the backend.

### RULE — ask the dev for their backend path before any backend change

The backend folder lives in a **different location on every dev machine**. The dev must tell the Agent their machine's path — the Agent must ask for it and must never guess or assume a documented path.

1. Ask the dev for their `MangoWebPoolService-DEV` folder path before any backend task.
2. Verify it with `Test-Path "<dev-provided-path>"` — the folder must contain `MangoWebPoolService.sln`. If it checks out → proceed with backend edits.
3. If the dev doesn't know the path → locate it, confirm the result with the dev, then proceed:
   ```powershell
   Get-ChildItem -Path D:\,C:\ -Recurse -Directory -Filter "MangoWebPoolService-DEV" -ErrorAction SilentlyContinue |
     Select-Object -ExpandProperty FullName
   ```
4. **Record any newly confirmed path in the table below** before editing, so the next session on that machine can reuse it.
5. Only edit backend code once the path is confirmed and saved.

### Confirmed backend paths per machine

| Machine / owner | Path |
|---|---|
| Dev machine (reported by dev, verified 2026-09-12, contains `MangoWebPoolService.sln`) | `C:\SourceCode\Mango Web Service Pool\MangoWebPoolService-DEV` |
| Previous record (unverified on this machine) | `D:\Mango ERP\MangoWebPoolService-DEV` |

### RULE — look in `Areas/CSM` first

Backend code is organized by ASP.NET MVC areas under `MangoWebPoolService/Areas/`.

1. **`Areas/CSM` is the primary area.** Frontend `$xt.getServer('CSM/...')` calls map straight to its controllers:
   `APIController`, `AuthCustomerController`, `CenterController` (codelists/config → `CSM/Center/*`), `ChatController`, `ConfigController`, `CustomerDataController`, `DataController`, `GatewayController`, `ManualController`, `MasterController` (`CSM/Master/Customer_*`), `ReportController`, `TBugController`, `ToolsController`, `_BasedCustomerController`.
   Also `Areas/CSM/Models/` and `Areas/CSM/ExcelTemplate/`.
2. **If it is not in `Areas/CSM`**, check the shared ERP areas — chiefly `Areas/Anywhere` (frontend `Anywhere/Center/*`, `Anywhere/API/*`, e.g. `Maincomp`, `StoreConfig`), then `Api`, `AnywhereAPI`, `Planning`, `Report`, `DC_System`, `QCC`, `Mint`, `Ext_API`, `PrintApi`, `AccountingforLabor`, `Page`.
3. If genuinely absent from both, **say so — do not invent an endpoint.**

---

## 12. Conventions Checklist

1. **UTF-8, 2-space indent, LF** (`.editorconfig`).
2. **Split auth correctly.** Customer-side code **must** use `getCustomerServer` / `postCustomerJson` / `postCustomerForm`; internal code uses `getServer` / `postServerJson` / `postServerForm`. Mixing them silently breaks auth.
3. **i18n:** read labels from `window.ui` (`this.ui.re_xxx || 'fallback'`); check `this.lang`.
4. **New tables** use `<ag-table>` with the `createHeaderFromArray` / `setHeader` / `setDisplay` pattern and the `[field, header, type, opts]` tuple format.
5. **Always check `rsp.success`**; report failures with `$msg.alert(title, ex, 'danger')`.
6. **Prefer V2 patterns** when a `V2/` equivalent of what you are building exists.
7. **Register new global components in `main.js`.**
8. **Never `import` the legacy globals** (`$xt`, `$msg`, `$linq`, `$notify`, `moment`, `Decimal`, `$`) — they come from `Default.aspx` script tags.
9. **Vue 2 reactivity:** use `this.$set(obj, key, val)` when adding new keys to an existing object.
10. Vue filters (`date`, `number`) are defined in `Scripts/App/Application/vue-filters.js`.
11. Dark mode lives in `Content/CSS/DarkTheme.css` (imported by `main.js` as `../../../Content/DarkTheme.css`).
12. **No automated tests.** Verify in the browser against the running dev build.
13. **Name new files by the table in §7 "File naming"** — `kebab-case` for shared controls, `v_csm_*` for pages, `vs_csm_*` for a page's sub-components. Folders describe content, never screen position (`document-details/`, not `Tab1/`). No spaces in names.
14. **Write import paths with exact on-disk casing.** Wrong case works on Windows and breaks on a case-sensitive filesystem.
15. **Responsive twins move together.** Editing `edit_details.vue` (≥940px) means editing `edit_details_mobile.vue` (≤939px) in the same change — added/removed markup, conditions, buttons, and styles. Script logic is inherited via `extends`; the template and the scoped CSS are not. See §7 "Responsive twin components".

---

## 13. Quick Reference

```
Dev URL     : http://localhost:4060   (browser-sync → IIS http://localhost:4061)
Entry       : Scripts/App/Application/main.js
Output      : Scripts/Bundle/Application.js (+ split chunks) — deploy whole folder
Mount point : Page/Default.aspx  ->  <div id="app"><router-view/></div>
Backend     : per-machine path — see confirmed table in §11  (Areas/CSM first)
```

| I need… | Go to |
|---|---|
| Axios instances, `$xt` helpers | `Scripts/Others/Service/xtools.js` |
| `$msg` / `$alert` / `$confirm` | `Scripts/Others/Service/alert-service.js` |
| Global component registration, router guard, i18n load | `Scripts/App/Application/main.js` |
| Route definitions | `Scripts/App/Application/Routes/routes.*.js` |
| Codelists / config state | `Scripts/App/Application/Store/store.js` |
| Data table | `Components/Center/ag-table.vue` |
| Toolbar buttons | `Components/Center/form-template.vue` |
| Page shell | `Components/Layouts/re-layout.vue` (internal) / `customer-layout.vue` (portal) |
| Customer master | `Components/Pages/Customer/v_csm_cus_001.vue` |
| Service-request workflow | `Components/Pages/Transaction/v_csm_trn_001…004.vue` |
| TRN_001 Description tab (desktop ≥940 / narrow ≤939) | `…/job-detail/edit_tasks/edit_details.vue` ↔ `edit_details_mobile.vue` — edit both, see §7 |
| Newer patterns | `Components/Pages/V2/` |
| Host page / globals / script tags | `Page/Default.aspx` |

### Further reading

- `.claude/skills/csm-customer-service/SKILL.md` — project skill that auto-triggers on `v_csm_cus_*`, `v_csm_trn_*`, `customer-layout`, `getServer` / `getCustomerServer`, and `ag-table` work. *(Known gap: its header references `docs/CSM-Customer-Service-Manual.md`, which is not present in this checkout — treat that reference as unresolved, but keep using the skill's API/table/component/route patterns; they remain valid.)*
