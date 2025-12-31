"use strict";

function analyze(analysis, ocrText = "") {
  const text = ocrText.toLowerCase();

  let type = "Behördenpost";
  if (text.includes("mahnung")) type = "Mahnschreiben";
  if (text.includes("pfändung")) type = "Pfändung";
  if (text.includes("vollstreckung")) type = "Zwangsvollstreckung";
  if (text.includes("bescheid")) type = "Bescheid";
  if (text.includes("anhörung")) type = "Anhörung";

  return {
    type,
    creditor: analysis.creditor || "Behörde",
    date: analysis.date || null
  };
}

module.exports = { analyze };