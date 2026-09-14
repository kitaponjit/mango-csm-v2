<template>
  <div>
    <div class="box box-widget">
      <div class="box-body">
        <div class="row">
          <div class="col-md-3">
            <select class="form-control" v-model="selectedService" @change="selectedWorker='';computeData()">
              <option value="03,22">&#9733; All Bugs</option>
              <option value="21,07,02,14,06">&#9733; All Request/CTM Edit/Dev</option>
              <option value="05,04,19">&#9733; All Forms/Document</option>
              <option v-for="x in serviceType" :value="x.serv_code">{{x.serv_name}}</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-control" v-model="selectedPlatform" @change="selectedWorker='';computeData()">
              <option value="">-- All --</option>
              <option value="WEB">WEB</option>
              <option value="MOB">MOBILE APP</option>
              <option value="WIN">WIN</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-control" v-model="selectedStatus" @change="computeData()">
              <option :value="''">-- ALL Status --</option>
              <option :value="'W'">Worker Status</option>
              <option :value="'O'">Other Status</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-control" v-model="selectedWorker" @change="computeData()">
              <option :value="''">-- ALL Worker --</option>
              <option v-for="x in workers" :value="x.worker">{{x.worker_name}} ({{x.count}})</option>
            </select>
          </div>
          <div class="col-md-3">
            <datepicker input-class="form-control" v-model="endDate" @change="computeData()" @input=""></datepicker>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Cases / Status</h3>
              </div>
              <div class="box-body" style="height:500px">
                <ECharts :option="optionStatus" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Un-finish Cases: Working Days</h3>
              </div>
              <div class="box-body" style="height:500px">
                <ECharts :option="optionDelay" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <div class="col-md-12">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Un-finish Cases: Months of Jobs</h3>
              </div>
              <div class="box-body" style="height:600px">
                <ECharts :option="optionMonths" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <div class="col-md-5">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Un-finish Cases: Modules (Web)</h3>
              </div>
              <div class="box-body" style="height:500px">
                <ECharts :option="optionModulesWeb" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <div class="col-md-5">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Un-finish Cases: Modules (Win)</h3>
              </div>
              <div class="box-body" style="height:500px">
                <ECharts :option="optionModulesWin" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Un-finish Cases: Platforms</h3>
              </div>
              <div class="box-body" style="height:500px">
                <ECharts :option="optionPlatforms" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <div class="col-md-6" v-show="!selectedWorker">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Un-finish Cases: Workers</h3>
              </div>
              <div class="box-body" style="height:500px">
                <ECharts :option="optionWorkers" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <div class="col-md-6" v-show="!selectedWorker">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Un-finish Cases: Workers (Status Wait)</h3>
              </div>
              <div class="box-body" style="height:500px">
                <ECharts :option="optionWaitWorkers" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Un-finish Cases: Top 15 Requesters</h3>
              </div>
              <div class="box-body" style="height:600px">
                <ECharts :option="optionRequesters15" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Un-finish Cases: Top 15 Customers</h3>
              </div>
              <div class="box-body" style="height:600px">
                <ECharts :option="optionCustomers15" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <div class="col-md-12">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Un-finish Cases: Requesters</h3>
              </div>
              <div class="box-body" style="height:600px">
                <ECharts :option="optionRequesters" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <div class="col-md-12">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Un-finish Cases: Customers</h3>
              </div>
              <div class="box-body" style="height:600px">
                <ECharts :option="optionCustomers" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">12 Months Tickets</h3>
              </div>
              <div class="box-body" style="height:500px">
                <ECharts :option="optionComplete12" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <!--optionCompleteModule-->
          <div class="col-md-6">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Completed By Modules In The Last Month</h3>
              </div>
              <div class="box-body" style="height:500px">
                <ECharts :option="optionCompleteModule" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
          <!--optionCompletePlatform-->
          <div class="col-md-6">
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Completed By Platforms In The Last Month</h3>
              </div>
              <div class="box-body" style="height:500px">
                <ECharts :option="optionCompletePlatform" :events="[['click',chartClick]]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { onMounted, ref } from 'vue'
  export default {
    setup() {
      const moment = window.moment
      const Decimal = window.Decimal
      const $xt = window.$xt
      const $linq = window.$linq

      const over_d = [3, 7, 15, 30, 60, 90, 120, 1e7]
      const over_d_ = ['<=3', '>3 & <=7', '>7 & <=15', '>15 & <=30', '>30 & <=60', '>60 & <=90', '>90 & <=120', '>120']

      const statusCodeData = [
        { id: 'W', name: 'Wait' },
        { id: 'H', name: 'Hold' },
        { id: 'I', name: 'In Progress' },
        { id: 'R', name: 'Reject' },
        { id: 'N', name: 'Cancel' },
        { id: 'B', name: 'Send Back' },
        { id: 'S', name: 'Send Pretest' },
        { id: 'T', name: 'Test' },
        { id: 'X', name: 'Send To QC' },
        { id: 'U', name: 'Update Program' },
        { id: 'Y', name: 'Complete' },
      ]

      const statusCodeData2 = statusCodeData.reduce((o, i) => {
        o[i.id] = i.name
        return o
      }, {})

      let remains1 = []
      let remains = []

      const optionStatus = ref({})
      const optionDelay = ref({})
      const optionModules = ref({})
      const optionModulesWeb = ref({})
      const optionModulesWin = ref({})
      const optionPlatforms = ref({})
      const optionWorkers = ref({})
      const optionWaitWorkers = ref({})
      const optionRequesters = ref({})
      const optionRequesters15 = ref({})
      const optionCustomers = ref({})
      const optionCustomers15 = ref({})
      const optionMonths = ref({})
      const workers = ref([])
      const selectedWorker = ref('')
      const selectedService = ref('03')
      const selectedStatus = ref('')
      const serviceType = ref([])
      const endDate = ref(moment().startOf('day').format())
      const selectedPlatform = ref('WEB')

      const optionComplete12 = ref({})
      const optionCompleteModule = ref({})
      const optionCompletePlatform = ref({})

      let remains3 = [];

      const getServies = async () => {
        let { data } = await $xt.getServer(`CSM/Center/ServiceType`)
        data.data_rows = $linq(data.data_rows).orderBy(x => x.serv_name || '').toArray()
        serviceType.value = data?.data_rows || []
      }

      const getData = async () => {
        let { data } = await $xt.getServer(`csm/CSMItDev/BugReport`)
        remains1 = data.remains
        filter1()
        computeData()
      }

      const filter1 = () => {

        endDate.value ||= moment().startOf('day').format()

        let services = serviceType.value.reduce((o, i) => {
          o[i.serv_code] = i.serv_name || i.serv_code
          return o
        }, {})

        remains1.forEach(x => {
          x.today = moment(endDate.value || undefined).startOf('day').format()
          x.job_date = moment(x.job_date).startOf('day').format()
          x.diff = moment(x.today).diff(x.job_date, 'days') + 1

          for (let i in over_d) {
            if (x.diff <= over_d[i]) {
              x.over_due = over_d_[i]
              break
            }
          }

          x.module_group = (x.platform || 'NONE') + ': ' + (x.module || 'NONE')
          x.worker_name = (x.worker_name || 'NONE').trim().replace(/\s\s+/g, ' ')
          x.request_name = (x.request_name || 'NONE').trim().replace(/\s\s+/g, ' ')
          x.customer = (x.customer || 'NONE').trim().replace(/\s\s+/g, ' ')
          x.platform ||= 'NONE'
          x.module ||= 'NONE'
          x.service_name = services[x.item_type] || x.item_type
          x.status_name = statusCodeData2[x.status] || x.status
        })
        let selected_type = selectedService.value?.split(',') || [];

        remains = $linq(remains1)
          .where(x => x.job_date <= x.today)
          .where(x => !selectedPlatform.value || x.platform === selectedPlatform.value)
          .where(x => selected_type.includes(x.item_type) && !['N', 'Y', 'R'].includes(x.status))
          .where(x => {
            if (!selectedStatus.value) {
              return true
            } else {
              if (selectedStatus.value === 'W') {
                return ['W', 'I', 'H', 'B'].includes(x.status)
              } else if (selectedStatus.value === 'O') {
                return !['W', 'I', 'H', 'B'].includes(x.status)
              }
            }
          })
          .orderBy(x => x.job_date || '')
          .toArray();

        let workers1 = $linq(remains)
          .select(x => ({ worker_name: x.worker_name, worker: x.worker }))
          .groupBy(x => JSON.stringify(x))
          .select(x => ({ ...x.values[0], count: x.values.length }))
          .orderByDescending(x => x.count)
          .toArray();

        workers.value = workers1;
      }

      const computeData = async () => {

        filter1();

        remains = $linq(remains)
          .where(x => selectedWorker.value ? (x.worker == selectedWorker.value) : true)
          .toArray()

        filter2()

        let proms = []

        proms.push(new Promise((rs) => {
          let st = $linq(remains)
            .groupBy(x => x.status)
            .toArray()
            .reduce((o, i) => {
              let { key, values } = i
              let count = values.length
              let per = remains.length ? new Decimal(count).div(remains.length).mul(100).toDP(2).toNumber() : 0
              let name = statusCodeData2[key] || key
              o[key] = { name, count, per, values }
              return o
            }, {})

          let st2 = statusCodeData.map(x => {
            let name = x.name
            let value = st[x.id]?.count || 0
            let details = st[x.id]?.values || []
            return { name, value, details }
          })

          Object.keys(st).forEach(x => {
            if (!statusCodeData.some(y => y.id === x)) {
              st2.push({ name: 'Status: ' + x, value: st[x]?.count || 0, details: st[x]?.values || [] })
            }
          })

          st2 = [...[{ name: 'ALL', value: remains.length, details: remains }], ...st2]
          st2 = st2.filter(x => x.value)
          st2.forEach(x => {
            x.name = x.name?.toUpperCase() || '';
            if (x.name === 'ALL') {
              x.color = '#FF004D'
            }
            else if (['WAIT', "HOLD", "IN PROGRESS", "SEND BACK"].includes(x.name)) {
              x.color = '#7E2553'
            } else {
              x.color = '#1D2B53'
            }
          });

          optionStatus.value = createBarOption(st2)
          rs()
        }))

        proms.push(new Promise((rs) => {
          let due = $linq(remains)
            .groupBy(x => x.over_due)
            .toArray()
            .reduce((o, i) => {
              let { key, values } = i
              let count = values.length
              let per = remains.length ? new Decimal(count).div(remains.length).mul(100).toDP(2).toNumber() : 0
              let name = statusCodeData2[key] || key
              o[key] = { name, count, per, values }
              return o
            }, {})

          let due2 = over_d_.map((x, i) => {
            let name = x;
            let value = due[x]?.count || 0
            let details = due[x]?.values || []
            let color = '#FF004D'
            if (i <= 1) {
              color = '#1D2B53'
            } else if (i <= 3) {
              color = '#7E2553'
            }
            else {
              color = '#FF004D'
            }
            return { name, value, color, details }
          });

          optionDelay.value = createBarOption(due2)
          rs()
        }))

        proms.push(new Promise((rs) => {
          let modules = $linq(remains)
            .groupBy(x => x.module_group)
            .select(x => {
              let { key, values } = x;
              let name = key
              let value = values.length
              let color = '#1D2B53'
              if (value <= 10) {
                color = '#1D2B53'
              } else if (value <= 20) {
                color = '#7E2553'
              } else {
                color = '#FF004D'
              }
              return { name, value, color, details: values }
            })
            .orderByDescending(x => x.value)
            .thenBy(x => x.name)
            .toArray();

          optionModules.value = createBarOption(modules)
          optionModulesWeb.value = createBarOption(modules.filter(x => x.name.indexOf('WEB: ') === 0))
          optionModulesWin.value = createBarOption(modules.filter(x => x.name.indexOf('WIN: ') === 0))
          rs()
        }))

        proms.push(new Promise((rs) => {
          let platforms = $linq(remains)
            .groupBy(x => x.platform || 'NONE')
            .select(x => {
              let { key, values } = x;
              let name = key
              let value = values.length
              let color = '#1D2B53'
              if (value <= 10) {
                color = '#1D2B53'
              } else if (value <= 20) {
                color = '#7E2553'
              } else {
                color = '#FF004D'
              }
              return { name, value, color, details: values }
            })
            .orderByDescending(x => x.name)
            .toArray();

          optionPlatforms.value = createBarOption(platforms)
          rs()
        }))

        proms.push(new Promise((rs) => {
          let workers1 = $linq(remains)
            .groupBy(x => x.worker_name || 'NONE')
            .select(x => {
              let { key, values } = x;
              let name = key
              let value = values.length
              let color = '#1D2B53'
              if (value <= 10) {
                color = '#1D2B53'
              } else if (value <= 20) {
                color = '#7E2553'
              } else {
                color = '#FF004D'
              }
              return { name, value, color, details: values }
            })
            .orderByDescending(x => x.value)
            .thenBy(x => x.name)
            .toArray();

          optionWorkers.value = createBarOption(workers1)
          rs()
        }))

        proms.push(new Promise((rs) => {
          let waitWorkers = $linq(remains)
            .where(x => x.status === 'W')
            .groupBy(x => x.worker_name || 'NONE')
            .select(x => {
              let { key, values } = x;
              let name = key
              let value = values.length
              let color = '#1D2B53'
              if (value <= 10) {
                color = '#1D2B53'
              } else if (value <= 20) {
                color = '#7E2553'
              } else {
                color = '#FF004D'
              }
              return { name, value, color, details: values }
            })
            .orderByDescending(x => x.value)
            .thenBy(x => x.name)
            .toArray();

          optionWaitWorkers.value = createBarOption(waitWorkers)
          rs()
        }))

        proms.push(new Promise((rs) => {
          let requester = $linq(remains)
            .groupBy(x => x.request_name || 'NONE')
            .select(x => {
              let { key, values } = x;
              let name = key
              let value = values.length
              let color = '#1D2B53'
              if (value <= 10) {
                color = '#1D2B53'
              } else if (value <= 20) {
                color = '#7E2553'
              } else {
                color = '#FF004D'
              }
              return { name, value, color, details: values }
            })
            .orderByDescending(x => x.value)
            .thenBy(x => x.name)
            .toArray();

          let requester15 = $linq(requester).take(15).toArray();

          optionRequesters.value = createBarOption(requester)
          optionRequesters15.value = createBarOption(requester15)

          rs()
        }))

        proms.push(new Promise((rs) => {
          let customers = $linq(remains)
            .groupBy(x => x.customer || 'NONE')
            .select(x => {
              let { key, values } = x;
              let name = key
              let value = values.length
              let color = '#1D2B53'
              if (value <= 10) {
                color = '#1D2B53'
              } else if (value <= 20) {
                color = '#7E2553'
              } else {
                color = '#FF004D'
              }
              return { name, value, color, details: values }
            })
            .orderByDescending(x => x.value)
            .thenBy(x => x.name)
            .toArray();

          let customers15 = $linq(customers).take(15).toArray();

          optionCustomers.value = createBarOption(customers)
          optionCustomers15.value = createBarOption(customers15)

          rs()
        }))

        proms.push(new Promise((rs) => {
          let months = $linq(remains)
            .groupBy(x => moment(x.job_date).format('YYYY-MM'))
            .select(x => {
              let { key, values } = x;
              let name = key
              let value = values.length
              let color = '#1D2B53'
              if (value <= 10) {
                color = '#1D2B53'
              } else if (value <= 20) {
                color = '#7E2553'
              } else {
                color = '#FF004D'
              }
              return { name, value, color, details: values }
            })
            .orderBy(x => x.name)
            .toArray();

          optionMonths.value = createBarOption(months)

          rs();
        }))

        await Promise.all(proms)

      }

      const createBarOption = (data) => {
        return {
          grid: {
            //left: '10%',
            //right: '10%',
            //top: 10,
            //bottom: 10
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: data.map(x => x.name),
            axisLabel: {
              interval: 0,
              rotate: 45 //If the label names are too long you can manage this by rotating the label.
            }
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: data.map(x => ({ value: x.value, itemStyle: { color: x.color || undefined }, details: x.details || [] })),
              type: 'bar',
              label: {
                show: true,
                position: 'top'
              },
            }
          ]
        };
      }

      const createBarOption2 = (data, lables) => {
        let series = [];
        let legend = data.map(z => z.name)

        data.forEach(z => {
          let name = z.name
          series.push({
            name,
            data: z.data.map(x => ({ value: x.value, itemStyle: { color: x.color || undefined }, details: x.details || [] })),
            type: 'bar',
            label: {
              show: true,
              position: 'top'
            },
          })
        })

        return {
          grid: {
            //left: '10%',
            //right: '10%',
            //top: 10,
            //bottom: 10
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: lables,
            axisLabel: {
              interval: 0,
              rotate: 45 //If the label names are too long you can manage this by rotating the label.
            }
          },
          yAxis: {
            type: 'value'
          },
          series,
          //legend
        };
      }

      const chartClick = (e) => {
        let nw = window.open(window.baseUrl + 'page/it_dev_dashboard/it_dev_dashboard_001_details', '_blank')
        nw.window.pass_data = JSON.stringify(e?.data?.details || [])
      }

      const getData2 = async () => {
        let { data } = await $xt.getServer(`csm/CSMItDev/BugReport2`)

        remains3 = data;

        //console.log(data)
        filter2();

      }

      const filter2 = () => {
        endDate.value ||= moment().startOf('day').format()

        let services = serviceType.value.reduce((o, i) => {
          o[i.serv_code] = i.serv_name || i.serv_code
          return o
        }, {})

        remains3.forEach(x => {
          x.today = moment(endDate.value || undefined).startOf('day').format()
          x.job_date = moment(x.job_date).startOf('day').format()
          x.diff = moment(x.today).diff(x.job_date, 'days') + 1

          for (let i in over_d) {
            if (x.diff <= over_d[i]) {
              x.over_due = over_d_[i]
              break
            }
          }

          x.module_group = (x.platform || 'NONE') + ': ' + (x.module || 'NONE')
          x.worker_name = (x.worker_name || 'NONE').trim().replace(/\s\s+/g, ' ')
          x.request_name = (x.request_name || 'NONE').trim().replace(/\s\s+/g, ' ')
          x.customer = (x.customer || 'NONE').trim().replace(/\s\s+/g, ' ')
          x.platform ||= 'NONE'
          x.module ||= 'NONE'
          x.service_name = services[x.item_type] || x.item_type
          x.status_name = statusCodeData2[x.status] || x.status
        })

        //console.log(remains3)
        compute2();
      }

      const compute2 = async () => {
        let proms = [];

        proms.push(new Promise((rs) => {

          let d2 = {};
          let d3 = {};
          let d4 = {};
          let d5 = {};
          let endMonth = moment(endDate.value).format('YYYY-MM')
          let startMonth = moment(endDate.value).add(-11, 'months').format('YYYY-MM');

          //let finale =
          let selected_type = selectedService.value?.split(',') || [];
          console.log(selected_type)
          remains3
            .filter(x => selected_type.includes(x.item_type))
            .filter(x => !selectedPlatform.value || selectedPlatform.value === x.platform)
            .filter(x => x.job_date <= x.today)
            .forEach(x => {

              let mm = moment(x.job_date).format('YYYY-MM');

              if (mm === endMonth) {
                let p = d2[x.platform] ||= [];
                p.push(x)
              }

              if (mm >= startMonth && mm <= endMonth) {
                let o = d3[mm] ||= [];
                o.push(x)
              }
            });

          remains3
            .filter(x => selected_type.includes(x.item_type))
            .filter(x => !selectedPlatform.value || selectedPlatform.value === x.platform)
            .filter(x => x.status == 'Y' && x.complete_date && x.complete_date <= x.today)
            .forEach(x => {

              let mm = moment(x.complete_date).format('YYYY-MM');

              if (mm === endMonth) {
                let p = d4[x.platform] ||= [];
                p.push(x)
              }

              if (mm >= startMonth && mm <= endMonth) {
                let o = d5[mm] ||= [];
                o.push(x)
              }
            });

          let loop = moment(startMonth + '-01', 'YYYY-MM-DD');

          let mo = [];

          while (loop.format('YYYY-MM') <= endMonth) {
            mo.push(loop.format('YYYY-MM'))
            loop = loop.add(1, 'months');
          }

          let f = []
          f.push({ name: 'Requested', data: mo.map(x => ({ value: (d3[x] || []).length, color: 'blue', details: (d3[x] || []) })) })
          f.push({ name: 'Completed', data: mo.map(x => ({ value: (d5[x] || []).length, color: 'green', details: (d5[x] || []) })) })

          f[0].data.push({ value: remains.length, color: 'red', details: remains });

          mo.push('Not Complete')
          optionComplete12.value = createBarOption2(f, mo)

          let d6 = $linq(d5[endMonth] || [])
            .orderBy(x => x.platform)
            .thenBy(x => x.module)
            .groupBy(x => JSON.stringify({ platform: x.platform, module: x.module }))
            .select(x => {
              let k = JSON.parse(x.key)
              let name = `${k.module} - ${k.platform}`
              let details = x.values
              let value = details.length
              let color = 'green'
              return { name, value, color, details }
            }).toArray();

          let d7 = $linq(d5[endMonth] || [])
            .orderBy(x => x.platform)
            .thenBy(x => x.module)
            .groupBy(x => JSON.stringify({ platform: x.platform }))
            .select(x => {
              let k = JSON.parse(x.key)
              let name = `${k.platform}`
              let details = x.values
              let value = details.length
              let color = 'green'
              return { name, value, color, details }
            }).toArray();

          //console.log(d6)

          optionCompleteModule.value = createBarOption(d6);
          optionCompletePlatform.value = createBarOption(d7);

          rs();

        }))

        await Promise.all(proms)
      }

      onMounted(async () => {
        await getServies()
        getData()
        getData2()
      })

      return {
        optionStatus,
        optionDelay,
        optionModules,
        optionModulesWeb,
        optionModulesWin,
        optionPlatforms,
        optionWorkers,
        optionWaitWorkers,
        optionRequesters,
        optionRequesters15,
        optionCustomers,
        optionCustomers15,
        optionMonths,
        optionComplete12,
        optionCompleteModule,
        optionCompletePlatform,
        workers,
        selectedWorker,
        selectedService,
        selectedStatus,
        serviceType,
        endDate,
        getServies,
        getData,
        getData2,
        filter1,
        filter2,
        computeData,
        compute2,
        createBarOption,
        createBarOption2,
        chartClick,
        selectedPlatform
      }
    }
  }
</script>
