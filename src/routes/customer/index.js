import { Router } from "express";
import { profileRouter } from "./profile.routes.js";
import { bookingsRouter } from "./bookings.routes.js";
import { providersRouter } from "./providers.routes.js";
import { categoriesRouter } from "./categories.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";

const router = Router();

router.use("/profile", profileRouter);
router.use("/bookings", bookingsRouter);
router.use("/providers", providersRouter);
router.use("/categories", categoriesRouter);
router.use("/dashboard", dashboardRouter);

export default router;
