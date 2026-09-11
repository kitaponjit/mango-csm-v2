---
name: csm-customer-service
description: >-
  Build, modify, or debug the Mango CSM (Customer Service Management) Vue.js 2
  frontend — customer master, service-request transactions (TRN_001–TRN_004),
  the customer portal, and config center. Use when working in
  Website/Scripts/App/Application on Customer/Transaction/CustomerConfigCenter
  pages, ag-table grids, the $xt axios helpers, the Vuex codelist store, or
  routes/permissions for this repo. Triggers on tasks touching v_csm_cus_*,
  v_csm_trn_*, customer-layout, getServer/getCustomerServer, or ag-table.
---

# Mango CSM — Customer Service Frontend

Conventions and ready-to-copy patterns for the CSM Customer Service frontend.
Full reference: [docs/CSM-Customer-Service-Manual.md](../../../docs/CSM-Customer-Service-Manual.md).

## Stack & layout
- Vue.js 2.6 + Vuex 3 + Vue Router 3 (history mode), ag-Grid Enterprise v26, served by ASP.NET 4.8.
- Code lives in `Scripts/App/Application/`. Entry `main.js` → bundle `Scripts/Bundle/Application.js`, mounted in `Page/Default.aspx`.
- Dev: `npm run dev` (localhost:2050, proxies backend 2060). Build: `npm run build`. **No automated tests.**
- 2-space indent, UTF-8, LF (`.editorconfig`). Many Thai labels — keep them.

## The #1 rule: pick the right API helper
Two fully separate auth domains. Using the wrong one breaks auth silently.

| Side | Helper | Token |
|---|---|---|
| Internal CSM (staff) | `$xt.getServer(url)` / `$xt.postServerJson(url,data)` | `mango_auth` |
| Customer portal (external) | `$xt.getCustomerServer(url)` / `$xt.postCustomerJson(url,data)` | `customer_auth` |
| ASP.NET local | `$xt.getLocal` / `$xt.postLocalJson` | post-back token |

`$xt` (from `Scripts/Others/Service/xtools.js`) is global. Utils: `$xt.isEmpty`, `int`, `dec(x,n)`, `formatNumber`, `formatDate`, `replaceZeroStart`, `checkEmpty`.

## API call patterns (copy these)

**Read a list (paginated):**
```js
async loadData() {
  let act = `CSM/Master/Customer_ReadList?search_text=${encodeURIComponent(this.search.text||'')}&skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`;
  let rsp = await $xt.getServer(act);
  this.list  = rsp.data.data_rows.data;
  this.total = rsp.data.data_rows.total;
  paging.setTotalItems(this.total);
  paging.createPagesArray();
  this.$nextTick(() => this.initTable());
}
```
- Response envelope is `{ success, error, data }`; lists are at `rsp.data.data_rows.data` + `.total`.
- `encodeURIComponent` every user-supplied query param.

**Save (create/update) with proper error + loading:**
```js
async saveClick() {
  try {
    let act = this.editMode ? `CSM/Master/Customer_Update` : `CSM/Master/Customer_Create`;
    page.loadingBox.show();
    let rsp = await $xt.postServerJson(act, { info:this.form, address:this.addr });
    if (!rsp.success) throw rsp.error;     // ALWAYS check success
    $msg.alert(``, this.ui.alert_save_success, `success`);
  } catch (ex) {
    $msg.alert(`Warning`, ex.toString(), `warning`);
  } finally {
    page.loadingBox.hide();                // hide in finally, always
  }
}
```

## ag-table (every grid uses this)
Template:
```html
<ag-table ref="agr" :footer="false" @ready="initTable()" :saveColumns="'Y'" :doctype="'VIEW'" :page_name="'v_csm_cus_001_new'"></ag-table>
<pagination ref="paging" @page-change="pageChange($event.page, 'List')"></pagination>
```
Columns are tuples `[field, headerText, type, options]`, then 3 calls:
```js
initTable() {
  let agr = this.$refs.agr;
  if (!agr) return;
  let fields = [
    ['', 'Action', 'text', { width:120, align:'center', pinned:'left', sortable:false,
      child:[ ['', '', 'text', { width:120, align:'center', pinned:'left',
        cellRenderer: p => `<a href="#" class="ag-action-edit" data-idx="${p.rowIndex}"><i class="fas fa-edit"></i></a>` }] ] }],
    ['customer_code', 'Code', 'text', { width:180, sortable:true, pinned:'left', cellStyle:{'font-weight':'600'} }],
    ['telephone', 'Mobile', 'text', { width:160, align:'center' }],
  ];
  agr.setHeader(agr.createHeaderFromArray(fields));   // 1
  agr.setDisplay(this.list);                          // 2 rows
}
```
Cell actions = `cellRenderer` HTML with `class` + `data-idx`, bound via event delegation on `agr.$el` inside `$nextTick`.

## Component skeleton
Pages use module-level singletons + a `cpn` object exported default:
```js
<script>
  let process = false;   // guard double-submit
  let page = {};         // re-page ref (loadingBox, toolbar buttons)
  let appForm = {};      // btnSave/btnDelete/btnBack
  let paging = {};
  let cpn = {
    data() { return { auth, ui: window.ui, lang: window.langList.userLang,
      tabActive:0, show_panel:0, search:{}, form:{}, list:[], editMode:false }; },
    methods: { /* loadData, initTable, saveClick, onTabChange ... */ },
  };
  export default cpn;
</script>
```
Globals available without import: `auth`, `window.ui` (i18n — use `this.ui.re_xxx || 'fallback'`), `window.langList.userLang`, `$xt`, `$msg.alert(title,text,type)`, `$linq(arr)`.

## Routing & permissions
Routes split per module in `Scripts/App/Application/Routes/` (`routes.transaction.js`, `routes.customerconfigcenter.js`, …). Each route:
```js
meta: { auth:true, mangoMenu:{ menu_name:'CSM_WEB', menu_id:'10100', checkUserRight:true } }
```
Guards in `main.js` check `window.auth.is_authen`, `window.userRight` (array of menu_id), `window.projectRight`, `window.auth.is_admin`.
menu_id: TRN_001=`10100`, TRN_002=`10400`, TRN_003=`10200`, TRN_004=`10300`, Config Center=`60000`.

## Vuex store (codelists/config)
`Store/store.js` loads on init. Read via getters/state — don't refetch:
`this.$store.getters.service_select2 | request_select2 | service_group_select2`, `this.$store.state.config | maincomp | priorityCodeData`.

## Screen map (Customer Service)
- `Pages/Customer/v_csm_cus_001.vue` — Customer master (New/Old tabs; Info/Mobile/Contact).
- `Pages/Default/CustomerData.vue` / `CustomerDataView.vue` — Customer 360 view.
- `Pages/Transaction/v_csm_trn_002.vue` — **Intake**: review new requests, batch create/reject.
- `Pages/Transaction/v_csm_trn_001.vue` — **Ticket detail**: 4 tabs (detail/status/assign-history/history), QC, assign, approve, attach. Sub-parts in `v_csm_trn_001_components/Tab1..Tab4/`.
- **Responsive twin:** the ticket Description tab renders `…/v_csm_trn_001_components/document-details/job-detail/edit_tasks/edit_details_mobile.vue` at ≤939px and `edit_details.vue` at ≥940px. `edit_details_mobile.vue` is `extends: EditDetails` — `<script>` is shared, `<template>` and scoped CSS are copies. **Edit both files in the same change.**
- `Pages/Transaction/v_csm_trn_003.vue` — Training/Helpdesk.
- `Pages/Transaction/v_csm_trn_004.vue` — Assign management (Request/Responsible/Assign/Tester).
- `Layouts/customer-layout.vue` + `/page/external/*` — Customer portal.
- `Pages/CustomerConfigCenter/v_csm_setup_*.vue` — admin config (menu_id 60000).

## Checklist before finishing a change
- [ ] Correct API helper for the side (internal vs customer)?
- [ ] `encodeURIComponent` on query params; checked `rsp.success`; errors via `$msg.alert`?
- [ ] `page.loadingBox` shown/hidden in `finally`?
- [ ] New grid follows `createHeaderFromArray → setHeader → setDisplay`?
- [ ] User-facing strings via `window.ui` with fallback; Thai labels preserved?
- [ ] New route has correct `mangoMenu.menu_id` + `checkUserRight`?
- [ ] Prefer `Components/Pages/V2/` patterns when a V2 equivalent exists.
- [ ] Touched `edit_details.vue`? Mirrored the markup/condition/style change in `edit_details_mobile.vue` (AGENTS.md §7)?
- [ ] Verified manually with `npm run dev` (no test suite exists).
