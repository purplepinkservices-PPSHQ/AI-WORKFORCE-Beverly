// ============================================================
// Datei: src/system/audit-log.js
// STEP 5.3 – Minimal Audit Log (JSONL)
// ============================================================
"use strict";

const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "audit.jsonl");

function ensureLogPath() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, "", "utf8");
  }
}

/**
 * Minimal Audit Log (vertragstreu)
 * Felder:
 * - timestamp
 * - phase
 * - result
 * - confidence
 * - module
 * - storagePath
 */
async function writeAuditLog(entry) {
  ensureLogPath();

  const safeEntry = {
    timestamp: entry?.timestamp || new Date().toISOString(),
    phase: entry?.phase || "UNKNOWN",
    result: entry?.result || "UNKNOWN",
    confidence:
      typeof entry?.confidence === "number" ? entry.confidence : null,
    module: typeof entry?.module === "string" ? entry.module : "unknown",
    storagePath:
      typeof entry?.storagePath === "string" ? entry.storagePath : "unknown"
  };

  fs.appendFileSync(LOG_FILE, JSON.stringify(safeEntry) + "\n", "utf8");
}

module.exports = { writeAuditLog };