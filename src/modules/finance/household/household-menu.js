"use strict";

// ============================================================
// Finance / Household – Menü (v1 FINAL + Exit)
// ============================================================

function getHouseholdMenu() {
  return {
    text:
      "🧾 Haushaltsdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "finance_household_check", label: "Belege & Ausgaben prüfen" },
      { id: "finance_household_overview", label: "Ausgabenübersicht erstellen" },
      { id: "finance_household_monthly", label: "Monatliche Zusammenfassung" },
      { id: "finance_household_deadline", label: "Frist / Erinnerung" },

      // -----------------------------
      // Navigation / Exit
      // -----------------------------
      { id: "FINANCE_BACK_TO_MAIN", label: "Anderen Bereich wählen" }, // ← POS 5
      { id: "FINANCE_STORE_ONLY", label: "Dokument nur ablegen" }
    ]
  };
}

module.exports = { getHouseholdMenu };