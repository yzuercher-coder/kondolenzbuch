"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import KondolenzAssistent from "./KondolenzAssistent";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name ist erforderlich"),
  email: z.string().email("Ungültige E-Mail").optional().or(z.literal("")),
  ort: z.string().optional(),
  beziehung: z.string().optional(),
  nachricht: z.string().min(10, "Bitte schreiben Sie mindestens 10 Zeichen").max(2000),
  datenschutz: z.literal(true, {
    errorMap: () => ({ message: "Bitte stimmen Sie der Datenschutzerklärung zu" }),
  }),
});

type FormData = z.infer<typeof schema>;

interface Props {
  todesanzeigeId: string;
  moderationAktiv: boolean;
  verstorbenerVorname?: string;
  verstorbenerNachname?: string;
}

export default function KondolenzFormular({ todesanzeigeId, moderationAktiv, verstorbenerVorname, verstorbenerNachname }: Props) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [vorschau, setVorschau] = useState(false);

  // UC-015: Bild-Upload
  const [bildUrl, setBildUrl] = useState<string | null>(null);
  const [bildPreview, setBildPreview] = useState<string | null>(null);
  const [uploadFehler, setUploadFehler] = useState<string | null>(null);
  const [uploadLaeuft, setUploadLaeuft] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const formValues = watch();

  async function handleBildUpload(file: File) {
    setUploadFehler(null);
    setUploadLaeuft(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/kondolenzen/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBildUrl(data.url);
      setBildPreview(URL.createObjectURL(file));
    } catch (e: unknown) {
      setUploadFehler(e instanceof Error ? e.message : "Upload fehlgeschlagen");
    } finally {
      setUploadLaeuft(false);
    }
  }

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      const res = await fetch("/api/kondolenzen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          todesanzeigeId,
          bildUrl: bildUrl ?? undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      reset();
      setBildUrl(null);
      setBildPreview(null);
      setVorschau(false);
    } catch {
      setServerError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      setVorschau(false);
    }
  }

  if (success) {
    return (
      <div className="flex items-start gap-3 p-4 rounded bg-[#DFF6DD] text-[#107C10]">
        <span className="text-lg leading-none">✓</span>
        <p className="text-sm">
          {moderationAktiv
            ? "Ihr Eintrag wurde eingereicht und wird nach Prüfung freigeschaltet. Vielen Dank."
            : "Ihr Eintrag wurde veröffentlicht. Vielen Dank."}
        </p>
      </div>
    );
  }

  // ── Vorschau-Ansicht (vor dem Absenden) ──────────────────────────────────
  if (vorschau) {
    return (
      <div className="space-y-4">
        <div className="bg-neutral-10 border border-neutral-40 rounded p-4 space-y-3">
          <p className="text-xs font-semibold text-neutral-70 uppercase tracking-wider">Vorschau Ihres Eintrags</p>
          <div>
            <span className="font-semibold text-neutral-110">{formValues.name}</span>
            {formValues.ort && <span className="text-neutral-80 text-sm ml-2">{formValues.ort}</span>}
            {formValues.beziehung && (
              <span className="ml-2 text-xs bg-neutral-30 text-neutral-80 px-2 py-0.5 rounded-full">{formValues.beziehung}</span>
            )}
          </div>
          <p className="text-neutral-100 whitespace-pre-wrap text-sm leading-relaxed">{formValues.nachricht}</p>
          {bildPreview && (
            <img
              src={bildPreview}
              alt="Ihr Bild"
              className="max-h-48 rounded border border-neutral-40 object-contain"
            />
          )}
        </div>

        {serverError && (
          <div className="px-3 py-2 rounded bg-[#FDE7E9] text-sm text-[#A4262C]">{serverError}</div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? "Wird eingereicht..." : "Jetzt einreichen"}
          </button>
          <button type="button" onClick={() => setVorschau(false)} className="btn-secondary">
            Bearbeiten
          </button>
        </div>
      </div>
    );
  }

  // ── Formular ──────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(() => setVorschau(true))} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Name *</label>
          <input {...register("name")} className="input" placeholder="Ihr Name" />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Ort</label>
          <input {...register("ort")} className="input" placeholder="Wohnort (optional)" />
        </div>
      </div>

      <div>
        <label className="label">E-Mail-Adresse</label>
        <input
          {...register("email")}
          type="email"
          className="input"
          placeholder="Für Benachrichtigung bei Freischaltung (optional)"
        />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>

      <div>
        <label className="label">Beziehung zur verstorbenen Person</label>
        <input
          {...register("beziehung")}
          className="input"
          placeholder="z.B. Freund, Arbeitskollege (optional)"
        />
      </div>

      {/* UC-017: KI-Kondolier-Assistent */}
      <KondolenzAssistent
        vorname={verstorbenerVorname ?? ""}
        nachname={verstorbenerNachname ?? ""}
        onVorschlag={(text) => setValue("nachricht", text)}
      />

      <div>
        <label className="label">Kondolenz *</label>
        <textarea
          {...register("nachricht")}
          rows={5}
          className="input resize-none"
          placeholder="Schreiben Sie hier Ihre Kondolenz..."
        />
        {errors.nachricht && <p className="field-error">{errors.nachricht.message}</p>}
      </div>

      {/* UC-015: Bild hinzufügen */}
      <div>
        <label className="label">Persönliches Bild (optional)</label>
        {bildPreview ? (
          <div className="flex items-start gap-3">
            <img
              src={bildPreview}
              alt="Vorschau"
              className="w-24 h-24 object-cover rounded border border-neutral-40"
            />
            <button
              type="button"
              onClick={() => { setBildUrl(null); setBildPreview(null); }}
              className="text-xs text-neutral-70 hover:text-[#A4262C]"
            >
              Entfernen
            </button>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadLaeuft}
              className="btn-secondary text-sm"
            >
              {uploadLaeuft ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border border-neutral-70 border-t-transparent rounded-full animate-spin" />
                  Wird hochgeladen...
                </span>
              ) : "Bild hochladen"}
            </button>
            <p className="text-xs text-neutral-70 mt-1">JPEG, PNG oder WebP · max. 5 MB</p>
          </div>
        )}
        {uploadFehler && <p className="field-error mt-1">{uploadFehler}</p>}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleBildUpload(e.target.files[0])}
        />
      </div>

      <div>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            {...register("datenschutz")}
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-brand-60 flex-shrink-0"
          />
          <span className="text-sm text-neutral-90">
            Ich stimme der Verarbeitung meiner Daten gemäss Datenschutzerklärung zu. *
          </span>
        </label>
        {errors.datenschutz && <p className="field-error mt-1">{errors.datenschutz.message}</p>}
      </div>

      {serverError && (
        <div className="px-3 py-2 rounded bg-[#FDE7E9] text-sm text-[#A4262C]">
          {serverError}
        </div>
      )}

      <button type="submit" className="btn-primary">
        Vorschau anzeigen
      </button>
    </form>
  );
}
