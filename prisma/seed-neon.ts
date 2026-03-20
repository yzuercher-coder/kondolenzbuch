/**
 * Einmaliges Setup-Script für die Neon-Produktionsdatenbank.
 * Ausführen mit: npx tsx prisma/seed-neon.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Neon-Datenbank...");

  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log("✅ Bereits ein Benutzer vorhanden — Seed übersprungen.");
    return;
  }

  const password = await bcrypt.hash("Admin1234!", 12);
  const user = await prisma.user.create({
    data: {
      name: "Administrator",
      email: "admin@kondolenzbuch.ch",
      password,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✅ Admin-Benutzer erstellt: ${user.email}`);
  console.log("⚠️  Passwort bitte sofort nach dem ersten Login ändern!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
