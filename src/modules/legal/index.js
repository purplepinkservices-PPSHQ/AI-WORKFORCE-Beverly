"use strict";

// ============================================================
// Legal – Entry (v1)
// STEP 6.8 – Recht (Menü & Struktur)
// ============================================================
//
// Vertrag:
// - Keine Rechtsberatung
// - Keine automatische Bewertung
// - Reines UX-Menü
// ============================================================

const { getLegalMenu } = require("./legal-menu");

function getModuleReaction({ state }) {
  return getLegalMenu({ state });
}

module.exports = { getModuleReaction };