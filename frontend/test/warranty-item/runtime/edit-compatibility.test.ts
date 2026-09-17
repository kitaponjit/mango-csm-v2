import { describe, expect, it } from 'vitest'

import {
  getWarrantyItemEditCompatibilityPolicy,
  readWarrantyItemEditCompatibilitySnapshot,
} from '../../../app/features/warranty-item/runtime/edit-compatibility'

describe('Warranty Item Edit compatibility policy', () => {
  it('allows Edit when TRN0001 is not enabled for a non-admin', () => {
    const snapshot = readWarrantyItemEditCompatibilitySnapshot({
      configData: [{ config_id: 'TRN0001', config_value: 'N' }],
      auth: { is_admin: false },
    })

    expect(getWarrantyItemEditCompatibilityPolicy(snapshot)).toEqual({
      canEdit: true,
      status: 'allowed',
    })
  })

  it('denies Edit for a non-admin when TRN0001 is enabled', () => {
    const snapshot = readWarrantyItemEditCompatibilitySnapshot({
      configData: [{ config_id: 'TRN0001', config_value: 'Y' }],
      auth: { is_admin: false },
    })

    expect(getWarrantyItemEditCompatibilityPolicy(snapshot)).toEqual({
      canEdit: false,
      status: 'denied',
      reason: 'trn0001-admin-only',
    })
  })

  it('allows Edit for an admin when TRN0001 is enabled', () => {
    const snapshot = readWarrantyItemEditCompatibilitySnapshot({
      configData: [{ config_id: 'TRN0001', config_value: 'Y' }],
      auth: { is_admin: true },
    })

    expect(getWarrantyItemEditCompatibilityPolicy(snapshot)).toEqual({
      canEdit: true,
      status: 'allowed',
    })
  })

  it.each([
    ['missing config', { auth: { is_admin: false } }],
    ['missing auth', { configData: [{ config_id: 'TRN0001', config_value: 'N' }] }],
    ['malformed config', { configData: [{ config_id: 'TRN0001', config_value: 'maybe' }], auth: { is_admin: false } }],
    ['malformed admin flag', { configData: [{ config_id: 'TRN0001', config_value: 'N' }], auth: { is_admin: 'false' } }],
    ['a malformed row alongside a valid TRN0001 row', {
      configData: [null, { config_id: 'TRN0001', config_value: 'N' }],
      auth: { is_admin: false },
    }],
  ])('fails closed for %s', (_name, input) => {
    const snapshot = readWarrantyItemEditCompatibilitySnapshot(input)

    expect(snapshot).toMatchObject({ status: 'unavailable' })
    expect(getWarrantyItemEditCompatibilityPolicy(snapshot)).toEqual({
      canEdit: false,
      status: 'unavailable',
      reason: 'compatibility-unavailable',
    })
  })

  it('does not expose or infer Create access from the Edit compatibility snapshot', () => {
    const snapshot = readWarrantyItemEditCompatibilitySnapshot({
      configData: [{ config_id: 'TRN0001', config_value: 'Y' }],
      auth: { is_admin: false },
    })

    expect(snapshot).not.toHaveProperty('canCreate')
    expect(snapshot).not.toHaveProperty('create')
  })
})
