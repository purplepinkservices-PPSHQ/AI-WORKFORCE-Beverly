// ============================================================
// Datei: src/system/audit-reader.js
// STEP 6.2 – Audit Reader (READ ONLY)
// ============================================================
"use strict";

const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(process.cwd(), "logs", "audit.jsonl");

function readAuditFile() {
  if (!fs.existsSync(LOG_FILE)) {
    return [];
  }

  const content = fs.readFileSync(LOG_FILE, "utf8").trim();
  if (!content) return [];

  return content
    .split("\n")
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function filterAudit(entries, { merchant, from, to } = {}) {
  return entries.filter((e) => {
    if (merchant && e.storagePath && !e.storagePath.toLowerCase().includes(merchant.toLowerCase())) {
      return false;
    }

    const ts = new Date(e.timestamp).getTime();
    if (from && ts < from) return false;
    if (to && ts > to) return false;

    return true;
  });
}

module.exports = {
  readAuditFile,
  filterAudit
};