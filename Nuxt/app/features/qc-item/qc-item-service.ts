import type { ApiClient, ApiResult } from '~/services/http/api-client'
import type { EditableQCItem, QCItem } from './qc-item-model'

export interface QCItemService {
  readList(): Promise<ApiResult<QCItem[]>>
  create(items: EditableQCItem[]): Promise<ApiResult<unknown>>
  importFile(file: File): Promise<ApiResult<unknown>>
  exportFile(): Promise<ApiResult<string>>
}

export function createQCItemService(api: ApiClient): QCItemService {
  return {
    readList() {
      return api.get<QCItem[]>('CSM/Master/QCItem_ReadList')
    },
    create(items) {
      const payload = items.map(({ itemno, itemname, remark, line_number }) => ({ itemno, itemname, remark, line_number }))
      return api.post<unknown>('CSM/Master/QCItem_Create', { item: payload })
    },
    importFile(file) {
      const form = new FormData()
      form.append('file', file)
      return api.postForm<unknown>('CSM/Master/QCItem_Import', form)
    },
    exportFile() {
      return api.get<string>('CSM/Master/QCItem_ExportExcel')
    },
  }
}
