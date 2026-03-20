import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { formatDatum } from "@/lib/utils";
import KondolenzFormular from "@/components/public/KondolenzFormular";
import ShareButtons from "@/components/public/ShareButtons";
import MeldenButton from "@/components/public/MeldenButton";

export const revalidate = 30;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AnzeigenDetailPage({ params }: Props) {
  const { slug } = await params;
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const pageUrl = `${proto}://${host}/anzeigen/${slug}`;

  const anzeige = await prisma.todesanzeige.findUnique({
    where: { slug, status: "AKTIV" },
    include: {
      kondolenzEintraege: {
        where: { status: "FREIGEGEBEN" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!anzeige) notFound();

  const kondolenzOffen =
    anzeige.kondolenzAktiv &&
    (!anzeige.kondolenzBis || new Date(anzeige.kondolenzBis) > new Date());

  return (
    <div className="space-y-6">
      {/* Stimmungsbild */}
      {anzeige.stimmungsbildUrl && (
        <div className="w-full h-56 md:h-72 rounded-2xl overflow-hidden shadow-sm">
          <img
            src={anzeige.stimmungsbildUrl}
            alt="Stimmungsbild"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Todesanzeige */}
      <div className="card p-6 md:p-8">
        <div className="flex gap-6 items-start">
          {anzeige.portraitUrl ? (
            <img
              src={anzeige.portraitUrl}
              alt={`${anzeige.vorname} ${anzeige.nachname}`}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border border-gray-100 flex-shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-50 border border-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-500 text-3xl font-semibold">
              {anzeige.vorname[0]}{anzeige.nachname[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              {anzeige.vorname} {anzeige.nachname}
            </h1>
            <p className="text-gray-500 mt-1.5">
              {anzeige.geburtstag && `* ${formatDatum(anzeige.geburtstag)} · `}
              † {formatDatum(anzeige.sterbetag)}
            </p>
          </div>
        </div>

        {anzeige.trauerspruch && (
          <blockquote className="mt-6 border-l-2 border-indigo-300 pl-4 text-gray-600 italic bg-indigo-50/50 py-3 pr-4 rounded-r-lg">
            {anzeige.trauerspruch}
          </blockquote>
        )}

        {anzeige.nachruf && (
          <div className="mt-6 text-gray-700 whitespace-pre-wrap leading-relaxed">
            {anzeige.nachruf}
          </div>
        )}

        {anzeige.hinterbliebene && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              In tiefer Trauer
            </p>
            <p className="text-gray-700 whitespace-pre-wrap">{anzeige.hinterbliebene}</p>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-gray-100">
          <ShareButtons url={pageUrl} name={`${anzeige.vorname} ${anzeige.nachname}`} />
        </div>
      </div>

      {/* Kondolenz-Einträge */}
      <div>
        <h2 className="mb-4">
          Kondolenzeinträge
          <span className="ml-2 text-base font-normal text-gray-400">
            ({anzeige.kondolenzEintraege.length})
          </span>
        </h2>

        {anzeige.kondolenzEintraege.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            Noch keine Einträge vorhanden.
          </div>
        ) : (
          <div className="space-y-3">
            {anzeige.kondolenzEintraege.map((eintrag) => (
              <div key={eintrag.id} className="card p-5">
                <div className="flex justify-between items-start mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{eintrag.name}</span>
                    {eintrag.ort && (
                      <span className="text-gray-500">{eintrag.ort}</span>
                    )}
                    {eintrag.beziehung && (
                      <span className="badge-neutral">{eintrag.beziehung}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 flex-shrink-0 ml-4">
                    {formatDatum(eintrag.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {eintrag.nachricht}
                </p>
                {eintrag.bildUrl && (
                  <img
                    src={eintrag.bildUrl}
                    alt={`Bild von ${eintrag.name}`}
                    className="mt-3 max-h-48 rounded-lg border border-gray-100 object-contain"
                  />
                )}
                <div className="mt-3 flex justify-end">
                  <MeldenButton eintragId={eintrag.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kondolenz-Formular */}
      {kondolenzOffen && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h3>Kondolenz hinterlassen</h3>
          </div>
          <div className="p-6">
            <KondolenzFormular
              todesanzeigeId={anzeige.id}
              moderationAktiv={anzeige.moderationAktiv}
            />
          </div>
        </div>
      )}

      {!kondolenzOffen && (
        <div className="card p-6 text-center text-gray-400">
          Das Kondolenzbuch ist geschlossen.
        </div>
      )}
    </div>
  );
}
