import { describe, expect, it } from 'vitest'

import { getWarrantyItemPagePolicy } from '../../app/features/warranty-item/page-policy'
import type { WarrantyItemAccessSnapshot } from '../../app/features/warranty-item/runtime/access-snapshot'

describe('getWarrantyItemPagePolicy', () => {
  it.each<{ access: WarrantyItemAccessSnapshot, canReadList: boolean, label: string }>([
    { access: { status: 'unavailable', reason: 'rights-unavailable' }, canReadList: false, label: 'Access unavailable' },
    { access: { status: 'unavailable', reason: 'invalid-rights' }, canReadList: false, label: 'Access unavailable' },
    { access: { status: 'denied' }, canReadList: false, label: 'Access denied' },
    { access: { status: 'readonly' }, canReadList: true, label: 'Read-only access' },
    { access: { status: 'editable' }, canReadList: true, label: 'Editable access (list view only)' },
  ])('allows list reads only for an enabled access snapshot: $access', ({ access, canReadList, label }) => {
    expect(getWarrantyItemPagePolicy(access)).toEqual({
      status: access.status,
      canReadList,
      label,
    })
  })
})
