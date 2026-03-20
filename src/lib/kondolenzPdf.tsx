import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ── Farben (Fluent 2 / Blau) ──────────────────────────────────────────────────
const C = {
  brand: "#0078D4",
  brandLight: "#EFF6FC",
  text: "#242424",
  textSecondary: "#616161",
  textLight: "#8A8A8A",
  border: "#E0E0E0",
  bg: "#FAFAFA",
  white: "#FFFFFF",
};

// Segoe UI ist auf Windows verfügbar, aber react-pdf benötigt eine registrierte Schrift.
// Wir nutzen Helvetica (in PDF eingebettet) als sichere Alternative.
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.text,
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 48,
    backgroundColor: C.white,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: C.brand,
    marginHorizontal: -48,
    marginTop: -48,
    paddingVertical: 24,
    paddingHorizontal: 48,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    color: C.white,
    fontFamily: "Helvetica-Bold",
  },
  headerSub: {
    fontSize: 10,
    color: "#90CAFF",
    marginTop: 4,
  },

  // ── Verstorbene Person ────────────────────────────────────────────────────
  personBlock: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: C.text,
  },
  personDates: {
    fontSize: 10,
    color: C.textSecondary,
    marginTop: 4,
  },

  // ── Trauerspruch ─────────────────────────────────────────────────────────
  trauerspruch: {
    backgroundColor: C.brandLight,
    borderLeftWidth: 3,
    borderLeftColor: C.brand,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontFamily: "Helvetica-Oblique",
    fontSize: 10,
    color: "#424242",
  },

  // ── Textblock ─────────────────────────────────────────────────────────────
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 10,
    color: C.text,
    lineHeight: 1.5,
  },

  // ── Kondolenz-Einträge ────────────────────────────────────────────────────
  kondolenzHeader: {
    backgroundColor: C.brand,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 0,
    borderRadius: 4,
  },
  kondolenzHeaderText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: C.white,
  },
  kondolenzItem: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  kondolenzItemLast: {
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  kondolenzMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  kondolenzName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.text,
  },
  kondolenzOrt: {
    fontSize: 9,
    color: C.textSecondary,
    marginLeft: 6,
  },
  kondolenzDatum: {
    fontSize: 9,
    color: C.textLight,
  },
  kondolenzText: {
    fontSize: 9.5,
    color: "#424242",
    lineHeight: 1.5,
  },

  // ── Fusszeile ─────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: C.textLight,
  },

  // ── Leer-Hinweis ─────────────────────────────────────────────────────────
  empty: {
    paddingVertical: 16,
    color: C.textSecondary,
    fontSize: 10,
    textAlign: "center",
  },
});

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

function fmt(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── Typen ─────────────────────────────────────────────────────────────────────

interface Eintrag {
  id: string;
  name: string;
  ort: string | null;
  beziehung: string | null;
  nachricht: string;
  createdAt: Date;
}

interface Anzeige {
  vorname: string;
  nachname: string;
  geburtstag: Date | null;
  sterbetag: Date;
  trauerspruch: string | null;
  nachruf: string | null;
  hinterbliebene: string | null;
  kondolenzEintraege: Eintrag[];
}

// ── Dokument-Komponente ───────────────────────────────────────────────────────

export function KondolenzPdf({ anzeige }: { anzeige: Anzeige }) {
  const exportDatum = new Date().toLocaleDateString("de-CH", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <Document
      title={`Kondolenzbuch – ${anzeige.vorname} ${anzeige.nachname}`}
      author="Kondolenzbuch"
    >
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kondolenzbuch</Text>
          <Text style={styles.headerSub}>Exportiert am {exportDatum}</Text>
        </View>

        {/* Person */}
        <View style={styles.personBlock}>
          <View style={styles.personInfo}>
            <Text style={styles.personName}>
              {anzeige.vorname} {anzeige.nachname}
            </Text>
            <Text style={styles.personDates}>
              {anzeige.geburtstag ? `* ${fmt(anzeige.geburtstag)}   ` : ""}
              † {fmt(anzeige.sterbetag)}
            </Text>
          </View>
        </View>

        {/* Trauerspruch */}
        {anzeige.trauerspruch && (
          <Text style={styles.trauerspruch}>{anzeige.trauerspruch}</Text>
        )}

        {/* Nachruf */}
        {anzeige.nachruf && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nachruf</Text>
            <Text style={styles.sectionText}>{anzeige.nachruf}</Text>
          </View>
        )}

        {/* Hinterbliebene */}
        {anzeige.hinterbliebene && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>In tiefer Trauer</Text>
            <Text style={styles.sectionText}>{anzeige.hinterbliebene}</Text>
          </View>
        )}

        {/* Kondolenz-Einträge Titel */}
        <View style={styles.kondolenzHeader}>
          <Text style={styles.kondolenzHeaderText}>
            Kondolenz-Einträge ({anzeige.kondolenzEintraege.length})
          </Text>
        </View>

        {/* Einträge */}
        {anzeige.kondolenzEintraege.length === 0 ? (
          <Text style={styles.empty}>Keine freigegebenen Einträge vorhanden.</Text>
        ) : (
          anzeige.kondolenzEintraege.map((e, i) => (
            <View
              key={e.id}
              style={
                i === anzeige.kondolenzEintraege.length - 1
                  ? styles.kondolenzItemLast
                  : styles.kondolenzItem
              }
              wrap={false}
            >
              <View style={styles.kondolenzMeta}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.kondolenzName}>{e.name}</Text>
                  {e.ort && <Text style={styles.kondolenzOrt}>{e.ort}</Text>}
                  {e.beziehung && (
                    <Text style={[styles.kondolenzOrt, { marginLeft: 8 }]}>
                      · {e.beziehung}
                    </Text>
                  )}
                </View>
                <Text style={styles.kondolenzDatum}>{fmt(e.createdAt)}</Text>
              </View>
              <Text style={styles.kondolenzText}>{e.nachricht}</Text>
            </View>
          ))
        )}

        {/* Fusszeile */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {anzeige.vorname} {anzeige.nachname} — Kondolenzbuch
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Seite ${pageNumber} von ${totalPages}`
            }
          />
        </View>

      </Page>
    </Document>
  );
}
