import { Router } from "express";
import { getCategories } from "../../controllers/admin/categories.controller.js";

const router = Router();

router.get("/", getCategories);

export const categoriesRouter = router;
