"use strict";

// ============================================================
// Datei: src/core/analyze-document.js
// Phase 2 – Lesen & Verstehen
// STEP 12.5 – Facts Engine async (Hybrid)
// ============================================================

const { runOCR } = require("../utils/ocr");
const { detectDocumentType } = require("../engines/document-type-engine");
const { scoreDocument } = require("../engines/document-score-engine");
const { detectContentCategory } = require("../engines/content-category-engine");
const { detectFinanceCategory } = require("../engines/finance-category-engine");
const { selectModule } = require("../engines/module-selector");

const { extractDocumentFacts } = require("./document-facts-engine");

async function analyzeDocument({
  userId,
  fileBuffer,
  images,
  mimeType,
  filePath
} = {}) {
  // ------------------------------------------------------------
  // OCR
  // ------------------------------------------------------------
  const ocrResult = await runOCR({
    buffer: fileBuffer,
    mimeType,
    filePath
  });

  const rawText = ocrResult?.text || "";

  // ------------------------------------------------------------
  // Facts (Hybrid: Heuristik → LLM falls nötig)
  // ------------------------------------------------------------
  const facts = await extractDocumentFacts({ rawText });

  // ------------------------------------------------------------
  // Dokumenttyp
  // ------------------------------------------------------------
  const typeResult = detectDocumentType(rawText);

  // ------------------------------------------------------------
  // Grobkategorie
  // ------------------------------------------------------------
  const baseCategoryResult = detectContentCategory(rawText, typeResult.type);

  // ------------------------------------------------------------
  // Finance hat Vorrang
  // ------------------------------------------------------------
  let finalCategory = baseCategoryResult.category;
  let finalModule = null;

  if (baseCategoryResult.category === "finance") {
    finalCategory = detectFinanceCategory(rawText);
    finalModule = "finance-module";
  }

  // ------------------------------------------------------------
  // Fallback Modul-Auswahl
  // ------------------------------------------------------------
  if (!finalModule) {
    finalModule = selectModule({ category: finalCategory });
  }

  // ------------------------------------------------------------
  // Confidence
  // ------------------------------------------------------------
  const scoreResult = scoreDocument({
    type: typeResult,
    category: { category: finalCategory }
  });

  return {
    userId,
    type: typeResult,
    category: { category: finalCategory },
    score: scoreResult,
    module: finalModule,
    rawText,
    facts
  };
}

module.exports = { analyzeDocument };