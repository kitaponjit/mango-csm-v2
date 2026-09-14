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

  it('formats ISO, .NET, empty, and invalid date values', () => {
    expect(formatQCItemDate('2026-09-11T09:30:00')).toBe('11/09/2026')
    expect(formatQCItemDate('/Date(1789059600000)/')).toMatch(/^\d{2}\/\d{2}\/2026$/)
    expect(formatQCItemDate('')).toBe('')
    expect(formatQCItemDate('not-a-date')).toBe('')
  })
})
