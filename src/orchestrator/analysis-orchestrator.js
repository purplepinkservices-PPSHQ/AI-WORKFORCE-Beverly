"use strict";

const { detectDocumentType } = require("../engines/document-type-engine");
const { detectCreditor } = require("../engines/creditor-engine");
const { detectPerson } = require("../engines/person-engine");
const { detectDocumentDate } = require("../engines/date-engine");
const { detectCategoryFromKeywords } = require("../keywords");

async function analyzeDocument({ ocrResult }) {
  const rawText = (ocrResult?.text || "").trim();

  const keywordCategoryResult = detectCategoryFromKeywords(rawText);
  const typeResult = detectDocumentType(rawText);
  const creditorResult = detectCreditor(rawText);
  const personResult = detectPerson(rawText);
  const dateResult = detectDocumentDate(rawText);

  const safeType = typeResult?.type || "Unklar";
  const safeCategory =
    keywordCategoryResult?.category ||
    typeResult?.category ||
    safeType;

  const safeDate = dateResult?.date || null;

  return {
    type: safeType,
    category: safeCategory,
    date: safeDate,
    creditor: creditorResult?.creditor || "Unbekannt",
    person: personResult?.lastname || "Unbekannt",
    source: ocrResult?.source || "OpenAI Vision",
    confidence: Math.min(
      typeResult?.confidence || 0.5,
      creditorResult?.confidence || 0.5,
      personResult?.confidence || 0.5
    )
  };
}

module.exports = { analyzeDocument };