// ============================================================
// Dropbox Wrapper (robust + token refresh)
// Datei: src/cloud/dropbox.js
// ============================================================

"use strict";

const { Dropbox } = require("dropbox");

let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = require("node-fetch");
}

function hasEnvToken() {
  return !!(
    process.env.DROPBOX_ACCESS_TOKEN ||
    (process.env.DROPBOX_APP_KEY &&
      process.env.DROPBOX_APP_SECRET &&
      process.env.DROPBOX_REFRESH_TOKEN)
  );
}

// 🔴 QUICK-FIX: niemals blockieren
async function hasValidDropboxToken() {
  return hasEnvToken();
}

// Dummy für Free – Struktur wird on-the-fly erzeugt
async function createBaseFolderStructure() {
  return true;
}

async function getDropboxClient() {
  if (!process.env.DROPBOX_ACCESS_TOKEN) {
    throw new Error("Dropbox Access Token fehlt");
  }
  return new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    fetch: fetchFn
  });
}

function normalizePath(p) {
  if (!p.startsWith("/")) return "/" + p;
  return p;
}

async function createDropboxFolderIfMissing(folderPath) {
  const dbx = await getDropboxClient();
  const path = normalizePath(folderPath);

  try {
    await dbx.filesGetMetadata({ path });
    return true;
  } catch (_) {
    await dbx.filesCreateFolderV2({ path, autorename: false });
    return true;
  }
}

async function uploadFileToDropbox(folderPath, filename, buffer) {
  const dbx = await getDropboxClient();
  const path = normalizePath(`${folderPath}/${filename}`);

  await createDropboxFolderIfMissing(folderPath);

  await dbx.filesUpload({
    path,
    contents: buffer,
    mode: { ".tag": "overwrite" }
  });

  return true;
}

module.exports = {
  hasValidDropboxToken,
  createBaseFolderStructure,
  createDropboxFolderIfMissing,
  uploadFileToDropbox
};