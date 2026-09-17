export interface WarrantyItemEditCompatibilityInput {
  configData?: unknown
  auth?: unknown
}

export type WarrantyItemEditCompatibilitySnapshot =
  | { status: 'allowed', trn0001: 'Y' | 'N', isAdmin: boolean }
  | { status: 'denied', trn0001: 'Y', isAdmin: false }
  | { status: 'unavailable', reason: 'compatibility-unavailable' }

export type WarrantyItemEditCompatibilityPolicy =
  | { canEdit: true, status: 'allowed' }
  | { canEdit: false, status: 'denied', reason: 'trn0001-admin-only' }
  | { canEdit: false, status: 'unavailable', reason: 'compatibility-unavailable' }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function unavailable(): WarrantyItemEditCompatibilitySnapshot {
  return { status: 'unavailable', reason: 'compatibility-unavailable' }
}

function isConfigRow(value: unknown): value is Record<string, unknown> {
  return isRecord(value)
    && typeof value.config_id === 'string'
    && typeof value.config_value === 'string'
}

export function readWarrantyItemEditCompatibilitySnapshot(
  input: WarrantyItemEditCompatibilityInput,
): WarrantyItemEditCompatibilitySnapshot {
  if (!isRecord(input)
    || !Array.isArray(input.configData)
    || !isRecord(input.auth)
    || typeof input.auth.is_admin !== 'boolean'
    || input.configData.some(row => !isConfigRow(row))) {
    return unavailable()
  }

  const matches = input.configData.filter(row => (
    isRecord(row) && row.config_id === 'TRN0001'
  ))
  if (matches.length !== 1) {
    return unavailable()
  }

  const value = matches[0]?.config_value
  if (value !== 'Y' && value !== 'N') {
    return unavailable()
  }
  if (value === 'Y' && !input.auth.is_admin) {
    return { status: 'denied', trn0001: 'Y', isAdmin: false }
  }
  return { status: 'allowed', trn0001: value, isAdmin: input.auth.is_admin }
}

export function getWarrantyItemEditCompatibilityPolicy(
  snapshot: WarrantyItemEditCompatibilitySnapshot,
): WarrantyItemEditCompatibilityPolicy {
  if (snapshot.status === 'unavailable') {
    return { canEdit: false, status: 'unavailable', reason: 'compatibility-unavailable' }
  }
  if (snapshot.status === 'denied') {
    return { canEdit: false, status: 'denied', reason: 'trn0001-admin-only' }
  }
  return { canEdit: true, status: 'allowed' }
}

export function canEditWarrantyItem(snapshot: WarrantyItemEditCompatibilitySnapshot): boolean {
  return getWarrantyItemEditCompatibilityPolicy(snapshot).canEdit
}
