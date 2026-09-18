import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const pagePath = new URL('../../../app/features/warranty-item/WarrantyItemPage.vue', import.meta.url)
const source = readFileSync(pagePath, 'utf8')

describe('WarrantyItemPage Reference IC contract', () => {
  it('keeps Reference IC gated and wired to the legacy create workflow', () => {
    expect(source).toContain('Reference IC')
    expect(source).toContain("iccost === '3'")
    expect(source).toContain('WarrantyRefIC')
    expect(source).toContain('WarrantyItem_Create')
    expect(source).toContain('referenceIc')
  })
})
