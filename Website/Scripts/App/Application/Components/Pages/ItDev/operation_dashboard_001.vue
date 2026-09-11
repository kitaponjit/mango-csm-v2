<template>
  <div>
    <Layout>
      <template #maincontent>
        <DashboardCondition condSet="001"></DashboardCondition>
        <div class="row">
          <div class="col-md-6">
            <StatusChart></StatusChart>
          </div>
          <div class="col-md-6">
            <WorkingDaysChart></WorkingDaysChart>
          </div>
          <div class="col-md-6">
            <MonthChart></MonthChart>
          </div>
          <div class="col-md-6">
            <OverDueChart></OverDueChart>
          </div>
          <div class="col-md-6">
            <SingleBarChart title="Un-finish Cases: Priority" groupBy="pri_name"></SingleBarChart>
          </div>
          <div class="col-md-6">
            <SingleBarChart title="Un-finish Cases: Module" groupBy="module"></SingleBarChart>
          </div>
          <div class="col-md-6">
            <SingleBarChart title="Un-finish Cases: Platform" groupBy="platform"></SingleBarChart>
          </div>
          <div class="col-md-12">
            <SingleBarChart title="Un-finish Cases: Worker" groupBy="worker_name"></SingleBarChart>
          </div>
          <div class="col-md-12">
            <SingleBarChart title="Un-finish Cases: Requester" groupBy="request_name"></SingleBarChart>
          </div>
          <div class="col-md-12">
            <SingleBarChart title="Un-finish Cases: TOP 10 Requester" groupBy="request_name" limit="10"></SingleBarChart>
          </div>
          <div class="col-md-12">
            <SingleBarChart title="Un-finish Cases: Tester" groupBy="tester_empname"></SingleBarChart>
          </div>
          <div class="col-md-12">
            <SingleBarChart title="Un-finish Cases: Customer" groupBy="customer" height="850px"></SingleBarChart>
          </div>
          <!--<div class="col-md-6">
            <SingleBarChart title="Over Due Days: Module" groupBy="module" :overDueDays="true"></SingleBarChart>
          </div>
          <div class="col-md-6">
            <SingleBarChart title="Over Due Days: Platform" groupBy="platform" :overDueDays="true"></SingleBarChart>
          </div>
          <div class="col-md-12">
            <SingleBarChart title="Over Due Days: Worker" groupBy="worker_name" :overDueDays="true"></SingleBarChart>
          </div>
          <div class="col-md-12">
            <SingleBarChart title="Over Due Days: Requester" groupBy="request_name" :overDueDays="true"></SingleBarChart>
          </div>-->
        </div>
      </template>
    </Layout>
  </div>
</template>
<script>
  import { onMounted } from '@vue/composition-api'
  import DashboardCondition from './dashboard_condition.vue'
  import Layout from './dashboard_layout.vue'
  import MonthChart from './operation/months.vue'
  import OverDueChart from './operation/over_due.vue'
  import SingleBarChart from './operation/single_bar.vue'
  import SingleBarCompleteChart from './operation/single_bar_complete.vue'
  import StatusChart from './operation/status.vue'
  import WorkingDaysChart from './operation/working_days.vue'
  import TicketsChart from './operation/tickets.vue'


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
      SingleBarCompleteChart
    },
    setup() {

      onMounted(() => {
        document.title = `Operation Dashboard`
      })

      return {

      }
    }
  }
</script>
