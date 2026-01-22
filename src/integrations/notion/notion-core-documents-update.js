"use strict";

// ============================================================
// Datei: src/integrations/notion/notion-core-documents-update.js
// Zweck: Core Updates (nur Chat-Flow / Router)
// ============================================================

const { notion } = require("./notion-client");

function cleanUndefined(obj) {
  Object.keys(obj).forEach(k => obj[k] === undefined && delete obj[k]);
  return obj;
}

async function updateCoreDocumentProperties({ pageId, properties }) {
  if (!pageId) throw new Error("pageId fehlt");
  if (!properties || typeof properties !== "object") {
    throw new Error("properties fehlt/ungültig");
  }

  await notion.pages.update({
    page_id: pageId,
    properties: cleanUndefined(properties)
  });

  return true;
}

module.exports = {
  updateCoreDocumentProperties
};