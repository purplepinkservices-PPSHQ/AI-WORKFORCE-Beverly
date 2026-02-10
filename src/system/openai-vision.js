"use strict";

// ============================================================
// Datei: src/system/openai-vision.js
// Zweck:
// - OpenAI Vision (RAW)
// - LIEST NUR TEXT aus Bild / PDF
// - KEINE Struktur, KEINE Interpretation
// - Liefert reinen Text (string)
// ============================================================

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env var: ${name}`);
  return val;
}

function extractTextFromResponsesApiPayload(payload) {
  const chunks = [];

  if (typeof payload?.output_text === "string") {
    chunks.push(payload.output_text);
  }

  const out = payload?.output;
  if (Array.isArray(out)) {
    for (const item of out) {
      if (Array.isArray(item?.content)) {
        for (const c of item.content) {
          if (typeof c?.text === "string") chunks.push(c.text);
          if (typeof c === "string") chunks.push(c);
        }
      }
      if (typeof item?.text === "string") chunks.push(item.text);
    }
  }

  return chunks.join("\n").trim();
}

async function openaiVisionRaw({ buffer, mimeType }) {
  const apiKey = requireEnv("OPENAI_API_KEY");

  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("openaiVisionRaw: buffer fehlt oder ungültig");
  }

  const mime =
    mimeType && String(mimeType).startsWith("image/")
      ? String(mimeType)
      : "image/jpeg";

  const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;

  const body = {
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              "Lies den gesamten sichtbaren Text dieses Dokuments vollständig. " +
              "Gib ausschließlich den Text zurück. Keine Interpretation."
          },
          {
            type: "input_image",
            image_url: dataUrl
          }
        ]
      }
    ],
    max_output_tokens: 1500
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
    throw new Error(`OpenAI Vision RAW error (${res.status}): ${errText}`);
  }

  const payload = await res.json();
  return extractTextFromResponsesApiPayload(payload);
}

module.exports = { openaiVisionRaw };