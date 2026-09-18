import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const pagePath = new URL('../../../app/features/warranty-item/WarrantyItemPage.vue', import.meta.url)
const source = readFileSync(pagePath, 'utf8')

describe('WarrantyItemPage Import All contract', () => {
  it('keeps Import All distinct from Standard Import', () => {
    expect(source).toContain('WarrantyAutoImportData')
    expect(source).toContain('Template_All_Warranty')
    expect(source).toContain('Import All Warranty')
    expect(source).toContain('accept=".xls,.xlsx"')
    expect(source).toContain('importAll')
  })
})
