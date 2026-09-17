/*
 * Tests for the NoSQL query engine in ./query.ts.
 *
 * There is no test runner in this project, so this is a standalone Node script:
 *
 *     node app/services/document-store/query.test.mts
 *
 * It exits non-zero on failure, so it works in CI as-is. The .mts extension
 * forces ESM regardless of package.json, and Node >= 22.18 strips the types on
 * the fly, so query.ts is imported directly with no build step. `vue-tsc
 * --noEmit` type-checks this file along with the rest of the app.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { Doc, Filter, QueryOptions, StoredDoc } from './query.ts'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..', '..', '..')
const { runQuery, matches, resolvePath, compare } = await import('./query.ts')
const { ejsonDate, toClientShape, isEjsonDate } = await import('./ejson.ts')

interface DocumentFile { documents: StoredDoc[] }
const docs = (JSON.parse(
  readFileSync(resolve(root, 'public', 'data', 'log_web.json'), 'utf8')
) as DocumentFile).documents

let pass = 0, fail = 0
const t = (name: string, actual: unknown, expected: unknown): void => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  ok ? pass++ : fail++
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : `\n        got=${JSON.stringify(actual)}\n        want=${JSON.stringify(expected)}`}`)
}
const n = (f: Filter, o: QueryOptions = {}): number => runQuery(docs, f, o).length
// runQuery's return is widened to Doc[] because a projection can reshape a
// document; nothing here projects, so the ids are still present.
const ids = (f: Filter, o: QueryOptions = {}): string[] =>
  (runQuery(docs, f, o) as StoredDoc[]).map(d => d._id.slice(-4))

/*
 * The first match, or a thrown error. Indexing straight into the result is
 * what the checker objects to, and it is right: an empty result would make
 * the assertion crash with a confusing TypeError instead of failing.
 */
const first = (f: Filter, o: QueryOptions = {}): Doc => {
  const [doc] = runQuery(docs, f, o)
  if (!doc) throw new Error(`expected at least one document for ${JSON.stringify(f)}`)
  return doc
}

// implicit $eq + dotted paths
t('implicit $eq on top-level', n({ maincode: 'MG' }), 7)
t('dotted path into nested object', n({ 'payload.priority': 'urgent' }), 1)
t('dotted path through an ARRAY (rows.qty semantics)', n({ 'tasks.result': 'pass' }), 2)
t('path absent from most docs still filters', n({ satisfaction: 5 }), 1)

// comparison + date-as-string ordering
// Dates are Extended JSON. A bare ISO *string* against a date field matches
// nothing — MongoDB's type bracketing, and the silent failure this guards: the
// screen used to send exactly that, and a real mongod returns 0 for it.
t('$gt on Extended JSON date', n({ created: { $gt: { $date: '2026-09-16T13:00:00Z' } } }), 4)
t('ISO string against a date field matches nothing', n({ created: { $gt: '2026-09-16T13:00:00Z' } }), 0)
t('$lt string bound matches no number (type bracketing)', n({ duration_ms: { $lt: '100' } }), 0)
t('$type date matches Extended JSON dates', n({ created: { $type: 'date' } }), 9)
t('$gte/$lte range on number', n({ duration_ms: { $gte: 400, $lte: 1000 } }), 3)
t('Extended JSON dates compare chronologically', compare({ $date: '2026-09-16T09:00:00Z' }, { $date: '2026-09-16T10:00:00Z' }) < 0, true)
// '.' sorts before 'Z' as text, so these two are in the wrong order as strings.
t('mixed precision dates compare as instants', compare({ $date: '2026-01-01T00:00:00.500Z' }, { $date: '2026-01-01T00:00:00Z' }) > 0, true)
t('two spellings of one instant are equal', n({ created: { $date: '2026-09-16T15:14:22.481+07:00' } }), 1)
t('ISO-looking strings stay strings (no coercion)', compare('2026-01-01T00:00:00.500Z', '2026-01-01T00:00:00Z') < 0, true)

// set / existence / regex
t('$in', n({ maincode: { $in: ['SK', 'BKF'] } }), 8)
t('$nin', n({ maincode: { $nin: ['SK', 'BKF'] } }), 7)
t('$exists true', n({ error: { $exists: true } }), 2)
t('$exists false', n({ error: { $exists: false } }), 13)
t('$regex + $options', n({ action: { $regex: '^case\.', $options: 'i' } }), 6)
t('$ne excludes matching', n({ type: { $ne: 'created' } }), 6)

// arrays
t('$size on array field', n({ tasks: { $size: 2 } }), 1)
t('$all over array of objects flattened by path', n({ 'files.mime': { $all: ['application/pdf'] } }), 1)

// logical
t('$or', n({ $or: [{ maincode: 'SK' }, { status_code: 500 }] }), 5)
t('$and', n({ $and: [{ maincode: 'MG' }, { type: 'created' }] }), 3)
t('$nor', n({ $nor: [{ maincode: 'MG' }, { maincode: 'SK' }] }), 4)
t('$not', n({ status_code: { $not: { $eq: 200 } } }), 13)

// sort / skip / limit / projection
t('sort desc by created', ids({ type: 'created' }, { sort: { created: -1 }, limit: 3 }),
  ['100e', '100d', '100b'])
t('skip+limit paginates', ids({}, { sort: { _id: 1 }, skip: 2, limit: 2 }), ['1003', '1004'])
t('inclusive projection keeps _id', Object.keys(first({ _id: '6716a1f0c2e41a0b3d001001' }, { projection: { action: 1 } })).sort(), ['_id','action'])
t('exclusive projection drops the field', 'payload' in first({ _id: '6716a1f0c2e41a0b3d001001' }, { projection: { payload: 0 } }), false)

// empty filter
t('find({}) returns everything', n({}), 15)

// unsupported operator is loud, not silent
let threw = false
try { matches(docs[0], { a: { $nonsense: 1 } }) } catch { threw = true }
t('unknown operator throws', threw, true)

// Extended JSON helpers
t('ejsonDate builds the wrapper', ejsonDate(new Date('2026-09-16T00:00:00Z')), { $date: '2026-09-16T00:00:00.000Z' })
t('isEjsonDate rejects extra keys', isEjsonDate({ $date: '2026-09-16T00:00:00Z', x: 1 }), false)
t('toClientShape: dates become ISO strings, recursively',
  toClientShape({ created: { $date: '2026-09-16T08:14:22.481Z' }, rows: [{ at: { $date: 0 } }] }),
  { created: '2026-09-16T08:14:22.481Z', rows: [{ at: '1970-01-01T00:00:00.000Z' }] })
t('toClientShape: $oid becomes its hex string', toClientShape({ _id: { $oid: '6716a1f0c2e41a0b3d001001' } }), { _id: '6716a1f0c2e41a0b3d001001' })

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
