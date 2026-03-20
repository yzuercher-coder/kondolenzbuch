"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PortraitUpload from "./PortraitUpload";
import StimmungsbildUpload from "./StimmungsbildUpload";
import TodesanzeigeVorschau from "./TodesanzeigeVorschau";
import { useWatch } from "react-hook-form";

const schema = z.object({
  vorname: z.string().min(1, "Vorname erforderlich"),
  nachname: z.string().min(1, "Nachname erforderlich"),
  geburtstag: z.string().optional(),
  sterbetag: z.string().min(1, "Sterbetag erforderlich"),
  wohnort: z.string().optional(),
  trauerspruch: z.string().optional(),
  nachruf: z.string().optional(),
  hinterbliebene: z.string().optional(),
  abschiedsfeierDatum: z.string().optional(),
  abschiedsfeierOrt: z.string().optional(),
  abschiedsfeierBemerkungen: z.string().optional(),
  status: z.enum(["ENTWURF", "AKTIV", "ARCHIVIERT"]),
  kondolenzAktiv: z.boolean(),
  kondolenzBis: z.string().optional(),
  moderationAktiv: z.boolean(),
  benachrichtigungEmail: z.string().email("Ungültige E-Mail").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface Anzeige {
  id: string;
  vorname: string;
  nachname: string;
  geburtstag: Date | null;
  sterbetag: Date;
  portraitUrl: string | null;
  stimmungsbildUrl: string | null;
  wohnort: string | null;
  trauerspruch: string | null;
  nachruf: string | null;
  hinterbliebene: string | null;
  abschiedsfeierDatum: Date | null;
  abschiedsfeierOrt: string | null;
  abschiedsfeierBemerkungen: string | null;
  status: string;
  kondolenzAktiv: boolean;
  kondolenzBis: Date | null;
  moderationAktiv: boolean;
  benachrichtigungEmail: string | null;
}

interface Props {
  anzeige?: Anzeige;
}

function dateToInput(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export default function TodesanzeigeFormular({ anzeige }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [portraitUrl, setPortraitUrl] = useState<string>(anzeige?.portraitUrl ?? "");
  const [stimmungsbildUrl, setStimmungsbildUrl] = useState<string>(anzeige?.stimmungsbildUrl ?? "");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: anzeige
      ? {
          vorname: anzeige.vorname,
          nachname: anzeige.nachname,
          geburtstag: dateToInput(anzeige.geburtstag),
          sterbetag: dateToInput(anzeige.sterbetag),
          wohnort: anzeige.wohnort ?? "",
          trauerspruch: anzeige.trauerspruch ?? "",
          nachruf: anzeige.nachruf ?? "",
          hinterbliebene: anzeige.hinterbliebene ?? "",
          abschiedsfeierDatum: dateToInput(anzeige.abschiedsfeierDatum),
          abschiedsfeierOrt: anzeige.abschiedsfeierOrt ?? "",
          abschiedsfeierBemerkungen: anzeige.abschiedsfeierBemerkungen ?? "",
          status: anzeige.status as "ENTWURF" | "AKTIV" | "ARCHIVIERT",
          kondolenzAktiv: anzeige.kondolenzAktiv,
          kondolenzBis: dateToInput(anzeige.kondolenzBis),
          moderationAktiv: anzeige.moderationAktiv,
          benachrichtigungEmail: anzeige.benachrichtigungEmail ?? "",
        }
      : { status: "ENTWURF", kondolenzAktiv: true, moderationAktiv: true },
  });

  const watched = useWatch({ control });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      const url = anzeige ? `/api/todesanzeigen/${anzeige.id}` : "/api/todesanzeigen";
      const res = await fetch(url, {
        method: anzeige ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          portraitUrl: portraitUrl || null,
          stimmungsbildUrl: stimmungsbildUrl || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Fehler");
      }
      router.push("/todesanzeigen");
      router.refresh();
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Ein Fehler ist aufgetreten.");
    }
  }

  return (
    <div className="flex gap-6 items-start">
    {/* ── Linke Spalte: Formular ─────────────────────────────────── */}
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-1 min-w-0">

      {/* 1. Verstorbene Person */}
      <Section title="Verstorbene Person">
        <div className="flex gap-5 items-start">
          <PortraitUpload currentUrl={portraitUrl} onUpload={setPortraitUrl} />
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Vorname *" error={errors.vorname?.message}>
                <input {...register("vorname")} className="input" />
              </Field>
              <Field label="Nachname *" error={errors.nachname?.message}>
                <input {...register("nachname")} className="input" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Geburtsdatum">
                <input {...register("geburtstag")} type="date" className="input" />
              </Field>
              <Field label="Sterbedatum *" error={errors.sterbetag?.message}>
                <input {...register("sterbetag")} type="date" className="input" />
              </Field>
            </div>
            <Field label="Wohnort / Gemeinde" hint="Erscheint unter dem Namen auf der Kondolenzseite">
              <input {...register("wohnort")} className="input" placeholder="z.B. Zürich" />
            </Field>
          </div>
        </div>
      </Section>

      {/* 2. Stimmungsbild */}
      <Section title="Stimmungsbild">
        <p className="text-sm text-gray-500 -mt-1">
          Grosses Hintergrundbild der Kondolenzseite. Name und Lebensdaten werden darüber eingeblendet — wie eine gedruckte Todesanzeige.
        </p>
        <StimmungsbildUpload currentUrl={stimmungsbildUrl} onUpload={setStimmungsbildUrl} />
      </Section>

      {/* 3. Texte */}
      <Section title="Texte">
        <Field label="Trauerspruch / Bibelvers" hint="Wird im Bild-Overlay und auf der Kondolenzseite angezeigt">
          <input {...register("trauerspruch")} className="input" placeholder="z.B. «Ich bin die Auferstehung und das Leben.»" />
        </Field>
        <Field label="Nachruf">
          <textarea {...register("nachruf")} rows={6} className="input resize-none" placeholder="Persönliche Worte zum Gedenken…" />
        </Field>
        <Field label="In tiefer Trauer">
          <textarea
            {...register("hinterbliebene")}
            rows={3}
            className="input resize-none"
            placeholder="Namen der Hinterbliebenen (eine Person pro Zeile)"
          />
        </Field>
      </Section>

      {/* 4. Abschiedsfeier */}
      <Section title="Abschiedsfeier">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Datum der Abschiedsfeier">
            <input {...register("abschiedsfeierDatum")} type="date" className="input" />
          </Field>
          <Field label="Ort der Abschiedsfeier">
            <input {...register("abschiedsfeierOrt")} className="input" placeholder="z.B. Friedhof Sihlfeld, Zürich" />
          </Field>
        </div>
        <Field label="Weitere Angaben" hint="z.B. Uhrzeit, Hinweise zur Beerdigung">
          <textarea {...register("abschiedsfeierBemerkungen")} rows={3} className="input resize-none" placeholder="z.B. Beerdigung um 14:00 Uhr, im engsten Familienkreis" />
        </Field>
      </Section>

      {/* 5. Einstellungen */}
      <Section title="Einstellungen">
        <Field label="Veröffentlichungsstatus">
          <select {...register("status")} className="input">
            <option value="ENTWURF">Entwurf (nicht öffentlich)</option>
            <option value="AKTIV">Aktiv (öffentlich sichtbar)</option>
            <option value="ARCHIVIERT">Archiviert</option>
          </select>
        </Field>

        <div className="space-y-3 pt-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input {...register("kondolenzAktiv")} type="checkbox" className="w-4 h-4 accent-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Kondolenzbuch aktiv</p>
              <p className="text-xs text-gray-500">Besucher können Kondolenzen hinterlassen</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input {...register("moderationAktiv")} type="checkbox" className="w-4 h-4 accent-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Moderation aktiv</p>
              <p className="text-xs text-gray-500">Einträge werden vor Veröffentlichung geprüft</p>
            </div>
          </label>
        </div>

        <Field label="Kondolenzbuch offen bis">
          <input {...register("kondolenzBis")} type="date" className="input" />
        </Field>
        <Field label="Benachrichtigungs-E-Mail" error={errors.benachrichtigungEmail?.message}>
          <input
            {...register("benachrichtigungEmail")}
            type="email"
            className="input"
            placeholder="Bei neuen Kondolenzen benachrichtigen (optional)"
          />
        </Field>
      </Section>

      {serverError && (
        <div className="px-4 py-3 rounded-lg bg-red-50 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Wird gespeichert…" : anzeige ? "Änderungen speichern" : "Todesanzeige erstellen"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Abbrechen
        </button>
      </div>
    </form>

    {/* ── Rechte Spalte: Live-Vorschau ───────────────────────────── */}
    <div className="w-80 xl:w-96 flex-shrink-0 sticky top-6">
      <TodesanzeigeVorschau
        daten={{
          vorname: watched.vorname ?? "",
          nachname: watched.nachname ?? "",
          geburtstag: watched.geburtstag ?? "",
          sterbetag: watched.sterbetag ?? "",
          wohnort: watched.wohnort ?? "",
          trauerspruch: watched.trauerspruch ?? "",
          nachruf: watched.nachruf ?? "",
          hinterbliebene: watched.hinterbliebene ?? "",
          abschiedsfeierDatum: watched.abschiedsfeierDatum ?? "",
          abschiedsfeierOrt: watched.abschiedsfeierOrt ?? "",
          abschiedsfeierBemerkungen: watched.abschiedsfeierBemerkungen ?? "",
          portraitUrl: portraitUrl || undefined,
          stimmungsbildUrl: stimmungsbildUrl || undefined,
        }}
      />
    </div>
    </div>
  );
}
