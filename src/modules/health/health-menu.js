"use strict";

// ============================================================
// Health – Menü (FINAL, router-kompatibel)
// ============================================================

function getHealthMenu({ state }) {

  // ----------------------------------------------------------
  // UNSICHER / UNKLAR
  // ----------------------------------------------------------
  if (state === "UNSICHER" || state === "UNKLAR") {
    return {
      text:
        "⚠️ Gesundheitsdokument erkannt, aber mit Unsicherheiten.\n\n" +
        "Was möchtest du tun?",
      actions: [
        { id: "HEALTH_CHECK", label: "Dokument prüfen" },                 // 1
        { id: "HEALTH_REPLY", label: "Antwort verfassen" },               // 2
        { id: "HEALTH_STORE_ONLY", label: "Dokument nur ablegen" },       // 3
        { id: "HEALTH_COST_PLAN", label: "Heil- und Kostenplan prüfen" }, // 4
        { id: "HEALTH_CREATE_CASE", label: "Akte zum Vorgang anlegen" },  // 5

        // 🔑 Router-relevant
        { id: "HEALTH_BACK_TO_MAIN", label: "Anderen Bereich wählen" }    // 6
      ]
    };
  }

  // ----------------------------------------------------------
  // SICHER
  // ----------------------------------------------------------
  return {
    text:
      "🏥 Gesundheitsdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "HEALTH_EXPLAIN", label: "Dokument erklären lassen" },        // 1
      { id: "HEALTH_OVERVIEW", label: "Übersicht erstellen" },            // 2
      { id: "HEALTH_BUNDLE", label: "Unterlagen bündeln" },               // 3
      { id: "HEALTH_TRANSFER", label: "Weitergabe vorbereiten" },         // 4
      { id: "HEALTH_STORE_ONLY", label: "Dokument nur ablegen" },         // 5

      { id: "HEALTH_BACK_TO_MAIN", label: "Anderen Bereich wählen" }      // 6
    ]
  };
}

module.exports = { getHealthMenu };