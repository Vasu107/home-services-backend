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
    const {
      name,
      phone,
      about,
      experienceYears,
      serviceCharge,
      availability,
      categories,
      address,
    } = req.body;

    const fullAddress = address
      ? `${address.street}, ${address.city} - ${address.postalCode}`
      : null;

    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        name,
        phone,
        address: fullAddress,

        provider: {
          update: {
            about,
            experienceYears: Number(experienceYears),
            serviceCharge: Number(serviceCharge),
            availability,

            // Uncomment if your schema supports categories
            // categories: {
            //   set: categories.map((id) => ({ id })),
            // },
          },
        },
      },
      include: {
        provider: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: sanitizeUser(user),
    });
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

// Admin: list all users (customers)
export async function listAllUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: users.map(sanitizeUser) });
  } catch (error) {
    next(error);
  }
}

// Admin: block or unblock a user
export async function blockUnblockUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { isBlocked: !user.isBlocked },
    });
    res.json({ success: true, message: `User ${updated.isBlocked ? "blocked" : "unblocked"} successfully.`, data: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
}

// Admin: list all providers (any status)
export async function listAllProviders(req, res, next) {
  try {
    const providers = await prisma.user.findMany({
      where: { role: "PROVIDER" },
      include: { provider: { include: { categories: { include: { category: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: providers.map(sanitizeUser) });
  } catch (error) {
    next(error);
  }
}
