"use strict";

const OpenAI = require("openai");
const client = new OpenAI();

/* =========================================================
   🔴 VISION OCR (LEERER TEXT VERBOTEN)
   ========================================================= */
async function runVisionOCR({ images, source }) {
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("runVisionOCR: keine Bilder");
  }

  try {
    const content = images.map((img) => ({
      type: "input_image",
      image_url: `data:image/png;base64,${
        Buffer.isBuffer(img) ? img.toString("base64") : img
      }`
    }));

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [{
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              "TRANSKRIBIERE den Inhalt 1:1. " +
              "ALLES erfassen: Briefkopf, Absender, Empfänger, Datum, Aktenzeichen, Text, Fußzeile."
          },
          ...content
        ]
      }]
    });

    const text = response.output_text || "";

    return {
      source,
      text: text.trim()
    };
  } catch (err) {
    if (err.status === 429 || err.code === "rate_limit_exceeded") {
      console.warn("⚠️ Vision Rate-Limit → leerer Text verhindert");
      return {
        source: source + "-rate-limit",
        text: "[OCR temporär nicht verfügbar]"
      };
    }
    throw err;
  }
}

module.exports = { runVisionOCR };