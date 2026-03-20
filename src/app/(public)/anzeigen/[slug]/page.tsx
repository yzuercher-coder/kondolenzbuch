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
      {/* Todesanzeige */}
      <div className="card p-6 md:p-8">
        <div className="flex gap-6 items-start">
          {anzeige.portraitUrl ? (
            <img
              src={anzeige.portraitUrl}
              alt={`${anzeige.vorname} ${anzeige.nachname}`}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border border-neutral-40 flex-shrink-0 shadow-f2"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-brand-10 border border-brand-30 flex-shrink-0 flex items-center justify-center text-brand-70 text-3xl font-semibold">
              {anzeige.vorname[0]}{anzeige.nachname[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-neutral-110">
              {anzeige.vorname} {anzeige.nachname}
            </h1>
            <p className="text-neutral-80 mt-1">
              {anzeige.geburtstag && `* ${formatDatum(anzeige.geburtstag)} · `}
              † {formatDatum(anzeige.sterbetag)}
            </p>
          </div>
        </div>

        {anzeige.trauerspruch && (
          <blockquote className="mt-6 border-l-3 border-brand-40 pl-4 text-neutral-90 italic bg-brand-10 py-3 rounded-r">
            {anzeige.trauerspruch}
          </blockquote>
        )}

        {anzeige.nachruf && (
          <div className="mt-6 text-neutral-100 whitespace-pre-wrap leading-relaxed text-sm">
            {anzeige.nachruf}
          </div>
        )}

        {anzeige.hinterbliebene && (
          <div className="mt-6 pt-5 border-t border-neutral-30">
            <p className="text-xs font-semibold text-neutral-70 uppercase tracking-wider mb-2">In tiefer Trauer</p>
            <p className="text-neutral-100 whitespace-pre-wrap text-sm">{anzeige.hinterbliebene}</p>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-neutral-30">
          <ShareButtons url={pageUrl} name={`${anzeige.vorname} ${anzeige.nachname}`} />
        </div>
      </div>

      {/* Kondolenz-Einträge */}
      <div>
        <h2 className="mb-4">
          Kondolenzeinträge
          <span className="ml-2 text-sm font-normal text-neutral-80">
            ({anzeige.kondolenzEintraege.length})
          </span>
        </h2>

        {anzeige.kondolenzEintraege.length === 0 ? (
          <div className="card p-8 text-center text-neutral-70">
            Noch keine Einträge vorhanden.
          </div>
        ) : (
          <div className="space-y-3">
            {anzeige.kondolenzEintraege.map((eintrag) => (
              <div key={eintrag.id} className="card p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-110">{eintrag.name}</span>
                    {eintrag.ort && <span className="text-neutral-80 text-sm">{eintrag.ort}</span>}
                    {eintrag.beziehung && <span className="badge-neutral">{eintrag.beziehung}</span>}
                  </div>
                  <span className="text-xs text-neutral-70 flex-shrink-0 ml-4">
                    {formatDatum(eintrag.createdAt)}
                  </span>
                </div>
                <p className="text-neutral-100 whitespace-pre-wrap text-sm leading-relaxed">
                  {eintrag.nachricht}
                </p>
                {eintrag.bildUrl && (
                  <img
                    src={eintrag.bildUrl}
                    alt={`Bild von ${eintrag.name}`}
                    className="mt-3 max-h-48 rounded border border-neutral-40 object-contain"
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
          <div className="px-5 py-3 bg-neutral-20 border-b border-neutral-40">
            <h3>Kondolenz hinterlassen</h3>
          </div>
          <div className="p-5">
            <KondolenzFormular todesanzeigeId={anzeige.id} moderationAktiv={anzeige.moderationAktiv} />
          </div>
        </div>
      )}

      {!kondolenzOffen && (
        <div className="card p-5 text-center text-neutral-70 text-sm">
          Das Kondolenzbuch ist geschlossen.
        </div>
      )}
    </div>
  );
}
