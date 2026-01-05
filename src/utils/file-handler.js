// ============================================================
// Datei: src/utils/file-handler.js
// ============================================================

"use strict";

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const TEMP_DIR = path.join(__dirname, "..", "..", "tmp");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

async function saveTempFile({ userId, url, filename }) {
  const userDir = path.join(TEMP_DIR, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const filePath = path.join(userDir, filename);
  const response = await axios.get(url, { responseType: "stream" });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return {
    tempPath: filePath,
    filename
  };
}

module.exports = { saveTempFile };