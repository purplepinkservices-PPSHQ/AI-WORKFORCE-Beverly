"use strict";

// ============================================================
// Datei: src/core/document-facts-engine.js
// STEP 12.5 – Hybrid Facts Engine (Heuristik → LLM JSON-Schema)
// ============================================================

const { extractFactsWithLLM } = require("./llm-facts-extractor");

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
   🏷️ GLÄUBIGER / ABSENDER (Heuristik)
============================================================ */
function detectCreditor(rawText = "") {
  const text = normalizeText(rawText);

  if (text.includes("finanzamt")) return { name: "Finanzamt", category: "BEHOERDE" };
  if (text.includes("jobcenter")) return { name: "Jobcenter", category: "BEHOERDE" };
  if (text.includes("staatsanwaltschaft")) return { name: "Staatsanwaltschaft", category: "BEHOERDE" };
  if (text.includes("gericht")) return { name: "Gericht", category: "BEHOERDE" };

  if (text.includes("rewe") || text.includes("edeka") || text.includes("aldi")) {
    return { name: "Supermarkt", category: "HAUSHALT" };
  }

  if (text.includes("allianz")) return { name: "Allianz", category: "VERSICHERUNG" };

  return { name: "Unbekannt", category: "UNBEKANNT" };
}

/* ============================================================
   📄 DOKUMENTART (Heuristik)
============================================================ */
function detectDocumentType(rawText = "") {
  const text = normalizeText(rawText);

  if (text.includes("steuer") || text.includes("abgaben")) return "STEUERBESCHEID";
  if (text.includes("mahnung")) return "MAHNUNG";
  if (text.includes("vollstreckung")) return "VOLLSTRECKUNG";
  if (text.includes("bescheid")) return "BESCHEID";
  if (text.includes("rechnung")) return "RECHNUNG";

  return "DOKUMENT";
}

/* ============================================================
   💶 GESAMTBETRAG (Heuristik)
============================================================ */
function detectTotalAmount(rawText = "") {
  const text = normalizeText(rawText);

  // Explizite Gesamtzeile
  const totalRegex =
    /(insg\.?|insgesamt|gesamtbetrag|gesamt|summe|zu zahlen|nachzahlung|festgesetzt)[^\d]{0,30}([0-9]{1,7}[.,][0-9]{2})/;

  const totalMatch = text.match(totalRegex);
  if (totalMatch && totalMatch[2]) {
    return { value: Number(totalMatch[2].replace(",", ".")), confidence: 0.85 };
  }

  // Alle Beträge sammeln
  const amounts = [...text.matchAll(/([0-9]{1,7}[.,][0-9]{2})/g)]
    .map(m => Number(m[1].replace(",", ".")))
    .filter(v => !isNaN(v) && v > 10);

  if (amounts.length === 0) return { value: null, confidence: 0 };

  // Höchster Betrag als Default (oft Endbetrag bei Behörden)
  return { value: Math.max(...amounts), confidence: 0.35 };
}

/* ============================================================
   📅 HAUPTDATUM (Heuristik)
============================================================ */
function detectMainDate(rawText = "") {
  const text = normalizeText(rawText);

  const match = text.match(
    /([0-3]?\d)[.\-/\s]+([01]?\d|jan|feb|mar|apr|mai|jun|jul|aug|sep|okt|nov|dez)[.\-/\s]+(20\d{2})/
  );

  if (!match) return null;

  let [, d, m, y] = match;

  const monthMap = {
    jan: "01", feb: "02", mar: "03", apr: "04",
    mai: "05", jun: "06", jul: "07", aug: "08",
    sep: "09", okt: "10", nov: "11", dez: "12"
  };

  m = m.toLowerCase();
  if (monthMap[m]) m = monthMap[m];

  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/* ============================================================
   🤖 Entscheidung: Wann LLM?
============================================================ */
function shouldUseLLM({ creditor, documentType, amountConf, rawText }) {
  const text = normalizeText(rawText);

  // Heuristik reicht, wenn wir einen klaren Gesamtbetrag haben
  if (amountConf >= 0.8) return false;

  // Behördenfälle sind "semantisch" – LLM hilft massiv
  if (creditor.category === "BEHOERDE") return true;

  // Wenn viele Zahlen vorkommen oder typische Finanz-Keywords
  const numbersCount = (text.match(/[0-9]{1,7}[.,][0-9]{2}/g) || []).length;
  if (numbersCount >= 3) return true;

  // Mahnung/Vollstreckung/Steuer: lieber LLM absichern
  if (["MAHNUNG", "VOLLSTRECKUNG", "STEUERBESCHEID", "BESCHEID"].includes(documentType)) return true;

  return amountConf < 0.5;
}

/* ============================================================
   🚀 ENTRYPOINT (ASYNC, Hybrid)
============================================================ */
async function extractDocumentFacts({ rawText = "" }) {
  const creditor = detectCreditor(rawText);
  const documentType = detectDocumentType(rawText);
  const amountHeu = detectTotalAmount(rawText);
  const mainDate = detectMainDate(rawText);

  const base = {
    creditor,
    documentType,
    amounts: { total: amountHeu.value, currency: "EUR" },
    dates: { documentDate: mainDate }
  };

  // Entscheide LLM
  const useLLM = shouldUseLLM({
    creditor,
    documentType,
    amountConf: amountHeu.confidence,
    rawText
  });

  if (!useLLM) return base;

  // LLM Fallback
  try {
    const llm = await extractFactsWithLLM(rawText, {
      hint: `Heuristics: creditor=${creditor.name}/${creditor.category}, docType=${documentType}, amount=${amountHeu.value}`
    });

    return {
      creditor: llm.creditor || creditor,
      documentType: llm.documentType || documentType,
      amounts: {
        total: (typeof llm?.amounts?.total === "number" ? llm.amounts.total : amountHeu.value),
        currency: "EUR"
      },
      dates: {
        documentDate: llm?.dates?.documentDate || mainDate
      },
      // optional für Debugging / später Audit
      meta: {
        llmConfidence: llm.confidence,
        llmNotes: llm.notes
      }
    };
  } catch (e) {
    // Fallback: Heuristik (niemals crashen)
    return base;
  }
}

module.exports = { extractDocumentFacts };