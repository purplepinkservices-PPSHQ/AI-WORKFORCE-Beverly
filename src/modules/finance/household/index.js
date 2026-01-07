"use strict";

// ============================================================
// Finance / Household – Entry (v1)
// STEP 6.3 – Haushalt (Menü & Struktur)
// ============================================================
//
// Vertrag:
// - Keine Fachlogik
// - Keine Automatisierung
// - Reines UX-Menü
// - Wird ausschließlich vom Finance-Dispatcher aufgerufen
// ============================================================

const { getHouseholdMenu } = require("./household-menu");

function getModuleReaction({ state }) {
  // UNSICHER kann später differenziert werden
  return getHouseholdMenu({ state });
}

module.exports = { getModuleReaction };