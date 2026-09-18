import { describe, expect, it } from 'vitest'

import { getWarrantyItemPageNumbers } from '../../../app/features/warranty-item/list/warranty-item-list-state'

describe('getWarrantyItemPageNumbers', () => {
  it.each([
    { maxPage: 1, expected: [1] },
    { maxPage: 2, expected: [1, 2] },
    { maxPage: 3, expected: [1, 2, 3] },
  ])('returns every page destination through the final page', ({ maxPage, expected }) => {
    expect(getWarrantyItemPageNumbers(maxPage)).toEqual(expected)
  })
})
