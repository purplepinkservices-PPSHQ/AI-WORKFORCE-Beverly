"use strict";

// ============================================================
// Steuer-Modul v1
// NUR Menü & Struktur – keine Fachlogik
// Wird ausschließlich über das Finance-Modul aufgerufen
// ============================================================

function getModuleReaction({ state }) {
  // ------------------------------------------------------------
  // Unsicheres Dokument
  // ------------------------------------------------------------
  if (state === "UNSICHER") {
    return {
      text:
        "🧾 Steuerdokument erkannt, aber mit Unsicherheiten.\n\n" +
        "Was möchtest du tun?",
      actions: [
        "Dokument prüfen",
        "Unterlagen für Steuer sammeln",
        "Dokument nur ablegen"
      ]
    };
  }

  // ------------------------------------------------------------
  // Sicheres Dokument
  // ------------------------------------------------------------
  return {
    text:
      "🧾 Steuerdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      "Unterlagen für Steuer",
      "Dokument prüfen",
      "Eigenauskunft / Haushaltsbuch",
      "Frist / Termin",
      "Dokument nur ablegen"
    ]
  };
}

module.exports = { getModuleReaction };