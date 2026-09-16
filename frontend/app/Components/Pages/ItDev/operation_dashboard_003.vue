<template>
  <div>
    <Layout>
      <template #maincontent>
        <table class="table table-bordered table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>TASK</th>
              <th>PATH</th>
              <th>WORKERS</th>
              <th>START</th>
              <th>DURATION</th>
              <th>DUE</th>
              <th>OVERDUE</th>
              <th>PLAN %</th>
              <th>PROGRESS %</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody v-for="x in finaleData">
            <tr>
              <td colspan="10">
                <h4>{{x.empfullname_t}} ({{x.data.length}})</h4>
                <span>{{x.department}}</span>
                <!--<template v-for="(y,z) in statusNameNew" :key="z">
                  <span v-if="x.count[z]">-->
                  <!--({{statusNameNew[z]}} : {{x.count[z]}}) &nbsp;-->
                  <!--</span>
                </template>-->
              </td>
              <td class="text-center">
                <a href="#" @click.prevent="toggleTable(x)">
                  <span v-if="!x._expland">Expland</span><span v-else>Hide</span>
                </a>
              </td>
            </tr>
            <template v-if="x._expland">
              <tr v-for="y,idy in x.data">
                <td class="text-right">{{idy+1}}</td>
                <td>{{y.taskname}}</td>
                <td>{{y.path}}</td>
                <td v-html="y.workers.join('<br />')" class="text-nowrap"></td>
                <td>{{y.start_date.slice(0,10)}}</td>
                <td>{{y.end_date.slice(0,10)}}</td>
                <td class="text-right">{{y.duration}}</td>
                <td class="text-right">{{y.over_due_days}}</td>

                <td class="text-right">{{numberFormat(y.plan_per||0,2)}}%</td>
                <td class="text-right">{{numberFormat(y.progress_per||0,2)}}%</td>
                <td :class="['text-center']">{{statusNameNew[y.status_new]}}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </template>
    </Layout>
  </div>
</template>
<script>
  import { onMounted, ref } from 'vue';
import * as mathjs from 'mathjs';
import Layout from './dashboard_layout.vue';
import { dummy } from './databus.js';
import PPN from './ppn_tasks.js';

  dummy();

  document.title = `PPN TASK BACKLOG`

  export default {
    components: {
      Layout
    },
    setup() {
      //console.log(window.auth)
      const maincode = ref(window.auth?.maincode || 'MG1')
      const pre_event = ref('00002025')
      const finaleData = ref([])

      const toggleTable = (x) => {
        x._expland = x._expland ? 0 : 1
      }

      const numberFormat = (n, p) => (mathjs.isNaN(n) ? n :
        mathjs.format(n, { notation: 'fixed', precision: p })
          .split('.')
          .map((x, idx) => idx === 0 ? parseInt(x).toLocaleString('en-US') : x)
          .join('.'));

      const processData = async () => {

        const ppnInst = new PPN({
          maincode: maincode.value,
          pre_event: pre_event.value
        });

        await ppnInst.reloadData();
        let data = ppnInst.getProcessedData();
        const employee = ppnInst.getEmployee();

        const isDevEmp = empno => ['013', '002'].includes(employee[empno?.toString()]?.dpt_code);

        const RE = /^CSM-\d{10,}-\d+$/;

        data = data.filter(f =>
          f.workers.length &&
          f.workers.some(s => isDevEmp(s.empno)) &&
          f.status !== 'completed' &&
          f.start_date >= '2025-08-00' &&
          f.csm_no?.startsWith('CSM-') &&
          RE.test(f.csm_no)
        );

        for (const x of data) {

          for (const emp of x.workers) {
            const user_tasks = (employee[emp.empno].tasks ||= []);
            user_tasks.push(x.taskid)
          }

          x.workers_dev = x.workers
            .filter(s => isDevEmp(s.empno))
            .customOrderBy(o => ({ asc: o.emp_name }));
        }

        const empNoTask = Object.keys(employee)
          .filter(f => {
            const { formatted_name, empresign, tasks = [] } = (employee[f] || {});
            return formatted_name &&
              empresign !== 'Y' &&
              isDevEmp(f) &&
              tasks.length === 0 &&
              f !== '497'
          })
          .map(m => employee[m])
          .customOrderBy(
            o => ({ asc: o.dpt_code }),
            o => ({ asc: o.formatted_name })
          );

        console.log(data)
        //console.log(employee)
        console.log(empNoTask)
      }

      onMounted(async () => {
        processData()
      })

      return {
        finaleData,
        numberFormat,
        toggleTable,
        statusNameNew: {}
      }
    }
  }
</script>
