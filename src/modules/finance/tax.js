// ============================================================
// Datei: src/modules/finance/tax.js
// Modul: Finance → Steuer (v1)
// Scope: Menü + Struktur (keine Fachlogik)
// ============================================================
"use strict";

function getModuleReaction({ state, category, document }) {
  return {
    text:
      "🧾 Steuerdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      { id: "tax_prepare", label: "Unterlagen für Steuer" },
      { id: "tax_check", label: "Dokument prüfen" },
      { id: "tax_self_disclosure", label: "Eigenauskunft / Haushaltsbuch" },
      { id: "tax_deadline", label: "Frist / Termin" }
    ]
  };
}

module.exports = { getModuleReaction };