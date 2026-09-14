<template>
  <div>
    <re-page ref="page">
      <template  #body>
        <div class="row">
          <div class="col-md-2">
            <label>Test Datepicker</label>
            <datepicker input-class="form-control" v-model="state.test_date"></datepicker>
          </div>
          <div class="col-md-2">
            <label>Test Number</label>
            <number decimals="2" class="form-control" v-model.number="state.test_number"></number>
          </div>
        </div>
      </template>
    </re-page>
  </div>
</template>

<script type="text/javascript">
  import { ref, set, reactive, computed, onMounted, onUpdated, nextTick } from 'vue'
  let page = null
  export default {
    setup(props, { refs, emit, parent, root }) {
      let baseUrl = window.baseUrl

      let state = reactive({
        test_date: moment(),
        test_number: 100000
      })

      onMounted(async () => {
        page = refs.page
        page.setPageTitle('CSM | MG - Empty Composition API')
      })

      return {
        baseUrl,
        state,
      }
    }
  }</script>
