import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WarrantyItemPage from '../../app/pages/master/warranty-item/index.vue'

const apiGet = vi.fn()
const apiPost = vi.fn()
const redirectToLogin = vi.fn()
const getContext = vi.fn()
const checkMenuAccess = vi.fn()

type WarrantyItemSetup = {
  currentPage: number
  initializePage(): Promise<void>
  openCreate(): void
  openEdit(code: string): Promise<void>
  saveForm(): Promise<void>
}

function pageSetup(wrapper: ReturnType<typeof mount>) {
  return (wrapper.vm as unknown as { $: { setupState: WarrantyItemSetup } }).$.setupState
}

function makeRows(start: number, count: number) {
  return Array.from({ length: count }, (_, index) => ({
    war_code: `W${String(start + index).padStart(4, '0')}`,
    war_des: `Warranty ${start + index}`,
    type_code: 'G01',
    type_name: 'Structural',
    tot_date: 0,
    tot_month: 12,
    tot_year: 0,
    active: 'Y',
  }))
}

function mockPagedDataset(total: number) {
  const rows = makeRows(1, total)
  apiGet.mockImplementation(async (path: string) => {
    const params = new URLSearchParams(String(path).split('?')[1] ?? '')
    const skip = Number(params.get('skip')) || 0
    const take = Number(params.get('take')) || 500
    return { ok: true, status: 200, data: { data_rows: rows.slice(skip, skip + take), total } }
  })
}

beforeEach(() => {
  apiGet.mockReset()
  apiGet.mockResolvedValue({ ok: true, status: 200, data: { data_rows: [], total: 0 } })
  apiPost.mockReset()
  getContext.mockReset()
  redirectToLogin.mockReset()
  checkMenuAccess.mockReset()
  checkMenuAccess.mockResolvedValue({ status: 'editable' })

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

describe('warranty-item T1 page seam', () => {
  it('redirects an anonymous visitor before checking access or reading the catalog', async () => {
    getContext.mockReturnValue({ isAuthenticated: false })

    mount(WarrantyItemPage)
    await flushPromises()

    expect(redirectToLogin).toHaveBeenCalledOnce()
    expect(checkMenuAccess).not.toHaveBeenCalled()
    expect(apiGet).not.toHaveBeenCalled()
  })

  it('renders denied access without reading or showing the catalog', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({ status: 'denied' })

    const wrapper = mount(WarrantyItemPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Access denied')
    expect(wrapper.find('[data-testid="warranty-item-table"]').exists()).toBe(false)
    expect(apiGet).not.toHaveBeenCalled()
  })

  it('checks CSM_WEB/20820 before loading the initial active Warranty Code page', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({
      ok: true,
      status: 200,
      data: { data_rows: makeRows(2, 1).concat(makeRows(1, 1)), total: 2 },
    })

    const wrapper = mount(WarrantyItemPage)
    await flushPromises()

    expect(checkMenuAccess).toHaveBeenCalledWith('CSM_WEB', '20820')
    expect(checkMenuAccess.mock.invocationCallOrder[0]).toBeLessThan(apiGet.mock.invocationCallOrder[0]!)
    expect(apiGet).toHaveBeenCalledWith(
      'CSM/Master/WarrantyItem_ReadList?skip=0&take=500&field=war_code&text=&active=Y',
    )
    expect(wrapper.findAll('[data-testid="warranty-item-table"] tbody tr td:nth-child(2)').map(cell => cell.text()))
      .toEqual(['W0002', 'W0001'])
  })

  it('renders a readable catalog but disables every deferred mutation/action entry point for read-only access', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({ status: 'readonly' })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: { data_rows: makeRows(1, 1), total: 1 } })

    const wrapper = mount(WarrantyItemPage)
    await flushPromises()

    expect(wrapper.find('[data-testid="warranty-item-table"]').exists()).toBe(true)
    for (const testId of ['new', 'edit-W0001', 'delete-W0001', 'import', 'export']) {
      expect(wrapper.get(`[data-testid="warranty-item-${testId}"]`).attributes('disabled')).toBeDefined()
    }
    await wrapper.get('[data-testid="warranty-item-new"]').trigger('click')
    await wrapper.get('[data-testid="warranty-item-delete-W0001"]').trigger('click')
    expect(apiPost).not.toHaveBeenCalled()
  })

  it('resets search to page one and sends unchecked Active as the legacy-unfiltered N value', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    mockPagedDataset(1_200)

    const wrapper = mount(WarrantyItemPage)
    await flushPromises()
    await wrapper.get('[data-testid="warranty-item-next"]').trigger('click')
    await flushPromises()
    expect(pageSetup(wrapper).currentPage).toBe(2)

    await wrapper.get('[data-testid="warranty-item-field"]').setValue('war_des')
    await wrapper.get('[data-testid="warranty-item-text"]').setValue('roof')
    await wrapper.get('[data-testid="warranty-item-active"]').setValue(false)
    await wrapper.get('[data-testid="warranty-item-search"]').trigger('click')
    await flushPromises()

    expect(pageSetup(wrapper).currentPage).toBe(1)
    expect(apiGet).toHaveBeenLastCalledWith(
      'CSM/Master/WarrantyItem_ReadList?skip=0&take=500&field=war_des&text=roof&active=N',
    )
  })

  it('renders available audit metadata in the catalog table', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        data_rows: [{
          ...makeRows(1, 1)[0],
          add_user: 'creator',
          add_dt: '2026-01-02',
          edit_user: 'editor',
          edit_dt: '2026-02-03',
        }],
        total: 1,
      },
    })

    const wrapper = mount(WarrantyItemPage)
    await flushPromises()

    expect(wrapper.text()).toContain('creator')
    expect(wrapper.text()).toContain('2026-01-02')
    expect(wrapper.text()).toContain('editor')
    expect(wrapper.text()).toContain('2026-02-03')
  })

  it('supports server pager boundaries and assigns row numbers from the returned skip', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    mockPagedDataset(1_200)

    const wrapper = mount(WarrantyItemPage)
    await flushPromises()
    await wrapper.get('[data-testid="warranty-item-last"]').trigger('click')
    await flushPromises()

    expect(wrapper.findAll('[data-testid="warranty-item-table"] tbody tr')).toHaveLength(200)
    expect(wrapper.find('[data-testid="warranty-item-table"] tbody tr td').text()).toBe('1001')
    expect(wrapper.get('[data-testid="warranty-item-next"]').attributes('disabled')).toBeDefined()
    await wrapper.get('[data-testid="warranty-item-first"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid="warranty-item-table"] tbody tr td').text()).toBe('1')
  })

  it('shows a retryable invalid-response state and preserves the entered search/filter inputs', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValueOnce({ ok: true, status: 200, data: { data: [], total: 0 } })

    const wrapper = mount(WarrantyItemPage)
    await flushPromises()
    await wrapper.get('[data-testid="warranty-item-text"]').setValue('W-01')
    await wrapper.get('[data-testid="warranty-item-active"]').setValue(false)
    await wrapper.get('[data-testid="warranty-item-retry"]').trigger('click')
    await flushPromises()

    expect(apiGet).toHaveBeenLastCalledWith(
      'CSM/Master/WarrantyItem_ReadList?skip=0&take=500&field=war_code&text=W-01&active=N',
    )
    expect((wrapper.get('[data-testid="warranty-item-text"]').element as HTMLInputElement).value).toBe('W-01')
    expect((wrapper.get('[data-testid="warranty-item-active"]').element as HTMLInputElement).checked).toBe(false)
  })

  it('does not restore a stale list after a newer access check denies the user', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValueOnce({ status: 'editable' }).mockResolvedValueOnce({ status: 'denied' })
    let resolveList!: (result: unknown) => void
    apiGet.mockReturnValue(new Promise(resolve => { resolveList = resolve }))

    const wrapper = mount(WarrantyItemPage)
    await flushPromises()
    void pageSetup(wrapper).initializePage()
    await flushPromises()
    resolveList({ ok: true, status: 200, data: { data_rows: makeRows(1, 1), total: 1 } })
    await flushPromises()

    expect(wrapper.find('[data-testid="warranty-item-table"]').exists()).toBe(false)
  })
})
