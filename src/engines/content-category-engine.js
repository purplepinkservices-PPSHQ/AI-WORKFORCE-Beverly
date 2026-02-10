"use strict";

// ============================================================
// Content Category Engine
// Phase 2 – Inhaltliche Einordnung
// ARCHITEKTUR v0.5 KONFORM
//
// CORE-KATEGORIEN (FINAL):
// - Einnahmen
// - Ausgaben
// - Rechtliches
// - Gesundheit
// - Privat
// - Unbekannt
// ============================================================

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N} %.\-]/gu, " ")
    .trim();
}

// ------------------------------------------------------------
// Keyword-Gruppen (nur Heuristik, kein Output!)
// ------------------------------------------------------------
const KEYWORDS = {
  rechtliches: [
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
    "beglaubigung",
    "bescheid"
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
    "rezept",
    "apotheke"
  ],

  einnahmen: [
    "gehalt",
    "lohn",
    "abrechnung",
    "arbeitgeber",
    "provision",
    "courtage",
    "honorarzahlung",
    "verdienst",
    "einnahme"
  ],

  ausgaben: [
    "kassenbon",
    "kundenbeleg",
    "supermarkt",
    "aldi",
    "lidl",
    "rewe",
    "edeka",
    "einkauf",
    "lebensmittel",
    "betrag",
    "eur",
    "visa",
    "mastercard",
    "zahlung",
    "bezahlt",
    "strom",
    "wasser",
    "internet",
    "telefon"
  ],

  privat: [
    "notiz",
    "termin",
    "kalender",
    "erinnerung",
    "meeting",
    "treffen"
  ]
};

// ------------------------------------------------------------
// Hauptlogik (PRIORITÄTSBASIERT – CORE)
// ------------------------------------------------------------
function detectContentCategory(rawText = "", documentType = null) {
  const text = normalize(rawText);

  // =========================================================
  // 1️⃣ RECHTLICHES (höchste Priorität)
  // =========================================================
  if (KEYWORDS.rechtliches.some(k => text.includes(k))) {
    return { category: "Rechtliches", confidence: 0.9 };
  }

  // =========================================================
  // 2️⃣ GESUNDHEIT
  // =========================================================
  if (KEYWORDS.gesundheit.some(k => text.includes(k))) {
    return { category: "Gesundheit", confidence: 0.9 };
  }

  // =========================================================
  // 3️⃣ EINNAHMEN
  // =========================================================
  if (KEYWORDS.einnahmen.some(k => text.includes(k))) {
    return { category: "Einnahmen", confidence: 0.85 };
  }

  // =========================================================
  // 4️⃣ AUSGABEN (STANDARD FÜR BELEGE)
  // =========================================================
  if (
    KEYWORDS.ausgaben.some(k => text.includes(k)) ||
    (documentType && String(documentType).toLowerCase().includes("kassen"))
  ) {
    return { category: "Ausgaben", confidence: 0.85 };
  }

  // =========================================================
  // 5️⃣ PRIVAT (Notizen / Termine)
  // =========================================================
  if (KEYWORDS.privat.some(k => text.includes(k))) {
    return { category: "Privat", confidence: 0.6 };
  }

  // =========================================================
  // 6️⃣ UNBEKANNT (Fallback)
  // =========================================================
  return { category: "Unbekannt", confidence: 0.3 };
}

module.exports = { detectContentCategory };