# Kondolenzbuch

Eine moderne Web-App für Bestattungsunternehmen — ermöglicht Trauernden, online Kondolenz-Einträge zu hinterlassen.

## Features

| Use Case | Beschreibung |
|---|---|
| UC-001 | Todesanzeigen aufrufen (öffentliches Verzeichnis + Detailseite) |
| UC-002 | Kondolenz hinterlassen (mit optionalem Bild) |
| UC-003 | Todesanzeige erfassen (Admin-Konfigurator mit Portrait-Upload) |
| UC-004 | Kondolenz-Einträge moderieren (freigeben / ablehnen) |
| UC-005 | Todesanzeigen verwalten (CRUD, Status) |
| UC-006 | Benutzer & Rollen verwalten |
| UC-007 | Einbettungs-Widget (iFrame für externe Websites) |
| UC-008 | PDF-Export des Kondolenzbuches |
| UC-009 | Automatisches Archivieren nach Ablaufdatum |
| UC-010 | Teilen via WhatsApp, Facebook, E-Mail |
| UC-011 | E-Mail-Benachrichtigung bei neuer Kondolenz |
| UC-012 | Kondolenz bearbeiten/löschen (48h-Fenster via E-Mail-Link) |
| UC-013 | Unangemessene Kondolenz melden |
| UC-014 | Datenschutz-Zustimmung protokollieren |
| UC-015 | Bild zur Kondolenz hochladen |

---

## Voraussetzungen

- [Node.js](https://nodejs.org) ≥ 18
- [Git](https://git-scm.com)
- npm ≥ 9

---

## Lokales Setup

### 1. Repository klonen
```bash
git clone https://github.com/yzuercher-coder/kondolenzbuch.git
cd kondolenzbuch
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Umgebungsvariablen einrichten
```bash
cp .env.example .env.local
```
`.env.local` enthält bereits sinnvolle Standardwerte für die lokale Entwicklung (SQLite).

### 4. Datenbank initialisieren
```bash
npm run db:push    # Schema anwenden
npm run db:seed    # Testdaten + Admin-User anlegen
```

### 5. Entwicklungsserver starten
```bash
npm run dev
```

App läuft auf → **http://localhost:3000**

### Lokaler Login
| Feld | Wert |
|---|---|
| E-Mail | `admin@example.com` |
| Passwort | `admin123` |

---

## Umgebungsvariablen

| Variable | Beschreibung | Erforderlich |
|---|---|---|
| `DATABASE_URL` | Datenbank-Connection-String | ✅ |
| `DIRECT_URL` | Direkte DB-Verbindung (Neon Migrations) | Nur Produktion |
| `NEXTAUTH_SECRET` | Geheimschlüssel für JWT-Sessions | ✅ |
| `NEXTAUTH_URL` | App-URL (z.B. `http://localhost:3000`) | ✅ |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Token für Bilder | Produktion |
| `SENDGRID_API_KEY` | SendGrid API-Key für E-Mails | Optional |
| `EMAIL_FROM` | Absender-E-Mail-Adresse | Optional |
| `CRON_SECRET` | Geheimwort für Cron-Job-Absicherung | Produktion |

---

## Verfügbare Befehle

```bash
npm run dev          # Entwicklungsserver starten
npm run build        # Produktions-Build erstellen
npm run start        # Produktionsserver starten
npm run lint         # Code-Qualität prüfen
npm run db:push      # Prisma-Schema auf DB anwenden
npm run db:seed      # Datenbank mit Testdaten befüllen
npm run db:studio    # Prisma Studio (DB-Browser) öffnen
```

---

## Deployment (Vercel + Neon)

### Voraussetzungen
- [Vercel-Account](https://vercel.com) (kostenlos)
- [Neon-Account](https://neon.tech) (kostenlos, PostgreSQL)

### Schritte
1. GitHub-Repository mit Vercel verbinden
2. Neon-Datenbank erstellen (Region: `eu-central-1` Frankfurt)
3. Environment Variables in Vercel setzen (siehe Tabelle oben)
4. Vercel deployt automatisch bei jedem Push auf `main`

### Admin-User anlegen (einmalig nach erstem Deployment)
```bash
# .env.neon mit Produktions-Credentials anlegen, dann:
npx tsx prisma/seed-neon.ts
```

Oder Setup-Endpoint aufrufen: `/api/setup` (nur einmalig verfügbar, danach löschen!)

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS |
| Design | Fluent 2 (Microsoft) |
| Datenbank | PostgreSQL (Neon) / SQLite (lokal) |
| ORM | Prisma 6 |
| Auth | NextAuth.js v5 |
| PDF | @react-pdf/renderer |
| Bilder | Vercel Blob |
| E-Mail | SendGrid |

---

## Projektstruktur

```
src/
├── app/(admin)/     # Geschützte Admin-Seiten
├── app/(public)/    # Öffentliche Seiten
├── app/api/         # REST API Endpoints
├── components/      # React-Komponenten
└── lib/             # Hilfsfunktionen, Auth, Email, PDF
prisma/
├── schema.prisma    # Datenbankschema
└── seed.ts          # Testdaten
```

Für die vollständige Architektur-Dokumentation siehe [ARCHITECTURE.md](./ARCHITECTURE.md).
