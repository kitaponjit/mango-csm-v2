/* Customer Config Center */
const customerConfigCenterRoutes = [
  // ------------------- Setup Company -------------------------
  {
    name: "v_csm_setup_company",
    path: "/page/CustomerConfigCenter/SetupCompany/v_csm_setup_company/",
    component: () => import(`../Components/Pages/CustomerConfigCenter/SetupCompany/v_csm_setup_company.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "60000",
        checkUserRight: true,
      },
    },
  },
  // ------------------- Setup Application -------------------------
  {
    name: "v_csm_setup_application",
    path: "/page/CustomerConfigCenter/SetupApplication/v_csm_setup_application/",
    component: () => import(`../Components/Pages/CustomerConfigCenter/SetupApplication/v_csm_setup_application.vue`),
    meta: {
      auth: true,
      mangoMenu: {
        menu_name: "CSM_WEB",
        menu_id: "60000",
        checkUserRight: true,
      },
    },
  },
  // ------------------- Setup Document Running -------------------------
  {
    name: "v_csm_setup_document_running",
    path: "/page/CustomerConfigCenter/SetupDocumentRunning/v_csm_setup_document_running/",
    component: () => import(`../Components/Pages/CustomerConfigCenter/SetupDocumentRunning/v_csm_setup_document_running.vue`),
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

export default customerConfigCenterRoutes;
