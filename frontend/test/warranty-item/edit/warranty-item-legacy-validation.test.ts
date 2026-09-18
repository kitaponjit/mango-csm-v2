import { describe, expect, it } from 'vitest'

import { createWarrantyItemDraft, validateWarrantyItemDraft } from '../../../app/features/warranty-item/edit/warranty-item-draft'

describe('Warranty Item legacy-compatible validation', () => {
  it('does not add client-side required or integer rejection absent from the legacy save path', () => {
    const errors = validateWarrantyItemDraft({
      ...createWarrantyItemDraft(),
      code: '',
      name: '',
      duration: { years: 1.5, months: Number.NaN, days: -3 },
    })

    expect(errors).toEqual([])
  })
})
