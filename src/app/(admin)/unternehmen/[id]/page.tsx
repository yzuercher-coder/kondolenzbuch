import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Building2, Globe, Users, FileText, Code2 } from "lucide-react";
import UnternehmenFormular from "@/components/admin/UnternehmenFormular";
import EinbettungsSnippetListe from "@/components/admin/EinbettungsSnippetListe";

interface Props { params: Promise<{ id: string }> }

export default async function UnternehmenDetailPage({ params }: Props) {
  const { id } = await params;

  const u = await prisma.unternehmen.findUnique({
    where: { id },
    include: {
      benutzer: { select: { id: true, name: true, email: true, role: true } },
      todesanzeigen: {
        select: { id: true, vorname: true, nachname: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!u) notFound();

  const rolleLabel: Record<string, string> = { SUPER_ADMIN: "Super-Admin", ADMIN: "Admin" };
  const statusLabel: Record<string, string> = { ENTWURF: "Entwurf", AKTIV: "Aktiv", ARCHIVIERT: "Archiviert" };
  const statusBadge: Record<string, string> = { ENTWURF: "badge-neutral", AKTIV: "badge-success", ARCHIVIERT: "badge-neutral" };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{u.name}</h1>
          {u.website && (
            <a href={u.website} target="_blank" rel="noopener noreferrer"
              className="text-sm text-indigo-500 hover:underline flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />{u.website}
            </a>
          )}
        </div>
      </div>

      {/* Stammdaten bearbeiten */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Stammdaten</h2>
        <UnternehmenFormular
          id={u.id}
          initialData={{ name: u.name, website: u.website ?? "", logoUrl: u.logoUrl ?? "" }}
        />
      </div>

      {/* Widget-Einbettung */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="w-4 h-4 text-indigo-500" />
          <h2 className="font-semibold text-gray-800">Anzeigen-Liste einbetten</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Diesen Code auf der Website des Unternehmens einfügen — zeigt alle aktiven Kondolenzbücher als Liste.
        </p>
        <EinbettungsSnippetListe widgetToken={u.widgetToken} />
      </div>

      {/* Benutzer */}
      {u.benutzer.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" /> Benutzer ({u.benutzer.length})
          </h2>
          <div className="divide-y divide-gray-100">
            {u.benutzer.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{b.name}</p>
                  <p className="text-xs text-gray-400">{b.email}</p>
                </div>
                <span className={b.role === "SUPER_ADMIN" ? "badge-brand" : "badge-neutral"}>
                  {rolleLabel[b.role] ?? b.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Todesanzeigen */}
      {u.todesanzeigen.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" /> Todesanzeigen ({u.todesanzeigen.length})
          </h2>
          <div className="divide-y divide-gray-100">
            {u.todesanzeigen.map((a) => (
              <div key={a.id} className="py-2.5 flex items-center justify-between">
                <p className="text-sm text-gray-800">{a.vorname} {a.nachname}</p>
                <span className={statusBadge[a.status] ?? "badge-neutral"}>
                  {statusLabel[a.status] ?? a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
