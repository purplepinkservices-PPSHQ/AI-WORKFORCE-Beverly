"use strict";

// ============================================================
// Datei: src/core/vision-facts-extractor.js
// Zweck:
// - Vision-first Dokumentenlesung
// - KEINE Interpretation
// - Liefert NUR Text (RAW)
// - STABILER VERTRAG für analyze-document.js
// ============================================================

const { openaiVisionRaw } = require("../system/openai-vision");

async function extractFactsFromVision({ buffer, mimeType } = {}) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Vision RAW: buffer fehlt oder ungültig");
  }

  const rawText = await openaiVisionRaw({
    buffer,
    mimeType
  });

  return {
    rawText: String(rawText || "").trim(),
    source: "vision"
  };
}

module.exports = { extractFactsFromVision };