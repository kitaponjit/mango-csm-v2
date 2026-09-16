import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WarrantyItemPage from '../../app/pages/master/warranty-item/index.vue'

const apiGet = vi.fn()
const apiPost = vi.fn()
const redirectToLogin = vi.fn()
const getContext = vi.fn()
const checkMenuAccess = vi.fn()

const row = {
  war_code: 'W001', war_des: 'Structural warranty', type_code: 'G01', type_name: 'Structural',
  tot_date: 0, tot_month: 12, tot_year: 0, active: 'Y',
}

beforeEach(() => {
  apiGet.mockReset().mockResolvedValue({ ok: true, status: 200, data: { data_rows: [row], total: 1 } })
  apiPost.mockReset().mockResolvedValue({ ok: true, status: 200, data: {} })
  getContext.mockReset().mockReturnValue({ isAuthenticated: true })
  redirectToLogin.mockReset()
  checkMenuAccess.mockReset().mockResolvedValue({ status: 'editable' })
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

async function editablePage() {
  const wrapper = mount(WarrantyItemPage)
  await flushPromises()
  return wrapper
}

describe('warranty-item T3 delete page seam (RED)', () => {
  it('requires an explicit code-and-name confirmation before deleting', async () => {
    const confirmSpy = vi.fn().mockReturnValue(true)
    vi.stubGlobal('confirm', confirmSpy)
    const wrapper = await editablePage()
    const button = wrapper.get('[data-testid="warranty-item-delete-W001"]')

    expect(button.attributes('disabled')).toBeUndefined()
    await button.trigger('click')
    await flushPromises()

    expect(confirmSpy).toHaveBeenCalledOnce()
    expect(String(confirmSpy.mock.calls[0][0])).toContain('W001')
    expect(String(confirmSpy.mock.calls[0][0])).toContain('Structural warranty')
  })

  it('sends no request when deletion is cancelled', async () => {
    const confirmSpy = vi.fn().mockReturnValue(false)
    vi.stubGlobal('confirm', confirmSpy)
    const wrapper = await editablePage()

    await wrapper.get('[data-testid="warranty-item-delete-W001"]').trigger('click')
    await flushPromises()

    expect(confirmSpy).toHaveBeenCalledOnce()
    expect(apiPost).not.toHaveBeenCalled()
  })

  it('uses the exact delete endpoint and header payload', async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    const wrapper = await editablePage()

    await wrapper.get('[data-testid="warranty-item-delete-W001"]').trigger('click')
    await flushPromises()

    expect(apiPost).toHaveBeenCalledWith('CSM/Master/WarrantyItem_Delete', {
      header: { war_code: 'W001' },
    })
  })

  it.each([
    'Cannot delete: rd_mas_area_item references this Warranty Item.',
    'Cannot delete: rd_mas_proj_warranty references this Warranty Item.',
  ])('keeps the row and shows the server referential-integrity message: %s', async message => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    apiPost.mockResolvedValueOnce({ ok: false, error: { code: 'api', message } })
    const wrapper = await editablePage()

    await wrapper.get('[data-testid="warranty-item-delete-W001"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(message)
    expect(wrapper.get('[data-testid="warranty-item-delete-W001"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="warranty-item-table"]').text()).toContain('Structural warranty')
  })

  it('reports success and reloads the current catalog after deletion', async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    const wrapper = await editablePage()
    const readsBeforeDelete = apiGet.mock.calls.length

    await wrapper.get('[data-testid="warranty-item-delete-W001"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('deleted successfully')
    expect(apiGet.mock.calls.length).toBe(readsBeforeDelete + 1)
  })

  it('moves to the previous valid page when deleting the sole row on the final page', async () => {
    const rows = Array.from({ length: 501 }, (_, index) => ({
      war_code: `W${String(index + 1).padStart(4, '0')}`,
      war_des: `Warranty ${index + 1}`,
      type_code: 'G01', type_name: 'Structural', tot_date: 0, tot_month: 12, tot_year: 0, active: 'Y',
    }))
    let deleted = false
    apiGet.mockImplementation(async (path: string) => {
      const params = new URLSearchParams(path.split('?')[1] ?? '')
      const skip = Number(params.get('skip')) || 0
      const take = Number(params.get('take')) || 500
      const total = deleted ? 500 : 501
      return { ok: true, status: 200, data: { data_rows: rows.slice(0, total).slice(skip, skip + take), total } }
    })
    apiPost.mockImplementationOnce(async () => {
      deleted = true
      return { ok: true, status: 200, data: {} }
    })
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    const wrapper = await editablePage()

    await wrapper.get('[data-testid="warranty-item-next"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="warranty-item-delete-W0501"]').trigger('click')
    await flushPromises()

    expect(apiGet.mock.calls.slice(-2).map(([path]) => path)).toEqual([
      'CSM/Master/WarrantyItem_ReadList?skip=500&take=500&field=war_code&text=&active=Y',
      'CSM/Master/WarrantyItem_ReadList?skip=0&take=500&field=war_code&text=&active=Y',
    ])
    expect(wrapper.find('[data-testid="warranty-item-table"] tbody tr td:nth-child(2)').text()).toBe('W0001')
    expect(wrapper.text()).toContain('deleted successfully')
  })

  it('does not offer deletion to read-only users', async () => {
    checkMenuAccess.mockResolvedValue({ status: 'readonly' })
    const confirmSpy = vi.fn().mockReturnValue(true)
    vi.stubGlobal('confirm', confirmSpy)
    const wrapper = await editablePage()

    expect(wrapper.get('[data-testid="warranty-item-delete-W001"]').attributes('disabled')).toBeDefined()
    await wrapper.get('[data-testid="warranty-item-delete-W001"]').trigger('click')
    await flushPromises()

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(apiPost).not.toHaveBeenCalled()
  })

  it('does not offer deletion to unauthorized users', async () => {
    checkMenuAccess.mockResolvedValue({ status: 'denied' })
    const confirmSpy = vi.fn().mockReturnValue(true)
    vi.stubGlobal('confirm', confirmSpy)
    const wrapper = await editablePage()

    expect(wrapper.find('[data-testid="warranty-item-delete-W001"]').exists()).toBe(false)
    expect(confirmSpy).not.toHaveBeenCalled()
    expect(apiPost).not.toHaveBeenCalled()
  })
})
