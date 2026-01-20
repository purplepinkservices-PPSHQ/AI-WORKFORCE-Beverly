// ============================================================
// Datei: src/modules/finance-module.js
// ============================================================
"use strict";

// ------------------------------------------------------------
// Helper: robustes Modul-Resolving
// ------------------------------------------------------------
function resolveModule(mod) {
  return typeof mod === "function" ? mod : mod.getModuleReaction;
}

// ------------------------------------------------------------
// Finance-Untermodule (robust geladen)
// ------------------------------------------------------------
const taxModule = resolveModule(require("./finance/tax"));
const householdModule = resolveModule(require("./finance/household/index"));
const insuranceModule = resolveModule(require("./finance/insurance/index"));
const incomeModule = resolveModule(require("./finance/income/index"));
const housingModule = resolveModule(require("./finance/housing/index"));

// ============================================================
// Finance Dispatcher
// ============================================================

function getModuleReaction({
  state,
  category,
  fromFinanceSelection,
  actionId,
  documentContext
}) {

  // ----------------------------------------------------------
  // 1) Erstaufruf aus Finance-Bereichsauswahl
  // ----------------------------------------------------------
  if (fromFinanceSelection) {
    if (category === "steuer") return taxModule({ state });
    if (category === "haushalt") return householdModule({ state });
    if (category === "versicherung") return insuranceModule({ state });
    if (category === "einkommen") return incomeModule({ state });
    if (category === "wohnen") return housingModule({ state });
  }

  // ----------------------------------------------------------
  // 2) Folge-Actions (category kommt vom Router)
  // ----------------------------------------------------------
  if (category === "steuer") {
    return taxModule({ state, actionId, documentContext });
  }

  if (category === "haushalt") {
    return householdModule({ state, actionId, documentContext });
  }

  if (category === "versicherung") {
    return insuranceModule({ state, actionId, documentContext });
  }

  if (category === "einkommen") {
    return incomeModule({ state, actionId, documentContext });
  }

  if (category === "wohnen") {
    return housingModule({ state, actionId, documentContext });
  }

  // ----------------------------------------------------------
  // 3) Finance-Hauptmenü
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