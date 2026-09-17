import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const legacyPath = new URL(
  '../../../../Website/Scripts/App/Application/Components/Pages/Master/v_csm_mas_008.vue',
  import.meta.url,
)
const targetPath = new URL(
  '../../../../frontend/app/Components/Pages/Master/v_csm_mas_008.vue',
  import.meta.url,
)

const legacySource = readFileSync(legacyPath, 'utf8')
const targetSource = readFileSync(targetPath, 'utf8')

function findMatchingBrace(source: string, openingBrace: number): number {
  let depth = 0
  let quote: string | null = null
  let lineComment = false
  let blockComment = false

  for (let index = openingBrace; index < source.length; index += 1) {
    const character = source[index]
    const nextCharacter = source[index + 1]

    if (lineComment) {
      if (character === '\n') lineComment = false
      continue
    }

    if (blockComment) {
      if (character === '*' && nextCharacter === '/') {
        blockComment = false
        index += 1
      }
      continue
    }

    if (quote) {
      if (character === '\\') {
        index += 1
      } else if (character === quote) {
        quote = null
      }
      continue
    }

    if (character === '/' && nextCharacter === '/') {
      lineComment = true
      index += 1
      continue
    }

    if (character === '/' && nextCharacter === '*') {
      blockComment = true
      index += 1
      continue
    }

    if (character === "'" || character === '"' || character === '`') {
      quote = character
      continue
    }

    if (character === '{') depth += 1
    if (character === '}') {
      depth -= 1
      if (depth === 0) return index
    }
  }

  throw new Error('Could not find the end of the delegated undo-start handler')
}

function extractUndoStartHandler(source: string): string {
  const marker = "$(el).on('click', '.ag-btn-start', function(e) {"
  const markerIndex = source.indexOf(marker)
  if (markerIndex < 0) throw new Error('Could not find the delegated undo-start handler')

  const openingBrace = source.indexOf('{', markerIndex)
  const closingBrace = findMatchingBrace(source, openingBrace)
  const body = source.slice(openingBrace + 1, closingBrace)

  return body
}

function runUndoStartHandler(source: string) {
  const clickedRow = {
    data: (key: string) => (key === 'row' ? 0 : undefined),
  }
  const item = {
    active: 'Y',
    _justStarted: true,
    startdate: '2026-09-18',
    enddate: '2027-09-18',
  }
  let refreshCount = 0
  const filteredWarranty = [item]
  const self = {
    $set(target: Record<string, unknown>, key: string, value: unknown) {
      target[key] = value
    },
    refreshAreaTable() {
      refreshCount += 1
    },
    startWarrantybyItem() {
      throw new Error('The undo branch should not start warranty again')
    },
  }
  const dollar = (value: typeof clickedRow) => ({
    data: (key: string) => value.data(key),
  })
  const handler = extractUndoStartHandler(source)

  try {
    const callback = new Function(
      '$',
      'filteredWarranty',
      'startIdx',
      'idx',
      'self',
      `return function(e) {${handler}}`,
    )(dollar, filteredWarranty, 0, 0, self) as (event: { preventDefault(): void }) => void
    callback.call(clickedRow, { preventDefault() {} })
    return {
      kind: 'success' as const,
      item,
      refreshCount,
    }
  } catch (error) {
    return {
      kind: 'error' as const,
      message: error instanceof Error ? error.message : String(error),
      item,
      refreshCount,
    }
  }
}

describe('v_csm_mas_008 undo-start parity', () => {
  it('resets the clicked unsaved warranty row exactly as Legacy does', () => {
    const legacyResult = runUndoStartHandler(legacySource)

    expect(legacyResult).toEqual({
      kind: 'success',
      item: {
        active: 'N',
        _justStarted: false,
        startdate: null,
        enddate: null,
      },
      refreshCount: 1,
    })

    expect(runUndoStartHandler(targetSource)).toEqual(legacyResult)
  })
})
