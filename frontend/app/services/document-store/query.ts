/*
 * A MongoDB-style query engine, evaluated in the browser over plain JSON
 * documents.
 *
 * This exists because the documents it queries have no fixed schema. The
 * `log_web` collection is written by the backend's `DataContext.MongoInsertOne`
 * from `GatewayRequest.Log`, which is declared `public object Log { get; set; }`
 * — arbitrary JSON. Every document carries whatever the caller logged, plus
 * `mainname` / `maincode` / `username` / `empno` / `type` and one of
 * `created` / `updated`. So a relational "columns" model does not fit, and the
 * filter language has to work on paths that may be absent from most documents.
 *
 * The operator subset is deliberately the one MongoDB's own find() supports, so
 * a filter written against this engine keeps its meaning when the same filter is
 * eventually sent to a real Mongo query on the server. See ./index.ts — the
 * drivers share the filter shape precisely so call sites survive that move.
 *
 * A NOTE ON THE TYPES. They describe the document model, not a particular
 * collection: `Doc` is deliberately open (an index signature) because a
 * schema-less collection is exactly what this is for. Where a caller does know
 * the shape, `Doc` is generic — `find<LogWebDoc>(...)` narrows the result
 * without forcing every document through the same interface.
 */

// ---------------------------------------------------------------------------
// Document model
// ---------------------------------------------------------------------------

export type Primitive = string | number | boolean | null

/*
 * The object branch is an interface, not an inline type literal. TypeScript
 * resolves interfaces lazily; an inline `{ [k: string]: DocValue }` inside a
 * recursive alias makes the checker expand eagerly, and Vue's template checker
 * then hits "Type instantiation is excessively deep" on a plain `v-for` over
 * these documents.
 */
export interface DocObject { [key: string]: DocValue }

export type DocValue =
  | Primitive
  | Date
  | DocValue[]
  | DocObject

/*
 * Open by design. A document is any JSON object; `_id` is the only field this
 * layer relies on, and even that is synthesised when the source omits it.
 *
 * The index signature is `unknown`, not `DocValue`. Making it `DocValue` looks
 * tighter but pushes the recursive union into every consumer, and Vue's
 * template checker then fails a plain `v-for` over these documents with
 * "Type instantiation is excessively deep". `unknown` costs nothing real —
 * an unknown field has to be narrowed before use either way, and `resolvePath`
 * still returns properly typed `DocValue`s.
 */
export interface Doc {
  _id?: string
  [key: string]: unknown
}

/*
 * A document as it comes back from the store, where `_id` is guaranteed: the
 * json driver synthesises one for any source document that lacks it, and the
 * http driver gets Mongo's. Keeping this separate from `Doc` matters — `Doc` is
 * what you may *write* (no id yet), `StoredDoc` is what you *read*. Without the
 * distinction every `doc._id` use is `string | undefined` and each call site
 * has to re-assert it.
 */
export type StoredDoc<T extends Doc = Doc> = T & { _id: string }

export type ValueType = 'null' | 'number' | 'string' | 'object' | 'array' | 'boolean' | 'date'

// ---------------------------------------------------------------------------
// Filter language
// ---------------------------------------------------------------------------

export interface FilterOperators {
  $eq?: DocValue
  $ne?: DocValue
  $gt?: DocValue
  $gte?: DocValue
  $lt?: DocValue
  $lte?: DocValue
  $in?: DocValue | DocValue[]
  $nin?: DocValue | DocValue[]
  $regex?: string | RegExp
  /** Regex flags, read by a sibling `$regex`. Mirrors MongoDB. */
  $options?: string
  $exists?: boolean
  $type?: ValueType
  $all?: DocValue | DocValue[]
  $size?: number
  $not?: FilterOperators
}

/** A bare value is an implicit `$eq`; a RegExp an implicit `$regex`. */
export type FieldPredicate = DocValue | RegExp | FilterOperators

/**
 * Keys are field paths — dotted paths descend into nested objects and through
 * arrays. `$and` / `$or` / `$nor` combine sub-filters.
 */
export interface Filter {
  $and?: Filter[]
  $or?: Filter[]
  $nor?: Filter[]
  [field: string]: FieldPredicate | Filter[] | undefined
}

export type SortDirection = 1 | -1
export type Sort = Record<string, SortDirection>
/** Inclusive (`1`) or exclusive (`0`), never both — except `_id`, as in MongoDB. */
export type Projection = Record<string, 0 | 1>

export interface QueryOptions {
  sort?: Sort
  skip?: number
  limit?: number | null
  projection?: Projection | null
}

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

/*
 * Resolves "a.b.c" against a document, returning EVERY value reachable by that
 * path. It returns a list rather than a single value because Mongo descends
 * through arrays transparently: with `{ rows: [{ qty: 1 }, { qty: 2 }] }` the
 * path "rows.qty" yields [1, 2], and a filter matches if ANY of them matches.
 */
export function resolvePath(doc: unknown, path: string): DocValue[] {
  const segments = String(path).split('.')
  let current: unknown[] = [doc]

  for (const segment of segments) {
    const next: unknown[] = []
    for (const value of current) {
      if (value === null || value === undefined) continue

      if (Array.isArray(value)) {
        // A numeric segment indexes the array; anything else maps over it.
        if (/^\d+$/.test(segment)) {
          if (segment in value) next.push(value[Number(segment)])
        } else {
          for (const item of value) {
            if (item && typeof item === 'object' && segment in (item as object)) {
              next.push((item as Record<string, unknown>)[segment])
            }
          }
        }
      } else if (typeof value === 'object' && segment in (value as object)) {
        next.push((value as Record<string, unknown>)[segment])
      }
    }
    current = next
    if (!current.length) return []
  }

  return current as DocValue[]
}

const exists = (doc: unknown, path: string): boolean => resolvePath(doc, path).length > 0

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

/*
 * Mongo orders across types, not just within them. This is the subset of its
 * canonical ordering that these documents can actually contain.
 */
const TYPE_RANK: Record<ValueType, number> = {
  null: 0, number: 1, string: 2, object: 3, array: 4, boolean: 5, date: 6
}

export function typeOf(v: unknown): ValueType {
  if (v === null || v === undefined) return 'null'
  if (Array.isArray(v)) return 'array'
  if (v instanceof Date) return 'date'
  const t = typeof v
  if (t === 'number' || t === 'string' || t === 'boolean' || t === 'object') return t as ValueType
  return 'string'
}

/*
 * ISO-8601 strings are compared as dates, because that is how the backend
 * serialises the `created` / `updated` fields — as JSON there is no BSON date
 * type to preserve, so a date arrives as a string and must still sort and
 * range-filter correctly. Plain text ordering gets mixed precision wrong:
 * '…00:00:00.500Z' sorts BEFORE '…00:00:00Z' lexicographically ('.' < 'Z')
 * although it is half a second later.
 *
 * THIS IS THE ONE DELIBERATE DEVIATION FROM MONGODB, and it is measured, not
 * assumed. MongoDB has no such rule — to it these are strings — so on a field
 * mixing date-like and other strings the two disagree. Confirmed against a real
 * mongod with ['2026-01-02T00:00:00Z', 'apple', '2026-01-01T00:00:00.500Z',
 * '2026-01-01T00:00:00Z']:
 *
 *     engine : apple, …01T00:00:00Z, …01T00:00:00.500Z, …02T00:00:00Z
 *     mongo  : …01T00:00:00.500Z, …01T00:00:00Z, …02T00:00:00Z, apple
 *
 * Mongo's order there is exactly lexicographic, and chronologically wrong for
 * the first two. `log_web` is unaffected: created/updated hold only stamps, all
 * written by the same serialiser, so both systems agree on real data. But if a
 * collection ever mixes the two kinds of string in one field, sorting by it
 * will differ between the `json` and `http` drivers.
 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/

interface Coerced { rank: number; value: unknown }

function coerce(v: unknown): Coerced {
  if (v instanceof Date) return { rank: TYPE_RANK.date, value: v.getTime() }
  if (typeof v === 'string' && ISO_DATE.test(v)) {
    const t = Date.parse(v)
    if (!Number.isNaN(t)) return { rank: TYPE_RANK.date, value: t }
  }
  return { rank: TYPE_RANK[typeOf(v)], value: v }
}

export function compare(a: unknown, b: unknown): number {
  const ca = coerce(a)
  const cb = coerce(b)
  if (ca.rank !== cb.rank) return ca.rank < cb.rank ? -1 : 1

  const x = ca.value
  const y = cb.value
  if (x === y) return 0
  if (x === null || x === undefined) return -1
  if (y === null || y === undefined) return 1

  if (typeof x === 'string' && typeof y === 'string') {
    // Thai and English sort side by side in this data, so use locale collation
    // rather than UTF-16 code-unit order.
    return x.localeCompare(y, ['th', 'en'])
  }

  /*
   * Arrays compare element by element, then by length — and objects field by
   * field, comparing the KEY first and then its value, then by field count.
   * That is MongoDB's rule, and without it two objects fell through to
   * `x < y`, which is `false` for any pair of objects: compare(a, b) and
   * compare(b, a) both returned 1, so the comparator was not even
   * antisymmetric and sort order was arbitrary. Caught by query.parity.mts.
   */
  if (Array.isArray(x) && Array.isArray(y)) {
    const len = Math.min(x.length, y.length)
    for (let i = 0; i < len; i += 1) {
      const c = compare(x[i], y[i])
      if (c !== 0) return c
    }
    return x.length === y.length ? 0 : (x.length < y.length ? -1 : 1)
  }

  if (isPlainObject(x) && isPlainObject(y)) {
    const xe = Object.entries(x)
    const ye = Object.entries(y)
    const len = Math.min(xe.length, ye.length)
    for (let i = 0; i < len; i += 1) {
      const [xk, xv] = xe[i] as [string, unknown]
      const [yk, yv] = ye[i] as [string, unknown]
      if (xk !== yk) return xk < yk ? -1 : 1
      const c = compare(xv, yv)
      if (c !== 0) return c
    }
    return xe.length === ye.length ? 0 : (xe.length < ye.length ? -1 : 1)
  }

  return (x as never) < (y as never) ? -1 : 1
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)

function equals(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => equals(v, b[i]))
  }
  if (a && b && typeof a === 'object' && typeof b === 'object' && !(a instanceof Date) && !(b instanceof Date)) {
    const ka = Object.keys(a)
    const kb = Object.keys(b)
    return ka.length === kb.length &&
      ka.every(k => equals((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
  }
  return compare(a, b) === 0
}

const toRegExp = (spec: string | RegExp, options?: string): RegExp =>
  spec instanceof RegExp ? spec : new RegExp(String(spec), options || '')

const toArray = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v])

// ---------------------------------------------------------------------------
// Operators
// ---------------------------------------------------------------------------

type OperatorFn = (
  vals: DocValue[],
  operand: never,
  sibling: FilterOperators,
  doc: unknown,
  path: string
) => boolean

/*
 * MongoDB treats an ABSENT path as null for the equality family: `{ a: null }`
 * matches documents that have no `a` at all, and by the same rule
 * `{ a: { $ne: null } }` does *not* match them. Verified against a real mongod
 * in query.parity.mts — the engine originally got this wrong and matched only
 * documents where the field was explicitly null.
 *
 * It is the equality family only. `{ a: { $gt: 5 } }` still does not match a
 * document without `a`, which falls out of `[].some(...)` naturally.
 */
const eqMatch = (vals: DocValue[], operand: DocValue): boolean =>
  vals.length ? vals.some(v => equals(v, operand)) : operand === null

const inMatch = (vals: DocValue[], operand: DocValue | DocValue[]): boolean =>
  toArray<DocValue>(operand).some(o => eqMatch(vals, o))

/* Each takes the values found at the path and the operand. */
const OPERATORS: Record<string, OperatorFn> = {
  $eq:    (vals, operand) => eqMatch(vals, operand),
  $ne:    (vals, operand) => !eqMatch(vals, operand),
  $gt:    (vals, operand) => vals.some(v => compare(v, operand) > 0),
  $gte:   (vals, operand) => vals.some(v => compare(v, operand) >= 0),
  $lt:    (vals, operand) => vals.some(v => compare(v, operand) < 0),
  $lte:   (vals, operand) => vals.some(v => compare(v, operand) <= 0),
  $in:    (vals, operand) => inMatch(vals, operand),
  $nin:   (vals, operand) => !inMatch(vals, operand),
  $regex: (vals, operand, sibling) => {
    const re = toRegExp(operand as string | RegExp, sibling && sibling.$options)
    return vals.some(v => typeof v === 'string' && re.test(v))
  },
  $type:  (vals, operand) => vals.some(v => typeOf(v) === operand),
  $all:   (vals, operand) => toArray<DocValue>(operand).every(o => vals.some(v => equals(v, o))),
  $size:  (vals, operand) => vals.some(v => Array.isArray(v) && v.length === operand),
  $not:   (vals, operand, _sibling, doc, path) => !matchPath(doc, path, operand as FilterOperators)
}

const isOperatorObject = (v: unknown): v is FilterOperators =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) &&
  Object.keys(v as object).some(k => k.startsWith('$'))

function matchPath(doc: unknown, path: string, predicate: FieldPredicate): boolean {
  // $exists is handled first: it is the one operator that must see an absent
  // path rather than an empty value list.
  if (isOperatorObject(predicate) && '$exists' in predicate) {
    if (exists(doc, path) !== Boolean(predicate.$exists)) return false
    const rest: FilterOperators = { ...predicate }
    delete rest.$exists
    if (!Object.keys(rest).length) return true
    predicate = rest
  }

  const vals = resolvePath(doc, path)

  if (!isOperatorObject(predicate)) {
    // A bare value is an implicit $eq — and a regex literal an implicit $regex.
    if (predicate instanceof RegExp) {
      return OPERATORS.$regex!(vals, predicate as never, {} as FilterOperators, doc, path)
    }
    return OPERATORS.$eq!(vals, predicate as never, {} as FilterOperators, doc, path)
  }

  return Object.entries(predicate).every(([op, operand]) => {
    if (op === '$options') return true // consumed by $regex
    const fn = OPERATORS[op]
    if (!fn) throw new Error(`[document-store] unsupported operator "${op}"`)
    return fn(vals, operand as never, predicate as FilterOperators, doc, path)
  })
}

/*
 * Evaluates a whole filter against one document. An empty filter matches
 * everything, which is what Mongo's find({}) does.
 */
export function matches(doc: unknown, filter?: Filter | null): boolean {
  if (!filter) return true

  return Object.entries(filter).every(([key, value]) => {
    switch (key) {
      case '$and': return toArray(value as Filter[]).every(sub => matches(doc, sub))
      case '$or':  return toArray(value as Filter[]).some(sub => matches(doc, sub))
      case '$nor': return !toArray(value as Filter[]).some(sub => matches(doc, sub))
      default:
        if (key.startsWith('$')) throw new Error(`[document-store] unsupported top-level operator "${key}"`)
        return matchPath(doc, key, value as FieldPredicate)
    }
  })
}

// ---------------------------------------------------------------------------
// Sort / projection
// ---------------------------------------------------------------------------

/** `sort` is Mongo's shape: { field: 1 | -1 }, applied left to right. */
export function sortDocuments<T extends Doc>(docs: T[], sort?: Sort): T[] {
  if (!sort || !Object.keys(sort).length) return docs
  const keys = Object.entries(sort)

  return [...docs].sort((a, b) => {
    for (const [path, direction] of keys) {
      const c = compare(sortKey(a, path, direction), sortKey(b, path, direction))
      if (c !== 0) return direction < 0 ? -c : c
    }
    return 0
  })
}

/*
 * The value MongoDB actually sorts a document by.
 *
 * Where a path resolves to several values — an array field, or a dotted path
 * through an array — Mongo orders by the MINIMUM of them ascending and the
 * MAXIMUM descending, rather than by the array itself. Comparing the arrays
 * wholesale (what this did originally) put documents in the wrong order; caught
 * by query.parity.mts against a real mongod.
 *
 * An absent path sorts as null, which is Mongo's lowest-ranked type.
 */
function sortKey(doc: Doc, path: string, direction: SortDirection): DocValue {
  const vals = resolvePath(doc, path)
  if (!vals.length) return null

  // An array VALUE contributes its elements; an empty array contributes itself.
  const flat: DocValue[] = []
  for (const v of vals) {
    if (Array.isArray(v) && v.length) flat.push(...v)
    else flat.push(v)
  }
  if (!flat.length) return null

  let best = flat[0] as DocValue
  for (const v of flat) {
    const c = compare(v, best)
    if (direction < 0 ? c > 0 : c < 0) best = v
  }
  return best
}

function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const segs = path.split('.')
  let node = target
  for (let i = 0; i < segs.length - 1; i += 1) {
    const key = segs[i] as string
    if (typeof node[key] !== 'object' || node[key] === null) node[key] = {}
    node = node[key] as Record<string, unknown>
  }
  node[segs[segs.length - 1] as string] = value
}

/*
 * Mongo projections are either inclusive ({ a: 1 }) or exclusive ({ a: 0 }),
 * never both — except for _id, which may be excluded from an inclusive one.
 */
export function project<T extends Doc>(doc: T, projection?: Projection | null): Doc {
  if (!projection || !Object.keys(projection).length) return doc

  const entries = Object.entries(projection).filter(([k]) => k !== '_id')
  const including = entries.some(([, v]) => Boolean(v))

  if (including) {
    const out: Doc = {}
    if (projection._id !== 0 && '_id' in doc) out._id = doc._id
    for (const [path, keep] of entries) {
      if (!keep) continue
      const vals = resolvePath(doc, path)
      if (vals.length) setPath(out as Record<string, unknown>, path, vals.length === 1 ? vals[0] : vals)
    }
    return out
  }

  const out = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>
  for (const [path] of entries) {
    const segs = path.split('.')
    let node: Record<string, unknown> | undefined = out
    for (let i = 0; i < segs.length - 1 && node; i += 1) {
      node = node[segs[i] as string] as Record<string, unknown> | undefined
    }
    if (node) delete node[segs[segs.length - 1] as string]
  }
  if (projection._id === 0) delete out._id
  return out as Doc
}

/** The whole find() pipeline over an in-memory array, in Mongo's order. */
export function runQuery<T extends Doc>(docs: T[], filter?: Filter | null, options: QueryOptions = {}): Doc[] {
  let out: Doc[] = docs.filter(d => matches(d, filter))
  out = sortDocuments(out, options.sort)
  if (options.skip) out = out.slice(options.skip)
  if (options.limit != null) out = out.slice(0, options.limit)
  if (options.projection) out = out.map(d => project(d, options.projection))
  return out
}
