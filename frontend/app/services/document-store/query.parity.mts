/*
 * Parity harness: this query engine vs. real MongoDB.
 *
 * WHY THIS EXISTS
 * ---------------
 * The whole design rests on one claim — that a filter built in the browser is
 * *also* valid input to MongoDB's own find(), so switching the store's driver
 * from `json` to `http` cannot change what a query means. query.test.mts checks
 * the engine against my reading of MongoDB's semantics. That is not the same as
 * checking it against MongoDB.
 *
 * This runs the identical documents and the identical filters through both and
 * compares the matched _id sets. MongoDB is the specification here, so any
 * divergence is a bug in the engine, not in the expectation.
 *
 * HOW TO RUN
 * ----------
 *     node app/services/document-store/query.parity.mts
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
import type { Filter, QueryOptions, StoredDoc } from './query.ts'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..', '..', '..')
const { runQuery } = await import('./query.ts')

const COLL = 'log_web'

interface DocumentFile { documents: StoredDoc[] }
const docs = (JSON.parse(
  readFileSync(resolve(root, 'public', 'data', 'log_web.json'), 'utf8')
) as DocumentFile).documents

// ---------------------------------------------------------------------------
// Cases — every operator the engine claims to support
// ---------------------------------------------------------------------------

interface Case { name: string; filter: Filter; options?: QueryOptions }

const CASES: Case[] = [
  { name: 'implicit $eq', filter: { maincode: 'MG' } },
  { name: 'nested dotted path', filter: { 'payload.priority': 'urgent' } },
  { name: 'dotted path through an array', filter: { 'tasks.result': 'pass' } },
  { name: 'field absent from most docs', filter: { satisfaction: 5 } },
  { name: '$gt on ISO date string', filter: { created: { $gt: '2026-09-16T13:00:00Z' } } },
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
  { name: '$type string', filter: { status_code: { $type: 'number' } } },
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
          { created: { $gte: '2026-09-16T00:00:00.000Z' } },
          { updated: { $gte: '2026-09-16T00:00:00.000Z' } }
        ] }
      ]
    } },
  // Sorting is where the engine's cross-type ordering and its date-as-string
  // handling could most plausibly diverge.
  { name: 'sort by created desc', filter: { type: 'created' }, options: { sort: { created: -1 } } },
  { name: 'sort by duration asc', filter: { duration_ms: { $exists: true } }, options: { sort: { duration_ms: 1 } } },
  { name: 'sort + skip + limit', filter: {}, options: { sort: { _id: 1 }, skip: 2, limit: 4 } },

  /*
   * Adversarial cases. The ones above mostly confirm what the engine was
   * written to do; these target the places where a hand-written matcher
   * realistically drifts from MongoDB.
   */
  // Missing fields participate in a sort. Mongo treats an absent path as null
  // and orders nulls FIRST ascending — 3 of these documents have no duration_ms.
  { name: 'ADV sort asc over a sparse field', filter: {}, options: { sort: { duration_ms: 1 } } },
  { name: 'ADV sort desc over a sparse field', filter: {}, options: { sort: { duration_ms: -1 } } },
  // Sorting a field that is an ARRAY in some documents: Mongo orders by the
  // minimum element ascending and the maximum descending.
  { name: 'ADV sort asc over an array field', filter: {}, options: { sort: { tasks: 1 } } },
  { name: 'ADV sort desc over an array field', filter: {}, options: { sort: { files: -1 } } },
  // Sorting a field holding objects in some documents — cross-type ordering.
  { name: 'ADV sort over a mixed/object field', filter: {}, options: { sort: { payload: 1 } } },
  // $ne against an array path excludes documents where ANY element matches.
  { name: 'ADV $ne against an array path', filter: { 'tasks.result': { $ne: 'pass' } } },
  { name: 'ADV $nin against an array path', filter: { 'files.mime': { $nin: ['application/pdf'] } } },
  // $exists on a nested dotted path, and on a path below an array.
  { name: 'ADV $exists on nested path', filter: { 'payload.customer.code': { $exists: true } } },
  { name: 'ADV $exists false on nested path', filter: { 'comment.visibility': { $exists: false } } },
  // $regex WITHOUT $options must be case-sensitive.
  { name: 'ADV $regex case sensitivity', filter: { username: { $regex: 'naruemon' } } },
  { name: 'ADV $regex case-insensitive counterpart', filter: { username: { $regex: 'naruemon', $options: 'i' } } },
  // null in $in matches both explicit null and a missing field in MongoDB.
  { name: 'ADV $in containing null', filter: { satisfaction: { $in: [5, null] } } },
  // Comparing across types: a string bound against numeric values.
  { name: 'ADV $gt string bound on numeric field', filter: { duration_ms: { $gt: '100' } } },
  // $eq against a whole sub-document requires exact field order in MongoDB.
  { name: 'ADV $eq on a whole sub-document', filter: { comment: { body: 'Confirmed schedule with the customer.', visibility: 'public' } } },
  // An empty $in matches nothing; an empty $nin matches everything.
  { name: 'ADV empty $in', filter: { maincode: { $in: [] } } },
  { name: 'ADV empty $nin', filter: { maincode: { $nin: [] } } },

  /*
   * Regression cases for the two divergences this harness actually caught.
   * Both are MongoDB's "an absent path is null" rule, which the engine did not
   * originally implement.
   */
  { name: 'REG { field: null } matches documents missing the field', filter: { satisfaction: null } },
  { name: 'REG $ne null does NOT match a missing field', filter: { satisfaction: { $ne: null } } },
  { name: 'REG $ne null on a nested path', filter: { 'payload.priority': { $ne: null } } },
  { name: 'REG $in [null] alone', filter: { error: { $in: [null] } } },
  { name: 'REG $nin [null] is its negation', filter: { error: { $nin: [null] } } },
  // And the array-sort rule: min ascending, max descending.
  { name: 'REG sort asc by a dotted path through an array', filter: {}, options: { sort: { 'tasks.hours': 1 } } },
  { name: 'REG sort desc by a dotted path through an array', filter: {}, options: { sort: { 'tasks.hours': -1 } } },
  { name: 'REG sort asc by array of objects', filter: {}, options: { sort: { files: 1 } } }
]

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

console.log('starting in-memory mongod (first run downloads the binary)…')
const mongod = await MongoMemoryServer.create()
const client = new MongoClient(mongod.getUri())

let pass = 0
let fail = 0

try {
  await client.connect()
  const db = client.db('mango_parity')
  const coll = db.collection(COLL)

  /*
   * `created` / `updated` are inserted as STRINGS on purpose. That is how they
   * arrive over JSON from the backend — JSON has no BSON date type — and
   * ordering them correctly in that form is precisely what the engine has to
   * get right. Converting them to real dates here would test a shape the
   * frontend never sees.
   */
  await coll.insertMany(docs as unknown as Record<string, unknown>[])
  const loaded = await coll.countDocuments({})
  console.log(`loaded ${loaded} documents into a real mongod\n`)

  for (const c of CASES) {
    const opts = c.options || {}

    const mineIds = (runQuery(docs, c.filter, opts) as StoredDoc[]).map(d => d._id)

    let cursor = coll.find(c.filter as never, { projection: { _id: 1 } })
    if (opts.sort) cursor = cursor.sort(opts.sort as never)
    if (opts.skip) cursor = cursor.skip(opts.skip)
    if (opts.limit != null) cursor = cursor.limit(opts.limit)
    const theirIds = (await cursor.toArray()).map(d => String(d._id))

    // Without a sort neither system defines an order, so compare as sets;
    // the sorted cases compare sequences.
    const norm = (a: string[]): string => JSON.stringify(opts.sort ? a : [...a].sort())
    const ok = norm(mineIds) === norm(theirIds)

    ok ? pass++ : fail++
    console.log(`${ok ? 'ok  ' : 'FAIL'}  ${c.name}  (${theirIds.length} matched)`)
    if (!ok) {
      console.log(`        mine  = ${JSON.stringify(mineIds.map(i => i.slice(-4)))}`)
      console.log(`        mongo = ${JSON.stringify(theirIds.map(i => i.slice(-4)))}`)
    }
  }
} finally {
  await client.close()
  await mongod.stop()
}

console.log(`\n${pass} passed, ${fail} failed  (against real MongoDB)`)
process.exit(fail ? 1 : 0)
