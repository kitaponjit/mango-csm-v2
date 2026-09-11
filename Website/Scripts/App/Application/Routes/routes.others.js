/* Errors */
const errorRoutes = [
  {
    name: "access_denied",
    path: "/page/error/access_denied/",
    component: () => import("../Components/Errors/403.vue"),
  },
  {
    name: "content_not_found",
    path: "*",
    component: () => import(`../Components/Errors/404.vue`),
  },
];

/* Approve */
const approveRoutes = [
  {
    name: "Approve Documents",
    path: "/page/Approve/v_csm_approve/",
    component: () => import(`../Components/Pages/Approve/v_csm_approve.vue`),
    meta: {
      auth: true,
    },
  },
];

/* V2 - แจ้งซ่อมผ่านไลน์ */
const v2Routes = [
  {
    name: "v2_csm_login",
    path: "/page/v2/Authentication/login/",
    component: () => import(`../Components/Pages/V2/Authentication/login.vue`),
    meta: {
      customer_v2: false,
      customer_auth: false,
    },
  },
  {
    name: "v2_csm_register",
    path: "/page/v2/v_csm_line_register/:maincode/:pre_event2/:pre_event",
    component: () => import(`../Components/Pages/V2/Transaction/v_csm_line_register.vue`),
    meta: {
      customer_v2: false,
      customer_auth: false,
    },
    props: true,
  },
  {
    name: "v_csm_lineoa",
    path: "/page/v2/",
    component: () => import(`../Components/Pages/V2/Transaction/v_csm_lineoa.vue`),
    meta: {
      customer_v2: true,
      customer_auth: true,
    },
  },
];

/* WebLand */
const weblandRoutes = [
  {
    name: "landing_app",
    path: "/page/csm/landing/",
    component: () => import("../Components/Pages/webland/landing.vue"),
    meta: {
      auth: false,
      mangoMenu: {
        menu_name: "",
        menu_id: "",
        checkUserRight: false,
      },
    },
  },
];

/* Empty */
const emptyRoutes = [
  {
    name: "empty1",
    path: "/page/test/empty1",
    component: () => import(`../Components/Pages/Empty/empty_c.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "empty2",
    path: "/page/test/empty2",
    component: () => import(`../Components/Pages/Empty/empty_o.vue`),
    meta: {
      auth: true,
    },
  },
];

export { errorRoutes, approveRoutes, v2Routes, weblandRoutes, emptyRoutes };
