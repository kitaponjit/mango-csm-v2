import { describe, expect, it } from 'vitest'
import {
  MODULE_CODES,
  buildModuleTabs,
  createDefaultDateRange,
  filterManualRows,
  formatDisplayDate,
  formatLegacyApiDate,
  isPreviewableImage,
  nextTabIndex,
} from '../../app/features/manual/manual-model'

describe('manual model', () => {
  it('uses the first local day of the month through today as the default range', () => {
    const range = createDefaultDateRange(new Date(2026, 8, 11, 23, 30))

    expect(range).toEqual({ startDate: '2026-09-01', endDate: '2026-09-11' })
  })

  it('formats date input and server values with legacy DD/MM/YYYY semantics', () => {
    expect(formatLegacyApiDate('2026-09-01')).toBe('01/09/2026')
    expect(formatDisplayDate('2026-09-11T09:30:00')).toBe('11/09/2026')
    expect(formatDisplayDate('/Date(1789059600000)/')).toMatch(/^\d{2}\/\d{2}\/2026$/)
    expect(formatDisplayDate('')).toBe('')
  })

  it('always builds all legacy module tabs and sums API totals for ALL', () => {
    const tabs = buildModuleTabs([
      { module: 'GL', total: 2 },
      { module: 'AP', total: '3' },
    ])

    expect(tabs.map(tab => tab.id)).toEqual(MODULE_CODES)
    expect(tabs[0]).toEqual({ id: 'ALL', text: 'ALL', total: 5 })
    expect(tabs.find(tab => tab.id === 'GL')?.total).toBe(2)
    expect(tabs.find(tab => tab.id === 'AP')?.total).toBe(3)
    expect(tabs.find(tab => tab.id === 'BD')?.total).toBe(0)
  })

  it('filters rows by module while ALL preserves response order', () => {
    const rows = [
      { job_no: '1', module: 'GL', revision: 'R1', subject: 'One', add_dt: '2026-09-01' },
      { job_no: '2', module: 'AP', revision: 'R2', subject: 'Two', add_dt: '2026-09-02' },
    ]

    expect(filterManualRows(rows, 'ALL')).toEqual(rows)
    expect(filterManualRows(rows, 'GL')).toEqual([rows[0]])
  })

  it('moves tab focus cyclically with arrows and directly with Home or End', () => {
    expect(nextTabIndex(0, 'ArrowLeft', 4)).toBe(3)
    expect(nextTabIndex(3, 'ArrowRight', 4)).toBe(0)
    expect(nextTabIndex(2, 'Home', 4)).toBe(0)
    expect(nextTabIndex(1, 'End', 4)).toBe(3)
    expect(nextTabIndex(1, 'Enter', 4)).toBe(1)
  })

  it('detects browser-previewable image paths without treating other files as images', () => {
    expect(isPreviewableImage('manual/preview.JPEG')).toBe(true)
    expect(isPreviewableImage('manual/preview.webp?cache=1')).toBe(true)
    expect(isPreviewableImage('manual/update.pdf')).toBe(false)
  })
})
