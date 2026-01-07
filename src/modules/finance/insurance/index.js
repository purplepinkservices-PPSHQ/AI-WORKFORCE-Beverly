"use strict";

// ============================================================
// Finance / Insurance – Entry (v1)
// STEP 6.4 – Versicherung (Menü & Struktur)
// ============================================================
//
// Vertrag:
// - Keine Fachlogik
// - Keine Automatisierung
// - Reines UX-Menü
// - Wird ausschließlich vom Finance-Dispatcher aufgerufen
// ============================================================

const { getInsuranceMenu } = require("./insurance-menu");

function getModuleReaction({ state }) {
  // UNSICHER kann später differenziert werden
  return getInsuranceMenu({ state });
}

module.exports = { getModuleReaction };