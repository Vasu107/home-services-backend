import { Router } from "express";
import { getProfile } from "../../controllers/admin/users.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { prisma } from "../../config/db.js";
import { sanitizeUser } from "../../utils/helper.js";

const router = Router();

router.get("/", authenticate, getProfile);

router.put("/", authenticate, async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
    });
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

export const profileRouter = router;
