"use strict";

// ============================================================
// Finance – Income Submodule (v1)
// ============================================================

function getIncomeMenu() {
  return {
    text:
      "💰 Einkommensdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "finance_income_overview", label: "Einkommensübersicht" },
      { id: "finance_income_verify", label: "Abrechnung prüfen" },
      { id: "finance_income_report", label: "Eigenauskunft erstellen" },
      { id: "finance_back", label: "Zurück" }
    ]
  };
}

module.exports = { getIncomeMenu };