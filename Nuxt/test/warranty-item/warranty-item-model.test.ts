import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SEARCH,
  DEFAULT_TAKE,
  normalizeWarrantyItemRow,
  getPageCount,
  getSkip,
  normalizeWarrantyItemPage,
  rowNumber,
  toActiveParam,
} from '../../app/features/warranty-item/warranty-item-model'

describe('warranty-item catalog model', () => {
  it('defaults to the first 500-row page, Warranty Code search, and active-only results', () => {
    expect(DEFAULT_TAKE).toBe(500)
    expect(DEFAULT_SEARCH).toEqual({ field: 'war_code', text: '', active: 'Y' })
    expect(getSkip(1, DEFAULT_TAKE, 1_200)).toBe(0)
  })

  it('normalizes the Warranty Item-specific data_rows envelope and preserves the filtered total', () => {
    expect(normalizeWarrantyItemPage({
      data_rows: [
        { war_code: 'W001', war_des: 'Roof', type_code: 'G01', tot_date: 0, tot_month: 12, tot_year: 0, active: 'Y' },
        { war_code: 'W002', war_des: 'Paint', type_code: 'G02', tot_date: '1', tot_month: '0', tot_year: 2, active: 'N' },
      ],
      total: 1_200,
    })).toMatchObject({
      data: [
        { war_code: 'W001', war_des: 'Roof', type_code: 'G01', active: 'Y' },
        { war_code: 'W002', war_des: 'Paint', type_code: 'G02', active: 'N' },
      ],
      total: 1_200,
    })
  })

  it.each([
    null,
    [],
    {},
    { data_rows: [{}], total: 1 },
    { data_rows: [{ war_des: 'Roof', type_code: 'G01', tot_date: 0, tot_month: 12, tot_year: 0, active: 'Y' }], total: 1 },
    { data_rows: [{ war_code: 'W001', war_des: 'Roof', type_code: 'G01', tot_date: -1, tot_month: 12, tot_year: 0, active: 'Y' }], total: 1 },
    { data_rows: [{ war_code: 'W001', war_des: 'Roof', type_code: 'G01', tot_date: 0, tot_month: 12, tot_year: 0, active: 'X' }], total: 1 },
    { data: [], total: 0 },
    { data_rows: {}, total: 0 },
    { data_rows: [null], total: 0 },
    { data_rows: [], total: '0' },
    { data_rows: [], total: Number.NaN },
    { data_rows: [], total: -1 },
    { data_rows: [], total: 1.5 },
  ])('rejects malformed list response %j instead of treating it as an empty catalog', (payload) => {
    expect(normalizeWarrantyItemPage(payload)).toBeNull()
  })

  it.each([
    {},
    { war_des: 'Roof', type_code: 'G01', tot_date: 0, tot_month: 12, tot_year: 0, active: 'Y' },
    { war_code: 'W001', war_des: 'Roof', type_code: 'G01', tot_date: 'bad', tot_month: 12, tot_year: 0, active: 'Y' },
    { war_code: 'W001', war_des: 'Roof', type_code: 'G01', tot_date: 0, tot_month: 12, tot_year: 0, active: 'X' },
  ])('rejects malformed catalog row %j instead of coercing it to a usable row', (row) => {
    expect(normalizeWarrantyItemRow(row)).toBeNull()
  })

  it('derives server-page bounds for zero, full, and partial final pages', () => {
    expect(getPageCount(0, DEFAULT_TAKE)).toBe(1)
    expect(getPageCount(500, DEFAULT_TAKE)).toBe(1)
    expect(getPageCount(1_200, DEFAULT_TAKE)).toBe(3)
    expect(getSkip(2, DEFAULT_TAKE, 1_200)).toBe(500)
    expect(getSkip(99, DEFAULT_TAKE, 1_200)).toBe(1_000)
  })

  it('numbers visible rows from the server skip without client-side reordering', () => {
    expect(rowNumber(0, 0)).toBe(1)
    expect(rowNumber(500, 0)).toBe(501)
    expect(rowNumber(1_000, 199)).toBe(1_200)
  })

  it('preserves the legacy unchecked-active quirk by sending N for all records', () => {
    expect(toActiveParam(true)).toBe('Y')
    expect(toActiveParam(false)).toBe('N')
  })
})
