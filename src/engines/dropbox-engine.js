"use strict";

// ============================================================
// Datei: src/engines/dropbox-engine.js
// Version: v1.7 – YEAR / MONTH NAME + ORIGINAL EXTENSION
// ============================================================

const { uploadToDropbox } = require("../utils/dropbox");

const MONTHS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember"
];

function safeEntityName(name) {
  return String(name || "Unbekannt")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_");
}

// ❗ ISO 8601 only
function formatISODate(date) {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  return null;
}

function buildStoragePath(isoDate) {
  const [year, month] = isoDate.split("-");
  const monthName = MONTHS_DE[Number(month) - 1] || month;
  return `/${year}/${monthName}`;
}

function getExtensionFromMime(mimeType) {
  if (!mimeType) return "";
  if (mimeType === "application/pdf") return ".pdf";
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  return "";
}

function buildFileName({ isoDate, entity, extension }) {
  return `${isoDate}_${entity}${extension || ""}`;
}

async function storeDocument(documentContext = {}) {
  const { buffer, date, facts, mimeType } = documentContext;

  const isoDate = formatISODate(date);
  if (!isoDate) {
    throw new Error("❌ Kein gültiges ISO-Datum (YYYY-MM-DD) für Speicherung vorhanden.");
  }

  const entity = safeEntityName(facts?.creditor?.name || "Unbekannt");
  const extension = getExtensionFromMime(mimeType);

  const folderPath = buildStoragePath(isoDate);
  const fileName = buildFileName({ isoDate, entity, extension });

  await uploadToDropbox({
    buffer,
    folderPath,
    fileName
  });

  return {
    storagePath: `${folderPath}/${fileName}`,
    fileName,
    date: isoDate,
    entity
  };
}

module.exports = { storeDocument };