"use strict";

// ============================================================
// Datei: src/core/analyze-document.js
// Zweck: Analyse + zentraler Persistenzpunkt (Core DB)
// ============================================================

const { runOCR } = require("../utils/ocr");
const { detectDocumentType } = require("../engines/document-type-engine");
const { scoreDocument } = require("../engines/document-score-engine");
const { detectContentCategory } = require("../engines/content-category-engine");
const { detectFinanceCategory } = require("../engines/finance-category-engine");
const { selectModule } = require("../engines/module-selector");

const { extractDocumentFacts } = require("./document-facts-engine");
const { createCoreDocument } = require("../integrations/notion/notion-core-documents");

async function analyzeDocument({
  userId,
  fileBuffer,
  mimeType,
  filePath
} = {}) {

  // OCR
  const ocrResult = await runOCR({
    buffer: fileBuffer,
    mimeType,
    filePath
  });

  const rawText = ocrResult?.text || "";

  // FACTS
  const facts = await extractDocumentFacts({ rawText });

  // TYPE
  const typeResult = detectDocumentType(rawText);

  // CATEGORY
  const baseCategoryResult = detectContentCategory(rawText, typeResult.type);

  let finalCategory = baseCategoryResult.category;
  let finalModule = null;

  if (baseCategoryResult.category === "finance") {
    finalCategory = detectFinanceCategory(rawText);
    finalModule = "finance-module";
  }

  if (!finalModule) {
    finalModule = selectModule({ category: finalCategory });
  }

  // SCORE
  const scoreResult = scoreDocument({
    type: typeResult,
    category: { category: finalCategory }
  });

  // 🔥 EINZIGER NOTION-WRITE
  await createCoreDocument({
    userId,
    facts,
    rawText
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