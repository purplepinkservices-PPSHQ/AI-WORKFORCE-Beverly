// ============================================================
// Datei: src/modules/finance/income.js
// Modul: Finance → Einkommen (v1)
// Scope: Menü + Struktur
// ============================================================
"use strict";

function getModuleReaction({ state, category, document }) {
  return {
    text:
      "💰 Einkommensdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "income_archive", label: "Nur ablegen" },
      { id: "income_assign", label: "Einkommensart zuordnen" },
      { id: "income_overview", label: "Übersicht anzeigen" }
    ]
  };
}

module.exports = { getModuleReaction };