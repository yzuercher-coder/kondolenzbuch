"use client";

import { useState } from "react";
import { Sparkles, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type Stil = "WUERDEVOLL" | "RELIGIOES" | "MODERN" | "POETISCH";

interface Props {
  vorname: string;
  nachname: string;
  geburtstag: string;
  sterbetag: string;
  wohnort: string;
  onTrauerspruch: (text: string) => void;
  onNachruf: (text: string) => void;
  onStimmungsbild: (url: string) => void;
}

const STILE: { id: Stil; label: string }[] = [
  { id: "WUERDEVOLL", label: "Würdevoll" },
  { id: "RELIGIOES",  label: "Religiös"  },
  { id: "MODERN",     label: "Modern"    },
  { id: "POETISCH",   label: "Poetisch"  },
];

async function typewriterEffect(
  text: string,
  setter: (t: string) => void,
  delayMs = 12
) {
  for (let i = 1; i <= text.length; i++) {
    setter(text.slice(0, i));
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

export default function KiAssistent({
  vorname, nachname, geburtstag, sterbetag, wohnort,
  onTrauerspruch, onNachruf, onStimmungsbild,
}: Props) {
  const [stil, setStil]               = useState<Stil>("WUERDEVOLL");
  const [details, setDetails]         = useState("");
  const [laedt, setLaedt]             = useState(false);
  const [laedtBild, setLaedtBild]     = useState(false);
  const [fehler, setFehler]           = useState<string | null>(null);
  const [erfolg, setErfolg]           = useState<string | null>(null);
  const [bildErfolg, setBildErfolg]   = useState(false);

  const bereit = !!vorname && !!nachname && !!sterbetag;

  async function texteGenerieren() {
    setFehler(null);
    setErfolg(null);
    setLaedt(true);
    try {
      const res = await fetch("/api/ai/texte-generieren", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vorname, nachname, geburtstag, sterbetag, wohnort, stil, details }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Fehler bei der Generierung");
      }
      const data = await res.json();

      // Typewriter-Effekt für beide Felder parallel
      await Promise.all([
        typewriterEffect(data.trauerspruch ?? "", onTrauerspruch, 10),
        typewriterEffect(data.nachruf      ?? "", onNachruf,      6),
      ]);

      setErfolg(data.demo ? "Demo-Texte eingefügt (kein API Key)" : "Texte erfolgreich generiert");
    } catch (e: unknown) {
      setFehler(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLaedt(false);
    }
  }

  async function bildGenerieren() {
    setFehler(null);
    setBildErfolg(false);
    setLaedtBild(true);
    try {
      const res = await fetch("/api/ai/bild-generieren", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stil }),
      });
      if (!res.ok) throw new Error("Fehler beim Bild-Vorschlag");
      const { url } = await res.json();
      onStimmungsbild(url);
      setBildErfolg(true);
    } catch (e: unknown) {
      setFehler(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLaedtBild(false);
    }
  }

  return (
    <div className="rounded-xl border border-indigo-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-200 flex-shrink-0" />
        <span className="text-sm font-semibold text-white">KI-Assistent</span>
        <span className="ml-auto text-xs text-indigo-300 font-medium">Claude · Anthropic</span>
      </div>

      <div className="bg-indigo-50/40 p-5 space-y-4">
        {/* Stil-Auswahl */}
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Stil</p>
          <div className="flex gap-2 flex-wrap">
            {STILE.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStil(s.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  stil === s.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
            Details <span className="normal-case font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            placeholder="z.B. war Gärtner, liebte die Berge, Vater von 3 Kindern…"
          />
        </div>

        {/* Meldungen */}
        {fehler && (
          <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {fehler}
          </div>
        )}
        {erfolg && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {erfolg}
          </div>
        )}
        {bildErfolg && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Stimmungsbild vorgeschlagen — in Vorschau sichtbar
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={texteGenerieren}
            disabled={laedt || !bereit}
            title={!bereit ? "Vorname, Nachname und Sterbedatum sind erforderlich" : undefined}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {laedt ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {laedt ? "Generiere…" : "Texte generieren"}
          </button>

          <button
            type="button"
            onClick={bildGenerieren}
            disabled={laedtBild}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-indigo-600 border border-indigo-200 text-sm font-medium hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {laedtBild ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            {laedtBild ? "Suche Bild…" : "Stimmungsbild vorschlagen"}
          </button>
        </div>

        {!bereit && (
          <p className="text-xs text-gray-400">
            Vorname, Nachname und Sterbedatum eingeben um die KI zu aktivieren.
          </p>
        )}
      </div>
    </div>
  );
}
