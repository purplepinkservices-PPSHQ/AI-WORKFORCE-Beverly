"use strict";

const CATEGORY_RULES = [
  { match: ["aldi", "lidl", "kaufland", "norma", "obi", "toom", "globus", "konsum", "real", "penny", "rewe", "edeka"], category: "Haushalt" },
  { match: ["miete", "pacht", "vermieter"], category: "Miete" },
  { match: ["allianz", "wwk", "wüstenrot", "huk", "huk24", "debeka", "versicherungskammer", "dak", "aok", "tk", "versicherung"], category: "Versicherung" },
  { match: ["finanzamt", "steuer"], category: "Steuer" },
  { match: ["gehalt", "lohn", "honorar"], category: "Einkommen" },
  { match: ["amazon", "shop", "bestellung"], category: "Online-Shopping" }
];

function detectCategory({ creditor = "", documentType = "" }) {
  const text = `${creditor} ${documentType}`.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.match.some(k => text.includes(k))) {
      return rule.category;
    }
  }

  return "Sonstiges";
}

module.exports = { detectCategory };