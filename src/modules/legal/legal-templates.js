"use strict";

// ============================================================
// Datei: src/modules/legal/legal-templates.js
// Copy-Paste Vorlagen (neutral, ohne Beratung)
// ============================================================

function templatePruefbitte() {
  return (
    "Hallo,\n\n" +
    "vielen Dank für Ihr Schreiben. Ich möchte den Vorgang kurz prüfen.\n" +
    "Bitte senden Sie mir hierzu die zugrunde liegende Rechnung bzw. Leistungsnachweise,\n" +
    "das Rechnungsdatum sowie eine genaue Aufstellung der Forderung (inkl. etwaiger Gebühren/Zinsen).\n\n" +
    "Bis zur Klärung bitte ich, von weiteren Maßnahmen abzusehen.\n\n" +
    "Mit freundlichen Grüßen\n" +
    "[NAME]"
  );
}

function templateFristverlaengerung() {
  return (
    "Hallo,\n\n" +
    "ich habe Ihr Schreiben erhalten. Ich bitte um eine kurze Fristverlängerung bis zum [DATUM],\n" +
    "damit ich den Vorgang prüfen und sauber klären kann.\n\n" +
    "Vielen Dank.\n\n" +
    "Mit freundlichen Grüßen\n" +
    "[NAME]"
  );
}

function templateRatenzahlung() {
  return (
    "Hallo,\n\n" +
    "ich habe Ihr Schreiben erhalten. Ich möchte die Forderung begleichen und schlage einen Zahlungsplan vor:\n" +
    "[BETRAG] EUR ab [DATUM] monatlich.\n\n" +
    "Bitte bestätigen Sie mir kurz, ob das so möglich ist.\n\n" +
    "Mit freundlichen Grüßen\n" +
    "[NAME]"
  );
}

module.exports = {
  templatePruefbitte,
  templateFristverlaengerung,
  templateRatenzahlung
};