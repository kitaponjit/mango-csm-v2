<template>
  <div class="csm-dashboard">
    <re-page ref="page">
      <template slot="body">
        <section class="content-header csm-page-header">
          <div class="csm-page-header-inner">
            <div class="csm-page-header-left">
              <div class="csm-page-header-icon">
                <i class="fas fa-headset"></i>
              </div>
              <div>
                <h1 class="csm-page-title">Customer Service Dashboard</h1>
                <ol class="breadcrumb csm-breadcrumb">
                  <li><a href="#"><i class="fas fa-home"></i> Home</a></li>
                  <li class="active">Dashboard</li>
                </ol>
              </div>
            </div>
            <div class="csm-page-header-right">
              <span class="csm-live-badge"><span class="csm-live-dot"></span>Live</span>
            </div>
          </div>
        </section>
        <section class="content">
          <!-- Panel Info Summary -->
          <div class="row">
            <div class="col-md-3 col-sm-6 col-xs-12">
              <div class="info-box gm-kpi gm-kpi--total">
                <span class="info-box-icon bg-blue"><i class="fas fa-folder-open"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">รายการ CSM ทั้งหมด</span>
                  <span class="info-box-number">{{$num(summaryTotal.total, 0)}}<small class="gm-kpi-unit">รายการ</small></span>
                  <div class="gm-kpi-bar"><span class="gm-kpi-bar__fill" style="width:100%;"></span></div>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-xs-12">
              <div class="info-box gm-kpi gm-kpi--none">
                <span class="info-box-icon bg-yellow"><i class="fas fa-pause"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">รายการที่อยู่ในสถานะ None</span>
                  <span class="info-box-number">
                    {{$num(summaryTotal.total_none, 0)}}
                    <small class="gm-kpi-unit">/ {{$num(summaryTotal.total, 0)}}</small>
                    <span class="gm-kpi-pct">{{kpiPct(summaryTotal.total_none)}}%</span>
                  </span>
                  <div class="gm-kpi-bar"><span class="gm-kpi-bar__fill" :style="{ width: kpiPct(summaryTotal.total_none) + '%' }"></span></div>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-xs-12">
              <div class="info-box gm-kpi gm-kpi--progress">
                <span class="info-box-icon bg-aqua"><i class="fas fa-tasks"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">รายการที่อยู่ในสถานะ In Progress</span>
                  <span class="info-box-number">
                    {{$num(summaryTotal.total_inprogress, 0)}}
                    <small class="gm-kpi-unit">/ {{$num(summaryTotal.total, 0)}}</small>
                    <span class="gm-kpi-pct">{{kpiPct(summaryTotal.total_inprogress)}}%</span>
                  </span>
                  <div class="gm-kpi-bar"><span class="gm-kpi-bar__fill" :style="{ width: kpiPct(summaryTotal.total_inprogress) + '%' }"></span></div>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-xs-12">
              <div class="info-box gm-kpi gm-kpi--complete">
                <span class="info-box-icon bg-green"><i class="fas fa-check-circle"></i></span>
                <div class="info-box-content">
                  <span class="info-box-text">รายการที่อยู่ในสถานะ Complete</span>
                  <span class="info-box-number">
                    {{$num(summaryTotal.total_complete, 0)}}
                    <small class="gm-kpi-unit">/ {{$num(summaryTotal.total, 0)}}</small>
                    <span class="gm-kpi-pct">{{kpiPct(summaryTotal.total_complete)}}%</span>
                  </span>
                  <div class="gm-kpi-bar"><span class="gm-kpi-bar__fill" :style="{ width: kpiPct(summaryTotal.total_complete) + '%' }"></span></div>
                </div>
              </div>
            </div>
          </div>
          <!-- Chart Display -->
          <div class="box box-solid">
            <div class="box-body">
              <div class="row">
                <!-- Donut Chart Section -->
                <div class="col-md-7 col-xs-12">
                  <div class="gm-chart-card">
                    <div class="gm-chart-card__head">
                      <div class="chart-section-label">ประเภทการให้บริการ</div>
                      <span class="gm-chart-chip"><i class="fas fa-hand-pointer"></i> คลิกชื่อรายการเพื่อซ่อน/แสดง</span>
                    </div>
                    <v-chart class="piechart" :autoResize="true" :option="pieChartOption1" style="width: 100% !important; height: 460px;" />
                  </div>
                </div>

                <!-- Second Donut Chart Section -->
                <div class="col-md-5 col-xs-12">
                  <div class="gm-chart-card">
                    <div class="gm-chart-card__head">
                      <div class="chart-section-label">แสดงรายการสถานะของงาน</div>
                    </div>
                    <v-chart class="piechart" :autoResize="true" :option="pieChartOption2" style="width: 100% !important; height: 460px;" />
                  </div>
                </div>
              </div>

              <!-- Collapsible Table Section -->
              <div class="table-section-header" @click="toggleCollapse">
                <div class="table-section-icon"><i class="fa fa-table"></i></div>
                <span class="table-section-title">Top 10 projects with the most documentation</span>
                <i class="fa fa-chevron-down table-section-chevron" :class="{ open: isCollapsed }"></i>
              </div>
              <div class="table-collapse-body" :class="{ open: isCollapsed }">
                <ag-table ref="agr" :footer="false" @ready="initTable()"></ag-table>
              </div>

              <!-- Form Section -->
              <div class="filter-section">
                <div>
                  <label class="text-danger" v-text="ui.project || 'Project'"></label>
                  <span class="input-group">
                    <input type="text" class="form-control input-sm" v-model="formData['pre_event']" readonly style="min-width:100px;" />
                    <span class="input-group-btn">
                      <button class="btn btn-sm bg-navy" @click="$refs.ct_project2.openModal()" ref="pre_event">
                        <i class="fa fa-search"></i>
                      </button>
                      <button class="btn btn-sm btn-danger" @click="clearData(formData, ['pre_event', 'pre_des'])">
                        <i class="fa fa-times"></i>
                      </button>
                    </span>
                  </span>
                </div>
                <div style="flex:1;min-width:200px;">
                  <label>&nbsp;</label>
                  <input type="text" class="form-control input-sm" v-model="formData['pre_des']" readonly />
                </div>
              </div>

              <!-- Bar Chart Section -->
              <div v-if="!xt.isEmpty(formData.pre_event)" class="gm-chart-card gm-chart-card--bar">
                <div class="gm-chart-card__head">
                  <div class="barchart-label">แผนภูมิแสดงจำนวนเอกสารแยกตามประเภทการให้บริการและสถานะของเอกสาร</div>
                  <span class="gm-chart-chip"><i class="fas fa-mouse-pointer"></i> คลิกแท่งกราฟเพื่อดูรายการเอกสาร</span>
                </div>
                <v-chart ref="chart4" id="chart4" class="barchart" :autoResize="true" style="width: 100% !important; height: 360px;" :option="barChartOption" />
              </div>
            </div>
          </div>

        </section>
      </template>
    </re-page>
    <modal-2 ref="modalByproject">
      <template #header>
        <h4>CSM Data List</h4>
      </template>
      <template #body>
        <div class="row d-flex">
          <div class="col-md-3">
            <div class="form-group">
              <label v-text="ui.search_by || 'Search By'"></label>
              <select class="form-control input-sm" v-model="search.field">
                <option value="job_no">CSM No.</option>
                <option value="subject">Subject</option>
                <option value="project_name">Project</option>
                <option value="customer_name">Customer Name</option>
                <option value="request_by">Req. By</option>
                <option value="contract_user">Contact By</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label v-text="ui.search || 'Search'"></label>
              <div class="input-group">
                <input type="text" class="form-control input-sm" v-model="search.text" @keyup.enter="loadDataX()" />
                <span class="input-group-btn"><button class="btn btn-sm bg-navy" @click.prevent="loadDataX()"><i class="fas fa-search"></i></button></span>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12 col-md-12">
            <div class="table-responsive">
              <ag-table ref="agr1"
                        :footer="false"
                        @ready="initTable2()"
                        ></ag-table>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <pagination class="pull-left" ref="paging" @page-change="pageChange($event.page, 'copy')" />
        <button class="btn btn-sm btn-danger" @click="close()">
          <i class="fas fa-close"></i><span>Close</span>
        </button>
      </template>
    </modal-2>
    <vue-project2-list ref="ct_project2" @send-data="sendComponent($event, 'project')" :chk_code="chk_code"></vue-project2-list>
  </div>
</template>
<script type="text/javascript">
  import Chart from 'chart.js';
  import "chartjs-plugin-piechart-outlabels";
  import * as echarts from 'echarts';
  import { createComponent } from 'echarts-for-vue';
  let page = {};
  let gmFont = "'Inter', 'Sarabun', sans-serif";
  let gmPalette = ['#1a73e8', '#00897b', '#f9ab00', '#d93025', '#7b1fa2', '#0288d1', '#1e8e3e', '#e8710a', '#c2185b', '#5e35b1', '#00acc1', '#9e9d24'];
  let chartColors = (n) => {
    let colors = [];
    for (let i = 0; i < n; i++) {
      colors.push(i < gmPalette.length ? gmPalette[i] : `hsl(${(i * 360) / n}, 62%, 52%)`);
    }
    return colors;
  };
  let barGradient = (c) => new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: c },
    { offset: 1, color: echarts.color.modifyAlpha(c, 0.55) || c }
  ]);
  let gmTooltipStyle = {
    appendToBody: true,
    backgroundColor: 'rgba(32, 33, 36, 0.94)',
    borderWidth: 0,
    padding: [9, 13],
    textStyle: { color: '#fff', fontSize: 12, fontFamily: gmFont },
    extraCssText: 'border-radius:10px;box-shadow:0 4px 18px rgba(60,64,67,.28);'
  };
  let buildDonutOption = (names, data, colors) => {
    let total = (data || []).reduce((sum, x) => sum + (x.value || 0), 0);
    return {
      color: colors,
      textStyle: { fontFamily: gmFont },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        left: 6,
        top: 'middle',
        width: '28%',
        icon: 'circle',
        itemWidth: 9,
        itemHeight: 9,
        itemGap: 10,
        data: names,
        formatter: name => name && name.length > 22 ? name.substring(0, 21) + '…' : name,
        textStyle: { fontSize: 11.5, color: '#5f6368', fontFamily: gmFont },
        pageIconSize: 9,
        pageIconColor: '#5f6368',
        pageIconInactiveColor: '#dadce0',
        pageTextStyle: { color: '#9aa0a6', fontSize: 10 }
      },
      tooltip: Object.assign({
        trigger: 'item',
        formatter: p => `${p.marker} <b>${p.name}</b><br/>${$xt.formatNumber(p.value, 0)} รายการ &nbsp;(${p.percent}%)`
      }, gmTooltipStyle),
      title: {
        text: $xt.formatNumber(total, 0),
        subtext: 'ทั้งหมด',
        left: '64%',
        top: '46%',
        textAlign: 'center',
        textStyle: { fontSize: 25, fontWeight: 700, color: '#202124', fontFamily: gmFont },
        subtextStyle: { fontSize: 11, color: '#9aa0a6', fontFamily: gmFont }
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['47%', '68%'],
          center: ['64%', '52%'],
          minAngle: 2,
          avoidLabelOverlap: true,
          selectedMode: 'single',
          selectedOffset: 8,
          itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 5 },
          label: {
            formatter: '{b}\n{d}%',
            fontSize: 11,
            lineHeight: 15,
            color: '#5f6368',
            fontFamily: gmFont
          },
          labelLine: { length: 8, length2: 12, smooth: true, lineStyle: { color: '#dadce0' } },
          labelLayout: { hideOverlap: true },
          emphasis: {
            scale: true,
            scaleSize: 7,
            itemStyle: { shadowBlur: 18, shadowColor: 'rgba(60,64,67,.28)' },
            label: { fontSize: 12.5, fontWeight: 700, color: '#202124' }
          },
          data: data,
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: idx => idx * 24
        }
      ]
    };
  };
  let cpn = {
    data() {
      return {
        auth: window.auth,
        xt: $xt,
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        isLoading: false,
        pieData: [],
        summaryTotal: {},
        top10: [],
        formData: {},
        chk_code: "Y",
        isCollapsed: false,
        pieChartOption1: {
          chart: {},
          series: []
        },
        pieChartOption2: {
          chart: {},
          series: []
        },
        barChartOption: {
          chart: {},
          series: []
        },
        project_tot: [],
        chart: null,
        datalist_byproject: [],
        search: {},
        tmp: {}
      };
    },
    components: {
      "v-chart": createComponent({ echarts })
    },
    methods: {
      randomMath() {
        return Math.round(Math.random() * 255);
      },
      kpiPct(v) {
        let total = Number(this.summaryTotal.total) || 0;
        let num = Number(v) || 0;
        return total == 0 ? 0 : Math.round((num * 1000) / total) / 10;
      },
      async loadTotal() {
        let act = `csm/report/GetTotalSummary_dashboard`;
        let rsp = await $xt.getServer(act);
        this.$set(this, "summaryTotal", rsp);

      },
      async loadChart() {
        let act = `csm/report/DashBoard_Summary`;
        let rsp = await $xt.getServer(act);
        let agr = this.$refs.agr;
        this.$set(this, "top10", rsp.top10);
        let detail = this.top10 || [];
        agr.setDisplay(detail);
        this.initTable()

        /* Service Type Chart */
        let serviceColor = chartColors(rsp.complete.list.length);

        const data1 = rsp.complete.list_data.map((value, index) => {
          return { name: rsp.complete.list[index], value: value };
        });

        let option1 = buildDonutOption(rsp.complete.list, data1, serviceColor)
        this.pieChartOption1 = option1

        /* Service Type Chart 2 */
        let serviceColor2 = chartColors(rsp.status.list.length);

        const data2 = rsp.status.list_data.map((value, index) => {
          return { name: rsp.status.list[index], value: value };
        });
     //   color: rsp.status.color,

        let option2 = buildDonutOption(rsp.status.list, data2, serviceColor2)
        this.pieChartOption2 = option2

      },
      async initTable()
      {
        let agr = this.$refs.agr;
        let bold_underline = { "font-weight": "bold" };
        let bold_style = (p) => (p?.data?.bold ? bold_underline : {});
        let fields = [
          ["project_name", "Project Name", "text", { width: 500, align: "left" }],
          ["tot_task", "Task (All)", "text", { width: 180, align: "right" }],
          ["tot_complete", "Task (Complete)", "text", { width: 180, align: "right" }],
        ]
          
        let header = agr.createHeaderFromArray(fields);
        agr.setHeader(header);

        this.grid_header = header;


      },
      async sendComponent(e, type) {
        switch (type) {
          case 'project':
            this.$set(this.formData, 'pre_event', e.pre_event)
            this.$set(this.formData, 'pre_des', e.pre_des)
            await this.loadByProject(e.pre_event)
            break
        }
      },
      clearData(data, field) {
        $linq(field).foreach(x => this.$set(data, x, null))
      },
      toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
      },
      async loadByProject(p) {
       // console.log("p", p);
        let act = `csm/report/DashBoard_byproject?pre_event=${p}`;
        let rsp = await $xt.getServer(act);
        this.project_tot = rsp.group;
        let taskServices = [...new Set(rsp.group.map(i => i.task_service))];
        let statusNames = [...new Set(rsp.group.flatMap(i => i.status_name))];

        //let serviceColor = [];

        let status0 = [
          ...new Map(
            rsp.data.map(i => [`${i.status_name}-${i.status}`, { name: i.status_name, status: i.status }])
          ).values()
        ];

        let item_type = [...new Set(rsp.group.flatMap(i => ({ name: i.task_service, status: i.item_type })))];


        let sourceData = rsp.group.map(item => {
          let row = { task_service: item.task_service };
          item.status_name.forEach((status, index) => {
            row[status] = item.taskqty[index] || 0;
          });
          row["totbyitem"] = item.totbyitem || 0;
          return row;
        });

        let serviceColor0 = chartColors(rsp.ll_color.length);
       // color: rsp.ll_color.color,
        let option4 = {
          color: serviceColor0,
          responsive: true,
          textStyle: { fontFamily: gmFont },
          animationDuration: 650,
          animationEasing: "cubicOut",
          legend: {
            top : 20,
            type: "scroll",
            left: "center",
            width: "76%",
            icon: "roundRect",
            itemWidth: 11,
            itemHeight: 7,
            itemGap: 14,
            textStyle: { fontSize: 11.5, color: "#5f6368", fontFamily: gmFont },
            data: statusNames
          },
          toolbox: {
            show: true,
            right: 12,
            top: 0,
            itemSize: 14,
            itemGap: 10,
            iconStyle: { borderColor: "#5f6368" },
            emphasis: { iconStyle: { borderColor: "#1a73e8" } },
            feature: {
              magicType: { type: ["bar", "line", "stack"], title: { bar: "แบบแท่ง", line: "แบบเส้น", stack: "แบบซ้อน" } },
              restore: { title: "ค่าเริ่มต้น" },
              saveAsImage: { title: "บันทึกรูป", name: "csm-dashboard-chart", pixelRatio: 2, backgroundColor: "#fff" }
            }
          },
          tooltip: Object.assign({
            trigger: "axis",
            axisPointer: {
              type: "shadow",
              shadowStyle: { color: "rgba(26, 115, 232, 0.06)" }
            },
            formatter: function (params) {
              let tooltipText = `${params[0].axisValue}<br/>`;
              params.forEach(param => {
                tooltipText += `${param.marker} ${param.seriesName}: ${param.value[param.seriesName]}<br/>`;
              });
              let tasktotValue = sourceData.find(item => item.task_service === params[0].axisValue)?.totbyitem;
              tooltipText += `<strong>Total Task: ${tasktotValue || 0}</strong>`;
              return tooltipText;
            }
          }, gmTooltipStyle),
          dataset: {
            dimensions: ["task_service", ...statusNames, "totbyitem"],
            source: sourceData
          },
          grid: {
            left: 14,
            right: 26,
            bottom: "24%",
            top: 64,
            containLabel: true
          },
          xAxis: {
            type: "category",
            axisLabel: {
              rotate: 0,
              interval: 0,
              fontSize: 12,
              color: "#5f6368",
              margin: 12,
              width: 150,
              overflow: "break",
              lineHeight: 15
            },
            axisLine: { lineStyle: { color: "#e8eaed" } },
            axisTick: { show: false }
          },
          yAxis: {
            type: "value",
            name: "Task Total",
            nameLocation: "end",
            nameGap: 14,
            nameTextStyle: {
              fontSize: 11.5,
              fontWeight: 600,
              color: "#9aa0a6",
              align: "left"
            },
            axisLabel: {
              formatter: "{value}",
              color: "#9aa0a6",
              fontSize: 11
            },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: "#f1f3f4", type: "dashed" } }
          },
          dataZoom: [
            {
              type: "slider",
              show: true,
              start: 0,
              end: (3 / taskServices.length) * 100,
              bottom: 0,
              height: 18,
              borderColor: "transparent",
              backgroundColor: "#f8f9fa",
              fillerColor: "rgba(26, 115, 232, 0.10)",
              handleSize: "110%",
              handleStyle: {
                color: "#fff",
                borderColor: "#1a73e8",
                borderWidth: 1.5,
                shadowBlur: 4,
                shadowColor: "rgba(60, 64, 67, 0.20)"
              },
              moveHandleSize: 4,
              showDataShadow: false,
              dataBackground: {
                lineStyle: { color: "#dadce0" },
                areaStyle: { color: "#e8eaed" }
              },
              selectedDataBackground: {
                lineStyle: { color: "#8ab4f8" },
                areaStyle: { color: "#d2e3fc" }
              },
              textStyle: { color: "#9aa0a6", fontSize: 10 },
              brushSelect: false
            },
            {
              type: "inside",
              zoomOnMouseWheel: false,
              moveOnMouseWheel: false,
              moveOnMouseMove: true
            }
          ],
          series: statusNames.map((k, si) => {
            let baseColor = serviceColor0[si % serviceColor0.length];
            return {
              name: k,
              type: "bar",
              barGap: "10%",
              barMaxWidth: 52,
              cursor: "pointer",
              showBackground: true,
              backgroundStyle: {
                color: "rgba(95, 99, 104, 0.04)",
                borderRadius: [6, 6, 0, 0]
              },
              label: {
                show: true,
                position: "top",
                distance: 5,
                fontSize: 11,
                fontWeight: 600,
                color: "#5f6368",
                formatter: (pm) => {
                  let v = pm.value && typeof pm.value === "object" ? pm.value[pm.seriesName] : pm.value;
                  return v ? $xt.formatNumber(v, 0) : "";
                }
              },
              emphasis: {
                focus: "series",
                itemStyle: {
                  shadowBlur: 12,
                  shadowColor: "rgba(60, 64, 67, 0.30)"
                },
                label: { fontSize: 12.5, fontWeight: 700, color: "#202124" }
              },
              encode: {
                x: "task_service",
                y: k
              },
              itemStyle: {
                borderRadius: [6, 6, 2, 2],
                color: barGradient(baseColor)
              },
              animationDelay: (idx) => idx * 12 + si * 60
            };
          }),
        };

        this.barChartOption = option4;

        await this.$nextTick();
        const myChart = echarts.init(document.getElementById('chart4'));

        myChart.off('click');
        myChart.on('click', async  (params) => { 
          let getData = $linq(status0).where(s => s.name == params.seriesName).select(c => c.status).firstOrDefault();
          let selData = $linq(item_type).where(s => s.name == params.name).select(c => c.status).firstOrDefault();
          params.keyData = getData;
          params.slcData = selData;
          this.$set(this.tmp, 'status', params.keyData)
          this.$set(this.tmp, 'item_type', params.slcData)
          await $xt.sleep(800)
          await this.clickbydetail(this.tmp.status, this.tmp.item_type);
        });

      },
      async clickbydetail(status, itemType) {
        let act = `csm/report/view_bydetil?pre_event=${this.formData.pre_event}&status=${status}&type=${itemType}`;
        let rsp = await $xt.getServer(act);
        let agr1 = this.$refs.agr1;

        this.$set(this, 'datalist_byproject', rsp.data);
        let detail_rf = this.datalist_byproject || []
       
        let ii = 1;
        $linq(this.datalist_byproject).foreach(d => {
          d.job_priority_text = this.priorityName(d.job_priority); 
          d.job_priority_code = d.job_priority; 
          d.job_date = this.$date(d.job_date, "DD/MM/YYYY");
          d.assign_date = this.$date(d.assign_date, "DD/MM/YYYY");
          d.project_name = !this.is_mango()
            ? ($xt.isEmpty(d.project_name) && !$xt.isEmpty(d.customer_name))
              ? 'ไม่ระบุโครงการ'
              : (!$xt.isEmpty(d.project_name) ? d.project_name : 'By Customer')
            : (!this.isDeveloper() && this.is_mango())
              ? ($xt.isEmpty(d.project_name) && !$xt.isEmpty(d.customer_name)
                ? 'By Customer'
                : d.project_name)
              : (this.isDeveloper() && !$xt.isEmpty(d.project_name) && this.is_mango())
                ? `<a href="#" @click.prevent="queryStringRemoteIP(d)">${d.project_name}</a>`
                : d.project_name;
   
          this.$set(d, 'ont', ii);
          ii++;
        });

    

        this.search = {
          text: "",
          field: "job_no"
        };

        agr1.setDisplay(detail_rf);
  
        this.initTable2()

        this.$refs.modalByproject.openModal();

      },
      initTable2() {
        let agr = this.$refs.agr1
        let bold_underline = { 'font-weight': 'bold', 'text-decoration': 'underline' }
        let bg_blue = { 'background': '#b6caff' }


        let fields = [
          ['ont', 'No.', 'text', { width: 70, align: 'center',  }],
          ["job_no", "CSM No.", "text", { width: 150, align: "left", cellRenderer: (params) => { if (params.value) { return `<a href="${this.baseUrl}page/Transaction/v_csm_trn_001/?job_no=${params.value}" style="cursor: pointer; text-decoration: none; color: blue;" target="_blank">${params.value}</a>`; } return ""; }, },],
          ['job_date', 'Date', 'text', { width: 140, align: 'center' }],
          ['assign_date', 'Assign Date', 'text', { width: 140, align: 'center' },],
          ['subject', 'Subject', 'text', { width: 180, align: 'left' },],
          ['project_name', 'Project', 'text', { width: 160, align: 'left' }, ],
          ['request_by', 'Req. By', 'text', { width: 180 }, ],
          ['contract_user', 'Contact By', 'text', { width: 200 }, ],
          ['assign_emptel', 'Phone', 'text', { width: 130, align: 'center'  }, ],
          ["job_priority_text", "Job Priority", "text", {
            width: 130,
            align: "center",
            cellRenderer: (params) => {
              let code = params.data.job_priority_code || ""; 
              let text = params.data.job_priority_text ; 
              let cls = this.priorityStatusClass(code);
              return `<label class="${cls}">${text}</label>`;
            },
          }],
          ["status_name", "Job Status", "text", {
            width: 120,
            align: "center",
            cellRenderer: (params) => {
              let code = params.data.status || "";
              let text = params.data.status_name;
              let cls = this.statusClass(code);
              return `<label class="${cls}">${text}</label>`;
            },
          }],
        ]

        let header = agr.createHeaderFromArray(fields)
        agr.setHeader(header)

      },
      async loadDataX()
      {
       
        let act = `csm/report/view_bydetil?pre_event=${this.formData.pre_event}&status=${this.tmp.status}&type=${this.tmp.item_type}&text=${encodeURIComponent(this.search.text)}&field=${encodeURIComponent(this.search.field)}`;
        let rsp = await $xt.getServer(act);
        this.$set(this, 'datalist_byproject', rsp.data)
        let ii = 1;
        $linq(this.datalist_byproject).foreach(d => {
          this.$set(d, 'ont', ii);
          ii++;
        });

      },
      close()
      {
        this.$refs.modalByproject.closeModal();
      },
       /*  --------- Function Other ------------------*/
      openReq(x) {
        x = x || ''
        if ($xt.isEmpty(x)) {
          return this.baseUrl + `page/Transaction/v_csm_trn_001/`
        }
        else {
          return this.baseUrl + `page/Transaction/v_csm_trn_001/?job_no=${x.job_no}`
        }
      },
      priorityStatusClass(code) {
    
        var status = $linq(this.priorityCodeData).where(w => w.prioity_code == code).select(x => x.priority_status).firstOrDefault() || ''
     
        return status == '3' ? 'text-danger' : status == '2' ? 'text-warning' : 'text-info'
      },
      statusClass(status) {
        return status == 'Y' ? 'text-success' : status == 'I' ?  'text-info' : status == 'N' ?  'text-danger' : status == 'H' ?  'text-warning' : ''
      },
      is_complete(x) {
        return x.task_send_pretest == x.task_count && !['Y', 'N'].includes(x.job_status)
      },
      is_mango() {
        let isMango = $linq(this.configData).where(x => x.config_id == 'TRN0001').select(x => x.config_value).firstOrDefault()
        return isMango == 'Y' ? true : false
      },
      isDeveloper() {
        let department = this.auth.empcode.substring(0, 2)
        return department == 'IT'
      },
      priorityName(code) {
        return $linq(this.priorityCodeData).where(x => x.prioity_code == code).select(x => x.prioity_des).firstOrDefault() || ''
      },
      statusName(code) {
        return $linq(this.statusCode).where(x => x.id == code).select(x => x.name).firstOrDefault() || ''
      },
      queryStringRemoteIP(x) {
        window.open(this.baseUrl + `page/CustomerDataView?customer_code=${x.customer_code}&pre_event=${x.pre_event}&tabSelected=tab2`, '_blank')
      },

    },
    computed: {
      priorityCodeData() { return store.state.priorityCodeData },
      connectionCodeData() { return store.state.connectionCodeData },
      configData() { return store.state.configData },
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = 'CSM : Customer Service Dashboard';
      document.title = page.pageTitle;

      Chart.defaults.global.defaultFontFamily = "'Roboto', 'Sarabun', sans-serif";
      Chart.defaults.global.defaultFontColor = 'black';
      Chart.defaults.global.defaultFontSize = 13;

      this.$refs.modalByproject.setSize("modal-xl")

      this.loadTotal();
      this.loadChart();
    }
  };
  export default cpn;
</script>
