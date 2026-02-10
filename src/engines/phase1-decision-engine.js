"use strict";

/*
============================================================
 Datei: src/engines/phase1-decision-engine.js
 Zweck: HARTE Phase-1-Entscheidung
        Einnahme | Ausgabe | Recht | Gesundheit
============================================================

❗ KEINE UX
❗ KEINE ROUTER-LOGIK
❗ KEINE SPEICHERUNG
❗ KEINE RÜCKFRAGEN

Input:
- rawText        (string)
- visionFacts   (object|null)
- ocrText       (string|null)

Output:
{
  phase1Intent: "EXPENSE" | "INCOME" | "LEGAL" | "HEALTH",
  confidence: number (0–1),
  source: "vision" | "ocr" | "rules" | "fallback"
}
============================================================
*/

const LEGAL_DOC_TYPES = new Set([
  "VERTRAG",
  "MAHNUNG",
  "BESCHEID",
  "KÜNDIGUNG",
  "ANHÖRUNG",
  "URTEIL"
]);

const HEALTH_KEYWORDS = [
  "arzt",
  "praxis",
  "krankenhaus",
  "apotheke",
  "rezept",
  "therapie",
  "diagnose",
  "patient"
];

const INCOME_KEYWORDS = [
  "gutschrift",
  "zahlungseingang",
  "überweisung erhalten",
  "honorar",
  "lohn",
  "gehalt",
  "vergütung",
  "einnahme"
];

const EXPENSE_KEYWORDS = [
  "kassenbon",
  "rechnung",
  "bezahlt",
  "visa",
  "ec-karte",
  "kartenzahlung",
  "mwst",
  "netto",
  "brutto",
  "summe"
];

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "");
}

function containsAny(text, keywords) {
  return keywords.some(k => text.includes(k));
}

/**
 * ============================================================
 * 🚀 ENTRYPOINT
 * ============================================================
 */
function decidePhase1({ rawText = "", visionFacts = null, ocrText = null } = {}) {
  const text = normalize(rawText || ocrText || "");

  // ----------------------------------------------------------
  // 1️⃣ VISION-FACTS (höchste Autorität)
  // ----------------------------------------------------------
  if (visionFacts?.documentType) {
    if (LEGAL_DOC_TYPES.has(visionFacts.documentType)) {
      return {
        phase1Intent: "LEGAL",
        confidence: visionFacts.confidence ?? 0.9,
        source: "vision"
      };
    }

    if (visionFacts.documentType === "KASSENBON" || visionFacts.documentType === "RECHNUNG") {
      return {
        phase1Intent: "EXPENSE",
        confidence: visionFacts.confidence ?? 0.9,
        source: "vision"
      };
    }
  }

  // ----------------------------------------------------------
  // 2️⃣ TEXTLICH KLARE FÄLLE
  // ----------------------------------------------------------
  if (containsAny(text, HEALTH_KEYWORDS)) {
    return {
      phase1Intent: "HEALTH",
      confidence: 0.85,
      source: "ocr"
    };
  }

  if (containsAny(text, INCOME_KEYWORDS)) {
    return {
      phase1Intent: "INCOME",
      confidence: 0.8,
      source: "ocr"
    };
  }

  if (containsAny(text, EXPENSE_KEYWORDS)) {
    return {
      phase1Intent: "EXPENSE",
      confidence: 0.75,
      source: "ocr"
    };
  }

  // ----------------------------------------------------------
  // 3️⃣ LETZTER FALLBACK (bewusst)
  // ----------------------------------------------------------
  return {
    phase1Intent: "EXPENSE",
    confidence: 0.4,
    source: "fallback"
  };
}

module.exports = { decidePhase1 };