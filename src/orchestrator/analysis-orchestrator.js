"use strict";

const { detectDocumentType } = require("../engines/document-type-engine");
const { detectCreditor } = require("../engines/creditor-engine");
const { detectPerson } = require("../engines/person-engine");
const { detectDocumentDate } = require("../engines/date-engine");
const { detectCategoryFromKeywords } = require("../keywords");

// 🧱 Modul legal-lawyer (ADD-ON)
const legalLawyer = require("../modules/legal-lawyer");

/* =========================================================
   🔧 MINIMAL: Authority/Behörden Keywords
   ========================================================= */
const AUTHORITY_KEYWORDS = [
  "amtsgericht",
  "landgericht",
  "oberlandesgericht",
  "staatsanwaltschaft",
  "jobcenter",
  "arbeitsagentur",
  "finanzamt",
  "landesjustizkasse",
  "polizei",
  "ministerium",
  "stadt",
  "gemeinde",
  "gericht",
  "gerichtsvollzieher",
  "pfändung",
  "mahnung",
  "vollstreckung",
  "ordnungsamt"
];

function hasAuthorityKeyword(text = "") {
  const t = String(text).toLowerCase();
  return AUTHORITY_KEYWORDS.some(k => t.includes(k));
}

/* =========================================================
   🔧 MINIMAL: Betreff extrahieren
   ========================================================= */
function extractSubject(rawText = "") {
  const lines = String(rawText)
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  for (const line of lines.slice(0, 40)) {
    const m = line.match(/^betreff\s*[:\-]\s*(.+)$/i);
    if (m && m[1]) return m[1].trim();
  }

  const joined = lines.slice(0, 60).join(" ");
  const m2 = joined.match(/\bbetreff\s*[:\-]\s*(.{5,160})/i);
  if (m2 && m2[1]) return m2[1].trim();

  return null;
}

/* =========================================================
   ✅ MINIMAL FIX: Datum robust lesen (date / value / raw)
   ========================================================= */
function pickDate(dateResult) {
  return (
    dateResult?.date ||
    dateResult?.value ||
    dateResult?.raw ||
    null
  );
}

/* =========================================================
   🧠 ANALYSE (RETURN WIE FRÜHER: NUR ANALYSIS-OBJEKT)
   + Modul optional als analysis.module
   ========================================================= */
async function analyzeDocument({ ocrResult }) {
  const rawText = (ocrResult?.text || "").trim();

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const headerText = lines.slice(0, 20).join("\n");

  const keywordCategoryResult = detectCategoryFromKeywords(headerText);
  const typeResult = detectDocumentType(headerText + "\n" + rawText);
  const creditorResult = detectCreditor(rawText);
  const personResult = detectPerson(rawText);
  const dateResult = detectDocumentDate(rawText);

  const authorityHit = hasAuthorityKeyword(headerText + "\n" + rawText);

  const safeType = typeResult?.type || "Unklar";

  let safeCategory =
    keywordCategoryResult?.category ||
    typeResult?.category ||
    safeType;

  if (authorityHit) safeCategory = "Behoerden";

  const safeDate = pickDate(dateResult);
  const subject = extractSubject(rawText);

  // ✅ RETURN-FORMAT WIE VORHER (analysis direkt!)
  const analysis = {
    type: safeType,
    category: safeCategory,
    date: safeDate,
    subject: subject,
    creditor: creditorResult?.creditor || "Unbekannt",
    person: personResult?.lastname || "Unbekannt",
    source: ocrResult?.source || "OpenAI Vision",
    confidence: Math.min(
      typeResult?.confidence || 0.5,
      creditorResult?.confidence || 0.5,
      personResult?.confidence || 0.5
    )
  };

  /* =========================================================
     🧩 MODUL (ADD-ON) – OHNE PIPELINE ZU ÄNDERN
     ========================================================= */
  if (legalLawyer && typeof legalLawyer.matches === "function") {
    try {
      if (legalLawyer.matches(analysis, rawText)) {
        const result = legalLawyer.analyze(analysis, rawText);
        analysis.module = {
          id: legalLawyer.id,
          message: legalLawyer.feedback(result),
          reactions: ["✍️", "📂"] // Antwort verfassen | nur ablegen
        };
      }
    } catch {
      // Modul darf Free niemals crashen
    }
  }

  return analysis;
}

module.exports = { analyzeDocument };