<template>
  <div class="v-csm-dash2">
    <re-page ref="page">
      <template slot="body">
        <section class="content d2-wrap">
          <!-- ส่วนที่ 1 : เงื่อนไขการค้นหา -->
          <div class="d2-bar">
            <div class="d2-bar__title">
              <i class="fas fa-chart-bar"></i>
              <div>
                <b>CSM Company Dashboard</b>
                <small>ภาพรวมงานแจ้งซ่อมทุกโครงการ &middot; Version 1.0</small>
              </div>
            </div>
            <div class="d2-bar__fields">
              <div class="d2-field">
                <label>เดือน</label>
                <select class="d2-select" v-model.number="cond.month">
                  <option v-for="x, idx in month_th" :value="idx+1">{{x}}</option>
                </select>
              </div>
              <div class="d2-field">
                <label>ปี</label>
                <input type="text" class="d2-input" v-model.number="cond.year" @keyup.enter="loadAll()" />
              </div>
              <button class="d2-btn" @click="loadAll()"><i class="fa fa-search"></i> ค้นหา</button>
            </div>
          </div>

          <!-- ส่วนที่ 2 : กราฟสรุปสถานะ -->
          <div class="d2-card">
            <div class="d2-card__head">
              <div class="d2-card__title">
                <i class="fas fa-chart-bar"></i>
                <span>{{chartTitle}}</span>
              </div>
              <div class="d2-card__meta"><i class="fas fa-info-circle"></i> หน่วย : รายการ</div>
            </div>
            <div class="d2-card__body">
              <div class="d2-chart"><canvas ref="stacked_barChart"></canvas></div>
            </div>
          </div>

          <!-- ส่วนที่ 3 : ตารางสรุปรายโครงการ -->
          <div class="d2-card">
            <div class="d2-card__head">
              <div class="d2-card__title">
                <i class="fas fa-table"></i>
                <span>สรุปรายงานรับแจ้งซ่อมบ้านหลังโอน (After Sales)</span>
              </div>
              <div class="d2-card__meta"><i class="fas fa-hand-pointer"></i> คลิกแถวสรุปเพื่อกรองโครงการ &middot; {{$num(detailRows.length, 0)}} โครงการ</div>
            </div>
            <div class="d2-scroll">
              <table class="d2-tbl">
                <thead>
                  <tr>
                    <th colspan="8" class="d2-th-group">สรุปรายงานรับแจ้งซ่อมบ้านหลังโอน (After Sales)</th>
                    <th class="tf-3" rowspan="2">งานแจ้งซ่อมสะสมในเดือน</th>
                    <th class="tf-3" rowspan="2">ลูกค้าเซ็นปิดจบ 100%</th>
                    <th class="tf-3" rowspan="2">งานค้างสะสมในเดือน</th>
                    <th class="tf-3" rowspan="2">% ปิดจบ (เทียบงานทั้งหมดในเดือน)</th>

                    <td rowspan="3" class="d2-gap"></td>
                    <th colspan="4" class="d2-th-group d2-th-group--a">(A) งานค้างซ่อม สะสมยกมา</th>

                    <td rowspan="3" class="d2-gap"></td>
                    <th colspan="4" class="d2-th-group d2-th-group--b">(B) งานซ่อมปัจจุบัน ในเดือน {{month_th[shownCond.month-1]}} {{shownCond.year}}</th>
                  </tr>
                  <tr>
                    <th class="tf-2">ลำดับ</th>
                    <th class="tf-3">ภาค</th>
                    <th class="tf-2-5">รหัสย่อ</th>
                    <th class="tf-4">โครงการ</th>
                    <th class="tf-3">ฝ่ายขาย (Sales) รับเรื่อง-ตรวจสอบงานซ่อม</th>
                    <th class="tf-3">ผู้จัดการ (PM) ตรวจสอบ</th>
                    <th class="tf-3">เจ้าหน้าที่ (AF/QC) ประสานงาน</th>
                    <th class="tf-3">เจ้าหน้าที่ (FM) ควบคุม</th>
                    <!--(A)-->
                    <th class="tf-3">งานค้างซ่อมสะสมยกมา (Brought Forward)</th>
                    <th class="tf-3 d2-th--good">ลูกค้าเซ็นปิดจบ (รับมอบงานซ่อม 100%)</th>
                    <th class="tf-3 d2-th--warn">งานระหว่างซ่อม (รวมงานระหว่างดำเนินการซ่อมสะสม)</th>
                    <th class="tf-3 d2-th--bad">งานซ่อม-ยังไม่เข้าซ่อม (รวมงานที่ยังไม่ซ่อมสะสม)</th>
                    <!--(B)-->
                    <th class="tf-3">งานซ่อมปัจจุบันในเดือน (New Item)</th>
                    <th class="tf-3 d2-th--good">ลูกค้าเซ็นปิดจบ (รับมอบงานซ่อม 100%)</th>
                    <th class="tf-3 d2-th--warn">งานระหว่างซ่อม (รวมงานระหว่างดำเนินการซ่อมสะสม)</th>
                    <th class="tf-3 d2-th--bad">งานซ่อม-ยังไม่เข้าซ่อม (รวมงานที่ยังไม่ซ่อมสะสม)</th>
                  </tr>
                </thead>
                <tbody class="d2-sum">
                  <tr v-for="x, idx in rptHeader" :class="{'is-sel': x.checked, 'is-all': x.projtype == 'ALL'}" @click="selectProj(x)">
                    <td colspan="8" class="d2-sum__label">
                      <i class="fas fa-check-circle" v-if="x.checked"></i>{{x.projtype_name || 'ไม่ระบุ'}}
                    </td>
                    <td>{{$num(x.accu_total, 0)}}</td>
                    <td>{{$num(x.accu_complete, 0)}}</td>
                    <td>{{$num(x.accu_inprogress, 0)}}</td>
                    <td>{{$num(x.complete_per, 0)}}%</td>
                    <td :rowspan="rptHeader.length" class="d2-gap" v-if="idx == 0"></td>
                    <td>{{$num(x.prev_total, 0)}}</td>
                    <td>{{$num(x.prev_complete, 0)}}</td>
                    <td>{{$num(x.prev_inprogress, 0)}}</td>
                    <td>{{$num(x.prev_none, 0)}}</td>
                    <td :rowspan="rptHeader.length" class="d2-gap" v-if="idx == 0"></td>
                    <td>{{$num(x.this_total, 0)}}</td>
                    <td>{{$num(x.this_complete, 0)}}</td>
                    <td>{{$num(x.this_inprogress, 0)}}</td>
                    <td>{{$num(x.this_none, 0)}}</td>
                  </tr>
                </tbody>
                <tbody class="d2-detail" :class="{'d2-fade': fadein}">
                  <tr v-for="r, idx in detailRows">
                    <td class="d2-idx">{{idx+1}}</td>
                    <td class="d2-left">{{r.row.projtype_name || 'ไม่ระบุ'}}</td>
                    <td class="d2-left">{{r.row.refcode}}</td>
                    <td class="d2-left d2-proj">{{r.row.projname}}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="d2-b d2-b--bad" :style="{'--w': r.w_accu_total}">{{$num(r.row.accu_total, 0)}}</td>
                    <td>{{$num(r.row.accu_complete, 0)}}</td>
                    <td class="d2-b d2-b--bad" :style="{'--w': r.w_accu_inprogress}">{{$num(r.row.accu_inprogress, 0)}}</td>
                    <td class="d2-b d2-b--good" :style="{'--w': r.w_complete_per}">{{$num(r.row.complete_per, 0)}}%</td>

                    <td :rowspan="detailRows.length" class="d2-gap" v-if="idx == 0"></td>
                    <td>{{$num(r.row.prev_total, 0)}}</td>
                    <td>{{$num(r.row.prev_complete, 0)}}</td>
                    <td class="d2-b d2-b--bad" :style="{'--w': r.w_prev_inprogress}">{{$num(r.row.prev_inprogress, 0)}}</td>
                    <td>{{$num(r.row.prev_none, 0)}}</td>

                    <td :rowspan="detailRows.length" class="d2-gap" v-if="idx == 0"></td>
                    <td>{{$num(r.row.this_total, 0)}}</td>
                    <td>{{$num(r.row.this_complete, 0)}}</td>
                    <td class="d2-b d2-b--bad" :style="{'--w': r.w_this_inprogress}">{{$num(r.row.this_inprogress, 0)}}</td>
                    <td>{{$num(r.row.this_none, 0)}}</td>
                  </tr>
                  <tr v-if="!detailRows.length">
                    <td colspan="22" class="d2-empty"><i class="fas fa-inbox"></i> ไม่พบข้อมูลในเดือนที่เลือก</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </template>
    </re-page>
  </div>
</template>
<script type="text/javascript">
  import Chart from 'chart.js';
  import 'chartjs-plugin-labels';
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth()+1;
  let month_th = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  let page = {};
  let chart = null;
  let barWidth = (num, div) => {
    let n = num || 0;
    let d = div || 0;
    let per = d == 0 ? 0 : (n * 100) / d;
    return Math.min(100, Math.max(0, per)).toFixed(2) + '%';
  };
  let cpn = {
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        isLoading: false,
        fadein: true,
        cond: { year: year, month: month },
        shownCond: { year: year, month: month },
        month_th: month_th,
        dashData: [],
        rptTemp: {},
        rptHeader: [],
        rptDetail: [],
        summaryTotal: {}
      };
    },
    computed: {
      chartTitle() {
        return `สรุปสถานะงานแจ้งซ่อมรวมทุกโครงการ ประจำเดือน ${month_th[this.shownCond.month - 1]} ปี ${this.shownCond.year}`;
      },
      detailRows() {
        let head = {};
        $linq(this.rptHeader || []).foreach(h => head[h.projtype] = h);
        return $linq(this.rptDetail || []).select(x => {
          let base = head[x.projtype] || {};
          return {
            row: x,
            w_accu_total: barWidth(x.accu_total, base.accu_total),
            w_accu_inprogress: barWidth(x.accu_inprogress, base.accu_inprogress),
            w_complete_per: barWidth(x.complete_per, 100),
            w_prev_inprogress: barWidth(x.prev_inprogress, base.prev_inprogress),
            w_this_inprogress: barWidth(x.this_inprogress, base.this_inprogress)
          };
        }).toArray();
      }
    },
    methods: {
      randomMath() {
        return Math.round(Math.random() * 255);
      },
      async loadTotal() {
        let act = `csm/report/GetTotalSummary`;
        let rsp = await $xt.getServer(act);
        this.summaryTotal = rsp;
      },
      reset() {
        this.dashData = [];
        this.rptHeader = [];
        this.rptDetail = [];
      },
      async loadAll() {
        page.loadingBox.show();
        this.shownCond = { year: this.cond.year, month: this.cond.month };
        try {
          await Promise.all([this.loadDashData(), this.loadRptData()]);
        } finally {
          page.loadingBox.hide();
        }
      },
      async loadDashData() {
        let act = `csm/report/Dash_AllCompanySummary?year=${this.cond.year}&month=${this.cond.month}`;
        let resp = await $xt.getServer(act);
        this.dashData = resp || [];
        this.loadChart();
      },
      async loadRptData() {
        let act = `csm/report/Rpt_AllCompanyDetail?year=${this.cond.year}&month=${this.cond.month}`;
        let resp = await $xt.getServer(act);
        this.rptTemp = JSON.parse(JSON.stringify(resp));
        this.rptHeader = resp.header || [];
        this.rptDetail = resp.detail || [];
        $linq(this.rptHeader).foreach(x => x.checked = x.projtype == 'ALL');
      },
      loadChart() {
        let resp = this.dashData || [];
        let labels = $linq(resp || []).select(x => x.projtype_name).distinct().toArray() || [];
        let accu_prev_arr = $linq(resp || []).select(x => x.accu_prev).toArray() || [];
        let accu_this_arr = $linq(resp || []).select(x => x.accu_this).toArray() || [];
        let accu_complete_arr = $linq(resp || []).select(x => x.accu_complete).toArray() || [];
        let accu_done_arr = $linq(resp || []).select(x => x.accu_done).toArray() || [];
        let accu_inprogress_arr = $linq(resp || []).select(x => x.accu_inprogress).toArray() || [];
        let accu_none_arr = $linq(resp || []).select(x => x.accu_none).toArray() || [];
        let accu_reject_arr = $linq(resp || []).select(x => x.accu_reject).toArray() || [];

        //find maximum values
        let max_arr = $linq(resp || []).where(w => w.projtype == 'ALL').select(x => {
          return {
            target: (x.accu_prev + x.accu_this),
            progress: (x.accu_complete + x.accu_done + x.accu_inprogress + x.accu_none + x.accu_reject)
          }
        }).toArray() || [];
        let max_target = $linq(max_arr).max(x => x.target) || 0;
        let max_pg = $linq(max_arr).max(x => x.progrss) || 0;
        let max = Math.max.apply(null, [max_target, max_pg]);
        max = Math.ceil(max + (max * 0.2)); // +เพิ่มอีก 20%

        //const labels = ['รวมทุกภาค', 'เหนือ', 'ตะวันออก', 'อีสาน', 'กลาง', 'ใต้'];
        const data = {
          labels: labels,
          datasets: [
            //Progress Bar
            {
              label: "ลูกค้าเซ็นปิดจบ(สะสม)",
              backgroundColor: 'rgb(49, 169, 126)',
              borderWidth: 0,
              data: accu_complete_arr,
              xAxisID: "bar-x-axis1",
              yAxisID: "bar-y-axis1",
              stack: "background"
            },
            {
              label: "ซ่อมเสร็จ(สะสม)",
              backgroundColor: 'rgb(154, 217, 163)',
              borderWidth: 0,
              data: accu_done_arr,
              xAxisID: "bar-x-axis1",
              yAxisID: "bar-y-axis1",
              stack: "background"
            },
            {
              label: "กำลังซ่อม(สะสม)",
              backgroundColor: 'rgb(132, 200, 232)',
              borderWidth: 0,
              data: accu_inprogress_arr,
              xAxisID: "bar-x-axis1",
              yAxisID: "bar-y-axis1",
              stack: "background"
            },
            {
              label: "ยังไม่ได้ซ่อม(สะสม)",
              backgroundColor: 'rgb(241, 201, 107)',
              borderWidth: 0,
              data: accu_none_arr,
              xAxisID: "bar-x-axis1",
              yAxisID: "bar-y-axis1",
              stack: "background"
            },
            {
              label: "ยกเลิก(สะสม)",
              backgroundColor: 'rgb(240, 155, 143)',
              borderWidth: 0,
              data: accu_reject_arr,
              xAxisID: "bar-x-axis1",
              yAxisID: "bar-y-axis1",
              stack: "background"
            },

            //Target Bar
            {
              label: "งานค้างซ่อมยกมา(สะสม)",
              backgroundColor: 'rgba(34, 51, 84, 0.28)',
              borderWidth: 0,
              data: accu_prev_arr,
              xAxisID: "bar-x-axis2",
              yAxisID: "bar-y-axis2",
              stack: "target"
            },
            {
              label: "งานระหว่างซ่อม(สะสม)",
              backgroundColor: 'rgba(124, 58, 237, 0.18)',
              borderWidth: 0,
              data: accu_this_arr,
              xAxisID: "bar-x-axis2",
              yAxisID: "bar-y-axis2",
              stack: "target"
            }
          ]
        };

        var options = {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 450, easing: 'easeOutQuart' },
          title: {
            display: false
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              padding: 14,
              fontSize: 11,
              fontColor: '#5b6479'
            }
          },
          interaction: {
            intersect: true,
          },
          plugins: {
            labels: {
              visible: false,
              render: 'value',
              fontColor: 'rgba(0, 0, 0, 0)',
              showZero: true
            }
          },
          scales: {
            xAxes: [
              {
                display: true,
                stacked: true,
                id: "bar-x-axis2",
                categoryPercentage: 0.5,
                barPercentage: 1,
                gridLines: {
                  display: false,
                  drawBorder: false
                },
                ticks: {
                  mirror: true,
                  display: false,
                }
              },
              {
                display: true,
                stacked: true,
                id: "bar-x-axis1",
                type: 'category',
                categoryPercentage: 0.25,
                barPercentage: 1,
                gridLines: {
                  offsetGridLines: true,
                  display: false,
                  zeroLineColor: '#dde3ee'
                },
                ticks: {
                  fontColor: '#5b6479',
                  fontSize: 11
                },
                offset: true
              }
            ],
            yAxes: [{
              display: false,
              id: "bar-y-axis2",
              stacked: true,
              ticks: {
                beginAtZero: false,
                min: 0,
                max: max
              }
            },
            {
              display: true,
              id: "bar-y-axis1",
              stacked: true,
              gridLines: {
                color: '#eef1f6',
                drawBorder: false,
                zeroLineColor: '#dde3ee'
              },
              ticks: {
                beginAtZero: false,
                min: 0,
                max: max,
                fontColor: '#8a93a6',
                fontSize: 11,
                padding: 6,
                callback: v => Number(v).toLocaleString()
              }
            }]
          }
        };

        if (chart) {
          chart.destroy();
          chart = null;
        }
        chart = new Chart(this.$refs.stacked_barChart, {
          type: 'bar',
          data: data,
          options: options,
        });

      },
      selectProj(x) {
        $linq(this.rptHeader).foreach(f => f.checked = f.projtype == x.projtype);

        this.fadein = false;
        this.rptDetail = $linq(this.rptTemp.detail || []).where(w => x.projtype == 'ALL' ? true : w.projtype == x.projtype).toArray() || [];
        this.$nextTick(() => requestAnimationFrame(() => this.fadein = true));
      }
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = 'CSM : Customer Service Dashboard 2';
      document.title = page.pageTitle;

      Chart.defaults.global.defaultFontFamily = "'Manrope', 'Sarabun', sans-serif";
      Chart.defaults.global.defaultFontColor = 'black';
      Chart.defaults.global.defaultFontSize = 13;

      this.loadTotal();
      this.loadAll();
    },
    beforeUnmount() {
      if (chart) {
        chart.destroy();
        chart = null;
      }
    }
  };
  export default cpn;
</script>
<style scoped>
  @import './CSS/v_csm_dashboard2.css';
</style>
