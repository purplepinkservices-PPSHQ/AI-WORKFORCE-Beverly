"use strict";

// ============================================================
// Datei: src/core/analyze-document.js
// ============================================================

const { extractFactsFromVision } = require("./vision-facts-extractor");
const { sanitizeRawTextForDates } = require("../engines/raw-text-sanitizer");

const { detectDocumentDate } = require("../engines/date-engine");
const { detectCreditor } = require("../engines/creditor-engine");
const { detectAmount } = require("../engines/amount-engine");
const { detectDocumentType } = require("../engines/document-type-engine");

const { detectContentCategory } = require("../engines/content-category-engine");
const { detectFinanceCategory } = require("../engines/finance-category-engine");

const { scoreDocument } = require("../engines/document-score-engine");
const { selectModule } = require("../engines/module-selector");

const {
  createCoreDocument
} = require("../integrations/notion/notion-core-documents");

// ------------------------------------------------------------
// ISO-Normalisierung
// ------------------------------------------------------------
function toISODate(dateObj) {
  if (!(dateObj instanceof Date)) return null;

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function analyzeDocument({ userId, fileBuffer, mimeType } = {}) {
  // ==========================================================
  // 1️⃣ VISION
  // ==========================================================
  const visionResult = await extractFactsFromVision({
    buffer: fileBuffer,
    mimeType
  });

  const rawText = visionResult.rawText || "";

  // ==========================================================
  // 2️⃣ SANITIZER
  // ==========================================================
  const sanitizedText = sanitizeRawTextForDates(rawText);

  // ==========================================================
  // 3️⃣ ENGINES
  // ==========================================================
  const dateResult = detectDocumentDate(sanitizedText);
  const isoDate = toISODate(dateResult?.date);

  const creditorResult = detectCreditor(sanitizedText);
  const amountResult = detectAmount(sanitizedText);
  const documentTypeResult = detectDocumentType(sanitizedText);

  const baseCategoryResult = detectContentCategory(sanitizedText);

  const categoryResult = {
    category: baseCategoryResult?.category || "unknown",
    confidence: baseCategoryResult?.confidence ?? 0.6
  };

  let finalCategory = categoryResult.category;
  let finalModule = null;

  if (finalCategory === "finance") {
    finalCategory = detectFinanceCategory(sanitizedText);
    finalModule = "finance-module";
  }

  if (!finalModule) {
    finalModule = selectModule({ category: finalCategory });
  }

  // ==========================================================
  // 4️⃣ SCORE
  // ==========================================================
  const scoreResult = scoreDocument({
    type: documentTypeResult,
    category: categoryResult
  });

  // ==========================================================
  // 5️⃣ NOTION WRITE
  // ==========================================================
  const core = await createCoreDocument({
    userId,
    rawText,
    sanitizedText,
    date: isoDate,
    creditor: creditorResult?.creditor || "Unbekannt",
    category: finalCategory,
    documentType: documentTypeResult?.type || "Dokument",

    // 🔒 Notion-Logik:
    // Betrag = Brutto
    // Steuer optional
    gross: amountResult?.gross ?? null,
    tax: amountResult?.tax ?? null
  });

  return {
    userId,
    rawText,
    sanitizedText,
    creditor: creditorResult,
    amount: amountResult,
    documentType: documentTypeResult,
    coreDocumentId: core?.id || null,
    category: { category: finalCategory },
    module: finalModule,
    score: scoreResult,
    date: {
      date: isoDate,
      confidence: dateResult?.confidence || 0,
      source: dateResult?.source || "Unknown"
    }
  };
}

module.exports = { analyzeDocument };