import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  FileText,
  MessageSquare,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import ModerationsTabelle from "@/components/admin/ModerationsTabelle";

export default async function DashboardPage() {
  const today = new Date();
  const datumFormatiert = today.toLocaleDateString("de-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [anzahlAnzeigen, anzahlAusstehend, anzahlFreigegeben, anzahlGemeldet, ausstehende] =
    await Promise.all([
      prisma.todesanzeige.count({ where: { status: "AKTIV" } }),
      prisma.kondolenzEintrag.count({ where: { status: "AUSSTEHEND" } }),
      prisma.kondolenzEintrag.count({ where: { status: "FREIGEGEBEN" } }),
      prisma.kondolenzEintrag.count({ where: { gemeldet: true, status: "FREIGEGEBEN" } }),
      prisma.kondolenzEintrag.findMany({
        where: { status: "AUSSTEHEND" },
        include: { todesanzeige: { select: { vorname: true, nachname: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const kpis = [
    {
      label: "Aktive Anzeigen",
      value: anzahlAnzeigen,
      icon: FileText,
      color: "indigo" as const,
      sub: "Todesanzeigen online",
    },
    {
      label: "Ausstehend",
      value: anzahlAusstehend,
      icon: Clock,
      color: "red" as const,
      sub: "warten auf Freigabe",
      alert: anzahlAusstehend > 0,
    },
    {
      label: "Kondolenzen total",
      value: anzahlFreigegeben,
      icon: MessageSquare,
      color: "green" as const,
      sub: "freigegeben",
    },
    {
      label: "Gemeldet",
      value: anzahlGemeldet,
      icon: AlertTriangle,
      color: "orange" as const,
      sub: anzahlGemeldet > 0 ? "Aktion erforderlich" : "keine offenen Meldungen",
    },
  ];

  const colorMap = {
    indigo: { bg: "bg-indigo-50",   icon: "text-indigo-500", value: "text-gray-900" },
    red:    { bg: "bg-red-50",      icon: "text-red-500",    value: "text-red-600"  },
    green:  { bg: "bg-emerald-50",  icon: "text-emerald-500",value: "text-gray-900" },
    orange: { bg: "bg-amber-50",    icon: "text-amber-500",  value: "text-amber-600"},
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{datumFormatiert}</p>
        </div>
        <Link
          href="/todesanzeigen/neu"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neue Todesanzeige
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, sub }) => {
          const c = colorMap[color];
          return (
            <div
              key={label}
              className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                  <Icon className={`w-4.5 h-4.5 ${c.icon}`} size={18} />
                </div>
              </div>
              <div className={`text-3xl font-bold leading-none mb-2 ${c.value}`}>{value}</div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-gray-300" />
                <span className="text-xs text-gray-400">{sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main + Sidebar Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">

        {/* Ausstehende Kondolenzen */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-900">Ausstehende Kondolenzen</span>
              {anzahlAusstehend > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {anzahlAusstehend}
                </span>
              )}
            </div>
            <Link
              href="/kondolenzen?filter=ausstehend"
              className="text-xs font-medium text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              Alle anzeigen <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ModerationsTabelle eintraege={ausstehende} />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">

          {/* Schnellaktionen */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-900">Schnellaktionen</span>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href="/todesanzeigen/neu"
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Neue Todesanzeige
              </Link>
              <Link
                href="/kondolenzen?filter=ausstehend"
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Kondolenzen moderieren
              </Link>
              {anzahlGemeldet > 0 && (
                <Link
                  href="/kondolenzen?filter=gemeldet"
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Gemeldeten Eintrag prüfen
                </Link>
              )}
            </div>
          </div>

          {/* Status Übersicht */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-900">Kondolenz-Status</span>
            </div>
            <div className="p-5 space-y-4">
              {[
                {
                  label: "Freigegeben",
                  count: anzahlFreigegeben,
                  total: anzahlFreigegeben + anzahlAusstehend,
                  color: "bg-emerald-400",
                  dot: "bg-emerald-400",
                },
                {
                  label: "Ausstehend",
                  count: anzahlAusstehend,
                  total: anzahlFreigegeben + anzahlAusstehend,
                  color: "bg-amber-400",
                  dot: "bg-amber-400",
                },
              ].map(({ label, count, total, color, dot }) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700">
                        <span className={`w-2 h-2 rounded-full ${dot}`} />
                        {label}
                      </span>
                      <span className="text-[13px] font-semibold text-gray-900">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
