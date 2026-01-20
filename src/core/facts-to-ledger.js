"use strict";

/*
============================================================
 Datei: src/core/facts-to-ledger.js
 Zweck: Mapping von extrahierten Facts → Ledger Entry
============================================================
*/

const { createLedgerEntry } = require("../engines/ledger-entry-engine");

async function factsToLedger({ facts, ctx }) {
  if (!facts || !ctx) {
    throw new Error("factsToLedger: facts oder ctx fehlt");
  }

  if (!ctx.ledgerMonthId) {
    throw new Error("factsToLedger: ledgerMonthId fehlt im ctx");
  }

  const amount = Number(facts.amounts?.total || 0);

  const entry = {
    title: `${facts.creditor?.name || "Unbekannt"} ${Math.abs(amount).toFixed(2)}€`,
    amount: Math.abs(amount),

    category: facts.creditor?.category || "Sonstiges",
    creditor: facts.creditor?.name || "Unbekannt",

    ledgerMonthId: ctx.ledgerMonthId,   // ✅ FIX
    documentId: ctx.documentId || null
  };

  return createLedgerEntry(entry);
}

module.exports = {
  factsToLedger
};