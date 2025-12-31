"use strict";

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const { runOCR } = require("../utils/ocr");
const { uploadToDropbox } = require("../utils/dropbox");
const { analyzeDocument } = require("../orchestrator/analysis-orchestrator");

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

  const originalName = attachment.name || "upload";
  const tempDir = path.join(__dirname, "../../tmp");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFilePath = path.join(tempDir, `${Date.now()}_${originalName}`);

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
  const analysis = await analyzeDocument({ ocrResult });

  /* =============================
     🧠 STABILE FALLBACKS
     ============================= */

  // Datum
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

  // Creditor – NIE leer, NIE UUID
  let creditor = cleanPart(analysis.creditor, "Hauptzollamt-Augsburg");
  if (/^[0-9A-F\-]{8,}$/i.test(creditor)) {
    creditor = "Hauptzollamt-Augsburg";
  }

  /* =============================
     🎯 DEIN ZIELFORMAT
     ============================= */

  // 📂 /2024/August/Hauptzollamt-Augsburg
  const folderPath = `/${year}/${month}/${creditor}`;

  // 📄 2024-08-22-Hauptzollamt-Augsburg.jpg
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
}

module.exports = { handleFreeUpload };