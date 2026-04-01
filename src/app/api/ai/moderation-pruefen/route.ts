import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { eintragId, nachricht, name } = await req.json();
  if (!eintragId || !nachricht) return NextResponse.json({ ok: false });

  if (!process.env.ANTHROPIC_API_KEY) {
    // Demo: alle als "Prüfen" einstufen
    await prisma.kondolenzEintrag.update({
      where: { id: eintragId },
      data: { kiEmpfehlung: "PRUEFEN", kiBegruendung: "Demo-Modus (kein API Key)" },
    });
    return NextResponse.json({ ok: true });
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `Du bist ein Moderations-Assistent für ein Schweizer Online-Kondolenzbuch.
Beurteile folgenden Kondolenz-Eintrag:

Name: ${name}
Text: "${nachricht}"

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt:
{
  "empfehlung": "FREIGEBEN" | "PRUEFEN" | "ABLEHNEN",
  "begruendung": "Kurze Begründung (max. 80 Zeichen)"
}

Kriterien:
- FREIGEBEN: Würdevoller, persönlicher Kondolenztext
- PRUEFEN: Unklar, sehr kurz, oder enthält Links/E-Mails
- ABLEHNEN: Spam, Werbung, beleidigende Sprache, völlig irrelevant`;

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Kein JSON");
    const { empfehlung, begruendung } = JSON.parse(match[0]);

    await prisma.kondolenzEintrag.update({
      where: { id: eintragId },
      data: { kiEmpfehlung: empfehlung, kiBegruendung: begruendung },
    });
  } catch (err) {
    console.error("KI-Moderation Fehler:", err);
  }

  return NextResponse.json({ ok: true });
}
