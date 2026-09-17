// The source-contract test runs in Vitest's Node environment; the scoped
// application typecheck intentionally does not include Node ambient types.
// @ts-expect-error Node's fs types are supplied by the Vitest runtime.
import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const pagePath = new URL('../../../app/features/warranty-item/WarrantyItemPage.vue', import.meta.url)
const pageSource = readFileSync(pagePath, 'utf8')

describe('Warranty Item Export page contract', () => {
  it('renders Export only for editable access and delegates to the export controller', () => {
    expect(pageSource).toContain("v-if=\"access.canCreate\"")
    expect(pageSource).toContain('@click="exportWarrantyItems"')
    expect(pageSource).toContain('createWarrantyItemExportController')
    expect(pageSource).toContain('canExport: () => access.canCreate')
  })

  it('reports initiation without claiming completion', () => {
    expect(pageSource).toContain("exportState.status === 'initiated'")
    expect(pageSource).toContain('Warranty Item Export initiated.')
    expect(pageSource).not.toContain('Warranty Item Export completed.')
  })
})
