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

    // Build address string only when at least one part has a value
    let addressStr = undefined;
    if (typeof address === "string") {
      // Already a plain string — only store if not empty/just punctuation
      const cleaned = address.replace(/[,\s\-]/g, "").trim();
      addressStr = cleaned.length > 0 ? address.trim() : null;
    } else if (address && typeof address === "object") {
      const { street = "", city = "", postalCode = "" } = address;
      const hasValue = street.trim() || city.trim() || postalCode.trim();
      addressStr = hasValue ? `${street}, ${city} - ${postalCode}` : null;
    }

    const updateData = {};
    if (name !== undefined && name.trim()) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim() || null;
    if (addressStr !== undefined) updateData.address = addressStr;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    return res.json({ success: true, message: "Profile updated successfully.", data: sanitizeUser(user) });
  } catch (error) {
    // Handle unique constraint violation on phone number
    if (error.code === "P2002" && error.meta?.target?.includes("phone")) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already in use by another account.",
      });
    }
    next(error);
  }
});

export const profileRouter = router;

