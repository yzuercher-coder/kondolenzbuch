"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, X } from "lucide-react";

interface Eintrag {
  id: string;
  name: string;
  beziehung: string | null;
  createdAt: Date;
  todesanzeige: { vorname: string; nachname: string };
}

export default function ModerationsTabelle({ eintraege }: { eintraege: Eintrag[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function moderieren(id: string, status: "FREIGEGEBEN" | "ABGELEHNT") {
    setLoadingId(id);
    await fetch(`/api/kondolenzen/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoadingId(null);
    router.refresh();
  }

  if (eintraege.length === 0) {
    return (
      <div className="px-5 py-12 text-center text-sm text-gray-400">
        Keine ausstehenden Einträge — alles erledigt ✓
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Name / Anzeige
          </th>
          <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Beziehung
          </th>
          <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Eingegangen
          </th>
          <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Aktionen
          </th>
        </tr>
      </thead>
      <tbody>
        {eintraege.map((e) => (
          <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
            <td className="px-5 py-3">
              <div className="font-medium text-gray-900">{e.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Für: {e.todesanzeige.vorname} {e.todesanzeige.nachname}
              </div>
            </td>
            <td className="px-5 py-3 text-gray-500 text-[13px]">{e.beziehung ?? "—"}</td>
            <td className="px-5 py-3 text-gray-400 text-xs">
              {new Date(e.createdAt).toLocaleString("de-CH", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </td>
            <td className="px-5 py-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => moderieren(e.id, "FREIGEGEBEN")}
                  disabled={loadingId === e.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-40"
                >
                  <Check className="w-3 h-3" />
                  Freigeben
                </button>
                <button
                  onClick={() => moderieren(e.id, "ABGELEHNT")}
                  disabled={loadingId === e.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40"
                >
                  <X className="w-3 h-3" />
                  Ablehnen
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
