import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({
  token: z.string(),
  nachricht: z.string().min(10).max(2000),
  bildUrl: z.string().nullable().optional(),
});

const deleteSchema = z.object({
  token: z.string(),
});

// ── PATCH: Eintrag bearbeiten ─────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });

  const { token, nachricht, bildUrl } = parsed.data;

  const eintrag = await prisma.kondolenzEintrag.findUnique({ where: { id } });

  if (!eintrag || eintrag.editToken !== token) {
    return NextResponse.json({ error: "Nicht gefunden oder ungültiger Token" }, { status: 404 });
  }

  if (!eintrag.editBis || new Date() > eintrag.editBis) {
    return NextResponse.json({ error: "Bearbeitungsfrist abgelaufen" }, { status: 403 });
  }

  // Nach Bearbeitung wieder auf AUSSTEHEND setzen (muss erneut freigegeben werden)
  await prisma.kondolenzEintrag.update({
    where: { id },
    data: {
      nachricht,
      bildUrl: bildUrl ?? null,
      status: "AUSSTEHEND",
      freigegebenAt: null,
    },
  });

  return NextResponse.json({ success: true });
}

// ── DELETE: Eintrag löschen ───────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });

  const { token } = parsed.data;

  const eintrag = await prisma.kondolenzEintrag.findUnique({ where: { id } });

  if (!eintrag || eintrag.editToken !== token) {
    return NextResponse.json({ error: "Nicht gefunden oder ungültiger Token" }, { status: 404 });
  }

  if (!eintrag.editBis || new Date() > eintrag.editBis) {
    return NextResponse.json({ error: "Bearbeitungsfrist abgelaufen" }, { status: 403 });
  }

  await prisma.kondolenzEintrag.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
