import type { ApiClient, ApiResult } from '~/services/http/api-client'
import type { WarrantyGroupImportRow } from './warranty-group-import'
import { DEFAULT_TAKE, type WarrantyGroup, type WarrantyGroupListParams, type WarrantyGroupPage } from './warranty-group-model'

export interface WarrantyGroupCreateInput {
  type_code: string
  type_name: string
  active: string
}

export interface WarrantyGroupUpdateInput {
  type_code: string
  type_name: string
  active: string
}

export interface WarrantyGroupRowHeader {
  type_code: string
  type_name: string
  default_: string
  active: string
}

export interface WarrantyGroupService {
  readList(params?: Partial<WarrantyGroupListParams>): Promise<ApiResult<WarrantyGroupPage>>
  readOne(type_code: string): Promise<ApiResult<WarrantyGroup | null>>
  create(input: WarrantyGroupCreateInput): Promise<ApiResult<unknown>>
  update(input: WarrantyGroupUpdateInput): Promise<ApiResult<unknown>>
  remove(row: WarrantyGroupRowHeader): Promise<ApiResult<unknown>>
  updateDefault(row: WarrantyGroupRowHeader): Promise<ApiResult<unknown>>
  importData(rows: WarrantyGroupImportRow[]): Promise<ApiResult<unknown>>
  exportFile(): Promise<ApiResult<string>>
  downloadTemplate(): Promise<ApiResult<string>>
}

export function createWarrantyGroupService(api: ApiClient): WarrantyGroupService {
  return {
    readList(params = {}) {
      const skip = params.skip ?? 0
      const take = params.take ?? DEFAULT_TAKE
      const field = params.field ?? 'type_code'
      const text = params.text ?? ''
      const active = params.active ?? 'Y'
      const path = 'CSM/Master/WarrantyGroup_ReadList'
        + `?skip=${skip}&take=${take}`
        + `&field=${encodeURIComponent(field)}`
        + `&text=${encodeURIComponent(text)}`
        + `&active=${encodeURIComponent(active)}`
      return api.get<WarrantyGroupPage>(path)
    },
    readOne(type_code) {
      return api.get<WarrantyGroup | null>(`CSM/Master/WarrantyGroup_Read?type_code=${encodeURIComponent(type_code)}`)
    },
    create(input) {
      return api.post<unknown>('CSM/Master/WarrantyGroup_Create', {
        header: {
          type_code: input.type_code.trim(),
          type_name: input.type_name.trim(),
          active: input.active,
        },
      })
    },
    update(input) {
      // Code is immutable: it is only the lookup key. The default flag is
      // never sent — the backend Update writes type_name + active only.
      return api.post<unknown>('CSM/Master/WarrantyGroup_Update', {
        header: {
          type_code: input.type_code.trim(),
          type_name: input.type_name.trim(),
          active: input.active,
        },
      })
    },
    remove(row) {
      // Hard delete: the server blocks only on warranty-item usage. Default
      // rows stay deletable — no client guard of any kind.
      return api.post<unknown>('CSM/Master/WarrantyGroup_Delete', {
        header: {
          type_code: row.type_code,
          type_name: row.type_name,
          default_: row.default_,
          active: row.active,
        },
      })
    },
    updateDefault(row) {
      // Verified legacy contract (v_csm_mas_001 UpdateDefault): the row header
      // is posted with default_ carrying the toggled value. The backend owns
      // the blanket-reset + selected-row write in one transaction (Y to N is
      // allowed and may leave zero defaults — reproduced, never repaired).
      return api.post<unknown>('CSM/Master/WarrantyGroup_UpdateD', {
        header: {
          type_code: row.type_code,
          type_name: row.type_name,
          default_: row.default_,
          active: row.active,
        },
      })
    },
    importData(rows) {
      // LEGACY-EXACT (v_csm_mas_001 onImport → WarrantyGroup_ImportData): the
      // page posts the frontend-mapped row array as `{ data: [...] }` JSON —
      // Code/Name/Active per row, nothing else. The server owns per-tenant
      // upsert, blank-code skip, Active coercion, the IMPORT audit stamp, and
      // preservation of an existing row's default_ state. No file upload and
      // no multipart handling: the unused multipart endpoint is out of scope.
      return api.post<unknown>('CSM/Master/WarrantyGroup_ImportData', {
        data: rows.map(row => ({
          type_code: row.type_code,
          type_name: row.type_name,
          active: row.active,
        })),
      })
    },
    exportFile() {
      // Full tenant dataset in the verified 7-column server format: the
      // backend mints a file token (no paging params — never the loaded page).
      return api.get<string>('CSM/Master/WarrantyGroup_ExportExcel')
    },
    downloadTemplate() {
      // Header-only 3-column import template, likewise via a file token.
      return api.get<string>('CSM/Master/TemplateExcelWarrantyGroup')
    },
  }
}
