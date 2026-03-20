"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name erforderlich"),
  email: z.string().email("Ungültige E-Mail"),
  password: z.string().min(8, "Mindestens 8 Zeichen"),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

type FormData = z.infer<typeof schema>;

export default function BenutzerFormular() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "ADMIN" },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      const res = await fetch("/api/benutzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Fehler");
      }
      router.push("/benutzer");
      router.refresh();
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Ein Fehler ist aufgetreten.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
      <div className="card overflow-hidden">
        <div className="px-5 py-3 bg-neutral-20 border-b border-neutral-40">
          <h3>Benutzerdaten</h3>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label">Name *</label>
            <input {...register("name")} className="input" placeholder="Vor- und Nachname" />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">E-Mail-Adresse *</label>
            <input {...register("email")} type="email" className="input" />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Passwort *</label>
            <input {...register("password")} type="password" className="input" placeholder="Mindestens 8 Zeichen" />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>
          <div>
            <label className="label">Rolle</label>
            <select {...register("role")} className="input">
              <option value="ADMIN">Admin (Bestatter)</option>
              <option value="SUPER_ADMIN">Super-Admin</option>
            </select>
          </div>
        </div>
      </div>

      {serverError && (
        <div className="px-4 py-3 rounded bg-[#FDE7E9] text-sm text-[#A4262C]">{serverError}</div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Wird erstellt..." : "Benutzer erstellen"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Abbrechen
        </button>
      </div>
    </form>
  );
}
