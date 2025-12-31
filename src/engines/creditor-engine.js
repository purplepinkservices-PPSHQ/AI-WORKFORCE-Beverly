// ============================================================
// Datei: src/engines/creditor-engine.js
// ============================================================
"use strict";

// ============================================================
// Gläubiger-Engine (Praxis / Firma / Händler / Behörde)
// ============================================================

function normalizeLine(s = "") {
  return String(s).replace(/\t/g, " ").replace(/\s+/g, " ").trim();
}

const COMPANY_KEYWORDS = [
  "gmbh",
  "ag",
  "kg",
  "ug",
  "mbh",
  "praxis",
  "zentrum",
  "klinik",
  "apotheke",
  "dental",
  "technik",
  "medizin",
  "arzt",
  "zahnarzt",
  "handel",
  "shop",
  "markt",
  "supermarkt",
  "bank",
  "sparkasse",
  "versicherung",
  "studio",
  "service",
  "betrieb",
  "unternehmen",
  "logistik",
  "bau",
  "immobilien",
  "verwaltung",

  // ✅ Behörden/Justiz als "Creditor"
  "hauptzollamt",
  "zoll",
  "amtsgericht",
  "landgericht",
  "oberlandesgericht",
  "gericht",
  "staatsanwaltschaft",
  "jobcenter",
  "arbeitsagentur",
  "finanzamt",
  "landesjustizkasse",
  "polizei",
  "ministerium",
  "stadt",
  "gemeinde",
  "ordnungsamt"
];

// Wenn diese Keywords vorkommen, darf die Zeile NICHT als "Adresse" weggeworfen werden.
const AUTHORITY_OVERRIDE = [
  "hauptzollamt",
  "zoll",
  "staatsanwaltschaft",
  "amtsgericht",
  "landgericht",
  "oberlandesgericht",
  "landesjustizkasse",
  "finanzamt",
  "jobcenter",
  "arbeitsagentur",
  "polizei",
  "ordnungsamt",
  "ministerium",
  "stadt",
  "gemeinde"
];

const EXCLUDE_KEYWORDS = [
  "rechnung",
  "rechnungsnr",
  "kundennr",
  "kunden-nr",
  "iban",
  "bic",
  "umsatzsteuer",
  "mwst",
  "gesamtbetrag",
  "datum",
  "telefon",
  "fax",
  "email",
  "www",
  "http",
  "betreff",
  "aktenzeichen",
  "vorgangsnummer"
];

function hasAuthorityOverride(line = "") {
  const l = line.toLowerCase();
  return AUTHORITY_OVERRIDE.some((k) => l.includes(k));
}

function isAddressLike(line) {
  const l = line.toLowerCase();

  // ✅ Behördenzeilen NICHT wegfiltern, auch wenn Straße/Telefon drin steht
  if (hasAuthorityOverride(l)) return false;

  return (
    l.includes("straße") ||
    l.includes("str.") ||
    l.includes("weg") ||
    l.includes("platz") ||
    l.includes("allee") ||
    l.includes("gasse") ||
    /\b\d{5}\b/.test(l) || // PLZ
    l.includes("tel") ||
    l.includes("telefon") ||
    l.includes("fax") ||
    l.includes("email") ||
    l.includes("@")
  );
}

function containsExcluded(line) {
  const l = line.toLowerCase();

  // ✅ Behördenzeilen NICHT als "excluded" wegwerfen
  if (hasAuthorityOverride(l)) return false;

  return EXCLUDE_KEYWORDS.some((k) => l.includes(k));
}

function companyScore(line) {
  const l = line.toLowerCase();
  let score = 0;

  COMPANY_KEYWORDS.forEach((k) => {
    if (l.includes(k)) score += 2;
  });

  // Großbuchstaben-Zeile (typisch Firmenkopf)
  if (/^[A-ZÄÖÜ0-9 &\-.]{6,}$/.test(line)) score += 3;

  // Länge zählt
  if (line.length >= 10 && line.length <= 70) score += 1;

  // Bonus: Zeile startet mit Behörde
  if (
    /^(hauptzollamt|staatsanwaltschaft|amtsgericht|landgericht|finanzamt|jobcenter|polizei)\b/i.test(
      line
    )
  ) {
    score += 3;
  }

  return score;
}

function cleanCreditorName(line) {
  return normalizeLine(line).replace(/\s{2,}/g, " ").replace(/[,:;]+$/, "").trim();
}

function detectCreditor(rawText = "") {
  const text = String(rawText || "");
  const lines = text.split(/\r?\n/).map(normalizeLine).filter(Boolean);

  // Nur Kopfbereich betrachten
  const head = lines.slice(0, 40);

  let best = null;

  for (const line of head) {
    if (!line) continue;
    if (containsExcluded(line)) continue;
    if (isAddressLike(line)) continue;

    const score = companyScore(line);
    if (score < 3) continue;

    if (!best || score > best.score) {
      best = {
        name: cleanCreditorName(line),
        score
      };
    }
  }

  if (best && best.name.length >= 3) {
    return {
      creditor: best.name,
      confidence: Math.min(0.95, 0.6 + best.score * 0.05),
      source: "CompanyHeuristics"
    };
  }

  // Fallback
  return {
    creditor: "Unbekannt",
    confidence: 0.4,
    source: "Fallback"
  };
}

module.exports = { detectCreditor };