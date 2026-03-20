import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDatum } from "@/lib/utils";

export default async function TodesanzeizenListePage() {
  const anzeigen = await prisma.todesanzeige.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { kondolenzEintraege: { where: { status: "AUSSTEHEND" } } } },
    },
  });

  const statusBadge: Record<string, string> = {
    ENTWURF:    "badge-warning",
    AKTIV:      "badge-success",
    ARCHIVIERT: "badge-neutral",
  };
  const statusLabel: Record<string, string> = {
    ENTWURF: "Entwurf", AKTIV: "Aktiv", ARCHIVIERT: "Archiviert",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1>Todesanzeigen</h1>
        <Link href="/todesanzeigen/neu" className="btn-primary">+ Neue Todesanzeige</Link>
      </div>

      {anzeigen.length === 0 ? (
        <div className="card p-10 text-center text-neutral-80">
          Noch keine Todesanzeigen vorhanden.
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 bg-neutral-20 border-b border-neutral-40 text-xs font-semibold text-neutral-80 uppercase tracking-wider">
            <span>Name</span>
            <span>Sterbedatum</span>
            <span>Status</span>
            <span className="text-right">Aktionen</span>
          </div>
          {anzeigen.map((anzeige) => (
            <div
              key={anzeige.id}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 items-center border-b border-neutral-30 last:border-0 hover:bg-neutral-10 transition-colors"
            >
              <div>
                <p className="font-semibold text-neutral-110">
                  {anzeige.vorname} {anzeige.nachname}
                </p>
                {anzeige._count.kondolenzEintraege > 0 && (
                  <span className="badge-warning mt-0.5">
                    {anzeige._count.kondolenzEintraege} ausstehend
                  </span>
                )}
              </div>
              <span className="text-sm text-neutral-90">† {formatDatum(anzeige.sterbetag)}</span>
              <span className={statusBadge[anzeige.status] ?? "badge-neutral"}>
                {statusLabel[anzeige.status] ?? anzeige.status}
              </span>
              <div className="flex gap-2 justify-end">
                <Link href={`/anzeigen/${anzeige.slug}`} target="_blank" className="btn-secondary">
                  Ansehen ↗
                </Link>
                <a
                  href={`/api/todesanzeigen/${anzeige.id}/pdf`}
                  download
                  className="btn-secondary"
                  title="Kondolenzbuch als PDF exportieren"
                >
                  PDF ↓
                </a>
                <Link href={`/todesanzeigen/${anzeige.id}/bearbeiten`} className="btn-secondary">
                  Bearbeiten
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
