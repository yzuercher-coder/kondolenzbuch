import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MeinEintragFormular from "@/components/public/MeinEintragFormular";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function MeinEintragPage({ params }: Props) {
  const { token } = await params;

  const eintrag = await prisma.kondolenzEintrag.findUnique({
    where: { editToken: token },
    include: {
      todesanzeige: { select: { vorname: true, nachname: true, slug: true } },
    },
  });

  if (!eintrag) notFound();

  const abgelaufen = !eintrag.editBis || new Date() > eintrag.editBis;

  return (
    <div className="min-h-screen bg-neutral-20 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg space-y-4">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 bg-brand-60 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-lg font-bold">K</span>
          </div>
          <h1 className="text-xl font-semibold text-neutral-110">Mein Kondolenz-Eintrag</h1>
          <p className="text-sm text-neutral-80">
            für {eintrag.todesanzeige.vorname} {eintrag.todesanzeige.nachname}
          </p>
        </div>

        <div className="card p-6">
          {abgelaufen ? (
            <div className="text-center space-y-2 py-4">
              <p className="text-neutral-90 font-semibold">Bearbeitungsfrist abgelaufen</p>
              <p className="text-sm text-neutral-70">
                Dieser Eintrag kann nicht mehr bearbeitet werden.
              </p>
              <a
                href={`/anzeigen/${eintrag.todesanzeige.slug}`}
                className="btn-secondary mt-4 inline-block"
              >
                Zur Trauerseite
              </a>
            </div>
          ) : (
            <MeinEintragFormular
              eintrag={{
                id: eintrag.id,
                nachricht: eintrag.nachricht,
                bildUrl: eintrag.bildUrl,
                editBis: eintrag.editBis!,
                token,
              }}
              slug={eintrag.todesanzeige.slug}
            />
          )}
        </div>
      </div>
    </div>
  );
}
