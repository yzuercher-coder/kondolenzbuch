import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["AUSSTEHEND", "FREIGEGEBEN", "ABGELEHNT"]),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });

  const eintrag = await prisma.kondolenzEintrag.update({
    where: { id },
    data: {
      status: parsed.data.status,
      freigegebenAt: parsed.data.status === "FREIGEGEBEN" ? new Date() : undefined,
    },
  });

  return NextResponse.json({ id: eintrag.id });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { id } = await params;
  await prisma.kondolenzEintrag.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
