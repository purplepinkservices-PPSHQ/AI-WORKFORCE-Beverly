// ============================================================
// Datei: src/modules/finance/household.js
// Modul: Finance → Haushalt (v1)
// Scope: Menü + Struktur (keine Fachlogik)
// ============================================================
"use strict";

function getModuleReaction({ state, category, document }) {
  return {
    text:
      "🧾 Haushaltsdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "household_archive", label: "Nur ablegen" },
      { id: "household_reassign", label: "Kategorie ändern" },
      { id: "household_note", label: "Notiz hinzufügen" }
    ]
  };
}

module.exports = { getModuleReaction };