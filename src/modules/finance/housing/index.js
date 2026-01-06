"use strict";

// ============================================================
// Finance – Housing Submodule (v1)
// ============================================================

function getHousingMenu() {
  return {
    text:
      "🏠 Wohn- oder Vertragsdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "finance_housing_check", label: "Dokument prüfen" },
      { id: "finance_housing_summary", label: "Übersicht erstellen" },
      { id: "finance_housing_letter", label: "Schreiben erstellen" },
      { id: "finance_housing_deadline", label: "Frist / Termin" },
      { id: "finance_back", label: "Zurück" }
    ]
  };
}

module.exports = { getHousingMenu };