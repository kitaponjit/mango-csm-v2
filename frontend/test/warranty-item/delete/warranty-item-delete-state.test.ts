import { describe, expect, it, vi } from 'vitest'

import {
  createWarrantyItemDeleteController,
  createWarrantyItemDeleteState,
  type WarrantyItemDeleteControllerOptions,
  type WarrantyItemDeleteResult,
} from '../../../app/features/warranty-item/delete/warranty-item-delete-state'
import {
  WarrantyItemDeleteServiceError,
  type WarrantyItemDeleteService,
} from '../../../app/features/warranty-item/delete/warranty-item-delete-service'
import type {
  WarrantyItemListItem,
  WarrantyItemListResult,
  WarrantyItemListService,
} from '../../../app/features/warranty-item/list/warranty-item-list-service'
import type { WarrantyItemDeleteTarget } from '../../../app/features/warranty-item/delete/warranty-item-delete-service'
import {
  createWarrantyItemListController,
  createWarrantyItemListState,
  refreshWarrantyItemList,
} from '../../../app/features/warranty-item/list/warranty-item-list-state'
import type { WarrantyItemAccessSnapshot } from '../../../app/features/warranty-item/runtime/access-snapshot'
import type { WarrantyItemEditCompatibilitySnapshot } from '../../../app/features/warranty-item/runtime/edit-compatibility'

const item: WarrantyItemListItem = {
  code: 'WAR-001',
  name: 'Premium Warranty',
  groupName: 'Electrical',
  durationLabel: '24 months',
  lifetime: false,
  active: true,
  addedBy: null,
  addedAt: null,
  editedBy: null,
  editedAt: null,
  deleteContext: {
    accountNumber: 'ACCT-001',
    preEvent: 'PRE-001',
    preEvent2: null,
    locationCode: 'LOC-001',
  },
}

const editableAccess: WarrantyItemAccessSnapshot = { status: 'editable' }
const allowedCompatibility: WarrantyItemEditCompatibilitySnapshot = {
  status: 'allowed',
  trn0001: 'N',
  isAdmin: false,
}

const target: WarrantyItemDeleteTarget = {
  code: item.code,
  name: item.name,
  deleteContext: item.deleteContext,
}

function createService(): WarrantyItemDeleteService {
  return { delete: vi.fn().mockResolvedValue(undefined) }
}

function createOptions(overrides: Partial<WarrantyItemDeleteControllerOptions> = {}): WarrantyItemDeleteControllerOptions {
  return {
    service: createService(),
    access: editableAccess,
    editCompatibility: allowedCompatibility,
    confirm: vi.fn().mockResolvedValue(true),
    refreshList: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('Warranty Item Delete controller', () => {
  it.each([
    { status: 'denied' as const },
    { status: 'readonly' as const },
    { status: 'unavailable' as const, reason: 'rights-unavailable' as const },
  ])('fails closed for %s access', async access => {
    const options = createOptions({ access })
    const controller = createWarrantyItemDeleteController(options)

    const result = await controller.delete(target)

    expect(result).toMatchObject({ status: 'delete-failed', error: { category: 'permission' } })
    expect(options.confirm).not.toHaveBeenCalled()
    expect(options.service.delete).not.toHaveBeenCalled()
  })

  it.each([
    { status: 'denied', trn0001: 'Y', isAdmin: false } as const,
    { status: 'unavailable', reason: 'compatibility-unavailable' } as const,
    { status: 'unexpected' } as unknown as WarrantyItemEditCompatibilitySnapshot,
    { status: 'allowed' } as unknown as WarrantyItemEditCompatibilitySnapshot,
  ])('fails closed for %s compatibility state', async editCompatibility => {
    const options = createOptions({ editCompatibility })
    const controller = createWarrantyItemDeleteController(options)

    const result = await controller.delete(target)

    expect(result).toMatchObject({ status: 'delete-failed', error: { category: 'permission' } })
    expect(options.confirm).not.toHaveBeenCalled()
    expect(options.service.delete).not.toHaveBeenCalled()
  })

  it('cancels without issuing a Delete request', async () => {
    const options = createOptions({ confirm: vi.fn().mockResolvedValue(false) })
    const controller = createWarrantyItemDeleteController(options)

    await expect(controller.delete(target)).resolves.toEqual({ status: 'cancelled' })
    expect(options.service.delete).not.toHaveBeenCalled()
    expect(options.refreshList).not.toHaveBeenCalled()
  })

  it('confirms once, deletes once, and refreshes the authoritative list', async () => {
    const options = createOptions()
    const controller = createWarrantyItemDeleteController(options)

    await expect(controller.delete(target)).resolves.toEqual({ status: 'deleted' })
    expect(options.confirm).toHaveBeenCalledOnce()
    expect(options.confirm).toHaveBeenCalledWith(target)
    expect(options.service.delete).toHaveBeenCalledOnce()
    expect(options.service.delete).toHaveBeenCalledWith(target)
    expect(options.refreshList).toHaveBeenCalledOnce()
  })

  it('keeps the current page valid after a normal deletion refresh', async () => {
    const queued = queuedListService()
    const listController = createWarrantyItemListController(queued.service)
    const initial = listController.loadInitial()
    queued.pending[0]!.resolve(listResult(2, [item, { ...item, code: 'WAR-002' }]))
    await initial

    const options = createOptions({ refreshList: () => refreshWarrantyItemList(listController) })
    const controller = createWarrantyItemDeleteController(options)
    const deleting = controller.delete(target)
    await waitForPendingCount(queued, 2)
    queued.pending[1]!.resolve(listResult(1, [{ ...item, code: 'WAR-002' }]))

    await expect(deleting).resolves.toEqual({ status: 'deleted' })
    expect(listController.state).toMatchObject({
      query: expect.objectContaining({ page: 1 }),
      maxPage: 1,
      total: 1,
      items: [{ code: 'WAR-002' }],
      status: 'loaded',
    })
  })

  it('allows the TRN0001 compatibility exception only for an admin', async () => {
    const options = createOptions({
      editCompatibility: { status: 'allowed', trn0001: 'Y', isAdmin: true },
    })
    const controller = createWarrantyItemDeleteController(options)

    await expect(controller.delete(target)).resolves.toEqual({ status: 'deleted' })
    expect(options.service.delete).toHaveBeenCalledOnce()
  })

  it('prevents a second Delete while the first request is pending', async () => {
    let resolveDelete: () => void = () => undefined
    const deletePromise = new Promise<void>(resolve => { resolveDelete = resolve })
    const service = createService()
    vi.mocked(service.delete).mockReturnValueOnce(deletePromise)
    const options = createOptions({ service })
    const controller = createWarrantyItemDeleteController(options)

    const first = controller.delete(target)
    expect(controller.state.pending).toBe(true)
    const second = await controller.delete(target)
    expect(second).toEqual({ status: 'superseded' })
    expect(service.delete).toHaveBeenCalledOnce()

    resolveDelete()
    await expect(first).resolves.toEqual({ status: 'deleted' })
  })

  it('normalizes a referential backend rejection as delete-failed', async () => {
    const message = 'คำเตือน : ข้อมูลชุดนี้ถูกนำไปใช้งานแล้ว'
    const service = createService()
    vi.mocked(service.delete).mockRejectedValueOnce(new WarrantyItemDeleteServiceError('backend', message))
    const options = createOptions({ service })
    const controller = createWarrantyItemDeleteController(options)

    const result = await controller.delete(target)

    expect(result).toMatchObject({ status: 'delete-failed', error: { category: 'backend', message } })
    expect(options.refreshList).not.toHaveBeenCalled()
  })

  it('distinguishes successful Delete from a failed list refresh and retries refresh only', async () => {
    const refresh = vi.fn()
      .mockRejectedValueOnce(new Error('Refresh failed'))
      .mockResolvedValueOnce(undefined)
    const options = createOptions({ refreshList: refresh })
    const controller = createWarrantyItemDeleteController(options)

    const first = await controller.delete(target)
    expect(first).toMatchObject({ status: 'refresh-failed-after-delete' })
    expect(controller.isBlocked(target.code)).toBe(true)
    expect(options.service.delete).toHaveBeenCalledOnce()

    await expect(controller.retryRefresh()).resolves.toEqual({ status: 'deleted' })
    expect(options.service.delete).toHaveBeenCalledOnce()
    expect(refresh).toHaveBeenCalledTimes(2)
    expect(controller.state.status).toBe('deleted')
  })

  it('fails closed when Delete context is unavailable', async () => {
    const options = createOptions()
    const controller = createWarrantyItemDeleteController(options)

    const result = await controller.delete({ ...target, deleteContext: null })

    expect(result).toMatchObject({ status: 'delete-failed', error: { category: 'contract' } })
    expect(options.confirm).not.toHaveBeenCalled()
    expect(options.service.delete).not.toHaveBeenCalled()
  })
})

interface Deferred<T> {
  promise: Promise<T>
  resolve(value: T): void
  reject(reason: unknown): void
}

function deferred<T>(): Deferred<T> {
  let resolvePromise: (value: T) => void = () => undefined
  let rejectPromise: (reason: unknown) => void = () => undefined
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })
  return { promise, resolve: resolvePromise, reject: rejectPromise }
}

function queuedListService(): {
  service: WarrantyItemListService
  pending: Deferred<WarrantyItemListResult>[]
} {
  const pending: Deferred<WarrantyItemListResult>[] = []
  return {
    service: {
      read: vi.fn(() => {
        const request = deferred<WarrantyItemListResult>()
        pending.push(request)
        return request.promise
      }),
    },
    pending,
  }
}

function listResult(total: number, rows: WarrantyItemListItem[] = [item]): WarrantyItemListResult {
  return { total, items: rows }
}

async function waitForPendingCount(
  queued: { pending: Deferred<WarrantyItemListResult>[] },
  count: number,
): Promise<void> {
  for (let attempt = 0; attempt < 10 && queued.pending.length < count; attempt += 1) {
    await Promise.resolve()
  }
  expect(queued.pending.length).toBeGreaterThanOrEqual(count)
}

describe('Warranty Item Delete and list lifecycle', () => {
  it('reuses list paging clamp after deleting the last row on the final page', async () => {
    const queued = queuedListService()
    const listController = createWarrantyItemListController(queued.service)
    const lastPageItem = { ...item, code: 'WAR-501', name: 'Final Warranty' }
    const lastPageTarget = { ...target, code: lastPageItem.code, name: lastPageItem.name }
    const initial = listController.loadInitial()
    queued.pending[0]!.resolve(listResult(501))
    await initial
    const pageTwo = listController.goToPage(2)
    queued.pending[1]!.resolve(listResult(501, [lastPageItem]))
    await pageTwo

    const options = createOptions({ refreshList: () => refreshWarrantyItemList(listController) })
    const controller = createWarrantyItemDeleteController(options)
    const deleting = controller.delete(lastPageTarget)
    await waitForPendingCount(queued, 3)
    queued.pending[2]!.resolve(listResult(500, []))
    await Promise.resolve()
    queued.pending[3]!.resolve(listResult(500, [{ ...item, code: 'WAR-001' }]))

    await expect(deleting).resolves.toEqual({ status: 'deleted' })
    expect(listController.state.query.page).toBe(1)
    expect(listController.state.maxPage).toBe(1)
    expect(listController.state.total).toBe(500)
  })

  it('keeps the valid page-one empty state after deleting the last item', async () => {
    const queued = queuedListService()
    const listController = createWarrantyItemListController(queued.service)
    const initial = listController.loadInitial()
    queued.pending[0]!.resolve(listResult(1))
    await initial

    const options = createOptions({ refreshList: () => refreshWarrantyItemList(listController) })
    const controller = createWarrantyItemDeleteController(options)
    const deleting = controller.delete(target)
    await waitForPendingCount(queued, 2)
    queued.pending[1]!.resolve(listResult(0, []))

    await expect(deleting).resolves.toEqual({ status: 'deleted' })
    expect(listController.state).toMatchObject({
      query: expect.objectContaining({ page: 1 }),
      maxPage: 1,
      total: 0,
      items: [],
      status: 'loaded',
    })
  })

  it('does not let a superseded post-delete refresh overwrite a newer list request', async () => {
    const queued = queuedListService()
    const listController = createWarrantyItemListController(queued.service)
    const initial = listController.loadInitial()
    queued.pending[0]!.resolve(listResult(1))
    await initial

    const options = createOptions({ refreshList: () => refreshWarrantyItemList(listController) })
    const controller = createWarrantyItemDeleteController(options)
    const deleting = controller.delete(target)
    await waitForPendingCount(queued, 2)
    const newer = listController.updateFilters({ text: 'newer' })
    await waitForPendingCount(queued, 3)
    queued.pending[1]!.resolve(listResult(1, [{ ...item, code: 'OLD-RESULT' }]))
    await Promise.resolve()
    queued.pending[2]!.resolve(listResult(1, [{ ...item, code: 'NEW-RESULT' }]))

    await expect(deleting).resolves.toEqual({ status: 'superseded' })
    await newer
    expect(listController.state.items).toEqual([{ ...item, code: 'NEW-RESULT' }])
  })
})
