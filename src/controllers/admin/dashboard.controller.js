import { prisma } from "../../config/db.js";

export async function getDashboardStats(req, res, next) {
  try {
    const users = await prisma.user.count();
    const providers = await prisma.user.count({ where: { role: "PROVIDER" } });
    const bookings = await prisma.booking.count();
    const categories = await prisma.category.count();

    res.json({ success: true, data: { users, providers, bookings, categories } });
  } catch (error) {
    next(error);
  }
}
