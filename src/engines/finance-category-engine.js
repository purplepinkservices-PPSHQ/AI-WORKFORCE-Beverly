"use strict";

// ============================================================
// Finance Category Engine
// Phase 2 – Fachliche Finanz-Zuordnung
// ============================================================

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function detectFinanceCategory(rawText = "") {
  const t = normalize(rawText);

  // ------------------------------------------------------------
  // STEUER
  // ------------------------------------------------------------
  if (
    t.includes("finanzamt") ||
    t.includes("steuer") ||
    t.includes("elster") ||
    t.includes("steuerbescheid") ||
    t.includes("einkommensteuer")
  ) {
    return "steuer";
  }

  // ------------------------------------------------------------
  // VERSICHERUNG
  // ------------------------------------------------------------
  if (
    t.includes("versicherung") ||
    t.includes("police") ||
    t.includes("leistungsabrechnung") ||
    t.includes("schadennummer") ||
    t.includes("krankenversicherung") ||
    t.includes("haftpflicht")
  ) {
    return "versicherung";
  }

  // ------------------------------------------------------------
  // EINKOMMEN
  // ------------------------------------------------------------
  if (
    t.includes("gehalt") ||
    t.includes("lohnabrechnung") ||
    t.includes("honorar") ||
    t.includes("besoldung") ||
    t.includes("verdienst")
  ) {
    return "einkommen";
  }

  // ------------------------------------------------------------
  // WOHNEN / HAUS
  // ------------------------------------------------------------
  if (
    t.includes("miete") ||
    t.includes("mietvertrag") ||
    t.includes("nebenkosten") ||
    t.includes("betriebskosten") ||
    t.includes("wohnflaeche") ||
    t.includes("vermieter")
  ) {
    return "wohnen";
  }

  // ------------------------------------------------------------
  // HAUSHALT (Fallback, bewusst)
  // ------------------------------------------------------------
  return "haushalt";
}

module.exports = { detectFinanceCategory };