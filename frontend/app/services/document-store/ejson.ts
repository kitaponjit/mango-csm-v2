/*
 * MongoDB Extended JSON, the subset this store needs.
 *
 * WHY
 * ---
 * Plain JSON has no date type. The real `log_web` collection stores `created` /
 * `updated` as BSON dates — the backend gateway sets them from `DateTime.Now` —
 * and MongoDB never matches a string against a date. Measured against a real
 * mongod with a document whose `created` is a BSON date:
 *
 *     { created: { $gte: "2026-09-16T00:00:00Z" } }             -> 0 matches
 *     { created: { $gte: { $date: "2026-09-16T00:00:00Z" } } }  -> 1 match
 *
 * So a date as a bare ISO string is a different type from a real date. Extended
 * JSON keeps the type without any per-collection schema: `{ "$date": "<ISO>" }`
 * is MongoDB's own JSON spelling of a date, and it is how an export of the real
 * collection writes one.
 *
 * The convention in this frontend-only store:
 *   - document files and filters carry dates as `{ $date: "<ISO>" }`, so the
 *     in-browser engine compares them as dates, the way MongoDB would
 *   - `toClientShape` turns dates into ISO strings and ObjectIds into hex
 *     strings on the way out, so screens receive plain values and never see `$date`
 *
 * Only `$date` (and `$oid` in `toClientShape`) are handled. Other Extended JSON
 * wrappers such as `$numberLong` pass through unchanged.
 */

/** A date in MongoDB Extended JSON form. */
export interface EjsonDate {
  $date: string | number | { $numberLong: string }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)

/** True for `{ $date: ... }` and nothing else — a single-key wrapper. */
export function isEjsonDate(v: unknown): v is EjsonDate {
  if (!isRecord(v)) return false
  const keys = Object.keys(v)
  if (keys.length !== 1 || keys[0] !== '$date') return false
  const inner = v.$date
  return typeof inner === 'string' || typeof inner === 'number' ||
    (isRecord(inner) && typeof inner.$numberLong === 'string')
}

/** Epoch milliseconds for a Date or an Extended JSON date; NaN when invalid. */
export function dateMillis(v: Date | EjsonDate): number {
  if (v instanceof Date) return v.getTime()
  const inner = v.$date
  if (typeof inner === 'number') return inner
  if (typeof inner === 'string') return Date.parse(inner)
  return Number(inner.$numberLong)
}

/**
 * Builds a date for a filter or a document, e.g.
 * `{ created: { $gte: ejsonDate('2026-09-16') } }`. Strings are parsed by
 * `Date`, so a date-only string is UTC midnight and a date-time without an
 * offset is local time; pass a `Date` when that distinction matters.
 */
export function ejsonDate(input: Date | string | number): EjsonDate {
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) throw new Error(`[document-store] invalid date: ${String(input)}`)
  return { $date: d.toISOString() }
}

/**
 * The shape screens receive: Extended JSON dates become ISO strings and
 * `{ $oid }` becomes its hex string, recursively. Everything else is returned
 * unchanged. Applied to every document the store returns, so callers never see
 * the Extended JSON wrappers.
 */
export function toClientShape<T>(value: T): T {
  if (Array.isArray(value)) return value.map(v => toClientShape(v)) as T
  if (!isRecord(value)) return value
  if (isEjsonDate(value)) {
    const ms = dateMillis(value)
    return (Number.isNaN(ms) ? value : new Date(ms).toISOString()) as T
  }
  const keys = Object.keys(value)
  if (keys.length === 1 && keys[0] === '$oid' && typeof value.$oid === 'string') {
    return value.$oid as T
  }
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value)) out[k] = toClientShape(v)
  return out as T
}
