// ============================================================
// Datei: src/free/dropbox-engine.js
// ✅ FIX: Nie wieder /ohne/Unklar + robustere Date/Creditor-Fallbacks
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
   Helpers
   ========================================================= */
function monthNameDE(dateObj) {
  const map = {
    0: "Januar",
    1: "Februar",
    2: "Maerz",
    3: "April",
    4: "Mai",
    5: "Juni",
    6: "Juli",
    7: "August",
    8: "September",
    9: "Oktober",
    10: "November",
    11: "Dezember"
  };
  return map[dateObj.getMonth()] || "Unklar";
}

function normalizeDate(input) {
  if (!input) return null;

  const d = new Date(input);
  if (isNaN(d.getTime())) return null;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

function cleanPart(value, fallback) {
  if (!value) return fallback;

  return String(value)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9äöüÄÖÜß\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "") || fallback;
}

function extractFirstGermanDate(rawText = "") {
  const t = String(rawText || "");
  const m = t.match(/\b(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})\b/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  if (isNaN(d.getTime())) return null;
  return d;
}

function detectCreditorFromHeader(rawText = "") {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const header = lines.slice(0, 25);

  const KEY = [
    "amtsgericht",
    "landgericht",
    "oberlandesgericht",
    "staatsanwaltschaft",
    "finanzamt",
    "hauptzollamt",
    "jobcenter",
    "arbeitsagentur",
    "landesjustizkasse",
    "polizei",
    "ordnungsamt",
    "stadt",
    "gemeinde",
    "gerichtsvollzieher",
    "zoll"
  ];

  // 1) harte Trefferzeile
  for (const line of header) {
    const low = line.toLowerCase();
    if (KEY.some((k) => low.includes(k))) return line;
  }

  // 2) fallback: erste "offizielle" Kopfzeile (nicht zu kurz)
  for (const line of header) {
    if (line.length >= 12 && !/^(seite|page)\s*\d+/i.test(line)) return line;
  }

  return null;
}

function buildSafeFolderAndName({ dateObj, creditor, originalName }) {
  const hasDate = dateObj && !isNaN(dateObj.getTime());

  const year = hasDate ? String(dateObj.getFullYear()) : "Unklar";
  const month = hasDate ? monthNameDE(dateObj) : "Unklar";

  const safeDate = hasDate
    ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(
        dateObj.getDate()
      ).padStart(2, "0")}`
    : "ohne-Datum";

  const safeCreditor = cleanPart(creditor, "Unbekannt");

  const folderPath = `/${year}/${month}`;
  const finalFileName = `${safeDate}-${safeCreditor}${path.extname(originalName || "") || ""}`;

  return { folderPath, finalFileName };
}

/* =========================================================
   MAIN
   ========================================================= */
async function handleFreeUpload(message) {
  const attachment = [...message.attachments.values()][0];
  if (!attachment) return;

  const userId = message.author.id;
  const originalName = attachment.name || "upload";
  const tempDir = path.join(__dirname, "../../tmp");

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const tempFilePath = path.join(tempDir, `${Date.now()}_${originalName}`);

  const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);
  fs.writeFileSync(tempFilePath, buffer);

  // OCR
  const ocrResult = await runOCR({
    buffer,
    filePath: tempFilePath,
    mimeType: attachment.contentType || ""
  });

  // Analyse
  const result = await analyzeDocument({ ocrResult });

  const baseAnalysis = result?.analysis || {};
  const moduleResult = result?.module || null;

  // ✅ ENRICH (wie vorher)
  const enrichedLegal =
    moduleResult && moduleResult.data && typeof moduleResult.data === "object"
      ? { ...baseAnalysis, ...moduleResult.data }
      : baseAnalysis;

  // ✅ State (wie vorher)
  setState(userId, {
    lastLegalBaseAnalysis: baseAnalysis,
    lastLegalAnalysis: enrichedLegal,
    lastLegalModule: moduleResult || null,
    lastLegalRawText: String(ocrResult?.text || "")
  });

  // ✅ DATE FALLBACKS (wichtig!)
  const rawText = String(ocrResult?.text || "");
  const bestDateObj =
    (enrichedLegal.date ? new Date(enrichedLegal.date) : null) ||
    (baseAnalysis.date ? new Date(baseAnalysis.date) : null);

  let dateObj = bestDateObj;
  if (!dateObj || isNaN(dateObj.getTime())) dateObj = extractFirstGermanDate(rawText);

  // ✅ CREDITOR FALLBACKS (wichtig!)
  let creditor =
    enrichedLegal.creditor ||
    baseAnalysis.creditor ||
    detectCreditorFromHeader(rawText) ||
    "Unbekannt";

  // UUID-Müll abfangen
  const cleanedCreditor = cleanPart(creditor, "Unbekannt");
  if (/^[0-9A-F\-]{8,}$/i.test(cleanedCreditor)) creditor = "Unbekannt";

  const { folderPath, finalFileName } = buildSafeFolderAndName({
    dateObj,
    creditor,
    originalName
  });

  // Dropbox Upload
  await uploadToDropbox({
    buffer,
    fileName: finalFileName,
    folderPath
  });

  try {
    fs.unlinkSync(tempFilePath);
  } catch {}

  // Speicherbestätigung
  await message.reply(
    `✅ Dokument gespeichert\n\n` +
      `📂 Ablage: ${folderPath}\n` +
      `📄 Name: ${finalFileName}\n\n` +
      `⬇️ Du kannst direkt das nächste Dokument hochladen 😊`
  );

  // Legal Feedback + ✍️ Reaction (wie vorher)
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