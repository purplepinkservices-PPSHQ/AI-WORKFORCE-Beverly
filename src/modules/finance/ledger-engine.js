"use strict";

// ============================================================
// Datei: src/modules/finance/ledger-engine.js
// STEP 12.2 – Haushaltsbuch / Ledger Engine
// ============================================================

/**
 * Diese Engine übersetzt documentFacts in Buchungen
 * und verwaltet ein zentrales Haushaltsbuch (Ledger).
 *
 * Quelle der Wahrheit: documentFacts
 * Keine OCR, keine Heuristik hier.
 */

const fs = require("fs");
const path = require("path");

// ------------------------------------------------------------
// Speicherort (lokal, später austauschbar)
// ------------------------------------------------------------
const LEDGER_PATH = path.join(
  __dirname,
  "../../../data/finance-ledger.json"
);

// ------------------------------------------------------------
// Ledger laden
// ------------------------------------------------------------
function loadLedger() {
  if (!fs.existsSync(LEDGER_PATH)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(LEDGER_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ------------------------------------------------------------
// Ledger speichern
// ------------------------------------------------------------
function saveLedger(entries) {
  fs.writeFileSync(
    LEDGER_PATH,
    JSON.stringify(entries, null, 2),
    "utf8"
  );
}

// ------------------------------------------------------------
// Facts → Ledger-Einträge
// ------------------------------------------------------------
function factsToLedgerEntries({ facts, documentId }) {
  const entries = [];

  // Einzelbeträge (z. B. Kassenzettel)
  if (Array.isArray(facts.amounts) && facts.amounts.length > 1) {
    for (const a of facts.amounts) {
      entries.push({
        id: `${documentId}-${Math.random().toString(36).slice(2, 8)}`,
        date: facts.date,
        entity: facts.entity,
        amount: facts.direction === "expense" ? -a.value : a.value,
        currency: "EUR",
        taxRelevant: facts.taxRelevant,
        category: "auto",
        source: "document",
        documentId
      });
    }
    return entries;
  }

  // Gesamtbetrag
  entries.push({
    id: documentId,
    date: facts.date,
    entity: facts.entity,
    amount:
      facts.direction === "expense"
        ? -facts.totalAmount
        : facts.totalAmount,
    currency: "EUR",
    taxRelevant: facts.taxRelevant,
    category: "auto",
    source: "document",
    documentId
  });

  return entries;
}

// ------------------------------------------------------------
// Öffentliche API
// ------------------------------------------------------------
async function addDocumentToLedger({ facts, documentId }) {
  const ledger = loadLedger();
  const newEntries = factsToLedgerEntries({ facts, documentId });

  const updated = [...ledger, ...newEntries];
  saveLedger(updated);

  return {
    added: newEntries.length,
    totalEntries: updated.length
  };
}

// ------------------------------------------------------------
// Aggregationen
// ------------------------------------------------------------
function getLedgerSummary({ year, month }) {
  const ledger = loadLedger();

  return ledger
    .filter(e => {
      if (year && !e.date.startsWith(String(year))) return false;
      if (month && e.date.slice(5, 7) !== String(month).padStart(2, "0"))
        return false;
      return true;
    })
    .reduce(
      (acc, e) => {
        if (e.amount > 0) acc.income += e.amount;
        else acc.expense += Math.abs(e.amount);

        if (e.taxRelevant) acc.taxRelevant += Math.abs(e.amount);
        return acc;
      },
      { income: 0, expense: 0, taxRelevant: 0 }
    );
}

module.exports = {
  addDocumentToLedger,
  getLedgerSummary
};