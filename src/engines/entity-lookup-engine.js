"use strict";

// ============================================================
// Datei: src/engines/entity-lookup-engine.js
// Zweck: READ-ONLY Lookup von bekannten Entities (Notion)
// ============================================================

const { notion } = require("../integrations/notion/notion-client");

const ENTITIES_DB_ID = process.env.NOTION_DB_ENTITIES;

if (!ENTITIES_DB_ID) {
  throw new Error("NOTION_DB_ENTITIES fehlt");
}

/**
 * Normalisiert Namen für Vergleich
 * - lowercase
 * - Sonderzeichen raus
 * - Mehrfachspaces reduzieren
 */
function normalizeName(input = "") {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9äöüß\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Holt alle Entities aus Notion
 * (bewusst simpel, keine Pagination-Optimierung jetzt)
 */
async function fetchAllEntities() {
  const result = await notion.databases.query({
    database_id: ENTITIES_DB_ID
  });

  return result.results.map(page => {
    const props = page.properties || {};

    return {
      id: page.id,
      name: props.Name?.title?.[0]?.text?.content || "",
      entityType: props["Entity-Typ"]?.select?.name || null,
      documentType: props["Dokumenttyp"]?.select?.name || null,
      rolesDefault: props["Rollen-Default"]?.multi_select?.map(r => r.name) || [],
      categoryDefault: props["Kategorie-Default"]?.multi_select?.map(c => c.name) || [],
      confidence: props["Confidence-Level"]?.select?.name || "Niedrig",
      source: props["Quelle"]?.select?.name || null
    };
  });
}

/**
 * Findet bestes Entity-Match anhand normalisiertem Namen
 */
function findBestMatch(entities, creditorName) {
  const normalizedInput = normalizeName(creditorName);

  let bestMatch = null;

  for (const entity of entities) {
    const normalizedEntity = normalizeName(entity.name);

    // Exakt gleich
    if (normalizedInput === normalizedEntity) {
      return entity;
    }

    // Enthalten (z. B. "aldi süd rosenheim" enthält "aldi süd")
    if (
      normalizedInput.includes(normalizedEntity) ||
      normalizedEntity.includes(normalizedInput)
    ) {
      bestMatch = entity;
    }
  }

  return bestMatch;
}

/**
 * Öffentliche API
 */
async function lookupEntityByCreditor({ creditorName }) {
  if (!creditorName) return null;

  const entities = await fetchAllEntities();
  const match = findBestMatch(entities, creditorName);

  if (!match) {
    return null;
  }

  return {
    name: match.name,
    entityType: match.entityType,
    documentType: match.documentType,
    rolesDefault: match.rolesDefault,
    categoryDefault: match.categoryDefault,
    confidence: match.confidence,
    source: match.source
  };
}

module.exports = {
  lookupEntityByCreditor
};