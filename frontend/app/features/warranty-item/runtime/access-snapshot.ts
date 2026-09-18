export const WARRANTY_ITEM_MENU_NAME = 'CSM_WEB'
export const WARRANTY_ITEM_MENU_ID = '20820'

export type WarrantyItemAccessSnapshot =
  | { status: 'unavailable', reason: 'rights-unavailable' | 'invalid-rights' }
  | { status: 'denied' }
  | { status: 'readonly' }
  | { status: 'editable' }

function readGlobalUserRight(): unknown {
  return (globalThis as typeof globalThis & { userRight?: unknown }).userRight
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function unavailable(reason: 'rights-unavailable' | 'invalid-rights'): WarrantyItemAccessSnapshot {
  return { status: 'unavailable', reason }
}

export function readWarrantyItemAccessSnapshot(
  rawRights: unknown = readGlobalUserRight(),
): WarrantyItemAccessSnapshot {
  if (rawRights === undefined || rawRights === null) {
    return unavailable('rights-unavailable')
  }
  if (!Array.isArray(rawRights) || rawRights.some(row => !isRecord(row))) {
    return unavailable('invalid-rights')
  }

  const exactRows = rawRights.filter(row => (
    row.menu_name === WARRANTY_ITEM_MENU_NAME
    && row.menu_id === WARRANTY_ITEM_MENU_ID
  ))

  if (exactRows.length === 0) {
    return { status: 'denied' }
  }
  if (exactRows.length !== 1) {
    return unavailable('invalid-rights')
  }

  const right = exactRows[0]!
  if ((right.isenabled !== 0 && right.isenabled !== 1)
    || (right.isreadonly !== 0 && right.isreadonly !== 1)) {
    return unavailable('invalid-rights')
  }
  if (right.isenabled === 0) {
    return { status: 'denied' }
  }
  return right.isreadonly === 1 ? { status: 'readonly' } : { status: 'editable' }
}
