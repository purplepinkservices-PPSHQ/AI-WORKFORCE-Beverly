"use strict";

const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const POPPLER_BIN =
  "C:/Users/49176/Documents/PPSHQ/Projekte/Alltags Assistenz/src/poppler-windows-master/bin/poppler-25.12.0/Library/bin/pdftoppm.exe";

function convertPdfToImages(pdfPath) {
  const outDir = path.dirname(pdfPath);
  const base = path.basename(pdfPath, ".pdf");
  const outPrefix = path.join(outDir, base);

  return new Promise((resolve, reject) => {
    execFile(
      POPPLER_BIN,
      ["-png", "-f", "1", "-l", "1", pdfPath, outPrefix],
      (err) => {
        if (err) return reject(err);

        const files = fs
          .readdirSync(outDir)
          .filter(f => f.startsWith(base) && f.endsWith(".png"))
          .map(f => fs.readFileSync(path.join(outDir, f)));

        resolve(files);
      }
    );
  });
}

module.exports = { convertPdfToImages };