// ============================================================
// Datei: src/modules/finance-module.js
// ============================================================
"use strict";

// Einheitliche Finance-Untermodule
const { getModuleReaction: taxModule } = require("./finance/tax");
const { getModuleReaction: householdModule } = require("./finance/household");
const { getInsuranceMenu } = require("./finance/insurance");

function getModuleReaction({ state, category }) {
  // ------------------------------------------------------------
  // FINANCE START (kein Untermodul aktiv)
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
        { id: "FINANCE_STORE_ONLY", label: "Dokument nur ablegen" }
      ]
    };
  }

  // ------------------------------------------------------------
  // STEUER
  // ------------------------------------------------------------
  if (category === "steuer") {
    return taxModule({ state });
  }

  // ------------------------------------------------------------
  // HAUSHALT
  // ------------------------------------------------------------
  if (category === "haushalt") {
    return householdModule({ state });
  }

  // ------------------------------------------------------------
  // VERSICHERUNG
  // ------------------------------------------------------------
  if (category === "versicherung") {
    return getInsuranceMenu();
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
      { id: "FINANCE_STORE_ONLY", label: "Dokument nur ablegen" }
    ]
  };
}

module.exports = { getModuleReaction };