"use strict";

const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const POPPLER_BIN =
  "C:\\Users\\49176\\Documents\\PPSHQ\\Projekte\\Alltags Assistenz\\src\\poppler-windows-master\\bin\\poppler-25.12.0\\Library\\bin\\pdftoppm.exe";

async function pdfToImages(pdfPath, maxPages = 2) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(pdfPath)) {
      return reject(new Error("PDF nicht gefunden"));
    }

    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdfimg-"));
    const outPrefix = path.join(outDir, "page");

    const args = [
      "-png",
      "-f", "1",
      "-l", String(maxPages),
      pdfPath,
      outPrefix
    ];

    execFile(POPPLER_BIN, args, (err) => {
      if (err) {
        console.error("❌ PDF→IMAGE ERROR:", err.message);
        return reject(err);
      }

      const images = fs.readdirSync(outDir)
        .filter(f => f.endsWith(".png"))
        .map(f => path.join(outDir, f));

      resolve(images);
    });
  });
}

module.exports = { pdfToImages };