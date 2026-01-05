"use strict";

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const { extractText } = require("../utils/text-engine");
const { uploadToDropbox } = require("../utils/dropbox");

function safeDate() {
  const d = new Date();
  return {
    year: d.getFullYear(),
    month: d.toLocaleString("de-DE", { month: "long" }),
    day: String(d.getDate()).padStart(2, "0")
  };
}

async function handleFreeUpload(message) {
  const attachment = [...message.attachments.values()][0];
  if (!attachment) return;

  const originalName = attachment.name || "upload";
  const tmpDir = path.join(__dirname, "../../tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const tmpFile = path.join(tmpDir, Date.now() + "_" + originalName);
  const res = await axios.get(attachment.url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(res.data);
  fs.writeFileSync(tmpFile, buffer);

  // TEXT (best effort)
  let text = "";
  try {
    text = await extractText({
      buffer,
      mimeType: attachment.contentType,
      filePath: tmpFile
    });
  } catch {
    text = "";
  }

  // BASELINE FOLDER
  const { year, month, day } = safeDate();
  const folderPath = `/${year}/${month}/Privatausgaben`;
  const fileName = `${year}-${day}-Beleg-${originalName}`;

  await uploadToDropbox({
    buffer,
    folderPath,
    fileName
  });

  try { fs.unlinkSync(tmpFile); } catch {}

  await message.reply(
    `✅ Dokument gespeichert\n\n` +
    `📂 Ablage: ${folderPath}\n` +
    `📄 Name: ${fileName}\n\n` +
    `⬇️ Du kannst direkt das nächste Dokument hochladen 😊`
  );
}

module.exports = { handleFreeUpload };