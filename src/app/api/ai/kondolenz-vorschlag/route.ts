import { NextRequest, NextResponse } from "next/server";

const BEZIEHUNG_KONTEXT: Record<string, string> = {
  FREUND: "enger Freund",
  ARBEITSKOLLEGE: "langjähriger Arbeitskollege",
  NACHBAR: "guter Nachbar",
  FAMILIE: "Familienmitglied",
  BEKANNTER: "Bekannter",
  VEREIN: "Vereinskollege",
};

export async function POST(req: NextRequest) {
  const { vorname, nachname, beziehung, stichworte } = await req.json();

  if (!vorname || !nachname) return NextResponse.json({ error: "Name fehlt" }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) {
    await new Promise(r => setTimeout(r, 500));
    const demo = `${vorname} ${nachname} wird mir immer in guter Erinnerung bleiben. ${stichworte ? `Besonders ${stichworte} werde ich nie vergessen. ` : ""}In dieser schweren Zeit denke ich an die Familie und bin in Gedanken bei Ihnen.`;
    return NextResponse.json({ vorschlag: demo, demo: true });
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const beziehungText = BEZIEHUNG_KONTEXT[beziehung] ?? beziehung ?? "Person aus dem Umfeld";

  const prompt = `Du schreibst eine persönliche Kondolenz auf Deutsch (Schweizer Schreibweise, kein ß) für ein Online-Kondolenzbuch.

Verstorbene Person: ${vorname} ${nachname}
Beziehung des Kondolierenden: ${beziehungText}
${stichworte ? `Persönliche Details/Erinnerungen: ${stichworte}` : ""}

Schreibe eine würdevolle, persönliche Kondolenz (3–5 Sätze). Sie soll warm und ehrlich klingen — keine Floskeln. Adressiere sie an die Hinterbliebenen. Antworte NUR mit dem Kondolenztext, ohne Anrede, Gruss oder Erklärungen.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    return NextResponse.json({ vorschlag: text });
  } catch {
    return NextResponse.json({ error: "KI nicht verfügbar" }, { status: 500 });
  }
}
