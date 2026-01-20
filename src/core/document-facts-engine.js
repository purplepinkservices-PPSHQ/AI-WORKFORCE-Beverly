"use strict";

/*
============================================================
 Datei: src/core/document-facts-engine.js
 Zweck: Zentrale Facts-Extraktion aus OCR-Text (Hybrid)
 Version: v1.1 (Ledger-fähig, stabil)
============================================================

Output (stabil):
{
  creditor: { name, category },
  documentType,
  amounts: { total, currency },
  dates: { documentDate },
  items: [...],          // optional (Kassenzettel)
  meta: {
    usedLLM,
    llmConfidence,
    llmNotes,
    heuristicConfidence
  }
}
*/

// ============================================================
// OPTIONAL LLM FALLBACK
// ============================================================

let extractFactsWithLLM = null;
try {
  ({ extractFactsWithLLM } = require("./llm-facts-extractor"));
} catch (e) {
  extractFactsWithLLM = null;
}

// ============================================================
// NORMALISIERUNG
// ============================================================

function normalizeText(raw = "") {
  return String(raw)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^\p{L}\p{N}\s€.,-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================================
// 📅 DATUM (heuristisch)
// ============================================================

function detectDocumentDate(rawText = "") {
  const text = normalizeText(rawText);

  const match = text.match(
    /([0-3]?\d)[.\-/\s]+([01]?\d|jan|feb|mar|mae|apr|mai|jun|jul|aug|sep|okt|nov|dez)[.\-/\s]+(20\d{2}|\d{2})/
  );

  if (!match) return null;

  let [, d, m, y] = match;

  const monthMap = {
    jan: "01",
    feb: "02",
    mar: "03",
    mae: "03",
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

  m = monthMap[m] || m;
  y = y.length === 2 ? "20" + y : y;

  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// ============================================================
// 📄 DOKUMENTART
// ============================================================

function detectDocumentType(rawText = "") {
  const text = normalizeText(rawText);

  if (
    text.includes("kassenzettel") ||
    text.includes("quittung") ||
    text.includes("bon")
  ) return "KASSENZETTEL";

  if (text.includes("steuer")) return "STEUERBESCHEID";
  if (text.includes("vollstreckung")) return "VOLLSTRECKUNG";
  if (text.includes("mahnung")) return "MAHNUNG";
  if (text.includes("bescheid")) return "BESCHEID";
  if (text.includes("rechnung")) return "RECHNUNG";

  return "DOKUMENT";
}

// ============================================================
// 🏷️ GLÄUBIGER / ABSENDER
// ============================================================

function detectCreditor(rawText = "", documentType = "DOKUMENT") {
  const text = normalizeText(rawText);

  // Behörden
  if (text.includes("finanzamt")) return { name: "Finanzamt", category: "BEHOERDE" };
  if (text.includes("jobcenter")) return { name: "Jobcenter", category: "BEHOERDE" };
  if (text.includes("staatsanwaltschaft")) return { name: "Staatsanwaltschaft", category: "BEHOERDE" };
  if (text.includes("gericht")) return { name: "Gericht", category: "BEHOERDE" };

  // Haushaltsbelege → erste sinnvolle Zeile
  if (["KASSENZETTEL", "RECHNUNG"].includes(documentType)) {
    const firstLine = String(rawText)
      .split(/\r?\n/)
      .map(l => l.trim())
      .find(l =>
        l.length > 3 &&
        !/[0-9]{2}[.\-/][0-9]{2}/.test(l) &&
        !/€/.test(l)
      );

    return {
      name: firstLine ? firstLine.toUpperCase() : "Unbekannt",
      category: "HAUSHALT"
    };
  }

  return { name: "Unbekannt", category: "UNBEKANNT" };
}

// ============================================================
// 💶 BETRÄGE
// ============================================================

function parseMoneyCandidateToNumber(s) {
  if (!s) return null;
  const str = String(s).replace(/\s/g, "");

  if (str.includes(",") && str.includes(".")) {
    return str.lastIndexOf(",") > str.lastIndexOf(".")
      ? Number(str.replace(/\./g, "").replace(",", "."))
      : Number(str.replace(/,/g, ""));
  }

  if (str.includes(",")) return Number(str.replace(",", "."));
  return Number(str);
}

function extractAmountCandidates(rawText = "") {
  const text = String(rawText);
  const matches = text.match(/\d{1,7}[.,]\d{2}/g) || [];

  return matches
    .map(parseMoneyCandidateToNumber)
    .filter(v => typeof v === "number" && isFinite(v) && v > 0);
}

function detectTotalAmountHeuristic(rawText = "") {
  const text = normalizeText(rawText);

  const totalRegex =
    /(gesamt|summe|betrag|zu zahlen|endbetrag)[^\d]{0,40}(\d{1,7}[.,]\d{2})/;

  const m = text.match(totalRegex);
  if (m && m[2]) {
    const v = parseMoneyCandidateToNumber(m[2]);
    if (isFinite(v)) return { value: v, confidence: 0.85 };
  }

  const candidates = extractAmountCandidates(rawText);
  if (candidates.length === 0) return { value: null, confidence: 0.0 };

  return {
    value: Math.max(...candidates),
    confidence: candidates.length === 1 ? 0.7 : 0.4
  };
}

// ============================================================
// 🧾 KASSENZETTEL-POSITIONEN (optional)
// ============================================================

function extractReceiptItems(rawText = "") {
  const lines = String(rawText).split(/\r?\n/);
  const items = [];

  for (const line of lines) {
    const m = line.match(/(.{2,})\s+(\d{1,4}[.,]\d{2})\s*€/);
    if (!m) continue;

    const label = m[1].trim();
    const price = parseMoneyCandidateToNumber(m[2]);

    if (!label || !isFinite(price)) continue;
    if (/summe|gesamt|mwst|ust/i.test(label)) continue;

    items.push({ label: label.slice(0, 80), amount: price });
    if (items.length >= 30) break;
  }

  return items;
}

// ============================================================
// 🤖 LLM-ENTSCHEIDUNG
// ============================================================

function shouldUseLLM({ creditor, docType, amountConfidence, rawText }) {
  if (typeof extractFactsWithLLM !== "function") return false;
  if (amountConfidence >= 0.8) return false;
  if (creditor.category === "BEHOERDE") return true;
  if (extractAmountCandidates(rawText).length >= 3) return true;
  if (["MAHNUNG", "VOLLSTRECKUNG", "STEUERBESCHEID"].includes(docType)) return true;
  return amountConfidence < 0.5;
}

// ============================================================
// 🚀 ENTRYPOINT
// ============================================================

async function extractDocumentFacts({ rawText = "" } = {}) {
  const documentType = detectDocumentType(rawText);
  const creditor = detectCreditor(rawText, documentType);
  const docDate = detectDocumentDate(rawText);
  const totalHeu = detectTotalAmountHeuristic(rawText);

  const items =
    documentType === "KASSENZETTEL"
      ? extractReceiptItems(rawText)
      : [];

  const base = {
    creditor,
    documentType,
    amounts: { total: totalHeu.value, currency: "EUR" },
    dates: { documentDate: docDate },
    items,
    meta: {
      usedLLM: false,
      heuristicConfidence: {
        totalAmount: totalHeu.confidence
      }
    }
  };

  if (!shouldUseLLM({
    creditor,
    docType: documentType,
    amountConfidence: totalHeu.confidence,
    rawText
  })) {
    return base;
  }

  try {
    const llm = await extractFactsWithLLM(rawText);
    return {
      ...base,
      ...llm,
      meta: {
        ...base.meta,
        usedLLM: true,
        llmConfidence: llm?.confidence ?? null,
        llmNotes: llm?.notes ?? null
      }
    };
  } catch {
    return base;
  }
}

module.exports = {
  extractDocumentFacts
};