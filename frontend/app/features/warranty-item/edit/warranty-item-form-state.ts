import {
  createWarrantyItemDraft,
  draftFromWarrantyItemDetail,
  mergeWarrantyItemGroups,
  setWarrantyItemLifetime,
  validateWarrantyItemDraft,
  type WarrantyItemDetail,
  type WarrantyItemDraft,
  type WarrantyItemGroup,
  type WarrantyItemMaterial,
  type WarrantyItemValidationError,
} from './warranty-item-draft'
import {
  WarrantyItemServiceError,
  type WarrantyItemEditService,
} from './warranty-item-service'
import type { WarrantyItemAccessSnapshot } from '../runtime/access-snapshot'
import {
  getWarrantyItemEditCompatibilityPolicy,
  type WarrantyItemEditCompatibilitySnapshot,
} from '../runtime/edit-compatibility'

export type WarrantyItemFormMode = 'closed' | 'create' | 'edit'

export type WarrantyItemFormErrorCategory =
  | 'permission'
  | 'validation'
  | 'backend'
  | 'authorization'
  | 'transport'
  | 'contract'

export class WarrantyItemFormError extends Error {
  readonly category: WarrantyItemFormErrorCategory
  readonly cause: unknown

  constructor(category: WarrantyItemFormErrorCategory, message: string, cause?: unknown) {
    super(message)
    this.name = 'WarrantyItemFormError'
    this.category = category
    this.cause = cause
  }
}

export type WarrantyItemSaveResult =
  | { status: 'mutation-failed', error: Error }
  | { status: 'saved' }
  | { status: 'refresh-failed-after-mutation', error: Error }
  | { status: 'superseded' }

export interface WarrantyItemFormState {
  mode: WarrantyItemFormMode
  draft: WarrantyItemDraft | null
  groups: WarrantyItemGroup[]
  materials: WarrantyItemMaterial[]
  materialTotal: number
  detailPending: boolean
  groupsPending: boolean
  materialsPending: boolean
  savePending: boolean
  validationErrors: WarrantyItemValidationError[]
  error: Error | null
}

export interface WarrantyItemFormControllerOptions {
  service: WarrantyItemEditService
  access: WarrantyItemAccessSnapshot
  editCompatibility?: WarrantyItemEditCompatibilitySnapshot
  refreshList: () => Promise<void>
}

export interface WarrantyItemFormController {
  state: WarrantyItemFormState
  startCreate(): Promise<boolean>
  startEdit(code: string): Promise<boolean>
  cancel(): void
  loadGroups(): Promise<boolean>
  searchMaterials(searchText: string): Promise<boolean>
  setGroup(groupCode: string): boolean
  selectMaterial(material: WarrantyItemMaterial): boolean
  clearMaterial(): boolean
  setLifetime(lifetime: boolean): boolean
  setCode(code: string): boolean
  validate(): WarrantyItemValidationError[]
  save(): Promise<WarrantyItemSaveResult>
}

export function createWarrantyItemFormState(): WarrantyItemFormState {
  return {
    mode: 'closed',
    draft: null,
    groups: [],
    materials: [],
    materialTotal: 0,
    detailPending: false,
    groupsPending: false,
    materialsPending: false,
    savePending: false,
    validationErrors: [],
    error: null,
  }
}

function asError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error('Warranty Item request failed.')
}

function errorCategory(reason: unknown): WarrantyItemFormErrorCategory {
  if (reason instanceof WarrantyItemServiceError) {
    return reason.category
  }
  return 'transport'
}

function cloneDraft(draft: WarrantyItemDraft): WarrantyItemDraft {
  return {
    ...draft,
    duration: { ...draft.duration },
  }
}

function permissionError(message: string): WarrantyItemFormError {
  return new WarrantyItemFormError('permission', message)
}

function mutationFailure(message: string, cause?: unknown): WarrantyItemSaveResult {
  return {
    status: 'mutation-failed',
    error: new WarrantyItemFormError('transport', message, cause),
  }
}

function currentGroupFor(draft: WarrantyItemDraft, groups: WarrantyItemGroup[]): { code: string, name: string, active?: boolean } | null {
  if (!draft.groupCode) {
    return null
  }
  const group = groups.find(candidate => candidate.code === draft.groupCode)
  return {
    code: draft.groupCode,
    name: draft.groupName || group?.name || '',
    active: group?.active ?? false,
  }
}

export function createWarrantyItemFormController(
  options: WarrantyItemFormControllerOptions,
  state: WarrantyItemFormState = createWarrantyItemFormState(),
): WarrantyItemFormController {
  let generation = 0
  let groupRequest = 0
  let materialRequest = 0

  function nextGeneration(): number {
    generation += 1
    materialRequest += 1
    return generation
  }

  function isCurrent(requestGeneration: number): boolean {
    return requestGeneration === generation
  }

  function resetState(): void {
    state.mode = 'closed'
    state.draft = null
    state.groups = []
    state.materials = []
    state.materialTotal = 0
    state.detailPending = false
    state.groupsPending = false
    state.materialsPending = false
    state.savePending = false
    state.validationErrors = []
    state.error = null
  }

  function canCreate(): boolean {
    return options.access.status === 'editable'
  }

  function canEdit(): boolean {
    if (options.access.status !== 'editable') {
      return false
    }
    const compatibility = options.editCompatibility ?? {
      status: 'unavailable' as const,
      reason: 'compatibility-unavailable' as const,
    }
    return getWarrantyItemEditCompatibilityPolicy(compatibility).canEdit
  }

  function deny(message: string): false {
    state.error = permissionError(message)
    return false
  }

  function isCurrentGroup(requestGeneration: number, requestGroup: number): boolean {
    return isCurrent(requestGeneration) && requestGroup === groupRequest
  }

  async function loadGroupsFor(requestGeneration: number, requestGroup: number): Promise<boolean> {
    if (!isCurrentGroup(requestGeneration, requestGroup)) {
      return false
    }

    state.groupsPending = true
    state.error = null
    try {
      const activeGroups = await options.service.listActiveWarrantyGroups()
      if (!isCurrentGroup(requestGeneration, requestGroup)) {
        return false
      }

      const currentGroup = state.mode === 'edit' && state.draft
        ? currentGroupFor(state.draft, activeGroups)
        : null
      state.groups = state.mode === 'edit' && state.draft
        ? mergeWarrantyItemGroups(activeGroups, currentGroup)
        : activeGroups.map(group => ({ ...group, currentOnly: false }))

      if (state.mode === 'create' && state.draft && !state.draft.groupCode) {
        const defaultGroup = state.groups.find(group => group.active && group.default)
        if (defaultGroup) {
          state.draft.groupCode = defaultGroup.code
          state.draft.groupName = defaultGroup.name
        }
      }
      return true
    } catch (reason: unknown) {
      if (!isCurrentGroup(requestGeneration, requestGroup)) {
        return false
      }
      state.error = reason instanceof Error ? reason : asError(reason)
      if (state.mode === 'edit' && state.draft?.groupCode) {
        state.groups = [{
          code: state.draft.groupCode,
          name: state.draft.groupName,
          active: false,
          default: false,
          currentOnly: true,
        }]
      }
      return false
    } finally {
      if (isCurrentGroup(requestGeneration, requestGroup)) {
        state.groupsPending = false
      }
    }
  }

  function beginGroupLoad(requestGeneration: number): Promise<boolean> {
    const requestGroup = ++groupRequest
    return loadGroupsFor(requestGeneration, requestGroup)
  }

  async function startCreate(): Promise<boolean> {
    if (!canCreate()) {
      return deny('Warranty Item Create requires editable access.')
    }

    const requestGeneration = nextGeneration()
    resetState()
    state.mode = 'create'
    state.draft = createWarrantyItemDraft()
    await beginGroupLoad(requestGeneration)
    return isCurrent(requestGeneration)
  }

  async function startEdit(code: string): Promise<boolean> {
    if (!canEdit()) {
      return deny('Warranty Item Edit is unavailable for the current access or compatibility policy.')
    }

    const requestGeneration = nextGeneration()
    resetState()
    state.detailPending = true

    try {
      const detail = await options.service.readDetail(code)
      if (!isCurrent(requestGeneration)) {
        return false
      }

      state.mode = 'edit'
      state.draft = draftFromWarrantyItemDetail(detail)
      state.validationErrors = []
      await beginGroupLoad(requestGeneration)
      return isCurrent(requestGeneration)
    } catch (reason: unknown) {
      if (!isCurrent(requestGeneration)) {
        return false
      }
      state.error = reason instanceof Error ? reason : asError(reason)
      return false
    } finally {
      if (isCurrent(requestGeneration)) {
        state.detailPending = false
      }
    }
  }

  function cancel(): void {
    nextGeneration()
    resetState()
  }

  async function searchMaterials(searchText: string): Promise<boolean> {
    if (!state.draft || state.mode === 'closed') {
      return false
    }

    const requestGeneration = generation
    const requestMaterial = ++materialRequest
    state.materialsPending = true
    state.error = null
    try {
      const result = await options.service.searchMaterials(searchText)
      if (!isCurrent(requestGeneration) || requestMaterial !== materialRequest) {
        return false
      }
      state.materials = result.items
      state.materialTotal = result.total
      return true
    } catch (reason: unknown) {
      if (!isCurrent(requestGeneration) || requestMaterial !== materialRequest) {
        return false
      }
      state.error = reason instanceof Error ? reason : asError(reason)
      return false
    } finally {
      if (isCurrent(requestGeneration) && requestMaterial === materialRequest) {
        state.materialsPending = false
      }
    }
  }

  function setGroup(groupCode: string): boolean {
    if (!state.draft || state.mode === 'closed') {
      return false
    }
    const group = state.groups.find(candidate => candidate.code === groupCode)
    state.draft.groupCode = groupCode
    state.draft.groupName = group?.name ?? ''
    return true
  }

  function selectMaterial(material: WarrantyItemMaterial): boolean {
    if (!state.draft || state.mode === 'closed') {
      return false
    }
    state.draft.materialCode = material.code
    state.draft.materialName = material.name
    return true
  }

  function clearMaterial(): boolean {
    return selectMaterial({ code: '', name: '' })
  }

  function setLifetime(lifetime: boolean): boolean {
    if (!state.draft || state.mode === 'closed') {
      return false
    }
    state.draft = setWarrantyItemLifetime(state.draft, lifetime)
    return true
  }

  function setCode(code: string): boolean {
    if (!state.draft || state.mode === 'closed' || state.mode === 'edit') {
      return false
    }
    state.draft.code = code
    return true
  }

  function validate(): WarrantyItemValidationError[] {
    if (!state.draft) {
      state.validationErrors = []
      return state.validationErrors
    }
    state.validationErrors = validateWarrantyItemDraft(state.draft)
    return state.validationErrors
  }

  async function save(): Promise<WarrantyItemSaveResult> {
    if (!state.draft || state.mode === 'closed' || state.savePending) {
      return mutationFailure('Warranty Item form is not ready to save.')
    }
    if (state.mode === 'create' && !canCreate()) {
      const error = permissionError('Warranty Item Create requires editable access.')
      state.error = error
      return { status: 'mutation-failed', error }
    }
    if (state.mode === 'edit' && !canEdit()) {
      const error = permissionError('Warranty Item Edit is unavailable for the current access or compatibility policy.')
      state.error = error
      return { status: 'mutation-failed', error }
    }

    const errors = validate()
    if (errors.length > 0) {
      const error = new WarrantyItemFormError('validation', errors[0]!.message, errors)
      state.error = error
      return { status: 'mutation-failed', error }
    }

    const requestGeneration = generation
    const draft = cloneDraft(state.draft)
    const mode = state.mode
    state.savePending = true
    state.error = null

    try {
      if (mode === 'create') {
        await options.service.create(draft)
      } else {
        await options.service.update(draft)
      }
      if (!isCurrent(requestGeneration)) {
        return { status: 'superseded' }
      }

      try {
        await options.refreshList()
      } catch (reason: unknown) {
        if (!isCurrent(requestGeneration)) {
          return { status: 'superseded' }
        }
        nextGeneration()
        resetState()
        const error = new WarrantyItemFormError(
          errorCategory(reason),
          `Warranty Item saved, but the list refresh failed: ${asError(reason).message}`,
          reason,
        )
        state.error = error
        return { status: 'refresh-failed-after-mutation', error }
      }
      if (!isCurrent(requestGeneration)) {
        return { status: 'superseded' }
      }

      nextGeneration()
      resetState()
      return { status: 'saved' }
    } catch (reason: unknown) {
      if (!isCurrent(requestGeneration)) {
        return { status: 'superseded' }
      }
      const normalized = reason instanceof WarrantyItemServiceError
        ? reason
        : reason instanceof Error
          ? reason
          : new WarrantyItemFormError(errorCategory(reason), asError(reason).message, reason)
      state.error = normalized
      if (normalized instanceof WarrantyItemServiceError && normalized.category === 'validation' && Array.isArray(normalized.cause)) {
        state.validationErrors = normalized.cause as WarrantyItemValidationError[]
      }
      return { status: 'mutation-failed', error: normalized }
    } finally {
      if (isCurrent(requestGeneration)) {
        state.savePending = false
      }
    }
  }

  return {
    state,
    startCreate,
    startEdit,
    cancel,
    loadGroups: () => beginGroupLoad(generation),
    searchMaterials,
    setGroup,
    selectMaterial,
    clearMaterial,
    setLifetime,
    setCode,
    validate,
    save,
  }
}
