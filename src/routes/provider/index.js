import { Router } from "express";
import { dashboardRouter } from "./dashboard.routes.js";
import { profileRouter } from "./profile.routes.js";
import { bookingsRouter } from "./bookings.routes.js";
import { categoriesRouter } from "./categories.routes.js";

const router = Router();

router.use("/dashboard", dashboardRouter);
router.use("/profile", profileRouter);
router.use("/bookings", bookingsRouter);
router.use("/categories", categoriesRouter);

export default router;
