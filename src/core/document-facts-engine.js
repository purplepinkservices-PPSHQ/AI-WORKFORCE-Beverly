"use strict";

/*
============================================================
 Datei: src/core/document-facts-engine.js
 Zweck: Zentrale Facts-Extraktion aus Text (LESEND)
============================================================

Output:
{
  amounts: { total, currency },
  confidence
}
*/

function parseAmountCandidate(s) {
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
  const matches = rawText.match(/\d{1,7}[.,]\d{2}/g) || [];
  return matches
    .map(parseAmountCandidate)
    .filter(v => typeof v === "number" && isFinite(v) && v > 0);
}

function detectTotalAmount(rawText = "") {
  const candidates = extractAmountCandidates(rawText);
  if (!candidates.length) {
    return { total: null, confidence: 0 };
  }

  return {
    total: Math.max(...candidates),
    confidence: candidates.length === 1 ? 0.9 : 0.6
  };
}

async function extractDocumentFacts({ rawText = "" } = {}) {
  const amount = detectTotalAmount(rawText);

  return {
    amounts: {
      total: amount.total,
      currency: "EUR"
    },
    confidence: amount.confidence
  };
}

module.exports = { extractDocumentFacts };