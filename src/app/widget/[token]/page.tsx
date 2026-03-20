import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDatum } from "@/lib/utils";

// Eingebettete Ansicht (iFrame) — minimales Layout, kein Header
interface Props {
  params: Promise<{ token: string }>;
}

export default async function WidgetPage({ params }: Props) {
  const { token } = await params;

  const anzeige = await prisma.todesanzeige.findUnique({
    where: { einbettungsToken: token, status: "AKTIV" },
    include: {
      kondolenzEintraege: {
        where: { status: "FREIGEGEBEN" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!anzeige) notFound();

  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: "Segoe UI", system-ui, sans-serif; font-size: 14px; color: #242424; background: #fff; padding: 16px; }
          .name { font-size: 18px; font-weight: 600; }
          .dates { color: #616161; font-size: 13px; margin-top: 4px; }
          .spruch { border-left: 3px solid #0078D4; padding: 8px 12px; background: #EFF6FC; margin: 12px 0; font-style: italic; color: #424242; font-size: 13px; }
          .eintrag { border-bottom: 1px solid #F0F0F0; padding: 10px 0; }
          .eintrag:last-child { border-bottom: none; }
          .eintrag-name { font-weight: 600; font-size: 13px; }
          .eintrag-text { color: #424242; font-size: 13px; margin-top: 4px; }
          .mehr { display: block; margin-top: 12px; color: #0078D4; font-size: 13px; text-decoration: none; }
          .mehr:hover { text-decoration: underline; }
        `}</style>
      </head>
      <body>
        <div className="name">{anzeige.vorname} {anzeige.nachname}</div>
        <div className="dates">
          {anzeige.geburtstag && `* ${formatDatum(anzeige.geburtstag)} · `}† {formatDatum(anzeige.sterbetag)}
        </div>
        {anzeige.trauerspruch && <div className="spruch">{anzeige.trauerspruch}</div>}

        {anzeige.kondolenzEintraege.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#616161", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Kondolenzen
            </div>
            {anzeige.kondolenzEintraege.map((e) => (
              <div key={e.id} className="eintrag">
                <div className="eintrag-name">{e.name}</div>
                <div className="eintrag-text">{e.nachricht.slice(0, 150)}{e.nachricht.length > 150 ? "…" : ""}</div>
              </div>
            ))}
          </div>
        )}

        <a href={`/anzeigen/${anzeige.slug}`} target="_blank" className="mehr">
          Alle Kondolenzen ansehen & Kondolenz hinterlassen →
        </a>
      </body>
    </html>
  );
}
