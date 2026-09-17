/*
 * Tests for the document store's public API, frontend-only.
 *
 * Exercises what a screen actually calls — collection().find / findOne /
 * countDocuments / distinct / fieldPaths / insertOne — over the real sample
 * file public/data/log_web.json, with no server of any kind:
 *
 *   - `fetch` is replaced by a stub that serves files from public/, and answers
 *     anything else the way Nuxt's SPA fallback does (index.html, status 200);
 *   - `$xt` — the app's backend HTTP helper — is replaced by a trap that fails
 *     the run if the store ever touches it.
 *
 * So besides the behaviour, this proves the store never calls the backend.
 *
 *     npm run test:store
 *
 * Exits non-zero on failure.
 */

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(here, '..', '..', '..', 'public')
const BASE = 'http://app.local/'

// ---------------------------------------------------------------------------
// No-server environment
// ---------------------------------------------------------------------------

const fetched: string[] = []
const backendCalls: string[] = []

Object.assign(globalThis, {
  window: { baseUrl: BASE },

  async fetch(input: string | URL): Promise<Response> {
    const url = String(input)
    fetched.push(url)
    const rel = url.startsWith(BASE) ? decodeURIComponent(url.slice(BASE.length)) : null
    const file = rel ? resolve(publicDir, rel) : null
    if (file && file.startsWith(publicDir) && existsSync(file)) {
      return new Response(readFileSync(file), { status: 200, headers: { 'content-type': 'application/json; charset=utf-8' } })
    }
    // What the Nuxt dev server really does for an unknown path.
    return new Response('<!DOCTYPE html><html></html>', { status: 200, headers: { 'content-type': 'text/html;charset=utf-8' } })
  },

  // Any property access on $xt is a backend call attempt.
  $xt: new Proxy({}, {
    get(_target, prop) {
      backendCalls.push(String(prop))
      throw new Error(`document store touched the backend helper: $xt.${String(prop)}`)
    }
  })
})

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

let pass = 0
let fail = 0

function t(name: string, actual: unknown, expected: unknown): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  ok ? pass++ : fail++
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}`)
  if (!ok) {
    console.log(`        got  = ${JSON.stringify(actual)?.slice(0, 300)}`)
    console.log(`        want = ${JSON.stringify(expected)?.slice(0, 300)}`)
  }
}

async function rejects(name: string, run: () => Promise<unknown>, match: RegExp): Promise<void> {
  try {
    await run()
    t(`${name} (should have thrown)`, 'resolved', 'rejected')
  } catch (err) {
    const msg = (err as Error).message
    t(name, match.test(msg) ? 'rejected as expected' : msg, 'rejected as expected')
  }
}

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const store = await import('./index.ts')
const { ejsonDate } = store
const logs = store.collection('log_web')

// ---- reading -----------------------------------------------------------------
const all = await logs.find({}, { sort: { _id: 1 } })
t('reads every document from the file', all.total, 15)
t('dates reach the caller as ISO strings, never { $date }',
  all.documents.every(d => (d.created === undefined || (typeof d.created === 'string' && ISO.test(d.created)))
    && (d.updated === undefined || (typeof d.updated === 'string' && ISO.test(d.updated)))), true)

t('implicit $eq', (await logs.find({ maincode: 'MG' })).total, 7)
t('nested dotted path', (await logs.find({ 'payload.priority': 'urgent' })).documents.map(d => d.prno), ['CSM-2026-004417'])
t('dotted path through an array', (await logs.find({ 'tasks.result': 'pass' })).total, 2)
t('$regex with options', (await logs.find({ action: { $regex: '^case\\.', $options: 'i' } })).total, 6)
t('null matches a missing field', (await logs.find({ satisfaction: null })).total, 14)

// ---- dates ---------------------------------------------------------------------
t('Extended JSON date bound', (await logs.find({ created: { $gt: ejsonDate('2026-09-16T13:00:00Z') } })).total, 4)
t('a bare ISO string never matches a date (as in MongoDB)',
  (await logs.find({ created: { $gt: '2026-09-16T13:00:00Z' } })).total, 0)
t('date range over created|updated, as the screen builds it',
  (await logs.find({ $or: [
    { created: { $gte: ejsonDate('2026-09-16T12:00:00Z') } },
    { updated: { $gte: ejsonDate('2026-09-16T12:00:00Z') } }
  ] })).total, 7)

// ---- sort / paging / projection ------------------------------------------------
const paged = await logs.find({ type: 'created' }, { sort: { created: -1 }, skip: 1, limit: 2 })
t('sort desc by date with skip + limit', paged.documents.map(d => d._id.slice(-4)), ['100d', '100b'])
t('total ignores skip/limit', paged.total, 9)
t('projection keeps _id and the named fields',
  Object.keys((await logs.find({ _id: '6716a1f0c2e41a0b3d001001' }, { projection: { action: 1 } })).documents[0] || {}).sort(),
  ['_id', 'action'])

// ---- other collection methods ----------------------------------------------------
t('findOne', (await logs.findOne({ action: 'case.close' }))?.prno, 'CSM-2026-004417')
t('countDocuments', await logs.countDocuments({ status_code: { $gte: 500 } }), 1)
t('distinct', await logs.distinct('maincode'), ['BKF', 'MG', 'SK'])
const paths = await logs.fieldPaths()
t('fieldPaths finds nested paths', paths.includes('payload.customer.code'), true)
t('fieldPaths treats a date as a value, not { $date }', paths.includes('created') && !paths.includes('created.$date'), true)

// ---- writes stay in the session ------------------------------------------------------
const inserted = await logs.insertOne({ action: 'probe.insert', type: 'created', created: ejsonDate('2026-09-17T01:02:03.004Z') })
t('insert is session-only (pending: true)', inserted.pending, true)
t('insertedId is generated', inserted.insertedId.startsWith('pending-'), true)
t('the inserted document is queryable immediately', (await logs.find({ action: 'probe.insert' })).total, 1)
t('its date comes back as an ISO string',
  (await logs.findOne({ action: 'probe.insert' }))?.created, '2026-09-17T01:02:03.004Z')
t('and it is found by a date filter', (await logs.find({ created: { $gte: ejsonDate('2026-09-17T00:00:00Z') } })).total, 1)
t('pendingDocuments lists it', logs.pendingDocuments().map(d => d.action), ['probe.insert'])
logs.clearPending()
t('clearPending removes it', (await logs.find({})).total, 15)

// ---- failure mode ------------------------------------------------------------------------
await rejects('a missing file fails clearly instead of parsing HTML',
  () => store.collection('does_not_exist').find({}), /expected JSON, received "text\/html/)

// ---- frontend only ---------------------------------------------------------------------------
t('never touched the backend helper $xt', backendCalls, [])
t('only ever fetched document files from this app\'s /data/',
  [...new Set(fetched)].every(u => u.startsWith(`${BASE}data/`) && u.endsWith('.json')), true)

console.log(`\n${pass} passed, ${fail} failed  (document store, frontend only)`)
process.exit(fail ? 1 : 0)
