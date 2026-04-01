import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { id } = await params;

  const anzeige = await prisma.todesanzeige.findUnique({
    where: { id },
    include: {
      kondolenzEintraege: {
        where: { status: "FREIGEGEBEN" },
        select: { nachricht: true, name: true },
      },
    },
  });

  if (!anzeige) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  if (anzeige.kondolenzEintraege.length < 2) {
    return NextResponse.json({ analyse: null, grund: "Zu wenige Einträge (mind. 2 benötigt)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      analyse: {
        eigenschaften: ["Herzlichkeit", "Hilfsbereitschaft", "Freundlichkeit"],
        stimmung: "Die Einträge vermitteln tiefe Anteilnahme und persönliche Verbundenheit.",
        abschluss: "Demo-Modus: Verbinden Sie einen ANTHROPIC_API_KEY für echte Analysen.",
        anzahl: anzeige.kondolenzEintraege.length,
      }
    });
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const texte = anzeige.kondolenzEintraege
    .slice(0, 30)
    .map(e => `"${e.nachricht.slice(0, 200)}"`)
    .join("\n");

  const prompt = `Analysiere diese ${anzeige.kondolenzEintraege.length} Kondolenz-Einträge für ${anzeige.vorname} ${anzeige.nachname} und antworte AUSSCHLIESSLICH mit einem JSON-Objekt:

${texte}

{
  "eigenschaften": ["max. 5 häufige Eigenschaften/Themen die der verstorbenen Person zugeschrieben werden"],
  "stimmung": "1-2 Sätze zur Gesamtstimmung der Kondolenzen",
  "abschluss": "Ein würdevoller Abschlusssatz (max. 30 Wörter)",
  "anzahl": ${anzeige.kondolenzEintraege.length}
}`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Kein JSON");
    const analyse = JSON.parse(match[0]);
    return NextResponse.json({ analyse });
  } catch {
    return NextResponse.json({ error: "Analyse nicht verfügbar" }, { status: 500 });
  }
}
