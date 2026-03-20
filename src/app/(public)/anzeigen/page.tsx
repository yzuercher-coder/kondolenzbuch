import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDatum } from "@/lib/utils";

export const revalidate = 60;

export default async function AnzeigenListePage() {
  // Auto-Archivierung: abgelaufene Todesanzeigen beim Seitenaufruf archivieren
  await prisma.todesanzeige.updateMany({
    where: { status: "AKTIV", kondolenzBis: { lt: new Date() } },
    data: { status: "ARCHIVIERT" },
  });

  const anzeigen = await prisma.todesanzeige.findMany({
    where: { status: "AKTIV" },
    orderBy: { sterbetag: "desc" },
  });

  return (
    <div>
      <h2 className="mb-5">Kondolenzbücher</h2>

      {anzeigen.length === 0 ? (
        <div className="card p-10 text-center text-neutral-80">
          Keine Kondolenzbücher vorhanden.
        </div>
      ) : (
        <div className="grid gap-3">
          {anzeigen.map((anzeige) => (
            <Link
              key={anzeige.id}
              href={`/anzeigen/${anzeige.slug}`}
              className="card p-4 flex gap-4 items-center hover:shadow-f4 transition-shadow"
            >
              {anzeige.portraitUrl ? (
                <img
                  src={anzeige.portraitUrl}
                  alt={`${anzeige.vorname} ${anzeige.nachname}`}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-neutral-40"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-brand-10 border border-brand-30 flex-shrink-0 flex items-center justify-center text-brand-70 text-lg font-semibold">
                  {anzeige.vorname[0]}{anzeige.nachname[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-neutral-110 text-base">
                  {anzeige.vorname} {anzeige.nachname}
                </p>
                <p className="text-sm text-neutral-80 mt-0.5">
                  {anzeige.geburtstag && `* ${formatDatum(anzeige.geburtstag)} · `}
                  † {formatDatum(anzeige.sterbetag)}
                </p>
                {anzeige.trauerspruch && (
                  <p className="text-sm text-neutral-90 mt-1 italic line-clamp-1">
                    {anzeige.trauerspruch}
                  </p>
                )}
              </div>
              <span className="ml-auto text-neutral-60 flex-shrink-0">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
