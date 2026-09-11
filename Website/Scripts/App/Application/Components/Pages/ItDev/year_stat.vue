<template>
  <div>

    <!--<div class="table-responsive">
      <table class="table">
        <thead>

          <tr>
            <th>Name</th>
            <th class="text-nowrap" v-for="x in services" colspan="4">{{x}}</th>
            <th></th>
          </tr>
          <tr>
            <th>&nbsp;</th>
            <template v-for="x in services">
              <th class="text-nowrap">Count</th>
              <th class="text-nowrap">On-Time</th>
              <th class="text-nowrap">Overdue</th>
              <th class="text-nowrap">Overdue %</th>
            </template>
            <th>Total CSM</th>
          </tr>

        </thead>
        <tbody>
          <tr v-for="x in (data||[])">
            <td class="text-nowrap">{{x.name}}</td>
            <template v-for="y in services">
              <td>{{(x.csm_document[y]||{}).count}}</td>
              <td>{{(x.csm_document[y]||{}).ontime}}</td>
              <td>{{(x.csm_document[y]||{}).overdue}}</td>
              <td>{{(x.csm_document[y]||{}).overdue_per}}</td>
            </template>
            <td>{{x.total_csm}}</td>
          </tr>
        </tbody>
      </table>
    </div>-->

    <div>{{services}} {{ (data||[])}}</div>
  </div>
</template>
<script>
  import { ref, watch } from '@vue/composition-api';
import { allComplete, debounce, depEmp } from './databus.js';
  export default {

    setup() {
      const data = ref([])
      const emp = ref({})
      const services = ref([])

      watch(() => allComplete.value, debounce((newVal, oldVal) => {
        const dep = ['ฝ่ายพัฒนาโปรแกรม (SOFTWARE DEVELOPMENT)', 'ฝ่ายวิเคราะห์ระบบ (SYSTEM ANALYSIS)']
        emp.value = dep.reduce((o, i) => {
          Object.keys(depEmp.value[i]).forEach(x => {
            o[x] = depEmp.value[i]?.[x]?.empfullname_t
          })
          return o
        }, {})

        console.log(emp.value)


        const rows = [
          [406, 33], [154, 63], [555, 1], [335, 10], [309, 17], [478, 9], [357, 251], [253, 203], [551, 9],
          [423, 19], [320, 63], [139, 4], [356, 136], [240, 4], [512, 47], [511, 3], [221, 106], [307, 9],
          [552, 1], [417, 49], [429, 7], [341, 41], [412, 376], [509, 10], [310, 139], [350, 23], [408, 75],
          [187, 6], [254, 300], [246, 38], [484, 200], [202, 45], [539, 146], [199, 108], [426, 5], [174, 75],
          [481, 53], [507, 173], [334, 1], [207, 15], [172, 2], [525, 123], [331, 25], [444, 6], [524, 20],
          [230, 24], [479, 1], [257, 10], [468, 25], [560, 65], [521, 16], [212, 25], [477, 1], [180, 2],
          [498, 20], [556, 5], [418, 46], [351, 19], [553, 22], [167, 92], [447, 35], [323, 26], [236, 4],
          [371, 15], [121, 18], [354, 66], [559, 2], [316, 16], [358, 140], [382, 17], [223, 71], [517, 695],
          [342, 112], [385, 4], [476, 163], [324, 70], [529, 49], [471, 24], [436, 59], [495, 17], [538, 3],
          [534, 38], [490, 6], [251, 315], [384, 30], [454, 131], [138, 44], [526, 3], [267, 231], [337, 141],
          [153, 4], [475, 10], [545, 1], [510, 194], [259, 51], [258, 15], [185, 3], [144, 39], [483, 156],
          [561, 143], [160, 14], [413, 42], [535, 9], [470, 49], [504, 72], [349, 74]
        ];

        const update_progress = $linq(rows.map(x => {
          return { name: emp.value[x[0].toString()], work_progress_update_times_last_4_months_all_jobs: x[1] }
        }).filter(x => x.name)).orderBy(x => x.name).toArray();

        console.log(JSON.stringify(update_progress))

        const _d = JSON.parse(JSON.stringify(newVal || []))
          .filter(x => emp.value[x.worker?.toString()])

        console.log(_d.length, _d[0])

       
        const _serv = {}
        const _g = $linq(_d)
          .groupBy(x => x.worker_name)
          .select(({ key, values }) => {

            const jobs_completed_year2025 = values.reduce((acc, i) => {
              acc[i.serv_name] ??= {}
              acc[i.serv_name].count ??= 0;
              acc[i.serv_name].count++;

              _serv[i.serv_name]=1

              if (i.due_date < (i.send_pretest_dt ?? i.send_pretest_to_tester_dt ?? i.complete_date)) {
                acc[i.serv_name].overdue ??= 0;
                acc[i.serv_name].overdue++

              } else {
                acc[i.serv_name].ontime ??= 0;
                acc[i.serv_name].ontime++
              }
              return acc
            }, {})
            
            return { name: key, total_jobs_completed_year2025: values.length, jobs_completed_year2025 }
          })
          .orderBy(x => x.name)
          .toArray()

        _g.forEach(x => {
          const doc = x.jobs_completed_year2025;
          Object.keys(doc).forEach(y => {
            const s = doc[y];
            if (s?.overdue) {
              s.overdue_per = $xt.dec(s.overdue / s.count * 100, 2);
            }
          })
        })

        data.value = _g;


        services.value = $linq(Object.keys(_serv)).orderBy(x => x).toArray();
      }, 500), { deep: true })

      return {
        data,
        depEmp,
        services
      }
    }
  }
</script>
