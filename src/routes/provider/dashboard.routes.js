import { Router } from "express";
import { getDashboardStats } from "../../controllers/admin/dashboard.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("PROVIDER"), getDashboardStats);

export const dashboardRouter = router;
