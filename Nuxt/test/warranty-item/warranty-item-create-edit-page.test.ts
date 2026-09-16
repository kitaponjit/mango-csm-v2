import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WarrantyItemPage from '../../app/pages/master/warranty-item/index.vue'

const apiGet = vi.fn()
const apiPost = vi.fn()
const redirectToLogin = vi.fn()
const getContext = vi.fn()
const checkMenuAccess = vi.fn()

const staleRow = {
  war_code: 'W001', war_des: 'Stale name', type_code: 'G01', type_name: 'Default group',
  tot_date: 1, tot_month: 2, tot_year: 3, lifetime: 'N', itemcode: 'MAT01', active: 'Y',
}
const groups = [
  { type_code: 'G01', type_name: 'Default group', default_: 'Y', active: 'Y' },
  { type_code: 'G02', type_name: 'Other group', default_: 'N', active: 'Y' },
]

beforeEach(() => {
  apiGet.mockReset()
  apiPost.mockReset().mockResolvedValue({ ok: true, status: 200, data: {} })
  getContext.mockReset().mockReturnValue({ isAuthenticated: true })
  redirectToLogin.mockReset()
  checkMenuAccess.mockReset().mockResolvedValue({ status: 'editable' })
  apiGet.mockImplementation(async (path: string) => {
    if (path.startsWith('CSM/Master/WarrantyGroup_ReadList')) return { ok: true, status: 200, data: { data: groups, total: groups.length } }
    if (path.startsWith('CSM/Master/WarrantyItem_Read?')) return { ok: true, status: 200, data: staleRow }
    return { ok: true, status: 200, data: { data_rows: [staleRow], total: 1 } }
  })
  vi.stubGlobal('useApiClient', () => ({ get: apiGet, post: apiPost }))
  vi.stubGlobal('useLocalizationAdapter', () => ({ language: 'en', t: (key: string) => key }))
  vi.stubGlobal('useSessionAdapter', () => ({ getContext, redirectToLogin }))
  vi.stubGlobal('useAccessControlService', () => ({ checkMenuAccess }))
  vi.stubGlobal('useHead', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

type WarrantyItemSetup = {
  openCreate(): void
  openEdit(code: string): Promise<void>
  saveForm(): Promise<void>
}

function pageSetup(wrapper: ReturnType<typeof mount>) {
  return (wrapper.vm as unknown as { $: { setupState: WarrantyItemSetup } }).$.setupState
}

async function editablePage() {
  const wrapper = mount(WarrantyItemPage)
  await flushPromises()
  return wrapper
}

describe('warranty-item T2 create/edit page seam (RED)', () => {
  it('opens Add, reads active groups, and selects default_Y without inventing a default', async () => {
    const wrapper = await editablePage()
    await wrapper.get('[data-testid="warranty-item-new"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-testid="warranty-item-dialog"]').exists()).toBe(true)
    expect(apiGet).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_ReadList?skip=0&take=500&field=type_code&text=&active=Y')
    expect((wrapper.get('[data-testid="warranty-item-group"]').element as HTMLSelectElement).value).toBe('G01')
  })

  it('creates exact trimmed header, closes only on success, and reloads', async () => {
    const wrapper = await editablePage()
    await wrapper.get('[data-testid="warranty-item-new"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="warranty-item-code"]').setValue(' W002 ')
    await wrapper.get('[data-testid="warranty-item-name"]').setValue(' New warranty ')
    await wrapper.get('[data-testid="warranty-item-group"]').setValue('G02')
    await wrapper.get('[data-testid="warranty-item-save"]').trigger('click')
    await flushPromises()
    expect(apiPost).toHaveBeenCalledWith('CSM/Master/WarrantyItem_Create', {
      header: {
        war_code: 'W002', war_des: 'New warranty', type_code: 'G02',
        tot_date: 0, tot_month: 0, tot_year: 0, lifetime: 'N', itemcode: '', active: 'Y',
      },
    })
    expect(wrapper.find('[data-testid="warranty-item-dialog"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="warranty-item-save-message"]').attributes('role')).toBe('status')
    expect(wrapper.get('[data-testid="warranty-item-save-message"]').text()).toContain('saved successfully')
    expect(apiGet).toHaveBeenCalledTimes(3)
  })

  it('turns Lifetime on into zero duration and disables duration controls', async () => {
    const wrapper = await editablePage()
    await wrapper.get('[data-testid="warranty-item-new"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="warranty-item-lifetime"]').setValue(true)
    for (const field of ['days', 'months', 'years']) {
      const input = wrapper.get(`[data-testid="warranty-item-${field}"]`).element as HTMLInputElement
      expect(input.value).toBe('0')
      expect(input.disabled).toBe(true)
    }
  })

  it('fresh-reads Edit, locks code, displays passive IC metadata, and omits it from update', async () => {
    apiGet.mockImplementation(async (path: string) => {
      if (path.startsWith('CSM/Master/WarrantyItem_Read?')) return { ok: true, status: 200, data: { ...staleRow, war_des: 'Fresh name', ic_docno: 'IC-9', ic_itemno: 'IC-ITEM-9', vendor: 'Vendor' } }
      return { ok: true, status: 200, data: { data_rows: [staleRow], total: 1 } }
    })
    const wrapper = await editablePage()
    await wrapper.get('[data-testid="warranty-item-edit-W001"]').trigger('click')
    await flushPromises()
    expect(apiGet).toHaveBeenLastCalledWith('CSM/Master/WarrantyItem_Read?war_code=W001')
    expect((wrapper.get('[data-testid="warranty-item-code"]').element as HTMLInputElement).readOnly).toBe(true)
    expect(wrapper.get('[data-testid="warranty-item-reference-ic"]').text()).toContain('IC-9')
    await wrapper.get('[data-testid="warranty-item-save"]').trigger('click')
    await flushPromises()
    expect(apiPost.mock.calls[0][1].header).not.toHaveProperty('ic_docno')
    expect(apiPost.mock.calls[0][1].header).not.toHaveProperty('default_')
  })

  it('keeps the selected edit context and shows the server error when fresh read fails', async () => {
    apiGet.mockImplementation(async (path: string) => {
      if (path.startsWith('CSM/Master/WarrantyItem_Read?')) return { ok: false, error: { code: 'network', message: 'Read offline' } }
      if (path.startsWith('CSM/Master/WarrantyGroup_ReadList')) return { ok: true, status: 200, data: { data: groups, total: groups.length } }
      return { ok: true, status: 200, data: { data_rows: [staleRow], total: 1 } }
    })
    const wrapper = await editablePage()
    await wrapper.get('[data-testid="warranty-item-edit-W001"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid="warranty-item-dialog"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="warranty-item-table"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="warranty-item-read-error"]').text()).toContain('W001: Read offline')
    expect(wrapper.get('[data-testid="warranty-item-read-retry"]').exists()).toBe(true)
  })

  it('clears stale groups and reports a failed group load without inventing a selection', async () => {
    const wrapper = await editablePage()
    await wrapper.get('[data-testid="warranty-item-new"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-testid="warranty-item-group"]').findAll('option')).toHaveLength(3)
    apiGet.mockImplementation(async (path: string) => {
      if (path.startsWith('CSM/Master/WarrantyGroup_ReadList')) return { ok: false, error: { code: 'network', message: 'Groups offline' } }
      return { ok: true, status: 200, data: { data_rows: [staleRow], total: 1 } }
    })
    await wrapper.get('[data-testid="warranty-item-cancel"]').trigger('click')
    await wrapper.get('[data-testid="warranty-item-new"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-testid="warranty-item-group-error"]').text()).toContain('Groups offline')
    expect(wrapper.get('[data-testid="warranty-item-group"]').findAll('option')).toHaveLength(1)
    expect((wrapper.get('[data-testid="warranty-item-group"]').element as HTMLSelectElement).value).toBe('')
  })

  it('does not open or mutate from read-only access', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({ status: 'readonly' })
    const wrapper = await editablePage()
    expect(wrapper.get('[data-testid="warranty-item-new"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="warranty-item-edit-W001"]').attributes('disabled')).toBeDefined()
    const setup = pageSetup(wrapper)
    setup.openCreate()
    await setup.openEdit('W001')
    await setup.saveForm()
    expect(apiPost).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="warranty-item-dialog"]').exists()).toBe(false)
  })

  it('keeps dialog inputs and shows the server error when save fails', async () => {
    const wrapper = await editablePage()
    await wrapper.get('[data-testid="warranty-item-new"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="warranty-item-code"]').setValue('W002')
    await wrapper.get('[data-testid="warranty-item-name"]').setValue('Retry name')
    apiPost.mockResolvedValueOnce({ ok: false, error: { code: 'api', message: 'Duplicate code' } })
    await wrapper.get('[data-testid="warranty-item-save"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-testid="warranty-item-dialog"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="warranty-item-save-error"]').text()).toContain('Duplicate code')
    expect((wrapper.get('[data-testid="warranty-item-name"]').element as HTMLInputElement).value).toBe('Retry name')
  })

  it('reports field-level validation without sending a request', async () => {
    const wrapper = await editablePage()
    await wrapper.get('[data-testid="warranty-item-new"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="warranty-item-save"]').trigger('click')
    expect(apiPost).not.toHaveBeenCalled()
    expect(wrapper.get('[data-testid="warranty-item-code"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[data-testid="warranty-item-code"]').attributes('aria-describedby')).toBe('warranty-item-form-error')
    expect(wrapper.get('[data-testid="warranty-item-form-error"]').attributes('role')).toBe('alert')
  })

  it('guards duplicate saves and disables dialog controls while pending', async () => {
    const wrapper = await editablePage()
    await wrapper.get('[data-testid="warranty-item-new"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="warranty-item-code"]').setValue('W003')
    await wrapper.get('[data-testid="warranty-item-name"]').setValue('Pending warranty')
    let resolveSave!: (value: unknown) => void
    apiPost.mockImplementationOnce(() => new Promise(resolve => { resolveSave = resolve }))
    const save = wrapper.get('[data-testid="warranty-item-save"]')
    await save.trigger('click')
    await save.trigger('click')
    expect(apiPost).toHaveBeenCalledTimes(1)
    expect(save.attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="warranty-item-cancel"]').attributes('disabled')).toBeDefined()
    resolveSave({ ok: true, status: 200, data: {} })
    await flushPromises()
  })

  it('uses native modal semantics while keeping only deferred export disabled', async () => {
    const wrapper = await editablePage()
    expect(wrapper.get('[data-testid="warranty-item-import"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('[data-testid="warranty-item-export"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="warranty-item-delete-W001"]').attributes('disabled')).toBeUndefined()
    await wrapper.get('[data-testid="warranty-item-new"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-testid="warranty-item-dialog"]').element.tagName).toBe('DIALOG')
    expect(wrapper.get('[data-testid="warranty-item-dialog"]').attributes('aria-labelledby')).toBeTruthy()
  })
})
