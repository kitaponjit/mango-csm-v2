/**
 * Slice-local import mapper for the mas_001 ImportData contract.
 *
 * LEGACY-EXACT (v_csm_mas_001 arrImport + WarrantyGroup_ImportData): the admin
 * maps spreadsheet columns (default A/B/C) to Code/Name/Active, and the page
 * posts the mapped row array as `{ data: [...] }` JSON. This is deliberately
 * NOT a shared importer: the sibling QCItem slice uploads a file for
 * backend-side parsing, while mas_001 maps client-side and posts rows.
 * No multipart handling lives here — that endpoint is out of scope.
 *
 * Server-owned semantics (asserted at contract level, never reimplemented):
 * per-tenant upsert, blank-code skip, Active coercion, IMPORT audit stamp,
 * and preservation of an existing row's default_ state. The mapper mirrors
 * the skip/coercion client-side only so the live preview matches the outcome;
 * the client sends Code/Name/Active per row and nothing else (no default_,
 * no tenant fields, no audit fields).
 */

export interface WarrantyGroupImportMapping {
  type_code: string
  type_name: string
  active: string
}

export interface WarrantyGroupImportRow {
  type_code: string
  type_name: string
  active: string
}

/** Legacy default mapping: spreadsheet column A → Code, B → Name, C → Active. */
export const DEFAULT_IMPORT_MAPPING: WarrantyGroupImportMapping = {
  type_code: 'A',
  type_name: 'B',
  active: 'C',
}

function normalizeColumnLetter(value: unknown) {
  return (value === null || value === undefined ? '' : String(value)).trim().toUpperCase()
}

function cellText(value: unknown) {
  return (value === null || value === undefined ? '' : String(value)).trim()
}

/**
 * Backend-exact Active coercion: only a trimmed, case-insensitive `Y`
 * survives; every other input lands as `N`.
 */
export function coerceImportActive(value: unknown): 'Y' | 'N' {
  return cellText(value).toUpperCase() === 'Y' ? 'Y' : 'N'
}

export function mapImportRows(
  sheetRows: Record<string, unknown>[],
  mapping: Partial<WarrantyGroupImportMapping> = {},
): WarrantyGroupImportRow[] {
  const codeColumn = normalizeColumnLetter(mapping.type_code ?? DEFAULT_IMPORT_MAPPING.type_code)
  const nameColumn = normalizeColumnLetter(mapping.type_name ?? DEFAULT_IMPORT_MAPPING.type_name)
  const activeColumn = normalizeColumnLetter(mapping.active ?? DEFAULT_IMPORT_MAPPING.active)

  const rows: WarrantyGroupImportRow[] = []
  for (const sheetRow of sheetRows) {
    if (typeof sheetRow !== 'object' || sheetRow === null || Array.isArray(sheetRow)) {
      continue
    }
    const cells = sheetRow as Record<string, unknown>
    const lookup = (column: string) => {
      for (const key of Object.keys(cells)) {
        if (key.trim().toUpperCase() === column) {
          return cells[key]
        }
      }
      return undefined
    }
    // Blank-code rows are skipped — the server drops them the same way.
    const type_code = cellText(lookup(codeColumn))
    if (!type_code) {
      continue
    }
    rows.push({
      type_code,
      type_name: cellText(lookup(nameColumn)),
      active: coerceImportActive(lookup(activeColumn)),
    })
  }
  return rows
}

/**
 * Minimal slice-local sheet staging: pasted tab/comma-separated rows become
 * letter-keyed sheet rows (A, B, C, …) for the mapper. Empty lines are
 * skipped. This is staging for the mapped-rows upload only — not a parser
 * abstraction.
 */
export function parsePastedImportSheet(text: string): Record<string, string>[] {
  const rows: Record<string, string>[] = []
  for (const line of String(text ?? '').split(/\r?\n/)) {
    const cells = (line.includes('\t') ? line.split('\t') : line.split(',')).map(cell => cell.trim())
    if (cells.every(cell => cell === '')) {
      continue
    }
    const row: Record<string, string> = {}
    cells.forEach((cell, index) => {
      row[String.fromCharCode('A'.charCodeAt(0) + index)] = cell
    })
    rows.push(row)
  }
  return rows
}
