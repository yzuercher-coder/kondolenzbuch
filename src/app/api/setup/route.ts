import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Einmaliger Setup-Endpoint — wird nach Verwendung gelöscht
export async function GET() {
  const existing = await prisma.user.findFirst();
  if (existing) {
    return NextResponse.json({ message: "Bereits eingerichtet", email: existing.email });
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

  return NextResponse.json({
    success: true,
    message: "Admin-Benutzer erstellt!",
    email: user.email,
  });
}
