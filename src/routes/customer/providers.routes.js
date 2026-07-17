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

router.post("/:id/rate", async (req, res, next) => {
  try {
    const { rating } = req.body;
    const providerId = Number(req.params.id);

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const provider = await prisma.providerProfile.findUnique({
      where: { userId: providerId }
    });

    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found." });
    }

    const newRating = provider.rating === 0 ? numRating : (provider.rating + numRating) / 2;

    const updatedProfile = await prisma.providerProfile.update({
      where: { userId: providerId },
      data: { rating: newRating }
    });

    res.json({ success: true, message: "Rating submitted successfully.", rating: updatedProfile.rating });
  } catch (error) {
    next(error);
  }
});

export const providersRouter = router;
