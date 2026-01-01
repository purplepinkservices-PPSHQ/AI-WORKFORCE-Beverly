"use strict";

/* =========================================================
   ✍️ Antwort-Text-Skeletons (neutral & sicher)
   ========================================================= */

function fristverlaengerung(ctx = {}) {
  return (
    "Sehr geehrte Damen und Herren,\n\n" +
    "hiermit bitte ich um eine angemessene Verlängerung der gesetzten Frist.\n\n" +
    "Aufgrund meiner aktuellen Situation ist es mir derzeit nicht möglich, " +
    "die Angelegenheit innerhalb der vorgegebenen Frist abschließend zu klären.\n\n" +
    "Ich bitte um Ihr Verständnis und um eine kurze Bestätigung der Fristverlängerung.\n\n" +
    "Mit freundlichen Grüßen\n"
  );
}

function ratenzahlung(ctx = {}) {
  return (
    "Sehr geehrte Damen und Herren,\n\n" +
    "hiermit bitte ich um Prüfung einer Ratenzahlung.\n\n" +
    "Der geforderte Betrag kann von mir derzeit nicht in einer Summe beglichen werden. " +
    "Ich bin jedoch bereit, eine einvernehmliche Lösung in Form von Teilzahlungen zu finden.\n\n" +
    "Bitte teilen Sie mir mit, welche weiteren Informationen Sie hierfür benötigen.\n\n" +
    "Mit freundlichen Grüßen\n"
  );
}

function widerspruch(ctx = {}) {
  return (
    "Sehr geehrte Damen und Herren,\n\n" +
    "hiermit lege ich fristgerecht Widerspruch gegen Ihr Schreiben ein.\n\n" +
    "Nach meiner Auffassung bestehen Unklarheiten bzw. offene Fragen, " +
    "die einer erneuten Prüfung bedürfen.\n\n" +
    "Ich bitte um eine schriftliche Bestätigung sowie um erneute Überprüfung des Vorgangs.\n\n" +
    "Mit freundlichen Grüßen\n"
  );
}

function kuendigung(ctx = {}) {
  return (
    "Sehr geehrte Damen und Herren,\n\n" +
    "hiermit kündige ich das bestehende Vertragsverhältnis fristgerecht.\n\n" +
    "Bitte bestätigen Sie mir den Erhalt dieser Kündigung sowie den Beendigungszeitpunkt schriftlich.\n\n" +
    "Mit freundlichen Grüßen\n"
  );
}

function pruefung(ctx = {}) {
  return (
    "Sehr geehrte Damen und Herren,\n\n" +
    "ich bitte um erneute Prüfung des genannten Vorgangs.\n\n" +
    "Nach Durchsicht Ihres Schreibens ergeben sich für mich Unklarheiten, " +
    "die aus meiner Sicht einer Klärung bedürfen.\n\n" +
    "Bitte teilen Sie mir das Ergebnis Ihrer Prüfung schriftlich mit.\n\n" +
    "Mit freundlichen Grüßen\n"
  );
}

module.exports = {
  fristverlaengerung,
  ratenzahlung,
  widerspruch,
  kuendigung,
  pruefung
};