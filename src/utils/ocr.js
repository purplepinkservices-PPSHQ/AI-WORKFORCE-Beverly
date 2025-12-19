"use strict";

const fs = require("fs");
const path = require("path");
const { runVisionOCR } = require("./vision-ocr");
const { convertPdfToImages } = require("../free/pdf-handler");

/* =========================================================
   🔧 PDF-Typ erkennen (TEXT vs SCAN)
   ========================================================= */
function detectPdfType(buffer) {
  const head = buffer.slice(0, 1024).toString("latin1");

  const hasText =
    head.includes("/Font") ||
    head.includes("BT") ||
    head.includes("/Contents");

  return hasText ? "text-pdf" : "scan-pdf";
}

/* =========================================================
   🔴 OCR ENTRYPOINT
   ========================================================= */
async function runOCR({ buffer, filePath, mimeType }) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("runOCR: buffer fehlt oder ist ungültig");
  }

  /* ===================== PDF ===================== */
  if (mimeType === "application/pdf") {
    const pdfType = detectPdfType(buffer);

    /* ---------- TEXT-PDF ---------- */
    if (pdfType === "text-pdf") {
      const text = buffer.toString("latin1");

      return {
        source: "pdf-text",
        text
      };
    }

    /* ---------- SCAN-PDF ---------- */
    if (pdfType === "scan-pdf") {
      if (!filePath) {
        throw new Error("runOCR: filePath fehlt für Scan-PDF");
      }

      const images = await convertPdfToImages(filePath);

      return await runVisionOCR({
        images,
        source: "pdf-scan"
      });
    }
  }

  /* ===================== IMAGE ===================== */
  return await runVisionOCR({
    images: [buffer],
    source: "image"
  });
}

module.exports = { runOCR };