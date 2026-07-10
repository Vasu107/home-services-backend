import { getProviderDashboard } from "../../controllers/provider/dashboard.controller.js";

router.get("/", authenticate, getProviderDashboard);