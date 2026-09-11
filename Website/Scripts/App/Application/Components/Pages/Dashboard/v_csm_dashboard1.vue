<template>
    <div>
        <re-page ref="page">
            <template slot="body">
                <section class="content-header">
                    <h1>
                        Customer Service Dashboard
                        <small>Version 1.0</small>
                    </h1>
                    <ol class="breadcrumb">
                        <li><a href="#"><i class="fas fa-home"></i> Home</a></li>
                        <li class="active">Dashboard</li>
                    </ol>
                </section>
                <section class="content">
                    <!-- Panel Info Summary -->
                    <div class="row">
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="info-box">
                                <span class="info-box-icon bg-navy"><i class="fas fa-folder-open"></i></span>
                                <div class="info-box-content">
                                    <span class="info-box-text">รายการ CSM ทั้งหมด</span>
                                    <span class="info-box-number">{{summaryTotal.total}} รายการ</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="info-box">
                                <span class="info-box-icon bg-gray"><i class="fas fa-pause"></i></span>
                                <div class="info-box-content">
                                    <span class="info-box-text">รายการที่อยู่ในสถานะ None</span>
                                    <span class="info-box-number">{{summaryTotal.total_none}} รายการ จาก {{summaryTotal.total}} รายการ</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="info-box">
                                <span class="info-box-icon bg-aqua"><i class="fas fa-tasks"></i></span>
                                <div class="info-box-content">
                                    <span class="info-box-text">รายการที่อยู่ในสถานะ In Progress</span>
                                    <span class="info-box-number">{{summaryTotal.total_inprogress}} รายการ จาก {{summaryTotal.total}} รายการ</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="info-box">
                                <span class="info-box-icon bg-green"><i class="fas fa-power-off"></i></span>
                                <div class="info-box-content">
                                    <span class="info-box-text">รายการที่อยู่ในสถานะ Complete</span>
                                    <span class="info-box-number">{{summaryTotal.total_complete}} รายการ จาก {{summaryTotal.total}} รายการ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Chart Display -->
                    <div class="box box-solid">
                        <div class="box-body">
                            <div class="row">
                                <div class="col-md-6 col-sm-6 col-xs-6">
                                    <canvas ref="donutChart" style="width:100% !important;height:500px !important"></canvas>
                                </div>
                                <div class="col-md-6 col-sm-6 col-xs-6">
                                    <canvas ref="donutChart2" style="width:100% !important;height:500px !important"></canvas>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12 col-sm-12 col-xs-12">
                                    <canvas ref="barChart" style="width:100% !important;height:500px !important"></canvas>
                                </div>
                            </div>
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
    let page = {};
    let cpn = {
        data() {
            return {
                baseUrl,
                baseRoute,
                queryString,
                ui: window.ui,
                isLoading: false,
                pieData: [],
                summaryTotal: {}
            };
        },
        methods: {
            randomMath() {
                return Math.round(Math.random() * 255);
            },
            async loadTotal() {
                let act = `csm/report/GetTotalSummary`;
                let rsp = await $xt.getServer(act);
                this.$set(this, "summaryTotal", rsp);
            },
            async loadChart() {
                let act = `csm/report/Dash_Summary`;
                let rsp = await $xt.getServer(act);

                /* Service Type Chart */
                let serviceColor = [];
                $linq(rsp.complete.list).foreach(x => {
                    serviceColor.push(`rgb(${this.randomMath()}, ${this.randomMath()}, ${this.randomMath()})`)
                });
                new Chart(this.$refs.donutChart, {
                    type: 'pie',
                    data: {
                        datasets: [{
                            data: rsp.complete.list_data,
                            backgroundColor: serviceColor,
                        }],
                        labels: rsp.complete.list,
                    },
                    options: {
                        responsive: true,
                        title: {
                            display: true,
                            text: 'ประเภทการให้บริการ'
                        },
                        legend: {
                            position: 'top',
                        },
                        animation: {
                            animateScale: true,
                            animateRotate: true
                        },
                        plugins: {
                            labels: [
                                {
                                    render: 'label',
                                    position: 'outside'
                                },
                                {
                                    render: 'percentage',
                                    fontColor: 'white',
                                }
                            ]
                        },
                    }
                });

                /* CSM Status Chart */
                new Chart(this.$refs.donutChart2, {
                    type: 'pie',
                    data: {
                        datasets: [{
                            data: rsp.status.list_data,
                            backgroundColor: rsp.status.color,
                        }],
                        labels: rsp.status.list,
                    },
                    options: {
                        responsive: true,
                        title: {
                            display: true,
                            text: 'แสดงรายการสถานะของงาน'
                        },
                        legend: {
                            position: 'top',
                        },
                        animation: {
                            animateScale: true,
                            animateRotate: true
                        },
                        plugins: {
                            labels: [
                                {
                                    render: 'label',
                                    position: 'outside'
                                },
                                {
                                    render: 'percentage',
                                    fontColor: 'white',
                                }
                            ]
                        },
                    }
                });

                /* Service Type Bar Chart */
                var databar = [];
                let labels = $linq(rsp.detail_status.list).select(x => x.servname).toArray() || [];
                $linq(rsp.allstatus).foreach(x => {
                    let L_data = [];
                    $linq(rsp.detail_status.list).foreach(g => {
                        var vl_status = $linq(g.detail).where(g => g.status == x.status).select(g => g.value).firstOrDefault() || 0;
                        L_data.push(vl_status);
                    });
                    databar.push({
                        label: x.name,
                        backgroundColor: x.color,
                        borderWidth: 1,
                        data: L_data,
                    });

                });
                var horizontalBarChartData = {
                    labels: labels,
                    datasets: databar
                };
                new Chart(this.$refs.barChart, {
                    type: 'horizontalBar',
                    data: horizontalBarChartData,
                    options: {
                        responsive: true,
                        title: {
                            display: true,
                            text: 'Service Type Chart Bar Title'
                        },
                        legend: {
                            position: 'right',
                        },
                    }
                });

            },
        },
        mounted() {
            page = this.$refs.page;
            page.pageTitle = 'CSM : Customer Service Dashboard';
            document.title = page.pageTitle;

            Chart.defaults.global.defaultFontFamily = "'Roboto', 'Sarabun', sans-serif";
            Chart.defaults.global.defaultFontColor = 'black';
            Chart.defaults.global.defaultFontSize = 13;

            this.loadTotal();
            this.loadChart();
        }
    };
    export default cpn;
</script>
