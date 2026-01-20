"use strict";

function getLedgerMenu() {
  return {
    text: "📊 Haushaltsbuch – Übersicht\nWähle, was du sehen möchtest:",
    actions: [
      { id: "LEDGER_MONTH", label: "📅 Monatliche Einordnung anzeigen" },
      { id: "LEDGER_CATEGORY", label: "📂 Kategorie-Zuordnung erklären" },
      { id: "LEDGER_SUMMARY", label: "💰 Einnahme / Ausgabe zusammenfassen" },
      { id: "LEDGER_DOC", label: "📄 Dokument im Haushaltsbuch erklären" },
      { id: "LEDGER_HELP", label: "ℹ️ Was ist das Haushaltsbuch?" },
      { id: "SWITCH_DOMAIN", label: "🔁 Anderen Bereich wählen" },
    ],
  };
}

module.exports = {
  getLedgerMenu,
};