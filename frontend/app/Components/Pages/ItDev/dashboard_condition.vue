<template>
  <div class="opd-cond">
    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label><b>Services</b></label>
          <select class="form-control" v-model="ci['service']">
            <option :value="''"> -- All -- </option>
            <option v-for="x in serviceType" :value="x.serv_code" v-html="x.serv_name"></option>
          </select>
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label><b>End Date</b></label>
          <datepicker input-class="form-control" v-model="ci['end_date']"></datepicker>
        </div>
      </div>
      <div class="col-md-3" v-show="props.condSet==='001'">
        <div class="form-group">
          <label><b>Platform</b></label>
          <select class="form-control" v-model="ci['platform']">
            <option value="">-- All --</option>
            <option value="WEB">WEB</option>
            <option value="MOB">MOBILE APP</option>
            <option value="WIN">WIN</option>
          </select>
        </div>
      </div>
      <div class="col-md-3" v-show="props.condSet==='001'">
        <div class="form-group">
          <label><b>Status</b></label>
          <select class="form-control" v-model="ci['status']">
            <option :value="''">-- ALL Status --</option>
            <option :value="'W'">Worker Status</option>
            <option :value="'T'">Tester Status</option>
            <option :value="'O'">Other Status</option>
          </select>
        </div>
      </div>
      <div class="col-md-3" v-show="props.condSet==='001'">
        <div class="form-group">
          <label><b>Priority</b></label>
          <select class="form-control" v-model="ci['priority']">
            <option :value="''">-- ALL Priority --</option>
            <option v-for="x in priority" :value="x.pri_code">{{x.pri_name}}</option>
          </select>
        </div>
      </div>

      <div class="col-md-3" v-show="props.condSet==='001'">
        <div class="form-group">
          <label><b>Over Due</b></label>
          <select class="form-control" v-model="ci['over_due']">
            <option :value="''">-- ALL Due --</option>
            <option :value="'N'">Not Over Due</option>
            <option :value="'O'">Over Due</option>
          </select>
        </div>
      </div>

      <div class="col-md-3" v-show="props.condSet==='001'">
        <div class="form-group">
          <label><b>Worker</b></label>
          <select class="form-control" v-model="ci['worker']">
            <option :value="''">-- ALL Worker --</option>
            <option v-for="x in listworker" :value="x.empno">{{x.empname}} ({{x.count}})</option>
          </select>
        </div>
      </div>

      <div class="col-md-3">
        <div class="form-group">
          <label><b>Worker Department</b></label>
          <select class="form-control" v-model="ci['worker_dep']">
            <option :value="''">-- ALL Worker DEP --</option>
            <option v-for="x in departments" :value="x">{{x}}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { onMounted, ref, watch } from 'vue'
  import { condInput, debounce, depEmp, departments, filterdData, filterdData2, priority, serviceType, statusCodeData, allComplete } from './databus.js'
  //import PPN from './ppn_tasks.js'

  export default {
    props: {
      condSet: String
    },
    setup(props) {

      const listworker = ref([])

      const rawData = {}
      const rawData2 = {}

      const rawRequest = {}
      const rawComplete = {}
      const ymArr = {}

      //const ppn = new PPN({ maincode: 'MG1', pre_event: '00002025' });

      const statusCodeKey = statusCodeData.reduce((acc, i) => {
        acc[i.id] = i.name.toUpperCase();
        return acc
      }, {})

      const loadMaster = async () => {
        //ppn.getProcessedData();
        const url1 = `CSM/Center/ServiceType`
        const url2 = `Anywhere/Management/EmployeeReadList?sort=&sort_type=desc&field=empfullname_t&text=&employee=Y&resign=Y&empstatus=ALL`
        const [rsp1, rsp2] = await Promise.all([
          $xt.getServer(url1),
          $xt.getServer(url2),
        ])

        const allEmps = rsp2?.template || [];
        const depEmpx = {};

        for (let x of allEmps) {
          x.department = normalizeText(x.department || 'Undefined')
          x.empfullname_t &&= normalizeText(x.empfullname_t)
          x.empfullname_e &&= normalizeText(x.empfullname_e)

          depEmpx[x.department] ||= {};
          depEmpx[x.department][x.empno?.toString()] = x
        }

        departments.value = Object.keys(depEmpx).customOrderBy(x => ({ asc: x }));
        depEmp.value = depEmpx

        const groupService = [
          { serv_code: '24,22,03', serv_name: '&#9733; All Bugs Software & Reports', sort: 1 },
          { serv_code: '01,07,35,02,14,34,06,36', serv_name: '&#9733; All Request/CTM Edit/Dev/New feature', sort: 2 },
          { serv_code: '28,05,04,19', serv_name: '&#9733; All Forms/Document BUG/EDIT/REQUEST', sort: 3 },
        ];

        serviceType.value = [...groupService, ...(rsp1?.data?.data_rows || [])]
          .map(x => {
            x.sort ||= 99
            x.serv_name &&= normalizeText(x.serv_name)
            return x
          })
          .customOrderBy(x => ({ asc: x.sort }), x => ({ asc: x.serv_name || '' }));
      }

      const loadData = async () => {
        const url2 = `csm/CSMItDev/BugReport`
        const url3 = `csm/CSMItDev/BugReport2`
        $notify.info(`Loading data from the server, please wait..`)
        const [rsp2, rsp3] = await Promise.all([
          $xt.getServer(url2),
          $xt.getServer(url3),
        ]);

        rawData.value = rsp2?.data?.remains || []
        rawData2.value = (rsp3?.data || []).filter(x => x.status !== 'R');

        dofilter()

        //$notify.info(`Data retrieved successfully. Preparing the display...`)

      }

      const reset = () => {
        condInput.value = {
          service: '24,22,03',
          platform: '',
          status: 'W',
          worker: '',
          end_date: moment().startOf('day').format(),
          over_due: '',
          worker_dep: '',
          priority: ''
        }
      }

      const normalizeText = (text) => {
        return typeof text === 'string'
          ? text.toUpperCase().trim().replace(/\s+/g, ' ')
          : text;
      }

      const prepareData = (arr) => {
        arr ||= []
        const today = moment(condInput.value.end_date || undefined).startOf('day');
        const priority1 = {}

        const servN = serviceType.value.reduce((acc, i) => { acc[i.serv_code] = i.serv_name; return acc }, {});

        for (const x of arr) {
          const jobDate = moment(x.job_date || undefined).startOf('day');
          const dueDate = moment(x.due_date || undefined).startOf('day');
          //x._id_ = crypto.randomUUID();
          x.today = today.format();
          x.job_date = jobDate.format();
          x.diff = today.diff(jobDate, 'days') + 1;
          x.over_due = today.diff(dueDate, 'days');
          x.over_due_status = x.over_due > 0 ? 'O' : 'N';
          x.status_name = statusCodeKey[x.status] || x.status;
          x.customer = normalizeText(x.customer);
          x.request_name = normalizeText(x.request_name);
          x.tester_empname = normalizeText(x.tester_empname);
          x.worker_name = normalizeText(x.worker_name);
          x.pre_des = normalizeText(x.pre_des);
          x.module = normalizeText(x.module);
          x.pri_name = normalizeText(x.pri_name);
          x.pri_code &&= parseInt(x.pri_code);
          x.worker_status = { 'W': 1, 'I': 1, 'H': 1, 'B': 1 }[x.status] ? 'W'
            : { 'X': 1, 'T': 1 }[x.status] ? 'T'
            : 'O';
          x.service_name = servN[x.item_type]

          const { pri_name, pri_code } = x;
          priority1[JSON.stringify({ pri_name, pri_code })] = 1
        }

        priority.value = Object.keys(priority1)
          .map(y => (JSON.parse(y))).filter(y => y.pri_code)
          .customOrderBy(y => ({ asc: y.pri_code }));

        return arr;
      }

      const prepareData2 = arr => {
        arr ||= []
        const servN = serviceType.value.reduce((acc, i) => { acc[i.serv_code] = i.serv_name; return acc }, {});
     
        for (const x of arr) {
          x.customer = normalizeText(x.customer);
          x.request_name = normalizeText(x.request_name);
          x.tester_empname = normalizeText(x.tester_empname);
          x.worker_name = normalizeText(x.worker_name);
          x.pre_des = normalizeText(x.pre_des);
          x.module = normalizeText(x.module);
          x.status_name = statusCodeKey[x.status] || x.status;
          x.service_name = servN[x.item_type]

          const jobDate = moment(x.job_date).startOf('day');
          const dueDate = moment(x.due_date).startOf('day');

          x.job_date_ym = jobDate.format('YYYY-MM')

          if (x.job_status === 'Y' && x.status === 'Y' && x.complete_date) {

            const completeDate = moment(x.complete_date).startOf('day');
            x.final_complete = 1
            x.complete_date_ym = completeDate.format('YYYY-MM')

            x.over_due = completeDate.diff(dueDate, 'days');
            x.over_due_status = x.over_due > 0 ? 'OVERDUE' : 'ON TIME';

            x.working_day = completeDate.diff(jobDate, 'days') + 1;
          }
        }

        const ym_arr = Array.from({ length: 12 }, (_, i) => i)
          .map(x => moment(condInput.value.end_date).add(x * -1, 'months').format('YYYY-MM'))
          .customOrderBy(x => ({ asc: x }));

        const finale = arr.reduce((acc, i) => {
          acc.request ||= [];
          acc.compelete ||= [];

          if (i.job_date_ym >= ym_arr[0] && i.job_date_ym <= ym_arr[11]) {
            acc.request.push(i)
          }

          if (i.final_complete && i.complete_date_ym >= ym_arr[0] && i.complete_date_ym <= ym_arr[11]) {
            acc.compelete.push(i)
          }

          return acc

        }, {});

        rawRequest.value = finale.request
        rawComplete.value = finale.compelete
        allComplete.value = finale.compelete
        //console.log(rawComplete.value[0])

        ymArr.value = ym_arr
      }

      const filter = (arr) => {
        arr ||= []
        const { service, platform, status, worker, over_due, worker_dep, priority } = condInput.value;
        const selectedServices = service.split(',').filter(x => x) || [];
        return [...arr]
          .filter(
            x =>
              x.job_date <= x.today
              && (!selectedServices.length || selectedServices.includes(x.item_type))
              && (!platform || x.platform === platform)
              && (!status || x.worker_status === status)
              && (!worker || x.worker === worker)
              && (!over_due || x.over_due_status === over_due)
              && (!priority || x.pri_code === priority)
              && (!worker_dep || depEmp.value[worker_dep]?.[x.worker?.toString()])
          )
      }

      const filter2 = () => {
        const { service, platform, worker_dep } = condInput.value;
        const selectedServices = service.split(',').filter(x => x) || [];

        const request = [...rawRequest.value || []].filter(x =>
          (!selectedServices.length || selectedServices.includes(x.item_type))
          && (!platform || x.platform === platform)
          && (!worker_dep || depEmp.value[worker_dep]?.[x.worker?.toString()])
        )

        const complete = [...rawComplete.value || []].filter(x =>
          selectedServices.includes(x.item_type)
          && (!platform || x.platform === platform)
          && (!worker_dep || depEmp.value[worker_dep]?.[x.worker?.toString()])
        )

        filterdData2.value = { ym: ymArr.value, request, complete }
      }

      const dofilter = (arr) => {
        $notify.info('Calculating and preparing your results...')
        prepareData(rawData.value)
        prepareData2(rawData2.value)

        filterdData.value = filter(rawData.value)

        filter2()

        listingWorker(filterdData.value)

      }

      const listingWorker = (arr) => {
        const grouper = arr
          .customGroupBy(x => x.worker)
          .map(x => ({ empno: x.key, empname: x.values[0].worker_name, count: x.values.length }))
          .customOrderBy(
            x => ({ desc: x.count }),
            x => ({ asc: x.empname })
          )

        listworker.value = grouper

      }

      watch(() => condInput.value,
        debounce((newVal, oldVal) => {
          dofilter()
        }, 500),
        { deep: true }
      )

      onMounted(async () => {
        reset()
        await loadMaster();
        await loadData();
      })

      return {
        serviceType,
        ci: condInput,
        filterdData,
        listworker,
        props,
        departments,
        priority
      }
    }
  }
</script>

<style>
  .opd-cond {
    margin-bottom: 18px;
    padding: 16px 18px 4px;
    border: 1px solid #e6eaf2;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 1px 1px rgba(29, 43, 83, .03),
                0 22px 42px -34px rgba(29, 43, 83, .65);
    animation: opd-cond-rise .45s cubic-bezier(.22, .85, .3, 1) both;
  }

  .opd-cond .form-group {
    margin-bottom: 13px;
  }

  .opd-cond label {
    display: block;
    margin-bottom: 6px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .09em;
    text-transform: uppercase;
    color: #8a93a8;
  }

  .opd-cond label b {
    font-weight: 700;
  }

  .opd-cond .form-control {
    height: 38px;
    padding: 0 12px;
    border: 1px solid #dfe4ee;
    border-radius: 9px;
    background: #fff;
    box-shadow: none;
    font-size: 12.5px;
    color: #2a3550;
    transition: border-color .16s ease, box-shadow .16s ease;
  }

  .opd-cond select.form-control {
    padding-right: 8px;
  }

  .opd-cond .form-control:hover {
    border-color: #c8d2e2;
  }

  .opd-cond .form-control:focus {
    border-color: #1d2b53;
    box-shadow: 0 0 0 3px rgba(29, 43, 83, .12);
  }

  .opd-cond .mx-datepicker {
    width: 100%;
  }

  .opd-cond .mx-icon-calendar,
  .opd-cond .mx-icon-clear {
    color: #a3adc2;
  }

  @media (min-width: 992px) {
    .opd-cond .row {
      display: flex;
      flex-wrap: wrap;
    }
  }

  @keyframes opd-cond-rise {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .opd-cond {
      animation: none;
    }
  }

  body.dark-mode .opd-cond {
    background: #1a2a3a;
    border-color: #2d4057;
    box-shadow: none;
  }

  body.dark-mode .opd-cond label {
    color: #7f93aa;
  }

  body.dark-mode .opd-cond .form-control {
    background: #16242f;
    border-color: #2d4057;
    color: #c9d1d9;
  }

  body.dark-mode .opd-cond .form-control:hover {
    border-color: #3c6d99;
  }

  body.dark-mode .opd-cond .form-control:focus {
    border-color: #3c6d99;
    box-shadow: 0 0 0 3px rgba(60, 141, 188, .22);
  }
</style>
