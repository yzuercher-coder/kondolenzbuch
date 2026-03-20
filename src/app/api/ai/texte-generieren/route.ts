import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const STIL_ANWEISUNGEN: Record<string, string> = {
  WUERDEVOLL: "würdevoll, klassisch, zeitlos – ohne religiöse Bezüge, ruhige Sprache",
  RELIGIOES:  "religiös, christlich geprägt – mit passendem Bibelvers oder Gebet",
  MODERN:     "modern, direkt, persönlich – warm und ohne Floskeln",
  POETISCH:   "poetisch, bildreich – mit Naturmetaphern und viel Gefühl",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { vorname, nachname, geburtstag, sterbetag, wohnort, stil, details } =
    await req.json();

  if (!vorname || !nachname || !sterbetag)
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });

  // ── Demo-Modus ohne API Key ──────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({
      trauerspruch: `«In Liebe und Dankbarkeit gedenken wir deines Lebens.»`,
      nachruf: `${vorname} ${nachname} hat unser Leben auf vielfältige Weise bereichert. Mit Herzlichkeit, Güte und Lebensfreude hinterliess ${vorname} tiefe Spuren in unseren Herzen. Wir werden ihn stets in liebevoller Erinnerung behalten und sein Andenken in Ehren halten. Der Schmerz über seinen Verlust ist gross – ebenso gross wie die Dankbarkeit für alles, was er uns gegeben hat.`,
      demo: true,
    });
  }

  // ── Echte KI-Generierung ─────────────────────────────────────────────────
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const alterInJahren =
    geburtstag
      ? Math.floor(
          (new Date(sterbetag).getTime() - new Date(geburtstag).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : null;

  const prompt = `Du bist Experte für würdevolle Todesanzeigen auf Schweizer Bestattungsportalen.
Schreibe auf Deutsch (Schweizer Schreibweise: kein ß).

Verstorbene Person:
- Name: ${vorname} ${nachname}${geburtstag ? `\n- Geboren: ${new Date(geburtstag).toLocaleDateString("de-CH")}` : ""}
- Gestorben: ${new Date(sterbetag).toLocaleDateString("de-CH")}${alterInJahren ? `\n- Alter: ${alterInJahren} Jahre` : ""}${wohnort ? `\n- Wohnort: ${wohnort}` : ""}${details ? `\n- Persönliche Details: ${details}` : ""}

Stil: ${STIL_ANWEISUNGEN[stil] ?? STIL_ANWEISUNGEN.WUERDEVOLL}

Antworte AUSSCHLIESSLICH mit einem gültigen JSON-Objekt (kein Markdown, keine Kommentare):
{
  "trauerspruch": "Kurzer Trauerspruch oder Zitat, 1–2 Zeilen, in Schweizer Anführungszeichen «»",
  "nachruf": "Persönlicher Nachruf, 3–5 Sätze, würdevoll und warmherzig"
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text.trim() : "{}";

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Kein JSON in Antwort");

    const parsed = JSON.parse(match[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("KI-Fehler Texte:", err);
    return NextResponse.json(
      { error: "KI-Service momentan nicht verfügbar." },
      { status: 500 }
    );
  }
}
