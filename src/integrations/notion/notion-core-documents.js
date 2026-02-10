"use strict";

// ============================================================
// Datei: src/integrations/notion/notion-core-documents.js
// Zweck: ZENTRALER Core-Dokument-Eintrag in Notion
// ============================================================

const { notion } = require("./notion-client");

const CORE_DOCUMENTS_DB_ID = process.env.NOTION_DB_DOCUMENTS_CORE;

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function limitText(text, max = 2000) {
  if (!text) return "";
  return String(text).slice(0, max);
}

function toNumber(v) {
  return typeof v === "number" && Number.isFinite(v)
    ? Math.round(v * 100) / 100
    : null;
}

async function createCoreDocument({
  userId,
  rawText,
  sanitizedText,
  date,
  creditor,
  category,
  documentType,
  gross,
  tax
}) {
  if (!CORE_DOCUMENTS_DB_ID) {
    throw new Error("NOTION_DB_DOCUMENTS_CORE fehlt");
  }

  const grossVal = toNumber(gross);
  const taxVal = toNumber(tax);

  const titleText =
    creditor && grossVal !== null
      ? `${creditor} ${grossVal.toFixed(2)}€`
      : creditor || "Dokument";

  const properties = {
    Name: {
      title: [{ text: { content: titleText } }]
    },

    Datum: date
      ? { date: { start: date } }
      : undefined,

    // 🔒 Betrag = Brutto (einzige Geldbasis)
    Betrag: grossVal !== null
      ? { number: grossVal }
      : undefined,

    Steuer: taxVal !== null
      ? { number: taxVal }
      : undefined,

    Gläubiger: creditor
      ? { rich_text: [{ text: { content: creditor } }] }
      : undefined,

    Kategorie: category
      ? {
          multi_select: Array.isArray(category)
            ? category.map(c => ({ name: c }))
            : [{ name: category }]
        }
      : undefined,

    Dokumenttyp: documentType
      ? { select: { name: documentType } }
      : undefined,

    "Dokument Inhalt": {
      rich_text: [
        {
          text: {
            content: limitText(rawText)
          }
        }
      ]
    },

    "Sanitized Text": {
      rich_text: [
        {
          text: {
            content: limitText(sanitizedText)
          }
        }
      ]
    }
  };

  // undefined sauber entfernen
  Object.keys(properties).forEach(
    key => properties[key] === undefined && delete properties[key]
  );

  const result = await notion.pages.create({
    parent: { database_id: CORE_DOCUMENTS_DB_ID },
    properties
  });

  return { id: result.id };
}

module.exports = { createCoreDocument };