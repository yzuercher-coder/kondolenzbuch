import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDatum(date: Date | string | null | undefined): string {
  if (!date) return "";
  return format(new Date(date), "d. MMMM yyyy", { locale: de });
}

export function generateSlug(vorname: string, nachname: string): string {
  const base = `${vorname}-${nachname}`
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const timestamp = Date.now().toString(36);
  return `${base}-${timestamp}`;
}
