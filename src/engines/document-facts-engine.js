"use strict";

/**
 * ============================================================
 * Datei: src/core/document-facts-engine.js
 * Zweck: Zentrale Facts-Extraktion aus OCR-Text (Hybrid)
 * Version: v1.0-stable (Heuristik-first, optionaler LLM-Fallback)
 *
 * Output (stabil)
 * {
 *   creditor: { name, category },
 *   documentType: string,
 *   amounts: { total: number|null, currency: "EUR" },
 *   dates: { documentDate: "YYYY-MM-DD"|null },
 *   items: [{ label, amount }] , // optional (Kassenzettel)
 *   meta: {
 *     usedLLM: boolean,
 *     llmConfidence: number|null,
 *     llmNotes: string,
 *     heuristicConfidence: { totalAmount: number }
 *   }
 * }
 * ============================================================
 */

let extractFactsWithLLM = null;
try {
  ({ extractFactsWithLLM } = require("./llm-facts-extractor"));
} catch (_) {
  extractFactsWithLLM = null;
}

/* ============================================================
   NORMALISIERUNG
============================================================ */
function normalizeText(raw = "") {
  return String(raw || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^\p{L}\p{N}\s%.,€-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ============================================================
   📄 DOKUMENTART (heuristisch)
============================================================ */
function detectDocumentType(rawText = "") {
  const t = normalizeText(rawText);

  if (t.includes("ankuendigung der vollstreckung") || t.includes("vollstreckung")) return "VOLLSTRECKUNG";
  if (t.includes("steuerbescheid") || t.includes("einkommensteuer") || t.includes("umsatzsteuer")) return "STEUERBESCHEID";
  if (t.includes("bescheid")) return "BESCHEID";

  if (t.includes("mahnung") || t.includes("zahlungserinnerung")) return "MAHNUNG";
  if (t.includes("rechnung")) return "RECHNUNG";
  if (t.includes("quittung")) return "QUITTUNG";
  if (t.includes("kassenzettel") || t.includes("bon")) return "KASSENZETTEL";

  return "DOKUMENT";
}

/* ============================================================
   📅 DATUM (heuristisch)
============================================================ */
function detectDocumentDate(rawText = "") {
  const text = normalizeText(rawText);

  // 15.01.2026 / 15-01-26 / 15/01/2026
  const n = text.match(/([0-3]?\d)[.\-/]([01]?\d)[.\-/](20\d{2}|\d{2})/);
  if (n) {
    const d = String(n[1]).padStart(2, "0");
    const m = String(n[2]).padStart(2, "0");
    const y = n[3].length === 2 ? `20${n[3]}` : n[3];
    return `${y}-${m}-${d}`;
  }

  // 15 jan 2026 / 15 okt 2024 etc.
  const w = text.match(/([0-3]?\d)[.\-\s/]+(jan|feb|mar|mae|apr|mai|jun|jul|aug|sep|okt|nov|dez)[.\-\s/]+(20\d{2})/);
  if (!w) return null;

  const day = String(w[1]).padStart(2, "0");
  const mon = String(w[2]).toLowerCase();
  const year = String(w[3]);

  const monthMap = {
    jan: "01", feb: "02", mar: "03", mae: "03", apr: "04", mai: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", okt: "10", nov: "11", dez: "12"
  };

  const mm = monthMap[mon];
  if (!mm) return null;

  return `${year}-${mm}-${day}`;
}

/* ============================================================
   💶 BETRAG (heuristisch)
============================================================ */
function parseMoneyCandidateToNumber(s) {
  if (!s) return null;
  const str = String(s).trim();
  const hasDot = str.includes(".");
  const hasComma = str.includes(",");

  // EU: 2.578,00  | US/OCR: 2,578.00
  if (hasDot && hasComma) {
    const lastDot = str.lastIndexOf(".");
    const lastComma = str.lastIndexOf(",");
    if (lastComma > lastDot) return Number(str.replace(/\./g, "").replace(",", "."));
    return Number(str.replace(/,/g, ""));
  }

  if (hasComma && !hasDot) return Number(str.replace(",", "."));
  if (hasDot && !hasComma) return Number(str);

  return null;
}

function extractAmountCandidates(rawText = "") {
  const text = String(rawText || "");
  const candidates = new Set();

  // EU
  const eu = text.match(/\b\d{1,3}(?:\.\d{3})*(?:,\d{2})\b|\b\d+(?:,\d{2})\b/g);
  if (eu) eu.forEach(x => candidates.add(x));

  // US/OCR
  const us = text.match(/\b\d{1,3}(?:,\d{3})*(?:\.\d{2})\b|\b\d+(?:\.\d{2})\b/g);
  if (us) us.forEach(x => candidates.add(x));

  const nums = [];
  for (const s of candidates) {
    const v = parseMoneyCandidateToNumber(s);
    if (typeof v === "number" && isFinite(v) && v > 0) nums.push(v);
  }

  return Array.from(new Set(nums));
}

function detectTotalAmountHeuristic(rawText = "") {
  const text = normalizeText(rawText);

  // Labels (hoch priorisiert)
  const totalRegex =
    /(insg\.?|insgesamt|gesamtbetrag|gesamtsumme|zu zahlen|nachzahlung|festgesetzt|offenbetrag|endbetrag)[^\d]{0,40}([0-9]{1,7}[.,][0-9]{2})/i;

  const m = text.match(totalRegex);
  if (m && m[2]) {
    const v = parseMoneyCandidateToNumber(m[2]);
    if (typeof v === "number" && isFinite(v)) return { value: v, confidence: 0.85 };
  }

  const candidates = extractAmountCandidates(rawText);
  if (candidates.length === 0) return { value: null, confidence: 0.0 };

  // Kassenzettel/Belege: größter Betrag ist fast immer Summe
  const max = Math.max(...candidates);
  const confidence = candidates.length === 1 ? 0.7 : 0.55;

  return { value: max, confidence };
}

/* ============================================================
   🧾 Kassenzettel-Items (optional, best-effort)
============================================================ */
function extractReceiptItems(rawText = "") {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const items = [];

  for (const line of lines) {
    const m = line.match(/^(.{2,}?)\s+([0-9]{1,4}[.,][0-9]{2})\s*(€)?\s*$/);
    if (!m) continue;

    const label = String(m[1] || "").trim();
    const price = parseMoneyCandidateToNumber(m[2]);

    if (!label || typeof price !== "number" || !isFinite(price)) continue;

    const low = normalizeText(label);
    if (low.includes("summe") || low.includes("gesamt") || low.includes("mwst") || low.includes("ust")) continue;

    items.push({ label: label.slice(0, 80), amount: price });
    if (items.length >= 30) break;
  }

  return items;
}

/* ============================================================
   🏷️ CREDITOR / MERCHANT (heuristisch)
============================================================ */
function detectMerchantName(rawText = "") {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const low = normalizeText(line);
    if (!low || low.length < 3) continue;
    if (/\d{2}[.\-/]\d{2}[.\-/]\d{2,4}/.test(low)) continue;
    if (/\d+[.,]\d{2}\s*€/.test(low)) continue;
    if (/strasse|straße|plz|tel|telefon|ust|mwst|kasse|beleg|rechnung|danke|karte|visa|mastercard|debit/.test(low)) continue;

    const digits = (low.match(/\d/g) || []).length;
    if (digits >= 6) continue;

    return line.toUpperCase();
  }

  return "Unbekannt";
}

function detectCreditor(rawText = "", documentType = "DOKUMENT") {
  const text = normalizeText(rawText);

  // Behörden
  if (text.includes("finanzamt")) return { name: "Finanzamt", category: "BEHOERDE" };
  if (text.includes("jobcenter")) return { name: "Jobcenter", category: "BEHOERDE" };
  if (text.includes("staatsanwaltschaft")) return { name: "Staatsanwaltschaft", category: "BEHOERDE" };
  if (text.includes("gericht")) return { name: "Gericht", category: "BEHOERDE" };
  if (text.includes("bundesagentur") || text.includes("agentur fuer arbeit")) return { name: "Agentur für Arbeit", category: "BEHOERDE" };

  // Versicherungen / Kassen
  if (text.includes("allianz")) return { name: "Allianz", category: "VERSICHERUNG" };
  if (text.includes("aok")) return { name: "AOK", category: "VERSICHERUNG" };
  if (text.includes("techniker krankenkasse") || text.includes(" tk ")) return { name: "TK", category: "VERSICHERUNG" };

  // Banken
  if (text.includes("sparkasse")) return { name: "Sparkasse", category: "BANK" };
  if (text.includes("volksbank") || text.includes("raiffeisen")) return { name: "Volksbank", category: "BANK" };

  // Telko
  if (text.includes("telekom")) return { name: "Telekom", category: "TELEKOM" };
  if (text.includes("vodafone")) return { name: "Vodafone", category: "TELEKOM" };
  if (text.includes("o2")) return { name: "O2", category: "TELEKOM" };

  // Kassenzettel/Quittung/Rechnung → Merchant als Creditor (für Ledger sinnvoll)
  if (documentType === "KASSENZETTEL" || documentType === "QUITTUNG" || documentType === "RECHNUNG") {
    const merchant = detectMerchantName(rawText);
    return { name: merchant, category: "HAUSHALT" };
  }

  return { name: "Unbekannt", category: "UNBEKANNT" };
}

/* ============================================================
   🤖 LLM Entscheidung
============================================================ */
function shouldUseLLM({ creditor, docType, amountConfidence, rawText }) {
  if (typeof extractFactsWithLLM !== "function") return false;
  if (amountConfidence >= 0.8) return false;
  if (creditor && creditor.category === "BEHOERDE") return true;

  const candidates = extractAmountCandidates(rawText);
  if (candidates.length >= 3) return true;

  if (["MAHNUNG", "VOLLSTRECKUNG", "STEUERBESCHEID", "BESCHEID"].includes(docType)) return true;
  return amountConfidence < 0.5;
}

/* ============================================================
   🚀 ENTRYPOINT (Hybrid)
============================================================ */
async function extractDocumentFacts({ rawText = "" } = {}) {
  const documentType = detectDocumentType(rawText);
  const creditor = detectCreditor(rawText, documentType);

  const docDate = detectDocumentDate(rawText);
  const totalHeu = detectTotalAmountHeuristic(rawText);

  const items = documentType === "KASSENZETTEL" ? extractReceiptItems(rawText) : [];

  const base = {
    creditor,
    documentType,
    amounts: { total: totalHeu.value, currency: "EUR" },
    dates: { documentDate: docDate },
    items,
    meta: {
      usedLLM: false,
      llmConfidence: null,
      llmNotes: "",
      heuristicConfidence: { totalAmount: totalHeu.confidence }
    }
  };

  const useLLM = shouldUseLLM({
    creditor,
    docType: documentType,
    amountConfidence: totalHeu.confidence,
    rawText
  });

  if (!useLLM) return base;

  try {
    const llm = await extractFactsWithLLM(rawText, {
      hint: `Heuristics creditor=${creditor.name}/${creditor.category}, docType=${documentType}, amount=${totalHeu.value}`
    });

    // defensiv mergen (niemals gute Heuristik überschreiben durch null)
    return {
      creditor: (llm && llm.creditor && llm.creditor.name) ? llm.creditor : creditor,
      documentType: (llm && llm.documentType) ? llm.documentType : documentType,
      amounts: {
        total:
          llm && llm.amounts && typeof llm.amounts.total === "number" && isFinite(llm.amounts.total)
            ? llm.amounts.total
            : totalHeu.value,
        currency: "EUR"
      },
      dates: {
        documentDate: (llm && llm.dates && llm.dates.documentDate) ? llm.dates.documentDate : docDate
      },
      items,
      meta: {
        usedLLM: true,
        llmConfidence: (llm && typeof llm.confidence === "number") ? llm.confidence : null,
        llmNotes: (llm && llm.notes) ? String(llm.notes) : "",
        heuristicConfidence: { totalAmount: totalHeu.confidence }
      }
    };
  } catch (_) {
    return base;
  }
}

module.exports = { extractDocumentFacts };