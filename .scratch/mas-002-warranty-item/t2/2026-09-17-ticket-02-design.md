# Ticket 02 Create/Edit Design

## Approval and scope

The Supervisor Directive authorizes Ticket 02 on the reviewed T1 base
`5e7a20a4d14958fe0f76241464f8448ce2bb9464` plus the approved Gate 4 domain
artifacts. The directive is the design approval for this implementation.

In scope: typed create/edit draft, detail read, Warranty Group and Material
lookups, explicit create/update DTOs, validation, permission compatibility,
pending/duplicate protection, error lifecycle, list refresh, and focused tests.

Out of scope: Delete, Import, Export, Reference IC, Warranty Group CRUD,
Material master migration, backend changes, auth rewrite, and any `Nuxt/` or
`Website/` modification.

## Options considered

1. **Typed headless core with a thin Vue page (selected).** Contract validators,
   draft mapping, lookups, mutation service, permission policy, and form
   controller remain pure TypeScript. The T1 page only renders state and emits
   actions. This keeps contract and race behavior testable in the existing Node
   Vitest setup without new dependencies.
2. **Monolithic SFC.** Smaller file count, but contract validation, stale request
   behavior, and duplicate-submit protection become coupled to DOM tests.
3. **Reuse the ported legacy modal/lookup components.** Fastest visually, but it
   reintroduces untyped globals and preserves the legacy detail/default-group
   race. It also obscures the target boundary.

## Architecture

```text
raw backend response
  -> runtime validator / normalizer
  -> detail or lookup model
  -> explicit WarrantyItemDraft
  -> structural/compatibility validation
  -> explicit create/update mapper
  -> { header: approved fields only }

T1 list row --code only--> detail read --> draft
```

The T1 list read model remains projection-only. `groupName` and
`durationLabel` are never mutation input. `war_code` is immutable in Edit and
is the tenant-scoped application identity; tenant identity is never sent.

## Contract boundaries

- Detail: `GET csm/master/WarrantyItem_Read?war_code=<encoded>`.
- Create: `POST CSM/MASTER/WarrantyItem_Create`.
- Update client contract: `POST CSM/MASTER/WarrantyItem_Update`; the owning
  .NET 8 backend action is spelled `Warrantyitem_Update` and is exposed through
  the conventional `{area}/{controller}/{action}` route. ASP.NET Core routing
  is case-insensitive, so the owning route contract is verified. A deployed
  mutation smoke test remains separately classified as UAT/release evidence.
- Group lookup: `GET csm/master/WarrantyGroup_ReadList?active=Y`.
- Material lookup: `GET CSM/Center/Material_ReadList?skip=...&take=...&search_text=...`.

Create and Update payloads whitelist only `war_code`, `war_des`, `type_code`,
`itemcode`, `tot_year`, `tot_month`, `tot_date`, `lifetime`, and `active` inside
`header`. No raw/draft spreading is permitted.

## Draft and lookup behavior

The draft stores code, name, Group code/name, Material code/name, structured
duration components, lifetime, and entity active state. Create defaults match
observed legacy behavior: blank values, duration zeroes, lifetime false, active
true. The active default Group is applied only in Create.

Edit reads detail before opening an editable draft. The active Group lookup is
merged with the saved Group. If that Group is inactive or missing from the
active lookup, it remains as a current-only option so its code cannot be
silently lost; it is not offered as a new selection.

Material is optional/selectable based on observed legacy behavior. T2 provides
only a narrow search seam and retains an existing detail value without creating
a Material subsystem.

## Duration and validation

`tot_year`, `tot_month`, and `tot_date` are the only editable duration truth.
`tot_warranty` is never parsed. The draft allows backend-valid combinations;
it is not a lifetime/duration discriminated union. When a user turns lifetime
on, the UI-compatibility helper clears the three components to zero and the UI
locks them. Detail normalization itself does not erase a stored combination.

Structural validation requires code/name and finite integer duration inputs.
The legacy 15-character code limit is isolated as
`LEGACY_UI_WARRANTY_CODE_MAX`, explicitly not a canonical domain maximum.
No import-only character regex, Group requiredness, Material requiredness, or
invented duration range is enforced.

## Permission policy

T1 menu access (`unavailable`, `denied`, `readonly`, `editable`) remains the
primary gate. Create is available only for `editable` and does not inherit
TRN0001. Edit additionally preserves the observed compatibility rule:
`TRN0001 !== Y || auth.is_admin`. Missing/malformed compatibility inputs fail
closed for Edit and remain outside the Warranty Item entity.

## State, errors, and races

The form controller owns mode, detail-loading, lookup-loading, saving, draft,
validation errors, service error, and a generation token. It blocks a second
save while saving and invalidates stale detail/save completions after
cancel/mode changes. `try/finally` always clears pending state. A failed save
keeps the draft open; a successful save refreshes the T1 list before reset.

Errors remain separate as validation, backend/domain rejection, authorization,
transport, and malformed-contract categories. A failed mutation keeps its draft;
after a mutation succeeds, a later list-refresh failure is reported as a
post-save refresh error and closes the draft so it cannot be resubmitted.

## Testing strategy

Use existing Node Vitest only. Focused tests cover raw-to-draft mapping,
explicit payloads, endpoints, lookup normalization and current-only Group
preservation, material selection, lifetime UX compatibility, permission
policy, duplicate-save blocking, stale operations, success refresh, and
failure draft preservation. The scoped Vue typecheck includes all new feature
files. No DOM or E2E dependency is added.

## Evidence status retained

- Warranty Code canonical length/characters: requires domain/backend confirmation.
- Duration null/zero/ranges: requires domain confirmation.
- Lifetime persistence invariant: requires domain confirmation; only UX behavior is observed.
- Group/Material optionality: observed optional UI behavior, not canonical policy.
- Inactive/missing Group edit policy: compatibility preservation, requires domain confirmation.
- TRN0001/admin intent: observed compatibility policy, not domain policy.
- Update route casing: verified against the owning .NET 8 conventional route; deployed smoke confirmation remains UAT/release evidence.
