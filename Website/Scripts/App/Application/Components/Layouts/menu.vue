<template>
  <div>
    <ul class="sidebar-menu tree" data-widget="tree">
      <li>
        <a :href="`${baseUrl}page/`">
          <img :src="`${baseUrl}Content/Images/Icon SVG/home.svg`" width="20" />&nbsp;
          <span>{{ ui.csm_menu_home }}</span>
        </a>
      </li>
      <li v-for="(item, i) in menu"
          :key="`m-${i}`"
          :class="{ treeview: item.children.length > 0 && !item.disabled }">
        <a v-if="item.show"
           :href="item.link || '#'"
           :class="{ link_disabled: item.disabled }"
           @click="canGo($event, item.disabled)"
           target="_blank">
          <img :src="`${baseUrl}Content/Images/Icon SVG/${item.icon}.svg`" width="20" />&nbsp;
          <span>{{ item.display_text }}</span>
          <span v-if="item.children.length > 0" class="pull-right">
            <i class="fa fa-angle-left pull-right"></i>
          </span>
        </a>
        <ul v-if="item.children.length > 0 && !item.disabled" class="treeview-menu">
          <li v-for="(child, j) in item.children"
              :key="`c-${i}-${j}`"
              :class="{ treeview: child.children.length > 0 && !child.disabled }">
            <a v-if="child.show"
               :href="child.link || '#'"
               :class="{ link_disabled: child.disabled }"
               @click="canGo($event, child.disabled)">
              <i :class="child.children.length > 0 || child.forceIcon ? 'fas fa-circle' : 'far fa-circle'"></i>
              <span>{{ child.display_text }}</span>
            </a>
            <ul v-if="child.children.length > 0 && !child.disabled" class="treeview-menu">
              <!-- <li v-for="(sub, k) in child.children" :key="sub.menu_id || `s-${i}-${j}-${k}`"> -->
              <li v-for="(sub, k) in child.children" :key="`s-${i}-${j}-${k}`">
                <a v-if="sub.show" :href="sub.link || '#'" @click="canGo($event, sub.disabled)">
                  <i class="far fa-circle"></i> {{ sub.display_text }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        auth,
        menu: [],
        baseUrl: window.baseUrl,
        ui: window.ui,
        xt: $xt,
      };
    },

    computed: {
      configData() {
        return store.state.configData;
      },
    },

    methods: {
      isDeveloper() {
        return this.auth.empcode.substring(0, 2) === 'IT';
      },

      isShowReport() {
        return this.isDeveloper() || ['AD007', 'AD004'].includes(this.auth.empcode);
      },

      isMango() {
        const val = $linq(this.configData).where(x => x.config_id === 'TRN0001').select(x => x.config_value).firstOrDefault();
        return val === 'Y';
      },

      isAdmin() {
        return this.auth.is_admin === true || this.auth.is_admin_it === true;
      },

      showConfig() {
        const val = $linq(this.configData).where(x => x.config_id === 'POST002').select(x => x.config_value).firstOrDefault();
        return val === 'Y';
      },

      canGo(e, disabled) {
        if (disabled) e.preventDefault();
      },

      buildMenu() {
        const b = this.baseUrl;
        const isMango = this.isMango();
        const isAdmin = this.isAdmin();

        return [
          {
            menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_document_csm,
            link: `${b}page/document`, icon: 'document-csm2', show: true, check_right: false, children: [],
          },
          {
            menu_name: 'CSM_WEB', menu_id: '40000', display_text: this.ui.csm_menu_control_plan,
            link: '', icon: 'monitor', show: true, check_right: false,
            children: [
              { menu_name: 'CSM_WEB', menu_id: '40010', display_text: this.ui.csm_menu_dash_customer_service, link: `${b}page/dashboard/v_csm_dashboard`, show: true, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '40020', display_text: this.ui.csm_menu_dash_all_company, link: `${b}page/dashboard/v_csm_dashboard2`, show: true, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '40030', display_text: this.ui.csm_menu_dash_most_defect, link: `${b}page/dashboard/v_csm_most_defect`, show: true, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '40060', display_text: this.ui.csm_menu_dash_remain_by_customer, link: `${b}page/Dashboard/v_csm_remain_by_customer`, show: true, check_right: true, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '40040', display_text: this.ui.csm_menu_all_worker_calendar, link: `${b}page/Dashboard/v_csm_all_work_calendar`, show: true, check_right: true, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_dash_operation, link: `${b}page/i_dashboard/operation_dashboard_001`, show: isMango, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '40050', display_text: this.ui.csm_menu_dash_by_requester, link: `${b}page/Dashboard/v_csm_dashboard_req/`, show: true, check_right: true, children: [] },
            ],
          },
          {
            menu_name: 'CSM_WEB', menu_id: '10000', display_text: this.ui.csm_menu_transaction,
            link: '', icon: 'edit', show: true, check_right: false,
            children: [
              { menu_name: 'CSM_WEB', menu_id: '10100', display_text: this.ui.erp_create_document, link: `${b}page/transaction/v_csm_trn_001/`, show: true, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '10200', display_text: this.ui.csm_menu_request_to_csm, link: `${b}page/transaction/v_csm_trn_003/`, show: isMango, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '10300', display_text: this.ui.csm_menu_change_employee, link: `${b}page/transaction/v_csm_trn_004/`, show: true, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_revision, link: `${b}page/transaction/v_csm_trn_000/`, show: isMango, check_right: false, children: [] },  
              { menu_name: 'CSM_WEB', menu_id: '10301', display_text: this.ui.csm_menu_checklist_update_program, link: `${b}page/Transaction/v_csm_trn_update/`, show: isMango, check_right: false, children: [] },
            ],
          },
          {
            menu_name: 'CSM_WEB', menu_id: '30000', display_text: this.ui.erp_report,
            link: '', icon: 'file', show: true, check_right: false,
            children: [
              { menu_name: 'CSM_WEB', menu_id: '30500', display_text: this.ui.csm_menu_rpt_satisfaction, link: `${b}page/report/v_csm_rpt_001/`, show: true, check_right: false, children: [] },
              {
                menu_name: 'CSM_WEB', menu_id: '30100', display_text: this.ui.csm_menu_rpt_job_status,
                link: '', show: true, check_right: false,
                children: [
                  { menu_name: 'CSM_WEB', menu_id: '30110', display_text: this.ui.csm_menu_by_job_status, link: `${b}page/report/v_csm_rpt_002/`, show: true, check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '30120', display_text: this.ui.csm_menu_by_project, link: `${b}page/report/v_csm_rpt_005/`, show: this.isShowReport(), check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '30130', display_text: this.ui.csm_menu_tester, link: `${b}page/report/v_csm_rpt_006/`, show: isMango, check_right: false, children: [] },
                ],
              },
              { menu_name: 'CSM_WEB', menu_id: '30200', display_text: this.ui.csm_menu_rpt_remaining_csm, link: `${b}page/report/v_csm_rpt_004/`, show: isMango, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '30300', display_text: this.ui.csm_menu_requirement_checklist, link: `${b}page/report/v_csm_rpt_003/`, show: isMango, check_right: false, children: [] },
              {
                menu_name: 'CSM_WEB', menu_id: '30400', display_text: this.ui.csm_menu_rpt_warranty,
                link: '', show: true, check_right: false,
                children: [
                  { menu_name: 'CSM_WEB', menu_id: '30410', display_text: this.ui.erp_warranty, link: `${b}page/report/v_csm_war_rpt01/`, show: !isMango, check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '30410', display_text: this.ui.erp_warranty, link: `${b}page/report/v_csm_war_rpt02/`, show: isMango, check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '30420', display_text: this.ui.csm_menu_warranty_by_branch, link: `${b}page/Report/warranty_/v_csm_rpt_warraty_branch/`, show: true, check_right: false, children: [] },
                ],
              },
              {
                menu_name: 'CSM_WEB', menu_id: '30500', display_text: this.ui.csm_menu_rpt_contract_remain,
                link: '', show: true, check_right: false,
                children: [
                  { menu_name: 'CSM_WEB', menu_id: '30510', display_text: this.ui.csm_menu_rpt_contract_remain_by_module, link: `${b}page/Report/contract/v_csm_rpt_contract_pmbm/`, show: true, check_right: false, children: [] },
                ],
              },
              { menu_name: 'CSM_WEB', menu_id: '30520', display_text: this.ui.csm_menu_rpt_add_spec, link: `${b}page/Report/add-spec/v_csm_add_spec/`, show: isMango, check_right: false, children: [] },
            ],
          },
          {
            menu_name: 'CSM_WEB', menu_id: '20000', display_text: this.ui.csm_menu_master_setup,
            link: '', icon: 'folder', show: true, check_right: false,
            children: [
              { menu_name: 'CSM_WEB', menu_id: '20100', display_text: this.ui.csm_menu_set_priority, link: `${b}page/master/v_csm_mas_009/`, show: true, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '20200', display_text: this.ui.csm_menu_set_connection, link: `${b}page/master/v_csm_mas_005/`, show: true, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '20300', display_text: this.ui.csm_menu_set_service_group, link: `${b}page/master/v_csm_mas_019/`, show: true, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '20400', display_text: this.ui.csm_menu_set_service_type, link: `${b}page/master/v_csm_mas_006/`, show: true, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '20500', display_text: this.ui.csm_menu_set_work_category, link: `${b}page/master/v_csm_mas_017/`, show: !isMango, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '20600', display_text: this.ui.csm_menu_set_department, link: `${b}page/master/v_csm_mas_010/`, show: true, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '20700', display_text: this.ui.csm_menu_set_frequent_words, link: `${b}page/master/v_csm_mas_015/`, show: true, check_right: false, children: [] },
              {
                menu_name: 'CSM_WEB', menu_id: '20800', display_text: this.ui.csm_menu_set_warranty,
                link: '', show: true, check_right: false,
                children: [
                  { menu_name: 'CSM_WEB', menu_id: '20810', display_text: this.ui.csm_menu_warranty_group, link: `${b}page/master/v_csm_mas_001/`, show: true, check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '20820', display_text: this.ui.csm_v2_warranty, link: `${b}page/master/v_csm_mas_002/`, show: true, check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '20830', display_text: this.ui.csm_menu_add_project_area, link: `${b}page/master/v_csm_mas_003/`, show: true, check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '20840', display_text: this.ui.csm_menu_set_project_area, link: `${b}page/master/v_csm_mas_004/`, show: true, check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '20850', display_text: this.ui.csm_menu_init_warranty, link: `${b}page/master/v_csm_mas_008/`, show: true, check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '20860', display_text: this.ui.csm_menu_delete_warranty, link: isAdmin ? `${b}page/master/v_csm_mas_008_delete/` : `${b}page/error/access_denied/`, show: true, check_right: false, children: [] },
                ],
              },
              {
                menu_name: 'CSM_WEB', menu_id: '20900', display_text: this.ui.csm_menu_set_customer,
                link: '', show: true, check_right: false,
                children: [
                  { menu_name: 'CSM_WEB', menu_id: '20910', display_text: this.ui.csm_menu_customer_list, link: `${b}page/customer/v_csm_cus_001/`, show: true, check_right: true, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_set_workflow, link: `${b}page/master/v_csm_mas_013/`, show: isMango, check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.module || 'Setup Module', link: `${b}page/master/v_csm_mas_014/`, show: isMango, check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_setup_subject || 'Setup Subject', link: `${b}page/master/v_csm_mas_016/`, show: isMango, check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_package || 'Setup Package', link: `${b}page/master/v_csm_mas_018/`, show: isMango, check_right: false, children: [] },
                ],
              },
              {
                menu_name: 'CSM_WEB', menu_id: '21000', display_text: this.ui.csm_menu_set_survey_form,
                link: '', show: true, check_right: false,
                children: [
                  { menu_name: 'CSM_WEB', menu_id: '21010', display_text: this.ui.csm_menu_set_survey_question, link: `${b}page/master/v_csm_mas_011/`, show: true, check_right: true, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '21020', display_text: this.ui.csm_menu_manage_question_set, link: `${b}page/master/v_csm_mas_012`, show: true, check_right: true, children: [] },
                ],
              },
              // { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_gen_preventive, link: `${b}page/master/v_csm_mas_020`, show: true, check_right: true, forceIcon: true, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_set_type_program, link: `${b}page/master/v_csm_mas_program/`, show: isMango, check_right: false, children: [] },
             { menu_name: 'CSM_WEB', menu_id: '21022', display_text: this.ui.csm_menu_employee_team, link: `${b}page/master/v_csm_mas_set_emp_team/`, show: true, check_right: true, children: [] },
            ],
          },
          {
            menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_admin_only,
            link: '', icon: 'admin', show: this.auth.is_admin, check_right: false,
            children: [
              {
                menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_set_provider,
                link: '', show: true, check_right: false,
                children: [
                  { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_manage_phone, link: `${b}page/config/v_csm_config_001/`, show: true, check_right: false, children: [] },
                  { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_manage_provider_status, link: `${b}page/config/v_csm_config_002/`, show: true, check_right: false, children: [] },
                ],
              },
              { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_set_program, link: `${b}page/config/v_csm_config_003/`, show: true, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_set_calendar, link: `${b}page/config/v_csm_config_004/`, show: true, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_set_access_rights, link: `${b}page/Config/setup/v_csm_config_set_hide/`, show: isMango, check_right: false, children: [] },
            ],
          },
          {
            menu_name: 'CSM_WEB', menu_id: '40100', display_text: this.ui.csm_menu_mango_post,
            link: '', icon: 'box-search', show: true, check_right: true,
            children: [
              { menu_name: 'CSM_WEB', menu_id: '40110', display_text: this.ui.csm_menu_create_parcel, link: `${b}page/Master/v_csm_mas_021_create/`, show: this.showConfig(), check_right: true, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '40120', display_text: this.ui.csm_v2_parcel_tracking, link: `${b}page/Master/v_csm_mas_021/`, show: true, check_right: true, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '40130', display_text: this.ui.csm_menu_rpt_mango_post, link: `${b}page/Report/v_csm_rpt_007/`, show: true, check_right: true, children: [] },
            ],
          },
          {
            menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_pre_case,
            link: '', icon: 'file', show: isMango, check_right: false,
            children: [
              { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_create_case, link: `${b}page/custommango/v_csm_create_case/`, show: isMango, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_dashboard_case, link: `${b}page/custommango/v_csm_dashboard_case/`, show: isMango, check_right: false, children: [] },
              { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_case_complete, link: `${b}page/custommango/v_csm_case_complete/`, show: isMango, check_right: false, children: [] },
            ],
          },
          {
            menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_management_program,
            link: '', icon: 'swit', show: isMango, check_right: false,
            children: [
              { menu_name: 'CSM_WEB', menu_id: '', display_text: this.ui.csm_menu_management_program, link: `${b}page/custommango/management/v_csm_manage_program/`, show: isMango, check_right: false, children: [] },
            ],
          },
        ];
      },
    },

    async beforeMount() {
      await this.$store.dispatch('findConfig');
    },

    mounted() {
      this.$watch(
        'configData',
        (val) => {
          if (val && val.length > 0) {
            this.menu = this.buildMenu();
            this.$nextTick(() => {
              $('[data-widget="tree"]').tree();
            });
          }
        },
        { immediate: true }
      );
    },
  };
</script>

<style scoped>
  .link_disabled {
    cursor: not-allowed;
    pointer-events: none;
  }

  .treeview-menu {
    white-space: normal;
  }
</style>
