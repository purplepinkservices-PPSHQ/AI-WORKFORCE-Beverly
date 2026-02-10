"use strict";

// ============================================================
// Datei: src/engines/raw-text-sanitizer.js
// Zweck:
// - Entfernt NUR technische Belegdaten
// - KEINE kaufrelevanten Infos (MwSt, Summe, Netto)
// ============================================================

function sanitizeRawTextForDates(rawText = "") {
  if (!rawText) return "";

  let text = String(rawText);

  // ----------------------------------------------------------
  // EXAKTE technische Einzelzeilen entfernen
  // ----------------------------------------------------------
  const DROP_LINE_PATTERNS = [
    /^emv[-\s]?daten.*$/i,
    /^as[-\s]?proc[-\s]?code.*$/i,
    /^capt\.-ref.*$/i,
    /^vu[-\s]?nummer.*$/i,
    /^autorisierungs.*$/i,
    /^tse[-\s]?signatur.*$/i,
    /^signature.*$/i,
    /^[a-f0-9]{30,}$/i
  ];

  text = text
    .split(/\r?\n/)
    .filter(line => !DROP_LINE_PATTERNS.some(rx => rx.test(line.trim())))
    .join("\n");

  // Leerzeilen normalisieren
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

module.exports = { sanitizeRawTextForDates };