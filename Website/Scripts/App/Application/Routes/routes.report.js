/* Report */
const reportRoutes = [
  {
    name: "v_csm_rpt_001",
    path: "/page/Report/v_csm_rpt_001/",
    component: () => import(`../Components/Pages/Report/v_csm_rpt_001.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "30010",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_rpt_002",
    path: "/page/Report/v_csm_rpt_002/",
    component: () => import(`../Components/Pages/Report/v_csm_rpt_002.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "30110",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_rpt_003",
    path: "/page/Report/v_csm_rpt_003/",
    component: () => import(`../Components/Pages/Report/v_csm_rpt_003.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "30300",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_rpt_004",
    path: "/page/Report/v_csm_rpt_004/",
    component: () => import(`../Components/Pages/Report/v_csm_rpt_004.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "30200",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_rpt_005",
    path: "/page/Report/v_csm_rpt_005/",
    component: () => import(`../Components/Pages/Report/v_csm_rpt_005.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "30120",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_rpt_006",
    path: "/page/Report/v_csm_rpt_006/",
    component: () => import(`../Components/Pages/Report/v_csm_rpt_006.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "30130",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_rpt_007",
    path: "/page/Report/v_csm_rpt_007/",
    component: () => import(`../Components/Pages/Report/v_csm_rpt_007.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "40130",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_war_rpt01",
    path: "/page/Report/v_csm_war_rpt01/",
    component: () => import(`../Components/Pages/Report/v_csm_war_rpt01.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "30410",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_war_rpt02",
    path: "/page/Report/v_csm_war_rpt02/",
    component: () => import(`../Components/Pages/Report/v_csm_war_rpt02.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "30410",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_rpt_contract_pmbm",
    path: "/page/Report/contract/v_csm_rpt_contract_pmbm/",
    component: () => import(`../Components/Pages/Report/Warranty_custom/v_csm_rpt_contract_pmbm.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "30510",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_rpt_warraty_branch",
    path: "/page/Report/warranty_/v_csm_rpt_warraty_branch/",
    component: () => import(`../Components/Pages/Report/Warranty_custom/v_csm_rpt_warraty_branch.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "30420",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_add_spec",
    path: "/page/Report/add-spec/v_csm_add_spec/",
    component: () => import(`../Components/Pages/Report/v_csm_add_spec.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "30520",
        checkUserRight: false,
      },
    },
  },
];

export default reportRoutes;
