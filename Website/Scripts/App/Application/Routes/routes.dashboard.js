/* Dashboard */
const dashboardRoutes = [
  {
    name: "v_csm_dashboard",
    path: "/page/Dashboard/v_csm_dashboard/",
    component: () => import(`../Components/Pages/Dashboard/v_csm_dashboard.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "40010",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_dashboard2",
    path: "/page/Dashboard/v_csm_dashboard2/",
    component: () => import(`../Components/Pages/Dashboard/v_csm_dashboard2.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "40020",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_most_defect",
    path: "/page/Dashboard/v_csm_most_defect/",
    component: () => import(`../Components/Pages/Dashboard/v_csm_most_defect.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "40030",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_dashboard1",
    path: "/page/Dashboard/v_csm_dashboard1/",
    component: () => import(`../Components/Pages/Dashboard/v_csm_dashboard1.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "",
        checkUserRight: false,
      },
    },
  },
  {
    name: "v_csm_all_work_calendar",
    path: "/page/Dashboard/v_csm_all_work_calendar/",
    component: () => import(`../Components/Pages/Dashboard/v_csm_all_work_calendar.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "40040",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_remain_by_customer",
    path: "/page/Dashboard/v_csm_remain_by_customer/",
    component: () =>
      import(`../Components/Pages/Dashboard/v_csm_remain_by_customer.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "40060",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_dashboard_req",
    path: "/page/Dashboard/v_csm_dashboard_req/",
    component: () => import(`../Components/Pages/Dashboard/v_csm_dashboard_req.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "40050",
        checkUserRight: true,
      },
    },
  },
  //Custom IT Dashboard By Kiatudom
  {
    name: "it_dev_dashboard_001",
    path: "/page/it_dev_dashboard/it_dev_dashboard_001",
    component: () => import(`../Components/Pages/ItDev/it_dev_dashboard_001.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "it_dev_dashboard_001_details",
    path: "/page/it_dev_dashboard/it_dev_dashboard_001_details",
    component: () => import(`../Components/Pages/ItDev/it_dev_dashboard_001_details.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "operation_dashboard_001",
    path: "/page/i_dashboard/operation_dashboard_001",
    component: () => import(`../Components/Pages/ItDev/operation_dashboard_001.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "operation_dashboard_002",
    path: "/page/i_dashboard/operation_dashboard_002",
    component: () => import(`../Components/Pages/ItDev/operation_dashboard_002.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "operation_dashboard_003",
    path: "/page/i_dashboard/operation_dashboard_003",
    component: () => import(`../Components/Pages/ItDev/operation_dashboard_003.vue`),
    meta: {
      auth: true,
    },
  },
];

export default dashboardRoutes;
