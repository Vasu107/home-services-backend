import { Router } from "express";
import { dashboardRouter } from "./dashboard.routes.js";
import { usersRouter } from "./users.routes.js";
import { providersRouter } from "./providers.routes.js";
import { categoriesRouter } from "./categories.routes.js";
import { bookingsRouter } from "./bookings.routes.js";

const router = Router();

router.use("/dashboard", dashboardRouter);
router.use("/users", usersRouter);
router.use("/providers", providersRouter);
router.use("/categories", categoriesRouter);
router.use("/bookings", bookingsRouter);

export default router;
