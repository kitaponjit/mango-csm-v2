# Warranty Item Domain Model

## Status and evidence boundary

- Gate: Gate 4 — progressive domain modeling only.
- Approved implementation base: `5e7a20a4d14958fe0f76241464f8448ce2bb9464`.
- This document models a pragmatic typed boundary; it does not authorize Ticket 02–05 implementation or a backend change.
- `VERIFIED` means supported by the owning implementation and consistent callers. It does not mean production/UAT verification.
- `OBSERVED` means current code exhibits the behavior, but business ownership or universal enforcement is not proven.
- `INFERRED`, `UNVERIFIED`, `REQUIRES BACKEND CONFIRMATION`, and `REQUIRES DOMAIN CONFIRMATION` retain their Gate 4 meanings.

## T1 Boundary Review

T1 correctly treats its list shape as a read model rather than a canonical entity. Raw rows are validated before normalization, the Vue page consumes normalized names, boolean flags, and nullable audit fields, and paging/loading/request-generation/access remain outside the row model (`frontend/app/features/warranty-item/list/warranty-item-list-service.ts:37-124`, `frontend/app/features/warranty-item/list/warranty-item-list-state.ts:9-139`, `frontend/app/features/warranty-item/WarrantyItemPage.vue:17-55`). No raw backend row is bound directly to the T1 table.

The following T1 choices are intentionally presentation-oriented:

- `groupName` maps from `type_name`; it does not retain the authoritative `type_code` relationship (`warranty-item-list-service.ts:87-98`).
- `durationLabel` maps from the server-computed `tot_warranty`; it does not retain `tot_date`, `tot_month`, or `tot_year` (`warranty-item-list-service.ts:87-98`).
- `addedBy`, `addedAt`, `editedBy`, and `editedAt` are read-only projection metadata, not create/edit properties.
- `lifetime` and `active` are safely normalized from `Y`/`N` for list display.

**T1 DOMAIN BOUNDARY FINDING:** the T1 summary is appropriately narrow for list-only behavior, but `groupName` and `durationLabel` are lossy projections. Ticket 02 must obtain detail data and build an edit/canonical boundary from `type_code` and the three duration components. It must not promote `groupName` or parse `durationLabel` back into domain state. No T1 refactor is required for this finding.

## Domain Vocabulary

| Term | Business meaning | Code/API names | Evidence | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Warranty Item | A tenant-owned master definition describing a named warranty, its period/lifetime state, status, and optional classifications/references. | `rd_mas_warranty2`, `WarrantyItem` | Backend persistence and CRUD model; legacy master page. | VERIFIED structural concept; business breadth OBSERVED | Receipt/project metadata is not automatically part of its core model. |
| Warranty Code | Tenant-scoped business code used to read, update, delete, and check duplicates. | `war_code`, normalized `code` | Backend key and CRUD queries; T1 list. | VERIFIED | It is not globally unique without tenant context. |
| Warranty Name | Human-readable name of a Warranty Item. | `war_des`, normalized `name` | Create/update required checks and list/detail reads. | VERIFIED | Required on create/update by the backend. |
| Warranty Group | Classification selected by a Warranty Item and owned by the Warranty Group master. | `type_code`, `type_name`, `rd_mas_cfr_type` | List/detail lookup and group delete guard. | VERIFIED relationship; optionality OBSERVED | `type_code` is identity; `type_name` is presentation. |
| Material Reference | Optional reference to a material master row. | `itemcode`, `itemname`, `ibrcode.type_code` | Detail lookup and legacy selector. | OBSERVED | Business requirement and inactive/missing behavior require domain confirmation. |
| Warranty Duration | Structured year/month/day components used to describe a fixed warranty period. | `tot_year`, `tot_month`, `tot_date` | Persistence, edit UI, import, and server display formatting. | VERIFIED structure; value semantics partly UNVERIFIED | Null versus zero, ranges, and negative values are not resolved. |
| Duration Label | A list projection formatted by the backend. | `tot_warranty`, `durationLabel` | Backend concatenates year/month/day; T1 displays it. | VERIFIED presentation concept | Not canonical state and must never be parsed for edits. |
| Lifetime | Flag indicating a lifetime warranty in current UI and persistence. | `lifetime` | Backend field and legacy toggle/callout. | OBSERVED business meaning; VERIFIED contract flag | Backend does not enforce exclusivity with duration components. |
| Active | Whether a persisted Warranty Item is active. | row `active` | Backend row and T1 boolean normalization. | VERIFIED | Distinct from list filter semantics. |
| Active filter | Query mode selecting active-only or all statuses. | query `active=Y|N` | Backend predicate and T1 query. | VERIFIED | `N` means all statuses, not inactive-only. |
| Audit Metadata | Server-authored information about creation and last edit. | `add_user`, `add_dt`, `edit_user`, `edit_dt` | Backend sets these during mutations/import. | VERIFIED projection metadata | Excluded from create/edit domain input. |
| Reference IC | Unresolved legacy label; no canonical business meaning is assigned in Gate 4. | `WarrantyRefIC`, `ic_docno`, `ic_itemno` | Current UI associates the label with receipt selection and the backend queries IC transaction rows. | REQUIRES DOMAIN CONFIRMATION | Implementation association is not a domain definition. Do not add it to the root glossary or core model. |

## Warranty Item Identity

### Persistence identity

The persistence key is `(maincode, war_code)`: both properties carry `[Key]`, while `itemcode` is an ordinary optional field (`Mango.Core/Data/DataModels/rd_mas_warranty2.cs:7-18,48-52`). This is `VERIFIED` owning-code evidence.

### Application/domain identity

The backend derives `maincode` from the authenticated context on create and scopes reads, duplicate checks, updates, deletes, and group lookups by `auth.maincode`. Client calls identify a Warranty Item with `war_code` inside that tenant context (`Mango.Web/Areas/CSM/Models/Master/WarrentyItem.cs:137-178,186-205,276-310,312-354`).

The pragmatic domain identity is therefore:

```text
TenantContext (outside the entity) + WarrantyItemCode
```

`WarrantyItemCode` is `MODEL NOW`. `maincode` remains an authorization/tenant boundary supplied by the backend, not a form field. `itemcode` is not an identity candidate.

### Mutability

The legacy UI makes `war_code` read-only during edit, and the backend uses it to locate the row without assigning a new code (`Website/Scripts/App/Application/Components/Pages/Master/v_csm_mas_002.vue:90-97,742-760`; backend `WarrentyItem.cs:290-306`). Treat code as immutable in Ticket 02 edit state (`OBSERVED`, consistent with owning update code). A code change would be a separate operation and is not evidenced.

## Core Properties

The smallest evidence-supported canonical concept is:

```text
WarrantyItem
  code                 WarrantyItemCode, tenant-scoped
  name                 string
  groupCode            WarrantyGroupCode?        (optionality observed, semantics to confirm)
  materialCode         MaterialCode?              (candidate domain reference)
  duration             { years?, months?, days? } (structured, never durationLabel)
  lifetime             boolean
  active               boolean
```

This is a conceptual model, not an instruction to introduce framework types. Nullable markers deliberately preserve unresolved contract semantics. Ticket 02 must decide null/empty/zero normalization using detail and mutation evidence before implementing a final TypeScript type.

Not part of the core properties:

- audit fields;
- `type_name`, `itemname`, `tot_warranty`, or other display projections;
- tenant/auth state;
- paging, filters, pending/error state, or request generation;
- upload/download mechanics;
- receipt/project/location provenance fields until their business ownership is confirmed.

## Warranty Group Relationship

`type_code` is the stored relationship key. List/detail reads resolve `type_name` from `rd_mas_cfr_type`, and Warranty Group deletion is rejected when a Warranty Item has that `type_code` (`Mango.Web/Areas/CSM/Models/Master/WarrentyItem.cs:50-66,142-160`; `Mango.Web/Areas/CSM/Models/Master/Worktype.cs:158-174`). This makes the relation `VERIFIED`.

The legacy form obtains active groups and uses the group marked `default_` to prefill a form (`Website/.../v_csm_mas_002.vue:701-740`). `default_` is owned and maintained per authenticated tenant by the group service (`Worktype.cs:299-324`). It is application/form initialization behavior, not a Warranty Item invariant.

Ticket 02 must model an active Warranty Group lookup capability. It must retain the saved `type_code` on edit rather than replacing it with the current default. Whether group selection is required, whether an inactive saved group may remain, and how a missing group is displayed are `REQUIRES DOMAIN CONFIRMATION`.

The persistence-only `war_group_code` field has no observed use in Warranty Item list/detail/create/update/delete flows. Its evidence status is `UNVERIFIED`, its field classification is `LEGACY-ONLY`, and it is excluded from the canonical model.

## Warranty Duration

The authoritative contract exposes three independent nullable integer columns: `tot_year`, `tot_month`, and `tot_date` (`rd_mas_warranty2.cs:29-36`). The list endpoint computes `tot_warranty` by concatenating those components after coalescing null to zero (`WarrentyItem.cs:62-66`). Therefore:

- the three components are structural contract truth;
- `tot_warranty`/`durationLabel` is presentation only;
- `tot_warranty` has no demonstrated independent persistence meaning;
- no evidence establishes allowed ranges, carry rules, negative-value rejection, or whether null differs from zero.

Ticket 02 must model duration as structured edit data and validate only rules confirmed during that ticket. It must not infer a total number of days or months.

## Lifetime Semantics

The legacy UI describes `lifetime=Y` as coverage for the useful life, makes duration controls read-only, and clears all three components when the toggle is used (`Website/.../v_csm_mas_002.vue:102-128,830-833`). That behavior is `OBSERVED`.

The backend stores the lifetime flag and components independently and update assigns all four without enforcing exclusivity (`WarrentyItem.cs:296-305`). Import normalizes invalid lifetime values to `N` but also retains duration values (`WarrentyItem.cs:519-543`). Consequently, a discriminated `FixedDuration | Lifetime` union would currently assert an invariant the backend does not enforce.

For Gate 4, keep `lifetime` and structured duration together and record this rule as `REQUIRES DOMAIN CONFIRMATION`:

```text
If lifetime is true, are all duration components required to be zero/null and ignored?
```

## Active State

The entity flag is a persisted `Y`/`N` contract value normalized to boolean in T1 (`warranty-item-list-service.ts:57-59,87-98`). That mapping is `VERIFIED` for read rows.

The list query overloads the same external values:

- `active=Y` applies `row.active == "Y"`;
- any other value, including the supported `active=N`, applies no active predicate and returns all statuses (`WarrentyItem.cs:45-53`).

T1 correctly labels `N` as “All statuses” (`WarrantyItemPage.vue:88-92`). Entity `active=false` must never be confused with query `active=N`.

## Audit Metadata

Model audit data separately from the entity edit model:

```text
WarrantyItemAuditProjection
  addedBy   string?
  addedAt   timestamp?
  editedBy  string?
  editedAt  timestamp?
```

Create sets `maincode`, `add_user`, and `add_dt`; update sets edit metadata; import uses `IMPORT` (`WarrentyItem.cs:186-208,276-306,527-546`). T1 exposes the fields only for display. Create/update mappers must omit audit fields from user-authored input even though the broad backend DTO can bind them.

## Domain Invariants

| Invariant candidate | Status | Evidence | Enforced by | Failure behavior |
| --- | --- | --- | --- | --- |
| A Warranty Item is identified by code within the authenticated tenant. | VERIFIED | Composite key plus tenant-scoped CRUD. | Persistence/backend | Duplicate create or missing update produces backend error. |
| Code and name are non-empty on create and update. | VERIFIED | `WarrentyItem.cs:198-205,285-294`. | Backend | Thai warning string in error envelope. |
| A new code is unique within `maincode`. | VERIFIED | `WarrentyItem.cs:203-205`. | Backend/database boundary | “already used” error. |
| Edit does not change code. | OBSERVED, strongly supported | UI read-only; backend uses code as lookup and does not assign it. | UI/backend implementation | No rename operation exists. |
| Deletion is rejected when area/project warranty references exist. | VERIFIED owning-code rule | `WarrentyItem.cs:312-354`. | Backend transaction | Referential “already in use/cannot delete” error. |
| A group code must reference an existing group. | UNVERIFIED as a universal invariant | Master import checks it, but manual create/update do not. | Import path only | Import row error. |
| A material code must reference an existing material. | UNVERIFIED as a universal invariant | Master import checks it, but manual create/update do not. | Import path only | Import row error. |
| Lifetime excludes a non-zero duration. | REQUIRES DOMAIN CONFIRMATION | Legacy UI clears/locks; backend does not enforce. | UI only | No authoritative backend failure. |
| Duration components are non-negative and range-limited. | UNVERIFIED | No owning mutation validation found. | None evidenced | Unknown. |
| Active and lifetime accept only `Y`/`N`. | OBSERVED contract convention | T1 validates reads; import normalizes; manual backend mutations do not validate. | Read normalizer/import | Malformed T1 row or import normalization. |

## Validation Classification

### Structural validation

- Envelope/row shape and `Y`/`N` read flags: T1 normalizer (`VERIFIED` for T1).
- Integer input shape for duration: `MODEL DURING T2`; nullable/empty conversion is unresolved.
- Import file type and multipart field: `MODEL DURING T4`; confirmed backend upload accepts `.xlsx`, but the active frontend/backend import routes conflict.

### Domain validation

- Required code/name and tenant-scoped uniqueness: backend authority, with UX prevalidation allowed.
- Code length/pattern: not finalized. The legacy UI limits 15 characters while persistence allows 120; special-character validation is present on import, not manual create/update.
- Group/material validity, duration ranges, and lifetime interaction require confirmation before they become frontend domain rules.

### Backend-only validation

- Duplicate code and existing-row checks.
- Delete referential guards across area/project warranty data.
- Any database constraint, tenant scoping, or transaction outcome.
- Frontend checks may improve UX but cannot replace these backend decisions.

## Domain Errors

Keep error categories distinct even while the backend returns string errors:

| Category | Examples | Boundary |
| --- | --- | --- |
| Domain | required code/name, duplicate code, invalid confirmed group/material, confirmed duration rule | Normalization/use case; backend remains authoritative. |
| Application | invalid draft, duplicate submit prevented, stale request ignored, page clamp | Ticket-specific controller/state. |
| Authorization | access unavailable, denied, read-only, possible TRN0001/admin restriction | Access/application policy. |
| Transport/Infrastructure | malformed envelope, network/server failure, unavailable `$xt`, upload failure, invalid export token/popup | Typed transport and adapters. |
| Referential policy | delete blocked because the item is used | T3 delete use case mapped from backend error. |

Do not create a rich domain exception hierarchy merely to re-label the current `{ success, error }` envelope. Introduce typed results only where a ticket needs reliable handling.

## Authorization Boundary

T1 access is an application/auth snapshot based on the exact `CSM_WEB / 20820` right and distinguishes unavailable, denied, read-only, and editable (`frontend/app/features/warranty-item/runtime/access-snapshot.ts:1-52`). Route `auth: true` and the same menu right are preserved (`frontend/app/routes/routes.master.js:17-26`). None belongs to `WarrantyItem`.

Legacy `permission()` additionally hides edit/delete columns when configuration `TRN0001` is `Y` and the user is not admin (`Website/.../v_csm_mas_002.vue:835-841`). Its business intent and relationship to target rights are `REQUIRES DOMAIN CONFIRMATION`. Resolve it in application authorization before T2/T3 completion; do not embed it in the domain model.

## Domain / Application / Infrastructure Classification

| Concept | Layer | Progressive action |
| --- | --- | --- |
| tenant-scoped Warranty Item identity, name, group relation, material relation candidate, structured duration, lifetime, active | Domain | MODEL NOW, with documented unresolved validation. |
| list summary and audit projection | Read Model | MODEL NOW. |
| edit/draft strings, validation messages, selected group option, unsaved values | UI/Application | MODEL DURING T2. |
| `field`, `text`, page, pageSize, total, maxPage, displayedPage, loading/error, request generation, draft filters | Application/query state | Keep outside domain. |
| access snapshot, `CSM_WEB / 20820`, TRN0001/admin policy | Application/Auth | T1 boundary; refine during T2/T3. |
| raw DTO names and `{header: ...}` envelopes | Infrastructure contract | Explicit mappers per ticket. |
| `$xt`, `window.dataServer`, download token/URL/popup | Infrastructure | MODEL DURING T5. |
| multipart/file upload and Excel parsing | Infrastructure/Application | MODEL DURING T4. |
| receipt/project/location provenance | Unresolved integration metadata | DEFER unless a ticket explicitly includes Reference IC. |

## Deferred Concepts

### Audit and passive metadata classification

| Field(s) | Classification | Status | Reason / next gate |
| --- | --- | --- | --- |
| `add_user`, `add_dt`, `edit_user`, `edit_dt` | AUDIT/METADATA; read-only projection | VERIFIED | Server-authored; exclude from T2 draft and create/update DTO source. |
| `acct_no` | CONTRACT-ONLY provenance candidate | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Receipt customer account copied during Reference IC creation; not updated by standard edit. |
| `war_date_start`, `war_date_end` | CONTRACT-ONLY provenance dates | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Read-only Reference IC display/import data; not the canonical configured duration. |
| `ic_docno`, `ic_itemno` | CONTRACT-ONLY receipt-line linkage candidate | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Used to prevent selecting the same IC line again. Do not define “Reference IC” globally yet. |
| `pre_event`, `pre_event2` | CONTRACT-ONLY project linkage | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Can trigger area-item side effects during create. |
| `loccode` | CONTRACT-ONLY location linkage | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Used with project fields in area-item creation. |
| `vendor` | Detail/import projection metadata | OBSERVED | Displayed read-only for IC-linked items; not updated by standard edit. |
| `war_group_code` | LEGACY-ONLY | UNVERIFIED | Present in persistence class, no active Warranty Item flow found. |

### Progressive model ownership

- **MODEL NOW:** tenant-scoped identity, code/name, group key versus name projection, structured duration versus label, lifetime and active flags, audit projection, list/read normalization, layer boundaries, error categories.
- **MODEL DURING T2:** detail normalizer, edit/draft model, create/update whitelists, group/material lookup behavior, null/empty/zero conversion, validation and pending state, TRN0001/admin policy.
- **MODEL DURING T3:** delete command/result, minimum payload, referential error mapping, duplicate prevention, reload and final-page clamp.
- **MODEL DURING T4:** chosen import endpoint, file contract, import row/candidate, validation, upsert/atomicity/count/error semantics.
- **MODEL DURING T5:** export request/result, token validation, file/download abstraction, popup and error behavior.
- **DEFER:** canonical Reference IC concept, receipt/project/location ownership, `war_group_code`, and any aggregate/event/repository framework.

## T2 Readiness Decision

**T2 CAN START.**

The owning implementation identifies the detail endpoint, tenant-scoped identity, editable fields, create/update envelopes, server-authored audit fields, group lookup, and update behavior. T2 must not be declared complete until it resolves or explicitly accepts:

1. Warranty Code maximum length and character rule;
2. null versus zero and permitted ranges for duration;
3. lifetime/duration interaction;
4. TRN0001/admin behavior relative to target access rights;
5. nullable/inactive/missing Warranty Group and Material Reference behavior;
6. client spelling/casing for `WarrantyItem_Update` through an integration-level check.

Reference IC, T4 import-contract conflict, and T5 download mechanics do not block beginning Ticket 02.
