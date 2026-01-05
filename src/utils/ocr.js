"use strict";

const { extractText } = require("../free/text-engine");

async function runOCR({ buffer }) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return { source: "ocr", text: "" };
  }

  const text = await extractText(buffer);
  return {
    source: "ocr",
    text: text || ""
  };
}

module.exports = { runOCR };