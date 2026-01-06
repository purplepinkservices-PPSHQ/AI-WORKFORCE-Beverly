// ============================================================
// Datei: src/modules/finance/housing.js
// Modul: Finance → Wohnung & Haus (v1)
// Scope: Menü + Struktur
// ============================================================
"use strict";

function getModuleReaction({ state, category, document }) {
  return {
    text:
      "🏠 Wohnungs- oder Hausdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "housing_check", label: "Dokument prüfen" },
      { id: "housing_write", label: "Schreiben erstellen" },
      { id: "housing_issue", label: "Mangel dokumentieren" },
      { id: "housing_archive", label: "Archivieren" }
    ]
  };
}

module.exports = { getModuleReaction };