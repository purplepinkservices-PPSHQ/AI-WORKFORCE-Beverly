"use strict";

const { detectDeadline } = require("./deadline-engine");
const { detectAmounts } = require("./amount-engine");

/* =========================================================
   🧠 Einwände erkennen + priorisieren
   ========================================================= */
function detectObjections(rawText = "", analysis = {}) {
  const text = rawText.toLowerCase();
  const objections = [];

  const type = analysis.type || "Behördenpost";

  // ❗ Fehlende Rechtsgrundlage (KRITISCH bei Bescheid / Vollstreckung)
  if (
    !text.includes("§") &&
    !text.includes("paragraph") &&
    !text.includes("rechtsgrundlage")
  ) {
    objections.push({
      level: type === "Bescheid" || type === "Zwangsvollstreckung" ? "kritisch" : "hinweis",
      text: "Keine eindeutige Rechtsgrundlage genannt"
    });
  }

  // ❗ Betrag nicht nachvollziehbar
  if (
    analysis.amounts?.found &&
    !text.includes("berechnung") &&
    !text.includes("zusammensetzung") &&
    !text.includes("aufschlüssel")
  ) {
    objections.push({
      level: "kritisch",
      text: "Betrag nicht nachvollziehbar aufgeschlüsselt"
    });
  }

  // ❗ Ungewöhnlich kurze Frist
  if (analysis.deadline?.daysLeft !== null && analysis.deadline?.daysLeft <= 7) {
    objections.push({
      level: "kritisch",
      text: "Sehr kurze oder sofortige Fristsetzung"
    });
  }

  // ❗ Kein Rechtsbehelf genannt (KRITISCH bei Bescheid)
  if (
    (type === "Bescheid" || type === "Zwangsvollstreckung") &&
    !text.includes("widerspruch") &&
    !text.includes("rechtsbehelf") &&
    !text.includes("einspruch")
  ) {
    objections.push({
      level: "kritisch",
      text: "Kein Hinweis auf Rechtsbehelf oder Widerspruchsmöglichkeit"
    });
  }

  // ℹ️ Formulierung sehr allgemein
  if (text.includes("unverzüglich") || text.includes("sofort")) {
    objections.push({
      level: "hinweis",
      text: "Unbestimmte oder sehr allgemeine Formulierungen verwendet"
    });
  }

  return objections;
}

function analyze(analysis, rawText = "") {
  const text = rawText.toLowerCase();

  let type = "Behördenpost";
  if (text.includes("mahnung")) type = "Mahnschreiben";
  if (text.includes("pfändung")) type = "Pfändung";
  if (text.includes("vollstreckung")) type = "Zwangsvollstreckung";
  if (text.includes("bescheid")) type = "Bescheid";
  if (text.includes("anhörung")) type = "Anhörung";

  const deadline = detectDeadline(rawText);
  const amounts = detectAmounts(rawText);

  const result = {
    type,
    creditor: analysis.creditor || "Behörde",
    date: analysis.date || null,
    deadline,
    amounts
  };

  result.objections = detectObjections(rawText, result);

  return result;
}

module.exports = { analyze };