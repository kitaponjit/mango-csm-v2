/*
 * Parity harness: this query engine vs. real MongoDB.
 *
 * WHY THIS EXISTS
 * ---------------
 * The store runs MongoDB-style queries entirely in the browser, and the claim
 * that makes that worth anything is that a filter means exactly what it would
 * mean to MongoDB. query.test.mts checks the engine against my reading of
 * MongoDB's semantics. That is not the same as checking it against MongoDB.
 * This test talks only to a throwaway local mongod — never to the app's backend.
 *
 * This runs the identical documents and the identical filters through both and
 * compares the matched _id sets. MongoDB is the specification here, so any
 * divergence is a bug in the engine, not in the expectation.
 *
 * HOW TO RUN
 * ----------
 *     npm run test:parity
 *
 * `mongodb-memory-server` starts a real mongod (it downloads the binary on
 * first run and caches it), so this needs no Docker and no running service. It
 * exits non-zero on any divergence, so it works in CI as-is.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'
import type { Collection, Document } from 'mongodb'
import { EJSON } from 'bson'
import type { Doc, Filter, QueryOptions, StoredDoc } from './query.ts'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..', '..', '..')
const { runQuery } = await import('./query.ts')

const COLL = 'log_web'

interface DocumentFile { documents: StoredDoc[] }
const docs = (JSON.parse(
  readFileSync(resolve(root, 'public', 'data', 'log_web.json'), 'utf8')
) as DocumentFile).documents

/*
 * What MongoDB receives. The engine works on the Extended JSON as written;
 * parsing it turns `{ $date }` into a real BSON date, which is how MongoDB
 * itself would see the same filter.
 */
const toBson = <T,>(value: T): T => EJSON.parse(JSON.stringify(value), { relaxed: true }) as T

// ---------------------------------------------------------------------------
// Cases — every operator the engine claims to support
// ---------------------------------------------------------------------------

interface Case { name: string; filter: Filter; options?: QueryOptions }

const d = (iso: string) => ({ $date: iso })

const CASES: Case[] = [
  { name: 'implicit $eq', filter: { maincode: 'MG' } },
  { name: 'nested dotted path', filter: { 'payload.priority': 'urgent' } },
  { name: 'dotted path through an array', filter: { 'tasks.result': 'pass' } },
  { name: 'field absent from most docs', filter: { satisfaction: 5 } },
  { name: '$gt on an Extended JSON date', filter: { created: { $gt: d('2026-09-16T13:00:00Z') } } },
  { name: '$gte/$lte numeric range', filter: { duration_ms: { $gte: 400, $lte: 1000 } } },
  { name: '$in', filter: { maincode: { $in: ['SK', 'BKF'] } } },
  { name: '$nin', filter: { maincode: { $nin: ['SK', 'BKF'] } } },
  { name: '$ne', filter: { type: { $ne: 'created' } } },
  { name: '$exists true', filter: { error: { $exists: true } } },
  { name: '$exists false', filter: { error: { $exists: false } } },
  { name: '$regex anchored', filter: { action: { $regex: '^case\\.', $options: 'i' } } },
  { name: '$regex substring', filter: { prno: { $regex: '004417' } } },
  { name: '$size on array', filter: { tasks: { $size: 2 } } },
  { name: '$all over array path', filter: { 'files.mime': { $all: ['application/pdf'] } } },
  { name: '$type number', filter: { status_code: { $type: 'number' } } },
  { name: '$type date', filter: { updated: { $type: 'date' } } },
  { name: '$or', filter: { $or: [{ maincode: 'SK' }, { status_code: 500 }] } },
  { name: '$and', filter: { $and: [{ maincode: 'MG' }, { type: 'created' }] } },
  { name: '$nor', filter: { $nor: [{ maincode: 'MG' }, { maincode: 'SK' }] } },
  { name: '$not', filter: { status_code: { $not: { $eq: 200 } } } },
  { name: 'empty filter', filter: {} },
  { name: "compound: the screen's date+text filter", filter: {
      maincode: 'MG',
      $and: [
        { $or: [
          { username: { $regex: 'CSM-2026', $options: 'i' } },
          { prno: { $regex: 'CSM-2026', $options: 'i' } },
          { route: { $regex: 'CSM-2026', $options: 'i' } },
          { action: { $regex: 'CSM-2026', $options: 'i' } }
        ] },
        { $or: [
          { created: { $gte: d('2026-09-16T00:00:00.000Z') } },
          { updated: { $gte: d('2026-09-16T00:00:00.000Z') } }
        ] }
      ]
    } },
  { name: 'sort by created desc', filter: { type: 'created' }, options: { sort: { created: -1 } } },
  { name: 'sort by duration asc', filter: { duration_ms: { $exists: true } }, options: { sort: { duration_ms: 1 } } },
  { name: 'sort + skip + limit', filter: {}, options: { sort: { _id: 1 }, skip: 2, limit: 4 } },

  /*
   * Adversarial cases. The ones above mostly confirm what the engine was
   * written to do; these target the places where a hand-written matcher
   * realistically drifts from MongoDB.
   */
  { name: 'ADV sort asc over a sparse field', filter: {}, options: { sort: { duration_ms: 1 } } },
  { name: 'ADV sort desc over a sparse field', filter: {}, options: { sort: { duration_ms: -1 } } },
  { name: 'ADV sort asc over an array field', filter: {}, options: { sort: { tasks: 1 } } },
  { name: 'ADV sort desc over an array field', filter: {}, options: { sort: { files: -1 } } },
  { name: 'ADV sort over a mixed/object field', filter: {}, options: { sort: { payload: 1 } } },
  // Thai and Latin names side by side — string collation must match MongoDB's.
  { name: 'ADV sort by a Thai/Latin string field', filter: {}, options: { sort: { username: 1, _id: 1 } } },
  { name: 'ADV $ne against an array path', filter: { 'tasks.result': { $ne: 'pass' } } },
  { name: 'ADV $nin against an array path', filter: { 'files.mime': { $nin: ['application/pdf'] } } },
  { name: 'ADV $exists on nested path', filter: { 'payload.customer.code': { $exists: true } } },
  { name: 'ADV $exists false on nested path', filter: { 'comment.visibility': { $exists: false } } },
  { name: 'ADV $regex case sensitivity', filter: { username: { $regex: 'naruemon' } } },
  { name: 'ADV $regex case-insensitive counterpart', filter: { username: { $regex: 'naruemon', $options: 'i' } } },
  { name: 'ADV $in containing null', filter: { satisfaction: { $in: [5, null] } } },
  { name: 'ADV $gt string bound on numeric field', filter: { duration_ms: { $gt: '100' } } },
  { name: 'ADV $eq on a whole sub-document', filter: { comment: { body: 'Confirmed schedule with the customer.', visibility: 'public' } } },
  { name: 'ADV empty $in', filter: { maincode: { $in: [] } } },
  { name: 'ADV empty $nin', filter: { maincode: { $nin: [] } } },

  /*
   * Regression cases for divergences this harness caught.
   */
  // MongoDB's "an absent path is null" rule.
  { name: 'REG { field: null } matches documents missing the field', filter: { satisfaction: null } },
  { name: 'REG $ne null does NOT match a missing field', filter: { satisfaction: { $ne: null } } },
  { name: 'REG $ne null on a nested path', filter: { 'payload.priority': { $ne: null } } },
  { name: 'REG $in [null] alone', filter: { error: { $in: [null] } } },
  { name: 'REG $nin [null] is its negation', filter: { error: { $nin: [null] } } },
  // Array sort: min ascending, max descending.
  { name: 'REG sort asc by a dotted path through an array', filter: {}, options: { sort: { 'tasks.hours': 1 } } },
  { name: 'REG sort desc by a dotted path through an array', filter: {}, options: { sort: { 'tasks.hours': -1 } } },
  { name: 'REG sort asc by array of objects', filter: {}, options: { sort: { files: 1 } } },
  // Dates. The collection stores BSON dates; a bare ISO string never matches
  // them, which is how the screen's date filter used to fail silently.
  { name: 'REG ISO string against a date field matches nothing', filter: { created: { $gte: '2026-09-16T00:00:00Z' } } },
  { name: 'REG date bound in another offset (+07:00)', filter: { created: { $lt: d('2026-09-16T17:00:00+07:00') } } },
  // Type bracketing: range operators never compare across types.
  { name: 'REG $lt string bound matches no number', filter: { duration_ms: { $lt: '100' } } },
  { name: 'REG $gt number bound matches no string', filter: { maincode: { $gt: 0 } } },
  { name: 'REG $gte null', filter: { satisfaction: { $gte: null } } },
  { name: 'REG $lte null', filter: { error: { $lte: null } } },
  { name: 'REG $gt null matches nothing', filter: { satisfaction: { $gt: null } } }
]

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

console.log('starting in-memory mongod (first run downloads the binary)…')
const mongod = await MongoMemoryServer.create()
const client = new MongoClient(mongod.getUri())

let pass = 0
let fail = 0

function report(name: string, ordered: boolean, mine: string[], theirs: string[]): void {
  // Without a sort neither system defines an order, so compare as sets.
  const norm = (a: string[]): string => JSON.stringify(ordered ? a : [...a].sort())
  const ok = norm(mine) === norm(theirs)
  ok ? pass++ : fail++
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}  (${theirs.length} matched)`)
  if (!ok) {
    console.log(`        mine  = ${JSON.stringify(mine.map(i => i.slice(-4)))}`)
    console.log(`        mongo = ${JSON.stringify(theirs.map(i => i.slice(-4)))}`)
  }
}

async function mongoIds(coll: Collection<Document>, filter: Filter, opts: QueryOptions): Promise<string[]> {
  let cursor = coll.find(toBson(filter) as Document, { projection: { _id: 1 } })
  if (opts.sort) cursor = cursor.sort(opts.sort)
  if (opts.skip) cursor = cursor.skip(opts.skip)
  if (opts.limit != null) cursor = cursor.limit(opts.limit)
  return (await cursor.toArray()).map(x => String(x._id))
}

const engineIds = (source: Doc[], filter: Filter, opts: QueryOptions): string[] =>
  (runQuery(source, filter, opts) as StoredDoc[]).map(x => x._id)

try {
  await client.connect()
  const db = client.db('mango_parity')
  const coll = db.collection(COLL)

  /*
   * Loaded through Extended JSON, so `created` / `updated` are real BSON dates
   * — the shape the backend gateway writes from `DateTime.Now`. (This harness
   * originally stored them as strings, on the mistaken belief that strings were
   * what the collection held; that is exactly why the string-vs-date filter bug
   * passed here unnoticed.)
   */
  await coll.insertMany(toBson(docs) as unknown as Document[])
  const loaded = await coll.countDocuments({})
  const dated = await coll.countDocuments({ created: { $type: 'date' } })
  console.log(`loaded ${loaded} documents into a real mongod (${dated} with a BSON date in created)\n`)

  for (const c of CASES) {
    const opts = c.options || {}
    report(c.name, Boolean(opts.sort), engineIds(docs, c.filter, opts), await mongoIds(coll, c.filter, opts))
  }

  /*
   * Sorting values the sample documents do not contain. The engine used to
   * promote ISO-looking strings to dates, which made this ordering differ from
   * MongoDB's; with dates carried as Extended JSON that coercion is gone.
   */
  const probes: Array<{ name: string; values: unknown[] }> = [
    { name: 'mixed date-like and plain strings stay strings', values: ['2026-01-02T00:00:00Z', 'apple', '2026-01-01T00:00:00.500Z', '2026-01-01T00:00:00Z'] },
    { name: 'mixed-precision dates order as instants', values: [d('2026-01-02T00:00:00Z'), d('2026-01-01T00:00:00.500Z'), d('2026-01-01T00:00:00Z')] },
    { name: 'mixed types order by MongoDB type rank', values: [d('2026-01-01T00:00:00Z'), 'text', 42, null, true, { a: 1 }, [1]] }
  ]
  for (const p of probes) {
    const probeDocs = p.values.map((v, i) => ({ _id: `p${i}`, v })) as StoredDoc[]
    const probeColl = db.collection(`probe_${pass + fail}`)
    await probeColl.insertMany(toBson(probeDocs) as unknown as Document[])
    for (const dir of [1, -1] as const) {
      const opts: QueryOptions = { sort: { v: dir, _id: 1 } }
      report(`PROBE ${p.name} (${dir === 1 ? 'asc' : 'desc'})`, true,
        engineIds(probeDocs, {}, opts), await mongoIds(probeColl, {}, opts))
    }
  }
} finally {
  await client.close()
  await mongod.stop()
}

console.log(`\n${pass} passed, ${fail} failed  (against real MongoDB)`)
process.exit(fail ? 1 : 0)
