const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const DATA_DIR = path.join(__dirname, "..", "..", "data", "haushalt");

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function getMonthKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function parseAmount(value) {
    if (!value) return null;
    let s = String(value).trim();
    // Punkte als Tausender, Komma als Dezimal
    s = s.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(s);
    if (isNaN(num)) return null;
    return num;
}

function determineTypeAndCategory(analysis, rawText) {
    const t = (rawText || "").toLowerCase();

    let type = "Ausgabe";
    if (analysis.kategorie && analysis.kategorie.toLowerCase() === "einnahme") {
        type = "Einnahme";
    } else if (t.includes("gutschrift") || t.includes("eingang") || t.includes("lohn") || t.includes("gehalt")) {
        type = "Einnahme";
    }

    let k = "Haushalt";

    if (analysis.kategorie) {
        const ak = analysis.kategorie.toLowerCase();
        if (ak.includes("kfz")) k = "KFZ";
        else if (ak.includes("reise")) k = "Reisen";
        else if (ak.includes("versicherung")) k = "Versicherung";
        else if (ak.includes("bank")) k = "Bank";
        else if (ak.includes("gewerbe")) k = "Gewerbe";
        else if (ak.includes("amt")) k = "Amt";
        else if (ak.includes("rechnung") || ak.includes("mahnung")) k = "Verbindlichkeiten";
        else if (ak.includes("einnahme")) k = "Einkommen";
    }

    if (/rewe|aldi|lidl|edeka|kaufland|netto|penny|dm |rossmann|müller/.test(t)) {
        k = "Haushalt";
    }
    if (/shell|aral|esso|tankstelle|tanken/.test(t)) {
        k = "KFZ";
    }

    return { type, kategorie: k };
}

function getDataPaths(monthKey) {
    ensureDir(DATA_DIR);
    const jsonPath = path.join(DATA_DIR, `haushalt-${monthKey}.json`);
    const csvPath = path.join(DATA_DIR, `haushalt-${monthKey}.csv`);
    const pdfPath = path.join(DATA_DIR, `haushalt-report-${monthKey}.pdf`);
    return { jsonPath, csvPath, pdfPath };
}

function loadMonthEntries(monthKey) {
    const { jsonPath } = getDataPaths(monthKey);
    if (!fs.existsSync(jsonPath)) return [];
    try {
        const raw = fs.readFileSync(jsonPath, "utf8");
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveMonthEntries(monthKey, entries) {
    const { jsonPath, csvPath } = getDataPaths(monthKey);
    fs.writeFileSync(jsonPath, JSON.stringify(entries, null, 2), "utf8");

    const header = "datum;betrag;kategorie;typ;beschreibung;glaeubiger\n";
    const lines = entries.map(e =>
        `${e.datum};${e.betrag.toFixed(2)};${e.kategorie};${e.typ};${e.beschreibung.replace(/;/g, ",")};${e.glaeubiger.replace(/;/g, ",")}`
    );
    fs.writeFileSync(csvPath, header + lines.join("\n"), "utf8");
}

// ------------------------------------------------------------
// Haushaltsbuch-Eintrag registrieren
// ------------------------------------------------------------
async function registerHouseholdEntry(analysis, rawText) {
    const betragNum = parseAmount(analysis.betrag);
    if (!betragNum) return; // Ohne Betrag kein Haushaltsbucheintrag

    const { type, kategorie } = determineTypeAndCategory(analysis, rawText || "");

    let datum = analysis.frist || new Date().toISOString().split("T")[0];
    // Safety: nur YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
        datum = new Date().toISOString().split("T")[0];
    }

    const monthKey = getMonthKey(new Date(datum));

    const eintrag = {
        datum,
        betrag: betragNum,
        kategorie,
        typ: type,
        glaeubiger: analysis.glaeubiger || "Unbekannt",
        beschreibung: analysis.dokumentart || "Beleg",
        quelle: "Dokumenten-Scan"
    };

    const entries = loadMonthEntries(monthKey);
    entries.push(eintrag);
    saveMonthEntries(monthKey, entries);
}

// ------------------------------------------------------------
// Monatsreport erstellen (mit "Grafik"-Balken)
// ------------------------------------------------------------
async function generateMonthlyHouseholdReport(monthKeyInput) {
    const monthKey = monthKeyInput || getMonthKey(new Date());
    const entries = loadMonthEntries(monthKey);
    if (!entries || entries.length === 0) return null;

    let einnahmen = 0;
    let ausgaben = 0;
    const byKategorie = {};

    for (const e of entries) {
        if (!byKategorie[e.kategorie]) byKategorie[e.kategorie] = 0;
        if (e.typ === "Einnahme") {
            einnahmen += e.betrag;
            byKategorie[e.kategorie] += e.betrag;
        } else {
            ausgaben += e.betrag;
            byKategorie[e.kategorie] -= e.betrag;
        }
    }

    const saldo = einnahmen - ausgaben;

    const { pdfPath, csvPath } = getDataPaths(monthKey);

    // PDF erzeugen
    ensureDir(DATA_DIR);
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Kopf
    doc.fontSize(20).text(`Haushaltsbuch ${monthKey}`, { align: "left" });
    doc.moveDown();
    doc.fontSize(12).text(`Gesamt-Einnahmen: ${einnahmen.toFixed(2)} €`);
    doc.text(`Gesamt-Ausgaben: ${ausgaben.toFixed(2)} €`);
    doc.text(`Saldo: ${saldo.toFixed(2)} €`);
    doc.moveDown();

    // Balken-"Diagramm"
    doc.fontSize(14).text("Kategorien:", { underline: true });
    doc.moveDown(0.5);

    const maxAbs = Math.max(...Object.values(byKategorie).map(v => Math.abs(v))) || 1;
    const chartWidth = 400;

    for (const [kat, wert] of Object.entries(byKategorie)) {
        const ratio = Math.abs(wert) / maxAbs;
        const barLength = chartWidth * ratio;

        doc.fontSize(10).text(`${kat} (${wert.toFixed(2)} €)`);
        const y = doc.y + 2;
        const x = doc.x;

        doc.rect(x, y, barLength, 6).fillColor(wert >= 0 ? "#4caf50" : "#f44336").fill();
        doc.fillColor("black");
        doc.moveDown(1);
    }

    doc.addPage();
    doc.fontSize(14).text("Detail-Einträge", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(9);
    entries.forEach(e => {
        doc.text(`${e.datum} | ${e.typ} | ${e.kategorie} | ${e.betrag.toFixed(2)} € | ${e.glaeubiger} | ${e.beschreibung}`);
    });

    doc.end();

    // Warten bis PDF geschrieben ist
    await new Promise(resolve => {
        stream.on("finish", resolve);
    });

    const summary =
        `Einnahmen: ${einnahmen.toFixed(2)} € | Ausgaben: ${ausgaben.toFixed(2)} € | ` +
        `Saldo: ${saldo.toFixed(2)} € | Einträge: ${entries.length}`;

    return {
        monthKey,
        pdfPath,
        csvPath,
        summary
    };
}

module.exports = {
    registerHouseholdEntry,
    generateMonthlyHouseholdReport
};
