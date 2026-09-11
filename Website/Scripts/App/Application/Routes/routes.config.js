/* Config */
const configRoutes = [
  {
    name: "v_csm_config_001",
    path: "/page/Config/v_csm_config_001/",
    component: () => import(`../Components/Pages/Config/v_csm_config_001.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_config_002",
    path: "/page/Config/v_csm_config_002/",
    component: () => import(`../Components/Pages/Config/v_csm_config_002.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_config_003",
    path: "/page/Config/v_csm_config_003/",
    component: () => import(`../Components/Pages/Config/v_csm_config_003.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_config_004",
    path: "/page/Config/v_csm_config_004/",
    component: () => import(`../Components/Pages/Config/v_csm_config_004.vue`),
    meta: {
      auth: true,
    },
  },
];

export default configRoutes;
