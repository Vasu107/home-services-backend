import { Router } from "express";
import { getCustomerDashboardStats } from "../../controllers/customer/dashboard.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("CUSTOMER"), getCustomerDashboardStats);

export const dashboardRouter = router;
