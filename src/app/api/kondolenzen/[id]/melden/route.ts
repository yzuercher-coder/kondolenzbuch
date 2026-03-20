import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  await prisma.kondolenzEintrag.update({
    where: { id },
    data: { gemeldet: true, gemeldedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
