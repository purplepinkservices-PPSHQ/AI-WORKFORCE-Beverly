"use strict";

// ============================================================
// Health – Entry (v1)
// STEP 6.7 – Gesundheit (Menü & Struktur)
// ============================================================
//
// Vertrag:
// - Keine Diagnose
// - Keine Bewertung
// - Keine Automatisierung
// - Reines UX-Menü
// ============================================================

const { getHealthMenu } = require("./health-menu");

function getModuleReaction({ state }) {
  return getHealthMenu({ state });
}

module.exports = { getModuleReaction };