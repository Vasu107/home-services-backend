import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is required in environment configuration");
}

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Access token is missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, secret);
    const userId = decoded?.id;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { provider: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: "Your account has been blocked." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}
