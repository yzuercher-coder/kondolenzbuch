"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, User, Lock } from "lucide-react";

const profilSchema = z.object({
  name: z.string().min(2, "Name mindestens 2 Zeichen"),
  email: z.string().email("Ungültige E-Mail"),
});

const passwortSchema = z.object({
  aktuell: z.string().min(1, "Aktuelles Passwort erforderlich"),
  neu: z.string().min(8, "Mindestens 8 Zeichen"),
  bestaetigung: z.string(),
}).refine((d) => d.neu === d.bestaetigung, {
  message: "Passwörter stimmen nicht überein",
  path: ["bestaetigung"],
});

type ProfilData = z.infer<typeof profilSchema>;
type PasswortData = z.infer<typeof passwortSchema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <Icon className="w-4 h-4 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function EinstellungenPage() {
  const { data: session, update } = useSession();
  const [profilErfolg, setProfilErfolg] = useState(false);
  const [profilFehler, setProfilFehler] = useState<string | null>(null);
  const [pwErfolg, setPwErfolg] = useState(false);
  const [pwFehler, setPwFehler] = useState<string | null>(null);

  const profilForm = useForm<ProfilData>({
    resolver: zodResolver(profilSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  });

  const pwForm = useForm<PasswortData>({
    resolver: zodResolver(passwortSchema),
    defaultValues: { aktuell: "", neu: "", bestaetigung: "" },
  });

  async function onProfilSubmit(data: ProfilData) {
    setProfilErfolg(false);
    setProfilFehler(null);
    try {
      const res = await fetch("/api/einstellungen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typ: "profil", ...data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await update({ name: data.name, email: data.email });
      setProfilErfolg(true);
      setTimeout(() => setProfilErfolg(false), 3000);
    } catch (e: unknown) {
      setProfilFehler(e instanceof Error ? e.message : "Fehler");
    }
  }

  async function onPasswortSubmit(data: PasswortData) {
    setPwErfolg(false);
    setPwFehler(null);
    try {
      const res = await fetch("/api/einstellungen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typ: "passwort", ...data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPwErfolg(true);
      pwForm.reset();
      setTimeout(() => setPwErfolg(false), 3000);
    } catch (e: unknown) {
      setPwFehler(e instanceof Error ? e.message : "Fehler");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Einstellungen</h1>
        <p className="text-gray-500 mt-1">Profil und Passwort verwalten</p>
      </div>

      {/* Profil */}
      <Card title="Profil" icon={User}>
        <form onSubmit={profilForm.handleSubmit(onProfilSubmit)} className="space-y-4">
          <Field label="Name" error={profilForm.formState.errors.name?.message}>
            <input {...profilForm.register("name")} className="input" placeholder="Vollständiger Name" />
          </Field>
          <Field label="E-Mail-Adresse" error={profilForm.formState.errors.email?.message}>
            <input {...profilForm.register("email")} type="email" className="input" />
          </Field>
          {profilFehler && (
            <div className="px-4 py-3 rounded-lg bg-red-50 text-sm text-red-700">{profilFehler}</div>
          )}
          {profilErfolg && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" /> Profil gespeichert
            </div>
          )}
          <button
            type="submit"
            disabled={profilForm.formState.isSubmitting}
            className="btn-primary"
          >
            {profilForm.formState.isSubmitting ? "Wird gespeichert…" : "Speichern"}
          </button>
        </form>
      </Card>

      {/* Passwort */}
      <Card title="Passwort ändern" icon={Lock}>
        <form onSubmit={pwForm.handleSubmit(onPasswortSubmit)} className="space-y-4">
          <Field label="Aktuelles Passwort" error={pwForm.formState.errors.aktuell?.message}>
            <input {...pwForm.register("aktuell")} type="password" className="input" autoComplete="current-password" />
          </Field>
          <Field label="Neues Passwort" error={pwForm.formState.errors.neu?.message}>
            <input {...pwForm.register("neu")} type="password" className="input" autoComplete="new-password" />
            <p className="text-xs text-gray-400 mt-1">Mindestens 8 Zeichen</p>
          </Field>
          <Field label="Passwort bestätigen" error={pwForm.formState.errors.bestaetigung?.message}>
            <input {...pwForm.register("bestaetigung")} type="password" className="input" autoComplete="new-password" />
          </Field>
          {pwFehler && (
            <div className="px-4 py-3 rounded-lg bg-red-50 text-sm text-red-700">{pwFehler}</div>
          )}
          {pwErfolg && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" /> Passwort geändert
            </div>
          )}
          <button
            type="submit"
            disabled={pwForm.formState.isSubmitting}
            className="btn-primary"
          >
            {pwForm.formState.isSubmitting ? "Wird geändert…" : "Passwort ändern"}
          </button>
        </form>
      </Card>

      {/* System-Info */}
      <Card title="System" icon={Lock}>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Angemeldete E-Mail</dt>
            <dd className="font-medium text-gray-800">{session?.user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Rolle</dt>
            <dd>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                {(session?.user as { role?: string })?.role ?? "ADMIN"}
              </span>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Stack</dt>
            <dd className="text-gray-600">Next.js 15 · Prisma · Neon PostgreSQL</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
