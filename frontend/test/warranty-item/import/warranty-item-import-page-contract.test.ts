import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const pagePath = new URL('../../../app/features/warranty-item/WarrantyItemPage.vue', import.meta.url)
const source = readFileSync(pagePath, 'utf8')

describe('WarrantyItemPage Import source contract', () => {
  it('uses the typed two-step Import controller and does not use the direct multipart persistence endpoint', () => {
    expect(source).toContain('createWarrantyItemImportService')
    expect(source).toContain('createWarrantyItemImportController')
    expect(source).not.toContain('WarrantyItemImport_Master')
  })

  it('advertises legacy .xls/.xlsx files and renders preview before explicit Import', () => {
    expect(source).toContain('accept=".xls,.xlsx"')
    expect(source).not.toContain('accept=".xlsx"')
    expect(source).toContain('Template_List_Warranty')
    expect(source).not.toContain('multiple')
    expect(source).toContain('importState.status === \'ready-to-import\'')
    expect(source).toContain('@click="importRows"')
    expect(source).toContain('Column I is ignored')
  })

  it('keeps upload/import pending and refresh-failure actions separate', () => {
    expect(source).toContain('importState.uploadPending')
    expect(source).toContain('importState.importPending')
    expect(source).toContain('retryImportRefresh')
    expect(source).toContain('refresh-failed-after-import')
    expect(source).not.toContain('TRN0001')
  })
})
