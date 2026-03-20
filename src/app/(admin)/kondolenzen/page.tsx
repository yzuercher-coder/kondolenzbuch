import { prisma } from "@/lib/prisma";
import { formatDatum } from "@/lib/utils";
import ModerationActions from "@/components/admin/ModerationActions";

interface Props {
  searchParams: Promise<{ filter?: string; anzeige?: string }>;
}

export default async function KondolenzenPage({ searchParams }: Props) {
  const { filter, anzeige: anzeigeId } = await searchParams;

  const statusFilter = filter === "ausstehend" ? "AUSSTEHEND"
    : filter === "freigegeben" ? "FREIGEGEBEN"
    : filter === "abgelehnt" ? "ABGELEHNT"
    : undefined;

  const eintraege = await prisma.kondolenzEintrag.findMany({
    where: {
      ...(statusFilter && { status: statusFilter }),
      ...(filter === "gemeldet" && { gemeldet: true }),
      ...(anzeigeId && { todesanzeigeId: anzeigeId }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      todesanzeige: { select: { vorname: true, nachname: true, slug: true } },
    },
    take: 100,
  });

  const statusBadge: Record<string, string> = {
    AUSSTEHEND:  "badge-warning",
    FREIGEGEBEN: "badge-success",
    ABGELEHNT:   "badge-danger",
  };
  const statusLabel: Record<string, string> = {
    AUSSTEHEND: "Ausstehend", FREIGEGEBEN: "Freigegeben", ABGELEHNT: "Abgelehnt",
  };

  const filters = [
    { label: "Alle", value: "" },
    { label: "Ausstehend", value: "ausstehend" },
    { label: "Freigegeben", value: "freigegeben" },
    { label: "Abgelehnt", value: "abgelehnt" },
    { label: "Gemeldet", value: "gemeldet" },
  ];

  return (
    <div className="space-y-4">
      <h1>Kondolenz-Moderation</h1>

      {/* Filter-Tabs */}
      <div className="flex gap-1 border-b border-neutral-40">
        {filters.map((f) => (
          <a
            key={f.value}
            href={f.value ? `?filter=${f.value}` : "?"}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              (filter ?? "") === f.value
                ? "border-brand-60 text-brand-60"
                : "border-transparent text-neutral-80 hover:text-neutral-110 hover:border-neutral-50"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {eintraege.length === 0 ? (
        <div className="card p-10 text-center text-neutral-80">
          Keine Einträge vorhanden.
        </div>
      ) : (
        <div className="space-y-3">
          {eintraege.map((eintrag) => (
            <div key={eintrag.id} className="card p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-110">{eintrag.name}</span>
                    {eintrag.ort && <span className="text-neutral-80 text-sm">{eintrag.ort}</span>}
                    {eintrag.beziehung && (
                      <span className="badge-neutral">{eintrag.beziehung}</span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-70 mt-1">
                    Kondolenz für: {eintrag.todesanzeige.vorname} {eintrag.todesanzeige.nachname}
                    {" · "}{formatDatum(eintrag.createdAt)}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {eintrag.gemeldet && <span className="badge-danger">Gemeldet</span>}
                  <span className={statusBadge[eintrag.status] ?? "badge-neutral"}>
                    {statusLabel[eintrag.status] ?? eintrag.status}
                  </span>
                </div>
              </div>

              <p className="text-neutral-100 text-sm whitespace-pre-wrap leading-relaxed bg-neutral-10 rounded p-3 mb-4">
                {eintrag.nachricht}
              </p>

              <ModerationActions eintragId={eintrag.id} status={eintrag.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
