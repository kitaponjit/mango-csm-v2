import moment from 'moment'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { formatWarrantyItemReferenceDate } from '../../../app/features/warranty-item/reference-ic/warranty-item-reference-ic-display'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Reference IC date display', () => {
  it('formats a raw backend date through the shared target date formatter', () => {
    vi.stubGlobal('$xt', {
      formatDate(value: string, format: string) {
        const parsed = moment(value)
        return parsed.isValid() ? parsed.format(format) : ''
      },
    })

    expect(formatWarrantyItemReferenceDate('2026-09-01T04:05:06')).toBe('01/09/2026')
  })
})
