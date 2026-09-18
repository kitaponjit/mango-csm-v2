import type { WarrantyItemListItem } from './warranty-item-list-service'

export type WarrantyItemGridField = [string, string, string, Record<string, unknown>, Record<string, unknown>?]

export interface WarrantyItemGridRow {
  item: number
  action_edit?: string
  action_del?: string
  war_code: string
  war_des: string
  type_name: string
  tot_warranty: string
  lifetime: 'Y' | 'N'
  active: 'Y' | 'N'
  add_user: string
  add_dt: string
  edit_user: string
  edit_dt: string
  source: WarrantyItemListItem
}

export const WARRANTY_ITEM_GRID_PROPS = {
  sorting: true,
  saveColumns: 'Y',
  doctype: 'MSCSM',
  page_name: 'v_csm_mas_002',
} as const

export function createWarrantyItemGridFields(canEdit: boolean): WarrantyItemGridField[] {
  const fields: WarrantyItemGridField[] = [
    ['item', 'No.', 'text', { width: 100, align: 'center' }],
  ]
  if (canEdit) {
    fields.push(
      ['action_edit', 'Edit', 'text', { width: 120, align: 'center', cellRenderer: () => '<a class="text-black"><i class="fa fa-edit"></i></a>' }],
      ['action_del', 'Delete', 'text', { width: 120, align: 'center', cellRenderer: () => '<a class="text-danger"><i class="far fa-trash-alt"></i></a>' }],
    )
  }
  fields.push(
    ['war_code', 'Warranty Code', 'text', { width: 180 }],
    ['war_des', 'Warranty Name', 'text', { width: 240 }],
    ['type_name', 'Work Type', 'text', { width: 180 }],
    ['tot_warranty', 'Warranty Duration', 'text', { width: 200, cellRenderer: (params: { data: WarrantyItemGridRow }) => params.data.lifetime === 'Y' ? 'Lifetime' : params.data.tot_warranty || '' }],
    ['lifetime', 'Lifetime', 'text', { width: 120, align: 'center', cellRenderer: (params: { value: 'Y' | 'N' }) => params.value === 'Y' ? '<span style="color:#00c116;font-weight:600">Yes</span>' : '<span style="color:#ff0000;font-weight:600">No</span>' }],
    ['active', 'Active', 'text', { width: 120, align: 'center', cellRenderer: (params: { value: 'Y' | 'N' }) => params.value === 'Y' ? '<span style="color:#00c116;font-weight:600">Yes</span>' : '<span style="color:#ff0000;font-weight:600">No</span>' }],
    ['add_user', 'Add User', 'text', { width: 130 }],
    ['add_dt', 'Add Date', 'datetime', { width: 140, align: 'center' }, { useCellRenderer: true }],
    ['edit_user', 'Edit User', 'text', { width: 130 }],
    ['edit_dt', 'Edit Date', 'datetime', { width: 140, align: 'center' }, { useCellRenderer: true }],
  )
  return fields
}

export function createWarrantyItemGridRows(items: readonly WarrantyItemListItem[], page: number, pageSize: number): WarrantyItemGridRow[] {
  return items.map((item, index) => ({
    item: (page - 1) * pageSize + index + 1,
    action_edit: '',
    action_del: '',
    war_code: item.code,
    war_des: item.name,
    type_name: item.groupName,
    tot_warranty: item.durationLabel,
    lifetime: item.lifetime ? 'Y' : 'N',
    active: item.active ? 'Y' : 'N',
    add_user: item.addedBy ?? '',
    add_dt: item.addedAt ?? '',
    edit_user: item.editedBy ?? '',
    edit_dt: item.editedAt ?? '',
    source: item,
  }))
}
