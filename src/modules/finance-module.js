// ============================================================
// Datei: src/modules/finance-module.js
// ============================================================
"use strict";

// Finance-Untermodule
const { getModuleReaction: taxModule } = require("./finance/tax");
const { getModuleReaction: householdModule } = require("./finance/household/index");
const { getInsuranceMenu } = require("./finance/insurance");

function getModuleReaction({ state, category, fromFinanceSelection }) {

  // ------------------------------------------------------------
  // DIREKT AUS FINANCE-AUSWAHL → SUBMODUL
  // ------------------------------------------------------------
  if (fromFinanceSelection) {
    if (category === "steuer") return taxModule({ state });
    if (category === "haushalt") return householdModule({ state });
    if (category === "versicherung") return getInsuranceMenu();
  }

  // ------------------------------------------------------------
  // FINANCE STARTMENÜ
  // ------------------------------------------------------------
  if (!category || category === "finance") {
    return {
      text:
        "💼 Finanzdokument erkannt.\n\n" +
        "Bitte wähle den passenden Bereich:",
      actions: [
        { id: "FINANCE_SELECT_STEUER", label: "Steuer" },
        { id: "FINANCE_SELECT_HAUSHALT", label: "Haushalt" },
        { id: "FINANCE_SELECT_VERSICHERUNG", label: "Versicherung" },
        { id: "FINANCE_SELECT_EINKOMMEN", label: "Einkommen" },
        { id: "FINANCE_SELECT_WOHNEN", label: "Wohnen" },
        { id: "FINANCE_BACK_TO_MAIN", label: "Anderen Bereich wählen" },
        { id: "FINANCE_STORE_ONLY", label: "Dokument nur ablegen" }
      ]
    };
  }

  // ------------------------------------------------------------
  // FALLBACK (sicher)
  // ------------------------------------------------------------
  return {
    text:
      "💼 Finanzdokument erkannt.\n\n" +
      "Bitte wähle den passenden Bereich:",
    actions: [
      { id: "FINANCE_SELECT_STEUER", label: "Steuer" },
      { id: "FINANCE_SELECT_HAUSHALT", label: "Haushalt" },
      { id: "FINANCE_SELECT_VERSICHERUNG", label: "Versicherung" },
      { id: "FINANCE_SELECT_EINKOMMEN", label: "Einkommen" },
      { id: "FINANCE_SELECT_WOHNEN", label: "Wohnen" },
      { id: "FINANCE_BACK_TO_MAIN", label: "Anderen Bereich wählen" },
      { id: "FINANCE_STORE_ONLY", label: "Dokument nur ablegen" }
    ]
  };
}

module.exports = { getModuleReaction };