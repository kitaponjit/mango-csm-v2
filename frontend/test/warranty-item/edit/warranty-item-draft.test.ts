import { describe, expect, it } from 'vitest'

import {
  LEGACY_UI_WARRANTY_CODE_MAX,
  LEGACY_UI_WARRANTY_NAME_MAX,
  createWarrantyItemDraft,
  draftFromWarrantyItemDetail,
  mergeWarrantyItemGroups,
  normalizeWarrantyItemDetail,
  setWarrantyItemLifetime,
  toCreateRequest,
  toUpdateRequest,
  validateWarrantyItemDraft,
  type WarrantyItemDraft,
  type WarrantyItemCreateRequest,
  type WarrantyItemGroup,
  type WarrantyItemUpdateRequest,
} from '../../../app/features/warranty-item/edit/warranty-item-draft'

const rawDetail = {
  war_code: 'WAR-001',
  war_des: 'Premium Warranty',
  type_code: 'G01',
  type_name: 'Electrical',
  itemcode: 'MAT-7',
  itemname: 'Control Board',
  active: 'Y',
  lifetime: 'N',
  tot_year: 2,
  tot_month: 3,
  tot_date: 4,
  tot_warranty: '999 years (display only)',
  add_user: 'maker',
  add_dt: '2026-09-01T00:00:00',
  edit_user: 'editor',
  edit_dt: '2026-09-02T00:00:00',
  acct_no: 'PASSIVE',
  pre_event2: 'DO-NOT-ROUND-TRIP',
}

const draft: WarrantyItemDraft = {
  code: 'WAR-001',
  name: 'Premium Warranty',
  groupCode: 'G01',
  groupName: 'Electrical',
  materialCode: 'MAT-7',
  materialName: 'Control Board',
  duration: { years: 2, months: 3, days: 4 },
  lifetime: false,
  active: true,
}

describe('Warranty Item draft boundary', () => {
  it('normalizes a detail row without using the computed duration label as truth', () => {
    const detail = normalizeWarrantyItemDetail(rawDetail)

    expect(detail).toEqual({
      code: 'WAR-001',
      name: 'Premium Warranty',
      group: { code: 'G01', name: 'Electrical' },
      material: { code: 'MAT-7', name: 'Control Board' },
      duration: { years: 2, months: 3, days: 4 },
      lifetime: false,
      active: true,
      audit: {
        addedBy: 'maker',
        addedAt: '2026-09-01T00:00:00',
        editedBy: 'editor',
        editedAt: '2026-09-02T00:00:00',
      },
    })
    expect(detail.duration).not.toEqual('999 years (display only)')
  })

  it('creates a blank form with observed legacy defaults', () => {
    expect(createWarrantyItemDraft()).toEqual({
      code: '',
      name: '',
      groupCode: '',
      groupName: '',
      materialCode: '',
      materialName: '',
      duration: { years: 0, months: 0, days: 0 },
      lifetime: false,
      active: true,
    })
  })

  it('maps normalized detail to a draft while preserving code and relationship keys', () => {
    expect(draftFromWarrantyItemDetail(normalizeWarrantyItemDetail(rawDetail))).toEqual(draft)
  })

  it('preserves nullable detail durations through Edit drafts and update payloads', () => {
    const nullable = normalizeWarrantyItemDetail({
      ...rawDetail,
      tot_year: null,
      tot_month: null,
      tot_date: null,
    })
    const nullableDraft = draftFromWarrantyItemDetail(nullable)

    expect(nullableDraft.duration).toEqual({ years: null, months: null, days: null })
    expect(toUpdateRequest(nullableDraft).header).toMatchObject({
      tot_year: null,
      tot_month: null,
      tot_date: null,
    })
  })

  it('turns lifetime on by clearing structured duration, and turns it off without inventing values', () => {
    const lifetimeDraft = setWarrantyItemLifetime(draft, true)
    expect(lifetimeDraft).toMatchObject({ lifetime: true, duration: { years: 0, months: 0, days: 0 } })

    expect(setWarrantyItemLifetime(lifetimeDraft, false)).toEqual({ ...lifetimeDraft, lifetime: false })
  })

  it('maps create and update through the exact mutation whitelist', () => {
    const expectedHeader = {
      war_code: 'WAR-001',
      war_des: 'Premium Warranty',
      type_code: 'G01',
      itemcode: 'MAT-7',
      tot_year: 2,
      tot_month: 3,
      tot_date: 4,
      lifetime: 'N',
      active: 'Y',
    }

    const createRequest: WarrantyItemCreateRequest = toCreateRequest(draft)
    const updateRequest: WarrantyItemUpdateRequest = toUpdateRequest(draft)

    expect(createRequest).toEqual({ header: expectedHeader })
    expect(updateRequest).toEqual({ header: expectedHeader })
    expect(Object.keys(createRequest.header)).toEqual([
      'war_code', 'war_des', 'type_code', 'itemcode',
      'tot_year', 'tot_month', 'tot_date', 'lifetime', 'active',
    ])
  })

  it('reports only the observed legacy-compatible length validation', () => {
    const errors = validateWarrantyItemDraft({
      ...draft,
      code: ' '.repeat(LEGACY_UI_WARRANTY_CODE_MAX + 1),
      name: '',
      duration: { years: 1.5, months: Number.NaN, days: -3 },
    })

    expect(errors.map(error => error.field)).toEqual(['code'])
    expect(errors.every(error => error.category === 'validation')).toBe(true)
  })

  it('enforces the isolated legacy-compatible Warranty Name UI maximum', () => {
    const errors = validateWarrantyItemDraft({
      ...draft,
      name: 'N'.repeat(LEGACY_UI_WARRANTY_NAME_MAX + 1),
    })

    expect(errors).toContainEqual(expect.objectContaining({
      field: 'name',
      code: 'legacy-max-length',
    }))
  })

  it('keeps a saved inactive or missing Group as a current-only option', () => {
    const activeGroups: WarrantyItemGroup[] = [
      { code: 'G01', name: 'Electrical', active: true, default: true, currentOnly: false },
      { code: 'G02', name: 'Mechanical', active: true, default: false, currentOnly: false },
    ]

    expect(mergeWarrantyItemGroups(activeGroups, { code: 'G99', name: 'Retired', active: false })).toEqual([
      ...activeGroups,
      { code: 'G99', name: 'Retired', active: false, default: false, currentOnly: true },
    ])
    expect(mergeWarrantyItemGroups(activeGroups, { code: 'G01', name: 'Old label', active: false })).toEqual(activeGroups)
  })
})
