# CLAUDE.md — Anweisungen für Claude Code

## Projekt-Übersicht
**Kondolenzbuch** ist eine Next.js Web-App für Bestattungsunternehmen.
Trauernde können online Kondolenz-Einträge hinterlassen. Bestatter verwalten
Todesanzeigen und moderieren Einträge im Admin-Backend.

- **Sprache:** Deutsch (UI, Variablen, Kommentare)
- **Stack:** Next.js 15 · React 19 · TypeScript · Prisma · PostgreSQL · Tailwind CSS
- **Hosting:** Vercel (App) + Neon (DB) + Vercel Blob (Bilder)

---

## Befehle

```bash
npm run dev          # Dev-Server starten (http://localhost:3000)
npm run build        # Produktions-Build (inkl. prisma generate + db push)
npm run db:push      # Schema auf DB anwenden (ohne Build)
npm run db:seed      # Lokale DB mit Testdaten befüllen
npm run db:studio    # Prisma Studio öffnen (DB-Browser)
```

---

## Architektur-Regeln

### Server vs. Client Components
- **Standard:** Server Components (kein `"use client"`)
- **`"use client"` nur wenn nötig:** Formulare, Event-Handler, useState/useEffect, useRouter
- Datenbankzugriffe **immer** in Server Components oder API Routes — nie im Client

### API Routes
- Alle geschützten Endpoints beginnen mit:
  ```typescript
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  ```
- Eingaben **immer** mit Zod validieren
- Fehler mit passendem HTTP-Status zurückgeben (400, 401, 404, 500)

### Datenbank
- **Lokal:** SQLite (`file:./dev.db`) — kein `@db.Text` erlaubt
- **Produktion:** PostgreSQL (Neon) — `@db.Text` für lange Texte verwenden
- Prisma-Singleton in `src/lib/prisma.ts` — **niemals** neu instanziieren
- Kein `prisma.$disconnect()` in API Routes (Singleton-Pattern)

### Datei-Uploads
- **Lokal (dev):** Dateisystem (`public/uploads/`) — in `.gitignore`
- **Produktion:** Vercel Blob (`@vercel/blob`) — `BLOB_READ_WRITE_TOKEN` erforderlich
- Max. 5 MB, nur JPEG/PNG/WebP erlaubt
- Upload-Route für Admins: `/api/upload`
- Upload-Route öffentlich (Kondolenz-Bilder): `/api/kondolenzen/upload`

### E-Mail
- Versand via `src/lib/email.ts` → SendGrid wenn `SENDGRID_API_KEY` gesetzt
- Ohne API-Key: E-Mail wird in der Konsole geloggt (Dev-Modus)
- E-Mail-Versand **immer non-blocking** (`.catch(console.error)` verwenden)

### Styling
- **Tailwind CSS** mit Custom-Klassen in `src/app/globals.css`
- Design-System: **Fluent 2** (Microsoft) — Primärfarbe `#0078D4`
- Custom-Klassen: `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.card`, `.badge-*`, `.label`, `.input`, `.field-error`
- Keine Inline-Styles ausser in PDF-Komponenten (`src/lib/kondolenzPdf.tsx`)

---

## Wichtige Dateien

| Datei | Zweck |
|---|---|
| `src/lib/auth.ts` | NextAuth v5 Konfiguration mit Credentials Provider |
| `src/lib/auth.config.ts` | Edge-kompatible Auth-Config (für Middleware) |
| `src/middleware.ts` | Schützt Admin-Routen (`/dashboard`, `/todesanzeigen`, `/kondolenzen`, `/benutzer`) |
| `src/lib/prisma.ts` | Prisma-Singleton |
| `src/lib/email.ts` | E-Mail-Templates und SendGrid-Versand |
| `src/lib/kondolenzPdf.tsx` | PDF-Generierung mit `@react-pdf/renderer` |
| `src/lib/utils.ts` | `formatDatum()`, `generateSlug()`, `cn()` |
| `prisma/schema.prisma` | Datenbankschema (User, Todesanzeige, KondolenzEintrag) |
| `vercel.json` | Vercel-Konfiguration + Cron-Job |

---

## Patterns

### Formular-Validierung
```typescript
// Immer Zod-Schema + React Hook Form
const schema = z.object({ name: z.string().min(2) });
type FormData = z.infer<typeof schema>;
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### Daten in Server Component laden
```typescript
// Kein fetch() — direkt Prisma verwenden
const anzeigen = await prisma.todesanzeige.findMany({ where: { status: "AKTIV" } });
```

### Auth in API Route
```typescript
import { auth } from "@/lib/auth";
const session = await auth();
if (!session?.user?.id) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
```

---

## Was NICHT tun
- ❌ Keine neuen Prisma-Client-Instanzen erstellen (immer `src/lib/prisma.ts` importieren)
- ❌ Kein direkter DB-Zugriff in Client Components
- ❌ Keine sensiblen Daten (Passwörter, API-Keys) committen
- ❌ Kein `@db.Text` in SQLite-Schema verwenden
- ❌ Kein unkontrollierter E-Mail-Versand (immer `.catch()`)
- ❌ Keine deutschen Sonderzeichen (äöü) in Slugs oder Dateinamen

---

## Status-Werte

| Modell | Status-Werte |
|---|---|
| `Todesanzeige.status` | `ENTWURF` · `AKTIV` · `ARCHIVIERT` |
| `KondolenzEintrag.status` | `AUSSTEHEND` · `FREIGEGEBEN` · `ABGELEHNT` |
| `User.role` | `ADMIN` · `SUPER_ADMIN` |
