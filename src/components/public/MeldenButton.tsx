"use client";

import { useState } from "react";

interface Props {
  eintragId: string;
}

export default function MeldenButton({ eintragId }: Props) {
  const [state, setState] = useState<"idle" | "confirm" | "done" | "error">("idle");

  async function melden() {
    try {
      const res = await fetch(`/api/kondolenzen/${eintragId}/melden`, { method: "POST" });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <span className="text-xs text-neutral-70">✓ Gemeldet — wird geprüft</span>;
  }

  if (state === "confirm") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-80">Diesen Eintrag melden?</span>
        <button onClick={melden} className="text-xs text-[#A4262C] hover:underline font-medium">Ja, melden</button>
        <button onClick={() => setState("idle")} className="text-xs text-neutral-70 hover:underline">Abbrechen</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setState("confirm")}
      className="text-xs text-neutral-60 hover:text-neutral-90 transition-colors"
      title="Unangemessenen Eintrag melden"
    >
      Melden
    </button>
  );
}
