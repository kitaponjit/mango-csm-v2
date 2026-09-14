<template>
  <div>
    <re-page ref="page">
      <template #body>
        <app-form-2 ref="appForm"
                    exportName=""
                    exportSelect="B"
                    exportUrl="csm/master/CustomerServiceExport">
          <template slot="form-detail">
            <div class="box box-widget">
              <div class="box-body">
              
              </div>
            </div>
          </template>
        </app-form-2>
        <input type="file" ref="File" accept=".xls, .xlsx" v-show="false" />
      </template>
    </re-page>
  </div>
</template>

<script type="text/javascript">
  import { mapState } from '~/stores/helpers'
  let page = {}
  export default {
    data() {
      return {
        baseUrl,
        baseRoute,
        queryString,
        ui: window.ui,
        xt: $xt,
        rulename: window.appinfo.rule_name,
        decimals: window.appinfo.decimals || 2,
        dataAction: {
          'create': '',
          'update': '',
          'delete': '',
          'read': '',
          'retrieve': ''
        },
        search: {
          text: ''
        },
        header: {},
        detail: [],
        selectedDetail: {},
        retrieveData: [],
        editMode: false
      }
    },
    methods: {
      /* Method : Components */
      retrieve(data) {

      },
      read(d) {

      },
      reset() {

      },
      beforeSave() {

      },
      beforeDelete() {

      },
    },
    computed: {
      ...mapState(['datatype', 'maincomp'])
    },
    async mounted() {
      page = this.$refs.page
      page.pageTitle = 'Transaction Empty Page Options API'
      document.title = page.pageTitle
      window.page = page

   

      page.loadingBox.show()
      await this.$store.dispatch('findDataType')
      await this.$store.dispatch('findCompany')
      this.reset()
      page.loadingBox.hide()
    }
  }
</script>
