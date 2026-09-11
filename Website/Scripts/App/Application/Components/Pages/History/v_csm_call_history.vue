<template>
  <div>
    <report ref="rpt">
      <template slot="display">
        <div>
          <table-stick height="500px"> 
            <table class="table table-bordered table-hover">
              <thead>
                <tr>
                  <th class="tf-2">No.</th>
                  <th>Employee</th>
                  <th>Customer</th>
                  <th class="tf-3-5">Telephone</th>
                  <th class="tf-3-5 text-center">Income Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="x,idx in display">
                  <td align="center" class="text-bold">{{idx+1}}.</td>
                  <td>{{x.empfullname_t}}</td>
                  <td>{{x.customer_name}}</td>
                  <td>{{x.telephone}}</td>
                  <td align="center" class="text-bold">{{x.income_dt | date('DD/MM/YYYY HH:mm')}}</td>
                </tr>
              </tbody>
            </table>
          </table-stick>
        </div>
      </template>
    </report>
    <ModalEMP ref="employee" @send-data="employeeSelect($event)"></ModalEMP>
  </div>
</template>
<script>
  import report from '../../center/report-condition.vue'

  let rpt = {};

  let condTemplate = [];

  condTemplate.push({
    field_name: 'income_dt',
    display_name: 'Income Date',
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
    field_name: 'empcode',
    display_name: 'Employee',
    field_type: 'int', //int, decimal, boolean
    field_group: 'search',
    operatorx_arr: ['='],
    operatorx_default: '=',
    value_arr: [], //empty or null for textbox
    value_default: '',
    multiple: true, //true,
    multiple_type: 'or', //and or,
    func_name: 'openEmployeeModal'
  });

  let vue = {
    data() {
      return {
        condTemplate,
        display: [],
      }
    },
    components: {
      report
    },
    methods: {
      async setRptData(d, cond) {
        this.$set(this, "display", d);
      },
      openEmployeeModal() {
        this.$refs.employee.openModal();
      },
      employeeSelect(e) {
        rpt.setRowData(e.empno, e.empfullname_t)
      },
    },
    mounted() {
      rpt = this.$refs.rpt;
      rpt.setTitle('รายการประวัติการโทรเข้าทั้งหมด');
      rpt.setTemplate(this.condTemplate);

      let defaultCond = [
        { field_name: 'income_dt', operatorx: '>=', value: new Date(new Date().getFullYear(), new Date().getMonth(), 1), not_remove: false },
        { field_name: 'income_dt', operatorx: '<=', value: new Date(), not_remove: false },
      ];
      rpt.setDefaultCond(defaultCond);

      rpt.dataUrl = `CSM/Report/v_csm_call_history`;
    }
  }
  export default vue
</script>
