import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiClient } from '../../app/services/http/api-client'
import { normalizeWarrantyGroupPage } from '../../app/features/warranty-group/warranty-group-model'
import { createWarrantyGroupService } from '../../app/features/warranty-group/warranty-group-service'
import WarrantyGroupPage from '../../app/pages/master/warranty-group/index.vue'

const apiGet = vi.fn()
const apiPost = vi.fn()
const apiOpenUrl = vi.fn()
const redirectToLogin = vi.fn()
const getContext = vi.fn()
const checkMenuAccess = vi.fn()

function pageSetup(wrapper: ReturnType<typeof mount>) {
  return (wrapper.vm as unknown as { $: { setupState: Record<string, unknown> } }).$.setupState
}

const translations: Record<string, string> = {
  'mas001.title': 'Warranty Group list',
  'mas001.description': 'Configure warranty work groups.',
  'mas001.count': 'Total records',
  'mas001.export': 'Export Excel',
  'mas001.exporting': 'Preparing export…',
  'mas001.template': 'Download template',
  'mas001.templateDownloading': 'Preparing template…',
  'mas001.exportBlocked': 'The download popup was blocked. Allow popups, then try again.',
  'mas001.exportFailed': 'Unable to prepare the file for download.',
}

function stubGlobals() {
  vi.stubGlobal('useApiClient', () => ({ get: apiGet, post: apiPost }))
  vi.stubGlobal('useFileCapability', () => ({ openUrl: apiOpenUrl }))
  vi.stubGlobal('useLocalizationAdapter', () => ({
    language: 'en',
    t: (key: string) => translations[key] ?? key,
  }))
  vi.stubGlobal('useSessionAdapter', () => ({ getContext, redirectToLogin }))
  vi.stubGlobal('useAccessControlService', () => ({ checkMenuAccess }))
  vi.stubGlobal('useHead', vi.fn())
}

function editableList() {
  getContext.mockReturnValue({ isAuthenticated: true })
  checkMenuAccess.mockResolvedValue({ status: 'editable' })
  apiGet.mockResolvedValue({
    ok: true,
    status: 200,
    data: { data: [{ type_code: 'G0001', type_name: 'Group 1', default_: 'N', active: 'Y' }], total: 1 },
  })
}

async function editablePage() {
  editableList()
  const wrapper = mount(WarrantyGroupPage)
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  apiGet.mockReset()
  apiGet.mockResolvedValue({ ok: true, status: 200, data: { data: [], total: 0 } })
  apiPost.mockReset()
  apiOpenUrl.mockReset()
  redirectToLogin.mockReset()
  getContext.mockReset()
  checkMenuAccess.mockReset()
  checkMenuAccess.mockResolvedValue({ status: 'editable' })
  stubGlobals()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('warranty-group export/template service', () => {
  it('exports the full server dataset through the verified export action with no paging params', async () => {
    const result = { ok: true, status: 200, data: 'export-token' } as const
    const get = vi.fn().mockResolvedValue(result)
    const api = { get } as unknown as ApiClient
    const service = createWarrantyGroupService(api)

    expect(await service.exportFile()).toEqual(result)
    expect(get).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_ExportExcel')
    expect(String(get.mock.calls[0][0])).not.toContain('skip')
    expect(String(get.mock.calls[0][0])).not.toContain('take')
  })

  it('downloads the header-only template through the verified template action', async () => {
    const result = { ok: true, status: 200, data: 'template-token' } as const
    const get = vi.fn().mockResolvedValue(result)
    const api = { get } as unknown as ApiClient
    const service = createWarrantyGroupService(api)

    expect(await service.downloadTemplate()).toEqual(result)
    expect(get).toHaveBeenCalledWith('CSM/Master/TemplateExcelWarrantyGroup')
  })
})

describe('warranty-group list DTO pin (mas_002 downstream contract, read-only)', () => {
  it('pins the shared list envelope {data, total} with row fields incl. default/active', () => {
    const page = normalizeWarrantyGroupPage({
      data: [{
        type_code: 'G0001',
        type_name: 'Group 1',
        default_: 'Y',
        active: 'Y',
        add_user: 'ADMIN',
        add_dt: '2026-01-01',
        edit_user: null,
        edit_dt: null,
      }],
      total: 1,
    })

    expect(page).not.toBeNull()
    expect(Object.keys(page!).sort()).toEqual(['data', 'total'])
    expect(page!.total).toBe(1)
    for (const field of ['type_code', 'type_name', 'default_', 'active']) {
      expect(page!.data[0]).toHaveProperty(field)
    }
    expect(page!.data[0]).toMatchObject({ type_code: 'G0001', default_: 'Y', active: 'Y' })
  })

  it('rejects envelopes that drop the sibling-consumed shape', () => {
    expect(normalizeWarrantyGroupPage({ data: [] })).toBeNull()
    expect(normalizeWarrantyGroupPage({ total: 0 })).toBeNull()
    expect(normalizeWarrantyGroupPage([])).toBeNull()
  })
})

describe('warranty-group export/template download flow', () => {
  it('opens the server export token through FileCapability with download=true', async () => {
    const wrapper = await editablePage()
    apiGet.mockClear()
    apiGet.mockResolvedValueOnce({ ok: true, status: 200, data: 'server-token' })
    apiOpenUrl.mockReturnValue('/service/Api/File/DownLoad?download=true&id=server-token')
    const exportWindow = { closed: false, location: { href: '' }, close: vi.fn() }
    vi.stubGlobal('open', vi.fn().mockReturnValue(exportWindow))

    await wrapper.get('[data-testid="wgroup-export"]').trigger('click')
    await flushPromises()

    expect(apiGet).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_ExportExcel')
    expect(apiOpenUrl).toHaveBeenCalledWith('server-token', { download: true })
    expect(exportWindow.location.href).toBe('/service/Api/File/DownLoad?download=true&id=server-token')
    expect(wrapper.find('[data-testid="wgroup-export-error"]').exists()).toBe(false)
  })

  it('opens the template token through the same FileCapability flow', async () => {
    const wrapper = await editablePage()
    apiGet.mockClear()
    apiGet.mockResolvedValueOnce({ ok: true, status: 200, data: 'template-token' })
    apiOpenUrl.mockReturnValue('/service/Api/File/DownLoad?download=true&id=template-token')
    const templateWindow = { closed: false, location: { href: '' }, close: vi.fn() }
    vi.stubGlobal('open', vi.fn().mockReturnValue(templateWindow))

    await wrapper.get('[data-testid="wgroup-template"]').trigger('click')
    await flushPromises()

    expect(apiGet).toHaveBeenCalledWith('CSM/Master/TemplateExcelWarrantyGroup')
    expect(apiOpenUrl).toHaveBeenCalledWith('template-token', { download: true })
    expect(templateWindow.location.href).toBe('/service/Api/File/DownLoad?download=true&id=template-token')
    expect(wrapper.find('[data-testid="wgroup-template-error"]').exists()).toBe(false)
  })

  it('reports a failed export token as an error and never navigates', async () => {
    const wrapper = await editablePage()
    apiGet.mockResolvedValueOnce({ ok: false, error: { code: 'api', message: 'Export failed.' } })
    const exportWindow = { closed: false, location: { href: '' }, close: vi.fn() }
    vi.stubGlobal('open', vi.fn().mockReturnValue(exportWindow))

    await wrapper.get('[data-testid="wgroup-export"]').trigger('click')
    await flushPromises()

    expect(exportWindow.close).toHaveBeenCalledOnce()
    expect(exportWindow.location.href).toBe('')
    expect(apiOpenUrl).not.toHaveBeenCalled()
    expect(wrapper.get('[data-testid="wgroup-export-error"]').text()).toContain('Export failed.')
    expect(pageSetup(wrapper).exportStatus).toBe('error')
  })

  it('reports a blocked export popup as an error and never false success', async () => {
    const wrapper = await editablePage()
    apiGet.mockResolvedValueOnce({ ok: true, status: 200, data: 'server-token' })
    apiOpenUrl.mockReturnValue('/service/Api/File/DownLoad?download=true&id=server-token')
    vi.stubGlobal('open', vi.fn().mockReturnValue(null))

    await wrapper.get('[data-testid="wgroup-export"]').trigger('click')
    await flushPromises()

    expect(apiOpenUrl).toHaveBeenCalledWith('server-token', { download: true })
    expect(wrapper.find('[data-testid="wgroup-export-error"]').exists()).toBe(true)
    expect(pageSetup(wrapper).exportStatus).toBe('error')
    expect(pageSetup(wrapper).exportStatus).not.toBe('success')
  })

  it('reports an empty export token as an error and never navigates', async () => {
    const wrapper = await editablePage()
    apiGet.mockResolvedValueOnce({ ok: true, status: 200, data: '' })
    const exportWindow = { closed: false, location: { href: '' }, close: vi.fn() }
    vi.stubGlobal('open', vi.fn().mockReturnValue(exportWindow))

    await wrapper.get('[data-testid="wgroup-export"]').trigger('click')
    await flushPromises()

    expect(exportWindow.close).toHaveBeenCalledOnce()
    expect(apiOpenUrl).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="wgroup-export-error"]').exists()).toBe(true)
    expect(pageSetup(wrapper).exportStatus).not.toBe('success')
  })

  it('reports a blocked template popup as an error and never false success', async () => {
    const wrapper = await editablePage()
    apiGet.mockResolvedValueOnce({ ok: true, status: 200, data: 'template-token' })
    apiOpenUrl.mockReturnValue('/service/Api/File/DownLoad?download=true&id=template-token')
    vi.stubGlobal('open', vi.fn().mockReturnValue(null))

    await wrapper.get('[data-testid="wgroup-template"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="wgroup-template-error"]').exists()).toBe(true)
    expect(pageSetup(wrapper).templateStatus).toBe('error')
    expect(pageSetup(wrapper).templateStatus).not.toBe('success')
  })

  it('guards export and template until the list is ready', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    apiGet.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()
    const setup = pageSetup(wrapper)
    const open = vi.fn()
    vi.stubGlobal('open', open)

    await setup.exportFile()
    await setup.downloadTemplate()
    await flushPromises()

    expect(apiGet).toHaveBeenCalledTimes(1)
    expect(open).not.toHaveBeenCalled()
  })

  it('lets read-only users export while mutation stays disabled', async () => {
    getContext.mockReturnValue({ isAuthenticated: true })
    checkMenuAccess.mockResolvedValue({ status: 'readonly' })
    apiGet.mockResolvedValue({
      ok: true,
      status: 200,
      data: { data: [{ type_code: 'G0001', type_name: 'Group 1', default_: 'N', active: 'Y' }], total: 1 },
    })
    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()

    expect(wrapper.get('[data-testid="wgroup-add"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="wgroup-export"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('[data-testid="wgroup-template"]').attributes('disabled')).toBeUndefined()

    apiGet.mockClear()
    apiGet.mockResolvedValueOnce({ ok: true, status: 200, data: 'server-token' })
    apiOpenUrl.mockReturnValue('/service/Api/File/DownLoad?download=true&id=server-token')
    vi.stubGlobal('open', vi.fn().mockReturnValue({ closed: false, location: { href: '' } }))
    await wrapper.get('[data-testid="wgroup-export"]').trigger('click')
    await flushPromises()
    expect(apiOpenUrl).toHaveBeenCalledWith('server-token', { download: true })
    await nextTick()
  })
})
