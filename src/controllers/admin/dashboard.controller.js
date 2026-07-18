import { prisma } from "../../config/db.js";

export async function getDashboardStats(req, res, next) {
  try {
    const users = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const providers = await prisma.user.count({ where: { role: "PROVIDER" } });
    const pendingProviders = await prisma.providerProfile.count({ where: { status: "PENDING" } });
    const bookings = await prisma.booking.count();
    const categories = await prisma.category.count();

    res.json({ success: true, data: { users, providers, pendingProviders, bookings, categories } });
  } catch (error) {
    next(error);
  }
}
