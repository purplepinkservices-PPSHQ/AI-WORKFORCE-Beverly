// ============================================================
// FILE: src/free/pdf-handler.js
// PURPOSE:
// - Liest PDFs vollständig (pdf-parse)
// - Erkennt Absender & Dokument-Typ (z.B. Finanzamt)
// - Leitet korrekten Dropbox-Pfad ab
// ============================================================

"use strict";

const path = require("path");
const { execFile } = require("child_process");
const fs = require("fs");

const POPPLER_BIN =
  "C:/Users/49176/Documents/PPSHQ/Projekte/Alltags Assistenz/src/poppler-windows-master/bin/poppler-25.12.0/Library/bin/pdftoppm.exe";

async function convertPdfToImages(pdfPath) {
  const outDir = path.dirname(pdfPath);
  const baseName = path.basename(pdfPath, ".pdf");
  const outPrefix = path.join(outDir, baseName);

  return new Promise((resolve, reject) => {
    execFile(
      POPPLER_BIN,
      [
        "-png",
        "-r", "100",
        "-scale-to-x", "3508",
        "-scale-to-y", "4961",
        "-f", "1",
        "-l", "1",
        pdfPath,
        outPrefix
      ],
      (err) => {
        if (err) return reject(err);

        const images = fs
          .readdirSync(outDir)
          .filter((f) => f.startsWith(baseName) && f.endsWith(".png"))
          .map((f) => fs.readFileSync(path.join(outDir, f)));

        resolve(images);
      }
    );
  });
}

module.exports = { convertPdfToImages };