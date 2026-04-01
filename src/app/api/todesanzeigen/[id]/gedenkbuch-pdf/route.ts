import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { GedenkbuchPdf } from "@/lib/gedenkbuchPdf";
import React from "react";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { id } = await params;

  const anzeige = await prisma.todesanzeige.findUnique({
    where: { id },
    include: {
      kondolenzEintraege: {
        where: { status: "FREIGEGEBEN" },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!anzeige) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  // KI-Zusammenfassung generieren
  let kiZusammenfassung = "";
  if (process.env.ANTHROPIC_API_KEY && anzeige.kondolenzEintraege.length > 0) {
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const texte = anzeige.kondolenzEintraege
        .slice(0, 20)
        .map((e, i) => `${i + 1}. ${e.name}: "${e.nachricht.slice(0, 200)}"`)
        .join("\n");

      const prompt = `Analysiere folgende Kondolenz-Einträge für ${anzeige.vorname} ${anzeige.nachname} und erstelle ein kurzes «Erinnerungsprofil» (max. 4 Sätze auf Deutsch): Was wird der verstorbenen Person am häufigsten zugeschrieben? Welche Eigenschaften, Erinnerungen und Gefühle dominieren? Schliesse mit einem würdevollen Satz ab.

${texte}

Antworte NUR mit dem Erinnerungsprofil-Text.`;

      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      });
      kiZusammenfassung = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    } catch (err) {
      console.error("KI-Zusammenfassung Fehler:", err);
    }
  } else if (anzeige.kondolenzEintraege.length > 0) {
    kiZusammenfassung = `${anzeige.kondolenzEintraege.length} Menschen haben ${anzeige.vorname} ${anzeige.nachname} ihre Anteilnahme ausgedrückt.`;
  }

  const pdfBuffer = await renderToBuffer(
    React.createElement(GedenkbuchPdf, { anzeige, kiZusammenfassung }) as unknown as React.ReactElement<any>
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Gedenkbuch-${anzeige.nachname}.pdf"`,
    },
  });
}
