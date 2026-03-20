# ARCHITECTURE.md — Technische Architektur

## System-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                             │
└──────────┬─────────────────────┬───────────────────────────┘
           │                     │
    ┌──────▼──────┐      ┌───────▼──────┐
    │  Öffentliche │      │  Admin-      │
    │  Seiten      │      │  Backend     │
    │  /anzeigen   │      │  /dashboard  │
    │  /widget     │      │  /todesanz.  │
    └──────┬───────┘      └──────┬───────┘
           │                     │
    ┌──────▼─────────────────────▼───────┐
    │          Next.js 15 App            │
    │     (Vercel — Frankfurt/EU)        │
    │                                    │
    │  Server Components + API Routes    │
    └──────┬──────────────┬─────────────┘
           │              │
    ┌──────▼──────┐  ┌────▼────────────┐
    │  Neon       │  │  Vercel Blob    │
    │  PostgreSQL │  │  (Bilder)       │
    │  Frankfurt  │  └─────────────────┘
    └─────────────┘
           │
    ┌──────▼──────┐
    │  SendGrid   │
    │  (E-Mails)  │
    └─────────────┘
```

---

## Tech Stack

| Schicht | Technologie | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.2 |
| UI | React | 19.0 |
| Sprache | TypeScript | 5.8 |
| Styling | Tailwind CSS | 3.4 |
| Design-System | Fluent 2 (Microsoft) | — |
| Formulare | React Hook Form + Zod | 7.54 + 3.24 |
| Datenbank | PostgreSQL (Neon) | — |
| ORM | Prisma | 6.5 |
| Auth | NextAuth.js v5 | 5.0 beta |
| PDF | @react-pdf/renderer | 4.3 |
| Bilder | Vercel Blob | 2.3 |
| E-Mail | SendGrid | API v3 |
| Icons | Lucide React | 0.479 |
| Hosting | Vercel (Hobby) | — |

---

## Verzeichnisstruktur

```
src/
├── app/
│   ├── (admin)/                    # Geschützte Admin-Seiten
│   │   ├── layout.tsx              # Admin-Layout mit Navigation
│   │   ├── dashboard/              # Übersicht mit Kennzahlen
│   │   ├── todesanzeigen/          # CRUD für Todesanzeigen
│   │   │   ├── page.tsx            # Liste
│   │   │   ├── neu/                # Neue Todesanzeige
│   │   │   └── [id]/bearbeiten/    # Bearbeiten + Widget-Snippet
│   │   ├── kondolenzen/            # Moderation
│   │   └── benutzer/               # Benutzerverwaltung
│   │
│   ├── (public)/                   # Öffentliche Seiten
│   │   ├── layout.tsx              # Öffentliches Layout
│   │   └── anzeigen/               # Todesanzeigen-Verzeichnis
│   │       ├── page.tsx            # Liste aller aktiven Anzeigen
│   │       └── [slug]/             # Detail mit Kondolenz-Formular
│   │
│   ├── api/                        # REST API Endpoints
│   │   ├── auth/[...nextauth]/     # NextAuth Handler
│   │   ├── benutzer/               # Benutzerverwaltung
│   │   ├── kondolenzen/            # Kondolenz CRUD + Moderation
│   │   ├── todesanzeigen/          # Todesanzeige CRUD + PDF
│   │   ├── upload/                 # Portrait-Upload (Admin)
│   │   └── cron/archivieren/       # Auto-Archivierung
│   │
│   ├── login/                      # Login-Seite
│   ├── mein-eintrag/[token]/       # Kondolenz bearbeiten (UC-012)
│   └── widget/[token]/             # Einbettungs-Widget (UC-007)
│
├── components/
│   ├── admin/                      # Admin-Komponenten
│   └── public/                     # Öffentliche Komponenten
│
└── lib/
    ├── auth.ts                     # NextAuth Konfiguration
    ├── auth.config.ts              # Edge-kompatible Config
    ├── prisma.ts                   # DB-Singleton
    ├── email.ts                    # E-Mail Templates + Versand
    ├── kondolenzPdf.tsx            # PDF-Generierung
    └── utils.ts                    # Hilfsfunktionen
```

---

## Datenbankmodelle

### User
```
User {
  id            CUID (PK)
  email         String (unique)
  password      String (bcrypt, 12 Runden)
  name          String
  role          ADMIN | SUPER_ADMIN
  createdAt     DateTime
  updatedAt     DateTime
  todesanzeigen Todesanzeige[]
}
```

### Todesanzeige
```
Todesanzeige {
  id                    CUID (PK)
  slug                  String (unique, auto-generiert)
  status                ENTWURF | AKTIV | ARCHIVIERT

  // Verstorbene Person
  vorname               String
  nachname              String
  geburtstag            DateTime?
  sterbetag             DateTime
  portraitUrl           String?

  // Texte
  trauerspruch          Text?
  nachruf               Text?
  hinterbliebene        Text?

  // Kondolenzbuch-Konfiguration
  kondolenzAktiv        Boolean (default: true)
  kondolenzBis          DateTime?        // Auto-Archivierung
  moderationAktiv       Boolean (default: true)
  benachrichtigungEmail String?          // Kommagetrennte E-Mails

  // Einbettung
  einbettungsToken      String (unique)  // Für Widget-iFrame

  createdAt             DateTime
  updatedAt             DateTime
  createdBy             String (FK → User)
  kondolenzEintraege    KondolenzEintrag[]
}
```

### KondolenzEintrag
```
KondolenzEintrag {
  id                    CUID (PK)
  todesanzeigeId        String (FK, cascade delete)

  // Absender
  name                  String
  ort                   String?
  beziehung             String?
  email                 String?          // Für Bestätigung + Edit-Link

  // Inhalt
  nachricht             Text
  bildUrl               String?
  status                AUSSTEHEND | FREIGEGEBEN | ABGELEHNT

  // Moderation
  datenschutzZustimmung Boolean
  freigegebenAt         DateTime?

  // Melden (UC-013)
  gemeldet              Boolean (default: false)
  gemeldedAt            DateTime?

  // Bearbeiten-Fenster 48h (UC-012)
  editToken             String? (unique UUID)
  editBis               DateTime?

  createdAt             DateTime
  ipAdresse             String?
}
```

---

## API Endpoints

### Öffentlich (kein Auth)
| Method | Endpoint | Zweck |
|---|---|---|
| `POST` | `/api/kondolenzen` | Neue Kondolenz einreichen |
| `PATCH` | `/api/kondolenzen/[id]/bearbeiten` | Kondolenz via Token bearbeiten |
| `POST` | `/api/kondolenzen/[id]/melden` | Kondolenz melden |
| `POST` | `/api/kondolenzen/upload` | Bild zur Kondolenz hochladen |

### Admin (Auth erforderlich)
| Method | Endpoint | Zweck |
|---|---|---|
| `POST` | `/api/todesanzeigen` | Todesanzeige erstellen |
| `PATCH` | `/api/todesanzeigen/[id]` | Todesanzeige aktualisieren |
| `DELETE` | `/api/todesanzeigen/[id]` | Todesanzeige löschen |
| `GET` | `/api/todesanzeigen/[id]/pdf` | PDF-Export |
| `PATCH` | `/api/kondolenzen/[id]` | Status ändern (freigeben/ablehnen) |
| `DELETE` | `/api/kondolenzen/[id]` | Kondolenz löschen |
| `POST` | `/api/upload` | Portrait hochladen |
| `POST` | `/api/benutzer` | Neuen Benutzer erstellen |
| `DELETE` | `/api/benutzer/[id]` | Benutzer löschen |

### System (Cron)
| Method | Endpoint | Auth | Zweck |
|---|---|---|---|
| `GET` | `/api/cron/archivieren` | Bearer CRON_SECRET | Abgelaufene Anzeigen archivieren |

---

## Authentication Flow

```
1. User ruft geschützte Route auf (/dashboard etc.)
2. Middleware (src/middleware.ts) prüft Session
3. Keine Session → Redirect zu /login
4. Login: POST /api/auth/signin mit Email + Passwort
5. NextAuth prüft bcrypt-Hash in DB
6. Erfolg → JWT-Token im Cookie gesetzt
7. Session enthält: { user: { id, email, name, role } }
```

**Geschützte Routen (Middleware):**
- `/dashboard/*`
- `/todesanzeigen/*`
- `/kondolenzen/*`
- `/benutzer/*`

---

## Deployment-Architektur

```
GitHub (main branch)
        │
        │ Push/Merge
        ▼
Vercel CI/CD
  1. prisma generate
  2. prisma db push       ← Schema auf Neon anwenden
  3. next build
        │
        ▼
Vercel Edge Network
  ├── Static Assets (CDN)
  ├── Server Functions (API Routes + SSR)
  └── Cron: täglich 02:00 UTC → /api/cron/archivieren

        │ Datenbankzugriffe
        ▼
Neon PostgreSQL (Frankfurt, eu-central-1)
  ├── DATABASE_URL    → Pooled Connection (App)
  └── DIRECT_URL      → Direct Connection (Migrations)

        │ Datei-Uploads
        ▼
Vercel Blob Storage
  ├── portraits/{uuid}.jpg
  └── kondolenzen/{uuid}.jpg
```

---

## Use Cases → Implementierung

| Use Case | Öffentliche Seite | Admin-Seite | API |
|---|---|---|---|
| UC-001: Anzeige aufrufen | `/anzeigen/[slug]` | — | — |
| UC-002: Kondolenz hinterlassen | `KondolenzFormular.tsx` | — | `POST /api/kondolenzen` |
| UC-003: Anzeige erfassen | — | `/todesanzeigen/neu` | `POST /api/todesanzeigen` |
| UC-004: Moderieren | — | `/kondolenzen` | `PATCH /api/kondolenzen/[id]` |
| UC-005: Anzeigen verwalten | — | `/todesanzeigen` | `PATCH/DELETE /api/todesanzeigen/[id]` |
| UC-006: Benutzer verwalten | — | `/benutzer` | `POST/DELETE /api/benutzer` |
| UC-007: Widget einbetten | `/widget/[token]` | `EinbettungsSnippet.tsx` | — |
| UC-008: PDF exportieren | — | `/todesanzeigen` | `GET /api/todesanzeigen/[id]/pdf` |
| UC-009: Archivieren | Auto + `/anzeigen` | — | `GET /api/cron/archivieren` |
| UC-010: Teilen | `ShareButtons.tsx` | — | — |
| UC-011: Benachrichtigung | — | Konfiguration im Formular | `src/lib/email.ts` |
| UC-012: Eintrag bearbeiten | `/mein-eintrag/[token]` | — | `PATCH /api/kondolenzen/[id]/bearbeiten` |
| UC-013: Eintrag melden | `MeldenButton.tsx` | Filter "Gemeldet" | `POST /api/kondolenzen/[id]/melden` |
| UC-014: Datenschutz-Zustimmung | `KondolenzFormular.tsx` | — | Feld: `datenschutzZustimmung` |
| UC-015: Bild zur Kondolenz | `KondolenzFormular.tsx` | — | `POST /api/kondolenzen/upload` |
