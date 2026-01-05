// ============================================================
// Beverly – Onboarding Engine (STATEFUL, PASSIV, ARCHITEKTURKONFORM)
// Datei: src/system/onboarding-engine.js
// ============================================================

"use strict";

const { getState, setState } = require("./state");

/*
  REGELN (verbindlich):
  - Diese Engine entscheidet NICHT über Routing
  - Diese Engine startet KEINEN Workflow
  - Diese Engine reagiert nur, wenn Phase 0 sie aufruft
  - Ende des Onboardings = onboarded: true
*/

async function runOnboarding(message) {
  const userId = message.author.id;
  const text = message.content?.toLowerCase().trim();
  const state = getState(userId);

  // ------------------------------------------------------------
  // Bereits onboarded → Onboarding nicht aktiv
  // ------------------------------------------------------------
  if (state.onboarded === true) {
    return false;
  }

  // ------------------------------------------------------------
  // STEP 1 – Start Onboarding (keine Schrittinfo vorhanden)
  // ------------------------------------------------------------
  if (!state.onboardingStep) {
    await message.reply(
      "👋 **Willkommen bei Beverly**\n\n" +
      "Bevor wir starten, eine kurze Frage:\n" +
      "**Hast du bereits einen Dropbox-Account?**\n\n" +
      "👉 Antworte bitte mit:\n" +
      "**ja** oder **nein**"
    );

    setState(userId, {
      onboardingStep: "ASK_DROPBOX"
    });

    return true;
  }

  // ------------------------------------------------------------
  // STEP 2 – Dropbox-Frage beantworten
  // ------------------------------------------------------------
  if (state.onboardingStep === "ASK_DROPBOX") {
    // User hat noch keinen Dropbox-Account
    if (text === "nein") {
      await message.reply(
        "Kein Problem 😊\n\n" +
        "👉 Eröffne hier kostenlos einen Dropbox-Account:\n" +
        "https://www.dropbox.com/register\n\n" +
        "⏱️ Dauert ca. 1–2 Minuten.\n" +
        "Schreib mir danach **ja**."
      );

      return true;
    }

    // User hat Dropbox-Account
    if (text === "ja") {
      await message.reply(
        "⏳ Super! Ich bereite deine Umgebung jetzt vor …"
      );

      setState(userId, {
        onboardingStep: "FINALIZING"
      });

      // Simulierter Abschluss (später echte Checks)
      setTimeout(async () => {
        setState(userId, {
          onboarded: true,
          onboardingStep: null
        });

        await message.reply(
          "✅ **Alles bereit!**\n\n" +
          "Du kannst mir jetzt jederzeit senden:\n" +
          "📄 PDF / Dokument\n" +
          "📸 Foto\n" +
          "🎥 Video\n\n" +
          "Ich kümmere mich um den Rest."
        );
      }, 1200);

      return true;
    }

    // Ungültige Antwort
    await message.reply(
      "Bitte antworte nur mit **ja** oder **nein** 🙂"
    );
    return true;
  }

  // ------------------------------------------------------------
  // Fallback – Onboarding aktiv, aber Zustand unbekannt
  // ------------------------------------------------------------
  return true;
}

module.exports = { runOnboarding };