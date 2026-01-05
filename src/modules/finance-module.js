"use strict";

// ============================================================
// Finance Module
// Phase 3B – Fachliche Modul-Reaktion (MINIMAL)
// Intern: Haushalt, Versicherung, Wohnen, Einkommen, Steuer
// Vertrag:
// getModuleReaction({ state, category, document }) -> { text, actions }
// ============================================================

function getModuleReaction({ state, category, document }) {
  // ABBRUCH
  if (state === "ABBRUCH") {
    return {
      text: "❌ Es gab ein technisches Problem bei der finanziellen Einordnung.",
      actions: []
    };
  }

  // UNKLAR
  if (state === "UNKLAR") {
    return {
      text:
        "🤔 Ich bin mir finanziell noch nicht sicher, worum es geht.\n" +
        "Wie möchtest du fortfahren?",
      actions: ["PRUEFEN", "ABLEGEN"]
    };
  }

  // UNSICHER
  if (state === "UNSICHER") {
    return {
      text:
        "⚠️ Finanziell erkannt, aber mit Unsicherheiten.\n" +
        "Was möchtest du tun?",
      actions: ["PRUEFEN", "ABLEGEN"]
    };
  }

  // SICHER – interne Gliederung (minimal)
  // Hinweis: category kommt aus Phase 2 (z. B. haushalt / versicherung / wohnen / einkommen / steuer)
  let headline = "💶 Finanzrelevantes Dokument erkannt.";

  if (category === "haushalt") headline = "🧾 Haushaltsdokument erkannt.";
  if (category === "versicherung") headline = "🛡️ Versicherungsdokument erkannt.";
  if (category === "wohnen") headline = "🏠 Wohn- & Mietdokument erkannt.";
  if (category === "arbeit" || category === "einkommen")
    headline = "💼 Einkommensnachweis erkannt.";
  if (category === "steuer") headline = "🧮 Steuerrelevantes Dokument erkannt.";

  return {
    text:
      `${headline}\n` +
      "Ich kann es prüfen, ablegen oder eine Frist vormerken.",
    actions: ["PRUEFEN", "ABLEGEN", "TERMIN"]
  };
}

module.exports = { getModuleReaction };