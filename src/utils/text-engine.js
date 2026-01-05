"use strict";

/**
 * BASELINE TEXT ENGINE
 * - Liest Text aus OCR
 * - KEINE Analyse
 * - KEINE Module
 */

const { convertPdfToImages } = require("../free/pdf-handler");
const { runVisionOCR } = require("./vision-ocr");

async function extractText({ buffer, mimeType, filePath }) {
  if (!buffer) return "";

  // PDF
  if (mimeType === "application/pdf") {
    if (!filePath) return "";

    const images = await convertPdfToImages(filePath);
    if (!images || !images.length) return "";

    const vision = await runVisionOCR({
      images,
      source: "pdf"
    });

    return vision?.text || "";
  }

  // IMAGE
  const vision = await runVisionOCR({
    images: [buffer],
    source: "image"
  });

  return vision?.text || "";
}

module.exports = { extractText };