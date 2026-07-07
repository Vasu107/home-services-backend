import { Router } from "express";
import { getProfile, updateProfile, listProviders } from "../../controllers/admin/users.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/me", getProfile);
router.put("/me", validateBody(["name"]), updateProfile);
router.get("/providers", listProviders);

export const usersRouter = router;
