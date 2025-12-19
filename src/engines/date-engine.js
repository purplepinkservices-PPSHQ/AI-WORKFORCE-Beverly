"use strict";

// ============================================================
// Datum-Engine
// Datei: src/engines/date-engine.js
//
// Ziel:
// - Dokumentdatum erkennen (Rechnungsdatum, Belegdatum, Vertragsdatum)
// - robust gegen OCR-Fehler
// - plausibles Datum wählen
// ============================================================

function normalize(text = "") {
  return String(text)
    .replace(/\s+/g, " ")
    .replace(/[^\d.\-\/a-zA-ZäöüÄÖÜ]/g, " ")
    .toLowerCase();
}

// dd.mm.yyyy | d.m.yy | yyyy-mm-dd | dd/mm/yyyy
const DATE_REGEXES = [
  /\b(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})\b/g,
  /\b(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})\b/g
];

// Marker erhöhen Priorität
const DATE_MARKERS = [
  "rechnungsdatum",
  "belegdatum",
  "datum",
  "ausgestellt am",
  "vom"
];

function parseDate(d, m, y) {
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);
  if (
    year < 1990 ||
    year > new Date().getFullYear() + 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) return null;

  return new Date(year, month - 1, day);
}

function detectDates(rawText = "") {
  const text = normalize(rawText);
  const results = [];

  for (const regex of DATE_REGEXES) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      let date = null;

      // yyyy-mm-dd
      if (match[1].length === 4) {
        date = parseDate(match[3], match[2], match[1]);
      } else {
        date = parseDate(match[1], match[2], match[3]);
      }

      if (date) {
        results.push({
          date,
          index: match.index
        });
      }
    }
  }

  return results;
}

function detectDocumentDate(rawText = "") {
  const text = normalize(rawText);
  const candidates = detectDates(rawText);

  if (!candidates.length) {
    return {
      date: null,
      confidence: 0,
      source: "NoDateFound"
    };
  }

  // Marker-basierte Priorisierung
  let best = null;
  for (const c of candidates) {
    let score = 1;

    const window = text.substring(
      Math.max(0, c.index - 40),
      c.index + 40
    );

    for (const marker of DATE_MARKERS) {
      if (window.includes(marker)) score += 3;
    }

    if (!best || score > best.score) {
      best = { ...c, score };
    }
  }

  return {
    date: best.date,
    confidence: Math.min(0.95, 0.6 + best.score * 0.1),
    source: "DateEngine"
  };
}

module.exports = { detectDocumentDate };