import { Router } from "express";
import { getCategories, createCategory, updateCategory } from "../../controllers/admin/categories.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", getCategories);
router.post("/", validateBody(["name"]), createCategory);
router.put("/:id", validateBody(["name"]), updateCategory);

export const categoriesRouter = router;
