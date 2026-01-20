"use strict";

// ============================================================
// Finance / Household – Menü (v1 FINAL + Ledger)
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
      // Explizites Fachmodul
      // -----------------------------
      { id: "finance_household_ledger", label: "📊 Haushaltsbuch (Ledger)" },

      // -----------------------------
      // Navigation / Exit
      // -----------------------------
      { id: "FINANCE_BACK_TO_MAIN", label: "Anderen Bereich wählen" },
      { id: "FINANCE_STORE_ONLY", label: "Dokument nur ablegen" }
    ]
  };
}

module.exports = { getHouseholdMenu };