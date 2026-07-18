import { Router } from "express";
import { getProviderProfile, updateProviderProfile, updateProviderStatus } from "../../controllers/admin/providers.controller.js";
import { listAllProviders } from "../../controllers/admin/users.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", listAllProviders);

router.get("/:providerId", getProviderProfile);
router.put("/me", validateBody(["about"]), updateProviderProfile);
router.patch("/:providerId/approved", updateProviderStatus);
router.patch("/:providerId/rejected", updateProviderStatus);
router.patch("/:providerId/suspended", updateProviderStatus);

export const providersRouter = router;
