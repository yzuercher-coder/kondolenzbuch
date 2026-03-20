import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  vorname: z.string().min(1),
  nachname: z.string().min(1),
  geburtstag: z.string().optional(),
  sterbetag: z.string().min(1),
  trauerspruch: z.string().optional(),
  nachruf: z.string().optional(),
  hinterbliebene: z.string().optional(),
  status: z.enum(["ENTWURF", "AKTIV", "ARCHIVIERT"]),
  kondolenzAktiv: z.boolean(),
  kondolenzBis: z.string().optional(),
  moderationAktiv: z.boolean(),
  benachrichtigungEmail: z.string().optional(),
  portraitUrl: z.string().nullable().optional(),
  stimmungsbildUrl: z.string().nullable().optional(),
  wohnort: z.string().optional(),
  abschiedsfeierDatum: z.string().optional(),
  abschiedsfeierOrt: z.string().optional(),
  abschiedsfeierBemerkungen: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });

    const { geburtstag, sterbetag, kondolenzBis, benachrichtigungEmail, portraitUrl, stimmungsbildUrl, abschiedsfeierDatum, ...rest } = parsed.data;

    const anzeige = await prisma.todesanzeige.create({
      data: {
        ...rest,
        slug: generateSlug(rest.vorname, rest.nachname),
        geburtstag: geburtstag ? new Date(geburtstag) : null,
        sterbetag: new Date(sterbetag),
        kondolenzBis: kondolenzBis ? new Date(kondolenzBis) : null,
        benachrichtigungEmail: benachrichtigungEmail || null,
        portraitUrl: portraitUrl ?? null,
        stimmungsbildUrl: stimmungsbildUrl ?? null,
        abschiedsfeierDatum: abschiedsfeierDatum ? new Date(abschiedsfeierDatum) : null,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ id: anzeige.id, slug: anzeige.slug }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
