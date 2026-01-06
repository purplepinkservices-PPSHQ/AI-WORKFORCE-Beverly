"use strict";

// ============================================================
// Content Category Engine
// Phase 2 – Inhaltliche Einordnung
// ============================================================

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N} %.\-]/gu, " ")
    .trim();
}

// ------------------------------------------------------------
// Kategorien
// ------------------------------------------------------------
const CATEGORIES = {
  steuer: [
    "finanzamt",
    "steuerbescheid",
    "einkommensteuer",
    "umsatzsteuer",
    "vorsteuer",
    "elster",
    "steuererklärung"
  ],

  versicherung: [
    "versicherung",
    "police",
    "versicherungsnummer",
    "beitrag",
    "praemie",
    "kaution",
    "r+v",
    "allgemeine versicherung"
  ],

  arbeit: [
    "abrechnung",
    "gehalt",
    "lohn",
    "arbeitgeber",
    "provision",
    "courtage"
  ],

  gesundheit: [
    "arzt",
    "zahnarzt",
    "krankenhaus",
    "behandlung",
    "patient",
    "diagnose",
    "therapie",
    "praxis",
    "honorar"
  ],

  haushalt: [
    "kassenbon",
    "supermarkt",
    "lebensmittel",
    "einkauf",
    "strom",
    "wasser",
    "nebenkosten"
  ],

  recht: [
    // NUR echte Rechtseskalation
    "gericht",
    "inkasso",
    "vollstreckung",
    "klage",
    "aktenzeichen",
    "mahnung",
    "zahlungserinnerung",
    "verfahren"
  ]
};

// ------------------------------------------------------------
// Hauptlogik
// ------------------------------------------------------------
function detectContentCategory(rawText = "", documentType = null) {
  const text = normalize(rawText);

  // =========================================================
  // HARTE REGEL: KASSENBON → HAUSHALT
  // =========================================================
  if (
    documentType &&
    String(documentType).toLowerCase().includes("kassenbon")
  ) {
    return { category: "haushalt", confidence: 0.95 };
  }

  // =========================================================
  // Versicherung schlägt Recht (ARCHITEKTURREGEL)
  // =========================================================
  const insuranceHits = CATEGORIES.versicherung.filter((k) =>
    text.includes(k)
  ).length;

  if (insuranceHits > 0) {
    return {
      category: "versicherung",
      confidence: Math.min(0.95, 0.6 + insuranceHits * 0.1)
    };
  }

  // =========================================================
  // Normales Scoring
  // =========================================================
  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    scores[category] = keywords.filter((k) => text.includes(k)).length;
  }

  const bestScore = Math.max(...Object.values(scores));
  const bestMatch = Object.entries(scores).find(
    ([, score]) => score === bestScore
  );

  if (!bestMatch || bestScore === 0) {
    return { category: "unklar", confidence: 0.3 };
  }

  return {
    category: bestMatch[0],
    confidence: Math.min(0.9, 0.4 + bestScore * 0.1)
  };
}

module.exports = { detectContentCategory };