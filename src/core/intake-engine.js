// ============================================================
// Datei: src/core/intake-engine.js
// ============================================================

"use strict";

const { setState } = require("../system/state");
const { saveTempFile } = require("../utils/file-handler");

/*
  CORE REGELN:
  - Kein OCR
  - Keine Klassifikation
  - Keine Produktlogik
  - Keine Storage-Entscheidung
*/

async function runIntake(message) {
  const userId = message.author.id;
  const attachment = message.attachments.first();

  // Phase 1 explizit setzen
  setState(userId, {
    phase: "PHASE_1",
    session: "aktiv"
  });

  // Temporäre Speicherung
  const tempFile = await saveTempFile({
    userId,
    url: attachment.url,
    filename: attachment.name,
    contentType: attachment.contentType
  });

  // Reines Feedback
  await message.reply(
    "📄 **Dokument erhalten.**\n" +
    "Ich bereite jetzt die Analyse vor …"
  );

  // Übergabe an Phase 2 erfolgt im nächsten Step
  return tempFile;
}

module.exports = { runIntake };