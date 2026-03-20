import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Täglich um 02:00 Uhr via Vercel Cron aufgerufen
// Absicherung via CRON_SECRET (Vercel setzt Authorization-Header automatisch)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const result = await prisma.todesanzeige.updateMany({
    where: {
      status: "AKTIV",
      kondolenzBis: { lt: new Date() },
    },
    data: { status: "ARCHIVIERT" },
  });

  return NextResponse.json({ archiviert: result.count });
}
