"use strict";

// ============================================================
// Finance / Income – Menü (v1 FINAL)
// Einheitlich nach Appendix C + Exit
// ============================================================

function getIncomeMenu() {
  return {
    text:
      "💰 Einkommensdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      {
        id: "income_overview",
        label: "Einnahmenübersicht erstellen"
      },
      {
        id: "income_check",
        label: "Einnahme prüfen"
      },
      {
        id: "income_assign",
        label: "Einnahme zuordnen"
      },
      {
        id: "income_prepare",
        label: "Unterlagen vorbereiten"
      },

      // -----------------------------
      // Exit / Navigation
      // -----------------------------
      {
        id: "FINANCE_STORE_ONLY",
        label: "Dokument nur ablegen"
      },
      {
        id: "FINANCE_BACK_TO_MAIN",
        label: "Zurück zur Bereichsauswahl"
      }
    ]
  };
}

module.exports = { getIncomeMenu };