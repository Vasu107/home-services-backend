import { prisma } from "../../config/db.js";
import { sanitizeUser } from "../../utils/helper.js";

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { provider: { include: { categories: { include: { category: true } } } } },
    });
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, phone, address, about, experienceYears, serviceCharge, availability, profileImage, categoryIds } = req.body;

    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: { name, phone, address },
      }),
      prisma.providerProfile.update({
        where: { userId: req.user.id },
        data: {
          about,
          experienceYears: experienceYears !== undefined ? Number(experienceYears) : undefined,
          serviceCharge: serviceCharge !== undefined ? Number(serviceCharge) : undefined,
          availability: availability !== undefined ? Boolean(availability) : undefined,
          profileImage,
        },
      }),
    ]);

    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
      await prisma.providerCategory.deleteMany({ where: { providerProfileId: profile.id } });
      await prisma.providerCategory.createMany({
        data: categoryIds.map((catId) => ({
          providerProfileId: profile.id,
          categoryId: Number(catId),
          price: serviceCharge ? Number(serviceCharge) : 0,
        })),
        skipDuplicates: true,
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { provider: { include: { categories: { include: { category: true } } } } },
    });

    res.json({ success: true, data: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
}
