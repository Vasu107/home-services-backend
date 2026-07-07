import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is required in environment configuration");
}

export function signJwt(payload, options = {}) {
  return jwt.sign(payload, secret, { expiresIn: "7d", ...options });
}

export function verifyJwt(token) {
  return jwt.verify(token, secret);
}
