import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WarrantyItemPage from '../../app/pages/master/warranty-item/index.vue'
import {
  DEFAULT_IMPORT_MAPPING,
  coerceImportActive,
  coerceImportDuration,
  mapImportRows,
  parsePastedImportSheet,
} from '../../app/features/warranty-item/warranty-item-import'
import { createWarrantyItemService } from '../../app/features/warranty-item/warranty-item-service'
import type { ApiClient } from '../../app/services/http/api-client'

const apiGet = vi.fn()
const apiPost = vi.fn()
const getContext = vi.fn()
const checkMenuAccess = vi.fn()

function setupGlobals() {
  vi.stubGlobal('useApiClient', () => ({ get: apiGet, post: apiPost }))
  vi.stubGlobal('useLocalizationAdapter', () => ({ language: 'en', t: (key: string) => key }))
  vi.stubGlobal('useSessionAdapter', () => ({ getContext, redirectToLogin: vi.fn() }))
  vi.stubGlobal('useAccessControlService', () => ({ checkMenuAccess }))
  vi.stubGlobal('useHead', vi.fn())
}

beforeEach(() => {
  apiGet.mockReset().mockResolvedValue({ ok: true, status: 200, data: { data_rows: [], total: 0 } })
  apiPost.mockReset().mockResolvedValue({ ok: true, status: 200, data: 12 })
  getContext.mockReset().mockReturnValue({ isAuthenticated: true })
  checkMenuAccess.mockReset().mockResolvedValue({ status: 'editable' })
  setupGlobals()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('warranty-item master import mapper', () => {
  it('uses the verified logical A-L mapping', () => {
    expect(DEFAULT_IMPORT_MAPPING).toEqual({
      war_code: 'A', war_des: 'B', type_code: 'C', tot_date: 'D', tot_month: 'E', tot_year: 'F',
      lifetime: 'G', itemcode: 'H', vendor: 'I', war_date_start: 'J', war_date_end: 'K', active: 'L',
    })
  })

  it('maps all 12 logical columns and normalizes text, durations, lifetime, and active', () => {
    expect(mapImportRows([{ 
      A: ' W001 ', B: ' Roof ', C: ' G01 ', D: '2', E: ' 12 ', F: '', G: 'Y', H: ' MAT01 ',
      I: ' Vendor ', J: '2026-01-01', K: '2026-12-31', L: ' y ',
    }])).toEqual([{
      war_code: 'W001', war_des: 'Roof', type_code: 'G01', tot_date: 0, tot_month: 0, tot_year: 0,
      lifetime: 'Y', itemcode: 'MAT01', vendor: 'Vendor', war_date_start: '2026-01-01',
      war_date_end: '2026-12-31', active: 'Y',
    }])
  })

  it('forces all durations to zero when Lifetime is Y', () => {
    expect(mapImportRows([{ A: 'W001', D: '3', E: '4', F: '5', G: 'Y', L: 'Y' }])[0]).toMatchObject({
      tot_date: 0, tot_month: 0, tot_year: 0, lifetime: 'Y',
    })
  })

  it('skips blank codes without introducing duration rollover', () => {
    expect(mapImportRows([
      { A: ' ', B: 'Ignored', D: '99' },
      { A: 'W002', D: 'bad', E: '1.5', F: '-2', L: 'N' },
    ])).toEqual([{
      war_code: 'W002', war_des: '', type_code: '', tot_date: 0, tot_month: 0, tot_year: 0,
      lifetime: 'N', itemcode: '', vendor: '', war_date_start: '', war_date_end: '', active: 'N',
    }])
  })

  it('normalizes nonblank Active values like the legacy importer and rejects blank Active', () => {
    expect(coerceImportActive(' y ')).toBe('Y')
    expect(coerceImportActive('yes')).toBe('N')
    expect(() => coerceImportActive('')).toThrow(/Active/)
    expect(coerceImportDuration('')).toBe(0)
    expect(coerceImportDuration('3.2')).toBe(0)
  })

  it('rejects mapping columns outside A-L or duplicate source columns', () => {
    expect(() => mapImportRows([{ A: 'W001' }], { active: 'M' })).toThrow(/A-L/)
    expect(() => mapImportRows([{ A: 'W001' }], { active: 'A' })).toThrow(/unique/)
  })

  it('parses pasted tabular rows into A-L keyed rows, including quoted commas', () => {
    expect(parsePastedImportSheet('W001,"Roof, North",G01,1,2,3,N,MAT,V,2026-01-01,2026-12-31,Y')).toEqual([{
      A: 'W001', B: 'Roof, North', C: 'G01', D: '1', E: '2', F: '3', G: 'N', H: 'MAT', I: 'V',
      J: '2026-01-01', K: '2026-12-31', L: 'Y',
    }])
  })
})

describe('warranty-item master import service contract', () => {
  it('posts one mapped batch to the verified master endpoint', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 200, data: 1 })
    const service = createWarrantyItemService({ post } as unknown as ApiClient)
    const rows = [{
      war_code: 'W001', war_des: 'Roof', type_code: 'G01', tot_date: 0, tot_month: 12, tot_year: 0,
      lifetime: 'N', itemcode: '', vendor: '', war_date_start: '', war_date_end: '', active: 'Y' as const,
    }]

    await service.importData(rows)

    expect(post).toHaveBeenCalledOnce()
    expect(post).toHaveBeenCalledWith('CSM/Master/WarrantyItemImportData_Master', { data: rows })
  })
})

describe('warranty-item master import page', () => {
  it('opens the A-L mapping dialog, previews rows, submits one batch, reports count, and reloads', async () => {
    const wrapper = mount(WarrantyItemPage)
    await flushPromises()

    await wrapper.get('[data-testid="warranty-item-import"]').trigger('click')
    expect(wrapper.find('[data-testid="warranty-item-import-dialog"]').exists()).toBe(true)
    expect((wrapper.get('[data-testid="warranty-item-import-map-active"]').element as HTMLInputElement).value).toBe('L')

    await wrapper.get('[data-testid="warranty-item-import-paste"]').setValue('W001,Roof,G01,1,2,3,N,MAT,V,2026-01-01,2026-12-31,Y')
    await flushPromises()
    expect(wrapper.findAll('[data-testid="warranty-item-import-preview-row"]')).toHaveLength(1)

    await wrapper.get('[data-testid="warranty-item-import-submit"]').trigger('click')
    await flushPromises()

    expect(apiPost).toHaveBeenCalledWith('CSM/Master/WarrantyItemImportData_Master', {
      data: [{
        war_code: 'W001', war_des: 'Roof', type_code: 'G01', tot_date: 1, tot_month: 2, tot_year: 3,
        lifetime: 'N', itemcode: 'MAT', vendor: 'V', war_date_start: '2026-01-01',
        war_date_end: '2026-12-31', active: 'Y',
      }],
    })
    expect(wrapper.find('[data-testid="warranty-item-import-dialog"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="warranty-item-save-message"]').text()).toContain('1')
  })

  it('keeps preview context when import is rejected by the server', async () => {
    apiPost.mockResolvedValueOnce({ ok: false, error: { code: 'api', message: 'Active is not null at row 1' } })
    const wrapper = mount(WarrantyItemPage)
    await flushPromises()
    await wrapper.get('[data-testid="warranty-item-import"]').trigger('click')
    await wrapper.get('[data-testid="warranty-item-import-paste"]').setValue('W001,Roof,G01,1,2,3,N,MAT,V,2026-01-01,2026-12-31,Y')
    await flushPromises()
    await wrapper.get('[data-testid="warranty-item-import-submit"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="warranty-item-import-dialog"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="warranty-item-import-error"]').text()).toContain('Active is not null')
  })

  it('does not open or submit import for read-only users', async () => {
    checkMenuAccess.mockResolvedValue({ status: 'readonly' })
    const wrapper = mount(WarrantyItemPage)
    await flushPromises()

    expect(wrapper.get('[data-testid="warranty-item-import"]').attributes('disabled')).toBeDefined()
    const setup = (wrapper.vm as unknown as { $: { setupState: { openImport(): void } } }).$.setupState
    setup.openImport()
    await flushPromises()
    expect(wrapper.find('[data-testid="warranty-item-import-dialog"]').exists()).toBe(false)
    expect(apiPost).not.toHaveBeenCalled()
  })
})
