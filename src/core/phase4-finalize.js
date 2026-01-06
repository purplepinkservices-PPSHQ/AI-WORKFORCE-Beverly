// ============================================================
// Datei: src/core/phase4-finalize.js
// Phase 4 – Abschluss & Speicherung (MINIMAL)
// ============================================================
"use strict";

const { setState } = require("../system/state");

/**
 * Phase 4 Finalisierung
 * - setzt finalen State
 * - schließt Session
 * - gibt finale User-Antwort zurück
 *
 * KEINE Fachlogik
 * KEINE Buchungen
 * KEINE Automatisierung
 */
async function finalizePhase4({ userId, action }) {
  // Finaler Zustand
  setState(userId, {
    phase: "PHASE_4_DONE",
    session: "abgeschlossen",
    awaitingAction: null
  });

  // Minimales Abschluss-Feedback (textuell)
  let message = "✅ Vorgang abgeschlossen.";

  if (action === "ABLEGEN") {
    message =
      "📁 Alles klar. Das Dokument wird wie gewünscht abgelegt.\n" +
      "Du kannst jetzt direkt das nächste Dokument hochladen 😊";
  } else if (action === "PRUEFEN") {
    message =
      "🔍 Verstanden. Die fachliche Prüfung ist vorgemerkt.\n" +
      "Du kannst jetzt weitere Dokumente senden.";
  } else if (action === "TERMIN") {
    message =
      "📅 Verstanden. Eine mögliche Frist wurde vorgemerkt.\n" +
      "Du kannst jetzt weitere Dokumente senden.";
  }

  return message;
}

module.exports = { finalizePhase4 };