"use strict";

// ============================================================
// Datei: src/core/llm-facts-extractor.js
// Zweck: LLM-Faktenextraktion (nur Facts, keine Beratung)
// ============================================================

const { openaiStructuredJson } = require("../system/openai");

const FACTS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["creditor", "documentType", "amounts", "dates", "confidence", "notes"],
  properties: {
    creditor: {
      type: "object",
      additionalProperties: false,
      required: ["name", "category"],
      properties: {
        name: { type: "string" },
        category: {
          type: "string",
          enum: ["BEHOERDE", "VERSICHERUNG", "HAUSHALT", "BANK", "TELEKOM", "UNTERNEHMEN", "UNBEKANNT"]
        }
      }
    },
    documentType: {
      type: "string",
      enum: ["STEUERBESCHEID", "RECHNUNG", "MAHNUNG", "VOLLSTRECKUNG", "BESCHEID", "SCHREIBEN", "DOKUMENT"]
    },
    amounts: {
      type: "object",
      additionalProperties: false,
      required: ["total", "currency"],
      properties: {
        total: { type: ["number", "null"] },
        currency: { type: "string", enum: ["EUR"] }
      }
    },
    dates: {
      type: "object",
      additionalProperties: false,
      required: ["documentDate"],
      properties: {
        documentDate: { type: ["string", "null"] } // YYYY-MM-DD oder null
      }
    },
    confidence: {
      type: "object",
      additionalProperties: false,
      required: ["totalAmount", "creditor", "documentType", "documentDate"],
      properties: {
        totalAmount: { type: "number" },   // 0..1
        creditor: { type: "number" },      // 0..1
        documentType: { type: "number" },  // 0..1
        documentDate: { type: "number" }   // 0..1
      }
    },
    notes: {
      type: "string",
      description: "Kurz, warum etwas unsicher ist (max 1-2 Sätze)."
    }
  }
};

function clamp01(n) {
  if (typeof n !== "number") return 0;
  return Math.max(0, Math.min(1, n));
}

async function extractFactsWithLLM(rawText, { hint = "" } = {}) {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"; // Structured Outputs empfohlen :contentReference[oaicite:1]{index=1}

  const instructions =
    "You extract structured facts from German documents. " +
    "Rules: Do NOT invent values. If a value is unclear, use null and lower confidence. " +
    "Prefer the main payable/settled amount (e.g., 'zu zahlen', 'festgesetzt', 'Nachzahlung'). " +
    "Return ONLY JSON that matches the schema. No extra keys.";

  const userInput =
    "Dokumenttext (OCR, kann fehlerhaft sein):\n\n" +
    rawText.slice(0, 12000) + // Token-Schutz
    (hint ? `\n\nHint:\n${hint}` : "");

  const out = await openaiStructuredJson({
    model,
    instructions,
    userInput,
    schemaName: "document_facts",
    schema: FACTS_SCHEMA,
    maxOutputTokens: 450
  });

  // Hardening: confidence clamp
  out.confidence.totalAmount = clamp01(out?.confidence?.totalAmount);
  out.confidence.creditor = clamp01(out?.confidence?.creditor);
  out.confidence.documentType = clamp01(out?.confidence?.documentType);
  out.confidence.documentDate = clamp01(out?.confidence?.documentDate);

  return out;
}

module.exports = { extractFactsWithLLM };