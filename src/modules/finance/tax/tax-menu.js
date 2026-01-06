"use strict";

// ============================================================
// Finance / Tax – Menü (v1)
// ============================================================

function getTaxMenu() {
  return {
    text:
      "🧾 Steuerdokument erkannt.\n\n" +
      "Was möchtest du tun?\n\n" +
      "1️⃣ Unterlagen für Steuer sammeln\n" +
      "2️⃣ Dokument prüfen & erklären\n" +
      "3️⃣ Eigenauskunft / Haushaltsübersicht\n" +
      "4️⃣ Frist / Termin vormerken",
    actions: [
      { id: "tax_collect_documents", label: "Unterlagen für Steuer sammeln" },
      { id: "tax_explain_document", label: "Dokument prüfen & erklären" },
      { id: "tax_self_disclosure", label: "Eigenauskunft / Haushaltsübersicht" },
      { id: "tax_set_deadline", label: "Frist / Termin vormerken" }
    ]
  };
}

module.exports = { getTaxMenu };