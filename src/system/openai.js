"use strict";

// ============================================================
// Datei: src/system/openai.js
// Zweck: OpenAI Responses API Call (Structured Outputs via JSON Schema)
// ============================================================

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env var: ${name}`);
  return val;
}

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

function extractTextFromResponsesApiPayload(payload) {
  // Robust gegen verschiedene Output-Item-Formate.
  // Wir suchen nach irgendeinem string, der wie JSON aussieht.
  const candidates = [];

  // Manche Responses liefern "output_text" (SDK), REST liefert oft "output" items.
  if (typeof payload?.output_text === "string") candidates.push(payload.output_text);

  const out = payload?.output;
  if (Array.isArray(out)) {
    for (const item of out) {
      // item.content kann array sein
      if (Array.isArray(item?.content)) {
        for (const c of item.content) {
          if (typeof c?.text === "string") candidates.push(c.text);
          if (typeof c === "string") candidates.push(c);
        }
      }
      // fallback
      if (typeof item?.text === "string") candidates.push(item.text);
    }
  }

  // Priorisiere JSON-artige Strings
  const jsonish = candidates.find(s => typeof s === "string" && s.trim().startsWith("{"));
  return jsonish || candidates[0] || null;
}

async function openaiStructuredJson({
  model,
  instructions,
  userInput,
  schemaName,
  schema,
  maxOutputTokens = 350
}) {
  const apiKey = requireEnv("OPENAI_API_KEY");

  const body = {
    model,
    instructions,
    input: userInput,
    max_output_tokens: maxOutputTokens,
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        strict: true,
        schema
      }
    }
  };

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const payload = await res.json();

  const text = extractTextFromResponsesApiPayload(payload);
  if (!text) throw new Error("OpenAI API returned no text output");

  const parsed = safeJsonParse(text);
  if (!parsed) throw new Error("OpenAI output was not valid JSON");

  return parsed;
}

module.exports = { openaiStructuredJson };