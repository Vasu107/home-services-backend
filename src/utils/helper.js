import bcrypt from "bcryptjs";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function sanitizeUser(user) {
  if (!user) {
    return null;
  }
  const { password, ...rest } = user;
  return rest;
}

export function formatPrismaError(error) {
  if (error.code === "P2002") {
    return `Unique constraint failed: ${error.meta?.target?.join(", ")}`;
  }
  return error.message;
}
