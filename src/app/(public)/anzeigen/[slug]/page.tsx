import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { formatDatum } from "@/lib/utils";
import KondolenzFormular from "@/components/public/KondolenzFormular";
import ShareButtons from "@/components/public/ShareButtons";
import MeldenButton from "@/components/public/MeldenButton";
import UebersetzungButton from "@/components/public/UebersetzungButton";

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

      {/* ── HERO: Gedruckte Todesanzeige ─────────────────────────────────── */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-md"
           style={{ minHeight: "320px" }}>

        {/* Hintergrundbild oder Farb-Fallback */}
        {anzeige.stimmungsbildUrl ? (
          <img
            src={anzeige.stimmungsbildUrl}
            alt="Stimmungsbild"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        {/* Gradient-Overlay: oben transparent → unten dunkel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Portrait oben links */}
        {anzeige.portraitUrl && (
          <div className="absolute top-6 left-6">
            <img
              src={anzeige.portraitUrl}
              alt={`${anzeige.vorname} ${anzeige.nachname}`}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-white/40 shadow-lg"
            />
          </div>
        )}

        {/* Overlay-Text: unten */}
        <div className="relative z-10 flex flex-col justify-end px-6 md:px-8 pb-7 pt-32 md:pt-40">
          {anzeige.trauerspruch && (
            <p className="text-white/75 italic text-sm md:text-base mb-3 max-w-lg leading-relaxed">
              &laquo;{anzeige.trauerspruch}&raquo;
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight drop-shadow">
            {anzeige.vorname} {anzeige.nachname}
          </h1>
          <p className="text-white/70 text-sm md:text-base mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {anzeige.geburtstag && (
              <span>* {formatDatum(anzeige.geburtstag)}</span>
            )}
            <span>† {formatDatum(anzeige.sterbetag)}</span>
            {anzeige.wohnort && (
              <>
                <span className="text-white/40">·</span>
                <span>{anzeige.wohnort}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── INHALT ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Nachruf */}
        {anzeige.nachruf && (
          <div className="px-6 md:px-8 py-6 border-b border-gray-100">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[15px] md:text-base">
              {anzeige.nachruf}
            </p>
          </div>
        )}

        {/* Hinterbliebene */}
        {anzeige.hinterbliebene && (
          <div className="px-6 md:px-8 py-5 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              In tiefer Trauer
            </p>
            <p className="text-gray-700 whitespace-pre-wrap text-[15px] md:text-base">
              {anzeige.hinterbliebene}
            </p>
          </div>
        )}

        {/* Abschiedsfeier */}
        {(anzeige.abschiedsfeierDatum || anzeige.abschiedsfeierOrt || anzeige.abschiedsfeierBemerkungen) && (
          <div className="px-6 md:px-8 py-5 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Abschiedsfeier
            </p>
            <div className="flex flex-col gap-1 text-[15px] md:text-base text-gray-700">
              {anzeige.abschiedsfeierDatum && (
                <p>
                  <span className="text-gray-500 text-sm mr-2">Datum</span>
                  {formatDatum(anzeige.abschiedsfeierDatum)}
                </p>
              )}
              {anzeige.abschiedsfeierOrt && (
                <p>
                  <span className="text-gray-500 text-sm mr-2">Ort</span>
                  {anzeige.abschiedsfeierOrt}
                </p>
              )}
              {anzeige.abschiedsfeierBemerkungen && (
                <p className="text-gray-600 whitespace-pre-wrap mt-1 text-sm">
                  {anzeige.abschiedsfeierBemerkungen}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Teilen */}
        <div className="px-6 md:px-8 py-5">
          <ShareButtons url={pageUrl} name={`${anzeige.vorname} ${anzeige.nachname}`} />
        </div>
      </div>

      {/* ── KONDOLENZ-EINTRÄGE ───────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Kondolenzeinträge
          <span className="ml-2 text-base font-normal text-gray-400">
            ({anzeige.kondolenzEintraege.length})
          </span>
        </h2>

        {anzeige.kondolenzEintraege.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
            Noch keine Einträge vorhanden.
          </div>
        ) : (
          <div className="space-y-3">
            {anzeige.kondolenzEintraege.map((eintrag) => (
              <div key={eintrag.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex justify-between items-start mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{eintrag.name}</span>
                    {eintrag.ort && <span className="text-gray-500 text-sm">{eintrag.ort}</span>}
                    {eintrag.beziehung && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {eintrag.beziehung}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 flex-shrink-0 ml-4">
                    {formatDatum(eintrag.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[15px]">
                  {eintrag.nachricht}
                </p>
                <UebersetzungButton text={eintrag.nachricht} />
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

      {/* ── KONDOLENZ-FORMULAR ───────────────────────────────────────────── */}
      {kondolenzOffen && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-800">Kondolenz hinterlassen</h3>
          </div>
          <div className="p-6">
            <KondolenzFormular
              todesanzeigeId={anzeige.id}
              moderationAktiv={anzeige.moderationAktiv}
              verstorbenerVorname={anzeige.vorname}
              verstorbenerNachname={anzeige.nachname}
            />
          </div>
        </div>
      )}

      {!kondolenzOffen && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
          Das Kondolenzbuch ist geschlossen.
        </div>
      )}
    </div>
  );
}
