import { describe, expect, it } from 'vitest'
import {
  PAGE_SIZE,
  createNewQCItem,
  formatQCItemDate,
  getPageCount,
  getPageItems,
  normalizeQCItems,
  validateQCItems,
} from '../../app/features/qc-item/qc-item-model'

describe('QCItem model', () => {
  it('normalizes a raw list into editable QCItem values', () => {
    expect(normalizeQCItems([{ itemno: '2', itemname: null, remark: ' OK ' }])).toEqual([
      { itemno: 2, itemname: '', remark: ' OK ' },
    ])
  })

  it('uses one-based fallback item numbers for invalid raw values', () => {
    expect(normalizeQCItems([{ itemno: 'invalid' }, { itemno: 0 }])).toEqual([
      { itemno: 1, itemname: '', remark: '' },
      { itemno: 2, itemname: '', remark: '' },
    ])
  })

  it('paginates ten rows and preserves the global one-based row offset', () => {
    const rows = Array.from({ length: 11 }, (_, index) => ({
      itemno: index + 1,
      itemname: `Description ${index + 1}`,
      remark: 'Remark',
    }))

    expect(getPageCount(rows, PAGE_SIZE)).toBe(2)
    expect(getPageItems(rows, 2, PAGE_SIZE).map(row => row.itemno)).toEqual([11])
    expect(getPageItems([], 2, PAGE_SIZE)).toEqual([])
    expect(getPageCount([], PAGE_SIZE)).toBe(1)
  })

  it('clamps an out-of-range page to the final page', () => {
    const rows = Array.from({ length: 11 }, (_, index) => ({
      itemno: index + 1,
      itemname: 'Description',
      remark: 'Remark',
    }))

    expect(getPageItems(rows, 99, PAGE_SIZE).map(row => row.itemno)).toEqual([11])
  })

  it('creates the next item number and starts blank editable fields', () => {
    expect(createNewQCItem([{ itemno: 4, itemname: 'A', remark: 'B' }], new Date('2026-09-14T10:00:00Z')))
      .toMatchObject({ itemno: 5, itemname: '', remark: '', line_number: 5 })
  })

  it('starts at item number one when creating a row for an empty list', () => {
    expect(createNewQCItem([], new Date('2026-09-14T10:00:00Z')))
      .toMatchObject({ itemno: 1, itemname: '', remark: '', line_number: 1 })
  })

  it('rejects the first row with a blank description or remark', () => {
    expect(validateQCItems([{ itemno: 7, itemname: '  ', remark: 'Remark' }])).toEqual({
      valid: false,
      itemno: 7,
      field: 'description',
    })
    expect(validateQCItems([{ itemno: 7, itemname: 'Description', remark: '  ' }])).toEqual({
      valid: false,
      itemno: 7,
      field: 'remark',
    })
    expect(validateQCItems([])).toEqual({ valid: true })
  })

  it('renders ISO-like timestamps with seconds without shifting wall-clock fields', () => {
    expect(formatQCItemDate('2026-09-14T10:05:06Z')).toBe('14/09/2026 10:05:06')
    expect(formatQCItemDate('2026-09-14 23:59:58')).toBe('14/09/2026 23:59:58')
    expect(formatQCItemDate('2026-09-14')).toBe('14/09/2026 00:00:00')
    expect(formatQCItemDate('2026-09-14T10:05:06.123+07:00')).toBe('14/09/2026 10:05:06')
    expect(formatQCItemDate('2024-02-29T00:00:00-05:00')).toBe('29/02/2024 00:00:00')
    expect(formatQCItemDate('2000-02-29')).toBe('29/02/2000 00:00:00')
  })

  it('renders Date and .NET date values in local time with seconds', () => {
    const local = new Date(2026, 8, 14, 10, 5, 6)
    expect(formatQCItemDate(local)).toBe('14/09/2026 10:05:06')
    expect(formatQCItemDate(`/Date(${local.getTime()})/`)).toBe('14/09/2026 10:05:06')
    expect(formatQCItemDate(`/Date(${local.getTime()}+0700)/`)).toBe('14/09/2026 10:05:06')
    expect(formatQCItemDate(`/Date(${local.getTime()}-0500)/`)).toBe('14/09/2026 10:05:06')
    expect(formatQCItemDate('/Date(-1000)/')).toBe(formatQCItemDate(new Date(-1000)))
  })

  it.each([
    '/Date(0garbage',
    '/Date(0)/junk',
    '/Date(0)',
    '/Date(0+070)/',
    '/Date(0+2400)/',
    '/Date(0+0760)/',
  ])('renders malformed .NET date %s as empty text', (value) => {
    expect(formatQCItemDate(value)).toBe('')
  })

  it.each([
    '2026/02/29',
    '2026/04/31 10:05:06',
    '02/29/2026',
    '04/31/2026 10:05:06',
  ])('renders invalid slash calendar date %s as empty text', (value) => {
    expect(formatQCItemDate(value)).toBe('')
  })

  it('preserves valid generic Date inputs and local slash dates', () => {
    expect(formatQCItemDate('2026/02/28 10:05:06')).toBe('28/02/2026 10:05:06')
    expect(formatQCItemDate('02/28/2026 10:05:06')).toBe('28/02/2026 10:05:06')
    expect(formatQCItemDate('2024/02/29 10:05:06')).toBe('29/02/2024 10:05:06')
    expect(formatQCItemDate('September 14, 2026 10:05:06')).toBe('14/09/2026 10:05:06')
  })

  it.each([
    '2026-00-14',
    '2026-13-14',
    '2026-09-00',
    '2026-09-31',
    '2026-02-29',
    '1900-02-29',
    '2026-09-14T24:00:00Z',
    '2026-09-14T10:60:00Z',
    '2026-09-14T10:05:60Z',
    '2026-09-14T10:05:06+24:00',
    '2026-09-14T10:05:06+07:60',
    '2026-09-14T10:05',
    '2026-09-14invalid',
  ])('renders invalid ISO-like date %s as empty text', (value) => {
    expect(formatQCItemDate(value)).toBe('')
  })

  it('renders missing and invalid dates as empty text', () => {
    expect(formatQCItemDate('')).toBe('')
    expect(formatQCItemDate(null)).toBe('')
    expect(formatQCItemDate('not-a-date')).toBe('')
    expect(formatQCItemDate(new Date(Number.NaN))).toBe('')
  })
})
