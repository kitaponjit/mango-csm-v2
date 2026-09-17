# Warranty Item Contract Mapping

## Purpose and boundary

This document maps external Warranty Item contracts to normalized read/domain/application concepts at approved T1 base `5e7a20a4d14958fe0f76241464f8448ce2bb9464`. It records current behavior; it does not authorize Ticket 02–05 implementation.

The required direction is:

```text
Backend DTO
  -> runtime shape validation
  -> normalization / contract mapper
  -> domain or read model
  -> application state
  -> Vue UI

Edit/Draft Model
  -> explicit create/update mapper
  -> transport DTO
  -> typed transport
```

Evidence statuses describe source strength, not production/UAT sign-off.

## List DTO

### Request

Endpoint: `GET csm/master/WarrantyItem_ReadList`

| External field | Source | Normalized/application concept | Conversion | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `skip` | Query | page offset | `(page - 1) * pageSize` | VERIFIED | T1 builds this explicitly (`frontend/app/features/warranty-item/list/warranty-item-list-service.ts:126-129`). |
| `take` | Query | page size | `pageSize` | VERIFIED | Default T1 value is 500. |
| `field` | Query | search field | `war_code` or `war_des` | VERIFIED | Application query state, not domain. |
| `text` | Query | search text | URI-encoded string | VERIFIED | Application query state. |
| `active` | Query | status filter mode | `Y` = active-only; `N` = all statuses | VERIFIED | Backend applies a predicate only for `Y` (`Mango.Web/Areas/CSM/Models/Master/WarrentyItem.cs:45-53`). It is not the entity boolean. |

Response envelope: `{ success, data: { data_rows, total }, error? }` as consumed by the target transport. The controller supplies `{ data_rows, total }` to the common JSON envelope (`Mango.Web/Areas/CSM/Controllers/MasterController.cs:108-115`). T1 rejects a malformed envelope, non-array rows, and non-finite/non-integer/negative totals (`warranty-item-list-service.ts:101-124`).

### Row fields

| External field | Source | Normalized/domain concept | Conversion | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `war_code` | List row | summary `code`; tenant-scoped identity | string passthrough after shape check | VERIFIED | Persistence identity also includes authenticated `maincode`. |
| `war_des` | List row | summary `name` | string passthrough | VERIFIED | Core property. |
| `type_code` | List row | group identity candidate | T1 intentionally does not map | VERIFIED contract; MODEL DURING T2 | Must be retained by detail/edit mapping. |
| `type_name` | List row | summary `groupName` | string passthrough | VERIFIED | Presentation projection, not group identity. |
| `itemcode` | List row | material reference candidate | T1 intentionally does not map | OBSERVED | Detail/edit concern. |
| `active` | List row | summary/entity `active` | `Y` -> `true`, `N` -> `false` | VERIFIED | Invalid flags reject the row in T1. |
| `tot_date` | List row | duration days | T1 intentionally does not map | VERIFIED contract; MODEL DURING T2 | Do not reconstruct from `durationLabel`. |
| `tot_month` | List row | duration months | T1 intentionally does not map | VERIFIED contract; MODEL DURING T2 | Nullable in persistence. |
| `tot_year` | List row | duration years | T1 intentionally does not map | VERIFIED contract; MODEL DURING T2 | Nullable in persistence. |
| `tot_warranty` | Computed list row | summary `durationLabel` | string passthrough | VERIFIED presentation mapping | Computed from year/month/day; not independent domain state. |
| `lifetime` | List row | summary/entity `lifetime` | `Y` -> `true`, `N` -> `false` | VERIFIED contract mapping | Business interaction with duration is not backend-enforced. |
| `add_user` | List row | audit `addedBy` | nullable string passthrough | VERIFIED | Read-only projection. |
| `add_dt` | List row | audit `addedAt` | nullable string passthrough | VERIFIED for T1 transport | Timestamp parsing/formatting is not part of T1. |
| `edit_user` | List row | audit `editedBy` | nullable string passthrough | VERIFIED | Read-only projection. |
| `edit_dt` | List row | audit `editedAt` | nullable string passthrough | VERIFIED for T1 transport | Timestamp parsing/formatting is not part of T1. |
| `acct_no` | List row | receipt/account provenance | omitted from T1 summary | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Not a core field merely because it is returned. |
| `war_date_start` | List row | receipt warranty-start provenance | omitted from T1 summary | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Distinct from configured duration. |
| `war_date_end` | List row | receipt warranty-end provenance | omitted from T1 summary | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Distinct from configured duration. |
| `ic_docno` | List row | unresolved external IC document identifier | omitted from T1 summary | REQUIRES DOMAIN CONFIRMATION | Current code pairs it with `ic_itemno` and sources receipt transaction rows; that association is not a domain definition. |
| `ic_itemno` | List row | unresolved external IC line identifier | omitted from T1 summary | REQUIRES DOMAIN CONFIRMATION | Current code pairs it with `ic_docno`; canonical ownership is unresolved. |
| `pre_event` | List row | project linkage metadata | omitted from T1 summary | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Used in receipt/area workflows. |
| `pre_event2` | List row | normalized/internal project linkage metadata | omitted from T1 summary | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Can trigger create side effects. |
| `loccode` | List row | project location metadata | omitted from T1 summary | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Used with project fields. |

## Canonical / Read Model

T1's normalized read model is:

```text
WarrantyItemListItem
  code, name
  groupName
  durationLabel
  lifetime, active
  addedBy, addedAt, editedBy, editedAt
```

It is valid for list presentation only (`warranty-item-list-service.ts:15-26,82-99`). A future canonical/detail model must additionally carry group identity, material identity, and structured duration. Audit metadata remains a separate projection. Application state owns list query, paging, total/maxPage, loading/error, request generation, and retained-row behavior (`warranty-item-list-state.ts:9-18,34-139`).

## Detail DTO if identifiable

Endpoint: `GET csm/master/WarrantyItem_Read?war_code=<encoded code>` (`Mango.Web/Areas/CSM/Controllers/MasterController.cs:126-132`).

The backend reads one tenant-scoped row and returns:

| External field(s) | Source | Normalized/domain concept | Conversion | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `war_code`, `war_des` | Detail row | code, name | validate strings; code remains immutable in edit | VERIFIED | Query and row are scoped by authenticated tenant. |
| `type_code`, `type_name` | Detail row | group code plus display name | code is identity; name is projection | VERIFIED | T2 must not store only the name. |
| `itemcode`, `itemname` | Detail row | material code plus display name | code is candidate reference; name projection | OBSERVED | Backend material lookup returns a queryable name shape; runtime JSON shape needs focused T2 validation. |
| `active`, `lifetime` | Detail row | boolean flags | validate `Y`/`N`, normalize to boolean | OBSERVED mapping proposal | Same contract convention as verified list row. |
| `tot_date`, `tot_month`, `tot_year` | Detail row | structured duration | preserve numeric/null input until T2 defines draft conversion | VERIFIED structure | Do not use `tot_warranty` as input. |
| `tot_warranty` | Computed detail row | display label | read-only string | VERIFIED presentation | Not mutation truth. |
| audit fields | Detail row | audit projection | read-only mapping | VERIFIED metadata | Omit from user-authored mutation source. |
| passive/provenance fields | Detail row | deferred integration metadata | preserve only if a use case requires safe round-trip | OBSERVED | Standard update ignores these fields. |
| `vendor`, `serial_ty` | Detail row | read-only receipt/material projections | display-only unless future evidence changes ownership | OBSERVED | Not in T1 list model. |

T2 should validate the actual envelope and nullable runtime values before fixing the final detail TypeScript type.

## Create Boundary

Endpoint observed in both client and backend: `POST CSM/MASTER/WarrantyItem_Create`.

External body:

```text
{ header: rd_mas_warranty2-shaped object }
```

The broad backend binder is not permission to send every persistence property (`MasterController.cs:149-159`). A T2 create mapper should whitelist only confirmed manual-entry inputs:

| External field | Source | Normalized/domain concept | Conversion | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `war_code` | `header` | draft/code | trim policy not yet universal; send confirmed string | VERIFIED required | Backend rejects empty and duplicate tenant code. |
| `war_des` | `header` | draft/name | send string | VERIFIED required | Backend rejects empty. |
| `type_code` | `header` | selected group code | selected code; empty/null policy pending | OBSERVED editable | Manual backend path does not validate existence. |
| `itemcode` | `header` | selected material code | selected code; empty/null policy pending | OBSERVED editable | Manual backend path does not validate existence. |
| `tot_year`, `tot_month`, `tot_date` | `header` | structured duration draft | numeric/null conversion to be fixed in T2 | VERIFIED accepted | Range/null/zero rules unresolved. |
| `lifetime` | `header` | lifetime boolean | boolean -> `Y`/`N` | OBSERVED accepted | Exclusivity with duration not enforced. |
| `active` | `header` | active boolean | boolean -> `Y`/`N` | OBSERVED accepted | Legacy new form defaults to `Y`. |

The backend overwrites `maincode`, `add_user`, and `add_dt` (`WarrentyItem.cs:186-208`). Create DTOs must not source those fields from the edit form. Audit fields and all passive metadata are omitted unless a separately modeled Reference IC/import use case explicitly owns them.

When `pre_event2` is present, create can also insert project/location area records (`WarrentyItem.cs:210-269`). This side effect is why receipt/project metadata must not be casually round-tripped by a generic T2 form.

## Update Boundary

The legacy and current target port call `POST CSM/MASTER/WarrantyItem_Update` (`Website/.../v_csm_mas_002.vue:751-764`; `frontend/app/Components/Pages/Master/v_csm_mas_002.vue` equivalent). T2 verified the owning .NET 8 source: the action method is declared `Warrantyitem_Update` (`Mango.Web/Areas/CSM/Controllers/MasterController.cs:183-193`) and the application maps the conventional area route `{area:exists}/{controller}/{action=Index}/{id?}` (`Mango.Web/Program.cs:434-445`). ASP.NET Core routing is case-insensitive by framework contract ([Microsoft controller-based Web API documentation](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api?view=aspnetcore-8.0)). Therefore the established `WarrantyItem_Update` client spelling is **VERIFIED against the owning route mapping**. A deployed-environment mutation smoke test was intentionally not performed and remains UAT/release evidence, not a reason to change the client endpoint.

External body remains `{ header: ... }`. The backend uses only:

| External field | Source | Normalized/domain concept | Conversion | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `war_code` | `header` | immutable lookup identity | string | VERIFIED | Finds tenant-scoped row; not reassigned. |
| `war_des` | `header` | name | string | VERIFIED | Required with code. |
| `active` | `header` | active | boolean -> `Y`/`N` | VERIFIED assignment; validation UNVERIFIED | Backend assigns raw value. |
| `tot_year`, `tot_month`, `tot_date` | `header` | structured duration | T2 mapper decision | VERIFIED assignment | Preserve components. |
| `lifetime` | `header` | lifetime | boolean -> `Y`/`N` | VERIFIED assignment; invariant UNVERIFIED | Backend assigns independently. |
| `type_code` | `header` | group identity | selected code | VERIFIED assignment | Group existence not checked here. |
| `itemcode` | `header` | material identity | selected code | VERIFIED assignment | Material existence not checked here. |

The backend sets `edit_user` and `edit_dt` and ignores passive metadata for standard update (`WarrentyItem.cs:276-310`). Create and Update should therefore have separate explicit DTO types even though the backend binds the same persistence class.

## Delete Boundary

Endpoint: `POST CSM/Master/WarrantyItem_Delete` with `{ header: row }` in the legacy client (`Website/.../v_csm_mas_002.vue:785-809`). The backend receives `rd_mas_warranty2`, extracts `war_code`, and performs tenant-scoped usage checks before deletion (`MasterController.cs:173-183`; `WarrentyItem.cs:312-354`).

| External field | Source | Normalized/domain concept | Conversion | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `war_code` | delete `header` | delete command identity | string | VERIFIED required in implementation | General area/project guards use this code. |
| `acct_no`, `pre_event`, `pre_event2`, `loccode` | delete `header` | legacy guard context | raw round-trip today | OBSERVED | First guard is conditional on `acct_no`; whether these are required for correct deletion is unproven. |
| other row fields | delete `header` | none identified | legacy full-row pass-through | UNVERIFIED | They are unnecessary candidates, but do not assume a minimum payload until T3 integration evidence. |

T3 owns a typed delete command/result, pending/duplicate-click protection, referential error mapping, reload, and page clamp. Gate 4 does not place `delete()` behavior on the entity.

## Import Boundary

Import mechanics are application/infrastructure. A future domain seam is:

```text
Selected .xlsx file
  -> multipart/file transport or confirmed parser path
  -> untrusted Import Row DTO
  -> row validation/normalization
  -> Warranty Item Import Candidate
  -> backend import result
```

### Confirmed backend multipart contract

- `POST WarrantyItemImport_Master(IUploadedFile file)` calls the master import (`MasterController.cs:185-190`).
- Upload accepts `.xlsx`, reads rows until a blank code, and maps code, name, group, three duration components, lifetime, material, vendor/date columns, and active (`WarrentyItem.cs:407-468`).
- It checks code presence, configurable special characters, group/material existence when supplied, and active presence; it normalizes invalid active/lifetime flags to `N` (`WarrentyItem.cs:472-525`).
- It upserts by `(maincode, war_code)` and assigns `IMPORT` audit data (`WarrentyItem.cs:527-548`).

Multipart field name is `file` by action parameter name (`VERIFIED owning signature`; runtime binding still needs T4 integration verification).

### DOMAIN EVIDENCE CONFLICT — active frontend import

Concept: master/all-warranty import transport.

- Source A: the current legacy/target page parses spreadsheet rows client-side and posts JSON to `WarrantyItemImportData_Master` or `WarrantyAutoImportData` (`Website/.../v_csm_mas_002.vue:878-920,1023-1069`).
- Source B: the confirmed .NET backend exposes multipart `WarrantyItemImport_Master` and `WarrantyAutoImport`; no matching `*ImportData*` actions were found in the owning CSM controller (`MasterController.cs:142-146,185-190`).
- Likely reason: frontend/backend version drift or an unported legacy action.
- Impact: Ticket 04 cannot choose endpoint, request shape, response/count semantics, atomicity, or refresh behavior from current evidence alone.
- Recommended interpretation: treat multipart `WarrantyItemImport_Master` as the strongest owning implementation candidate, but require an integration/environment confirmation before T4 implementation.
- Supervisor decision required now: no. T4 evidence resolution required before T4 starts/completes: yes.

## Export Boundary

Endpoint: `GET csm/master/WarrantyItemExport_Master`, no Warranty Item query parameters in the current page (`Website/.../v_csm_mas_002.vue:5-9`). The backend generates an `.xlsx` file and returns `newFileName.CreateTokenHex()` in the common envelope (`MasterController.cs:192-197`; `WarrentyItem.cs:555-604`).

The shared form then opens:

```text
window.dataServer + "API/File/DownLoad?download=true&id=" + token
```

(`frontend/app/Components/Center/form-template-2.vue:169-191`).

| External field/result | Source | Normalized/application concept | Conversion | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| no request parameters | export endpoint | export command | GET | OBSERVED | Auth/tenant comes from existing transport/session. |
| response `data` token | common envelope | `DownloadToken` | validate non-empty string before use | OBSERVED | Hex/path-token lifetime and security semantics are not documented. |
| `window.dataServer` | runtime config | download base URL | infrastructure adapter | VERIFIED current behavior | Not domain. |
| `API/File/DownLoad?...id=` | file API | download URL | typed file capability should construct/open | OBSERVED | Popup blocking and errors belong to T5. |

Ticket 05 must introduce a typed `frontend/` download abstraction; it must not depend on the superseded `Nuxt/` scaffold.

## Contract fields not admitted to the canonical model

| External field | Source | Classification | Status | Notes |
| --- | --- | --- | --- | --- |
| `maincode` | persistence DTO | tenant/auth infrastructure | VERIFIED | Injected/scoped by backend; never user-editable. |
| `add_user`, `add_dt`, `edit_user`, `edit_dt` | persistence/read DTO | audit projection | VERIFIED | Server-authored. |
| `type_name`, `itemname`, `tot_warranty` | read/detail DTO | presentation projection | VERIFIED | Names/label are not identities or mutation truth. |
| `acct_no`, `war_date_start`, `war_date_end`, `ic_docno`, `ic_itemno` | read/detail/create DTO | receipt provenance/integration metadata | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Do not call this a canonical Reference IC model yet. |
| `pre_event`, `pre_event2`, `loccode` | read/detail/create DTO | project/location integration metadata | OBSERVED; REQUIRES DOMAIN CONFIRMATION | May cause create side effects. |
| `vendor` | detail/import DTO | receipt/import projection metadata | OBSERVED | Standard update ignores it. |
| `war_group_code` | persistence DTO | legacy-only/unresolved | UNVERIFIED | Runtime Warranty Group relation uses `type_code`. |

## T2 mapper constraints

T2 may begin with separate `DetailDto`, `WarrantyItemDraft`, `CreateDto`, and `UpdateDto` boundaries. It must not:

- bind the form directly to a raw `rd_mas_warranty2` row;
- send audit/tenant fields from UI state;
- parse `durationLabel`;
- use `groupName` as group identity;
- round-trip receipt/project/location fields through generic object spreading;
- reuse query filter `active=N` as entity inactive semantics.

After T2, canonical Warranty Code rules, duration ranges/lifetime invariants, group/material optionality, and TRN0001/admin intent still require domain confirmation. Update-route casing is verified against the owning .NET 8 route mapping; a deployed-environment smoke test remains UAT/release evidence.
