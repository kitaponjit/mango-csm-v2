/* Tools */
const toolsRoutes = [
  {
    /* Document browser over `log_web`-shaped documents. Reads through
       ~/services/document-store, which is frontend-only: it queries a JSON
       document file in the browser and never calls the backend.

       Gated by menu right 60000 (Customer Config Center), the same right as
       the system-setup screens: this is an audit log of every user's gateway
       activity, so only people who administer the system may open it. Without
       the right the auth middleware redirects to access_denied. */
    name: "v_csm_log_web",
    path: "/page/Tools/v_csm_log_web/",
    component: () => import(`../Components/Pages/Tools/v_csm_log_web.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "60000",
        checkUserRight: true,
      },
    },
  },
  {
    name: "v_csm_employee",
    path: "/page/Tools/v_csm_employee/",
    component: () => import(`../Components/Pages/Tools/v_csm_employee.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_emp_d",
    path: "/page/Tools/v_csm_emp_d/",
    component: () => import(`../Components/Pages/Tools/v_csm_emp_d.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_passcode",
    path: "/page/Tools/v_csm_passcode/",
    component: () => import(`../Components/Pages/Tools/v_csm_passcode.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_revision",
    path: "/page/Tools/v_csm_revision/",
    component: () => import(`../Components/Pages/Tools/v_csm_revision.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_tools",
    path: "/page/Tools/v_csm_tools/",
    component: () => import(`../Components/Pages/Tools/v_csm_tools.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_doc_running",
    path: "/page/Tools/v_csm_doc_running/",
    component: () => import(`../Components/Pages/Tools/v_csm_doc_running.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_erp_config",
    path: "/page/Tools/v_csm_erp_config/",
    component: () => import(`../Components/Pages/Tools/v_csm_erp_config.vue`),
    meta: {
      auth: true,
    },
  },
  {
    name: "v_csm_db_list",
    path: "/page/Tools/v_csm_db_list/",
    component: () => import(`../Components/Pages/Tools/v_csm_db_list.vue`),
    meta: {
      auth: true,
    },
  },
  /* History */
  {
    name: "v_csm_call_history",
    path: "/page/history/v_csm_call_history/",
    component: () => import(`../Components/Pages/History/v_csm_call_history.vue`),
    meta: {
      auth: true,
    },
  },
];

export default toolsRoutes;
