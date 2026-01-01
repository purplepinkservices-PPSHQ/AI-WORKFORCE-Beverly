// ============================================================
// Datei: src/free/dropbox-engine.js
// ============================================================
"use strict";

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const { runOCR } = require("../utils/ocr");
const { uploadToDropbox } = require("../utils/dropbox");
const { analyzeDocument } = require("../orchestrator/analysis-orchestrator");
const { setState } = require("../system/state");

/* =========================================================
   Datum normalisieren (YYYY-MM-DD)
   ========================================================= */
function normalizeDate(input) {
  if (!input) return "ohne-Datum";

  const d = new Date(input);
  if (isNaN(d.getTime())) return "ohne-Datum";

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

/* =========================================================
   Dateiname säubern
   ========================================================= */
function cleanPart(value, fallback) {
  if (!value) return fallback;

  return value
    .toString()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9äöüÄÖÜß\-]/g, "");
}

/* =========================================================
   Monatsname DE
   ========================================================= */
function monthNameDE(dateObj) {
  const map = {
    1: "Januar",
    2: "Februar",
    3: "Maerz",
    4: "April",
    5: "Mai",
    6: "Juni",
    7: "Juli",
    8: "August",
    9: "September",
    10: "Oktober",
    11: "November",
    12: "Dezember"
  };
  return map[dateObj.getMonth() + 1] || "Unklar";
}

async function handleFreeUpload(message) {
  const attachment = [...message.attachments.values()][0];
  if (!attachment) return;

  const userId = message.author.id;
  const originalName = attachment.name || "upload";
  const tempDir = path.join(__dirname, "../../tmp");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFilePath = path.join(
    tempDir,
    `${Date.now()}_${originalName}`
  );

  const response = await axios.get(attachment.url, {
    responseType: "arraybuffer"
  });

  const buffer = Buffer.from(response.data);
  fs.writeFileSync(tempFilePath, buffer);

  /* OCR */
  const ocrResult = await runOCR({
    buffer,
    filePath: tempFilePath,
    mimeType: attachment.contentType || ""
  });

  /* Analyse */
  const result = await analyzeDocument({ ocrResult });
  const analysis = result.analysis || result;
  const moduleResult = result.module || null;

  // ✅ WICHTIG: Legal-Context persistent speichern
  if (moduleResult && result.analysis) {
    setState(userId, {
      lastLegalAnalysis: result.analysis,
      lastLegalModule: moduleResult
    });
  }

  /* =============================
     🧠 STABILE FALLBACKS
     ============================= */

  const safeDate = normalizeDate(analysis.date);
  const dateObj = analysis.date ? new Date(analysis.date) : null;

  const year =
    dateObj && !isNaN(dateObj.getTime())
      ? String(dateObj.getFullYear())
      : safeDate.substring(0, 4);

  const month =
    dateObj && !isNaN(dateObj.getTime())
      ? monthNameDE(dateObj)
      : "Unklar";

  let creditor = cleanPart(analysis.creditor, "Unbekannt");
  if (/^[0-9A-F\-]{8,}$/i.test(creditor)) {
    creditor = "Unbekannt";
  }

  /* =============================
     🎯 ZIELFORMAT
     📂 /YYYY/Monat
     ============================= */

  const folderPath = `/${year}/${month}`;
  const finalFileName =
    `${safeDate}-${creditor}` + path.extname(originalName);

  /* Dropbox Upload */
  await uploadToDropbox({
    buffer,
    fileName: finalFileName,
    folderPath
  });

  try {
    fs.unlinkSync(tempFilePath);
  } catch {}

  await message.reply(
    `✅ Dokument gespeichert\n\n` +
    `📂 Ablage: ${folderPath}\n` +
    `📄 Name: ${finalFileName}\n\n` +
    `⬇️ Du kannst direkt das nächste Dokument hochladen 😊`
  );

  /* =============================
     🧩 MODUL-FEEDBACK
     ============================= */

  if (moduleResult && moduleResult.message) {
    const m = await message.reply(
      `⚖️ **Einschätzung zu deinem Schreiben**\n\n` +
      moduleResult.message +
      `\n\n✍️ Möchtest du, dass ich eine Antwort für dich formuliere?`
    );

    try {
      await m.react("✍️");
    } catch {}
  }
}

module.exports = { handleFreeUpload };