"use strict";

const { detectDeadline } = require("./deadline-engine");
const { detectAmounts } = require("./amount-engine");

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

  return {
    type,
    creditor: analysis.creditor || "Behörde",
    date: analysis.date || null,
    deadline,
    amounts
  };
}

module.exports = { analyze };