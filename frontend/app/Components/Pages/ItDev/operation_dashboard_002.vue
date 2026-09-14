<template>
  <div>
    <Layout>
      <template #maincontent>
        <DashboardCondition condSet="002"></DashboardCondition>
        <!--<div class="row">
          <div class="col-md-12">
            <YearStat></YearStat>
          </div>
        </div>-->
        <div class="row">
          <div class="col-md-6">
            <TicketsChart></TicketsChart>
          </div>
          <div class="col-md-6">
            <SingleBarCompleteChart title="Completed Tasks: Module" groupBy="module" dataMode="complete" color="green"></SingleBarCompleteChart>
          </div>
          <div class="col-md-6">
            <SingleBarCompleteChart title="Completed Tasks: Platform" groupBy="platform" dataMode="complete" color="green"></SingleBarCompleteChart>
          </div>
          <div class="col-md-6">
            <SingleBarCompleteChart title="Completed Tasks: ON TIME STATUS" groupBy="over_due_status" dataMode="complete" color="green"></SingleBarCompleteChart>
          </div>
          <div class="col-md-6">
            <SingleBarCompleteChart title="Completed Tasks: OVERDUE BY MODULE" groupBy="module" dataMode="complete" color="red" overDueFilter="OVERDUE"></SingleBarCompleteChart>
          </div>
          <!--<div class="col-md-6">
            <SingleBarCompleteChart title="Completed Tasks: OVERDUE BY MODULE (DAYS)" groupBy="module" dataMode="complete" color="red" overDueFilter="OVERDUE" sum="day"></SingleBarCompleteChart>
          </div>
          <div class="col-md-6">
            <SingleBarCompleteChart title="Completed Tasks: OVERDUE BY MODULE (MAX DAYS)" groupBy="module" dataMode="complete" color="red" overDueFilter="OVERDUE" sum="maxday"></SingleBarCompleteChart>
          </div>-->

          <div class="col-md-6">
            <SingleBarCompleteChart title="Completed Tasks: ON TIME BY MODULE" groupBy="module" dataMode="complete" color="green" overDueFilter="ON TIME"></SingleBarCompleteChart>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <SingleBarCompleteChart title="Requested Tasks: Module" groupBy="module" dataMode="request" color="blue"></SingleBarCompleteChart>
          </div>
          <div class="col-md-6">
            <SingleBarCompleteChart title="Requested Tasks: Platform" groupBy="platform" dataMode="request" color="blue"></SingleBarCompleteChart>
          </div>
        </div>
        <div class="row" v-show="false">
          <div class="col-md-12">
            <button class="btn btn-secondary" @click="downloadNormalizedJSON()">Download Normalized JSON Requested Tikets</button><br /><br />
          </div>
        </div>

      </template>
    </Layout>
  </div>
</template>
<script>
  import { onMounted } from 'vue'
import DashboardCondition from './dashboard_condition.vue'
import Layout from './dashboard_layout.vue'
  import { filterdData2, allComplete } from './databus.js'
import MonthChart from './operation/months.vue'
import OverDueChart from './operation/over_due.vue'
import SingleBarChart from './operation/single_bar.vue'
import SingleBarCompleteChart from './operation/single_bar_complete.vue'
import StatusChart from './operation/status.vue'
import TicketsChart from './operation/tickets.vue'
  import WorkingDaysChart from './operation/working_days.vue'
import YearStat from './year_stat.vue'

  export default {
    components: {
      Layout,
      DashboardCondition,
      StatusChart,
      WorkingDaysChart,
      OverDueChart,
      MonthChart,
      SingleBarChart,
      TicketsChart,
      SingleBarCompleteChart,
      YearStat
    },
    setup() {

      const downloadNormalizedJSON = () => {
        console.log(filterdData2.value?.request?.[0])
      }

      onMounted(() => {
        document.title = `Operation Dashboard`
      })

      return {
        downloadNormalizedJSON
      }
    }
  }</script>
