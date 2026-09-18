import { describe, expect, it, vi } from 'vitest'

import { createWarrantyItemImportService } from '../../../app/features/warranty-item/import/warranty-item-import-service'
import type { WarrantyItemTransport } from '../../../app/features/warranty-item/runtime/legacy-xtools-transport'

function createTransport(overrides: Partial<WarrantyItemTransport> = {}): WarrantyItemTransport {
  return {
    get: vi.fn(),
    postJson: vi.fn(),
    postForm: vi.fn(),
    ...overrides,
  }
}

describe('Warranty Item import templates', () => {
  it('requests the Standard Import template through the legacy endpoint', async () => {
    const get = vi.fn().mockResolvedValue({ success: true, path: 'template-token' })
    const service = createWarrantyItemImportService(createTransport({ get })) as typeof createWarrantyItemImportService extends (...args: never[]) => infer T
      ? T & { getTemplateToken(templateName: string): Promise<string> }
      : never

    await expect(service.getTemplateToken('Template_List_Warranty')).resolves.toBe('template-token')
    expect(get).toHaveBeenCalledWith('Anywhere/Import/DownloadTemplateExcel?filename=Template_List_Warranty')
  })
})
