"use strict";

// ============================================================
// Content Category Engine
// Phase 2 – Inhaltliche Einordnung
// ARCHITEKTUR v0.5 KONFORM
// ============================================================

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N} %.\-]/gu, " ")
    .trim();
}

// ------------------------------------------------------------
// Kategorien (Keywords)
// ------------------------------------------------------------
const CATEGORIES = {
  recht: [
    "notar",
    "kostenrechnung",
    "gnotkg",
    "gericht",
    "inkasso",
    "vollstreckung",
    "klage",
    "aktenzeichen",
    "mahnung",
    "zahlungserinnerung",
    "verfahren",
    "urkunde",
    "beglaubigung"
  ],

  versicherung: [
    "versicherung",
    "police",
    "versicherungsnummer",
    "beitrag",
    "prämie",
    "praemie",
    "kaution",
    "r+v",
    "allgemeine versicherung",
    "leistungsabrechnung",
    "schaden"
  ],

  steuer: [
    "finanzamt",
    "steuerbescheid",
    "einkommensteuer",
    "umsatzsteuer",
    "vorsteuer",
    "elster",
    "steuererklärung",
    "rechnung",
    "netto",
    "brutto",
    "ust"
  ],

  wohnen: [
    "miete",
    "mietvertrag",
    "nebenkostenabrechnung",
    "wohnfläche",
    "kaltmiete",
    "warmmiete",
    "vermieter",
    "hausverwaltung"
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
    "honorar",
    "rezept"
  ],

  haushalt: [
    "kassenbon",
    "supermarkt",
    "lebensmittel",
    "einkauf",
    "strom",
    "wasser",
    "haushalt"
  ]
};

// ------------------------------------------------------------
// Hauptlogik (PRIORITÄTSBASIERT)
// ------------------------------------------------------------
function detectContentCategory(rawText = "", documentType = null) {
  const text = normalize(rawText);

  // =========================================================
  // 1️⃣ RECHT – höchste Priorität
  // =========================================================
  const legalHits = CATEGORIES.recht.filter((k) => text.includes(k)).length;
  if (legalHits > 0) {
    return {
      category: "recht",
      confidence: Math.min(0.95, 0.6 + legalHits * 0.1)
    };
  }

  // =========================================================
  // 2️⃣ VERSICHERUNG
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
  // 3️⃣ STEUER
  // =========================================================
  const taxHits = CATEGORIES.steuer.filter((k) => text.includes(k)).length;
  if (taxHits > 0) {
    return {
      category: "steuer",
      confidence: Math.min(0.9, 0.55 + taxHits * 0.1)
    };
  }

  // =========================================================
  // 4️⃣ WOHNEN
  // =========================================================
  const housingHits = CATEGORIES.wohnen.filter((k) =>
    text.includes(k)
  ).length;
  if (housingHits > 0) {
    return {
      category: "wohnen",
      confidence: Math.min(0.9, 0.55 + housingHits * 0.1)
    };
  }

  // =========================================================
  // 5️⃣ ARBEIT / EINKOMMEN
  // =========================================================
  const workHits = CATEGORIES.arbeit.filter((k) => text.includes(k)).length;
  if (workHits > 0) {
    return {
      category: "arbeit",
      confidence: Math.min(0.9, 0.55 + workHits * 0.1)
    };
  }

  // =========================================================
  // 6️⃣ HAUSHALT – NUR ALS FALLBACK
  // =========================================================
  const householdHits = CATEGORIES.haushalt.filter((k) =>
    text.includes(k)
  ).length;

  if (
    householdHits > 0 ||
    (documentType &&
      String(documentType).toLowerCase().includes("kassenbon"))
  ) {
    return { category: "haushalt", confidence: 0.8 };
  }

  // =========================================================
  // UNKLAR
  // =========================================================
  return { category: "unklar", confidence: 0.3 };
}

module.exports = { detectContentCategory };