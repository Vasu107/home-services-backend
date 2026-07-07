import { Router } from "express";
import { getCategories } from "../../controllers/admin/categories.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getCategories);

export const categoriesRouter = router;
