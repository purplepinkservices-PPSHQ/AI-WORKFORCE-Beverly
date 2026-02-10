"use strict";

// ============================================================
// Dokumentart-Engine (Score-System)
// Datei: src/engines/document-type-engine.js
// ============================================================

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N} %.\-]/gu, " ")
    .trim();
}

// ------------------------------------------------------------
// Händlerliste = starker Kassenbon-Indikator
// ------------------------------------------------------------
const RETAILERS = [
  "aldi", "lidl", "rewe", "edeka", "penny", "netto", "kaufland", "norma",
  "dm", "rossmann", "mueller",
  "ikea", "media markt", "mediamarkt", "saturn", "decathlon",
  "h&m", "zara", "primark",
  "mcdonald", "burger king", "kfc", "subway",
  "dominos", "pizza hut", "starbucks"
];

const CATALOG = {
  Rechnung: [
    ["rechnung", 5],
    ["rechnungsnr", 4],
    ["rechnungsnummer", 4],
    ["rechnungsdatum", 3],
    ["zahlungsziel", 3],
    ["fällig", 3],
    ["leistung", 3],
    ["nettobetrag", 3],
    ["bruttobetrag", 3],
    ["umsatzsteuer", 3],
    ["mwst", 2]
  ],

  Kassenbon: [
    ["kassenbon", 6],
    ["bon", 4],
    ["kasse", 3],
    ["wechselgeld", 3],
    ["bar", 2],
    ["ec", 2],
    ["kartenzahlung", 2],
    ["summe", 2],
    ["betrag", 2],
    ["mwst", 1]
  ],

  Quittung: [
    ["quittung", 5],
    ["betrag erhalten", 4],
    ["zahlung erhalten", 4],
    ["bezahlt", 3]
  ],

  Vertrag: [
    ["vertrag", 6],
    ["vertragsnummer", 4],
    ["laufzeit", 3],
    ["kündigung", 3],
    ["vereinbarung", 2]
  ],

  Versicherung: [
    ["versicherung", 6],
    ["police", 4],
    ["beitrag", 3],
    ["schaden", 3]
  ],

  Abrechnung: [
    ["abrechnung", 6],
    ["provision", 4],
    ["courtage", 4],
    ["gutschrift", 3]
  ],

  Steuer: [
    ["finanzamt", 6],
    ["steuerbescheid", 6],
    ["umsatzsteuer", 4],
    ["elster", 3]
  ],

  Behoerde: [
    ["bescheid", 5],
    ["aktenzeichen", 4],
    ["gericht", 6],
    ["jobcenter", 6],
    ["arbeitsagentur", 6]
  ],

  Bank: [
    ["kontoauszug", 6],
    ["iban", 3],
    ["überweisung", 3],
    ["lastschrift", 3]
  ]
};

// ------------------------------------------------------------
// Hauptlogik
// ------------------------------------------------------------
function detectDocumentType(rawText = "") {
  const text = normalize(rawText);
  const scores = {};

  for (const [type, markers] of Object.entries(CATALOG)) {
    let score = 0;
    let formalHits = 0;

    for (const [keyword, weight] of markers) {
      if (text.includes(keyword)) {
        score += weight;
        if (["rechnungsnr", "rechnungsnummer", "zahlungsziel", "leistung"].includes(keyword)) {
          formalHits++;
        }
      }
    }

    // 🔒 Fix B: Rechnung nur mit Struktur voll gültig
    if (type === "Rechnung" && formalHits < 2) {
      score *= 0.5;
    }

    scores[type] = score;
  }

  // 🔒 Fix A: Händler → Kassenbon-Boost
  if (RETAILERS.some(r => text.includes(r))) {
    scores.Kassenbon = (scores.Kassenbon || 0) + 5;
  }

  const bestScore = Math.max(...Object.values(scores));
  const topTypes = Object.entries(scores)
    .filter(([_, s]) => s === bestScore && s > 0)
    .map(([t]) => t);

  // 🔒 Fix C: Kassenbon früher sicher
  if (topTypes.length === 1 && topTypes[0] === "Kassenbon" && bestScore >= 6) {
    return {
      type: "Kassenbon",
      confidence: 0.9,
      score: bestScore,
      scores,
      needsUserConfirmation: false,
      source: "RetailerBoost"
    };
  }

  if (bestScore < 5) {
    return {
      type: "Divers",
      confidence: 0.4,
      score: bestScore,
      scores,
      needsUserConfirmation: true,
      source: "LowScoreFallback"
    };
  }

  if (topTypes.length > 1) {
    return {
      type: "Unklar",
      candidates: topTypes,
      confidence: 0.5,
      score: bestScore,
      scores,
      needsUserConfirmation: true,
      source: "ScoreTie"
    };
  }

  const confidence = Math.min(0.95, Math.max(0.65, bestScore / 18));

  return {
    type: topTypes[0],
    confidence,
    score: bestScore,
    scores,
    needsUserConfirmation: confidence < 0.65,
    source: "ScoreEngine"
  };
}

module.exports = { detectDocumentType };