"use strict";

// ============================================================
// Datei: src/engines/dropbox-engine.js
// Phase 4 – Abschluss & Speicherung (FINAL, STABIL)
// ============================================================

const { uploadToDropbox } = require("../utils/dropbox");

/* ============================================================
   NORMALISIERUNG
============================================================ */
function normalizeText(raw = "") {
  return String(raw)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^\p{L}\p{N} %.,€\n\-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ============================================================
   📅 DATUM – ULTRA ROBUST (OCR-SICHER)
============================================================ */
function detectDocumentDate(rawText = "") {
  const text = normalizeText(rawText);

  // akzeptiert:
  // 13.03.2024 | 13 03 2024 | 13-03-2024 | 13/03/2024
  // 13. märz 2024 | 13 mar 2024
  const match = text.match(
    /([0-3]?\d)[.\-/\s]+([01]?\d|jan|feb|mar|apr|mai|jun|jul|aug|sep|okt|nov|dez)[.\-/\s]+(20\d{2})/
  );

  if (!match) return null;

  let [, d, m, y] = match;

  const monthMap = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    mai: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    okt: "10",
    nov: "11",
    dez: "12"
  };

  m = m.toLowerCase();
  if (monthMap[m]) m = monthMap[m];

  d = d.padStart(2, "0");
  m = String(m).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

/* ============================================================
   🏷️ ABSENDER / ENTITY
============================================================ */
function detectEntity(rawText = "") {
  const text = normalizeText(rawText);

  if (text.includes("r+v") || text.includes("ruv")) return "R+V";
  if (text.includes("allianz")) return "Allianz";
  if (text.includes("huk")) return "HUK";
  if (text.includes("axa")) return "AXA";
  if (text.includes("ergo")) return "ERGO";

  return "Unbekannt";
}

/* ============================================================
   💶 BETRAG – VERSICHERUNG / RECHNUNG
============================================================ */
function detectAmount(rawText = "") {
  const text = normalizeText(rawText);

  // mehrere Raten: "am 18.03.2024 346,50 eur"
  const datedAmounts = [...text.matchAll(
    /am\s+[0-3]?\d[.\-/][01]?\d[.\-/]20\d{2}\s+([0-9]+[.,][0-9]{2})/g
  )];

  if (datedAmounts.length > 0) {
    return datedAmounts.map(m => m[1].replace(".", ",")).join("_");
  }

  // klassische Summe
  const sumMatch = text.match(/summe[^0-9]*([0-9]+[.,][0-9]{2})/);
  if (sumMatch) {
    return sumMatch[1].replace(".", ",");
  }

  return "0,00";
}

/* ============================================================
   📂 STORAGE PFAD (BELEGDATUM!)
============================================================ */
function buildStoragePath({ date, category }) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.toLocaleString("de-DE", { month: "long" });

  return `/${year}/${month}/${category}`;
}

/* ============================================================
   📄 DATEINAME (ARCHITEKTURREGEL)
============================================================ */
function buildFileName({ date, category, entity, amount }) {
  return `${date}_${category}_${entity}_${amount}€`;
}

/* ============================================================
   🚀 STORAGE ENTRYPOINT
============================================================ */
async function storeDocument(documentContext) {
  const { buffer, category, rawText } = documentContext;

  const detectedDate = detectDocumentDate(rawText);
  const date = detectedDate || new Date().toISOString().slice(0, 10);

  const entity = detectEntity(rawText);
  const amount = detectAmount(rawText);

  const folderPath = buildStoragePath({ date, category });
  const fileName = buildFileName({
    date,
    category,
    entity,
    amount
  });

  await uploadToDropbox({
    buffer,
    folderPath,
    fileName
  });

  return {
    storagePath: `${folderPath}/${fileName}`,
    fileName,
    date,
    entity,
    amount
  };
}

module.exports = { storeDocument };