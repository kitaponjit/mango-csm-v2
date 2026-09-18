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
  import { ref, reactive, computed, onMounted, onUpdated, nextTick } from 'vue'
  let page = null
  export default {
    setup(props, { emit }) {
      // Vue 3's setup context has no `refs` (Vue 2's composition-api plugin had
      // one), so every `refs.x` below threw "Cannot read properties of undefined".
      // The template refs are declared here and returned under their template
      // names; `refs` reads them, so the code below is unchanged.
      const pageRef = ref(null)
      const refs = { get page() { return pageRef.value } }
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
        page: pageRef,
        baseUrl,
        state,
      }
    }
  }</script>
