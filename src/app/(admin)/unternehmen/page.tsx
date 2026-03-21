import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Building2, Plus, Users, FileText, Globe } from "lucide-react";
import UnternehmenActions from "@/components/admin/UnternehmenActions";

export default async function UnternehmenPage() {
  const unternehmen = await prisma.unternehmen.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { benutzer: true, todesanzeigen: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Unternehmen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bestattungsunternehmen verwalten und Widget-Tokens einsehen</p>
        </div>
        <Link href="/unternehmen/neu" className="btn-primary flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Neues Unternehmen
        </Link>
      </div>

      {unternehmen.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Noch keine Unternehmen erfasst.</p>
          <Link href="/unternehmen/neu" className="btn-primary mt-4 inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Erstes Unternehmen erstellen
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {unternehmen.map((u) => (
            <div key={u.id} className="card p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                {u.logoUrl ? (
                  <img src={u.logoUrl} alt={u.name} className="w-10 h-10 rounded-lg object-contain border border-gray-100 flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                  {u.website && (
                    <a href={u.website} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:underline truncate flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3" />{u.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {u._count.benutzer} Benutzer
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> {u._count.todesanzeigen} Anzeigen
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <Link href={`/unternehmen/${u.id}`} className="btn-secondary text-xs py-1.5">
                  Details & Widget
                </Link>
                <UnternehmenActions id={u.id} name={u.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
