import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  vorname: z.string().min(1).optional(),
  nachname: z.string().min(1).optional(),
  geburtstag: z.string().optional(),
  sterbetag: z.string().optional(),
  trauerspruch: z.string().optional(),
  nachruf: z.string().optional(),
  hinterbliebene: z.string().optional(),
  status: z.enum(["ENTWURF", "AKTIV", "ARCHIVIERT"]).optional(),
  kondolenzAktiv: z.boolean().optional(),
  kondolenzBis: z.string().optional(),
  moderationAktiv: z.boolean().optional(),
  benachrichtigungEmail: z.string().optional(),
  portraitUrl: z.string().nullable().optional(),
  stimmungsbildUrl: z.string().nullable().optional(),
  wohnort: z.string().optional(),
  abschiedsfeierDatum: z.string().optional(),
  abschiedsfeierOrt: z.string().optional(),
  abschiedsfeierBemerkungen: z.string().optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });

    const { geburtstag, sterbetag, kondolenzBis, benachrichtigungEmail, portraitUrl, stimmungsbildUrl, abschiedsfeierDatum, ...rest } = parsed.data;

    const anzeige = await prisma.todesanzeige.update({
      where: { id },
      data: {
        ...rest,
        ...(geburtstag !== undefined && { geburtstag: geburtstag ? new Date(geburtstag) : null }),
        ...(sterbetag && { sterbetag: new Date(sterbetag) }),
        ...(kondolenzBis !== undefined && { kondolenzBis: kondolenzBis ? new Date(kondolenzBis) : null }),
        ...(benachrichtigungEmail !== undefined && { benachrichtigungEmail: benachrichtigungEmail || null }),
        ...(portraitUrl !== undefined && { portraitUrl: portraitUrl || null }),
        ...(stimmungsbildUrl !== undefined && { stimmungsbildUrl: stimmungsbildUrl || null }),
        ...(abschiedsfeierDatum !== undefined && { abschiedsfeierDatum: abschiedsfeierDatum ? new Date(abschiedsfeierDatum) : null }),
      },
    });

    return NextResponse.json({ id: anzeige.id });
  } catch {
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { id } = await params;

  await prisma.todesanzeige.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
