/* Transaction */
const transactionRoutes = [
  {
    name: "v_csm_trn_001_old",
    path: "/page/Transaction/v_csm_trn_001_old/",
    component: () => import(`../Components/Pages/Transaction/v_csm_trn_001_old.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "10100",
        checkUserRight: true,
      },
    },
  },
  {
    name: 'v_csm_trn_001',
    path: '/page/Transaction/v_csm_trn_001/',
    component: () => import(`../Components/Pages/Transaction/v_csm_trn_001.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: 'CSM_WEB',
        menu_id: '10100',
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_trn_002",
    path: "/page/Transaction/v_csm_trn_002/",
    component: () => import(`../Components/Pages/Transaction/v_csm_trn_002.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "10400",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_trn_003",
    path: "/page/Transaction/v_csm_trn_003/",
    component: () => import(`../Components/Pages/Transaction/v_csm_trn_003.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "10200",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_trn_004",
    path: "/page/Transaction/v_csm_trn_004/",
    component: () => import(`../Components/Pages/Transaction/v_csm_trn_004.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "10300",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_trn_000",
    path: "/page/Transaction/v_csm_trn_000/",
    component: () => import(`../Components/Pages/Transaction/v_csm_trn_000.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "10300",
        checkUserRight: false,
      },
    },
  },
  {
    name: "v_csm_trn_update",
    path: "/page/Transaction/v_csm_trn_update/",
    component: () => import(`../Components/Pages/Transaction/v_csm_trn_update.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "10301",
        checkUserRight: false,
      },
    },
  },
  // -------------------Poch------------------
  {
    name: "v_service_detail_poch",
    path: "/page/poch/v_service_detail_poch/",
    component: () => import(`../Components/Pages/Transaction/v_csm_trn_001_components/document-details/assignment/components_poch/v_service_detail_poch.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
      },
    },
  },
];

export default transactionRoutes;
