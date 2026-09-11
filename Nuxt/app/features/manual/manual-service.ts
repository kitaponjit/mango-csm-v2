import type { ApiClient, ApiResult } from '~/services/http/api-client'
import type { ManualAttachment, ManualListPayload, RevisionCondition } from './manual-model'

export interface ManualService {
  readByDate(startDate: string, endDate: string): Promise<ApiResult<ManualListPayload>>
  readByRevision(startRevision: string, endRevision: string, condition: RevisionCondition): Promise<ApiResult<ManualListPayload>>
  readAttachments(jobNumber: string, module: string, revision: string): Promise<ApiResult<ManualAttachment[]>>
}

function withQuery(path: string, parameters: Record<string, string>) {
  return `${path}?${new URLSearchParams(parameters).toString()}`
}

export function createManualService(api: ApiClient): ManualService {
  return {
    readByDate(startDate, endDate) {
      return api.get<ManualListPayload>(withQuery('CSM/Manual/ManualReadList', {
        start_date: startDate,
        end_date: endDate,
      }))
    },
    readByRevision(startRevision, endRevision, condition) {
      return api.get<ManualListPayload>(withQuery('CSM/Manual/ManualReadListV2', {
        start_revision: startRevision,
        end_revision: endRevision,
        condition,
      }))
    },
    readAttachments(jobNumber, module, revision) {
      return api.get<ManualAttachment[]>(withQuery('CSM/Manual/ReadPicture', {
        job_no: jobNumber,
        module,
        revision,
      }))
    },
  }
}
