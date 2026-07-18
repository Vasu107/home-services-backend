import { PrismaClient } from "./generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "vasudevyadav3107@gmail.com";
  const password = "Vasudev@3107";
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: "Admin User",
      email: email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user seeded:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
