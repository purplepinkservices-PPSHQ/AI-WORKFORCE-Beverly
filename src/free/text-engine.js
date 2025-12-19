"use strict";

const Tesseract = require("tesseract.js");

let pdfParse;
try {
  const m = require("pdf-parse");
  pdfParse = m.default || m;
} catch {
  pdfParse = null;
}

// ------------------------------------------------------------

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ------------------------------------------------------------

async function extractTextFromPdf(buffer) {
  if (!pdfParse) return "";
  try {
    const res = await pdfParse(buffer);
    return normalize(res.text || "");
  } catch {
    return "";
  }
}

async function extractTextFromImage(buffer) {
  try {
    const res = await Tesseract.recognize(buffer, "deu", {
      tessedit_pageseg_mode: 6, // Block-Erkennung
      preserve_interword_spaces: 1
    });
    return normalize(res.data.text || "");
  } catch (err) {
    console.error("❌ TESSERACT ERROR:", err);
    return "";
  }
}

// ------------------------------------------------------------

async function extractText(buffer, filename = "") {
  let text = "";

  if (filename.toLowerCase().endsWith(".pdf")) {
    text = await extractTextFromPdf(buffer);

    // Fallback OCR für gescannte PDFs
    if (text.length < 20) {
      text = await extractTextFromImage(buffer);
    }
  } else {
    text = await extractTextFromImage(buffer);
  }

  return text;
}

module.exports = { extractText };