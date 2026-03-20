import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 12);

  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password,
      name: "Administrator",
      role: "SUPER_ADMIN",
    },
  });

  console.log("✓ Admin-Benutzer erstellt:", user.email);
  console.log("  Passwort: admin123 (bitte nach Login ändern)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
