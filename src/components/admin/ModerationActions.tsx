"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  eintragId: string;
  status: string;
}

export default function ModerationActions({ eintragId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/kondolenzen/${eintragId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  async function deleteEintrag() {
    if (!confirm("Eintrag wirklich löschen?")) return;
    setLoading(true);
    await fetch(`/api/kondolenzen/${eintragId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex gap-2 pt-3 border-t border-neutral-30">
      {status !== "FREIGEGEBEN" && (
        <button onClick={() => updateStatus("FREIGEGEBEN")} disabled={loading} className="btn-primary">
          ✓ Freigeben
        </button>
      )}
      {status !== "ABGELEHNT" && (
        <button onClick={() => updateStatus("ABGELEHNT")} disabled={loading} className="btn-secondary">
          Ablehnen
        </button>
      )}
      {status === "FREIGEGEBEN" && (
        <button onClick={() => updateStatus("AUSSTEHEND")} disabled={loading} className="btn-secondary">
          Zurückstellen
        </button>
      )}
      <button onClick={deleteEintrag} disabled={loading} className="btn-danger ml-auto">
        Löschen
      </button>
    </div>
  );
}
