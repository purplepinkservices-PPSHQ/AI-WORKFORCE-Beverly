"use strict";

const KEYWORDS = [
  "hauptzollamt",
  "finanzamt",
  "amtsgericht",
  "landgericht",
  "staatsanwaltschaft",
  "gerichtsvollzieher",
  "pfändung",
  "mahnung",
  "vollstreckung",
  "ordnungsamt",
  "polizei",
  "bescheid",
  "anhörung"
];

function matches(analysis, ocrText = "") {
  const text = (ocrText + " " + (analysis.creditor || "")).toLowerCase();
  return KEYWORDS.some(k => text.includes(k));
}

module.exports = { matches };