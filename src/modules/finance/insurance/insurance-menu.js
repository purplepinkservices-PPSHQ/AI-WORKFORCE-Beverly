"use strict";

// ============================================================
// Finance / Insurance – Menü (v1 FINAL)
// Einheitlich nach Appendix C + Exit
// ============================================================

function getInsuranceMenu() {
  return {
    text:
      "🛡️ Versicherungsdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      {
        id: "insurance_overview",
        label: "Übersicht erstellen"
      },
      {
        id: "insurance_needs",
        label: "Bedarfsanalyse"
      },
      {
        id: "insurance_compare",
        label: "Angebot vergleichen"
      },
      {
        id: "insurance_check",
        label: "Police prüfen"
      },
      {
        id: "insurance_claim",
        label: "Schadensmeldung / Leistungsantrag"
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

module.exports = { getInsuranceMenu };