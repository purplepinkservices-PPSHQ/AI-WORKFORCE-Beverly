"use strict";

// ============================================================
// Datei: src/engines/dropbox-engine.js
// STEP 12.5 – Storage nutzt Facts Engine (Hybrid, LLM-safe)
// Version: v1.3 – Amount-Sanitizer (Komma/Punkt/Cents-Fehler korrigieren)
// ============================================================

const { uploadToDropbox } = require("../utils/dropbox");
const { extractDocumentFacts } = require("../core/document-facts-engine");

/* ============================================================
   HELPERS
============================================================ */
function formatAmountEUR(amount) {
  if (typeof amount !== "number" || !isFinite(amount)) return "0,00";
  return amount.toFixed(2).replace(".", ",");
}

function safeEntityName(name) {
  const s = String(name || "Unbekannt").trim();
  return s.replace(/[\\/:*?"<>|]/g, "_");
}

/**
 * Extrahiert alle "typischen" Euro-Beträge aus OCR-Text:
 * - 2.578,00
 * - 2578,00
 * - 2,578.00 (OCR/ENG Mischform)
 */
function extractAmountCandidatesFromText(rawText = "") {
  const text = String(rawText || "");

  // Kandidaten als Strings sammeln
  const candidates = new Set();

  // EU-Format: 1.234,56 oder 1234,56
  const euMatches = text.match(/\b\d{1,3}(?:\.\d{3})*(?:,\d{2})\b|\b\d+(?:,\d{2})\b/g);
  if (euMatches) euMatches.forEach(x => candidates.add(x));

  // Misch/OCR: 1,234.56 oder 1234.56
  const usMatches = text.match(/\b\d{1,3}(?:,\d{3})*(?:\.\d{2})\b|\b\d+(?:\.\d{2})\b/g);
  if (usMatches) usMatches.forEach(x => candidates.add(x));

  // In Zahlen umwandeln (robust)
  const parsed = [];
  for (const s of candidates) {
    const v = parseMoneyToNumber(s);
    if (typeof v === "number" && isFinite(v) && v > 0) parsed.push(v);
  }

  // Duplikate raus
  return Array.from(new Set(parsed));
}

function parseMoneyToNumber(s) {
  if (!s) return null;
  const str = String(s).trim();

  const hasDot = str.includes(".");
  const hasComma = str.includes(",");

  if (hasDot && hasComma) {
    const lastDot = str.lastIndexOf(".");
    const lastComma = str.lastIndexOf(",");

    if (lastComma > lastDot) {
      const normalized = str.replace(/\./g, "").replace(",", ".");
      return Number(normalized);
    } else {
      const normalized = str.replace(/,/g, "");
      return Number(normalized);
    }
  }

  if (hasComma && !hasDot) {
    return Number(str.replace(",", "."));
  }

  if (hasDot && !hasComma) {
    return Number(str);
  }

  return null;
}

/**
 * Korrigiert typische "Cents als Euro"-Fehler:
 * Beispiel: 257800 -> soll 2578,00 sein.
 */
function sanitizeTotalAmount(amountNumber, rawText = "") {
  if (typeof amountNumber !== "number" || !isFinite(amountNumber) || amountNumber <= 0) {
    return amountNumber;
  }

  const candidates = extractAmountCandidatesFromText(rawText);

  if (candidates.length > 0) {
    const direct = candidates.find(v => Math.abs(v - amountNumber) <= 0.01);
    if (direct) return direct;

    const scaledOptions = [amountNumber / 100, amountNumber / 1000, amountNumber / 10000];
    for (const opt of scaledOptions) {
      const match = candidates.find(v => Math.abs(v - opt) <= 0.01);
      if (match) return match;
    }

    let best = candidates[0];
    let bestScore = Infinity;

    for (const v of candidates) {
      const score = Math.abs(v - amountNumber);
      if (score < bestScore) {
        best = v;
        bestScore = score;
      }
    }

    if (amountNumber >= 100000 && best < amountNumber / 10) {
      return best;
    }

    return best;
  }

  if (amountNumber >= 100000) {
    const opt = amountNumber / 100;
    if (opt > 0 && opt < 100000) return opt;
  }

  return amountNumber;
}

/* ============================================================
   📂 STORAGE PFAD
============================================================ */
function buildStoragePath(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.toLocaleString("de-DE", { month: "long" });
  return `/${year}/${month}`;
}

/* ============================================================
   📄 DATEINAME
============================================================ */
function buildFileName({ date, entity, amount }) {
  // ✅ FIX: Dateiname OHNE Betrag (Amount bleibt trotzdem berechnet für Facts/Notion)
  return `${date}_${entity}`;
}

/* ============================================================
   🚀 ENTRYPOINT
============================================================ */
async function storeDocument(documentContext) {
  const { buffer, rawText } = documentContext;

  // Facts sicher erzeugen (auch wenn Router sie nicht mitschickt)
  const facts = documentContext?.facts
    ? documentContext.facts
    : await extractDocumentFacts({ rawText });

  // ✅ FIX: Datum MUSS aus Facts kommen (ISO: YYYY-MM-DD)
  const date = facts?.dates?.documentDate;

  if (!date) {
    throw new Error("Kein dokumentDate in Facts vorhanden – Speicherung abgebrochen (kein Fallback).");
  }

  const entity = safeEntityName(facts?.creditor?.name || "Unbekannt");

  // Betrag bleibt berechnet (für Logs/Notion), aber NICHT im Dateinamen
  let amountNumber = facts?.amounts?.total;
  if (typeof amountNumber === "number" && isFinite(amountNumber)) {
    amountNumber = sanitizeTotalAmount(amountNumber, rawText);
  }

  const amount = formatAmountEUR(amountNumber);

  const folderPath = buildStoragePath(date);
  const fileName = buildFileName({ date, entity, amount });

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
    amount,
    facts
  };
}

module.exports = { storeDocument };