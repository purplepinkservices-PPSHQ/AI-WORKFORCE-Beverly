"use strict";

// ============================================================
// Finance / Tax – Menü (v1.5)
// UX-geschärft, keine Logikänderung
// ============================================================

function getTaxMenu() {
  return {
    text:
      "🧾 Steuerdokument erkannt.\n\n" +
      "Wie möchtest du damit weiter vorgehen?",
    actions: [
      {
        id: "tax_collect_documents",
        label: "Steuerunterlagen sammeln & ordnen"
      },
      {
        id: "tax_explain_document",
        label: "Dokument einordnen & verstehen"
      },
      {
        id: "tax_self_disclosure",
        label: "Eigene Steuersituation überblicken"
      },
      {
        id: "tax_set_deadline",
        label: "Frist oder Termin festhalten"
      },

      // -----------------------------
      // Navigation / Exit (Pflicht)
      // -----------------------------
      {
        id: "FINANCE_BACK_TO_MAIN",
        label: "Anderen Bereich wählen"
      },
      {
        id: "FINANCE_STORE_ONLY",
        label: "Dokument nur ablegen"
      }
    ]
  };
}

module.exports = { getTaxMenu };