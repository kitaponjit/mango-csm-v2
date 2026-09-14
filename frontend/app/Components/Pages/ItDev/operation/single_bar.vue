<template>
  <div class="box">
    <div class="box-header">
      <h3 class="box-title">{{props.title||''}}</h3>
    </div>
    <div class="box-body" :style="{height:props.height||'500px'}">
      <ECharts :option="optionStatus" :events="[['click',chartClick]]" />
    </div>
  </div>
</template>
<script>
  import { onMounted, ref, watch } from 'vue';
import { chartClick, createBarOption, debounce, filterdData } from '../databus.js';
  export default {
    props: {
      title: String,
      groupBy: String,
      overDueDays: Boolean,
      overDueMean: Boolean,
      height: String,
      limit: Number
    },
    setup(props) {

      const customTitle = ref('')

      const optionStatus = ref({})

      const setColor = (s) => {
        if (s > 30) return '#FF004D';
        if (s > 10) return '#7E2553';
        return '#1D2B53';
      };

      const sumOverDue = (arr) => {
        return arr.reduce((acc, i) => acc + i.over_due, 0) || 0;
      }

      const computedData = () => {
        const data = JSON.parse(JSON.stringify(filterdData.value))
        const overDuefilter = props.overDueMean || props.overDueDays;

        let grouper = data
          .filter(x => !overDuefilter || x.over_due > 0)
          .customGroupBy(x => x[props.groupBy || ''] || '')
          .map(x => {

            let value;

            if (props.overDueMean) {
              value = new Decimal(sumOverDue(x.values) / x.values.length)
                .toDP(0)
                .toNumber();
            } else if (props.overDueDays) {
              value = sumOverDue(x.values);
            } else {
              value = x.values.length;
            }

            const name = x.key;
            const details = x.values;
            const color = setColor(value);

            return {
              name,
              value,
              details,
              color
            }
          })
          .customOrderBy(x => ({ desc: x.value }), x => ({ asc: x.name }));

        const limitD = parseInt(props.limit)
        if (!isNaN(limitD) && limitD > 0) {
          grouper = grouper.slice(0, limitD)
        }

        const finale = createBarOption(grouper);
        
 

        optionStatus.value = finale;
      }

      onMounted(() => {
        customTitle.value = props.title;
        //console.log(customTitle.value)
      })

      watch(() => filterdData.value, debounce((newVal, oldVal) => {
        computedData()
      }, 500), { deep: true })

      watch(() => props.title, (newVal, oldVal) => {
        customTitle.value = newVal
        //console.log(customTitle.value)
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
