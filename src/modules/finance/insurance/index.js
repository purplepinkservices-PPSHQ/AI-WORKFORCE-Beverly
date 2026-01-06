"use strict";

// ============================================================
// Finance – Insurance Submodule (v1)
// ============================================================

function getInsuranceMenu() {
  return {
    text:
      "🛡️ Versicherungsdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "finance_insurance_overview", label: "Übersicht erstellen" },
      { id: "finance_insurance_analysis", label: "Bedarfsanalyse" },
      { id: "finance_insurance_compare", label: "Angebote vergleichen" },
      { id: "finance_insurance_check", label: "Police prüfen" },
      { id: "finance_insurance_claim", label: "Schadensmeldung / Leistungsantrag" },
      { id: "finance_back", label: "Zurück" }
    ]
  };
}

module.exports = { getInsuranceMenu };