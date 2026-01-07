"use strict";

// ============================================================
// Finance / Income – Entry (v1)
// STEP 6.5 – Einkommen (Menü & Struktur)
// ============================================================
//
// Vertrag:
// - Keine Fachlogik
// - Keine Automatisierung
// - Reines UX-Menü
// - Aufruf ausschließlich über Finance-Dispatcher
// ============================================================

const { getIncomeMenu } = require("./income-menu");

function getModuleReaction({ state }) {
  return getIncomeMenu({ state });
}

module.exports = { getModuleReaction };