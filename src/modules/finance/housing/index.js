"use strict";

// ============================================================
// Finance / Housing – Entry (v1)
// STEP 6.6 – Wohnen & Miete (Menü & Struktur)
// ============================================================
//
// Vertrag:
// - Keine Fachlogik
// - Keine Automatisierung
// - Reines UX-Menü
// - Aufruf ausschließlich über Finance-Dispatcher
// ============================================================

const { getHousingMenu } = require("./housing-menu");

function getModuleReaction({ state }) {
  return getHousingMenu({ state });
}

module.exports = { getModuleReaction };