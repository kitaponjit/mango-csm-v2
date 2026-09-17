# Warranty Item Evidence Matrix

## Evidence Sources

Approved implementation base: `5e7a20a4d14958fe0f76241464f8448ce2bb9464`.

Evidence was evaluated in this order:

1. Confirmed owning .NET implementation in the separate `MangoServiceNetCore` repository:
   - `Mango.Web/Areas/CSM/Controllers/MasterController.cs:108-197`
   - `Mango.Web/Areas/CSM/Models/Master/WarrentyItem.cs:45-354,407-604,872-965`
   - `Mango.Web/Areas/CSM/Models/Master/Worktype.cs:37-176,299-324`
   - `Mango.Core/Data/DataModels/rd_mas_warranty2.cs:7-76`
2. Approved T1 target implementation and tests under `frontend/app/features/warranty-item/` and `frontend/test/warranty-item/`.
3. Current target route at `frontend/app/routes/routes.master.js:17-26`.
4. Current target port and legacy behavior:
   - `frontend/app/Components/Pages/Master/v_csm_mas_002.vue`
   - `Website/Scripts/App/Application/Components/Pages/Master/v_csm_mas_002.vue`
5. Gate/Ticket requirements as planning evidence only.

`VERIFIED` below means confirmed by authoritative code/contract and consistent callers. No production/UAT run was performed in Gate 4.

## Domain Evidence Matrix

| Concept / Rule | Evidence Status | Source | T1 | T2 | T3 | T4 | T5 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Warranty identity | VERIFIED | Composite persistence key `(maincode, war_code)`; CRUD uses code within `auth.maincode` (`rd_mas_warranty2.cs:7-18`; `WarrentyItem.cs:137-205,276-354`). | Summary key is normalized `code`. | Use immutable code inside tenant context. | Delete command targets code; minimum body still to verify. | Import upsert matches tenant+code. | Export includes code, no identity mutation. |
| `itemcode` is not identity | VERIFIED structural; business meaning OBSERVED | Ordinary persistence field and material lookup (`rd_mas_warranty2.cs:48-52`; `WarrentyItem.cs:143-155`). | Omitted. | Model optional Material Reference behavior. | No identity role. | Import validates material when supplied. | Export column only. |
| Warranty Group relation | VERIFIED relation; optionality REQUIRES DOMAIN CONFIRMATION | Item `type_code` resolves `rd_mas_cfr_type`; group delete guard checks item use (`WarrentyItem.cs:50-66`; `Worktype.cs:158-174`). | `type_name` only -> `groupName`; lossy projection. | Add group code lookup and edit mapping; resolve required/inactive/missing behavior. | No direct work. | Import validates supplied group. | Exports group code. |
| Group default behavior | OBSERVED application behavior | Legacy loads active groups and prefills the group with `default_=Y`; group service owns default exclusivity (`v_csm_mas_002.vue:701-740`; `Worktype.cs:299-324`). | Not used. | Create-form convenience only; do not overwrite saved edit value. | None. | May provide missing import group only if explicitly required; current master import does not. | None. |
| `war_group_code` | UNVERIFIED | Persistence field exists, no active Warranty Item flow found; field classification is LEGACY-ONLY (`rd_mas_warranty2.cs:20-21`). | Excluded. | Do not model without new evidence. | Defer. | Defer. | Defer. |
| Entity active state | VERIFIED contract flag | Persistence `active`; T1 validates and maps `Y/N` to boolean (`rd_mas_warranty2.cs:26-27`; list service `:57-59,87-98`). | Boolean read field. | Boolean draft -> `Y/N`; confirm mutation validation. | Row status does not change delete identity. | Import requires then normalizes flag. | Raw flag exported. |
| List `active=Y` semantics | VERIFIED | Backend applies active predicate only for `Y` (`WarrentyItem.cs:45-53`). | Default active-only. | Reuse list refresh semantics only. | Reload uses current query. | None. | None. |
| List `active=N` semantics | VERIFIED | Same conditional means no predicate. | Correctly labels All statuses. | Never interpret as entity inactive. | Same. | None. | None. |
| Days/months/years structure | VERIFIED structure; value rules UNVERIFIED | Three nullable integer persistence fields, edit controls, backend assignments (`rd_mas_warranty2.cs:29-33`; `v_csm_mas_002.vue:111-123`; `WarrentyItem.cs:296-305`). | Structured fields intentionally omitted. | Model structured draft; resolve null/zero/ranges/negative values. | No direct work. | Import parses integers/defaults zero. | Separate columns exported. |
| Lifetime | VERIFIED contract flag; business interaction OBSERVED | Persistence flag; UI describes lifetime and clears/locks duration; backend stores independently (`rd_mas_warranty2.cs:35-36`; UI `:102-128,830-833`; backend `:296-305`). | Boolean read field. | Resolve lifetime/duration invariant before completion. | None. | Import normalizes flag but keeps duration. | Raw flag exported. |
| `tot_warranty` | VERIFIED presentation-only | Backend constructs label from components (`WarrentyItem.cs:62-66`). | Maps to `durationLabel`. | Must not parse or use as canonical/edit truth. | None. | Not import truth. | Not an independent export field. |
| Warranty Code required | VERIFIED backend rule | Create/update reject empty code/name (`WarrentyItem.cs:198-205,285-294`). | Read-only display. | Frontend may prevalidate; backend remains authority. | Code required for command. | Import rejects blank code. | Code exported. |
| Warranty Code uniqueness | VERIFIED backend rule | Tenant-scoped create duplicate check (`WarrentyItem.cs:203-205`). | Not applicable. | Map backend duplicate error; no client-only authority. | None. | Import upserts rather than failing duplicates. | None. |
| Warranty Code length | REQUIRES DOMAIN CONFIRMATION | Legacy UI `maxlength=15`; persistence `[MaxLength(120)]`; conflict is registered below (`v_csm_mas_002.vue:90-97`; `rd_mas_warranty2.cs:15-18`). | No validation. | Must resolve before final validation. | None. | Spreadsheet path relies on persistence/import behavior. | None. |
| Warranty Code character rule | UNVERIFIED universally | Master import rejects configured special characters; create/update only check non-empty (`WarrentyItem.cs:472-488` vs `:198-205,285-288`). | No validation. | Do not promote import-only rule without confirmation. | None. | Use confirmed import rule for its own path. | None. |
| Audit metadata | VERIFIED projection metadata | Server sets add/edit fields; import uses `IMPORT` (`WarrentyItem.cs:194-196,282-303,527-546`). | Nullable read projection. | Exclude from draft and user-authored DTO input. | Backend may update via deletion only by removing row. | Server-authored import audit. | Audit fields appear in server export. |
| `acct_no` | OBSERVED; REQUIRES DOMAIN CONFIRMATION | Receipt query returns customer account; selected row is copied to create; delete contains conditional legacy guard (`WarrentyItem.cs:872-945,312-330`; UI `:925-957`). | Raw list field ignored. | Exclude from generic manual form mapper. | Determine whether minimum delete payload needs it. | Receipt/all-warranty import concern, not confirmed core. | Not current master export column. |
| `ic_docno` / `ic_itemno` | OBSERVED receipt-line linkage; REQUIRES DOMAIN CONFIRMATION | ReadRefIC maps transaction doc/line and excludes already-linked pairs (`WarrentyItem.cs:872-945`); UI labels IC Doc/Item (`v_csm_mas_002.vue:163-190,232-260`). | Ignored. | Exclude unless Reference IC is explicitly in T2 scope. | Full-row delete currently round-trips them; backend general guards use code. | Possible separate receipt-import provenance. | Not current export column. |
| `war_date_start` / `war_date_end` | OBSERVED provenance metadata | Receipt query and read-only UI; master import accepts dates (`WarrentyItem.cs:891-908,461-464`; UI `:163-190`). | Ignored. | Do not confuse with configured duration. | None confirmed. | Model only for chosen import/reference workflow. | Not current master export column. |
| `pre_event` / `pre_event2` | OBSERVED project integration metadata; REQUIRES DOMAIN CONFIRMATION | Reference query returns project keys; create may add project/location area data when `pre_event2` exists (`WarrentyItem.cs:210-269,872-945`). | Ignored. | Exclude from generic manual edit. | Legacy delete can inspect them with other context. | All-warranty/reference flow only. | None. |
| `loccode` | OBSERVED location integration metadata; REQUIRES DOMAIN CONFIRMATION | Used with project fields in Reference IC query/create side effect (`WarrentyItem.cs:210-269,872-945`). | Ignored. | Exclude from generic manual edit. | May be present in legacy delete row. | All-warranty/reference flow only. | None. |
| Create payload | VERIFIED broad envelope; whitelist INFERRED from behavior | Controller binds `{header: rd_mas_warranty2}`; legacy manual form sends current form (`MasterController.cs:149-159`; UI `:751-764`). | No mutations. | Create mapper should send only confirmed manual fields; server owns tenant/audit. | None. | Import is a separate contract. | None. |
| Update payload | VERIFIED used fields | Same broad header binder; backend updates name/status/duration/lifetime/group/material and server audit (`MasterController.cs:161-170`; `WarrentyItem.cs:276-310`). | No mutations. | Separate typed Update DTO; immutable code lookup. | None. | None. | None. |
| Update endpoint spelling | VERIFIED owning route contract; deployed smoke test not run | Clients use `WarrantyItem_Update`; backend method is `Warrantyitem_Update` (`v_csm_mas_002.vue:758-764`; controller `:183-193`); the .NET 8 conventional area route is mapped at `Program.cs:434-445`; ASP.NET Core routing is case-insensitive. | None. | Use established client spelling; deployed smoke test is UAT/release evidence. | None. | None. | None. |
| Delete guard | VERIFIED owning behavior | Backend rejects area/project references before remove (`WarrentyItem.cs:312-354`). | No mutations. | None. | Model command/result, duplicate prevention, backend error, reload, page clamp. | None. | None. |
| Delete minimum payload | UNVERIFIED | Legacy sends full row; backend primarily uses code but one conditional guard reads passive fields (`v_csm_mas_002.vue:785-809`; `WarrentyItem.cs:318-344`). | None. | None. | Requires focused backend/integration confirmation. | None. | None. |
| Import endpoint/request | REQUIRES BACKEND CONFIRMATION | Frontend JSON `*ImportData*` routes are absent from confirmed backend; backend exposes multipart `WarrantyItemImport_Master(IUploadedFile file)`; conflict is registered below (`v_csm_mas_002.vue:878-920`; controller `:185-190`). | None. | Does not block. | None. | Blocking contract choice for T4. | None. |
| Import behavior | OBSERVED owning implementation; environment parity unverified | Backend `.xlsx` parser validates and upserts by tenant+code with transaction wrapper (`WarrentyItem.cs:407-554`). | None. | None. | None. | Resolve atomicity, row failure, result/count, duplicate submission, refresh. | None. |
| Export token | OBSERVED end-to-end code path | Backend returns `CreateTokenHex`; shared form opens File/DownLoad with token (`MasterController.cs:192-197`; `form-template-2.vue:169-191`). | None. | None. | None. | None. | Typed token/download adapter; validate errors/popup behavior. |
| Reference IC | REQUIRES DOMAIN CONFIRMATION | Current UI associates this unresolved label with receipt selection and the backend queries IC receipt/transaction rows; this does not establish a canonical domain meaning (`v_csm_mas_002.vue:200-203`; `WarrentyItem.cs:872-945`). | Excluded. | Not required for generic Create/Edit start. | Passive fields may affect legacy delete shape. | Separate reference/all-warranty workflow only if authorized. | None. |
| TRN0001/admin | OBSERVED application authorization; REQUIRES DOMAIN CONFIRMATION | Legacy hides edit/delete columns when TRN0001 is Y for non-admin (`v_csm_mas_002.vue:835-841`). | T1 uses `CSM_WEB/20820`, not TRN0001. | Resolve before exposing edit actions. | Resolve before exposing delete actions. | Confirm import visibility separately. | Confirm export visibility separately. |
| Access `CSM_WEB / 20820` | VERIFIED T1 application/auth boundary | Route and access snapshot (`routes.master.js:17-26`; `runtime/access-snapshot.ts:1-52`). | Enforced fail-closed for list. | Reuse application policy, never entity fields. | Same. | Same. | Same. |
| Paging/loading/error/request generation | VERIFIED application state | T1 state/controller (`warranty-item-list-state.ts:9-139`). | Implemented. | Reuse around post-save refresh. | Add final-page clamp after delete. | Pending/refresh behavior. | Pending/error behavior. |

## Domain / Read / Application / Infrastructure Matrix

| Concept | Classification | Evidence Status | Progressive classification |
| --- | --- | --- | --- |
| Warranty Code within tenant context | Domain identity | VERIFIED | MODEL NOW |
| Warranty Name | Domain property | VERIFIED | MODEL NOW |
| `type_code` relationship | Domain relationship | VERIFIED | MODEL NOW; refine during T2 |
| `type_name` / `groupName` | Read Model projection | VERIFIED | MODEL NOW |
| `itemcode` | Domain relationship candidate | OBSERVED | MODEL DURING T2 |
| duration components | Domain value structure | VERIFIED structure | MODEL NOW; validate during T2 |
| `tot_warranty` / `durationLabel` | Read Model presentation | VERIFIED | MODEL NOW as non-canonical |
| lifetime, entity active | Domain properties | VERIFIED contract flags | MODEL NOW; refine during T2 |
| audit fields | Audit Metadata / Read Model | VERIFIED | MODEL NOW separately |
| Reference IC/passive fields | Unresolved Legacy/Integration Metadata | OBSERVED | DEFER unless explicitly scoped |
| list filters/pagination/loading/error/generation/displayedPage/drafts | Application State | VERIFIED | Keep outside domain |
| access snapshot/menu right/TRN0001/admin | Application/Auth | OBSERVED | T1 menu-right mechanics are VERIFIED; cross-policy semantics remain application evidence for T2/T3. |
| raw field names, envelopes, endpoint casing | Infrastructure Contract | VERIFIED/OBSERVED | Explicit per-ticket mapper |
| `$xt` | Infrastructure adapter | VERIFIED current target seam | Existing boundary |
| upload/Excel/multipart | Infrastructure/Application | REQUIRES BACKEND CONFIRMATION | Owning signatures are OBSERVED; deployed route parity remains unresolved for T4. |
| export token/base URL/download popup | Infrastructure/UI | OBSERVED | MODEL DURING T5 |

## Conflict Register

### DOMAIN EVIDENCE CONFLICT — Warranty Code length

- Concept: maximum Warranty Code length.
- Source A: legacy/current port input limits code to 15 characters (`Website/.../v_csm_mas_002.vue:90-97`).
- Source B: persistence model permits 120 characters (`rd_mas_warranty2.cs:15-18`).
- Likely reason: stale UI constraint or broader storage allowance.
- Impact: T2 cannot claim a canonical maximum yet.
- Recommended interpretation: preserve existing 15-character UX only as compatibility behavior until product/backend owners confirm the business limit.
- Supervisor decision required: before T2 validation is finalized, not before T2 starts.

### DOMAIN EVIDENCE CONFLICT — Lifetime versus duration

- Concept: whether lifetime excludes fixed duration.
- Source A: legacy UI clears and locks duration when lifetime is selected (`v_csm_mas_002.vue:102-128,830-833`).
- Source B: backend persists/updates flag and three components independently and enforces no exclusivity (`WarrentyItem.cs:296-305,519-543`).
- Likely reason: UI convention without backend invariant.
- Impact: a discriminated union would reject states the backend can contain.
- Recommended interpretation: keep both representations during T2 and confirm normalization/invariant before completion.
- Supervisor decision required: business/domain confirmation before final T2 model.

### DOMAIN EVIDENCE CONFLICT — Manual versus import validation

- Concept: code characters and group/material validity.
- Source A: master import checks special characters and referenced group/material existence (`WarrentyItem.cs:472-517`).
- Source B: manual create/update only require code/name and do not validate group/material existence (`WarrentyItem.cs:198-208,285-306`).
- Likely reason: validation drift between mutation paths.
- Impact: T2 must not assert import-only rules as universal domain invariants.
- Recommended interpretation: backend remains authority; seek domain confirmation and add UX validation only when confirmed.
- Supervisor decision required: before adding stricter T2 validation.

### RESOLVED CONTRACT EVIDENCE — Update route casing

- Concept: canonical client endpoint spelling.
- Source A: Website/current target clients call `WarrantyItem_Update` (`v_csm_mas_002.vue:758-764`).
- Source B: the owning .NET 8 backend action is spelled `Warrantyitem_Update` (`MasterController.cs:183-193`) and is exposed through conventional `{area}/{controller}/{action}` routing (`Program.cs:434-445`).
- Framework contract: ASP.NET Core routing is case-insensitive ([Microsoft documentation](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api?view=aspnetcore-8.0)).
- Resolution: retain `WarrantyItem_Update`; it resolves to the owning `Warrantyitem_Update` action under the verified route mapping.
- Remaining evidence: no deployed mutation request was sent. Treat that as UAT/release smoke-test evidence, not an unresolved T2 endpoint choice.
- Supervisor decision required: no.

### DOMAIN EVIDENCE CONFLICT — Import transport

- Concept: Ticket 04 endpoint and request shape.
- Source A: current page posts parsed JSON to `WarrantyItemImportData_Master`/`WarrantyAutoImportData` (`v_csm_mas_002.vue:878-920,1023-1069`).
- Source B: confirmed backend exposes multipart `WarrantyItemImport_Master`/`WarrantyAutoImport` and no matching Data actions (`MasterController.cs:142-146,185-190`).
- Likely reason: deployment/version drift or unported endpoints.
- Impact: T4 cannot safely implement endpoint, body, response, or refresh behavior.
- Recommended interpretation: confirm the deployed owner contract; prefer the owning multipart signature only after integration evidence.
- Supervisor decision required: before T4, not for T2.

### Terminology tension — Warranty Group versus Work Type

- Concept: canonical relationship name.
- Source A: Warranty Group page/API calls it Group Code/Name and `WarrantyGroup_*` (`Website/.../v_csm_mas_001.vue`).
- Source B: Warranty Item form/list labels the same `type_code/type_name` as Work Type (`v_csm_mas_002.vue:131-153,578-583`).
- Likely reason: legacy table/name reuse.
- Impact: UI copy can differ while the relationship key remains the same; domain meaning is not fully settled.
- Recommended interpretation: use “Warranty Group” for the master relation in Gate artifacts and record “Work Type” as legacy UI wording.
- Supervisor decision required: copy/domain-owner confirmation before broad glossary adoption.

## Unresolved Questions

| Question | Required classification | Needed by | Current safe action |
| --- | --- | --- | --- |
| Is Warranty Code limited to 15 or 120 characters, and which characters are valid? | REQUIRES DOMAIN/BACKEND CONFIRMATION | T2 completion | Start mapper/form work without finalizing the rule. |
| Are null duration components distinct from zero; what ranges are legal? | REQUIRES DOMAIN CONFIRMATION | T2 completion | Preserve components and avoid invented ranges. |
| Must lifetime always clear duration, or merely override it for calculation/display? | REQUIRES DOMAIN CONFIRMATION | T2 completion | Keep both fields until resolved. |
| Is Warranty Group required, and may an inactive/missing saved group remain on edit? | REQUIRES DOMAIN CONFIRMATION | T2 completion | Use code identity and do not overwrite with default. |
| Is Material Reference optional and must it reference an active material? | REQUIRES DOMAIN CONFIRMATION | T2 completion | Treat as optional candidate, backend authoritative. |
| Does TRN0001/admin still govern target edit/delete in addition to menu rights? | REQUIRES DOMAIN CONFIRMATION | T2/T3 completion | Keep policy outside the entity and fail closed where uncertain. |
| What is the minimum safe delete payload? | REQUIRES BACKEND CONFIRMATION | T3 | Preserve an explicit command boundary; verify integration. |
| Which import endpoint and request shape is deployed? | REQUIRES BACKEND CONFIRMATION | T4 | Do not implement T4 from current conflicting evidence. |
| Is master import atomic for the whole file, and what result/count is guaranteed? | REQUIRES BACKEND CONFIRMATION | T4 | Model as unknown until runtime tests. |
| What are export-token lifetime/security/error semantics? | REQUIRES BACKEND CONFIRMATION | T5 | Hide token handling behind a typed file adapter. |
| Is “Reference IC” the approved business term, and is receipt lineage core or integration metadata? | REQUIRES DOMAIN CONFIRMATION | Deferred/explicit future scope | No root glossary entry or core value object. |

## Ticket Impact

### MODEL NOW

- tenant-scoped Warranty Item identity;
- code/name and group-code relationship;
- group-name and duration-label projections;
- structured duration versus computed label;
- lifetime and entity active flags;
- active filter semantics;
- audit projection separation;
- transport/read/domain/application/infrastructure boundaries;
- error categories and explicit evidence statuses.

### MODEL DURING T2

- detail DTO validation and normalization;
- edit/draft state and field-level validation;
- separate Create and Update DTO mappers;
- group/material lookup and optional/inactive behavior;
- code rule, duration null/range rule, and lifetime behavior;
- save pending/duplicate-submit/error/success-refresh state;
- TRN0001/admin relationship to T1 access policy;
- deployed-environment smoke confirmation for `WarrantyItem_Update` (UAT/release evidence; owning route contract is verified).

### MODEL DURING T3

- typed delete request/result and minimum payload;
- referential rejection categories/messages;
- pending and duplicate-click prevention;
- refresh and clamp for normal, last-row, last-page, and empty data sets.

### MODEL DURING T4

- authoritative endpoint and JSON-versus-multipart choice;
- selected-file state, `.xlsx` validation, and multipart field;
- untrusted row DTO and import candidate;
- validation, upsert, atomicity, processed count, partial failure, pending, duplicate prevention, and refresh.

### MODEL DURING T5

- typed export command/result;
- token validation and URL construction;
- file/download abstraction, popup behavior, pending state, and errors.

### DEFER

- canonical Reference IC term/value object;
- receipt customer/date/document-line ownership;
- project/event/location ownership and create side effects;
- persistence-only `war_group_code`;
- any Aggregate Root, Domain Event, Repository Factory, CQRS, or generic domain framework.

## T2 Readiness

**T2 CAN START.**

No domain-model blocker prevents beginning Ticket 02. The owning code identifies the detail read, identity, editable field set, create/update envelope, server-authored audit metadata, and Warranty Group source. The unresolved T2 questions listed above must be resolved or explicitly accepted before T2 is called complete. T3–T5 and Reference IC unknowns do not block beginning T2.
