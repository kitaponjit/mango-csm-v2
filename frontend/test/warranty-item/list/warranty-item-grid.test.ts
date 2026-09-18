import moment from 'moment'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  WARRANTY_ITEM_GRID_PROPS,
  createWarrantyItemGridFields,
  createWarrantyItemGridRows,
} from '../../../app/features/warranty-item/list/warranty-item-grid'
import { formatDateFilter } from '../../../app/vue-filters'

afterEach(() => {
  vi.unstubAllGlobals()
})

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

  it('passes raw audit timestamps to the shared datetime renderer', () => {
    const rawTimestamp = '2026-09-01T04:05:06'
    const rows = createWarrantyItemGridRows([{
      code: 'W1',
      name: 'One',
      groupName: 'Default',
      durationLabel: '1 year',
      lifetime: false,
      active: true,
      addedBy: 'user-1',
      addedAt: rawTimestamp,
      editedBy: 'user-2',
      editedAt: rawTimestamp,
      deleteContext: null,
    }], 1, 500)
    const firstRow = rows[0]!

    vi.stubGlobal('$xt', {
      formatDate(value: string, format: string) {
        const parsed = new Date(value)
        return Number.isNaN(parsed.getTime()) ? '' : moment(parsed).format(format)
      },
    })

    expect(firstRow.add_dt).toBe(rawTimestamp)
    expect(formatDateFilter(firstRow.add_dt, 'DD/MM/YYYY HH:mm:ss')).toBe('01/09/2026 04:05:06')
    expect(formatDateFilter('01/09/2026 04:05:06', 'DD/MM/YYYY HH:mm:ss')).not.toBe('01/09/2026 04:05:06')
  })
})
