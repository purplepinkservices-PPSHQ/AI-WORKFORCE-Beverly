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

  const ocrResult = await runOCR({
    buffer: fileBuffer,
    mimeType,
    filePath
  });

  const rawText = ocrResult?.text || "";

  // ✅ FACTS EINMAL HIER
  const facts = await extractDocumentFacts({ rawText });

  const typeResult = detectDocumentType(rawText);
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

  const scoreResult = scoreDocument({
    type: typeResult,
    category: { category: finalCategory }
  });

  const core = await createCoreDocument({
    userId,
    facts,
    rawText
  });

  return {
    userId,
    coreDocumentId: core?.id || null,
    type: typeResult,
    category: { category: finalCategory },
    score: scoreResult,
    module: finalModule,
    rawText,
    facts // ✅ WICHTIG
  };
}

module.exports = { analyzeDocument };