"use strict";

// ============================================================
// Datei: src/engines/amount-engine.js
// Zweck:
// - Extraktion von Bruttobetrag (Betrag) & Steuer
// - Netto wird NICHT gespeichert (Notion-Formel)
// - Mischsteuersätze (7% / 19%) korrekt summiert
// Version: v3.3 FINAL
// ============================================================

function parseAmount(raw) {
  if (!raw) return null;

  const cleaned = raw
    .replace(/[^\d,.\-]/g, "")
    .replace(/\.(?=\d{3})/g, "")
    .replace(",", ".");

  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;

  return Math.round(value * 100) / 100;
}

// ------------------------------------------------------------
// Marker
// ------------------------------------------------------------
const GROSS_MARKERS = [
  "betrag",
  "gesamt",
  "gesamtbetrag",
  "summe",
  "total",
  "zu zahlen"
];

const PAYMENT_MARKERS = [
  "visa",
  "ec",
  "karte",
  "kartenzahlung",
  "bar",
  "bezahlt",
  "zahlung"
];

// ============================================================
// HAUPTFUNKTION
// ============================================================
function detectAmount(rawText = "") {
  if (!rawText) {
    return {
      gross: null,
      tax: null,
      confidence: {},
      source: "NoText"
    };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  let gross = null;
  let tax = null;

  // ==========================================================
  // 1️⃣ Brutto erkennen
  // ==========================================================
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();

    if (!gross && GROSS_MARKERS.some(m => l.includes(m))) {
      const m1 = lines[i].match(/(\d{1,6}[.,]\d{2})/);
      const m2 = lines[i + 1]?.match(/(\d{1,6}[.,]\d{2})/);

      gross = parseAmount(m1?.[1] || m2?.[1]);
      if (gross !== null) break;
    }
  }

  // ==========================================================
  // 2️⃣ Zahlungskontext → Brutto
  // ==========================================================
  if (!gross) {
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].toLowerCase();
      if (!PAYMENT_MARKERS.some(m => l.includes(m))) continue;

      const window = `${lines[i - 1] || ""} ${lines[i]} ${lines[i + 1] || ""}`;
      const m = window.match(/(\d{1,6}[.,]\d{2})/);
      const v = parseAmount(m?.[1]);
      if (v !== null) {
        gross = v;
        break;
      }
    }
  }

  // ==========================================================
  // 3️⃣ MwSt explizit SUMMIEREN
  // NUR Beträge hinter "MwSt"
  // ==========================================================
  const mwstValues = [];

  for (const line of lines) {
    const match = line.match(/mwst\s*([0-9]{1,6}[.,][0-9]{2})/i);
    if (match) {
      const v = parseAmount(match[1]);
      if (v !== null) mwstValues.push(v);
    }
  }

  if (mwstValues.length) {
    tax = Math.round(
      mwstValues.reduce((a, b) => a + b, 0) * 100
    ) / 100;
  }

  // ==========================================================
  // 4️⃣ Fallback: Steuer = Brutto - größtes plausibles Netto
  // (nur wenn KEINE MwSt-Zeilen existieren)
  // ==========================================================
  if (gross !== null && tax === null) {
    const numbers = lines
      .flatMap(l => l.match(/\d{1,6}[.,]\d{2}/g) || [])
      .map(parseAmount)
      .filter(v => v !== null && v < gross);

    if (numbers.length) {
      const bestNet = Math.max(...numbers);
      const diff = Math.round((gross - bestNet) * 100) / 100;
      if (diff > 0 && diff < gross) tax = diff;
    }
  }

  return {
    gross: gross ?? null,
    tax: tax ?? null,
    confidence: {
      gross: gross !== null ? 0.95 : 0,
      tax: tax !== null ? 0.95 : 0
    },
    source: "AmountEngineV3.3"
  };
}

module.exports = { detectAmount };