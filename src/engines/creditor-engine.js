"use strict";

// ============================================================
// Datei: src/engines/creditor-engine.js
// Zweck:
// - Zuverlässige Gläubiger-Erkennung (Händler / Firma / Behörde)
// - Header-Signaturen
// - Minimal-Fix: Artikelzeilen NIE als Gläubiger
// ============================================================

function normalizeLine(s = "") {
  return String(s)
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeComparable(s = "") {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]/gi, "");
}

// ------------------------------------------------------------
// HARTE AUSSCHLUSS-REGELN
// ------------------------------------------------------------
const TECH_ID_PATTERNS = [
  /^t-id\b/i,
  /^ta-nr\b/i,
  /^ta nr\b/i,
  /^beleg[-\s]?nr\b/i,
  /^transaktion\b/i,
  /^vorgang\b/i,
  /^zahlungsart\b/i,
  /^visa\b/i,
  /^mastercard\b/i,
  /^debit\b/i,
  /^ec[-\s]?karte\b/i,
  /^kartenzahlung\b/i,
  /^terminal\b/i,
  /^kasse\b/i,
  /^bon[-\s]?nr\b/i,
  /^sn[:\s]/i
];

const EXCLUDE_KEYWORDS = [
  "rechnung",
  "rechnungsnr",
  "kundenbeleg",
  "beleg",
  "quittung",
  "kassenbon",
  "ust",
  "mwst",
  "steuer",
  "netto",
  "brutto",
  "betrag",
  "summe",
  "total",
  "zahlung",
  "bezahlt",
  "danke",
  "powered",
  "possum"
];

const LEGAL_FORMS = [
  "gmbh", "ug", "ag", "kg", "gbr", "ohg", "ek",
  "ltd", "limited", "inc", "llc"
];

const CONTACT_MARKERS = ["tel", "email", "www", "@", "http"];
const TAX_MARKERS = ["ust-id", "ustid", "st.-nr", "steuer-nr"];

// ------------------------------------------------------------
// 🆕 ARTIKELZEILEN-ERKENNUNG (FIX)
// ------------------------------------------------------------
function isItemLine(line) {
  const l = String(line || "").trim().toLowerCase();

  // Artikelnummer am Anfang
  if (/^\d{4,}\s/.test(l)) return true;

  // Preis + MwSt-Klasse (A/B)
  if (/\d{1,6}[.,]\d{2}\s*[ab]\b/.test(l)) return true;

  // Mengen / Einheiten
  if (/\b\d+(x|stk|kg|g|l)\b/.test(l)) return true;

  return false;
}

// ------------------------------------------------------------
// Helper
// ------------------------------------------------------------
function isHyphenSpelledWord(line) {
  return /^[A-ZÄÖÜ]{1}(-[A-ZÄÖÜ]{1}){5,}$/.test(line);
}

function isTechnicalId(line) {
  return TECH_ID_PATTERNS.some(rx => rx.test(line));
}

function containsExcluded(line) {
  const c = normalizeComparable(line);
  return EXCLUDE_KEYWORDS.some(k => c.includes(normalizeComparable(k)));
}

function containsMoney(line) {
  return /\d{1,6}[.,]\d{2}/.test(line);
}

function isAddressLike(line) {
  const l = line.toLowerCase();
  if (/\b\d{5}\b/.test(l)) return true;
  if (/\b(strasse|straße|str\.|weg|platz|allee|gasse|ring)\b/.test(l)) return true;
  return false;
}

function hasLegalForm(line) {
  const c = normalizeComparable(line);
  return LEGAL_FORMS.some(f => c.includes(f));
}

function hasContact(line) {
  const l = line.toLowerCase();
  return CONTACT_MARKERS.some(m => l.includes(m));
}

function hasTax(line) {
  const l = line.toLowerCase();
  return TAX_MARKERS.some(m => l.includes(m));
}

function looksLikeName(line) {
  if (line.length < 3 || line.length > 80) return false;
  if (!/[a-zA-ZäöüÄÖÜ]/.test(line)) return false;
  if (/^\d+$/.test(line)) return false;
  return true;
}

function cleanCreditorName(line) {
  return normalizeLine(line)
    .replace(/[,:;]+$/, "")
    .trim();
}

// ------------------------------------------------------------
// SCORE
// ------------------------------------------------------------
function headerScore(line, ctx) {
  if (!looksLikeName(line)) return 0;
  if (containsMoney(line)) return 0;
  if (isItemLine(line)) return 0;           // ✅ FIX
  if (isTechnicalId(line)) return 0;
  if (isHyphenSpelledWord(line)) return 0;
  if (containsExcluded(line)) return 0;

  let score = 0;

  if (hasLegalForm(line)) score += 10;
  if (/[A-ZÄÖÜ]/.test(line) && line.length >= 6) score += 2;
  if (line.split(" ").length >= 2) score += 1;

  if (ctx.hasContact) score += 2;
  if (ctx.hasAddress) score += 2;
  if (ctx.hasTax) score += 2;

  if (isAddressLike(line)) score -= 4;

  return score;
}

function pickBestHeaderLine(lines) {
  const ctx = {
    hasContact: lines.some(hasContact),
    hasAddress: lines.some(isAddressLike),
    hasTax: lines.some(hasTax)
  };

  let best = null;

  for (const line of lines) {
    const score = headerScore(line, ctx);
    if (score <= 0) continue;

    if (!best || score > best.score) {
      best = { name: cleanCreditorName(line), score };
    }
  }

  return best;
}

// ------------------------------------------------------------
// MAIN
// ------------------------------------------------------------
function detectCreditor(rawText = "") {
  const lines = rawText
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);

  if (!lines.length) {
    return { creditor: "Unbekannt", confidence: 0.0, source: "NoText" };
  }

  // 1️⃣ Header
  const header = lines.slice(0, 18);
  const bestHeader = pickBestHeaderLine(header);

  if (bestHeader) {
    return {
      creditor: bestHeader.name,
      confidence: hasLegalForm(bestHeader.name) ? 0.96 : 0.88,
      source: "HeaderSignatures"
    };
  }

  // 2️⃣ Receipt-Head
  const receiptHead = lines.slice(0, 30);
  const bestReceipt = pickBestHeaderLine(receiptHead);

  if (bestReceipt) {
    return {
      creditor: bestReceipt.name,
      confidence: 0.82,
      source: "ReceiptHead"
    };
  }

  return {
    creditor: "Unbekannt",
    confidence: 0.3,
    source: "Fallback"
  };
}

module.exports = { detectCreditor };