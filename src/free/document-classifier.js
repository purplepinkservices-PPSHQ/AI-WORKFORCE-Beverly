"use strict";

function score(text, keywords) {
  let s = 0;
  for (const [word, weight] of keywords) {
    if (text.includes(word)) s += weight;
  }
  return s;
}

function classifyDocument(text, filename = "") {
  const t = `${text} ${filename}`.toLowerCase();

  // ✅ HARTE PRIORITÄT: Gericht = Behörden (immer)
  // (Gerichts-Briefe haben oft "Amtsgericht", "Gericht", "Aktenzeichen", "Az.", "Ladung", "Beschluss", "Strafbefehl")
  const isCourt =
    t.includes("amtsgericht") ||
    t.includes("landgericht") ||
    t.includes("oberlandesgericht") ||
    t.includes("gericht") ||
    t.includes("aktenzeichen") ||
    t.includes(" az ") ||
    t.includes(" az:") ||
    t.includes(" a z ") ||
    t.includes("ladung") ||
    t.includes("beschluss") ||
    t.includes("strafbefehl") ||
    t.includes("verfahren") ||
    t.includes("staatsanwaltschaft");

  if (isCourt) {
    return { category: "Behörden", confidence: 999 };
  }

  // ✅ WEIGHTED SCORING
  const scores = {
    behörde: score(t, [
      ["jobcenter", 9],
      ["bürgergeld", 10],
      ["agentur für arbeit", 10],
      ["bescheid", 6],
      ["anhörung", 8],
      ["verwaltungsakt", 10],
      ["aktenzeichen", 9],
      ["stadt", 4],
      ["gemeinde", 4],
      ["landratsamt", 7],
      ["bundesagentur", 8],
      ["rathaus", 5],
      ["zulassungsstelle", 6],
      ["bußgeld", 8],
      ["mahnung", 4],
    ]),

    steuer: score(t, [
      ["finanzamt", 12],
      ["steuer", 9],
      ["steuerbescheid", 12],
      ["einkommensteuer", 12],
      ["elster", 8],
      ["umsatzsteuer", 12],
      ["steuernummer", 10],
      ["identifikationsnummer", 8],
      ["abgabenordnung", 8],
    ]),

    versicherung: score(t, [
      ["versicherung", 12],
      ["police", 10],
      ["schaden", 8],
      ["vertragsnummer", 8],
      ["versicherungsnehmer", 8],
      ["beitrag", 7],
      ["kündigung", 6],
      ["leistung", 5],
    ]),

    bank: score(t, [
      ["iban", 6],
      ["bic", 6],
      ["kontoauszug", 10],
      ["konto", 6],
      ["bank", 5],
      ["darlehen", 10],
      ["kredit", 10],
      ["rate", 6],
      ["zins", 6],
      ["überweisung", 6],
      ["lastschrift", 6],
    ]),
  };

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [bestKey, bestScore] = sorted[0] || [null, 0];
  const secondScore = sorted[1]?.[1] || 0;

  // ✅ Mindestschwelle + Abstand (sonst fragen)
  // Damit es nicht ständig fragt: niedrig, aber nicht zu niedrig
  const MIN_SCORE = 8;
  const MIN_GAP = 2;

  if (!bestKey || bestScore < MIN_SCORE || bestScore - secondScore < MIN_GAP) {
    return { category: null, confidence: bestScore || 0 };
  }

  const map = {
    behörde: "Behörden",
    steuer: "Steuer",
    bank: "Bank",
    versicherung: "Versicherung",
  };

  return { category: map[bestKey], confidence: bestScore };
}

module.exports = { classifyDocument };