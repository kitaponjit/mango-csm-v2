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

const translations: Record<string, string> = {
  'qcItem.authChecking': 'Checking your session',
  'qcItem.authRequired': 'Sign-in required',
  'qcItem.authUnavailable': 'The sign-in page is currently unavailable.',
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
  'qcItem.chooseFile': 'Choose an .xlsx file',
  'qcItem.cancel': 'Cancel',
  'qcItem.upload': 'Upload',
  'qcItem.uploading': 'Uploading…',
  'qcItem.fileTypeError': 'Please choose an .xlsx file only.',
  'qcItem.empty': 'No QC Items found',
  'qcItem.error': 'Unable to load QC Items',
  'qcItem.invalidResponse': 'The server returned an invalid QC Item list.',
  'qcItem.retry': 'Try again',
  'qcItem.deleteItem': 'Delete item',
}

beforeEach(() => {
  apiGet.mockReset()
  apiPost.mockReset()
  apiPostForm.mockReset()
  apiOpenUrl.mockReset()
  redirectToLogin.mockReset()
  getContext.mockReset()

  vi.stubGlobal('useApiClient', () => ({ get: apiGet, post: apiPost, postForm: apiPostForm }))
  vi.stubGlobal('useFileCapability', () => ({ openUrl: apiOpenUrl }))
  vi.stubGlobal('useLocalizationAdapter', () => ({
    language: 'en',
    t: (key: string) => translations[key] ?? key,
  }))
  vi.stubGlobal('useSessionAdapter', () => ({ getContext, redirectToLogin }))
  vi.stubGlobal('useHead', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('QCItem page access and read state', () => {
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
      .mockResolvedValueOnce({ ok: true, status: 200, data: 'server-token' })
    apiOpenUrl.mockReturnValue('/service/Api/File/DownLoad?download=true&id=server-token')
    const open = vi.fn()
    vi.stubGlobal('open', open)
    const wrapper = mount(QCItemPage)
    await flushPromises()
    await wrapper.get('[data-testid="qcitem-export"]').trigger('click')
    await flushPromises()

    expect(apiOpenUrl).toHaveBeenCalledWith('server-token', { download: true })
    expect(open).toHaveBeenCalledWith('/service/Api/File/DownLoad?download=true&id=server-token', '_blank', 'noopener')
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
