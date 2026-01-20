"use strict";

const { notion } = require("./notion-client");

const DOCUMENTS_DB_ID = process.env.NOTION_DB_DOCUMENTS;

/**
 * Erstellt ein Dokument in Notion
 */
async function createDocument({
  rawText,
  facts,
  category,
  documentType
}) {
  // 🔒 Name MUSS existieren
  const title =
    facts?.creditor?.name
      ? `${facts.creditor.name} ${facts.amounts?.total ?? ""}`
      : "Unbenanntes Dokument";

  const properties = {
    Name: {
      title: [
        {
          text: {
            content: String(title)
          }
        }
      ]
    }
  };

  if (category) {
    properties.Kategorie = { select: { name: category } };
  }

  if (documentType) {
    properties.Dokumenttyp = { select: { name: documentType } };
  }

  const result = await notion.pages.create({
    parent: { database_id: DOCUMENTS_DB_ID },
    properties
  });

  return result;
}

module.exports = {
  createDocument
};