/*
 * Document store — the frontend's access layer for schema-less collections.
 *
 * WHY THIS IS NOT A MONGO CLIENT
 * ------------------------------
 * A browser cannot talk to MongoDB. Mongo speaks a binary TCP wire protocol,
 * not HTTP, so any "frontend queries Mongo" design is really "frontend holds a
 * connection string", which hands full database access to every visitor. The
 * repository rule in AGENTS.md says the same thing:
 *
 *   "The frontend must not access SQL Server, SQLite, or MongoDB directly;
 *    persistence belongs behind an API/service boundary."
 *
 * So this layer keeps the *document model* — free-form documents, Mongo filter
 * syntax, no relational schema — and swaps only the transport. Two drivers
 * implement the same interface:
 *
 *   json   reads a JSON document file and runs the query client-side.
 *          What runs today; no backend needed.
 *   http   forwards the same filter to a backend endpoint that runs it against
 *          the real collection. The contract is documented below; when the
 *          endpoint exists, only `configure()` changes — no call site does.
 *
 * ENDPOINT CONTRACT (for whoever implements the backend side)
 * -----------------------------------------------------------
 *   POST <dataServer>CSM/Document/Find
 *     body  { collection, filter, sort, skip, limit, projection }
 *     200   { success: true, data: { documents: [...], total: <int> } }
 *
 *   POST <dataServer>CSM/Document/InsertOne
 *     body  { collection, document }
 *     200   { success: true, data: { insertedId: "<oid>" } }
 *
 *   POST <dataServer>CSM/Document/Distinct
 *     body  { collection, field, filter }
 *     200   { success: true, data: { values: [...] } }
 *
 * `filter`, `sort` and `projection` are passed through to the driver unchanged,
 * which is the point: the same object is valid input to MongoDB's own find().
 * Auth rides the existing `X-Mango-Auth` header that `$xt` already attaches, so
 * no new auth mechanism is introduced.
 *
 * The full contract, including the server-side obligations, is in
 * docs/integration/document-store-contract.md.
 */

import { runQuery, matches, resolvePath } from './query'
import type { Doc, DocValue, Filter, Primitive, QueryOptions, StoredDoc } from './query'

export type {
  Doc, DocObject, DocValue, Filter, FilterOperators, Primitive,
  Projection, QueryOptions, Sort, StoredDoc, ValueType
} from './query'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export type DriverName = 'json' | 'http'

export interface StoreConfig {
  driver: DriverName
  /** Where the json driver looks, relative to `window.baseUrl`. */
  basePath: string
  /** Where the http driver posts, relative to `window.dataServer`. */
  endpoint: string
}

const config: StoreConfig = {
  driver: 'json',
  basePath: 'data/',
  endpoint: 'CSM/Document/'
}

export function configure(next: Partial<StoreConfig> = {}): StoreConfig {
  Object.assign(config, next)
  return { ...config }
}

export const getConfig = (): StoreConfig => ({ ...config })

// ---------------------------------------------------------------------------
// Driver interface
// ---------------------------------------------------------------------------

export interface FindResult<T extends Doc = Doc> {
  documents: StoredDoc<T>[]
  /** Match count BEFORE skip/limit, so callers can paginate. */
  total: number
}

export interface InsertResult {
  insertedId: string
  /** True when the document lives only in this browser session. */
  pending: boolean
}

interface Driver {
  find<T extends Doc>(collection: string, filter?: Filter | null, options?: QueryOptions): Promise<FindResult<T>>
  insertOne(collection: string, document: Doc): Promise<InsertResult>
}

// ---------------------------------------------------------------------------
// json driver — query a JSON document file in the browser
// ---------------------------------------------------------------------------

const cache = new Map<string, Promise<StoredDoc[]>>()

interface DocumentFile {
  documents?: Doc[]
}

/*
 * A document file is either a bare array of documents, or `{ documents: [...] }`
 * so the file can carry metadata alongside them.
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

/** Documents written this session, per collection. See the note on insertOne. */
const pending = new Map<string, StoredDoc[]>()
const pendingFor = (c: string): StoredDoc[] => pending.get(c) || []

const jsonDriver: Driver & { read(collection: string): Promise<StoredDoc[]> } = {
  async read(collection) {
    const stored = await loadFile(collection)
    // Newest first matches how the log is actually read.
    return [...pendingFor(collection), ...stored]
  },

  async find<T extends Doc>(collection: string, filter?: Filter | null, options: QueryOptions = {}) {
    const docs = await this.read(collection)
    return {
      documents: runQuery(docs, filter, options) as StoredDoc<T>[],
      total: docs.filter(d => matches(d, filter)).length
    }
  },

  async insertOne(collection, document) {
    const doc: StoredDoc = {
      ...document,
      _id: document._id || `pending-${Date.now()}-${pendingFor(collection).length}`
    }
    pending.set(collection, [doc, ...pendingFor(collection)])
    return { insertedId: doc._id, pending: true }
  }
}

// ---------------------------------------------------------------------------
// http driver — same filter, evaluated server-side
// ---------------------------------------------------------------------------

async function post(action: string, body: unknown): Promise<Record<string, unknown>> {
  const resp = await $xt.postServerJson(`${config.endpoint}${action}`, body)
  if (!resp || resp.success === false) throw new Error(resp?.error || `${action} failed`)
  return resp.data || {}
}

const httpDriver: Driver = {
  async find<T extends Doc>(collection: string, filter?: Filter | null, options: QueryOptions = {}) {
    const data = await post('Find', {
      collection,
      filter: filter || {},
      sort: options.sort || null,
      skip: options.skip || 0,
      limit: options.limit ?? null,
      projection: options.projection || null
    })
    const documents = (data.documents as StoredDoc<T>[]) || []
    return { documents, total: (data.total as number) ?? documents.length }
  },

  async insertOne(collection, document) {
    const data = await post('InsertOne', { collection, document })
    return { insertedId: data.insertedId as string, pending: false }
  }
}

const driver = (): Driver => (config.driver === 'http' ? httpDriver : jsonDriver)

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
    find: (filter = {}, options = {}) => driver().find<T>(name, filter, options),

    async findOne(filter = {}, options = {}) {
      const { documents } = await driver().find<T>(name, filter, { ...options, limit: 1 })
      return documents[0] || null
    },

    async countDocuments(filter = {}) {
      const { total } = await driver().find(name, filter, { limit: 0 })
      return total
    },

    /*
     * On the json driver a write cannot reach the file — a static asset is not
     * writable from a browser, and inventing a write endpoint would be exactly
     * the "do not invent backend endpoints" case AGENTS.md rules out. So the
     * document is held in this session and merged into subsequent reads, which
     * keeps the screen honest about what it is showing. `pending: true` in the
     * result says the document has not been persisted; callers surface that.
     * Switching `driver` to 'http' makes the identical call durable.
     */
    insertOne: document => driver().insertOne(name, document),

    /** Distinct values at a path — used to populate filter dropdowns. */
    async distinct(field, filter = {}) {
      if (config.driver === 'http') {
        const data = await post('Distinct', { collection: name, field, filter: filter || {} })
        return (data.values as Primitive[]) || []
      }
      const docs = await jsonDriver.read(name)
      const seen = new Set<Primitive>()
      for (const doc of docs) {
        if (!matches(doc, filter)) continue
        for (const v of resolvePath(doc, field)) {
          if (v !== null && v !== undefined && typeof v !== 'object') seen.add(v as Primitive)
        }
      }
      return [...seen].sort()
    },

    /*
     * The set of every field path present across the matched documents. There
     * is no schema to ask, so the UI derives its columns from the data itself.
     */
    async fieldPaths(filter = {}) {
      const { documents } = await driver().find(name, filter, {})
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

    /** Documents inserted this session that the backend has not accepted yet. */
    pendingDocuments: () => [...pendingFor(name)] as StoredDoc<T>[],

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

export { matches, runQuery, resolvePath } from './query'
