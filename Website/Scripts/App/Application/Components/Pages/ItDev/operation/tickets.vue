<template>
  <div class="box">
    <div class="box-header">
      <h3 class="box-title">12 Months Tickets (Request/Complete)</h3>
    </div>
    <div class="box-body" style="height:500px">
      <ECharts :option="optionsChart" :events="[['click',chartClick]]" />
    </div>
  </div>
</template>
<script>
  import { ref, watch } from '@vue/composition-api';
import { chartClick, createBarOption2, debounce, filterdData2 } from '../databus.js';
  export default {
    setup(props) {

      const optionsChart = ref({})

      const computedData = () => {
        const { ym = [], request = [], complete = [] } = JSON.parse(JSON.stringify(filterdData2.value))
        /*console.log({ ym, request, complete })*/

        const requestMap = request
          .reduce((acc, i) => {
            acc[i.job_date_ym] ||= [];
            acc[i.job_date_ym].push(i)
            return acc
          }, {});

        const completeMap = complete
          .reduce((acc, i) => {
            acc[i.complete_date_ym] ||= [];
            acc[i.complete_date_ym].push(i)
            return acc
          }, {});

        const requestFinale = ym.map(x => {
          const m = requestMap[x] || []
          return { value: m.length, details: m, color: 'blue' }
        })

        const completeFinale = ym.map(x => {
          const m = completeMap[x] || []
          return { value: m.length, details: m, color: 'green' }
        })

        //console.log(requestFinale)
        //console.log(completeFinale)
        const finale = [
          { name: 'Requested', data: requestFinale },
          { name: 'Complete', data: completeFinale }
        ]

        const finale2 = createBarOption2(finale, ym)
        //console.log(finale2)

        optionsChart.value = finale2
      }

      watch(() => filterdData2.value, debounce((newVal, oldVal) => {
        computedData()
      }, 500), { deep: true })

      return {
        chartClick,
        optionsChart
      }
    }
  }
</script>
