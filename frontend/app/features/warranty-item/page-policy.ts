import type { WarrantyItemAccessSnapshot } from './runtime/access-snapshot'

export interface WarrantyItemPagePolicy {
  status: WarrantyItemAccessSnapshot['status']
  canReadList: boolean
  canCreate: boolean
  label: string
}

export function getWarrantyItemPagePolicy(access: WarrantyItemAccessSnapshot): WarrantyItemPagePolicy {
  switch (access.status) {
    case 'unavailable':
      return { status: access.status, canReadList: false, canCreate: false, label: 'Access unavailable' }
    case 'denied':
      return { status: access.status, canReadList: false, canCreate: false, label: 'Access denied' }
    case 'readonly':
      return { status: access.status, canReadList: true, canCreate: false, label: 'Read-only access' }
    case 'editable':
      return { status: access.status, canReadList: true, canCreate: true, label: 'Editable access' }
  }
}
