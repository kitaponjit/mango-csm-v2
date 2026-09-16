import { describe, expect, it } from 'vitest'
import {
  WARRANTY_GROUP_MENU_ID,
  WARRANTY_GROUP_MENU_NAME,
} from '../../app/features/warranty-group/warranty-group-access'

describe('warranty-group access', () => {
  it('gates the slice behind the Warranty Group menu right (CSM_WEB/20810)', () => {
    expect(WARRANTY_GROUP_MENU_NAME).toBe('CSM_WEB')
    expect(WARRANTY_GROUP_MENU_ID).toBe('20810')
  })
})
