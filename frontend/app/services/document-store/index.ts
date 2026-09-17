/*
 * Document store — MongoDB-style queries over schema-less documents, entirely
 * in the frontend.
 *
 * NO BACKEND
 * ----------
 * This store never talks to a server of its own. Documents come from JSON files
 * the app already serves (`public/data/<collection>.json`), and every query runs
 * in the browser through a MongoDB-compatible engine (./query.ts). Nothing here
 * calls `$xt`, `dataServer` or any backend endpoint, and there is no switch
 * that would make it. (The app's normal sign-in still runs, as it does for
 * every screen; that belongs to the auth middleware, not to this store.)
 *
 * WHY NOT MONGODB ITSELF
 * ----------------------
 * A browser cannot reach MongoDB: it speaks a binary TCP wire protocol, not
 * HTTP, so "the frontend queries Mongo" would really mean shipping a connection
 * string into downloadable code. AGENTS.md rules that out as well. So this keeps
 * the *document model* — free-form documents, MongoDB filter syntax, Extended
 * JSON dates — and runs it where the frontend can: in the browser. Query
 * semantics are verified against a real mongod (query.parity.mts), so a filter
 * means here exactly what it means to MongoDB.
 *
 * DATES are MongoDB Extended JSON in the data and in filters,
 * `{ $date: "<ISO>" }` (see ./ejson.ts). Every document returned is passed
 * through `toClientShape`, so callers receive plain ISO strings.
 *
 * WRITES stay in this browser session — see `insertOne` below.
 */

import { runQuery, matches, resolvePath } from './query.ts'
import type { Doc, Filter, Primitive, QueryOptions, StoredDoc } from './query.ts'
import { isEjsonDate, toClientShape } from './ejson.ts'

export type {
  Doc, DocObject, DocValue, Filter, FilterOperators, Primitive,
  Projection, QueryOptions, Sort, StoredDoc, ValueType
} from './query.ts'
export type { EjsonDate } from './ejson.ts'
export { ejsonDate, isEjsonDate, toClientShape } from './ejson.ts'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface StoreConfig {
  /** Folder holding `<collection>.json`, relative to `window.baseUrl`. */
  basePath: string
}

const config: StoreConfig = {
  basePath: 'data/'
}

export function configure(next: Partial<StoreConfig> = {}): StoreConfig {
  Object.assign(config, next)
  cache.clear()
  return { ...config }
}

export const getConfig = (): StoreConfig => ({ ...config })

export interface FindResult<T extends Doc = Doc> {
  documents: StoredDoc<T>[]
  /** Match count BEFORE skip/limit, so callers can paginate. */
  total: number
}

export interface InsertResult {
  insertedId: string
  /** Always true: the document lives only in this browser session. */
  pending: true
}

// ---------------------------------------------------------------------------
// Loading document files
// ---------------------------------------------------------------------------

const cache = new Map<string, Promise<StoredDoc[]>>()

interface DocumentFile {
  documents?: Doc[]
}

/*
 * A document file is either a bare array of documents, or `{ documents: [...] }`
 * so the file can carry metadata alongside them. It is fetched from this app's
 * own origin, like any other static asset.
 */
async function loadFile(collection: string): Promise<StoredDoc[]> {
  if (!cache.has(collection)) {
    const base = (typeof window !== 'undefined' && window.baseUrl) || '/'
    const url = `${base}${config.basePath}${collection}.json`

    const promise = fetch(url, { cache: 'no-cache' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${collection}.json: HTTP ${res.status}`)

        // The Nuxt SPA fallback answers unknown paths with index.html at status
        // 200, so a missing file arrives as HTML rather than as a 404. Without
        // this check the failure surfaces much later as a confusing JSON parse
        // error. (Same trap that silently broke the image URLs — see MIGRATION.md.)
        const type = res.headers.get('content-type') || ''
        if (!type.includes('json')) {
          throw new Error(`${collection}.json: expected JSON, received "${type}" — the file is probably missing`)
        }

        const body = (await res.json()) as Doc[] | DocumentFile
        const docs = Array.isArray(body) ? body : (body.documents || [])
        return docs.map((d, i) => (d._id ? d : { ...d, _id: `local-${i}` }) as StoredDoc)
      })
      .catch((err: unknown) => {
        cache.delete(collection) // let the next call retry
        throw err
      })

    cache.set(collection, promise)
  }
  return cache.get(collection) as Promise<StoredDoc[]>
}

/** Documents inserted this session, per collection. See the note on insertOne. */
const pending = new Map<string, StoredDoc[]>()
const pendingFor = (c: string): StoredDoc[] => pending.get(c) || []

/* Everything a query sees: this session's inserts first, then the file. */
async function read(collection: string): Promise<StoredDoc[]> {
  const stored = await loadFile(collection)
  return [...pendingFor(collection), ...stored]
}

async function find<T extends Doc>(collection: string, filter?: Filter | null, options: QueryOptions = {}): Promise<FindResult<T>> {
  const docs = await read(collection)
  // The query runs on the stored Extended JSON, where dates are still dates;
  // only the result is converted for callers.
  return {
    documents: runQuery(docs, filter, options).map(d => toClientShape(d)) as StoredDoc<T>[],
    total: docs.filter(d => matches(d, filter)).length
  }
}

// ---------------------------------------------------------------------------
// Public API — deliberately mirrors the MongoDB collection methods
// ---------------------------------------------------------------------------

export interface CollectionHandle<T extends Doc = Doc> {
  find(filter?: Filter, options?: QueryOptions): Promise<FindResult<T>>
  findOne(filter?: Filter, options?: QueryOptions): Promise<StoredDoc<T> | null>
  countDocuments(filter?: Filter): Promise<number>
  insertOne(document: Doc): Promise<InsertResult>
  distinct(field: string, filter?: Filter): Promise<Primitive[]>
  fieldPaths(filter?: Filter): Promise<string[]>
  pendingDocuments(): StoredDoc<T>[]
  clearPending(): void
}

export function collection<T extends Doc = Doc>(name: string): CollectionHandle<T> {
  return {
    /** find(filter, { sort, skip, limit, projection }) -> { documents, total } */
    find: (filter = {}, options = {}) => find<T>(name, filter, options),

    async findOne(filter = {}, options = {}) {
      const { documents } = await find<T>(name, filter, { ...options, limit: 1 })
      return documents[0] || null
    },

    async countDocuments(filter = {}) {
      const { total } = await find(name, filter, { limit: 0 })
      return total
    },

    /*
     * A browser cannot write to a file the server serves, and this store has no
     * server of its own by design. So an inserted document is held in this
     * session and merged into every later query, which keeps the screen
     * consistent with what the user just did. `pending: true` says it has not
     * been persisted anywhere; callers surface that. It is gone on reload.
     */
    async insertOne(document) {
      const doc: StoredDoc = {
        ...document,
        _id: document._id || `pending-${Date.now()}-${pendingFor(name).length}`
      }
      pending.set(name, [doc, ...pendingFor(name)])
      return { insertedId: doc._id, pending: true }
    },

    /** Distinct values at a path — used to populate filter dropdowns. */
    async distinct(field, filter = {}) {
      const docs = await read(name)
      const seen = new Set<Primitive>()
      for (const doc of docs) {
        if (!matches(doc, filter)) continue
        for (const v of resolvePath(doc, field)) {
          if (isEjsonDate(v)) seen.add(toClientShape(v) as unknown as string)
          else if (v !== null && v !== undefined && typeof v !== 'object') seen.add(v as Primitive)
        }
      }
      return [...seen].sort()
    },

    /*
     * The set of every field path present across the matched documents. There
     * is no schema to ask, so the UI derives its columns from the data itself.
     */
    async fieldPaths(filter = {}) {
      const { documents } = await find(name, filter, {})
      const paths = new Set<string>()
      const walk = (value: unknown, prefix: string): void => {
        if (value === null || typeof value !== 'object' || value instanceof Date) return
        if (Array.isArray(value)) {
          value.forEach(v => walk(v, prefix))
          return
        }
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          const path = prefix ? `${prefix}.${k}` : k
          paths.add(path)
          walk(v, path)
        }
      }
      documents.forEach(d => walk(d, ''))
      return [...paths].sort()
    },

    /** Documents inserted this session (lost on reload). */
    pendingDocuments: () => pendingFor(name).map(d => toClientShape(d)) as StoredDoc<T>[],

    clearPending() {
      pending.delete(name)
    }
  }
}

/** Drops the cached document files so the next read re-fetches. */
export function invalidate(name?: string): void {
  if (name) cache.delete(name)
  else cache.clear()
}

export { matches, runQuery, resolvePath } from './query.ts'
