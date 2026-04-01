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
| UC-017 | Kondolier-Assistent für Besucher | Kondolierende | ✅ |
| UC-018 | KI-gestützte Moderation | Administrator | ✅ |
| UC-019 | Gedenkbuch-Abschluss als KI-PDF | Bestatter | ✅ |
| UC-020 | Echte KI-Bildgenerierung für Stimmungsbilder | Bestatter | ⏳ (benötigt AI Gateway) |
| UC-021 | Automatische Übersetzung von Kondolenzeinträgen | Kondolierende | ✅ |
| UC-022 | Jährliche Gedenkbenachrichtigung | System | ✅ |
| UC-023 | Stimmungsanalyse der Kondolenzen | Administrator | ✅ |

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

### UC-017: Kondolier-Assistent für Besucher
**Akteur:** Kondolierende | **Status:** ✅ Implementiert

Ein Besucher der Kondolenzseite klickt auf «Hilfe beim Schreiben» im Kondolenzformular. Er wählt seine Beziehung zum Verstorbenen und gibt optional persönliche Erinnerungen ein. Die KI generiert einen persönlichen, würdevollen Kondolenztext der per Typewriter-Effekt ins Nachricht-Feld übernommen wird. Abgrenzung zu UC-016: UC-016 richtet sich an Bestatter im Admin, UC-017 an Besucher im öffentlichen Frontend.

**Implementierung:** `src/components/public/KondolenzAssistent.tsx`, `src/app/api/ai/kondolenz-vorschlag/route.ts`, eingebunden in `KondolenzFormular.tsx`

---

### UC-018: KI-gestützte Moderation
**Akteur:** Administrator | **Status:** ✅ Implementiert

Nach Eingang eines neuen Kondolenz-Eintrags prüft die KI den Text automatisch im Hintergrund und speichert eine Empfehlung: FREIGEBEN, PRUEFEN oder ABLEHNEN — mit kurzer Begründung. In der Moderationstabelle erscheint die KI-Empfehlung farblich als Badge. Der Administrator entscheidet final.

**Implementierung:** `src/app/api/ai/moderation-pruefen/route.ts` (intern aufgerufen aus `/api/kondolenzen`), Felder `kiEmpfehlung` + `kiBegruendung` in `KondolenzEintrag`, `ModerationsTabelle.tsx`

---

### UC-019: Gedenkbuch-Abschluss als KI-PDF
**Akteur:** Bestatter | **Status:** ✅ Implementiert

Nach Abschluss des Kondolenzbuches generiert der Bestatter ein «Gedenkbuch» als PDF. Die KI erstellt eine Zusammenfassung der häufigsten Themen und Eigenschaften aus den Kondolenzen. Das PDF enthält: KI-Zusammenfassung, alle freigegebenen Kondolenz-Einträge chronologisch. Abgrenzung zu UC-008: UC-008 ist ein Zeitungsinserat-PDF, UC-019 ist ein Gedenkbuch-PDF für die Familie.

**Implementierung:** `src/lib/gedenkbuchPdf.tsx`, `src/app/api/todesanzeigen/[id]/gedenkbuch-pdf/route.ts`

---

### UC-020: Echte KI-Bildgenerierung für Stimmungsbilder
**Akteur:** Bestatter | **Status:** ⏳ Geplant (benötigt Vercel AI Gateway)

Stimmungsbilder werden durch eine Bildgenerierungs-KI erstellt (Gemini 3.1 Flash Image Preview via Vercel AI Gateway). Aktuell werden kuratierte Naturfotos verwendet (UC-016). Sobald AI Gateway konfiguriert ist, kann die bestehende Route `/api/ai/bild-generieren` entsprechend erweitert werden.

---

### UC-021: Automatische Übersetzung von Kondolenzeinträgen
**Akteur:** Kondolierende | **Status:** ✅ Implementiert

Die App erkennt automatisch nicht-deutsche Kondolenzeinträge und zeigt einen «Ins Deutsche übersetzen»-Button an. Die Übersetzung erscheint als aufklappbarer Bereich unter dem Originaltext. Das Original bleibt immer sichtbar.

**Implementierung:** `src/components/public/UebersetzungButton.tsx`, `src/app/api/ai/uebersetzen/route.ts`

---

### UC-022: Jährliche Gedenkbenachrichtigung
**Akteur:** System (automatisch) | **Status:** ✅ Implementiert

Der bestehende Cron-Job (täglich 02:00 UTC) prüft zusätzlich ob heute der Jahrestag (Tag + Monat) des Sterbedatums einer aktiven oder archivierten Todesanzeige ist. Falls ja und eine Benachrichtigungs-E-Mail hinterlegt ist, wird eine persönliche Jahresgedenk-E-Mail versendet mit einem Auszug aus den bewegendsten Kondolenzeinträgen.

**Implementierung:** `src/app/api/cron/archivieren/route.ts` (erweitert), `src/lib/email.ts` (neues Template `jahresgedenkMail`)

---

### UC-023: Stimmungsanalyse der Kondolenzen
**Akteur:** Administrator | **Status:** ✅ Implementiert

Im Admin kann der Bestatter per Klick eine KI-Stimmungsanalyse aller freigegebenen Kondolenzeinträge einer Todesanzeige abrufen. Die KI erstellt ein kurzes «Erinnerungsprofil»: häufigste Eigenschaften, Stimmung, und ein würdevoller Abschlusssatz. Angezeigt als Panel auf der Todesanzeigen-Detailseite.

**Implementierung:** `src/app/api/ai/stimmungsanalyse/[id]/route.ts`, `src/components/admin/StimmungsanalysePanel.tsx`

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
