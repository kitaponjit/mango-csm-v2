import { describe, expect, it, vi } from 'vitest'

import {
  createWarrantyItemImportController,
  createWarrantyItemImportState,
} from '../../../app/features/warranty-item/import/warranty-item-import-state'
import type {
  WarrantyItemImportPreview,
  WarrantyItemImportService,
} from '../../../app/features/warranty-item/import/warranty-item-import-service'

function createFile(name = 'warranty.xlsx'): File {
  return new File(['fixture'], name)
}

function preview(): WarrantyItemImportPreview {
  return {
    fileName: 'warranty.xlsx',
    filePath: 'temp/warranty.xlsx',
    rows: [{
      rowNumber: 1,
      columns: {
        A: 'WAR-001', B: 'Premium', C: 'WORK', D: 1, E: 2, F: 3, G: 'N', H: 'MAT-001',
        I: 'ignored', J: 'Vendor', K: '01/02/2026', L: '28/02/2026', M: 'Y',
      },
    }],
  }
}

function createService(overrides: Partial<WarrantyItemImportService> = {}): WarrantyItemImportService {
  return {
    upload: vi.fn().mockResolvedValue(preview()),
    importRows: vi.fn().mockResolvedValue({ status: 'imported' }),
    ...overrides,
  }
}

describe('Warranty Item Import controller', () => {
  it('keeps upload and persistence pending states separate and blocks a second upload', async () => {
    let resolveUpload: (value: WarrantyItemImportPreview) => void = () => undefined
    const service = createService({
      upload: vi.fn().mockReturnValue(new Promise(resolve => { resolveUpload = resolve })),
    })
    const controller = createWarrantyItemImportController({
      service,
      refreshList: vi.fn().mockResolvedValue(undefined),
    })

    const first = controller.upload([createFile()])
    expect(controller.state.status).toBe('uploading')
    expect(controller.state.uploadPending).toBe(true)
    expect(controller.state.importPending).toBe(false)
    await expect(controller.upload([createFile()])).resolves.toMatchObject({ status: 'superseded' })
    expect(service.upload).toHaveBeenCalledOnce()

    resolveUpload(preview())
    await expect(first).resolves.toMatchObject({ status: 'ready-to-import' })
    expect(controller.state.status).toBe('ready-to-import')
  })

  it('retains the preview on transactional Import failure and does not report partial success', async () => {
    const service = createService({
      importRows: vi.fn().mockRejectedValue(new Error('Batch rolled back.')),
    })
    const refreshList = vi.fn().mockResolvedValue(undefined)
    const controller = createWarrantyItemImportController({ service, refreshList })
    await controller.upload([createFile()])

    const result = await controller.import()
    expect(result).toMatchObject({ status: 'import-failed' })
    expect(controller.state.status).toBe('import-failed')
    expect(controller.state.rows).toEqual(preview().rows)
    expect(refreshList).not.toHaveBeenCalled()
    expect(controller.state).not.toHaveProperty('insertCount')
    expect(controller.state).not.toHaveProperty('failedCount')
  })

  it('blocks duplicate Import actions while the single batch is pending', async () => {
    let resolveImport: (value: { status: 'imported' }) => void = () => undefined
    const service = createService({
      importRows: vi.fn().mockReturnValue(new Promise(resolve => { resolveImport = resolve })),
    })
    const controller = createWarrantyItemImportController({
      service,
      refreshList: vi.fn().mockResolvedValue(undefined),
    })
    await controller.upload([createFile()])

    const first = controller.import()
    expect(controller.state.status).toBe('importing')
    expect(controller.state.importPending).toBe(true)
    await expect(controller.import()).resolves.toMatchObject({ status: 'superseded' })
    expect(service.importRows).toHaveBeenCalledOnce()

    resolveImport({ status: 'imported' })
    await expect(first).resolves.toMatchObject({ status: 'imported' })
  })

  it('distinguishes successful Import from refresh failure and retries only the refresh', async () => {
    const refreshList = vi.fn()
      .mockRejectedValueOnce(new Error('List refresh failed.'))
      .mockResolvedValueOnce(undefined)
    const service = createService()
    const controller = createWarrantyItemImportController({ service, refreshList })
    await controller.upload([createFile()])

    await expect(controller.import()).resolves.toMatchObject({ status: 'refresh-failed-after-import' })
    expect(controller.state.status).toBe('refresh-failed-after-import')
    expect(service.importRows).toHaveBeenCalledOnce()
    expect(refreshList).toHaveBeenCalledOnce()

    await expect(controller.retryRefresh()).resolves.toMatchObject({ status: 'imported' })
    expect(refreshList).toHaveBeenCalledTimes(2)
    expect(service.importRows).toHaveBeenCalledOnce()
    expect(controller.state.rows).toEqual([])
  })

  it('maps a successful Import and refresh into an imported state', async () => {
    const controller = createWarrantyItemImportController({
      service: createService(),
      refreshList: vi.fn().mockResolvedValue(undefined),
    })
    await controller.upload([createFile()])

    await expect(controller.import()).resolves.toMatchObject({ status: 'imported' })
    expect(controller.state.status).toBe('imported')
    expect(controller.state.rows).toEqual([])
  })
})
