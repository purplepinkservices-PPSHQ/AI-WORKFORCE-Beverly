"use strict";

/**
 * FREE MODE:
 * - KEIN Legal
 * - KEIN Modul
 * - Nur Metadaten
 */

async function analyzeDocument({ ocrResult }) {
  const rawText = String(ocrResult?.text || "").trim();

  return {
    analysis: {
      type: "Unklar",
      category: "Unklar",
      date: null,
      creditor: "Unbekannt",
      source: ocrResult?.source || "OCR",
      confidence: 0.5
    },
    module: null,
    rawText
  };
}

module.exports = { analyzeDocument };