import { describe, expect, it } from 'vitest'
import {
  applyWarrantyItemLifetime,
  createWarrantyItemForm,
  selectDefaultWarrantyGroup,
  toWarrantyItemHeader,
  validateWarrantyItemForm,
  type WarrantyItemForm,
} from '../../app/features/warranty-item/warranty-item-model'

describe('warranty-item create/edit model seam', () => {
  it('creates a blank form with safe mutation defaults', () => {
    expect(createWarrantyItemForm()).toMatchObject({
      war_code: '',
      war_des: '',
      type_code: '',
      tot_date: 0,
      tot_month: 0,
      tot_year: 0,
      lifetime: 'N',
      itemcode: '',
      active: 'Y',
    })
  })

  it('selects only an active Warranty Group explicitly marked default Y', () => {
    const groups = [
      { type_code: 'G01', type_name: 'Inactive default', default_: 'Y', active: 'N' },
      { type_code: 'G02', type_name: 'Active group', default_: 'N', active: 'Y' },
      { type_code: 'G03', type_name: 'Active default', default_: 'Y', active: 'Y' },
    ]

    expect(selectDefaultWarrantyGroup(groups)).toMatchObject({ type_code: 'G03' })
    expect(selectDefaultWarrantyGroup(groups.map(group => ({ ...group, default_: 'N' })))).toBeUndefined()
    expect(selectDefaultWarrantyGroup([])).toBeUndefined()
  })

  it.each([
    { war_code: '', war_des: 'Name', message: 'code is required' },
    { war_code: 'W-01', war_des: 'Name', message: 'code is alphanumeric after trim' },
    { war_code: 'W'.repeat(16), war_des: 'Name', message: 'code is at most 15 characters' },
    { war_code: 'W01', war_des: '   ', message: 'name is required' },
    { war_code: 'W01', war_des: 'N'.repeat(151), message: 'name is at most 150 characters' },
    { war_code: 'W01', war_des: 'Name', tot_date: -1, message: 'days are non-negative' },
    { war_code: 'W01', war_des: 'Name', tot_month: 1.5, message: 'months are discrete' },
    { war_code: 'W01', war_des: 'Name', tot_year: 'not-a-number', message: 'years are numeric' },
  ])('rejects invalid mutation input: $message', input => {
    expect(validateWarrantyItemForm({
      ...createWarrantyItemForm(),
      ...input,
    } as WarrantyItemForm).valid).toBe(false)
  })

  it('trims valid text and emits the exact mutable header shape', () => {
    const form = {
      ...createWarrantyItemForm(),
      war_code: ' W001 ',
      war_des: ' Roof warranty ',
      type_code: ' G01 ',
      tot_date: 1,
      tot_month: 2,
      tot_year: 3,
      lifetime: 'N',
      itemcode: ' MAT-01 ',
      active: 'N',
    }

    expect(validateWarrantyItemForm(form).valid).toBe(true)
    expect(toWarrantyItemHeader(form)).toEqual({
      war_code: 'W001',
      war_des: 'Roof warranty',
      type_code: 'G01',
      tot_date: 1,
      tot_month: 2,
      tot_year: 3,
      lifetime: 'N',
      itemcode: 'MAT-01',
      active: 'N',
    })
  })

  it('turns Lifetime on into zero duration values and disables duration controls', () => {
    const form = {
      ...createWarrantyItemForm(),
      tot_date: 4,
      tot_month: 5,
      tot_year: 6,
    }

    const lifetimeForm = applyWarrantyItemLifetime(form, true)
    expect(lifetimeForm).toMatchObject({ lifetime: 'Y', tot_date: 0, tot_month: 0, tot_year: 0 })
    expect(lifetimeForm.durationDisabled).toBe(true)

    const ordinaryForm = applyWarrantyItemLifetime(lifetimeForm, false)
    expect(ordinaryForm.lifetime).toBe('N')
    expect(ordinaryForm.durationDisabled).toBe(false)
  })
})
