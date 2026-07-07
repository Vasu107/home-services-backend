import { prisma } from "../config/db.js";
import { hashPassword, comparePassword, sanitizeUser, formatPrismaError } from "../utils/helper.js";
import { signJwt } from "../utils/jwt.js";

export async function register(req, res, next) {
  try {
    const { name, email, password, phone, address, role } = req.body;
    const normalizedRole = ["ADMIN", "CUSTOMER", "PROVIDER"].includes(role) ? role : "CUSTOMER";
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: normalizedRole,
        provider: normalizedRole === "PROVIDER" ? { create: { about: "", status: "PENDING" } } : undefined,
      },
      include: { provider: true },
    });

    res.status(201).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    next(new Error(formatPrismaError(error)));
  }
}



export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { provider: true } });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = signJwt({ id: user.id, role: user.role });
    res.json({ success: true, data: { token, user: sanitizeUser(user) } });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ success: true, data: sanitizeUser(req.user) });
}
