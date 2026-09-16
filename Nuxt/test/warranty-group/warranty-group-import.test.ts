import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WarrantyGroupPage from '../../app/pages/master/warranty-group/index.vue'
import {
  DEFAULT_IMPORT_MAPPING,
  coerceImportActive,
  mapImportRows,
  parsePastedImportSheet,
} from '../../app/features/warranty-group/warranty-group-import'
import { createWarrantyGroupService } from '../../app/features/warranty-group/warranty-group-service'
import type { ApiClient } from '../../app/services/http/api-client'

describe('warranty-group slice-local import mapper', () => {
  it('defaults column A to Code, B to Name, C to Active', () => {
    expect(DEFAULT_IMPORT_MAPPING).toEqual({ type_code: 'A', type_name: 'B', active: 'C' })
  })

  it('maps letter-keyed sheet rows to Code/Name/Active with trimming', () => {
    expect(
      mapImportRows([{ A: '  G01  ', B: '  Pump group  ', C: 'Y' }]),
    ).toEqual([{ type_code: 'G01', type_name: 'Pump group', active: 'Y' }])
  })

  it('honours a user-edited column mapping', () => {
    expect(
      mapImportRows(
        [{ B: 'G01', C: 'Pump group', D: 'Y' }],
        { type_code: 'B', type_name: 'C', active: 'D' },
      ),
    ).toEqual([{ type_code: 'G01', type_name: 'Pump group', active: 'Y' }])
  })

  it('skips blank-code rows exactly as the backend does', () => {
    expect(
      mapImportRows([
        { A: 'G01', B: 'Pump group', C: 'Y' },
        { A: '   ', B: 'Ghost group', C: 'Y' },
        { B: 'No code column at all', C: 'Y' },
        { A: 'G02', B: 'Fan group', C: 'N' },
      ]),
    ).toEqual([
      { type_code: 'G01', type_name: 'Pump group', active: 'Y' },
      { type_code: 'G02', type_name: 'Fan group', active: 'N' },
    ])
  })

  it('coerces Active to Y only for Y, everything else becomes N', () => {
    expect(coerceImportActive('Y')).toBe('Y')
    expect(coerceImportActive(' Y ')).toBe('Y')
    expect(coerceImportActive('y')).toBe('Y')
    expect(coerceImportActive('N')).toBe('N')
    expect(coerceImportActive('yes')).toBe('N')
    expect(coerceImportActive('')).toBe('N')
    expect(coerceImportActive(undefined)).toBe('N')
    expect(
      mapImportRows([{ A: 'G01', B: 'Pump group', C: 'yes' }]),
    ).toEqual([{ type_code: 'G01', type_name: 'Pump group', active: 'N' }])
  })

  it('parses pasted sheet text into letter-keyed rows, skipping empty lines', () => {
    expect(parsePastedImportSheet('G01,Pump group,Y\n\n  \nG02\tFan group\tN\n')).toEqual([
      { A: 'G01', B: 'Pump group', C: 'Y' },
      { A: 'G02', B: 'Fan group', C: 'N' },
    ])
  })
})

describe('warranty-group importData service contract', () => {
  function stubApi() {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 200, data: 2 })
    const api = { post } as unknown as ApiClient
    return { post, service: createWarrantyGroupService(api) }
  }

  it('posts the mapped row array as JSON data to the verified ImportData endpoint', async () => {
    const { post, service } = stubApi()
    const rows = [
      { type_code: 'G01', type_name: 'Pump group', active: 'Y' },
      { type_code: 'G02', type_name: 'Fan group', active: 'N' },
    ]

    await service.importData(rows)

    expect(post).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_ImportData', { data: rows })
  })

  it('sends Code/Name/Active only — no default_, tenant, or audit fields (server preserves defaults, stamps IMPORT)', async () => {
    const { post, service } = stubApi()

    await service.importData([{ type_code: 'G01', type_name: 'Pump group', active: 'Y' }])

    const body = post.mock.calls[0][1] as { data: Record<string, unknown>[] }
    expect(Object.keys(body.data[0]).sort()).toEqual(['active', 'type_code', 'type_name'])
    expect(body.data[0]).not.toHaveProperty('default_')
  })
})

const apiGet = vi.fn()
const apiPost = vi.fn()
const fileOpenUrl = vi.fn()
const redirectToLogin = vi.fn()
const getContext = vi.fn()
const checkMenuAccess = vi.fn()

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
  'mas001.import': 'Import',
  'mas001.importTitle': 'Import Group Codes',
  'mas001.importMapCode': 'Code column',
  'mas001.importMapName': 'Name column',
  'mas001.importMapActive': 'Active column',
  'mas001.importPaste': 'Spreadsheet rows',
  'mas001.importPreview': 'Preview',
  'mas001.importUpload': 'Upload',
  'mas001.importCancel': 'Cancel',
  'mas001.importSuccess': 'Import completed successfully.',
  'mas001.importEmpty': 'Nothing to import — paste rows and map the columns.',
}

beforeEach(() => {
  apiGet.mockReset()
  apiGet.mockResolvedValue({ ok: true, status: 200, data: { data: [], total: 0 } })
  apiPost.mockReset()
  apiPost.mockResolvedValue({ ok: true, status: 200, data: 2 })
  redirectToLogin.mockReset()
  getContext.mockReset()
  getContext.mockReturnValue({ isAuthenticated: true })
  checkMenuAccess.mockReset()
  checkMenuAccess.mockResolvedValue({ status: 'editable' })

  vi.stubGlobal('useApiClient', () => ({ get: apiGet, post: apiPost }))
  vi.stubGlobal('useFileCapability', () => ({ openUrl: fileOpenUrl }))
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

function mapInput(wrapper: ReturnType<typeof mount>, testid: string) {
  return wrapper.get(`[data-testid="${testid}"]`).element as HTMLInputElement
}

async function editablePage() {
  const wrapper = mount(WarrantyGroupPage)
  await flushPromises()
  return wrapper
}

async function openImportDialog(wrapper: ReturnType<typeof mount>) {
  await wrapper.get('[data-testid="wgroup-import"]').trigger('click')
  await flushPromises()
  return wrapper.get('[data-testid="wgroup-import-dialog"]')
}

describe('warranty-group page import dialog', () => {
  it('opens an import dialog whose column mapping defaults to A/B/C', async () => {
    const wrapper = await editablePage()

    await openImportDialog(wrapper)

    expect(mapInput(wrapper, 'wgroup-import-map-code').value).toBe('A')
    expect(mapInput(wrapper, 'wgroup-import-map-name').value).toBe('B')
    expect(mapInput(wrapper, 'wgroup-import-map-active').value).toBe('C')
  })

  it('previews pasted rows live and re-maps immediately when the mapping changes', async () => {
    const wrapper = await editablePage()
    await openImportDialog(wrapper)

    await wrapper.get('[data-testid="wgroup-import-paste"]').setValue('G01,Pump group,Y')
    await flushPromises()
    expect(wrapper.findAll('[data-testid="wgroup-import-preview-row"]')).toHaveLength(1)
    expect(wrapper.get('[data-testid="wgroup-import-dialog"]').text()).toContain('G01')

    await wrapper.get('[data-testid="wgroup-import-map-code"]').setValue('B')
    await flushPromises()
    expect(wrapper.get('[data-testid="wgroup-import-dialog"]').text()).toContain('Pump group')
    const previewCells = wrapper.findAll('[data-testid="wgroup-import-preview-row"] td').map(cell => cell.text())
    expect(previewCells[0]).toBe('Pump group')
  })

  it('skips blank-code rows and coerces Active in the preview', async () => {
    const wrapper = await editablePage()
    await openImportDialog(wrapper)

    await wrapper.get('[data-testid="wgroup-import-paste"]').setValue('G01,Pump group,Y\n, Ghost group ,Y\nG02,Fan group,yes')
    await flushPromises()

    const previewRows = wrapper.findAll('[data-testid="wgroup-import-preview-row"]')
    expect(previewRows).toHaveLength(2)
    expect(previewRows[1].text()).toContain('G02')
    expect(previewRows[1].text()).toContain('No')
  })

  it('uploads the mapped row array (not a file), reports the result, reloads, and closes', async () => {
    const wrapper = await editablePage()
    await openImportDialog(wrapper)
    await wrapper.get('[data-testid="wgroup-import-paste"]').setValue('  G09  ,  New group  , Y ')
    await flushPromises()
    const readsBeforeUpload = apiGet.mock.calls.length

    await wrapper.get('[data-testid="wgroup-import-upload"]').trigger('click')
    await flushPromises()

    expect(apiPost).toHaveBeenCalledWith('CSM/Master/WarrantyGroup_ImportData', {
      data: [{ type_code: 'G09', type_name: 'New group', active: 'Y' }],
    })
    expect(wrapper.find('[data-testid="wgroup-import-dialog"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="wgroup-save-message"]').text()).toContain('Import completed successfully.')
    expect(apiGet.mock.calls.length).toBeGreaterThan(readsBeforeUpload)
  })

  it('keeps the dialog usable with the server message when upload fails', async () => {
    apiPost.mockResolvedValueOnce({ ok: false, error: { code: 'api', message: 'Warning : import failed.' } })
    const wrapper = await editablePage()
    await openImportDialog(wrapper)
    await wrapper.get('[data-testid="wgroup-import-paste"]').setValue('G09,New group,Y')
    await flushPromises()
    const readsBeforeUpload = apiGet.mock.calls.length

    await wrapper.get('[data-testid="wgroup-import-upload"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="wgroup-import-dialog"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="wgroup-import-error"]').text()).toContain('Warning : import failed.')
    expect(apiGet.mock.calls.length).toBe(readsBeforeUpload)
  })

  it('sends no request when there is nothing mapped to upload', async () => {
    const wrapper = await editablePage()
    await openImportDialog(wrapper)

    await wrapper.get('[data-testid="wgroup-import-upload"]').trigger('click')
    await flushPromises()

    expect(apiPost).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="wgroup-import-dialog"]').exists()).toBe(true)
  })

  it('closes the import dialog without any request on cancel', async () => {
    const wrapper = await editablePage()
    await openImportDialog(wrapper)
    await wrapper.get('[data-testid="wgroup-import-paste"]').setValue('G09,New group,Y')
    await flushPromises()

    await wrapper.get('[data-testid="wgroup-import-cancel"]').trigger('click')
    await flushPromises()

    expect(apiPost).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="wgroup-import-dialog"]').exists()).toBe(false)
  })

  it('disables the import entry point for read-only users and guards the handler', async () => {
    checkMenuAccess.mockResolvedValue({ status: 'readonly' })
    const wrapper = mount(WarrantyGroupPage)
    await flushPromises()

    expect(wrapper.get('[data-testid="wgroup-import"]').attributes('disabled')).toBeDefined()
    const setup = (wrapper.vm as unknown as { $: { setupState: Record<string, unknown> } }).$.setupState
    await (setup.openImport as () => void)()
    await flushPromises()

    expect(apiPost).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="wgroup-import-dialog"]').exists()).toBe(false)
  })
})
