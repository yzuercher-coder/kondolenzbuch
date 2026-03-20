import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Kuratierte Unsplash-Fotos nach Stil (lizenzfrei, öffentlich zugänglich)
const FOTOS: Record<string, string[]> = {
  WUERDEVOLL: [
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=85", // Waldlicht
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85", // Berggipfel
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=85", // Bergkette
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=85", // Grünes Tal
    "https://images.unsplash.com/photo-1476673160081-cf065607f449?w=1600&q=85", // Waldweg
  ],
  RELIGIOES: [
    "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1600&q=85", // Kerzen
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=85", // Morgenlicht
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&q=85", // Morgenhimmel
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600&q=85", // Sonnenstrahlen Wald
    "https://images.unsplash.com/photo-1439792675105-701e6a4ab6f0?w=1600&q=85", // Dämmerung
  ],
  MODERN: [
    "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1600&q=85", // Stiller See
    "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1600&q=85", // Bergsee klar
    "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=85", // Nordlichter
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&q=85", // Seespiegelung
    "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=1600&q=85", // Ruhige See
  ],
  POETISCH: [
    "https://images.unsplash.com/photo-1490750967868-88df5691cc28?w=1600&q=85", // Blumen Wiese
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600&q=85", // Wildblumen
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&q=85", // Abendfeld
    "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1600&q=85", // Kirschblüten
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=85", // Herbstblätter
  ],
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { stil } = await req.json();
  const fotos = FOTOS[stil as string] ?? FOTOS.WUERDEVOLL;
  const url = fotos[Math.floor(Math.random() * fotos.length)];

  // Kurz warten damit es sich "nach Generieren" anfühlt
  await new Promise((r) => setTimeout(r, 400));

  return NextResponse.json({ url });
}
