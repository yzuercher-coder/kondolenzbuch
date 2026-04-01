import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, zielsprache = "de" } = await req.json();
  if (!text) return NextResponse.json({ error: "Text fehlt" }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ uebersetzung: "[Demo] " + text.slice(0, 100) + "…", demo: true });
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Übersetze folgenden Text ins Deutsche (Schweizer Schreibweise). Antworte NUR mit der Übersetzung, ohne Erklärungen:

"${text}"`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });
    const uebersetzung = msg.content[0].type === "text" ? msg.content[0].text.trim() : text;
    return NextResponse.json({ uebersetzung });
  } catch {
    return NextResponse.json({ error: "Übersetzung nicht verfügbar" }, { status: 500 });
  }
}
