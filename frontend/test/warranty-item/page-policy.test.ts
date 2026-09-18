import { describe, expect, it } from 'vitest'

import { getWarrantyItemPagePolicy } from '../../app/features/warranty-item/page-policy'
import type { WarrantyItemAccessSnapshot } from '../../app/features/warranty-item/runtime/access-snapshot'

describe('getWarrantyItemPagePolicy', () => {
  it.each<{ access: WarrantyItemAccessSnapshot, canReadList: boolean, canCreate: boolean, label: string }>([
    { access: { status: 'unavailable', reason: 'rights-unavailable' }, canReadList: false, canCreate: false, label: 'Access unavailable' },
    { access: { status: 'unavailable', reason: 'invalid-rights' }, canReadList: false, canCreate: false, label: 'Access unavailable' },
    { access: { status: 'denied' }, canReadList: false, canCreate: false, label: 'Access denied' },
    { access: { status: 'readonly' }, canReadList: true, canCreate: false, label: 'Read-only access' },
    { access: { status: 'editable' }, canReadList: true, canCreate: true, label: 'Editable access' },
  ])('gates Create visibility by editable access: $access', ({ access, canReadList, canCreate, label }) => {
    expect(getWarrantyItemPagePolicy(access)).toEqual({
      status: access.status,
      canReadList,
      canCreate,
      label,
    })
  })
})
