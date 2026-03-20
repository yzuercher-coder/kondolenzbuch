import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail, neueKondolenzMail, kondolenzBestaetigung } from "@/lib/email";
import { z } from "zod";
import { randomUUID } from "crypto";

const schema = z.object({
  todesanzeigeId: z.string(),
  name: z.string().min(2),
  ort: z.string().optional(),
  beziehung: z.string().optional(),
  nachricht: z.string().min(10).max(2000),
  datenschutz: z.literal(true),
  email: z.string().email().optional().or(z.literal("")),
  bildUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }

    const { todesanzeigeId, datenschutz: _, email, bildUrl, ...data } = parsed.data;

    const anzeige = await prisma.todesanzeige.findUnique({
      where: { id: todesanzeigeId, status: "AKTIV" },
    });

    if (!anzeige || !anzeige.kondolenzAktiv) {
      return NextResponse.json({ error: "Kondolenzbuch nicht verfügbar" }, { status: 404 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    // UC-012: Edit-Token (48 Std. gültig)
    const editToken = randomUUID();
    const editBis = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const eintrag = await prisma.kondolenzEintrag.create({
      data: {
        ...data,
        email: email || null,
        bildUrl: bildUrl || null,
        todesanzeigeId,
        datenschutzZustimmung: true,
        status: anzeige.moderationAktiv ? "AUSSTEHEND" : "FREIGEGEBEN",
        freigegebenAt: anzeige.moderationAktiv ? null : new Date(),
        ipAdresse: ip,
        editToken,
        editBis,
      },
    });

    const verstorbenerName = `${anzeige.vorname} ${anzeige.nachname}`;

    // Bestätigungs-E-Mail an Einsender (mit Edit-Link)
    if (email) {
      const mail = kondolenzBestaetigung({
        verstorbenerName,
        kondolenzName: data.name,
        editUrl: `${baseUrl}/mein-eintrag/${editToken}`,
        editBis,
        moderationAktiv: anzeige.moderationAktiv,
      });
      sendMail({ to: email, ...mail }).catch(console.error);
    }

    // Benachrichtigung an Bestatter-Empfänger
    if (anzeige.benachrichtigungEmail) {
      const empfaenger = anzeige.benachrichtigungEmail
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      if (empfaenger.length > 0) {
        const mail = neueKondolenzMail({
          verstorbenerName,
          kondolenzName: data.name,
          kondolenzText: data.nachricht.slice(0, 300) + (data.nachricht.length > 300 ? "…" : ""),
          adminUrl: `${baseUrl}/kondolenzen?filter=ausstehend`,
        });
        sendMail({ to: empfaenger, ...mail }).catch(console.error);
      }
    }

    return NextResponse.json({ id: eintrag.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
