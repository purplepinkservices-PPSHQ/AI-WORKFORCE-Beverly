"use strict";

const { detectDocumentType } = require("../engines/document-type-engine");
const { detectCreditor } = require("../engines/creditor-engine");
const { detectPerson } = require("../engines/person-engine");
const { detectDocumentDate } = require("../engines/date-engine");
const { detectCategoryFromKeywords } = require("../keywords");

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
  "gericht"
];

function hasAuthorityKeyword(text = "") {
  const t = String(text).toLowerCase();
  return AUTHORITY_KEYWORDS.some(k => t.includes(k));
}

/* =========================================================
   🔧 MINIMAL: Betreff extrahieren
   ========================================================= */
function extractSubject(rawText = "") {
  const lines = String(rawText).split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Suche gezielt nach "Betreff:"
  for (const line of lines.slice(0, 40)) {
    const m = line.match(/^betreff\s*[:\-]\s*(.+)$/i);
    if (m && m[1]) return m[1].trim();
  }

  // Fallback: "Betreff" irgendwo in der Zeile (OCR-Varianten)
  const joined = lines.slice(0, 60).join(" ");
  const m2 = joined.match(/\bbetreff\s*[:\-]\s*(.{5,160})/i);
  if (m2 && m2[1]) return m2[1].trim();

  return null;
}

async function analyzeDocument({ ocrResult }) {
  const rawText = (ocrResult?.text || "").trim();

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const headerText = lines.slice(0, 20).join("\n");

  const keywordCategoryResult = detectCategoryFromKeywords(headerText);
  const typeResult = detectDocumentType(headerText + "\n" + rawText);
  const creditorResult = detectCreditor(rawText);
  const personResult = detectPerson(rawText);
  const dateResult = detectDocumentDate(rawText);

  // ✅ MINIMAL: Behörde erzwingen, wenn Authority Keywords gefunden werden
  const authorityHit = hasAuthorityKeyword(headerText + "\n" + rawText);

  const safeType = typeResult?.type || "Unklar";

  let safeCategory =
    keywordCategoryResult?.category ||
    typeResult?.category ||
    safeType;

  if (authorityHit) safeCategory = "Behoerden";

  const safeDate = dateResult?.date || null;
  const subject = extractSubject(rawText);

  return {
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
}

module.exports = { analyzeDocument };