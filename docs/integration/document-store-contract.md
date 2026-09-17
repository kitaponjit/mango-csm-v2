# Document store — frontend-only MongoDB-style queries

Status tags follow `docs/integration/frontend-backend-connection.md`:
`[VERIFIED]` tested against a running system, `[OBSERVED]` read from source,
`[UNKNOWN]` not established.

## 1. What this is

`frontend/app/services/document-store/` lets screens query schema-less documents
with **MongoDB filter syntax, entirely in the browser**. Documents come from JSON
files the app serves itself (`frontend/public/data/<collection>.json`), and a
MongoDB-compatible engine runs every query client-side.

**It does not connect to the backend.** The store has no server of its own and no
switch that would give it one: it never calls `$xt`, `dataServer` or any endpoint.
(The app's normal sign-in and menu-right check still run for the screen, as for
every screen — that is the auth middleware, not the store.) This is deliberate, per
the decision on 2026-09-17: *"don't connect backend, just query frontend only"*.

## 2. Why not query MongoDB directly

Two independent reasons, either one sufficient.

**It cannot.** MongoDB speaks a binary protocol over raw TCP, not HTTP. A browser
has no socket API that can reach it. Every "frontend queries Mongo" product
(Atlas Data API, Realm Web) is in fact an HTTP service in front of Mongo.

**It must not.** Any such design requires a connection string or API key in code
the browser downloads, readable by anyone who opens devtools. `AGENTS.md`:

> The frontend must not access SQL Server, SQLite, or MongoDB directly;
> persistence belongs behind an API/service boundary.

So the store keeps the **document model** — free-form documents, MongoDB filter
syntax, Extended JSON dates — and runs it where the frontend can: in the browser.

## 3. The data: `log_web`-shaped documents `[OBSERVED]`

The sample file mirrors the backend's real `log_web` collection, read from
`MangoServiceNetCore` on 2026-09-16 and not re-read since. There, `Gateway.cs:114-125`
spreads the whole of `GatewayRequest.Log` into a document and adds an envelope:

```jsonc
{
  // ── envelope, always present ──
  "mainname": "Mango Consultant",
  "maincode": "MG",
  "username": "<auth.empname>",
  "empno":    "<auth.empno>",
  "type":     "created",       // or anything else
  // Set from DateTime.Now: a real DATE, written here in Extended JSON (§4).
  "created":  { "$date": "2026-09-16T08:14:22.481Z" },  // when type === "created"
  "updated":  { "$date": "2026-09-16T08:41:07.902Z" },  // otherwise — never both

  // ── everything else comes from GatewayRequest.Log ──
  // declared `public object Log { get; set; }`, i.e. arbitrary JSON.
  "action": "case.create",
  "prno": "CSM-2026-004417",
  "payload": { "customer": { "code": "C-00871" } }
}
```

**This is why the model is document-oriented and not relational.** In the sample
file, 21 distinct top-level fields appear across 15 documents and only 7 are
present in every one, so the screen derives its columns from the documents it gets.

`created` / `updated` are mutually exclusive, so **any date filter must consider
both** or it silently drops half the documents.

To show different data, replace `public/data/log_web.json`, keeping dates in
`{ "$date": ... }` form. A mongoexport of the real collection in relaxed mode
already has that shape.

## 4. Dates are Extended JSON `[VERIFIED]`

Plain JSON has no date type, and MongoDB never matches a string against a date.
Measured against a real mongod with one document whose `created` is a date:

| Filter | Matches |
| --- | --- |
| `{ "created": { "$gte": "2026-09-16T00:00:00Z" } }` | **0** |
| `{ "created": { "$gte": { "$date": "2026-09-16T00:00:00Z" } } }` | 1 |

The screen originally used the first form. So dates use MongoDB's own JSON
spelling, **Extended JSON**, in the data file and in filters, and the engine treats
`{ $date }` as a real date, exactly as MongoDB does. Build date bounds with
`ejsonDate()`. Every document the store returns goes through `toClientShape`, which
turns `$date` into an ISO string (and `$oid` into its hex string), so screens see
plain values.

## 5. Usage and verification `[VERIFIED]`

The store and the screen are TypeScript; `Filter`, `QueryOptions`, `Doc` and
`EjsonDate` are exported types, so a malformed filter is a compile error.

```ts
import { collection, ejsonDate } from '~/services/document-store'

const logs = collection('log_web')
await logs.find(
  { 'payload.customer.code': 'C-00871', created: { $gte: ejsonDate(new Date(2026, 8, 16)) } },
  { sort: { created: -1 }, limit: 20 })
await logs.findOne({ prno: 'CSM-2026-004417' })
await logs.countDocuments({ status_code: { $gte: 500 } })
await logs.distinct('action')
await logs.insertOne({ action: 'case.comment', comment: { body: '…' } })  // session only, §6
await logs.fieldPaths()   // every path present across the matched documents
```

Supported: `$eq $ne $gt $gte $lt $lte $in $nin $regex $exists $type $all $size $not
$and $or $nor`, sort / skip / limit / projection, plus MongoDB's implicit rules — a
bare value means `$eq`, a dotted path descends into nested objects and through
arrays, and a predicate matches if it matches **any** element at that path. Where a
hand-written matcher usually drifts, the engine follows MongoDB, each verified
against a real mongod:

- an **absent** field counts as `null` for `$eq`/`$ne`/`$in`/`$nin`;
- range operators use **type bracketing** — `$gt: "100"` never matches a number,
  and a string bound never matches a date;
- a date is `{ $date }` or a JS `Date`; an ISO-looking **string is a string**;
- sorting orders across types by MongoDB's type rank, arrays by their min
  (ascending) or max (descending) element, and **strings by code point** — MongoDB's
  default with no collation (Latin before Thai).

| Command | What it proves |
| --- | --- |
| `npm run test:query` | 35 unit assertions on the engine and the Extended JSON helpers |
| `npm run test:store` | 28 checks on the public API over the real sample file, with no server at all — including that the store **never touches `$xt`** and only fetches `/data/*.json` |
| `npm run test:parity` | 64 cases: identical results from the engine and a **real mongod** over the same documents |
| `npm test` | all three |

`test:parity` starts a throwaway local mongod through `mongodb-memory-server` (it
downloads and caches the binary). It is test tooling only and never involves the
app's backend.

## 6. Writes stay in the browser session `[VERIFIED]`

A browser cannot write to a file the server serves, and the store has no server by
design. `insertOne` therefore holds the document in the session, merges it into
every later query so the screen stays consistent, and returns `pending: true`. The
screen shows a standing warning while any such document exists and offers the JSON
for copying. **Inserted documents are gone on reload**; nothing pretends to be
persisted.

One trap worth knowing: Nuxt's SPA fallback answers unknown paths with `index.html`
at **status 200**, so a missing document file arrives as HTML rather than a 404. The
store checks the content type and fails with a clear message — otherwise it
surfaces much later as a confusing JSON parse error (the same trap that silently
broke the image URLs, see `frontend/MIGRATION.md`).

## 7. Access and open questions

- **Access** — decided 2026-09-17: `v_csm_log_web` is gated by menu right `60000`
  (Customer Config Center); users without it are redirected to `access_denied`.
- **Thai-aware sorting** `[UNKNOWN]` — strings sort by code point, like MongoDB. If
  Thai collation is wanted, add it as an explicit option, not a silent default.
- **Keeping inserted documents across reloads** `[UNKNOWN]` — not implemented. If
  wanted without a backend, the browser's own storage (IndexedDB) is the only
  place, and it would be per browser and per device.
