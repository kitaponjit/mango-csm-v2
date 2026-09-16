# Document store — frontend contract for MongoDB-backed collections

Status tags follow `docs/integration/frontend-backend-connection.md`:
`[VERIFIED]` tested against a running system, `[OBSERVED]` read from source,
`[UNKNOWN]` not established.

## 1. Why the frontend does not talk to MongoDB

Two independent reasons, either one sufficient.

**It cannot.** MongoDB speaks a binary protocol over raw TCP, not HTTP. A browser
has no socket API that can reach it. Every "frontend queries Mongo" product
(Atlas Data API, Realm Web) is in fact an HTTP service in front of Mongo — the
browser still talks HTTP to a server.

**It must not.** Any such design requires a connection string or API key in
code the browser downloads, which is readable by anyone who opens devtools.
`AGENTS.md` states the rule directly:

> The frontend must not access SQL Server, SQLite, or MongoDB directly;
> persistence belongs behind an API/service boundary.

So `frontend/app/services/document-store/` keeps the **document model** —
schema-less documents, MongoDB filter syntax, no relational mapping — and swaps
only the transport.

## 2. What exists today `[OBSERVED]`

Read from `MangoServiceNetCore` on 2026-09-16:

| Fact | Evidence |
| --- | --- |
| `MongoDB.Driver` 3.5.0 is referenced | `Mango.Core/Mango.Core.csproj:27` |
| `MongoConnectionString` is the **empty string** | `Mango.Web/appsettings.json:15`, `appsettings.Production.json:27` |
| Mongo init is skipped when that value is empty | `Mango.Core/Data/DataContext.cs:194-196` |
| The only write is a fire-and-forget insert into `log_web` | `DataContext.cs:865-879` (`MongoInsertOne`) |
| Its only caller | `Mango.Web/Areas/CSM/Models/Gateway/Gateway.cs:124` |
| A separate report path posts to an HTTP `mongo_host`, gated on the `sm_config` row `MONGO_RPT` | `Mango.Report/Controllers/CustomReportController.cs:141-158` |
| **No read API over any Mongo collection exists** | grep across `Mango.Web/Areas/CSM` — the other CSM files carry only unused `using MongoDB.Driver;` |

So Mongo is wired but disabled, and there is nothing for a frontend to read yet.

## 3. The `log_web` document shape `[OBSERVED]`

From `Gateway.cs:114-125`: the whole of `GatewayRequest.Log` is spread into the
document, then an envelope is added.

```jsonc
{
  // ── envelope, always present ──
  "mainname": "Mango Consultant",
  "maincode": "MG",
  "username": "<auth.empname>",
  "empno":    "<auth.empno>",
  "type":     "created",              // or anything else
  "created":  "2026-09-16T08:14:22Z", // present when type === "created"
  "updated":  "2026-09-16T08:41:07Z", // present otherwise — never both

  // ── everything else comes from GatewayRequest.Log ──
  // declared `public object Log { get; set; }` (GatewayRequest.cs:13),
  // i.e. arbitrary JSON. No two documents need share a single field.
  "action": "case.create",
  "prno": "CSM-2026-004417",
  "payload": { "customer": { "code": "C-00871" } }
}
```

**This is why the model is document-oriented and not relational.** In the sample
file that ships with the frontend, 21 distinct top-level fields appear across 15
documents and only 7 are present in every one. A fixed column list would hide
most of the data, so the UI derives its columns from the documents it receives.

`created` / `updated` are mutually exclusive, so **any date filter must consider
both** or it silently drops half the collection.

## 4. Endpoints to implement

All three are `POST`, under the existing path base (`<dataServer>`, default
`/service/`). Auth rides the existing `X-Mango-Auth` header that `$xt` already
attaches — no new auth mechanism.

### `POST CSM/Document/Find`

```jsonc
// request
{
  "collection": "log_web",
  "filter":     { "maincode": "MG", "duration_ms": { "$gt": 1000 } },
  "sort":       { "created": -1 },
  "skip":       0,
  "limit":      20,
  "projection": null
}
// response
{ "success": true, "data": { "documents": [ /* … */ ], "total": 137 } }
```

`filter`, `sort` and `projection` are passed through **unchanged** and are valid
input to MongoDB's own `find()`. That is the design's whole point: the same
filter object the browser builds today against a JSON file is the one the server
hands to the driver, so no call site changes when the transport moves.

`total` is the count **before** `skip`/`limit`, for pagination.

### `POST CSM/Document/InsertOne`

```jsonc
{ "collection": "log_web", "document": { /* any JSON object */ } }
// →
{ "success": true, "data": { "insertedId": "6716a1f0c2e41a0b3d001001" } }
```

### `POST CSM/Document/Distinct`

```jsonc
{ "collection": "log_web", "field": "maincode", "filter": {} }
// →
{ "success": true, "data": { "values": ["BKF", "MG", "SK"] } }
```

Used only to populate filter dropdowns.

### Server-side obligations

- **Allow-list `collection`.** It arrives from the browser; never interpolate it
  into anything or accept an arbitrary name.
- **Scope every query by the caller's `maincode`** from the session, not from the
  filter. A client-supplied filter must never be able to widen access.
- **Cap `limit`** server-side.
- **Reject `$where` and `$function`** if you ever widen the operator set — they
  execute JavaScript on the server. The frontend engine does not implement them.
- Return `{ success: false, error }` on failure; `$xt` surfaces it.

## 5. Frontend usage `[VERIFIED]`

The store and the screen are TypeScript. The filter and option shapes are
exported types (`Filter`, `QueryOptions`, `Doc`), so a malformed filter is a
compile error rather than a silently empty result set.

```ts
import { collection, configure } from '~/services/document-store'

// one line, at startup, when the endpoints exist:
configure({ driver: 'http' })

const logs = collection('log_web')
await logs.find({ 'payload.customer.code': 'C-00871' }, { sort: { created: -1 }, limit: 20 })
await logs.findOne({ prno: 'CSM-2026-004417' })
await logs.countDocuments({ status_code: { $gte: 500 } })
await logs.distinct('action')
await logs.insertOne({ action: 'case.comment', comment: { body: '…' } })
await logs.fieldPaths()   // every path present across the matched documents
```

Supported operators, verified by `app/services/document-store/query.test.mts`
(25 assertions, run with `node app/services/document-store/query.test.mts`):

`$eq $ne $gt $gte $lt $lte $in $nin $regex $exists $type $all $size $not`
`$and $or $nor`, plus MongoDB's implicit rules — a bare value means `$eq`, a
dotted path descends into nested objects, and a predicate matches if it matches
**any** element of an array at that path.

ISO-8601 date **strings** compare as dates, because JSON has no BSON date type,
so `created` arrives as a string and must still range-filter and sort correctly.

## 6. The `json` driver and its write limitation `[VERIFIED]`

Until the endpoints exist the store reads `public/data/<collection>.json` from
this app's own origin and runs the query in the browser.

**A browser cannot write to a static file.** `insertOne` therefore holds the
document in the session, merges it into subsequent reads so the UI stays
consistent, and returns `pending: true`. The screen shows a standing warning
while any pending document exists and offers the JSON for copying. Nothing is
silently lost, and nothing pretends to be persisted.

Inventing a write endpoint to fix this would be exactly the case `AGENTS.md`
rules out: *"Do not invent backend endpoints… when the owning repository or
target configuration is absent."*

One trap worth knowing: Nuxt's SPA fallback answers unknown paths with
`index.html` at **status 200**, so a missing document file arrives as HTML rather
than a 404. The driver checks the content type and fails with a clear message —
otherwise it surfaces much later as a confusing JSON parse error. This is the
same trap that silently broke the image URLs (see `frontend/MIGRATION.md`).

## 7. Open decisions `[UNKNOWN]`

- Whether `log_web` should be readable from the UI at all, and by which roles.
  It is an audit log containing other users' activity; today the screen is
  `meta.auth: true` with no `menu_id` right behind it.
- Whether anything beyond `log_web` belongs in MongoDB. `AGENTS.md` still records
  this as an open ownership decision and identifies append-only logs and chat as
  the only fit candidates.
- Retention and indexing for `log_web`. It currently grows without bound and has
  no declared index; a `{ maincode: 1, created: -1 }` compound index is the shape
  these queries want.
