"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Loader2, RefreshCw } from "lucide-react";

interface Props {
  vorname: string;
  nachname: string;
  onVorschlag: (text: string) => void;
}

const BEZIEHUNGEN = [
  { value: "FREUND",         label: "Freund / Freundin" },
  { value: "ARBEITSKOLLEGE", label: "Arbeitskollege/in" },
  { value: "NACHBAR",        label: "Nachbar/in" },
  { value: "FAMILIE",        label: "Familienmitglied" },
  { value: "BEKANNTER",      label: "Bekannte/r" },
  { value: "VEREIN",         label: "Vereinskollege/in" },
];

async function typewriterEffect(text: string, setter: (t: string) => void) {
  for (let i = 1; i <= text.length; i++) {
    setter(text.slice(0, i));
    await new Promise(r => setTimeout(r, 8));
  }
}

export default function KondolenzAssistent({ vorname, nachname, onVorschlag }: Props) {
  const [offen, setOffen]           = useState(false);
  const [beziehung, setBeziehung]   = useState("FREUND");
  const [stichworte, setStichworte] = useState("");
  const [laedt, setLaedt]           = useState(false);
  const [fehler, setFehler]         = useState<string | null>(null);

  async function generieren() {
    setFehler(null);
    setLaedt(true);
    try {
      const res = await fetch("/api/ai/kondolenz-vorschlag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vorname, nachname, beziehung, stichworte }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await typewriterEffect(data.vorschlag, onVorschlag);
      setOffen(false);
    } catch {
      setFehler("Vorschlag konnte nicht generiert werden.");
    } finally {
      setLaedt(false);
    }
  }

  return (
    <div className="rounded-xl border border-indigo-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOffen(!offen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-indigo-700">
          <Sparkles className="w-4 h-4" />
          Hilfe beim Schreiben
        </span>
        {offen ? (
          <ChevronUp className="w-4 h-4 text-indigo-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-indigo-400" />
        )}
      </button>

      {offen && (
        <div className="p-4 space-y-3 bg-white border-t border-indigo-100">
          <p className="text-xs text-gray-500">
            Geben Sie Ihre Beziehung zur verstorbenen Person an — die KI formuliert einen persönlichen Vorschlag.
          </p>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Beziehung</label>
            <select
              value={beziehung}
              onChange={e => setBeziehung(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {BEZIEHUNGEN.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Persönliche Erinnerung <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={stichworte}
              onChange={e => setStichworte(e.target.value)}
              placeholder="z.B. immer hilfsbereit, liebte die Berge…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {fehler && <p className="text-xs text-red-600">{fehler}</p>}

          <button
            type="button"
            onClick={generieren}
            disabled={laedt}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {laedt ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {laedt ? "Generiere…" : "Vorschlag generieren"}
          </button>
          <p className="text-xs text-gray-400">Der Text erscheint direkt im Nachricht-Feld und kann bearbeitet werden.</p>
        </div>
      )}
    </div>
  );
}
