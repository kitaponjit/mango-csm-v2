import { describe, expect, it } from 'vitest'

import {
  WARRANTY_ITEM_GRID_PROPS,
  createWarrantyItemGridFields,
  formatWarrantyItemAuditDate,
} from '../../../app/features/warranty-item/list/warranty-item-grid'

describe('Warranty Item grid contract', () => {
  it('preserves the legacy sortable/saved-column identity and audit fields', () => {
    expect(WARRANTY_ITEM_GRID_PROPS).toEqual({
      sorting: true,
      saveColumns: 'Y',
      doctype: 'MSCSM',
      page_name: 'v_csm_mas_002',
    })
    expect(createWarrantyItemGridFields(true).map(field => field[0])).toEqual([
      'item', 'action_edit', 'action_del', 'war_code', 'war_des', 'type_name',
      'tot_warranty', 'lifetime', 'active', 'add_user', 'add_dt', 'edit_user', 'edit_dt',
    ])
    expect(createWarrantyItemGridFields(false).map(field => field[0])).not.toContain('action_edit')
  })

  it('formats audit dates as the legacy DD/MM/YYYY HH:mm:ss display', () => {
    expect(formatWarrantyItemAuditDate('2026-09-01T04:05:06')).toBe('01/09/2026 04:05:06')
    expect(formatWarrantyItemAuditDate(null)).toBe('')
  })
})
