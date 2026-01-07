"use strict";

// ============================================================
// Finance / Tax – Menü (v1 FINAL + Exit)
// ============================================================

function getTaxMenu() {
  return {
    text:
      "🧾 Steuerdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "tax_collect_documents", label: "Unterlagen für Steuer sammeln" },
      { id: "tax_explain_document", label: "Dokument prüfen & erklären" },
      { id: "tax_self_disclosure", label: "Eigenauskunft / Haushaltsübersicht" },
      { id: "tax_set_deadline", label: "Frist / Termin vormerken" },

      // -----------------------------
      // Navigation / Exit
      // -----------------------------
      { id: "FINANCE_BACK_TO_MAIN", label: "Anderen Bereich wählen" }, // ← POS 5
      { id: "FINANCE_STORE_ONLY", label: "Dokument nur ablegen" }
    ]
  };
}

module.exports = { getTaxMenu };