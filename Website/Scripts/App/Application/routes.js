import defaultRoutes from "./Routes/routes.default";
import dashboardRoutes from "./Routes/routes.dashboard";
import transactionRoutes from "./Routes/routes.transaction";
import masterRoutes from "./Routes/routes.master";
import reportRoutes from "./Routes/routes.report";
import externalRoutes from "./Routes/routes.external";
import manualRoutes from "./Routes/routes.manual";
import toolsRoutes from "./Routes/routes.tools";
import configRoutes from "./Routes/routes.config";
import customMangoRoutes from "./Routes/routes.custommango";
import customerConfigCenterRoutes from "./Routes/routes.customerconfigcenter";
import {
  errorRoutes,
  approveRoutes,
  v2Routes,
  weblandRoutes,
  emptyRoutes,
} from "./Routes/routes.others";

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
