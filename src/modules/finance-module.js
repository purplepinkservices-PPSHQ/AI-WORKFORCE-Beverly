// ============================================================
// Datei: src/modules/finance-module.js
// ============================================================
"use strict";

// ------------------------------------------------------------
// Finance-Untermodule (IMMER über index.js)
// ------------------------------------------------------------
const { getModuleReaction: taxModule } =
  require("./finance/tax");

const { getModuleReaction: householdModule } =
  require("./finance/household/index");

const { getModuleReaction: insuranceModule } =
  require("./finance/insurance/index");

const { getModuleReaction: incomeModule } =
  require("./finance/income/index");

const { getModuleReaction: housingModule } =
  require("./finance/housing/index");

// ============================================================
// Finance Dispatcher
// ============================================================

function getModuleReaction({ state, category, fromFinanceSelection }) {

  // ----------------------------------------------------------
  // Weiterleitung aus Finance-Auswahl → Submodule
  // ----------------------------------------------------------
  if (fromFinanceSelection) {
    if (category === "steuer") return taxModule({ state });
    if (category === "haushalt") return householdModule({ state });
    if (category === "versicherung") return insuranceModule({ state });
    if (category === "einkommen") return incomeModule({ state });
    if (category === "wohnen") return housingModule({ state });
  }

  // ----------------------------------------------------------
  // Finance-Hauptmenü
  // ----------------------------------------------------------
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