<template>
  <div class="box">
    <div class="box-header">
      <h3 class="box-title">Un-finish Cases: Working Days (Doc Date)</h3>
    </div>
    <div class="box-body" style="height:500px">
      <ECharts :option="optionStatus" :events="[['click',chartClick]]" />
    </div>
  </div>
</template>
<script>
  import { ref, watch } from '@vue/composition-api';
import { chartClick, createBarOption, debounce, filterdData } from '../databus.js';
  export default {

    setup() {

      const optionStatus = ref({})

      const workingdaysLabel = {
        '003': '<=3',
        '007': '>3 & <=7',
        '015': '>7 & <=15',
        '030': '>15 & <=30',
        '060': '>30 & <=60',
        '090': '>60 & <=90',
        '120': '>90 & <=120',
        '10000000': '>120',
      }

      const setColor = (s) => {
        if (s <= 7) return '#1D2B53';
        if (s <= 30) return '#7E2553';
        return '#FF004D';
      };

      const computedData = () => {
        let data = JSON.parse(JSON.stringify(filterdData.value))
        data = data.customOrderBy(x => ({ asc: x.diff }));
        const keys = Object.keys(workingdaysLabel)
          .customOrderBy(y => ({ asc: parseInt(y) }));

        for (let x of data) {
          const key = keys.find(y => x.diff <= parseInt(y))
          const label = workingdaysLabel[key]
          x.wd_label = label
          x.sortOrder = parseInt(key)
        }

        const grouper = data
          .customGroupBy(x => x.wd_label)
          .map(x => ({
            name: x.values[0].wd_label || x.key,
            value: x.values.length,
            details: x.values
          }))

        const comp1 = Object.keys(workingdaysLabel)
          .customOrderBy(y => ({ asc: parseInt(y) }))
          .map(m => {
            let name = workingdaysLabel[m]
            let { value = 0, details = [] }
              = grouper.find(z => z.name === name) || {};
            let color = setColor(parseInt(m))
            return { name, value, details, color }
          });

        const finale = createBarOption(comp1)

        optionStatus.value = finale
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
