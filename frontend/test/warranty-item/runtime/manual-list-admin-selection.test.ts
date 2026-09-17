import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

interface ManualListRow {
  job_no: string
  itemno: number
  isCheckData: boolean
}

interface SelectionHarness {
  row: ManualListRow
  selectedCount: number
}

interface Checkbox {
  data(key: 'jobno' | 'itemno'): string | number
  is(selector: string): boolean
}

interface SelectionViewModel {
  data: ManualListRow[]
  $set(target: ManualListRow, key: 'isCheckData', value: boolean): void
}

interface LinqResult {
  where(predicate: (item: ManualListRow) => boolean): {
    firstOrDefault(): ManualListRow | undefined
  }
}

type JQueryLike = (value: Checkbox) => Checkbox
type LinqLike = (items: ManualListRow[]) => LinqResult

const here = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(here, '../../../..')
const legacyComponent = readFileSync(
  resolve(repositoryRoot, 'Website/Scripts/App/Application/Components/Pages/Manual/v_csm_manual_list_admin.vue'),
  'utf8',
)
const targetComponent = readFileSync(
  resolve(repositoryRoot, 'frontend/app/Components/Pages/Manual/v_csm_manual_list_admin.vue'),
  'utf8',
)

function checkboxHandlerBody(component: string): string {
  const marker = "$(document).on('change', '.chk-select-row', function(e) {"
  const start = component.indexOf(marker)
  if (start < 0) throw new Error('checkbox change handler not found')

  const bodyStart = start + marker.length
  const bodyEnd = component.indexOf('\n          });', bodyStart)
  if (bodyEnd < 0) throw new Error('checkbox change handler terminator not found')

  return component.slice(bodyStart, bodyEnd)
}

function invokeCheckboxHandler(handlerBody: string): SelectionHarness {
  const row: ManualListRow = {
    job_no: 'CSM-001',
    itemno: 1,
    isCheckData: false,
  }
  const self: SelectionViewModel = {
    data: [row],
    $set(target, key, value) {
      target[key] = value
    },
  }
  const checkbox: Checkbox = {
    data(key: 'jobno' | 'itemno') {
      return key === 'jobno' ? row.job_no : row.itemno
    },
    is(selector: string) {
      return selector === ':checked'
    },
  }
  const $: JQueryLike = (value) => value
  const $linq: LinqLike = (items) => ({
    where(predicate: (item: ManualListRow) => boolean) {
      return {
        firstOrDefault() {
          return items.find(predicate)
        },
      }
    },
  })

  const handler = new Function('$', '$linq', 'self', handlerBody) as (
    this: Checkbox,
    $: JQueryLike,
    $linq: LinqLike,
    self: SelectionViewModel,
  ) => void
  handler.call(checkbox, $, $linq, self)

  return {
    row,
    selectedCount: self.data.filter((item) => item.isCheckData).length,
  }
}

describe('v_csm_manual_list_admin checkbox selection parity', () => {
  it('marks the matched row selected so downstream update-list submission can consume it', () => {
    const legacy = invokeCheckboxHandler(checkboxHandlerBody(legacyComponent))
    expect(legacy.row.isCheckData).toBe(true)
    expect(legacy.selectedCount).toBe(1)

    const target = invokeCheckboxHandler(checkboxHandlerBody(targetComponent))
    expect(target.row.isCheckData).toBe(true)
    expect(target.selectedCount).toBe(1)
  })
})
