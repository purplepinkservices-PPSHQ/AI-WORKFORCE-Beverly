"use strict";

// ============================================================
// Datei: src/integrations/notion/notion-entities.js
// Zweck: Entities Knowledge Base – Upsert + Touch
// ============================================================

const { notion } = require("./notion-client");

const ENTITIES_DB_ID = process.env.NOTION_DB_ENTITIES;

if (!ENTITIES_DB_ID) {
  throw new Error("NOTION_DB_ENTITIES fehlt in .env");
}

function cleanUndefined(obj) {
  Object.keys(obj).forEach(k => obj[k] === undefined && delete obj[k]);
  return obj;
}

function normalizeName(input = "") {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9äöüß\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function queryEntitiesByName(name) {
  const n = normalizeName(name);
  const res = await notion.databases.query({
    database_id: ENTITIES_DB_ID
  });

  const pages = res.results || [];
  let exact = null;
  let loose = null;

  for (const p of pages) {
    const title = p.properties?.Name?.title?.[0]?.plain_text || "";
    const pn = normalizeName(title);
    if (pn === n) {
      exact = p;
      break;
    }
    if (!loose && pn && (pn.includes(n) || n.includes(pn))) {
      loose = p;
    }
  }

  return exact || loose || null;
}

async function upsertEntityFromUserAnswer({
  name,
  entityType,
  documentType,
  rolesDefault,
  categoryDefault,
  confidence,
  source,
  userContext
}) {
  if (!name) return null;

  const existing = await queryEntitiesByName(name);
  const todayISO = new Date().toISOString().slice(0, 10);

  const propertiesCreate = cleanUndefined({
    Name: { title: [{ text: { content: name } }] },
    "Entity-Typ": entityType ? { select: { name: entityType } } : undefined,
    Dokumenttyp: documentType ? { select: { name: documentType } } : undefined,
    "Rollen-Default":
      Array.isArray(rolesDefault) && rolesDefault.length
        ? { multi_select: rolesDefault.map(r => ({ name: r })) }
        : undefined,
    "Kategorie-Default":
      Array.isArray(categoryDefault) && categoryDefault.length
        ? { multi_select: categoryDefault.map(c => ({ name: c })) }
        : undefined,
    "Confidence-Level": confidence ? { select: { name: confidence } } : undefined,
    Quelle: source ? { select: { name: source } } : undefined,
    "Nutzer-Kontext": userContext
      ? { rich_text: [{ text: { content: userContext } }] }
      : undefined,
    "Zuletzt verwendet": { date: { start: todayISO } }
  });

  if (!existing) {
    const created = await notion.pages.create({
      parent: { database_id: ENTITIES_DB_ID },
      properties: propertiesCreate
    });
    return { id: created.id, created: true };
  }

  const pageId = existing.id;

  const propertiesUpdate = cleanUndefined({
    "Entity-Typ": propertiesCreate["Entity-Typ"],
    Dokumenttyp: propertiesCreate.Dokumenttyp,
    "Rollen-Default": propertiesCreate["Rollen-Default"],
    "Kategorie-Default": propertiesCreate["Kategorie-Default"],
    "Confidence-Level": propertiesCreate["Confidence-Level"],
    Quelle: propertiesCreate.Quelle,
    "Nutzer-Kontext": propertiesCreate["Nutzer-Kontext"],
    "Zuletzt verwendet": propertiesCreate["Zuletzt verwendet"]
  });

  await notion.pages.update({
    page_id: pageId,
    properties: propertiesUpdate
  });

  return { id: pageId, created: false };
}

async function touchEntityLastUsed({ name }) {
  if (!name) return false;
  const existing = await queryEntitiesByName(name);
  if (!existing) return false;

  const todayISO = new Date().toISOString().slice(0, 10);

  await notion.pages.update({
    page_id: existing.id,
    properties: {
      "Zuletzt verwendet": { date: { start: todayISO } }
    }
  });

  return true;
}

module.exports = {
  upsertEntityFromUserAnswer,
  touchEntityLastUsed
};