"use strict";

/*
============================================================
 Ledger Entry Engine – Beverly AI WORKFORCE
 Zweck:
 - Erstellt Ledger Entry in Notion
============================================================
*/

const { notion } = require("../integrations/notion/notion-client");

const LEDGER_ENTRIES_DB = process.env.NOTION_DB_LEDGER_ENTRIES;

function decideType({ category, amount }) {
  if (category && category.toLowerCase() === "einkommen") return "Einnahme";
  return "Ausgabe";
}

async function createLedgerEntry({
  title,
  amount,
  category,
  creditor,
  documentId,
  ledgerMonthId
}) {
  if (!ledgerMonthId) {
    throw new Error("createLedgerEntry: ledgerMonthId fehlt");
  }

  const type = decideType({ category, amount });

  const properties = {
    Name: {
      title: [{ text: { content: title || "Ledger Entry" } }]
    },

    Betrag: {
      number: Number(amount)
    },

    Typ: {
      select: { name: type }
    },

    Kategorie: category
      ? { select: { name: category } }
      : undefined,

    Gläubiger: creditor
      ? { rich_text: [{ text: { content: creditor } }] }
      : undefined,

    Monat: {
      relation: [{ id: ledgerMonthId }]
    },

    Dokument: documentId
      ? { relation: [{ id: documentId }] }
      : undefined
  };

  Object.keys(properties).forEach(
    key => properties[key] === undefined && delete properties[key]
  );

  const result = await notion.pages.create({
    parent: { database_id: LEDGER_ENTRIES_DB },
    properties
  });

  return {
    id: result.id,
    type,
    amount
  };
}

module.exports = {
  createLedgerEntry
};