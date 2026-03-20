"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PortraitUpload from "./PortraitUpload";
import StimmungsbildUpload from "./StimmungsbildUpload";

const schema = z.object({
  vorname: z.string().min(1, "Vorname erforderlich"),
  nachname: z.string().min(1, "Nachname erforderlich"),
  geburtstag: z.string().optional(),
  sterbetag: z.string().min(1, "Sterbetag erforderlich"),
  trauerspruch: z.string().optional(),
  nachruf: z.string().optional(),
  hinterbliebene: z.string().optional(),
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
  trauerspruch: string | null;
  nachruf: string | null;
  hinterbliebene: string | null;
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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3 bg-neutral-20 border-b border-neutral-40">
        <h3>{title}</h3>
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
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: anzeige
      ? {
          vorname: anzeige.vorname,
          nachname: anzeige.nachname,
          geburtstag: dateToInput(anzeige.geburtstag),
          sterbetag: dateToInput(anzeige.sterbetag),
          trauerspruch: anzeige.trauerspruch ?? "",
          nachruf: anzeige.nachruf ?? "",
          hinterbliebene: anzeige.hinterbliebene ?? "",
          status: anzeige.status as "ENTWURF" | "AKTIV" | "ARCHIVIERT",
          kondolenzAktiv: anzeige.kondolenzAktiv,
          kondolenzBis: dateToInput(anzeige.kondolenzBis),
          moderationAktiv: anzeige.moderationAktiv,
          benachrichtigungEmail: anzeige.benachrichtigungEmail ?? "",
        }
      : { status: "ENTWURF", kondolenzAktiv: true, moderationAktiv: true },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      const url = anzeige ? `/api/todesanzeigen/${anzeige.id}` : "/api/todesanzeigen";
      const res = await fetch(url, {
        method: anzeige ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, portraitUrl: portraitUrl || null, stimmungsbildUrl: stimmungsbildUrl || null }),
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <Section title="Verstorbene Person">
        <PortraitUpload currentUrl={portraitUrl} onUpload={setPortraitUrl} />
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
      </Section>

      <Section title="Stimmungsbild">
        <p className="text-sm text-gray-500 -mt-1">Grosses Bild das oben auf der Kondolenzseite erscheint (z.B. Landschaft, Blumen, Kerze).</p>
        <StimmungsbildUpload currentUrl={stimmungsbildUrl} onUpload={setStimmungsbildUrl} />
      </Section>

      <Section title="Texte">
        <Field label="Trauerspruch">
          <input {...register("trauerspruch")} className="input" placeholder="z.B. ein Zitat oder Bibelvers" />
        </Field>
        <Field label="Nachruf">
          <textarea {...register("nachruf")} rows={6} className="input resize-none" />
        </Field>
        <Field label="Hinterbliebene">
          <textarea {...register("hinterbliebene")} rows={3} className="input resize-none" placeholder="Namen der Hinterbliebenen" />
        </Field>
      </Section>

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
            <input {...register("kondolenzAktiv")} type="checkbox" className="w-4 h-4 accent-brand-60" />
            <div>
              <p className="text-sm font-semibold text-neutral-110">Kondolenzbuch aktiv</p>
              <p className="text-xs text-neutral-80">Besucher können Kondolenzen hinterlassen</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input {...register("moderationAktiv")} type="checkbox" className="w-4 h-4 accent-brand-60" />
            <div>
              <p className="text-sm font-semibold text-neutral-110">Moderation aktiv</p>
              <p className="text-xs text-neutral-80">Einträge werden vor Veröffentlichung geprüft</p>
            </div>
          </label>
        </div>

        <Field label="Kondolenzbuch offen bis">
          <input {...register("kondolenzBis")} type="date" className="input" />
        </Field>
        <Field label="Benachrichtigungs-E-Mail" error={errors.benachrichtigungEmail?.message}>
          <input {...register("benachrichtigungEmail")} type="email" className="input" placeholder="Bei neuen Kondolenzen benachrichtigen (optional)" />
        </Field>
      </Section>

      {serverError && (
        <div className="px-4 py-3 rounded bg-[#FDE7E9] text-sm text-[#A4262C]">
          {serverError}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Wird gespeichert..." : anzeige ? "Änderungen speichern" : "Todesanzeige erstellen"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Abbrechen
        </button>
      </div>
    </form>
  );
}
