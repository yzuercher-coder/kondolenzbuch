import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
const Schema = z.object({
  name:    z.string().min(2),
  website: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const unternehmen = await prisma.unternehmen.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { benutzer: true, todesanzeigen: true } } },
  });
  return NextResponse.json(unternehmen);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, website, logoUrl } = parsed.data;
  const slug = name.toLowerCase()
    .replace(/[äöü]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Date.now();

  const unternehmen = await prisma.unternehmen.create({
    data: { name, slug, website: website || null, logoUrl: logoUrl || null },
  });
  return NextResponse.json(unternehmen, { status: 201 });
}
