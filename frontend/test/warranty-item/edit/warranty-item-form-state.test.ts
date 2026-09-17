import { describe, expect, it, vi } from 'vitest'

import {
  createWarrantyItemFormController,
  createWarrantyItemFormState,
  type WarrantyItemFormController,
} from '../../../app/features/warranty-item/edit/warranty-item-form-state'
import {
  createWarrantyItemDraft,
  type WarrantyItemDetail,
  type WarrantyItemGroup,
} from '../../../app/features/warranty-item/edit/warranty-item-draft'
import {
  WarrantyItemServiceError,
  type WarrantyItemEditService,
} from '../../../app/features/warranty-item/edit/warranty-item-service'
import {
  createWarrantyItemListController,
  refreshWarrantyItemList,
} from '../../../app/features/warranty-item/list/warranty-item-list-state'
import type { WarrantyItemAccessSnapshot } from '../../../app/features/warranty-item/runtime/access-snapshot'
import type { WarrantyItemEditCompatibilitySnapshot } from '../../../app/features/warranty-item/runtime/edit-compatibility'
import { reactive } from 'vue'

const groups: WarrantyItemGroup[] = [
  { code: 'G01', name: 'Electrical', active: true, default: true, currentOnly: false },
  { code: 'G02', name: 'Mechanical', active: true, default: false, currentOnly: false },
]

const detail: WarrantyItemDetail = {
  code: 'WAR-001',
  name: 'Premium Warranty',
  group: { code: 'G01', name: 'Electrical' },
  material: { code: 'MAT-7', name: 'Control Board' },
  duration: { years: 2, months: 3, days: 4 },
  lifetime: false,
  active: true,
  audit: { addedBy: null, addedAt: null, editedBy: null, editedAt: null },
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

function createService(overrides: Partial<WarrantyItemEditService> = {}): WarrantyItemEditService {
  return {
    readDetail: vi.fn().mockResolvedValue(detail),
    listActiveWarrantyGroups: vi.fn().mockResolvedValue(groups),
    searchMaterials: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    create: vi.fn().mockResolvedValue({ code: 'WAR-001' }),
    update: vi.fn().mockResolvedValue({ code: 'WAR-001' }),
    ...overrides,
  }
}

function editableOptions(service: WarrantyItemEditService, access: WarrantyItemAccessSnapshot = { status: 'editable' }) {
  return {
    service,
    access,
    editCompatibility: {
      status: 'allowed' as const,
      trn0001: 'N' as const,
      isAdmin: false,
    } satisfies WarrantyItemEditCompatibilitySnapshot,
    refreshList: vi.fn().mockResolvedValue(undefined),
  }
}

function makeController(
  service: WarrantyItemEditService = createService(),
  access: WarrantyItemAccessSnapshot = { status: 'editable' },
): WarrantyItemFormController {
  return createWarrantyItemFormController(editableOptions(service, access))
}

describe('Warranty Item form controller', () => {
  it('exports a state factory that can be passed as a Vue reactive proxy', async () => {
    const state = reactive(createWarrantyItemFormState())
    const controller = createWarrantyItemFormController(editableOptions(createService()), state)

    await controller.startCreate()

    expect(state.mode).toBe('create')
    expect(state.draft?.groupCode).toBe('G01')
  })

  it('initializes Create with a blank draft and applies the active default Group only in Create', async () => {
    const service = createService()
    const controller = makeController(service)

    await controller.startCreate()

    expect(controller.state.mode).toBe('create')
    expect(controller.state.draft).toEqual({
      ...createWarrantyItemDraft(),
      groupCode: 'G01',
      groupName: 'Electrical',
    })
    expect(service.listActiveWarrantyGroups).toHaveBeenCalledTimes(1)
  })

  it('reads detail before opening Edit and retains a missing current Group as current-only', async () => {
    const service = createService({
      readDetail: vi.fn().mockResolvedValue({ ...detail, group: { code: 'G99', name: 'Retired' } }),
      listActiveWarrantyGroups: vi.fn().mockResolvedValue(groups),
    })
    const controller = makeController(service)

    const editPromise = controller.startEdit('WAR-001')
    expect(controller.state.mode).toBe('closed')
    expect(controller.state.detailPending).toBe(true)
    await editPromise

    expect(controller.state.mode).toBe('edit')
    expect(controller.state.draft).toMatchObject({ code: 'WAR-001', groupCode: 'G99', groupName: 'Retired' })
    expect(controller.state.groups).toContainEqual({
      code: 'G99', name: 'Retired', active: false, default: false, currentOnly: true,
    })
  })

  it('preserves nullable Edit durations through controller state and update', async () => {
    const update = vi.fn().mockResolvedValue({ code: 'WAR-001' })
    const service = createService({
      readDetail: vi.fn().mockResolvedValue({
        ...detail,
        duration: { years: null, months: null, days: null },
      }),
      update,
    })
    const controller = makeController(service)

    await controller.startEdit('WAR-001')
    expect(controller.state.draft?.duration).toEqual({ years: null, months: null, days: null })

    await expect(controller.save()).resolves.toMatchObject({ status: 'saved' })
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      duration: { years: null, months: null, days: null },
    }))
  })

  it('keeps the Edit code immutable while allowing Create code changes', async () => {
    const controller = makeController()
    await controller.startEdit('WAR-001')

    expect(controller.setCode('WAR-999')).toBe(false)
    expect(controller.state.draft?.code).toBe('WAR-001')

    controller.cancel()
    await controller.startCreate()
    expect(controller.setCode('WAR-999')).toBe(true)
    expect(controller.state.draft?.code).toBe('WAR-999')
  })

  it('searches, selects, and clears an optional Material', async () => {
    const service = createService({
      searchMaterials: vi.fn().mockResolvedValue({ items: [{ code: 'MAT-7', name: 'Control Board' }], total: 1 }),
    })
    const controller = makeController(service)
    await controller.startCreate()

    await controller.searchMaterials('Control')
    expect(controller.state.materials).toEqual([{ code: 'MAT-7', name: 'Control Board' }])
    controller.selectMaterial({ code: 'MAT-7', name: 'Control Board' })
    expect(controller.state.draft).toMatchObject({ materialCode: 'MAT-7', materialName: 'Control Board' })
    controller.clearMaterial()
    expect(controller.state.draft).toMatchObject({ materialCode: '', materialName: '' })
  })

  it('updates both Group code and Group name through the controller operation', async () => {
    const controller = makeController()
    await controller.startCreate()

    expect(controller.setGroup('G02')).toBe(true)
    expect(controller.state.draft).toMatchObject({ groupCode: 'G02', groupName: 'Mechanical' })
    expect(controller.setGroup('')).toBe(true)
    expect(controller.state.draft).toMatchObject({ groupCode: '', groupName: '' })
  })

  it('applies the lifetime UX toggle by clearing duration components', async () => {
    const controller = makeController()
    await controller.startCreate()
    controller.state.draft!.duration = { years: 2, months: 3, days: 4 }

    controller.setLifetime(true)
    expect(controller.state.draft).toMatchObject({ lifetime: true, duration: { years: 0, months: 0, days: 0 } })
    controller.setLifetime(false)
    expect(controller.state.draft?.lifetime).toBe(false)
  })

  it('rejects Create from readonly access and Edit from denied compatibility', async () => {
    const readonly = makeController(createService(), { status: 'readonly' })
    await expect(readonly.startCreate()).resolves.toBe(false)
    expect(readonly.state.mode).toBe('closed')
    expect(readonly.state.error).toMatchObject({ category: 'permission' })

    const service = createService()
    const denied = createWarrantyItemFormController({
      ...editableOptions(service),
      editCompatibility: { status: 'denied', trn0001: 'Y', isAdmin: false },
    })
    await expect(denied.startEdit('WAR-001')).resolves.toBe(false)
    expect(service.readDetail).not.toHaveBeenCalled()
    expect(denied.state.error).toMatchObject({ category: 'permission' })
  })

  it('blocks duplicate saves while the first mutation is pending', async () => {
    const pending = deferred<unknown>()
    const service = createService({ create: vi.fn().mockReturnValue(pending.promise) })
    const controller = makeController(service)
    await controller.startCreate()
    controller.setCode('WAR-001')
    controller.state.draft!.name = 'Premium Warranty'

    const first = controller.save()
    await Promise.resolve()
    const second = await controller.save()

    expect(second).toMatchObject({ status: 'mutation-failed' })
    expect(service.create).toHaveBeenCalledTimes(1)
    expect(controller.state.savePending).toBe(true)
    pending.resolve({ code: 'WAR-001' })
    await expect(first).resolves.toMatchObject({ status: 'saved' })
  })

  it('clears pending in finally and preserves the draft after a failed save', async () => {
    const service = createService({
      create: vi.fn().mockRejectedValue(new WarrantyItemServiceError('backend', 'Duplicate code')),
    })
    const controller = makeController(service)
    await controller.startCreate()
    controller.setCode('WAR-001')
    controller.state.draft!.name = 'Premium Warranty'
    const before = structuredClone(controller.state.draft)

    await expect(controller.save()).resolves.toMatchObject({ status: 'mutation-failed' })
    expect(controller.state.savePending).toBe(false)
    expect(controller.state.mode).toBe('create')
    expect(controller.state.draft).toEqual(before)
    expect(controller.state.error).toMatchObject({ category: 'backend', message: 'Duplicate code' })
  })

  it('awaits list refresh before resetting after a successful save', async () => {
    const refresh = deferred<void>()
    const service = createService()
    const options = editableOptions(service)
    options.refreshList = vi.fn().mockReturnValue(refresh.promise)
    const controller = createWarrantyItemFormController(options)
    await controller.startCreate()
    controller.setCode('WAR-001')
    controller.state.draft!.name = 'Premium Warranty'

    const save = controller.save()
    await Promise.resolve()
    expect(controller.state.mode).toBe('create')
    expect(controller.state.savePending).toBe(true)
    expect(options.refreshList).toHaveBeenCalledTimes(1)

    refresh.resolve()
    await expect(save).resolves.toMatchObject({ status: 'saved' })
    expect(controller.state).toMatchObject({ mode: 'closed', draft: null, savePending: false })
  })

  it('closes the draft when the list refresh enters an error state after save', async () => {
    const service = createService()
    const listController = createWarrantyItemListController({
      read: vi.fn().mockRejectedValue(new Error('List refresh failed')),
    })
    const listInitialLoad = listController.loadInitial()
    await listInitialLoad
    const options = editableOptions(service)
    options.refreshList = vi.fn(() => refreshWarrantyItemList(listController))
    const controller = createWarrantyItemFormController(options)
    await controller.startCreate()
    controller.setCode('WAR-001')
    controller.state.draft!.name = 'Premium Warranty'

    await expect(controller.save()).resolves.toMatchObject({ status: 'refresh-failed-after-mutation' })
    expect(controller.state).toMatchObject({ mode: 'closed', draft: null })
    expect(controller.state.error).toMatchObject({
      message: expect.stringContaining('saved, but the list refresh failed: List refresh failed'),
    })
  })

  it('closes a successfully created form when refresh fails and prevents duplicate mutation', async () => {
    const create = vi.fn().mockResolvedValue({ code: 'WAR-001' })
    const refreshList = vi.fn().mockRejectedValue(new Error('List refresh failed after save'))
    const service = createService({ create })
    const options = editableOptions(service)
    options.refreshList = refreshList
    const controller = createWarrantyItemFormController(options)
    await controller.startCreate()
    controller.setCode('WAR-001')
    controller.state.draft!.name = 'Premium Warranty'

    await expect(controller.save()).resolves.toMatchObject({ status: 'refresh-failed-after-mutation' })
    await expect(controller.save()).resolves.toMatchObject({ status: 'mutation-failed' })

    expect(create).toHaveBeenCalledTimes(1)
    expect(refreshList).toHaveBeenCalledTimes(1)
    expect(controller.state).toMatchObject({ mode: 'closed', draft: null, savePending: false })
    expect(controller.state.error).toMatchObject({
      category: 'transport',
      message: expect.stringContaining('saved'),
    })
  })

  it('closes a successfully updated form when refresh fails and prevents duplicate mutation', async () => {
    const update = vi.fn().mockResolvedValue({ code: 'WAR-001' })
    const refreshList = vi.fn().mockRejectedValue(new Error('List refresh failed after update'))
    const service = createService({ update })
    const options = editableOptions(service)
    options.refreshList = refreshList
    const controller = createWarrantyItemFormController(options)
    await controller.startEdit('WAR-001')

    await expect(controller.save()).resolves.toMatchObject({ status: 'refresh-failed-after-mutation' })
    await expect(controller.save()).resolves.toMatchObject({ status: 'mutation-failed' })

    expect(update).toHaveBeenCalledTimes(1)
    expect(refreshList).toHaveBeenCalledTimes(1)
    expect(controller.state).toMatchObject({ mode: 'closed', draft: null, savePending: false })
    expect(controller.state.error).toMatchObject({
      category: 'transport',
      message: expect.stringContaining('saved'),
    })
  })

  it('ignores stale detail completion after a newer mode starts', async () => {
    const first = deferred<WarrantyItemDetail>()
    const second = deferred<WarrantyItemDetail>()
    const service = createService({
      readDetail: vi.fn()
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise),
    })
    const controller = makeController(service)

    const staleEdit = controller.startEdit('WAR-OLD')
    const currentEdit = controller.startEdit('WAR-NEW')
    first.resolve({ ...detail, code: 'WAR-OLD' })
    await Promise.resolve()
    expect(controller.state.draft).toBeNull()
    second.resolve({ ...detail, code: 'WAR-NEW' })
    await currentEdit
    await staleEdit

    expect(controller.state.draft?.code).toBe('WAR-NEW')
  })

  it('does not let a stale save success reset a newer mode or refresh the list', async () => {
    const saveResult = deferred<unknown>()
    const service = createService({ create: vi.fn().mockReturnValue(saveResult.promise) })
    const options = editableOptions(service)
    const controller = createWarrantyItemFormController(options)
    await controller.startCreate()
    controller.setCode('WAR-OLD')
    controller.state.draft!.name = 'Old draft'
    const staleSave = controller.save()

    await controller.startCreate()
    controller.setCode('WAR-NEW')
    controller.state.draft!.name = 'New draft'
    saveResult.resolve({ code: 'WAR-OLD' })
    await expect(staleSave).resolves.toMatchObject({ status: 'superseded' })

    expect(options.refreshList).not.toHaveBeenCalled()
    expect(controller.state.mode).toBe('create')
    expect(controller.state.draft).toMatchObject({ code: 'WAR-NEW', name: 'New draft' })
    expect(controller.state.savePending).toBe(false)
  })

  it('ignores an older Group success and finally while a newer Group load is pending', async () => {
    const staleGroups = deferred<WarrantyItemGroup[]>()
    const currentGroups = deferred<WarrantyItemGroup[]>()
    const listActiveWarrantyGroups = vi.fn()
      .mockResolvedValueOnce(groups)
      .mockReturnValueOnce(staleGroups.promise)
      .mockReturnValueOnce(currentGroups.promise)
    const service = createService({ listActiveWarrantyGroups })
    const controller = makeController(service)
    await controller.startCreate()

    const staleLoad = controller.loadGroups()
    const currentLoad = controller.loadGroups()
    expect(controller.state.groupsPending).toBe(true)

    staleGroups.resolve([{ ...groups[0]!, code: 'G-STALE', name: 'Stale Group' }])
    await Promise.resolve()
    expect(controller.state.groups).not.toContainEqual(expect.objectContaining({ code: 'G-STALE' }))
    expect(controller.state.groupsPending).toBe(true)

    currentGroups.resolve([{ ...groups[0]!, code: 'G-CURRENT', name: 'Current Group' }])
    await currentLoad
    await staleLoad
    expect(controller.state.groups).toContainEqual(expect.objectContaining({ code: 'G-CURRENT' }))
    expect(controller.state.groups).not.toContainEqual(expect.objectContaining({ code: 'G-STALE' }))
    expect(controller.state.groupsPending).toBe(false)
  })

  it('ignores an older Group error and finally while applying the newer Group result', async () => {
    const staleError = deferred<WarrantyItemGroup[]>()
    const currentGroups = deferred<WarrantyItemGroup[]>()
    const listActiveWarrantyGroups = vi.fn()
      .mockResolvedValueOnce(groups)
      .mockReturnValueOnce(staleError.promise)
      .mockReturnValueOnce(currentGroups.promise)
    const service = createService({ listActiveWarrantyGroups })
    const controller = makeController(service)
    await controller.startCreate()

    const staleLoad = controller.loadGroups()
    const currentLoad = controller.loadGroups()
    staleError.reject(new WarrantyItemServiceError('backend', 'Stale Group failure'))
    await Promise.resolve()
    expect(controller.state.error).toBeNull()
    expect(controller.state.groupsPending).toBe(true)

    currentGroups.resolve([{ ...groups[0]!, code: 'G-CURRENT', name: 'Current Group' }])
    await currentLoad
    await staleLoad
    expect(controller.state.error).toBeNull()
    expect(controller.state.groups).toContainEqual(expect.objectContaining({ code: 'G-CURRENT' }))
    expect(controller.state.groupsPending).toBe(false)
  })

  it('ignores stale Material success and finally while a newer search is pending', async () => {
    const staleMaterials = deferred<{ items: { code: string, name: string }[], total: number }>()
    const currentMaterials = deferred<{ items: { code: string, name: string }[], total: number }>()
    const searchMaterials = vi.fn()
      .mockReturnValueOnce(staleMaterials.promise)
      .mockReturnValueOnce(currentMaterials.promise)
    const service = createService({ searchMaterials })
    const controller = makeController(service)
    await controller.startCreate()

    const staleSearch = controller.searchMaterials('stale')
    const currentSearch = controller.searchMaterials('current')
    staleMaterials.resolve({ items: [{ code: 'MAT-STALE', name: 'Stale' }], total: 1 })
    await Promise.resolve()
    expect(controller.state.materials).toEqual([])
    expect(controller.state.materialsPending).toBe(true)

    currentMaterials.resolve({ items: [{ code: 'MAT-CURRENT', name: 'Current' }], total: 1 })
    await currentSearch
    await staleSearch
    expect(controller.state.materials).toEqual([{ code: 'MAT-CURRENT', name: 'Current' }])
    expect(controller.state.materialsPending).toBe(false)
  })

  it('does not let stale Material completion or error overwrite the newer search error', async () => {
    const staleMaterials = deferred<{ items: { code: string, name: string }[], total: number }>()
    const currentMaterials = deferred<{ items: { code: string, name: string }[], total: number }>()
    const searchMaterials = vi.fn()
      .mockReturnValueOnce(staleMaterials.promise)
      .mockReturnValueOnce(currentMaterials.promise)
    const service = createService({ searchMaterials })
    const controller = makeController(service)
    await controller.startCreate()

    const staleSearch = controller.searchMaterials('stale')
    const currentSearch = controller.searchMaterials('current')
    staleMaterials.resolve({ items: [{ code: 'MAT-STALE', name: 'Stale' }], total: 1 })
    await Promise.resolve()
    expect(controller.state.materialsPending).toBe(true)
    currentMaterials.reject(new WarrantyItemServiceError('transport', 'Current Material failure'))
    await currentSearch
    await staleSearch

    expect(controller.state.materials).toEqual([])
    expect(controller.state.error).toMatchObject({ category: 'transport', message: 'Current Material failure' })
    expect(controller.state.materialsPending).toBe(false)
  })

  it('rejects stale Material results after the newer search has already succeeded', async () => {
    const staleMaterials = deferred<{ items: { code: string, name: string }[], total: number }>()
    const currentMaterials = deferred<{ items: { code: string, name: string }[], total: number }>()
    const searchMaterials = vi.fn()
      .mockReturnValueOnce(staleMaterials.promise)
      .mockReturnValueOnce(currentMaterials.promise)
    const service = createService({ searchMaterials })
    const controller = makeController(service)
    await controller.startCreate()

    const staleSearch = controller.searchMaterials('stale')
    const currentSearch = controller.searchMaterials('current')
    currentMaterials.resolve({ items: [{ code: 'MAT-CURRENT', name: 'Current' }], total: 1 })
    await currentSearch
    staleMaterials.resolve({ items: [{ code: 'MAT-STALE', name: 'Stale' }], total: 1 })
    await staleSearch

    expect(controller.state.materials).toEqual([{ code: 'MAT-CURRENT', name: 'Current' }])
    expect(controller.state.materialsPending).toBe(false)
  })
})
