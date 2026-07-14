import { prisma } from "./src/config/db.js";
import "./src/config/env.js";

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true
      }
    });
    for (const u of users) {
      const isHashed = u.password.startsWith("$2a$") || u.password.startsWith("$2b$") || u.password.startsWith("$2y$");
      console.log(`User: ${u.email}, Hashed: ${isHashed}, PasswordVal: ${u.password.substring(0, 10)}...`);
    }
  } catch (err) {
    console.error("DB_ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
