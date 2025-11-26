// src/ocr/ocr-engine.js
// OCR Engine using tesseract.js

const Tesseract = require("tesseract.js");
const path = require("path");

async function extractTextFromImage(filePath) {
  try {
    console.log("[OCR] Starte Texterkennung für:", filePath);

    const result = await Tesseract.recognize(filePath, "deu", {
      logger: (info) => console.log("[OCR]", info.status, info.progress)
    });

    const text = result.data.text;
    console.log("[OCR] Fertig. Zeichen erkannt:", text.length);

    return text;
  } catch (err) {
    console.error("[OCR FEHLER]", err);
    return null;
  }
}

module.exports = { extractTextFromImage };
