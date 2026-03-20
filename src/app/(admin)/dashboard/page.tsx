import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [anzahlAnzeigen, anzahlAusstehend, anzahlEintraege] = await Promise.all([
    prisma.todesanzeige.count({ where: { status: "AKTIV" } }),
    prisma.kondolenzEintrag.count({ where: { status: "AUSSTEHEND" } }),
    prisma.kondolenzEintrag.count({ where: { status: "FREIGEGEBEN" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Dashboard</h1>
        <Link href="/todesanzeigen/neu" className="btn-primary">
          + Neue Todesanzeige
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs font-semibold text-neutral-80 uppercase tracking-wider mb-2">
            Aktive Todesanzeigen
          </p>
          <p className="text-4xl font-semibold text-neutral-110">{anzahlAnzeigen}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-[#C19C00]">
          <p className="text-xs font-semibold text-neutral-80 uppercase tracking-wider mb-2">
            Ausstehende Kondolenzen
          </p>
          <p className="text-4xl font-semibold text-neutral-110">{anzahlAusstehend}</p>
          {anzahlAusstehend > 0 && (
            <Link href="/kondolenzen?filter=ausstehend" className="text-xs text-brand-60 hover:text-brand-70 mt-2 inline-block">
              Jetzt prüfen →
            </Link>
          )}
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-neutral-80 uppercase tracking-wider mb-2">
            Veröffentlichte Kondolenzen
          </p>
          <p className="text-4xl font-semibold text-neutral-110">{anzahlEintraege}</p>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 text-neutral-90">Schnellzugriff</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/todesanzeigen/neu" className="btn-primary">+ Neue Todesanzeige</Link>
          <Link href="/todesanzeigen" className="btn-secondary">Alle Todesanzeigen</Link>
          <Link href="/kondolenzen?filter=ausstehend" className="btn-secondary">Kondolenzen moderieren</Link>
        </div>
      </div>
    </div>
  );
}
