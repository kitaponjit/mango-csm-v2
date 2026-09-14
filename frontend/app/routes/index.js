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
