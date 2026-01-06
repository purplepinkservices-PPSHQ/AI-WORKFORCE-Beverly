// ============================================================
// Datei: tools/audit-viewer.js
// STEP 6.2 – CLI Audit Viewer
// ============================================================
"use strict";

const { readAuditFile, filterAudit } = require("../src/system/audit-reader");

const args = process.argv.slice(2);

let merchant = null;
let range = "all";

args.forEach((arg) => {
  if (arg.startsWith("--merchant=")) {
    merchant = arg.split("=")[1];
  }
  if (arg.startsWith("--range=")) {
    range = arg.split("=")[1];
  }
});

const entries = readAuditFile();

let from = null;
let to = null;

const now = Date.now();

if (range === "today") {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  from = d.getTime();
} else if (range === "7d") {
  from = now - 7 * 24 * 60 * 60 * 1000;
}

const filtered = filterAudit(entries, { merchant, from, to });

if (filtered.length === 0) {
  console.log("ℹ️ Keine Audit-Einträge gefunden.");
  process.exit(0);
}

console.log("🧾 AUDIT LOG\n");

filtered.forEach((e, i) => {
  console.log(
    `${i + 1}. ${e.timestamp}\n` +
      `   Modul: ${e.module}\n` +
      `   Ergebnis: ${e.result}\n` +
      `   Confidence: ${e.confidence}\n` +
      `   Pfad: ${e.storagePath}\n`
  );
});