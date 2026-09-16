import { describe, expect, it } from 'vitest'
import {
  WARRANTY_ITEM_MENU_ID,
  WARRANTY_ITEM_MENU_NAME,
} from '../../app/features/warranty-item/warranty-item-access'

describe('warranty-item access', () => {
  it('gates the slice behind the Warranty Item menu right (CSM_WEB/20820)', () => {
    expect(WARRANTY_ITEM_MENU_NAME).toBe('CSM_WEB')
    expect(WARRANTY_ITEM_MENU_ID).toBe('20820')
  })
})
