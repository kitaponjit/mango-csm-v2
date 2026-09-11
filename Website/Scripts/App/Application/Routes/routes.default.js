const defaultRoutes = [
  {
    name: "start",
    path: "/page/document",
    component: () => import("../Components/Pages/Default/home.vue"),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "",
        menu_id: "",
        checkUserRight: false,
      },
    },
  },
  {
    name: "start2",
    path: "/page/",
    component: () => import("../Components/Pages/Default/home2.vue"),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "",
        menu_id: "",
        checkUserRight: false,
      },
    },
  },
  {
    name: "login",
    path: "/page/authentication/login/",
    component: () => import("../Components/Pages/Authentication/login.vue"),
    meta: {
      auth: false,
    },
  },
  {
    name: "login_cust",
    path: "/page/authentication/login_cust/",
    component: () => import("../Components/Pages/Authentication/login_cust.vue"),
    meta: {
      auth: false,
    },
  },
  /* Home */
  {
    name: "CustomerData",
    path: "/page/customerdata/",
    component: () => import("../Components/Pages/Default/CustomerData.vue"),
    meta: {
      auth: true,
    },
  },
  {
    name: "CustomerDataView",
    path: "/page/customerdataview/",
    component: () => import("../Components/Pages/Default/CustomerDataView.vue"),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "60000",
      },
    },
  },
  {
    name: "Form",
    path: "/page/form/",
    component: () => import("../Components/Pages/Default/Form.vue"),
    meta: {
      auth: true,
    },
  },
  {
    name: "FormDetail",
    path: "/page/formdetail/",
    component: () => import("../Components/Pages/Default/FormDetail.vue"),
    meta: {
      auth: true,
    },
  },
  {
    name: "MasterData",
    path: "/page/master/",
    component: () => import("../Components/Pages/Default/Master.vue"),
    meta: {
      auth: true,
    },
  },
    {
    name: "ModuleData",
    path: "/page/modules/",
    component: () => import("../Components/Pages/Default/modules.vue"),
    meta: {
      auth: true,
    },
  },
  // ------------------- Schedule Update Software -------------------------
  {
    name: "ScheduleUpdateSoftware",
    path: "/page/scheduleupdatesoftware",
    component: () => import(`../Components/Pages/Default/ScheduleUpdateSoftware.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "60000",
        checkUserRight: true,
      },
    },
  },
];

export default defaultRoutes;
