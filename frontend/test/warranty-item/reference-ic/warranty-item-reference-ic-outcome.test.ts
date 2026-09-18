import { describe, expect, it, vi } from 'vitest'

import { notifyWarrantyItemReferenceIcOutcome } from '../../../app/features/warranty-item/reference-ic/warranty-item-reference-ic-outcome'

describe('Reference IC create outcome notification', () => {
  it('emits the Legacy success alert through the existing target notifier', () => {
    const alert = vi.fn()

    notifyWarrantyItemReferenceIcOutcome({ status: 'created' }, { alert })

    expect(alert).toHaveBeenCalledWith('Success', 'Your information has been saved successfully.', 'success')
  })

  it('emits the Legacy error alert through the existing target notifier', () => {
    const alert = vi.fn()

    notifyWarrantyItemReferenceIcOutcome({ status: 'create-failed', error: new Error('create failed') }, { alert })

    expect(alert).toHaveBeenCalledWith('Error', 'Error: create failed', 'danger')
  })
})
