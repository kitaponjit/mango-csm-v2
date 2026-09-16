import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WarrantyGroupPage from '../../app/pages/master/warranty-group/index.vue'
import { MAS001_TEXTS } from '../../app/features/warranty-group/warranty-group-texts'

const apiGet = vi.fn()
const apiPost = vi.fn()
const redirectToLogin = vi.fn()
const getContext = vi.fn()
const checkMenuAccess = vi.fn()

type WarrantyGroupSetup = {
  rows: { type_code: string, type_name: string, active: string }[]
  total: number
  currentPage: number
  searchField: string
  searchText: string
  activeOnly: boolean
  listStatus: string
  listError: string
  initializePage(): Promise<void>
  loadList(generation?: number): Promise<void>
  doSearch(): void
  goPage(page: number): void
  openCreate(): void
  openEdit(code: string): Promise<void>
  closeDialog(): void
  saveForm(): Promise<void>
}

function pageSetup(wrapper: ReturnType<typeof mount>) {
  return (wrapper.vm as unknown as { $: { setupState: WarrantyGroupSetup } }).$.setupState
}

function makeRows(start: number, count: number) {
  return Array.from({ length: count }, (_, index) => ({
    type_code: `G${String(start + index).padStart(4, '0')}`,
    type_name: `Group ${start + index}`,
    default_: 'N',
    active: 'Y',
  }))
}

function mockPagedDataset(totalRows: number) {
  const dataset = makeRows(1, totalRows)
  apiGet.mockImplementation(async (path: string) => {
    const query = String(path.split('?')[1] ?? '')
    const params = new URLSearchParams(query)
    const skip = Number(params.get('skip')) || 0
    const take = Number(params.get('take')) || 500
    return { ok: true, status: 200, data: { data: dataset.slice(skip, skip + take), total: totalRows } }
  })
}

const translations: Record<string, string> = {
  'mas001.title': 'Warranty Group list',
  'mas001.description': 'Configure warranty work groups.',
  'mas001.count': 'Total records',
  'mas001.number': 'No.',
  'mas001.codeColumn': 'Group Code',
  'mas001.nameColumn': 'Group Name',
  'mas001.activeColumn': 'Active',
  'mas001.yes': 'Yes',
  'mas001.no': 'No',
  'mas001.searchBy': 'Search By',
  'mas001.searchFieldCode': 'Group Code',
  'mas001.searchFieldName': 'Group Name',
  'mas001.search': 'Search',
  'mas001.activeFilter': 'Active',
  'mas001.first': 'First',
  'mas001.prev': 'Prev',
  'mas001.next': 'Next',
  'mas001.last': 'Last',
  'mas001.add': 'Add group',
  'mas001.edit': 'Edit',
  'mas001.delete': 'Delete',
  'mas001.defaultColumn': 'Default',
  'mas001.deleteConfirm': 'Do you want to delete this group code',
  'mas001.deleteSuccess': 'Group deleted successfully.',
  'mas001.addTitle': 'Add Group Code',
  'mas001.editTitle': 'Edit Group Code',
  'mas001.save': 'Save',
  'mas001.saving': 'Saving…',
  'mas001.cancel': 'Cancel',
  'mas001.codeInvalid': 'Group Code must be 1-20 characters: A-Z, 0-9, dash, underscore.',
  'mas001.nameInvalid': 'Group Name is required (max 200 characters).',
  'mas001.activeInvalid': 'Active must be Y or N.',
  'mas001.saveSuccess': 'Your information has been saved successfully.',
  'mas001.authChecking': 'Checking your session',
  'mas001.authRequired': 'Sign-in required',
  'mas001.authUnavailable': 'The sign-in page is currently unavailable.',
  'mas001.accessDeniedTitle': 'Access denied',
  'mas001.accessDeniedMessage': 'You do not have access to Warranty Groups.',
  'mas001.accessErrorTitle': 'Unable to check Warranty Group access',
  'mas001.accessRetry': 'Check access again',
  'mas001.readOnly': 'Read only',
  'mas001.loading': 'Loading Warranty Groups',
  'mas001.empty': 'No Warranty Groups found',
  'mas001.error': 'Unable to load Warranty Groups',
  'mas001.invalidResponse': 'The server returned an invalid Warranty Group list.',
  'mas001.retry': 'Try again',
}

beforeEach(() => {
  apiGet.mockReset()
  apiGet.mockResolvedValue({ ok: true, status: 200, data: { data: [], total: 0 } })
  apiPost.mockReset()
  apiPost.mockResolvedValue({ ok: true, status: 200, data: 'G01' })
  redirectToLogin.mockReset()
  getContext.mockReset()
  checkMenuAccess.mockReset()
  checkMenuAccess.mockResolvedValue({ status: 'editable' })

  vi.stubGlobal('useApiClient', () => ({ get: apiGet, post: apiPost }))
  vi.stubGlobal('useLocalizationAdapter', () => ({
    language: 'en',
    t: (key: string) => translations[key] ?? key,
  }))
  vi.stubGlobal('useSessionAdapter', () => ({ getContext, redirectToLogin }))
  vi.stubGlobal('useAccessControlService', () => ({ checkMenuAccess }))
  vi.stubGlobal('useHead', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('warranty-group slice dictionary', () => {
  it('defines the same mas001 keys in Thai and English with no empty text', () => {
    expect(Object.keys(MAS001_TEXTS.th).sort()).toEqual(Object.keys(MAS001_TEXTS.en).sort())
    for (const key of Object.keys(MAS001_TEXTS.en)) {
      expect(MAS001_TEXTS.en[key]).not.toBe('')
      expect(MAS001_TEXTS.th[key]).not.toBe('')
    }
  })
})

describe('warranty-group page access gate', () => {
  it('checks the Warranty Group menu right before reading the list', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })

    mount(WarrantyGroupPage)
    await flushPromises()

    expect(checkMenuAccess).toHaveBeenCalledWith('CSM_WEB', '20810')
    expect(checkMenuAccess.mock.invocationCallOrder[0]).toBeLessThan(apiGet.mock.invocationCallOrder[0]!)
    expect(apiGet).toHaveBeenCalledWith(
      'CSM/Master/WarrantyGroup_ReadList?skip=0&take=500&field=type_code&text=&active=Y',
    )
  })

  it('sends anonymous visitors to login without checking menu rights or reading data', async () => {
    getContext.mockReturnValue({ isAuthenticated: false })

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Sign-in required')
    expect(redirectToLogin).toHaveBeenCalledOnce()
    expect(checkMenuAccess).not.toHaveBeenCalled()
    expect(apiGet).not.toHaveBeenCalled()
  })

  it.each(['anonymous', 'denied'] as const)(
    'does not read data when access resolves to %s',
    async status => {
      getContext.mockReturnValue({ isAuthenticated: true })
      checkMenuAccess.mockResolvedValue({ status })

      const wrapper = mount(WarrantyGroupPage)
      await flushPromises()

      expect(apiGet).not.toHaveBeenCalled()
      expect(wrapper.find('[data-testid="wgroup-table"]').exists()).toBe(false)
      expect(redirectToLogin).toHaveBeenCalledTimes(status === 'anonymous' ? 1 : 0)
      expect(wrapper.text()).toContain(status === 'anonymous' ? 'Sign-in required' : 'Access denied')
    },
  )

  it('keeps access errors separate with retry and does not read data', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValueOnce({
      status: 'error',
      error: { code: 'network', message: 'Offline' },
    })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: { data: [], total: 0 } })

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()

    expect(wrapper.get('[data-testid="wgroup-access-error"]').text()).toContain('Offline')
    expect(apiGet).not.toHaveBeenCalled()

    await wrapper.get('[data-testid="wgroup-access-retry"]').trigger('click')
    await flushPromises()

    expect(checkMenuAccess).toHaveBeenCalledTimes(2)
    expect(apiGet).toHaveBeenCalledTimes(1)
  })

  it('stays in checking state and blocks reads until access resolves', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockReturnValue(new Promise(() => {}))

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()
    await pageSetup(wrapper).loadList()

    expect(wrapper.text()).toContain('Checking your session')
    expect(wrapper.find('.target-panel').exists()).toBe(false)
    expect(apiGet).not.toHaveBeenCalled()
  })

  it('ignores an older access decision after a newer denied decision', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    let resolveAccess!: (result: unknown) => void
    checkMenuAccess
      .mockReturnValueOnce(new Promise(resolve => { resolveAccess = resolve }))
      .mockResolvedValueOnce({ status: 'denied' })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: { data: [], total: 0 } })

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()
    await pageSetup(wrapper).initializePage()

    resolveAccess({ status: 'editable' })
    await flushPromises()

    expect(wrapper.text()).toContain('Access denied')
    expect(wrapper.find('.target-panel').exists()).toBe(false)
    expect(apiGet).not.toHaveBeenCalled()
  })

  it('does not restore stale list data after a newer denied decision', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValueOnce({ status: 'editable' }).mockResolvedValueOnce({ status: 'denied' })
    let resolveRead!: (value: unknown) => void
    apiGet.mockReturnValue(new Promise(resolve => { resolveRead = resolve }))

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()
    void pageSetup(wrapper).initializePage()
    await flushPromises()

    resolveRead({ ok: true, status: 200, data: { data: makeRows(1, 1), total: 1 } })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Group 1')
    expect(wrapper.find('[data-testid="wgroup-table"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Access denied')
  })

  it('shows the read-only badge and disables the mutation entry point', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({ status: 'readonly' })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: { data: makeRows(1, 2), total: 2 } })

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()
    const setup = pageSetup(wrapper)

    expect(wrapper.text()).toContain('Read only')
    expect(wrapper.find('[data-testid="wgroup-table"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="wgroup-add"]').attributes('disabled')).toBeDefined()
    setup.openCreate()
    await flushPromises()
    expect(apiGet).toHaveBeenCalledTimes(1)
    expect(apiPost).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="wgroup-dialog"]').exists()).toBe(false)
  })

  it('enables the mutation entry point only once editable data is ready', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    let resolveRead!: (value: unknown) => void
    apiGet.mockReturnValueOnce(new Promise(resolve => { resolveRead = resolve }))

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()
    expect(wrapper.get('[data-testid="wgroup-add"]').attributes('disabled')).toBeDefined()

    resolveRead({ ok: true, status: 200, data: { data: makeRows(1, 1), total: 1 } })
    await flushPromises()
    expect(wrapper.get('[data-testid="wgroup-add"]').attributes('disabled')).toBeUndefined()
  })
})

describe('warranty-group page list, search, and pager', () => {
  it('auto-loads the first server page and renders rows in fixed server order', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({
      ok: true,
      status: 200,
      data: { data: [makeRows(2, 1)[0], makeRows(1, 1)[0]], total: 2 },
    })

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()

    const cells = wrapper.findAll('[data-testid="wgroup-table"] tbody tr td:nth-child(2)').map(cell => cell.text())
    expect(cells).toEqual(['G0002', 'G0001'])
    expect(wrapper.text()).toContain('Total records: 2')
  })

  it('numbers rows from the server skip offset', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    mockPagedDataset(1200)

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()
    const firstCell = () => wrapper.find('[data-testid="wgroup-table"] tbody tr td').text()

    expect(firstCell()).toBe('1')
    await wrapper.get('[data-testid="wgroup-next"]').trigger('click')
    await flushPromises()
    expect(firstCell()).toBe('501')
    expect(apiGet).toHaveBeenLastCalledWith(
      'CSM/Master/WarrantyGroup_ReadList?skip=500&take=500&field=type_code&text=&active=Y',
    )
  })

  it('pages First/Prev/numbered/Next/Last with a partial last page', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    mockPagedDataset(1200)

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()

    expect(wrapper.findAll('[data-testid="wgroup-table"] tbody tr')).toHaveLength(500)
    await wrapper.get('[data-testid="wgroup-last"]').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('[data-testid="wgroup-table"] tbody tr')).toHaveLength(200)
    expect(wrapper.find('[data-testid="wgroup-table"] tbody tr td').text()).toBe('1001')
    expect(wrapper.get('[data-testid="wgroup-next"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="wgroup-last"]').attributes('disabled')).toBeDefined()

    await wrapper.get('[data-testid="wgroup-first"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid="wgroup-table"] tbody tr td').text()).toBe('1')
    expect(wrapper.get('[data-testid="wgroup-prev"]').attributes('disabled')).toBeDefined()

    await wrapper.get('[data-testid="wgroup-page-2"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid="wgroup-table"] tbody tr td').text()).toBe('501')
  })

  it('hides the pager and reports zero total on empty results', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: { data: [], total: 0 } })

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()

    expect(wrapper.find('.target-state--empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('Total records: 0')
    expect(wrapper.find('[data-testid="wgroup-pager"]').exists()).toBe(false)
  })

  it('shows loading state and disables paging while the server responds', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockReturnValue(new Promise(() => {}))

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Loading Warranty Groups')
    expect(wrapper.get('[data-testid="wgroup-add"]').attributes('disabled')).toBeDefined()
  })

  it('resets to page 1 and sends field/text/active on search', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    mockPagedDataset(1200)

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()
    await wrapper.get('[data-testid="wgroup-next"]').trigger('click')
    await flushPromises()
    expect(pageSetup(wrapper).currentPage).toBe(2)

    await wrapper.get('[data-testid="wgroup-field"]').setValue('type_name')
    await wrapper.get('[data-testid="wgroup-text"]').setValue('pump')
    await wrapper.get('[data-testid="wgroup-search"]').trigger('click')
    await flushPromises()

    expect(pageSetup(wrapper).currentPage).toBe(1)
    expect(apiGet).toHaveBeenLastCalledWith(
      'CSM/Master/WarrantyGroup_ReadList?skip=0&take=500&field=type_name&text=pump&active=Y',
    )
  })

  it('sends active=N for an unchecked switch, which the server treats as unfiltered (legacy quirk, reproduced)', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    mockPagedDataset(10)

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()

    await wrapper.get('[data-testid="wgroup-active"]').setValue(false)
    await nextTick()
    await wrapper.get('[data-testid="wgroup-search"]').trigger('click')
    await flushPromises()

    expect(apiGet).toHaveBeenLastCalledWith(
      'CSM/Master/WarrantyGroup_ReadList?skip=0&take=500&field=type_code&text=&active=N',
    )
    expect(wrapper.find('[data-testid="wgroup-table"]').exists()).toBe(true)
  })

  it('shows list errors with retry that preserves the search input', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValueOnce({ ok: false, error: { code: 'network', message: 'Offline' } })

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()
    await wrapper.get('[data-testid="wgroup-text"]').setValue('ABC')
    await wrapper.get('[data-testid="wgroup-retry"]').trigger('click')
    await flushPromises()

    expect(apiGet).toHaveBeenCalledTimes(2)
    expect(checkMenuAccess).toHaveBeenCalledTimes(1)
    expect(apiGet).toHaveBeenLastCalledWith(
      'CSM/Master/WarrantyGroup_ReadList?skip=0&take=500&field=type_code&text=ABC&active=Y',
    )
    expect((wrapper.get('[data-testid="wgroup-text"]').element as HTMLInputElement).value).toBe('ABC')
  })

  it('treats a malformed paged payload as an invalid response and blocks mutation', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: {} })

    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()

    expect(wrapper.text()).toContain('The server returned an invalid Warranty Group list.')
    expect(wrapper.get('[data-testid="wgroup-retry"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="wgroup-add"]').attributes('disabled')).toBeDefined()
  })
})

describe('warranty-group create/edit dialog', () => {
  const listRows = [
    { type_code: 'G0001', type_name: 'Stale grid name', default_: 'N', active: 'Y' },
    { type_code: 'G0002', type_name: 'Group 2', default_: 'N', active: 'N' },
  ]
  const freshRow = { type_code: 'G0001', type_name: 'Fresh server name', default_: 'Y', active: 'N' }

  function mockListAndReadOne(readRow: unknown = freshRow) {
    apiGet.mockImplementation(async (path: string) => {
      if (String(path).startsWith('CSM/Master/WarrantyGroup_Read?')) {
        return { ok: true, status: 200, data: readRow }
      }
      return { ok: true, status: 200, data: { data: listRows, total: listRows.length } }
    })
  }

  async function editablePage() {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({ status: 'editable' })
    mockListAndReadOne()
    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()
    return wrapper
  }

  function codeInput(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('[data-testid="wgroup-code"]').element as HTMLInputElement
  }

  function nameInput(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('[data-testid="wgroup-name"]').element as HTMLInputElement
  }

  it('opens a blank Add dialog with Active defaulting to on', async () => {
    const wrapper = await editablePage()

    await wrapper.get('[data-testid="wgroup-add"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="wgroup-dialog"]').text()).toContain('Add Group Code')
    expect(codeInput(wrapper).value).toBe('')
    expect(codeInput(wrapper).readOnly).toBe(false)
    expect(nameInput(wrapper).value).toBe('')
    expect((wrapper.get('[data-testid="wgroup-dialog-active"]').element as HTMLInputElement).checked).toBe(true)
  })

  it('creates a valid group with the header shape, reloads the list, and shows a success notice', async () => {
    const wrapper = await editablePage()

    await wrapper.get('[data-testid="wgroup-add"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="wgroup-code"]').setValue('G09')
    await wrapper.get('[data-testid="wgroup-name"]').setValue('New group')
    await wrapper.get('[data-testid="wgroup-save"]').trigger('click')
    await flushPromises()

    expect(apiPost).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_Create', {
      header: { type_code: 'G09', type_name: 'New group', active: 'Y' },
    })
    expect(apiGet).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[data-testid="wgroup-dialog"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="wgroup-save-message"]').text())
      .toContain('Your information has been saved successfully.')
  })

  it('blocks create on an invalid code with an inline error and no request', async () => {
    const wrapper = await editablePage()

    await wrapper.get('[data-testid="wgroup-add"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="wgroup-code"]').setValue('A/B')
    await wrapper.get('[data-testid="wgroup-name"]').setValue('New group')
    await wrapper.get('[data-testid="wgroup-save"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="wgroup-form-error"]').exists()).toBe(true)
    expect(apiPost).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="wgroup-dialog"]').exists()).toBe(true)
  })

  it('blocks create on a blank name with no request', async () => {
    const wrapper = await editablePage()

    await wrapper.get('[data-testid="wgroup-add"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="wgroup-code"]').setValue('G09')
    await wrapper.get('[data-testid="wgroup-name"]').setValue('   ')
    await wrapper.get('[data-testid="wgroup-save"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="wgroup-form-error"]').exists()).toBe(true)
    expect(apiPost).not.toHaveBeenCalled()
  })

  it('keeps dialog input and surfaces the server message when save fails', async () => {
    apiPost.mockResolvedValueOnce({ ok: false, error: { code: 'api', message: 'Warning : duplicate data.' } })
    const wrapper = await editablePage()

    await wrapper.get('[data-testid="wgroup-add"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="wgroup-code"]').setValue('G09')
    await wrapper.get('[data-testid="wgroup-name"]').setValue('New group')
    await wrapper.get('[data-testid="wgroup-save"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="wgroup-dialog"]').exists()).toBe(true)
    expect(codeInput(wrapper).value).toBe('G09')
    expect(nameInput(wrapper).value).toBe('New group')
    expect(wrapper.get('[data-testid="wgroup-save-error"]').text()).toContain('Warning : duplicate data.')
    expect(apiGet).toHaveBeenCalledTimes(1)
  })

  it('prefills edit from a fresh read, locks Code, and updates mutable fields only', async () => {
    const wrapper = await editablePage()

    await wrapper.get('[data-testid="wgroup-edit-G0001"]').trigger('click')
    await flushPromises()

    expect(apiGet).toHaveBeenLastCalledWith('CSM/Master/WarrantyGroup_Read?type_code=G0001')
    expect(wrapper.get('[data-testid="wgroup-dialog"]').text()).toContain('Edit Group Code')
    expect(codeInput(wrapper).value).toBe('G0001')
    expect(codeInput(wrapper).readOnly).toBe(true)
    expect(nameInput(wrapper).value).toBe('Fresh server name')
    expect((wrapper.get('[data-testid="wgroup-dialog-active"]').element as HTMLInputElement).checked).toBe(false)

    await wrapper.get('[data-testid="wgroup-name"]').setValue('Fresh server name x')
    await wrapper.get('[data-testid="wgroup-save"]').trigger('click')
    await flushPromises()

    expect(apiPost).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_Update', {
      header: { type_code: 'G0001', type_name: 'Fresh server name x', active: 'N' },
    })
    expect(Object.keys(apiPost.mock.calls[0][1].header).sort()).toEqual(['active', 'type_code', 'type_name'])
    expect(apiGet).toHaveBeenCalledTimes(3)
    expect(wrapper.find('[data-testid="wgroup-dialog"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="wgroup-save-message"]').exists()).toBe(true)
  })

  it('keeps the edit dialog closed and shows the server message when the fresh read fails', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({ status: 'editable' })
    apiGet.mockImplementation(async (path: string) => {
      if (String(path).startsWith('CSM/Master/WarrantyGroup_Read?')) {
        return { ok: false, error: { code: 'network', message: 'Offline' } }
      }
      return { ok: true, status: 200, data: { data: listRows, total: listRows.length } }
    })
    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()

    await wrapper.get('[data-testid="wgroup-edit-G0001"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="wgroup-dialog"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Offline')
    expect(apiPost).not.toHaveBeenCalled()
  })

  it('blocks edit save on invalid input with no request', async () => {
    const wrapper = await editablePage()

    await wrapper.get('[data-testid="wgroup-edit-G0001"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="wgroup-name"]').setValue('')
    await wrapper.get('[data-testid="wgroup-save"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="wgroup-form-error"]').exists()).toBe(true)
    expect(apiPost).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="wgroup-dialog"]').exists()).toBe(true)
  })

  it('prevents read-only users from reaching or triggering either dialog handler', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({ status: 'readonly' })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: { data: listRows, total: listRows.length } })
    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()
    const setup = pageSetup(wrapper)

    expect(wrapper.get('[data-testid="wgroup-add"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="wgroup-edit-G0001"]').attributes('disabled')).toBeDefined()
    setup.openCreate()
    await setup.openEdit('G0001')
    await setup.saveForm()
    await flushPromises()

    expect(apiPost).not.toHaveBeenCalled()
    expect(apiGet).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-testid="wgroup-dialog"]').exists()).toBe(false)
  })
})

describe('warranty-group delete and default toggle', () => {
  const toggleRows = [
    { type_code: 'G0001', type_name: 'Group 1', default_: 'Y', active: 'Y' },
    { type_code: 'G0002', type_name: 'Group 2', default_: 'N', active: 'Y' },
    { type_code: 'G0003', type_name: 'Group 3', default_: 'N', active: 'N' },
  ]

  function mockToggleList(dataset = toggleRows) {
    apiGet.mockResolvedValue({ ok: true, status: 200, data: { data: dataset, total: dataset.length } })
  }

  async function editableTogglePage(dataset = toggleRows) {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({ status: 'editable' })
    mockToggleList(dataset)
    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()
    return wrapper
  }

  function stubConfirm(result: boolean) {
    const confirmSpy = vi.fn().mockReturnValue(result)
    vi.stubGlobal('confirm', confirmSpy)
    return confirmSpy
  }

  it('renders the single default marker honestly (one highlighted, others plain)', async () => {
    const wrapper = await editableTogglePage()

    expect(wrapper.get('[data-testid="wgroup-default-G0001"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="wgroup-default-G0002"]').attributes('aria-pressed')).toBe('false')
    expect(wrapper.get('[data-testid="wgroup-default-G0003"]').attributes('aria-pressed')).toBe('false')
  })

  it('renders zero or multiple markers honestly without repairing', async () => {
    const noneDefault = toggleRows.map(row => ({ ...row, default_: 'N' }))
    const empty = await editableTogglePage(noneDefault)
    const pressedEmpty = empty.findAll('[data-testid^="wgroup-default-"]').filter(node => node.attributes('aria-pressed') === 'true')
    expect(pressedEmpty).toHaveLength(0)

    const twoDefaults = toggleRows.map(row => ({ ...row, default_: 'Y' }))
    const doubled = await editableTogglePage(twoDefaults.slice(0, 2))
    const pressedDoubled = doubled.findAll('[data-testid^="wgroup-default-"]').filter(node => node.attributes('aria-pressed') === 'true')
    expect(pressedDoubled).toHaveLength(2)
  })

  it('deletes after a code-naming confirmation, reloads, and shows a success notice', async () => {
    const confirmSpy = stubConfirm(true)
    const wrapper = await editableTogglePage()

    await wrapper.get('[data-testid="wgroup-delete-G0002"]').trigger('click')
    await flushPromises()

    expect(confirmSpy).toHaveBeenCalledOnce()
    expect(String(confirmSpy.mock.calls[0][0])).toContain('G0002')
    expect(apiPost).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_Delete', {
      header: { type_code: 'G0002', type_name: 'Group 2', default_: 'N', active: 'Y' },
    })
    expect(apiGet).toHaveBeenCalledTimes(2)
    expect(wrapper.get('[data-testid="wgroup-save-message"]').text()).toContain('Group deleted successfully.')
  })

  it('keeps the row and shows the server message on a blocked (in-use) delete, then reloads safely', async () => {
    stubConfirm(true)
    apiPost.mockResolvedValueOnce({ ok: false, error: { code: 'api', message: 'Warning : this group is in use.' } })
    const wrapper = await editableTogglePage()

    await wrapper.get('[data-testid="wgroup-delete-G0001"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Warning : this group is in use.')
    expect(wrapper.find('[data-testid="wgroup-delete-G0001"]').exists()).toBe(true)
    expect(apiGet).toHaveBeenCalledTimes(2)
  })

  it('sends no request when the delete confirm is cancelled', async () => {
    stubConfirm(false)
    const wrapper = await editableTogglePage()

    await wrapper.get('[data-testid="wgroup-delete-G0002"]').trigger('click')
    await flushPromises()

    expect(apiPost).not.toHaveBeenCalled()
    expect(apiGet).toHaveBeenCalledTimes(1)
  })

  it('lets default rows be deleted (no invented delete-block on defaults)', async () => {
    stubConfirm(true)
    const wrapper = await editableTogglePage()

    await wrapper.get('[data-testid="wgroup-delete-G0001"]').trigger('click')
    await flushPromises()

    expect(apiPost).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_Delete', {
      header: { type_code: 'G0001', type_name: 'Group 1', default_: 'Y', active: 'Y' },
    })
    expect(apiGet).toHaveBeenCalledTimes(2)
  })

  it('toggles an N marker to Y, posting default_ explicitly, then reloads', async () => {
    const wrapper = await editableTogglePage()

    await wrapper.get('[data-testid="wgroup-default-G0002"]').trigger('click')
    await flushPromises()

    expect(apiPost).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_UpdateD', {
      header: { type_code: 'G0002', type_name: 'Group 2', default_: 'Y', active: 'Y' },
    })
    expect(Object.keys(apiPost.mock.calls[0][1].header)).toContain('default_')
    expect(apiPost.mock.calls[0][1].header.default_).toBe('Y')
    expect(apiGet).toHaveBeenCalledTimes(2)
  })

  it('toggles the current default off (Y to N, possibly leaving zero defaults), then reloads', async () => {
    const wrapper = await editableTogglePage()

    await wrapper.get('[data-testid="wgroup-default-G0001"]').trigger('click')
    await flushPromises()

    expect(apiPost).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_UpdateD', {
      header: { type_code: 'G0001', type_name: 'Group 1', default_: 'N', active: 'Y' },
    })
    expect(apiGet).toHaveBeenCalledTimes(2)
  })

  it('refuses toggles on inactive rows with no request and no reload', async () => {
    const wrapper = await editableTogglePage()

    await wrapper.get('[data-testid="wgroup-default-G0003"]').trigger('click')
    await flushPromises()

    expect(apiPost).not.toHaveBeenCalled()
    expect(apiGet).toHaveBeenCalledTimes(1)
  })

  it('disables delete and default controls for read-only users and runs no mutation', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({ status: 'readonly' })
    mockToggleList()
    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()

    expect(wrapper.get('[data-testid="wgroup-delete-G0001"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="wgroup-default-G0001"]').attributes('disabled')).toBeDefined()
    await wrapper.get('[data-testid="wgroup-delete-G0001"]').trigger('click')
    await wrapper.get('[data-testid="wgroup-default-G0002"]').trigger('click')
    await flushPromises()

    expect(apiPost).not.toHaveBeenCalled()
    expect(apiGet).toHaveBeenCalledTimes(1)
  })
})
