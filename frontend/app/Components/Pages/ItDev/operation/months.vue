<template>
  <div class="box">
    <div class="box-header">
      <h3 class="box-title">Un-finish Cases: Doc Date (Month)</h3>
    </div>
    <div class="box-body" style="height:500px">
      <ECharts :option="optionStatus" :events="[['click',chartClick]]" />
    </div>
  </div>
</template>
<script>
  import { ref, watch } from 'vue';
import { chartClick, createBarOption, debounce, filterdData } from '../databus.js';
  export default {

    setup() {

      const optionStatus = ref({})

      const setColor = (s) => {
        return s > 30 ? '#FF004D' : s > 10 ? '#7E2553' : '#1D2B53';
      }

      const computedData = () => {
        const data = JSON.parse(JSON.stringify(filterdData.value))
        for (let x of data) {
          x.ym = moment(x.job_date).format('YYYY-MM')
        }

        const grouper = data
          .customGroupBy(x => x.ym)
          .map(x => ({
            name: x.key,
            value: x.values.length,
            details: x.values,
            color: setColor(x.values.length)
          }))
          .customOrderBy(x => ({ asc: x.name }))

        //console.log(grouper)

        const finale = createBarOption(grouper)

        optionStatus.value = finale
      }

      watch(() => filterdData.value, debounce((newVal, oldVal) => {
        computedData()
      }, 500), { deep: true })

      return {
        optionStatus,
        chartClick
      }
    }

  }
</script>
