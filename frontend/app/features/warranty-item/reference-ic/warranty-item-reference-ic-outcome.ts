import type { WarrantyItemReferenceIcCreateResult } from './warranty-item-reference-ic-state'

export interface WarrantyItemReferenceIcNotifier {
  alert?: (title: string, message: string, type: string) => unknown
}

export function notifyWarrantyItemReferenceIcOutcome(
  result: WarrantyItemReferenceIcCreateResult,
  notifier?: WarrantyItemReferenceIcNotifier,
): void {
  if (result.status === 'created') {
    notifier?.alert?.('Success', 'Your information has been saved successfully.', 'success')
    return
  }

  notifier?.alert?.('Error', result.error.toString(), 'danger')
}
