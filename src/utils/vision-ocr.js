"use strict";

const OpenAI = require("openai");
const client = new OpenAI();

/* =========================================================
   🔴 VISION OCR (RATE-LIMIT-SAFE)
   ========================================================= */
async function runVisionOCR({ images, source }) {
  if (!images || !Array.isArray(images) || images.length === 0) {
    throw new Error("runVisionOCR: keine Bilder erhalten");
  }

  try {
    const content = images.map((img) => {
      const base64 = Buffer.isBuffer(img)
        ? img.toString("base64")
        : img;

      return {
        type: "input_image",
        image_url: `data:image/png;base64,${base64}`
      };
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "TRANSKRIBIERE den Inhalt 1:1 (keine Zusammenfassung, keine Umformulierung). " +
                "WICHTIG: Erfasse ALLES inklusive Briefkopf/Logo, Absenderblock, Empfänger/Adressfeld, Datum, Ort, Betreff, " +
                "Aktenzeichen/Kundennummer, Anlagen, Fußzeile, Stempel/Unterschrift. " +
                "Gib den Text in Original-Reihenfolge aus und lass nichts weg."
            },
            ...content
          ]
        }
      ]
    });

    return {
      source,
      text: response.output_text || ""
    };
  } catch (err) {
    if (err.status === 429 || err.code === "rate_limit_exceeded") {
      console.warn("⚠️ Vision OCR übersprungen (OpenAI Rate Limit)");

      return {
        source,
        text: "",
        skipped: true,
        reason: "rate_limit"
      };
    }

    throw err; // alles andere bleibt HART
  }
}

module.exports = { runVisionOCR };