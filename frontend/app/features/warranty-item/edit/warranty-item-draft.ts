export const LEGACY_UI_WARRANTY_CODE_MAX = 15
// Compatibility-only UI guard; canonical Warranty Name limits remain unresolved.
export const LEGACY_UI_WARRANTY_NAME_MAX = 150

export interface WarrantyItemDuration {
  years: number | null
  months: number | null
  days: number | null
}

export interface WarrantyItemGroup {
  code: string
  name: string
  active: boolean
  default: boolean
  currentOnly: boolean
}

export interface WarrantyItemMaterial {
  code: string
  name: string
}

export interface WarrantyItemAudit {
  addedBy: string | null
  addedAt: string | null
  editedBy: string | null
  editedAt: string | null
}

export interface WarrantyItemDetail {
  code: string
  name: string
  group: { code: string, name: string } | null
  material: WarrantyItemMaterial | null
  duration: WarrantyItemDuration
  lifetime: boolean
  active: boolean
  audit: WarrantyItemAudit
}

export interface WarrantyItemDraft {
  code: string
  name: string
  groupCode: string
  groupName: string
  materialCode: string
  materialName: string
  duration: {
    years: number | null
    months: number | null
    days: number | null
  }
  lifetime: boolean
  active: boolean
}

export interface WarrantyItemCreateRequestDto {
  war_code: string
  war_des: string
  type_code: string
  itemcode: string
  tot_year: number | null
  tot_month: number | null
  tot_date: number | null
  lifetime: 'Y' | 'N'
  active: 'Y' | 'N'
}

export interface WarrantyItemUpdateRequestDto {
  war_code: string
  war_des: string
  type_code: string
  itemcode: string
  tot_year: number | null
  tot_month: number | null
  tot_date: number | null
  lifetime: 'Y' | 'N'
  active: 'Y' | 'N'
}

export interface WarrantyItemCreateRequest {
  header: WarrantyItemCreateRequestDto
}

export interface WarrantyItemUpdateRequest {
  header: WarrantyItemUpdateRequestDto
}

export interface WarrantyItemValidationError {
  category: 'validation'
  field: 'code' | 'name' | 'duration.years' | 'duration.months' | 'duration.days'
  code: 'legacy-max-length'
  message: string
}

const MALFORMED_DETAIL_MESSAGE = 'Warranty Item detail response contains a malformed row.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null
}

function isFlag(value: unknown): value is 'Y' | 'N' {
  return value === 'Y' || value === 'N'
}

function isNullableInteger(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value))
}

function malformedDetail(): TypeError {
  return new TypeError(MALFORMED_DETAIL_MESSAGE)
}

export function normalizeWarrantyItemDetail(raw: unknown): WarrantyItemDetail {
  if (!isRecord(raw)
    || typeof raw.war_code !== 'string'
    || typeof raw.war_des !== 'string'
    || !isNullableString(raw.type_code)
    || !isNullableString(raw.type_name)
    || !isNullableString(raw.itemcode)
    || !isNullableString(raw.itemname)
    || !isFlag(raw.active)
    || !isFlag(raw.lifetime)
    || !isNullableInteger(raw.tot_year)
    || !isNullableInteger(raw.tot_month)
    || !isNullableInteger(raw.tot_date)
    || !isNullableString(raw.add_user)
    || !isNullableString(raw.add_dt)
    || !isNullableString(raw.edit_user)
    || !isNullableString(raw.edit_dt)) {
    throw malformedDetail()
  }

  const group = raw.type_code
    ? { code: raw.type_code, name: raw.type_name ?? '' }
    : null
  const material = raw.itemcode
    ? { code: raw.itemcode, name: raw.itemname ?? '' }
    : null

  return {
    code: raw.war_code,
    name: raw.war_des,
    group,
    material,
    duration: {
      years: raw.tot_year,
      months: raw.tot_month,
      days: raw.tot_date,
    },
    lifetime: raw.lifetime === 'Y',
    active: raw.active === 'Y',
    audit: {
      addedBy: raw.add_user,
      addedAt: raw.add_dt,
      editedBy: raw.edit_user,
      editedAt: raw.edit_dt,
    },
  }
}

export function createWarrantyItemDraft(): WarrantyItemDraft {
  return {
    code: '',
    name: '',
    groupCode: '',
    groupName: '',
    materialCode: '',
    materialName: '',
    duration: { years: 0, months: 0, days: 0 },
    lifetime: false,
    active: true,
  }
}

export function draftFromWarrantyItemDetail(detail: WarrantyItemDetail): WarrantyItemDraft {
  return {
    code: detail.code,
    name: detail.name,
    groupCode: detail.group?.code ?? '',
    groupName: detail.group?.name ?? '',
    materialCode: detail.material?.code ?? '',
    materialName: detail.material?.name ?? '',
    duration: {
      years: detail.duration.years,
      months: detail.duration.months,
      days: detail.duration.days,
    },
    lifetime: detail.lifetime,
    active: detail.active,
  }
}

export function setWarrantyItemLifetime(draft: WarrantyItemDraft, lifetime: boolean): WarrantyItemDraft {
  return {
    ...draft,
    duration: lifetime
      ? { years: 0, months: 0, days: 0 }
      : { ...draft.duration },
    lifetime,
  }
}

export function validateWarrantyItemDraft(draft: WarrantyItemDraft): WarrantyItemValidationError[] {
  const errors: WarrantyItemValidationError[] = []
  if (typeof draft.code === 'string' && draft.code.length > LEGACY_UI_WARRANTY_CODE_MAX) {
    errors.push({
      category: 'validation',
      field: 'code',
      code: 'legacy-max-length',
      message: `Warranty Code cannot exceed ${LEGACY_UI_WARRANTY_CODE_MAX} characters in the legacy-compatible UI.`,
    })
  }

  if (typeof draft.name === 'string' && draft.name.length > LEGACY_UI_WARRANTY_NAME_MAX) {
    errors.push({
      category: 'validation',
      field: 'name',
      code: 'legacy-max-length',
      message: `Warranty Name cannot exceed ${LEGACY_UI_WARRANTY_NAME_MAX} characters in the legacy-compatible UI.`,
    })
  }

  return errors
}

function toCreateHeader(draft: WarrantyItemDraft): WarrantyItemCreateRequestDto {
  return {
    war_code: draft.code,
    war_des: draft.name,
    type_code: draft.groupCode,
    itemcode: draft.materialCode,
    tot_year: draft.duration.years,
    tot_month: draft.duration.months,
    tot_date: draft.duration.days,
    lifetime: draft.lifetime ? 'Y' : 'N',
    active: draft.active ? 'Y' : 'N',
  }
}

function toUpdateHeader(draft: WarrantyItemDraft): WarrantyItemUpdateRequestDto {
  return {
    war_code: draft.code,
    war_des: draft.name,
    type_code: draft.groupCode,
    itemcode: draft.materialCode,
    tot_year: draft.duration.years,
    tot_month: draft.duration.months,
    tot_date: draft.duration.days,
    lifetime: draft.lifetime ? 'Y' : 'N',
    active: draft.active ? 'Y' : 'N',
  }
}

export function toCreateRequest(draft: WarrantyItemDraft): WarrantyItemCreateRequest {
  return { header: toCreateHeader(draft) }
}

export function toUpdateRequest(draft: WarrantyItemDraft): WarrantyItemUpdateRequest {
  return { header: toUpdateHeader(draft) }
}

export function mergeWarrantyItemGroups(
  activeGroups: WarrantyItemGroup[],
  currentGroup: { code: string, name: string, active?: boolean } | null,
): WarrantyItemGroup[] {
  const groups = activeGroups.map(group => ({ ...group, currentOnly: false }))
  if (!currentGroup?.code || groups.some(group => group.code === currentGroup.code)) {
    return groups
  }

  return [
    ...groups,
    {
      code: currentGroup.code,
      name: currentGroup.name,
      active: currentGroup.active ?? false,
      default: false,
      currentOnly: true,
    },
  ]
}
