// ============================================================
// Datei: src/handlers/upload-handler.js
// ============================================================

"use strict";

const { handleFreeUpload } = require("../free/handleFreeUpload");

async function handleUpload(message) {
  if (!message.attachments || message.attachments.size === 0) {
    return false;
  }

  await handleFreeUpload(message);
  return true;
}

module.exports = { handleUpload };