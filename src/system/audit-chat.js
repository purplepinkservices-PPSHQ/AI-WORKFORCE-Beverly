// ============================================================
// Datei: src/system/audit-chat.js
// STEP 6.2.1 – Chat Audit Commands (READ ONLY)
// ============================================================
"use strict";

const { readAuditFile, filterAudit } = require("./audit-reader");

function parseAuditCommand(text = "") {
  const t = text.toLowerCase().trim();

  if (!t.startsWith("audit")) return null;

  let merchant = null;
  let range = "all";

  // Zeiträume
  if (t.includes("heute")) range = "today";
  if (t.includes("letzte woche") || t.includes("7 tage")) range = "7d";

  // Händler (einfach & robust)
  const merchants = ["dm", "kaufland", "mueller", "müller", "aldi", "lidl", "rewe", "edeka", "penny", "netto"];
  for (const m of merchants) {
    if (t.includes(m)) {
      merchant = m === "müller" ? "mueller" : m;
      break;
    }
  }

  return { merchant, range };
}

function formatAuditEntries(entries, limit = 5) {
  if (!entries.length) {
    return "ℹ️ Keine Audit-Einträge gefunden.";
  }

  const sliced = entries.slice(0, limit);

  let out = "🧾 **Audit-Log**\n\n";
  sliced.forEach((e, i) => {
    out +=
      `${i + 1}. **${new Date(e.timestamp).toLocaleString("de-DE")}**\n` +
      `   • Modul: ${e.module}\n` +
      `   • Ergebnis: ${e.result}\n` +
      `   • Confidence: ${e.confidence}\n` +
      `   • Pfad: ${e.storagePath}\n\n`;
  });

  if (entries.length > limit) {
    out += `… und ${entries.length - limit} weitere Einträge.\n`;
  }

  return out;
}

async function handleAuditChatCommand(message) {
  const parsed = parseAuditCommand(message.content || "");
  if (!parsed) return false;

  const entries = readAuditFile();

  let from = null;
  let to = null;
  const now = Date.now();

  if (parsed.range === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    from = d.getTime();
  } else if (parsed.range === "7d") {
    from = now - 7 * 24 * 60 * 60 * 1000;
  }

  const filtered = filterAudit(entries, {
    merchant: parsed.merchant,
    from,
    to
  });

  const response = formatAuditEntries(filtered);
  await message.reply(response);

  return true;
}

module.exports = { handleAuditChatCommand };