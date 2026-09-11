<template>
  <div>
    <re-page ref="page">
      <template slot="body">
        <section class="content-header">
          <h1>
            Majors Defect Dashboard
            <small> at {{date_range[0] | date('MMM YYYY')}} - {{date_range[1] | date('MMM YYYY')}}</small>
          </h1>
          <ol class="breadcrumb">
            <li><a href="#"><i class="fas fa-home"></i> Home</a></li>
            <li class="active">Dashboard</li>
          </ol>
        </section>
        <section class="content">
          <!-- Chart Display -->
          <div class="box box-solid">
            <div class="box-body">
              <div class="row">
                <div class="col-md-3">
                  <div class="form-group">
                    <label v-text="ui.re_select_period || 'เลือกช่วงเวลา'"></label><br />
                    <date-picker v-model="date_range" input-class="form-control input-sm" range v-on:change="loadData()" lang="th" :append-to-body="true"></date-picker>
                    <i class="fas fa-spin fa-pulse" v-show="loading"></i>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12 text-center">
                  <hr style="border-top: 1px solid silver;" />
                  <h4 class="text-bold">สรุปข้อมูลงานแจ้งซ่อม แยกตามประเภท ระหว่างวันที่ &nbsp; {{start_date_th}} &nbsp; - &nbsp; {{end_date_th}}</h4>
                  <h4 style="color:silver; margin: 40px 0px;" v-if="!dashData.length">ไม่พบข้อมูล / Data not available</h4>
                  <canvas ref="barChart" @receive-data="" style="width:100%; height: 480px;" v-else></canvas>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </re-page>

    <!-- Modal : Calendar Worker -->
    <div class="modal fade" ref="detailModal">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title" style="padding-top: 5px;"><i class="fas fa-list"></i> รายละเอียดข้อมูลงานแจ้งซ่อม</h4>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-12">
                <table-stick height="300">
                  <table class="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th class="tf-2">ลำดับ</th>
                        <th class="tf-3-5">เลขที่เอกสาร</th>
                        <th class="tf-3">วันที่เอกสาร</th>
                        <th class="tf-4">โครงการ</th>
                        <th class="tf-4">ลูกค้า</th>
                        <th class="tf-4">เรื่อง</th>
                        <th class="tf-5">รายละเอียด</th>
                        <th class="tf-3">วันที่ครบกำหนด</th>
                        <th class="tf-4">ผู้รับผิดชอบหลัก</th>
                        <th class="tf-4">ผู้ฎิบัติงาน</th>
                        <th class="tf-3">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="x,idx in dashDetail" v-if="dashDetail.length">
                        <td align="center">{{idx+1}}</td>
                        <td align="center">{{x.csm_no}}</td>
                        <td align="center">{{x.csm_date | date()}}</td>
                        <td align="left">{{ !x.refcode ? '' : '(' + x.refcode + ')' }} {{x.projname}}</td>
                        <td align="left">{{x.customer_name}}</td>
                        <td align="left">{{x.subject}}</td>
                        <td align="left">{{x.subject_detail}}</td>
                        <td align="center">{{x.due_date | date()}}</td>
                        <td align="left">{{x.responsible}}</td>
                        <td align="left">{{x.worker}}</td>
                        <td align="center" :style="{'color': statusColor[x.status] || ''}">{{x.status_name}}</td>
                      </tr>
                      <tr v-if="!dashDetail.length">
                        <td align="center" colspan="11"><span style="color:gray">ไม่พบข้อมูล / Data not available</span></td>
                      </tr>
                    </tbody>
                  </table>
                </table-stick>
              </div>
            </div>
          </div>
          <div class="modal-footer"></div>
        </div>
      </div>
    </div>

  </div>
</template>
<script type="text/javascript">
  import Chart from 'chart.js';
  import 'chartjs-plugin-labels';
  import DatePicker from 'vue2-datepicker';
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let month_th = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  let start_date = new Date(date.getFullYear(), date.getMonth(), 1); // first day in month
  let end_date = new Date(date.getFullYear(), date.getMonth() + 1, 0); // last day in month
  let statusColor = {
    W: '#555555',
    H: '#9675E0',
    R: '#DC143C',
    N: '#AF0600',
    I: '#0098CB',
    T: '#003890',
    B: '#825800',
    U: '#FFCB33',
    S: '#5FB90E',
    X: '#0F8774',
    Y: '#007F2F'
  };
  let page = {};
  let cpn = {
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        loading: false,
        fadein: true,
        date_range: [start_date, end_date],
        cond: { year: year, month: month },
        start_date_th: "",
        end_date_th: "",
        month_th: month_th,
        myChart: {},
        dashData: [],
        dashDetail: [],
        statusColor,
        rptTemp: {},
        rptHeader: [],
        rptDetail: [],
        summaryTotal: {}
      };
    },
    components: {
      'date-picker': DatePicker
    },
    methods: {
      async loadData() {
        page.loadingBox.show();
        let start_date = moment(this.date_range[0]).format('YYYY-MM-DD');
        let end_date = moment(this.date_range[1]).format('YYYY-MM-DD');
        let act = `csm/report/Dash_MostDefectHeader?start_date=${start_date}&end_date=${end_date}`;
        try {
          let resp = await $xt.getServer(act);
          await this.$set(this, "dashData", resp || []);
          this.loadChart();
        }
        catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        }
        finally {
          page.loadingBox.hide();
        }
      },
      async loadDetail(projtype, serv_code_d) {
        page.loadingBox.show();
        let start_date = moment(this.date_range[0]).format('YYYY-MM-DD');
        let end_date = moment(this.date_range[1]).format('YYYY-MM-DD');
        let act = `csm/report/Dash_MostDefectDetail?start_date=${start_date}&end_date=${end_date}&projtype=${projtype}&serv_code_d=${serv_code_d}`;
        try {
          let resp = await $xt.getServer(act);
          await this.$set(this, "dashDetail", resp || []);
          $(this.$refs.detailModal).modal("show");
        }
        catch (ex) {
          $msg.alert(``, ex.toString(), `danger`);
        }
        finally {
          page.loadingBox.hide();
        }
      },
      async loadChart() {

        let start = moment(this.date_range[0]).format('YYYY-MM-DD');
        let end = moment(this.date_range[1]).format('YYYY-MM-DD');
        let start_date_th = `${moment(start).date()} ${month_th[moment(start).month()]} ${moment(start).year()}`;
        let end_date_th = `${moment(end).date()} ${month_th[moment(end).month()]} ${moment(end).year()}`
        this.$set(this, 'start_date_th', start_date_th || '');
        this.$set(this, 'end_date_th', end_date_th || '');

        if (!this.dashData.length) return;

        let lbs = $linq(this.dashData).select(x => x.serv_name_d || 'ไม่ระบุ').toArray() || [];
        let dt = $linq(this.dashData).select(x => x.total_csm || 0).toArray() || [];
        let max = Math.max.apply(null, dt);
        max = Math.ceil(max + (max * 0.2)); // +เพิ่มอีก 20%
        const labels = ['รวมทุกภาค', 'เหนือ', 'ตะวันออก', 'อีสาน', 'กลาง', 'ใต้', 'test', 'เหนือ', 'ตะวันออก', 'อีสาน', 'กลาง', 'ใต้', 'test', 'เหนือ', 'ตะวันออก', 'อีสาน', 'กลาง', 'ใต้', 'test', 'เหนือ', 'ตะวันออก', 'อีสาน', 'กลาง', 'ใต้', 'test', 'เหนือ', 'ตะวันออก', 'อีสาน', 'กลาง', 'ใต้', 'test'];
        const data = {
          labels: lbs,
          datasets: [{
            label: 'Defect Qty',
            data: dt,//[65, 59, 80, 81, 56, 51, 41, 59, 80, 81, 56, 51, 1, 59, 80, 81, 56, 51, 41, 59, 80, 81, 56, 51, 41, 59, 80, 81, 56, 51, 41],
            backgroundColor: 'rgba(255, 210, 40, 0.6)',
            borderColor: 'rgb(255, 210, 40)',
            borderWidth: 1
            //backgroundColor: [
            //  'rgba(255, 99, 132, 0.2)',
            //  'rgba(255, 159, 64, 0.2)',
            //  'rgba(255, 205, 86, 0.2)',
            //  'rgba(75, 192, 192, 0.2)',
            //  'rgba(54, 162, 235, 0.2)',
            //  'rgba(153, 102, 255, 0.2)',
            //  'rgba(201, 203, 207, 0.2)'
            //],
            //borderColor: [
            //  'rgb(255, 99, 132)',
            //  'rgb(255, 159, 64)',
            //  'rgb(255, 205, 86)',
            //  'rgb(75, 192, 192)',
            //  'rgb(54, 162, 235)',
            //  'rgb(153, 102, 255)',
            //  'rgb(201, 203, 207)'
            //],
          }]
        };

        var options = {
          responsive: true,
          //title: {
          //  display: true,
          //  text: `สรุปข้อมูลงานแจ้งซ่อม แยกตามประเภท ระหว่างวันที่ ${start_date_th}  -  ${end_date_th}`,
          //  fontSize: 16,
          //},
          legend: {
            display: false
          },
          plugins: {
            labels: {
              visible: true,
              render: 'value',
              fontColor: '#FF8A00',
              fontSize: 16,
              showZero: false
            }
          },
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                beginAtZero: true,
                min: 0,
                max: max
              }
            }]
          },
          tooltips: {
            mode: 'label',
          },
          onClick: this.chartSelected,
          hover: {
            onHover: function (e, el) {
              e.target.style.cursor = el[0] ? 'pointer' : 'default';
            }
          }
        };

        this.myChart = new Chart(this.$refs.barChart, {
          type: 'bar',
          data: data,
          options: options,
        });

      },
      chartSelected(evt) {
        var item = this.myChart.getElementAtEvent(evt)[0];
        if (item) {
          const index = item._index;
          const color = item._view.backgroundColor;

          const obj = this.dashData[index];
          this.loadDetail(obj.projtype, obj.serv_code_d);
        }
      }
    },
    mounted() {
      page = this.$refs.page;
      page.pageTitle = 'CSM : Most Defect Dashboard';
      document.title = page.pageTitle;

      Chart.defaults.global.defaultFontFamily = "'Roboto', 'Sarabun', sans-serif";
      Chart.defaults.global.defaultFontColor = 'black';
      Chart.defaults.global.defaultFontSize = 13;

      this.loadData();
    }
  };
  export default cpn;
</script>
<style scoped>
  .hr-vertical {
    border: none;
    border-left: 1px solid #333;
    height: 100vh;
    width: 1px;
  }

  .table > tbody > tr > td {
    position: relative;
    opacity: .999;
  }

  .tr-hovered {
    height: 38px;
  }

    .tr-hovered:hover {
      transition: 0.2s;
      font-size: 1.2em;
    }

  .bg-yellow {
    background-color: #f7d13d !important;
  }

  .bg-danger {
    background-color: #ff777e !important;
  }

  .bg-progress {
    position: absolute;
    margin: 5px;
    left: 0;
    top: 0;
    bottom: 0;
    background-color: #10c472;
    z-index: -1;
  }

  .fade-in {
    animation: fadein 0.5s;
    /*-moz-animation: fadein 2s;*/ /* Firefox */
    /*-webkit-animation: fadein 2s;*/ /* Safari and Chrome */
    /*-o-animation: fadein 2s;*/ /* Opera */
  }

  @keyframes fadein {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  .fade-out {
    animation: fadeout 0.5s;
  }

  @keyframes fadeout {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }
  thead th {
    z-index: 1;
  }
  thead tr:nth-child(2) th {
    position: -webkit-sticky;
    position: sticky;
    top: 31.5px !important;
    z-index: 50;
  }
</style>
