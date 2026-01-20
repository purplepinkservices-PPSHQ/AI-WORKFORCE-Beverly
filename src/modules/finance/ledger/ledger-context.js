"use strict";

function buildLedgerContext({ documentContext }) {
  const facts = documentContext?.facts || {};
  const dates = facts.dates || {};
  const amounts = facts.amounts || {};
  const creditor = facts.creditor || {};

  const documentDate = dates.documentDate || null;
  const month = documentDate ? new Date(documentDate).toISOString().slice(0, 7) : "unbekannt";

  return {
    month,
    direction: facts.direction || "unbekannt",
    total: typeof amounts.total === "number" ? amounts.total : null,
    category: creditor.category || "unbekannt",
    creditorName: creditor.name || "unbekannt",
  };
}

module.exports = {
  buildLedgerContext,
};