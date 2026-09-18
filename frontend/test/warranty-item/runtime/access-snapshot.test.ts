import { describe, expect, it } from 'vitest'

import { readWarrantyItemAccessSnapshot } from '../../../app/features/warranty-item/runtime/access-snapshot'

const editableRight = {
  menu_name: 'CSM_WEB',
  menu_id: '20820',
  isenabled: 1,
  isreadonly: 0,
}

describe('readWarrantyItemAccessSnapshot', () => {
  it('reports unavailable when rights have not been published', () => {
    expect(readWarrantyItemAccessSnapshot(undefined)).toEqual({
      status: 'unavailable',
      reason: 'rights-unavailable',
    })
  })

  it('reports denied when no exact CSM_WEB / 20820 row exists', () => {
    expect(readWarrantyItemAccessSnapshot([
      { ...editableRight, menu_id: '20810' },
      { ...editableRight, menu_name: 'OTHER' },
    ])).toEqual({ status: 'denied' })
  })

  it('reports denied for a disabled exact row', () => {
    expect(readWarrantyItemAccessSnapshot([
      { ...editableRight, isenabled: 0 },
    ])).toEqual({ status: 'denied' })
  })

  it('reports readonly for an enabled readonly exact row', () => {
    expect(readWarrantyItemAccessSnapshot([
      { ...editableRight, isreadonly: 1 },
    ])).toEqual({ status: 'readonly' })
  })

  it('reports editable for an enabled writable exact row', () => {
    expect(readWarrantyItemAccessSnapshot([editableRight])).toEqual({ status: 'editable' })
  })

  it.each([
    ['non-array rights', {}],
    ['non-object row', [null]],
    ['invalid enabled flag', [{ ...editableRight, isenabled: '1' }]],
    ['invalid readonly flag', [{ ...editableRight, isreadonly: 2 }]],
    ['duplicate exact rows', [editableRight, { ...editableRight }]],
  ])('reports unavailable for %s', (_name, rawRights) => {
    expect(readWarrantyItemAccessSnapshot(rawRights)).toEqual({
      status: 'unavailable',
      reason: 'invalid-rights',
    })
  })

  it('does not mutate the raw rights snapshot', () => {
    const rawRights = Object.freeze([Object.freeze({ ...editableRight })])

    expect(readWarrantyItemAccessSnapshot(rawRights)).toEqual({ status: 'editable' })
    expect(rawRights).toEqual([editableRight])
  })
})
