import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";

const C = {
  brand: "#4F46E5",
  brandLight: "#EEF2FF",
  text: "#1F2937",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

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
  header: {
    backgroundColor: C.brand,
    marginHorizontal: -48,
    marginTop: -48,
    paddingVertical: 24,
    paddingHorizontal: 48,
    marginBottom: 24,
  },
  headerTitle: { fontSize: 20, color: C.white, fontFamily: "Helvetica-Bold" },
  headerSub: { fontSize: 10, color: "#A5B4FC", marginTop: 4 },
  personName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.text },
  personDates: { fontSize: 10, color: C.textSecondary, marginTop: 4, marginBottom: 20 },
  summaryBox: {
    backgroundColor: C.brandLight,
    borderLeftWidth: 3,
    borderLeftColor: C.brand,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  summaryLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.brand, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  summaryText: { fontSize: 10, color: C.text, lineHeight: 1.6, fontFamily: "Helvetica-Oblique" },
  sectionHeader: {
    backgroundColor: C.brand,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 0,
    borderRadius: 4,
  },
  sectionHeaderText: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.white },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  itemLast: { paddingVertical: 10 },
  itemMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  itemName: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  itemOrt: { fontSize: 9, color: C.textSecondary, marginLeft: 6 },
  itemDatum: { fontSize: 9, color: C.textLight },
  itemText: { fontSize: 9.5, color: "#374151", lineHeight: 1.5 },
  footer: {
    position: "absolute", bottom: 24, left: 48, right: 48,
    flexDirection: "row", justifyContent: "space-between",
    borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8,
  },
  footerText: { fontSize: 8, color: C.textLight },
  empty: { paddingVertical: 16, color: C.textSecondary, fontSize: 10, textAlign: "center" },
});

function fmt(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface Eintrag {
  id: string;
  name: string;
  ort: string | null;
  beziehung: string | null;
  nachricht: string;
  createdAt: Date;
}

interface Props {
  anzeige: {
    vorname: string;
    nachname: string;
    geburtstag: Date | null;
    sterbetag: Date;
    kondolenzEintraege: Eintrag[];
  };
  kiZusammenfassung: string;
}

export function GedenkbuchPdf({ anzeige, kiZusammenfassung }: Props) {
  const exportDatum = new Date().toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <Document title={`Gedenkbuch – ${anzeige.vorname} ${anzeige.nachname}`} author="Kondolenzbuch">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gedenkbuch</Text>
          <Text style={styles.headerSub}>Erstellt am {exportDatum}</Text>
        </View>

        <Text style={styles.personName}>{anzeige.vorname} {anzeige.nachname}</Text>
        <Text style={styles.personDates}>
          {anzeige.geburtstag ? `* ${fmt(anzeige.geburtstag)}   ` : ""}† {fmt(anzeige.sterbetag)}
        </Text>

        {kiZusammenfassung && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Erinnerungsprofil — von der Gemeinschaft</Text>
            <Text style={styles.summaryText}>{kiZusammenfassung}</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>
            Kondolenz-Einträge ({anzeige.kondolenzEintraege.length})
          </Text>
        </View>

        {anzeige.kondolenzEintraege.length === 0 ? (
          <Text style={styles.empty}>Keine freigegebenen Einträge vorhanden.</Text>
        ) : (
          anzeige.kondolenzEintraege.map((e, i) => (
            <View key={e.id} style={i === anzeige.kondolenzEintraege.length - 1 ? styles.itemLast : styles.item} wrap={false}>
              <View style={styles.itemMeta}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.itemName}>{e.name}</Text>
                  {e.ort && <Text style={styles.itemOrt}>{e.ort}</Text>}
                  {e.beziehung && <Text style={[styles.itemOrt, { marginLeft: 8 }]}>· {e.beziehung}</Text>}
                </View>
                <Text style={styles.itemDatum}>{fmt(e.createdAt)}</Text>
              </View>
              <Text style={styles.itemText}>{e.nachricht}</Text>
            </View>
          ))
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{anzeige.vorname} {anzeige.nachname} — Gedenkbuch</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
