import {
  type WarrantyItemReferenceIcKey,
  type WarrantyItemReferenceIcRow,
  type WarrantyItemReferenceIcService,
} from './warranty-item-reference-ic-service'

export type WarrantyItemReferenceIcStatus = 'idle' | 'loading' | 'loaded' | 'load-failed' | 'creating' | 'created' | 'create-failed'

export interface WarrantyItemReferenceIcState {
  status: WarrantyItemReferenceIcStatus
  items: WarrantyItemReferenceIcRow[]
  selectedItems: WarrantyItemReferenceIcRow[]
  searchField: string
  searchText: string
  page: number
  pageSize: number
  total: number
  error: Error | null
}

export interface WarrantyItemReferenceIcControllerOptions {
  service: WarrantyItemReferenceIcService
  refreshList(): Promise<void>
  getExcluded?: () => readonly WarrantyItemReferenceIcKey[]
}

export interface WarrantyItemReferenceIcController {
  state: WarrantyItemReferenceIcState
  open(): Promise<{ status: 'loaded' } | { status: 'load-failed', error: Error }>
  search(): Promise<{ status: 'loaded' } | { status: 'load-failed', error: Error }>
  retry(): Promise<{ status: 'loaded' } | { status: 'load-failed', error: Error }>
  toggleSelection(row: WarrantyItemReferenceIcRow): void
  toggleAll(checked: boolean): void
  createSelected(): Promise<{ status: 'created' } | { status: 'create-failed', error: Error }>
  reset(): void
}

export function createWarrantyItemReferenceIcState(): WarrantyItemReferenceIcState {
  return {
    status: 'idle',
    items: [],
    selectedItems: [],
    searchField: 'war_code',
    searchText: '',
    page: 1,
    pageSize: 10,
    total: 0,
    error: null,
  }
}

function rowKey(row: WarrantyItemReferenceIcRow): string {
  return `${row.ic_docno ?? ''}:${row.ic_itemno ?? ''}`
}

function asError(reason: unknown, fallback: string): Error {
  return reason instanceof Error ? reason : new Error(fallback)
}

export function createWarrantyItemReferenceIcController(
  options: WarrantyItemReferenceIcControllerOptions,
  state: WarrantyItemReferenceIcState = createWarrantyItemReferenceIcState(),
): WarrantyItemReferenceIcController {
  async function load(): Promise<{ status: 'loaded' } | { status: 'load-failed', error: Error }> {
    state.status = 'loading'
    state.error = null
    try {
      const result = await options.service.read({
        skip: (state.page - 1) * state.pageSize,
        take: state.pageSize,
        searchField: state.searchField,
        searchText: state.searchText,
        exclude: options.getExcluded?.(),
      })
      state.items = result.items
      state.total = result.total
      state.selectedItems = state.selectedItems.filter(selected => state.items.some(item => rowKey(item) === rowKey(selected)))
      state.status = 'loaded'
      return { status: 'loaded' }
    } catch (reason: unknown) {
      const error = asError(reason, 'Reference IC lookup failed.')
      state.status = 'load-failed'
      state.error = error
      return { status: 'load-failed', error }
    }
  }

  function reset(): void {
    state.status = 'idle'
    state.items = []
    state.selectedItems = []
    state.total = 0
    state.error = null
  }

  function toggleSelection(row: WarrantyItemReferenceIcRow): void {
    const key = rowKey(row)
    if (state.selectedItems.some(selected => rowKey(selected) === key)) {
      state.selectedItems = state.selectedItems.filter(selected => rowKey(selected) !== key)
    } else {
      state.selectedItems = [...state.selectedItems, row]
    }
  }

  function toggleAll(checked: boolean): void {
    state.selectedItems = checked ? [...state.items] : []
  }

  async function createSelected(): Promise<{ status: 'created' } | { status: 'create-failed', error: Error }> {
    if (state.selectedItems.length === 0) {
      const error = new Error('Select at least one Reference IC row.')
      state.status = 'create-failed'
      state.error = error
      return { status: 'create-failed', error }
    }
    state.status = 'creating'
    state.error = null
    try {
      await options.service.create(state.selectedItems)
      await options.refreshList()
      state.status = 'created'
      state.selectedItems = []
      return { status: 'created' }
    } catch (reason: unknown) {
      const error = asError(reason, 'Reference IC create failed.')
      state.status = 'create-failed'
      state.error = error
      return { status: 'create-failed', error }
    }
  }

  return {
    state,
    open: load,
    search: load,
    retry: load,
    toggleSelection,
    toggleAll,
    createSelected,
    reset,
  }
}
