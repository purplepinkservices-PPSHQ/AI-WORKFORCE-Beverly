"use strict";

// ============================================================
// Analyze Document
// Phase 2 – Lesen & Verstehen
// ============================================================

const { runOCR } = require("../utils/ocr");
const { detectDocumentType } = require("../engines/document-type-engine");
const { scoreDocument } = require("../engines/document-score-engine");
const { detectContentCategory } = require("../engines/content-category-engine");
const { selectModule } = require("../engines/module-selector");

async function analyzeDocument({ userId, fileBuffer, images }) {
  // ------------------------------------------------------------
  // OCR / TEXT
  // ------------------------------------------------------------
  const ocrResult = await runOCR({
    buffer: fileBuffer,
    images
  });

  const rawText = ocrResult?.text || "";

  // ------------------------------------------------------------
  // Dokumenttyp
  // ------------------------------------------------------------
  const typeResult = detectDocumentType(rawText);

  // ------------------------------------------------------------
  // Inhaltskategorie
  // ------------------------------------------------------------
  const categoryResult = detectContentCategory(
    rawText,
    typeResult.type
  );

  // ------------------------------------------------------------
  // Confidence / Zustand
  // ------------------------------------------------------------
  const scoreResult = scoreDocument({
    type: typeResult,
    category: categoryResult
  });

  // ------------------------------------------------------------
  // Modul-Auswahl (ENTSCHEIDEND)
  // ------------------------------------------------------------
  const module = selectModule({
    category: categoryResult.category
  });

  // ------------------------------------------------------------
  // Phase-2-Ergebnis (VERTRAG)
  // ------------------------------------------------------------
  return {
    type: typeResult,
    category: categoryResult,
    score: scoreResult,
    module
  };
}

module.exports = { analyzeDocument };