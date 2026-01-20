"use strict";

// ============================================================
// Datei: src/integrations/notion/notion-core-documents.js
// Zweck: ZENTRALER Core-Dokument-Eintrag in Notion
// ============================================================

const { notion } = require("./notion-client");

const CORE_DOCUMENTS_DB_ID = process.env.NOTION_DB_DOCUMENTS_CORE;

async function createCoreDocument({
  userId,
  facts,
  rawText
}) {
  if (!CORE_DOCUMENTS_DB_ID) {
    throw new Error("NOTION_DB_DOCUMENTS_CORE fehlt");
  }

  const amount =
    typeof facts?.amounts?.total === "number"
      ? Math.abs(facts.amounts.total)
      : null;

  const titleText =
    facts?.creditor?.name && amount !== null
      ? `${facts.creditor.name} ${amount.toFixed(2)}€`
      : "Dokument";

  const categoryValue = facts?.creditor?.category || "Sonstiges";

  const properties = {
    // -------------------------
    // Name (Title)
    // -------------------------
    Name: {
      title: [
        {
          text: { content: titleText }
        }
      ]
    },

    // -------------------------
    // Datum
    // -------------------------
    Datum: facts?.dates?.documentDate
      ? { date: { start: facts.dates.documentDate } }
      : undefined,

    // -------------------------
    // Betrag
    // -------------------------
    Betrag: amount !== null
      ? { number: amount }
      : undefined,

    // -------------------------
    // Gläubiger
    // -------------------------
    Gläubiger: facts?.creditor?.name
      ? {
          rich_text: [
            { text: { content: facts.creditor.name } }
          ]
        }
      : undefined,

    // -------------------------
    // Kategorie (MULTI_SELECT ❗)
    // -------------------------
    Kategorie: {
      multi_select: Array.isArray(categoryValue)
        ? categoryValue.map(c => ({ name: c }))
        : [{ name: categoryValue }]
    },

    // -------------------------
    // Dokumenttyp (SELECT)
    // -------------------------
    Dokumenttyp: facts?.documentType
      ? { select: { name: facts.documentType } }
      : undefined
  };

  // ❌ Notion hasst undefined → raus damit
  Object.keys(properties).forEach(
    key => properties[key] === undefined && delete properties[key]
  );

  const result = await notion.pages.create({
    parent: { database_id: CORE_DOCUMENTS_DB_ID },
    properties
  });

  return {
    id: result.id
  };
}

module.exports = {
  createCoreDocument
};