import { describe, expect, it } from 'vitest'

import masterRoutes from '../../app/routes/routes.master.js'

describe('Warranty Item route contract', () => {
  it('keeps v_csm_mas_002 owned by the new WarrantyItemPage', () => {
    const route = masterRoutes.find(candidate => candidate.name === 'v_csm_mas_002')

    expect(route).toBeDefined()
    expect(route?.name).toBe('v_csm_mas_002')
    expect(route?.path).toBe('/page/master/v_csm_mas_002/')
    expect(route?.meta?.auth).toBe(true)
    expect(route?.meta?.mangoMenu).toEqual({
      menu_name: 'CSM_WEB',
      menu_id: '20820',
      checkUserRight: true,
    })
    expect(typeof route?.component).toBe('function')
    expect(String(route?.component)).toMatch(/features[\\/]warranty-item[\\/]WarrantyItemPage\.vue/)
  })
})
