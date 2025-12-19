"use strict";

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const { runOCR } = require("../utils/ocr");
const { uploadToDropbox } = require("../utils/dropbox");
const { analyzeDocument } = require("../orchestrator/analysis-orchestrator");

/* =========================================================
   🔧 Datum normalisieren (YYYY-MM-DD)
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
   🔧 Dateiname-Baustein säubern
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
   🆕 NEU: Länge begrenzen
   ========================================================= */
function limitLength(str, max) {
  if (!str) return str;
  return str.length > max ? str.substring(0, max) : str;
}

async function handleFreeUpload(message) {
  const attachment = [...message.attachments.values()][0];
  if (!attachment) return;

  const mimeType = attachment.contentType || "";
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

  /* =========================================================
     🔴 OCR – UNVERÄNDERT
     ========================================================= */
  const ocrResult = await runOCR({
    buffer,
    filePath: tempFilePath,
    mimeType
  });

  /* =========================================================
     🔴 Analyse – UNVERÄNDERT
     ========================================================= */
  const analysis = await analyzeDocument({
    ocrResult
  });

  /* =========================================================
     🔧 EINZIGE LOGIKÄNDERUNG: Dateiname kürzen
     ========================================================= */
  const safeDate = normalizeDate(analysis.date);
  const safeType = limitLength(
    cleanPart(analysis.type, "Unbekannt"),
    40
  );
  const safeCreditor = limitLength(
    cleanPart(analysis.creditor, "Unbekannt"),
    40
  );
  const safePerson = limitLength(
    cleanPart(analysis.person, "Unbekannt"),
    40
  );

  let finalFileName =
    `${safeDate}_${safeType}_${safeCreditor}_${safePerson}` +
    path.extname(originalName);

  // 🔧 Gesamt-Dateinamen absichern (inkl. Extension)
  const ext = path.extname(finalFileName);
  const base = path.basename(finalFileName, ext);

  if (base.length > 180) {
    finalFileName = base.substring(0, 180) + ext;
  }

  const folderPath = `/2025/${analysis.category || "Unklar"}/Dezember`;

  /* =========================================================
     🔴 Dropbox Upload – UNVERÄNDERT
     ========================================================= */
  await uploadToDropbox({
    buffer,
    fileName: finalFileName,
    folderPath
  });

  try {
    fs.unlinkSync(tempFilePath);
  } catch {}

  await message.reply(
    `✅ **Dokument gespeichert**\n\n` +
    `📂 **Ablage:** ${folderPath}\n` +
    `📄 **Name:** ${finalFileName}\n` +
    `🧠 **Quelle:** ${analysis.source}\n\n` +
    `⬇️ Du kannst direkt das **nächste Dokument hochladen** 😊`
  );
}

module.exports = { handleFreeUpload };