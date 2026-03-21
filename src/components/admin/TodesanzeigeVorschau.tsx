"use client";

import { useState } from "react";
import { Monitor, Newspaper } from "lucide-react";

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

function formatDatumKurz(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── Digitale Vorschau (Webauftritt) ──────────────────────────────────────────

function VorschauDigital({ daten }: { daten: VorschauDaten }) {
  const name = [daten.vorname, daten.nachname].filter(Boolean).join(" ") || "Vorname Nachname";
  const geburtsdatum = formatDatumLokal(daten.geburtstag);
  const sterbedatum = formatDatumLokal(daten.sterbetag);
  const abschiedsdatum = formatDatumLokal(daten.abschiedsfeierDatum);

  return (
    <div className="space-y-3 text-[13px]">
      <div className="relative w-full rounded-xl overflow-hidden shadow-md" style={{ minHeight: 220 }}>
        {daten.stimmungsbildUrl ? (
          <img src={daten.stimmungsbildUrl} alt="Stimmungsbild"
            className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        {daten.portraitUrl && (
          <div className="absolute top-4 left-4">
            <img src={daten.portraitUrl} alt="Portrait"
              className="w-14 h-14 rounded-full object-cover border-2 border-white/40 shadow" />
          </div>
        )}
        <div className="relative z-10 flex flex-col justify-end px-4 pb-5 pt-24">
          {daten.trauerspruch && (
            <p className="text-white/70 italic text-xs mb-2 leading-relaxed">
              «{daten.trauerspruch}»
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
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">In tiefer Trauer</p>
            <p className="text-gray-700 whitespace-pre-wrap">{daten.hinterbliebene}</p>
          </div>
        )}
        {(abschiedsdatum || daten.abschiedsfeierOrt || daten.abschiedsfeierBemerkungen) && (
          <div className="px-4 py-3 bg-gray-50">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Abschiedsfeier</p>
            <div className="space-y-0.5 text-gray-700">
              {abschiedsdatum && <p>{abschiedsdatum}</p>}
              {daten.abschiedsfeierOrt && <p>{daten.abschiedsfeierOrt}</p>}
              {daten.abschiedsfeierBemerkungen && <p className="text-gray-500 text-[11px]">{daten.abschiedsfeierBemerkungen}</p>}
            </div>
          </div>
        )}
        {!daten.nachruf && !daten.hinterbliebene && !abschiedsdatum && !daten.abschiedsfeierOrt && (
          <div className="px-4 py-5 text-center text-gray-300 text-xs">Felder ausfüllen um Vorschau zu sehen</div>
        )}
      </div>
    </div>
  );
}

// ─── Zeitungsinserat-Vorschau ──────────────────────────────────────────────────

function VorschauZeitung({ daten }: { daten: VorschauDaten }) {
  const vorname = daten.vorname || "Vorname";
  const nachname = daten.nachname || "Nachname";
  const geburtsdatum = formatDatumKurz(daten.geburtstag);
  const sterbedatum = formatDatumKurz(daten.sterbetag);
  const abschiedsdatum = formatDatumLokal(daten.abschiedsfeierDatum);

  const hatAbschied = abschiedsdatum || daten.abschiedsfeierOrt || daten.abschiedsfeierBemerkungen;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Skalierungshinweis */}
      <p className="text-[10px] text-gray-400 uppercase tracking-wider self-start">
        Zeitungsinserat · massstabsgetreu 58 mm Breite
      </p>

      {/* Zeitungsinserat — exaktes Schweizer Zeitungsformat */}
      <div className="zeitungsinserat">
        <div className="zeitungsinserat-innen">

          {/* Kreuz-Ornament */}
          <div className="zi-kreuz">✝</div>

          {/* Portrait */}
          {daten.portraitUrl && (
            <div className="zi-portrait-wrap">
              <img src={daten.portraitUrl} alt="Portrait" className="zi-portrait" />
            </div>
          )}

          {/* Name */}
          <div className="zi-name-block">
            <span className="zi-vorname">{vorname}</span>
            <span className="zi-nachname">{nachname}</span>
          </div>

          {/* Lebensdaten */}
          <div className="zi-daten">
            {geburtsdatum && sterbedatum
              ? `* ${geburtsdatum}  —  † ${sterbedatum}`
              : geburtsdatum
                ? `* ${geburtsdatum}`
                : sterbedatum
                  ? `† ${sterbedatum}`
                  : ""}
          </div>

          {/* Wohnort */}
          {daten.wohnort && (
            <div className="zi-wohnort">{daten.wohnort}</div>
          )}

          {/* Trennlinie */}
          <div className="zi-linie" />

          {/* Trauerspruch */}
          {daten.trauerspruch && (
            <div className="zi-trauerspruch">
              «{daten.trauerspruch}»
            </div>
          )}

          {/* Nachruf */}
          {daten.nachruf && (
            <>
              <div className="zi-linie" />
              <div className="zi-nachruf">{daten.nachruf}</div>
            </>
          )}

          {/* Hinterbliebene */}
          {daten.hinterbliebene && (
            <>
              <div className="zi-linie" />
              <div className="zi-abschnitt-titel">In tiefer Trauer:</div>
              <div className="zi-hinterbliebene">{daten.hinterbliebene}</div>
            </>
          )}

          {/* Abschiedsfeier */}
          {hatAbschied && (
            <>
              <div className="zi-linie" />
              <div className="zi-abschnitt-titel">Abschiedsfeier</div>
              {abschiedsdatum && <div className="zi-abschied-zeile">{abschiedsdatum}</div>}
              {daten.abschiedsfeierOrt && <div className="zi-abschied-zeile">{daten.abschiedsfeierOrt}</div>}
              {daten.abschiedsfeierBemerkungen && (
                <div className="zi-abschied-bem">{daten.abschiedsfeierBemerkungen}</div>
              )}
            </>
          )}

        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center leading-tight max-w-[200px]">
        Diese Vorschau entspricht dem Druckformat für Schweizer Tageszeitungen.
      </p>
    </div>
  );
}

// ─── Haupt-Komponente mit Tab-Umschalter ──────────────────────────────────────

export default function TodesanzeigeVorschau({ daten }: { daten: VorschauDaten }) {
  const [tab, setTab] = useState<"digital" | "zeitung">("zeitung");

  return (
    <div className="space-y-3 text-[13px]">
      {/* Tab-Leiste */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => setTab("zeitung")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
            tab === "zeitung"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" />
          Zeitungsinserat
        </button>
        <button
          type="button"
          onClick={() => setTab("digital")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
            tab === "digital"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          Webauftritt
        </button>
      </div>

      {tab === "zeitung" ? (
        <VorschauZeitung daten={daten} />
      ) : (
        <VorschauDigital daten={daten} />
      )}
    </div>
  );
}
