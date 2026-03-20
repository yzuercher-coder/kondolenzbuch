"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Eintrag {
  id: string;
  nachricht: string;
  bildUrl: string | null;
  editBis: Date;
  token: string;
}

interface Props {
  eintrag: Eintrag;
  slug: string;
}

export default function MeinEintragFormular({ eintrag, slug }: Props) {
  const router = useRouter();
  const [nachricht, setNachricht] = useState(eintrag.nachricht);
  const [bildUrl, setBildUrl] = useState<string | null>(eintrag.bildUrl);
  const [bildPreview, setBildPreview] = useState<string | null>(eintrag.bildUrl);
  const [state, setState] = useState<"idle" | "loading" | "geloescht" | "gespeichert" | "error">("idle");
  const [uploadLaeuft, setUploadLaeuft] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const editBisDatum = new Date(eintrag.editBis).toLocaleString("de-CH", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  async function handleBildUpload(file: File) {
    setUploadLaeuft(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/kondolenzen/upload", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) {
      setBildUrl(data.url);
      setBildPreview(URL.createObjectURL(file));
    }
    setUploadLaeuft(false);
  }

  async function speichern() {
    setState("loading");
    const res = await fetch(`/api/kondolenzen/${eintrag.id}/bearbeiten`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: eintrag.token, nachricht, bildUrl }),
    });
    setState(res.ok ? "gespeichert" : "error");
  }

  async function loeschen() {
    if (!confirm("Möchten Sie Ihren Eintrag wirklich löschen?")) return;
    setState("loading");
    const res = await fetch(`/api/kondolenzen/${eintrag.id}/bearbeiten`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: eintrag.token }),
    });
    if (res.ok) setState("geloescht");
    else setState("error");
  }

  if (state === "geloescht") {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="text-[#107C10] text-4xl">✓</div>
        <p className="font-semibold text-neutral-110">Eintrag gelöscht</p>
        <p className="text-sm text-neutral-70">Ihr Eintrag wurde erfolgreich entfernt.</p>
        <a href={`/anzeigen/${slug}`} className="btn-secondary mt-2 inline-block">Zur Trauerseite</a>
      </div>
    );
  }

  if (state === "gespeichert") {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="text-[#107C10] text-4xl">✓</div>
        <p className="font-semibold text-neutral-110">Änderungen gespeichert</p>
        <p className="text-sm text-neutral-70">Ihr Eintrag wird nach erneuter Prüfung freigeschaltet.</p>
        <a href={`/anzeigen/${slug}`} className="btn-secondary mt-2 inline-block">Zur Trauerseite</a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-70">
        Bearbeitbar bis: <strong>{editBisDatum}</strong>
      </p>

      <div>
        <label className="label">Kondolenz-Text</label>
        <textarea
          value={nachricht}
          onChange={(e) => setNachricht(e.target.value)}
          rows={6}
          className="input resize-none"
        />
      </div>

      <div>
        <label className="label">Bild (optional)</label>
        {bildPreview ? (
          <div className="flex items-start gap-3">
            <img src={bildPreview} alt="Vorschau" className="w-24 h-24 object-cover rounded border border-neutral-40" />
            <button
              type="button"
              onClick={() => { setBildUrl(null); setBildPreview(null); }}
              className="text-xs text-neutral-70 hover:text-[#A4262C]"
            >
              Entfernen
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadLaeuft}
            className="btn-secondary text-sm"
          >
            {uploadLaeuft ? "Wird hochgeladen..." : "Bild hochladen"}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleBildUpload(e.target.files[0])}
        />
      </div>

      {state === "error" && (
        <p className="text-sm text-[#A4262C] bg-[#FDE7E9] px-3 py-2 rounded">
          Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={speichern}
          disabled={state === "loading" || nachricht.trim().length < 10}
          className="btn-primary"
        >
          {state === "loading" ? "Wird gespeichert..." : "Änderungen speichern"}
        </button>
        <button
          onClick={loeschen}
          disabled={state === "loading"}
          className="btn-danger"
        >
          Eintrag löschen
        </button>
      </div>
    </div>
  );
}
