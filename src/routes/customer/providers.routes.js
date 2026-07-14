import { Router } from "express";
import { listProviders } from "../../controllers/admin/users.controller.js";
import { prisma } from "../../config/db.js";
import { sanitizeUser } from "../../utils/helper.js";

const router = Router();

// Public — no auth needed for browsing
router.get("/", listProviders);

router.get("/:id", async (req, res, next) => {
  try {
    const provider = await prisma.user.findUnique({
      where: { id: Number(req.params.id), role: "PROVIDER" },
      include: { provider: { include: { categories: { include: { category: true } } } } },
    });
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });
    res.json({ success: true, data: sanitizeUser(provider) });
  } catch (error) {
    next(error);
  }
});

export const providersRouter = router;
