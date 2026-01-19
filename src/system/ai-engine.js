"use strict";

// ============================================================
// Datei: src/system/ai-engine.js
// Minimaler OpenAI-Client (Responses API)
// - keine Persistenz
// - kein Tooling
// - nur Text Output
//
// ENV:
//   OPENAI_API_KEY=...
//   OPENAI_MODEL=gpt-5 (optional)
// ============================================================

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5";

async function callOpenAIResponses({ instructions, input, model } = {}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      error: "OPENAI_API_KEY fehlt in der Umgebung.",
      outputText: ""
    };
  }

  if (!instructions || !input) {
    return {
      ok: false,
      error: "instructions und input sind erforderlich.",
      outputText: ""
    };
  }

  const payload = {
    model: model || DEFAULT_MODEL,
    instructions,
    input
  };

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return {
        ok: false,
        error: `OpenAI API Fehler: ${res.status} ${res.statusText} ${txt}`.trim(),
        outputText: ""
      };
    }

    const json = await res.json();

    // Responses API: bequemes Feld, falls vorhanden
    const outputText =
      (typeof json.output_text === "string" && json.output_text) ||
      "";

    return { ok: true, error: null, outputText };
  } catch (e) {
    return {
      ok: false,
      error: `OpenAI Request fehlgeschlagen: ${e?.message || String(e)}`,
      outputText: ""
    };
  }
}

module.exports = { callOpenAIResponses };