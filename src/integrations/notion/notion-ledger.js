"use strict";

const { notion } = require("./notion-client");

const LEDGER_DB_ID = process.env.NOTION_DB_LEDGER;
const LEDGER_ENTRIES_DB_ID = process.env.NOTION_DB_LEDGER_ENTRIES;

/**
 * Findet oder erstellt einen Ledger-Monat (z. B. 2026-01)
 */
async function findLedgerMonthByKey(monthKey) {
  const res = await notion.databases.query({
    database_id: LEDGER_DB_ID,
    filter: {
      property: "Name",
      title: {
        equals: monthKey
      }
    }
  });

  if (res.results.length > 0) {
    return res.results[0].id;
  }

  const created = await notion.pages.create({
    parent: { database_id: LEDGER_DB_ID },
    properties: {
      Name: {
        title: [{ text: { content: monthKey } }]
      }
    }
  });

  return created.id;
}

/**
 * Erstellt einen Ledger-Eintrag (Einnahme / Ausgabe)
 */
async function createLedgerEntry({
  name,
  date,
  amount,
  type,
  category,
  creditor,
  documentId,
  ledgerMonthId
}) {
  return notion.pages.create({
    parent: { database_id: LEDGER_ENTRIES_DB_ID },
    properties: {
      Name: {
        title: [{ text: { content: name } }]
      },
      Datum: {
        date: { start: date }
      },
      Betrag: {
        number: amount
      },
      Typ: {
        select: { name: type } // Einnahme | Ausgabe
      },
      Kategorie: {
        select: { name: category }
      },
      Gläubiger: {
        rich_text: [{ text: { content: creditor } }]
      },
      Dokument: {
        relation: [{ id: documentId }]
      },
      Monat: {
        relation: [{ id: ledgerMonthId }]
      }
    }
  });
}

module.exports = {
  findLedgerMonthByKey,
  createLedgerEntry
};