import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDatum } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export const revalidate = 60;

export default async function AnzeigenListePage() {
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
      <h2 className="mb-6 text-gray-900">Kondolenzbücher</h2>

      {anzeigen.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          Keine Kondolenzbücher vorhanden.
        </div>
      ) : (
        <div className="grid gap-3">
          {anzeigen.map((anzeige) => (
            <Link
              key={anzeige.id}
              href={`/anzeigen/${anzeige.slug}`}
              className="card p-5 flex gap-4 items-center hover:shadow-md hover:border-gray-200 transition-all"
            >
              {anzeige.portraitUrl ? (
                <img
                  src={anzeige.portraitUrl}
                  alt={`${anzeige.vorname} ${anzeige.nachname}`}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-gray-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-500 text-lg font-semibold">
                  {anzeige.vorname[0]}{anzeige.nachname[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-[17px]">
                  {anzeige.vorname} {anzeige.nachname}
                </p>
                <p className="text-gray-500 mt-0.5">
                  {anzeige.geburtstag && `* ${formatDatum(anzeige.geburtstag)} · `}
                  † {formatDatum(anzeige.sterbetag)}
                </p>
                {anzeige.trauerspruch && (
                  <p className="text-gray-400 mt-1 italic line-clamp-1 text-[15px]">
                    {anzeige.trauerspruch}
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
