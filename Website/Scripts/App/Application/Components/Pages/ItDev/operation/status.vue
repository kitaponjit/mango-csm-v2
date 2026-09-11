<template>
  <div class="box">
    <div class="box-header">
      <h3 class="box-title">Cases / Status</h3>
    </div>
    <div class="box-body" style="height:500px">
      <ECharts :option="optionStatus" :events="[['click',chartClick]]" />
    </div>
  </div>
</template>
<script>
  import { ref, watch } from '@vue/composition-api';
import { chartClick, createBarOption, debounce, filterdData, statusCodeData } from '../databus.js';
  export default {

    setup() {

      const optionStatus = ref({})

      const sortOrder = statusCodeData.reduce((acc, i, idx) => {
        acc[i.id] = idx
        return acc
      }, {});

      const setColor = (s) => {
        return ['W', 'H', 'I', 'B'].includes(s) ? '#7E2553' : '#1D2B53'
      }

      const computedData = () => {
        const data = JSON.parse(JSON.stringify(filterdData.value))

        //console.log(data)

        const grouper = data
          .customGroupBy(x => x.status)
          .map(x => ({
            name: x.values[0].status_name || x.key,
            value: x.values.length,
            details: x.values,
            sortOrder: sortOrder[x.key] ?? 99,
            color: setColor(x.key)
          }))
          .customOrderBy(x => ({ asc: x.sortOrder }))

        const comp1 = [
          ...[{ name: 'ALL', value: data.length, details: data, color: '#FF004D' }],
          ...grouper
        ]

        const finale = createBarOption(comp1)

        optionStatus.value = finale

        //console.log(finale)
      }

      watch(() => filterdData.value, debounce((newVal, oldVal) => {
        computedData()
        //console.log(`Data Change`)
      }, 500), { deep: true })

      return {
        optionStatus,
        chartClick
      }
    }

  }
</script>
