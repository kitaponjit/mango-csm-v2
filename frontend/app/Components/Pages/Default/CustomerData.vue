<template>
  <div>
    <re-page ref="page">
      <template #body>
        <div class="cd-layout">

        <!-- Hero -->
        <header class="cd-hero">
          <span class="cd-hero__deco">
            <span class="cd-hero__mesh"></span>
            <span class="cd-hero__dots"></span>
          </span>
          <div class="cd-hero__top">
            <div class="cd-hero__id">
              <span class="cd-hero__icon"><i class="fas fa-users"></i></span>
              <div>
                <div class="cd-hero__eyebrow">CUSTOMER DIRECTORY</div>
                <h4 class="cd-hero__title">Customer Data</h4>
              </div>
            </div>
            <div class="cd-hero__act">
              <span class="cd-total" v-if="total">
                <i class="fas fa-database"></i> <b>{{ total.toLocaleString() }}</b> {{ui.erp_item}}
              </span>
              <button class="cd-btn cd-btn--ghost" @click="importFile">
                <i class="fas fa-file-import"></i>  {{ui.erp_import_excel}}
              </button>
            </div>
          </div>
          <div class="cd-hero__tools">
            <div class="cd-pick" v-click-outside="closePick">
              <button class="cd-pick__btn" :class="{ 'is-open': pickOpen }" @click="pickOpen = !pickOpen">
                <i :class="fieldIcon(retrieveSearch['field'])"></i>
                <span>{{ activeFieldName || 'เลือกฟิลด์' }}</span>
                <i class="fas fa-chevron-down cd-pick__chev"></i>
              </button>
              <transition name="cd-pop">
                <div class="cd-pick__pop" v-if="pickOpen">
                  <div class="cd-pick__head">ค้นหาจากฟิลด์</div>
                  <button v-for="x in fields" :key="x.key" class="cd-pick__opt"
                          :class="{ 'is-on': retrieveSearch['field'] === x.key }" @click="pickField(x.key)">
                    <i :class="fieldIcon(x.key)"></i>
                    <span>{{ x.name }}</span>
                    <i class="fas fa-check cd-pick__tick"></i>
                  </button>
                </div>
              </transition>
            </div>
            <div class="cd-search">
              <i class="fas fa-search"></i>
              <input type="text"
                     :placeholder="'ค้นหาด้วย ' + (activeFieldName || '...')"
                     v-model="retrieveSearch['search']"
                     @keyup.enter="retrieveSearchClick()"
                     ref="searchBox" />
              <i v-if="retrieveSearch['search']" class="fas fa-times cd-search__clear" @click="clearSearch()"></i>
            </div>
            <button class="cd-btn" @click="retrieveSearchClick()"><i class="fas fa-search"></i> {{ui.search}}</button>
          </div>
        </header>

        <!-- Table Card -->
        <div class="cd-table-card">
          <div class="cd-toolbar">
            <span class="cd-toolbar__label">
              <i class="fas fa-list-ul"></i> รายชื่อลูกค้า
              <em v-if="retrieveSearch['search']">ผลค้นหา “{{ retrieveSearch['search'] }}”</em>
            </span>
            <div class="cd-seg">
              <button type="button" :class="{ 'is-on': viewMode === 'table' }" @click="setView('table')">
                <i class="fas fa-th-list"></i> <span>{{ui.erp_table}}</span>
              </button>
              <button type="button" :class="{ 'is-on': viewMode === 'card' }" @click="setView('card')">
                <i class="fas fa-th-large"></i> <span>การ์ด</span>
              </button>
            </div>
          </div>

          <div class="cd-view-body">
            <ag-table ref="agr"
                      v-show="viewMode === 'table'"
                      :scale="390"
                      :footer="false"
                      @ready="initTable()"
                      :saveColumns="'Y'"
                      :doctype="'CUSTOMERDATA'"
                      :page_name="'customer_data'"
                      style="width:100%;"></ag-table>

            <div class="card-grid" v-show="viewMode === 'card'">
              <div class="cd-card" v-for="(x, i) in data" :key="x.customer_code || i">
                <span class="cd-card__rail" :style="{ background: tintOf(x.customer_code) }"></span>
                <div class="cd-card__head">
                  <span class="cd-card__avatar" :style="{ background: tintOf(x.customer_code) }">{{ initialOf(x.customer_name) }}</span>
                  <div class="cd-card__id">
                    <span class="cd-card__code">{{ x.customer_code }}</span>
                    <span class="cd-card__name" :title="x.customer_name">{{ x.customer_name }}</span>
                  </div>
                  <span class="cd-card__flag" :class="{ 'is-off': !(x.cus_code && x.user_pass) }"
                        :title="x.cus_code && x.user_pass ? 'มี Passcode' : 'ยังไม่มี Passcode'">
                    <i class="fas fa-key"></i>
                  </span>
                </div>
                <div class="cd-card__meta">
                  <span v-if="x.pre_event" :title="x.pre_event"><i class="fas fa-project-diagram"></i>{{ x.pre_event }}</span>
                  <span v-if="x.pm_name" :title="x.pm_name"><i class="fas fa-user-tie"></i>{{ x.pm_name }}</span>
                  <span v-if="x.phone"><i class="fas fa-phone"></i>{{ x.phone }}</span>
                  <span v-if="x.address1" class="cd-card__meta--wide" :title="x.address1"><i class="fas fa-map-marker-alt"></i>{{ x.address1 }}</span>
                  <span v-if="!x.pre_event && !x.pm_name && !x.phone && !x.address1" class="cd-card__meta--none">
                    ไม่มีข้อมูลติดต่อ
                  </span>
                </div>
                <div class="cd-card__acts">
                  <a :href="openDetail(x)" target="_blank" class="cd-cbtn cd-cbtn--main" title="ดูรายละเอียด">
                    <i class="fas fa-eye"></i><span>{{ui.csm_v2_description}}</span>
                  </a>
                  <a :href="openForm(x)" target="_blank" class="cd-cbtn cd-cbtn--form" title="แบบฟอร์ม">
                    <i class="fas fa-file-alt"></i>
                  </a>
                  <a href="#" v-if="x.cus_code && x.user_pass" @click.prevent="openCust(x)" class="cd-cbtn cd-cbtn--login" title="เข้าระบบลูกค้า">
                    <i class="fas fa-sign-in-alt"></i>
                  </a>
                  <span v-else class="cd-cbtn cd-cbtn--off" title="ยังไม่มี Passcode">
                    <i class="fas fa-sign-in-alt"></i>
                  </span>
                </div>
              </div>
              <div v-if="!data || data.length === 0" class="card-empty">
                <i class="fas fa-inbox"></i>
                <span>ไม่พบข้อมูลลูกค้า</span>
              </div>
            </div>
          </div>

          <!-- Pagination Footer -->
          <div class="cd-table-footer">
            <span class="cd-page-info" v-if="total">
              {{ui.page}} <b>{{ currentPage }}</b> / {{ totalPages }}
              <em>·</em>
              แสดง {{ pageFrom.toLocaleString() }}–{{ pageTo.toLocaleString() }} จาก {{ total.toLocaleString() }} รายการ
            </span>
            <span class="cd-page-info" v-else>ไม่พบรายการ</span>
            <div class="cd-foot__right">
              <div class="cd-field cd-field--sm">
                <i class="fas fa-list-ol"></i>
                <select v-model.number="perPage" @change="setPerPage(perPage)">
                  <option v-for="p in [100, 200, 500, 1000]" :key="p" :value="p">{{ p }} / หน้า</option>
                </select>
              </div>
              <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
            </div>
          </div>
        </div>

        <input type="file" ref="File" accept=".xls, .xlsx" v-show="false" />
        </div><!-- end cd-layout -->
      </template>
    </re-page>
  </div>
</template>

<script>
  import XLSX from 'xlsx'

  // no-op until mounted() assigns $refs.page — child callbacks (FullCalendar datesSet) can fire first

  let page = { loadingBox: { show() {}, hide() {} } }
  let paging = {}

  let cpn = {
    directives: {
      clickOutside: {
        beforeMount(el, binding) {
          el._clickOutsideHandler = (e) => { if (!el.contains(e.target)) binding.value(e) }
          document.addEventListener('click', el._clickOutsideHandler)
        },
        unmounted(el) { document.removeEventListener('click', el._clickOutsideHandler) }
      }
    },
    data() {
      return {
        auth,
        ui: window.ui,
        baseUrl,
        fields: [
          { key: 'customer_name', name: 'Name', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'customer_code', name: 'Code', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'cus_code', name: 'Passcode', type: 's', search: true, sort: true, sort_default: true, width: 200 },
          { key: 'server_ip', name: 'IP', type: 's', search: true, sort: true, sort_default: true, width: 200 },
        ],
        sort_key: '',
        sort_type: 'desc',
        retrieveSearch: {},
        data: [],
        customer_name: '',
        currentPage: 1,
        itemsPerPage: 500,
        perPage: 500,
        total: 0,
        viewMode: 'table',
        pickOpen: false,
      }
    },
    computed: {
      activeFieldName() {
        return $linq(this.fields).where(x => x.key == this.retrieveSearch.field).select(x => x.name).firstOrDefault() || ''
      },
      totalPages() {
        return this.total ? Math.ceil(this.total / this.itemsPerPage) : 1
      },
      pageFrom() {
        return this.total ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0
      },
      pageTo() {
        return this.total ? Math.min(this.currentPage * this.itemsPerPage, this.total) : 0
      },
    },
    methods: {
      hash(str) {
        let h = 0
        for (let i = 0; i < (str || '').length; i++) h = (h << 5) - h + str.charCodeAt(i)
        return h
      },
      tintOf(code) {
        const tints = ['#31628F', '#2F8072', '#6B5B9E', '#8C6239', '#3B6EA5', '#7E8B36', '#96566A', '#347F84', '#5C6BA8', '#8A5340']
        return tints[Math.abs(this.hash(code || '')) % tints.length]
      },
      initialOf(name) {
        let s = String(name || '').trim()
        let core = s.replace(/^(บริษัท|บมจ\.?|บจก\.?|หจก\.?|ห้างหุ้นส่วนจำกัด|ห้างหุ้นส่วนสามัญ|ห้างหุ้นส่วน|ร้าน|คุณ|นาย|นางสาว|นาง)\s*/, '').trim()
        return ((core || s || '?').charAt(0) || '?').toUpperCase()
      },
      esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      },
      fieldIcon(key) {
        switch (key) {
          case 'customer_name': return 'fas fa-building'
          case 'customer_code': return 'fas fa-hashtag'
          case 'cus_code': return 'fas fa-key'
          case 'server_ip': return 'fas fa-server'
          default: return 'fas fa-crosshairs'
        }
      },
      closePick() {
        this.pickOpen = false
      },
      async pickField(key) {
        let f = $linq(this.fields).where(x => x.key == key).firstOrDefault() || {}
        this.retrieveSearch.field = key
        this.retrieveSearch.field_type = f.type || 's'
        this.pickOpen = false

        if (this.retrieveSearch.search) {
          await this.retrieveSearchClick()
        } else {
          this.$nextTick(() => {
            if (this.$refs.searchBox) this.$refs.searchBox.focus()
          })
        }
      },
      setView(v) {
        this.viewMode = v
        if (v == 'table') {
          this.$nextTick(() => {
            let agr = this.$refs.agr
            if (agr && agr.topGridOptions && agr.topGridOptions.api) agr.setDisplay(this.data)
            $(window).trigger('resize')
          })
        }
      },
      async clearSearch() {
        this.retrieveSearch.search = ''
        await this.retrieveSearchClick()
      },
      async setPerPage(n) {
        this.itemsPerPage = n
        paging.setItemsPerPage(n)
        paging.setCurrentPage(1)
        this.currentPage = 1
        await this.loadRetrieve()
      },
      async retrieveSearchClick() {
        this.sort_key = this.retrieveSearch.field
        paging.setCurrentPage(1)
        this.currentPage = 1
        await this.loadRetrieve()
      },
      async loadRetrieve() {
        page.loadingBox.show()

        let field_type = $linq(this.fields).where(x => x.key == this.retrieveSearch.field).select(x => x.type).firstOrDefault() || 's'
        this.retrieveSearch.field_type = field_type

        // Server-side pagination — ส่ง skip/take ไปหลังบ้านทุกครั้ง
        let url = `CSM/Data/CustomerDataReadList?sort=${this.sort_key}&sort_type=${this.sort_type}&skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`
        for (var key in this.retrieveSearch) {
          url += `&${key}=${encodeURIComponent(this.retrieveSearch[key])}`
        }

        // If the list request fails (the .NET 8 backend answers 500 here as of
        // 2026-09-18, whatever the query), close the loading box and say so,
        // with the backend's correlation id, instead of leaving the spinner up
        // and the error uncaught.
        let rsp
        try {
          rsp = await $xt.getServer(url)
        } catch (ex) {
          page.loadingBox.hide()
          const body = (ex && ex.response && ex.response.data) || {}
          const ref = body.correlationId ? ` (ref ${body.correlationId})` : ''
          $msg.alert('System Error', `${body.error || ex}${ref}`, 'danger')
          return
        }
        this.data = rsp.data
        this.total = rsp.total

        paging.setTotalItems(rsp.total)
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1)
        }
        paging.createPagesArray()

        await this.$nextTick()

        let agr = this.$refs.agr
        if (agr) {
          // set header เฉพาะครั้งแรก หรือถ้ายังไม่มี header
          if (!this._tableInited) {
            await this.initTable()
            this._tableInited = true
          }
          agr.setDisplay(this.data)
        }

        page.loadingBox.hide()
      },
      async pageChange(pn) {
        pn = pn || 1
        this.currentPage = pn
        paging.setCurrentPage(pn)
        await this.loadRetrieve()
      },
      openCust(x) {
        //console.log(x.cus_code)
        let cusdata = { passcode: x.cus_code, userpass: x.user_pass }
        localStorage.setItem("X-Login-Customer", JSON.stringify(cusdata))
        window.open(this.baseUrl + `page/authentication/login_cust/`, "_blank")
      },
      openDetail(x) {
        return this.baseUrl + `page/CustomerDataView?customer_code=${x.customer_code}&pre_event=${x.pre_event}`
      },
      openForm(x) {
        this.customer_name = x.customer_name
        return baseUrl + `page/Form?customer_code=${x.customer_code}`
      },
      importFile() {
        $(this.$refs.File).click()
      },
      async fileImport(f) {
        page.loadingBox.show()
        try {
          let act = `CSM/Data/Customer_Import`
          let fd = new FormData()
          fd.append('file', f)

          let rsp = await $xt.postServerForm(act, fd)
          if (!rsp.success) {
            throw new Error(rsp.error)
          }
          else {
            $notify.success('นำเข้าข้อมูลเสร็จสิ้น')
          }
        } catch (ex) {
          $msg.alert("", ex.toString(), "danger")
        }
        finally {
          page.loadingBox.hide()
        }
      },
      async initTable() {
        let agr = this.$refs.agr
        if (!agr) return

        let self = this
        const dim = (params) => params.value
          ? self.esc(params.value)
          : `<span class="cd-dim">—</span>`

        let fields = [
          ["customer_code", "Code", "text", {
            width: 150,
            align: "left",
            sortable: true,
            pinned: 'left',
            cellRenderer: (params) => {
              if (!params.value) return `<span class="cd-dim">—</span>`
              return `<span class="cd-code-badge">${self.esc(params.value)}</span>`
            }
          }],
          ["customer_name", "Name", "text", {
            width: 280,
            align: "left",
            sortable: true,
            pinned: 'left',
            cellRenderer: (params) => {
              let x = params.data || {}
              let name = self.esc(params.value || '?')
              let key = x.cus_code && x.user_pass ? `<i class="fas fa-key cd-cell-key" title="มี Passcode"></i>` : ''
              return `<span class="cd-cell-name">`
                + `<i class="cd-avatar" style="background:${self.tintOf(x.customer_code)}">${self.initialOf(params.value)}</i>`
                + `<b>${name}</b>${key}</span>`
            }
          }],
          ["pre_event", "Project No.", "text", { width: 150, align: "left", sortable: true, cellRenderer: dim }],
          ["pm_name", "Project Manager", "text", { width: 175, align: "left", sortable: true, cellRenderer: dim }],
          ["address1", "Address (1)", "text", {
            width: 280, align: "left", sortable: true,
            cellStyle: { color: '#94a3b8', fontSize: '12px' },
            cellRenderer: dim
          }],
          ["address2", "Address (2)", "text", {
            width: 280, align: "left", sortable: true,
            cellStyle: { color: '#94a3b8', fontSize: '12px' },
            cellRenderer: dim
          }],
          ["phone", "Phone", "text", { width: 135, align: "left", sortable: true, cellRenderer: dim }],
          ["fax", "Fax", "text", { width: 135, align: "left", sortable: true, cellRenderer: dim }],
          ["tax_id", "Tax ID", "text", { width: 145, align: "left", sortable: true, cellRenderer: dim }],
          ["actions", "Actions", "text", {
            width: 140, pinned: 'right', align: "center", sortable: false,
            cellRenderer: (params) => {
              let x = params.data || {}
              let html = `<span class="cd-acts">`
                + `<a class="cd-act cd-act--view" href="${self.openDetail(x)}" target="_blank" title="ดูรายละเอียด"><i class="fas fa-eye"></i></a>`
                + `<a class="cd-act cd-act--form" href="${self.openForm(x)}" target="_blank" title="แบบฟอร์ม"><i class="fas fa-file-alt"></i></a>`
              html += (x.cus_code && x.user_pass)
                ? `<a class="cd-act cd-act--login btn-login-cust" href="#" data-code="${x.cus_code}" title="เข้าระบบลูกค้า"><i class="fas fa-sign-in-alt"></i></a>`
                : `<span class="cd-act cd-act--off" title="ยังไม่มี Passcode"><i class="fas fa-sign-in-alt"></i></span>`
              return html + `</span>`
            }
          }],
        ]

        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)

        // กำหนด rowHeight ให้พอกับ avatar
        if (agr.gridOptions) {
          agr.gridOptions.rowHeight = 44
          agr.gridOptions.suppressHorizontalScroll = false
        }

        // Login button click
        $(document).off('click', '.btn-login-cust')
        $(document).on('click', '.btn-login-cust', function(e) {
          e.preventDefault()
          let code = $(this).data('code')
          let rowData = $linq(self.data).where(x => x.cus_code == code).firstOrDefault()
          if (rowData) self.openCust(rowData)
        })
      },
    },
    mounted() {
      page = this.$refs.page
      page.pageTitle = 'CSM : View Customer Data'
      document.title = page.pageTitle
      window.page = page

      paging = this.$refs.paging
      paging.setCurrentPage(1)
      paging.setItemsPerPage(this.perPage)

      let field_init = $linq(this.fields).where(x => x.search).firstOrDefault() || {}
      this.retrieveSearch.field = field_init.key || ''
      this.retrieveSearch.field_type = field_init.type || 's'

      this.loadRetrieve()

      // ล็อก scroll เฉพาะ content-wrapper (ไม่แตะ body เพราะ footer อยู่นอก content-wrapper)
      const cw = document.querySelector('.content-wrapper')
      if (cw) cw.style.overflow = 'hidden'

      this.$nextTick(() => {
        $(this.$refs.File).on('click', (e) => {
          e.target.value = null
        })

        $(this.$refs.File).on('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            this.fileImport(e.target.files[0])
          }
        })
      })
    },
    beforeUnmount() {
      const cw = document.querySelector('.content-wrapper')
      if (cw) cw.style.overflow = ''
      
      // Clean up event listeners
      $(document).off('click', '.btn-login-cust')
    }
  }
  export default cpn
</script>

<style scoped>
/* ── Layout Wrapper ── */
.cd-layout {
  --ink: #16263D;
  --ink-2: #4A5A72;
  --ink-3: #8593A8;
  --line: #E4E9F2;
  --surface: #FFFFFF;
  --canvas: #F1F4F9;
  display: flex;
  flex-direction: column;
  /* navbar(50) + section.content padding(15+15) + footer(30) */
  height: calc(100vh - 110px);
  padding: 10px 18px;
  gap: 10px;
  box-sizing: border-box;
  overflow: hidden;
  font-family: 'Sarabun', 'Helvetica Neue', sans-serif;
  color: var(--ink);
}
.cd-layout *,
.cd-layout *::before,
.cd-layout *::after { box-sizing: border-box; }

/* ── Hero ── */
.cd-hero {
  position: relative;
  flex-shrink: 0;
  border-radius: 18px;
  padding: 15px 20px 16px;
  background: linear-gradient(118deg, #0B1929 0%, #14304C 52%, #0D2035 100%);
  box-shadow: 0 18px 38px -26px rgba(9,22,38,.75);
}
.cd-hero__deco {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
  border-radius: 18px;
  pointer-events: none;
}
.cd-hero__mesh {
  position: absolute;
  top: -180px; right: -90px;
  width: 420px; height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79,209,197,.3) 0%, rgba(79,209,197,0) 68%);
}
.cd-hero__dots {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(rgba(255,255,255,.09) 1px, transparent 1px);
  background-size: 18px 18px;
  -webkit-mask-image: linear-gradient(104deg, #000 0%, transparent 60%);
  mask-image: linear-gradient(104deg, #000 0%, transparent 60%);
}
.cd-hero__top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.cd-hero__id {
  display: flex;
  align-items: center;
  gap: 13px;
}
.cd-hero__icon {
  width: 42px; height: 42px;
  flex: 0 0 auto;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #06232B;
  background: #4FD1C5;
  font-size: 16px;
  box-shadow: 0 10px 22px -12px rgba(79,209,197,.9);
}
.cd-hero__eyebrow {
  font-family: 'Prompt', sans-serif;
  font-size: 9.5px;
  letter-spacing: .2em;
  color: #4FD1C5;
  margin-bottom: 2px;
}
.cd-hero__title {
  margin: 0;
  font-family: 'Prompt', sans-serif;
  font-size: 21px;
  font-weight: 400;
  line-height: 1.15;
  color: #fff;
  letter-spacing: -.01em;
}
.cd-hero__act {
  display: flex;
  align-items: center;
  gap: 9px;
}
.cd-total {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 14px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.06);
  color: rgba(226,238,250,.8);
  font-size: 12px;
}
.cd-total i { color: #4FD1C5; font-size: 11px; }
.cd-total b {
  font-family: 'Prompt', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
.cd-hero__tools {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
  margin-top: 14px;
}
.cd-field {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 36px;
  min-width: 158px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  color: var(--ink);
  padding-left: 32px;
}
.cd-field > i {
  position: absolute;
  left: 12px;
  font-size: 12px;
  color: var(--ink-3);
  pointer-events: none;
}
.cd-field select {
  appearance: none;
  -webkit-appearance: none;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  width: 100%;
  height: 100%;
  padding: 0 26px 0 0;
  outline: none;
  cursor: pointer;
}
.cd-field::after {
  content: '';
  position: absolute;
  right: 13px;
  width: 6px; height: 6px;
  border-right: 1.5px solid var(--ink-3);
  border-bottom: 1.5px solid var(--ink-3);
  transform: rotate(45deg) translateY(-2px);
  pointer-events: none;
}
.cd-field--sm {
  height: 32px;
  min-width: 122px;
}
.cd-field--sm select { font-size: 12px; }
/* ── Field picker (แทน native select บนพื้น hero) ── */
.cd-pick {
  position: relative;
  flex: 0 0 auto;
}
.cd-pick__btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  height: 36px;
  min-width: 172px;
  padding: 0 13px;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 10px;
  background: rgba(255,255,255,.07);
  color: #EAF2FA;
  font-family: 'Prompt', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background .18s ease, border-color .18s ease;
}
.cd-pick__btn > i:first-child {
  font-size: 11.5px;
  color: #4FD1C5;
}
.cd-pick__btn > span {
  flex: 1 1 auto;
  text-align: left;
  white-space: nowrap;
}
.cd-pick__btn:hover {
  background: rgba(255,255,255,.12);
  border-color: rgba(79,209,197,.5);
}
.cd-pick__btn.is-open {
  background: rgba(79,209,197,.16);
  border-color: #4FD1C5;
}
.cd-pick__chev {
  font-size: 9px;
  color: rgba(234,242,250,.6);
  transition: transform .2s ease;
}
.cd-pick__btn.is-open .cd-pick__chev { transform: rotate(180deg); }
.cd-pick__pop {
  position: absolute;
  z-index: 40;
  top: calc(100% + 9px);
  left: 0;
  width: 218px;
  padding: 7px;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 13px;
  background: rgba(12,30,48,.97);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: 0 26px 50px -22px rgba(0,0,0,.85);
}
.cd-pick__pop::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 20px;
  width: 9px;
  height: 9px;
  transform: rotate(45deg);
  background: rgba(12,30,48,.97);
  border-left: 1px solid rgba(255,255,255,.14);
  border-top: 1px solid rgba(255,255,255,.14);
}
.cd-pick__head {
  font-family: 'Prompt', sans-serif;
  font-size: 9.5px;
  letter-spacing: .14em;
  color: rgba(214,229,242,.45);
  padding: 4px 9px 7px;
}
.cd-pick__opt {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: rgba(234,242,250,.82);
  font-family: inherit;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
  transition: background .16s ease, color .16s ease;
}
.cd-pick__opt > i:first-child {
  width: 14px;
  text-align: center;
  font-size: 11px;
  color: rgba(79,209,197,.7);
}
.cd-pick__opt > span { flex: 1 1 auto; }
.cd-pick__tick {
  font-size: 10px;
  color: #4FD1C5;
  opacity: 0;
}
.cd-pick__opt:hover {
  background: rgba(255,255,255,.09);
  color: #fff;
}
.cd-pick__opt.is-on {
  background: rgba(79,209,197,.16);
  color: #fff;
}
.cd-pick__opt.is-on > i:first-child { color: #4FD1C5; }
.cd-pick__opt.is-on .cd-pick__tick { opacity: 1; }

.cd-pop-enter-active,
.cd-pop-leave-active { transition: opacity .16s ease, transform .16s ease; }
.cd-pop-enter-from,
.cd-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(.985);
}

.cd-search {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: 1 1 260px;
  max-width: 460px;
  height: 36px;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 10px;
  background: rgba(255,255,255,.07);
  padding: 0 34px;
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}
.cd-search:focus-within {
  border-color: #4FD1C5;
  background: rgba(79,209,197,.1);
  box-shadow: 0 0 0 3px rgba(79,209,197,.14);
}
.cd-search > i {
  position: absolute;
  left: 13px;
  font-size: 12px;
  color: rgba(214,229,242,.6);
}
.cd-search > i.cd-search__clear {
  left: auto;
  right: 12px;
  cursor: pointer;
}
.cd-search > i.cd-search__clear:hover { color: #fff; }
.cd-search input {
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 13px;
  width: 100%;
  height: 100%;
  color: #EAF2FA;
}
.cd-search input::placeholder { color: rgba(214,229,242,.45); }
.cd-btn {
  height: 36px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  background: #4FD1C5;
  color: #06232B;
  font-family: 'Prompt', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: transform .18s ease, background .18s ease, border-color .18s ease;
}
.cd-btn i { margin-right: 6px; }
.cd-btn:hover { background: #6BE0D5; transform: translateY(-1px); }
.cd-btn--ghost {
  height: 34px;
  background: transparent;
  border: 1px solid rgba(255,255,255,.2);
  color: #EAF2FA;
}
.cd-btn--ghost:hover {
  background: rgba(255,255,255,.08);
  border-color: #4FD1C5;
}

/* ── Table Card ── */
.cd-table-card {
  flex: 1;
  min-height: 0;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(16,32,54,.05), 0 14px 34px -22px rgba(16,32,54,.4);
  display: flex;
  flex-direction: column;
}

/* ── Toolbar (Table / Card) ── */
.cd-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px 0;
  flex-shrink: 0;
}
.cd-toolbar__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Prompt', sans-serif;
  font-size: 13.5px;
  color: var(--ink);
  min-width: 0;
}
.cd-toolbar__label > i { color: var(--ink-3); font-size: 12px; }
.cd-toolbar__label em {
  font-style: normal;
  font-size: 11.5px;
  color: var(--ink-2);
  background: var(--canvas);
  border-radius: 20px;
  padding: 2px 10px;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cd-seg {
  display: inline-flex;
  flex: 0 0 auto;
  height: 34px;
  border: 1px solid var(--line);
  border-radius: 9px;
  overflow: hidden;
  background: var(--canvas);
}
.cd-seg button {
  border: 0;
  background: transparent;
  padding: 0 15px;
  font-family: 'Prompt', sans-serif;
  font-size: 12.5px;
  color: var(--ink-2);
  cursor: pointer;
  white-space: nowrap;
  transition: background .2s ease, color .2s ease;
}
.cd-seg button i { font-size: 11px; margin-right: 6px; }
.cd-seg button.is-on { background: var(--ink); color: #fff; }
.cd-seg button.is-on i { color: #4FD1C5; }

/* ให้ view body (ag-table / card-grid) ยืดเต็ม flex และ scroll ได้ */
.cd-view-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 16px 16px;
}
.cd-view-body > :first-child {
  flex: 1;
  min-height: 0;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  width: 100% !important;
}

/* ── Card Grid ── */
.card-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  align-content: start;
  grid-auto-rows: max-content;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 12px;
  padding: 14px 4px 4px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #d0d5dd transparent;
}
.card-grid::-webkit-scrollbar { width: 5px; }
.card-grid::-webkit-scrollbar-thumb { background: #d0d5dd; border-radius: 3px; }
.card-grid::-webkit-scrollbar-track { background: transparent; }

.cd-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100px;
  padding: 12px 14px 12px 16px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
  box-shadow: 0 1px 2px rgba(16,32,54,.04);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}
.cd-card:hover {
  transform: translateY(-3px);
  border-color: #CFD9E7;
  box-shadow: 0 16px 30px -20px rgba(16,32,54,.5);
}
.cd-card__rail {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  border-radius: 14px 0 0 14px;
  opacity: .55;
  transition: opacity .2s ease;
}
.cd-card:hover .cd-card__rail { opacity: 1; }
.cd-card__head {
  display: flex;
  align-items: center;
  gap: 11px;
  flex: 0 0 auto;
}
.cd-card__avatar {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: 'Prompt', sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
}
.cd-card__id {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.cd-card__code {
  font-family: 'Prompt', sans-serif;
  font-size: 10px;
  letter-spacing: .12em;
  line-height: 1.3;
  color: var(--ink-3);
}
.cd-card__name {
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.35;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cd-card__flag {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  line-height: 1;
  color: #fff;
  background: #2FBF8F;
  box-shadow: 0 4px 10px -5px rgba(47,191,143,.9);
}
.cd-card__flag.is-off {
  color: #C0C9D6;
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--line);
}
.cd-card__meta {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11.5px;
  color: var(--ink-2);
  line-height: 1.45;
  margin: 11px 0 0;
  min-height: 17px;
}
.cd-card__meta span {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cd-card__meta span > i {
  display: inline-block;
  width: 13px;
  margin-right: 5px;
  font-size: 10.5px;
  text-align: center;
  color: #A9B5C6;
}
.cd-card__meta--wide { color: var(--ink-3); }
.cd-card__meta--none {
  color: #BCC5D3;
  font-size: 11px;
}
.cd-card__acts {
  display: flex;
  align-items: center;
  gap: 7px;
  flex: 0 0 auto;
  margin-top: auto;
  padding-top: 11px;
}

/* Card action buttons (แยกคลาสจาก .cd-act ของตาราง เพื่อไม่ชนกัน) */
.cd-cbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  gap: 7px;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  font-size: 13px;
  line-height: 1;
  text-decoration: none !important;
  transition: transform .16s ease, filter .16s ease;
}
.cd-cbtn:hover { transform: translateY(-1px); filter: brightness(.97); }
.cd-cbtn--main {
  flex: 1 1 auto;
  width: auto;
  padding: 0 14px;
  background: #16263D;
  color: #fff !important;
  font-family: 'Prompt', sans-serif;
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
}
.cd-cbtn--main i { font-size: 12px; }
.cd-cbtn--main:hover { background: #21385A; }
.cd-cbtn--form {
  background: rgba(47,191,143,.14);
  color: #1B8262 !important;
}
.cd-cbtn--login {
  background: rgba(109,61,214,.13);
  color: #5C31BF !important;
}
.cd-cbtn--off {
  background: #F3F5F9;
  color: #C7CFDB !important;
  cursor: not-allowed;
}
.cd-cbtn--off:hover { transform: none; filter: none; }

.card-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: #b0bcc8;
  font-size: 13px;
  grid-column: 1 / -1;
}
.card-empty i { font-size: 28px; opacity: 0.35; }

/* ── AG-Grid Custom Styles (เฉพาะหน้านี้) ── */
.cd-table-card >>> .ag-root-wrapper {
  width: 100% !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  border: 0 !important;
}
.cd-table-card >>> .ag-header {
  background: #F3F6FB !important;
  border-bottom: 1px solid #E4E9F2 !important;
}
.cd-table-card >>> .ag-header-cell {
  background: #F3F6FB !important;
  font-family: 'Prompt', sans-serif !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  letter-spacing: .06em !important;
}
.cd-table-card >>> .ag-header-cell-text { color: #4A5A72 !important; }
.cd-table-card >>> .ag-header-icon { color: #8593A8 !important; }
.cd-table-card >>> .ag-row {
  border-color: #F1F4F9 !important;
  background: #fff !important;
}
.cd-table-card >>> .ag-row:hover { background: #F5FBFA !important; }
.cd-table-card >>> .ag-cell {
  display: flex !important;
  align-items: center !important;
  font-size: 12.5px !important;
  color: #2C3B52 !important;
  line-height: 1.5 !important;
  border-color: #F1F4F9 !important;
  overflow: hidden !important;
}
.cd-table-card >>> .ag-cell > .ag-cell-value,
.cd-table-card >>> .ag-cell > .ag-cell-wrapper {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cd-table-card >>> .ag-cell[col-id="actions"] { justify-content: center !important; }
.cd-table-card >>> .ag-pinned-left-cols-container .ag-cell {
  border-right-color: #E9EEF6 !important;
}
.cd-table-card >>> .ag-horizontal-left-spacer,
.cd-table-card >>> .ag-horizontal-right-spacer { border: 0 !important; }

/* Custom styles for ag-grid cells (ต้องใช้ >>> เพราะ HTML มาจาก cellRenderer จึงไม่มี scope attribute) */
.cd-layout >>> .cd-code-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 7px;
  background: #EEF2F8;
  color: #46566E;
  border: 1px solid #E1E7F0;
  font-family: 'Prompt', sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: .04em;
  line-height: 1.7;
}
.cd-layout >>> .cd-cell-name {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  line-height: 1.4;
}
.cd-layout >>> .cd-cell-name b {
  font-weight: 500;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cd-layout >>> .cd-cell-key {
  flex: 0 0 auto;
  font-size: 9px;
  color: #2FBF8F;
}
.cd-layout >>> .cd-avatar {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-style: normal;
  font-family: 'Prompt', sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
}
.cd-layout >>> .cd-acts {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
}
.cd-layout >>> .cd-act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 11.5px;
  line-height: 1;
  text-decoration: none !important;
  transition: transform .15s ease, filter .15s ease;
}
.cd-layout >>> .cd-act:hover { transform: translateY(-1px); filter: brightness(.97); }
.cd-layout >>> .cd-act--view { background: rgba(76,141,255,.12); color: #1E63D6 !important; }
.cd-layout >>> .cd-act--form { background: rgba(47,191,143,.14); color: #1E8A66 !important; }
.cd-layout >>> .cd-act--login { background: rgba(139,92,246,.13); color: #6D3DD6 !important; }
.cd-layout >>> .cd-act--off {
  background: #F1F4F9;
  color: #C9D1DD !important;
  cursor: not-allowed;
}
.cd-layout >>> .cd-act--off:hover { transform: none; }
.cd-layout >>> .cd-dim { color: #CBD3DF; }

/* ── Table Footer ── */
.cd-table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 16px;
  border-top: 1px solid var(--line);
  background: #FAFBFD;
  flex-shrink: 0;
}
.cd-page-info {
  font-size: 12px;
  color: var(--ink-3);
  white-space: nowrap;
}
.cd-page-info b {
  font-family: 'Prompt', sans-serif;
  font-weight: 600;
  color: var(--ink);
}
.cd-page-info em { font-style: normal; margin: 0 6px; color: #C3CBD8; }
.cd-foot__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cd-table-footer >>> .pagination {
  margin: 0;
  display: inline-flex;
  gap: 4px;
}
.cd-table-footer >>> .pagination > li > a {
  border: 1px solid var(--line);
  border-radius: 8px;
  min-width: 32px;
  height: 32px;
  line-height: 30px;
  padding: 0 9px;
  text-align: center;
  color: var(--ink-2);
  background: #fff;
  font-family: 'Prompt', sans-serif;
  font-size: 12px;
  transition: border-color .18s ease, color .18s ease, background .18s ease;
}
.cd-table-footer >>> .pagination > li > a:hover {
  border-color: #4FD1C5;
  color: var(--ink);
  background: #fff;
}
.cd-table-footer >>> .pagination > li.active > a,
.cd-table-footer >>> .pagination > li.active > a:hover {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}
.cd-table-footer >>> .pagination > li > a.disabled-menu {
  opacity: .4;
  pointer-events: none;
}
</style>
