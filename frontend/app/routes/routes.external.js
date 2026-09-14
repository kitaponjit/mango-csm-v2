/* External View */
const externalRoutes = [
  {
    name: "v_csm_external",
    path: "/page/External/v_csm_external/",
    component: () => import(`../Components/Pages/External/v_csm_external.vue`),
    meta: {
      customer: true,
      customer_auth: true,
    },
  },
  {
    name: "v_mas_update_list",
    path: "/page/External/v_mas_update_list/",
    component: () => import(`../Components/Pages/External/v_mas_update_list.vue`),
    meta: {
      customer: true,
      customer_auth: true,
    },
  },
  {
    name: "v_mas_form_sign",
    path: "/page/External/v_mas_form_sign/",
    component: () => import(`../Components/Pages/External/v_mas_form_sign.vue`),
    meta: {
      customer: true,
      customer_auth: true,
    },
  },
  {
    name: "v_csm_external_detail",
    path: "/page/External/v_csm_external_detail/",
    component: () => import(`../Components/Pages/External/v_csm_external_detail.vue`),
    meta: {
      customer: true,
      customer_auth: true,
    },
  },
  {
    name: "v_csm_settings",
    path: "/page/External/v_csm_settings/",
    component: () => import(`../Components/Pages/External/v_csm_settings.vue`),
    meta: {
      customer: true,
      customer_auth: true,
    },
  },
  {
    name: "v_csm_request_d",
    path: "/page/External/v_csm_request_d/",
    component: () => import(`../Components/Pages/External/v_csm_request_d.vue`),
    meta: {
      customer: true,
      customer_auth: true,
    },
  },
  {
    name: "v_csm_request",
    path: "/page/External/v_csm_request/",
    component: () => import(`../Components/Pages/External/v_csm_request.vue`),
    meta: {
      customer: true,
      customer_auth: true,
    },
  },
  {
    name: "v_csm_dataview",
    path: "/page/External/v_csm_dataview/",
    component: () => import(`../Components/Pages/External/v_csm_dataview.vue`),
    meta: {
      customer: true,
      customer_auth: true,
    },
  },
];

export default externalRoutes;
