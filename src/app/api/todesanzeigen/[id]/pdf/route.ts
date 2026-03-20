import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { KondolenzPdf } from "@/lib/kondolenzPdf";
import { createElement, type JSXElementConstructor, type ReactElement } from "react";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const anzeige = await prisma.todesanzeige.findUnique({
    where: { id },
    include: {
      kondolenzEintraege: {
        where: { status: "FREIGEGEBEN" },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!anzeige) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(KondolenzPdf, { anzeige }) as unknown as ReactElement<DocumentProps, any>;

  const pdfBuffer = await renderToBuffer(element);

  const filename = `Kondolenzbuch-${anzeige.vorname}-${anzeige.nachname}.pdf`
    .replace(/\s+/g, "-")
    .replace(/[äöüÄÖÜß]/g, (c) =>
      ({ ä: "ae", ö: "oe", ü: "ue", Ä: "Ae", Ö: "Oe", Ü: "Ue", ß: "ss" }[c] ?? c)
    );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
