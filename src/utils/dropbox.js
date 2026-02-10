"use strict";

// ============================================================
// Datei: src/utils/dropbox.js
// Version: v1.2.4 – KEEP ORIGINAL EXTENSION
// ============================================================

const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

if (!process.env.DROPBOX_ACCESS_TOKEN) {
  throw new Error("DROPBOX_ACCESS_TOKEN fehlt in .env");
}

const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch
});

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function sanitizeSegment(segment = "") {
  let s = String(segment)
    .trim()
    .replace(/[\\:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "");

  if (!s || s === "." || s === "..") {
    return "Dokument";
  }

  return s;
}

function sanitizeFolderPath(folderPath = "") {
  const parts = String(folderPath)
    .split("/")
    .filter(Boolean)
    .map(sanitizeSegment)
    .filter(Boolean);

  return "/" + parts.join("/");
}

function buildDropboxPath(folderPath, fileName) {
  const folder = sanitizeFolderPath(folderPath);
  const file = sanitizeSegment(fileName || "Dokument");
  const fullPath = `${folder}/${file}`.replace(/\/+/g, "/");
  return fullPath.startsWith("/") ? fullPath : "/" + fullPath;
}

// ------------------------------------------------------------
// UPLOAD
// ------------------------------------------------------------

async function uploadToDropbox({ buffer, folderPath, fileName }) {
  if (!buffer) {
    throw new Error("uploadToDropbox: buffer fehlt");
  }

  const path = buildDropboxPath(folderPath, fileName);

  await dbx.filesUpload({
    path,
    contents: buffer,
    mode: { ".tag": "add" },
    autorename: true,
    mute: false
  });

  return path;
}

module.exports = {
  uploadToDropbox
};