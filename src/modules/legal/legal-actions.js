"use strict";

// ============================================================
// Legal – Action Handler (v1)
// Keine Automatik, kein OpenAI, nur UX-Output
// ============================================================

function handleLegalAction({ actionId, documentContext }) {
  switch (actionId) {

    case "LEGAL_CHECK":
      return {
        text:
          "📄 **Dokumentprüfung (rechtlich)**\n\n" +
          "Ich habe das Dokument erfasst und kann dir erklären:\n" +
          "• worum es grundsätzlich geht\n" +
          "• welche Stellen wichtig sind\n" +
          "• ob Fristen erkennbar sind\n\n" +
          "👉 Sag mir gern, worauf ich besonders achten soll."
      };

    case "LEGAL_REPLY":
      return {
        text:
          "✍️ **Antwort verfassen**\n\n" +
          "Ich kann dir eine sachliche, neutrale Antwort vorbereiten.\n\n" +
          "Beispiel:\n" +
          "„Vielen Dank für Ihr Schreiben. Ich prüfe den Sachverhalt und melde mich zeitnah zurück.“\n\n" +
          "👉 Möchtest du eine kurze oder ausführliche Antwort?"
      };

    case "LEGAL_EXPLAIN_SIMPLE":
      return {
        text:
          "🧠 **Einfach erklärt**\n\n" +
          "Kurz gesagt:\n" +
          "• Wer schreibt dir\n" +
          "• Was will die Gegenseite\n" +
          "• Was jetzt wichtig ist\n\n" +
          "👉 Wenn du willst, gehe ich Punkt für Punkt durch."
      };

    case "LEGAL_CREATE_CASE":
      return {
        text:
          "🗂️ **Akte angelegt**\n\n" +
          "Ich habe dieses Dokument als eigenen Vorgang markiert.\n\n" +
          "Du kannst später:\n" +
          "• weitere Schreiben hinzufügen\n" +
          "• Antworten vorbereiten\n" +
          "• Fristen verwalten"
      };

    default:
      return {
        text: "❓ Diese Aktion ist aktuell nicht verfügbar."
      };
  }
}

module.exports = { handleLegalAction };