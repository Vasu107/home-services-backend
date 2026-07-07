import { prisma } from "../../config/db.js";
import { sanitizeUser } from "../../utils/helper.js";

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { provider: { include: { categories: { include: { category: true } } } }, notifications: true },
    });
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, phone, address } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, address },
    });
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function listProviders(req, res, next) {
  try {
    const providers = await prisma.user.findMany({
      where: { role: "PROVIDER", provider: { status: "APPROVED" } },
      include: { provider: { include: { categories: { include: { category: true } } } } },
    });
    res.json({ success: true, data: providers.map(sanitizeUser) });
  } catch (error) {
    next(error);
  }
}

