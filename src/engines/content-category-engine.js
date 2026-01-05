"use strict";

// ============================================================
// Content Category Engine
// Bestimmt die inhaltliche Bedeutung eines Dokuments
// Phase 2 ONLY
//
// Zentrale Regeln:
// - Dokumenttyp ≠ Inhaltskategorie
// - Dokumenttyp kann Inhaltskategorie BEGRENZEN
// - Kontext > Keywords
// ============================================================

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N} %.\-]/gu, " ")
    .trim();
}

// ------------------------------------------------------------
// Inhaltskategorien (inhaltlich, nicht formal)
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
    "miete",
    "nebenkosten"
  ],

  recht: [
    "gericht",
    "aktenzeichen",
    "bescheid",
    "mahnung",
    "forderung",
    "zahlungserinnerung",
    "verfahren"
  ],

  versicherung: [
    "versicherung",
    "police",
    "schaden",
    "beitrag",
    "versicherungsnummer"
  ],

  arbeit: [
    "abrechnung",
    "gehalt",
    "lohn",
    "arbeitgeber",
    "provision",
    "courtage"
  ]
};

// ------------------------------------------------------------
// Hauptfunktion
// ------------------------------------------------------------
function detectContentCategory(rawText = "", documentType = null) {
  const text = normalize(rawText);

  // =========================================================
  // HARTE ARCHITEKTUR-REGEL (robust)
  // =========================================================
  if (
    documentType &&
    String(documentType).toLowerCase().includes("kassenbon")
  ) {
    return {
      category: "haushalt",
      confidence: 0.95
    };
  }

  // =========================================================
  // Scoring-Logik (nur wenn keine harte Regel greift)
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
    return {
      category: "unklar",
      confidence: 0.3
    };
  }

  return {
    category: bestMatch[0],
    confidence: Math.min(0.9, 0.4 + bestScore * 0.1)
  };
}

module.exports = { detectContentCategory };