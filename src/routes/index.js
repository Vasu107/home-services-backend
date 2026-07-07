import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import adminRouter from "./admin/index.js";
import customerRouter from "./customer/index.js";
import providerRouter from "./provider/index.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/customer", customerRouter);
router.use("/provider", providerRouter);

export default router;
