"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface Props { id: string; name: string }

export default function UnternehmenActions({ id, name }: Props) {
  const router = useRouter();
  const [bestaetigung, setBestaetigung] = useState(false);
  const [laedt, setLaedt] = useState(false);

  async function loeschen() {
    setLaedt(true);
    await fetch(`/api/unternehmen/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (bestaetigung) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500">Sicher?</span>
        <button onClick={loeschen} disabled={laedt}
          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50">
          {laedt ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Ja, löschen"}
        </button>
        <button onClick={() => setBestaetigung(false)} className="text-xs text-gray-400 hover:text-gray-600">
          Abbrechen
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setBestaetigung(true)}
      className="text-gray-400 hover:text-red-500 transition-colors" title={`${name} löschen`}>
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
