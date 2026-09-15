import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import QCItemPage from '../../app/pages/master/qc-item/index.vue'

const apiGet = vi.fn()
const apiPost = vi.fn()
const apiPostForm = vi.fn()
const apiOpenUrl = vi.fn()
const redirectToLogin = vi.fn()
const getContext = vi.fn()
const checkMenuAccess = vi.fn()

type QCItemSetup = {
  items: { itemno: number, itemname: string, remark: string }[]
  initializePage(): Promise<void>
  loadItems(generation?: number): Promise<void>
  addItem(): void
  deleteItem(item: { itemno: number, itemname: string, remark: string }): void
  saveItems(): Promise<void>
  openFilePicker(): void
  onFileChange(event: Event): void
  uploadFile(): Promise<void>
  exportFile(): Promise<void>
  selectedFile: File | null
  importDialogOpen: boolean
  importStatus: string
  importError: string
  importMessage: string
  saveStatus: string
  saveError: string
  saveMessage: string
  exportStatus: string
  exportError: string
}

function pageSetup(wrapper: ReturnType<typeof mount>) {
  return (wrapper.vm as unknown as { $: { setupState: QCItemSetup } }).$.setupState
}

async function readonlyPage() {
  getContext.mockReturnValue({ isAuthenticated: true })
  checkMenuAccess.mockResolvedValue({ status: 'readonly' })
  apiGet.mockResolvedValueOnce({ ok: true, status: 200, data: Array.from({ length: 11 }, (_, index) => ({
    itemno: index + 1, itemname: 'Description', remark: 'Remark',
  })) })
  const wrapper = mount(QCItemPage)
  await flushPromises()
  return wrapper
}

function selectFile(wrapper: ReturnType<typeof mount>, name = 'QCItem.xlsx') {
  const input = wrapper.get<HTMLInputElement>('[data-testid="qcitem-file-input"]').element
  Object.defineProperty(input, 'files', { configurable: true, value: [new File(['xlsx'], name)] })
  return input
}

const translations: Record<string, string> = {
  'qcItem.authChecking': 'Checking your session',
  'qcItem.authRequired': 'Sign-in required',
  'qcItem.authUnavailable': 'The sign-in page is currently unavailable.',
  'qcItem.accessDeniedTitle': 'Access denied',
  'qcItem.accessDeniedMessage': 'You do not have access to QC Items.',
  'qcItem.accessErrorTitle': 'Unable to check QC Item access',
  'qcItem.accessRetry': 'Check access again',
  'qcItem.readOnly': 'Read only',
  'qcItem.title': 'QC Item list',
  'qcItem.description': 'Configure evaluation question items.',
  'qcItem.number': 'No.',
  'qcItem.action': 'Action',
  'qcItem.actions': 'QCItem actions',
  'qcItem.descriptionColumn': 'Description',
  'qcItem.remark': 'Remark',
  'qcItem.addDate': 'Add date',
  'qcItem.add': 'Add item',
  'qcItem.save': 'Save',
  'qcItem.saving': 'Saving…',
  'qcItem.validation': 'Please complete all required fields.',
  'qcItem.descriptionRequired': 'Description is required.',
  'qcItem.remarkRequired': 'Remark is required.',
  'qcItem.export': 'Export Excel',
  'qcItem.exporting': 'Preparing export…',
  'qcItem.import': 'Import Excel',
  'qcItem.importTitle': 'Import QC Items',
  'qcItem.selectedFile': 'Selected file',
  'qcItem.chooseFile': 'Choose an .xlsx or .xls file',
  'qcItem.cancel': 'Cancel',
  'qcItem.upload': 'Upload',
  'qcItem.uploading': 'Uploading…',
  'qcItem.fileTypeError': 'Please choose an .xlsx or .xls file only.',
  'qcItem.empty': 'No QC Items found',
  'qcItem.error': 'Unable to load QC Items',
  'qcItem.invalidResponse': 'The server returned an invalid QC Item list.',
  'qcItem.retry': 'Try again',
  'qcItem.deleteItem': 'Delete item',
}

beforeEach(() => {
  apiGet.mockReset()
  apiGet.mockResolvedValue({ ok: true, status: 200, data: [] })
  apiPost.mockReset()
  apiPostForm.mockReset()
  apiOpenUrl.mockReset()
  redirectToLogin.mockReset()
  getContext.mockReset()
  checkMenuAccess.mockReset()
  checkMenuAccess.mockResolvedValue({ status: 'editable' })

  vi.stubGlobal('useApiClient', () => ({ get: apiGet, post: apiPost, postForm: apiPostForm }))
  vi.stubGlobal('useFileCapability', () => ({ openUrl: apiOpenUrl }))
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

describe('QCItem page access and read state', () => {
  it.each(['save', 'upload'] as const)('ignores old %s completion after a new access generation', async (action) => {
    for (const status of ['denied', 'readonly', 'editable'] as const) {
      for (const ok of [true, false]) {
        getContext.mockReturnValue({ isAuthenticated: true })
        checkMenuAccess.mockReset().mockResolvedValueOnce({ status: 'editable' }).mockResolvedValueOnce({ status })
        apiGet.mockReset().mockResolvedValue({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Current', remark: 'Current' }] })
        let resolveAction!: (value: unknown) => void
        const request = new Promise(resolve => { resolveAction = resolve })
        if (action === 'save') apiPost.mockReturnValueOnce(request)
        else apiPostForm.mockReturnValueOnce(request)
        const wrapper = mount(QCItemPage)
        await flushPromises()
        const setup = pageSetup(wrapper)
        if (action === 'upload') {
          const input = selectFile(wrapper)
          setup.onFileChange({ target: input } as unknown as Event)
        }
        const pending = action === 'save' ? setup.saveItems() : setup.uploadFile()
        await flushPromises()
        await setup.initializePage()
        expect(setup.saveStatus).toBe('idle')
        expect(setup.importStatus).toBe('idle')
        if (status === 'editable') {
          expect(wrapper.get('[data-testid="qcitem-add"]').attributes('disabled')).toBeUndefined()
        }
        apiGet.mockClear()
        resolveAction(ok
          ? { ok: true, status: 200, data: true }
          : { ok: false, error: { code: 'api', message: 'Stale failure' } })
        await pending
        await flushPromises()
        expect(apiGet).not.toHaveBeenCalled()
        expect(setup.saveStatus).toBe('idle')
        expect(setup.saveError).toBe('')
        expect(setup.saveMessage).toBe('')
        expect(setup.importStatus).toBe('idle')
        expect(setup.importError).toBe('')
        expect(setup.importMessage).toBe('')
        expect(setup.importDialogOpen).toBe(false)
        expect(setup.selectedFile).toBeNull()
        wrapper.unmount()
      }
    }
  })

  it.each(['save', 'upload'] as const)('ignores old %s status after its downstream reload is superseded', async (action) => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValueOnce({ status: 'editable' }).mockResolvedValueOnce({ status: 'denied' })
    apiGet.mockResolvedValueOnce({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Current', remark: 'Current' }] })
    let resolveRead!: (value: unknown) => void
    apiGet.mockReturnValueOnce(new Promise(resolve => { resolveRead = resolve }))
    apiPost.mockResolvedValue({ ok: true, status: 200, data: true })
    apiPostForm.mockResolvedValue({ ok: true, status: 200, data: true })
    const wrapper = mount(QCItemPage)
    await flushPromises()
    const setup = pageSetup(wrapper)
    if (action === 'upload') setup.onFileChange({ target: selectFile(wrapper) } as unknown as Event)
    const pending = action === 'save' ? setup.saveItems() : setup.uploadFile()
    await flushPromises()
    await setup.initializePage()
    resolveRead({ ok: true, status: 200, data: [{ itemno: 2, itemname: 'Stale', remark: 'Stale' }] })
    await pending
    expect(setup.saveStatus).toBe('idle')
    expect(setup.importStatus).toBe('idle')
    expect(setup.saveMessage).toBe('')
    expect(setup.importMessage).toBe('')
    expect(setup.items).toEqual([])
  })

  it('closes an old reserved export popup without navigating after access changes', async () => {
    for (const status of ['denied', 'readonly', 'editable'] as const) {
      for (const ok of [true, false]) {
        getContext.mockReturnValue({ isAuthenticated: true })
        checkMenuAccess.mockReset().mockResolvedValueOnce({ status: 'editable' }).mockResolvedValueOnce({ status })
        apiGet.mockReset().mockResolvedValueOnce({ ok: true, status: 200, data: [] })
        let resolveExport!: (value: unknown) => void
        apiGet.mockReturnValueOnce(new Promise(resolve => { resolveExport = resolve }))
        apiGet.mockResolvedValueOnce({ ok: true, status: 200, data: [] })
        apiOpenUrl.mockClear()
        const popup = { closed: false, location: { href: '' }, close: vi.fn() }
        const open = vi.fn().mockReturnValue(popup)
        vi.stubGlobal('open', open)
        const wrapper = mount(QCItemPage)
        await flushPromises()
        const setup = pageSetup(wrapper)
        const pending = setup.exportFile()
        await flushPromises()
        await setup.initializePage()
        expect(setup.exportStatus).toBe('idle')
        if (status !== 'denied') {
          expect(wrapper.get('[data-testid="qcitem-export"]').attributes('disabled')).toBeUndefined()
        }
        resolveExport(ok
          ? { ok: true, status: 200, data: 'stale-token' }
          : { ok: false, error: { code: 'api', message: 'Stale export failure' } })
        await pending
        expect(popup.close).toHaveBeenCalledOnce()
        expect(popup.location.href).toBe('')
        expect(apiOpenUrl).not.toHaveBeenCalled()
        expect(open).toHaveBeenCalledTimes(1)
        expect(setup.exportStatus).toBe('idle')
        expect(setup.exportError).toBe('')
        wrapper.unmount()
      }
    }
  })
  it('allows readonly reading, pagination and export while disabling mutation controls', async () => {
    const wrapper = await readonlyPage()
    for (const testId of ['description-1', 'remark-1', 'add', 'save', 'import', 'delete-1', 'file-input']) {
      expect(wrapper.get(`[data-testid="qcitem-${testId}"]`).attributes('disabled')).toBeDefined()
    }
    await wrapper.get('[data-testid="qcitem-page-2"]').trigger('click')
    expect(wrapper.find('[data-testid="qcitem-description-11"]').exists()).toBe(true)
    apiGet.mockResolvedValueOnce({ ok: true, status: 200, data: 'server-token' })
    vi.stubGlobal('open', vi.fn().mockReturnValue({ closed: false, location: { href: '' } }))
    await wrapper.get('[data-testid="qcitem-export"]').trigger('click')
    await flushPromises()
    expect(apiOpenUrl).toHaveBeenCalledWith('server-token', { download: true })
    pageSetup(wrapper).importDialogOpen = true
    pageSetup(wrapper).selectedFile = new File(['xlsx'], 'QCItem.xlsx')
    await nextTick()
    expect(wrapper.get('[data-testid="qcitem-upload"]').attributes('disabled')).toBeDefined()
  })

  it('blocks every readonly mutation handler independently of disabled controls', async () => {
    const wrapper = await readonlyPage()
    const setup = pageSetup(wrapper)
    const confirm = vi.fn().mockReturnValue(true)
    vi.stubGlobal('confirm', confirm)
    const input = selectFile(wrapper)
    const click = vi.spyOn(input, 'click')
    Object.defineProperty(input, 'value', { configurable: true, writable: true, value: 'QCItem.xlsx' })
    setup.addItem()
    setup.deleteItem({ itemno: 1, itemname: 'Description', remark: 'Remark' })
    await setup.saveItems()
    setup.openFilePicker()
    setup.selectedFile = new File(['xlsx'], 'Previous.xlsx')
    setup.onFileChange({ target: input } as unknown as Event)
    expect(input.value).toBe('')
    expect(setup.selectedFile).toBeNull()
    setup.selectedFile = new File(['xlsx'], 'Programmatic.xlsx')
    await setup.uploadFile()
    await nextTick()
    expect(apiPost).not.toHaveBeenCalled()
    expect(apiPostForm).not.toHaveBeenCalled()
    expect(confirm).not.toHaveBeenCalled()
    expect(click).not.toHaveBeenCalled()
    expect(setup.items).toHaveLength(11)
    expect(wrapper.find('[data-testid="qcitem-description-12"]').exists()).toBe(false)
  })

  it.each(['denied', 'checking', 'list-loading', 'list-error', 'export-loading'])(
    'guards export before popup reservation for %s state', async (state) => {
      getContext.mockReturnValue({ isAuthenticated: true })
      if (state === 'denied') checkMenuAccess.mockResolvedValue({ status: 'denied' })
      if (state === 'checking') checkMenuAccess.mockReturnValue(new Promise(() => {}))
      if (state === 'list-loading') apiGet.mockReturnValue(new Promise(() => {}))
      if (state === 'list-error') apiGet.mockResolvedValue({ ok: false, error: { code: 'network', message: 'Offline' } })
      const wrapper = mount(QCItemPage)
      await flushPromises()
      const setup = pageSetup(wrapper)
      if (state === 'export-loading') setup.exportStatus = 'loading'
      apiGet.mockClear()
      const open = vi.fn()
      vi.stubGlobal('open', open)
      void setup.exportFile()
      await flushPromises()
      expect(apiGet).not.toHaveBeenCalled()
      expect(open).not.toHaveBeenCalled()
    },
  )

  it('accepts .xls selection and uploads it through the backend-required file field', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiPostForm.mockResolvedValue({ ok: true, status: 200, data: true })
    const wrapper = mount(QCItemPage)
    await flushPromises()
    const input = selectFile(wrapper, 'QCItem.xls')
    pageSetup(wrapper).onFileChange({ target: input } as unknown as Event)
    await nextTick()
    expect(wrapper.text()).toContain('QCItem.xls')
    expect(wrapper.get('[data-testid="qcitem-upload"]').attributes('disabled')).toBeUndefined()
    await wrapper.get('[data-testid="qcitem-upload"]').trigger('click')
    await flushPromises()
    expect(apiPostForm).toHaveBeenCalledOnce()
    const form = apiPostForm.mock.calls[0][1] as FormData
    expect(form.get('file')).toMatchObject({ name: 'QCItem.xls' })
  })
  it.each(['anonymous', 'denied'] as const)(
    'does not read QCItem data when access resolves to %s',
    async status => {
      getContext.mockReturnValue({ isAuthenticated: true })
      checkMenuAccess.mockResolvedValue({ status })

      const wrapper = mount(QCItemPage)
      await flushPromises()

      expect(checkMenuAccess).toHaveBeenCalledWith('CSM_WEB', '21010')
      expect(apiGet).not.toHaveBeenCalled()
      expect(wrapper.find('[data-testid="qcitem-table"]').exists()).toBe(false)
      expect(redirectToLogin).toHaveBeenCalledTimes(status === 'anonymous' ? 1 : 0)
      expect(wrapper.text()).toContain(status === 'anonymous' ? 'Sign-in required' : 'Access denied')
    },
  )

  it('keeps access errors separate and does not read QCItem data', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({
      status: 'error',
      error: { code: 'invalid-response', message: 'Invalid access response' },
    })

    const wrapper = mount(QCItemPage)
    await flushPromises()

    expect(wrapper.get('[data-testid="qcitem-access-error"]').text()).toContain('Invalid access response')
    expect(wrapper.find('[data-testid="qcitem-retry"]').exists()).toBe(false)
    expect(apiGet).not.toHaveBeenCalled()
  })

  it('resolves editable access before starting ReadList', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: [] })

    mount(QCItemPage)
    await flushPromises()

    expect(checkMenuAccess.mock.invocationCallOrder[0]).toBeLessThan(apiGet.mock.invocationCallOrder[0]!)
  })

  it('keeps checking access before permitting any ReadList request', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(QCItemPage)
    await flushPromises()
    await pageSetup(wrapper).loadItems()

    expect(wrapper.text()).toContain('Checking your session')
    expect(wrapper.find('.target-panel').exists()).toBe(false)
    expect(apiGet).not.toHaveBeenCalled()
  })

  it('permits readonly reads and displays the localized badge', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({ status: 'readonly' })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Read item', remark: 'View' }] })
    const wrapper = mount(QCItemPage)
    await flushPromises()

    expect(apiGet).toHaveBeenCalledWith('CSM/Master/QCItem_ReadList')
    expect(wrapper.text()).toContain('Read only')
    expect(wrapper.find('[data-testid="qcitem-table"]').exists()).toBe(true)
  })

  it('rechecks access on access-error retry before reading data', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValueOnce({ status: 'error', error: { code: 'network', message: 'Offline' } })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: [] })
    const wrapper = mount(QCItemPage)
    await flushPromises()
    expect(apiGet).not.toHaveBeenCalled()

    await wrapper.get('[data-testid="qcitem-access-retry"]').trigger('click')
    await flushPromises()

    expect(checkMenuAccess).toHaveBeenCalledTimes(2)
    expect(apiGet).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-testid="qcitem-access-error"]').exists()).toBe(false)
  })

  it('ignores older access decisions after a newer denied decision', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    let resolveAccess!: (result: unknown) => void
    checkMenuAccess
      .mockReturnValueOnce(new Promise(resolve => { resolveAccess = resolve }))
      .mockResolvedValueOnce({ status: 'denied' })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: [] })
    const wrapper = mount(QCItemPage)
    await flushPromises()
    await pageSetup(wrapper).initializePage()

    resolveAccess({ status: 'editable' })
    await flushPromises()

    expect(wrapper.text()).toContain('Access denied')
    expect(wrapper.find('.target-panel').exists()).toBe(false)
    expect(apiGet).not.toHaveBeenCalled()
  })

  it('does not restore stale ReadList data after a newer denied decision', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValueOnce({ status: 'editable' }).mockResolvedValueOnce({ status: 'denied' })
    let resolveRead!: (value: unknown) => void
    apiGet.mockReturnValue(new Promise(resolve => { resolveRead = resolve }))
    const wrapper = mount(QCItemPage)
    await flushPromises()
    void pageSetup(wrapper).initializePage()
    await flushPromises()

    resolveRead({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Stale', remark: 'Must not render' }] })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Stale')
    expect(wrapper.find('[data-testid="qcitem-table"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Access denied')
  })

  it('does not redirect for an old anonymous response after newer editable access', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    let resolveAccess!: (result: unknown) => void
    checkMenuAccess.mockReturnValueOnce(new Promise(resolve => { resolveAccess = resolve }))
    const wrapper = mount(QCItemPage)
    await flushPromises()
    await pageSetup(wrapper).initializePage()

    resolveAccess({ status: 'anonymous' })
    await flushPromises()

    expect(wrapper.find('.target-panel').exists()).toBe(true)
    expect(redirectToLogin).not.toHaveBeenCalled()
    expect(apiGet).toHaveBeenCalledTimes(1)
  })

  it('keeps newer readonly data when an old ReadList completes', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValueOnce({ status: 'editable' }).mockResolvedValueOnce({ status: 'readonly' })
    let resolveRead!: (value: unknown) => void
    apiGet
      .mockReturnValueOnce(new Promise(resolve => { resolveRead = resolve }))
      .mockResolvedValueOnce({ ok: true, status: 200, data: [{ itemno: 2, itemname: 'Latest', remark: 'Current' }] })
    const wrapper = mount(QCItemPage)
    await flushPromises()
    await pageSetup(wrapper).initializePage()

    resolveRead({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Stale', remark: 'Old' }] })
    await flushPromises()

    expect(wrapper.get<HTMLInputElement>('[data-testid="qcitem-description-2"]').element.value).toBe('Latest')
    expect(wrapper.find('[data-testid="qcitem-description-1"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Read only')
  })

  it('retries a data error without rechecking the successful access decision', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValueOnce({ ok: false, error: { code: 'network', message: 'Offline' } })
    const wrapper = mount(QCItemPage)
    await flushPromises()

    await wrapper.get('[data-testid="qcitem-retry"]').trigger('click')
    await flushPromises()

    expect(apiGet).toHaveBeenCalledTimes(2)
    expect(checkMenuAccess).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.target-state--empty').exists()).toBe(true)
  })

  it('clears the list and pending file selection while rechecking access', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Existing', remark: 'Existing' }] })
    const wrapper = mount(QCItemPage)
    await flushPromises()
    const input = wrapper.get('[data-testid="qcitem-file-input"]').element as HTMLInputElement
    Object.defineProperty(input, 'files', { configurable: true, value: [new File(['xlsx'], 'QCItem.xlsx')] })
    await wrapper.get('[data-testid="qcitem-file-input"]').trigger('change')
    expect((wrapper.get('[data-testid="qcitem-import-dialog"]').element as HTMLDialogElement).open).toBe(true)
    let resolveAccess!: (value: unknown) => void
    checkMenuAccess.mockReturnValueOnce(new Promise(resolve => { resolveAccess = resolve }))
    void pageSetup(wrapper).initializePage()
    await flushPromises()

    expect(wrapper.find('[data-testid="qcitem-table"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="qcitem-import-dialog"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Checking your session')

    resolveAccess({ status: 'editable' })
    await flushPromises()
    expect((wrapper.get('[data-testid="qcitem-import-dialog"]').element as HTMLDialogElement).open).toBe(false)
    expect(wrapper.get('[data-testid="qcitem-upload"]').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).not.toContain('QCItem.xlsx')
  })

  it('sends anonymous users to the configured login route without calling the protected API', async () => {
    getContext.mockReturnValue({
      scope: 'internal',
      status: 'anonymous',
      isAuthenticated: false,
    })

    const wrapper = mount(QCItemPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Sign-in required')
    expect(wrapper.text()).toContain('The sign-in page is currently unavailable.')
    expect(wrapper.find('.target-state--error').exists()).toBe(true)
    expect(redirectToLogin).toHaveBeenCalledOnce()
    expect(checkMenuAccess).not.toHaveBeenCalled()
    expect(apiGet).not.toHaveBeenCalled()
  })

  it('loads the raw QCItem list and shows the required editable columns', async () => {
    getContext.mockReturnValue({
      scope: 'internal',
      status: 'authenticated',
      isAuthenticated: true,
    })
    apiGet.mockResolvedValue({
      ok: true,
      status: 200,
      data: [{ itemno: 1, itemname: 'Description', remark: 'Remark', adddate: '2026-09-11T09:30:00' }],
    })

    const wrapper = mount(QCItemPage)
    await flushPromises()

    expect(apiGet).toHaveBeenCalledWith('CSM/Master/QCItem_ReadList')
    expect(wrapper.findAll('th').map(header => header.text())).toEqual([
      'No.',
      'Action',
      'Description',
      'Remark',
      'Add date',
    ])
    expect(wrapper.find('[data-testid="qcitem-description-1"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="qcitem-remark-1"]').exists()).toBe(true)
  })

  it('renders the target empty and error states for the corresponding read results', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValueOnce({ ok: true, status: 200, data: [] })
    const emptyWrapper = mount(QCItemPage)
    await flushPromises()
    expect(emptyWrapper.find('.target-state--empty').exists()).toBe(true)

    apiGet.mockResolvedValueOnce({ ok: false, error: { code: 'network', message: 'Offline' } })
    const errorWrapper = mount(QCItemPage)
    await flushPromises()
    expect(errorWrapper.find('.target-state--error').exists()).toBe(true)
    expect(errorWrapper.text()).toContain('Offline')
    expect(errorWrapper.get('[data-testid="qcitem-retry"]').exists()).toBe(true)
  })

  it('does not treat a malformed successful read as empty or allow a destructive save', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: {} })
    const wrapper = mount(QCItemPage)
    await flushPromises()

    expect(wrapper.find('.target-state--error').exists()).toBe(true)
    expect(wrapper.text()).toContain('The server returned an invalid QC Item list.')
    expect(wrapper.get('[data-testid="qcitem-save"]').attributes('disabled')).toBeDefined()
    await wrapper.get('[data-testid="qcitem-save"]').trigger('click')
    expect(apiPost).not.toHaveBeenCalled()
  })

  it('adds a blank row, edits it inline, and moves to the last page', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: Array.from({ length: 10 }, (_, index) => ({
      itemno: index + 1,
      itemname: `Description ${index + 1}`,
      remark: 'Remark',
    })) })
    const wrapper = mount(QCItemPage)
    await flushPromises()

    await wrapper.get('[data-testid="qcitem-add"]').trigger('click')

    expect(wrapper.get('[data-testid="qcitem-page-2"]').attributes('aria-current')).toBe('page')
    expect(wrapper.find('[data-testid="qcitem-description-11"]').exists()).toBe(true)
    await wrapper.get('[data-testid="qcitem-description-11"]').setValue('New description')
    expect((wrapper.get('[data-testid="qcitem-description-11"]').element as HTMLInputElement).value)
      .toBe('New description')
  })

  it('deletes an existing row after the confirmation dialog is accepted', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Description', remark: 'Remark' }] })
    const confirm = vi.fn().mockReturnValue(true)
    vi.stubGlobal('confirm', confirm)
    const wrapper = mount(QCItemPage)
    await flushPromises()

    await wrapper.get('[data-testid="qcitem-delete-1"]').trigger('click')

    expect(confirm).toHaveBeenCalledOnce()
    expect(wrapper.find('[data-testid="qcitem-description-1"]').exists()).toBe(false)
    expect(apiPost).not.toHaveBeenCalled()
  })

  it('blocks save and identifies the first incomplete row', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: [{ itemno: 7, itemname: 'Description', remark: '' }] })
    const wrapper = mount(QCItemPage)
    await flushPromises()

    await wrapper.get('[data-testid="qcitem-save"]').trigger('click')

    expect(wrapper.text()).toContain('Remark is required.')
    expect(apiPost).not.toHaveBeenCalled()
  })

  it('sends the full current dataset under item and reloads after success', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet
      .mockResolvedValueOnce({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Old', remark: 'Remark' }] })
      .mockResolvedValueOnce({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Updated', remark: 'Remark' }] })
    apiPost.mockResolvedValue({ ok: true, status: 200, data: {} })
    const wrapper = mount(QCItemPage)
    await flushPromises()
    await wrapper.get('[data-testid="qcitem-description-1"]').setValue('Updated')
    await wrapper.get('[data-testid="qcitem-save"]').trigger('click')
    await flushPromises()

    expect(apiPost).toHaveBeenCalledWith('CSM/Master/QCItem_Create', {
      item: [{ itemno: 1, itemname: 'Updated', remark: 'Remark' }],
    })
    expect(apiGet).toHaveBeenCalledTimes(2)
  })

  it('saves the complete intended dataset after editing, adding, and deleting on page three', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    const initialItems = Array.from({ length: 25 }, (_, index) => ({
      itemno: index + 1,
      itemname: `Description ${index + 1}`,
      remark: `Remark ${index + 1}`,
    }))
    apiGet
      .mockResolvedValueOnce({ ok: true, status: 200, data: initialItems })
      .mockResolvedValueOnce({ ok: true, status: 200, data: [] })
    apiPost.mockResolvedValue({ ok: true, status: 200, data: {} })
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))

    const wrapper = mount(QCItemPage)
    await flushPromises()
    await wrapper.get('[data-testid="qcitem-page-3"]').trigger('click')
    await wrapper.get('[data-testid="qcitem-description-21"]').setValue('Updated 21')
    await wrapper.get('[data-testid="qcitem-delete-22"]').trigger('click')
    await wrapper.get('[data-testid="qcitem-add"]').trigger('click')
    await wrapper.get('[data-testid="qcitem-description-26"]').setValue('New 26')
    await wrapper.get('[data-testid="qcitem-remark-26"]').setValue('New remark 26')
    await wrapper.get('[data-testid="qcitem-save"]').trigger('click')
    await flushPromises()

    expect(apiPost).toHaveBeenCalledWith('CSM/Master/QCItem_Create', {
      item: [
        ...initialItems
          .filter(item => item.itemno !== 22)
          .map(item => item.itemno === 21 ? { ...item, itemname: 'Updated 21' } : item),
        { itemno: 26, itemname: 'New 26', remark: 'New remark 26' },
      ],
    })
    expect(apiGet).toHaveBeenCalledTimes(2)
  })

  it('opens the import dialog for an xlsx file, uploads field file, and reloads on success', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: [] })
    apiPostForm.mockResolvedValue({ ok: true, status: 200, data: true })
    const wrapper = mount(QCItemPage)
    await flushPromises()
    const file = new File(['xlsx'], 'QCItem.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const input = wrapper.get('[data-testid="qcitem-file-input"]').element as HTMLInputElement
    Object.defineProperty(input, 'files', { configurable: true, value: [file] })
    await wrapper.get('[data-testid="qcitem-file-input"]').trigger('change')

    expect(wrapper.text()).toContain('QCItem.xlsx')
    await wrapper.get('[data-testid="qcitem-upload"]').trigger('click')
    await flushPromises()

    const form = apiPostForm.mock.calls[0][1] as FormData
    expect(form.get('file')).toMatchObject({ name: file.name, type: file.type, size: file.size })
    expect(apiGet).toHaveBeenCalledTimes(2)
  })

  it('keeps the import dialog open and shows the server error when upload fails', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: [] })
    apiPostForm.mockResolvedValue({ ok: false, error: { code: 'api', message: 'Invalid workbook' } })
    const wrapper = mount(QCItemPage)
    await flushPromises()
    const input = wrapper.get('[data-testid="qcitem-file-input"]').element as HTMLInputElement
    Object.defineProperty(input, 'files', { configurable: true, value: [new File(['bad'], 'bad.xlsx')] })
    await wrapper.get('[data-testid="qcitem-file-input"]').trigger('change')
    await wrapper.get('[data-testid="qcitem-upload"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="qcitem-import-dialog"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Invalid workbook')
  })

  it('opens the server export token through FileCapability with download=true', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet
      .mockResolvedValueOnce({ ok: true, status: 200, data: [] })
    let resolveExport!: (result: unknown) => void
    apiGet.mockReturnValueOnce(new Promise(resolve => { resolveExport = resolve }))
    apiOpenUrl.mockReturnValue('/service/Api/File/DownLoad?download=true&id=server-token')
    const exportWindow = { closed: false, location: { href: '' } }
    const open = vi.fn().mockReturnValue(exportWindow)
    vi.stubGlobal('open', open)
    const wrapper = mount(QCItemPage)
    await flushPromises()
    void wrapper.get('[data-testid="qcitem-export"]').trigger('click')
    await nextTick()

    expect(open).toHaveBeenCalledWith('about:blank', '_blank')
    expect(apiOpenUrl).not.toHaveBeenCalled()
    resolveExport({ ok: true, status: 200, data: 'server-token' })
    await flushPromises()

    expect(apiOpenUrl).toHaveBeenCalledWith('server-token', { download: true })
    expect(exportWindow.location.href).toBe('/service/Api/File/DownLoad?download=true&id=server-token')
  })

  it('exposes accessible action labels and disables Save while the replace-all request is pending', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: [{ itemno: 1, itemname: 'Description', remark: 'Remark' }] })
    let resolvePost!: (result: unknown) => void
    apiPost.mockReturnValue(new Promise(resolve => { resolvePost = resolve }))
    const wrapper = mount(QCItemPage)
    await flushPromises()

    expect(wrapper.get('[data-testid="qcitem-delete-1"]').attributes('aria-label')).toBe('Delete item 1')
    void wrapper.get('[data-testid="qcitem-save"]').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-testid="qcitem-save"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="qcitem-add"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="qcitem-delete-1"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="qcitem-description-1"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="qcitem-save"]').text()).toBe('Saving…')
    resolvePost({ ok: true, status: 200, data: {} })
    await flushPromises()
  })

  it('closes the import dialog with Cancel without uploading the selected file', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: [] })
    const wrapper = mount(QCItemPage)
    await flushPromises()
    const input = wrapper.get('[data-testid="qcitem-file-input"]').element as HTMLInputElement
    Object.defineProperty(input, 'files', { configurable: true, value: [new File(['xlsx'], 'QCItem.xlsx')] })
    await wrapper.get('[data-testid="qcitem-file-input"]').trigger('change')

    expect((wrapper.get('[data-testid="qcitem-import-dialog"]').element as HTMLDialogElement).open).toBe(true)
    await wrapper.get('[data-testid="qcitem-cancel-import"]').trigger('click')

    expect((wrapper.get('[data-testid="qcitem-import-dialog"]').element as HTMLDialogElement).open).toBe(false)
    expect(apiPostForm).not.toHaveBeenCalled()
  })

  it('disables Upload while the import request is pending', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockResolvedValue({ ok: true, status: 200, data: [] })
    let resolveImport!: (result: unknown) => void
    apiPostForm.mockReturnValue(new Promise(resolve => { resolveImport = resolve }))
    const wrapper = mount(QCItemPage)
    await flushPromises()
    const input = wrapper.get('[data-testid="qcitem-file-input"]').element as HTMLInputElement
    Object.defineProperty(input, 'files', { configurable: true, value: [new File(['xlsx'], 'QCItem.xlsx')] })
    await wrapper.get('[data-testid="qcitem-file-input"]').trigger('change')
    void wrapper.get('[data-testid="qcitem-upload"]').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-testid="qcitem-upload"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="qcitem-add"]').attributes('disabled')).toBeDefined()
    resolveImport({ ok: true, status: 200, data: true })
    await flushPromises()
  })
})
