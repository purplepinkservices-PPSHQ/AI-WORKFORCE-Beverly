"use strict";

const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function runVisionOCR(buffer, mimeType) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("runVisionOCR: ungültiger Buffer");
  }

  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: "Lies dieses Dokument vollständig und strukturiert." },
          { type: "input_image", image_url: dataUrl }
        ]
      }
    ]
  });

  const text =
    response.output_text ||
    response.output?.[0]?.content?.[0]?.text ||
    "";

  return {
    text: text.trim(),
    confidence: text.length > 120 ? 0.9 : 0.5
  };
}

module.exports = { runVisionOCR };