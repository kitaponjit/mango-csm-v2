const spikeRoutes = [
  {
    name: "access_denied",
    path: "/page/error/access_denied/",
    component: () => import("../Components/Errors/403.vue"),
  },
  {
    name: "content_not_found",
    path: "/:pathMatch(.*)*",
    component: () => import("../Components/Errors/404.vue"),
  },
];

export default spikeRoutes;
