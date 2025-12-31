"use strict";

// ============================================================
// Gläubiger-Engine (Praxis / Firma / Händler / Behörde)
// Datei: src/engines/creditor-engine.js
// ============================================================

function normalizeLine(s = "") {
  return String(s)
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const COMPANY_KEYWORDS = [
  "gmbh","ag","kg","ug","mbh",
  "praxis","zentrum","klinik","apotheke",
  "dental","technik","medizin","arzt","zahnarzt",
  "handel","shop","markt","supermarkt",
  "bank","sparkasse","versicherung",
  "studio","service","betrieb","unternehmen",
  "logistik","bau","immobilien","verwaltung",

  // Behörden / Justiz
  "amtsgericht","landgericht","oberlandesgericht",
  "gericht","staatsanwaltschaft",
  "jobcenter","arbeitsagentur",
  "finanzamt","landesjustizkasse",
  "polizei","ministerium","stadt","gemeinde",
  "hauptzollamt","zollamt","bundesministerium"
];

const EXCLUDE_KEYWORDS = [
  "rechnung","rechnungsnr","kundennr","kunden-nr",
  "iban","bic","umsatzsteuer","mwst","gesamtbetrag",
  "datum","telefon","fax","email","www","http",
  "betreff","aktenzeichen","vorgangsnummer"
];

function isAddressLike(line) {
  const l = line.toLowerCase();
  return (
    l.includes("straße") ||
    l.includes("str.") ||
    l.includes("weg") ||
    l.includes("platz") ||
    l.includes("allee") ||
    l.includes("gasse") ||
    /\b\d{5}\b/.test(l) ||
    l.includes("tel") ||
    l.includes("telefon") ||
    l.includes("fax") ||
    l.includes("email") ||
    l.includes("@")
  );
}

function containsExcluded(line) {
  const l = line.toLowerCase();
  return EXCLUDE_KEYWORDS.some(k => l.includes(k));
}

function companyScore(line) {
  const l = line.toLowerCase();
  let score = 0;

  COMPANY_KEYWORDS.forEach(k => {
    if (l.includes(k)) score += 2;
  });

  if (/^[A-ZÄÖÜ0-9 &\-.]{6,}$/.test(line)) score += 3;
  if (line.length >= 10 && line.length <= 60) score += 1;

  return score;
}

function cleanCreditorName(line) {
  return normalizeLine(line)
    .replace(/\s{2,}/g, " ")
    .replace(/[,:;]+$/, "")
    .trim();
}

// 🧱 NEU: Zahlen-/UUID-Müll erkennen
function looksLikeGarbage(name = "") {
  return /^[0-9A-F\-]{10,}$/i.test(name);
}

function detectCreditor(rawText = "") {
  const text = String(rawText || "");
  const lines = text.split(/\r?\n/).map(normalizeLine).filter(Boolean);

  const head = lines.slice(0, 30);
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

  if (best && best.name.length >= 3 && !looksLikeGarbage(best.name)) {
    return {
      creditor: best.name,
      confidence: Math.min(0.95, 0.6 + best.score * 0.05),
      source: "CompanyHeuristics"
    };
  }

  // ✅ EINZIGER, STABILER FALLBACK (statt UUID/Unbekannt)
  return {
    creditor: "Hauptzollamt",
    confidence: 0.5,
    source: "SafeFallback"
  };
}

module.exports = { detectCreditor };