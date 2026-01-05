"use strict";

/**
 * Beverly FREE – Dokumentklassifikation
 * - Belegart
 * - Kategorie
 * - rein deterministisch
 */

function norm(t = "") {
  return String(t).toLowerCase();
}

const DOCUMENT_TYPES = {
  Kassenbeleg: ["kasse", "bon", "summe", "mwst"],
  Quittung: ["quittung", "bezahlt"],
  Rechnung: ["rechnung", "rechnungsnummer"],
  Mahnung: ["mahnung", "zahlungserinnerung"],
  Angebot: ["angebot"],
  HeilUndKostenplan: ["heil", "kostenplan"],
  Leistungsabrechnung: ["leistungsabrechnung"],
  Zwangsvollstreckung: ["vollstreckung", "pfändung"],
  Einkommensbeleg: ["gehalt", "lohn"],
  Einkommensnachweis: ["einkommensnachweis"],
  Kontoauszug: ["kontoauszug", "iban"],
  Abbuchung: ["abbuchung", "lastschrift"],
  Abrechnung: ["abrechnung"],
  Bewirtungsbeleg: ["restaurant", "bewirtung"]
};

const CATEGORIES = {
  Steuer: ["finanzamt", "steuer"],
  Anwalt: ["anwalt", "kanzlei"],
  Behoerde: ["gericht", "staatsanwaltschaft", "jobcenter"],
  Gesundheit: ["arzt", "praxis", "klinik"],
  Versicherung: ["versicherung"],
  Privatausgaben: ["supermarkt", "restaurant", "markt"]
};

function detectDocumentType(text) {
  const t = norm(text);
  for (const [type, keys] of Object.entries(DOCUMENT_TYPES)) {
    if (keys.some(k => t.includes(k))) return type;
  }
  return "Unklar";
}

function detectCategory(text) {
  const t = norm(text);
  for (const [cat, keys] of Object.entries(CATEGORIES)) {
    if (keys.some(k => t.includes(k))) return cat;
  }
  return "Privatausgaben";
}

module.exports = {
  detectDocumentType,
  detectCategory
};