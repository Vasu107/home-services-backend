import { prisma } from "../../config/db.js";

export async function getCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({ where: { isActive: true } });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, description, isActive } = req.body;
    const category = await prisma.category.create({
      data: { name, description, isActive: isActive === undefined ? true : Boolean(isActive) },
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { name, description, isActive } = req.body;
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: { name, description, isActive: isActive === undefined ? undefined : Boolean(isActive) },
    });
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}
export async function deleteCategory(req, res, next) {
  try {
    await prisma.category.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
}
