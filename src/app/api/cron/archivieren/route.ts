import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail, jahresgedenkMail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  // UC-009: Abgelaufene Anzeigen archivieren
  const archivResult = await prisma.todesanzeige.updateMany({
    where: { status: "AKTIV", kondolenzBis: { lt: new Date() } },
    data: { status: "ARCHIVIERT" },
  });

  // UC-022: Jahresgedenk-E-Mails senden
  const heute = new Date();
  const tag   = heute.getDate();
  const monat = heute.getMonth() + 1;

  const jubilaeen = await prisma.todesanzeige.findMany({
    where: {
      benachrichtigungEmail: { not: null },
      sterbetag: { not: undefined },
    },
    include: {
      kondolenzEintraege: {
        where: { status: "FREIGEGEBEN" },
        orderBy: { createdAt: "asc" },
        take: 3,
        select: { name: true, nachricht: true },
      },
    },
  });

  let gedenkMails = 0;
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  for (const a of jubilaeen) {
    const st = new Date(a.sterbetag);
    const istJahrestag = st.getDate() === tag && (st.getMonth() + 1) === monat;
    const istNichtSelbstjahr = st.getFullYear() < heute.getFullYear();
    if (!istJahrestag || !istNichtSelbstjahr || !a.benachrichtigungEmail) continue;

    const empfaenger = a.benachrichtigungEmail.split(",").map(e => e.trim()).filter(Boolean);
    if (empfaenger.length === 0) continue;

    const mail = jahresgedenkMail({
      verstorbenerName: `${a.vorname} ${a.nachname}`,
      sterbejahr: st.getFullYear(),
      anzeigenUrl: `${baseUrl}/anzeigen/${a.slug}`,
      kondolenzAuszug: a.kondolenzEintraege.map(e => ({
        name: e.name,
        text: e.nachricht.slice(0, 150) + (e.nachricht.length > 150 ? "…" : ""),
      })),
    });

    sendMail({ to: empfaenger, ...mail }).catch(console.error);
    gedenkMails++;
  }

  return NextResponse.json({ archiviert: archivResult.count, gedenkMails });
}
