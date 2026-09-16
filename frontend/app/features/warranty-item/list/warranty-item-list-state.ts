import type {
  WarrantyItemListActiveFilter,
  WarrantyItemListField,
  WarrantyItemListItem,
  WarrantyItemListRequest,
  WarrantyItemListService,
} from './warranty-item-list-service'

export type WarrantyItemListStatus = 'idle' | 'initial-loading' | 'refreshing' | 'loaded' | 'error'

export interface WarrantyItemListState {
  query: WarrantyItemListRequest
  items: WarrantyItemListItem[]
  total: number
  maxPage: number
  status: WarrantyItemListStatus
  error: Error | null
}

export interface WarrantyItemListFilters {
  field?: WarrantyItemListField
  text?: string
  active?: WarrantyItemListActiveFilter
}

export interface WarrantyItemListController {
  state: WarrantyItemListState
  loadInitial(): Promise<void>
  goToPage(page: number): Promise<void>
  updateFilters(filters: WarrantyItemListFilters): Promise<void>
  retry(): Promise<void>
}

export const warrantyItemListDefaultQuery: WarrantyItemListRequest = {
  field: 'war_code',
  text: '',
  active: 'Y',
  page: 1,
  pageSize: 500,
}

function maxPageFor(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize))
}

export function getWarrantyItemPageNumbers(maxPage: number): number[] {
  const pageCount = Number.isFinite(maxPage) ? Math.max(1, Math.trunc(maxPage)) : 1
  return Array.from({ length: pageCount }, (_, index) => index + 1)
}

function clampPage(page: number, maxPage: number): number {
  if (!Number.isFinite(page)) {
    return 1
  }

  return Math.min(Math.max(1, Math.trunc(page)), maxPage)
}

function asError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error('Warranty Item list request failed.')
}

export function createWarrantyItemListState(): WarrantyItemListState {
  return {
    query: { ...warrantyItemListDefaultQuery },
    items: [],
    total: 0,
    maxPage: 1,
    status: 'idle',
    error: null,
  }
}

export function createWarrantyItemListController(
  service: WarrantyItemListService,
  state: WarrantyItemListState = createWarrantyItemListState(),
): WarrantyItemListController {
  let generation = 0
  let hasLoaded = false

  async function loadCurrentQuery(): Promise<void> {
    generation += 1
    const requestGeneration = generation
    const request = { ...state.query }

    state.status = hasLoaded ? 'refreshing' : 'initial-loading'
    state.error = null

    try {
      const result = await service.read(request)
      if (requestGeneration !== generation) {
        return
      }

      const resultMaxPage = maxPageFor(result.total, state.query.pageSize)
      if (state.query.page > resultMaxPage) {
        state.query = {
          ...state.query,
          page: resultMaxPage,
        }
        return loadCurrentQuery()
      }

      state.items = result.items
      state.total = result.total
      state.maxPage = resultMaxPage
      state.status = 'loaded'
      state.error = null
      hasLoaded = true
    } catch (reason: unknown) {
      if (requestGeneration !== generation) {
        return
      }

      state.status = 'error'
      state.error = asError(reason)
    }
  }

  return {
    state,
    loadInitial: loadCurrentQuery,
    goToPage(page) {
      state.query = {
        ...state.query,
        page: clampPage(page, state.maxPage),
      }
      return loadCurrentQuery()
    },
    updateFilters(filters) {
      state.query = {
        ...state.query,
        ...filters,
        page: 1,
      }
      return loadCurrentQuery()
    },
    retry: loadCurrentQuery,
  }
}
