"use strict";

// ============================================================
// Legal – Menü (v1 FINAL v2, router-kompatibel)
// ============================================================

function getLegalMenu({ state }) {

  // ----------------------------------------------------------
  // UNSICHER / UNKLAR
  // ----------------------------------------------------------
  if (state === "UNSICHER" || state === "UNKLAR") {
    return {
      text:
        "⚠️ Rechtlich erkannt, aber mit Unsicherheiten.\n\n" +
        "Was möchtest du tun?",
      actions: [
        { id: "LEGAL_CHECK", label: "Dokument prüfen" },                 // 1
        { id: "LEGAL_STORE_ONLY", label: "Dokument nur ablegen" },       // 2
        { id: "LEGAL_REPLY", label: "Antwort verfassen" },               // 3
        { id: "LEGAL_EXPLAIN_SIMPLE", label: "Dokument einfach erklärt" },// 4
        { id: "LEGAL_CREATE_CASE", label: "Akte zum Dokument anlegen" }, // 5

        // 🔑 Router-Fix: immer Position 6
        { id: "LEGAL_BACK_TO_MAIN", label: "Anderen Bereich wählen" }    // 6
      ]
    };
  }

  // ----------------------------------------------------------
  // SICHER
  // ----------------------------------------------------------
  return {
    text:
      "⚖️ Rechtlich relevantes Dokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "LEGAL_CHECK", label: "Dokument prüfen" },                  // 1
      { id: "LEGAL_REPLY", label: "Antwort verfassen" },                // 2
      { id: "LEGAL_EXPLAIN_SIMPLE", label: "Dokument einfach erklärt" }, // 3
      { id: "LEGAL_CREATE_CASE", label: "Akte zum Dokument anlegen" },   // 4
      { id: "LEGAL_STORE_ONLY", label: "Dokument nur ablegen" },         // 5

      // 🔑 Router-Fix
      { id: "LEGAL_BACK_TO_MAIN", label: "Anderen Bereich wählen" }      // 6
    ]
  };
}

module.exports = { getLegalMenu };