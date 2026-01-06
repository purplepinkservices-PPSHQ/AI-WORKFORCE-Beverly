"use strict";

// ============================================================
// Finance – Household Submodule (v1)
// ============================================================

function getHouseholdMenu() {
  return {
    text:
      "🧾 Haushaltsdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "finance_household_store", label: "Nur ablegen" },
      { id: "finance_household_note", label: "Notiz hinzufügen" },
      { id: "finance_household_overview", label: "Haushaltsübersicht" },
      { id: "finance_back", label: "Zurück" }
    ]
  };
}

module.exports = { getHouseholdMenu };