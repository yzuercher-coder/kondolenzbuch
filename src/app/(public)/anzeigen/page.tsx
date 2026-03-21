import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDatum } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ firma?: string }>;
}

export default async function AnzeigenListePage({ searchParams }: Props) {
  const { firma } = await searchParams;

  // Abgelaufene Anzeigen automatisch archivieren
  await prisma.todesanzeige.updateMany({
    where: { status: "AKTIV", kondolenzBis: { lt: new Date() } },
    data: { status: "ARCHIVIERT" },
  });

  // Unternehmen-Filter
  const unternehmenFilter = firma
    ? { unternehmen: { slug: firma } }
    : {};

  const [anzeigen, alleUnternehmen] = await Promise.all([
    prisma.todesanzeige.findMany({
      where: { status: "AKTIV", ...unternehmenFilter },
      orderBy: { sterbetag: "desc" },
      include: { unternehmen: { select: { name: true, slug: true } } },
    }),
    prisma.unternehmen.findMany({
      where: { todesanzeigen: { some: { status: "AKTIV" } } },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  const aktivesUnternehmen = firma
    ? alleUnternehmen.find((u) => u.slug === firma)
    : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kondolenzbücher</h1>
        {aktivesUnternehmen && (
          <p className="mt-1 text-indigo-600 font-medium">{aktivesUnternehmen.name}</p>
        )}
        {anzeigen.length > 0 && (
          <p className="mt-1 text-gray-500">
            {anzeigen.length} {anzeigen.length === 1 ? "Eintrag" : "Einträge"}
          </p>
        )}
      </div>

      {/* Unternehmens-Filter */}
      {alleUnternehmen.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <Link
            href="/anzeigen"
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !firma
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}
          >
            Alle
          </Link>
          {alleUnternehmen.map((u) => (
            <Link
              key={u.slug}
              href={`/anzeigen?firma=${u.slug}`}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                firma === u.slug
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
              }`}
            >
              {u.name}
            </Link>
          ))}
        </div>
      )}


      {anzeigen.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-16 text-center text-gray-400">
          Derzeit keine aktiven Kondolenzbücher vorhanden.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {anzeigen.map((anzeige) => {
            const bildUrl = anzeige.stimmungsbildUrl || anzeige.portraitUrl;
            const initials = `${anzeige.vorname[0]}${anzeige.nachname[0]}`;

            return (
              <Link
                key={anzeige.id}
                href={`/anzeigen/${anzeige.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Bildbereich */}
                <div className="relative h-52 bg-gradient-to-br from-indigo-50 to-violet-50 overflow-hidden">
                  {bildUrl ? (
                    <img
                      src={bildUrl}
                      alt={`${anzeige.vorname} ${anzeige.nachname}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl font-bold text-indigo-200 select-none">
                        {initials}
                      </span>
                    </div>
                  )}
                  {/* Gradient-Overlay unten */}
                  {bildUrl && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  )}
                </div>

                {/* Karteninhalt */}
                <div className="flex flex-col flex-1 p-5">
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {anzeige.vorname} {anzeige.nachname}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {anzeige.geburtstag && (
                      <span>* {formatDatum(anzeige.geburtstag)} · </span>
                    )}
                    <span>† {formatDatum(anzeige.sterbetag)}</span>
                  </p>

                  {anzeige.wohnort && (
                    <p className="mt-0.5 text-sm text-gray-400">{anzeige.wohnort}</p>
                  )}

                  {anzeige.trauerspruch && (
                    <p className="mt-3 text-sm text-gray-600 italic line-clamp-2 flex-1">
                      {anzeige.trauerspruch}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-600">
                      Kondolenzbuch öffnen
                    </span>
                    <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
