"use client";

import { useState } from "react";
import { Languages, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  text: string;
}

export default function UebersetzungButton({ text }: Props) {
  const [uebersetzung, setUebersetzung] = useState<string | null>(null);
  const [laedt, setLaedt]               = useState(false);
  const [offen, setOffen]               = useState(false);

  // Sprache erkennen: falls Text nur Deutsch enthält, Button nicht zeigen
  // Einfache Heuristik: wenn >80% ASCII + deutsche Sonderzeichen → wahrscheinlich DE
  const istWahrscheinlichDeutsch = /^[a-zA-ZäöüÄÖÜß\s\.,!?;:\-'"()0-9]+$/.test(text);
  if (istWahrscheinlichDeutsch) return null;

  async function uebersetzen() {
    if (uebersetzung) { setOffen(!offen); return; }
    setLaedt(true);
    try {
      const res = await fetch("/api/ai/uebersetzen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok) { setUebersetzung(data.uebersetzung); setOffen(true); }
    } finally {
      setLaedt(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={uebersetzen}
        disabled={laedt}
        className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 transition-colors disabled:opacity-50"
      >
        {laedt ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
        {laedt ? "Übersetze…" : uebersetzung ? (offen ? "Übersetzung ausblenden" : "Übersetzung anzeigen") : "Ins Deutsche übersetzen"}
        {uebersetzung && !laedt && (offen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </button>
      {uebersetzung && offen && (
        <div className="mt-2 pl-3 border-l-2 border-indigo-200 text-sm text-gray-600 italic">
          {uebersetzung}
        </div>
      )}
    </div>
  );
}
