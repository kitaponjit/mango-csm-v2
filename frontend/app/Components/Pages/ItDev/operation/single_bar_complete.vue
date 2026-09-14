<template>
  <div class="box">
    <div class="box-header">
      <h3 class="box-title">{{props.title||''}}</h3>
    </div>
    <div class="box-body" style="height:500px">
      <ECharts :option="optionStatus" :events="[['click',chartClick]]" />
    </div>
  </div>
</template>
<script>
  import { onMounted, ref, watch } from 'vue';
import { chartClick, createBarOption, debounce, filterdData2 } from '../databus.js';
  export default {
    props: {
      title: String,
      groupBy: String,
      color: String,
      dataMode: String,
      overDueFilter: String,
      sum: String
    },
    setup(props) {

      const customTitle = ref('')

      const optionStatus = ref({})

      const setColor = (s) => {
        return props.color;
      }

      const computedData = () => {
        const data = JSON.parse(JSON.stringify(filterdData2.value))
        const lastYM = data.ym.at(-1)
        //console.log(lastYM)
        //console.log(data)

        const mode = props.dataMode || 'complete';

        const computeValue = ({ sum_days, max_days, count }) => {
          if (props.sum === 'day') return sum_days;
          else if (props.sum === 'maxday') return max_days;
          else return count;
        }

        //console.log(mode)
        const grouper = data[mode]
          .filter(x => mode === 'complete' ? x.complete_date_ym === lastYM : x.job_date_ym === lastYM)
          .filter(x => !props.overDueFilter || x.over_due_status === props.overDueFilter)
          .customGroupBy(x => x[props.groupBy || ''] || '')
          .map(x => {
            const sum_days = x.values.reduce((acc, i) => (acc + (i.over_due || 0)), 0);
            const max_days = x.values.reduce((acc, i) => (acc > (i.over_due || 0) ? acc : (i.over_due || 0)), 0);
            const value = computeValue({ sum_days, max_days, count: x.values.length });
            return {
              name: x.key,
              value,
              details: x.values,
              color: x.key === 'OVERDUE' ? 'red' : setColor(value)
            }
          })
          .customOrderBy(x => ({ desc: x.value }), x => ({ asc: x.name }));

        //console.log(grouper)

        const finale = createBarOption(grouper)

        optionStatus.value = finale
      }

      onMounted(() => {

        customTitle.value = props.title
        console.log(customTitle.value)
      })

      watch(() => filterdData2.value, debounce((newVal, oldVal) => {
        computedData()
      }, 500), { deep: true })

      watch(() => props.title, (newVal, oldVal) => {
        customTitle.value = newVal
        console.log(customTitle.value)
      })

      return {
        optionStatus,
        chartClick,
        customTitle,
        props
      }
    }
  }
</script>
