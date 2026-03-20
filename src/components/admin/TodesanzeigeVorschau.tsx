"use client";

interface VorschauDaten {
  vorname: string;
  nachname: string;
  geburtstag?: string;
  sterbetag?: string;
  wohnort?: string;
  trauerspruch?: string;
  nachruf?: string;
  hinterbliebene?: string;
  abschiedsfeierDatum?: string;
  abschiedsfeierOrt?: string;
  abschiedsfeierBemerkungen?: string;
  portraitUrl?: string;
  stimmungsbildUrl?: string;
}

function formatDatumLokal(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("de-CH", { day: "2-digit", month: "long", year: "numeric" });
}

export default function TodesanzeigeVorschau({ daten }: { daten: VorschauDaten }) {
  const name = [daten.vorname, daten.nachname].filter(Boolean).join(" ") || "Vorname Nachname";
  const geburtsdatum = formatDatumLokal(daten.geburtstag);
  const sterbedatum = formatDatumLokal(daten.sterbetag);
  const abschiedsdatum = formatDatumLokal(daten.abschiedsfeierDatum);

  return (
    <div className="space-y-3 text-[13px]">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Vorschau</p>

      {/* Hero-Karte */}
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-md"
        style={{ minHeight: "220px" }}
      >
        {/* Hintergrund */}
        {daten.stimmungsbildUrl ? (
          <img
            src={daten.stimmungsbildUrl}
            alt="Stimmungsbild"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Portrait */}
        {daten.portraitUrl && (
          <div className="absolute top-4 left-4">
            <img
              src={daten.portraitUrl}
              alt="Portrait"
              className="w-14 h-14 rounded-full object-cover border-2 border-white/40 shadow"
            />
          </div>
        )}

        {/* Text-Overlay */}
        <div className="relative z-10 flex flex-col justify-end px-4 pb-5 pt-24">
          {daten.trauerspruch && (
            <p className="text-white/70 italic text-xs mb-2 leading-relaxed">
              &laquo;{daten.trauerspruch}&raquo;
            </p>
          )}
          <h2 className="text-xl font-bold text-white leading-tight">{name}</h2>
          <p className="text-white/60 text-xs mt-1 flex flex-wrap gap-x-2">
            {geburtsdatum && <span>* {geburtsdatum}</span>}
            {sterbedatum && <span>† {sterbedatum}</span>}
            {daten.wohnort && <><span className="text-white/30">·</span><span>{daten.wohnort}</span></>}
          </p>
        </div>
      </div>

      {/* Inhaltskarte */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {daten.nachruf && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed line-clamp-4">
              {daten.nachruf}
            </p>
          </div>
        )}

        {daten.hinterbliebene && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              In tiefer Trauer
            </p>
            <p className="text-gray-700 whitespace-pre-wrap">{daten.hinterbliebene}</p>
          </div>
        )}

        {(abschiedsdatum || daten.abschiedsfeierOrt || daten.abschiedsfeierBemerkungen) && (
          <div className="px-4 py-3 bg-gray-50">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Abschiedsfeier
            </p>
            <div className="space-y-0.5 text-gray-700">
              {abschiedsdatum && <p>{abschiedsdatum}</p>}
              {daten.abschiedsfeierOrt && <p>{daten.abschiedsfeierOrt}</p>}
              {daten.abschiedsfeierBemerkungen && (
                <p className="text-gray-500 text-[11px]">{daten.abschiedsfeierBemerkungen}</p>
              )}
            </div>
          </div>
        )}

        {!daten.nachruf && !daten.hinterbliebene && !abschiedsdatum && !daten.abschiedsfeierOrt && (
          <div className="px-4 py-5 text-center text-gray-300 text-xs">
            Felder ausfüllen um Vorschau zu sehen
          </div>
        )}
      </div>
    </div>
  );
}
