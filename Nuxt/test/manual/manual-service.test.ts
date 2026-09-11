import { describe, expect, it, vi } from 'vitest'
import type { ApiClient, ApiResult } from '../../app/services/http/api-client'
import { createManualService } from '../../app/features/manual/manual-service'

function clientReturning<T>(result: ApiResult<T>) {
  return { get: vi.fn().mockResolvedValue(result) } as unknown as ApiClient
}

describe('createManualService', () => {
  it('preserves the legacy date-list endpoint and encodes its query', async () => {
    const result = { ok: true, status: 200, data: { data: [], total: [] } } as const
    const api = clientReturning(result)
    const service = createManualService(api)

    expect(await service.readByDate('01/09/2026', '11/09/2026')).toEqual(result)
    expect(api.get).toHaveBeenCalledWith(
      'CSM/Manual/ManualReadList?start_date=01%2F09%2F2026&end_date=11%2F09%2F2026',
    )
  })

  it('preserves the revision-list endpoint, condition, and exact user values', async () => {
    const result = { ok: true, status: 200, data: { data: [], total: [] } } as const
    const api = clientReturning(result)
    const service = createManualService(api)

    await service.readByRevision('R 1/26', 'R&9', 'between')

    expect(api.get).toHaveBeenCalledWith(
      'CSM/Manual/ManualReadListV2?start_revision=R+1%2F26&end_revision=R%269&condition=between',
    )
  })

  it('preserves and encodes the legacy attachment lookup contract', async () => {
    const result = { ok: true, status: 200, data: [] } as const
    const api = clientReturning(result)
    const service = createManualService(api)

    expect(await service.readAttachments('JOB 1', 'GL', 'R/1')).toEqual(result)
    expect(api.get).toHaveBeenCalledWith(
      'CSM/Manual/ReadPicture?job_no=JOB+1&module=GL&revision=R%2F1',
    )
  })
})
