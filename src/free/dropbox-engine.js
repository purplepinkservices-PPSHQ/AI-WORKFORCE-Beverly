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
   Dateiname-Baustein säubern
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
   EINZIGE NEUE FUNKTION: Länge begrenzen
   ========================================================= */
function limitLength(str, max) {
  if (!str) return str;
  return str.length > max ? str.substring(0, max) : str;
}

/* =========================================================
   ✅ NEU (minimal): Monatsname DE
   ========================================================= */
function monthNameDE(dateObj) {
  const m = dateObj.getMonth() + 1;
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
  return map[m] || "Unklar";
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

  /* OCR */
  const ocrResult = await runOCR({
    buffer,
    filePath: tempFilePath,
    mimeType
  });

  /* OCR Vorschau */
  if (ocrResult && ocrResult.text) {
    const preview = ocrResult.text.substring(0, 1500);

    await message.reply(
      `📖 **Gelesener Text (OCR-Vorschau):**\n\n` +
      "```" +
      preview +
      "```"
    );
  } else {
    await message.reply("❌ **OCR hat keinen Text geliefert**");
  }

  /* Analyse */
  const analysis = await analyzeDocument({ ocrResult });

  // ✅ Datum/Monat/Jahr aus erkannter Date
  const dateObj = analysis.date ? new Date(analysis.date) : null;
  const year = dateObj && !isNaN(dateObj.getTime()) ? String(dateObj.getFullYear()) : "2025";
  const month = dateObj && !isNaN(dateObj.getTime()) ? monthNameDE(dateObj) : "Unklar";

  /* =========================================================
     ✅ NEU: Dateiname = YYYY-MM-DD_Creditor_Subject_Person.ext
     Betreff ohne "Betreff:" kommt aus analysis.subject
     ========================================================= */
  const safeDate = normalizeDate(analysis.date);

  const safeCreditor = limitLength(
    cleanPart(analysis.creditor, "Unbekannt"),
    40
  );

  const safePerson = limitLength(
    cleanPart(analysis.person, "Unbekannt"),
    25
  );

  const safeSubject = limitLength(
    cleanPart(analysis.subject, "Dokument"),
    70
  );

  const finalFileName =
    `${safeDate}_${safeCreditor}_${safeSubject}_${safePerson}` +
    path.extname(originalName);

  /* =========================================================
     ✅ NEU: Ordner = /YYYY/Behoerden/Monat/Creditor/Person
     ========================================================= */
  const safeCategory = analysis.category || "Unklar";
  const folderPath = `/${year}/${safeCategory}/${month}/${safeCreditor}/${safePerson}`;

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
    `✅ **Dokument gespeichert**\n\n` +
    `📂 **Ablage:** ${folderPath}\n` +
    `📄 **Name:** ${finalFileName}\n` +
    `🧠 **Quelle:** ${analysis.source}\n\n` +
    `⬇️ Du kannst direkt das **nächste Dokument hochladen** 😊`
  );
}

module.exports = { handleFreeUpload };