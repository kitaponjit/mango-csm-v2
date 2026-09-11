<template>
  <div>
    <report ref="rpt">
      <template slot="display">
        <table-stick-2 :cellpad="14" :scale="300">
          <table class="table table-bordered table-striped table-hover">
            <thead>
              <tr>
                <th class="tf-3">Customer Code</th>
                <th class="tf-4-5">Customer Name</th>
                <th class="tf-2-5">Item No.</th>
                <th class="tf-4-5">Project</th>
                <th class="tf-3">Warranty Status</th>
                <th class="tf-3-5">Warranty Start Date</th>
                <th class="tf-3-5">Warranty End Date</th>
                <th class="tf-3-5">MA Start Date</th>
                <th class="tf-3-5">MA End Date</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="x in display">
                <!--<tr class="text-navy" style="background-color:#e8e8e8;">
                  <td colspan="9"><h6>({{x.customer_code}}) {{x.customer_name}}</h6></td>
                </tr>-->
                <tr v-for="(z, index) in x.detail">
                  <td align="center" class="text-bold">{{x.customer_code}}</td>
                  <td align="center" class="text-bold">{{x.customer_name}}</td>
                  <td align="center" class="text-bold">{{z.itemno}}</td>
                  <td>{{z.pre_des}}</td>
                  <td align="center" :class="statusClass('text-', z.status)">{{z.status}}</td>
                  <td align="center">{{z.warst_date | date('DD/MM/YYYY')}}</td>
                  <td align="center">{{z.warend_date | date('DD/MM/YYYY')}}</td>
                  <td align="center">{{z.mast_date | date('DD/MM/YYYY')}}</td>
                  <td align="center">{{z.maend_date | date('DD/MM/YYYY')}}</td>
                </tr>

              </template>
            </tbody>
          </table>
        </table-stick-2>
      </template>
    </report>
    <vue-project-list ref="project" @send-data="projectSelect($event)"></vue-project-list>
    <vue-project2-list ref="ct_project2" @send-data="projectSelect($event)"></vue-project2-list>
    <vue-ar-customer-list ref="customer" @send-data="customerSelect($event)"></vue-ar-customer-list>
  </div>
</template>
<script>
  import report from '../../center/report-condition.vue'

  let rpt = {};
  let condTemplate = [];

  condTemplate.push({
    field_name: 'customer_code',
    display_name: 'Customer',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'or', //and or,
    func_name: 'openCustomerModal',
  });

  condTemplate.push({
    field_name: 'pre_event',
    display_name: 'Project',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: 'openProjectModal',
  });

  
  condTemplate.push({
    field_name: 'warst_date',
    display_name: 'Warranty Start Date',
    field_type: 'date', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '>=',
    value_arr: null, //empty or null for textbox
    value_default: moment().format('DD/MM/YYYY'),
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: '',
  });

  condTemplate.push({
    field_name: 'warend_date',
    display_name: 'Warranty End Date',
    field_type: 'date', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '>=',
    value_arr: null, //empty or null for textbox
    value_default: moment().format('DD/MM/YYYY'),
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: '',
  });

  
  condTemplate.push({
    field_name: 'mast_date',
    display_name: 'MA Start Date',
    field_type: 'date', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '>=',
    value_arr: null, //empty or null for textbox
    value_default: moment().format('DD/MM/YYYY'),
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: '',
  });

  condTemplate.push({
    field_name: 'maend_date',
    display_name: 'MA End Date',
    field_type: 'date', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['=', '>=', '<='],
    operatorx_default: '>=',
    value_arr: null, //empty or null for textbox
    value_default: moment().format('DD/MM/YYYY'),
    multiple: true, //true,
    multiple_type: 'and', //and or,
    func_name: '',
  });

  condTemplate.push({
    field_name: 'status',
    display_name: 'สถานะ Y/N',
    field_type: 'string', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'or', //and or,
    func_name: '',
  });

  let vue = {
    data() {
      return {
        baseUrl,
        condTemplate,
        display: [],
        height: 0
      }
    },
    components: {
      report
    },
    methods: {
      async setRptData(d, cond) {
        this.$set(this, "display", d)
      },
      action1() {
        rpt.setRowData(value, displayValue)
      },
      openProjectModal() {
        this.$refs.ct_project2.openModal();
      },
      openCustomerModal() {
        this.$refs.customer.openModal();
      },
      employeeSelect(e) {
        rpt.setRowData(e.empno, e.empfullname_t)
      },
      projectSelect(e) {
        rpt.setRowData(e.pre_event, e.pre_des)
      },
      customerSelect(e) {
        rpt.setRowData(e.customer_code, e.customer_name)
      },
      statusClass(prefix, status) {
        return status == 'Y' ? prefix + 'success' : prefix + 'danger';
      },
    },
    mounted() {
      rpt = this.$refs.rpt
      rpt.setTitle('Warranty')
      rpt.setTemplate(this.condTemplate)

      let defaultCond = [
        { field_name: 'customer_code', operatorx: '=', value: '', not_remove: false },
      ];
      rpt.setDefaultCond(defaultCond);

      rpt.dataUrl = `CSM/Report/v_csm_war_rpt02`;
    }
  }
  export default vue
</script>
