"use strict";

const fs = require("fs");
const path = require("path");

const { pdfToImages } = require("./pdf-to-images");
const { runVisionOCR } = require("./vision-ocr");

async function runOCR({ buffer, filePath, mimeType }) {
  if (!buffer || !mimeType) {
    throw new Error("runOCR: buffer oder mimeType fehlt");
  }

  // =====================
  // PDF → IMMER VISION
  // =====================
  if (mimeType === "application/pdf") {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error("runOCR: filePath fehlt für Scan-PDF");
    }

    const images = await pdfToImages(filePath, 2);
    if (!images.length) {
      return {
        text: "",
        source: "pdf-empty",
        confidence: 0.2
      };
    }

    let combinedText = "";

    for (const imgPath of images) {
      const imgBuffer = fs.readFileSync(imgPath);
      const res = await runVisionOCR(imgBuffer, "image/png");
      if (res?.text) combinedText += "\n" + res.text;
    }

    return {
      text: combinedText.trim(),
      source: "pdf-vision",
      confidence: combinedText.length > 120 ? 0.9 : 0.4
    };
  }

  // =====================
  // IMAGE → VISION
  // =====================
  if (mimeType.startsWith("image/")) {
    const res = await runVisionOCR(buffer, mimeType);
    return {
      text: res.text || "",
      source: "vision",
      confidence: res.confidence || 0.8
    };
  }

  return {
    text: "",
    source: "unknown",
    confidence: 0.1
  };
}

module.exports = { runOCR };