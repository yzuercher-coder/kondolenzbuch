import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TodesanzeigeFormular from "@/components/admin/TodesanzeigeFormular";
import EinbettungsSnippet from "@/components/admin/EinbettungsSnippet";
import StimmungsanalysePanel from "@/components/admin/StimmungsanalysePanel";
import { BookOpen } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TodesanzeigeBearbeitenPage({ params }: Props) {
  const { id } = await params;
  const anzeige = await prisma.todesanzeige.findUnique({ where: { id } });
  if (!anzeige) notFound();

  return (
    <div className="space-y-6">
      <h1>
        {anzeige.vorname} {anzeige.nachname} — Bearbeiten
      </h1>
      <TodesanzeigeFormular anzeige={anzeige} />
      <div className="flex gap-3">
        <a
          href={`/api/todesanzeigen/${anzeige.id}/gedenkbuch-pdf`}
          className="btn-secondary flex items-center gap-2"
          download
        >
          <BookOpen className="w-4 h-4" />
          Gedenkbuch PDF
        </a>
      </div>
      <StimmungsanalysePanel todesanzeigeId={anzeige.id} />
      <EinbettungsSnippet token={anzeige.einbettungsToken} />
    </div>
  );
}
