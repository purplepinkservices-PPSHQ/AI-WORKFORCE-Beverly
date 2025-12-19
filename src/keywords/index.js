"use strict";

const fs = require("fs");
const path = require("path");

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Erwartung pro Keyword-Datei:
// module.exports = { name: "Bank", keywords: [["sparkasse",3], ...] }
// oder: module.exports = [["sparkasse",3], ...]  (Fallback)
function loadAllKeywordCatalogs() {
  const dir = __dirname;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".js") && f !== "index.js");

  const catalogs = [];

  for (const file of files) {
    const p = path.join(dir, file);
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const mod = require(p);

    if (mod && mod.name && Array.isArray(mod.keywords)) {
      catalogs.push({ name: mod.name, keywords: mod.keywords });
      continue;
    }

    if (Array.isArray(mod)) {
      const name = path.basename(file, ".js");
      catalogs.push({ name, keywords: mod });
      continue;
    }

    // Ignorieren, wenn Format falsch
  }

  return catalogs;
}

function detectCategoryFromKeywords(rawText = "") {
  const text = normalize(rawText);
  const catalogs = loadAllKeywordCatalogs();

  const scores = {};
  for (const c of catalogs) {
    let score = 0;
    for (const pair of c.keywords) {
      const keyword = String(pair?.[0] || "").toLowerCase();
      const weight = Number(pair?.[1] || 0);
      if (!keyword || !weight) continue;
      if (text.includes(keyword)) score += weight;
    }
    scores[c.name] = score;
  }

  const entries = Object.entries(scores);
  if (!entries.length) {
    return { category: "Unklar", confidence: 0.3, score: 0, scores };
  }

  entries.sort((a, b) => b[1] - a[1]);
  const [bestCat, bestScore] = entries[0];

  if (bestScore <= 0) {
    return { category: "Unklar", confidence: 0.35, score: 0, scores };
  }

  // Confidence grob skaliert
  const confidence = Math.min(0.95, Math.max(0.45, bestScore / 20));

  // sehr knapp → Unklar
  if (confidence < 0.55) {
    return { category: "Unklar", confidence, score: bestScore, scores };
  }

  // "bank" → "Bank" hübsch machen, wenn Dateiname klein ist
  const pretty =
    bestCat.length <= 2
      ? bestCat.toUpperCase()
      : bestCat.charAt(0).toUpperCase() + bestCat.slice(1);

  return { category: pretty, confidence, score: bestScore, scores };
}

module.exports = {
  detectCategoryFromKeywords
};