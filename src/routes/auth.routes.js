import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";

const router = Router();

router.post("/register", validateBody(["name", "email", "password"]), register);
router.post("/login", validateBody(["email", "password"]), login);
router.get("/me", authenticate, me);

export const authRouter = router;
