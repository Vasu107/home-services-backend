import { Router } from "express";
import { listProviders } from "../../controllers/admin/users.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticate, listProviders);

export const providersRouter = router;
