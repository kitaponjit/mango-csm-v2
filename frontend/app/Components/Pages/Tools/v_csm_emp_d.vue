<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="ed">
          <header class="ed-hero">
            <span class="ed-hero__mesh"></span>
            <span class="ed-hero__dots"></span>
            <div class="ed-hero__grid">
              <div class="ed-hero__main">
                <a class="ed-back" :href="backUrl"><i class="fas fa-arrow-left"></i> รายชื่อพนักงาน IT</a>
                <div class="ed-who">
                  <span class="ed-mono ed-mono--lg">{{ initials }}</span>
                  <div class="ed-who__id">
                    <h2 class="ed-who__name">{{ empname || '—' }}</h2>
                    <div class="ed-who__meta">
                      <span><i class="fas fa-id-badge"></i> EMP {{ empno }}</span>
                      <span><i class="fas fa-calendar-alt"></i> {{ queryString.year || 'ทุกปี' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="ed-hero__figs">
                <div class="ed-ring" :style="{ '--p': grand.rate }">
                  <div class="ed-ring__hole">
                    <span class="ed-ring__num">{{ grand.rate }}<i>%</i></span>
                    <span class="ed-ring__cap">ปิดงานสำเร็จ</span>
                  </div>
                </div>
                <div class="ed-figs">
                  <div class="ed-fig">
                    <span class="ed-fig__num">{{ n(grand.total) }}</span>
                    <span class="ed-fig__cap">งานทั้งหมด</span>
                  </div>
                  <div class="ed-fig">
                    <span class="ed-fig__num is-hot">{{ n(grand.load) }}</span>
                    <span class="ed-fig__cap">ค้างอยู่ในมือ</span>
                  </div>
                  <div class="ed-fig">
                    <span class="ed-fig__num">{{ n(grand.done) }}</span>
                    <span class="ed-fig__cap">ดำเนินการแล้ว</span>
                  </div>
                  <div class="ed-fig">
                    <span class="ed-fig__num">{{ n(grand.complete) }}</span>
                    <span class="ed-fig__cap">ปิดสำเร็จ</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="ed-spectrum">
              <span v-for="s in spectrum" :key="s.key" class="ed-spectrum__seg"
                :style="{ flexGrow: s.value, background: s.color }"
                :title="s.label + ' : ' + s.value + ' งาน (' + s.pct + '%)'">
                <em v-if="s.pct >= 8">{{ s.pct }}%</em>
              </span>
              <span v-if="!grand.total" class="ed-spectrum__seg is-empty" style="flex-grow:1"></span>
            </div>
          </header>

          <section class="ed-kpi">
            <button v-for="x in tabs" :key="x.id" class="ed-tile" :class="{ 'is-on': tabSelected === x.id }"
              :style="{ '--c': x.color, '--sf': x.soft }" @click="mainTabSelected(x)">
              <span class="ed-tile__head">
                <em class="ed-tile__dot"></em>
                <em class="ed-tile__code">{{ x.code }}</em>
                <i class="fas fa-chevron-right ed-tile__pin"></i>
              </span>
              <span class="ed-tile__num">{{ n(x.total) }}</span>
              <span class="ed-tile__label">{{ x.label }}</span>
              <span class="ed-tile__track"><i :style="{ width: pct(x.total) + '%' }"></i></span>
              <span class="ed-tile__meta">{{ pct(x.total) }}% ของงานทั้งหมด</span>
            </button>
          </section>

          <section class="ed-board">
            <div class="ed-board__head">
              <h3 class="ed-board__title">
                <i class="fas fa-clipboard-list"></i> รายการงาน
                <em :style="{ '--c': activeTab.color, '--sf': activeTab.soft }">{{ activeTab.label }}</em>
              </h3>
              <div class="ed-board__tools">
                <div class="ed-search">
                  <i class="fas fa-search"></i>
                  <input type="text" v-model="retrieveSearch.text" @keyup.enter="doSearch()" :placeholder="'ค้นหาเลขที่ CSM'" />
                  <i v-if="retrieveSearch.text" class="fas fa-times ed-search__clear" @click="clearSearch()"></i>
                </div>
                <button class="ed-btn ed-btn--ghost" @click="doSearch()"><i class="fas fa-search"></i> ค้นหา</button>
                <div class="ed-seg">
                  <button :class="{ 'is-on': view === 'card' }" @click="setView('card')"><i class="fas fa-th-large"></i> การ์ด</button>
                  <button :class="{ 'is-on': view === 'table' }" @click="setView('table')"><i class="fas fa-table"></i> ตาราง</button>
                </div>
              </div>
            </div>

            <div class="ed-types">
              <button v-for="s in subTabs" :key="s.id" class="ed-type" :class="{ 'is-on': subTabSelected === s.id }"
                @click="onSubTabChange(s.id)">
                <i :class="s.icon"></i> {{ s.label }}
                <em>{{ n(s.total) }}</em>
              </button>
            </div>

            <div class="ed-jobs" v-show="view === 'card'">
              <a v-for="(x, i) in EmpData" :key="x.job_no + '-' + x.itemno" class="ed-job" :href="openRef(x)" target="_blank"
                :style="{ animationDelay: (i % 10) * 35 + 'ms', '--c': statusMeta(x.status).color }">
                <span class="ed-job__rail"></span>
                <div class="ed-job__top">
                  <span class="ed-job__no">{{ x.job_no }}<i>#{{ x.itemno }}</i></span>
                  <span class="ed-job__status" :style="{ background: statusMeta(x.status).soft, color: statusMeta(x.status).deep }">
                    <em :style="{ background: statusMeta(x.status).color }"></em>{{ statusMeta(x.status).name }}
                  </span>
                </div>
                <p class="ed-job__subject">{{ x.subject || '—' }}</p>
                <div class="ed-job__meta">
                  <span><i class="fas fa-calendar-day"></i> {{ fmtDate(x.job_date) }}</span>
                  <span v-if="x.module"><i class="fas fa-cube"></i> {{ x.module }}</span>
                  <span v-if="x.project" class="ed-job__meta--wide"><i class="fas fa-briefcase"></i> {{ x.project }}</span>
                </div>
                <div class="ed-job__foot">
                  <span class="ed-job__req"><i class="fas fa-user"></i> {{ x.request_empno_name || '—' }}</span>
                  <span v-if="x.task_tester_approve > 0" class="ed-job__warn">
                    <i class="fas fa-vial"></i> ยังไม่ผ่านตรวจ {{ x.task_tester_approve }}
                  </span>
                  <span class="ed-job__open">เปิดเอกสาร <i class="fas fa-external-link-alt"></i></span>
                </div>
              </a>
              <div v-if="!EmpData.length" class="ed-void">
                <i class="fas fa-folder-open"></i> ไม่พบรายการงานตามเงื่อนไขนี้
              </div>
            </div>

            <div class="ed-tablewrap" v-show="view === 'table'">
              <ag-table ref="agr"
                :footer="false"
                @ready="initTable()"
                @cell-clicked="onCellClicked"
                :saveColumns="'Y'"
                :doctype="'VIEW'"
                :page_name="'v_csm_emp_d'">
              </ag-table>
            </div>

            <div class="ed-foot">
              <span class="ed-foot__range">{{ rangeText }}</span>
              <div class="ed-foot__right">
                <div class="ed-field ed-field--sm">
                  <i class="fas fa-list-ol"></i>
                  <select v-model.number="perPage" @change="setPerPage(perPage)">
                    <option v-for="p in [10, 20, 50, 100]" :key="p" :value="p">{{ p }} / หน้า</option>
                  </select>
                </div>
                <pagination ref="paging" @page-change="pageChange($event.page)"></pagination>
              </div>
            </div>
          </section>
        </div>
      </template>
    </re-page>
  </div>
</template>

<script>
  let page = {}
  let paging = {}
  const FAMILY = {
    W: 'wait',
    I: 'in_progress', X: 'in_progress',
    R: 'done', S: 'done', B: 'done', T: 'done',
    Y: 'complete'
  }

  let cpn = {
    data() {
      return {
        auth,
        baseUrl,
        retrieveSearch: {},
        ui: window.ui,
        userid: auth.userid,
        empno: auth.empno,
        empname: '',
        EmpData: [],
        total: 0,
        skipNow: 0,
        perPage: 10,
        view: 'card',
        all_total: 0,
        bug_total: 0,
        req_total: 0,
        contract_total: 0,
        other_total: 0,
        tabs: [
          { id: 'tab1', key: 'wait', code: 'WAIT', label: 'รอดำเนินการ', color: '#8B9CB8', soft: 'rgba(139,156,184,.16)', deep: '#5C6E8A', total: 0 },
          { id: 'tab2', key: 'in_progress', code: 'IN PROGRESS', label: 'กำลังดำเนินการ', color: '#4C8DFF', soft: 'rgba(76,141,255,.14)', deep: '#1E63D6', total: 0 },
          { id: 'tab3', key: 'done', code: 'DONE', label: 'ดำเนินการแล้ว', color: '#F5A623', soft: 'rgba(245,166,35,.17)', deep: '#A9700B', total: 0 },
          { id: 'tab4', key: 'complete', code: 'COMPLETE', label: 'ปิดงานสำเร็จ', color: '#2FBF8F', soft: 'rgba(47,191,143,.15)', deep: '#1E8A66', total: 0 }
        ],
        tabSelected: 'tab1',
        subTabSelected: 1,
        queryString
      }
    },
    computed: {
      activeTab() {
        return this.tabs.find(x => x.id == this.tabSelected) || this.tabs[0]
      },
      subTabs() {
        return [
          { id: 1, label: this.ui.csm_all_doc || 'เอกสารทั้งหมด', icon: 'fas fa-layer-group', total: this.all_total },
          { id: 2, label: 'Bug Software', icon: 'fas fa-bug', total: this.bug_total },
          { id: 3, label: 'Request', icon: 'fas fa-inbox', total: this.req_total },
          { id: 4, label: 'Contract', icon: 'fas fa-file-signature', total: this.contract_total },
          { id: 5, label: 'Other', icon: 'fas fa-ellipsis-h', total: this.other_total }
        ]
      },
      grand() {
        let g = {}
        this.tabs.forEach(x => { g[x.key] = $xt.int(x.total) })
        g.total = this.tabs.reduce((sum, x) => sum + $xt.int(x.total), 0)
        g.load = g.wait + g.in_progress
        g.rate = g.total ? Math.round(g.complete / g.total * 100) : 0
        return g
      },
      spectrum() {
        return this.tabs
          .filter(x => $xt.int(x.total) > 0)
          .map(x => ({ key: x.key, label: x.label, color: x.color, value: $xt.int(x.total), pct: this.pct(x.total) }))
      },
      initials() {
        let src = (this.empname || '').replace(/^(นาย|นางสาว|นาง|น\.ส\.)/, '').trim().split(' ')[0]
        return src ? src.substring(0, 2) : '—'
      },
      backUrl() {
        return this.baseUrl + `page/Tools/v_csm_employee/?year=${this.queryString.year || ''}`
      },
      rangeText() {
        if (!this.total) return 'ไม่พบรายการ'
        return `แสดง ${this.n(this.skipNow + 1)} – ${this.n(this.skipNow + this.EmpData.length)} จาก ${this.n(this.total)} รายการ`
      }
    },
    methods: {
      n(v) {
        return $xt.formatNumber($xt.int(v), 0)
      },
      pct(v) {
        return this.grand.total ? Math.round($xt.int(v) / this.grand.total * 100) : 0
      },
      fmtDate(d) {
        return $xt.formatDate(d, 'DD/MM/YYYY')
      },
      statusMeta(code) {
        let name = $linq(statusCodeData).where(x => x.id == code).select(x => x.name).firstOrDefault() || code || '—'
        let fam = this.tabs.find(x => x.key == FAMILY[code])
        return {
          name,
          color: fam ? fam.color : '#9AA7B8',
          soft: fam ? fam.soft : 'rgba(154,167,184,.16)',
          deep: fam ? fam.deep : '#63728A'
        }
      },
      setView(v) {
        this.view = v
        if (v == 'table') {
          this.$nextTick(() => {
            this.applyGrid()
            $(window).trigger('resize')
          })
        }
      },
      async initTable() {
        let agr = this.$refs.agr

        let fields = [
          ["item", "No.", "text", {
            width: 80,
            align: "center",
            sortable: true,
            cellStyle: { "font-weight": "bold" }
          }],
          ["job_no", "CSM No.", "text", {
            width: 175,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              if (params.value && params.data) {
                const url = this.openRef(params.data)
                return `<a class="ed-cell-link" href="${url}" target="_blank">${params.value}<i class="fas fa-external-link-alt"></i></a>`
              }
              return ''
            }
          }],
          ["job_date", "Date", "datetime", {
            width: 150,
            align: "center",
            sortable: true
          }, { useCellRenderer: true }],
          ["itemno", "Itemno", "number", {
            width: 90,
            align: "center",
            sortable: true,
            cellStyle: { "font-weight": "bold" },
            cellRenderer: (params) => {
              if (params.value) {
                return `${params.value}.`
              }
              return ''
            }
          }],
          ["status", "สถานะ", "text", {
            width: 165,
            align: "left",
            sortable: true,
            cellRenderer: (params) => {
              let m = this.statusMeta(params.value)
              return `<span class="ed-cell-badge" style="--c:${m.color};--sf:${m.soft};--dp:${m.deep}"><i></i>${m.name}</span>`
            }
          }],
          ["module", "Module", "text", {
            width: 120,
            align: "center",
            sortable: true
          }],
          ["subject", "Subject", "text", {
            width: 420,
            align: "left",
            sortable: true
          }],
          ["request_empno_name", "Req. By", "text", {
            width: 220,
            align: "left",
            sortable: true
          }],
          ["project", "Project", "text", {
            width: 220,
            align: "left",
            sortable: true
          }]
        ]

        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)

        this.grid_header = header
        this.applyGrid()
      },
      applyGrid() {
        let agr = this.$refs.agr
        if (!agr || !agr.topGridOptions || !agr.topGridOptions.api) return
        agr.setDisplay(this.EmpData)
      },
      onCellClicked(event) {
      },
      mainTabSelected(x) {
        this.tabSelected = x.id
        this.subTabSelected = 1
        paging.setCurrentPage(1)
        this.callData()
      },
      async onSubTabChange(t) {
        this.subTabSelected = t
        paging.setCurrentPage(1)
        await this.loadData()
      },
      getTabTotal(id, field) {
        $linq(this.tabs).where(x => x.id == id).foreach(x => {
          x.total = $xt.int(field)
        })
      },
      async doSearch() {
        paging.setCurrentPage(1)
        await this.loadData()
      },
      async clearSearch() {
        this.retrieveSearch.text = ''
        await this.doSearch()
      },
      setPerPage(n) {
        paging.setItemsPerPage(n)
        paging.setCurrentPage(1)
        this.loadData()
      },
      async loadTotal() {
        let url = `CSM/Tools/CSMTotal?tabSelected=${this.tabSelected}&empno=${this.empno}&year=${this.queryString.year || ''}`
        let rsp = await $xt.getServer(url)

        this.getTabTotal('tab1', rsp.total_wait)
        this.getTabTotal('tab2', rsp.total_in_progress)
        this.getTabTotal('tab3', rsp.total_done)
        this.getTabTotal('tab4', rsp.total_complete)
      },
      async loadData() {
        let url = `CSM/Tools/CSMRead?tabSelected=${this.tabSelected}&subTabSelected=${this.subTabSelected}&empno=${this.empno}&search_text=${encodeURIComponent(this.retrieveSearch.text || '')}&year=${this.queryString.year || ''}&skip=${paging.skipItems()}&take=${paging.getItemsPerPage()}`

        page.loadingBox.show()
        let rsp = await $xt.getServer(url)

        this.empname = rsp.empname
        this.EmpData = rsp.data || []
        this.all_total = rsp.all_total
        this.bug_total = rsp.bug_total
        this.req_total = rsp.req_total
        this.contract_total = rsp.contract_total
        this.other_total = rsp.other_total
        this.total = rsp.total

        paging.setTotalItems(rsp.total)
        if (!paging.getItemsPerPage()) {
          paging.setCurrentPage(1)
        }

        let i = paging.skipItems()
        this.skipNow = i
        $linq(this.EmpData).foreach(f => {
          f.item = ++i
        })

        paging.createPagesArray()

        this.$nextTick(() => this.applyGrid())

        page.loadingBox.hide()

        page.pageTitle = `Employee IT : ${rsp.empname}`
        document.title = page.pageTitle
      },
      async pageChange(pn) {
        paging.setCurrentPage(pn)
        await this.loadData()
      },
      callData() {
        this.loadTotal()
        this.loadData()
      },
      openRef(x) {
        return this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${x.job_no}&ref_itemno=${x.itemno}`
      }
    },
    mounted() {
      page = this.$refs.page
      page.pageTitle = `Employee IT : `
      document.title = page.pageTitle

      paging = this.$refs.paging
      paging.setCurrentPage(1)
      paging.setItemsPerPage(this.perPage)

      if (!$xt.isEmpty(this.queryString.empno)) {
        this.empno = this.queryString.empno
      }

      this.mainTabSelected({ id: 'tab1' })
    }
  }

  export default cpn
</script>

<style scoped>
.ed {
  --ink: #16263D;
  --ink-2: #4A5A72;
  --ink-3: #8593A8;
  --line: #E4E9F2;
  --surface: #FFFFFF;
  --canvas: #F1F4F9;
  --radius: 16px;
  --shadow: 0 1px 2px rgba(16,32,54,.05), 0 14px 34px -22px rgba(16,32,54,.4);
  font-family: 'Sarabun', 'Helvetica Neue', sans-serif;
  color: var(--ink);
  padding: 2px 0 26px;
}

.ed *,
.ed *::before,
.ed *::after { box-sizing: border-box; }

.ed-hero {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 20px 30px 0;
  background: linear-gradient(118deg, #0B1929 0%, #14304C 52%, #0D2035 100%);
  box-shadow: 0 22px 46px -28px rgba(9,22,38,.8);
}

.ed-hero__mesh {
  position: absolute;
  top: -170px;
  right: -110px;
  width: 470px;
  height: 470px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79,209,197,.3) 0%, rgba(79,209,197,0) 68%);
  pointer-events: none;
}

.ed-hero__dots {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(rgba(255,255,255,.09) 1px, transparent 1px);
  background-size: 18px 18px;
  -webkit-mask-image: linear-gradient(104deg, #000 0%, transparent 62%);
  mask-image: linear-gradient(104deg, #000 0%, transparent 62%);
  pointer-events: none;
}

.ed-hero__grid {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-end;
  justify-content: space-between;
}

.ed-hero__main { flex: 1 1 340px; }

.ed-back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: 'Prompt', sans-serif;
  font-size: 11.5px;
  color: rgba(214,229,242,.62);
  text-decoration: none;
  padding: 4px 0 12px;
  transition: color .18s ease;
}

.ed-back:hover,
.ed-back:focus {
  color: #4FD1C5;
  text-decoration: none;
}

.ed-who {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 22px;
}

.ed-mono {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 12px;
  font-family: 'Prompt', sans-serif;
  font-weight: 500;
  color: #06232B;
  background: #4FD1C5;
}

.ed-mono--lg {
  width: 56px;
  height: 56px;
  font-size: 20px;
  box-shadow: 0 10px 24px -12px rgba(79,209,197,.9);
}

.ed-who__id { min-width: 0; }

.ed-who__name {
  font-family: 'Prompt', sans-serif;
  font-weight: 400;
  font-size: 26px;
  line-height: 1.2;
  color: #fff;
  margin: 0 0 5px;
  letter-spacing: -.01em;
}

.ed-who__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  font-size: 11.5px;
  color: rgba(214,229,242,.58);
}

.ed-who__meta i {
  margin-right: 5px;
  color: rgba(79,209,197,.85);
}

.ed-hero__figs {
  display: flex;
  align-items: center;
  gap: 26px;
  padding-bottom: 22px;
}

.ed-ring {
  --p: 0;
  position: relative;
  flex: 0 0 auto;
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: conic-gradient(#4FD1C5 calc(var(--p) * 1%), rgba(255,255,255,.1) 0);
  display: grid;
  place-items: center;
  transition: background .7s ease;
}

.ed-ring__hole {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: #0E2438;
  display: grid;
  place-content: center;
  text-align: center;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.05);
}

.ed-ring__num {
  font-family: 'Prompt', sans-serif;
  font-size: 25px;
  font-weight: 600;
  line-height: 1;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.ed-ring__num i {
  font-style: normal;
  font-size: 13px;
  color: #4FD1C5;
  margin-left: 1px;
}

.ed-ring__cap {
  display: block;
  font-size: 10px;
  color: rgba(214,229,242,.55);
  margin-top: 4px;
}

.ed-figs {
  display: grid;
  grid-template-columns: repeat(2, minmax(96px, 1fr));
  gap: 12px 26px;
}

.ed-fig__num {
  display: block;
  font-family: 'Prompt', sans-serif;
  font-size: 23px;
  font-weight: 500;
  line-height: 1.1;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.ed-fig__num.is-hot { color: #FFC46B; }

.ed-fig__cap {
  display: block;
  font-size: 11px;
  color: rgba(214,229,242,.52);
}

.ed-spectrum {
  position: relative;
  display: flex;
  gap: 2px;
  height: 30px;
  margin: 0 -30px;
  background: rgba(0,0,0,.25);
}

.ed-spectrum__seg {
  display: grid;
  place-items: center;
  min-width: 3px;
  transition: flex-grow .6s cubic-bezier(.2,.7,.2,1);
}

.ed-spectrum__seg em {
  font-family: 'Prompt', sans-serif;
  font-style: normal;
  font-size: 10.5px;
  font-weight: 500;
  color: rgba(8,22,36,.72);
}

.ed-spectrum__seg.is-empty { background: rgba(255,255,255,.07); }

.ed-kpi {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 18px;
}

.ed-tile {
  --c: #8B9CB8;
  --sf: rgba(139,156,184,.16);
  position: relative;
  overflow: hidden;
  font-family: inherit;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 15px 16px 14px;
  cursor: pointer;
  box-shadow: var(--shadow);
  animation: edRise .5s both;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease, background .2s ease;
}

.ed-tile:nth-child(1) { animation-delay: .02s; }
.ed-tile:nth-child(2) { animation-delay: .07s; }
.ed-tile:nth-child(3) { animation-delay: .12s; }
.ed-tile:nth-child(4) { animation-delay: .17s; }

.ed-tile::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--c);
  opacity: .85;
}

.ed-tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 1px 2px rgba(16,32,54,.05), 0 20px 38px -22px rgba(16,32,54,.55);
}

.ed-tile.is-on {
  border-color: var(--c);
  background: var(--sf);
}

.ed-tile__head {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 9px;
}

.ed-tile__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 0 3px var(--sf);
}

.ed-tile__code {
  font-family: 'Prompt', sans-serif;
  font-style: normal;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: .14em;
  color: var(--ink-3);
}

.ed-tile__pin {
  margin-left: auto;
  font-size: 9.5px;
  color: var(--ink-3);
  opacity: 0;
  transition: opacity .2s ease;
}

.ed-tile:hover .ed-tile__pin,
.ed-tile.is-on .ed-tile__pin { opacity: 1; }
.ed-tile.is-on .ed-tile__pin { color: var(--c); }

.ed-tile__num {
  display: block;
  font-family: 'Prompt', sans-serif;
  font-size: 32px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -.02em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.ed-tile__label {
  display: block;
  font-size: 12.5px;
  color: var(--ink-2);
  margin-top: 3px;
}

.ed-tile__track {
  display: block;
  height: 4px;
  border-radius: 4px;
  background: var(--canvas);
  overflow: hidden;
  margin: 11px 0 7px;
}

.ed-tile__track i {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: var(--c);
  transition: width .7s cubic-bezier(.2,.7,.2,1);
}

.ed-tile__meta {
  display: block;
  font-size: 10.5px;
  color: var(--ink-3);
}

.ed-board {
  margin-top: 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 16px 18px 18px;
  animation: edRise .55s .24s both;
}

.ed-board__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ed-board__title {
  font-family: 'Prompt', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: var(--ink);
  margin: 0;
}

.ed-board__title > i {
  color: var(--ink-3);
  font-size: 13px;
  margin-right: 8px;
}

.ed-board__title em {
  --c: #8B9CB8;
  --sf: rgba(139,156,184,.16);
  font-style: normal;
  font-size: 11.5px;
  font-weight: 500;
  margin-left: 8px;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--sf);
  color: var(--c);
  box-shadow: inset 0 0 0 1px var(--c);
  vertical-align: 2px;
}

.ed-board__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ed-field {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 36px;
  min-width: 130px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--surface);
  padding-left: 32px;
}

.ed-field > i {
  position: absolute;
  left: 12px;
  font-size: 12px;
  color: var(--ink-3);
  pointer-events: none;
}

.ed-field select {
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

.ed-field::after {
  content: '';
  position: absolute;
  right: 13px;
  width: 6px;
  height: 6px;
  border-right: 1.5px solid var(--ink-3);
  border-bottom: 1.5px solid var(--ink-3);
  transform: rotate(45deg) translateY(-2px);
  pointer-events: none;
}

.ed-field--sm {
  height: 32px;
  min-width: 118px;
}

.ed-field--sm select { font-size: 12px; }

.ed-btn {
  height: 36px;
  padding: 0 18px;
  border: 0;
  border-radius: 9px;
  background: #4FD1C5;
  color: #06232B;
  font-family: 'Prompt', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: transform .18s ease, background .18s ease, border-color .18s ease;
}

.ed-btn i { margin-right: 6px; }
.ed-btn:hover { transform: translateY(-1px); }

.ed-btn--ghost {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink-2);
}

.ed-btn--ghost:hover {
  border-color: #4FD1C5;
  color: var(--ink);
}

.ed-search {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 36px;
  min-width: 230px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--surface);
  padding: 0 32px;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.ed-search:focus-within {
  border-color: #4FD1C5;
  box-shadow: 0 0 0 3px rgba(79,209,197,.15);
}

.ed-search > i {
  position: absolute;
  left: 12px;
  font-size: 12px;
  color: var(--ink-3);
}

.ed-search > i.ed-search__clear {
  left: auto;
  right: 11px;
  cursor: pointer;
}

.ed-search > i.ed-search__clear:hover { color: var(--ink); }

.ed-search input {
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 13px;
  width: 100%;
  height: 100%;
  color: var(--ink);
}

.ed-seg {
  display: inline-flex;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 9px;
  overflow: hidden;
  background: var(--canvas);
}

.ed-seg button {
  border: 0;
  background: transparent;
  padding: 0 15px;
  font-family: 'Prompt', sans-serif;
  font-size: 12.5px;
  color: var(--ink-2);
  cursor: pointer;
  transition: background .2s ease, color .2s ease;
}

.ed-seg button i {
  font-size: 11px;
  margin-right: 6px;
}

.ed-seg button.is-on {
  background: var(--ink);
  color: #fff;
}

.ed-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 0 2px;
  margin-top: 14px;
  border-top: 1px solid var(--line);
}

.ed-type {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 13px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--surface);
  font-family: inherit;
  font-size: 12.5px;
  color: var(--ink-2);
  cursor: pointer;
  transition: border-color .18s ease, color .18s ease, background .18s ease;
}

.ed-type i { font-size: 11px; color: var(--ink-3); }

.ed-type em {
  font-style: normal;
  font-family: 'Prompt', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 20px;
  background: var(--canvas);
  color: var(--ink-2);
  font-variant-numeric: tabular-nums;
}

.ed-type:hover {
  border-color: #C9D3E2;
  color: var(--ink);
}

.ed-type.is-on {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

.ed-type.is-on i { color: #4FD1C5; }

.ed-type.is-on em {
  background: rgba(255,255,255,.16);
  color: #fff;
}

.ed-jobs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 12px;
  padding-top: 16px;
}

.ed-job {
  --c: #8B9CB8;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--surface);
  padding: 13px 16px 12px;
  text-decoration: none;
  color: inherit;
  animation: edRise .45s both;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}

.ed-job:hover,
.ed-job:focus {
  transform: translateY(-3px);
  border-color: #D3DBE8;
  box-shadow: 0 18px 32px -22px rgba(16,32,54,.6);
  text-decoration: none;
  color: inherit;
}

.ed-job__rail {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--c);
  opacity: .55;
}

.ed-job__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ed-job__no {
  font-family: 'Prompt', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink);
  letter-spacing: .01em;
}

.ed-job__no i {
  font-style: normal;
  font-size: 10.5px;
  font-weight: 400;
  color: var(--ink-3);
  margin-left: 7px;
}

.ed-job__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 20px;
}

.ed-job__status em {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.ed-job__subject {
  font-size: 13px;
  line-height: 1.45;
  color: var(--ink);
  margin: 9px 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 38px;
}

.ed-job__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 11px;
  color: var(--ink-2);
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--line);
}

.ed-job__meta i {
  color: var(--ink-3);
  margin-right: 5px;
}

.ed-job__meta--wide {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ed-job__foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 9px;
  font-size: 11px;
  color: var(--ink-2);
}

.ed-job__req {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ed-job__req i {
  color: var(--ink-3);
  margin-right: 5px;
}

.ed-job__warn {
  flex: 0 0 auto;
  padding: 1px 8px;
  border-radius: 20px;
  background: rgba(245,166,35,.15);
  color: #A9700B;
  font-size: 10.5px;
}

.ed-job__warn i { margin-right: 4px; }

.ed-job__open {
  flex: 0 0 auto;
  margin-left: auto;
  font-family: 'Prompt', sans-serif;
  font-size: 11px;
  color: var(--ink-3);
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity .2s ease, transform .2s ease, color .2s ease;
}

.ed-job__open i { margin-left: 5px; font-size: 9.5px; }

.ed-job:hover .ed-job__open {
  opacity: 1;
  transform: none;
  color: #127C8E;
}

.ed-void {
  grid-column: 1 / -1;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 8px;
  height: 190px;
  color: var(--ink-3);
  font-size: 13px;
}

.ed-void i {
  font-size: 26px;
  opacity: .45;
}

.ed-tablewrap { padding-top: 16px; }

.ed-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid var(--line);
}

.ed-foot__range {
  font-size: 12px;
  color: var(--ink-3);
}

.ed-foot__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

@keyframes edRise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}

::v-deep .pagination {
  margin: 0;
  display: inline-flex;
  gap: 4px;
}

::v-deep .pagination > li > a {
  border: 1px solid var(--line);
  border-radius: 8px;
  min-width: 32px;
  height: 32px;
  line-height: 30px;
  padding: 0 9px;
  text-align: center;
  color: var(--ink-2);
  background: var(--surface);
  font-family: 'Prompt', sans-serif;
  font-size: 12px;
  transition: border-color .18s ease, color .18s ease, background .18s ease;
}

::v-deep .pagination > li > a:hover {
  border-color: #4FD1C5;
  color: var(--ink);
  background: var(--surface);
}

::v-deep .pagination > li.active > a,
::v-deep .pagination > li.active > a:hover {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

::v-deep .pagination > li > a.disabled-menu {
  opacity: .4;
  pointer-events: none;
}

::v-deep .ed-cell-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: 'Prompt', sans-serif;
  font-size: 12.5px;
  color: var(--ink);
  text-decoration: none;
}

::v-deep .ed-cell-link i {
  font-size: 9.5px;
  color: #B4BFCE;
}

::v-deep .ed-cell-link:hover {
  color: #127C8E;
  text-decoration: underline;
}

::v-deep .ed-cell-link:hover i { color: #127C8E; }

::v-deep .ed-cell-badge {
  --c: #8B9CB8;
  --sf: rgba(139,156,184,.16);
  --dp: #5C6E8A;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 2px 11px;
  border-radius: 20px;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--dp);
  background: var(--sf);
}

::v-deep .ed-cell-badge i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c);
}

::v-deep .ag-row { min-height: 44px !important; }

::v-deep .ag-cell {
  line-height: 44px !important;
  padding-top: 5px !important;
  padding-bottom: 5px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

::v-deep .ag-cell[col-id="status"],
::v-deep .ag-cell[col-id="subject"],
::v-deep .ag-cell[col-id="request_empno_name"],
::v-deep .ag-cell[col-id="project"] {
  justify-content: flex-start !important;
}

::v-deep .ag-header-cell {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

@media (max-width: 1199px) {
  .ed-kpi { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 991px) {
  .ed-hero { padding: 18px 20px 0; }
  .ed-spectrum { margin: 0 -20px; }
  .ed-who__name { font-size: 22px; }
  .ed-hero__figs { gap: 18px; }
}

@media (max-width: 575px) {
  .ed-kpi { grid-template-columns: 1fr; }
  .ed-hero__figs { flex-direction: column; align-items: flex-start; }
  .ed-board__tools { width: 100%; }
  .ed-search { flex: 1 1 auto; min-width: 0; }
  .ed-foot { justify-content: center; }
}
</style>

<style>
body.dark-mode .ed {
  --ink: #E6EDF6;
  --ink-2: #A9B7C9;
  --ink-3: #7C8BA0;
  --line: #2A3648;
  --surface: #1B2433;
  --canvas: #232E3F;
  --shadow: 0 1px 2px rgba(0,0,0,.3), 0 14px 34px -22px rgba(0,0,0,.85);
}

body.dark-mode .ed-seg button.is-on,
body.dark-mode .ed-type.is-on {
  background: #4FD1C5;
  border-color: #4FD1C5;
  color: #06232B;
}

body.dark-mode .ed-type.is-on i { color: #06232B; }
body.dark-mode .ed-type.is-on em { background: rgba(6,35,43,.18); color: #06232B; }
body.dark-mode .ed-job:hover { border-color: #3B4A60; }
body.dark-mode .ed-job__warn { background: rgba(245,166,35,.2); color: #F5C77E; }
body.dark-mode .ed-job:hover .ed-job__open { color: #4FD1C5; }
body.dark-mode .ed-cell-link { color: #E6EDF6; }
body.dark-mode .ed-cell-link:hover,
body.dark-mode .ed-cell-link:hover i { color: #4FD1C5; }
body.dark-mode .ed-cell-badge { color: var(--c); }
body.dark-mode .pagination > li.active > a,
body.dark-mode .pagination > li.active > a:hover {
  background: #4FD1C5;
  border-color: #4FD1C5;
  color: #06232B;
}
</style>
