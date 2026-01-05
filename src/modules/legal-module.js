"use strict";

// ============================================================
// Legal Module
// Phase 3B – Fachliche Modul-Reaktion (MINIMAL)
// Vertrag:
// getModuleReaction({ state, category, document }) -> { text, actions }
// ============================================================

function getModuleReaction({ state, category, document }) {
  // ABBRUCH
  if (state === "ABBRUCH") {
    return {
      text: "❌ Es gab ein technisches Problem bei der rechtlichen Einordnung.",
      actions: []
    };
  }

  // UNKLAR
  if (state === "UNKLAR") {
    return {
      text:
        "🤔 Ich bin mir rechtlich noch nicht sicher, worum es geht.\n" +
        "Wie möchtest du fortfahren?",
      actions: ["PRUEFEN", "ABLEGEN"]
    };
  }

  // UNSICHER
  if (state === "UNSICHER") {
    return {
      text:
        "⚠️ Rechtlich erkannt, aber mit Unsicherheiten.\n" +
        "Was möchtest du tun?",
      actions: ["PRUEFEN", "ABLEGEN"]
    };
  }

  // SICHER
  return {
    text:
      "⚖️ Rechtlich relevantes Dokument erkannt.\n" +
      "Ich kann es prüfen, ablegen oder eine Frist vormerken.",
    actions: ["PRUEFEN", "ABLEGEN", "TERMIN"]
  };
}

module.exports = { getModuleReaction };