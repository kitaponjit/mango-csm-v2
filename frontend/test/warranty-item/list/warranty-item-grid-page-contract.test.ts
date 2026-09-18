import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const pagePath = new URL('../../../app/features/warranty-item/WarrantyItemPage.vue', import.meta.url)
const source = readFileSync(pagePath, 'utf8')

describe('WarrantyItemPage grid contract', () => {
  it('uses ag-table with saved columns, sorting, legacy identity, and action routing', () => {
    expect(source).toContain('<ag-table')
    expect(source).toContain(':sorting="true"')
    expect(source).toContain(':saveColumns="\'Y\'"')
    expect(source).toContain(':doctype="\'MSCSM\'"')
    expect(source).toContain(':page_name="\'v_csm_mas_002\'"')
    expect(source).toContain('@cell-clicked="onWarrantyItemGridCellClicked"')
    expect(source).toContain('@on-sort-changed="onWarrantyItemGridSortChanged"')
  })
})
