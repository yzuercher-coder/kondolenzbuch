import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDatum } from "@/lib/utils";

interface Props { params: Promise<{ token: string }> }

// Eingebettete Anzeigen-Liste — minimales Layout ohne Tailwind
export default async function WidgetListePage({ params }: Props) {
  const { token } = await params;

  const unternehmen = await prisma.unternehmen.findUnique({
    where: { widgetToken: token },
    include: {
      todesanzeigen: {
        where: { status: "AKTIV" },
        orderBy: { sterbetag: "desc" },
        include: {
          _count: { select: { kondolenzEintraege: { where: { status: "FREIGEGEBEN" } } } },
        },
      },
    },
  });

  if (!unternehmen) notFound();

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://kondolenzbuch.ch";

  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
            font-size: 15px;
            color: #1a1a1a;
            background: #fff;
            padding: 0;
          }
          .header {
            padding: 14px 16px 10px;
            border-bottom: 1px solid #f0f0f0;
          }
          .header-title { font-size: 13px; font-weight: 600; color: #555; letter-spacing: 0.03em; text-transform: uppercase; }
          .header-name  { font-size: 17px; font-weight: 700; color: #111; margin-top: 2px; }
          .list { padding: 8px 0; }
          .item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            text-decoration: none;
            color: inherit;
            border-bottom: 1px solid #f5f5f5;
            transition: background 0.1s;
          }
          .item:last-child { border-bottom: none; }
          .item:hover { background: #f9f9fb; }
          .avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            object-fit: cover;
            flex-shrink: 0;
            border: 1px solid #eee;
          }
          .avatar-init {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: #ede9fe;
            color: #6d28d9;
            font-size: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .info { flex: 1; min-width: 0; }
          .name { font-size: 15px; font-weight: 600; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .dates { font-size: 13px; color: #777; margin-top: 1px; }
          .badge {
            font-size: 12px;
            color: #6d28d9;
            background: #f3f0ff;
            border-radius: 20px;
            padding: 2px 8px;
            white-space: nowrap;
            flex-shrink: 0;
          }
          .empty { padding: 32px 16px; text-align: center; color: #aaa; font-size: 14px; }
          .footer {
            padding: 10px 16px;
            border-top: 1px solid #f0f0f0;
            text-align: center;
          }
          .footer a { font-size: 12px; color: #aaa; text-decoration: none; }
          .footer a:hover { color: #6d28d9; }
        `}</style>
      </head>
      <body>
        <div className="header">
          <div className="header-title">Kondolenzbücher</div>
          <div className="header-name">{unternehmen.name}</div>
        </div>

        {unternehmen.todesanzeigen.length === 0 ? (
          <div className="empty">Keine aktiven Kondolenzbücher vorhanden.</div>
        ) : (
          <div className="list">
            {unternehmen.todesanzeigen.map((a) => {
              const initials = `${a.vorname[0]}${a.nachname[0]}`;
              const bildUrl  = a.portraitUrl || a.stimmungsbildUrl;
              const anzahl   = a._count.kondolenzEintraege;

              return (
                <a
                  key={a.id}
                  href={`${baseUrl}/anzeigen/${a.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="item"
                >
                  {bildUrl ? (
                    <img src={bildUrl} alt={`${a.vorname} ${a.nachname}`} className="avatar" />
                  ) : (
                    <div className="avatar-init">{initials}</div>
                  )}
                  <div className="info">
                    <div className="name">{a.vorname} {a.nachname}</div>
                    <div className="dates">
                      {a.geburtstag && `* ${formatDatum(a.geburtstag)} · `}
                      † {formatDatum(a.sterbetag)}
                      {a.wohnort && ` · ${a.wohnort}`}
                    </div>
                  </div>
                  {anzahl > 0 && (
                    <div className="badge">{anzahl} Kondolenz{anzahl !== 1 ? "en" : ""}</div>
                  )}
                </a>
              );
            })}
          </div>
        )}

        <div className="footer">
          <a href={baseUrl} target="_blank" rel="noopener noreferrer">
            Powered by Kondolenzbuch
          </a>
        </div>
      </body>
    </html>
  );
}
