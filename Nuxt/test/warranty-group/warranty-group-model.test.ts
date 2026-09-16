import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SEARCH,
  DEFAULT_TAKE,
  getPageCount,
  getSkip,
  normalizeWarrantyGroupPage,
  rowNumber,
  toActiveParam,
  validateWarrantyGroupRow,
} from '../../app/features/warranty-group/warranty-group-model'

describe('warranty-group model', () => {
  it('pins the legacy page size default of 500 rows per server request', () => {
    expect(DEFAULT_TAKE).toBe(500)
  })

  it('defaults search to Group Code with empty text and the active-only switch on', () => {
    expect(DEFAULT_SEARCH).toEqual({ field: 'type_code', text: '', active: 'Y' })
  })

  it('normalizes a paged envelope into rows plus the filtered total', () => {
    expect(normalizeWarrantyGroupPage({
      data: [
        { type_code: 'G01', type_name: 'Group 1', default_: 'Y', active: 'Y' },
        { type_code: 'G02', type_name: 'Group 2', default_: 'N', active: 'N' },
      ],
      total: 2,
    })).toEqual({
      data: [
        { type_code: 'G01', type_name: 'Group 1', default_: 'Y', active: 'Y', add_user: null, add_dt: null, edit_user: null, edit_dt: null },
        { type_code: 'G02', type_name: 'Group 2', default_: 'N', active: 'N', add_user: null, add_dt: null, edit_user: null, edit_dt: null },
      ],
      total: 2,
    })
  })

  it('coerces blank-prone row fields to text while keeping the envelope total', () => {
    expect(normalizeWarrantyGroupPage({ data: [{ type_code: null, type_name: 7, default_: undefined, active: 'Y' }], total: 99 })).toEqual({
      data: [{ type_code: '', type_name: '7', default_: '', active: 'Y', add_user: null, add_dt: null, edit_user: null, edit_dt: null }],
      total: 99,
    })
  })

  it('drops malformed rows but keeps the server total', () => {
    expect(normalizeWarrantyGroupPage({ data: [null, { type_code: 'G01', type_name: 'Group 1', active: 'Y' }], total: 2 })?.data)
      .toHaveLength(1)
  })

  it.each([
    null,
    [],
    {},
    { data: [], total: 'two' },
    { data: {}, total: 0 },
    { data: [], total: Number.NaN },
  ])('rejects a non-paged payload %s as an invalid server response', (payload) => {
    expect(normalizeWarrantyGroupPage(payload)).toBeNull()
  })

  it('derives server page counts including the last-page partial remainder', () => {
    expect(getPageCount(1200, 500)).toBe(3)
    expect(getPageCount(500, 500)).toBe(1)
    expect(getPageCount(1, 500)).toBe(1)
  })

  it('keeps at least one page so pager bounds stay defined on empty sets', () => {
    expect(getPageCount(0, 500)).toBe(1)
  })

  it('computes the server skip offset with page clamping', () => {
    expect(getSkip(1, 500, 1200)).toBe(0)
    expect(getSkip(2, 500, 1200)).toBe(500)
    expect(getSkip(3, 500, 1200)).toBe(1000)
    expect(getSkip(99, 500, 1200)).toBe(1000)
    expect(getSkip(0, 500, 1200)).toBe(0)
  })

  it('numbers rows legacy-exact: the first visible row is skip + 1', () => {
    expect(rowNumber(0, 0)).toBe(1)
    expect(rowNumber(500, 0)).toBe(501)
    expect(rowNumber(1000, 199)).toBe(1200)
  })

  it("maps the Active switch to Y/N while documenting the server quirk (only Y filters; N returns all, reproduced not fixed)", () => {
    expect(toActiveParam(true)).toBe('Y')
    expect(toActiveParam(false)).toBe('N')
  })

  it('accepts a valid single row', () => {
    expect(validateWarrantyGroupRow({ type_code: 'G01', type_name: 'Pump group', active: 'Y' })).toEqual({ valid: true })
    expect(validateWarrantyGroupRow({ type_code: 'a-b_c9', type_name: 'x', active: 'N' })).toEqual({ valid: true })
  })

  it('accepts surrounding blanks by trimming before validation', () => {
    expect(validateWarrantyGroupRow({ type_code: '  G01  ', type_name: '  Pump group  ', active: 'Y' })).toEqual({ valid: true })
  })

  it.each([[''], ['   ']])('rejects a blank group code %s', (type_code) => {
    expect(validateWarrantyGroupRow({ type_code, type_name: 'Pump group', active: 'Y' }))
      .toEqual({ valid: false, field: 'type_code' })
  })

  it('rejects a group code longer than the verified 20 characters', () => {
    expect(validateWarrantyGroupRow({ type_code: 'G'.repeat(20), type_name: 'Pump group', active: 'Y' })).toEqual({ valid: true })
    expect(validateWarrantyGroupRow({ type_code: 'G'.repeat(21), type_name: 'Pump group', active: 'Y' }))
      .toEqual({ valid: false, field: 'type_code' })
  })

  it.each([['ก01'], ['A B'], ['A/B'], ['A.B'], ['A@B'], ['A\nB']])('rejects a group code outside the verified charset: %s', (type_code) => {
    expect(validateWarrantyGroupRow({ type_code, type_name: 'Pump group', active: 'Y' }))
      .toEqual({ valid: false, field: 'type_code' })
  })

  it.each([[''], ['   ']])('rejects a blank group name %s', (type_name) => {
    expect(validateWarrantyGroupRow({ type_code: 'G01', type_name, active: 'Y' }))
      .toEqual({ valid: false, field: 'type_name' })
  })

  it('rejects a group name longer than the verified 200 characters', () => {
    expect(validateWarrantyGroupRow({ type_code: 'G01', type_name: 'N'.repeat(200), active: 'Y' })).toEqual({ valid: true })
    expect(validateWarrantyGroupRow({ type_code: 'G01', type_name: 'N'.repeat(201), active: 'Y' }))
      .toEqual({ valid: false, field: 'type_name' })
  })

  it.each([[''], ['y'], ['1']])('rejects an Active value outside Y/N: %s', (active) => {
    expect(validateWarrantyGroupRow({ type_code: 'G01', type_name: 'Pump group', active: active as 'Y' }))
      .toEqual({ valid: false, field: 'active' })
  })
})
