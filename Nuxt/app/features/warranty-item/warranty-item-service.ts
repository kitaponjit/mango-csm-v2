import type { ApiClient, ApiResult } from '~/services/http/api-client'
import { DEFAULT_TAKE, type WarrantyItemHeader, type WarrantyItemListParams, type WarrantyItemPage, type WarrantyItem } from './warranty-item-model'
import type { WarrantyItemImportRow } from './warranty-item-import'

export interface WarrantyItemService {
  readList(params?: Partial<WarrantyItemListParams>): Promise<ApiResult<WarrantyItemPage>>
  readOne(war_code: string): Promise<ApiResult<WarrantyItem | null>>
  create(header: WarrantyItemHeader): Promise<ApiResult<unknown>>
  update(header: WarrantyItemHeader): Promise<ApiResult<unknown>>
  delete(war_code: string): Promise<ApiResult<unknown>>
  importData(rows: WarrantyItemImportRow[]): Promise<ApiResult<unknown>>
}

export function createWarrantyItemService(api: ApiClient): WarrantyItemService {
  return {
    readList(params = {}) {
      const skip = params.skip ?? 0
      const take = params.take ?? DEFAULT_TAKE
      const field = params.field ?? 'war_code'
      const text = params.text ?? ''
      const active = params.active ?? 'Y'
      const path = 'CSM/Master/WarrantyItem_ReadList'
        + `?skip=${skip}&take=${take}`
        + `&field=${encodeURIComponent(field)}&text=${encodeURIComponent(text)}&active=${encodeURIComponent(active)}`
      return api.get<WarrantyItemPage>(path)
    },
    readOne(war_code) {
      return api.get<WarrantyItem | null>(`CSM/Master/WarrantyItem_Read?war_code=${encodeURIComponent(war_code)}`)
    },
    create(header) {
      return api.post<unknown>('CSM/Master/WarrantyItem_Create', { header })
    },
    update(header) {
      const { war_code, war_des, type_code, tot_date, tot_month, tot_year, lifetime, itemcode, active } = header
      return api.post<unknown>('CSM/Master/Warrantyitem_Update', {
        header: { war_code, war_des, type_code, tot_date, tot_month, tot_year, lifetime, itemcode, active },
      })
    },
    delete(war_code) {
      return api.post<unknown>('CSM/Master/WarrantyItem_Delete', { header: { war_code } })
    },
    importData(rows) {
      return api.post<unknown>('CSM/Master/WarrantyItemImportData_Master', { data: rows })
    },
  }
}
