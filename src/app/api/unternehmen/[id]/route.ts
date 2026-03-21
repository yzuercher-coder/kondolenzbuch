import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({
  name:    z.string().min(2),
  website: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().optional(),
});

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { id } = await params;
  const u = await prisma.unternehmen.findUnique({
    where: { id },
    include: {
      benutzer:      { select: { id: true, name: true, email: true, role: true } },
      todesanzeigen: { select: { id: true, vorname: true, nachname: true, status: true }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!u) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json(u);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, website, logoUrl } = parsed.data;
  const u = await prisma.unternehmen.update({
    where: { id },
    data: { name, website: website || null, logoUrl: logoUrl || null },
  });
  return NextResponse.json(u);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { id } = await params;
  await prisma.unternehmen.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
