import defaultRoutes from "./routes.default";
import dashboardRoutes from "./routes.dashboard";
import transactionRoutes from "./routes.transaction";
import masterRoutes from "./routes.master";
import reportRoutes from "./routes.report";
import externalRoutes from "./routes.external";
import manualRoutes from "./routes.manual";
import toolsRoutes from "./routes.tools";
import configRoutes from "./routes.config";
import customMangoRoutes from "./routes.custommango";
import customerConfigCenterRoutes from "./routes.customerconfigcenter";
import {
  errorRoutes,
  approveRoutes,
  v2Routes,
  weblandRoutes,
  emptyRoutes,
} from "./routes.others";

const routes = [
  /* The legacy app was only ever served under /page/** — Website/Page/Web.config
     rewrote everything below that path to Default.aspx — so the site root was the
     IIS root and never needed a route. Nuxt serves this SPA from the root instead,
     which left "/" matching nothing but the wildcard "content not found" route.
     Send it to the app home, which is also where login.vue lands after sign-in. */
  { path: "/", redirect: "/page/" },
  ...defaultRoutes,
  ...dashboardRoutes,
  ...transactionRoutes,
  ...masterRoutes,
  ...reportRoutes,
  ...externalRoutes,
  ...manualRoutes,
  ...toolsRoutes,
  ...configRoutes,
  ...customMangoRoutes,
  ...customerConfigCenterRoutes,
  ...approveRoutes,
  ...v2Routes,
  ...weblandRoutes,
  ...emptyRoutes,
  ...errorRoutes, // errorRoutes ไว้ท้ายสุดเพราะมี wildcard path: "*"
];

export default routes;
