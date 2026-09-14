<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <div class="ed">
          <header class="ed-hero">
            <span class="ed-hero__deco">
              <span class="ed-hero__mesh"></span>
              <span class="ed-hero__dots"></span>
            </span>
            <div class="ed-hero__grid">
              <div class="ed-hero__main">
                <div class="ed-eyebrow"><i class="fas fa-layer-group"></i> IT WORKLOAD BOARD</div>
                <h2 class="ed-hero__title">ภาพรวมงานทีม IT <b>{{ retrieveSearch.year || 'ทุกปี' }}</b></h2>
                <p class="ed-hero__sub">สรุปปริมาณงานที่มอบหมายและสถานะการปิดงานของพนักงานแต่ละคน</p>
                <div class="ed-hero__ctrl">
                  <div class="ed-year" v-click-outside="closeYear">
                    <button class="ed-year__btn" :class="{ 'is-open': yearOpen }" @click="yearOpen = !yearOpen">
                      <i class="fas fa-calendar-alt"></i>
                      <span>{{ retrieveSearch.year || 'ทุกปี' }}</span>
                      <i class="fas fa-chevron-down ed-year__chev"></i>
                    </button>
                    <transition name="ed-pop">
                      <div class="ed-year__pop" v-if="yearOpen">
                        <button class="ed-year__all" :class="{ 'is-on': !retrieveSearch.year }" @click="pickYear('')">
                          <i class="fas fa-layer-group"></i> ทุกปี
                        </button>
                        <div class="ed-year__grid">
                          <button v-for="y in years" :key="y"
                            :class="{ 'is-on': retrieveSearch.year == y, 'is-now': y == thisYear }"
                            @click="pickYear(y)">{{ y }}</button>
                        </div>
                      </div>
                    </transition>
                  </div>
                  <button class="ed-btn" @click="loadRetrieve"><i class="fas fa-sync-alt"></i> ค้นหางาน</button>
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
                    <span class="ed-fig__num">{{ n(total) }}</span>
                    <span class="ed-fig__cap">พนักงาน</span>
                  </div>
                  <div class="ed-fig">
                    <span class="ed-fig__num is-hot">{{ n(grand.load) }}</span>
                    <span class="ed-fig__cap">ค้างอยู่ในมือ</span>
                  </div>
                  <div class="ed-fig">
                    <span class="ed-fig__num">{{ grand.avg }}</span>
                    <span class="ed-fig__cap">เฉลี่ย / คน</span>
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
            <button v-for="s in statuses" :key="s.key" class="ed-tile" :class="{ 'is-on': focus === s.key }"
              :style="{ '--c': s.color, '--sf': s.soft }" @click="toggleFocus(s.key)">
              <span class="ed-tile__head">
                <em class="ed-tile__dot"></em>
                <em class="ed-tile__code">{{ s.code }}</em>
                <i class="fas fa-filter ed-tile__pin"></i>
              </span>
              <span class="ed-tile__num">{{ n(grand[s.key]) }}</span>
              <span class="ed-tile__label">{{ s.label }}</span>
              <span class="ed-tile__track"><i :style="{ width: pct(grand[s.key]) + '%' }"></i></span>
              <span class="ed-tile__meta">{{ pct(grand[s.key]) }}% ของงานทั้งหมด · {{ headcount(s.key) }} คน</span>
            </button>
          </section>

          <section class="ed-panels">
            <article class="ed-panel">
              <div class="ed-panel__head">
                <h3><i class="fas fa-chart-pie"></i> สัดส่วนสถานะงาน</h3>
              </div>
              <v-chart v-if="grand.total" ref="chartMix" autoresize style="width:100%;height:310px;" :option="mixOption" />
              <div v-else class="ed-void"><i class="fas fa-inbox"></i> ไม่มีข้อมูลในปีนี้</div>
            </article>
            <article class="ed-panel ed-panel--wide">
              <div class="ed-panel__head">
                <h3><i class="fas fa-medal"></i> อันดับปริมาณงาน</h3>
                <span class="ed-panel__hint">10 อันดับแรก แยกตามสถานะ</span>
              </div>
              <v-chart v-if="grand.total" ref="chartRank" autoresize style="width:100%;height:310px;" :option="rankOption" />
              <div v-else class="ed-void"><i class="fas fa-inbox"></i> ไม่มีข้อมูลในปีนี้</div>
            </article>
          </section>

          <section class="ed-board">
            <div class="ed-board__head">
              <h3 class="ed-board__title">
                <i class="fas fa-users"></i> รายชื่อพนักงาน IT <em>{{ shown.length }}</em>
              </h3>
              <div class="ed-board__tools">
                <div class="ed-search">
                  <i class="fas fa-search"></i>
                  <input type="text" v-model="keyword" placeholder="ค้นหาชื่อ / รหัสพนักงาน" />
                  <i v-if="keyword" class="fas fa-times ed-search__clear" @click="keyword = ''"></i>
                </div>
                <div class="ed-field">
                  <i class="fas fa-sort-amount-down"></i>
                  <select v-model="sortBy">
                    <option value="total">งานมากที่สุด</option>
                    <option value="load">ค้างในมือมากที่สุด</option>
                    <option value="rate">อัตราปิดงานสูงสุด</option>
                    <option value="empcode">รหัสพนักงาน</option>
                    <option value="empname">ชื่อพนักงาน</option>
                  </select>
                </div>
                <div class="ed-seg">
                  <button :class="{ 'is-on': view === 'card' }" @click="setView('card')"><i class="fas fa-th-large"></i> การ์ด</button>
                  <button :class="{ 'is-on': view === 'table' }" @click="setView('table')"><i class="fas fa-table"></i> ตาราง</button>
                </div>
              </div>
            </div>

            <div class="ed-focusbar" v-if="focus">
              <span class="ed-chip" :style="{ '--c': statusOf(focus).color, '--sf': statusOf(focus).soft }">
                <em></em> เน้นสถานะ {{ statusOf(focus).label }}
                <i class="fas fa-times" @click="focus = ''"></i>
              </span>
              <span class="ed-focusbar__hint">แสดงเฉพาะคนที่มีงานสถานะนี้ เรียงจากมากไปน้อย</span>
            </div>

            <div class="ed-cards" v-show="view === 'card'">
              <a v-for="(e, i) in shown" :key="e.empno" class="ed-card" :href="queryString(e)" target="_blank"
                :style="{ animationDelay: (i % 12) * 40 + 'ms' }">
                <span class="ed-card__rail" :style="{ background: e.tint }"></span>
                <div class="ed-card__top">
                  <span class="ed-mono" :style="{ background: e.tint }">{{ e.initials }}</span>
                  <span class="ed-card__id">
                    <b>{{ e.empname }}</b>
                    <i>{{ e.empcode }}</i>
                  </span>
                  <span class="ed-card__total" :class="{ 'is-zero': !e.total }">
                    <b>{{ n(e.total) }}</b><i>งาน</i>
                  </span>
                </div>
                <div class="ed-card__bar">
                  <span v-for="s in e.segs" :key="s.key" :style="{ flexGrow: s.value, background: s.color }"
                    :title="s.label + ' : ' + s.value"></span>
                  <span v-if="!e.total" class="is-empty" style="flex-grow:1"></span>
                </div>
                <div class="ed-card__foot">
                  <span v-for="s in e.segs" :key="s.key" class="ed-tag" :style="{ '--c': s.color }">
                    <em></em>{{ s.short }} <b>{{ s.value }}</b>
                  </span>
                  <span v-if="!e.total" class="ed-card__none">ยังไม่มีงานในปีนี้</span>
                  <span v-if="e.total" class="ed-card__rate" :class="rateClass(e.rate)">
                    <i class="fas fa-check-circle"></i> {{ e.rate }}%
                  </span>
                </div>
              </a>
              <div v-if="!shown.length" class="ed-void ed-void--wide">
                <i class="fas fa-user-slash"></i> ไม่พบพนักงานที่ตรงกับเงื่อนไข
              </div>
            </div>

            <div class="ed-tablewrap" v-show="view === 'table'">
              <ag-table ref="agr"
                :footer="false"
                @ready="initTable()"
                @cell-clicked="onCellClicked"
                :saveColumns="'Y'"
                :doctype="'VIEW'"
                :page_name="'v_csm_employee'"
                >
              </ag-table>
            </div>
          </section>
        </div>
      </template>
    </re-page>
  </div>
</template>

<script>
  import * as echarts from 'echarts'
  import VChart from 'vue-echarts'

  let page = {}
  const TINTS = ['#31628F', '#2F8072', '#6B5B9E', '#8C6239', '#3B6EA5', '#7E8B36', '#96566A', '#347F84', '#5C6BA8', '#8A5340']

  let cpn = {
    components: {
      'v-chart': VChart
    },
    directives: {
      clickOutside: {
        bind(el, binding) {
          el._clickOutsideHandler = (e) => { if (!el.contains(e.target)) binding.value(e) }
          document.addEventListener('click', el._clickOutsideHandler)
        },
        unbind(el) { document.removeEventListener('click', el._clickOutsideHandler) }
      }
    },
    data() {
      return {
        auth,
        baseUrl,
        retrieveSearch: {
          year: moment(new Date()).format('YYYY')
        },
        ui: window.ui,
        userid: auth.userid,
        empno: auth.empno,
        EmpData: [],
        total: 0,
        keyword: '',
        sortBy: 'total',
        view: 'card',
        focus: '',
        yearOpen: false,
        thisYear: moment().format('YYYY'),
        statuses: [
          { key: 'wait', code: 'WAIT', label: 'รอดำเนินการ', short: 'รอ', color: '#8B9CB8', soft: 'rgba(139,156,184,.16)', deep: '#5C6E8A' },
          { key: 'in_progress', code: 'IN PROGRESS', label: 'กำลังดำเนินการ', short: 'กำลังทำ', color: '#4C8DFF', soft: 'rgba(76,141,255,.14)', deep: '#1E63D6' },
          { key: 'done', code: 'DONE', label: 'ดำเนินการแล้ว', short: 'ทำแล้ว', color: '#F5A623', soft: 'rgba(245,166,35,.17)', deep: '#A9700B' },
          { key: 'complete', code: 'COMPLETE', label: 'ปิดงานสำเร็จ', short: 'สำเร็จ', color: '#2FBF8F', soft: 'rgba(47,191,143,.15)', deep: '#1E8A66' },
          { key: 'cancel', code: 'REJECT', label: 'ตีกลับ / ยกเลิก', short: 'ตีกลับ', color: '#F2685E', soft: 'rgba(242,104,94,.14)', deep: '#C93B31' }
        ]
      }
    },
    computed: {
      years() {
        let list = []
        let y = moment().add(1, 'y')
        let start = moment(new Date(2017, 0, 1))
        while (y.diff(start, 'years') >= 0) {
          list.push(y.format('YYYY'))
          y.subtract(1, 'year')
        }
        return list
      },
      rows() {
        return (this.EmpData || []).map(x => {
          let total = this.statuses.reduce((sum, s) => sum + (x[s.key] || 0), 0)
          return Object.assign({}, x, {
            total,
            load: (x.wait || 0) + (x.in_progress || 0),
            rate: total ? Math.round((x.complete || 0) / total * 100) : 0,
            initials: this.initialOf(x.empname, x.empcode),
            tint: TINTS[Math.abs(this.hash(x.empcode || '')) % TINTS.length],
            segs: this.statuses
              .filter(s => (x[s.key] || 0) > 0)
              .map(s => ({ key: s.key, label: s.label, short: s.short, color: s.color, value: x[s.key] }))
          })
        })
      },
      grand() {
        let g = { total: 0, load: 0, rate: 0, avg: 0 }
        this.statuses.forEach(s => { g[s.key] = 0 })
        this.rows.forEach(x => {
          this.statuses.forEach(s => { g[s.key] += x[s.key] || 0 })
        })
        g.total = this.statuses.reduce((sum, s) => sum + g[s.key], 0)
        g.load = g.wait + g.in_progress
        g.rate = g.total ? Math.round(g.complete / g.total * 100) : 0
        g.avg = this.rows.length ? Math.round(g.total / this.rows.length * 10) / 10 : 0
        return g
      },
      spectrum() {
        return this.statuses
          .filter(s => this.grand[s.key] > 0)
          .map(s => ({ key: s.key, label: s.label, color: s.color, value: this.grand[s.key], pct: this.pct(this.grand[s.key]) }))
      },
      shown() {
        let list = this.rows.slice()
        let kw = (this.keyword || '').trim().toLowerCase()
        if (kw) {
          list = list.filter(x => `${x.empname} ${x.empcode}`.toLowerCase().indexOf(kw) > -1)
        }
        if (this.focus) {
          return list.filter(x => (x[this.focus] || 0) > 0)
            .sort((a, b) => b[this.focus] - a[this.focus] || b.total - a.total)
        }
        if (this.sortBy == 'empcode' || this.sortBy == 'empname') {
          return list.sort((a, b) => String(a[this.sortBy]).localeCompare(String(b[this.sortBy]), 'th'))
        }
        return list.sort((a, b) => b[this.sortBy] - a[this.sortBy] || String(a.empcode).localeCompare(String(b.empcode)))
      },
      mixOption() {
        return {
          tooltip: { trigger: 'item', formatter: '{b}<br/><b>{c}</b> งาน ({d}%)' },
          legend: {
            bottom: 0, left: 'center', itemWidth: 9, itemHeight: 9, icon: 'circle', itemGap: 14,
            textStyle: { color: '#7A879B', fontFamily: 'Sarabun', fontSize: 12 }
          },
          title: {
            text: this.n(this.grand.total), subtext: 'งานทั้งหมด', left: 'center', top: '31%',
            textStyle: { color: '#16263D', fontFamily: 'Prompt', fontSize: 30, fontWeight: 600 },
            subtextStyle: { color: '#8593A8', fontFamily: 'Sarabun', fontSize: 12 }
          },
          series: [{
            type: 'pie', radius: ['62%', '84%'], center: ['50%', '44%'], avoidLabelOverlap: true,
            itemStyle: { borderColor: 'transparent', borderWidth: 4 },
            label: { show: false },
            labelLine: { show: false },
            emphasis: { scale: true, scaleSize: 7, itemStyle: { shadowBlur: 20, shadowColor: 'rgba(15,27,45,.28)' } },
            data: this.statuses.map(s => ({ name: s.label, value: this.grand[s.key], itemStyle: { color: s.color } }))
          }]
        }
      },
      rankOption() {
        let top = this.rows.slice().sort((a, b) => b.total - a.total).slice(0, 10).reverse()
        let last = this.statuses.length - 1
        return {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: {
            top: 0, right: 0, itemWidth: 9, itemHeight: 9, icon: 'circle', itemGap: 12,
            textStyle: { color: '#7A879B', fontFamily: 'Sarabun', fontSize: 11 }
          },
          grid: { left: 4, right: 26, top: 34, bottom: 0, containLabel: true },
          xAxis: {
            type: 'value', axisLine: { show: false }, axisTick: { show: false },
            splitLine: { lineStyle: { color: 'rgba(122,135,155,.16)' } },
            axisLabel: { color: '#8593A8', fontFamily: 'Prompt', fontSize: 11 }
          },
          yAxis: {
            type: 'category', data: top.map(x => x.empcode),
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: { color: '#4A5A72', fontFamily: 'Prompt', fontSize: 11, fontWeight: 600 }
          },
          series: this.statuses.map((s, i) => ({
            name: s.label, type: 'bar', stack: 'load', barWidth: 13,
            itemStyle: {
              color: s.color,
              borderRadius: i == 0 ? [3, 0, 0, 3] : (i == last ? [0, 3, 3, 0] : 0)
            },
            emphasis: { focus: 'series' },
            data: top.map(x => x[s.key] || 0)
          }))
        }
      }
    },
    methods: {
      n(v) {
        return $xt.formatNumber(v || 0, 0)
      },
      pct(v) {
        return this.grand.total ? Math.round((v || 0) / this.grand.total * 100) : 0
      },
      headcount(key) {
        return this.rows.filter(x => (x[key] || 0) > 0).length
      },
      statusOf(key) {
        return this.statuses.find(s => s.key == key) || {}
      },
      rateClass(rate) {
        if (rate >= 80) return 'is-good'
        if (rate >= 40) return 'is-mid'
        return 'is-low'
      },
      toggleFocus(key) {
        this.focus = this.focus == key ? '' : key
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
      hash(str) {
        let h = 0
        for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
        return h
      },
      initialOf(name, code) {
        let nick = /\(([^)]+)\)/.exec(name || '')
        let src = nick ? nick[1] : (name || '').replace(/^(นาย|นางสาว|นาง|น\.ส\.)/, '').trim()
        src = src.split(' ')[0] || code || '?'
        return src.substring(0, 2)
      },
      async initTable() {
        let agr = this.$refs.agr

        let fields = [
          ["empcode", "รหัส", "text", {
            width: 110,
            align: "center",
            sortable: true, pinned: 'left',
            cellStyle: { "font-weight": "bold" }
          }],
          ["empname", "ชื่อพนักงาน", "text", {
            width: 300,
            align: "left", pinned: 'left',
            sortable: true,
            cellRenderer: (params) => {
              if (params.value && params.data) {
                const url = this.queryString(params.data)
                const initials = this.initialOf(params.data.empname, params.data.empcode)
                const tint = TINTS[Math.abs(this.hash(params.data.empcode || '')) % TINTS.length]
                return `<a class="ed-cell-emp" href="${url}" target="_blank"><i style="background:${tint}">${initials}</i><b>${params.value}</b></a>`
              }
              return ''
            }
          }],
          ["mix", "สัดส่วนสถานะ", "text", {
            width: 230,
            align: "left",
            sortable: false,
            cellRenderer: (params) => {
              let d = params.data || {}
              if (!d.total) return `<span class="ed-cell-dim">—</span>`
              let bars = this.statuses
                .filter(s => (d[s.key] || 0) > 0)
                .map(s => `<i style="flex-grow:${d[s.key]};background:${s.color}" title="${s.label} : ${d[s.key]}"></i>`)
                .join('')
              return `<span class="ed-cell-bar">${bars}</span>`
            }
          }],
          ...this.statuses.map(s => [s.key, s.code, "number", {
            width: 130,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              if (params.value > 0) {
                return `<span class="ed-cell-badge" style="--c:${s.color};--sf:${s.soft};--dp:${s.deep}">${params.value}</span>`
              }
              return `<span class="ed-cell-dim">—</span>`
            }
          }]),
          ["total", "รวม", "number", {
            width: 110,
            align: "center",
            sortable: true,
            cellRenderer: (params) => {
              if (params.value > 0) {
                return `<span class="ed-cell-total">${params.value}</span>`
              }
              return `<span class="ed-cell-dim">—</span>`
            }
          }],
          ["rate", "ปิดงาน %", "number", {
            width: 150,
            align: "left",
            sortable: true,
            cellRenderer: (params) => {
              let d = params.data || {}
              if (!d.total) return `<span class="ed-cell-dim">—</span>`
              return `<span class="ed-cell-rate"><i><b style="width:${d.rate}%"></b></i><em>${d.rate}%</em></span>`
            }
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
        agr.setDisplay(this.rows)
      },
      onCellClicked(event) {
      },
      async loadRetrieve() {
        page.loadingBox.show()
        let url = `CSM/Tools/EmployeeReadList?sort=empcode&year=${encodeURIComponent(this.retrieveSearch.year || '')}`
        let rsp = await $xt.getServer(url)

        if (rsp.error) {
          page.loadingBox.hide()
          $msg.alert(rsp.error)
          return
        }

        this.EmpData = rsp.data || []
        this.total = rsp.total || 0
        this.$nextTick(() => this.applyGrid())

        page.loadingBox.hide()
      },
      queryString(x) {
        return this.baseUrl + `page/Tools/v_csm_emp_d/?empno=${x.empno}&year=${this.retrieveSearch.year || ''}`
      },
      pickYear(y) {
        this.retrieveSearch.year = y
        this.yearOpen = false
        this.loadRetrieve()
      },
      closeYear() {
        this.yearOpen = false
      }
    },
    mounted() {
      page = this.$refs.page
      page.pageTitle = `รายชื่อพนักงาน IT ทั้งหมด`
      document.title = page.pageTitle

      this.loadRetrieve()
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
  border-radius: 20px;
  padding: 26px 30px 0;
  background: linear-gradient(118deg, #0B1929 0%, #14304C 52%, #0D2035 100%);
  box-shadow: 0 22px 46px -28px rgba(9,22,38,.8);
}

.ed-hero__deco {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 20px;
  pointer-events: none;
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

.ed-eyebrow {
  font-family: 'Prompt', sans-serif;
  font-size: 10.5px;
  letter-spacing: .22em;
  color: #4FD1C5;
  margin-bottom: 10px;
}

.ed-eyebrow i { margin-right: 6px; }

.ed-hero__title {
  font-family: 'Prompt', sans-serif;
  font-weight: 300;
  font-size: 30px;
  line-height: 1.18;
  color: #fff;
  margin: 0 0 6px;
  letter-spacing: -.01em;
}

.ed-hero__title b {
  font-weight: 600;
  color: #4FD1C5;
  font-variant-numeric: tabular-nums;
}

.ed-hero__sub {
  color: rgba(220,232,245,.6);
  font-size: 13px;
  margin: 0 0 18px;
}

.ed-hero__ctrl {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 22px;
}

.ed-field {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 36px;
  min-width: 155px;
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

.ed-year { position: relative; }

.ed-year__btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 9px;
  background: rgba(255,255,255,.07);
  color: #EAF2FA;
  font-family: 'Prompt', sans-serif;
  font-size: 13px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background .18s ease, border-color .18s ease;
}

.ed-year__btn > i:first-child {
  font-size: 12px;
  color: #4FD1C5;
}

.ed-year__btn:hover {
  background: rgba(255,255,255,.12);
  border-color: rgba(79,209,197,.5);
}

.ed-year__btn.is-open {
  background: rgba(79,209,197,.16);
  border-color: #4FD1C5;
}

.ed-year__chev {
  font-size: 9.5px;
  color: rgba(234,242,250,.6);
  transition: transform .2s ease;
}

.ed-year__btn.is-open .ed-year__chev { transform: rotate(180deg); }

.ed-year__pop {
  position: absolute;
  z-index: 40;
  top: calc(100% + 9px);
  left: 0;
  width: 258px;
  padding: 10px;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 14px;
  background: rgba(12,30,48,.97);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: 0 26px 50px -22px rgba(0,0,0,.85);
}

.ed-year__pop::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 22px;
  width: 9px;
  height: 9px;
  transform: rotate(45deg);
  background: rgba(12,30,48,.97);
  border-left: 1px solid rgba(255,255,255,.14);
  border-top: 1px solid rgba(255,255,255,.14);
}

.ed-year__all {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 32px;
  margin-bottom: 8px;
  padding: 0 11px;
  border: 1px dashed rgba(255,255,255,.18);
  border-radius: 9px;
  background: transparent;
  color: rgba(234,242,250,.78);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: border-color .18s ease, background .18s ease, color .18s ease;
}

.ed-year__all i {
  font-size: 10.5px;
  color: rgba(79,209,197,.85);
}

.ed-year__all:hover {
  border-color: rgba(79,209,197,.55);
  color: #fff;
}

.ed-year__all.is-on {
  border-style: solid;
  border-color: #4FD1C5;
  background: rgba(79,209,197,.16);
  color: #fff;
}

.ed-year__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.ed-year__grid button {
  height: 30px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: rgba(255,255,255,.05);
  color: rgba(234,242,250,.8);
  font-family: 'Prompt', sans-serif;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background .16s ease, color .16s ease, border-color .16s ease;
}

.ed-year__grid button:hover {
  background: rgba(255,255,255,.14);
  color: #fff;
}

.ed-year__grid button.is-now { box-shadow: inset 0 -2px 0 rgba(79,209,197,.55); }

.ed-year__grid button.is-on {
  background: #4FD1C5;
  border-color: #4FD1C5;
  color: #06232B;
  font-weight: 600;
  box-shadow: 0 6px 16px -8px rgba(79,209,197,.9);
}

.ed-pop-enter-active,
.ed-pop-leave-active { transition: opacity .16s ease, transform .16s ease; }

.ed-pop-enter,
.ed-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(.985);
}

.ed-btn {
  height: 36px;
  padding: 0 20px;
  border: 0;
  border-radius: 9px;
  background: #4FD1C5;
  color: #06232B;
  font-family: 'Prompt', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 8px 18px -10px rgba(79,209,197,.9);
  transition: transform .18s ease, background .18s ease;
}

.ed-btn i { margin-right: 6px; }
.ed-btn:hover { background: #6BE0D5; transform: translateY(-1px); }
.ed-btn:active { transform: translateY(0); }

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
  overflow: hidden;
  border-radius: 0 0 20px 20px;
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
  grid-template-columns: repeat(5, 1fr);
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
.ed-tile:nth-child(5) { animation-delay: .22s; }

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

.ed-panels {
  display: grid;
  grid-template-columns: minmax(280px, 5fr) minmax(340px, 7fr);
  gap: 14px;
  margin-top: 14px;
}

.ed-panel {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 16px 18px 12px;
  animation: edRise .55s .26s both;
}

.ed-panel--wide { animation-delay: .32s; }

.ed-panel__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
}

.ed-panel__head h3 {
  font-family: 'Prompt', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
  margin: 0;
}

.ed-panel__head h3 i {
  color: var(--ink-3);
  font-size: 12px;
  margin-right: 7px;
}

.ed-panel__hint {
  font-size: 11px;
  color: var(--ink-3);
}

.ed-void {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 8px;
  height: 250px;
  color: var(--ink-3);
  font-size: 13px;
}

.ed-void i {
  font-size: 26px;
  opacity: .45;
}

.ed-void--wide {
  grid-column: 1 / -1;
  height: 170px;
}

.ed-board {
  margin-top: 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 16px 18px 20px;
  animation: edRise .55s .38s both;
}

.ed-board__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line);
}

.ed-board__title {
  font-family: 'Prompt', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: var(--ink);
  margin: 0;
}

.ed-board__title i {
  color: var(--ink-3);
  font-size: 13px;
  margin-right: 8px;
}

.ed-board__title em {
  font-style: normal;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--canvas);
  color: var(--ink-2);
  vertical-align: 2px;
}

.ed-board__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.ed-focusbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding-top: 13px;
}

.ed-chip {
  --c: #8B9CB8;
  --sf: rgba(139,156,184,.16);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 11px;
  border-radius: 20px;
  border: 1px solid var(--c);
  background: var(--sf);
  font-size: 12px;
  color: var(--ink);
}

.ed-chip em {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c);
}

.ed-chip i {
  font-size: 11px;
  color: var(--ink-3);
  cursor: pointer;
}

.ed-chip i:hover { color: #F2685E; }

.ed-focusbar__hint {
  font-size: 11px;
  color: var(--ink-3);
}

.ed-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 12px;
  padding-top: 16px;
}

.ed-card {
  position: relative;
  overflow: hidden;
  display: block;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--surface);
  padding: 14px 16px 13px;
  text-decoration: none;
  color: inherit;
  animation: edRise .45s both;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}

.ed-card:hover,
.ed-card:focus {
  transform: translateY(-3px);
  border-color: #D3DBE8;
  box-shadow: 0 18px 32px -22px rgba(16,32,54,.6);
  text-decoration: none;
  color: inherit;
}

.ed-card__rail {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  opacity: 0;
  transition: opacity .2s ease;
}

.ed-card:hover .ed-card__rail { opacity: 1; }

.ed-card__top {
  display: flex;
  align-items: center;
  gap: 11px;
}

.ed-mono {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  font-family: 'Prompt', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

.ed-card__id {
  flex: 1 1 auto;
  min-width: 0;
}

.ed-card__id b {
  display: block;
  font-weight: 500;
  font-size: 13.5px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ed-card__id i {
  font-style: normal;
  font-family: 'Prompt', sans-serif;
  font-size: 10.5px;
  letter-spacing: .1em;
  color: var(--ink-3);
}

.ed-card__total {
  flex: 0 0 auto;
  text-align: right;
}

.ed-card__total b {
  display: block;
  font-family: 'Prompt', sans-serif;
  font-size: 22px;
  font-weight: 500;
  line-height: 1;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.ed-card__total i {
  font-style: normal;
  font-size: 10px;
  color: var(--ink-3);
}

.ed-card__total.is-zero b { color: #C3CBD8; }

.ed-card__bar {
  display: flex;
  gap: 2px;
  height: 7px;
  border-radius: 5px;
  overflow: hidden;
  margin: 13px 0 11px;
  background: var(--canvas);
}

.ed-card__bar > span {
  min-width: 3px;
  transition: flex-grow .5s ease;
}

.ed-card__bar > span.is-empty {
  background: repeating-linear-gradient(115deg, #EDF1F7 0 6px, #F6F8FB 6px 12px);
}

.ed-card__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 9px;
}

.ed-tag {
  --c: #8B9CB8;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--ink-2);
}

.ed-tag em {
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--c);
}

.ed-tag b {
  font-weight: 600;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.ed-card__none {
  font-size: 11px;
  color: #B6BFCC;
}

.ed-card__rate {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'Prompt', sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  padding: 2px 9px;
  border-radius: 20px;
}

.ed-card__rate i { font-size: 10px; }
.ed-card__rate.is-good { background: rgba(47,191,143,.13); color: #1E8A66; }
.ed-card__rate.is-mid { background: rgba(245,166,35,.15); color: #A9700B; }
.ed-card__rate.is-low { background: rgba(139,156,184,.17); color: #6B7B93; }

.ed-tablewrap { padding-top: 16px; }

@keyframes edRise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}

::v-deep .ed-cell-emp {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--ink);
  text-decoration: none;
}

::v-deep .ed-cell-emp i {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: inline-grid;
  place-items: center;
  font-style: normal;
  font-family: 'Prompt', sans-serif;
  font-size: 10.5px;
  color: #fff;
}

::v-deep .ed-cell-emp b { font-weight: 500; }

::v-deep .ed-cell-emp:hover b {
  color: #127C8E;
  text-decoration: underline;
}

::v-deep .ag-cell[col-id="mix"],
::v-deep .ag-cell[col-id="rate"] {
  display: flex !important;
  align-items: center !important;
}

::v-deep .ag-cell[col-id="mix"] > *,
::v-deep .ag-cell[col-id="rate"] > * {
  display: block;
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  overflow: visible;
}

::v-deep .ed-cell-bar {
  display: flex;
  gap: 2px;
  width: 100%;
  height: 10px;
  border-radius: 6px;
  overflow: hidden;
  background: #EDF1F7;
  box-shadow: inset 0 0 0 1px rgba(16,32,54,.05);
}

::v-deep .ed-cell-bar i {
  min-width: 4px;
  transition: flex-grow .5s ease;
}

::v-deep .ed-cell-badge {
  --c: #8B9CB8;
  --sf: rgba(139,156,184,.16);
  --dp: #5C6E8A;
  display: inline-block;
  min-width: 32px;
  padding: 2px 10px;
  border-radius: 20px;
  font-family: 'Prompt', sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--dp);
  background: var(--sf);
}

::v-deep .ed-cell-total {
  display: inline-block;
  min-width: 34px;
  padding: 2px 10px;
  border-radius: 20px;
  font-family: 'Prompt', sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.55;
  color: #fff;
  background: #24405F;
}

::v-deep .ed-cell-dim { color: #C3CBD8; }

::v-deep .ed-cell-rate {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

::v-deep .ed-cell-rate i {
  flex: 1 1 auto;
  min-width: 0;
  height: 8px;
  border-radius: 5px;
  background: #EDF1F7;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(16,32,54,.05);
}

::v-deep .ed-cell-rate b {
  display: block;
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, #4FD1C5, #2FBF8F);
  transition: width .6s cubic-bezier(.2,.7,.2,1);
}

::v-deep .ed-cell-rate em {
  flex: 0 0 34px;
  text-align: right;
  font-style: normal;
  font-family: 'Prompt', sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  color: #5A6B84;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1399px) {
  .ed-kpi { grid-template-columns: repeat(3, 1fr); }
  .ed-panels { grid-template-columns: 1fr; }
}

@media (max-width: 991px) {
  .ed-hero { padding: 22px 20px 0; }
  .ed-spectrum { margin: 0 -20px; }
  .ed-hero__title { font-size: 24px; }
  .ed-hero__figs { gap: 18px; }
  .ed-kpi { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 575px) {
  .ed-kpi { grid-template-columns: 1fr; }
  .ed-hero__figs { flex-direction: column; align-items: flex-start; }
  .ed-board__tools { width: 100%; }
  .ed-search { flex: 1 1 auto; min-width: 0; }
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

body.dark-mode .ed-seg button.is-on { background: #4FD1C5; color: #06232B; }
body.dark-mode .ed-card:hover { border-color: #3B4A60; }
body.dark-mode .ed-card__bar > span.is-empty { background: repeating-linear-gradient(115deg, #26313F 0 6px, #2C374A 6px 12px); }
body.dark-mode .ed-card__none { color: #66748A; }
body.dark-mode .ed-card__total.is-zero b { color: #5C6B7F; }
body.dark-mode .ed-cell-bar,
body.dark-mode .ed-cell-rate i { background: #2A3648; }
body.dark-mode .ed-cell-badge { color: var(--c); }
body.dark-mode .ed-cell-total { background: #4FD1C5; color: #06232B; }
body.dark-mode .ed-cell-dim { color: #5C6B7F; }
body.dark-mode .ed-cell-emp { color: #E6EDF6; }
body.dark-mode .ed-cell-emp:hover b { color: #4FD1C5; }
</style>
