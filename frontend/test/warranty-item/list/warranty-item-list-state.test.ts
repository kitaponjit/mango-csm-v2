import { describe, expect, it } from 'vitest'
import { reactive, watch } from 'vue'

import {
  createWarrantyItemListController,
  createWarrantyItemListState,
  refreshWarrantyItemList,
  type WarrantyItemListState,
} from '../../../app/features/warranty-item/list/warranty-item-list-state'
import type {
  WarrantyItemListItem,
  WarrantyItemListResult,
  WarrantyItemListService,
} from '../../../app/features/warranty-item/list/warranty-item-list-service'

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
}

function result(total: number, items: WarrantyItemListItem[] = [item]): WarrantyItemListResult {
  return { total, items }
}

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

  return {
    promise,
    resolve: resolvePromise,
    reject: rejectPromise,
  }
}

function createQueuedService(): {
  service: WarrantyItemListService
  requests: WarrantyItemListState['query'][]
  pending: Deferred<WarrantyItemListResult>[]
} {
  const requests: WarrantyItemListState['query'][] = []
  const pending: Deferred<WarrantyItemListResult>[] = []

  return {
    service: {
      read(request) {
        const requestDeferred = deferred<WarrantyItemListResult>()
        requests.push({ ...request })
        pending.push(requestDeferred)
        return requestDeferred.promise
      },
    },
    requests,
    pending,
  }
}

describe('createWarrantyItemListController', () => {
  it('notifies a Vue watcher when it mutates an injected reactive state target', async () => {
    const queued = createQueuedService()
    const state = reactive(createWarrantyItemListState())
    const statuses: string[] = []
    const stop = watch(
      () => state.status,
      (status) => statuses.push(status),
      { flush: 'sync' },
    )
    const controller = createWarrantyItemListController(queued.service, state)

    const loading = controller.loadInitial()
    expect(statuses).toEqual(['initial-loading'])
    queued.pending[0]?.resolve(result(1))
    await loading
    stop()

    expect(statuses).toEqual(['initial-loading', 'loaded'])
  })

  it('loads the initial page with the typed default query', async () => {
    const queued = createQueuedService()
    const controller = createWarrantyItemListController(queued.service)

    const loading = controller.loadInitial()

    expect(controller.state.status).toBe('initial-loading')
    expect(queued.requests).toEqual([{
      field: 'war_code',
      text: '',
      active: 'Y',
      page: 1,
      pageSize: 500,
    }])

    queued.pending[0]?.resolve(result(1))
    await loading

    expect(controller.state).toMatchObject({
      status: 'loaded',
      items: [item],
      total: 1,
      maxPage: 1,
      error: null,
    })
  })

  it('navigates within deterministic page bounds and sends the selected page', async () => {
    const queued = createQueuedService()
    const controller = createWarrantyItemListController(queued.service)

    const initial = controller.loadInitial()
    queued.pending[0]?.resolve(result(1_001))
    await initial

    const pageThree = controller.goToPage(3)
    expect(controller.state.query.page).toBe(3)
    expect(queued.requests[1]).toMatchObject({ page: 3, pageSize: 500 })
    queued.pending[1]?.resolve(result(1_001))
    await pageThree

    const aboveLastPage = controller.goToPage(99)
    expect(controller.state.query.page).toBe(3)
    expect(queued.requests[2]).toMatchObject({ page: 3 })
    queued.pending[2]?.resolve(result(1_001))
    await aboveLastPage
  })

  it('reloads a clamped page without publishing items when a response shrinks the total', async () => {
    const queued = createQueuedService()
    const controller = createWarrantyItemListController(queued.service)

    const initial = controller.loadInitial()
    queued.pending[0]?.resolve(result(1_500, [{ ...item, code: 'WAR-INITIAL' }]))
    await initial

    const pageThree = controller.goToPage(3)
    queued.pending[1]?.resolve(result(100, [{ ...item, code: 'WAR-STALE-PAGE' }]))
    await Promise.resolve()

    expect(controller.state).toMatchObject({
      query: expect.objectContaining({ page: 1 }),
      status: 'refreshing',
      items: [expect.objectContaining({ code: 'WAR-INITIAL' })],
    })
    expect(queued.requests[2]).toMatchObject({ page: 1, pageSize: 500 })

    queued.pending[2]?.resolve(result(100, [{ ...item, code: 'WAR-PAGE-ONE' }]))
    await pageThree

    expect(controller.state).toMatchObject({
      query: expect.objectContaining({ page: 1 }),
      maxPage: 1,
      status: 'loaded',
      items: [expect.objectContaining({ code: 'WAR-PAGE-ONE' })],
    })
  })

  it('exposes total rows, computes the maximum page, and handles an empty result', async () => {
    const queued = createQueuedService()
    const controller = createWarrantyItemListController(queued.service)

    const loading = controller.loadInitial()
    queued.pending[0]?.resolve(result(0, []))
    await loading

    expect(controller.state).toMatchObject({
      items: [],
      total: 0,
      maxPage: 1,
      status: 'loaded',
    })
  })

  it('resets to page one and loads when search filters change', async () => {
    const queued = createQueuedService()
    const controller = createWarrantyItemListController(queued.service)

    const initial = controller.loadInitial()
    queued.pending[0]?.resolve(result(1_001))
    await initial
    const pageTwo = controller.goToPage(2)
    queued.pending[1]?.resolve(result(1_001))
    await pageTwo

    const filtering = controller.updateFilters({
      field: 'war_des',
      text: 'Premium',
      active: 'N',
    })

    expect(controller.state.query).toEqual({
      field: 'war_des',
      text: 'Premium',
      active: 'N',
      page: 1,
      pageSize: 500,
    })
    expect(queued.requests[2]).toMatchObject(controller.state.query)
    queued.pending[2]?.resolve(result(1, [item]))
    await filtering
  })

  it('keeps the newest response when an older request resolves later', async () => {
    const queued = createQueuedService()
    const controller = createWarrantyItemListController(queued.service)

    const first = controller.loadInitial()
    const newer = controller.updateFilters({ text: 'new' })
    queued.pending[1]?.resolve(result(1, [{ ...item, code: 'WAR-NEW' }]))
    await newer
    queued.pending[0]?.resolve(result(1, [{ ...item, code: 'WAR-OLD' }]))
    await first

    expect(controller.state).toMatchObject({
      status: 'loaded',
      error: null,
      items: [expect.objectContaining({ code: 'WAR-NEW' })],
    })
  })

  it('keeps the newest status when an older request rejects later', async () => {
    const queued = createQueuedService()
    const controller = createWarrantyItemListController(queued.service)

    const first = controller.loadInitial()
    const newer = controller.updateFilters({ text: 'new' })
    queued.pending[1]?.resolve(result(1, [{ ...item, code: 'WAR-NEW' }]))
    await newer
    queued.pending[0]?.reject(new Error('old request failed'))
    await first

    expect(controller.state).toMatchObject({
      status: 'loaded',
      error: null,
      items: [expect.objectContaining({ code: 'WAR-NEW' })],
    })
  })

  it('exposes an intentional error state for a failed initial load', async () => {
    const queued = createQueuedService()
    const controller = createWarrantyItemListController(queued.service)

    const loading = controller.loadInitial()
    queued.pending[0]?.reject(new Error('Network unavailable'))
    await loading

    expect(controller.state).toMatchObject({
      status: 'error',
      items: [],
      total: 0,
      error: expect.objectContaining({ message: 'Network unavailable' }),
    })
  })

  it('preserves loaded data after a refresh failure and retries the current query', async () => {
    const queued = createQueuedService()
    const controller = createWarrantyItemListController(queued.service)

    const initial = controller.loadInitial()
    queued.pending[0]?.resolve(result(700, [item]))
    await initial
    const refresh = controller.goToPage(2)
    queued.pending[1]?.reject(new Error('Refresh failed'))
    await refresh

    expect(controller.state).toMatchObject({
      status: 'error',
      items: [item],
      total: 700,
      error: expect.objectContaining({ message: 'Refresh failed' }),
    })

    const retrying = controller.retry()
    expect(controller.state).toMatchObject({ status: 'refreshing', error: null })
    expect(queued.requests[2]).toEqual({
      field: 'war_code',
      text: '',
      active: 'Y',
      page: 2,
      pageSize: 500,
    })
    queued.pending[2]?.resolve(result(700, [{ ...item, code: 'WAR-RETRIED' }]))
    await retrying

    expect(controller.state).toMatchObject({
      status: 'loaded',
      error: null,
      items: [expect.objectContaining({ code: 'WAR-RETRIED' })],
    })
  })

  it('resolves the refresh adapter only after a successful retry', async () => {
    const queued = createQueuedService()
    const controller = createWarrantyItemListController(queued.service)
    const initial = controller.loadInitial()
    queued.pending[0]?.resolve(result(1))
    await initial

    const refresh = refreshWarrantyItemList(controller)
    expect(controller.state.status).toBe('refreshing')
    queued.pending[1]?.resolve(result(1, [{ ...item, code: 'WAR-REFRESHED' }]))

    await expect(refresh).resolves.toBeUndefined()
    expect(controller.state.items).toEqual([{ ...item, code: 'WAR-REFRESHED' }])
  })

  it('propagates a refresh error from the list controller', async () => {
    const queued = createQueuedService()
    const controller = createWarrantyItemListController(queued.service)
    const initial = controller.loadInitial()
    queued.pending[0]?.resolve(result(1))
    await initial

    const refresh = refreshWarrantyItemList(controller)
    queued.pending[1]?.reject(new Error('Refresh adapter failure'))

    await expect(refresh).rejects.toMatchObject({ message: 'Refresh adapter failure' })
    expect(controller.state.status).toBe('error')
  })

  it('rejects a superseded refresh while the newer refresh is still pending', async () => {
    const queued = createQueuedService()
    const controller = createWarrantyItemListController(queued.service)
    const initial = controller.loadInitial()
    queued.pending[0]?.resolve(result(1))
    await initial

    const olderRefresh = refreshWarrantyItemList(controller)
    const newerRefresh = refreshWarrantyItemList(controller)
    queued.pending[1]?.resolve(result(1, [{ ...item, code: 'WAR-OLDER' }]))
    await expect(olderRefresh).rejects.toThrow('superseded')
    expect(controller.state.status).toBe('refreshing')

    queued.pending[2]?.resolve(result(1, [{ ...item, code: 'WAR-NEWER' }]))
    await expect(newerRefresh).resolves.toBeUndefined()
    expect(controller.state.items).toEqual([{ ...item, code: 'WAR-NEWER' }])
  })
})
