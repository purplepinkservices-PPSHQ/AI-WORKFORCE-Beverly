"use strict";

// ============================================================
// Finance – Insurance Submodule (v1)
// Menü & Struktur ONLY
// ============================================================

function getInsuranceMenu() {
  return {
    text:
      "🛡️ Versicherungsdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "insurance_overview", label: "Übersicht erstellen" },
      { id: "insurance_needs", label: "Bedarfsanalyse" },
      { id: "insurance_compare", label: "Angebot vergleichen" },
      { id: "insurance_check", label: "Police prüfen" },
      { id: "insurance_claim", label: "Schadensmeldung / Leistungsantrag" }
    ]
  };
}

module.exports = { getInsuranceMenu };