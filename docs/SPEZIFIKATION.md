# Plattform-Spezifikation — Online-Kondolenzbuch

> **Quelle:** AG - STORZ - Plattform Dokumentation - Kondolenzbuch.pdf
> **Status:** Entwurf
> **Letzte Aktualisierung:** 2026-03-20
> **Implementierungsstand:** Siehe Spalte „Status" bei jedem Use Case

---

## 1. Einleitung

Das Kondolieren im Trauerfall in klassischen Medien wie z. B. Zeitungen nimmt stetig ab, während die Nachfrage nach digitalen Formen des Gedenkens zunimmt. Das Bedürfnis nach einem würdevollen, einfach zugänglichen Ort für Anteilnahme bleibt dabei unverändert bestehen. Verschiedene Bestatter und Unternehmen bieten bereits digitale Lösungen an, um diesem Wandel gerecht zu werden.

---

## 2. Ziele und Geltungsbereich

### Ziele
- Entwicklung eines zentral gepflegten Kondolenzbuchs mit effizienter Verwaltung der Inhalte
- Abbildung ausgewählter Kondolenzen auf mehreren unabhängigen Websites

### In-Scope
- Ein Backend, um Todesanzeigen und Kommentare zentral zu verwalten
- Todesanzeigen auf mehreren externen Websites anzeigen (Liste & Detailseite)
- Einfacher Designer im Backend, um Todesanzeigen zu gestalten
- Todesanzeigen können:
  - Nach Unternehmen kategorisiert werden
  - Mit zeitgesteuerter Publikation konfiguriert werden
  - Als PDF exportiert werden (Einsatz in gedruckten Medien — Zeitung)
  - Geteilt werden (WhatsApp und Social Media)

### Out-of-Scope
*(noch nicht definiert)*

---

## 3. Stakeholder

### Externe Akteure

| Akteur | Beschreibung |
|---|---|
| **Angehörige** | Erteilen den Auftrag zur Erstellung einer Todesanzeige. Können die Anzeige und die eingegangenen Kondolenz-Einträge einsehen und ggf. freischalten. |
| **Kondolierende** | Aus dem Umfeld des Verstorbenen. Rufen eine Todesanzeige auf und hinterlassen einen persönlichen Kondolenz-Eintrag. Teilen die Anzeige optional über WhatsApp oder Social Media. |

### Interne Akteure

| Akteur | Beschreibung |
|---|---|
| **Administrator** | Mitarbeitende des Betreibers, die das System zentral verwalten. Erfassen und bearbeiten Todesanzeigen, moderieren Kommentare, pflegen Unternehmensstrukturen und konfigurieren Publikationseinstellungen. |
| **Bestatter** | Externe Websites (z. B. Zeitungen, regionale Portale), auf denen Todesanzeigen als Liste und Detailseite eingebettet werden. Erhalten Zugang zur Darstellung der Inhalte, haben jedoch keinen redaktionellen Einfluss. |

---

## 4. Use Cases

### Übersicht

| UC | Titel | Akteur | Implementiert |
|---|---|---|---|
| UC-001 | Todesanzeige aufrufen | Trauernde | ✅ |
| UC-002 | Kondolenz hinterlassen | Trauernde | ✅ |
| UC-003 | Todesanzeige erfassen | Bestatter | ✅ |
| UC-004 | Kondolenz-Einträge moderieren | Bestatter | ✅ |
| UC-005 | Todesanzeigen verwalten | Administrator | ✅ |
| UC-006 | Unternehmen und Benutzer verwalten | Administrator | ✅ (Benutzer) / ⏳ (Unternehmen) |
| UC-007 | Todesanzeigen einbetten | Bestatter | ✅ |
| UC-008 | Todesanzeige exportieren | Bestatter | ✅ |
| UC-009 | Todesanzeige archivieren | Bestatter | ✅ |
| UC-010 | Todesanzeige teilen | Trauernde | ✅ |
| UC-011 | Benachrichtigungsempfänger konfigurieren | Bestatter | ✅ |
| UC-012 | Kondolenz bearbeiten oder löschen | Trauernde | ✅ |
| UC-013 | Kondolenz-Eintrag melden | Trauernde | ✅ |
| UC-014 | Zustimmung zur Veröffentlichung | Trauernde | ✅ |
| UC-015 | Bild zu Kondolenz hinzufügen | Trauernde | ✅ |
| UC-016 | KI-gestützte Texte und Stimmungsbild generieren | Bestatter | ✅ |

---

### UC-001: Todesanzeige aufrufen
**Akteur:** Trauernde | **Status:** ✅ Implementiert

Die trauernde Person besucht die Website einer Bestatterfirma und ruft dort das Verzeichnis der Todesanzeigen auf. Die Liste zeigt pro Eintrag den Namen der verstorbenen Person, Geburts- und Todesdatum, Wohnort sowie ein Vorschaubild. Sie kann die Liste nach Name filtern oder direkt über einen geteilten Link auf die Detailseite einer bestimmten Todesanzeige gelangen. Auf der Detailseite sieht sie die vollständige gestaltete Todesanzeige mit Bild und Trauertexten sowie die freigeschalteten Kondolenz-Einträge.

**Implementierung:** `src/app/(public)/anzeigen/`

---

### UC-002: Kondolenz hinterlassen
**Akteur:** Trauernde | **Status:** ✅ Implementiert

Die Person öffnet die Detailseite einer Todesanzeige und hinterlässt einen persönlichen Kondolenz-Eintrag mit Name und Text. Sie wird darauf hingewiesen, dass der Eintrag erst nach Freischaltung durch den Bestatter öffentlich sichtbar wird. Sobald der Bestatter den Eintrag freigeschaltet hat, erhält die Person eine E-Mail-Benachrichtigung.

**Implementierung:** `src/components/public/KondolenzFormular.tsx`, `src/app/api/kondolenzen/route.ts`

---

### UC-003: Todesanzeige erfassen
**Akteur:** Bestatter | **Status:** ✅ Implementiert (ohne Design-Templates)

Der Bestatter erfasst im Konfigurator die Todesanzeige in einem geführten Prozess. Er wählt zunächst ein Sujet oder lädt ein eigenes Portrait-Bild hoch, bestimmt Hintergrundfarbe und Schmuckelement sowie die Schriftart. Anschliessend erfasst er die Daten der verstorbenen Person sowie alle Trauertexte. Eine Live-Vorschau zeigt die Anzeige laufend im gewählten Design. Nach der Gestaltung konfiguriert der Bestatter die Publikationseinstellungen: Publikations- und Ablaufdatum, Unternehmenszuordnung, Partner-Websites.

**Implementierung:** `src/app/(admin)/todesanzeigen/neu/`, `src/components/admin/TodesanzeigeFormular.tsx`
**Offen:** Design-Templates (Sujet, Hintergrundfarbe, Schmuckelemente, Schriftart)

---

### UC-004: Kondolenz-Einträge moderieren
**Akteur:** Bestatter | **Status:** ✅ Implementiert

Der Bestatter sowie die Angehörigen erhalten per E-Mail eine Benachrichtigung sobald ein neuer Kondolenz-Eintrag eingegangen ist. Im Backend erhält er eine Übersicht aller Einträge zur Todesanzeige (durchsuchbar und sortierbar). Jeder Eintrag zeigt seinen aktuellen Status (publiziert oder ausstehend). Per Klick kann der Bestatter einen Eintrag freischalten, depublizieren oder löschen.

**Implementierung:** `src/app/(admin)/kondolenzen/`, `src/components/admin/ModerationActions.tsx`

---

### UC-005: Todesanzeigen verwalten
**Akteur:** Administrator | **Status:** ✅ Implementiert

Der Administrator hat im Backend eine Übersicht aller Todesanzeigen mit ihrem aktuellen Status (Entwurf, geplant, publiziert, archiviert), gefiltert und durchsucht nach Name, Unternehmen, Datum und Status. Er kann neue Todesanzeigen via Konfigurator erstellen, bestehende bearbeiten sowie einem Unternehmen zuordnen.

**Implementierung:** `src/app/(admin)/todesanzeigen/`

---

### UC-006: Unternehmen und Benutzer verwalten
**Akteur:** Administrator | **Status:** ✅ Benutzer implementiert / ⏳ Unternehmen ausstehend

Der Administrator verwaltet alle angeschlossenen Unternehmen (erstellen, bearbeiten, aktivieren, deaktivieren, löschen) sowie alle Benutzerkonten mit Rolle (Administrator oder Bestatter) und Unternehmenszuordnung.

**Implementierung Benutzer:** `src/app/(admin)/benutzer/`
**Offen:** Unternehmens-Verwaltung (Datenmodell `Company` noch nicht erstellt)

---

### UC-007: Todesanzeigen einbetten
**Akteur:** Bestatter | **Status:** ✅ Implementiert

Der Website-Betreiber bettet das Todesanzeigen-Verzeichnis sowie die Detailseiten über ein CMS-unabhängiges Widget in seine eigene Website ein. Die Einbindung erfordert keine spezifische CMS-Integration. Inhalte werden automatisch aktualisiert.

**Implementierung:** `src/app/widget/[token]/`, `src/components/admin/EinbettungsSnippet.tsx`

---

### UC-008: Todesanzeige exportieren
**Akteur:** Bestatter | **Status:** ✅ Implementiert

Das System generiert für jede Todesanzeige ein druckfähiges PDF. Der Bestatter kann jederzeit einen PDF-Export auslösen. Das PDF steht zum Herunterladen bereit (z. B. für Zeitungen).

**Implementierung:** `src/app/api/todesanzeigen/[id]/pdf/route.ts`, `src/lib/kondolenzPdf.tsx`

---

### UC-009: Todesanzeige archivieren
**Akteur:** Bestatter | **Status:** ✅ Implementiert

Eine Todesanzeige wird automatisch archiviert, sobald das definierte Ablaufdatum erreicht ist. Manuelles Archivieren durch Bestatter oder Administrator ebenfalls möglich. Archivierte Anzeigen sind öffentlich nicht mehr sichtbar, bleiben aber im Backend vollständig erhalten und können jederzeit wieder publiziert werden.

**Implementierung:** `src/app/api/cron/archivieren/route.ts`, Lazy-Check in `src/app/(public)/anzeigen/page.tsx`

---

### UC-010: Todesanzeige teilen
**Akteur:** Trauernde | **Status:** ✅ Implementiert

Die trauernde Person kann eine publizierte Todesanzeige teilen via: WhatsApp, Facebook, Instagram, X (Twitter), E-Mail. Zusätzlich kann der direkte Link in die Zwischenablage kopiert werden. Die Funktion ist auf der Detailseite verfügbar.

**Implementierung:** `src/components/public/ShareButtons.tsx`

---

### UC-011: Benachrichtigungsempfänger konfigurieren
**Akteur:** Bestatter | **Status:** ✅ Implementiert

Der Bestatter hinterlegt pro Todesanzeige eine oder mehrere E-Mail-Adressen (kommagetrennt) für Benachrichtigungen bei neuen Kondolenz-Einträgen. Das System sendet automatisch eine Benachrichtigung mit direktem Moderations-Link.

**Implementierung:** Feld `benachrichtigungEmail` in `Todesanzeige`, `src/lib/email.ts`

---

### UC-012: Kondolenz bearbeiten oder löschen
**Akteur:** Trauernde | **Status:** ✅ Implementiert

Nach Einreichung erhält die trauernde Person eine Bestätigungs-E-Mail mit einem persönlichen Link. Über diesen Link kann sie den Kondolenztext innerhalb von 48 Stunden bearbeiten oder löschen. Änderungen müssen erneut durch den Bestatter freigegeben werden.

**Implementierung:** `src/app/mein-eintrag/[token]/`, `src/app/api/kondolenzen/[id]/bearbeiten/route.ts`
Felder: `editToken` (UUID), `editBis` (DateTime, 48h ab Einreichung)

---

### UC-013: Kondolenz-Eintrag melden
**Akteur:** Trauernde | **Status:** ✅ Implementiert

Besucher können einen veröffentlichten Kondolenz-Eintrag als unangemessen melden. Der Bestatter erhält eine Benachrichtigung und kann den Eintrag im Backend prüfen, depublizieren oder löschen.

**Implementierung:** `src/components/public/MeldenButton.tsx`, `src/app/api/kondolenzen/[id]/melden/route.ts`

---

### UC-014: Zustimmung zur Veröffentlichung
**Akteur:** Trauernde | **Status:** ✅ Implementiert

Vor dem Absenden bestätigt die Person, dass ihr Name und Text öffentlich veröffentlicht werden dürfen und dass sie die Datenschutzbestimmungen akzeptiert. Diese Zustimmung wird im System protokolliert.

**Implementierung:** Feld `datenschutzZustimmung` in `KondolenzEintrag`, Checkbox in `KondolenzFormular.tsx`

---

### UC-015: Bild zu Kondolenz hinzufügen
**Akteur:** Trauernde | **Status:** ✅ Implementiert

Die trauernde Person kann optional ein persönliches Bild (gemeinsame Erinnerung oder Symbolbild) zur Kondolenz hochladen. Vor dem Absenden wird das Bild zusammen mit dem Text zur Überprüfung angezeigt.

**Implementierung:** `src/components/public/KondolenzFormular.tsx`, `src/app/api/kondolenzen/upload/route.ts`

---

### UC-016: KI-gestützte Texte und Stimmungsbild generieren
**Akteur:** Bestatter | **Status:** ✅ Implementiert

Der Bestatter kann im Erfassungsformular einer Todesanzeige mit einem Klick Trauerspruch, Nachruf und Stimmungsbild durch eine KI (Claude von Anthropic) generieren lassen. Er wählt einen Stil (Würdevoll, Religiös, Modern, Poetisch) und gibt optional persönliche Details zur verstorbenen Person ein. Die generierten Texte erscheinen per Typewriter-Effekt direkt in den Formularfeldern und können anschliessend manuell angepasst werden. Das Stimmungsbild wird als thematisch passende Naturaufnahme in der Live-Vorschau angezeigt und kann übernommen oder ersetzt werden. Ohne `ANTHROPIC_API_KEY` läuft die Funktion im Demo-Modus mit Beispieltexten.

**Implementierung:**
- `src/components/admin/KiAssistent.tsx` — UI-Komponente (Stil, Details, Buttons)
- `src/app/api/ai/texte-generieren/route.ts` — Textgenerierung via Anthropic Claude
- `src/app/api/ai/bild-generieren/route.ts` — Stimmungsbild-Vorschlag (kuratierte Naturfotos)
- Eingebunden in `src/components/admin/TodesanzeigeFormular.tsx`

**Konfiguration:** `ANTHROPIC_API_KEY` in Vercel-Umgebungsvariablen setzen. Empfohlenes Modell: `claude-haiku-4-5`.

---

## 5. Offene Punkte

| # | Bereich | Beschreibung | Priorität |
|---|---|---|---|
| 1 | UC-003 | Design-Templates (Sujet, Hintergrundfarbe, Schmuckelemente) | Mittel |
| 2 | UC-006 | Unternehmens-Verwaltung (CRUD) | Mittel |
| 3 | Sicherheit | Rate Limiting auf öffentlichen Formularen | Hoch |
| 4 | Sicherheit | Passwort ändern für Admin-Benutzer | Hoch |
| 5 | UX | QR-Code Generator pro Todesanzeige | Niedrig |
| 6 | UX | Kerzen/Blumen-Reaktionen auf Detailseite | Niedrig |

---

## 6. Änderungshistorie

| Datum | Version | Änderung |
|---|---|---|
| 2026-03-20 | 1.0 | Initiale Überführung aus PDF-Dokument in Markdown |
