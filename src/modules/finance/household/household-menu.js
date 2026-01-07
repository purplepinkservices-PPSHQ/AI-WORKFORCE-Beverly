"use strict";

// ============================================================
// Finance / Household – Menü (v1)
// Einheitlich nach Appendix C
// ============================================================

function getHouseholdMenu() {
  return {
    text:
      "🧾 Haushaltsdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      {
        id: "finance_household_check",
        label: "Belege & Ausgaben prüfen"
      },
      {
        id: "finance_household_overview",
        label: "Ausgabenübersicht erstellen"
      },
      {
        id: "finance_household_monthly",
        label: "Monatliche Zusammenfassung"
      },
      {
        id: "finance_household_deadline",
        label: "Frist / Erinnerung"
      },
      {
        id: "finance_household_extended_review",
        label: "Dokumentprüfung erweitert"
      }
    ]
  };
}

module.exports = { getHouseholdMenu };