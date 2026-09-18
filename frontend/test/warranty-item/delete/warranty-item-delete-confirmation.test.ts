import { describe, expect, it } from 'vitest'

import { formatWarrantyItemDeleteConfirmation } from '../../../app/features/warranty-item/delete/warranty-item-delete-confirmation'

describe('Warranty Item Delete confirmation text', () => {
  it('escapes API-provided code and name before passing them to the HTML-rendering legacy helper', () => {
    expect(formatWarrantyItemDeleteConfirmation({
      code: '<WAR&001>',
      name: 'Premium "Warranty" <script>alert(1)</script>',
    })).toBe('Delete Warranty Item &lt;WAR&amp;001&gt; — Premium &quot;Warranty&quot; &lt;script&gt;alert(1)&lt;/script&gt;?')
  })
})
