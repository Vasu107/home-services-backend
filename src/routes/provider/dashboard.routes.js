import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { getProviderDashboard } from "../../controllers/provider/dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getProviderDashboard);

export const dashboardRouter = router;