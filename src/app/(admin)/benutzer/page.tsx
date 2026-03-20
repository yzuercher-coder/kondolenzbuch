import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDatum } from "@/lib/utils";
import { auth } from "@/lib/auth";
import BenutzerActions from "@/components/admin/BenutzerActions";

export default async function BenutzerPage() {
  const session = await auth();
  const benutzer = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  const rolleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super-Admin",
    ADMIN: "Admin",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1>Benutzerverwaltung</h1>
        <Link href="/benutzer/neu" className="btn-primary">+ Neuer Benutzer</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 bg-neutral-20 border-b border-neutral-40 text-xs font-semibold text-neutral-80 uppercase tracking-wider">
          <span>Name / E-Mail</span>
          <span>Rolle</span>
          <span>Erstellt</span>
          <span className="text-right">Aktionen</span>
        </div>
        {benutzer.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 items-center border-b border-neutral-30 last:border-0 hover:bg-neutral-10 transition-colors"
          >
            <div>
              <p className="font-semibold text-neutral-110">{user.name}</p>
              <p className="text-xs text-neutral-80">{user.email}</p>
            </div>
            <span className={user.role === "SUPER_ADMIN" ? "badge-brand" : "badge-neutral"}>
              {rolleLabel[user.role] ?? user.role}
            </span>
            <span className="text-sm text-neutral-80">{formatDatum(user.createdAt)}</span>
            <div className="flex gap-2 justify-end">
              {user.id !== session?.user?.id ? (
                <BenutzerActions userId={user.id} userName={user.name} />
              ) : (
                <span className="text-xs text-neutral-60">Eigenes Konto</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
