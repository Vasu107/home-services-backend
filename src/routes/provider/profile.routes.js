import { Router } from "express";
import { getProfile, updateProfile } from "../../controllers/admin/users.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";

const router = Router();

router.get("/", authenticate, getProfile);
router.put("/", authenticate, validateBody(["name"]), updateProfile);

export const profileRouter = router;
