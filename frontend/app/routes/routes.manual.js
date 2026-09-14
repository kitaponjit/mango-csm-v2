/* Manual List */
const manualRoutes = [
  {
    name: "v_csm_manual_list",
    path: "/page/manual/v_csm_manual_list/",
    component: () => import(`../Components/Pages/Manual/v_csm_manual_list.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_manual_list_v2",
    path: "/page/manual/v_csm_manual_list_v2/",
    component: () => import(`../Components/Pages/Manual/v_csm_manual_list_v2.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_manual_list_admin",
    path: "/page/manual/v_csm_manual_list_admin/",
    component: () => import(`../Components/Pages/Manual/v_csm_manual_list_admin.vue`),
    meta: {
      auth: true,
    },
  },
];

export default manualRoutes;
