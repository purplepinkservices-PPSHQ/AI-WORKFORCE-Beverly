"use strict";

const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch
});

// ===============================
// 🔧 SAFE NORMALIZER
// ===============================
function normalizeDropboxPath(p) {
  // 🔴 FIX: Typ absichern
  if (typeof p !== "string" || !p.trim()) {
    return "/Unklar";
  }

  let pathStr = p.trim();

  if (!pathStr.startsWith("/")) {
    pathStr = "/" + pathStr;
  }

  // doppelte Slashes vermeiden
  pathStr = pathStr.replace(/\/+/g, "/");

  return pathStr;
}

// ===============================
// 📤 UPLOAD
// ===============================
async function uploadToDropbox({ buffer, fileName, folderPath }) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("uploadToDropbox: buffer fehlt oder ungültig");
  }

  const safeFolder = normalizeDropboxPath(folderPath);
  const safeName =
    typeof fileName === "string" && fileName.trim()
      ? fileName.trim()
      : "Unbekannt.pdf";

  const fullPath = `${safeFolder}/${safeName}`;

  await dbx.filesUpload({
    path: fullPath,
    contents: buffer,
    mode: { ".tag": "overwrite" }
  });

  console.log("[Dropbox] Upload:", fullPath);
}

module.exports = {
  uploadToDropbox
};