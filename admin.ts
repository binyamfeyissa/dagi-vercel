import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("malon123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "malon@gmail.com" },
    update: {},
    create: {
      username: "malon",
      email: "malon@gmail.com",
      password: hashedPassword,
      role: "admin",
      country: "Ethiopia",
    },
  });

  console.log("✅ Admin user created:", admin.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
