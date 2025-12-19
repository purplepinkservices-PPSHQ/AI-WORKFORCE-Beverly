"use strict";

// ============================================================
// Dokumentart-Engine (Score-System)
// Datei: src/engines/document-type-engine.js
// ============================================================

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N} %.\-]/gu, " ")
    .trim();
}

const CATALOG = {
  Rechnung: [
    ["rechnung", 5],
    ["rechnungsnr", 4],
    ["rechnungsnummer", 4],
    ["rechnungsdatum", 3],
    ["gesamtbetrag", 4],
    ["bruttobetrag", 3],
    ["nettobetrag", 3],
    ["mwst", 3],
    ["umsatzsteuer", 3],
    ["zahlungsziel", 2],
    ["fällig", 2],
    ["honorar", 2],
    ["leistung", 2]
  ],

  Kassenbon: [
    ["kassenbon", 5],
    ["bon", 4],
    ["kasse", 3],
    ["wechselgeld", 3],
    ["bar", 2],
    ["ec", 2],
    ["kartenzahlung", 2],
    ["summe", 2],
    ["mwst", 2],
    ["aldi", 3], ["lidl", 3], ["rewe", 3], ["edeka", 3], ["penny", 3],
    ["netto", 3], ["kaufland", 3], ["norma", 3],
    ["dm", 3], ["rossmann", 3], ["mueller", 3],
    ["mcdonald", 3], ["burger king", 3], ["kfc", 3], ["subway", 3],
    ["dominos", 3], ["pizza hut", 3], ["starbucks", 3],
    ["ikea", 3], ["media markt", 3], ["saturn", 3], ["decathlon", 3],
    ["h&m", 3], ["zara", 3], ["primark", 3],
    ["einkaufszentrum", 2], ["shopping center", 2], ["center", 1]
  ],

  Quittung: [
    ["quittung", 5],
    ["betrag erhalten", 4],
    ["zahlung erhalten", 4],
    ["bezahlt", 3],
    ["danke für ihren einkauf", 2]
  ],

  Vertrag: [
    ["vertrag", 5],
    ["vertragsnummer", 4],
    ["vertragsbeginn", 3],
    ["vertragsende", 3],
    ["laufzeit", 3],
    ["kündigung", 3],
    ["kündigungsfrist", 3],
    ["vereinbarung", 2],
    ["bedingungen", 2]
  ],

  Versicherung: [
    ["versicherung", 5],
    ["versicherungsnummer", 4],
    ["police", 4],
    ["beitrag", 3],
    ["jahresbeitrag", 3],
    ["schaden", 3],
    ["allianz", 4], ["huk", 4], ["ergo", 4], ["axa", 4], ["generali", 4],
    ["r+v", 4], ["wwk", 4], ["signal iduna", 4], ["debeka", 4],
    ["continentale", 4], ["barmenia", 4], ["devk", 4], ["inter", 4],
    ["arag", 4], ["lv 1871", 4],
    ["check24", 3], ["verivox", 3], ["clark", 3], ["getsafe", 3], ["wefox", 3],
    ["versicherung ag", 2], ["versicherung a.g.", 2]
  ],

  Abrechnung: [
    ["vergütungsabrechnung", 6],
    ["abrechnung", 5],
    ["courtage", 4],
    ["provision", 4],
    ["gutschrift", 3],
    ["belastung", 3],
    ["jahressumme", 3],
    ["produktionsübersicht", 3],
    ["einzelvertragsnachweis", 3]
  ],

  Steuer: [
    ["finanzamt", 6],
    ["steuer", 5],
    ["umsatzsteuer", 4],
    ["einkommensteuer", 4],
    ["steuerbescheid", 5],
    ["steuererklärung", 4],
    ["ust", 3],
    ["vorsteuer", 3],
    ["elster", 3]
  ],

  Mahnung: [
    ["mahnung", 6],
    ["zahlungserinnerung", 5],
    ["offener betrag", 4],
    ["zahlungsfrist", 3],
    ["letzte erinnerung", 4],
    ["ratenzahlung", 3],
    ["verzug", 3]
  ],

  Behoerde: [
    ["bescheid", 5],
    ["aktenzeichen", 4],
    ["vorgangsnummer", 4],
    ["gericht", 5],
    ["staatsanwaltschaft", 6],
    ["polizei", 6],
    ["bundesamt", 6],
    ["landesamt", 6],
    ["kreisverwaltungsreferat", 6],
    ["jobcenter", 6],
    ["arbeitsagentur", 6],
    ["finanzkasse", 6],
    ["landesjustizkasse", 6],
    ["einwohnermeldeamt", 6],
    ["bürgeramt", 6],
    ["rathaus", 5],
    ["stadtverwaltung", 5],
    ["ministerium", 6]
  ],

  Bank: [
    ["kontoauszug", 5],
    ["iban", 3],
    ["bic", 3],
    ["überweisung", 3],
    ["lastschrift", 3],
    ["bankverbindung", 3],
    ["deutsche bank", 4], ["commerzbank", 4], ["hypovereinsbank", 4],
    ["postbank", 4],
    ["sparkasse", 4], ["volksbank", 4], ["raiffeisenbank", 4],
    ["spardabank", 4], ["landesbank", 4],
    ["ing", 4], ["dkb", 4], ["n26", 4], ["comdirect", 4],
    ["consorsbank", 4], ["targobank", 4]
  ]
};

function detectDocumentType(rawText = "") {
  const text = normalize(rawText);
  const scores = {};

  for (const [type, markers] of Object.entries(CATALOG)) {
    let score = 0;
    for (const [keyword, weight] of markers) {
      if (text.includes(keyword)) score += weight;
    }
    scores[type] = score;
  }

  const bestScore = Math.max(...Object.values(scores));
  const topTypes = Object.entries(scores)
    .filter(([_, s]) => s === bestScore && s > 0)
    .map(([t]) => t);

  if (bestScore < 5) {
    return {
      type: "Divers",
      confidence: 0.4,
      score: bestScore,
      scores,
      needsUserConfirmation: true,
      source: "LowScoreFallback"
    };
  }

  if (topTypes.length > 1) {
    return {
      type: "Unklar",
      candidates: topTypes,
      confidence: 0.5,
      score: bestScore,
      scores,
      needsUserConfirmation: true,
      source: "ScoreTie"
    };
  }

  const confidence = Math.min(0.95, Math.max(0.6, bestScore / 20));

  return {
    type: topTypes[0],
    confidence,
    score: bestScore,
    scores,
    needsUserConfirmation: confidence < 0.65,
    source: "ScoreEngine"
  };
}

module.exports = { detectDocumentType };