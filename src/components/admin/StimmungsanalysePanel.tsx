"use client";

import { useState } from "react";
import { BarChart2, Loader2, Sparkles } from "lucide-react";

interface Analyse {
  eigenschaften: string[];
  stimmung: string;
  abschluss: string;
  anzahl: number;
}

export default function StimmungsanalysePanel({ todesanzeigeId }: { todesanzeigeId: string }) {
  const [analyse, setAnalyse] = useState<Analyse | null>(null);
  const [grund, setGrund]     = useState<string | null>(null);
  const [laedt, setLaedt]     = useState(false);
  const [fehler, setFehler]   = useState<string | null>(null);

  async function laden() {
    setLaedt(true);
    setFehler(null);
    try {
      const res = await fetch(`/api/ai/stimmungsanalyse/${todesanzeigeId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.grund) { setGrund(data.grund); return; }
      setAnalyse(data.analyse);
    } catch (e: unknown) {
      setFehler(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLaedt(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-gray-700">Stimmungsanalyse</h3>
        </div>
        {!analyse && (
          <button
            onClick={laden}
            disabled={laedt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {laedt ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {laedt ? "Analysiere…" : "Analyse starten"}
          </button>
        )}
      </div>
      <div className="p-5">
        {!analyse && !laedt && !fehler && !grund && (
          <p className="text-sm text-gray-400 text-center py-4">
            KI analysiert die Kondolenzeinträge und erstellt ein Erinnerungsprofil.
          </p>
        )}
        {grund && <p className="text-sm text-gray-400 text-center py-4">{grund}</p>}
        {fehler && <p className="text-sm text-red-500 text-center py-4">{fehler}</p>}
        {analyse && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Häufige Eigenschaften · {analyse.anzahl} Einträge
              </p>
              <div className="flex flex-wrap gap-2">
                {analyse.eigenschaften.map((e) => (
                  <span key={e} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Stimmung</p>
              <p className="text-sm text-gray-700">{analyse.stimmung}</p>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm text-gray-600 italic">{analyse.abschluss}</p>
            </div>
            <button
              onClick={() => { setAnalyse(null); setGrund(null); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Neu analysieren
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
