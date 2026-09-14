/* CustomMango */
const customMangoRoutes = [
  //-------------------Pre Case-------------------------
  {
    name: "v_csm_create_case",
    path: "/page/custommango/v_csm_create_case/",
    component: () => import(`../Components/Pages/CustomMango/v_csm_create_case.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_dashboard_case",
    path: "/page/custommango/v_csm_dashboard_case/",
    component: () => import(`../Components/Pages/CustomMango/v_csm_dashboard_case.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_case_complete",
    path: "/page/custommango/v_csm_case_complete/",
    component: () => import(`../Components/Pages/CustomMango/v_csm_case_complete.vue`),
    meta: {
      auth: true,
    },
  },
  //-------------------Management Program-------------------------
  {
    name: "v_csm_manage_program",
    path: "/page/custommango/management/v_csm_manage_program/",
    component: () => import(`../Components/Pages/CustomMango/Management/v_csm_manage_program.vue`),
    meta: {
      auth: true,
    },
  },
  // ------------------- CSM Logs -------------------------
  {
    name: "v_csm_logs_program",
    path: "/page/custommango/v_csm_logs_program/",
    component: () => import(`../Components/Pages/CustomMango/v_csm_logs_program.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_logs_report",
    path: "/page/custommango/v_csm_logs_report/",
    component: () => import(`../Components/Pages/CustomMango/v_csm_logs_report.vue`),
    meta: {
      auth: true,
    },
  },
];

export default customMangoRoutes;
