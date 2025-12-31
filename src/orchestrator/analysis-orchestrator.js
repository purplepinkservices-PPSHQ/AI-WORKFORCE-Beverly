// ============================================================
// Datei: src/orchestrator/analysis-orchestrator.js
// ============================================================
"use strict";

const { detectDocumentType } = require("../engines/document-type-engine");
const { detectCreditor } = require("../engines/creditor-engine");
const { detectPerson } = require("../engines/person-engine");
const { detectDocumentDate } = require("../engines/date-engine");
const { detectCategoryFromKeywords } = require("../keywords");

/* =========================================================
   🧩 Modul Loader: legal-lawyer (robust)
   ========================================================= */
function loadLegalLawyerModule() {
  try {
    return require("../modules/legal-lawyer");
  } catch (_) {}

  try {
    const classifier = require("../modules/legal-lawyer/classifier");
    const analyzer = require("../modules/legal-lawyer/analyzer");
    const output = require("../modules/legal-lawyer/output");

    const matches = classifier.matches || classifier.shouldRun || classifier;
    const analyze = analyzer.analyze || analyzer.run || analyzer;
    const feedback = output.feedback || output.render || output.format || output;

    return {
      id: "legal-lawyer",
      matches,
      analyze,
      feedback
    };
  } catch (_) {}

  return null;
}

const legalLawyer = loadLegalLawyerModule();

/* =========================================================
   🔧 MINIMAL: Authority/Behörden Keywords
   ========================================================= */
const AUTHORITY_KEYWORDS = [
  "hauptzollamt",
  "zoll",
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
  return AUTHORITY_KEYWORDS.some((k) => t.includes(k));
}

/* =========================================================
   🔧 MINIMAL: Betreff extrahieren
   ========================================================= */
function extractSubject(rawText = "") {
  const lines = String(rawText)
    .split(/\r?\n/)
    .map((l) => l.trim())
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
   🧠 ANALYSE (stabil + Modul-Hook als ADD-ON)
   ========================================================= */
async function analyzeDocument({ ocrResult }) {
  const rawText = (ocrResult?.text || "").trim();

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const headerText = lines.slice(0, 20).join("\n");

  const keywordCategoryResult = detectCategoryFromKeywords(headerText);
  const typeResult = detectDocumentType(headerText + "\n" + rawText);
  const creditorResult = detectCreditor(rawText);
  const personResult = detectPerson(rawText);
  const dateResult = detectDocumentDate(rawText);

  const authorityHit = hasAuthorityKeyword(headerText + "\n" + rawText);

  const safeType = typeResult?.type || "Unklar";

  let safeCategory =
    keywordCategoryResult?.category || typeResult?.category || safeType;

  if (authorityHit) safeCategory = "Behoerden";

  const safeDate = dateResult?.date || null;
  const subject = extractSubject(rawText);

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
     🧩 MODUL-AUSLÖSUNG (ADD-ON, nicht blockierend)
     ========================================================= */
  let moduleResponse = null;

  if (legalLawyer && typeof legalLawyer.matches === "function") {
    let shouldRun = false;
    try {
      shouldRun = !!legalLawyer.matches(analysis, rawText);
    } catch {
      shouldRun = false;
    }

    if (shouldRun && typeof legalLawyer.analyze === "function") {
      try {
        const modResult = legalLawyer.analyze(analysis, rawText);
        const msg =
          typeof legalLawyer.feedback === "function"
            ? legalLawyer.feedback(modResult, analysis, rawText)
            : null;

        if (msg) {
          moduleResponse = {
            module: legalLawyer.id || "legal-lawyer",
            message: msg,
            reactions: ["✍️"]
          };
        }
      } catch {
        moduleResponse = null;
      }
    }
  }

  return { analysis, module: moduleResponse };
}

module.exports = { analyzeDocument };