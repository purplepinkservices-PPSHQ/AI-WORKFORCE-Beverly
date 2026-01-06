"use strict";

const { extractText } = require("../free/text-engine");

async function runOCR({ buffer, mimeType, filePath } = {}) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return { source: "ocr", text: "", confidence: 0 };
  }

  // Best-effort: verschiedene Signaturen unterstützen
  let text = "";
  try {
    // Variante A: extractText(buffer)
    text = await extractText(buffer);
  } catch (e1) {
    try {
      // Variante B: extractText({buffer, mimeType, filePath})
      text = await extractText({ buffer, mimeType, filePath });
    } catch (e2) {
      text = "";
    }
  }

  return {
    source: "ocr",
    text: text || "",
    confidence: text ? 0.9 : 0
  };
}

module.exports = { runOCR };