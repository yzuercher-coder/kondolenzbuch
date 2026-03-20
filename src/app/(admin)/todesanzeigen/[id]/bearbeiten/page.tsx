import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TodesanzeigeFormular from "@/components/admin/TodesanzeigeFormular";
import EinbettungsSnippet from "@/components/admin/EinbettungsSnippet";

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
      <EinbettungsSnippet token={anzeige.einbettungsToken} />
    </div>
  );
}
