"use strict";

// ============================================================
// Module Selector
// Phase 2 ONLY
// Entscheidet, welches Fachmodul zuständig ist
// ============================================================

function selectModule({ category }) {
  // ----------------------------------------------------------
  // FINANCE-MODUL (ersetzt tax-module)
  // ----------------------------------------------------------
  if (
    category === "haushalt" ||
    category === "versicherung" ||
    category === "wohnen" ||
    category === "arbeit" ||
    category === "einkommen" ||
    category === "steuer"
  ) {
    return "finance-module";
  }

  // ----------------------------------------------------------
  // RECHT
  // ----------------------------------------------------------
  if (category === "recht") {
    return "legal-module";
  }

  // ----------------------------------------------------------
  // GESUNDHEIT
  // ----------------------------------------------------------
  if (category === "gesundheit") {
    return "health-module";
  }

  // ----------------------------------------------------------
  // FALLBACK
  // ----------------------------------------------------------
  return null;
}

module.exports = { selectModule };