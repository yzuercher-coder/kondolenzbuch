"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const Schema = z.object({
  name:    z.string().min(2, "Mindestens 2 Zeichen"),
  website: z.string().url("Ungültige URL (mit https:// beginnen)").or(z.literal("")).optional(),
  logoUrl: z.string().optional(),
});
type FormData = z.infer<typeof Schema>;

interface Props {
  id?: string;
  initialData?: { name: string; website: string; logoUrl: string };
}

export default function UnternehmenFormular({ id, initialData }: Props) {
  const router = useRouter();
  const [fehler, setFehler] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: initialData ?? { name: "", website: "", logoUrl: "" },
  });

  async function onSubmit(data: FormData) {
    setFehler(null);
    const url    = id ? `/api/unternehmen/${id}` : "/api/unternehmen";
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setFehler(err.error ?? "Fehler beim Speichern");
      return;
    }

    router.push("/unternehmen");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Name *</label>
        <input {...register("name")} className="input" placeholder="Bestattung Muster AG" />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label">Website</label>
        <input {...register("website")} className="input" placeholder="https://www.beispiel.ch" />
        {errors.website && <p className="field-error">{errors.website.message}</p>}
      </div>

      <div>
        <label className="label">Logo-URL</label>
        <input {...register("logoUrl")} className="input" placeholder="https://..." />
        <p className="text-xs text-gray-400 mt-1">Link zum Logo-Bild (optional)</p>
      </div>

      {fehler && <p className="field-error">{fehler}</p>}

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {id ? "Speichern" : "Erstellen"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Abbrechen
        </button>
      </div>
    </form>
  );
}
