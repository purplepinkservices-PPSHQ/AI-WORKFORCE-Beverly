"use strict";

// ============================================================
// Finance / Housing – Menü (v1 FINAL)
// Einheitlich nach Appendix C + Exit
// ============================================================

function getHousingMenu() {
  return {
    text:
      "🏠 Wohndokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      {
        id: "housing_check",
        label: "Dokument prüfen"
      },
      {
        id: "housing_billing_check",
        label: "Abrechnung prüfen"
      },
      {
        id: "housing_prepare_reply",
        label: "Antwort vorbereiten"
      },
      {
        id: "housing_overview",
        label: "Übersicht erstellen"
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

module.exports = { getHousingMenu };