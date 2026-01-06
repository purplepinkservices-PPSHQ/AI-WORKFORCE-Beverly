"use strict";

// ============================================================
// Finance – Tax Submodule (v1)
// STEP 6 – Steuer (Menü & Struktur)
// ============================================================
//
// Vertrag:
// - Keine Fachlogik
// - Keine Automatisierung
// - Reines UX-Menü
// - Wird ausschließlich vom Finance-Dispatcher aufgerufen
// ============================================================

function getTaxMenu() {
  return {
    text:
      "🧾 Steuerdokument erkannt.\n\n" +
      "Was möchtest du tun?",
    actions: [
      {
        id: "finance_tax_collect",
        label: "Unterlagen für Steuer sammeln"
      },
      {
        id: "finance_tax_explain",
        label: "Dokument prüfen & erklären"
      },
      {
        id: "finance_tax_overview",
        label: "Eigenauskunft / Haushaltsübersicht"
      },
      {
        id: "finance_tax_deadline",
        label: "Frist / Termin vormerken"
      },
      {
        id: "finance_back",
        label: "Zurück"
      }
    ]
  };
}

module.exports = { getTaxMenu };