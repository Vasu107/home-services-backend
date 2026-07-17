import { prisma } from "../config/db.js";
import {
  hashPassword,
  comparePassword,
  sanitizeUser,
  formatPrismaError,
} from "../utils/helper.js";
import { signJwt } from "../utils/jwt.js";

// ===================== REGISTER =====================

export async function register(req, res, next) {
  try {
    const { name, email, password, phone, address, role } = req.body;

    const normalizedRole = ["ADMIN", "CUSTOMER", "PROVIDER"].includes(role)
      ? role
      : "CUSTOMER";

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: normalizedRole,

        provider:
          normalizedRole === "PROVIDER"
            ? {
                create: {
                  about: "",
                  experienceYears: 0,
                  serviceCharge: 0,
                  availability: true,
                  rating: 0,
                  status: "APPROVED", // Auto approved
                },
              }
            : undefined,
      },

      include: {
        provider: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please login to continue.",
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(new Error(formatPrismaError(error)));
  }
}

// ===================== LOGIN =====================

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        provider: true,
      },
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = signJwt({
      id: user.id,
      role: user.role,
    });

    const profileCompleted =
      user.role !== "PROVIDER"
        ? true
        : Boolean(
            user.provider?.about &&
              user.provider?.experienceYears > 0 &&
              user.provider?.serviceCharge > 0
          );

    return res.status(200).json({
      success: true,
      message: "Login successful.",

      data: {
        token,

        user: sanitizeUser(user),

        profileCompleted,

        providerStatus:
          user.provider?.status || "PENDING",
      },
    });
  } catch (error) {
    next(error);
  }
}

// ===================== CURRENT USER =====================

export async function me(req, res) {
  return res.status(200).json({
    success: true,
    data: sanitizeUser(req.user),
  });
}