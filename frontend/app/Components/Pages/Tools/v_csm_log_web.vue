<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="row">
          <!-- ── Query ───────────────────────────────────────────────── -->
          <div class="col-md-4">
            <div class="box box-solid">
              <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-search"></i> {{ ui.search || 'ค้นหา' }}</h3>
                <span class="label label-default pull-right">{{ collectionName }}</span>
              </div>
              <div class="box-body">
                <div class="form-group">
                  <label>Company</label>
                  <select class="form-control input-sm" v-model="form.maincode">
                    <option value="">— all —</option>
                    <option v-for="c in facets.maincode" :key="String(c)" :value="c">{{ c }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Action</label>
                  <select class="form-control input-sm" v-model="form.action">
                    <option value="">— all —</option>
                    <option v-for="a in facets.action" :key="String(a)" :value="a">{{ a }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Type</label>
                  <select class="form-control input-sm" v-model="form.type">
                    <option value="">— all —</option>
                    <option value="created">created</option>
                    <option value="updated">updated</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Free text <small class="text-muted">(regex over username / prno / route)</small></label>
                  <input type="text" class="form-control input-sm" v-model="form.text"
                         placeholder="e.g. CSM-2026 or ^case\." @keyup.enter="search()">
                </div>

                <div class="row">
                  <div class="col-xs-6 form-group">
                    <label>From</label>
                    <input type="date" class="form-control input-sm" v-model="form.from">
                  </div>
                  <div class="col-xs-6 form-group">
                    <label>To</label>
                    <input type="date" class="form-control input-sm" v-model="form.to">
                  </div>
                </div>

                <!--
                  The structured controls above only cover the fields these
                  documents happen to share. Anything else — a nested path, an
                  operator, a field only a handful of documents carry — needs the
                  raw filter, which is why it is a first-class control and not a
                  hidden "advanced" panel.
                -->
                <div class="form-group">
                  <label>
                    <input type="checkbox" v-model="rawMode"> Raw filter
                    <small class="text-muted">— MongoDB query syntax</small>
                  </label>
                  <textarea v-if="rawMode" class="form-control input-sm lw-code" rows="6"
                            v-model="rawFilter" spellcheck="false"
                            placeholder='{ "duration_ms": { "$gt": 1000 } }'></textarea>
                  <p v-if="rawMode && rawError" class="text-red lw-hint">{{ rawError }}</p>
                  <p v-else-if="rawMode" class="text-muted lw-hint">
                    Overrides the controls above. Supports
                    <code>$eq $ne $gt $gte $lt $lte $in $nin $regex $exists $type $all $size $not $and $or $nor</code>
                    and dotted paths such as <code>payload.customer.code</code>.
                  </p>
                </div>

                <button class="btn btn-sm bg-navy" @click.prevent="search()">
                  <i class="fa fa-search"></i> {{ ui.search || 'ค้นหา' }}
                </button>
                <button class="btn btn-sm btn-default" @click.prevent="reset()">
                  {{ ui.erp_clear || 'Clear' }}
                </button>
              </div>
            </div>

            <!-- ── Insert ────────────────────────────────────────────── -->
            <div class="box box-solid">
              <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-plus"></i> Insert document</h3>
              </div>
              <div class="box-body">
                <textarea class="form-control input-sm lw-code" rows="8"
                          v-model="newDocument" spellcheck="false"></textarea>
                <p v-if="insertError" class="text-red lw-hint">{{ insertError }}</p>
                <p class="text-muted lw-hint">
                  No schema is enforced — any JSON object is a valid document.
                  <code>_id</code>, <code>username</code>, <code>empno</code> and the
                  <code>created</code>/<code>updated</code> stamp are filled in the way
                  the backend gateway fills them.
                </p>
                <button class="btn btn-sm btn-primary" @click.prevent="insert()">
                  <i class="fa fa-save"></i> {{ ui.erp_save || 'Save' }}
                </button>
              </div>
            </div>
          </div>

          <!-- ── Results ─────────────────────────────────────────────── -->
          <div class="col-md-8">
            <div v-if="pendingCount" class="alert alert-warning lw-alert">
              <i class="fa fa-exclamation-triangle"></i>
              <strong>{{ pendingCount }}</strong> document<span v-if="pendingCount > 1">s</span>
              inserted this session {{ pendingCount > 1 ? 'are' : 'is' }} held in the browser only.
              The current source is a JSON file, which a browser cannot write to — they will be gone
              on reload. Point the store at the backend endpoint to persist them.
              <a href="#" @click.prevent="showPending = !showPending">{{ showPending ? 'hide' : 'show' }}</a>
            </div>

            <div class="box box-solid">
              <div class="box-header with-border">
                <h3 class="box-title">
                  <i class="fa fa-database"></i>
                  {{ total }} document<span v-if="total !== 1">s</span>
                  <small v-if="total > pageSize" class="text-muted">
                    — {{ skip + 1 }}–{{ Math.min(skip + pageSize, total) }}
                  </small>
                </h3>
                <div class="pull-right">
                  <button class="btn btn-xs btn-default" :disabled="skip === 0" @click.prevent="goPage(-1)">
                    <i class="fa fa-chevron-left"></i>
                  </button>
                  <button class="btn btn-xs btn-default" :disabled="skip + pageSize >= total" @click.prevent="goPage(1)">
                    <i class="fa fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              <div class="box-body no-padding">
                <p v-if="error" class="text-red lw-pad">{{ error }}</p>
                <p v-else-if="!documents.length" class="text-muted lw-pad">
                  No documents match this filter.
                </p>

                <div v-else class="table-responsive">
                  <!--
                    Columns come from the documents themselves. There is no schema
                    to read, and in this collection only 7 of 21 top-level fields
                    appear in every document, so a fixed column list would hide
                    most of the data.
                  -->
                  <table class="table table-hover table-condensed lw-table">
                    <thead>
                      <tr>
                        <th style="width:26px"></th>
                        <th v-for="col in columns" :key="col" @click="toggleSort(col)" class="lw-sortable">
                          {{ col }}
                          <i v-if="sort.field === col"
                             class="fa" :class="sort.dir === 1 ? 'fa-caret-up' : 'fa-caret-down'"></i>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="doc in documents" :key="doc._id">
                        <tr :class="{ 'lw-pending': isPending(doc) }" @click="toggle(doc._id)">
                          <td>
                            <i class="fa" :class="expanded === doc._id ? 'fa-caret-down' : 'fa-caret-right'"></i>
                          </td>
                          <td v-for="col in columns" :key="col">
                            <span :class="{ 'text-muted': cell(doc, col) === '—' }">{{ cell(doc, col) }}</span>
                          </td>
                        </tr>
                        <!-- The whole document, because the table can only ever
                             show the fields the columns happen to cover. -->
                        <tr v-if="expanded === doc._id" :key="doc._id + '-raw'">
                          <td :colspan="columns.length + 1" class="lw-raw">
                            <pre>{{ pretty(doc) }}</pre>
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div v-if="showPending && pendingCount" class="box box-solid">
              <div class="box-header with-border">
                <h3 class="box-title">Unpersisted documents</h3>
                <button class="btn btn-xs btn-default pull-right" @click.prevent="copyPending()">
                  <i class="fa fa-copy"></i> Copy JSON
                </button>
              </div>
              <div class="box-body">
                <pre class="lw-raw">{{ pretty(pendingDocs) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </template>
    </re-page>
  </div>
</template>

<script lang="ts">
  /*
   * log_web browser — reads the CSM gateway's audit documents.
   *
   * The collection has no schema. The backend writes it from
   * `GatewayRequest.Log`, declared `public object Log { get; set; }`, so each
   * document carries whatever the caller logged plus a fixed envelope
   * (mainname / maincode / username / empno / type / created|updated). This
   * screen is built around that: columns are derived from the returned
   * documents, every row expands to its raw JSON, and the filter is a real
   * MongoDB query object rather than a fixed set of search boxes.
   *
   * Data comes through ~/services/document-store, which today reads
   * public/data/log_web.json in the browser and can be pointed at a backend
   * endpoint without any change here. See that module for the contract and for
   * why the frontend does not talk to MongoDB directly.
   *
   * `LogWebDoc` types only the envelope — the fields the backend always adds.
   * It keeps the index signature it inherits from `Doc`, because typing the
   * rest would mean inventing a schema this collection does not have.
   */
  import { defineComponent } from 'vue'
  import { collection, invalidate, getConfig } from '~/services/document-store'
  import type { Doc, Filter, Primitive, StoredDoc } from '~/services/document-store'

  export interface LogWebDoc extends Doc {
    mainname?: string
    maincode?: string
    username?: string
    empno?: string
    type?: string
    created?: string
    updated?: string
  }

  const COLLECTION = 'log_web'

  /* Columns worth showing first when a document happens to carry them. */
  const PREFERRED = ['created', 'updated', 'maincode', 'username', 'action', 'prno', 'status_code', 'duration_ms']
  const MAX_COLUMNS = 7

  interface LoadingBox { show(): void; hide(): void }

  // Same no-op placeholder the other screens use: child callbacks can fire
  // before this component's mounted() has assigned the real ref.
  let page: { loadingBox: LoadingBox } = { loadingBox: { show() {}, hide() {} } }

  interface SearchForm {
    maincode: string
    action: string
    type: string
    text: string
    from: string
    to: string
  }

  const EMPTY_FORM = (): SearchForm => ({ maincode: '', action: '', type: '', text: '', from: '', to: '' })

  const TEMPLATE_DOC = JSON.stringify({
    action: 'case.comment',
    prno: 'CSM-2026-004417',
    comment: { body: '', visibility: 'internal' }
  }, null, 2)

  /** A range on a date field, built from the two date inputs. */
  interface DateRange { $gte?: string; $lte?: string }

  export default defineComponent({
    data() {
      return {
        ui: (window.ui || {}) as Record<string, string>,
        auth: (window.auth || {}) as Record<string, string>,
        xt: $xt,
        collectionName: COLLECTION,
        storeDriver: getConfig().driver,

        form: EMPTY_FORM(),
        rawMode: false,
        rawFilter: '{\n  "duration_ms": { "$gt": 1000 }\n}',
        rawError: '',

        documents: [] as StoredDoc<LogWebDoc>[],
        columns: [] as string[],
        total: 0,
        error: '',
        expanded: null as string | null,

        sort: { field: 'created', dir: -1 as 1 | -1 },
        skip: 0,
        pageSize: 20,

        facets: { maincode: [] as Primitive[], action: [] as Primitive[] },

        newDocument: TEMPLATE_DOC,
        insertError: '',
        pendingCount: 0,
        pendingDocs: [] as StoredDoc<LogWebDoc>[],
        showPending: false
      }
    },

    async mounted() {
      page = (this.$refs.page as { loadingBox: LoadingBox } | undefined) || page
      await this.loadFacets()
      await this.search()
    },

    methods: {
      /*
       * Builds the MongoDB filter. In raw mode the textarea IS the filter —
       * no merging with the controls, because a half-applied filter is worse
       * than an obviously-overridden one. Returns null when the raw filter does
       * not parse; the caller checks for that and leaves the results alone.
       */
      buildFilter(): Filter | null {
        this.rawError = ''

        if (this.rawMode) {
          const text = (this.rawFilter || '').trim()
          if (!text) return {}
          try {
            const parsed: unknown = JSON.parse(text)
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
              throw new Error('a filter must be a JSON object')
            }
            return parsed as Filter
          } catch (err) {
            this.rawError = `Invalid filter: ${(err as Error).message}`
            return null
          }
        }

        const filter: Filter = {}
        if (this.form.maincode) filter.maincode = this.form.maincode
        if (this.form.action) filter.action = this.form.action
        if (this.form.type) filter.type = this.form.type

        if (this.form.text) {
          // Escaping is deliberately NOT applied — the placeholder advertises
          // regex, and these are internal audit records, not user content.
          filter.$or = [
            { username: { $regex: this.form.text, $options: 'i' } },
            { prno: { $regex: this.form.text, $options: 'i' } },
            { route: { $regex: this.form.text, $options: 'i' } },
            { action: { $regex: this.form.text, $options: 'i' } }
          ]
        }

        // `created` and `updated` are mutually exclusive on a document, so a
        // date range has to consider both or it silently drops half the log.
        const range: DateRange = {}
        if (this.form.from) range.$gte = `${this.form.from}T00:00:00.000Z`
        if (this.form.to) range.$lte = `${this.form.to}T23:59:59.999Z`
        if (Object.keys(range).length) {
          const dateClause: Filter = { $or: [{ created: range }, { updated: range }] }
          if (filter.$or) {
            // Two $or clauses cannot share one key, so they are ANDed together.
            filter.$and = [{ $or: filter.$or }, dateClause]
            delete filter.$or
          } else {
            filter.$or = dateClause.$or
          }
        }

        return filter
      },

      async search(keepPage = false): Promise<void> {
        const filter = this.buildFilter()
        if (filter === null) return // invalid raw filter; message already shown

        if (!keepPage) this.skip = 0
        this.error = ''
        page.loadingBox.show()

        try {
          const { documents, total } = await collection<LogWebDoc>(COLLECTION).find(filter, {
            sort: { [this.sort.field]: this.sort.dir },
            skip: this.skip,
            limit: this.pageSize
          })
          this.documents = documents
          this.total = total
          this.columns = this.deriveColumns(documents)
          this.expanded = null
          this.refreshPending()
        } catch (err) {
          this.error = (err as Error).message || String(err)
          this.documents = []
          this.total = 0
        } finally {
          page.loadingBox.hide()
        }
      },

      /*
       * Picks the columns for this result set: the preferred ones that are
       * actually present, then whichever remaining fields the most documents
       * carry. Scalars only — an object or array cannot be a table cell, and
       * those are what the expanded raw view is for.
       */
      deriveColumns(documents: StoredDoc<LogWebDoc>[]): string[] {
        if (!documents.length) return []

        const frequency = new Map<string, number>()
        for (const doc of documents) {
          for (const [key, value] of Object.entries(doc)) {
            if (key === '_id') continue
            if (value !== null && typeof value === 'object') continue
            frequency.set(key, (frequency.get(key) || 0) + 1)
          }
        }

        const chosen = PREFERRED.filter(k => frequency.has(k))
        const rest = [...frequency.entries()]
          .filter(([k]) => !chosen.includes(k))
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([k]) => k)

        return [...chosen, ...rest].slice(0, MAX_COLUMNS)
      },

      cell(doc: LogWebDoc, path: string): string {
        const value = doc[path]
        if (value === null || value === undefined) return '—'
        if (typeof value === 'object') return Array.isArray(value) ? `[${value.length}]` : '{…}'
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
          return $xt.formatDate(value, 'DD/MM/YYYY HH:mm')
        }
        return String(value)
      },

      pretty(value: unknown): string {
        return JSON.stringify(value, null, 2)
      },

      toggle(id: string): void {
        this.expanded = this.expanded === id ? null : id
      },

      toggleSort(field: string): void {
        if (this.sort.field === field) this.sort.dir = (-this.sort.dir) as 1 | -1
        else this.sort = { field, dir: 1 }
        this.search(true)
      },

      goPage(direction: number): void {
        const next = this.skip + direction * this.pageSize
        if (next < 0 || next >= this.total) return
        this.skip = next
        this.search(true)
      },

      reset(): void {
        this.form = EMPTY_FORM()
        this.rawMode = false
        this.rawError = ''
        this.search()
      },

      async loadFacets(): Promise<void> {
        try {
          const c = collection<LogWebDoc>(COLLECTION)
          const [maincode, action] = await Promise.all([c.distinct('maincode'), c.distinct('action')])
          this.facets = { maincode, action }
        } catch (err) {
          // Filter dropdowns are a convenience; a failure here must not stop
          // the screen from loading the documents themselves.
          console.warn('[log_web] facets unavailable', err)
        }
      },

      /*
       * Stamps the envelope the backend gateway adds (Gateway.cs:118-123) so a
       * document written here has the same shape as one written by the server.
       */
      async insert(): Promise<void> {
        this.insertError = ''

        let document: LogWebDoc
        try {
          const parsed: unknown = JSON.parse(this.newDocument)
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('a document must be a JSON object')
          }
          document = parsed as LogWebDoc
        } catch (err) {
          this.insertError = `Invalid document: ${(err as Error).message}`
          return
        }

        const stamped: LogWebDoc = {
          ...document,
          mainname: this.auth.mainname || window.baseCompany || '',
          maincode: this.auth.maincode || window.baseCompany || '',
          username: this.auth.empname || '',
          empno: this.auth.empno || '',
          type: document.type || 'created'
        }
        stamped[stamped.type === 'created' ? 'created' : 'updated'] = new Date().toISOString()

        page.loadingBox.show()
        try {
          const result = await collection<LogWebDoc>(COLLECTION).insertOne(stamped)
          this.newDocument = TEMPLATE_DOC

          if (result.pending) {
            $notify.warning('Saved in this browser session only — not persisted.')
          } else {
            $notify.success(this.ui.erp_save_success || 'Saved.')
            invalidate(COLLECTION)
          }
          await this.search(true)
        } catch (err) {
          this.insertError = (err as Error).message || String(err)
          $msg.alert('System Error', this.insertError, 'danger')
        } finally {
          page.loadingBox.hide()
        }
      },

      refreshPending(): void {
        this.pendingDocs = collection<LogWebDoc>(COLLECTION).pendingDocuments()
        this.pendingCount = this.pendingDocs.length
      },

      isPending(doc: StoredDoc<LogWebDoc>): boolean {
        return this.pendingDocs.some(d => d._id === doc._id)
      },

      async copyPending(): Promise<void> {
        try {
          await navigator.clipboard.writeText(this.pretty(this.pendingDocs))
          $notify.success('Copied.')
        } catch {
          $msg.alert('System Error', 'Clipboard unavailable in this browser.', 'danger')
        }
      }
    }
  })
</script>

<style scoped>
.lw-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.lw-hint { margin: 6px 0 0; font-size: 11px; line-height: 1.5; }
.lw-pad { padding: 14px; margin: 0; }
.lw-alert { padding: 10px 12px; font-size: 12px; }
.lw-table { font-size: 12px; margin-bottom: 0; }
.lw-table tbody tr { cursor: pointer; }
.lw-sortable { cursor: pointer; white-space: nowrap; }
.lw-pending { background: #fcf8e3; }
.lw-raw {
  background: #f7f7f9;
  border: 0;
  border-radius: 3px;
  font-size: 11px;
  line-height: 1.6;
  margin: 0;
  max-height: 320px;
  overflow: auto;
  white-space: pre;
}
</style>
