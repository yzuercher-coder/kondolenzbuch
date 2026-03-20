import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const profilSchema = z.object({
  name: z.string().min(2, "Name mindestens 2 Zeichen"),
  email: z.string().email("Ungültige E-Mail"),
});

const passwortSchema = z.object({
  aktuell: z.string().min(1, "Aktuelles Passwort erforderlich"),
  neu: z.string().min(8, "Mindestens 8 Zeichen"),
  bestaetigung: z.string(),
}).refine((d) => d.neu === d.bestaetigung, {
  message: "Passwörter stimmen nicht überein",
  path: ["bestaetigung"],
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { typ } = body;

    if (typ === "profil") {
      const parsed = profilSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
      }
      const { name, email } = parsed.data;
      const existing = await prisma.user.findFirst({
        where: { email, id: { not: session.user.id } },
      });
      if (existing) {
        return NextResponse.json({ error: "E-Mail bereits vergeben" }, { status: 409 });
      }
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name, email },
      });
      return NextResponse.json({ success: true });
    }

    if (typ === "passwort") {
      const parsed = passwortSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user) return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });

      const korrekt = await bcrypt.compare(parsed.data.aktuell, user.password);
      if (!korrekt) {
        return NextResponse.json({ error: "Aktuelles Passwort ist falsch" }, { status: 400 });
      }
      const hash = await bcrypt.hash(parsed.data.neu, 12);
      await prisma.user.update({ where: { id: session.user.id }, data: { password: hash } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unbekannter Typ" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
